import { PageFeature } from '../../shared/page-feature';

export const TABLE_FEATURES = {
  columns: {
    title: 'Columns typed from your API',
    description:
      'Each column maps one field of the rows your API sends: its heading, how its value is shown and how it lines ' +
      'up. The key is checked against your row type, so a typo fails to compile, and fields without a column stay ' +
      'in the rows untouched.',
    code: `interface Product {
  id: number;
  name: string;
  price: number;
}

columns: SuTableColumns<Product> = [
  { key: 'name', header: 'Product' },
  {
    key: 'price',
    header: 'Price',
    align: 'end',
    format: (price) => euros.format(price),
  },
];`,
  },
  sorting: {
    title: 'Sorting',
    description:
      'Sortable headings sort ascending, then descending, then back to the rows’ own order. Numbers, dates and text ' +
      'compare naturally; pass your own comparison when they need another order. Sorting only changes the view, ' +
      'nothing is sent anywhere.',
    code: `{ key: 'name', header: 'Name', sortable: true },
{
  key: 'status',
  header: 'Status',
  sortable: (a, b) => ORDER[a] - ORDER[b],
},`,
  },
  editing: {
    title: 'Editing a row',
    description:
      'The edit action turns a row into a form, one control per editable field. Enter saves and Escape cancels. The ' +
      'saved row comes back in the API’s own shape, so you send it as it is.',
    code: `actions = [{ id: 'edit', label: 'Edit' }];

<su-lib-table … [actions]="actions"
  (edited)="api.save($event)" />`,
  },
  doubleClick: {
    title: 'Double-click to edit',
    description:
      'A double-click on an editable cell opens its row for editing, starting in that field with its text selected. ' +
      'Changes in a row being edited are never dropped by a stray double-click. The Edit button stays as the way in ' +
      'for keyboards.',
    code: `<!-- on by default -->
<su-lib-table … />

<!-- turned off -->
<su-lib-table …
  [editOnDoubleClick]="false" />`,
  },
  editors: {
    title: 'Editors and validation',
    description:
      'Ready-made editors cover text, numbers, checkboxes, dates and fixed choices, each turning the control’s ' +
      'value back into the API’s type. Messages show under the field and are read out; any other field gets its own ' +
      'editor.',
    code: `{
  key: 'price',
  header: 'Price',
  edit: suNumberEditor({
    min: 0,
    invalidMessage: 'Enter a price',
  }),
},
{
  key: 'status',
  header: 'Status',
  edit: suSelectEditor([
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
  ]),
},`,
  },
  bulk: {
    title: 'Editing many rows at once',
    description:
      'Select rows and choose Edit in the toolbar. A form opens with every editable field; fields that differ show ' +
      'as mixed, and only the fields you change are applied to all of the rows.',
    code: `<su-lib-table … selectable
  (edited)="api.saveMany($event)" />`,
  },
  actions: {
    title: 'Row actions',
    description:
      'Any button on each row: duplicate, delete, archive. Hide or disable it for some rows, and mark it bulk to ' +
      'offer it for the selection too. The table sends the clicked or selected rows; you decide what happens.',
    code: `actions = [
  { id: 'duplicate', label: 'Duplicate' },
  {
    id: 'delete',
    label: 'Delete',
    danger: true,
    bulk: true,
    disabled: (product) => product.locked,
  },
];

(action)="onAction($event)"  // { id, rows }`,
  },
  reordering: {
    title: 'Reordering',
    description:
      'Drag a row by its handle with a mouse or a finger: it follows the pointer and the others slide aside. With ' +
      'the keyboard, Space picks it up, the arrows move it and Space drops it. You get the new order to save.',
    code: `<su-lib-table … reorderable
  (reordered)="api.saveOrder($event.ids)" />`,
  },
  pinnedColumns: {
    title: 'Pinned columns',
    description:
      'Pin a column to the start or the end and it stays in view while the others scroll sideways, the way you’d ' +
      'keep a name on screen on a phone. Columns that are pinned or pinnable show a pin in their heading: tap it to ' +
      'pin or unpin the column. The Columns menu chooses which headings show the pin.',
    code: `{ key: 'name', header: 'Name',
  pinned: 'start' },
{ key: 'sku', header: 'SKU',
  pinnable: true },
{ key: 'price', header: 'Price',
  pinned: 'end' },`,
  },
  pinnedRows: {
    title: 'Pinned rows',
    description:
      'A Pin button keeps a row above the others on every page, outside the sorting and the paging. Start with some ' +
      'pinned and keep track of them to save them.',
    code: `<su-lib-table … rowPinning
  [pinnedRows]="[103]"
  (pinnedRowsChange)="savePins($event)" />`,
  },
  search: {
    title: 'Search',
    description:
      'A search box narrows the rows by the text they show, so “€18.50” and “Garden” match. Case and accents don’t ' +
      'matter, every word typed has to match, and the number of matches is read out.',
    code: `<su-lib-table … searchable />

{ key: 'id', header: 'ID',
  searchable: false },`,
  },
  hiding: {
    title: 'Showing and hiding columns',
    description:
      'Load every field and show only some. Hidden columns start out of view and can be shown from the Columns ' +
      'menu; their fields stay in each row, so a saved row still comes back whole.',
    code: `{ key: 'restocked', header: 'Restocked',
  hidden: true },

<su-lib-table … columnControls
  (columnsChange)="saveLayout($event)" />`,
  },
  pages: {
    title: 'Pages',
    description:
      'Show the rows a page at a time, with a choice of rows per page under the table. Changing the page size keeps ' +
      'the first row on screen in view, and the selection is kept across pages.',
    code: `<su-lib-table …
  [pageSize]="25"
  [pageSizes]="[10, 25, 50, 'all']"
  (pageChange)="onPage($event)" />`,
  },
  sticky: {
    title: 'Sticky header',
    description:
      'Give the table a height and it scrolls inside it, keeping the header at the top and the pinned rows just ' +
      'under it, with a shadow while rows pass beneath.',
    code: `<su-lib-table … maxHeight="28rem" />`,
  },
  customCells: {
    title: 'Custom cells',
    description:
      'Put anything in a column’s cells, like a badge or a link, with a template. The row comes typed, and the ' +
      'formatted text is there too.',
    code: `<ng-template
  suTableCell="inStock"
  [suTableCellOf]="products()"
  let-product
  let-text="text">
  <span class="badge"
    [class.is-on]="product.inStock">
    {{ text }}
  </span>
</ng-template>`,
  },
  labels: {
    title: 'In any language, for everyone',
    description:
      'A real table with a caption and row headers, labelled controls, and every change read out to screen readers. ' +
      'Every text it shows or reads out can be replaced, e.g. in the page’s language.',
    code: `<su-lib-table caption="Productos" …
  [labels]="labels" />

labels = {
  save: 'Guardar',
  cancel: 'Cancelar',
  selected: (count) => \`\${count} seleccionadas\`,
};`,
  },
} satisfies Record<string, PageFeature>;
