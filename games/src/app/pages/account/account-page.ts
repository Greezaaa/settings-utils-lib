import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { Router } from '@angular/router';
import { AdminApi } from '../../core/admin-api';
import { ADMIN_PATH } from '../../core/links';
import { MIN_PASSWORD_LENGTH } from '../../core/passwords';
import { PlayerAccount } from '../../core/player-account';
import { SiteLanguage } from '../../i18n/site-language';
import { AccountForm, formText } from './account-form';
import { ScreenNameField } from './screen-name-field/screen-name-field';
import { RevealPassword } from '../../shared/reveal-password';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { FeatureFlags } from '../../core/feature-flags';
import { SuStrengthMeterComponent } from '@su-labs/fields';

type SignedOutView = 'sign-in' | 'sign-up' | 'forgot';

@Component({
  selector: 'app-account-page',
  imports: [TranslatePipe, RevealPassword, SuStrengthMeterComponent, ScreenNameField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/switch.scss', '../admin/admin.scss', './account.scss'],
})
export class AccountPage {
  protected readonly account = inject(PlayerAccount);
  private readonly admin = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly dialog = inject(SuDialogService);
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly minLength = MIN_PASSWORD_LENGTH;
  private readonly features = inject(FeatureFlags);
  protected readonly hasLivelyFields = computed(() => this.features.canUse('lively-fields'));
  protected readonly hasRoomNames = computed(() => this.features.canUse('room-names'));
  protected readonly views: readonly SignedOutView[] = ['sign-in', 'sign-up', 'forgot'];
  protected readonly view = signal<SignedOutView>('sign-in');
  protected readonly canEmail = signal(false);
  protected readonly newEmail = signal('');

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
    const [name, password] = [formText(form, 'loginName').trim(), formText(form, 'password')];
    void this.entry.run(async () => {
      if (name.includes('@')) {
        const asAdmin = await this.admin.signIn(name, password);
        if (asAdmin === 'right') {
          void this.router.navigateByUrl(`/${ADMIN_PATH}`);
          return 'done';
        }
        if (asAdmin !== 'wrong') {
          return asAdmin;
        }
      }
      return this.account.signIn(name, password);
    }, null);
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

  protected async setShowOnLeaderboard(event: Event): Promise<void> {
    const box = event.target instanceof HTMLInputElement ? event.target : null;
    const saved = () => this.account.account()?.showOnLeaderboard ?? false;
    if (!box || this.visibility.isBusy()) {
      if (box) {
        box.checked = saved();
      }
      return;
    }
    const showOnLeaderboard = box.checked;
    await this.visibility.run(() => this.account.setShowOnLeaderboard(showOnLeaderboard), this.t().account.saved);
    box.checked = saved();
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
    for (const input of form.querySelectorAll('input[data-password]')) {
      if (input instanceof HTMLInputElement) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
      }
    }
  }
}
