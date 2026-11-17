import { SuTableAction, SuTableColumn, SuTableColumns, SuTableLabels } from '@su-labs/table';
import { CATEGORY, EDITABLE, IN_STOCK, NAME, PRICE_COLUMN, Product, PRODUCTS, RESTOCKED, SKU, SUPPLIER } from './table-products';

const columns = (list: SuTableColumns<Product>): SuTableColumns<Product> => list;

/** A few products, for the small examples */
export const SAMPLE: readonly Product[] = PRODUCTS.slice(0, 5);

/** A product with more details, so the pinned columns example is wide enough to scroll */
export interface DetailedProduct extends Product {
  readonly origin: string;
  readonly warehouse: string;
  readonly weightKg: number;
  readonly rating: number;
  readonly barcode: string;
}

const DETAILS: readonly Pick<DetailedProduct, 'origin' | 'warehouse' | 'weightKg' | 'rating' | 'barcode'>[] = [
  { origin: 'Germany', warehouse: 'Valencia', weightKg: 0.6, rating: 4.7, barcode: '8412345001011' },
  { origin: 'Spain', warehouse: 'Bilbao', weightKg: 0.9, rating: 4.2, barcode: '8412345001028' },
  { origin: 'Japan', warehouse: 'Valencia', weightKg: 0.3, rating: 4.9, barcode: '8412345001035' },
  { origin: 'Italy', warehouse: 'Madrid', weightKg: 0.25, rating: 4.5, barcode: '8412345001042' },
  { origin: 'China', warehouse: 'Bilbao', weightKg: 1.4, rating: 4.4, barcode: '8412345001059' },
];

/** The sample products with their details, for the pinned columns example */
export const DETAILED_SAMPLE: readonly DetailedProduct[] = SAMPLE.map((product, index) => ({
  ...product,
  ...(DETAILS[index] ?? DETAILS[0]),
}));

const KILOGRAMS = new Intl.NumberFormat('en', { style: 'unit', unit: 'kilogram', maximumFractionDigits: 2 });

const ORIGIN: SuTableColumn<DetailedProduct, 'origin'> = { key: 'origin', header: 'Origin', sortable: true };
const WAREHOUSE: SuTableColumn<DetailedProduct, 'warehouse'> = {
  key: 'warehouse',
  header: 'Warehouse',
  sortable: true,
};
const WEIGHT: SuTableColumn<DetailedProduct, 'weightKg'> = {
  key: 'weightKg',
  header: 'Weight',
  sortable: true,
  align: 'end',
  format: (weight) => KILOGRAMS.format(weight),
};
const RATING: SuTableColumn<DetailedProduct, 'rating'> = {
  key: 'rating',
  header: 'Rating',
  sortable: true,
  align: 'end',
  format: (rating) => `${rating} / 5`,
};
const BARCODE: SuTableColumn<DetailedProduct, 'barcode'> = { key: 'barcode', header: 'Barcode', sortable: true };

/** The pinned columns example: wide enough that the middle columns scroll under the pinned ones */
export const PINNED_COLUMNS: SuTableColumns<DetailedProduct> = [
  { ...NAME, pinned: 'start' },
  { ...SKU, pinnable: true },
  { ...CATEGORY, pinnable: true },
  SUPPLIER,
  RESTOCKED,
  ORIGIN,
  WAREHOUSE,
  WEIGHT,
  RATING,
  BARCODE,
  { ...PRICE_COLUMN, pinned: 'end' },
];

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
  theming: columns([NAME, CATEGORY, PRICE_COLUMN, IN_STOCK]),
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

/** The theming example: out-of-stock products are muted */
export const mutedWhenOutOfStock = (product: Product): string | null => (product.inStock ? null : 'is-muted');
