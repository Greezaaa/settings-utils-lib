import { Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';

/**
 * Bump when the dictionaries are rebuilt (npm run build:dictionaries), so browsers fetch the new files instead of
 * their cached copy.
 */
export const DICTIONARY_VERSION = 2;

/** Where a dictionary is, as served from games/public/dictionaries/ */
export const dictionaryUrl = (language: LanguageId): string => `/dictionaries/${language}.txt?v=${DICTIONARY_VERSION}`;

/** A dictionary file, one word per line, as a set of words */
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
 */
@Injectable({ providedIn: 'root' })
export class WordDictionaries {
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
      const words = parseDictionary(await response.text());
      this.words.update((all) => ({ ...all, [language]: words }));
      this.setStatus(language, 'ready');
    } catch {
      this.setStatus(language, 'failed');
    }
  }

  private setStatus(language: LanguageId, status: DictionaryStatus): void {
    this.statuses.update((all) => ({ ...all, [language]: status }));
  }
}
