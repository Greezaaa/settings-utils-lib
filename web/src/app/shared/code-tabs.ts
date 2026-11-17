import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CodeBlock } from './code-block';

export interface CodeTabVersion {
  readonly label: string;
  readonly code: string;
}

export interface CodeTab {
  readonly label: string;
  readonly code: string;
  /** A short line under the code */
  readonly note?: string;
  readonly link?: { readonly label: string; readonly url: string };
  /** Other versions of the same code, e.g. older framework majors, revealed on request */
  readonly versions?: readonly CodeTabVersion[];
  /** The name of the button that reveals the versions */
  readonly versionsLabel?: string;
}

@Component({
  selector: 'app-code-tabs',
  imports: [CodeBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-tabs.html',
  styleUrl: './code-tabs.scss',
})
export class CodeTabs {
  readonly tabs = input.required<readonly CodeTab[]>();

  protected readonly selectedIndex = signal(0);
  protected readonly selected = computed(() => this.tabs()[this.selectedIndex()]);
  protected readonly versionIndex = signal<number | null>(null);
  /** The tab whose versions slide open while it is selected, kept while they slide closed */
  protected readonly versionTab = computed(() => this.tabs().find((tab) => (tab.versions?.length ?? 0) > 0));
  protected readonly versionsOpen = computed(() => (this.selected().versions?.length ?? 0) > 0);
  protected readonly code = computed(() => {
    const tab = this.selected();
    const index = this.versionIndex();
    return (index === null ? undefined : tab.versions?.[index]?.code) ?? tab.code;
  });

  protected select(index: number): void {
    this.selectedIndex.set(index);
    this.versionIndex.set(null);
  }

  protected chooseVersion(index: number): void {
    this.versionIndex.update((current) => (current === index ? null : index));
  }
}
