import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SuTableSort } from '@su-labs/table';
import { SuTreeTableComponent, SuTreeTableNumbering, SuTreeTableRowKind, SuTreeTableToggleEvent } from '@su-labs/tree-table';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { PageFeatureExample } from '../../shared/page-feature';
import { UtilityPage } from '../../shared/utility-page';
import { CATALOGUE, CATALOGUE_COLUMNS, categoryKind, isCategory, isStage, ORDER, ORDER_COLUMNS, orderChildren, orderLineId, PLAN, PLAN_COLUMNS, planChildren, planStepId, shopChildren, ShopItem, shopItemId, stageKind, TEAM_COLUMNS, teamChildren, teamId, TEAMS } from './tree-table-data';
import { TREE_TABLE_FEATURES } from './tree-table-features';

const NUMBERINGS: readonly SuTreeTableNumbering[] = ['nested', 'restart', 'continue'];

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `interface ShopItem { id: string; name: string; price?: number; isCategory?: boolean; children?: ShopItem[] }

protected readonly columns: SuTreeTableColumns<ShopItem> = [
  { key: 'name', header: 'Item', sortable: true },
  { key: 'price', header: 'Price', sortable: true, align: 'end', format: (price) => euros(price) },
];
protected readonly childrenOf = (item: ShopItem) => item.children;
protected readonly kindOf = (item: ShopItem) => (item.isCategory ? 'group' : 'data');

<su-lib-tree-table
  caption="Catalogue"
  numbered
  searchable
  [columns]="columns"
  [rows]="catalogue()"
  [rowId]="itemId"
  [children]="childrenOf"
  [rowKind]="kindOf"
  [unnumbered]="isCategory"
  [pageSize]="2"
  (toggled)="saveOpenRows($event.expandedIds)"
/>`,
  },
  {
    label: 'Any framework',
    code: `import { SuTreeTableController } from '@su-labs/core/tree-table';

const tree = new SuTreeTableController({
  columns: [
    { key: 'name', header: 'Item', sortable: true },
    { key: 'price', header: 'Price', sortable: true },
  ],
  rowId: (item) => item.id,
  children: (item) => item.children,
  rowKind: (item) => (item.isCategory ? 'group' : 'data'),
  numbering: 'nested',
  rows: await api.catalogue(),
});

tree.state.subscribe((state) => render(state)); // a <table role="treegrid"> with your own markup

tree.toggle('herbs');
tree.rowKey('herbs', 'ArrowRight'); // { handled: true, focusId: 'basil' }`,
  },
  {
    label: 'Theme',
    code: `:root {
  --su-table-border: 1px solid var(--border);
  --su-table-header-background: var(--subtle);
  --su-tree-table-group-background: var(--subtle);
  --su-tree-table-indent: 1.5rem;
}`,
  },
];

@Component({
  selector: 'app-tree-table-page',
  imports: [PageFeatureExample, SuTreeTableComponent, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tree-table-page.html',
  styleUrl: './tree-table-page.scss',
})
export class TreeTablePage {
  protected readonly utility = getUtility('tree-table');
  protected readonly usage = USAGE;
  protected readonly features = TREE_TABLE_FEATURES;
  protected readonly numberings = NUMBERINGS;

  protected readonly catalogue = CATALOGUE;
  protected readonly catalogueColumns = CATALOGUE_COLUMNS;
  protected readonly shopItemId = shopItemId;
  protected readonly shopChildren = shopChildren;
  protected readonly categoryKind = categoryKind;
  protected readonly isCategory = isCategory;
  protected readonly teams = TEAMS;
  protected readonly teamColumns = TEAM_COLUMNS;
  protected readonly teamId = teamId;
  protected readonly teamChildren = teamChildren;
  protected readonly plan = PLAN;
  protected readonly planColumns = PLAN_COLUMNS;
  protected readonly planStepId = planStepId;
  protected readonly planChildren = planChildren;
  protected readonly stageKind = stageKind;
  protected readonly isStage = isStage;
  protected readonly order = ORDER;
  protected readonly orderColumns = ORDER_COLUMNS;
  protected readonly orderLineId = orderLineId;
  protected readonly orderChildren = orderChildren;

  protected readonly groupRows = signal(true);
  protected readonly numbered = signal(true);
  protected readonly numbering = signal<SuTreeTableNumbering>('nested');
  protected readonly openAll = signal(false);
  protected readonly lastToggle = signal('none');
  protected readonly sort = signal('none');

  /** A new function whenever the choice changes, so the table takes it up */
  protected readonly catalogueKind = computed(() => {
    const groups = this.groupRows();
    return (item: ShopItem): SuTreeTableRowKind => (groups ? categoryKind(item) : 'data');
  });
  protected readonly unnumberedCategory = computed(() => {
    const groups = this.groupRows();
    return (item: ShopItem): boolean => groups && isCategory(item);
  });

  protected onToggled({ row, expanded }: SuTreeTableToggleEvent<ShopItem>): void {
    this.lastToggle.set(`${row.name} ${expanded ? 'opened' : 'closed'}`);
  }

  protected onSort(sort: SuTableSort<ShopItem> | null): void {
    this.sort.set(sort ? `${String(sort.key)} · ${sort.direction}` : 'none');
  }

  protected chooseNumbering(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const { value } = event.target;
      const option = NUMBERINGS.find((item) => item === value);
      if (option) {
        this.numbering.set(option);
      }
    }
  }

  protected setFlag(flag: (value: boolean) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      flag(event.target.checked);
    }
  }
}
