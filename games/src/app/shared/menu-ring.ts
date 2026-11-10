import { afterNextRender, afterRenderEffect, DestroyRef, Directive, DOCUMENT, ElementRef, inject, input, signal } from '@angular/core';

/** How much of the way to its target the shape moves each frame: small, so it drifts rather than jumps */
const FOLLOW = 0.08;
/** How close (in pixels) the pill must be to its link to count as covering it, and to stop moving */
const COVERED = 2;
const SETTLED = 0.5;
/** The shape's size while following the pointer, and the room it leaves around a link it covers */
const DOT = 18;
const WRAP_X = 10;
const WRAP_Y = 6;

/** Where the shape is or is heading: its centre and size, in the menu's own coordinates */
interface Place {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * A playful shape for a menu. It rests as a filled pill behind the current page's link (`a.active`); when that changes
 * (a tap on a phone, a click anywhere), it drifts over to the new one. With a mouse or trackpad, it also drifts after
 * the pointer over the menu and fills the link it reaches, then goes back to the current page's link when the pointer
 * leaves; keyboard focus on a link moves it there too. Once the pill covers a link, the link's text turns light
 * (`is-covered`). Never for visitors whose device asks for less motion. Turn it on with `[appMenuRing]="true"`; its
 * look is `.menu-ring` in styles.scss.
 */
@Directive({
  selector: '[appMenuRing]',
  host: {
    '[class.has-menu-ring]': 'isOn()',
    '(pointermove)': 'onPointer($event)',
    '(pointerleave)': 'rest()',
    '(focusin)': 'onFocus($event)',
    '(focusout)': 'rest()',
    '(window:resize)': 'rest()',
  },
})
export class MenuRing {
  readonly enabled = input(false, { alias: 'appMenuRing' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly window = inject(DOCUMENT).defaultView;
  /** Whether this device suits the shape: no wish for less motion */
  private readonly suits = signal(false);
  private ring: HTMLElement | null = null;
  private frame = 0;
  private current: Place = { x: 0, y: 0, width: DOT, height: DOT };
  private goal: Place = { x: 0, y: 0, width: DOT, height: DOT };
  private isVisible = false;
  /** The link the shape is heading for, and the one it covers now */
  private target: Element | null = null;
  private covered: Element | null = null;
  /** The pointer is over the menu, so the shape follows it rather than resting */
  private isPointing = false;
  /** The current page's link, to notice when another one becomes current */
  private activeLink: Element | null = null;
  private stopWatching: () => void = () => undefined;

  protected isOn(): boolean {
    return this.enabled() && this.suits();
  }

  constructor() {
    afterNextRender(() => {
      this.suits.set(!(this.window?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true));
      // The current page's link changes when the visitor goes to another page: the shape goes over to it (its own
      // marks on the links it covers change classes too, so only a new current link counts)
      const watcher = new MutationObserver(() => {
        const active = this.host.querySelector('a.active');
        if (active !== this.activeLink) {
          this.activeLink = active;
          this.rest();
        }
      });
      watcher.observe(this.host, { attributes: true, attributeFilter: ['class'], subtree: true });
      this.stopWatching = () => watcher.disconnect();
    });
    // Shown (on the current page's link) when turned on, gone when turned off
    afterRenderEffect(() => {
      if (this.isOn()) {
        this.rest();
      } else {
        this.hide();
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.stopWatching();
      // Only a shape that ever moved has a frame to cancel (never while prerendering, where there are no frames)
      if (this.frame) {
        this.window?.cancelAnimationFrame(this.frame);
      }
      this.ring?.remove();
    });
  }

  protected onPointer(event: PointerEvent): void {
    // A finger has no hover: a tap goes to a page, and the shape follows the page's link
    if (!this.isOn() || event.pointerType === 'touch') {
      return;
    }
    this.isPointing = true;
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link && this.host.contains(link)) {
      this.headFor(link);
    } else {
      const box = this.host.getBoundingClientRect();
      this.target = null;
      this.go({
        x: event.clientX - box.left + this.host.scrollLeft,
        y: event.clientY - box.top,
        width: DOT,
        height: DOT,
      });
    }
  }

  protected onFocus(event: FocusEvent): void {
    if (this.isOn() && event.target instanceof HTMLAnchorElement) {
      this.headFor(event.target);
    }
  }

  /** Back to the current page's link, or out of sight when the menu has none */
  protected rest(): void {
    this.isPointing = false;
    if (!this.isOn()) {
      return;
    }
    const current = this.host.querySelector('a.active');
    if (current) {
      this.headFor(current);
    } else {
      this.hide();
    }
  }

  private hide(): void {
    this.isVisible = false;
    this.target = null;
    this.cover(null);
    this.ring?.classList.remove('is-visible');
  }

  /** Heads for a pill behind the link */
  private headFor(link: Element): void {
    const box = this.host.getBoundingClientRect();
    const around = link.getBoundingClientRect();
    this.target = link;
    this.go({
      x: around.left - box.left + this.host.scrollLeft + around.width / 2,
      y: around.top - box.top + around.height / 2,
      width: around.width + WRAP_X * 2,
      height: around.height + WRAP_Y * 2,
    });
  }

  /** Sets where the shape is heading, showing it there first if it was out of sight, and wakes it up */
  private go(goal: Place): void {
    this.goal = goal;
    const ring = this.ring ?? this.createRing();
    if (!this.isVisible) {
      this.current = { ...goal };
      this.isVisible = true;
      ring.classList.add('is-visible');
    }
    if (!this.frame) {
      this.frame = this.window?.requestAnimationFrame(() => this.move()) ?? 0;
    }
  }

  /** Marks the link the pill covers, so its text turns light, and unmarks the one it left */
  private cover(link: Element | null): void {
    if (link !== this.covered) {
      this.covered?.classList.remove('is-covered');
      link?.classList.add('is-covered');
      this.covered = link;
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

  /** One frame: a step towards the goal; it stops once it has settled, and `go` wakes it up again */
  private move(): void {
    this.frame = 0;
    if (!this.isVisible || !this.ring) {
      return;
    }
    const step = (from: number, to: number): number => from + (to - from) * FOLLOW;
    const { goal } = this;
    this.current = {
      x: step(this.current.x, goal.x),
      y: step(this.current.y, goal.y),
      width: step(this.current.width, goal.width),
      height: step(this.current.height, goal.height),
    };
    const distance = Math.max(
      Math.abs(this.current.x - goal.x),
      Math.abs(this.current.y - goal.y),
      Math.abs(this.current.width - goal.width),
    );
    if (distance < SETTLED) {
      this.current = { ...goal };
    }
    this.cover(distance < COVERED ? this.target : null);
    const { x, y, width, height } = this.current;
    this.ring.style.width = `${width}px`;
    this.ring.style.height = `${height}px`;
    this.ring.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px)`;
    if (distance >= SETTLED || this.isPointing) {
      this.frame = this.window?.requestAnimationFrame(() => this.move()) ?? 0;
    }
  }
}
