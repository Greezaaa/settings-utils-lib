import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';

/** Code sample with a copy button; copying is confirmed with a notification */
@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block">
      <pre><code>{{ code() }}</code></pre>
      <button type="button" class="copy" (click)="copy()" aria-label="Copy code">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <rect x="5" y="5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" />
          <path d="M11 3.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h.5" fill="none" stroke="currentColor" stroke-width="1.6" />
        </svg>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .code-block {
      background: var(--subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      position: relative;
    }

    pre {
      line-height: 1.7;
      margin: 0;
      overflow-x: auto;
      padding: 1rem 3rem 1rem 1rem;
    }

    .copy {
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--muted);
      cursor: pointer;
      display: inline-flex;
      height: 2rem;
      justify-content: center;
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
      width: 2rem;
    }

    .copy:hover {
      color: var(--heading);
    }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();

  private readonly notifications = inject(SuNotificationService);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.notifications.show({ type: 'success', message: 'Copied to clipboard.', duration: 2000 });
    } catch {
      this.notifications.show({ type: 'error', message: 'Copying is blocked in this browser. Select the code instead.' });
    }
  }
}
