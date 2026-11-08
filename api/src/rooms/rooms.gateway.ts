import { randomInt } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { z } from 'zod';
import {
  createSchema,
  joinSchema,
  kickSchema,
  readySchema,
  rejoinSchema,
  scoreSchema,
  ServerEvent,
  settingsSchema,
} from './room-messages.js';
import {
  advance,
  createRoom,
  join,
  newCode,
  newPlayer,
  playAgain,
  removePlayer,
  reportScore,
  Room,
  RoomError,
  setReady,
  setSettings,
  startRound,
  viewOf,
} from './room.js';
import type { RoomsEnv } from './rooms-env.js';

/** How long a dropped player keeps their seat, to come back after a reload or a flaky connection */
const RECONNECT_GRACE_MS = 30_000;
/** Rooms close after this long without anything happening, or this long with nobody connected */
const IDLE_ROOM_MS = 30 * 60_000;
const EMPTY_ROOM_MS = 2 * 60_000;
/** How often the clock moves rooms along (countdown → playing → results) and tidies up */
const TICK_MS = 250;
/** Creating or joining rooms: at most this many tries a minute per visitor, so codes can't be guessed */
const MAX_ROOM_TRIES_PER_MINUTE = 20;
/** Largest message accepted; every message is a few short fields */
const MAX_MESSAGE_BYTES = 2048;

/** Which room and player a connection belongs to, and the visitor's address for the limits */
interface Seat {
  code: string | null;
  playerId: string | null;
  readonly ip: string;
}

/**
 * The rooms service's WebSocket, at wss://rooms.su-labs.dev/rooms: creating and joining rooms by code, the lobby
 * (settings, ready), rounds on a shared clock, live scores and results. Rooms live in memory only and nothing about the
 * players is stored; visitor addresses are held only for the join limit, for a minute.
 */
@WebSocketGateway({ path: '/rooms', maxPayload: MAX_MESSAGE_BYTES })
export class RoomsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  private readonly rooms = new Map<string, Room>();
  private readonly seats = new Map<WebSocket, Seat>();
  private readonly tries = new Map<string, number[]>();
  private readonly origins: readonly string[];
  private readonly trustCloudflare: boolean;
  private readonly ticker = setInterval(() => this.tick(), TICK_MS);

  constructor(config: ConfigService<RoomsEnv, true>) {
    this.origins = config.get('CORS_ORIGINS', { infer: true });
    this.trustCloudflare = config.get('TRUST_CLOUDFLARE', { infer: true });
  }

  onModuleDestroy(): void {
    clearInterval(this.ticker);
  }

  /** Only the games site may connect (browsers always send their page's origin) */
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
    this.seats.set(client, { code: null, playerId: null, ip });
  }

  /** A dropped player keeps their seat for a while (see tick) */
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
    const now = Date.now();
    const host = newPlayer([]);
    const room = createRoom(
      newCode(new Set(this.rooms.keys())),
      host,
      data.language,
      now,
    );
    this.rooms.set(room.code, room);
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
      this.send(client, 'error', { error: 'not-found' });
      return;
    }
    const player = newPlayer(room.players);
    const error = join(room, player, Date.now());
    if (error) {
      this.send(client, 'error', { error });
      return;
    }
    this.seat(client, room, player.id, player.token);
  }

  /** Back after a reload or a dropped connection, with the token from joining */
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
      this.send(client, 'error', { error: 'not-found' });
      return;
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
        this.seats.set(socket, {
          code: null,
          playerId: null,
          ip: this.seats.get(socket)?.ip ?? '',
        });
      }
      return null;
    });
  }

  @SubscribeMessage('leave')
  leave(@ConnectedSocket() client: WebSocket): void {
    const seat = this.seats.get(client);
    const room = seat?.code ? this.rooms.get(seat.code) : undefined;
    if (room && seat?.playerId) {
      removePlayer(room, seat.playerId, Date.now());
      this.seats.set(client, { code: null, playerId: null, ip: seat.ip });
      this.send(client, 'left', {});
      this.closeIfEmpty(room);
      this.broadcast(room);
    }
  }

  /** Runs a change on the player's room and tells everyone, or tells the player why not */
  private act<T>(
    client: WebSocket,
    data: T | null,
    change: (room: Room, playerId: string, now: number) => RoomError | null,
  ) {
    const seat = this.seats.get(client);
    const room = seat?.code ? this.rooms.get(seat.code) : undefined;
    if (!data || !room || !seat?.playerId) {
      return;
    }
    const error = change(room, seat.playerId, Date.now());
    if (error) {
      this.send(client, 'error', { error });
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
    });
    this.send(client, 'joined', { code: room.code, playerId, token });
    this.broadcast(room);
  }

  /** The clock: moves rounds along, gives up on seats left too long, and closes idle rooms */
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
      if (
        now - room.lastActivity > IDLE_ROOM_MS ||
        (nobodyHere && now - room.lastActivity > EMPTY_ROOM_MS)
      ) {
        this.rooms.delete(room.code);
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
      this.rooms.delete(room.code);
    }
  }

  /** At most MAX_ROOM_TRIES_PER_MINUTE creates and joins a minute per visitor */
  private allowTry(client: WebSocket): boolean {
    const ip = this.seats.get(client)?.ip ?? '';
    const now = Date.now();
    const recent = (this.tries.get(ip) ?? []).filter(
      (time) => now - time < 60_000,
    );
    if (recent.length >= MAX_ROOM_TRIES_PER_MINUTE) {
      this.send(client, 'error', { error: 'too-many' });
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
      this.send(client, 'error', { error: 'invalid' });
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

  private send(client: WebSocket, event: ServerEvent, data: object): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }
}
