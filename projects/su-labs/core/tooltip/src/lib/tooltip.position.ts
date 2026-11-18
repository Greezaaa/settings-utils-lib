import { SuTooltipAlign, SuTooltipIconPosition, SuTooltipIconPositionOptions, SuTooltipPlacement, SuTooltipPosition, SuTooltipPositionOptions, SuTooltipRect, SuTooltipSide, SuTooltipSize } from './tooltip.types';

const OPPOSITE: Readonly<Record<SuTooltipSide, SuTooltipSide>> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** Splits a placement into its side and how it lines up, e.g. `bottom-start` into `bottom` and `start` */
export function suTooltipPlacementParts(placement: SuTooltipPlacement): {
  readonly side: SuTooltipSide;
  readonly align: SuTooltipAlign;
} {
  const [side, align] = placement.split('-');
  return {
    side: isSide(side) ? side : 'top',
    align: align === 'start' || align === 'end' ? align : 'center',
  };
}

/**
 * Where a tooltip goes beside its trigger: on the asked side, or the other one when only that has room, kept
 * inside the viewport, with its arrow pointing at the trigger's middle and the point it should grow from.
 */
export function suTooltipPosition(
  trigger: SuTooltipRect,
  tooltip: SuTooltipSize,
  {
    placement = 'top',
    offset = 8,
    padding = 8,
    arrowPadding = 12,
    viewport,
    rtl = false,
  }: SuTooltipPositionOptions = {}
): SuTooltipPosition {
  const parts = suTooltipPlacementParts(placement);
  const side = viewport
    ? roomySide(parts.side, trigger, tooltip, viewport, offset + padding)
    : parts.side;
  const vertical = isVertical(side);
  const align = vertical && rtl ? mirror(parts.align) : parts.align;
  const x = vertical
    ? along(trigger.left, trigger.width, tooltip.width, align)
    : side === 'left'
      ? trigger.left - offset - tooltip.width
      : trigger.left + trigger.width + offset;
  const y = vertical
    ? side === 'top'
      ? trigger.top - offset - tooltip.height
      : trigger.top + trigger.height + offset
    : along(trigger.top, trigger.height, tooltip.height, align);
  const left = viewport ? fit(x, tooltip.width, viewport.width, padding) : x;
  const top = viewport ? fit(y, tooltip.height, viewport.height, padding) : y;
  const arrow = vertical
    ? clamp(
        trigger.left + trigger.width / 2 - left,
        arrowPadding,
        tooltip.width - arrowPadding
      )
    : clamp(
        trigger.top + trigger.height / 2 - top,
        arrowPadding,
        tooltip.height - arrowPadding
      );
  const origin = vertical
    ? { x: arrow, y: side === 'top' ? tooltip.height + offset : -offset }
    : { x: side === 'left' ? tooltip.width + offset : -offset, y: arrow };
  return { x: left, y: top, side, arrow, origin };
}

/**
 * Where an icon tooltip goes: with one corner on the icon, so it can grow out of it towards the placement's side,
 * moved to the other side when only that one has room, and kept inside the viewport.
 */
export function suTooltipIconPosition(
  icon: SuTooltipRect,
  tooltip: SuTooltipSize,
  {
    placement = 'bottom-start',
    inset = 6,
    padding = 8,
    viewport,
    rtl = false,
  }: SuTooltipIconPositionOptions = {}
): SuTooltipIconPosition {
  const { side, align } = suTooltipPlacementParts(placement);
  const startsLeft = (align === 'end') === rtl;
  const askedInline = isVertical(side)
    ? startsLeft
      ? 'left'
      : 'right'
    : side === 'right'
      ? 'left'
      : 'right';
  const askedBlock = isVertical(side)
    ? side === 'bottom'
      ? 'top'
      : 'bottom'
    : align === 'end'
      ? 'bottom'
      : 'top';
  const xFor = (inline: 'left' | 'right') =>
    inline === 'left'
      ? icon.left - inset
      : icon.left + icon.width + inset - tooltip.width;
  const yFor = (block: 'top' | 'bottom') =>
    block === 'top'
      ? icon.top - inset
      : icon.top + icon.height + inset - tooltip.height;
  const inline = viewport
    ? roomyCorner(askedInline, askedInline === 'left' ? 'right' : 'left', xFor, tooltip.width, viewport.width, padding)
    : askedInline;
  const block = viewport
    ? roomyCorner(askedBlock, askedBlock === 'top' ? 'bottom' : 'top', yFor, tooltip.height, viewport.height, padding)
    : askedBlock;
  const x = viewport
    ? fit(xFor(inline), tooltip.width, viewport.width, padding)
    : xFor(inline);
  const y = viewport
    ? fit(yFor(block), tooltip.height, viewport.height, padding)
    : yFor(block);
  return { x, y, icon: { x: icon.left - x, y: icon.top - y }, inline, block };
}

/**
 * The CSS `clip-path` an icon tooltip grows from and to: from a circle on the icon to the whole tooltip, so it
 * looks like the icon opening up.
 * @param radius The tooltip's corner radius when open
 */
export function suTooltipIconClip(
  position: SuTooltipIconPosition,
  tooltip: SuTooltipSize,
  iconSize: number,
  radius: number
): { readonly from: string; readonly to: string } {
  const { x, y } = position.icon;
  const right = tooltip.width - x - iconSize;
  const bottom = tooltip.height - y - iconSize;
  return {
    from: `inset(${y}px ${right}px ${bottom}px ${x}px round ${iconSize / 2}px)`,
    to: `inset(0px 0px 0px 0px round ${radius}px)`,
  };
}

function isSide(value: string | undefined): value is SuTooltipSide {
  return (
    value === 'top' || value === 'right' || value === 'bottom' || value === 'left'
  );
}

function isVertical(side: SuTooltipSide): boolean {
  return side === 'top' || side === 'bottom';
}

function mirror(align: SuTooltipAlign): SuTooltipAlign {
  return align === 'start' ? 'end' : align === 'end' ? 'start' : align;
}

function along(
  start: number,
  length: number,
  size: number,
  align: SuTooltipAlign
): number {
  if (align === 'start') {
    return start;
  }
  if (align === 'end') {
    return start + length - size;
  }
  return start + length / 2 - size / 2;
}

function roomySide(
  side: SuTooltipSide,
  trigger: SuTooltipRect,
  tooltip: SuTooltipSize,
  viewport: SuTooltipSize,
  gap: number
): SuTooltipSide {
  const room: Readonly<Record<SuTooltipSide, number>> = {
    top: trigger.top,
    bottom: viewport.height - trigger.top - trigger.height,
    left: trigger.left,
    right: viewport.width - trigger.left - trigger.width,
  };
  const needed = (isVertical(side) ? tooltip.height : tooltip.width) + gap;
  const other = OPPOSITE[side];
  return room[side] < needed && room[other] > room[side] ? other : side;
}

function roomyCorner<T extends string>(
  asked: T,
  other: T,
  edgeFor: (corner: T) => number,
  size: number,
  viewportSize: number,
  padding: number
): T {
  return overflow(edgeFor(asked), size, viewportSize, padding) >
    overflow(edgeFor(other), size, viewportSize, padding)
    ? other
    : asked;
}

function overflow(
  start: number,
  size: number,
  viewportSize: number,
  padding: number
): number {
  return (
    Math.max(0, padding - start) +
    Math.max(0, start + size - (viewportSize - padding))
  );
}

function fit(
  start: number,
  size: number,
  viewportSize: number,
  padding: number
): number {
  return clamp(start, padding, viewportSize - padding - size);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
