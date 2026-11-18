import { createSuStore, SuReadableStore, SuWritableStore } from '@su-labs/core';
import { SuTooltipOptions, SuTooltipState } from './tooltip.types';

/**
 * Framework-agnostic tooltip: whether it's open, with the delays that keep it from flashing while the pointer only
 * passes over the trigger, and from closing while it moves from the trigger to the tooltip. Placing it is up to
 * `suTooltipPosition` and `suTooltipIconPosition`; rendering is left to the app, or to a framework package such as
 * `@su-labs/tooltip` for Angular.
 */
export class SuTooltipController {
  private showDelay: number;
  private hideDelay: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly stateStore: SuWritableStore<SuTooltipState>;

  /** Whether the tooltip is open */
  readonly state: SuReadableStore<SuTooltipState>;

  constructor({ showDelay = 300, hideDelay = 100 }: SuTooltipOptions = {}) {
    this.showDelay = showDelay;
    this.hideDelay = hideDelay;
    this.stateStore = createSuStore<SuTooltipState>({ open: false });
    this.state = this.stateStore.asReadonly();
  }

  /** Changes the delays; a wait already started keeps its own */
  setDelays({ showDelay, hideDelay }: SuTooltipOptions): void {
    this.showDelay = showDelay ?? this.showDelay;
    this.hideDelay = hideDelay ?? this.hideDelay;
  }

  /** Opens after `showDelay`, e.g. when the pointer enters the trigger; a pending `hide` is called off */
  show(): void {
    this.after(this.showDelay, true);
  }

  /** Closes after `hideDelay`, e.g. when the pointer leaves; a `show` or `open` in the meantime keeps it open */
  hide(): void {
    this.after(this.hideDelay, false);
  }

  /** Opens now */
  open(): void {
    this.setOpen(true);
  }

  /** Closes now */
  close(): void {
    this.setOpen(false);
  }

  /** Opens or closes now */
  toggle(): void {
    this.setOpen(!this.stateStore.get().open);
  }

  /** Opens or closes now, calling off any wait */
  setOpen(open: boolean): void {
    this.cancel();
    if (open !== this.stateStore.get().open) {
      this.stateStore.set({ open });
    }
  }

  /** Calls off a pending `show` or `hide`, e.g. when the tooltip is removed */
  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private after(delay: number, open: boolean): void {
    this.cancel();
    if (open === this.stateStore.get().open) {
      return;
    }
    if (delay <= 0) {
      this.setOpen(open);
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      this.setOpen(open);
    }, delay);
  }
}
