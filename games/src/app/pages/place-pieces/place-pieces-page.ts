import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { BoardLevelId } from '../../games/board';
import { getPictureLevel, PictureModeId } from '../../games/picture-game';
import { Arrangement, isPlaced, isSolved, piecesPlaced, shuffle, solvedArrangement, swap } from '../../games/place-pieces';
import { SiteLanguage } from '../../i18n/site-language';
import { GameBoard } from '../../shared/game-board';
import { formatTime, GameClock } from '../../shared/game-clock';
import { BestTimes, pictureScoreKey, readBestTimes, writeBestTimes } from '../../shared/picture-best-times';
import { PictureSettings } from '../../shared/picture-settings';
import { PictureSlice } from '../../shared/picture-slice';

/** Memory mode starts with the whole picture on show, until the player presses Ready */
type Phase = 'preview' | 'playing' | 'solved';

/** A piece being dragged: where the pointer started and how far it has moved */
interface Drag {
  readonly cell: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly dx: number;
  readonly dy: number;
}

const BEST_TIMES_STORAGE = 'place-pieces:best-seconds';

/** Pointer movement, in pixels, below which a press counts as a tap rather than a drag */
const DRAG_THRESHOLD = 8;

/**
 * Place the pieces: drag a piece onto another to swap them (or tap two pieces) until the drawing is whole.
 * Look mode keeps the drawing visible and marks the pieces in place; Memory mode shows it only until Ready.
 */
@Component({
  selector: 'app-place-pieces-page',
  imports: [GameBoard, PictureSettings, PictureSlice, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-pieces-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/picture-board.scss', '../../shared/game-done.scss', './place-pieces-page.scss'],
})
export class PlacePiecesPage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly modeId = signal<PictureModeId>('look');
  protected readonly levelId = signal<BoardLevelId>('normal');
  protected readonly level = computed(() => getPictureLevel(this.levelId()));

  /** Chosen in the browser only, so the prerendered page and the first render agree */
  protected readonly picture = signal<GamePicture | null>(null);
  protected readonly arrangement = signal<Arrangement>([]);
  protected readonly phase = signal<Phase>('playing');
  protected readonly moves = signal(0);
  protected readonly clock = new GameClock();
  protected readonly isNewBest = signal(false);

  /** A piece chosen by a tap, waiting for a second tap to swap with */
  protected readonly picked = signal<number | null>(null);
  protected readonly drag = signal<Drag | null>(null);
  private readonly board = viewChild<ElementRef<HTMLElement>>('board');

  private readonly bestTimes = signal<BestTimes>({});
  private readonly scoreKey = computed(() => pictureScoreKey(this.modeId(), this.levelId()));
  protected readonly best = computed(() => {
    const seconds = this.bestTimes()[this.scoreKey()];
    return seconds === undefined ? null : formatTime(seconds);
  });

  protected readonly placed = computed(() => piecesPlaced(this.arrangement()));
  /** Look mode marks the pieces already in place */
  protected readonly showHints = computed(() => this.modeId() === 'look' && this.phase() === 'playing');

  constructor() {
    afterNextRender(() => {
      this.bestTimes.set(readBestTimes(BEST_TIMES_STORAGE));
      this.newGame();
    });
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

  protected chooseMode(id: PictureModeId): void {
    this.modeId.set(id);
    this.newGame();
  }

  protected chooseLevel(id: BoardLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    this.clock.reset();
    this.picture.set(nextPicture(this.picture()?.id ?? null));
    this.moves.set(0);
    this.picked.set(null);
    this.drag.set(null);
    this.isNewBest.set(false);
    if (this.modeId() === 'memory') {
      // The whole picture first: every piece in place until Ready
      this.arrangement.set(solvedArrangement(this.level()));
      this.phase.set('preview');
    } else {
      this.arrangement.set(shuffle(this.level()));
      this.phase.set('playing');
    }
  }

  /** Memory mode: the player has looked; mix up the pieces and start */
  protected ready(): void {
    this.arrangement.set(shuffle(this.level()));
    this.phase.set('playing');
  }

  protected isPieceRight(cell: number): boolean {
    return isPlaced(this.arrangement(), cell);
  }

  /** Where a dragged piece is drawn: following the pointer, a little bigger */
  protected dragTransform(cell: number): string | null {
    const drag = this.drag();
    return drag?.cell === cell ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.06)` : null;
  }

  protected onPointerDown(event: PointerEvent, cell: number): void {
    if (this.phase() !== 'playing' || !event.isPrimary) {
      return;
    }
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    this.drag.set({ cell, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0 });
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this.drag();
    if (drag?.pointerId === event.pointerId) {
      this.drag.set({ ...drag, dx: event.clientX - drag.startX, dy: event.clientY - drag.startY });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const drag = this.drag();
    if (drag?.pointerId !== event.pointerId) {
      return;
    }
    this.drag.set(null);
    if (Math.hypot(drag.dx, drag.dy) < DRAG_THRESHOLD) {
      this.tapPiece(drag.cell);
      return;
    }
    const target = this.cellAt(event.clientX, event.clientY, drag.cell);
    if (target !== null) {
      this.picked.set(null);
      this.swapPieces(drag.cell, target);
    }
  }

  protected cancelDrag(): void {
    this.drag.set(null);
  }

  /** Keyboard (Enter or Space) works like a tap; pointer taps are handled on pointer up */
  protected onClick(event: MouseEvent, cell: number): void {
    if (event.detail === 0 && this.phase() === 'playing') {
      this.tapPiece(cell);
    }
  }

  /** First tap picks a piece; a second tap on another piece swaps them, on the same piece drops it */
  private tapPiece(cell: number): void {
    const picked = this.picked();
    if (picked === null) {
      this.picked.set(cell);
    } else {
      this.picked.set(null);
      if (picked !== cell) {
        this.swapPieces(picked, cell);
      }
    }
  }

  private swapPieces(first: number, second: number): void {
    if (this.moves() === 0) {
      this.clock.start();
    }
    this.arrangement.update((arrangement) => swap(arrangement, first, second));
    this.moves.update((moves) => moves + 1);
    if (isSolved(this.arrangement())) {
      this.finish();
    }
  }

  /** The board cell under a point, other than the one being dragged */
  private cellAt(x: number, y: number, dragged: number): number | null {
    const board = this.board()?.nativeElement;
    for (const element of document.elementsFromPoint(x, y)) {
      const tile = element.closest<HTMLElement>('[data-cell]');
      const cell = Number(tile?.dataset['cell']);
      if (tile && board?.contains(tile) && Number.isInteger(cell) && cell !== dragged) {
        return cell;
      }
    }
    return null;
  }

  private finish(): void {
    this.clock.stop();
    this.phase.set('solved');
    const seconds = this.clock.seconds();
    const best = this.bestTimes()[this.scoreKey()];
    if (best === undefined || seconds < best) {
      this.bestTimes.update((times) => ({ ...times, [this.scoreKey()]: seconds }));
      this.isNewBest.set(true);
      writeBestTimes(BEST_TIMES_STORAGE, this.bestTimes());
    }
  }
}
