import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { FeatureFlags } from '../../core/feature-flags';
import { SUGGESTION_CATEGORIES, SuggestionCategory } from '../../core/games-api';
import { SendOutcome, SuggestionSender } from '../../core/suggestion-sender';
import { shrinkImage } from '../../core/shrink-image';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { SuAutoGrowDirective } from '@su-labs/fields';

export const MAX_SUGGESTION_LENGTH = 500;
const MIN_SUGGESTION_LENGTH = 3;


@Component({
  selector: 'app-suggestions-page',
  imports: [TranslatePipe, SuAutoGrowDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suggestions-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './suggestions-page.scss'],
})
export class SuggestionsPage {
  protected readonly sender = inject(SuggestionSender);
  private readonly language = inject(SiteLanguage);
  private readonly notifications = inject(SuNotificationService);
  protected readonly t = this.language.messages;
  private readonly features = inject(FeatureFlags);
  protected readonly hasLivelyFields = computed(() => this.features.canUse('lively-fields'));

  protected readonly categories = SUGGESTION_CATEGORIES;
  protected readonly maxLength = MAX_SUGGESTION_LENGTH;
  protected readonly category = signal<SuggestionCategory>('new-game');
  protected readonly text = signal('');
  protected readonly image = signal<Blob | null>(null);
  protected readonly preview = signal<string | null>(null);
  protected readonly isSending = signal(false);

  protected readonly canSend = computed(
    () => this.text().trim().length >= MIN_SUGGESTION_LENGTH && !this.isSending() && this.sender.remaining() > 0,
  );

  constructor() {
    this.sender.tick();
    inject(DestroyRef).onDestroy(() => this.setPreview(null));
  }

  protected onText(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.text.set(event.target.value);
    }
  }

  protected readonly isDragging = signal(false);

  protected onImage(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    void this.useImage(input?.files?.[0]);
    if (input) {
      input.value = '';
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    void this.useImage(event.dataTransfer?.files[0]);
  }

  private async useImage(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Not a picture');
      }
      const image = await shrinkImage(file);
      this.image.set(image);
      this.setPreview(URL.createObjectURL(image));
    } catch {
      this.notifications.show({ type: 'error', message: this.t().suggestions.imageError });
      this.removeImage();
    }
  }

  protected removeImage(): void {
    this.image.set(null);
    this.setPreview(null);
  }

  protected async send(form: HTMLFormElement): Promise<void> {
    if (!this.canSend()) {
      return;
    }
    this.isSending.set(true);
    const website = new FormData(form).get('website');
    const outcome = await this.sender.send({
      category: this.category(),
      text: this.text().trim(),
      language: this.language.language(),
      image: this.image(),
      website: typeof website === 'string' ? website : '',
    });
    this.isSending.set(false);
    this.notify(outcome);
    if (outcome === 'sent' || outcome === 'saved') {
      form.reset();
      this.text.set('');
      this.removeImage();
    }
  }

  private notify(outcome: SendOutcome): void {
    const texts = this.t().suggestions;
    const notices: Record<SendOutcome, { type: 'success' | 'info' | 'error'; message: string }> = {
      sent: { type: 'success', message: texts.sent },
      saved: { type: 'info', message: texts.saved },
      'too-many': { type: 'error', message: texts.tooMany },
      refused: { type: 'error', message: texts.refused },
    };
    this.notifications.show(notices[outcome]);
  }

  private setPreview(url: string | null): void {
    const previous = this.preview();
    if (previous) {
      URL.revokeObjectURL(previous);
    }
    this.preview.set(url);
  }
}
