import { describe, expect, it } from 'vitest';
import { SuTreeTableController } from './tree-table.controller';
import { SuTreeTableColumns, SuTreeTableOptions } from './tree-table.types';

interface Item {
  readonly id: string;
  readonly name: string;
  readonly price?: number;
  readonly group?: boolean;
  readonly items?: readonly Item[];
}

const ITEMS: readonly Item[] = [
  {
    id: 'fruit',
    name: 'Fruit',
    group: true,
    items: [
      { id: 'pear', name: 'Pear', price: 3 },
      { id: 'apple', name: 'Apple', price: 2 },
    ],
  },
  {
    id: 'veg',
    name: 'Vegetables',
    price: 9,
    items: [
      {
        id: 'roots',
        name: 'Roots',
        price: 5,
        items: [{ id: 'carrot', name: 'Carrot', price: 1 }],
      },
      { id: 'leek', name: 'Leek', price: 4 },
    ],
  },
  { id: 'bread', name: 'Bread', price: 2 },
];

const COLUMNS: SuTreeTableColumns<Item> = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'price', header: 'Price', sortable: true },
];

const create = (
  options: SuTreeTableOptions<Item> = {}
): SuTreeTableController<Item> =>
  new SuTreeTableController<Item>({
    columns: COLUMNS,
    rowId: item => item.id,
    children: item => item.items,
    rowKind: item => (item.group ? 'group' : 'data'),
    rows: ITEMS,
    ...options,
  });

const ids = (controller: SuTreeTableController<Item>): string[] =>
  controller.state.get().rows.map(row => String(row.id));

const numbers = (controller: SuTreeTableController<Item>): string[] =>
  controller.state.get().rows.map(row => row.number ?? '-');

