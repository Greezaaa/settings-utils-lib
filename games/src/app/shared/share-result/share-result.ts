import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, input, signal } from '@angular/core';
import { FeatureFlags } from '../../core/feature-flags';
import { GameSlug } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

const COPIED_MS = 2000;

@Component({
  selector: 'app-share-result',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './share-result.html',
  styleUrl: './share-result.scss',
})
export class ShareResult {
  readonly game = input.required<GameSlug>();
  readonly details = input<readonly string[]>([]);

  private readonly document = inject(DOCUMENT);
  private readonly messages = inject(SiteLanguage).messages;
  private readonly features = inject(FeatureFlags);
  protected readonly isShown = computed(() => this.features.canUse('share-results'));
  protected readonly isCopied = signal(false);

  protected async share(): Promise<void> {
    const messages = this.messages();
    const name = messages.games[this.game()].name;
    const text = `${messages.share.challenge}\n${[name, ...this.details()].join(' · ')}`;
    const url = `${this.document.location.origin}/${this.game()}`;
    const navigator = this.document.defaultView?.navigator;
    if (!navigator) {
      return;
    }
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: name, text, url }).catch(() => undefined);
      return;
    }
    const isCopied = await navigator.clipboard.writeText(`${text}\n${url}`).then(
      () => true,
      () => false,
    );
    if (isCopied) {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), COPIED_MS);
    }
  }
}
