import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { GamesApi, SUGGESTION_CATEGORIES, SuggestionCategory } from '../../core/games-api';
import { shrinkImage } from '../../core/shrink-image';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

/** Longest text the API accepts */
export const MAX_SUGGESTION_LENGTH = 500;
const MIN_SUGGESTION_LENGTH = 3;

type Sending = 'idle' | 'sending' | 'failed';

/**
 * Suggestions: an idea for a new game, an improvement, a drawing or a problem, with an optional picture that is
 * shrunk and cleaned of metadata on the device before it is sent. Only the site's author reads them.
 */
@Component({
  selector: 'app-suggestions-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suggestions-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './suggestions-page.scss'],
})
export class SuggestionsPage {
  private readonly api = inject(GamesApi);
  private readonly language = inject(SiteLanguage);
  private readonly notifications = inject(SuNotificationService);
  protected readonly t = this.language.messages;

  protected readonly categories = SUGGESTION_CATEGORIES;
  protected readonly maxLength = MAX_SUGGESTION_LENGTH;
  protected readonly category = signal<SuggestionCategory>('new-game');
  protected readonly text = signal('');
  protected readonly image = signal<Blob | null>(null);
  /** A preview of the chosen picture, as an object URL released when replaced or when the page closes */
  protected readonly preview = signal<string | null>(null);
  protected readonly imageError = signal(false);
  protected readonly sending = signal<Sending>('idle');

  protected readonly canSend = computed(
    () => this.text().trim().length >= MIN_SUGGESTION_LENGTH && this.sending() !== 'sending',
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.setPreview(null));
  }

  protected onText(event: Event): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.text.set(event.target.value);
    }
  }

  /** A file is being dragged over the drop zone */
  protected readonly isDragging = signal(false);

  protected onImage(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    void this.useImage(input?.files?.[0]);
    if (input) {
      // So choosing the same file again after removing it still counts as a change
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

  /** Shrinks a chosen or dropped picture and shows it; anything that isn't a picture shows an error */
  private async useImage(file: File | undefined): Promise<void> {
    this.imageError.set(false);
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.imageError.set(true);
      return;
    }
    try {
      const image = await shrinkImage(file);
      this.image.set(image);
      this.setPreview(URL.createObjectURL(image));
    } catch {
      this.imageError.set(true);
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
    this.sending.set('sending');
    const data = new FormData();
    data.set('category', this.category());
    data.set('text', this.text().trim());
    data.set('language', this.language.language());
    const image = this.image();
    if (image) {
      data.set('image', image, image.type === 'image/webp' ? 'picture.webp' : 'picture.jpg');
    }
    if (!(await this.api.sendSuggestion(data))) {
      this.sending.set('failed');
      return;
    }
    this.notifications.show({ type: 'success', message: this.t().suggestions.sent });
    form.reset();
    this.text.set('');
    this.removeImage();
    this.sending.set('idle');
  }

  private setPreview(url: string | null): void {
    const previous = this.preview();
    if (previous) {
      URL.revokeObjectURL(previous);
    }
    this.preview.set(url);
  }
}
