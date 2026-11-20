import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CodeTab, CodeTabs } from '../code-tabs';
import type { DemoName } from './demo-sources';

@Component({
  selector: 'app-demo-block',
  imports: [CodeTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo-block.html',
  styleUrl: './demo-block.scss',
})
export class DemoBlock {
  readonly name = input.required<DemoName>();
  readonly heading = input.required<string>();
  readonly hint = input('');

  protected readonly tabs = signal<readonly CodeTab[] | null>(null);

  protected async loadCode(event: Event): Promise<void> {
    if (event.target instanceof HTMLDetailsElement && event.target.open && !this.tabs()) {
      const { DEMO_SOURCES } = await import('./demo-sources');
      this.tabs.set(DEMO_SOURCES[this.name()]);
    }
  }
}
