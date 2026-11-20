import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { SiteMotion } from '../../../core/site-motion';
import { formatLinear, simulate } from '../spring';

interface Offset {
  readonly x: number;
  readonly y: number;
}

const HOME: Offset = { x: 0, y: 0 };
const TRASH_MS = 300;
const RETURN_MOTION = simulate({ stiffness: 260, damping: 14, mass: 1 });
const RETURN_EASING = formatLinear(RETURN_MOTION);
const RETURN_TRANSITION = `translate ${RETURN_MOTION.duration}ms ${RETURN_EASING}, rotate ${RETURN_MOTION.duration}ms ${RETURN_EASING}, scale 0.2s ease-out`;
const DRAG_TRANSITION = 'scale 0.2s ease-out';

const centerOf = (rect: DOMRect): Offset => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

const contains = (rect: DOMRect, point: Offset): boolean =>
  point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;

@Component({
  selector: 'app-spring-photo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spring-photo.html',
  styleUrl: './spring-photo.scss',
})
export class SpringPhoto {
  private readonly motion = inject(SiteMotion);
  private readonly photo = viewChild<ElementRef<HTMLElement>>('photo');
  private readonly bin = viewChild.required<ElementRef<HTMLElement>>('bin');
  private pointerId?: number;
  private start: Offset = HOME;

  protected readonly offset = signal<Offset>(HOME);
  protected readonly dragging = signal(false);
  protected readonly overBin = signal(false);
  protected readonly trashed = signal(false);

  protected grab(event: PointerEvent): void {
    if (event.button !== 0 || !(event.currentTarget instanceof HTMLElement)) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    this.pointerId = event.pointerId;
    this.start = { x: event.clientX, y: event.clientY };
    this.dragging.set(true);
  }

  protected follow(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.offset.set({ x: event.clientX - this.start.x, y: event.clientY - this.start.y });
    this.overBin.set(this.isOverBin(event));
  }

  protected async release(event: PointerEvent): Promise<void> {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.pointerId = undefined;
    this.dragging.set(false);
    if (this.isOverBin(event)) {
      await this.dropInBin();
      return;
    }
    this.offset.set(HOME);
  }

  protected restore(): void {
    this.offset.set(HOME);
    this.overBin.set(false);
    this.trashed.set(false);
  }

  protected transition(): string {
    return this.dragging() || this.motion.shouldReduce() ? DRAG_TRANSITION : RETURN_TRANSITION;
  }

  private isOverBin(event: PointerEvent): boolean {
    return contains(this.bin().nativeElement.getBoundingClientRect(), { x: event.clientX, y: event.clientY });
  }

  private async dropInBin(): Promise<void> {
    const photo = this.photo()?.nativeElement;
    if (photo && !this.motion.shouldReduce()) {
      const from = centerOf(photo.getBoundingClientRect());
      const to = centerOf(this.bin().nativeElement.getBoundingClientRect());
      const shift = `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(0.1)`;
      await photo.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: shift, opacity: 0 },
        ],
        {
          duration: TRASH_MS,
          easing: 'cubic-bezier(0.55, 0, 0.7, 0.4)',
          fill: 'forwards',
        },
      ).finished;
    }
    this.trashed.set(true);
    this.overBin.set(false);
  }
}
