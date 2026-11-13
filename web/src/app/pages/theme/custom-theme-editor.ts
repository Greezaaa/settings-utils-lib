import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SiteTheme } from '../../core/site-theme';
import { CodeBlock } from '../../shared/code-block';
import { MAX_CUSTOM_THEME_LENGTH, parseCustomTheme, SAMPLE_CUSTOM_THEME } from './custom-theme';

const MAX_CUSTOM_THEME_FILE_BYTES = MAX_CUSTOM_THEME_LENGTH * 4;

const SAMPLE_JSON = JSON.stringify(SAMPLE_CUSTOM_THEME, null, 2);

const CUSTOM_THEME_USAGE = `theme.init({
  themes: {
    custom: ${SAMPLE_JSON.replace(/\n/g, '\n    ')},
  },
});
theme.setTheme('custom');`;

@Component({
  selector: 'app-custom-theme-editor',
  imports: [CodeBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './custom-theme-editor.html',
  styleUrl: './custom-theme-editor.scss',
})
export class CustomThemeEditor {
  private readonly theme = inject(SiteTheme);
  private readonly notifications = inject(SuNotificationService);

  protected readonly draft = signal(SAMPLE_JSON);
  protected readonly error = signal<string | null>(null);
  protected readonly usage = CUSTOM_THEME_USAGE;

  protected edit(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.draft.set(event.target.value);
      this.error.set(null);
    }
  }

  protected apply(): void {
    const result = parseCustomTheme(this.draft());
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    this.error.set(null);
    this.theme.applyCustom(result.variables);
    this.notifications.show({ type: 'success', message: 'Custom theme applied. Reload to go back.', duration: 3000 });
  }

  protected resetDraft(): void {
    this.draft.set(SAMPLE_JSON);
    this.error.set(null);
  }

  protected async import(event: Event): Promise<void> {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (file.size > MAX_CUSTOM_THEME_FILE_BYTES) {
      this.error.set(`This file is ${Math.ceil(file.size / 1024)} KB. A theme file should be under 8 KB.`);
      return;
    }
    this.draft.set(await file.text());
    this.error.set(null);
  }
}
