import { inject, Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { GamesApi } from './games-api';

export const DICTIONARY_VERSION = 5;

export const dictionaryUrl = (language: LanguageId): string => `/dictionaries/${language}.txt?v=${DICTIONARY_VERSION}`;

export const COMMON_WORDS = 15_000;

export function parseDictionary(text: string): ReadonlySet<string> {
  return new Set(
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

export type DictionaryStatus = 'loading' | 'ready' | 'failed';

@Injectable({ providedIn: 'root' })
export class WordDictionaries {
  private readonly api = inject(GamesApi);
  private readonly words = signal<Partial<Record<LanguageId, ReadonlySet<string>>>>({});
  private readonly statuses = signal<Partial<Record<LanguageId, DictionaryStatus>>>({});

  status(language: LanguageId): DictionaryStatus | undefined {
    return this.statuses()[language];
  }

  wordsOf(language: LanguageId): ReadonlySet<string> | undefined {
    return this.words()[language];
  }

  commonWordsOf(language: LanguageId): readonly string[] {
    return [...(this.wordsOf(language) ?? [])].slice(0, COMMON_WORDS);
  }

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
