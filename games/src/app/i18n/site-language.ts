import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../core/site-storage';
import { PlayerGender } from '../core/player-gender';
import { spanish } from './es';
import { LANGUAGE_IDS, LanguageId, SiteMessages } from './site-messages';
import { WordGender } from './word-gender';

type MessagesFor = (gender: WordGender) => SiteMessages;

const LOADERS: Readonly<Record<LanguageId, () => Promise<MessagesFor>>> = {
  en: () => import('./en').then(({ EN }) => () => EN),
  es: () => Promise.resolve(spanish),
  eu: () => import('./eu').then(({ EU }) => () => EU),
  it: () => import('./it').then(({ italian }) => italian),
  uk: () => import('./uk').then(({ ukrainian }) => ukrainian),
};

const LANGUAGE_LABELS: Readonly<Record<LanguageId, { readonly name: string; readonly code: string }>> = {
  en: { name: 'English', code: 'EN' },
  es: { name: 'Español', code: 'ES' },
  eu: { name: 'Euskara', code: 'EU' },
  it: { name: 'Italiano', code: 'IT' },
  uk: { name: 'Українська', code: 'УКР' },
};

export { LANGUAGE_IDS };

const LANGUAGE_STORAGE = 'language';

export const PRERENDER_LANGUAGE: LanguageId = 'es';

export const PRERENDER_MESSAGES: SiteMessages = spanish('boy');

const isLanguageId = (value: unknown): value is LanguageId =>
  LANGUAGE_IDS.some(id => id === value);

@Injectable({ providedIn: 'root' })
export class SiteLanguage {
  private readonly document = inject(DOCUMENT);
  private readonly languageId = signal<LanguageId>(PRERENDER_LANGUAGE);
  private readonly gender = inject(PlayerGender);
  private readonly loaded = signal<Partial<Record<LanguageId, MessagesFor>>>({ [PRERENDER_LANGUAGE]: spanish });

  readonly language = this.languageId.asReadonly();
  readonly messages = computed(() => (this.loaded()[this.languageId()] ?? spanish)(this.gender.wordGender()));

  constructor() {
    afterNextRender(() => void this.show(initialLanguage()));
    effect(() =>
      this.document.documentElement.setAttribute('lang', this.languageId())
    );
  }

  set(id: LanguageId): void {
    writeStored(LANGUAGE_STORAGE, id);
    void this.show(id);
  }

  nameOf(id: LanguageId): string {
    return LANGUAGE_LABELS[id].name;
  }

  codeOf(id: LanguageId): string {
    return LANGUAGE_LABELS[id].code;
  }

  private async show(id: LanguageId): Promise<void> {
    if (!this.loaded()[id]) {
      try {
        const messages = await LOADERS[id]();
        this.loaded.update((loaded) => ({ ...loaded, [id]: messages }));
      } catch {
        return;
      }
    }
    this.languageId.set(id);
  }
}

function initialLanguage(): LanguageId {
  const stored = readStored(LANGUAGE_STORAGE);
  if (isLanguageId(stored)) {
    return stored;
  }
  const browser = navigator.languages
    .map(tag => tag.slice(0, 2).toLowerCase())
    .find(isLanguageId);
  return browser ?? 'en';
}
