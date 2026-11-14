/**
 * Where a dragged row lands: the number of other rows whose middle is above the pointer.
 * @param pointerY The pointer's vertical position
 * @param rowMiddles The vertical middle of every row, in display order, the dragged one included
 * @param fromIndex The dragged row's position
 */
export function suTableDropIndex(
  pointerY: number,
  rowMiddles: readonly number[],
  fromIndex: number
): number {
  return rowMiddles.filter(
    (middle, index) => index !== fromIndex && middle < pointerY
  ).length;
}
