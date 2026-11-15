import { suCheckboxEditor, suDateEditor, suNumberEditor, suSelectEditor, SuTableColumn, SuTableColumns, suTextEditor } from '@su-labs/table';

export type Category = 'tools' | 'garden' | 'kitchen';

export interface Product {
  readonly id: number;
  readonly name: string;
  readonly sku: string;
  readonly category: Category;
  readonly supplier: string;
  readonly price: number;
  readonly inStock: boolean;
  readonly restocked: string;
}

export const CATEGORIES = [
  { value: 'tools', label: 'Tools' },
  { value: 'garden', label: 'Garden' },
  { value: 'kitchen', label: 'Kitchen' },
] as const satisfies readonly { value: Category; label: string }[];

export const PRODUCTS: readonly Product[] = [
  {
    id: 101,
    name: 'Claw hammer',
    sku: 'SU-TOO-101',
    category: 'tools',
    supplier: 'Forge & Co',
    price: 18.5,
    inStock: true,
    restocked: '2026-10-02',
  },
  {
    id: 102,
    name: 'Watering can',
    sku: 'SU-GAR-102',
    category: 'garden',
    supplier: 'Greenleaf',
    price: 12,
    inStock: false,
    restocked: '2026-08-19',
  },
  {
    id: 103,
    name: 'Chef’s knife',
    sku: 'SU-KIT-103',
    category: 'kitchen',
    supplier: 'Copper Pot',
    price: 64.9,
    inStock: true,
    restocked: '2026-11-01',
  },
  {
    id: 104,
    name: 'Pruning shears',
    sku: 'SU-GAR-104',
    category: 'garden',
    supplier: 'Greenleaf',
    price: 22.75,
    inStock: true,
    restocked: '2026-09-14',
  },
  {
    id: 105,
    name: 'Cordless drill',
    sku: 'SU-TOO-105',
    category: 'tools',
    supplier: 'Forge & Co',
    price: 119,
    inStock: false,
    restocked: '2026-07-30',
  },
  {
    id: 106,
    name: 'Cast-iron pan',
    sku: 'SU-KIT-106',
    category: 'kitchen',
    supplier: 'Copper Pot',
    price: 39.95,
    inStock: true,
    restocked: '2026-10-21',
  },
  {
    id: 107,
    name: 'Spirit level',
    sku: 'SU-TOO-107',
    category: 'tools',
    supplier: 'Forge & Co',
    price: 14.2,
    inStock: true,
    restocked: '2026-09-03',
  },
  {
    id: 108,
    name: 'Garden hose',
    sku: 'SU-GAR-108',
    category: 'garden',
    supplier: 'Greenleaf',
    price: 29.99,
    inStock: true,
    restocked: '2026-10-12',
  },
  {
    id: 109,
    name: 'Pepper mill',
    sku: 'SU-KIT-109',
    category: 'kitchen',
    supplier: 'Copper Pot',
    price: 24.5,
    inStock: false,
    restocked: '2026-06-27',
  },
  {
    id: 110,
    name: 'Tape measure',
    sku: 'SU-TOO-110',
    category: 'tools',
    supplier: 'Forge & Co',
    price: 9.8,
    inStock: true,
    restocked: '2026-11-05',
  },
  {
    id: 111,
    name: 'Seed tray',
    sku: 'SU-GAR-111',
    category: 'garden',
    supplier: 'Greenleaf',
    price: 6.45,
    inStock: true,
    restocked: '2026-10-30',
  },
  {
    id: 112,
    name: 'Mixing bowls',
    sku: 'SU-KIT-112',
    category: 'kitchen',
    supplier: 'Copper Pot',
    price: 32,
    inStock: false,
    restocked: '2026-08-08',
  },
];

const PRICE = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });
const DAY = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });

export const NAME: SuTableColumn<Product, 'name'> = { key: 'name', header: 'Product', sortable: true };
export const SKU: SuTableColumn<Product, 'sku'> = { key: 'sku', header: 'SKU', sortable: true };
export const CATEGORY: SuTableColumn<Product, 'category'> = {
  key: 'category',
  header: 'Category',
  sortable: true,
  format: (category) => CATEGORIES.find((item) => item.value === category)?.label ?? category,
};
export const SUPPLIER: SuTableColumn<Product, 'supplier'> = { key: 'supplier', header: 'Supplier', sortable: true };
export const PRICE_COLUMN: SuTableColumn<Product, 'price'> = {
  key: 'price',
  header: 'Price',
  sortable: true,
  align: 'end',
  format: (price) => PRICE.format(price),
};
export const IN_STOCK: SuTableColumn<Product, 'inStock'> = {
  key: 'inStock',
  header: 'In stock',
  sortable: true,
  align: 'center',
};
export const RESTOCKED: SuTableColumn<Product, 'restocked'> = {
  key: 'restocked',
  header: 'Restocked',
  sortable: true,
  format: (day) => DAY.format(new Date(day)),
};

/** The same columns, editable */
export const EDITABLE = {
  name: { ...NAME, edit: suTextEditor({ requiredMessage: 'Enter a name' }) },
  category: { ...CATEGORY, edit: suSelectEditor<Category>(CATEGORIES) },
  supplier: { ...SUPPLIER, edit: suTextEditor({ requiredMessage: 'Enter a supplier' }) },
  price: {
    ...PRICE_COLUMN,
    edit: suNumberEditor({ min: 0, step: 0.01, invalidMessage: 'Enter a price of 0 or more' }),
  },
  inStock: { ...IN_STOCK, edit: suCheckboxEditor() },
  restocked: { ...RESTOCKED, edit: suDateEditor() },
} as const;

/** Every column of the main demo */
export const PRODUCT_COLUMNS: SuTableColumns<Product> = [
  { ...EDITABLE.name, pinned: 'start' },
  SKU,
  EDITABLE.category,
  EDITABLE.supplier,
  EDITABLE.price,
  EDITABLE.inStock,
  { ...EDITABLE.restocked, hidden: true },
];

export const productId = (product: Product): number => product.id;
