import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SuNotificationService } from './notification.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isSuNotificationImageIcon } from '@su-labs/core/notifications';

/**
 * Component to display notifications on the screen.
 *
 * Uses `SuNotificationService` to manage and render notifications.
 */
@Component({
  selector: 'su-lib-notifications',
  standalone: true,
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./notification.component.scss'],
})
export class SuNotificationComponent {
  /** Injected notification service */
  service = inject(SuNotificationService);

  /** Read-only signal of the current notifications */
  notifications = this.service.notifications;

  /** Angular sanitizer to safely render inline SVG strings */
  private sanitizer = inject(DomSanitizer);

  /**
   * Dismiss a notification by its ID.
   * Delegates to the service.
   * @param id ID of the notification to dismiss
   */
  dismiss(id: string): void {
    this.service.dismiss(id);
  }

  /**
   * Checks if the provided `icon` value should be rendered as an image (`<img>`).
   * Inline SVG strings are rendered with `[innerHTML]` instead.
   * See `isSuNotificationImageIcon` in `@su-labs/core/notifications` for the rules.
   *
   * @param icon The icon value from the notification (boolean or string)
   * @returns `true` if the icon is an image path or URL
   */
  isImage(icon: string | boolean): boolean {
    return isSuNotificationImageIcon(icon);
  }

  /**
   * Sanitizes an inline SVG string so it can be safely rendered with [innerHTML].
   *
   * @param icon Inline SVG string
   * @returns SafeHtml object that can be bound to [innerHTML]
   */
  getSanitizedIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}
