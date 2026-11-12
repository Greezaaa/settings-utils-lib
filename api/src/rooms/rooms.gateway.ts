import { randomInt } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { z } from 'zod';
import { createSchema, joinSchema, kickSchema, reactSchema, readySchema, rejoinSchema, scoreSchema, ServerEvent, settingsSchema } from './room-messages.js';
import { advance, createRoom, join, newCode, newPlayer, playAgain, REACTION_GAP_MS, removePlayer, reportScore, Room, RoomError, renamePlayer, setReady, setSettings, startRound, viewOf } from './room.js';
import type { RoomsEnv } from './rooms-env.js';

/** How long a dropped player keeps their seat, to come back after a reload or a flaky connection */
const RECONNECT_GRACE_MS = 2 * 60_000;
/**
 * A room closes once nobody has been connected for EMPTY_ROOM_MS (counted from the last one leaving, longer than the
 * grace above so a seat can still come back), or after IDLE_ROOM_MS with nothing happening even with players waiting
 * in it: long enough to wait for friends to join
 */
const EMPTY_ROOM_MS = 3 * 60_000;
const IDLE_ROOM_MS = 2 * 60 * 60_000;
/**
 * Every HEARTBEAT_MS each connection gets a ping (browsers answer it by themselves): it keeps quiet connections open
 * through Cloudflare, which closes WebSockets silent for about 100 s, and a connection that didn't answer the last ping
 * is gone, so it's closed and its player shows as away
 */
const HEARTBEAT_MS = 25_000;
/** How often the clock moves rooms along (countdown → playing → results) and tidies up */
const TICK_MS = 250;
/** Creating or joining rooms: at most this many tries a minute per visitor, so codes can't be guessed */
const MAX_ROOM_TRIES_PER_MINUTE = 20;
/** Largest message accepted; every message is a few short fields */
const MAX_MESSAGE_BYTES = 2048;
/** Rooms open at once; far more than the site needs, so a flood of new rooms can't fill the server's memory */
const MAX_ROOMS = 2000;
/**
 * Per visitor address: open connections, and rooms they opened that are still open. Generous, as a whole class at
 * school shares one address, yet one visitor can't take every room (filling MAX_ROOMS takes 200 addresses)
 */
export const MAX_CONNECTIONS_PER_VISITOR = 40;
export const MAX_ROOMS_PER_VISITOR = 10;
/**
 * Messages a connection may send in a room every few seconds (scores come at most 3 a second); more are ignored, so
 * one player can't flood the others with updates
 */
const MAX_MESSAGES = 40;
const MESSAGE_WINDOW_MS = 5_000;

/** Which room and player a connection belongs to, and the visitor's address for the limits */
interface Seat {
  code: string | null;
  playerId: string | null;
  readonly ip: string;
  /** When its recent room messages came, for the message limit */
  messages: number[];
  /** When it last sent a sticker, for the gap between stickers */
  reactedAt: number;
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
  private readonly logger = new Logger('Rooms');
  private readonly rooms = new Map<string, Room>();
  private readonly seats = new Map<WebSocket, Seat>();
  private readonly tries = new Map<string, number[]>();
  /** Who opened each open room (their address), for the per-visitor room limit */
  private readonly openedBy = new Map<string, string>();
  private readonly origins: readonly string[];
  private readonly trustCloudflare: boolean;
  private readonly ticker = setInterval(() => this.tick(), TICK_MS);
  private readonly heartbeat = setInterval(() => this.ping(), HEARTBEAT_MS);
  /** Connections that answered the last ping */
  private readonly alive = new WeakSet<WebSocket>();
  /** When each room's last connected player left, while nobody is connected */
  private readonly emptySince = new Map<string, number>();

  constructor(config: ConfigService<RoomsEnv, true>) {
    this.origins = config.get('CORS_ORIGINS', { infer: true });
    this.trustCloudflare = config.get('TRUST_CLOUDFLARE', { infer: true });
  }

  onModuleDestroy(): void {
    clearInterval(this.ticker);
    clearInterval(this.heartbeat);
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
    // Leaving first: the room it leaves may close, and then doesn't count against the limits
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
    const host = newPlayer([], undefined, data.gender);
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
    // One connection, one seat: joining again (here or elsewhere) gives up the old one, never leaving a ghost behind
    this.leaveCurrentRoom(client);
    const player = newPlayer(room.players, undefined, data.gender);
    const error = join(room, player, Date.now());
    if (error) {
      this.refuse(client, error);
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

  /**
   * A sticker for everyone in the room, in any phase; it changes nothing in the room, so it's passed on as is. One
   * every REACTION_GAP_MS per player; quicker ones are dropped quietly.
   */
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

  /** Takes the connection's player out of its room, if it has one; true when it did */
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

  /** The connection stays open, in no room */
  private unseat(client: WebSocket): void {
    const seat = this.seats.get(client);
    if (seat) {
      this.seats.set(client, { ...seat, code: null, playerId: null });
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

  /** Pings every connection, and closes those that didn't answer the last ping (see HEARTBEAT_MS) */
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

  /** At most MAX_MESSAGES room messages every MESSAGE_WINDOW_MS per connection; the rest are dropped quietly */
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

  /** At most MAX_ROOM_TRIES_PER_MINUTE creates and joins a minute per visitor */
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

  /** Tells the player why an action was refused, and logs it so problems show in `docker compose logs -f rooms` */
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
}
