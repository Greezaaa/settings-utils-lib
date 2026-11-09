import { Injectable, OnDestroy, signal } from '@angular/core';
import { SuDialog, SuDialogConfig, SuDialogController, SuDialogOptions } from '@su-labs/core/dialog';

/**
 * Angular service for dialogs: a thin wrapper around the framework-agnostic `SuDialogController` from
 * `@su-labs/core/dialog` that exposes the dialog on screen as a signal. Put `<su-lib-dialog />` once in the app's
 * shell to show them.
 */
@Injectable({ providedIn: 'root' })
export class SuDialogService implements OnDestroy {
  private readonly controller = new SuDialogController();
  private readonly currentDialog = signal<SuDialog | null>(this.controller.current.get());
  private readonly unsubscribe = this.controller.current.subscribe((dialog) => this.currentDialog.set(dialog));

  /** The dialog on screen, or null */
  readonly current = this.currentDialog.asReadonly();

  /** Defaults for every dialog from now on, e.g. the button labels in the page's language */
  configure(config: SuDialogConfig): void {
    this.controller.configure(config);
  }

  /**
   * Opens a dialog (or queues it behind the one on screen).
   * @returns Whether it was accepted
   */
  open(options: SuDialogOptions): Promise<boolean> {
    return this.controller.open(options);
  }

  /** A question with accept and cancel buttons; resolves with whether it was accepted */
  confirm(options: Omit<SuDialogOptions, 'kind'>): Promise<boolean> {
    return this.controller.confirm(options);
  }

  /** A message with one button; resolves once it's closed */
  alert(options: Omit<SuDialogOptions, 'kind'>): Promise<void> {
    return this.controller.alert(options);
  }

  /** Closes the dialog on screen with its answer; the component calls it for the buttons, Escape and the backdrop */
  close(accepted: boolean): void {
    this.controller.close(accepted);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.controller.destroy();
  }
}
