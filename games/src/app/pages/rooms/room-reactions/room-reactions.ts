import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { dockAt, Reaction, REACTION_GAP_MS, reactionPicture, REACTIONS, Reactions } from '../../../core/reactions';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/** How long a finger (or mouse button) stays down on the stickers before they lift and can be moved */
const HOLD_MS = 1000;
/** Movement, in pixels, after which a press is a scroll or a slip rather than a hold */
const HOLD_SLACK = 10;
/** The widths where the stickers sit inside the game card and can be moved (the room's columns start at 56rem) */
const MOVABLE_WIDTHS = '(max-width: 55.99rem)';

/** A press on the stickers: where it started, and while it's moving them, how far they have gone */
interface Press {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly timer: ReturnType<typeof setTimeout>;
}

/**
 * The room's sticker bar, always open. Tapping a hand-drawn sticker sends it to everyone; the stickers rest a moment
 * after, as the rooms service would drop a quicker one. On phones and tablets it sits inside the game card, on the
 * side chosen in the settings or at the bottom. With `sticker-drag` on and the player's own setting too, holding it for
 * a second lifts it, and dropping it moves it to the nearer edge, or into a row at the bottom.
 */
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
  /** How far the lifted stickers have moved from where they were, while being dragged; null when they rest */
  protected readonly dragOffset = signal<{ readonly x: number; readonly y: number } | null>(null);
  protected readonly dragTranslate = computed(() => {
    const offset = this.dragOffset();
    return offset ? `${offset.x}px ${offset.y}px` : null;
  });

  private press: Press | null = null;
  /** The press that just moved the stickers ends with a click; it mustn't send a sticker */
  private wasDragged = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.endPress());
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
        // Held still long enough: lift the stickers, and keep following this finger even outside them
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
      // Moved before the hold: a scroll or a slip, not a move
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
