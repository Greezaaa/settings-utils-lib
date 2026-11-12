import { afterNextRender, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SuDialogComponent, SuDialogService } from '@su-labs/dialog';
import { SuNotificationComponent } from '@su-labs/notifications';
import { FeatureFlags } from './core/feature-flags';
import { GameAvailability } from './core/game-availability';
import { PlayerAccount } from './core/player-account';
import { byCategory, gameInfo, gameOfPath } from './core/games';
import { ADMIN_PATH, AUTHOR_EMAIL_URL } from './core/links';
import { MenuAnimation } from './core/menu-animation';
import { SiteNotices } from './core/site-notices';
import { SiteLanguage } from './i18n/site-language';
import { ChoiceRing } from './shared/choice-ring';
import { MenuRing } from './shared/menu-ring';
import { ScrollToActive } from './shared/scroll-to-active';
import { ShareHeight } from './shared/share-height';
import { TranslatePipe } from './i18n/translate-pipe';
import { SiteSettings } from './shared/site-settings/site-settings';

/** Site shell: header with the settings (SiteSettings) and the menu, page outlet and footer */
@Component({
  selector: 'app-root',
  imports: [
    TranslatePipe,
    MenuRing,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ScrollToActive,
    ShareHeight,
    SuDialogComponent,
    SuNotificationComponent,
    SiteSettings,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(document:click)': 'closePanelsOnOutsideClick($event)',
    '(document:keydown.escape)': 'settingsOpen.set(false); menuOpen.set(false)',
  },
})
export class App {
  protected readonly siteLanguage = inject(SiteLanguage);
  /** Started with the shell, so the privacy and "what's new" notices show on whichever page the visitor lands */
  private readonly notices = inject(SiteNotices);
  protected readonly t = this.siteLanguage.messages;
  protected readonly menuAnimation = inject(MenuAnimation);

  private readonly availability = inject(GameAvailability);
  protected readonly games = this.availability.visibleGames;
  protected readonly categories = computed(() => byCategory(this.games()));
  protected readonly features = inject(FeatureFlags);
  protected readonly account = inject(PlayerAccount);
  /** The game of the page being shown, from the address (known while prerendering and on the first render too) */
  private readonly pageGame = signal(gameOfPath(inject(DOCUMENT).location.pathname));
  /** A game closed by default waits, hidden, until it's sure the game is open; then it shows or the visitor goes home */
  protected readonly isCheckingGame = computed(() => {
    const game = this.pageGame();
    return game !== null && !this.availability.isKnown() && !gameInfo(game).openByDefault;
  });
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly adminPath = ADMIN_PATH;

  /** Whether the menu is open (phones only, where it hides behind the menu button) */
  protected readonly menuOpen = signal(false);

  /** Whether the settings panel is open (only used on phones, where it hides behind the gear button) */
  protected readonly settingsOpen = signal(false);
  private readonly settings = viewChild.required<ElementRef<HTMLElement>>('settings');
  private readonly siteHeader = viewChild.required<ElementRef<HTMLElement>>('siteHeader');

  constructor() {
    // Confirmation dialogs label their buttons in the site's language, unless a dialog names its own
    const dialog = inject(SuDialogService);
    effect(() => dialog.configure({ acceptLabel: this.t().site.noticeOk, cancelLabel: this.t().site.cancel }));
    // Which games are open (and whether this is the admin's preview) is known once the API answers
    const choiceRing = inject(ChoiceRing);
    afterNextRender(() => {
      void this.availability.ready();
      void this.features.ready();
      choiceRing.start();
    });
    const router = inject(Router);
    router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.pageGame.set(gameOfPath(event.urlAfterRedirects));
        // A link in the phone menu went to its page
        this.menuOpen.set(false);
      }
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.settingsOpen.set(false);
  }

  protected toggleSettings(): void {
    this.settingsOpen.update((open) => !open);
    this.menuOpen.set(false);
  }

  /** A tap outside the settings closes them, and one outside the header closes the phone menu */
  protected closePanelsOnOutsideClick(event: MouseEvent): void {
    if (!(event.target instanceof Node)) {
      return;
    }
    if (!this.settings().nativeElement.contains(event.target)) {
      this.settingsOpen.set(false);
    }
    if (!this.siteHeader().nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
