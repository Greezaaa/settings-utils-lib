import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FeatureFlags } from '../../core/feature-flags';
import { RoomClient } from '../../core/room-client';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { SuCodeBoxesComponent } from '@su-labs/fields';

/** Room codes: letters and digits without the easily mixed-up ones (0/O, 1/I/L), like the rooms service */
const CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;
const CODE_LENGTH = 6;

/** "Play together": create a room, or join one by typing its code */
@Component({
  selector: 'app-rooms-page',
  imports: [TranslatePipe, SuCodeBoxesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rooms-page.html',
  styleUrls: ['../../shared/utility-page.scss', './rooms.scss'],
})
export class RoomsPage {
  protected readonly client = inject(RoomClient);
  private readonly language = inject(SiteLanguage);
  private readonly router = inject(Router);
  private readonly features = inject(FeatureFlags);
  protected readonly hasLivelyFields = computed(() => this.features.canUse('lively-fields'));
  protected readonly codeLength = CODE_LENGTH;
  /** The code typed so far, in capitals without spaces */
  protected readonly code = signal('');
  protected readonly isCodeComplete = computed(() => CODE_PATTERN.test(this.code()));

  constructor() {
    // Errors belong to the last attempt, not to this visit of the page
    this.client.error.set(null);
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

  protected typeCode(value: string): void {
    this.code.set(value.replace(/\s/g, '').toUpperCase());
  }

  protected join(event: Event): void {
    event.preventDefault();
    if (this.isCodeComplete()) {
      void this.router.navigate(['/r', this.code()]);
    } else {
      this.client.error.set('invalid');
    }
  }
}
