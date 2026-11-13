import { guideUrl } from './links';

export interface SiteEnvironment {
  readonly name: string;
  readonly detail: string;
  readonly url: string;
}

export const ENVIRONMENTS: readonly SiteEnvironment[] = [
  {
    name: 'React',
    detail: 'useSyncExternalStore, no adapter needed',
    guide: 'react',
  },
  {
    name: 'Vue',
    detail: 'One small composable turns stores into refs',
    guide: 'vue',
  },
  {
    name: 'Svelte',
    detail: 'Stores work with the $ syntax directly',
    guide: 'svelte',
  },
  {
    name: 'Angular',
    detail: 'Services with signals, one package per utility',
    guide: 'angular',
  },
  {
    name: 'Vanilla JavaScript',
    detail: 'With a bundler or straight from a CDN',
    guide: 'vanilla',
  },
  {
    name: 'Node and SSR',
    detail: 'Safe to import on the server',
    guide: 'node',
  },
].map(({ guide, ...environment }) => ({
  ...environment,
  url: guideUrl(guide),
}));
