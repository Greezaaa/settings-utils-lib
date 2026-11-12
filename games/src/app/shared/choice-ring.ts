import { DOCUMENT, effect, inject, Injectable } from '@angular/core';
import { MenuAnimation } from '../core/menu-animation';
import { DriftShape } from './drift-shape';

/** Groups of choice buttons, one pressed at a time, and their buttons */
const GROUP = '[role="group"], [role="tablist"]';
const CHOICE = 'button[aria-pressed]';
const PRESSED = 'button[aria-pressed="true"]';

/**
 * The menu's shape (DriftShape) for every group of choice buttons on the site (a `role="group"` or tab list whose
 * buttons use `aria-pressed`), while the animated menu is on: it rests behind the chosen button in the group's pressed
 * colour, drifts after the pointer and fills the button it reaches, and goes over to a newly chosen one. One listener
 * for the whole site, so every group gets it without changing its template; a group gets its shape the first time the
 * pointer or focus comes in. Never for visitors whose device asks for less motion. Its look is `.choice-ring` in
 * styles.scss.
 */
@Injectable({ providedIn: 'root' })
export class ChoiceRing {
  private readonly document = inject(DOCUMENT);
  private readonly menuAnimation = inject(MenuAnimation);
  private readonly shapes = new Map<HTMLElement, DriftShape>();

  constructor() {
    // Turned off in the settings: every group goes back to its own look
    effect(() => {
      if (!this.menuAnimation.isOn()) {
        this.detachAll();
      }
    });
  }

  /** Starts listening; in the browser only, once */
  start(): void {
    // Another theme (the site's, or a game board's colours) gives the buttons other colours: the shapes take them up
    // again the next time they're needed
    new MutationObserver(() => this.detachAll()).observe(this.document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-theme-scheme'],
      subtree: true,
    });
    this.document.addEventListener('pointermove', (event) => this.shapeFor(event.target)?.pointer(event));
    this.document.addEventListener('pointerout', (event) => {
      const group = this.groupOf(event.target);
      if (group && !(event.relatedTarget instanceof Node && group.contains(event.relatedTarget))) {
        this.shapes.get(group)?.rest();
      }
    });
    this.document.addEventListener('focusin', (event) => this.shapeFor(event.target)?.focus(event));
    this.document.addEventListener('focusout', (event) => {
      const group = this.groupOf(event.target);
      if (group) {
        this.shapes.get(group)?.rest();
      }
    });
    // A tap chooses straight away: the shape is there to drift over
    this.document.addEventListener('pointerdown', (event) => this.shapeFor(event.target));
  }

  private groupOf(target: EventTarget | null): HTMLElement | null {
    const group = target instanceof Element ? target.closest<HTMLElement>(GROUP) : null;
    return group?.querySelector(CHOICE) ? group : null;
  }

  /** The group's shape, made the first time it's needed; none while the animated menu is off */
  private shapeFor(target: EventTarget | null): DriftShape | null {
    const window = this.document.defaultView;
    const group = this.groupOf(target);
    if (
      !window ||
      !group ||
      !this.menuAnimation.isOn() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return null;
    }
    const known = this.shapes.get(group);
    if (known) {
      return known;
    }
    // Groups that left the page (another page, a closed panel) give their shapes up
    for (const old of this.shapes.keys()) {
      if (!old.isConnected) {
        this.detach(old);
      }
    }
    // The shape takes the group's own colours: the chosen button's for the shape, a plain one's for the rest
    const chosen = group.querySelector<HTMLElement>(PRESSED);
    const plain = group.querySelector<HTMLElement>('button[aria-pressed="false"]');
    const chosenStyle = chosen ? window.getComputedStyle(chosen) : null;
    group.style.setProperty('--choice-ring-colour', chosenStyle?.backgroundColor ?? 'var(--button-bg)');
    group.style.setProperty('--choice-ring-text', chosenStyle?.color ?? 'var(--button-text)');
    group.style.setProperty('--choice-ring-radius', chosenStyle?.borderRadius ?? '999px');
    group.style.setProperty(
      '--choice-ring-plain',
      plain ? window.getComputedStyle(plain).color : 'var(--heading)',
    );
    group.classList.add('has-choice-ring');
    const shape = new DriftShape(
      group,
      {
        items: CHOICE,
        current: PRESSED,
        className: 'choice-ring',
        wrapX: 0,
        wrapY: 0,
        isOn: () => this.menuAnimation.isOn(),
      },
      window,
    );
    shape.rest();
    this.shapes.set(group, shape);
    return shape;
  }

  private detachAll(): void {
    [...this.shapes.keys()].forEach((group) => this.detach(group));
  }

  private detach(group: HTMLElement): void {
    this.shapes.get(group)?.destroy();
    this.shapes.delete(group);
    group.classList.remove('has-choice-ring');
    for (const name of ['--choice-ring-colour', '--choice-ring-text', '--choice-ring-radius', '--choice-ring-plain']) {
      group.style.removeProperty(name);
    }
  }
}
