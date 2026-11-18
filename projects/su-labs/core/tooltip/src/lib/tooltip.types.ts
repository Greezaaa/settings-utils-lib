/** The trigger's side the tooltip opens on */
export type SuTooltipSide = 'top' | 'right' | 'bottom' | 'left';

/** How the tooltip lines up with its trigger along that side; `start` and `end` follow the text direction */
export type SuTooltipAlign = 'start' | 'center' | 'end';

/** A side, optionally lined up with the trigger's start or end, e.g. `top` or `bottom-start` */
export type SuTooltipPlacement =
  | SuTooltipSide
  | `${SuTooltipSide}-start`
  | `${SuTooltipSide}-end`;

/**
 * What opens the tooltip:
 * - `hover`: the pointer over the trigger, or keyboard focus on it; it closes once they leave
 * - `click`: a click or Enter on the trigger; it stays open until clicked again, a click outside or Escape
 */
export type SuTooltipOpenOn = 'hover' | 'click';

/** Where the tooltip opens from: the app's own content, or a built-in "?" icon that grows into the tooltip */
export type SuTooltipTrigger = 'content' | 'icon';

/** A box on screen, in CSS pixels from the viewport's top left corner, like `getBoundingClientRect()` */
export interface SuTooltipRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/** A box's size in CSS pixels */
export interface SuTooltipSize {
  readonly width: number;
  readonly height: number;
}

/** A point in CSS pixels */
export interface SuTooltipPoint {
  readonly x: number;
  readonly y: number;
}

/** Where and how to place a tooltip beside its trigger */
export interface SuTooltipPositionOptions {
  /** @default 'top' */
  readonly placement?: SuTooltipPlacement;
  /** The space between the trigger and the tooltip @default 8 */
  readonly offset?: number;
  /** The least space between the tooltip and the viewport's edges @default 8 */
  readonly padding?: number;
  /** The least space between the arrow and the tooltip's corners @default 12 */
  readonly arrowPadding?: number;
  /** The viewport's size; without it, the tooltip isn't kept inside the screen */
  readonly viewport?: SuTooltipSize;
  /** The text runs right to left, so `start` is on the right @default false */
  readonly rtl?: boolean;
}

/** Where a tooltip goes, relative to the viewport */
export interface SuTooltipPosition {
  /** The tooltip's left edge */
  readonly x: number;
  /** The tooltip's top edge */
  readonly y: number;
  /** The side it opens on, after moving to the other side when the asked one has no room */
  readonly side: SuTooltipSide;
  /** How far along the tooltip's edge facing the trigger the arrow goes, pointing at the trigger's middle */
  readonly arrow: number;
  /** The point the tooltip grows from, inside the tooltip: the arrow's tip, at the trigger */
  readonly origin: SuTooltipPoint;
}

/** Where an icon tooltip goes, relative to the viewport: one of its corners sits on the icon */
export interface SuTooltipIconPosition {
  /** The tooltip's left edge */
  readonly x: number;
  /** The tooltip's top edge */
  readonly y: number;
  /** The icon's top left corner, inside the tooltip */
  readonly icon: SuTooltipPoint;
  /** The tooltip's side the icon sits on */
  readonly inline: 'left' | 'right';
  /** The tooltip's edge the icon sits on */
  readonly block: 'top' | 'bottom';
}

/** Where and how to place an icon tooltip over its icon */
export interface SuTooltipIconPositionOptions {
  /** The side it grows towards, lined up by the icon's corner @default 'bottom-start' */
  readonly placement?: SuTooltipPlacement;
  /** The space between the icon and the tooltip's edges around it @default 6 */
  readonly inset?: number;
  /** The least space between the tooltip and the viewport's edges @default 8 */
  readonly padding?: number;
  /** The viewport's size; without it, the tooltip isn't kept inside the screen */
  readonly viewport?: SuTooltipSize;
  /** The text runs right to left, so `start` is on the right @default false */
  readonly rtl?: boolean;
}

/** The delays before a tooltip opens or closes */
export interface SuTooltipOptions {
  /** Milliseconds before `show` opens it @default 300 */
  readonly showDelay?: number;
  /** Milliseconds before `hide` closes it @default 100 */
  readonly hideDelay?: number;
}

/** Whether a tooltip is open */
export interface SuTooltipState {
  readonly open: boolean;
}

/** The texts a tooltip shows or reads out, replaceable for other languages */
export interface SuTooltipLabels {
  /** The "?" icon's name for screen readers */
  readonly more: string;
  /** The close button's name for screen readers, in an icon tooltip */
  readonly close: string;
}
