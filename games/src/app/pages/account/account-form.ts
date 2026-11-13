import { computed, inject, signal } from '@angular/core';
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
  private readonly problem = signal<FormProblem | null>(null);

  readonly isBusy = signal(false);
  readonly error = computed(() => {
    const problem = this.problem();
    const texts = this.t().account;
    return problem === null ? null : problem === 'mismatch' ? texts.passwordsDiffer : texts.problems[problem];
  });

  matches(password: string, repeat: string): boolean {
    this.problem.set(password === repeat ? null : 'mismatch');
    return password === repeat;
  }

  async run(request: () => Promise<AccountAnswer>, success: string | null, onDone?: () => void): Promise<void> {
    this.isBusy.set(true);
    this.problem.set(null);
    const answer = await request();
    this.isBusy.set(false);
    if (answer !== 'done') {
      this.problem.set(answer);
      return;
    }
    if (success) {
      this.notifications.show({ type: 'success', message: success });
    }
    onDone?.();
  }

  clear(): void {
    this.problem.set(null);
  }
}
