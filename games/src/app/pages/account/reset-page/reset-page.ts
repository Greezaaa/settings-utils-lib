import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MIN_PASSWORD_LENGTH } from '../../../core/passwords';
import { PlayerAccount } from '../../../core/player-account';
import { SiteLanguage } from '../../../i18n/site-language';
import { AccountForm, formText } from '../account-form';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { FeatureFlags } from '../../../core/feature-flags';
import { SuStrengthMeterComponent } from '@su-labs/fields';

@Component({
  selector: 'app-reset-page',
  imports: [TranslatePipe, SuStrengthMeterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-page.html',
  styleUrls: ['../../../shared/utility-page.scss', '../../admin/admin.scss', '../account.scss'],
})
export class ResetPage {
  readonly secret = input.required<string>();

  private readonly account = inject(PlayerAccount);
  private readonly router = inject(Router);
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly minLength = MIN_PASSWORD_LENGTH;
  private readonly features = inject(FeatureFlags);
  protected readonly hasLivelyFields = computed(() => this.features.canUse('lively-fields'));
  protected readonly form = new AccountForm();

  protected save(form: HTMLFormElement): void {
    const password = formText(form, 'password');
    if (this.form.matches(password, formText(form, 'repeat'))) {
      void this.form.run(
        () => this.account.reset(this.secret(), password),
        this.t().account.resetDone,
        () => void this.router.navigateByUrl('/account'),
      );
    }
  }
}
