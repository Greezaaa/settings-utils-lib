import { PageFeature } from '../../shared/page-feature';

export const TREE_TABLE_FEATURES = {
  dataParents: {
    title: 'Parents with their own data',
    description:
      'Every row with children opens and closes, and by default it’s a normal row with its own cells: a team ' +
      'with its people and budget, over the teams in it. Rows nest as deep as your data does, each level indented ' +
      'under its parent.',
    code: `<su-lib-tree-table
  caption="Teams"
  [columns]="columns"
  [rows]="teams"
  [rowId]="teamId"
  [children]="childrenOf"
/>

childrenOf = (team: Team) => team.children;`,
  },
  groupRows: {
    title: 'Group rows',
    description:
      'A parent can also be just a heading: a group row spans the whole table with its label, and its children ' +
      'carry the data. Its text is the first column’s, or your own groupLabel. Data parents and group rows can mix ' +
      'in one table.',
    code: `<su-lib-tree-table
  caption="Catalogue"
  [columns]="columns"
  [rows]="catalogue"
  [children]="childrenOf"
  [rowKind]="kindOf"
/>

kindOf = (item: ShopItem) => (item.isCategory ? 'group' : 'data');`,
  },
  nested: {
    title: 'Numbers that nest',
    description:
      'numbered adds a first column with each row’s number. By default children are numbered under their parent: ' +
      '1, 1.1, 1.2, then 2. Numbers count the whole tree, open or not, so closing a row or searching never ' +
      'renumbers the rest.',
    code: `<su-lib-tree-table
  caption="Trip plan"
  numbered
  [columns]="columns"
  [rows]="plan"
  [children]="childrenOf"
/>`,
  },
  restart: {
    title: 'Numbers that restart',
    description:
      'With numbering set to restart, each parent’s children count from 1 again, while the parents keep their own ' +
      'count. Pass a function instead of a word to choose per parent.',
    code: `<su-lib-tree-table
  caption="Trip plan"
  numbered
  numbering="restart"
  [columns]="columns"
  [rows]="plan"
  [children]="childrenOf"
/>`,
  },
  continue: {
    title: 'One running count, without the headings',
    description:
      'With numbering set to continue, the count goes on through the children, and unnumbered leaves rows out of ' +
      'it: here the stage headings are group rows without a number, and the steps count 1 to 5 across them.',
    code: `<su-lib-tree-table
  caption="Trip plan"
  numbered
  numbering="continue"
  [columns]="columns"
  [rows]="plan"
  [children]="childrenOf"
  [rowKind]="kindOf"
  [unnumbered]="isStage"
/>

isStage = (step: PlanStep) => step.isStage === true;`,
  },
  merged: {
    title: 'Merged cells',
    description:
      'A column’s span merges a cell with the cells below it or after it. They render as real rowspan and colspan ' +
      'cells, so screen readers still read each one with every row and column it covers. A span stays within its ' +
      'parent’s rows.',
    code: `{
  key: 'supplier',
  header: 'Supplier',
  span: (supplier, line) => (line.supplierRows ? { rows: line.supplierRows } : null),
},
{
  key: 'item',
  header: 'Item',
  span: (item, line) => (line.itemColumns ? { columns: line.itemColumns } : null),
},`,
  },
  search: {
    title: 'Search keeps the way to a match',
    description:
      'The search looks through every level. A match keeps its parents on view, opened to show it, and its own ' +
      'children; everything else steps aside until the search is cleared. Try “mint” or “tree”.',
    code: `<su-lib-tree-table
  caption="Catalogue"
  searchable
  [columns]="columns"
  [rows]="catalogue"
  [children]="childrenOf"
/>`,
  },
  sorting: {
    title: 'Sorting within each parent',
    description:
      'Sorting orders each parent’s children by the column, and the top-level rows among themselves, so a child ' +
      'never leaves its parent. Paging works the same way: it counts top-level rows, and a parent always shares a ' +
      'page with its children.',
    code: `columns: SuTreeTableColumns<Team> = [
  { key: 'name', header: 'Team', sortable: true },
  { key: 'people', header: 'People', sortable: true },
];`,
  },
  keyboard: {
    title: 'A treegrid for the keyboard',
    description:
      'The table is a treegrid with each row’s level, place and open state for screen readers. One row is in the ' +
      'tab order: the up and down arrows move between rows, the right arrow opens a row or steps into it, and the ' +
      'left arrow closes it or goes back to its parent.',
    code: `<tr role="row" aria-level="2" aria-posinset="1" aria-setsize="3" aria-expanded="false" tabindex="0">`,
  },
} satisfies Record<string, PageFeature>;
