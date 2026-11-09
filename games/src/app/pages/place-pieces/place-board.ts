import { ChangeDetectionStrategy, Component, ElementRef, inject, input, linkedSignal, output, viewChild } from '@angular/core';
import { GamePicture } from '../../core/pictures';
import { Shape } from '../../games/board';
import { PicturePhase } from '../../games/picture-game';
import { Arrangement, isPlaced } from '../../games/place-pieces';
import { SiteLanguage } from '../../i18n/site-language';
import { PictureSlice } from '../../shared/picture-slice';

/** A piece being dragged: where the pointer started and how far it has moved */
interface Drag {
  readonly cell: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly dx: number;
  readonly dy: number;
}

/** Two cells whose pieces swap */
export interface PieceSwap {
  readonly first: number;
  readonly second: number;
}

/** Pointer movement, in pixels, below which a press counts as a tap rather than a drag */
const DRAG_THRESHOLD = 8;

/**
 * The board of Place the pieces: drag a piece onto another, or tap two pieces, to swap them. Shared by the game's page
 * and its room round, which keep the arrangement and swap the pieces they're told.
 */
@Component({
  selector: 'app-place-board',
  imports: [PictureSlice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-board.html',
  styleUrls: ['../../shared/picture-board.scss', './place-board.scss'],
  // The board sits straight in its parent's layout
  host: { style: 'display: contents' },
})
export class PlaceBoard {
  readonly picture = input.required<GamePicture>();
  readonly shape = input.required<Shape>();
  readonly arrangement = input.required<Arrangement>();
  readonly phase = input.required<PicturePhase>();
  /** Look mode marks the pieces already in place */
  readonly showHints = input(false);
  readonly swapped = output<PieceSwap>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  /** A piece chosen by a tap, waiting for a second tap to swap with; any new arrangement drops it */
  protected readonly picked = linkedSignal({ source: this.arrangement, computation: (): number | null => null });
  protected readonly drag = linkedSignal({ source: this.arrangement, computation: (): Drag | null => null });
  private readonly board = viewChild<ElementRef<HTMLElement>>('board');

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
      this.swapped.emit({ first: drag.cell, second: target });
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
        this.swapped.emit({ first: picked, second: cell });
      }
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
}
