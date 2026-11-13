import { randomInt } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { z } from 'zod';
import { createSchema, hideNameSchema, joinSchema, kickSchema, reactSchema, readySchema, rejoinSchema, scoreSchema, ServerEvent, settingsSchema } from './room-messages.js';
import { advance, createRoom, hideName, join, newCode, newPlayer, playAgain, REACTION_GAP_MS, removePlayer, reportScore, Room, RoomError, renamePlayer, setReady, setSettings, startRound, viewOf } from './room.js';
import { verifyNamePass } from '../shared/name-pass.js';
import type { RoomsEnv } from './rooms-env.js';

const RECONNECT_GRACE_MS = 2 * 60_000;
const EMPTY_ROOM_MS = 3 * 60_000;
const IDLE_ROOM_MS = 2 * 60 * 60_000;
const HEARTBEAT_MS = 25_000;
const TICK_MS = 250;
const MAX_ROOM_TRIES_PER_MINUTE = 20;
const MAX_MESSAGE_BYTES = 2048;
const MAX_ROOMS = 2000;
export const MAX_CONNECTIONS_PER_VISITOR = 40;
export const MAX_ROOMS_PER_VISITOR = 10;
const MAX_MESSAGES = 40;
const MESSAGE_WINDOW_MS = 5_000;

interface Seat {
  code: string | null;
  playerId: string | null;
  readonly ip: string;
  messages: number[];
  reactedAt: number;
}

