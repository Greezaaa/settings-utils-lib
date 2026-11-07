import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationComponent } from '@su-labs/notifications';
import { SuThemeName } from '@su-labs/theme';
import { AUTHOR_EMAIL_URL, GAMES_URL, GITHUB_REPO_URL, GUIDES_URL, npmUrl } from './core/links';
import { CORE_PACKAGE, UTILITIES } from './core/packages';
import { SiteTheme } from './core/site-theme';

/** Order of the header theme switch */
const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/** Site shell: header with theme and text size controls, page outlet, footer and notifications */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SuNotificationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(document:click)': 'closeSettingsOnOutsideClick($event)',
    '(document:keydown.escape)': 'settingsOpen.set(false)',
  },
})
export class App {
  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);

  protected readonly utilities = UTILITIES;
  protected readonly githubUrl = GITHUB_REPO_URL;
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly guidesUrl = GUIDES_URL;
  protected readonly gamesUrl = GAMES_URL;
  protected readonly npmCoreUrl = npmUrl(CORE_PACKAGE.packageName);
  protected readonly year = new Date().getFullYear();

  /** Label of the theme the switch moves to next */
  protected readonly nextTheme = computed(() => {
    const index = THEME_CYCLE.indexOf(this.theme.preference());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  });

  /** Whether the settings panel is open (only used on phones, where it hides behind the gear button) */
  protected readonly settingsOpen = signal(false);
  private readonly settings = viewChild.required<ElementRef<HTMLElement>>('settings');

  protected cycleTheme(): void {
    this.theme.set(this.nextTheme());
  }

  protected toggleSettings(): void {
    this.settingsOpen.update((open) => !open);
  }

  /** A tap anywhere outside the settings closes them */
  protected closeSettingsOnOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.settings().nativeElement.contains(event.target)) {
      this.settingsOpen.set(false);
    }
  }
}
