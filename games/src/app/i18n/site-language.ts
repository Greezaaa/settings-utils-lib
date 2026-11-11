import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../core/site-storage';
import { PlayerGender } from '../core/player-gender';
import { EN } from './en';
import { spanish } from './es';
import { EU } from './eu';
import { italian } from './it';
import { ukrainian } from './uk';
import { LanguageId, SiteMessages } from './site-messages';
import { WordGender } from './word-gender';

/** Each language's texts, in the boy's or the girl's forms (English and Basque don't change with it) */
const MESSAGES: Readonly<
  Record<LanguageId, (gender: WordGender) => SiteMessages>
> = {
  en: () => EN,
  es: spanish,
  eu: () => EU,
  it: italian,
  uk: ukrainian,
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

/** A language's texts in the forms used until the player chooses (the boy's) */
export const messagesIn = (id: LanguageId): SiteMessages => MESSAGES[id]('boy');

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

  readonly language = this.languageId.asReadonly();
  readonly messages = computed(() =>
    MESSAGES[this.languageId()](this.gender.wordGender())
  );

  constructor() {
    afterNextRender(() => this.languageId.set(initialLanguage()));
    // Screen readers and browser translation read the page language from <html lang>
    effect(() =>
      this.document.documentElement.setAttribute('lang', this.languageId())
    );
  }

  set(id: LanguageId): void {
    this.languageId.set(id);
    writeStored(LANGUAGE_STORAGE, id);
  }

  nameOf(id: LanguageId): string {
    return messagesIn(id).languageName;
  }

  codeOf(id: LanguageId): string {
    return messagesIn(id).languageCode;
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
