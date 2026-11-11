import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { readStored, writeStored } from '../../core/site-storage';
import { BoardLevelId, getBoardLevel } from '../../games/board';
import { DEFAULT_PAIRS_LEVEL, dealPairs, isPair, PairCard, PAIRS_LEVELS } from '../../games/find-pairs';
import { GameClock } from '../../shared/game-clock';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'playing' | 'done';
type BestMoves = Partial<Record<BoardLevelId, number>>;

const BEST_STORAGE = RESULT_GAMES['find-pairs'].storage;
/** How long two different cards stay face up before turning back */
const MISMATCH_MS = 900;

/**
 * Find the pairs: a board of face-down cards, turned two at a time; pairs stay face up. The clock starts on the first
 * card, and the fewest moves for each board size are kept in this browser. Changing the size deals a new board.
 */
@Component({
  selector: 'app-find-pairs-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-pairs-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
    '../../shared/play-layout.scss',
    './find-pairs-page.scss',
  ],
})
export class FindPairsPage {
  protected readonly levels = PAIRS_LEVELS;
  protected readonly minAge = gameInfo('find-pairs').minAge;
  private readonly api = inject(GamesApi);
  private readonly account = inject(PlayerAccount);
  protected readonly clock = new GameClock();

  protected readonly levelId = signal<BoardLevelId>(DEFAULT_PAIRS_LEVEL);
  protected readonly level = computed(() => getBoardLevel(PAIRS_LEVELS, this.levelId()));
  protected readonly phase = signal<Phase>('playing');
  protected readonly cards = signal<readonly PairCard[]>([]);
  /** Cards of the pairs found, and the one or two turned now */
  private readonly matched = signal<ReadonlySet<number>>(new Set());
  private readonly open = signal<readonly number[]>([]);
  protected readonly moves = signal(0);
  protected readonly pairsFound = computed(() => this.matched().size / 2);
  protected readonly pairsTotal = computed(() => this.cards().length / 2);

  private readonly bestMoves = signal<BestMoves>({});
  protected readonly best = computed(() => this.bestMoves()[this.levelId()] ?? null);
  protected readonly isNewBest = signal(false);

  private hasStarted = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Dealt in the browser only, so the prerendered page doesn't show one board and then another
    afterNextRender(() => {
      this.bestMoves.set(readBestMoves());
      this.newGame();
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.clock.stop();
    });
  }

  protected isFaceUp(card: PairCard): boolean {
    return this.matched().has(card.id) || this.open().includes(card.id);
  }

  protected isMatched(card: PairCard): boolean {
    return this.matched().has(card.id);
  }

  protected chooseLevel(id: BoardLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    clearTimeout(this.timer);
    this.clock.reset();
    this.hasStarted = false;
    this.cards.set(dealPairs(this.level(), Math.random));
    this.matched.set(new Set());
    this.open.set([]);
    this.moves.set(0);
    this.isNewBest.set(false);
    this.phase.set('playing');
  }

  protected flip(card: PairCard): void {
    // Two cards are already up (waiting to turn back), or this one is up already
    if (this.phase() !== 'playing' || this.open().length === 2 || this.isFaceUp(card)) {
      return;
    }
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.api.countPlay('find-pairs');
      this.clock.start();
    }
    const open = [...this.open(), card.id];
    this.open.set(open);
    if (open.length === 2) {
      this.compare(open);
    }
  }

  private compare([firstId, secondId]: readonly number[]): void {
    this.moves.update((moves) => moves + 1);
    const [first, second] = [this.cards()[firstId], this.cards()[secondId]];
    if (!isPair(first, second)) {
      this.timer = setTimeout(() => this.open.set([]), MISMATCH_MS);
      return;
    }
    this.matched.update((matched) => new Set([...matched, firstId, secondId]));
    this.open.set([]);
    if (this.matched().size === this.cards().length) {
      this.finish();
    }
  }

  private finish(): void {
    this.clock.stop();
    this.phase.set('done');
    this.account.record('find-pairs', this.levelId(), this.moves());
    const best = this.best();
    if (best === null || this.moves() < best) {
      this.isNewBest.set(true);
      this.bestMoves.update((moves) => ({ ...moves, [this.levelId()]: this.moves() }));
      writeStored(BEST_STORAGE, this.bestMoves());
    }
  }
}

/** Best moves saved in this browser, keeping only known levels with whole numbers */
function readBestMoves(): BestMoves {
  const stored = readStored(BEST_STORAGE);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const moves: BestMoves = {};
  for (const { id } of PAIRS_LEVELS) {
    const value: unknown = Reflect.get(stored, id);
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      moves[id] = value;
    }
  }
  return moves;
}
