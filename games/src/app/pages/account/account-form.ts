import { computed, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { AccountAnswer, AccountProblem } from '../../core/player-account';
import { SiteLanguage } from '../../i18n/site-language';

/** The text typed in a form's field, by its name (empty when there's no such field) */
export function formText(form: HTMLFormElement, name: string): string {
  const value = new FormData(form).get(name);
  return typeof value === 'string' ? value : '';
}

/** What went wrong in a form: a reason from the API, or two passwords that differ */
type FormProblem = AccountProblem | 'mismatch';

/**
 * The state the account forms share: whether a request is running, and the message of what went wrong. Created in a
 * component's injection context.
 */
export class AccountForm {
  private readonly notifications = inject(SuNotificationService);
  private readonly t = inject(SiteLanguage).messages;
  private readonly problem = signal<FormProblem | null>(null);

  readonly isBusy = signal(false);
  /** The message of what went wrong, shown below the form */
  readonly error = computed(() => {
    const problem = this.problem();
    const texts = this.t().account;
    return problem === null ? null : problem === 'mismatch' ? texts.passwordsDiffer : texts.problems[problem];
  });

  /** Whether two passwords match; shows the message when they don't */
  matches(password: string, repeat: string): boolean {
    this.problem.set(password === repeat ? null : 'mismatch');
    return password === repeat;
  }

  /** Runs a request; when done, shows `success` (if any) as a notification and calls `onDone` */
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
