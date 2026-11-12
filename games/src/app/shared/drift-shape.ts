/** How much of the way to its target the shape moves each frame: small, so it drifts rather than jumps */
const FOLLOW = 0.08;
/**
 * How close the shape's centre must be to an item's, as a share of the item's size, to count as covering it: about a
 * third, so the item's text changes colour while the shape is still arriving rather than once it's settled
 */
const COVERED = 0.3;
/** How close (in pixels) the shape must be to its goal to stop moving */
const SETTLED = 0.5;
/** The shape's size while following the pointer between items */
const DOT = 18;

/** Where the shape is or is heading: its centre and size, in the host's own coordinates */
interface Place {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DriftShapeOptions {
  /** The items the shape can cover, e.g. the menu's links */
  readonly items: string;
  /** The item it rests on, e.g. the current page's link */
  readonly current: string;
  /** The shape element's class, which gives its look */
  readonly className: string;
  /** Room the shape leaves around an item it covers, in pixels */
  readonly wrapX: number;
  readonly wrapY: number;
  /** Whether the shape is wanted now (a setting, a feature switch) */
  readonly isOn: () => boolean;
}

/**
 * A playful shape inside a host element (a menu, a group of choices). It rests behind the current item; when that
 * changes it drifts over to the new one. With a mouse or trackpad it also drifts after the pointer over the host and
 * fills the item it reaches, then goes back to the current item when the pointer leaves; keyboard focus on an item moves
 * it there too. The item it covers gets `is-covered`, so its text can change colour. Plain DOM, used by the menu
 * (MenuRing) and the choice groups (ChoiceRing).
 */
export class DriftShape {
  private shape: HTMLElement | null = null;
  private frame = 0;
  private current: Place = { x: 0, y: 0, width: DOT, height: DOT };
  private goal: Place = { x: 0, y: 0, width: DOT, height: DOT };
  private isVisible = false;
  /** The item the shape is heading for, and the one it covers now */
  private target: Element | null = null;
  private covered: Element | null = null;
  /** The pointer is over the host, so the shape follows it rather than resting */
  private isPointing = false;
  /** The current item, to notice when another one becomes current */
  private currentItem: Element | null = null;
  private readonly watcher: MutationObserver;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: DriftShapeOptions,
    private readonly window: Window,
  ) {
    // The current item changes (another page, another choice): the shape goes over to it. Its own marks on the items
    // it covers change classes too, so only a new current item counts
    this.watcher = new MutationObserver(() => {
      const item = this.host.querySelector(this.options.current);
      if (item !== this.currentItem) {
        this.currentItem = item;
        if (this.options.isOn() && !this.isPointing) {
          this.rest();
        }
      }
    });
    this.watcher.observe(this.host, {
      attributes: true,
      attributeFilter: ['class', 'aria-pressed'],
      subtree: true,
    });
  }

  pointer(event: PointerEvent): void {
    // A finger has no hover: a tap chooses, and the shape follows the current item
    if (event.pointerType === 'touch') {
      return;
    }
    this.isPointing = true;
    const item = event.target instanceof Element ? event.target.closest(this.options.items) : null;
    if (item && this.host.contains(item)) {
      this.headFor(item);
    } else {
      const box = this.host.getBoundingClientRect();
      this.target = null;
      this.go({
        x: event.clientX - box.left + this.host.scrollLeft,
        y: event.clientY - box.top + this.host.scrollTop,
        width: DOT,
        height: DOT,
      });
    }
  }

  focus(event: FocusEvent): void {
    if (event.target instanceof Element && event.target.matches(this.options.items)) {
      this.headFor(event.target);
    }
  }

  /** Back to the current item, or out of sight when there is none */
  rest(): void {
    this.isPointing = false;
    const item = this.host.querySelector(this.options.current);
    this.currentItem = item;
    if (item) {
      this.headFor(item);
    } else {
      this.hide();
    }
  }

  hide(): void {
    this.isVisible = false;
    this.target = null;
    this.cover(null);
    this.shape?.classList.remove('is-visible');
  }

  /** Stops for good and takes the shape away */
  destroy(): void {
    this.watcher.disconnect();
    // Only a shape that ever moved has a frame to cancel
    if (this.frame) {
      this.window.cancelAnimationFrame(this.frame);
    }
    this.cover(null);
    this.shape?.remove();
  }

  /** Heads for the item, wrapped with a little room */
  private headFor(item: Element): void {
    const box = this.host.getBoundingClientRect();
    const around = item.getBoundingClientRect();
    const { wrapX, wrapY } = this.options;
    this.target = item;
    this.go({
      x: around.left - box.left + this.host.scrollLeft + around.width / 2,
      y: around.top - box.top + this.host.scrollTop + around.height / 2,
      width: around.width + wrapX * 2,
      height: around.height + wrapY * 2,
    });
  }

  /** Sets where the shape is heading, showing it there first if it was out of sight, and wakes it up */
  private go(goal: Place): void {
    this.goal = goal;
    const shape = this.shape ?? this.createShape();
    if (!this.isVisible) {
      this.current = { ...goal };
      this.isVisible = true;
      shape.classList.add('is-visible');
    }
    if (!this.frame) {
      this.frame = this.window.requestAnimationFrame(() => this.move());
    }
  }

  /** Marks the item the shape covers, so its text can change colour, and unmarks the one it left */
  private cover(item: Element | null): void {
    if (item !== this.covered) {
      this.covered?.classList.remove('is-covered');
      item?.classList.add('is-covered');
      this.covered = item;
    }
  }

  private createShape(): HTMLElement {
    const shape = this.host.ownerDocument.createElement('span');
    shape.className = this.options.className;
    shape.setAttribute('aria-hidden', 'true');
    this.host.append(shape);
    this.shape = shape;
    return shape;
  }

  /** One frame: a step towards the goal; it stops once it has settled, and `go` wakes it up again */
  private move(): void {
    this.frame = 0;
    if (!this.isVisible || !this.shape) {
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
      Math.abs(this.current.height - goal.height),
    );
    if (distance < SETTLED) {
      this.current = { ...goal };
    }
    const isOver =
      Math.abs(this.current.x - goal.x) < goal.width * COVERED &&
      Math.abs(this.current.y - goal.y) < goal.height * COVERED;
    this.cover(isOver ? this.target : null);
    const { x, y, width, height } = this.current;
    this.shape.style.width = `${width}px`;
    this.shape.style.height = `${height}px`;
    this.shape.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px)`;
    if (distance >= SETTLED || this.isPointing) {
      this.frame = this.window.requestAnimationFrame(() => this.move());
    }
  }
}
