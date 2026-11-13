import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SuDialogComponent } from '@su-labs/dialog';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationComponent } from '@su-labs/notifications';
import { SuThemeName } from '@su-labs/theme';
import { AUTHOR_EMAIL_URL, GITHUB_REPO_URL, GUIDES_URL, npmUrl } from './core/links';
import { sectionHasRoute, SITE_MENU } from './core/menu';
import { CORE_PACKAGE } from './core/packages';
import { PrivacyNotice } from './core/privacy-notice';
import { readStored, writeStored } from './core/site-storage';
import { SiteTheme } from './core/site-theme';

/** Order of the header theme switch */
const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

/** Storage name of the menu sections the visitor left expanded */
const OPEN_SECTIONS_STORAGE = 'menu-open-sections';

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
  private readonly router = inject(Router);

  protected readonly menu = SITE_MENU;
  protected readonly githubUrl = GITHUB_REPO_URL;
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly guidesUrl = GUIDES_URL;
  protected readonly npmCoreUrl = npmUrl(CORE_PACKAGE.packageName);
  protected readonly year = new Date().getFullYear();

  /** Label of the theme the switch moves to next */
  protected readonly nextTheme = computed(() => {
    const index = THEME_CYCLE.indexOf(this.theme.preference());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  });

  /** Whether the ☰ menu is open (tablets and phones; on desktop the menu is always in view) */
  protected readonly menuOpen = signal(false);

  /** Ids of the expanded menu sections */
  private readonly openSections = signal<ReadonlySet<string>>(
    new Set(SITE_MENU.filter((section) => section.openByDefault).map((section) => section.id)),
  );
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');

  constructor() {
    // Restored after the first render, so the browser starts from the same menu the server rendered
    afterNextRender(() => this.restoreOpenSections());

    // Following a link closes the menu
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
        this.openSectionOfPage(event.urlAfterRedirects);
      }
    });
  }

  protected isSectionOpen(id: string): boolean {
    return this.openSections().has(id);
  }

  /** Expands or collapses a section and remembers the choice for the next visit */
  protected toggleSection(id: string): void {
    this.setSectionOpen(id, !this.isSectionOpen(id));
    writeStored(OPEN_SECTIONS_STORAGE, [...this.openSections()]);
  }

  private setSectionOpen(id: string, open: boolean): void {
    this.openSections.update((current) => {
      const next = new Set(current);
      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  /** Brings back the sections expanded on the last visit (unknown ids are dropped), then the current page's section */
  private restoreOpenSections(): void {
    const stored = readStored(OPEN_SECTIONS_STORAGE);
    if (Array.isArray(stored)) {
      const ids = SITE_MENU.map((section) => section.id).filter((id) => stored.includes(id));
      this.openSections.set(new Set(ids));
    }
    this.openSectionOfPage(this.router.url);
  }

  /** Expands the section holding the current page, so its highlighted link is in view; not saved */
  private openSectionOfPage(url: string): void {
    const path = url.split(/[?#]/)[0];
    const section = SITE_MENU.find((item) => sectionHasRoute(item, path));
    if (section) {
      this.setSectionOpen(section.id, true);
    }
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
