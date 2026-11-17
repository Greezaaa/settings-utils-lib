import { SU_TABLE_LABELS } from '@su-labs/core/table';
import { SuTreeTableLabels } from './tree-table.types';

/** The default English texts: the table's, and the tree's own */
export const SU_TREE_TABLE_LABELS: SuTreeTableLabels = {
  ...SU_TABLE_LABELS,
  expandRow: rowLabel => `Expand ${rowLabel}`,
  collapseRow: rowLabel => `Collapse ${rowLabel}`,
  number: 'No.',
};
