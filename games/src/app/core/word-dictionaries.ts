import { inject, Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { GamesApi } from './games-api';

/**
 * Bump when the dictionaries are rebuilt (npm run build:dictionaries), so browsers fetch the new files instead of
 * their cached copy.
 */
export const DICTIONARY_VERSION = 5;

/** Where a dictionary is, as served from games/public/dictionaries/ */
export const dictionaryUrl = (language: LanguageId): string => `/dictionaries/${language}.txt?v=${DICTIONARY_VERSION}`;

/**
 * How many of the most common words of a dictionary can be words to find in the word builder; rarer words still
 * count when typed, but aren't asked for
 */
export const COMMON_WORDS = 15_000;

/** A dictionary file, one word per line, most common first, as a set of words in that order */
export function parseDictionary(text: string): ReadonlySet<string> {
  return new Set(
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

export type DictionaryStatus = 'loading' | 'ready' | 'failed';

/**
 * The word builder's dictionaries: each language's is downloaded only when first needed, once per visit, then kept
 * in memory; the browser's cache keeps the file for later visits. Nothing is saved by the site itself.
 * Words players reported, and that don't count for now (from the API), are left out.
 */
@Injectable({ providedIn: 'root' })
export class WordDictionaries {
  private readonly api = inject(GamesApi);
  private readonly words = signal<Partial<Record<LanguageId, ReadonlySet<string>>>>({});
  private readonly statuses = signal<Partial<Record<LanguageId, DictionaryStatus>>>({});

  /** How a language's dictionary is doing; `undefined` until it is asked for */
  status(language: LanguageId): DictionaryStatus | undefined {
    return this.statuses()[language];
  }

  /** A language's words, once downloaded */
  wordsOf(language: LanguageId): ReadonlySet<string> | undefined {
    return this.words()[language];
  }

  /** A language's most common words (see COMMON_WORDS), once downloaded */
  commonWordsOf(language: LanguageId): readonly string[] {
    return [...(this.wordsOf(language) ?? [])].slice(0, COMMON_WORDS);
  }

  /** Downloads a language's dictionary unless it is loaded or loading; a failed download is tried again */
  async load(language: LanguageId): Promise<void> {
    const status = this.status(language);
    if (status === 'loading' || status === 'ready') {
      return;
    }
    this.setStatus(language, 'loading');
    try {
      const response = await fetch(dictionaryUrl(language));
      if (!response.ok) {
        throw new Error(`Dictionary ${language}: ${response.status}`);
      }
      const [text, hidden] = await Promise.all([response.text(), this.api.hiddenWords(language)]);
      const words = new Set(parseDictionary(text));
      hidden.forEach((word) => words.delete(word));
      this.words.update((all) => ({ ...all, [language]: words }));
      this.setStatus(language, 'ready');
    } catch {
      this.setStatus(language, 'failed');
    }
  }

  /** Stops a word counting for the rest of this visit, e.g. after the player reports it */
  hide(language: LanguageId, word: string): void {
    const words = this.wordsOf(language);
    if (words?.has(word)) {
      const remaining = new Set(words);
      remaining.delete(word);
      this.words.update((all) => ({ ...all, [language]: remaining }));
    }
  }

  private setStatus(language: LanguageId, status: DictionaryStatus): void {
    this.statuses.update((all) => ({ ...all, [language]: status }));
  }
}
