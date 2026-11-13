import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { changelogResource } from '../changelog/changelog.resource';
import { ReleaseList } from '../changelog/release-list';
import { ENVIRONMENTS } from '../core/environments';
import { changelogUrl, npmUrl, readmeUrl } from '../core/links';
import { SuUtility } from '../core/packages';
import { CodeTab, CodeTabs } from './code-tabs';
import { Reveal } from './reveal';

@Component({
  selector: 'app-utility-page',
  imports: [CodeTabs, ReleaseList, RouterLink, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './utility-page.html',
  styleUrl: './utility-page.scss',
})
export class UtilityPage {
  readonly utility = input.required<SuUtility>();
  readonly usage = input.required<readonly CodeTab[]>();

  protected readonly environments = ENVIRONMENTS;

  protected readonly changelog = changelogResource(() => this.utility().slug);
  protected readonly latest = computed(() => {
    const release = this.changelog.latest();
    return release ? [release] : [];
  });

  protected readonly links = computed(() => {
    const { packageName, slug } = this.utility();
    return {
      npm: npmUrl(packageName),
      readme: readmeUrl(slug),
      changelog: changelogUrl(slug),
    };
  });

  protected readonly install = computed<CodeTab[]>(() => {
    const { packageName, coreEntry } = this.utility();
    const angular = { label: 'Angular', code: `npm install ${packageName}` };
    return coreEntry ? [angular, { label: 'Any framework', code: 'npm install @su-labs/core' }] : [angular];
  });
}
