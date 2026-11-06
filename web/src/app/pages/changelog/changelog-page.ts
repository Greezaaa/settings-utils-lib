import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { changelogResource } from '../../changelog/changelog.resource';
import { ReleaseList } from '../../changelog/release-list';
import { changelogUrl, registryLink } from '../../core/links';
import { ALL_PACKAGES, CORE_PACKAGE, findPackage } from '../../core/packages';

/**
 * Changelog of every package, read live from CHANGELOG.md on GitHub.
 * Nothing to update here when a release ships: pushing the CHANGELOG.md is enough.
 */
@Component({
  selector: 'app-changelog-page',
  imports: [ReleaseList, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './changelog-page.html',
  styleUrl: './changelog-page.scss',
})
export class ChangelogPage {
  /** Package folder from the URL, e.g. /changelog/theme */
  readonly slug = input<string>(CORE_PACKAGE.slug);

  protected readonly packages = ALL_PACKAGES;
  protected readonly selected = computed(() => findPackage(this.slug()) ?? CORE_PACKAGE);
  protected readonly changelog = changelogResource(() => this.selected().slug);
  protected readonly links = computed(() => ({
    github: changelogUrl(this.selected().slug),
    registry: registryLink(this.selected()),
  }));
}
