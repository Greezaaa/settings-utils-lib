import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { npmUrl } from '../core/links';
import { npmDownloadsResource } from '../core/npm-downloads.resource';

const SHORT_COUNT = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const FULL_COUNT = new Intl.NumberFormat('en');

@Component({
  selector: 'app-npm-downloads-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './npm-downloads-tag.html',
  styleUrl: './npm-downloads-tag.scss',
})
export class NpmDownloadsTag {
  readonly packageName = input.required<string>();

  protected readonly downloads = npmDownloadsResource(() => this.packageName());
  protected readonly link = computed(() => npmUrl(this.packageName()));
  protected readonly shortCount = computed(() => SHORT_COUNT.format(this.downloads() ?? 0));
  protected readonly label = computed(() => `${FULL_COUNT.format(this.downloads() ?? 0)} downloads last month on npm`);
}
