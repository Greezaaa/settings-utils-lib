import { afterNextRender, computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { isLanguageId, LanguageId } from '../i18n/site-messages';
import { SiteLanguage } from '../i18n/site-language';
import { field } from './api-url';
import { Connection } from './connection';
import { GamesApi, isSuggestionCategory, SuggestionCategory, SuggestionResult } from './games-api';
import { readStored, writeStored } from './site-storage';
import { minutesUntilNextSend, remainingSends, sendsInLastHour, SUGGESTIONS_PER_HOUR } from './suggestion-limit';

const SENT_STORAGE = 'suggestions-sent';
const OUTBOX_STORAGE = 'suggestion-outbox';

export interface SuggestionDraft {
  readonly category: SuggestionCategory;
  readonly text: string;
  readonly language: LanguageId;
  readonly image: Blob | null;
  readonly website: string;
}

interface SavedSuggestion {
  readonly category: SuggestionCategory;
  readonly text: string;
  readonly language: LanguageId;
  readonly image: string | null;
}

export type SendOutcome = Exclude<SuggestionResult, 'offline'> | 'saved';

@Injectable({ providedIn: 'root' })
export class SuggestionSender {
  private readonly api = inject(GamesApi);
  private readonly notifications = inject(SuNotificationService);
  private readonly messages = inject(SiteLanguage).messages;
  private readonly now = signal(Date.now());
  private readonly sent = signal<readonly number[]>([]);
  private isFlushing = false;

  readonly remaining = computed(() => remainingSends(sendsInLastHour(this.sent(), this.now())));
  readonly minutesToWait = computed(() => minutesUntilNextSend(sendsInLastHour(this.sent(), this.now()), this.now()));

  constructor() {
    const connection = inject(Connection);
    const isRendered = signal(false);
    afterNextRender(() => {
      this.sent.set(sendsInLastHour(readStored(SENT_STORAGE), Date.now()));
      isRendered.set(true);
    });
    effect(() => {
      if (isRendered() && connection.isOnline()) {
        untracked(() => void this.flush());
      }
    });
  }

  tick(): void {
    this.now.set(Date.now());
  }

  async send(draft: SuggestionDraft): Promise<SendOutcome> {
    const result = await this.api.sendSuggestion(formOf(draft, draft.image));
    if (result === 'sent') {
      this.recordSend();
    }
    if (result !== 'offline') {
      return result;
    }
    const saved = readSaved();
    writeStored(OUTBOX_STORAGE, [...saved, await toSaved(draft)].slice(-SUGGESTIONS_PER_HOUR));
    return 'saved';
  }

  private async flush(): Promise<void> {
    const saved = readSaved();
    if (this.isFlushing || saved.length === 0) {
      return;
    }
    this.isFlushing = true;
    const waiting: SavedSuggestion[] = [];
    let sentCount = 0;
    for (const [index, suggestion] of saved.entries()) {
      const image = suggestion.image ? await (await fetch(suggestion.image)).blob() : null;
      const result = await this.api.sendSuggestion(formOf({ ...suggestion, website: '' }, image));
      if (result === 'sent') {
        sentCount++;
        this.recordSend();
      } else if (result !== 'refused') {
        waiting.push(...saved.slice(index));
        break;
      }
    }
    writeStored(OUTBOX_STORAGE, waiting);
    this.isFlushing = false;
    if (sentCount > 0) {
      this.notifications.show({ type: 'success', message: this.messages().suggestions.savedSent });
    }
  }

  private recordSend(): void {
    const now = Date.now();
    this.now.set(now);
    this.sent.update((times) => [...sendsInLastHour(times, now), now]);
    writeStored(SENT_STORAGE, this.sent());
  }
}

function formOf({ category, text, language, website }: Omit<SuggestionDraft, 'image'>, image: Blob | null): FormData {
  const data = new FormData();
  data.set('category', category);
  data.set('text', text);
  data.set('language', language);
  if (website) {
    data.set('website', website);
  }
  if (image) {
    data.set('image', image, image.type === 'image/webp' ? 'picture.webp' : 'picture.jpg');
  }
  return data;
}

function toSaved({ category, text, language, image }: SuggestionDraft): Promise<SavedSuggestion> {
  if (!image) {
    return Promise.resolve({ category, text, language, image: null });
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ category, text, language, image: typeof reader.result === 'string' ? reader.result : null });
    reader.onerror = () => resolve({ category, text, language, image: null });
    reader.readAsDataURL(image);
  });
}

function readSaved(): SavedSuggestion[] {
  const stored = readStored(OUTBOX_STORAGE);
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored.flatMap((item: unknown) => {
    const [category, text, language, image] = ['category', 'text', 'language', 'image'].map((name) => field(item, name));
    return isSuggestionCategory(category) && typeof text === 'string' && isLanguageId(language) && (image === null || typeof image === 'string')
      ? [{ category, text, language, image }]
      : [];
  });
}
