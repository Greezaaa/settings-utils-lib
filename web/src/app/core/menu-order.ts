import { computed, Injectable, signal } from '@angular/core';
import { SITE_MENU, SiteMenuLink, SiteMenuSection } from './menu';
import { readStored, writeStored } from './site-storage';

const MENU_ORDER_STORAGE = 'menu-order';

/** The saved order of each section's links, by key */
type MenuOrderState = Readonly<Record<string, readonly string[]>>;

const isMenuOrder = (value: unknown): value is MenuOrderState =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((keys) => Array.isArray(keys) && keys.every((key) => typeof key === 'string'));

/**
 * The links in a saved order; links the order doesn't know (e.g. a new package) keep their place after the known
 * ones, and keys of links that are gone are ignored
 */
export function applyMenuOrder(links: readonly SiteMenuLink[], keys: readonly string[] = []): readonly SiteMenuLink[] {
  const rank = (link: SiteMenuLink): number => {
    const index = keys.indexOf(link.key);
    return index === -1 ? keys.length : index;
  };
  return [...links].sort((a, b) => rank(a) - rank(b));
}

/** The menu in the visitor's own order, remembered in this browser (when saving is allowed) */
@Injectable({ providedIn: 'root' })
export class MenuOrder {
  private readonly order = signal<MenuOrderState>({});

  readonly sections = computed<readonly SiteMenuSection[]>(() =>
    SITE_MENU.map((section) => ({ ...section, links: applyMenuOrder(section.links, this.order()[section.id]) })),
  );

  /** Whether any section is in an order of its own */
  readonly customised = computed(() => Object.keys(this.order()).length > 0);

  /** Reads the saved order; called in the browser once the page is up */
  restore(): void {
    const stored = readStored(MENU_ORDER_STORAGE);
    if (isMenuOrder(stored)) {
      this.order.set(stored);
    }
  }

  /** Moves a link of a section to another position */
  move(sectionId: string, from: number, to: number): void {
    const links = this.sections().find((section) => section.id === sectionId)?.links ?? [];
    const target = Math.max(0, Math.min(to, links.length - 1));
    if (from === target || !links[from]) {
      return;
    }
    const keys = links.map((link) => link.key);
    const [moved] = keys.splice(from, 1);
    keys.splice(target, 0, moved);
    this.order.update((order) => ({ ...order, [sectionId]: keys }));
    writeStored(MENU_ORDER_STORAGE, this.order());
  }

  /** Back to the site's own order */
  reset(): void {
    this.order.set({});
    writeStored(MENU_ORDER_STORAGE, {});
  }
}
