import { afterNextRender, DestroyRef, Directive, DOCUMENT, ElementRef, inject, input, signal } from '@angular/core';

/** How much of the way to its target the ring moves each frame: small, so it drifts after the pointer */
const FOLLOW = 0.08;
/** The ring's size while following the pointer, and the room it leaves around a link it wraps */
const DOT = 18;
const WRAP_X = 10;
const WRAP_Y = 6;

/**
 * A playful ring for a menu: while the pointer is over the menu it drifts after it and, on reaching a link, stretches
 * around it like a frame; it fades out when the pointer leaves, so it never follows the pointer anywhere else.
 * Keyboard focus on a link moves it there too. Only for a mouse or trackpad, and never for visitors whose device asks
 * for less motion. Turn it on with `[appMenuRing]="true"`; its look is `.menu-ring` in styles.scss.
 */
@Directive({
  selector: '[appMenuRing]',
  host: {
    '[class.has-menu-ring]': 'isOn()',
    '(pointermove)': 'onPointer($event)',
    '(pointerleave)': 'hide()',
    '(focusin)': 'onFocus($event)',
    '(focusout)': 'hide()',
  },
})
export class MenuRing {
  readonly enabled = input(false, { alias: 'appMenuRing' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly window = inject(DOCUMENT).defaultView;
  /** Whether this device suits the ring: a fine pointer, and no wish for less motion */
  private readonly suits = signal(false);
  private ring: HTMLElement | null = null;
  private frame = 0;
  /** Where the ring is and where it's heading (centre, width, height), in the menu's own coordinates */
  private current = { x: 0, y: 0, width: DOT, height: DOT };
  private goal = { x: 0, y: 0, width: DOT, height: DOT };
  private isVisible = false;

  protected isOn(): boolean {
    return this.enabled() && this.suits();
  }

  constructor() {
    afterNextRender(() => {
      const media = (query: string): boolean => this.window?.matchMedia(query).matches ?? false;
      this.suits.set(media('(pointer: fine)') && !media('(prefers-reduced-motion: reduce)'));
    });
    inject(DestroyRef).onDestroy(() => {
      // Only a ring that ever moved has a frame to cancel (never while prerendering, where there are no frames)
      if (this.frame) {
        this.window?.cancelAnimationFrame(this.frame);
      }
      this.ring?.remove();
    });
  }

  protected onPointer(event: PointerEvent): void {
    if (!this.isOn() || event.pointerType === 'touch') {
      return;
    }
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link && this.host.contains(link)) {
      this.wrap(link);
    } else {
      const box = this.host.getBoundingClientRect();
      this.goal = {
        x: event.clientX - box.left + this.host.scrollLeft,
        y: event.clientY - box.top,
        width: DOT,
        height: DOT,
      };
    }
    this.show();
  }

  protected onFocus(event: FocusEvent): void {
    if (this.isOn() && event.target instanceof HTMLAnchorElement) {
      this.wrap(event.target);
      this.show();
    }
  }

  protected hide(): void {
    this.isVisible = false;
    this.ring?.classList.remove('is-visible');
  }

  /** Heads for a frame around the link */
  private wrap(link: Element): void {
    const box = this.host.getBoundingClientRect();
    const around = link.getBoundingClientRect();
    this.goal = {
      x: around.left - box.left + this.host.scrollLeft + around.width / 2,
      y: around.top - box.top + around.height / 2,
      width: around.width + WRAP_X * 2,
      height: around.height + WRAP_Y * 2,
    };
  }

  private show(): void {
    const ring = this.ring ?? this.createRing();
    if (!this.isVisible) {
      // Appears where it's heading, then drifts from there
      this.current = { ...this.goal };
      this.isVisible = true;
      ring.classList.add('is-visible');
      this.frame = this.window?.requestAnimationFrame(() => this.move()) ?? 0;
    }
  }

  private createRing(): HTMLElement {
    const ring = this.host.ownerDocument.createElement('span');
    ring.className = 'menu-ring';
    ring.setAttribute('aria-hidden', 'true');
    this.host.append(ring);
    this.ring = ring;
    return ring;
  }

  private move(): void {
    if (!this.isVisible || !this.ring) {
      return;
    }
    const step = (from: number, to: number): number => from + (to - from) * FOLLOW;
    this.current = {
      x: step(this.current.x, this.goal.x),
      y: step(this.current.y, this.goal.y),
      width: step(this.current.width, this.goal.width),
      height: step(this.current.height, this.goal.height),
    };
    const { x, y, width, height } = this.current;
    this.ring.style.width = `${width}px`;
    this.ring.style.height = `${height}px`;
    this.ring.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px)`;
    this.frame = this.window?.requestAnimationFrame(() => this.move()) ?? 0;
  }
}
