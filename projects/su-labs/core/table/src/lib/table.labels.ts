import { SuTableLabels } from './table.types';

const rows = (count: number): string =>
  count === 1 ? '1 row' : `${count} rows`;

/** The default English texts */
export const SU_TABLE_LABELS: SuTableLabels = {
  sortedAscending: header => `Sorted by ${header}, ascending`,
  sortedDescending: header => `Sorted by ${header}, descending`,
  sortCleared: 'Sort cleared',
  selected: count => `${rows(count)} selected`,
  grabbed: (position, total) =>
    `Row picked up, position ${position} of ${total}. ` +
    'Use the arrow keys to move it, Space to drop it, Escape to cancel.',
  moved: (position, total) => `Position ${position} of ${total}`,
  dropped: (position, total) =>
    `Row dropped at position ${position} of ${total}`,
  moveCancelled: 'Move cancelled',
  editing: count => `Editing ${rows(count)}`,
  saved: count => `${rows(count)} saved`,
  editCancelled: 'Editing cancelled',
  invalid: count =>
    count === 1 ? '1 field needs fixing' : `${count} fields need fixing`,
  yes: 'Yes',
  no: 'No',
  empty: 'No rows',
  selectAll: 'Select all rows',
  selectRow: rowLabel => `Select ${rowLabel}`,
  moveRow: rowLabel => `Move ${rowLabel}`,
  order: 'Order',
  actions: 'Actions',
  save: 'Save',
  cancel: 'Cancel',
  editSelected: count => `Edit ${rows(count)}`,
  clearSelection: 'Clear selection',
  mixed: 'Mixed values',
  columns: 'Columns',
  pinNone: 'Not pinned',
  pinStart: 'Pinned to the start',
  pinEnd: 'Pinned to the end',
  columnPinned: (header, pin) => `${header} pinned to the ${pin}`,
  columnUnpinned: header => `${header} unpinned`,
};
