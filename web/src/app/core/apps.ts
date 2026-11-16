import { SiteIconName } from './site-icons';

export interface SiteApp {
  readonly key: string;
  readonly name: string;
  readonly icon: SiteIconName;
  readonly summary: string;
  readonly url: string | null;
}

export const SITE_APPS: readonly SiteApp[] = [
  {
    key: 'smartiplay',
    name: 'Smarti Play',
    icon: 'smartiplay',
    summary: 'Smartiplay, smart play with an i for ideas: free brain games for kids, no sign-up, works offline.',
    url: 'https://smartiplay.com/',
  },
  {
    key: 'reminder',
    name: 'Reminder',
    icon: 'reminder',
    summary: 'Subscriptions, birthdays, events and lists in one place, with what is coming up next.',
    url: 'https://reminder.su-labs.dev/',
  },
  {
    key: 'spotea',
    name: 'Spotea',
    icon: 'app',
    summary: 'In development.',
    url: null,
  },
];

export const hostOf = (url: string): string => new URL(url).host;
