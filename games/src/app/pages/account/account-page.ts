import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MIN_PASSWORD_LENGTH } from '../../core/passwords';
import { PlayerAccount } from '../../core/player-account';
import { SiteLanguage } from '../../i18n/site-language';
import { AccountForm, formText } from './account-form';
import { ScreenNameField } from './screen-name-field';

/** The forms shown while signed out */
type SignedOutView = 'sign-in' | 'sign-up' | 'forgot';

/**
 * The player's account (behind the `accounts` switch). Signed out: sign in, make an account (login name, screen name,
 * password and, when the API can send emails, an optional email for resets), or ask for a reset link. Signed in:
 * change the screen name or email, change the password, sign out, or delete the account.
 */
@Component({
  selector: 'app-account-page',
  imports: [ScreenNameField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../admin/admin.scss', './account.scss'],
})
export class AccountPage {
  protected readonly account = inject(PlayerAccount);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly minLength = MIN_PASSWORD_LENGTH;
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

  protected remove(form: HTMLFormElement): void {
    if (confirm(this.t().account.confirmDelete)) {
      void this.deletion.run(() => this.account.remove(formText(form, 'password')), this.t().account.deleted);
    }
  }

  /** Empties a form's password fields after it's saved */
  private clearPasswords(form: HTMLFormElement): void {
    for (const input of form.querySelectorAll('input[type="password"]')) {
      if (input instanceof HTMLInputElement) {
        input.value = '';
      }
    }
  }
}
