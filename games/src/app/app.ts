import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { SuThemeName } from '@su-labs/theme';
import { SMART_GAMES } from './core/games';
import { AUTHOR_EMAIL_URL, GITHUB_REPO_URL, MAIN_SITE_URL } from './core/links';
import { SiteTheme } from './core/site-theme';

/** Order of the header theme switch */
const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/** Site shell: header with theme and text size controls and the list of games, page outlet and footer */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);

  protected readonly games = SMART_GAMES;
  protected readonly githubUrl = GITHUB_REPO_URL;
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly mainSiteUrl = MAIN_SITE_URL;

  /** Label of the theme the switch moves to next */
  protected readonly nextTheme = computed(() => {
    const index = THEME_CYCLE.indexOf(this.theme.preference());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  });

  protected cycleTheme(): void {
    this.theme.set(this.nextTheme());
  }
}
