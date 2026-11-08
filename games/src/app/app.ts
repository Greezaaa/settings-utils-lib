import { afterNextRender, ChangeDetectionStrategy, Component, computed, DOCUMENT, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationComponent } from '@su-labs/notifications';
import { SuThemeName } from '@su-labs/theme';
import { FeatureFlags } from './core/feature-flags';
import { GameAvailability } from './core/game-availability';
import { gameOfPath } from './core/games';
import { ADMIN_PATH, AUTHOR_EMAIL_URL, GITHUB_REPO_URL, MAIN_SITE_URL } from './core/links';
import { BoardColours } from './core/board-colours';
import { GAME_THEMES } from './core/game-themes';
import { SiteNotices } from './core/site-notices';
import { SiteTheme } from './core/site-theme';
import { LANGUAGE_IDS, SiteLanguage } from './i18n/site-language';

/** Order of the header theme switch */
const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/** Site shell: header with text size, theme and language settings and the list of games, page outlet and footer */
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

  protected readonly siteLanguage = inject(SiteLanguage);
  /** Started with the shell, so the privacy and "what's new" notices show on whichever page the visitor lands */
  private readonly notices = inject(SiteNotices);
  /** Texts in the site's language */
  protected readonly t = this.siteLanguage.messages;
  protected readonly languages = LANGUAGE_IDS;
  protected readonly boardColours = inject(BoardColours);
  protected readonly gameThemes = GAME_THEMES;

  private readonly availability = inject(GameAvailability);
  protected readonly games = this.availability.visibleGames;
  protected readonly features = inject(FeatureFlags);
  /** The game of the page being shown, from the address (known while prerendering and on the first render too) */
  private readonly pageGame = signal(gameOfPath(inject(DOCUMENT).location.pathname));
  /** A game's page waits, hidden, until it's sure the game is open; then it shows or the visitor goes home */
  protected readonly isCheckingGame = computed(() => this.pageGame() !== null && !this.availability.isKnown());
  protected readonly githubUrl = GITHUB_REPO_URL;
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly mainSiteUrl = MAIN_SITE_URL;
  protected readonly adminPath = ADMIN_PATH;

  /** Label of the theme the switch moves to next */
  protected readonly nextTheme = computed(() => {
    const index = THEME_CYCLE.indexOf(this.theme.preference());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  });

  /** Whether the settings panel is open (only used on phones, where it hides behind the gear button) */
  protected readonly settingsOpen = signal(false);
  private readonly settings = viewChild.required<ElementRef<HTMLElement>>('settings');

  constructor() {
    // Which games are open (and whether this is the admin's preview) is known once the API answers
    afterNextRender(() => {
      void this.availability.ready();
      void this.features.ready();
    });
    const router = inject(Router);
    router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.pageGame.set(gameOfPath(event.urlAfterRedirects));
      }
    });
  }

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
