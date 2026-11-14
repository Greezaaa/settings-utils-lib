import { inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { AccountAnswer, AccountProblem } from '../../core/player-account';
import { SiteLanguage } from '../../i18n/site-language';

export function formText(form: HTMLFormElement, name: string): string {
  const value = new FormData(form).get(name);
  return typeof value === 'string' ? value : '';
}

type FormProblem = AccountProblem | 'mismatch';

export class AccountForm {
  private readonly notifications = inject(SuNotificationService);
  private readonly t = inject(SiteLanguage).messages;

  readonly isBusy = signal(false);

  matches(password: string, repeat: string): boolean {
    if (password !== repeat) {
      this.showProblem('mismatch');
    }
    return password === repeat;
  }

  async run(request: () => Promise<AccountAnswer>, success: string | null, onDone?: () => void): Promise<void> {
    this.isBusy.set(true);
    const answer = await request();
    this.isBusy.set(false);
    if (answer !== 'done') {
      this.showProblem(answer);
      return;
    }
    if (success) {
      this.notifications.show({ type: 'success', message: success });
    }
    onDone?.();
  }

  private showProblem(problem: FormProblem): void {
    const texts = this.t().account;
    this.notifications.show({ type: 'error', message: problem === 'mismatch' ? texts.passwordsDiffer : texts.problems[problem] });
  }
}
