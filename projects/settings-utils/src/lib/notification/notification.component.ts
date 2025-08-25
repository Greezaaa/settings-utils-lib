import { Component, inject } from '@angular/core';
import { SuNotificationService } from './notification.service';
import { CommonModule } from '@angular/common';
import {
  BrowserModule,
  DomSanitizer,
  SafeHtml,
} from '@angular/platform-browser';

/**
 * Component to display notifications on the screen.
 *
 * Uses `SuNotificationService` to manage and render notifications.
 */
@Component({
  selector: 'su-lib-notifications',
  standalone: true,
  imports: [CommonModule, BrowserModule],
  templateUrl: './notification.component.html',
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
   *
   * Determines whether the `icon` is a string pointing to an image file:
   * - Local or relative paths (starting with `/`)
   * - URLs (starting with `http`)
   * - File paths ending with `.png`, `.jpg`, or `.svg`
   *
   * Inline SVG strings (e.g., `<svg>...</svg>`) are **not** treated as images and
   * should be rendered with `[innerHTML]`.
   *
   * @param icon The icon value from the notification (boolean or string)
   * @returns `true` if the icon is an image path or URL, `false` for inline SVGs or `false`
   */
  isImage(icon: string | boolean): boolean {
    return (
      typeof icon === 'string' &&
      (icon.endsWith('.png') ||
        icon.endsWith('.jpg') ||
        icon.endsWith('.svg') ||
        icon.startsWith('http') ||
        icon.startsWith('/'))
    );
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
