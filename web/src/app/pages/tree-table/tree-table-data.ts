import { SuTreeTableColumns, SuTreeTableRowKind } from '@su-labs/tree-table';

/** A row of the garden shop's catalogue: a category, or a product */
export interface ShopItem {
  readonly id: string;
  readonly name: string;
  readonly unit?: string;
  readonly price?: number;
  readonly stock?: number;
  readonly isCategory?: boolean;
  readonly children?: readonly ShopItem[];
}

/** A team, with its people and budget, and the teams in it */
export interface Team {
  readonly id: string;
  readonly name: string;
  readonly people: number;
  readonly budget: number;
  readonly children?: readonly Team[];
}

/** A step of a trip plan */
export interface PlanStep {
  readonly id: string;
  readonly step: string;
  readonly when: string;
  readonly isStage?: boolean;
  readonly children?: readonly PlanStep[];
}

/** A line of an order, with how many lines its supplier and its text cover */
export interface OrderLine {
  readonly id: string;
  readonly item: string;
  readonly supplier: string;
  readonly price: number;
  readonly supplierRows?: number;
  readonly itemColumns?: number;
  readonly children?: readonly OrderLine[];
}

const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

export const formatEuros = (value: number | undefined): string => (value === undefined ? '' : euros.format(value));

export const shopItemId = (item: ShopItem): string => item.id;
export const shopChildren = (item: ShopItem): readonly ShopItem[] | undefined => item.children;
export const categoryKind = (item: ShopItem): SuTreeTableRowKind => (item.isCategory ? 'group' : 'data');
export const isCategory = (item: ShopItem): boolean => item.isCategory === true;

export const teamId = (team: Team): string => team.id;
export const teamChildren = (team: Team): readonly Team[] | undefined => team.children;

export const planStepId = (step: PlanStep): string => step.id;
export const planChildren = (step: PlanStep): readonly PlanStep[] | undefined => step.children;
export const stageKind = (step: PlanStep): SuTreeTableRowKind => (step.isStage ? 'group' : 'data');
export const isStage = (step: PlanStep): boolean => step.isStage === true;

export const orderLineId = (line: OrderLine): string => line.id;
export const orderChildren = (line: OrderLine): readonly OrderLine[] | undefined => line.children;

export const CATALOGUE: readonly ShopItem[] = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    stock: 214,
    isCategory: true,
    children: [
      {
        id: 'tomatoes',
        name: 'Tomatoes',
        unit: 'plant',
        price: 2.9,
        stock: 96,
        children: [
          { id: 'cherry', name: 'Cherry tomato', unit: 'plant', price: 2.9, stock: 60 },
          { id: 'beefsteak', name: 'Beefsteak tomato', unit: 'plant', price: 3.4, stock: 36 },
        ],
      },
      { id: 'lettuce', name: 'Lettuce', unit: 'tray of 6', price: 4.5, stock: 70 },
      { id: 'carrots', name: 'Carrots', unit: 'seed pack', price: 1.8, stock: 48 },
    ],
  },
  {
    id: 'herbs',
    name: 'Herbs',
    stock: 132,
    isCategory: true,
    children: [
      { id: 'basil', name: 'Basil', unit: 'pot', price: 3.2, stock: 54 },
      { id: 'mint', name: 'Mint', unit: 'pot', price: 2.8, stock: 40 },
      { id: 'rosemary', name: 'Rosemary', unit: 'pot', price: 4.1, stock: 38 },
    ],
  },
  {
    id: 'trees',
    name: 'Fruit trees',
    stock: 27,
    isCategory: true,
    children: [
      { id: 'apple', name: 'Apple tree', unit: 'tree', price: 39, stock: 12 },
      { id: 'pear', name: 'Pear tree', unit: 'tree', price: 42, stock: 9 },
      { id: 'plum', name: 'Plum tree', unit: 'tree', price: 36, stock: 6 },
    ],
  },
  {
    id: 'tools',
    name: 'Tools',
    stock: 85,
    isCategory: true,
    children: [
      { id: 'spade', name: 'Spade', unit: 'piece', price: 24.5, stock: 20 },
      { id: 'rake', name: 'Rake', unit: 'piece', price: 18, stock: 25 },
      { id: 'gloves', name: 'Gloves', unit: 'pair', price: 7.9, stock: 40 },
    ],
  },
];

