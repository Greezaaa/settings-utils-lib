import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { WordGender } from '../i18n/word-gender';
import { field } from './api-url';
import { PlayerAccount } from './player-account';
import { PlayerGender } from './player-gender';
import { isReaction, Reaction, REACTION_SHOW_MS } from './reactions';
import { isRoomError, parseRoomView, RoomError, RoomSettings, RoomView } from './room-view';

const ROOMS_URL = 'wss://rooms.su-labs.dev/rooms';
const LOCAL_ROOMS_URL = 'ws://localhost:3003/rooms';
const SEAT_SESSION_KEY = 'su-labs-games:room-seat';
const RECONNECT_DELAYS_MS = [500, 1000, 2000, 4000, 8000];
const SEAT_KEPT_MS = 2 * 60_000;

interface Seat {
  readonly code: string;
  readonly playerId: string;
  readonly token: string;
}

export interface PlayerReaction {
  readonly key: number;
  readonly playerId: string;
  readonly reaction: Reaction;
}

export type RoomConnection = 'closed' | 'connecting' | 'open' | 'reconnecting';

type Intent =
  | { readonly event: 'create'; readonly language: LanguageId; readonly namePass: string | null }
  | { readonly event: 'join'; readonly code: string; readonly namePass: string | null };

@Injectable({ providedIn: 'root' })
export class RoomClient {
  private readonly document = inject(DOCUMENT);
  private readonly gender = inject(PlayerGender);
  private readonly account = inject(PlayerAccount);
  private socket: WebSocket | null = null;
  private seat: Seat | null = null;
  private intent: Intent | null = null;
  private attempts = 0;
  private droppedAt: number | null = null;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private clockOffset = 0;
  private reactionKey = 0;

  readonly connection = signal<RoomConnection>('closed');
  readonly room = signal<RoomView | null>(null);
  readonly error = signal<RoomError | null>(null);
  readonly kicked = signal(false);
  readonly playerId = signal<string | null>(null);
  readonly reactions = signal<readonly PlayerReaction[]>([]);

  readonly me = computed(() => this.room()?.players.find(({ id }) => id === this.playerId()) ?? null);
  readonly isHost = computed(() => this.room()?.hostId === this.playerId());

  constructor() {
    const window = this.document.defaultView;
    if (window) {
      window.addEventListener('online', () => this.retryNow());
      this.document.addEventListener('visibilitychange', () => {
        if (this.document.visibilityState === 'visible') {
          this.retryNow();
        }
      });
    }
  }

  serverNow(): number {
    return Date.now() + this.clockOffset;
  }

  async create(language: LanguageId): Promise<void> {
    this.open({ event: 'create', language, namePass: await this.account.roomNamePass() });
  }

  async enter(code: string): Promise<void> {
    if (this.seat?.code === code.toUpperCase() && this.connection() !== 'closed') {
      return;
    }
    const seat = this.savedSeat();
    if (seat?.code === code.toUpperCase()) {
      this.seat = seat;
      this.open(null);
    } else {
      this.open({ event: 'join', code, namePass: await this.account.roomNamePass() });
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

  rename(): void {
    this.send('rename');
  }

  react(reaction: Reaction): void {
    this.send('react', { reaction });
  }

  hideName(playerId: string): void {
    this.send('hide-name', { playerId });
  }

  kick(playerId: string): void {
    this.send('kick', { playerId });
  }

  leave(): void {
    this.send('leave');
    this.forgetSeat();
    this.close();
    this.error.set(null);
  }

  close(): void {
    clearTimeout(this.reconnectTimer);
    this.intent = null;
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    this.connection.set('closed');
    this.room.set(null);
    this.reactions.set([]);
  }

  private open(intent: Intent | null): void {
    this.close();
    this.intent = intent;
    this.error.set(null);
    this.kicked.set(false);
    this.attempts = 0;
    this.droppedAt = null;
    this.connect();
  }

  private retryNow(): void {
    if (!this.seat || this.kicked() || this.socket) {
      return;
    }
    clearTimeout(this.reconnectTimer);
    this.attempts = 0;
    this.droppedAt = null;
    this.connect();
  }

  private connect(): void {
    const url = this.document.location.hostname === 'localhost' ? LOCAL_ROOMS_URL : ROOMS_URL;
    this.connection.set(this.attempts === 0 ? 'connecting' : 'reconnecting');
    const socket = new WebSocket(url);
    this.socket = socket;
    socket.onopen = () => {
      this.attempts = 0;
      this.droppedAt = null;
      this.connection.set('open');
      if (this.seat) {
        this.send('rejoin', { code: this.seat.code, token: this.seat.token });
      } else if (this.intent?.event === 'create') {
        const { language, namePass } = this.intent;
        this.send('create', { language, gender: this.chosenGender(), namePass });
      } else if (this.intent?.event === 'join') {
        const { code, namePass } = this.intent;
        this.send('join', { code, gender: this.chosenGender(), namePass });
      }
    };
    socket.onmessage = (message) => this.receive(message.data);
    socket.onclose = () => {
      if (this.socket !== socket) {
        return;
      }
      this.socket = null;
      this.droppedAt ??= Date.now();
      if (this.seat && !this.kicked() && Date.now() - this.droppedAt < SEAT_KEPT_MS) {
        this.connection.set('reconnecting');
        const delay = RECONNECT_DELAYS_MS[Math.min(this.attempts++, RECONNECT_DELAYS_MS.length - 1)];
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
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
    } else if (event === 'reaction') {
      const [playerId, reaction] = ['playerId', 'reaction'].map((key) => field(data, key));
      if (typeof playerId === 'string' && isReaction(reaction)) {
        this.showReaction({ key: this.reactionKey++, playerId, reaction });
      }
    } else if (event === 'error') {
      const error = field(data, 'error');
      this.error.set(isRoomError(error) ? error : 'invalid');
      if (error === 'not-found') {
        this.forgetSeat();
      }
    } else if (event === 'kicked' || event === 'left') {
      this.kicked.set(event === 'kicked');
      this.forgetSeat();
      this.close();
    }
  }

  private showReaction(shown: PlayerReaction): void {
    this.reactions.update((reactions) => [...reactions, shown]);
    setTimeout(
      () => this.reactions.update((reactions) => reactions.filter(({ key }) => key !== shown.key)),
      REACTION_SHOW_MS
    );
  }

  private chosenGender(): WordGender | null {
    return this.gender.isAvailable() ? this.gender.choice() : null;
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
    }
  }

  private forgetSeat(): void {
    this.seat = null;
    this.playerId.set(null);
    try {
      sessionStorage.removeItem(SEAT_SESSION_KEY);
    } catch {
    }
  }
}
