import { createSuStore, SuReadableStore, SuWritableStore } from '@su-labs/core';
import { suSelectFilter, suSelectNormalize } from './select.options';
import { SuSelectMove, SuSelectOption, SuSelectOptions, SuSelectState } from './select.types';

/**
 * Framework-agnostic single select, following the WAI-ARIA listbox pattern: whether the list is open, the chosen
 * value, the search text and the option the keyboard is on, skipping disabled options, with type-ahead. Placing the
 * list is up to `suTooltipPosition` from `@su-labs/core/tooltip`; rendering is left to the app, or to a framework
 * package such as `@su-labs/select` for Angular.
 */
export class SuSelectController<T> {
  private options: readonly SuSelectOption<T>[];
  private readonly typeAheadDelay: number;
  private readonly compare: (a: T, b: T) => boolean;
  private typed = '';
  private typedAt = 0;
  private readonly stateStore: SuWritableStore<SuSelectState<T>>;

  /** Whether it's open, the value, the search text, the matching options and the active one */
  readonly state: SuReadableStore<SuSelectState<T>>;

  constructor({
    options = [],
    value = null,
    typeAheadDelay = 500,
    compare = Object.is,
  }: SuSelectOptions<T> = {}) {
    this.options = options;
    this.typeAheadDelay = typeAheadDelay;
    this.compare = compare;
    this.stateStore = createSuStore<SuSelectState<T>>({
      open: false,
      value,
      query: '',
      visible: options,
      active: -1,
    });
    this.state = this.stateStore.asReadonly();
  }

  /** The chosen option, if the value is one of the options */
  get selected(): SuSelectOption<T> | undefined {
    const { value } = this.stateStore.get();
    return value === null
      ? undefined
      : this.options.find(option => this.compare(option.value, value));
  }

  /** Replaces the options, keeping the search and the active option where it still matches */
  setOptions(options: readonly SuSelectOption<T>[]): void {
    const state = this.stateStore.get();
    const activeOption = state.visible[state.active];
    this.options = options;
    const visible = suSelectFilter(options, state.query);
    const kept = activeOption
      ? visible.findIndex(option =>
          this.compare(option.value, activeOption.value)
        )
      : -1;
    this.update({
      visible,
      active:
        kept >= 0 && !visible[kept].disabled ? kept : this.firstActive(visible),
    });
  }

  /** Sets the value without the user choosing it, e.g. from a form */
  setValue(value: T | null): void {
    const current = this.stateStore.get().value;
    if (
      value === current ||
      (value !== null && current !== null && this.compare(value, current))
    ) {
      return;
    }
    this.update({ value });
  }

  /** Opens the list with the search cleared and the chosen option, or else the first one, active */
  open(): void {
    if (this.stateStore.get().open) {
      return;
    }
    const visible = this.options;
    this.update({
      open: true,
      query: '',
      visible,
      active: this.firstActive(visible),
    });
  }

  /** Closes the list */
  close(): void {
    if (this.stateStore.get().open) {
      this.update({
        open: false,
        query: '',
        visible: this.options,
        active: -1,
      });
    }
  }

  /** Opens or closes the list */
  toggle(): void {
    if (this.stateStore.get().open) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Shows only the options containing `query` and makes the first one that can be chosen active */
  search(query: string): void {
    const visible = suSelectFilter(this.options, query);
    this.update({ query, visible, active: this.enabledFrom(visible, 0, 1) });
  }

  /** Moves the active option, skipping disabled ones; it stays put at either end */
  move(to: SuSelectMove): void {
    const { visible, active } = this.stateStore.get();
    const index = {
      next: () => this.enabledFrom(visible, active + 1, 1),
      previous: () =>
        this.enabledFrom(
          visible,
          active < 0 ? visible.length - 1 : active - 1,
          -1
        ),
      first: () => this.enabledFrom(visible, 0, 1),
      last: () => this.enabledFrom(visible, visible.length - 1, -1),
    }[to]();
    if (index >= 0) {
      this.update({ active: index });
    }
  }

  /** Makes the visible option at `index` active, e.g. under the pointer; a disabled one is ignored */
  activate(index: number): void {
    const option = this.stateStore.get().visible[index];
    if (option && !option.disabled) {
      this.update({ active: index });
    }
  }

  /** Chooses the visible option at `index`, or the active one, and closes the list; false if it can't be chosen */
  choose(index = this.stateStore.get().active): boolean {
    const option = this.stateStore.get().visible[index];
    if (!option || option.disabled) {
      return false;
    }
    this.update({ value: option.value });
    this.close();
    return true;
  }

  /**
   * Type-ahead: keys typed within `typeAheadDelay` of each other make a word, and the next option starting with it
   * becomes active, or is chosen at once while the list is closed, like a native select. Repeating one letter cycles
   * through the options starting with it. Returns whether an option matched.
   */
  typeAhead(key: string, now = Date.now()): boolean {
    this.typed =
      now - this.typedAt > this.typeAheadDelay ? key : this.typed + key;
    this.typedAt = now;
    const state = this.stateStore.get();
    const list = state.open ? state.visible : this.options;
    const current = state.open
      ? state.active
      : this.indexOfValue(list, state.value);
    const repeated = [...this.typed].every(letter => letter === this.typed[0]);
    const word = suSelectNormalize(repeated ? this.typed[0] : this.typed);
    const start = repeated || current < 0 ? current + 1 : current;
    for (let step = 0; step < list.length; step++) {
      const index = (start + step) % list.length;
      const option = list[index];
      if (
        !option.disabled &&
        suSelectNormalize(option.label).startsWith(word)
      ) {
        if (state.open) {
          this.update({ active: index });
        } else {
          this.update({ value: option.value });
        }
        return true;
      }
    }
    return false;
  }

  private firstActive(visible: readonly SuSelectOption<T>[]): number {
    const chosen = this.indexOfValue(visible, this.stateStore.get().value);
    return chosen >= 0 && !visible[chosen].disabled
      ? chosen
      : this.enabledFrom(visible, 0, 1);
  }

  private indexOfValue(
    list: readonly SuSelectOption<T>[],
    value: T | null
  ): number {
    return value === null
      ? -1
      : list.findIndex(option => this.compare(option.value, value));
  }

  private enabledFrom(
    list: readonly SuSelectOption<T>[],
    from: number,
    step: 1 | -1
  ): number {
    for (let index = from; index >= 0 && index < list.length; index += step) {
      if (!list[index].disabled) {
        return index;
      }
    }
    return -1;
  }

  private update(change: Partial<SuSelectState<T>>): void {
    this.stateStore.set({ ...this.stateStore.get(), ...change });
  }
}
