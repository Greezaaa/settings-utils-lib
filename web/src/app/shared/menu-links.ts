import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { suTableDropIndex } from '@su-labs/core/table';
import { SiteMenuLink } from '../core/menu';
import { MenuOrder } from '../core/menu-order';
import { SiteIcon } from './site-icon';

/** A link being dragged by its handle */
interface DragState {
  readonly from: number;
  readonly to: number;
  readonly startY: number;
  readonly offsetY: number;
  readonly height: number;
  readonly middles: readonly number[];
}

/**
 * One menu section's links: as a list with names, or as a rail of icons (names in tooltips). While customising, each
 * link has a handle to drag it, or to move it with the up and down arrows; the order is saved by `MenuOrder`.
 */
@Component({
  selector: 'app-menu-links',
  imports: [RouterLink, RouterLinkActive, SiteIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-links.html',
  styleUrl: './menu-links.scss',
})
export class MenuLinks {
  readonly sectionId = input.required<string>();
  readonly links = input.required<readonly SiteMenuLink[]>();
  /** Icons only, with the names in tooltips */
  readonly rail = input(false);
  readonly customising = input(false);

  private readonly menuOrder = inject(MenuOrder);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly focusKey = signal<string | null>(null);

  protected readonly drag = signal<DragState | null>(null);
  protected readonly announcement = signal('');

  constructor() {
    afterRenderEffect(() => {
      const key = this.focusKey();
      this.links();
      const handle = this.host.nativeElement.querySelector<HTMLElement>(`[data-menu-key="${key}"] .menu-handle`);
      if (key && handle && document.activeElement !== handle) {
        handle.focus();
      }
    });
  }

  protected moveLabel(link: SiteMenuLink, index: number): string {
    return `Move ${link.label}, ${index + 1} of ${this.links().length}`;
  }

  /** The up and down arrows move the link one place; Home and End to the top or bottom */
  protected onHandleKey(event: KeyboardEvent, index: number): void {
    const last = this.links().length - 1;
    const targets: Readonly<Record<string, number>> = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in targets)) {
      return;
    }
    event.preventDefault();
    this.moveTo(index, targets[event.key]);
  }

  protected onHandleDown(event: PointerEvent, index: number): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (event.target instanceof Element) {
      event.target.setPointerCapture(event.pointerId);
    }
    const items = [...this.host.nativeElement.querySelectorAll('li')].map((item) => item.getBoundingClientRect());
    this.drag.set({
      from: index,
      to: index,
      startY: event.clientY + window.scrollY,
      offsetY: 0,
      height: items[index]?.height ?? 0,
      middles: items.map(({ top, height }) => top + window.scrollY + height / 2),
    });
  }

  protected onHandleMove(event: PointerEvent): void {
    const drag = this.drag();
    if (!drag) {
      return;
    }
    const pointerY = event.clientY + window.scrollY;
    this.drag.set({
      ...drag,
      to: suTableDropIndex(pointerY, drag.middles, drag.from),
      offsetY: pointerY - drag.startY,
    });
  }

  protected onHandleUp(): void {
    const drag = this.drag();
    this.drag.set(null);
    if (drag) {
      this.moveTo(drag.from, drag.to);
    }
  }

  protected cancelDrag(): void {
    this.drag.set(null);
  }

  /** The dragged link follows the pointer, and the links it passes slide aside to open its place */
  protected dragTransform(index: number): string | null {
    const drag = this.drag();
    if (!drag) {
      return null;
    }
    if (index === drag.from) {
      return `translateY(${drag.offsetY}px)`;
    }
    const slidesUp = index > drag.from && index <= drag.to;
    const slidesDown = index < drag.from && index >= drag.to;
    return slidesUp || slidesDown ? `translateY(${slidesUp ? -drag.height : drag.height}px)` : null;
  }

  private moveTo(from: number, to: number): void {
    const links = this.links();
    const target = Math.max(0, Math.min(to, links.length - 1));
    const link = links[from];
    if (!link || target === from) {
      return;
    }
    this.menuOrder.move(this.sectionId(), from, target);
    this.focusKey.set(link.key);
    this.announcement.set(`${link.label} moved to ${target + 1} of ${links.length}`);
  }
}
