import { SuTableAction, SuTableColumns, SuTableLabels } from '@su-labs/table';
import { CATEGORY, EDITABLE, IN_STOCK, NAME, PRICE_COLUMN, Product, PRODUCTS, RESTOCKED, SKU, SUPPLIER } from './table-products';

const columns = (list: SuTableColumns<Product>): SuTableColumns<Product> => list;

/** A few products, for the small examples */
export const SAMPLE: readonly Product[] = PRODUCTS.slice(0, 5);

/** The columns of each small example under the demo */
export const EXAMPLE_COLUMNS = {
  columns: columns([
    { ...NAME, sortable: false },
    { ...CATEGORY, sortable: false },
    { ...PRICE_COLUMN, sortable: false },
    { ...IN_STOCK, sortable: false },
  ]),
  sorting: columns([NAME, CATEGORY, PRICE_COLUMN, RESTOCKED]),
  editing: columns([EDITABLE.name, EDITABLE.price, EDITABLE.inStock]),
  doubleClick: columns([EDITABLE.name, EDITABLE.category, EDITABLE.price]),
  editors: columns([NAME, EDITABLE.category, EDITABLE.price, EDITABLE.inStock, EDITABLE.restocked]),
  bulk: columns([NAME, EDITABLE.category, EDITABLE.supplier, EDITABLE.inStock]),
  actions: columns([NAME, PRICE_COLUMN]),
  reordering: columns([NAME, CATEGORY, SUPPLIER]),
  pinnedColumns: columns([
    { ...NAME, pinned: 'start' },
    { ...SKU, pinnable: true },
    { ...CATEGORY, pinnable: true },
    SUPPLIER,
    RESTOCKED,
    { ...PRICE_COLUMN, pinned: 'end' },
  ]),
  pinnedRows: columns([NAME, SUPPLIER, PRICE_COLUMN]),
  search: columns([NAME, CATEGORY, SUPPLIER, PRICE_COLUMN]),
  hiding: columns([
    NAME,
    SKU,
    CATEGORY,
    SUPPLIER,
    PRICE_COLUMN,
    { ...IN_STOCK, hidden: true },
    { ...RESTOCKED, hidden: true },
  ]),
  pages: columns([NAME, CATEGORY, PRICE_COLUMN]),
  sticky: columns([NAME, CATEGORY, SUPPLIER, PRICE_COLUMN]),
  customCells: columns([NAME, PRICE_COLUMN, IN_STOCK]),
  labels: columns([
    { ...EDITABLE.name, header: 'Producto' },
    { ...CATEGORY, header: 'Categoría' },
    { ...PRICE_COLUMN, header: 'Precio' },
  ]),
};

export const EDIT_ACTION: readonly SuTableAction<Product>[] = [{ id: 'edit', label: 'Edit' }];

export const ROW_ACTIONS: readonly SuTableAction<Product>[] = [
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete', danger: true, disabled: (product) => product.inStock },
];

export const SPANISH: Partial<SuTableLabels> = {
  search: 'Buscar',
  selectAll: 'Seleccionar todas las filas',
  selectRow: (rowLabel) => `Seleccionar ${rowLabel}`,
  selected: (count) => (count === 1 ? '1 fila seleccionada' : `${count} filas seleccionadas`),
  clearSelection: 'Quitar la selección',
  editSelected: (count) => (count === 1 ? 'Editar 1 fila' : `Editar ${count} filas`),
  editing: (count) => (count === 1 ? 'Editando 1 fila' : `Editando ${count} filas`),
  saved: (count) => (count === 1 ? '1 fila guardada' : `${count} filas guardadas`),
  save: 'Guardar',
  cancel: 'Cancelar',
  actions: 'Acciones',
  mixed: 'Valores distintos',
  sortedAscending: (header) => `Ordenado por ${header}, ascendente`,
  sortedDescending: (header) => `Ordenado por ${header}, descendente`,
  sortCleared: 'Orden quitado',
  matches: (count) => (count === 1 ? '1 fila coincide' : `${count} filas coinciden`),
  searchCleared: 'Búsqueda borrada',
  noMatches: (query) => `Ninguna fila coincide con “${query}”`,
  empty: 'Sin filas',
};
