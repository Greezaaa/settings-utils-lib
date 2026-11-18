import { describe, expect, it } from 'vitest';
import { suTooltipIconClip, suTooltipIconPosition, suTooltipPlacementParts, suTooltipPosition } from './tooltip.position';

const TRIGGER = { top: 200, left: 300, width: 100, height: 20 };
const TOOLTIP = { width: 160, height: 40 };
const VIEWPORT = { width: 1000, height: 800 };
const ICON = { top: 100, left: 100, width: 24, height: 24 };

describe('suTooltipPlacementParts', () => {
  it('splits a placement into its side and alignment', () => {
    expect(suTooltipPlacementParts('top')).toEqual({ side: 'top', align: 'center' });
    expect(suTooltipPlacementParts('left-end')).toEqual({ side: 'left', align: 'end' });
  });
});

describe('suTooltipPosition', () => {
  it('centres the tooltip above the trigger with the arrow and origin at its middle', () => {
    expect(suTooltipPosition(TRIGGER, TOOLTIP, { viewport: VIEWPORT })).toEqual({
      x: 270,
      y: 152,
      side: 'top',
      arrow: 80,
      origin: { x: 80, y: 48 },
    });
  });

  it('lines up with the start or end of the trigger, mirrored right to left', () => {
    expect(suTooltipPosition(TRIGGER, TOOLTIP, { placement: 'bottom-start' })).toMatchObject({ x: 300, y: 228, side: 'bottom', origin: { x: 50, y: -8 } });
    expect(suTooltipPosition(TRIGGER, TOOLTIP, { placement: 'bottom-end' }).x).toBe(240);
    expect(suTooltipPosition(TRIGGER, TOOLTIP, { placement: 'bottom-start', rtl: true }).x).toBe(240);
  });

  it('places it beside the trigger on the left or right', () => {
    expect(suTooltipPosition(TRIGGER, TOOLTIP, { placement: 'right' })).toMatchObject({ x: 408, y: 190, side: 'right', arrow: 20, origin: { x: -8, y: 20 } });
    expect(suTooltipPosition(TRIGGER, TOOLTIP, { placement: 'left-start' })).toMatchObject({ x: 132, y: 200, side: 'left', origin: { x: 168, y: 12 } });
  });

  it('moves to the other side when the asked one has no room', () => {
    const nearTop = { ...TRIGGER, top: 10 };

    expect(suTooltipPosition(nearTop, TOOLTIP, { viewport: VIEWPORT }).side).toBe('bottom');
    expect(suTooltipPosition(nearTop, TOOLTIP).side).toBe('top');
  });

  it('stays inside the viewport and keeps the arrow on the trigger, away from the corners', () => {
    const nearLeft = { ...TRIGGER, left: 0, width: 10 };
    const position = suTooltipPosition(nearLeft, TOOLTIP, { viewport: VIEWPORT });

    expect(position.x).toBe(8);
    expect(position.arrow).toBe(12);
  });
});

describe('suTooltipIconPosition', () => {
  it('puts the tooltip\'s top left corner on the icon for bottom-start', () => {
    expect(suTooltipIconPosition(ICON, TOOLTIP)).toEqual({ x: 94, y: 94, icon: { x: 6, y: 6 }, inline: 'left', block: 'top' });
  });

  it('grows up and to the left for top-end, or the other way right to left', () => {
    expect(suTooltipIconPosition(ICON, TOOLTIP, { placement: 'top-end' })).toMatchObject({ x: -30, y: 90, inline: 'right', block: 'bottom' });
    expect(suTooltipIconPosition(ICON, TOOLTIP, { placement: 'top-end', rtl: true })).toMatchObject({ inline: 'left', block: 'bottom' });
  });

  it('grows towards the left or right side from the icon\'s top, or its bottom for -end', () => {
    expect(suTooltipIconPosition(ICON, TOOLTIP, { placement: 'right' })).toMatchObject({ inline: 'left', block: 'top' });
    expect(suTooltipIconPosition(ICON, TOOLTIP, { placement: 'left-end' })).toMatchObject({ inline: 'right', block: 'bottom' });
  });

  it('turns to the corner with room near the viewport\'s edges', () => {
    const corner = { ...ICON, left: 960, top: 770 };

    expect(suTooltipIconPosition(corner, TOOLTIP, { viewport: VIEWPORT })).toMatchObject({ inline: 'right', block: 'bottom', x: 830, y: 752, icon: { x: 130, y: 18 } });
  });
});

describe('suTooltipIconClip', () => {
  it('clips the tooltip to a circle on the icon, then to the whole tooltip', () => {
    const position = suTooltipIconPosition(ICON, TOOLTIP);

    expect(suTooltipIconClip(position, TOOLTIP, 24, 18)).toEqual({
      from: 'inset(6px 130px 10px 6px round 12px)',
      to: 'inset(0px 0px 0px 0px round 18px)',
    });
  });
});
