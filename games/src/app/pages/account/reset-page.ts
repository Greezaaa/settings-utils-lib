import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MIN_PASSWORD_LENGTH } from '../../core/passwords';
import { PlayerAccount } from '../../core/player-account';
import { SiteLanguage } from '../../i18n/site-language';
import { AccountForm, formText } from './account-form';

/**
 * A password-reset link from an email, /account/reset/<secret>: the player chooses a new password, which also signs
 * them in, and goes to their account. Built in the browser, as every link is different.
 */
@Component({
  selector: 'app-reset-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../admin/admin.scss', './account.scss'],
})
export class ResetPage {
  /** From the address, through the router's component input binding */
  readonly secret = input.required<string>();

  private readonly account = inject(PlayerAccount);
  private readonly router = inject(Router);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly minLength = MIN_PASSWORD_LENGTH;
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
