import { Directive, ElementRef, inject, output } from '@angular/core';

export interface DragPoint {
  readonly x: number;
  readonly y: number;
  readonly target: EventTarget | null;
}

export interface ArrowMove {
  readonly x: number;
  readonly y: number;
}

const ARROW_MOVES: Readonly<Record<string, ArrowMove>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

export const arrowMove = (event: KeyboardEvent, smallStep: number, largeStep: number): ArrowMove | undefined => {
  const move = ARROW_MOVES[event.key];
  if (!move) {
    return undefined;
  }
  event.preventDefault();
  const step = event.shiftKey ? largeStep : smallStep;
  return { x: move.x * step, y: move.y * step };
};

@Directive({
  selector: '[appPointerDrag]',
  host: {
    '[style.touch-action]': '"none"',
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'end($event)',
    '(pointercancel)': 'end($event)',
  },
})
export class PointerDrag {
  readonly dragStart = output<DragPoint>();
  readonly dragMove = output<DragPoint>();
  readonly dragEnd = output();

  private readonly element = inject<ElementRef<Element>>(ElementRef).nativeElement;
  private pointerId?: number;

  protected start(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    this.pointerId = event.pointerId;
    this.element.setPointerCapture(event.pointerId);
    this.focusHandle(event.target);
    this.dragStart.emit(this.pointFrom(event));
  }

  protected move(event: PointerEvent): void {
    if (event.pointerId === this.pointerId) {
      this.dragMove.emit(this.pointFrom(event));
    }
  }

  protected end(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.pointerId = undefined;
    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }
    this.dragEnd.emit();
  }

  private focusHandle(target: EventTarget | null): void {
    const handle = target instanceof Element ? target.closest('[data-drag-index]') : null;
    if (handle instanceof HTMLElement || handle instanceof SVGElement) {
      handle.focus({ preventScroll: true });
    }
  }

  private pointFrom(event: PointerEvent): DragPoint {
    const rect = this.element.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      target: event.target,
    };
  }
}

export const dragIndexOf = (target: EventTarget | null): number | undefined => {
  const element = target instanceof Element ? target.closest('[data-drag-index]') : null;
  const value = element?.getAttribute('data-drag-index');
  return value === null || value === undefined ? undefined : Number(value);
};
