const FOLLOW = 0.08;
const COVERED = 0.3;
const SETTLED = 0.5;
const DOT = 8;

interface Place {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DriftShapeOptions {
  readonly items: string;
  readonly current: string;
  readonly className: string;
  readonly wrapX: number;
  readonly wrapY: number;
  readonly isOn: () => boolean;
}

export class DriftShape {
  private shape: HTMLElement | null = null;
  private frame = 0;
  private current: Place = { x: 0, y: 0, width: DOT, height: DOT };
  private goal: Place = { x: 0, y: 0, width: DOT, height: DOT };
  private isVisible = false;
  private target: Element | null = null;
  private covered: Element | null = null;
  private isPointing = false;
  private currentItem: Element | null = null;
  private readonly watcher: MutationObserver;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: DriftShapeOptions,
    private readonly window: Window,
  ) {
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
      this.shape?.classList.add('is-dot');
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

  destroy(): void {
    this.watcher.disconnect();
    if (this.frame) {
      this.window.cancelAnimationFrame(this.frame);
    }
    this.cover(null);
    this.shape?.remove();
  }

  private headFor(item: Element): void {
    const box = this.host.getBoundingClientRect();
    const around = item.getBoundingClientRect();
    const { wrapX, wrapY } = this.options;
    this.target = item;
    this.shape?.classList.remove('is-dot');
    this.go({
      x: around.left - box.left + this.host.scrollLeft + around.width / 2,
      y: around.top - box.top + this.host.scrollTop + around.height / 2,
      width: around.width + wrapX * 2,
      height: around.height + wrapY * 2,
    });
  }

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
