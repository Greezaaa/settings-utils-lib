import { guideUrl } from './links';

export interface SiteEnvironment {
  readonly name: string;
  /** The short name on install tabs */
  readonly tab: string;
  readonly detail: string;
  readonly url: string;
}

export const ENVIRONMENTS: readonly SiteEnvironment[] = [
  {
    name: 'React',
    tab: 'React',
    detail: 'useSyncExternalStore, no adapter needed',
    guide: 'react',
  },
  {
    name: 'Vue',
    tab: 'Vue',
    detail: 'One small composable turns stores into refs',
    guide: 'vue',
  },
  {
    name: 'Svelte',
    tab: 'Svelte',
    detail: 'Stores work with the $ syntax directly',
    guide: 'svelte',
  },
  {
    name: 'Angular',
    tab: 'Angular',
    detail: 'Services with signals, one package per utility',
    guide: 'angular',
  },
  {
    name: 'Vanilla JavaScript',
    tab: 'Vanilla JS',
    detail: 'With a bundler or straight from a CDN',
    guide: 'vanilla',
  },
  {
    name: 'Node and SSR',
    tab: 'Node',
    detail: 'Safe to import on the server',
    guide: 'node',
  },
].map(({ guide, ...environment }) => ({
  ...environment,
  url: guideUrl(guide),
}));
