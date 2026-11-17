import { isPlatformBrowser, Location } from '@angular/common';
import { effect, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

const WRITE_DELAY = 300;

export type QueryParams = Readonly<Record<string, string | undefined>>;

export const readQueryParam = (key: string): string | null => inject(ActivatedRoute).snapshot.queryParamMap.get(key);

export const syncQueryParams = (params: () => QueryParams): void => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return;
  }
  const location = inject(Location);
  effect((onCleanup) => {
    const query = Object.entries(params())
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%2C/g, ',')}`)
      .join('&');
    const timer = setTimeout(() => location.replaceState(location.path().split('?')[0], query), WRITE_DELAY);
    onCleanup(() => clearTimeout(timer));
  });
};
