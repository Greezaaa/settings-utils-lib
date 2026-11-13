import { afterNextRender, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SuDialogComponent, SuDialogService } from '@su-labs/dialog';
import { SuNotificationComponent } from '@su-labs/notifications';
import { FeatureFlags } from './core/feature-flags';
import { GameAvailability } from './core/game-availability';
import { byCategory, gameInfo, gameOfPath } from './core/games';
import { ADMIN_PATH, AUTHOR_EMAIL_URL } from './core/links';
import { MenuAnimation } from './core/menu-animation';
import { PlayerAccount } from './core/player-account';
import { SiteNotices } from './core/site-notices';
import { SiteLanguage } from './i18n/site-language';
import { TranslatePipe } from './i18n/translate-pipe';
import { ChoiceRing } from './shared/choice-ring';
import { MenuRing } from './shared/menu-ring';
import { ScrollToActive } from './shared/scroll-to-active';
import { ShareHeight } from './shared/share-height';
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
    '(document:keydown.escape)': 'closePanels()',
  },
})
export class App {
  protected readonly siteLanguage = inject(SiteLanguage);
  private readonly notices = inject(SiteNotices);
  protected readonly t = this.siteLanguage.messages;
  protected readonly menuAnimation = inject(MenuAnimation);

  private readonly availability = inject(GameAvailability);
  protected readonly games = this.availability.visibleGames;
  protected readonly categories = computed(() => byCategory(this.games()));
  protected readonly features = inject(FeatureFlags);
  protected readonly account = inject(PlayerAccount);
  private readonly pageGame = signal(
    gameOfPath(inject(DOCUMENT).location.pathname)
  );
  protected readonly isCheckingGame = computed(() => {
    const game = this.pageGame();
    return (
      game !== null &&
      !this.availability.isKnown() &&
      !gameInfo(game).openByDefault
    );
  });
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly adminPath = ADMIN_PATH;

  protected readonly menuOpen = signal(false);
  private readonly menuToggle =
    viewChild.required<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly siteNav =
    viewChild.required<ElementRef<HTMLElement>>('siteNav');
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected readonly settingsOpen = signal(false);
  private readonly settings =
    viewChild.required<ElementRef<HTMLElement>>('settings');
  private readonly siteHeader =
    viewChild.required<ElementRef<HTMLElement>>('siteHeader');

  constructor() {
    const dialog = inject(SuDialogService);
    effect(() =>
      dialog.configure({
        acceptLabel: this.t().site.noticeOk,
        cancelLabel: this.t().site.cancel,
      })
    );
    const choiceRing = inject(ChoiceRing);
    afterNextRender(() => {
      void this.availability.ready();
      void this.features.ready();
      choiceRing.start();
    });
    const router = inject(Router);
    router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.pageGame.set(gameOfPath(event.urlAfterRedirects));
        this.menuOpen.set(false);
      }
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update(open => !open);
    this.settingsOpen.set(false);
    if (this.menuOpen()) {
      afterNextRender(
        () => this.siteNav().nativeElement.querySelector('a')?.focus(),
        { injector: this.injector }
      );
    }
  }

  protected closePanels(): void {
    this.settingsOpen.set(false);
    if (
      this.menuOpen() &&
      this.siteNav().nativeElement.contains(this.document.activeElement)
    ) {
      this.menuToggle().nativeElement.focus();
    }
    this.menuOpen.set(false);
  }

  protected toggleSettings(): void {
    this.settingsOpen.update(open => !open);
    this.menuOpen.set(false);
  }

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
