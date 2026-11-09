import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminApi } from '../../core/admin-api';
import { GameAvailability } from '../../core/game-availability';
import { MIN_PASSWORD_LENGTH } from '../../core/passwords';
import { SiteLanguage } from '../../i18n/site-language';

type Saving = 'idle' | 'saving' | 'saved' | 'wrong' | 'mismatch' | 'offline';

/** Admin tab: preview mode (super admin and testers), and changing your own password (other browsers are signed out) */
@Component({
  selector: 'app-admin-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-account.html',
  styleUrls: ['./admin.scss', '../../shared/switch.scss'],
})
export class AdminAccount {
  protected readonly admin = inject(AdminApi);
  protected readonly availability = inject(GameAvailability);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly minLength = MIN_PASSWORD_LENGTH;
  protected readonly saving = signal<Saving>('idle');

  protected togglePreview(): void {
    this.availability.setPreview(!this.availability.isPreview());
  }

  protected async change(
    event: Event,
    form: HTMLFormElement,
    current: HTMLInputElement,
    next: HTMLInputElement,
    repeat: HTMLInputElement,
  ): Promise<void> {
    event.preventDefault();
    if (next.value !== repeat.value) {
      this.saving.set('mismatch');
      return;
    }
    this.saving.set('saving');
    const answer = await this.admin.changePassword(current.value, next.value);
    this.saving.set(answer);
    if (answer === 'saved') {
      form.reset();
    }
  }
}
