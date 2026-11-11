import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { MIN_PASSWORD_LENGTH } from '../../core/passwords';
import { PlayerAccount } from '../../core/player-account';
import { SiteLanguage } from '../../i18n/site-language';
import { AccountForm, formText } from './account-form';
import { ScreenNameField } from './screen-name-field/screen-name-field';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { FeatureFlags } from '../../core/feature-flags';
import { SuStrengthMeterComponent } from '@su-labs/fields';

/** The forms shown while signed out */
type SignedOutView = 'sign-in' | 'sign-up' | 'forgot';

/**
 * The player's account (behind the `accounts` switch). Signed out: sign in, make an account (login name, screen name,
 * password and, when the API can send emails, an optional email for resets), or ask for a reset link. Signed in:
 * change the screen name or email, show on the leaderboards or not, change the password, sign out, delete the results only,
 * or delete the account.
 */
@Component({
  selector: 'app-account-page',
  imports: [TranslatePipe, SuStrengthMeterComponent, ScreenNameField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/switch.scss', '../admin/admin.scss', './account.scss'],
})
export class AccountPage {
  protected readonly account = inject(PlayerAccount);
  private readonly dialog = inject(SuDialogService);
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly minLength = MIN_PASSWORD_LENGTH;
  private readonly features = inject(FeatureFlags);
  protected readonly hasLivelyFields = computed(() => this.features.canUse('lively-fields'));
  protected readonly views: readonly SignedOutView[] = ['sign-in', 'sign-up', 'forgot'];
  protected readonly view = signal<SignedOutView>('sign-in');
  /** Whether the API can send emails, so accounts may have one */
  protected readonly canEmail = signal(false);
  /** The email typed when signing up, to warn while it's empty */
  protected readonly newEmail = signal('');

  /** One state per form, so a message shows only below the form it belongs to */
  protected readonly entry = new AccountForm();
  protected readonly details = new AccountForm();
  protected readonly password = new AccountForm();
  protected readonly visibility = new AccountForm();
  protected readonly results = new AccountForm();
  protected readonly deletion = new AccountForm();

  constructor() {
    afterNextRender(async () => this.canEmail.set(await this.account.canEmail()));
  }

  protected show(view: SignedOutView): void {
    this.view.set(view);
    this.entry.clear();
  }

  protected viewName(view: SignedOutView): string {
    const texts = this.t().account;
    return { 'sign-in': texts.signInTab, 'sign-up': texts.signUpTab, forgot: texts.forgotTab }[view];
  }

  protected onEmail(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.newEmail.set(event.target.value.trim());
    }
  }

  protected signIn(form: HTMLFormElement): void {
    void this.entry.run(() => this.account.signIn(formText(form, 'loginName'), formText(form, 'password')), null);
  }

  protected signUp(form: HTMLFormElement): void {
    const password = formText(form, 'password');
    if (!this.entry.matches(password, formText(form, 'repeat'))) {
      return;
    }
    const email = this.newEmail();
    const details = {
      loginName: formText(form, 'loginName'),
      screenName: formText(form, 'screenName'),
      password,
      showOnLeaderboard: formText(form, 'showOnLeaderboard') === 'on',
      ...(this.canEmail() && email ? { email } : {}),
    };
    void this.entry.run(() => this.account.register(details), null);
  }

  protected forgot(form: HTMLFormElement): void {
    void this.entry.run(
      () => this.account.forgot(formText(form, 'email')),
      this.t().account.linkSent,
      () => this.show('sign-in'),
    );
  }

  /** Sends only what changed: the screen name, and the email with the password */
  protected saveDetails(form: HTMLFormElement): void {
    const current = this.account.account();
    const screenName = formText(form, 'screenName').trim();
    const email = this.canEmail() ? formText(form, 'email').trim() : (current?.email ?? '');
    const changes = {
      ...(screenName !== current?.screenName ? { screenName } : {}),
      ...(email !== (current?.email ?? '')
        ? { email: email === '' ? null : email, password: formText(form, 'password') }
        : {}),
    };
    void this.details.run(
      () => this.account.change(changes),
      this.t().account.saved,
      () => this.clearPasswords(form),
    );
  }

  protected changePassword(form: HTMLFormElement): void {
    const next = formText(form, 'next');
    if (!this.password.matches(next, formText(form, 'repeat'))) {
      return;
    }
    void this.password.run(
      () => this.account.changePassword(formText(form, 'current'), next),
      this.t().account.passwordChanged,
      () => this.clearPasswords(form),
    );
  }

  /** Shows or hides the player on the leaderboards straight away */
  protected setShowOnLeaderboard(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const showOnLeaderboard = event.target.checked;
      void this.visibility.run(() => this.account.change({ showOnLeaderboard }), this.t().account.saved);
    }
  }

  protected async removeResults(): Promise<void> {
    const { confirmDeleteResults, resultsLead, deleteResults, resultsDeleted } = this.t().account;
    const accepted = await this.dialog.confirm({
      title: confirmDeleteResults,
      body: resultsLead,
      acceptLabel: deleteResults,
      danger: true,
    });
    if (accepted) {
      await this.results.run(() => this.account.removeResults(), resultsDeleted);
    }
  }

  protected async remove(form: HTMLFormElement): Promise<void> {
    const { confirmDelete, deleteLead, deleteAccount, deleted } = this.t().account;
    const accepted = await this.dialog.confirm({
      title: confirmDelete,
      body: deleteLead,
      acceptLabel: deleteAccount,
      danger: true,
    });
    if (accepted) {
      await this.deletion.run(() => this.account.remove(formText(form, 'password')), deleted);
    }
  }

  private clearPasswords(form: HTMLFormElement): void {
    for (const input of form.querySelectorAll('input[type="password"]')) {
      if (input instanceof HTMLInputElement) {
        input.value = '';
        // Fields that follow the typing, like the strength meter, see it emptied
        input.dispatchEvent(new Event('input'));
      }
    }
  }
}
