import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { SuTreeTableColumns } from '@su-labs/core/tree-table';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuTreeTableComponent } from '../../../../../../dist/su-labs/tree-table/fesm2022/su-labs-tree-table.mjs';

interface Item {
  readonly id: string;
  readonly name: string;
  readonly price?: number;
  readonly group?: boolean;
  readonly items?: readonly Item[];
}

@Component({
  imports: [SuTreeTableComponent],
  template: `
    <su-lib-tree-table
      caption="Shop"
      numbered
      [columns]="columns"
      [rows]="items"
      [rowId]="itemId"
      [children]="childrenOf"
      [rowKind]="kindOf"
      [unnumbered]="isGroup" />
  `,
})
class HostComponent {
  readonly columns: SuTreeTableColumns<Item> = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'price',
      header: 'Price',
      span: (_price, item) => (item.id === 'pear' ? { rows: 2 } : null),
    },
  ];
  readonly items: readonly Item[] = [
    {
      id: 'fruit',
      name: 'Fruit',
      group: true,
      items: [
        { id: 'pear', name: 'Pear', price: 3 },
        { id: 'apple', name: 'Apple', price: 2 },
      ],
    },
    { id: 'bread', name: 'Bread', price: 2 },
  ];
  readonly itemId = (item: Item) => item.id;
  readonly childrenOf = (item: Item) => item.items;
  readonly kindOf = (item: Item) => (item.group ? 'group' : 'data');
  readonly isGroup = (item: Item) => item.group === true;
}

describe('SuTreeTableComponent', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  const render = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const rows = () => [
      ...element.querySelectorAll<HTMLTableRowElement>(
        'tbody tr[data-su-tree-row]'
      ),
    ];
    const settle = () => fixture.whenStable();
    return { element, rows, settle };
  };

  it('renders a treegrid with levels, positions and closed parents', async () => {
    const { element, rows } = await render();
    const [fruit, bread] = rows();

    expect(element.querySelector('table')?.getAttribute('role')).toBe(
      'treegrid'
    );
    expect(rows()).toHaveLength(2);
    expect(fruit?.getAttribute('aria-level')).toBe('1');
    expect(fruit?.getAttribute('aria-expanded')).toBe('false');
    expect(fruit?.getAttribute('aria-setsize')).toBe('2');
    expect(fruit?.getAttribute('tabindex')).toBe('0');
    expect(bread?.hasAttribute('aria-expanded')).toBe(false);
    expect(bread?.getAttribute('tabindex')).toBe('-1');
    expect(
      fruit?.querySelector('[role="rowheader"]')?.getAttribute('colspan')
    ).toBe('2');
    expect(
      bread?.querySelector('.su-tree-table-number')?.textContent?.trim()
    ).toBe('1');
  });

  it('opens a parent with its button and merges the spanned cells', async () => {
    const { element, rows, settle } = await render();

    element
      .querySelector<HTMLButtonElement>('[aria-label="Expand Fruit"]')
      ?.click();
    await settle();

    const [, pear, apple] = rows();
    expect(rows().map(row => row.dataset['suTreeRow'])).toEqual([
      'fruit',
      'pear',
      'apple',
      'bread',
    ]);
    expect(pear?.getAttribute('aria-level')).toBe('2');
    expect(pear?.querySelector('td[rowspan="2"]')?.textContent?.trim()).toBe(
      '3'
    );
    expect(
      apple?.querySelectorAll('[role="gridcell"], [role="rowheader"]')
    ).toHaveLength(1);
    expect(
      pear?.querySelector('.su-tree-table-number')?.textContent?.trim()
    ).toBe('1');
  });

  it('moves the focus and opens rows with the arrow keys', async () => {
    const { rows, settle } = await render();
    const [fruit] = rows();

    fruit?.focus();
    fruit?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    await settle();
    expect(rows()[0]?.getAttribute('aria-expanded')).toBe('true');

    rows()[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    await settle();
    expect(document.activeElement?.getAttribute('data-su-tree-row')).toBe(
      'pear'
    );
    expect(rows()[1]?.getAttribute('tabindex')).toBe('0');

    rows()[1]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    await settle();
    expect(document.activeElement?.getAttribute('data-su-tree-row')).toBe(
      'fruit'
    );
  });
});
