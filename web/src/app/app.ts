import { NgTemplateOutlet } from '@angular/common';
import { afterNextRender, afterRenderEffect, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SuDialogComponent } from '@su-labs/dialog';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationComponent } from '@su-labs/notifications';
import { SuThemeName } from '@su-labs/theme';
import { AUTHOR_EMAIL_URL, GAMES_URL, GITHUB_REPO_URL, GUIDES_URL, npmUrl } from './core/links';
import { sectionHasRoute } from './core/menu';
import { MenuOrder } from './core/menu-order';
import { CORE_PACKAGE } from './core/packages';
import { PrivacyNotice } from './core/privacy-notice';
import { readStored, writeStored } from './core/site-storage';
import { SiteTheme } from './core/site-theme';
import { MenuLinks } from './shared/menu-links';
import { SiteIcon } from './shared/site-icon';

const THEME_CYCLE: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast'];

const OPEN_SECTIONS_STORAGE = 'menu-open-sections';
const COLLAPSED_STORAGE = 'menu-collapsed';

/** From this width the menu is a sidebar; below it, a bottom bar with sheets */
const DESKTOP = '(min-width: 64rem)';

/** Between the phone layout and a wide screen, the menu closes to its icons by itself */
const NARROW_DESKTOP = '(min-width: 64rem) and (max-width: 79.99rem)';

/** The sheets the bottom bar opens on phones: a menu section's links, or More */
type MenuSheet = 'packages' | 'extensions' | 'more';

@Component({
  selector: 'app-root',
  imports: [
    MenuLinks,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SiteIcon,
    SuDialogComponent,
    SuNotificationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.menu-collapsed]': 'collapsed()',
    '(document:pointerdown)': 'closeSettingsOutside($event)',
  },
})
export class App {
  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);
  protected readonly menuOrder = inject(MenuOrder);
  /** Started with the shell, so the privacy notice shows on whichever page the visitor lands */
  private readonly privacyNotice = inject(PrivacyNotice);
  private readonly router = inject(Router);

  protected readonly sections = this.menuOrder.sections;
  /** The section a sheet lists, for the Packages and Extensions sheets */
  protected readonly sheetSection = computed(() => this.sections().find((section) => section.id === this.sheet()));
  /** What the More sheet lists; packages, extensions and games have their own tabs in the bottom bar */
  protected readonly moreSections = computed(() =>
    this.sections().filter((section) => !['packages', 'extensions', 'apps'].includes(section.id)),
  );
  protected readonly githubUrl = GITHUB_REPO_URL;
  protected readonly gamesUrl = GAMES_URL;
  protected readonly authorEmailUrl = AUTHOR_EMAIL_URL;
  protected readonly guidesUrl = GUIDES_URL;
  protected readonly npmCoreUrl = npmUrl(CORE_PACKAGE.packageName);

  protected readonly nextTheme = computed(() => {
    const index = THEME_CYCLE.indexOf(this.theme.preference());
    return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
  });

  /** Closed by the visitor (remembered) */
  private readonly closedByChoice = signal(false);
  /** Closed because the window is too narrow for the full menu */
  protected readonly closedBySize = signal(false);
  protected readonly collapsed = computed(() => this.closedBySize() || this.closedByChoice());
  protected readonly customising = signal(false);
  protected readonly sheet = signal<MenuSheet | null>(null);
  /** The settings panel floating beside the closed menu's gear */
  protected readonly settingsOpen = signal(false);
  private readonly settingsPopover = viewChild<ElementRef<HTMLElement>>('settingsPopover');
  private readonly settingsButton = viewChild<ElementRef<HTMLButtonElement>>('settingsButton');

  private readonly currentUrl = signal('/');
  /** Whether the page on screen belongs to a menu section, to light up its tab */
  protected onSectionPage(id: string): boolean {
    const section = this.sections().find((item) => item.id === id);
    return section ? sectionHasRoute(section, this.currentUrl().split(/[?#]/)[0]) : false;
  }

  private readonly openSections = signal<ReadonlySet<string>>(
    new Set(this.sections().filter((section) => section.openByDefault).map((section) => section.id)),
  );
  private readonly sheetDialog = viewChild<ElementRef<HTMLDialogElement>>('sheetDialog');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.restoreOpenSections();
      this.menuOrder.restore();
      this.closedByChoice.set(readStored(COLLAPSED_STORAGE) === true);
      const narrow = window.matchMedia(NARROW_DESKTOP);
      const desktop = window.matchMedia(DESKTOP);
      const follow = () => {
        this.closedBySize.set(narrow.matches);
        if (desktop.matches) {
          this.closeSheet();
        }
      };
      follow();
      narrow.addEventListener('change', follow);
      desktop.addEventListener('change', follow);
      destroyRef.onDestroy(() => {
        narrow.removeEventListener('change', follow);
        desktop.removeEventListener('change', follow);
      });
    });

    afterRenderEffect(() => {
      const dialog = this.sheetDialog()?.nativeElement;
      const open = this.sheet() !== null;
      if (dialog && open && !dialog.open) {
        dialog.showModal();
      } else if (dialog && !open && dialog.open) {
        dialog.close();
      }
    });

    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
        this.closeSheet();
        this.settingsOpen.set(false);
        this.openSectionOfPage(event.urlAfterRedirects);
      }
    });
  }

  protected isSectionOpen(id: string): boolean {
    return this.openSections().has(id);
  }

  protected toggleSection(id: string): void {
    this.setSectionOpen(id, !this.isSectionOpen(id));
    writeStored(OPEN_SECTIONS_STORAGE, [...this.openSections()]);
  }

  protected toggleCollapsed(): void {
    this.closedByChoice.update((closed) => !closed);
    this.customising.set(false);
    this.settingsOpen.set(false);
    writeStored(COLLAPSED_STORAGE, this.closedByChoice());
  }

  /** Escape closes the settings panel and puts focus back on the gear */
  protected closeSettings(): void {
    this.settingsOpen.set(false);
    this.settingsButton()?.nativeElement.focus();
  }

  protected closeSettingsOutside(event: PointerEvent): void {
    const popover = this.settingsPopover()?.nativeElement;
    if (popover && event.target instanceof Node && !popover.contains(event.target)) {
      this.settingsOpen.set(false);
    }
  }

  protected openSheet(sheet: MenuSheet): void {
    this.customising.set(false);
    this.sheet.update((current) => (current === sheet ? null : sheet));
  }

  protected closeSheet(): void {
    this.customising.set(false);
    this.sheet.set(null);
  }

  /** Escape: the browser would close the dialog by itself; closing it through the state keeps them in step */
  protected onSheetCancel(event: Event): void {
    event.preventDefault();
    this.closeSheet();
  }

  /** A click on the dialog element itself (not its content) is a click on the backdrop */
  protected onSheetClick(event: MouseEvent): void {
    if (event.target === this.sheetDialog()?.nativeElement) {
      this.closeSheet();
    }
  }

  protected cycleTheme(): void {
    this.theme.set(this.nextTheme());
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

  private restoreOpenSections(): void {
    const stored = readStored(OPEN_SECTIONS_STORAGE);
    if (Array.isArray(stored)) {
      const ids = this.sections()
        .map((section) => section.id)
        .filter((id) => stored.includes(id));
      this.openSections.set(new Set(ids));
    }
    this.openSectionOfPage(this.router.url);
  }

  private openSectionOfPage(url: string): void {
    const path = url.split(/[?#]/)[0];
    const section = this.sections().find((item) => sectionHasRoute(item, path));
    if (section) {
      this.setSectionOpen(section.id, true);
    }
  }
}
