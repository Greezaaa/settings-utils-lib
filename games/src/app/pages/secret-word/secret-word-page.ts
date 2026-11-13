import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { HINTS_IDS, HintsId } from '../../games/letter-games';
import { DEFAULT_SECRET_HINTS, DEFAULT_SECRET_LEVEL, getSecretLevel, keyboardRows, keyMarks, LetterMark, markGuess, MAX_GUESSES, pickSecret, SECRET_LEVELS, SecretLevelId, SecretWord, secretWords } from '../../games/secret-word';
import { WORD_BANKS } from '../../games/words';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';

type Phase = 'playing' | 'won' | 'lost';

interface Tile {
  readonly letter: string;
  readonly mark: LetterMark | null;
}

@Component({
  selector: 'app-secret-word-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './secret-word-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
    '../../shared/play-layout.scss',
    './secret-word-page.scss',
  ],
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class SecretWordPage {
  protected readonly levels = SECRET_LEVELS;
  protected readonly hintOptions = HINTS_IDS;
  protected readonly minAge = gameInfo('secret-word').minAge;
  private readonly api = inject(GamesApi);
  private readonly language = inject(SiteLanguage).language;

  protected readonly levelId = signal<SecretLevelId>(DEFAULT_SECRET_LEVEL);
  protected readonly level = computed(() => getSecretLevel(this.levelId()));
  protected readonly hintsId = signal<HintsId>(DEFAULT_SECRET_HINTS);
  protected readonly phase = signal<Phase>('playing');
  protected readonly secret = signal<SecretWord | null>(null);
  private readonly secretLetters = computed(() => Array.from(this.secret()?.word ?? ''));
  private readonly guesses = signal<readonly (readonly string[])[]>([]);
  private readonly typing = signal<readonly string[]>([]);
  protected readonly isTooShort = signal(false);

  protected readonly keyboard = computed(() => keyboardRows(WORD_BANKS[this.language()], this.language()));
  private readonly keys = computed(() => new Set(this.keyboard().flat()));
  protected readonly marks = computed(() => keyMarks(this.guesses(), this.secretLetters()));
  protected readonly triesLeft = computed(() => MAX_GUESSES - this.guesses().length);

  protected readonly rows = computed<Tile[][]>(() => {
    const [guesses, typing, length] = [this.guesses(), this.typing(), this.level().length];
    return Array.from({ length: MAX_GUESSES }, (_, row) => {
      const guess = guesses[row];
      if (guess) {
        const marks = markGuess(guess, this.secretLetters());
        return guess.map((letter, index) => ({ letter, mark: marks[index] }));
      }
      const letters = row === guesses.length ? typing : [];
      return Array.from({ length }, (_, index) => ({ letter: letters[index] ?? '', mark: null }));
    });
  });

  private hasStarted = false;
  private readonly isRendered = signal(false);

  constructor() {
    afterNextRender(() => this.isRendered.set(true));
    effect(() => {
      if (this.isRendered()) {
        this.language();
        untracked(() => this.newGame());
      }
    });
  }

  protected shown(letter: string): string {
    return letter.toLocaleUpperCase(this.language());
  }

  protected chooseLevel(id: SecretLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected chooseHints(id: HintsId): void {
    this.hintsId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    const words = secretWords(WORD_BANKS[this.language()], this.level(), this.hintsId());
    this.secret.set(pickSecret(words, Math.random, this.secret()?.word ?? null));
    this.guesses.set([]);
    this.typing.set([]);
    this.isTooShort.set(false);
    this.hasStarted = false;
    this.phase.set('playing');
  }

  protected type(letter: string): void {
    if (this.phase() === 'playing' && this.typing().length < this.level().length) {
      this.typing.update((typing) => [...typing, letter]);
      this.isTooShort.set(false);
    }
  }

  protected erase(): void {
    if (this.phase() === 'playing') {
      this.typing.update((typing) => typing.slice(0, -1));
      this.isTooShort.set(false);
    }
  }

  protected send(): void {
    const guess = this.typing();
    if (this.phase() !== 'playing') {
      return;
    }
    if (guess.length < this.level().length) {
      this.isTooShort.set(true);
      return;
    }
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.api.countPlay('secret-word');
    }
    this.guesses.update((guesses) => [...guesses, guess]);
    this.typing.set([]);
    if (guess.join('') === this.secret()?.word) {
      this.phase.set('won');
    } else if (this.triesLeft() === 0) {
      this.phase.set('lost');
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target;
    const isField = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (isField || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const key = event.key.toLocaleLowerCase(this.language());
    if (event.key === 'Enter') {
      if (!(target instanceof HTMLButtonElement)) {
        event.preventDefault();
        this.send();
      }
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      this.erase();
    } else if (this.keys().has(key)) {
      this.type(key);
    }
  }
}
