import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CodeBlock } from './code-block';

export interface CodeTab {
  readonly label: string;
  readonly code: string;
}

@Component({
  selector: 'app-code-tabs',
  imports: [CodeBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist">
      @for (tab of tabs(); track tab.label; let index = $index) {
        <button
          type="button"
          role="tab"
          class="tab"
          [attr.aria-selected]="index === selectedIndex()"
          (click)="selectedIndex.set(index)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
    @if (selected(); as tab) {
      <app-code-block [code]="tab.code" />
    }
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .tabs {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 0.75rem;
      overflow-x: auto;
    }

    .tab {
      background: none;
      border: 0;
      border-bottom: 1px solid transparent;
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      font-size: 0.875rem;
      padding: 0.25rem 0;
      white-space: nowrap;
    }

    .tab[aria-selected='true'] {
      border-bottom-color: var(--heading);
      color: var(--heading);
    }
  `,
})
export class CodeTabs {
  readonly tabs = input.required<readonly CodeTab[]>();

  protected readonly selectedIndex = signal(0);
  protected readonly selected = computed(() => this.tabs()[this.selectedIndex()]);
}
