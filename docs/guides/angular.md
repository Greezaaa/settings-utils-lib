# Angular Guide

Angular has dedicated packages that wrap each utility in an injectable service with signals. Use these instead of `@su-labs/core`.

[All guides](../README.md)

## Installation

Install only the utilities you need:

```bash
npm install @su-labs/theme
npm install @su-labs/font-size
npm install @su-labs/notifications
npm install @su-labs/dialog
npm install @su-labs/scroll-spy
npm install @su-labs/visit-tracker
npm install @su-labs/table
npm install @su-labs/fields
npm install @su-labs/skeleton
npm install @su-labs/stepper
npm install @su-labs/tree-table
```

Requires Angular 22 or later.

## Packages

| Package | What it does | Setup and API |
|---------|--------------|---------------|
| `@su-labs/theme` | Light, dark, contrast and system themes with CSS variables | [README](../../projects/su-labs/theme/README.md) |
| `@su-labs/font-size` | Accessible font size controls | [README](../../projects/su-labs/font-size/README.md) |
| `@su-labs/notifications` | Toast notifications | [README](../../projects/su-labs/notifications/README.md) |
| `@su-labs/dialog` | Confirm and message dialogs on the native `<dialog>` | [README](../../projects/su-labs/dialog/README.md) |
| `@su-labs/scroll-spy` | Active section tracking while scrolling | [README](../../projects/su-labs/scroll-spy/README.md) |
| `@su-labs/visit-tracker` | Visit counts and milestones | [README](../../projects/su-labs/visit-tracker/README.md) |
| `@su-labs/table` | Data tables with sorting, selection, inline and bulk editing, reordering, row actions, paging, search, pinned rows and columns, and a Columns menu | [README](../../projects/su-labs/table/README.md) |
| `@su-labs/fields` | Code boxes, password strength meter, auto-grow textarea, switch, email field, checkbox and chips | [README](../../projects/su-labs/fields/README.md) |
| `@su-labs/skeleton` | Skeleton loaders drawn with your own HTML and CSS, with one shimmer and screen reader support | [README](../../projects/su-labs/skeleton/README.md) |
| `@su-labs/stepper` | Content in numbered steps shown one at a time, with rules for going forward and back, horizontal or vertical, and headers that can act as tabs | [README](../../projects/su-labs/stepper/README.md) |
| `@su-labs/tree-table` | Tree tables: rows with child rows, data or group parents, numbering, merged cells, and the table's sorting, search, paging and pinned rows and columns | [README](../../projects/su-labs/tree-table/README.md) |

## Theme quick start

Initialize the service when the app starts:

```ts
// app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuThemeService).init({ defaultTheme: 'system' });
    }),
  ],
};
```

Read the theme as a signal and switch it:

```ts
import { Component, inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <p>Current theme: {{ themeService.theme() }}</p>
    <button type="button" (click)="themeService.setTheme('dark')">Dark</button>
    <button type="button" (click)="themeService.setTheme('system')">System</button>
  `,
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(SuThemeService);
}
```

`@su-labs/theme`, `@su-labs/font-size`, `@su-labs/notifications`, `@su-labs/scroll-spy`, `@su-labs/visit-tracker` and `@su-labs/table` use `@su-labs/core` internally and install it automatically.

## Table quick start

Map each field of your API's rows to a column; the table renders, sorts, selects, edits and reorders them:

```ts
import { Component, signal } from '@angular/core';
import { suNumberEditor, SuTableColumns, SuTableComponent, suTextEditor } from '@su-labs/table';

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
}

@Component({
  selector: 'app-users',
  imports: [SuTableComponent],
  template: `
    <su-lib-table
      caption="Users"
      selectable
      reorderable
      [columns]="columns"
      [rows]="users()"
      [rowId]="userId"
      [actions]="[{ id: 'edit', label: 'Edit' }]"
      (edited)="save($event)"
    />
  `,
})
export class UsersComponent {
  protected readonly users = signal<readonly User[]>([]);
  protected readonly userId = (user: User) => user.id;
  protected readonly columns: SuTableColumns<User> = [
    { key: 'name', header: 'Name', sortable: true, edit: suTextEditor() },
    { key: 'age', header: 'Age', sortable: true, edit: suNumberEditor({ min: 0 }) },
  ];

  protected save(rows: readonly User[]): void {
    // the rows in the API's shape, ready to send
  }
}
```

## Stepper quick start

```ts
import { Component, signal } from '@angular/core';
import { SuStepComponent, SuStepperComponent } from '@su-labs/stepper';

@Component({
  selector: 'app-sign-up',
  imports: [SuStepComponent, SuStepperComponent],
  template: `
    <su-lib-stepper label="Sign up" [(current)]="step">
      <su-lib-step label="Account" [canNext]="name().length > 0">
        <input #nameInput [value]="name()" (input)="name.set(nameInput.value)" />
      </su-lib-step>
      <su-lib-step label="Plan">…</su-lib-step>
      <su-lib-step label="Confirm" [canBack]="false">…</su-lib-step>
    </su-lib-stepper>
  `,
})
export class SignUp {
  protected readonly step = signal(0);
  protected readonly name = signal('');
}
```

Add `orientation="vertical"` for the steps in a column, and `tabs` to let a click on a step header go to it.

## Tree table quick start

```ts
import { Component } from '@angular/core';
import { SuTreeTableColumns, SuTreeTableComponent } from '@su-labs/tree-table';

@Component({
  selector: 'app-price-list',
  imports: [SuTreeTableComponent],
  template: `
    <su-lib-tree-table
      caption="Price list"
      numbered
      [columns]="columns"
      [rows]="items"
      [rowId]="itemId"
      [children]="childrenOf"
      [rowKind]="kindOf"
    />
  `,
})
export class PriceList {
  protected readonly items: readonly Item[] = [];
  protected readonly columns: SuTreeTableColumns<Item> = [
    { key: 'name', header: 'Item', sortable: true },
    { key: 'price', header: 'Price', sortable: true },
  ];
  protected readonly itemId = (item: Item) => item.id;
  protected readonly childrenOf = (item: Item) => item.children;
  protected readonly kindOf = (item: Item) => (item.isGroup ? 'group' : 'data');
}
```

Add `numbering="restart"` or `"continue"` to count children another way, and a column's `span` to merge cells.

## Next steps

- [Theme configuration and full API](../../projects/su-labs/theme/README.md)
- [Table setup and full API](../../projects/su-labs/table/README.md)
- [Stepper setup and full API](../../projects/su-labs/stepper/README.md)
- [Tree table setup and full API](../../projects/su-labs/tree-table/README.md)
