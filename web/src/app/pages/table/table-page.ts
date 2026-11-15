import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { SuTableAction, SuTableActionEvent, SuTableCellDirective, SuTableComponent, SuTableReorderEvent, SuTableSort } from '@su-labs/table';
import { getUtility } from '../../core/packages';
import { CodeBlock } from '../../shared/code-block';
import { CodeTab } from '../../shared/code-tabs';
import { PageFeatureExample } from '../../shared/page-feature';
import { UtilityPage } from '../../shared/utility-page';
import { TABLE_FEATURES } from './table-features';
import { EDIT_ACTION, EXAMPLE_COLUMNS, mutedWhenOutOfStock, ROW_ACTIONS, SAMPLE, SPANISH } from './table-examples';
import { Product, PRODUCT_COLUMNS, productId, PRODUCTS } from './table-products';

const ACTIONS: readonly SuTableAction<Product>[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete', danger: true, bulk: true },
];

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `interface Product { id: number; name: string; price: number; inStock: boolean }

protected readonly columns: SuTableColumns<Product> = [
  { key: 'name', header: 'Product', sortable: true, edit: suTextEditor() },
  { key: 'price', header: 'Price', sortable: true, align: 'end',
    format: (price) => euros.format(price), edit: suNumberEditor({ min: 0 }) },
  { key: 'inStock', header: 'In stock', edit: suCheckboxEditor() },
];

<su-lib-table
  caption="Products"
  selectable
  reorderable
  [columns]="columns"
  [rows]="products()"
  [rowId]="productId"
  [actions]="[{ id: 'edit', label: 'Edit' }, { id: 'delete', label: 'Delete', danger: true, bulk: true }]"
  (edited)="api.save($event)"
  (reordered)="api.reorder($event.ids)"
  (action)="onAction($event)"
/>`,
  },
  {
    label: 'Any framework',
    code: `import { suNumberEditor, SuTableController, suTextEditor } from '@su-labs/core/table';

const table = new SuTableController({
  columns: [
    { key: 'name', header: 'Product', sortable: true, edit: suTextEditor() },
    { key: 'price', header: 'Price', sortable: true, edit: suNumberEditor({ min: 0 }) },
  ],
  rowId: (product) => product.id,
  rows: await api.products(),
});

table.state.subscribe((state) => render(state)); // render a <table> with your own markup

table.sortBy('price');
table.startEdit([101]);
table.setDraft('price', '19.90');
const result = table.save(); // { ok: true, rows: [{ id: 101, name: '…', price: 19.9 }] }`,
  },
  {
    label: 'Theme',
    code: `:root {
  --su-table-border: 1px solid var(--border);
  --su-table-header-background: var(--subtle);
  --su-table-selected-background: var(--blue-bg);
  --su-table-accent: var(--accent);
  --su-table-primary-background: var(--button-bg);
}`,
  },
];

@Component({
  selector: 'app-table-page',
  imports: [UtilityPage, SuTableComponent, SuTableCellDirective, CodeBlock, PageFeatureExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-page.html',
  styleUrl: './table-page.scss',
})
export class TablePage {
  private readonly dialog = inject(SuDialogService);
  private nextId = Math.max(...PRODUCTS.map((product) => product.id)) + 1;
  protected readonly utility = getUtility('table');
  protected readonly usage = USAGE;
  protected readonly features = TABLE_FEATURES;
  protected readonly examples = EXAMPLE_COLUMNS;
  protected readonly sample = SAMPLE;
  protected readonly allProducts = PRODUCTS;
  protected readonly editAction = EDIT_ACTION;
  protected readonly rowActions = ROW_ACTIONS;
  protected readonly spanish = SPANISH;
  protected readonly mutedWhenOutOfStock = mutedWhenOutOfStock;
  protected readonly actionExampleRows = signal<readonly Product[]>(SAMPLE);
  protected readonly columns = PRODUCT_COLUMNS;
  protected readonly actions = ACTIONS;
  protected readonly productId = productId;

  protected readonly products = signal<readonly Product[]>(PRODUCTS);
  protected readonly productsJson = computed(
    () =>
      `[\n${this.products()
        .map((product) => `  ${JSON.stringify(product)}`)
        .join(',\n')}\n]`,
  );
  protected readonly selectable = signal(true);
  protected readonly reorderable = signal(true);
  protected readonly selectedCount = signal(0);
  protected readonly sort = signal('none');
  protected readonly request = signal('// Edit, reorder or delete a row to see what the app would send');

  protected onEdited(rows: readonly Product[]): void {
    const edited = new Map(rows.map((row) => [row.id, row]));
    this.products.update((products) => products.map((product) => edited.get(product.id) ?? product));
    const [first] = rows;
    if (rows.length === 1) {
      this.send(`PUT /api/products/${first.id}`, first);
    } else {
      this.send('PATCH /api/products', rows);
    }
  }

  protected onReordered({ rows, ids }: SuTableReorderEvent<Product>): void {
    this.products.set(rows);
    this.send('PUT /api/products/order', ids);
  }

  protected async onAction({ id, rows }: SuTableActionEvent<Product>): Promise<void> {
    if (id === 'duplicate') {
      const copies = rows.map((row) => ({ ...row, id: this.nextId++, name: `${row.name} (copy)` }));
      this.products.update((products) => [...products, ...copies]);
      this.send('POST /api/products', copies.length === 1 ? copies[0] : copies);
    } else if (id === 'delete' && (await this.confirmDelete(rows))) {
      const ids = new Set(rows.map((row) => row.id));
      this.products.update((products) => products.filter((product) => !ids.has(product.id)));
      this.send(`DELETE /api/products?ids=${[...ids].join(',')}`, null);
    }
  }

  /** The row actions example: duplicate or delete, right away */
  protected onExampleAction({ id, rows }: SuTableActionEvent<Product>): void {
    const ids = new Set(rows.map((row) => row.id));
    if (id === 'delete') {
      this.actionExampleRows.update((products) => products.filter((product) => !ids.has(product.id)));
    } else if (id === 'duplicate') {
      const copies = rows.map((row) => ({ ...row, id: this.nextId++, name: `${row.name} (copy)` }));
      this.actionExampleRows.update((products) => [...products, ...copies]);
    }
  }

  protected onSort(sort: SuTableSort<Product> | null): void {
    this.sort.set(sort ? `${String(sort.key)} · ${sort.direction}` : 'none');
  }

  protected restore(): void {
    this.products.set(PRODUCTS);
    this.request.set('// Products restored');
  }

  protected setFlag(flag: (value: boolean) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      flag(event.target.checked);
    }
  }

  private confirmDelete(rows: readonly Product[]): Promise<boolean> {
    return this.dialog.confirm({
      title: rows.length === 1 ? `Delete ${rows[0].name}?` : `Delete ${rows.length} products?`,
      body: 'The demo can bring them back with “Restore the products”.',
      acceptLabel: 'Delete',
      cancelLabel: 'Keep',
      danger: true,
    });
  }

  private send(request: string, body: unknown): void {
    this.request.set(body === null ? request : `${request}\n\n${JSON.stringify(body, null, 2)}`);
  }
}
