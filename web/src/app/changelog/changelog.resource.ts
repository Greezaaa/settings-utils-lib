import { httpResource } from '@angular/common/http';
import { computed, Signal } from '@angular/core';
import { changelogRawUrl } from '../core/links';
import { ChangelogRelease, latestRelease, parseChangelog } from './changelog.parser';

/** A package changelog loaded live from GitHub */
export interface ChangelogResource {
  readonly releases: Signal<ChangelogRelease[]>;
  /** Newest published release, skipping `Unreleased` */
  readonly latest: Signal<ChangelogRelease | null>;
  readonly isLoading: Signal<boolean>;
  readonly failed: Signal<boolean>;
}

/**
 * Load a package's CHANGELOG.md from the `main` branch on GitHub.
 * The site never stores changelogs: pushing to GitHub updates it (GitHub caches raw files for a few minutes).
 * Must be called in an injection context, e.g. a component field initializer.
 * @param slug Package folder under `projects/su-labs`, read reactively.
 */
export function changelogResource(slug: () => string): ChangelogResource {
  const file = httpResource.text(() => changelogRawUrl(slug()));
  const releases = computed(() => (file.hasValue() ? parseChangelog(file.value()) : []));

  return {
    releases,
    latest: computed(() => latestRelease(releases())),
    isLoading: file.isLoading,
    failed: computed(() => file.error() !== undefined),
  };
}
