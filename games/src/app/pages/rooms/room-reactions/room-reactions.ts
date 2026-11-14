import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, output, signal } from '@angular/core';
import { dockAt, Reaction, REACTION_GAP_MS, reactionPicture, REACTIONS, Reactions } from '../../../core/reactions';
import { TranslatePipe } from '../../../i18n/translate-pipe';

const HOLD_MS = 1000;
const HOLD_SLACK = 10;
const MOVABLE_WIDTHS = '(max-width: 55.99rem)';

interface Press {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly timer: ReturnType<typeof setTimeout>;
}

@Component({
  selector: 'app-room-reactions',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-reactions.html',
  styleUrl: './room-reactions.scss',
  host: {
    '[class.is-left]': "reactions.side() === 'left'",
    '[class.is-bottom]': "reactions.side() === 'bottom'",
    '[class.is-movable]': 'reactions.isMovable()',
  },
})
export class RoomReactions {
  protected readonly reactions = inject(Reactions);
  readonly react = output<Reaction>();

  protected readonly all = REACTIONS;
  protected readonly pictureOf = reactionPicture;
  protected readonly isResting = signal(false);
  protected readonly dragOffset = signal<{ readonly x: number; readonly y: number } | null>(null);
  protected readonly dragTranslate = computed(() => {
    const offset = this.dragOffset();
    return offset ? `${offset.x}px ${offset.y}px` : null;
  });

  private press: Press | null = null;
  private wasDragged = false;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const keepPageStill = (event: TouchEvent): void => {
      if (this.press) {
        event.preventDefault();
      }
    };
    afterNextRender(() => host.addEventListener('touchmove', keepPageStill, { passive: false }));
    inject(DestroyRef).onDestroy(() => {
      host.removeEventListener('touchmove', keepPageStill);
      this.endPress();
    });
  }

  protected send(reaction: Reaction): void {
    if (this.wasDragged) {
      this.wasDragged = false;
      return;
    }
    this.react.emit(reaction);
    this.isResting.set(true);
    setTimeout(() => this.isResting.set(false), REACTION_GAP_MS);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.reactions.isMovable() || !matchMedia(MOVABLE_WIDTHS).matches || this.press) {
      return;
    }
    const target = event.currentTarget;
    const { pointerId, clientX, clientY } = event;
    this.wasDragged = false;
    this.press = {
      pointerId,
      startX: clientX,
      startY: clientY,
      timer: setTimeout(() => {
        if (target instanceof Element) {
          target.setPointerCapture(pointerId);
        }
        this.dragOffset.set({ x: 0, y: 0 });
        navigator.vibrate?.(20);
      }, HOLD_MS),
    };
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.press;
    if (!press || event.pointerId !== press.pointerId) {
      return;
    }
    const x = event.clientX - press.startX;
    const y = event.clientY - press.startY;
    if (this.dragOffset()) {
      this.dragOffset.set({ x, y });
    } else if (Math.hypot(x, y) > HOLD_SLACK) {
      this.endPress();
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.press || event.pointerId !== this.press.pointerId) {
      return;
    }
    if (this.dragOffset()) {
      this.reactions.setSide(dockAt(event.clientX, event.clientY, innerWidth, innerHeight));
      this.wasDragged = true;
    }
    this.endPress();
  }

  private endPress(): void {
    if (this.press) {
      clearTimeout(this.press.timer);
    }
    this.press = null;
    this.dragOffset.set(null);
  }
}
