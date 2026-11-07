import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { SuThemeName } from '@su-labs/theme';
import { GAME_SLUGS } from './core/games';
import { AUTHOR_EMAIL_URL, GITHUB_REPO_URL, MAIN_SITE_URL } from './core/links';
import { SiteTheme } from './core/site-theme';
import { LANGUAGE_IDS, SiteLanguage } from './i18n/site-language';

/** Order of the header theme switch */
const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/** Site shell: header with text size, theme and language settings and the list of games, page outlet and footer */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
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

  protected readonly siteLanguage = inject(SiteLanguage);
  /** Texts in the site's language */
  protected readonly t = this.siteLanguage.messages;
  protected readonly languages = LANGUAGE_IDS;

  protected readonly games = GAME_SLUGS;
  protected readonly githubUrl = GITHUB_REPO_URL;
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly mainSiteUrl = MAIN_SITE_URL;

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
