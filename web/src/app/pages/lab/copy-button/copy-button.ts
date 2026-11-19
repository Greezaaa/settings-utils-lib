import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';

const RESET_AFTER_MS = 1600;

@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './copy-button.html',
  styleUrl: './copy-button.scss',
})
export class CopyButton {
  readonly text = input.required<string>();

  protected readonly copied = signal(false);
  private resetTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.resetTimer));
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.text());
    } catch {
      return;
    }
    this.copied.set(true);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set(false), RESET_AFTER_MS);
  }
}
