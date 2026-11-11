import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameAvailability } from '../../../core/game-availability';
import { readStored, writeStored } from '../../../core/site-storage';
import { LAST_SEEN_STORAGE, LATEST_VERSION, recentChanges } from '../../../core/site-updates';
import { SiteLanguage } from '../../../i18n/site-language';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/** Changes shown at first, and with "Show more updates" */
const SHORT_LIST = 3;
const LONG_LIST = 15;

/**
 * "What's new" on the home page: the latest changes to the site, newest first, 3 at first and up to 15 on request.
 * Each change has a tag saying what it's about; changes since the visitor's last visit also get a "New" badge.
 * They count as seen once the visitor leaves the home page, so a reload keeps them. Changes about a game that isn't open aren't listed.
 */
@Component({
  selector: 'app-whats-new',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './whats-new.html',
  styleUrl: './whats-new.scss',
})
export class WhatsNew {
  private readonly language = inject(SiteLanguage);
  private readonly availability = inject(GameAvailability);
  protected readonly t = this.language.messages;

  protected readonly isExpanded = signal(false);
  /** The version the visitor saw last, read in the browser; null on a first visit or while prerendering */
  private readonly lastSeen = signal<number | null>(null);
  /** Whether the list has been shown in the browser (not while prerendering), so its versions count as seen */
  private readonly inBrowser = signal(false);

  private readonly changes = computed(() =>
    recentChanges().filter(({ change }) => !change.game || this.availability.canPlay(change.game)),
  );
  protected readonly items = computed(() => {
    const language = this.language.language();
    const lastSeen = this.lastSeen();
    return this.changes()
      .slice(0, this.isExpanded() ? LONG_LIST : SHORT_LIST)
      .map(({ change, version }) => ({
        key: `${version}:${change.text.en}`,
        text: change.text[language],
        kind: this.t().home.updateKinds[change.kind],
        game: change.game,
        isNew: lastSeen !== null && version > lastSeen,
      }));
  });
  protected readonly hasMore = computed(() => this.changes().length > SHORT_LIST);

  constructor() {
    afterNextRender(() => {
      const stored = readStored(LAST_SEEN_STORAGE);
      this.lastSeen.set(typeof stored === 'number' && Number.isInteger(stored) ? stored : null);
      this.inBrowser.set(true);
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.inBrowser()) {
        writeStored(LAST_SEEN_STORAGE, LATEST_VERSION);
      }
    });
  }
}
