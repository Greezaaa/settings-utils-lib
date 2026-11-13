import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureFlags } from '../../../core/feature-flags';
import { GameAvailability } from '../../../core/game-availability';
import { readStored, writeStored } from '../../../core/site-storage';
import { LAST_SEEN_STORAGE, LATEST_VERSION, recentChanges, UPDATE_KIND_TAGS } from '../../../core/site-updates';
import { SiteLanguage } from '../../../i18n/site-language';
import { TranslatePipe } from '../../../i18n/translate-pipe';

const SHORT_LIST = 3;
const LONG_LIST = 15;

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
  private readonly features = inject(FeatureFlags);
  protected readonly t = this.language.messages;

  protected readonly isExpanded = signal(false);
  private readonly lastSeen = signal<number | null>(null);
  private readonly inBrowser = signal(false);

  private readonly changes = computed(() =>
    recentChanges().filter(
      ({ change }) =>
        (!change.game || this.availability.canPlay(change.game)) &&
        (!change.feature || this.features.canUse(change.feature)),
    ),
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
        kindTag: UPDATE_KIND_TAGS[change.kind],
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
