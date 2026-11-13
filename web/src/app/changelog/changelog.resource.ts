import { isPlatformBrowser } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { computed, inject, PLATFORM_ID, Signal } from '@angular/core';
import { changelogRawUrl } from '../core/links';
import { ChangelogRelease, latestRelease, parseChangelog } from './changelog.parser';

export interface ChangelogResource {
  readonly releases: Signal<ChangelogRelease[]>;
  readonly latest: Signal<ChangelogRelease | null>;
  readonly isLoading: Signal<boolean>;
  readonly failed: Signal<boolean>;
}

export function changelogResource(slug: () => string): ChangelogResource {
  const inBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const file = httpResource.text(() => (inBrowser ? changelogRawUrl(slug()) : undefined));
  const releases = computed(() => (file.hasValue() ? parseChangelog(file.value()) : []));

  return {
    releases,
    latest: computed(() => latestRelease(releases())),
    isLoading: computed(() => !inBrowser || file.isLoading()),
    failed: computed(() => file.error() !== undefined),
  };
}
