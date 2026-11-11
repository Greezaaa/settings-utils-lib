import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminApi } from '../../../core/admin-api';
import { ADMIN_PATH } from '../../../core/links';
import { MIN_PASSWORD_LENGTH } from '../../../core/passwords';
import { TranslatePipe } from '../../../i18n/translate-pipe';

type Step = 'checking' | 'ready' | 'invalid' | 'saving' | 'mismatch' | 'failed';

/**
 * An invite link, /<ADMIN_INVITE_PATH>/<secret>: a new moderator chooses their password, which also signs them in, and goes
 * to the admin page. The link works once, for 7 days.
 */
@Component({
  selector: 'app-admin-invite-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-invite-page.html',
  styleUrls: ['../../../shared/utility-page.scss', '../admin.scss'],
})
export class AdminInvitePage {
  /** From the address, through the router's component input binding */
  readonly secret = input.required<string>();

  private readonly admin = inject(AdminApi);
  private readonly router = inject(Router);
  protected readonly minLength = MIN_PASSWORD_LENGTH;
  protected readonly step = signal<Step>('checking');
  protected readonly email = signal('');

  constructor() {
    afterNextRender(async () => {
      const email = await this.admin.inviteEmail(this.secret());
      this.email.set(email ?? '');
      this.step.set(email ? 'ready' : 'invalid');
    });
  }

  protected async accept(event: Event, password: HTMLInputElement, repeat: HTMLInputElement): Promise<void> {
    event.preventDefault();
    if (password.value !== repeat.value) {
      this.step.set('mismatch');
      return;
    }
    this.step.set('saving');
    if (await this.admin.acceptInvite(this.secret(), password.value)) {
      await this.router.navigateByUrl(`/${ADMIN_PATH}`);
    } else {
      this.step.set('failed');
    }
  }
}
