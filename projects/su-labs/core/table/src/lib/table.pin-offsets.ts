import { SuTablePin } from './table.types';

/** Where one cell of a pinned column sticks */
export interface SuTablePinOffset {
  readonly pin: SuTablePin;
  /** The distance from its edge: the width of the pinned cells before it */
  readonly offset: number;
  /** The innermost pinned cell on its side, which casts the shadow over the scrolling cells */
  readonly edge: boolean;
}

/**
 * Where each heading slot sticks, from each slot's pin and width. When the pinned cells would leave less than
 * `minScrollingWidth` of the scroller for the others (e.g. on a phone), nothing sticks.
 */
export function suPinOffsets(
  pins: readonly (SuTablePin | null)[],
  widths: readonly number[],
  scrollerWidth: number,
  minScrollingWidth: number
): readonly (SuTablePinOffset | null)[] {
  const pinnedWidth = pins.reduce(
    (sum, pin, index) => (pin ? sum + (widths[index] ?? 0) : sum),
    0
  );
  if (pinnedWidth > scrollerWidth - minScrollingWidth) {
    return pins.map(() => null);
  }
  const lastStart = pins.lastIndexOf('start');
  const firstEnd = pins.indexOf('end');
  const widthOf = (pin: SuTablePin, from: number, to: number): number =>
    pins
      .slice(from, to)
      .reduce(
        (sum, slotPin, index) =>
          slotPin === pin ? sum + (widths[from + index] ?? 0) : sum,
        0
      );
  return pins.map((pin, index) =>
    pin
      ? {
          pin,
          offset:
            pin === 'start'
              ? widthOf(pin, 0, index)
              : widthOf(pin, index + 1, pins.length),
          edge: index === (pin === 'start' ? lastStart : firstEnd),
        }
      : null
  );
}