describe('SuTreeTableController', () => {
  it('shows the top-level rows, closed, with their place in the tree', () => {
    const table = create();
    const [fruit, veg] = table.state.get().rows;
    expect(ids(table)).toEqual(['fruit', 'veg', 'bread']);
    expect(fruit).toMatchObject({
      kind: 'group',
      level: 1,
      position: 1,
      siblings: 3,
      expanded: false,
      parentId: null,
      cells: [],
      label: 'Fruit',
    });
    expect(veg?.cells.map(cell => cell.text)).toEqual(['Vegetables', '9']);
    expect(table.state.get().rows[2]?.expanded).toBeNull();
  });

  it('opens and closes rows, showing their children under them', () => {
    const table = create();
    table.toggle('veg');
    expect(ids(table)).toEqual(['fruit', 'veg', 'roots', 'leek', 'bread']);
    const roots = table.state.get().rows[2];
    expect(roots).toMatchObject({
      level: 2,
      position: 1,
      siblings: 2,
      parentId: 'veg',
    });
    table.toggle('roots', true);
    expect(ids(table)).toContain('carrot');
    table.toggle('veg');
    expect(ids(table)).toEqual(['fruit', 'veg', 'bread']);
    expect(table.isExpanded('roots')).toBe(true);
    expect(table.expandedIds()).toEqual(['roots']);
  });

  it('starts with every row open, or the ones given', () => {
    expect(ids(create({ expanded: true }))).toEqual([
      'fruit',
      'pear',
      'apple',
      'veg',
      'roots',
      'carrot',
      'leek',
      'bread',
    ]);
    expect(ids(create({ expanded: ['fruit'] }))).toEqual([
      'fruit',
      'pear',
      'apple',
      'veg',
      'bread',
    ]);
    const table = create({ expanded: true });
    table.setAllExpanded(false);
    expect(ids(table)).toEqual(['fruit', 'veg', 'bread']);
  });

  it('numbers children nested under their parent by default', () => {
    expect(numbers(create({ expanded: true }))).toEqual([
      '1',
      '1.1',
      '1.2',
      '2',
      '2.1',
      '2.1.1',
      '2.2',
      '3',
    ]);
  });

  it('restarts or continues the count per parent, and leaves some rows unnumbered', () => {
    const restart = create({ expanded: true, numbering: 'restart' });
    expect(numbers(restart)).toEqual(['1', '1', '2', '2', '1', '1', '2', '3']);
    const running = create({
      expanded: true,
      numbering: 'continue',
      unnumbered: item => item.group === true,
    });
    expect(numbers(running)).toEqual(['-', '1', '2', '3', '4', '5', '6', '7']);
    const mixed = create({
      expanded: true,
      numbering: item => (item.id === 'veg' ? 'continue' : 'nested'),
      unnumbered: item => item.group === true,
    });
    expect(numbers(mixed)).toEqual(['-', '1', '2', '1', '2', '2.1', '3', '4']);
  });

  it('keeps numbers while rows are closed or searched', () => {
    const table = create();
    table.search('leek');
    expect(table.state.get().rows.find(row => row.id === 'leek')?.number).toBe(
      '2.2'
    );
  });

  it('sorts siblings within each parent', () => {
    const table = create({ expanded: true });
    table.sortBy('price');
    expect(ids(table)).toEqual([
      'bread',
      'veg',
      'leek',
      'roots',
      'carrot',
      'fruit',
      'apple',
      'pear',
    ]);
    expect(table.state.get().announcement).toBe('Sorted by Price, ascending');
    table.sortBy('price');
    table.sortBy('price');
    expect(table.state.get().sort).toBeNull();
    expect(ids(table)[0]).toBe('fruit');
  });

  it('searches every level, keeping the parents of a match open on view', () => {
    const table = create();
    table.search('carrot');
    expect(ids(table)).toEqual(['veg', 'roots', 'carrot']);
    expect(table.state.get().rows[0]).toMatchObject({
      expanded: true,
      siblings: 1,
    });
    expect(table.state.get().announcement).toBe('1 row matches');
    table.search('fruit');
    expect(ids(table)).toEqual(['fruit']);
    table.toggle('fruit');
    expect(ids(table)).toEqual(['fruit', 'pear', 'apple']);
    table.search('');
    expect(table.state.get().searching).toBe(false);
    expect(ids(table)).toEqual(['fruit', 'pear', 'apple', 'veg', 'bread']);
  });

  it('pages by top-level rows, so children stay with their parent', () => {
    const table = create({
      expanded: true,
      pageSize: 2,
      pageSizes: [2, 'all'],
    });
    expect(ids(table)).toEqual([
      'fruit',
      'pear',
      'apple',
      'veg',
      'roots',
      'carrot',
      'leek',
    ]);
    expect(table.state.get().pagination).toMatchObject({
      page: 0,
      pageCount: 2,
      totalRows: 3,
      rangeStart: 1,
      rangeEnd: 2,
    });
    table.setPage(1);
    expect(ids(table)).toEqual(['bread']);
    expect(table.state.get().rows[0]?.position).toBe(3);
    table.setPageSize('all');
    expect(table.state.get().pagination.pageCount).toBe(1);
  });

  it('pins top-level rows, with their children, above the others', () => {
    const table = create({ pinnedRows: ['bread'] });
    expect(table.state.get().pinnedRows.map(row => row.id)).toEqual(['bread']);
    expect(ids(table)).toEqual(['fruit', 'veg']);
    table.pinRow('veg');
    table.toggle('veg');
    expect(table.state.get().pinnedRows.map(row => row.id)).toEqual([
      'bread',
      'veg',
      'roots',
      'leek',
    ]);
    expect(table.state.get().announcement).toBe('Vegetables pinned to the top');
    table.pinRow('roots');
    expect(table.state.get().pinnedRows).toHaveLength(4);
    table.pinRow('bread', false);
    expect(ids(table)).toEqual(['fruit', 'bread']);
  });

  it('merges cells down and across, within the parent rows and the pinned side of the column', () => {
    const table = create({
      expanded: true,
      columns: [
        {
          key: 'name',
          header: 'Name',
          span: (_name, item) => (item.id === 'pear' ? { columns: 2 } : null),
        },
        {
          key: 'price',
          header: 'Price',
          span: (_price, item) => (item.id === 'apple' ? { rows: 9 } : null),
        },
      ],
    });
    const [, pear, apple, veg] = table.state.get().rows;
    expect(pear?.cells).toEqual([
      { key: 'name', columnIndex: 0, text: 'Pear', rowSpan: 1, colSpan: 2 },
    ]);
    expect(apple?.cells.map(cell => cell.rowSpan)).toEqual([1, 1]);
    expect(veg?.cells).toHaveLength(2);
    const merged = create({
      expanded: true,
      columns: [
        { key: 'name', header: 'Name' },
        {
          key: 'price',
          header: 'Price',
          span: (_price, item) => (item.id === 'roots' ? { rows: 9 } : null),
        },
      ],
    });
    const rows = merged.state.get().rows;
    expect(rows.find(row => row.id === 'roots')?.cells[1]?.rowSpan).toBe(3);
    expect(rows.find(row => row.id === 'leek')?.cells).toHaveLength(1);
    expect(rows.find(row => row.id === 'bread')?.cells).toHaveLength(2);
    expect(
      rows.find(row => row.id === 'carrot')?.cells.map(cell => cell.key)
    ).toEqual(['name']);
    const pinned = create({
      expanded: true,
      columns: [
        {
          key: 'name',
          header: 'Name',
          pinned: 'start',
          span: () => ({ columns: 2 }),
        },
        { key: 'price', header: 'Price' },
      ],
    });
    expect(pinned.state.get().rows[1]?.cells.map(cell => cell.colSpan)).toEqual(
      [1, 1]
    );
    const first = create({
      expanded: true,
      columns: [{ key: 'name', header: 'Name', span: () => ({ rows: 3 }) }],
    });
    expect(first.state.get().rows[1]?.cells[0]?.rowSpan).toBe(1);
  });

  it('moves the focus and opens or closes rows with the keyboard', () => {
    const table = create();
    expect(table.rowKey('fruit', 'ArrowDown')).toEqual({
      handled: true,
      focusId: 'veg',
    });
    expect(table.rowKey('fruit', 'End')).toEqual({
      handled: true,
      focusId: 'bread',
    });
    expect(table.rowKey('veg', 'ArrowRight')).toEqual({
      handled: true,
      focusId: 'veg',
    });
    expect(table.isExpanded('veg')).toBe(true);
    expect(table.rowKey('veg', 'ArrowRight')).toEqual({
      handled: true,
      focusId: 'roots',
    });
    expect(table.rowKey('roots', 'ArrowLeft')).toEqual({
      handled: true,
      focusId: 'veg',
    });
    expect(table.rowKey('veg', 'ArrowLeft')).toEqual({
      handled: true,
      focusId: 'veg',
    });
    expect(table.isExpanded('veg')).toBe(false);
    expect(table.rowKey('veg', 'Enter')).toEqual({
      handled: true,
      focusId: 'veg',
    });
    expect(table.isExpanded('veg')).toBe(true);
    expect(table.rowKey('bread', 'Enter')).toEqual({ handled: false });
    expect(table.rowKey('bread', 'a')).toEqual({ handled: false });
  });

  it('hides, shows and pins columns like the table', () => {
    const table = create();
    table.setColumnVisible('price', false);
    expect(table.state.get().columns.map(column => column.key)).toEqual([
      'name',
    ]);
    expect(table.state.get().rows[1]?.cells).toHaveLength(1);
    table.setColumnVisible('name', false);
    expect(table.state.get().columns).toHaveLength(1);
    table.setColumnsVisible(true);
    table.pinColumn('price', 'start');
    expect(table.state.get().columns.map(column => column.key)).toEqual([
      'price',
      'name',
    ]);
    expect(table.state.get().announcement).toBe('Price pinned to the start');
  });

  it('finds rows at any level by id', () => {
    const table = create();
    expect(table.rowOf('carrot')?.name).toBe('Carrot');
    expect(table.rowOf('missing')).toBeNull();
  });
});
