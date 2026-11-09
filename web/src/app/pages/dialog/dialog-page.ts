import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuDialogBackdrop, SuDialogKind, SuDialogService, SuDialogSize } from '@su-labs/dialog';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

const KINDS: readonly { kind: SuDialogKind; label: string }[] = [
  { kind: 'confirm', label: 'Accept and cancel' },
  { kind: 'ok', label: 'One button' },
];
const SIZES: readonly SuDialogSize[] = ['small', 'medium', 'large'];
const BACKDROPS: readonly SuDialogBackdrop[] = ['dim', 'none'];

/** The demo's rich text: a list, small print and a link, as the body may be HTML */
const RICH_BODY =
  '<p>Deleting your results removes:</p><ul><li>your plays</li><li>your best results</li><li>your places on the leaderboards</li></ul><small>Your account and favourites stay.</small>';
const PLAIN_BODY = 'This removes your plays and best results. Your account and favourites stay.';

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `// app.html, once
<su-lib-dialog />

// any component or service
private readonly dialog = inject(SuDialogService);

if (await this.dialog.confirm({
  title: 'Delete your results?',
  body: 'This can’t be undone.',
  acceptLabel: 'Delete',
  danger: true,
  size: 'small',
})) {
  // deleted
}`,
  },
  {
    label: 'Any framework',
    code: `import { SuDialogController } from '@su-labs/core/dialog';

const dialogs = new SuDialogController();

// render the dialog with your own markup (a native <dialog> is best)
dialogs.current.subscribe((dialog) => render(dialog));

// your buttons call dialogs.close(true) or dialogs.close(false)
const accepted = await dialogs.confirm({ title: 'Delete your results?' });`,
  },
  {
    label: 'Theme',
    code: `:root {
  --su-dialog-background: var(--surface);
  --su-dialog-text-color: var(--text);
  --su-dialog-radius: 16px;
  --su-dialog-accept-background: var(--accent);
  --su-dialog-medium-height: 40dvh;
}`,
  },
];

@Component({
  selector: 'app-dialog-page',
  imports: [UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-page.html',
})
export class DialogPage {
  private readonly dialog = inject(SuDialogService);
  protected readonly utility = getUtility('dialog');
  protected readonly usage = USAGE;
  protected readonly kinds = KINDS;
  protected readonly sizes = SIZES;
  protected readonly backdrops = BACKDROPS;

  protected readonly kind = signal<SuDialogKind>('confirm');
  protected readonly size = signal<SuDialogSize>('small');
  protected readonly backdrop = signal<SuDialogBackdrop>('dim');
  protected readonly backdropColor = signal('#000000');
  protected readonly backdropOpacity = signal(0.5);
  protected readonly richBody = signal(true);
  protected readonly withImage = signal(false);
  protected readonly danger = signal(true);
  protected readonly dismissible = signal(true);
  /** What the last dialog answered */
  protected readonly answer = signal<string>('—');

  protected async open(): Promise<void> {
    const accepted = await this.dialog.open({
      kind: this.kind(),
      title: this.kind() === 'ok' ? 'Your results were deleted' : 'Delete all your results?',
      body: this.richBody() ? RICH_BODY : PLAIN_BODY,
      image: this.withImage() ? { src: '/favicon.svg', alt: '' } : undefined,
      acceptLabel: this.kind() === 'ok' ? 'Got it' : 'Delete my results',
      cancelLabel: 'Keep them',
      size: this.size(),
      backdrop: this.backdrop(),
      backdropColor: this.backdropColor(),
      backdropOpacity: this.backdropOpacity(),
      danger: this.danger() && this.kind() === 'confirm',
      dismissible: this.dismissible(),
    });
    this.answer.set(accepted ? 'accepted' : 'cancelled');
  }

  /** A select or radio group's value, when it's one of the options */
  protected choose<T extends string>(options: readonly T[], event: Event, set: (value: T) => void): void {
    if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement) {
      const { value } = event.target;
      const option = options.find((item) => item === value);
      if (option) {
        set(option);
      }
    }
  }

  protected setColor(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.backdropColor.set(event.target.value);
    }
  }

  protected setOpacity(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.backdropOpacity.set(Number(event.target.value));
    }
  }

  protected setFlag(flag: (value: boolean) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      flag(event.target.checked);
    }
  }

  protected readonly kindValues = KINDS.map(({ kind }) => kind);
}
