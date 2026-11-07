import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { WordDictionaries } from '../../core/word-dictionaries';
import { BUILDER_LEVELS, BuilderLevelId, createLetterSet, firstVowelWords, GapWord, HINTS_IDS, HintsId, LETTER_MODE_IDS, LetterModeId, LetterSet, missingVowelWords, mixedWords, secondsForGapWord, secondsForMixedWord } from '../../games/letter-games';
import { TIMER_IDS, TimerId } from '../../games/math-games';
import { WORD_BANKS } from '../../games/words';
import { SiteLanguage } from '../../i18n/site-language';
import { Countdown } from '../../shared/countdown';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback';
import { TimerBar } from '../../shared/timer-bar';
import { BuilderRound } from './rounds/builder-round';
import { GapRound } from './rounds/gap-round';
import { MixedRound } from './rounds/mixed-round';

type Phase = 'ready' | 'playing' | 'done';

/** How long a finished word stays before the next one */
const SOLVED_MS = 700;

/**
 * Letter games: the settings screen, the progress through the words and the end screen.
 * Each kind of round is its own component; the words come from the word bank of the site's language,
 * so changing the language goes back to the settings.
 */
@Component({
  selector: 'app-letter-games-page',
  imports: [BuilderRound, GameBoard, GameFeedback, GapRound, MixedRound, RouterLink, TimerBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './letter-games-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './letter-games-page.scss'],
})
export class LetterGamesPage {
  private readonly language = inject(SiteLanguage);
  private readonly dictionaries = inject(WordDictionaries);

  protected readonly modes = LETTER_MODE_IDS;
  protected readonly builderLevels = BUILDER_LEVELS;
  protected readonly timers = TIMER_IDS;
  protected readonly hintOptions = HINTS_IDS;
  /** Texts in the site's language */
  protected readonly t = this.language.messages;
  /** The youngest recommended age, shown under the title */
  protected readonly minAge = gameInfo('letter-games').minAge;
  private readonly api = inject(GamesApi);

  private readonly bank = computed(() => WORD_BANKS[this.language.language()]);
  /** The word builder's dictionary in the site's language, and how its download is doing */
  protected readonly dictionary = computed(() => this.dictionaries.wordsOf(this.language.language()));
  protected readonly dictionaryStatus = computed(() => this.dictionaries.status(this.language.language()));
  protected readonly commonWords = computed(() => this.dictionaries.commonWordsOf(this.language.language()));
  protected readonly vowels = computed(() => this.bank().vowels);

  protected readonly modeId = signal<LetterModeId>('first-vowel');
  protected readonly builderLevelId = signal<BuilderLevelId>('easy');
  protected readonly timerId = signal<TimerId>('no-timer');
  protected readonly hintsId = signal<HintsId>('hints');
  protected readonly hasHints = computed(() => this.hintsId() === 'hints');
  protected readonly isBuilder = computed(() => this.modeId() === 'word-builder');
  protected readonly isTimed = computed(() => this.timerId() === 'timer');
  private readonly builderLevel = computed(
    () => BUILDER_LEVELS.find(({ id }) => id === this.builderLevelId()) ?? BUILDER_LEVELS[0],
  );
  protected readonly countdown = new Countdown();
  /** The game ended because time ran out (or, in the word builder, the letters' time did) */
  protected readonly isTimeUp = signal(false);
  private nextWordTimer?: ReturnType<typeof setTimeout>;

  /** Back to the settings whenever the language, and so the words, change */
  protected readonly phase = linkedSignal({ source: this.language.language, computation: (): Phase => 'ready' });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTimers());
    // The dictionary downloads as soon as the word builder is chosen, in the browser only
    afterRenderEffect(() => {
      if (this.isBuilder()) {
        void this.dictionaries.load(this.language.language());
      }
    });
  }

  protected readonly gapWords = signal<readonly GapWord[]>([]);
  protected readonly mixed = signal<readonly string[]>([]);
  protected readonly letterSet = signal<LetterSet | null>(null);
  protected readonly index = signal(0);
  protected readonly mistakes = signal(0);

  protected readonly total = computed(() =>
    this.modeId() === 'mixed-letters' ? this.mixed().length : this.gapWords().length,
  );
  protected readonly gapWord = computed(() => this.gapWords()[this.index()] ?? null);
  protected readonly mixedWord = computed(() => this.mixed()[this.index()] ?? null);
  /** Words finished: all of them, or those before time ran out */
  protected readonly wordsDone = computed(() => (this.isTimeUp() ? this.index() : this.total()));

  protected start(): void {
    this.api.countPlay('letter-games');
    const bank = this.bank();
    this.index.set(0);
    this.mistakes.set(0);
    this.isTimeUp.set(false);
    switch (this.modeId()) {
      case 'first-vowel':
        this.gapWords.set(firstVowelWords(bank, Math.random));
        break;
      case 'missing-vowels':
        this.gapWords.set(missingVowelWords(bank, Math.random));
        break;
      case 'mixed-letters':
        this.mixed.set(mixedWords(bank, Math.random));
        break;
      case 'word-builder':
        this.newLetters();
        break;
    }
    this.phase.set('playing');
    this.startWordTimer();
  }

  /** A new set of letters for the word builder, with its own time */
  protected newLetters(): void {
    const { letters, seconds } = this.builderLevel();
    this.letterSet.set(createLetterSet(this.bank(), letters, Math.random));
    this.isTimeUp.set(false);
    if (this.isTimed()) {
      this.countdown.start(seconds * 1000, () => this.isTimeUp.set(true));
    }
  }

  /** The word is right: it stays a moment, finished, then the next one comes */
  protected onSolved(): void {
    this.countdown.stop();
    this.nextWordTimer = setTimeout(() => {
      if (this.phase() !== 'playing') {
        return;
      }
      if (this.index() + 1 >= this.total()) {
        this.phase.set('done');
      } else {
        this.index.update((index) => index + 1);
        this.startWordTimer();
      }
    }, SOLVED_MS);
  }

  /** A bonus word reported as rude: it stops counting here straight away, and the API counts the report */
  protected onReported(word: string): void {
    const language = this.language.language();
    this.dictionaries.hide(language, word);
    void this.api.reportWord(word, language);
  }

  protected onMistake(): void {
    this.mistakes.update((mistakes) => mistakes + 1);
  }

  /** With the timer on, each word of the first three games has its own time; running out ends the game */
  private startWordTimer(): void {
    if (!this.isTimed() || this.isBuilder()) {
      return;
    }
    const gapWord = this.gapWord();
    const mixedWord = this.mixedWord();
    const seconds =
      this.modeId() === 'mixed-letters'
        ? mixedWord && secondsForMixedWord(mixedWord)
        : gapWord && secondsForGapWord(gapWord);
    if (!seconds) {
      return;
    }
    this.countdown.start(seconds * 1000, () => {
      if (this.phase() === 'playing') {
        this.isTimeUp.set(true);
        this.phase.set('done');
      }
    });
  }

  private stopTimers(): void {
    this.countdown.stop();
    clearTimeout(this.nextWordTimer);
  }

  protected backToSettings(): void {
    this.stopTimers();
    this.phase.set('ready');
  }
}
