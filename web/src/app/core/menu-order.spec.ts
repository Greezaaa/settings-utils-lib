import { beforeEach, describe, expect, it } from 'vitest';
import { SiteMenuLink } from './menu';
import { applyMenuOrder, MenuOrder } from './menu-order';

const link = (key: string): SiteMenuLink => ({ key, label: key, icon: 'packages', route: `/${key}` });
const keys = (links: readonly SiteMenuLink[]) => links.map((item) => item.key);

describe('applyMenuOrder', () => {
  const links = [link('a'), link('b'), link('c'), link('d')];

  it('puts the links in the saved order', () => {
    expect(keys(applyMenuOrder(links, ['c', 'a', 'd', 'b']))).toEqual(['c', 'a', 'd', 'b']);
  });

  it('keeps new links after the known ones, and ignores keys that are gone', () => {
    expect(keys(applyMenuOrder(links, ['d', 'gone', 'b']))).toEqual(['d', 'b', 'a', 'c']);
  });

  it('keeps the site’s order without a saved one', () => {
    expect(keys(applyMenuOrder(links))).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('MenuOrder', () => {
  beforeEach(() => localStorage.clear());

  const packageKeys = (order: MenuOrder) =>
    keys(order.sections().find((section) => section.id === 'packages')?.links ?? []);

  it('moves a link, remembers the order and resets it', () => {
    const order = new MenuOrder();
    const [first, second] = packageKeys(order);

    order.move('packages', 0, 1);
    expect(packageKeys(order).slice(0, 2)).toEqual([second, first]);
    expect(order.customised()).toBe(true);

    const restored = new MenuOrder();
    restored.restore();
    expect(packageKeys(restored).slice(0, 2)).toEqual([second, first]);

    order.reset();
    expect(packageKeys(order).slice(0, 2)).toEqual([first, second]);
    expect(order.customised()).toBe(false);
  });

  it('ignores a saved value that isn’t an order', () => {
    localStorage.setItem('su-labs-site:menu-order', JSON.stringify({ packages: [1, 2] }));
    const order = new MenuOrder();
    order.restore();
    expect(order.customised()).toBe(false);
  });
});
