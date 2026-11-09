import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../core/site-storage';
import { EN } from './en';
import { ES } from './es';
import { EU } from './eu';
import { IT } from './it';
import { UK } from './uk';
import { LanguageId, SiteMessages } from './site-messages';

const MESSAGES: Readonly<Record<LanguageId, SiteMessages>> = {
  en: EN,
  es: ES,
  eu: EU,
  it: IT,
  uk: UK,
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

const isLanguageId = (value: unknown): value is LanguageId =>
  LANGUAGE_IDS.some(id => id === value);

/**
 * The language the whole games site is shown in: header, footer and every page.
 * Starts in English, so prerendered HTML is English, then switches to the visitor's saved choice
 * or, on a first visit, to the browser's language when it is one of ours.
 */
@Injectable({ providedIn: 'root' })
export class SiteLanguage {
  private readonly document = inject(DOCUMENT);
  private readonly languageId = signal<LanguageId>('en');

  readonly language = this.languageId.asReadonly();
  readonly messages = computed(() => MESSAGES[this.languageId()]);

  constructor() {
    afterNextRender(() => this.languageId.set(initialLanguage()));
    // Screen readers and browser translation read the page language from <html lang>
    effect(() =>
      this.document.documentElement.setAttribute('lang', this.languageId())
    );
  }

  /** Switch language and remember it in this browser */
  set(id: LanguageId): void {
    this.languageId.set(id);
    writeStored(LANGUAGE_STORAGE, id);
  }

  /** A language's own name, for the picker */
  nameOf(id: LanguageId): string {
    return MESSAGES[id].languageName;
  }

  /** A language's short code, for the picker */
  codeOf(id: LanguageId): string {
    return MESSAGES[id].languageCode;
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
