/**
 * Represents the type of a notification.
 */
export type SuNotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'custom';

/**
 * A button shown under a notification's message, e.g. "Undo" or "Open".
 */
export interface SuNotificationAction {
  /** Button text */
  label: string;

  /** Called when the button is pressed */
  onClick: () => void;

  /**
   * Whether pressing the button also closes the notification.
   * @default true
   */
  dismiss?: boolean;
}

/**
 * Options for configuring a notification.
 */
export interface SuNotificationOptions {
  /**
   * The type of notification. Determines styling and default icon.
   */
  type: SuNotificationType;

  /**
   * The main message text to display in the notification.
   */
  message: string;

  /**
   * Duration in milliseconds before the notification automatically closes.
   * @default 3000
   */
  duration?: number;

  /**
   * Whether the notification should automatically close after the duration.
   * @default true
   */
  autoClose?: boolean;

  /**
   * Additional CSS class(es) to apply to the notification for custom styling.
   */
  cssClass?: string;

  /**
   * Icon configuration for the notification:
   * - `false`: no icon
   * - `true`: default icon for the given type
   * - `string`: custom SVG markup or URL for the icon
   */
  icon?: boolean | string;

  /**
   * Buttons shown under the message, in order. Rendered by the Angular component; with the controller alone,
   * your own markup renders them and calls `onClick`.
   */
  actions?: SuNotificationAction[];
}

/**
 * A notification instance with a unique identifier.
 */
export interface SuNotification extends SuNotificationOptions {
  /**
   * Unique identifier for the notification instance.
   */
  id: string;
}

/**
 * Possible positions for displaying notifications on the screen.
 */
export type SuNotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

/**
 * Configuration for the notification controller.
 */
/**
 * The direction notifications slide in from (and back out to). `auto` uses the side they sit on:
 * the left or right edge, or the top or bottom edge for the centred positions.
 */
export type SuNotificationSlide = 'auto' | 'left' | 'right' | 'top' | 'bottom';

export interface SuNotificationConfig {
  /**
   * Where notifications appear on the screen.
   * @default 'top-right'
   */
  position?: SuNotificationPosition;

  /**
   * The direction notifications slide in from, whatever their position.
   * @default 'auto'
   */
  slideFrom?: SuNotificationSlide;
}
