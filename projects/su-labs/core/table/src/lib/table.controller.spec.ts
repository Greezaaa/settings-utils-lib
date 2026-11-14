import { describe, expect, it } from 'vitest';
import { suCompareValues, SuTableController, suTableDropIndex } from './table.controller';
import { suCheckboxEditor, suDateEditor, suNumberEditor, suSelectEditor, suTextEditor } from './table.editors';
import { SuTableColumns } from './table.types';

type Status = 'active' | 'paused';

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
  readonly admin: boolean;
  readonly status: Status;
  readonly joined: string;
}

const USERS: readonly User[] = [
  { id: 1, name: 'Ana', age: 31, admin: false, status: 'active', joined: '2024-03-01' },
  { id: 2, name: 'Bo', age: 25, admin: true, status: 'paused', joined: '2023-11-20' },
  { id: 3, name: 'Cy', age: 40, admin: false, status: 'active', joined: '2025-01-15' },
];

const COLUMNS: SuTableColumns<User> = [
  { key: 'name', header: 'Name', sortable: true, edit: suTextEditor({ requiredMessage: 'Required' }) },
  {
    key: 'age',
    header: 'Age',
    sortable: true,
    align: 'end',
    format: (age) => `${age} y`,
    edit: suNumberEditor({ min: 0, max: 130 }),
  },
  { key: 'admin', header: 'Admin', edit: suCheckboxEditor() },
  {
    key: 'status',
    header: 'Status',
    sortable: (a, b) => a.localeCompare(b),
    edit: suSelectEditor<Status>([
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
    ]),
  },
  { key: 'joined', header: 'Joined', edit: suDateEditor() },
];

const createTable = () =>
  new SuTableController<User>({
    columns: COLUMNS,
    rowId: (user) => user.id,
    rows: USERS,
    actions: [
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete', danger: true, bulk: true, disabled: (user) => user.admin },
      { id: 'promote', label: 'Promote', hidden: (user) => user.admin },
    ],
  });

const names = (table: SuTableController<User>) => table.state.get().rows.map((row) => row.data.name);

