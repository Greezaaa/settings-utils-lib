import { createSuStore, SuReadableStore } from '@su-labs/core';
import { SuNotification, SuNotificationConfig, SuNotificationOptions, SuNotificationPosition, SuNotificationSlide } from './notification.types';

/** Default time in milliseconds before a notification closes itself */
const DEFAULT_DURATION = 3000;

/**
 * Framework-agnostic notification manager.
 *
 * Keeps the list of active notifications as a reactive store and closes them automatically
 * after their duration. Rendering is left to the app (or to a framework package such as
 * `@su-labs/notifications` for Angular).
 */
export class SuNotificationController {
  /** List of active notifications, oldest first */
  private readonly notificationsStore = createSuStore<SuNotification[]>([]);

  /** Where notifications appear on screen */
  private readonly positionStore = createSuStore<SuNotificationPosition>('top-right');

  /** The direction notifications slide in from */
  private readonly slideFromStore = createSuStore<SuNotificationSlide>('auto');

  /** Pending auto-close timers, by notification ID */
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  /** Reactive, read-only list of active notifications */
  readonly notifications: SuReadableStore<SuNotification[]> = this.notificationsStore.asReadonly();

  /** Reactive, read-only position where notifications appear */
  readonly position: SuReadableStore<SuNotificationPosition> = this.positionStore.asReadonly();

  /** Reactive, read-only direction notifications slide in from */
  readonly slideFrom: SuReadableStore<SuNotificationSlide> = this.slideFromStore.asReadonly();

  /**
   * Configure the controller.
   * @param config Configuration object.
   */
  public configure(config: SuNotificationConfig): void {
    if (config.position) {
      this.positionStore.set(config.position);
    }
    if (config.slideFrom) {
      this.slideFromStore.set(config.slideFrom);
    }
  }

  /**
   * Show a new notification.
   * @param options Options to configure the notification.
   * @returns The unique ID of the notification.
   */
  public show(options: SuNotificationOptions): string {
    const notification: SuNotification = {
      id: crypto.randomUUID(),
      type: options.type,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATION,
      autoClose: options.autoClose ?? true,
      cssClass: options.cssClass,
      icon: options.icon ?? true,
      actions: options.actions,
    };

    this.notificationsStore.set([...this.notificationsStore.get(), notification]);

    if (notification.autoClose) {
      this.timers.set(
        notification.id,
        setTimeout(() => this.dismiss(notification.id), notification.duration),
      );
    }

    return notification.id;
  }

  /**
   * Dismiss a specific notification by its ID.
   * @param id ID of the notification to remove.
   */
  public dismiss(id: string): void {
    this.clearTimer(id);
    this.notificationsStore.set(this.notificationsStore.get().filter((notification) => notification.id !== id));
  }

  /** Remove all notifications immediately */
  public clearAll(): void {
    this.timers.forEach((_, id) => this.clearTimer(id));
    this.notificationsStore.set([]);
  }

  /** Remove all notifications and cancel pending timers */
  public destroy(): void {
    this.clearAll();
  }

  /**
   * Cancel the auto-close timer of a notification, if any.
   * @param id ID of the notification.
   */
  private clearTimer(id: string): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }
}

/**
 * Check whether a notification icon should be rendered as an image (`<img>`).
 *
 * Image icons are local or relative paths (starting with `/`), URLs (starting with `http`)
 * and file paths ending with `.png`, `.jpg` or `.svg`. Inline SVG markup (`<svg>...</svg>`)
 * is not an image and should be rendered as HTML.
 *
 * @param icon The icon value from the notification.
 * @returns `true` if the icon is an image path or URL.
 */
export function isSuNotificationImageIcon(icon: SuNotification['icon']): icon is string {
  return (
    typeof icon === 'string' &&
    (icon.endsWith('.png') ||
      icon.endsWith('.jpg') ||
      icon.endsWith('.svg') ||
      icon.startsWith('http') ||
      icon.startsWith('/'))
  );
}
