import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { suNumberEditor, SuTableColumns, suTextEditor } from '@su-labs/core/table';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuTableComponent } from '../../../../../dist/su-labs/table/fesm2022/su-labs-table.mjs';
import type { SuTableActionEvent, SuTableReorderEvent } from './table.component';

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
}

@Component({
  imports: [SuTableComponent],
  template: `
    <su-lib-table
      caption="Users"
      selectable
      reorderable
      [columns]="columns"
      [rows]="users()"
      [rowId]="rowId"
      [actions]="actions"
      (edited)="edited.set($event)"
      (reordered)="reordered.set($event)"
      (action)="action.set($event)" />
  `,
})
class HostComponent {
  readonly columns: SuTableColumns<User> = [
    { key: 'name', header: 'Name', sortable: true, edit: suTextEditor() },
    { key: 'age', header: 'Age', sortable: true, edit: suNumberEditor() },
  ];
  readonly users = signal<readonly User[]>([
    { id: 1, name: 'Bo', age: 25 },
    { id: 2, name: 'Ana', age: 31 },
  ]);
  readonly rowId = (user: User) => user.id;
  readonly actions = [
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete', danger: true, bulk: true },
  ];
  readonly edited = signal<readonly User[]>([]);
  readonly reordered = signal<SuTableReorderEvent<User> | null>(null);
  readonly action = signal<SuTableActionEvent<User> | null>(null);
}

describe('SuTableComponent', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  const render = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const query = <T extends Element>(selector: string): T[] => [
      ...element.querySelectorAll<T>(selector),
    ];
    const button = (label: string) => {
      const found = query<HTMLButtonElement>('button').find(item =>
        item.textContent?.trim().startsWith(label)
      );
      if (!found) {
        throw new Error(`No button ${label}`);
      }
      return found;
    };
    const rowHeaders = () =>
      query('tbody th[scope="row"]').map(cell => cell.textContent?.trim());
    const settle = () => fixture.whenStable();
    return { fixture, element, query, button, rowHeaders, settle };
  };

  it('renders a captioned table with row headers and labelled controls', async () => {
    const { element, query, rowHeaders } = await render();

    expect(element.querySelector('caption')?.textContent?.trim()).toBe('Users');
    expect(query('thead th[scope="col"]')).toHaveLength(5);
    expect(rowHeaders()).toEqual(['Bo', 'Ana']);
    expect(query('[aria-label="Select all rows"]')).toHaveLength(1);
    expect(query('[aria-label="Select Ana"]')).toHaveLength(1);
    expect(query('[aria-label="Move Bo"]')).toHaveLength(1);
    expect(query('[aria-label="Delete, Ana"]')).toHaveLength(1);
  });

  it('sorts from the header button, sets aria-sort and announces it', async () => {
    const { element, button, rowHeaders, settle } = await render();

    button('Name').click();
    await settle();

    expect(rowHeaders()).toEqual(['Ana', 'Bo']);
    expect(
      element.querySelector('th[aria-sort]')?.getAttribute('aria-sort')
    ).toBe('ascending');
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Sorted by Name, ascending'
    );
  });

  it('edits a row inline and emits it in the API’s shape', async () => {
    const { fixture, query, button, settle } = await render();

    query<HTMLButtonElement>('[aria-label="Edit, Bo"]')[0].click();
    await settle();
    const age = query<HTMLInputElement>('input[aria-label="Age"]')[0];
    age.value = '26';
    age.dispatchEvent(new Event('input'));
    button('Save').click();
    await settle();

    expect(fixture.componentInstance.edited()).toEqual([
      { id: 1, name: 'Bo', age: 26 },
    ]);
  });

  it('bulk-edits the selected rows from a form with visible labels', async () => {
    const { fixture, element, query, button, settle } = await render();

    query<HTMLInputElement>('[aria-label="Select all rows"]')[0].click();
    await settle();
    button('Edit 2 rows').click();
    await settle();

    const form = element.querySelector('form');
    expect(form?.querySelector('h3')?.textContent).toContain('Editing 2 rows');
    const age = form?.querySelector<HTMLInputElement>('input[type="number"]');
    expect(age?.placeholder).toBe('Mixed values');
    if (age) {
      age.value = '40';
      age.dispatchEvent(new Event('input'));
    }
    button('Save').click();
    await settle();

    expect(fixture.componentInstance.edited().map(user => user.age)).toEqual([
      40, 40,
    ]);
  });

  it('emits bulk actions with the selected rows', async () => {
    const { fixture, query, button, settle } = await render();

    query<HTMLInputElement>('[aria-label="Select Ana"]')[0].click();
    await settle();
    button('Delete').click();

    expect(fixture.componentInstance.action()).toEqual({
      id: 'delete',
      rows: [{ id: 2, name: 'Ana', age: 31 }],
    });
  });

  it('reorders rows with the keyboard on the move handle', async () => {
    const { fixture, query, rowHeaders, settle } = await render();
    const press = (key: string) => {
      query<HTMLButtonElement>('[aria-label="Move Bo"]')[0].dispatchEvent(
        new KeyboardEvent('keydown', { key })
      );
    };

    press(' ');
    await settle();
    expect(
      query('[aria-label="Move Bo"]')[0].getAttribute('aria-pressed')
    ).toBe('true');
    press('ArrowDown');
    await settle();
    press(' ');
    await settle();

    expect(rowHeaders()).toEqual(['Ana', 'Bo']);
    expect(fixture.componentInstance.reordered()?.ids).toEqual([2, 1]);
  });
});
