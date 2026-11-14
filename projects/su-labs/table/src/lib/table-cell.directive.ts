import { Directive, inject, input, TemplateRef } from '@angular/core';

/** What a custom cell template gets: the row (`let-row`) and its formatted text (`let-text="text"`) */
export interface SuTableCellContext<TRow extends object> {
  readonly $implicit: TRow;
  readonly text: string;
}

/**
 * A custom cell for one column, in place of its text:
 * `<ng-template suTableCell="status" [suTableCellOf]="users()" let-user>…</ng-template>`.
 * `suTableCellOf` only types `let-user` as the row.
 */
@Directive({ selector: 'ng-template[suTableCell]' })
export class SuTableCellDirective<TRow extends object> {
  /** The column's key */
  readonly key = input.required<string>({ alias: 'suTableCell' });
  /** The table's rows, to type the template's row */
  readonly rowsOf = input<readonly TRow[]>([], { alias: 'suTableCellOf' });
  readonly template: TemplateRef<SuTableCellContext<TRow>> =
    inject(TemplateRef);

  static ngTemplateContextGuard<TRow extends object>(
    _directive: SuTableCellDirective<TRow>,
    context: unknown
  ): context is SuTableCellContext<TRow> {
    return true;
  }
}
