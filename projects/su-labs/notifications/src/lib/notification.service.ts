import { Injectable, OnDestroy, signal } from '@angular/core';
import {
  SuNotification,
  SuNotificationConfig,
  SuNotificationController,
  SuNotificationOptions,
  SuNotificationPosition,
} from '@su-labs/core/notifications';

/**
 * Angular service for managing notifications.
 *
 * Thin wrapper around the framework-agnostic `SuNotificationController` from
 * `@su-labs/core/notifications` that exposes the notifications as an Angular signal.
 */
@Injectable({ providedIn: 'root' })
export class SuNotificationService implements OnDestroy {
  /** Framework-agnostic notification logic */
  private readonly controller = new SuNotificationController();

  /** Internal signal holding the list of notifications, kept in sync with the controller */
  private readonly _notifications = signal<SuNotification[]>(this.controller.notifications.get());

  /**
   * Read-only access to the notifications list.
   * Can be used in templates for reactive updates.
   */
  readonly notifications = this._notifications.asReadonly();

  /** Stops syncing the controller's notifications into the signal */
  private readonly unsubscribe = this.controller.notifications.subscribe((list) => this._notifications.set(list));

  /**
   * Position where notifications appear on the screen.
   * Can also be set via the `configure` method.
   * @default 'top-right'
   */
  get position(): SuNotificationPosition {
    return this.controller.position.get();
  }

  set position(position: SuNotificationPosition) {
    this.controller.configure({ position });
  }

  /**
   * Configure the notification service.
   * @param cfg Configuration object
   * @param cfg.position Optional position to display notifications.
   */
  configure(cfg: SuNotificationConfig): void {
    this.controller.configure(cfg);
  }

  /**
   * Show a new notification.
   * @param options Options to configure the notification.
   * @returns The unique ID of the notification.
   */
  show(options: SuNotificationOptions): string {
    return this.controller.show(options);
  }

  /**
   * Dismiss a specific notification by its ID.
   * @param id ID of the notification to remove.
   */
  dismiss(id: string): void {
    this.controller.dismiss(id);
  }

  /**
   * Clear all notifications immediately.
   */
  clearAll(): void {
    this.controller.clearAll();
  }

  /** Angular lifecycle hook for service destruction */
  ngOnDestroy(): void {
    this.unsubscribe();
    this.controller.destroy();
  }
}
