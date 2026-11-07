import { afterNextRender, computed, Injectable, signal } from '@angular/core';
import { readStored, writeStored } from '../game-storage';
import { EN } from './en';
import { ES } from './es';
import { EU } from './eu';
import { GameMessages, LanguageId } from './game-messages';

const MESSAGES: Readonly<Record<LanguageId, GameMessages>> = { en: EN, es: ES, eu: EU };

/** Languages in the order of the picker */
export const LANGUAGE_IDS: readonly LanguageId[] = ['en', 'es', 'eu'];

const LANGUAGE_STORAGE = 'language';

const isLanguageId = (value: unknown): value is LanguageId => LANGUAGE_IDS.some((id) => id === value);

/**
 * The language the Math games are shown in, shared by the page and its rounds (provided by the page).
 * Starts in English, so prerendered HTML is English, then switches to the player's saved choice
 * or, on a first visit, to the browser's language when it is one of ours.
 */
@Injectable()
export class GameLanguage {
  private readonly languageId = signal<LanguageId>('en');

  readonly language = this.languageId.asReadonly();
  readonly messages = computed(() => MESSAGES[this.languageId()]);

  constructor() {
    afterNextRender(() => this.languageId.set(initialLanguage()));
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
}

function initialLanguage(): LanguageId {
  const stored = readStored(LANGUAGE_STORAGE);
  if (isLanguageId(stored)) {
    return stored;
  }
  // e.g. `es-ES` → `es`
  const browser = navigator.languages.map((tag) => tag.slice(0, 2).toLowerCase()).find(isLanguageId);
  return browser ?? 'en';
}
