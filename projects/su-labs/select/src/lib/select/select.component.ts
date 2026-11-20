import { DOCUMENT } from '@angular/common';
import { afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, input, model, output, signal, untracked, viewChild } from '@angular/core';
import { SU_SELECT_LABELS, SuSelectController, suSelectGroups, SuSelectLabels, SuSelectMove, SuSelectOption } from '@su-labs/core/select';
import { suTooltipPosition } from '@su-labs/core/tooltip';

let nextSelectId = 0;

const MOVES: Readonly<Record<string, SuSelectMove>> = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  Home: 'first',
  End: 'last',
  PageDown: 'last',
  PageUp: 'first',
};

/**
 * A select over `SuSelectController` from `@su-labs/core/select`, with its own styled list instead of the browser's
 * popup: `<su-lib-select [options]="sizes" [(value)]="size" />`. The trigger is a `combobox` button and the list a
 * `listbox` in the top layer (`popover`), placed below the trigger or above it when there's no room. It follows the
 * WAI-ARIA select-only combobox pattern: arrows, Home and End, type-ahead, Enter or Space to choose, Escape to close
 * and Tab to choose and move on. With `searchable`, a search field at the top of the list filters the options.
 */
const CLOSING_ANIMATION = /su-select-out(-above)?$/;

@Component({
  selector: 'su-lib-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  host: {
    class: 'su-select',
    '[class.su-select-open]': 'open()',
    '[class.su-select-disabled]': 'disabled()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class SuSelectComponent<T> {
  /** The choices: `{ value, label, disabled?, group? }`; options sharing a `group` should follow one another */
  readonly options = input<readonly SuSelectOption<T>[]>([]);
  /** The chosen value, or `null` while nothing is chosen */
  readonly value = model<T | null>(null);
  /** Whether the list is open; setting it opens or closes it */
  readonly open = model(false);
  /** Set once focus has left the select, for forms that show errors after the user moved on */
  readonly touched = model(false);
  /** A search field at the top of the list that filters the options @default false */
  readonly searchable = input(false, { transform: booleanAttribute });
  /** Can't be opened or focused @default false */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Opens with a short fade and slide; off when the user prefers less motion @default true */
  readonly animated = input(true, { transform: booleanAttribute });
  /** Shown while nothing is chosen @default labels.placeholder */
  readonly placeholder = input<string>();
  /** The select's name for screen readers, when no `<label>` wraps it and no `ariaLabelledby` names it */
  readonly ariaLabel = input<string>();
  /** The id of the element that names the select */
  readonly ariaLabelledby = input<string>();
  /** Texts to replace, e.g. in the page's language */
  readonly labels = input<Partial<SuSelectLabels>>({});
  /** The user chose an option (never emitted for a value set from outside): its value */
  readonly chosen = output<T>();

  protected readonly id = `su-select-${nextSelectId++}`;
  protected readonly listId = `${this.id}-list`;
  protected readonly texts = computed<SuSelectLabels>(() => ({
    ...SU_SELECT_LABELS,
    ...this.labels(),
  }));

  private readonly controller = new SuSelectController<T>();
  protected readonly state = signal(this.controller.state.get());
  protected readonly groups = computed(() =>
    suSelectGroups(this.state().visible)
  );
  protected readonly selected = computed(() => {
    this.state();
    return this.controller.selected;
  });
  protected readonly activeId = computed(() => {
    const { open, active } = this.state();
    return open && active >= 0 ? this.optionId(active) : null;
  });

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  constructor() {
    let previous = this.controller.state.get();
    const unsubscribe = this.controller.state.subscribe(state => {
      this.state.set(state);
      if (state.value !== previous.value) {
        this.value.set(state.value);
      }
      if (state.open !== previous.open) {
        this.open.set(state.open);
      }
      previous = state;
    });
    inject(DestroyRef).onDestroy(unsubscribe);

    effect(() => {
      const options = this.options();
      untracked(() => this.controller.setOptions(options));
    });

    effect(() => {
      const value = this.value();
      untracked(() => this.controller.setValue(value));
    });

    effect(() => {
      const open = this.open() && !this.disabled();
      untracked(() =>
        open ? this.controller.open() : this.controller.close()
      );
    });

    effect(onCleanup => {
      if (!this.state().open) {
        return;
      }
      const onPointerDown = (event: PointerEvent) =>
        this.onDocumentPointerDown(event);
      const onMove = () => this.follow();
      const view = this.document.defaultView;
      this.document.addEventListener('pointerdown', onPointerDown);
      view?.addEventListener('scroll', onMove, true);
      view?.addEventListener('resize', onMove);
      onCleanup(() => {
        this.document.removeEventListener('pointerdown', onPointerDown);
        view?.removeEventListener('scroll', onMove, true);
        view?.removeEventListener('resize', onMove);
      });
    });

    afterRenderEffect(() => {
      const open = this.state().open;
      untracked(() => (open ? this.reveal() : this.conceal()));
    });

    afterRenderEffect(() => {
      const id = this.activeId();
      const option = id ? this.document.getElementById(id) : null;
      if (option && typeof option.scrollIntoView === 'function') {
        option.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  /** Moves focus to the trigger */
  focus(): void {
    this.trigger().nativeElement.focus();
  }

  protected optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  protected isSelected(option: SuSelectOption<T>): boolean {
    return option === this.selected();
  }

  protected toggle(): void {
    if (!this.disabled()) {
      this.controller.toggle();
    }
  }

  protected choose(index: number): void {
    this.byUser(() => this.pick(index));
  }

  protected activate(index: number): void {
    if (index !== this.state().active) {
      this.controller.activate(index);
    }
  }

  protected onSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.controller.search(event.target.value);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.ctrlKey || event.metaKey) {
      return;
    }
    this.byUser(() =>
      this.state().open
        ? this.onOpenKeydown(event)
        : this.onClosedKeydown(event)
    );
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) {
      return;
    }
    this.controller.close();
    this.touched.set(true);
  }

  private onClosedKeydown(event: KeyboardEvent): void {
    const move = MOVES[event.key];
    if (move || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.controller.open();
      if (move === 'first' || move === 'last') {
        this.controller.move(move);
      }
      return;
    }
    if (isPrintable(event)) {
      event.preventDefault();
      this.controller.typeAhead(event.key);
    }
  }

  private onOpenKeydown(event: KeyboardEvent): void {
    const searching = this.searchable();
    const move = MOVES[event.key];
    if (event.key === 'ArrowUp' && event.altKey) {
      event.preventDefault();
      this.pick(this.state().active);
    } else if (
      move &&
      !(searching && (event.key === 'Home' || event.key === 'End'))
    ) {
      event.preventDefault();
      this.controller.move(move);
    } else if (event.key === 'Enter' || (event.key === ' ' && !searching)) {
      event.preventDefault();
      this.pick(this.state().active);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.controller.close();
      this.focus();
    } else if (event.key === 'Tab') {
      this.controller.choose();
      this.controller.close();
    } else if (!searching && isPrintable(event)) {
      event.preventDefault();
      this.controller.typeAhead(event.key);
    }
  }

  private pick(index: number): void {
    if (this.controller.choose(index)) {
      this.focus();
    }
  }

  private byUser(action: () => void): void {
    const before = this.controller.state.get().value;
    action();
    const after = this.controller.state.get().value;
    if (after !== null && after !== before) {
      this.chosen.emit(after);
    }
  }

  private onDocumentPointerDown(event: PointerEvent): void {
    const target = event.target;
    if (
      !(target instanceof Node) ||
      !this.host.nativeElement.contains(target)
    ) {
      this.controller.close();
    }
  }

  private reveal(): void {
    const panel = this.panel().nativeElement;
    panel.classList.remove('su-select-closing');
    panel.classList.add('su-select-shown');
    if (
      typeof panel.showPopover === 'function' &&
      !panel.matches(':popover-open')
    ) {
      panel.showPopover();
    }
    this.place();
    const search = this.search()?.nativeElement;
    if (search) {
      search.value = '';
      search.focus();
    }
  }

  private conceal(): void {
    const panel = this.panel().nativeElement;
    if (!panel.classList.contains('su-select-shown')) {
      return;
    }
    panel.classList.add('su-select-closing');
    const animation =
      this.document.defaultView?.getComputedStyle(panel).animationName ?? '';
    if (!CLOSING_ANIMATION.test(animation)) {
      this.hide(panel);
      return;
    }
    panel.addEventListener(
      'animationend',
      () => {
        if (panel.classList.contains('su-select-closing')) {
          this.hide(panel);
        }
      },
      { once: true }
    );
  }

  private hide(panel: HTMLElement): void {
    panel.classList.remove('su-select-shown', 'su-select-closing');
    if (
      typeof panel.hidePopover === 'function' &&
      panel.matches(':popover-open')
    ) {
      panel.hidePopover();
    }
  }

  private follow(): void {
    const trigger = this.trigger().nativeElement.getBoundingClientRect();
    const height = this.document.defaultView?.innerHeight ?? 0;
    if (trigger.bottom <= 0 || trigger.top >= height) {
      this.controller.close();
      return;
    }
    this.place();
  }

  private place(): void {
    if (!this.state().open) {
      return;
    }
    const panel = this.panel().nativeElement;
    const trigger = this.trigger().nativeElement.getBoundingClientRect();
    const view = this.document.defaultView;
    panel.style.minWidth = `${trigger.width}px`;
    const position = suTooltipPosition(
      trigger,
      { width: panel.offsetWidth, height: panel.offsetHeight },
      {
        placement: 'bottom-start',
        offset: 4,
        viewport: {
          width: this.document.documentElement.clientWidth,
          height: view?.innerHeight ?? 0,
        },
        rtl:
          view?.getComputedStyle(this.host.nativeElement).direction === 'rtl',
      }
    );
    panel.dataset['side'] = position.side;
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
  }
}

function isPrintable(event: KeyboardEvent): boolean {
  return event.key.length === 1 && event.key !== ' ' && !event.altKey;
}
