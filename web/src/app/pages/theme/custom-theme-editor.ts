import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SU_PALETTE_NAMES, SU_THEME_PALETTES, SuPaletteName } from '@su-labs/theme';
import { SiteTheme } from '../../core/site-theme';
import { CodeBlock } from '../../shared/code-block';
import { MAX_CUSTOM_THEME_LENGTH, parseCustomTheme, SAMPLE_CUSTOM_THEME } from './custom-theme';

/** Largest file read by Import JSON (UTF-8 uses up to 4 bytes per character) */
const MAX_CUSTOM_THEME_FILE_BYTES = MAX_CUSTOM_THEME_LENGTH * 4;

const SAMPLE_JSON = JSON.stringify(SAMPLE_CUSTOM_THEME, null, 2);

const CUSTOM_THEME_USAGE = `theme.init({
  themes: {
    custom: ${SAMPLE_JSON.replace(/\n/g, '\n    ')},
  },
});
theme.setTheme('custom');`;

/**
 * JSON editor for trying the library's 'custom' theme on the whole site.
 * The palette applies for this visit only; reloading returns to the saved theme.
 */
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
  protected readonly palettes = SU_PALETTE_NAMES;

  protected edit(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.draft.set(event.target.value);
      this.error.set(null);
    }
  }

  /** Validate the JSON and show it as the site's theme */
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

  /** Fill the editor with one of the library's ready-made palettes and show it */
  protected usePalette(name: SuPaletteName): void {
    this.draft.set(JSON.stringify(SU_THEME_PALETTES[name], null, 2));
    this.apply();
  }

  protected resetDraft(): void {
    this.draft.set(SAMPLE_JSON);
    this.error.set(null);
  }

  /** Load a .json file into the editor; Apply still needs a click */
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
    // Check the size before reading, so a huge file is never loaded into memory
    if (file.size > MAX_CUSTOM_THEME_FILE_BYTES) {
      this.error.set(`This file is ${Math.ceil(file.size / 1024)} KB. A theme file should be under 8 KB.`);
      return;
    }
    this.draft.set(await file.text());
    this.error.set(null);
  }
}