describe('SuTableController', () => {
  it('maps API fields to cells, with formats and default texts', () => {
    const state = createTable().state.get();

    expect(state.columns.map((column) => column.header)).toEqual(['Name', 'Age', 'Admin', 'Status', 'Joined']);
    expect(state.columns[1]).toMatchObject({ align: 'end', sortable: true, sort: 'none' });
    expect(state.columns[2].sortable).toBe(false);
    expect(state.rows[1].cells.map((cell) => cell.text)).toEqual(['Bo', '25 y', 'Yes', 'paused', '2023-11-20']);
    expect(state.rows[0]).toMatchObject({ id: 1, label: 'Ana', selected: false });
  });

  it('resolves each row’s actions', () => {
    const [ana, bo] = createTable().state.get().rows;

    expect(ana.actions.map((action) => action.id)).toEqual(['edit', 'delete', 'promote']);
    expect(bo.actions).toEqual([
      { id: 'edit', label: 'Edit', danger: false, disabled: false },
      { id: 'delete', label: 'Delete', danger: true, disabled: true },
    ]);
    expect(createTable().state.get().bulkActions.map((action) => action.id)).toEqual(['delete']);
  });

  it('sorts ascending, descending, then back to the original order, and announces it', () => {
    const table = createTable();

    table.sortBy('age');
    expect(names(table)).toEqual(['Bo', 'Ana', 'Cy']);
    expect(table.state.get().announcement).toBe('Sorted by Age, ascending');
    expect(table.state.get().columns[1].sort).toBe('ascending');

    table.sortBy('age');
    expect(names(table)).toEqual(['Cy', 'Ana', 'Bo']);

    table.sortBy('age');
    expect(names(table)).toEqual(['Ana', 'Bo', 'Cy']);
    expect(table.state.get().sort).toBeNull();
    expect(table.state.get().announcement).toBe('Sort cleared');
  });

  it('uses a column’s own comparison and ignores columns that can’t be sorted', () => {
    const table = createTable();
    table.sortBy('status');
    table.sortBy('status');
    expect(names(table)).toEqual(['Bo', 'Ana', 'Cy']);

    table.sortBy('admin');
    expect(table.state.get().sort).toEqual({ key: 'status', direction: 'descending' });
  });

  it('selects rows one by one or all at once', () => {
    const table = createTable();

    table.select(2);
    expect(table.state.get()).toMatchObject({ selectedIds: [2], selection: 'some', announcement: '1 row selected' });

    table.selectAll();
    expect(table.state.get().selection).toBe('all');
    expect(table.selectedRows().map((user) => user.name)).toEqual(['Ana', 'Bo', 'Cy']);

    table.selectAll();
    expect(table.state.get().selection).toBe('none');
  });

  it('keeps the selection of rows that remain after new rows arrive', () => {
    const table = createTable();
    table.selectAll(true);

    table.setRows(USERS.filter((user) => user.id !== 2).map((user) => ({ ...user })));
    expect(table.state.get().selectedIds).toEqual([1, 3]);
  });

  it('moves a row to a position and keeps a sorted order as the new order', () => {
    const table = createTable();
    table.sortBy('age');

    expect(table.move(1, 2)).toEqual([2, 3, 1]);
    expect(table.state.get().sort).toBeNull();
    expect(table.state.get().announcement).toBe('Row dropped at position 3 of 3');
    expect(table.move(1, 2)).toBeNull();
  });

  it('moves a row with the keyboard, and puts it back on Escape', () => {
    const table = createTable();

    expect(table.moveKey(1, 'Tab')).toEqual({ handled: false });
    expect(table.moveKey(1, ' ')).toEqual({ handled: true, order: null });
    expect(table.state.get().grabbedId).toBe(1);
    table.moveKey(1, 'ArrowDown');
    expect(names(table)).toEqual(['Bo', 'Ana', 'Cy']);
    expect(table.state.get().announcement).toBe('Position 2 of 3');
    table.moveKey(1, 'End');
    expect(table.moveKey(1, 'Enter')).toEqual({ handled: true, order: [2, 3, 1] });
    expect(table.state.get().grabbedId).toBeNull();

    table.moveKey(3, ' ');
    table.moveKey(3, 'Home');
    table.moveKey(3, 'Escape');
    expect(names(table)).toEqual(['Bo', 'Cy', 'Ana']);
    expect(table.state.get().announcement).toBe('Move cancelled');

    table.moveKey(3, ' ');
    table.moveKey(3, 'ArrowUp');
    expect(table.moveKey(3, 'Tab')).toEqual({ handled: false });
    expect(table.state.get().grabbedId).toBeNull();
    expect(names(table)).toEqual(['Bo', 'Cy', 'Ana']);
  });

  it('edits one row and returns it in the API’s shape', () => {
    const table = createTable();
    table.startEdit([2]);

    const draft = table.state.get().draft;
    expect(draft).toMatchObject({ ids: [2], bulk: false });
    expect(draft?.fields.map((field) => field.value)).toEqual(['Bo', '25', true, 'paused', '2023-11-20']);

    table.setDraft('age', '26');
    table.setDraft('status', 'active');
    table.setDraft('admin', false);
    const result = table.save();

    expect(result).toEqual({
      ok: true,
      rows: [{ id: 2, name: 'Bo', age: 26, admin: false, status: 'active', joined: '2023-11-20' }],
    });
    expect(table.state.get().draft).toBeNull();
    expect(table.state.get().rows[1].cells[1].text).toBe('26 y');
    expect(table.state.get().announcement).toBe('1 row saved');
  });

  it('edits many rows at once, applying only the changed fields', () => {
    const table = createTable();
    table.selectAll(true);
    table.startEdit();

    const fields = table.state.get().draft?.fields ?? [];
    expect(table.state.get().draft?.bulk).toBe(true);
    expect(fields.find((field) => field.key === 'name')).toMatchObject({ value: '', mixed: true });
    expect(fields.find((field) => field.key === 'admin')).toMatchObject({ value: false, mixed: true });

    table.setDraft('status', 'paused');
    const result = table.save();

    expect(result.ok && result.rows.map((user) => [user.name, user.status])).toEqual([
      ['Ana', 'paused'],
      ['Bo', 'paused'],
      ['Cy', 'paused'],
    ]);
  });

  it('keeps editing and reports the fields that need fixing', () => {
    const table = createTable();
    table.startEdit([1]);
    table.setDraft('name', '  ');
    table.setDraft('age', 'abc');

    expect(table.save()).toEqual({ ok: false, errors: 2 });
    const fields = table.state.get().draft?.fields ?? [];
    expect(fields.map((field) => field.error)).toEqual(['Required', 'Enter a number', null, null, null]);
    expect(table.state.get().announcement).toBe('2 fields need fixing');

    table.setDraft('name', 'Ann');
    expect(table.state.get().draft?.fields[0].error).toBeNull();
    table.cancelEdit();
    expect(table.state.get()).toMatchObject({ draft: null, announcement: 'Editing cancelled' });
    expect(names(table)[0]).toBe('Ana');
  });

  it('validates against the row with a column’s own check', () => {
    const table = new SuTableController<User>({
      columns: [
        {
          key: 'age',
          header: 'Age',
          edit: suNumberEditor(),
          validate: (age, user) => (user.admin && age < 30 ? 'Too young' : null),
        },
      ],
      rows: USERS,
    });
    table.startEdit([table.idOf(USERS[1])]);
    table.setDraft('age', '20');
    expect(table.save()).toEqual({ ok: false, errors: 1 });
  });

  it('gives rows an identity of their own without a rowId, kept through edits', () => {
    const table = new SuTableController<User>({ columns: COLUMNS, rows: USERS });
    const [first] = table.state.get().rows;
    table.select(first.id);
    table.startEdit();
    table.setDraft('name', 'Anna');
    table.save();

    expect(table.state.get().rows[0]).toMatchObject({ id: first.id, selected: true, label: 'Anna' });
  });

  it('applies custom labels', () => {
    const table = createTable();
    table.configure({ labels: { selected: (count) => `${count} seleccionadas`, yes: 'Sí' } });
    table.select(1);

    expect(table.state.get().announcement).toBe('1 seleccionadas');
    expect(table.state.get().rows[1].cells[2].text).toBe('Sí');
  });
});

describe('suCompareValues', () => {
  it('compares numbers, booleans, dates and text, with empty values last', () => {
    expect(suCompareValues(2, 10)).toBeLessThan(0);
    expect(suCompareValues(true, false)).toBeGreaterThan(0);
    expect(suCompareValues(new Date(2020, 0), new Date(2021, 0))).toBeLessThan(0);
    expect(suCompareValues('item 2', 'item 10')).toBeLessThan(0);
    expect(suCompareValues(null, 'a')).toBeGreaterThan(0);
    expect(suCompareValues('', '')).toBe(0);
  });
});

describe('suTableDropIndex', () => {
  it('counts the other rows above the pointer', () => {
    const middles = [10, 30, 50, 70];
    expect(suTableDropIndex(0, middles, 2)).toBe(0);
    expect(suTableDropIndex(35, middles, 0)).toBe(1);
    expect(suTableDropIndex(55, middles, 2)).toBe(2);
    expect(suTableDropIndex(99, middles, 1)).toBe(3);
  });
});
