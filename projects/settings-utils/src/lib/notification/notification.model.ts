/**
 * Represents the type of a notification.
 */
export type SuNotificationType = 'info' | 'success' | 'warning' | 'error' | 'custom';

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