@WebSocketGateway({ path: '/rooms', maxPayload: MAX_MESSAGE_BYTES })
export class RoomsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  private readonly logger = new Logger('Rooms');
  private readonly rooms = new Map<string, Room>();
  private readonly seats = new Map<WebSocket, Seat>();
  private readonly tries = new Map<string, number[]>();
  private readonly openedBy = new Map<string, string>();
  private readonly origins: readonly string[];
  private readonly trustCloudflare: boolean;
  private readonly ticker = setInterval(() => this.tick(), TICK_MS);
  private readonly heartbeat = setInterval(() => this.ping(), HEARTBEAT_MS);
  private readonly alive = new WeakSet<WebSocket>();
  private readonly emptySince = new Map<string, number>();

  private readonly nameSecret: string | undefined;

  constructor(config: ConfigService<RoomsEnv, true>) {
    this.origins = config.get('CORS_ORIGINS', { infer: true });
    this.trustCloudflare = config.get('TRUST_CLOUDFLARE', { infer: true });
    this.nameSecret = config.get('ROOM_NAME_SECRET', { infer: true });
  }

  onModuleDestroy(): void {
    clearInterval(this.ticker);
    clearInterval(this.heartbeat);
  }

  handleConnection(client: WebSocket, request: IncomingMessage): void {
    if (!this.origins.includes(request.headers.origin ?? '')) {
      client.close(1008, 'Origin not allowed');
      return;
    }
    const cloudflareIp = request.headers['cf-connecting-ip'];
    const ip =
      this.trustCloudflare && typeof cloudflareIp === 'string'
        ? cloudflareIp
        : (request.socket.remoteAddress ?? '');
    const connections = [...this.seats.values()].filter(
      (seat) => seat.ip === ip,
    ).length;
    if (connections >= MAX_CONNECTIONS_PER_VISITOR) {
      client.close(1008, 'Too many connections');
      return;
    }
    this.alive.add(client);
    client.on('pong', () => this.alive.add(client));
    this.seats.set(client, {
      code: null,
      playerId: null,
      ip,
      messages: [],
      reactedAt: 0,
    });
  }

  handleDisconnect(client: WebSocket): void {
    const seat = this.seats.get(client);
    this.seats.delete(client);
    const room = seat?.code ? this.rooms.get(seat.code) : undefined;
    const player = room?.players.find(({ id }) => id === seat?.playerId);
    if (room && player && !this.socketOf(room.code, player.id)) {
      player.connected = false;
      player.disconnectedAt = Date.now();
      this.broadcast(room);
    }
  }

  @SubscribeMessage('create')
  create(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, createSchema, body);
    if (!data || !this.allowTry(client)) {
      return;
    }
    this.leaveCurrentRoom(client);
    const ip = this.seats.get(client)?.ip ?? '';
    const opened = [...this.openedBy.values()].filter(
      (opener) => opener === ip,
    ).length;
    if (this.rooms.size >= MAX_ROOMS || opened >= MAX_ROOMS_PER_VISITOR) {
      this.refuse(client, 'too-many');
      return;
    }
    const now = Date.now();
    const host = newPlayer(
      [],
      undefined,
      data.gender,
      this.ownName(data.namePass),
    );
    const room = createRoom(
      newCode(new Set(this.rooms.keys())),
      host,
      data.language,
      now,
    );
    this.rooms.set(room.code, room);
    this.openedBy.set(room.code, ip);
    this.logger.log(`room ${room.code} opened (${this.rooms.size} open)`);
    this.seat(client, room, host.id, host.token);
  }

  @SubscribeMessage('join')
  join(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, joinSchema, body);
    if (!data || !this.allowTry(client)) {
      return;
    }
    const room = this.rooms.get(data.code);
    if (!room) {
      this.refuse(client, 'not-found');
      return;
    }
    this.leaveCurrentRoom(client);
    const player = newPlayer(
      room.players,
      undefined,
      data.gender,
      this.ownName(data.namePass),
    );
    const error = join(room, player, Date.now());
    if (error) {
      this.refuse(client, error);
      return;
    }
    this.seat(client, room, player.id, player.token);
  }

  @SubscribeMessage('rejoin')
  rejoin(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, rejoinSchema, body);
    if (!data || !this.allowTry(client)) {
      return;
    }
    const room = this.rooms.get(data.code);
    const player = room?.players.find(({ token }) => token === data.token);
    if (!room || !player) {
      this.refuse(client, 'not-found');
      return;
    }
    if (this.seats.get(client)?.playerId !== player.id) {
      this.leaveCurrentRoom(client);
    }
    this.socketOf(room.code, player.id)?.close(4000, 'Opened elsewhere');
    player.connected = true;
    player.disconnectedAt = null;
    this.seat(client, room, player.id, player.token);
  }

  @SubscribeMessage('settings')
  settings(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, settingsSchema, body);
    this.act(client, data, (room, playerId, now) =>
      data ? setSettings(room, playerId, data, now) : null,
    );
  }

  @SubscribeMessage('ready')
  ready(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, readySchema, body);
    this.act(client, data, (room, playerId, now) =>
      data ? setReady(room, playerId, data.ready, now) : null,
    );
  }

  @SubscribeMessage('rename')
  rename(@ConnectedSocket() client: WebSocket): void {
    this.act(client, {}, (room, playerId, now) =>
      renamePlayer(room, playerId, now),
    );
  }

  @SubscribeMessage('hide-name')
  hideName(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, hideNameSchema, body);
    this.act(client, data, (room, _playerId, now) =>
      data ? hideName(room, data.playerId, now) : null,
    );
  }

  @SubscribeMessage('react')
  react(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, reactSchema, body);
    const seat = this.seats.get(client);
    const now = Date.now();
    if (
      !data ||
      !seat?.code ||
      !seat.playerId ||
      now - seat.reactedAt < REACTION_GAP_MS ||
      !this.allowMessage(seat)
    ) {
      return;
    }
    seat.reactedAt = now;
    for (const [socket, other] of this.seats) {
      if (other.code === seat.code) {
        this.send(socket, 'reaction', {
          playerId: seat.playerId,
          reaction: data.reaction,
        });
      }
    }
  }

  @SubscribeMessage('start')
  start(@ConnectedSocket() client: WebSocket): void {
    this.act(client, {}, (room, playerId, now) =>
      startRound(room, playerId, now, randomInt(2 ** 31)),
    );
  }

  @SubscribeMessage('score')
  score(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, scoreSchema, body);
    this.act(client, data, (room, playerId, now) => {
      if (data) {
        reportScore(room, playerId, data.score, now);
      }
      return null;
    });
  }

  @SubscribeMessage('again')
  again(@ConnectedSocket() client: WebSocket): void {
    this.act(client, {}, (room, playerId, now) =>
      playAgain(room, playerId, now),
    );
  }

  @SubscribeMessage('kick')
  kick(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() body: unknown,
  ): void {
    const data = this.parse(client, kickSchema, body);
    this.act(client, data, (room, playerId, now) => {
      if (!data || room.hostId !== playerId || data.playerId === playerId) {
        return 'not-host';
      }
      const socket = this.socketOf(room.code, data.playerId);
      removePlayer(room, data.playerId, now);
      if (socket) {
        this.send(socket, 'kicked', {});
        this.unseat(socket);
      }
      return null;
    });
  }

  @SubscribeMessage('leave')
  leave(@ConnectedSocket() client: WebSocket): void {
    if (this.leaveCurrentRoom(client)) {
      this.send(client, 'left', {});
    }
  }

  private leaveCurrentRoom(client: WebSocket): boolean {
    const seat = this.seats.get(client);
    const room = seat?.code ? this.rooms.get(seat.code) : undefined;
    if (!room || !seat?.playerId) {
      return false;
    }
    removePlayer(room, seat.playerId, Date.now());
    this.unseat(client);
    this.closeIfEmpty(room);
    this.broadcast(room);
    return true;
  }

  private unseat(client: WebSocket): void {
    const seat = this.seats.get(client);
    if (seat) {
      this.seats.set(client, { ...seat, code: null, playerId: null });
    }
  }

  private act<T>(
    client: WebSocket,
    data: T | null,
    change: (room: Room, playerId: string, now: number) => RoomError | null,
  ) {
    const seat = this.seats.get(client);
    const room = seat?.code ? this.rooms.get(seat.code) : undefined;
    if (!data || !room || !seat?.playerId || !this.allowMessage(seat)) {
      return;
    }
    const error = change(room, seat.playerId, Date.now());
    if (error) {
      this.refuse(client, error);
      return;
    }
    this.broadcast(room);
  }

  private seat(
    client: WebSocket,
    room: Room,
    playerId: string,
    token: string,
  ): void {
    this.seats.set(client, {
      code: room.code,
      playerId,
      ip: this.seats.get(client)?.ip ?? '',
      messages: this.seats.get(client)?.messages ?? [],
      reactedAt: this.seats.get(client)?.reactedAt ?? 0,
    });
    this.send(client, 'joined', { code: room.code, playerId, token });
    this.broadcast(room);
  }

  private tick(): void {
    const now = Date.now();
    for (const room of this.rooms.values()) {
      let changed = advance(room, now);
      for (const player of [...room.players]) {
        if (
          !player.connected &&
          player.disconnectedAt !== null &&
          now - player.disconnectedAt > RECONNECT_GRACE_MS
        ) {
          removePlayer(room, player.id, now);
          changed = true;
        }
      }
      const nobodyHere = room.players.every(({ connected }) => !connected);
      if (!nobodyHere) {
        this.emptySince.delete(room.code);
      } else if (!this.emptySince.has(room.code)) {
        this.emptySince.set(room.code, now);
      }
      const emptyFor = now - (this.emptySince.get(room.code) ?? now);
      if (now - room.lastActivity > IDLE_ROOM_MS || emptyFor > EMPTY_ROOM_MS) {
        this.close(room, 'idle');
        continue;
      }
      if (changed) {
        this.broadcast(room);
      }
    }
    for (const [ip, times] of this.tries) {
      const recent = times.filter((time) => now - time < 60_000);
      if (recent.length > 0) {
        this.tries.set(ip, recent);
      } else {
        this.tries.delete(ip);
      }
    }
  }

  private closeIfEmpty(room: Room): void {
    if (room.players.length === 0) {
      this.close(room, 'empty');
    }
  }

  private ping(): void {
    for (const socket of this.seats.keys()) {
      if (!this.alive.has(socket)) {
        socket.terminate();
        continue;
      }
      this.alive.delete(socket);
      socket.ping();
    }
  }

  private close(room: Room, why: 'idle' | 'empty'): void {
    this.rooms.delete(room.code);
    this.openedBy.delete(room.code);
    this.emptySince.delete(room.code);
    this.logger.log(
      `room ${room.code} closed, ${why} (${this.rooms.size} open)`,
    );
  }

  private allowMessage(seat: Seat): boolean {
    const now = Date.now();
    seat.messages = seat.messages.filter(
      (time) => now - time < MESSAGE_WINDOW_MS,
    );
    if (seat.messages.length >= MAX_MESSAGES) {
      return false;
    }
    seat.messages.push(now);
    return true;
  }

  private allowTry(client: WebSocket): boolean {
    const ip = this.seats.get(client)?.ip ?? '';
    const now = Date.now();
    const recent = (this.tries.get(ip) ?? []).filter(
      (time) => now - time < 60_000,
    );
    if (recent.length >= MAX_ROOM_TRIES_PER_MINUTE) {
      this.refuse(client, 'too-many');
      return false;
    }
    this.tries.set(ip, [...recent, now]);
    return true;
  }

  private parse<T>(
    client: WebSocket,
    schema: z.ZodType<T>,
    body: unknown,
  ): T | null {
    const result = schema.safeParse(body ?? {});
    if (!result.success) {
      this.refuse(client, 'invalid');
      return null;
    }
    return result.data;
  }

  private socketOf(code: string, playerId: string): WebSocket | undefined {
    for (const [socket, seat] of this.seats) {
      if (seat.code === code && seat.playerId === playerId) {
        return socket;
      }
    }
    return undefined;
  }

  private broadcast(room: Room): void {
    const view = viewOf(room, Date.now());
    for (const [socket, seat] of this.seats) {
      if (seat.code === room.code) {
        this.send(socket, 'room', view);
      }
    }
  }

  private refuse(
    client: WebSocket,
    error: RoomError | 'invalid' | 'too-many',
  ): void {
    const code = this.seats.get(client)?.code;
    this.logger.warn(`refused: ${error}${code ? ` (room ${code})` : ''}`);
    this.send(client, 'error', { error });
  }

  private send(client: WebSocket, event: ServerEvent, data: object): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }

  private ownName(pass: string | null): string | null {
    return pass && this.nameSecret
      ? verifyNamePass(pass, this.nameSecret)
      : null;
  }
}
