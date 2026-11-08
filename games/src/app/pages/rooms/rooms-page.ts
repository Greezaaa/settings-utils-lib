import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RoomClient } from '../../core/room-client';
import { SiteLanguage } from '../../i18n/site-language';

/** Room codes: letters and digits without the easily mixed-up ones (0/O, 1/I/L), like the rooms service */
const CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

/** "Play together": create a room, or join one by typing its code */
@Component({
  selector: 'app-rooms-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rooms-page.html',
  styleUrls: ['../../shared/utility-page.scss', './rooms.scss'],
})
export class RoomsPage {
  protected readonly client = inject(RoomClient);
  private readonly language = inject(SiteLanguage);
  private readonly router = inject(Router);
  /** Texts in the site's language */
  protected readonly t = this.language.messages;

  constructor() {
    // A room just created: go to it
    effect(() => {
      const room = this.client.room();
      if (room) {
        void this.router.navigate(['/r', room.code]);
      }
    });
  }

  protected create(): void {
    this.client.create(this.language.language());
  }

  protected join(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const code = input.value.replace(/\s/g, '').toUpperCase();
    if (CODE_PATTERN.test(code)) {
      void this.router.navigate(['/r', code]);
    } else {
      this.client.error.set('invalid');
    }
  }
}
