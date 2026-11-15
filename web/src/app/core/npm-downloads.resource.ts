import { isPlatformBrowser } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { computed, inject, PLATFORM_ID, Signal } from '@angular/core';
import { npmMonthlyDownloadsUrl } from './links';

const readDownloads = (response: unknown): number | null =>
  typeof response === 'object' && response !== null && 'downloads' in response && typeof response.downloads === 'number'
    ? response.downloads
    : null;

/** A package's npm downloads over the last month, fetched in the browser; `null` while loading or when npm fails */
export function npmDownloadsResource(packageName: () => string): Signal<number | null> {
  const inBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const response = httpResource(() => (inBrowser ? npmMonthlyDownloadsUrl(packageName()) : undefined), {
    parse: readDownloads,
  });
  return computed(() => (response.hasValue() ? response.value() : null));
}
