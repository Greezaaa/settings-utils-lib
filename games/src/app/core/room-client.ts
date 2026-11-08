import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { field } from './api-url';
import { isRoomError, parseRoomView, RoomError, RoomSettings, RoomView } from './room-view';

/** The rooms service (api/src/rooms/); the local one while the site runs on localhost */
const ROOMS_URL = 'wss://rooms.su-labs.dev/rooms';
const LOCAL_ROOMS_URL = 'ws://localhost:3003/rooms';
/** This tab's seat in a room, so a reload comes back to it (per tab, gone when the tab closes) */
const SEAT_SESSION_KEY = 'su-labs-games:room-seat';
/** Waits between reconnection tries */
const RECONNECT_DELAYS_MS = [500, 1000, 2000, 4000, 8000];

interface Seat {
  readonly code: string;
  readonly playerId: string;
  readonly token: string;
}

export type RoomConnection = 'closed' | 'connecting' | 'open' | 'reconnecting';

/** What a player asks for once the connection is open */
type Intent =
  | { readonly event: 'create'; readonly language: LanguageId }
  | { readonly event: 'join'; readonly code: string };

/**
 * The connection to a multiplayer room: creating or joining one, the room's live state, and everything a player can
 * do in it. Reconnects by itself after a dropped connection or a reload (the seat is kept in this tab), and keeps the
 * server's clock, so every screen counts down and ends rounds at the same moment.
 */
@Injectable({ providedIn: 'root' })
export class RoomClient {
  private readonly document = inject(DOCUMENT);
  private socket: WebSocket | null = null;
  private seat: Seat | null = null;
  private intent: Intent | null = null;
  private attempts = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  /** Difference between the server's clock and this device's */
  private clockOffset = 0;

  readonly connection = signal<RoomConnection>('closed');
  readonly room = signal<RoomView | null>(null);
  readonly error = signal<RoomError | null>(null);
  /** The player removed by the host */
  readonly kicked = signal(false);
  readonly playerId = signal<string | null>(null);

  readonly me = computed(() => this.room()?.players.find(({ id }) => id === this.playerId()) ?? null);
  readonly isHost = computed(() => this.room()?.hostId === this.playerId());

  /** The server's clock now, for countdowns and round ends */
  serverNow(): number {
    return Date.now() + this.clockOffset;
  }

  create(language: LanguageId): void {
    this.open({ event: 'create', language });
  }

  /** Joins a room by code, or comes back to this tab's seat in it */
  enter(code: string): void {
    // Already in it, e.g. right after creating it
    if (this.seat?.code === code.toUpperCase() && this.connection() !== 'closed') {
      return;
    }
    const seat = this.savedSeat();
    if (seat?.code === code.toUpperCase()) {
      this.seat = seat;
      this.open(null);
    } else {
      this.open({ event: 'join', code });
    }
  }

  setSettings(settings: RoomSettings): void {
    this.send('settings', settings);
  }

  setReady(ready: boolean): void {
    this.send('ready', { ready });
  }

  start(): void {
    this.send('start');
  }

  reportScore(score: number): void {
    this.send('score', { score });
  }

  playAgain(): void {
    this.send('again');
  }

  kick(playerId: string): void {
    this.send('kick', { playerId });
  }

  /** Leaves the room for good and closes the connection */
  leave(): void {
    this.send('leave');
    this.forgetSeat();
    this.close();
  }

  /** Closes the connection, keeping the seat for a later reload */
  close(): void {
    clearTimeout(this.reconnectTimer);
    this.intent = null;
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.connection.set('closed');
    this.room.set(null);
  }

  private open(intent: Intent | null): void {
    this.close();
    this.intent = intent;
    this.error.set(null);
    this.kicked.set(false);
    this.attempts = 0;
    this.connect();
  }

  private connect(): void {
    const url = this.document.location.hostname === 'localhost' ? LOCAL_ROOMS_URL : ROOMS_URL;
    this.connection.set(this.attempts === 0 ? 'connecting' : 'reconnecting');
    const socket = new WebSocket(url);
    this.socket = socket;
    socket.onopen = () => {
      this.attempts = 0;
      this.connection.set('open');
      if (this.seat) {
        this.send('rejoin', { code: this.seat.code, token: this.seat.token });
      } else if (this.intent?.event === 'create') {
        this.send('create', { language: this.intent.language });
      } else if (this.intent?.event === 'join') {
        this.send('join', { code: this.intent.code });
      }
    };
    socket.onmessage = (message) => this.receive(message.data);
    socket.onclose = () => {
      if (this.socket !== socket) {
        return;
      }
      this.socket = null;
      // Keep trying while there is a seat to come back to
      if (this.seat && !this.kicked() && this.attempts < RECONNECT_DELAYS_MS.length) {
        this.connection.set('reconnecting');
        this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_DELAYS_MS[this.attempts++]);
      } else {
        this.connection.set('closed');
        if (!this.room()) {
          this.error.set('offline');
        }
      }
    };
  }

  private receive(raw: unknown): void {
    let message: unknown;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }
    const event = field(message, 'event');
    const data = field(message, 'data');
    if (event === 'joined') {
      const [code, playerId, token] = ['code', 'playerId', 'token'].map((key) => field(data, key));
      if (typeof code === 'string' && typeof playerId === 'string' && typeof token === 'string') {
        this.seat = { code, playerId, token };
        this.playerId.set(playerId);
        this.saveSeat(this.seat);
      }
    } else if (event === 'room') {
      const view = parseRoomView(data);
      if (view) {
        this.clockOffset = view.serverNow - Date.now();
        this.room.set(view);
        this.error.set(null);
      }
    } else if (event === 'error') {
      const error = field(data, 'error');
      this.error.set(isRoomError(error) ? error : 'invalid');
      // A seat that no longer exists (the room closed): forget it, so the next try joins afresh
      if (error === 'not-found') {
        this.forgetSeat();
      }
    } else if (event === 'kicked' || event === 'left') {
      this.kicked.set(event === 'kicked');
      this.forgetSeat();
      this.close();
    }
  }

  private send(event: string, data: object = {}): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }

  private savedSeat(): Seat | null {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(SEAT_SESSION_KEY) ?? 'null');
      const [code, playerId, token] = ['code', 'playerId', 'token'].map((key) => field(saved, key));
      return typeof code === 'string' && typeof playerId === 'string' && typeof token === 'string'
        ? { code, playerId, token }
        : null;
    } catch {
      return null;
    }
  }

  private saveSeat(seat: Seat): void {
    try {
      sessionStorage.setItem(SEAT_SESSION_KEY, JSON.stringify(seat));
    } catch {
      // Storage blocked: a reload just joins again as a new player
    }
  }

  private forgetSeat(): void {
    this.seat = null;
    this.playerId.set(null);
    try {
      sessionStorage.removeItem(SEAT_SESSION_KEY);
    } catch {
      // Nothing was kept
    }
  }
}
