import { ChangeDetectionStrategy, Component, ElementRef, input, linkedSignal, output, viewChild } from '@angular/core';
import { GamePicture } from '../../../core/pictures';
import { Shape } from '../../../games/board';
import { PicturePhase } from '../../../games/picture-game';
import { Arrangement, isPlaced } from '../../../games/place-pieces';
import { PictureSlice } from '../../../shared/picture-slice/picture-slice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

interface Drag {
  readonly cell: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly dx: number;
  readonly dy: number;
}

export interface PieceSwap {
  readonly first: number;
  readonly second: number;
}

const DRAG_THRESHOLD = 8;

@Component({
  selector: 'app-place-board',
  imports: [TranslatePipe, PictureSlice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-board.html',
  styleUrls: ['../../../shared/picture-board.scss', './place-board.scss'],
  host: { style: 'display: contents' },
})
export class PlaceBoard {
  readonly picture = input.required<GamePicture>();
  readonly shape = input.required<Shape>();
  readonly arrangement = input.required<Arrangement>();
  readonly phase = input.required<PicturePhase>();
  readonly showHints = input(false);
  readonly swapped = output<PieceSwap>();

  protected readonly picked = linkedSignal({ source: this.arrangement, computation: (): number | null => null });
  protected readonly drag = linkedSignal({ source: this.arrangement, computation: (): Drag | null => null });
  private readonly board = viewChild<ElementRef<HTMLElement>>('board');

  protected isPieceRight(cell: number): boolean {
    return isPlaced(this.arrangement(), cell);
  }

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

  protected onClick(event: MouseEvent, cell: number): void {
    if (event.detail === 0 && this.phase() === 'playing') {
      this.tapPiece(cell);
    }
  }

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
