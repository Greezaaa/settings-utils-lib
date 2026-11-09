import { createSuStore, SuReadableStore } from '@su-labs/core';
import { SuDialog, SuDialogConfig, SuDialogOptions } from './dialog.types';

/** Opacity of the dimmed layer when only its colour is given */
const DEFAULT_BACKDROP_OPACITY = 0.5;

const DEFAULTS: SuDialogConfig = {
  acceptLabel: 'OK',
  cancelLabel: 'Cancel',
  backdrop: 'dim',
  dismissible: true,
  size: 'small',
};

/** A dialog waiting for its answer */
interface Pending {
  readonly dialog: SuDialog;
  readonly resolve: (accepted: boolean) => void;
}

/**
 * The dimmed layer's colour for CSS: `transparent` without a backdrop, the colour (black by default) mixed with
 * transparency by the opacity (kept between 0 and 1) when either is given, or null to leave it to the stylesheet
 */
export function suDialogBackdropColor({ backdrop, backdropColor, backdropOpacity }: SuDialogConfig): string | null {
  if (backdrop === 'none') {
    return 'transparent';
  }
  if (backdropColor === undefined && backdropOpacity === undefined) {
    return null;
  }
  const opacity = Math.min(1, Math.max(0, backdropOpacity ?? DEFAULT_BACKDROP_OPACITY));
  return `color-mix(in srgb, ${backdropColor ?? '#000'} ${Math.round(opacity * 100)}%, transparent)`;
}

/**
 * Framework-agnostic dialog manager: shows one dialog at a time (others wait their turn) and answers each `open` with
 * a promise of whether it was accepted. Rendering is left to the app, or to a framework package such as
 * `@su-labs/dialog` for Angular.
 */
export class SuDialogController {
  private defaults = DEFAULTS;
  private readonly queue: Pending[] = [];
  private readonly currentStore = createSuStore<SuDialog | null>(null);

  /** The dialog on screen, or null */
  readonly current: SuReadableStore<SuDialog | null> = this.currentStore.asReadonly();

  /** Changes the defaults of every dialog opened from now on */
  configure(config: SuDialogConfig): void {
    this.defaults = { ...this.defaults, ...config };
  }

  /**
   * Opens a dialog, or queues it behind the one on screen.
   * @returns Whether it was accepted: `true` for the accept (or only) button, `false` for cancel, Escape or a click
   * outside
   */
  open(options: SuDialogOptions): Promise<boolean> {
    const settings = { ...this.defaults, ...options };
    const dialog: SuDialog = {
      id: crypto.randomUUID(),
      title: options.title,
      body: options.body ?? null,
      image: options.image ?? null,
      kind: options.kind ?? 'confirm',
      acceptLabel: settings.acceptLabel ?? 'OK',
      cancelLabel: settings.cancelLabel ?? 'Cancel',
      width: settings.width ?? null,
      size: settings.size ?? 'small',
      height: settings.height ?? null,
      backdrop: settings.backdrop ?? 'dim',
      backdropColor: suDialogBackdropColor(settings),
      dismissible: settings.dismissible ?? true,
      danger: options.danger ?? false,
      cssClass: options.cssClass ?? null,
    };
    return new Promise((resolve) => {
      this.queue.push({ dialog, resolve });
      if (this.queue.length === 1) {
        this.currentStore.set(dialog);
      }
    });
  }

  /** A message with one button; resolves once it's closed */
  async alert(options: Omit<SuDialogOptions, 'kind'>): Promise<void> {
    await this.open({ ...options, kind: 'ok' });
  }

  /** A question with accept and cancel; resolves with whether it was accepted */
  confirm(options: Omit<SuDialogOptions, 'kind'>): Promise<boolean> {
    return this.open({ ...options, kind: 'confirm' });
  }

  /** Closes the dialog on screen with its answer and shows the next one, if any */
  close(accepted: boolean): void {
    const pending = this.queue.shift();
    if (!pending) {
      return;
    }
    pending.resolve(accepted);
    this.currentStore.set(this.queue[0]?.dialog ?? null);
  }

  /** Closes every dialog, as cancelled */
  destroy(): void {
    while (this.queue.length > 0) {
      this.close(false);
    }
  }
}
