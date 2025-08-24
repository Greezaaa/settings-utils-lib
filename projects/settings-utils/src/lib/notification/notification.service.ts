import { Injectable, signal } from '@angular/core';
import { SuNotification, SuNotificationOptions, SuNotificationPosition } from './notification.model';

/**
 * Service for managing notifications.
 * 
 * Provides methods to show, dismiss, and clear notifications.
 * Notifications are reactive signals, making them easy to bind in templates.
 */
@Injectable({ providedIn: 'root' })
export class SuNotificationService {
  /**
   * Internal signal holding the list of notifications.
   */
  private _notifications = signal<SuNotification[]>([]);

  /**
   * Read-only access to the notifications list.
   * Can be used in templates for reactive updates.
   */
  notifications = this._notifications.asReadonly();

  /**
   * Default position where notifications will appear on the screen.
   * Can be configured via `configure` method.
   * @default 'top-right'
   */
  position: SuNotificationPosition = 'top-right';

  /**
   * Configure the notification service.
   * @param cfg Configuration object
   * @param cfg.position Optional position to display notifications.
   */
  configure(cfg: { position?: SuNotificationPosition }): void {
    if (cfg.position) this.position = cfg.position;
  }

  /**
   * Show a new notification.
   * @param options Options to configure the notification.
   * @returns The unique ID of the notification.
   */
  show(options: SuNotificationOptions): string {
    const id = crypto.randomUUID();
    const notification: SuNotification = {
      id,
      type: options.type,
      message: options.message,
      duration: options.duration ?? 3000,
      autoClose: options.autoClose ?? true,
      cssClass: options.cssClass,
      icon: options.icon ?? true
    };

    this._notifications.update(list => [...list, notification]);

    if (notification.autoClose) {
      setTimeout(() => this.dismiss(id), notification.duration);
    }

    return id;
  }

  /**
   * Dismiss a specific notification by its ID.
   * @param id ID of the notification to remove.
   */
  dismiss(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  /**
   * Clear all notifications immediately.
   */
  clearAll(): void {
    this._notifications.set([]);
  }
}
