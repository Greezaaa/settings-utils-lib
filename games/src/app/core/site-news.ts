import { computed, inject, Injectable, signal } from '@angular/core';
import { GamesApi, parseNewsItem } from './games-api';
import { readStored, writeStored } from './site-storage';
import { groupNews, latestPrivacyVersion, latestPublished, latestVersion, NewsItem } from './site-updates';

const NEWS_STORAGE = 'news';

@Injectable({ providedIn: 'root' })
export class SiteNews {
  private readonly api = inject(GamesApi);
  private readonly items = signal<readonly NewsItem[]>([]);
  private loading: Promise<void> | null = null;

  readonly updates = computed(() => groupNews(this.items()));
  readonly latestVersion = computed(() => latestVersion(this.updates()));
  readonly latestPrivacyVersion = computed(() => latestPrivacyVersion(this.updates()));
  readonly latestPublished = computed(() => latestPublished(this.updates()));

  ready(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  async refresh(): Promise<void> {
    this.loading = this.load();
    await this.loading;
  }

  private async load(): Promise<void> {
    const news = await this.api.news();
    if (news) {
      this.items.set(news);
      writeStored(NEWS_STORAGE, news.map(toStored));
      return;
    }
    const stored = readStored(NEWS_STORAGE);
    this.items.set(Array.isArray(stored) ? stored.flatMap((item: unknown) => parseNewsItem(item)) : []);
  }
}

const toStored = ({ version, published, privacy, change }: NewsItem): object => ({
  version,
  published,
  privacy,
  kind: change.kind,
  game: change.game ?? null,
  feature: change.feature ?? null,
  text: change.text,
});
