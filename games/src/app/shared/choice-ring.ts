import { DOCUMENT, effect, inject, Injectable } from '@angular/core';
import { MenuAnimation } from '../core/menu-animation';
import { DriftShape } from './drift-shape';

const GROUP = '[role="group"], [role="tablist"]';
const CHOICE = 'button[aria-pressed]';
const PRESSED = 'button[aria-pressed="true"]';

@Injectable({ providedIn: 'root' })
export class ChoiceRing {
  private readonly document = inject(DOCUMENT);
  private readonly menuAnimation = inject(MenuAnimation);
  private readonly shapes = new Map<HTMLElement, DriftShape>();

  constructor() {
    effect(() => {
      if (!this.menuAnimation.isOn()) {
        this.detachAll();
      }
    });
  }

  start(): void {
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
    this.document.addEventListener('pointerdown', (event) => this.shapeFor(event.target));
  }

  private groupOf(target: EventTarget | null): HTMLElement | null {
    const group = target instanceof Element ? target.closest<HTMLElement>(GROUP) : null;
    return group?.querySelector(CHOICE) ? group : null;
  }

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
    for (const old of this.shapes.keys()) {
      if (!old.isConnected) {
        this.detach(old);
      }
    }
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
