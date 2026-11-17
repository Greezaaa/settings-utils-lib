import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { SiteIcon } from '../site-icon';

const COPIED_MS = 2000;

/** A small chain link beside a heading that copies the address of its section, so it can be shared on its own */
@Component({
  selector: 'app-section-link',
  imports: [SiteIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-link.html',
  styleUrl: './section-link.scss',
})
export class SectionLink {
  /** The id of the heading or section the link points to */
  readonly target = input.required<string>();
  /** The section's name, read out by screen readers */
  readonly label = input.required<string>();

  private readonly document = inject(DOCUMENT);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly copied = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    const { location, defaultView } = this.document;
    const address = `${location.pathname}${location.search}#${this.target()}`;
    defaultView?.history.replaceState(defaultView.history.state, '', address);
    try {
      await defaultView?.navigator.clipboard.writeText(`${location.origin}${address}`);
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), COPIED_MS);
    } catch {
      this.copied.set(false);
    }
  }
}