export const CATALOGUE_COLUMNS: SuTreeTableColumns<ShopItem> = [
  { key: 'name', header: 'Item', sortable: true },
  { key: 'unit', header: 'Unit' },
  { key: 'price', header: 'Price', sortable: true, align: 'end', format: formatEuros },
  { key: 'stock', header: 'In stock', sortable: true, align: 'end' },
];

export const TEAMS: readonly Team[] = [
  {
    id: 'engineering',
    name: 'Engineering',
    people: 12,
    budget: 960000,
    children: [
      { id: 'web', name: 'Web', people: 5, budget: 400000 },
      { id: 'mobile', name: 'Mobile', people: 4, budget: 320000 },
      { id: 'platform', name: 'Platform', people: 3, budget: 240000 },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    people: 4,
    budget: 280000,
    children: [
      { id: 'product-design', name: 'Product', people: 3, budget: 210000 },
      { id: 'brand', name: 'Brand', people: 1, budget: 70000 },
    ],
  },
  { id: 'support', name: 'Support', people: 6, budget: 300000 },
];

const wholeEuros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export const TEAM_COLUMNS: SuTreeTableColumns<Team> = [
  { key: 'name', header: 'Team', sortable: true },
  { key: 'people', header: 'People', sortable: true, align: 'end' },
  { key: 'budget', header: 'Budget', sortable: true, align: 'end', format: (budget) => wholeEuros.format(budget) },
];

export const PLAN: readonly PlanStep[] = [
  {
    id: 'prepare',
    step: 'Prepare',
    when: 'A week before',
    isStage: true,
    children: [
      { id: 'book', step: 'Book the flights', when: 'Monday' },
      { id: 'pack', step: 'Pack', when: 'Friday' },
    ],
  },
  {
    id: 'travel',
    step: 'Travel',
    when: 'Saturday',
    isStage: true,
    children: [
      { id: 'check-in', step: 'Check in', when: '7:00' },
      { id: 'board', step: 'Board', when: '8:30' },
    ],
  },
  { id: 'arrive', step: 'Arrive', when: '11:00' },
];

export const PLAN_COLUMNS: SuTreeTableColumns<PlanStep> = [
  { key: 'step', header: 'Step' },
  { key: 'when', header: 'When' },
];

export const ORDER: readonly OrderLine[] = [
  {
    id: 'garden-order',
    item: 'Garden order',
    supplier: 'Several',
    price: 34.2,
    children: [
      { id: 'order-lettuce', item: 'Lettuce', supplier: 'Green Farm', price: 9, supplierRows: 2 },
      { id: 'order-carrots', item: 'Carrots', supplier: 'Green Farm', price: 3.6 },
      { id: 'order-basil', item: 'Basil', supplier: 'Herb Co', price: 6.4, supplierRows: 2 },
      { id: 'order-mint', item: 'Mint', supplier: 'Herb Co', price: 5.6 },
      { id: 'order-delivery', item: 'Delivery, free over €30', supplier: '', price: 0, itemColumns: 2 },
    ],
  },
];

export const ORDER_COLUMNS: SuTreeTableColumns<OrderLine> = [
  {
    key: 'item',
    header: 'Item',
    span: (_item, line) => (line.itemColumns ? { columns: line.itemColumns } : null),
  },
  {
    key: 'supplier',
    header: 'Supplier',
    span: (_supplier, line) => (line.supplierRows ? { rows: line.supplierRows } : null),
  },
  { key: 'price', header: 'Price', align: 'end', format: (price) => formatEuros(price) },
];
