import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SuDialogComponent } from '@su-labs/dialog';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationComponent } from '@su-labs/notifications';
import { SuThemeName } from '@su-labs/theme';
import { AUTHOR_EMAIL_URL, GAMES_URL, GITHUB_REPO_URL, GUIDES_URL, npmUrl } from './core/links';
import { CORE_PACKAGE, UTILITIES } from './core/packages';
import { PrivacyNotice } from './core/privacy-notice';
import { SiteTheme } from './core/site-theme';

/** Order of the header theme switch */
const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/**
 * Site shell: the header (a sticky column with the logo, menu and settings on desktop; a bar with a ☰ menu holding the
 * same links and settings on tablets and phones), the page, the footer, notifications and dialogs
 */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SuDialogComponent, SuNotificationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(document:click)': 'closeMenuOnOutsideClick($event)',
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
})
export class App {
  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);
  /** Started with the shell, so the privacy notice shows on whichever page the visitor lands */
  private readonly privacyNotice = inject(PrivacyNotice);

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

  /** Whether the ☰ menu is open (tablets and phones; on desktop the menu is always in view) */
  protected readonly menuOpen = signal(false);
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');

  constructor() {
    // Following a link closes the menu
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.menuOpen.set(false);
        }
      });
  }

  protected cycleTheme(): void {
    this.theme.set(this.nextTheme());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** A tap anywhere outside the header closes the menu */
  protected closeMenuOnOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.header().nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
