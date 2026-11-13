import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FeatureFlags } from '../../core/feature-flags';
import { RoomClient } from '../../core/room-client';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { SuCodeBoxesComponent } from '@su-labs/fields';

const CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;
const CODE_LENGTH = 6;

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
  protected readonly code = signal('');
  protected readonly isCodeComplete = computed(() => CODE_PATTERN.test(this.code()));

  constructor() {
    this.client.error.set(null);
    effect(() => {
      const room = this.client.room();
      if (room) {
        void this.router.navigate(['/r', room.code]);
      }
    });
  }

  protected create(): void {
    void this.client.create(this.language.language());
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
