import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChildren, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { changelogResource } from '../changelog/changelog.resource';
import { ReleaseList } from '../changelog/release-list';
import { ENVIRONMENTS } from '../core/environments';
import { changelogUrl, npmUrl, readmeUrl } from '../core/links';
import { OLDER_ANGULAR_MAJORS, SuUtility } from '../core/packages';
import { CodeBlock } from './code-block';
import { CodeTab, CodeTabs } from './code-tabs';
import { NpmDownloadsTag } from './npm-downloads-tag';
import { PageFeatureExample } from './page-feature';
import { Reveal } from './reveal';
import { SectionLink } from './section-link/section-link';

@Component({
  selector: 'app-utility-page',
  imports: [CodeBlock, CodeTabs, NgTemplateOutlet, NpmDownloadsTag, ReleaseList, RouterLink, Reveal, SectionLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './utility-page.html',
  styleUrl: './utility-page.scss',
})
export class UtilityPage {
  readonly utility = input.required<SuUtility>();
  readonly usage = input.required<readonly CodeTab[]>();
  /** The first line above the features, saying what each live example runs on */
  readonly featuresLead = input('Each feature on a small table of its own.');
  /** Features shown one by one under the demo, each beside its live example, alternating sides */
  protected readonly features = contentChildren(PageFeatureExample);

  protected readonly environments = ENVIRONMENTS;

  protected featureId(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

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
    const tabs = ENVIRONMENTS.map((environment): CodeTab => {
      const isAngular = environment.tab === 'Angular';
      return {
        label: environment.tab,
        code: `npm install ${isAngular ? packageName : '@su-labs/core'}`,
        note: environment.detail,
        link: { label: `${environment.tab} guide`, url: environment.url },
        ...(isAngular
          ? {
              versionsLabel: 'Older Angular',
              versions: OLDER_ANGULAR_MAJORS.map((major) => ({
                label: `Angular ${major}`,
                code: `npm install ${packageName}@ng${major}`,
              })),
            }
          : {}),
      };
    });
    const angularFirst = [...tabs].sort((a, b) => Number(b.label === 'Angular') - Number(a.label === 'Angular'));
    return coreEntry ? angularFirst : angularFirst.filter((tab) => tab.label === 'Angular');
  });
}
