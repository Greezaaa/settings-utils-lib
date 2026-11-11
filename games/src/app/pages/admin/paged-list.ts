import { signal } from '@angular/core';
import { ADMIN_PAGE_SIZE } from '../../core/admin-api';

/**
 * A moderated list loaded a page at a time. A row the moderator moves or deletes leaves the list here instead of the
 * whole list being downloaded again; the next page then starts after the rows still shown.
 */
export class PagedList<T> {
  readonly items = signal<readonly T[]>([]);
  readonly isLoading = signal(true);
  readonly hasMore = signal(false);
  /** Answers to an earlier reload (e.g. before the filter changed) are dropped */
  private generation = 0;

  constructor(private readonly fetchPage: (offset: number) => Promise<T[]>) {}

  async reload(): Promise<void> {
    const generation = ++this.generation;
    this.isLoading.set(true);
    const page = await this.fetchPage(0);
    if (generation === this.generation) {
      this.items.set(page);
      this.hasMore.set(page.length === ADMIN_PAGE_SIZE);
      this.isLoading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    const generation = this.generation;
    const page = await this.fetchPage(this.items().length);
    if (generation === this.generation) {
      this.items.update(items => [...items, ...page]);
      this.hasMore.set(page.length === ADMIN_PAGE_SIZE);
    }
  }

  remove(item: T): void {
    this.items.update(items => items.filter(other => other !== item));
  }
}
