import { signal } from '@angular/core';
import { ADMIN_PAGE_SIZE } from '../../core/admin-api';

export class PagedList<T> {
  readonly items = signal<readonly T[]>([]);
  readonly isLoading = signal(true);
  readonly hasMore = signal(false);
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

  replace(item: T, next: T): void {
    this.items.update(items => items.map(other => (other === item ? next : other)));
  }

  remove(item: T): void {
    this.items.update(items => items.filter(other => other !== item));
  }
}
