import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { SuDialogService } from './dialog.service';

/**
 * Shows the dialogs of `SuDialogService`, on the native `<dialog>` element: it sits above the page, keeps keyboard
 * focus inside, and closes with Escape (and a click outside, when the dialog is dismissible) as cancel. The body may
 * be HTML; Angular removes anything unsafe from it. Place it once, e.g. at the end of the app's shell.
 */
@Component({
  selector: 'su-lib-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class SuDialogComponent {
  protected readonly service = inject(SuDialogService);
  protected readonly dialog = this.service.current;
  private readonly element = viewChild.required<ElementRef<HTMLDialogElement>>('element');

  constructor() {
    afterRenderEffect(() => {
      const element = this.element().nativeElement;
      const dialog = this.dialog();
      if (dialog && !element.open) {
        element.showModal();
      } else if (!dialog && element.open) {
        element.close();
      }
    });
  }

  /** Escape: the browser would close the dialog by itself; it closes as cancel only when dismissible */
  protected onCancel(event: Event): void {
    event.preventDefault();
    if (this.dialog()?.dismissible) {
      this.service.close(false);
    }
  }

  /** A click on the dialog element itself (not its content) is a click on the backdrop around it */
  protected onClick(event: MouseEvent): void {
    if (event.target === this.element().nativeElement && this.dialog()?.dismissible) {
      this.service.close(false);
    }
  }
}
