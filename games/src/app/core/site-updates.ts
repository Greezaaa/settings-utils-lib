import { LanguageId } from '../i18n/site-messages';
import { FeatureId } from './features';
import { GameSlug } from './games';

export const UPDATE_KINDS = [
  'game',
  'language',
  'settings',
  'feature',
  'privacy',
] as const;
export type UpdateKind = (typeof UPDATE_KINDS)[number];

export const UPDATE_KIND_TAGS: Readonly<Record<UpdateKind, string>> = {
  game: 'tag-blue',
  language: 'tag-yellow',
  settings: 'tag-purple',
  feature: 'tag-green',
  privacy: 'tag-red',
};

export interface UpdateChange {
  readonly kind: UpdateKind;
  readonly text: Readonly<Record<LanguageId, string>>;
  readonly game?: GameSlug;
  readonly feature?: FeatureId;
}

export interface SiteUpdate {
  readonly version: number;
  readonly published: string;
  /** The update changes what the site saves; visitors see the privacy notice again */
  readonly privacy?: boolean;
  readonly changes: readonly UpdateChange[];
}

export const LAST_SEEN_STORAGE = 'last-seen-version';

export interface NewsItem {
  readonly version: number;
  readonly published: string;
  readonly privacy: boolean;
  readonly change: UpdateChange;
}

export function groupNews(items: readonly NewsItem[]): SiteUpdate[] {
  const byVersion = new Map<number, NewsItem[]>();
  for (const item of items) {
    byVersion.set(item.version, [...(byVersion.get(item.version) ?? []), item]);
  }
  return [...byVersion.entries()]
    .sort(([first], [second]) => first - second)
    .map(([version, group]) => ({
      version,
      published: group[0].published,
      privacy: group.some(({ privacy }) => privacy) || undefined,
      changes: group.map(({ change }) => change),
    }));
}

export const latestVersion = (updates: readonly SiteUpdate[]): number =>
  Math.max(0, ...updates.map(({ version }) => version));

export const latestPrivacyVersion = (updates: readonly SiteUpdate[]): number =>
  Math.max(1, ...updates.filter(({ privacy }) => privacy).map(({ version }) => version));

export const latestPublished = (updates: readonly SiteUpdate[]): string | null =>
  updates.reduce<SiteUpdate | null>((latest, update) => (!latest || update.version > latest.version ? update : latest), null)
    ?.published ?? null;

export interface DatedChange {
  readonly change: UpdateChange;
  readonly version: number;
  readonly published: string;
}

export function recentChanges(updates: readonly SiteUpdate[]): DatedChange[] {
  return [...updates]
    .sort((first, second) => second.version - first.version)
    .flatMap(({ version, published, changes }) =>
      changes.map(change => ({ change, version, published }))
    );
}

export function formatMoment(iso: string, language: LanguageId): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}
