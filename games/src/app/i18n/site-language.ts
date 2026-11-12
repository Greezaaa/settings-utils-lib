import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../core/site-storage';
import { PlayerGender } from '../core/player-gender';
import { spanish } from './es';
import { LanguageId, SiteMessages } from './site-messages';
import { WordGender } from './word-gender';

/** A language's texts, in the boy's or the girl's forms (English and Basque don't change with it) */
type MessagesFor = (gender: WordGender) => SiteMessages;

/**
 * Each language's texts, downloaded only when a visitor needs them: every language in the first download would make
 * it twice as big, and a visitor reads one. Spanish, the prerendered pages' language, is always there (below).
 */
const LOADERS: Readonly<Record<LanguageId, () => Promise<MessagesFor>>> = {
  en: () => import('./en').then(({ EN }) => () => EN),
  es: () => Promise.resolve(spanish),
  eu: () => import('./eu').then(({ EU }) => () => EU),
  it: () => import('./it').then(({ italian }) => italian),
  uk: () => import('./uk').then(({ ukrainian }) => ukrainian),
};

/** Each language's own name and short code, for the picker, without downloading its texts */
const LANGUAGE_LABELS: Readonly<Record<LanguageId, { readonly name: string; readonly code: string }>> = {
  en: { name: 'English', code: 'EN' },
  es: { name: 'Español', code: 'ES' },
  eu: { name: 'Euskara', code: 'EU' },
  it: { name: 'Italiano', code: 'IT' },
  uk: { name: 'Українська', code: 'УКР' },
};

/** Languages in the order of the picker */
export const LANGUAGE_IDS: readonly LanguageId[] = [
  'en',
  'es',
  'eu',
  'it',
  'uk',
];

const LANGUAGE_STORAGE = 'language';

/**
 * The language prerendered pages are built in, matching their titles and descriptions for search engines; most players
 * are Spanish kids. In the browser the site then switches to the visitor's language.
 */
export const PRERENDER_LANGUAGE: LanguageId = 'es';

/** The prerendered pages' texts, in the forms used until the player chooses (the boy's) */
export const PRERENDER_MESSAGES: SiteMessages = spanish('boy');

const isLanguageId = (value: unknown): value is LanguageId =>
  LANGUAGE_IDS.some(id => id === value);

/**
 * The language the whole games site is shown in: header, footer and every page.
 * Starts in PRERENDER_LANGUAGE, like the prerendered HTML, then switches to the visitor's saved choice
 * or, on a first visit, to the browser's language when it is one of ours.
 */
@Injectable({ providedIn: 'root' })
export class SiteLanguage {
  private readonly document = inject(DOCUMENT);
  private readonly languageId = signal<LanguageId>(PRERENDER_LANGUAGE);
  private readonly gender = inject(PlayerGender);
  /** The languages downloaded so far */
  private readonly loaded = signal<Partial<Record<LanguageId, MessagesFor>>>({ [PRERENDER_LANGUAGE]: spanish });

  readonly language = this.languageId.asReadonly();
  readonly messages = computed(() => (this.loaded()[this.languageId()] ?? spanish)(this.gender.wordGender()));

  constructor() {
    afterNextRender(() => void this.show(initialLanguage()));
    // Screen readers and browser translation read the page language from <html lang>
    effect(() =>
      this.document.documentElement.setAttribute('lang', this.languageId())
    );
  }

  /** Switch language and remember it in this browser */
  set(id: LanguageId): void {
    writeStored(LANGUAGE_STORAGE, id);
    void this.show(id);
  }

  /** A language's own name, for the picker */
  nameOf(id: LanguageId): string {
    return LANGUAGE_LABELS[id].name;
  }

  /** A language's short code, for the picker */
  codeOf(id: LanguageId): string {
    return LANGUAGE_LABELS[id].code;
  }

  /**
   * Shows a language once its texts are here: the page keeps the current one meanwhile, so it never shows half of
   * each. When the download fails (offline), the page stays as it is and the next choice tries again.
   */
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
  // e.g. `es-ES` → `es`
  const browser = navigator.languages
    .map(tag => tag.slice(0, 2).toLowerCase())
    .find(isLanguageId);
  return browser ?? 'en';
}
