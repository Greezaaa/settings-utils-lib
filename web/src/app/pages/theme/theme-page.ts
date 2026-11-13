import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SU_PALETTE_NAMES, SuThemeName } from '@su-labs/theme';
import { getUtility } from '../../core/packages';
import { SiteTheme } from '../../core/site-theme';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';
import { CustomThemeEditor } from './custom-theme-editor';

const THEME_OPTIONS: readonly { value: SuThemeName; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'contrast', label: 'High contrast' },
];

const THEME_VARIABLES = ['background', 'color', 'main-accent', 'second-accent', 'third-accent'] as const;

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `// app.config.ts
provideAppInitializer(() => inject(SuThemeService).init({ defaultTheme: 'system' }));

// any component
protected readonly theme = inject(SuThemeService);
// {{ theme.theme() }}
// (click)="theme.setTheme('dark')"`,
  },
  {
    label: 'Any framework',
    code: `import { SuThemeController } from '@su-labs/core/theme';

const theme = new SuThemeController();
theme.init({ defaultTheme: 'system' });

theme.setTheme('dark');
theme.theme.subscribe((name) => console.log(name));`,
  },
  {
    label: 'CSS',
    code: `body {
  color: var(--su-theme-color);
  background: var(--su-theme-background);
}

[data-theme='dark'] img {
  filter: brightness(0.9);
}`,
  },
];

@Component({
  selector: 'app-theme-page',
  imports: [CustomThemeEditor, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-page.html',
  styleUrl: './theme-page.scss',
})
export class ThemePage {
  protected readonly utility = getUtility('theme');
  protected readonly usage = USAGE;
  protected readonly options = THEME_OPTIONS;
  protected readonly palettes = SU_PALETTE_NAMES;
  protected readonly variables = THEME_VARIABLES;
  protected readonly theme = inject(SiteTheme);
}
