import { afterNextRender, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { SuDialogComponent, SuDialogService } from '@su-labs/dialog';
import { SuNotificationComponent } from '@su-labs/notifications';
import { SuThemeName } from '@su-labs/theme';
import { FeatureFlags } from './core/feature-flags';
import { GameAvailability } from './core/game-availability';
import { PlayerAccount } from './core/player-account';
import { byCategory, gameOfPath } from './core/games';
import { ADMIN_PATH, AUTHOR_EMAIL_URL } from './core/links';
import { ANSWER_STYLES, AnswerWords } from './core/answer-words';
import { MENU_ANIMATION_CHOICES, MenuAnimation } from './core/menu-animation';
import { PlayerGender } from './core/player-gender';
import { WORD_GENDERS } from './i18n/word-gender';
import { BoardColours } from './core/board-colours';
import { GAME_THEMES } from './core/game-themes';
import { SiteNotices } from './core/site-notices';
import { SiteTheme } from './core/site-theme';
import { LANGUAGE_IDS, SiteLanguage } from './i18n/site-language';
import { MenuRing } from './shared/menu-ring';
import { ScrollToActive } from './shared/scroll-to-active';
import { TranslatePipe } from './i18n/translate-pipe';

const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/** Site shell: header with text size, theme and language settings and the list of games, page outlet and footer */
@Component({
  selector: 'app-root',
  imports: [
    TranslatePipe,
    MenuRing,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ScrollToActive,
    SuDialogComponent,
    SuNotificationComponent,
  ],
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
  protected readonly t = this.siteLanguage.messages;
  protected readonly languages = LANGUAGE_IDS;
  protected readonly boardColours = inject(BoardColours);
  protected readonly answerWords = inject(AnswerWords);
  protected readonly answerStyles = ANSWER_STYLES;
  protected readonly playerGender = inject(PlayerGender);
  protected readonly menuAnimation = inject(MenuAnimation);
  protected readonly menuAnimationChoices = MENU_ANIMATION_CHOICES;
  protected readonly wordGenders = WORD_GENDERS;
  protected readonly gameThemes = GAME_THEMES;

  private readonly availability = inject(GameAvailability);
  protected readonly games = this.availability.visibleGames;
  protected readonly categories = computed(() => byCategory(this.games()));
  protected readonly features = inject(FeatureFlags);
  protected readonly account = inject(PlayerAccount);
  /** The game of the page being shown, from the address (known while prerendering and on the first render too) */
  private readonly pageGame = signal(gameOfPath(inject(DOCUMENT).location.pathname));
  /** A game's page waits, hidden, until it's sure the game is open; then it shows or the visitor goes home */
  protected readonly isCheckingGame = computed(() => this.pageGame() !== null && !this.availability.isKnown());
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly adminPath = ADMIN_PATH;

  protected readonly nextTheme = computed(() => {
    const index = THEME_CYCLE.indexOf(this.theme.preference());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  });

  /** Whether the settings panel is open (only used on phones, where it hides behind the gear button) */
  protected readonly settingsOpen = signal(false);
  private readonly settings = viewChild.required<ElementRef<HTMLElement>>('settings');

  constructor() {
    // Confirmation dialogs label their buttons in the site's language, unless a dialog names its own
    const dialog = inject(SuDialogService);
    effect(() => dialog.configure({ acceptLabel: this.t().site.noticeOk, cancelLabel: this.t().site.cancel }));
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

  protected closeSettingsOnOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.settings().nativeElement.contains(event.target)) {
      this.settingsOpen.set(false);
    }
  }
}
