import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, output } from '@angular/core';
import { GamesApi } from '../../../core/games-api';
import { Round } from '../../../core/room-view';
import { WordDictionaries } from '../../../core/word-dictionaries';
import { createLetterSet, GapWord } from '../../../games/letter-games';
import { RoomLetters, roomRandom } from '../../../games/room-games';
import { roomWords } from '../../../games/room-letters';
import { WORD_BANKS } from '../../../games/words';
import { LanguageId } from '../../../i18n/site-messages';
import { TimerBar } from '../../../shared/timer-bar/timer-bar';
import { BuilderRound } from '../../letter-games/rounds/builder-round/builder-round';
import { GapRound } from '../../letter-games/rounds/gap-round/gap-round';
import { MixedRound } from '../../letter-games/rounds/mixed-round/mixed-round';
import { roundClock } from '../round-clock';
import { TranslatePipe } from '../../../i18n/translate-pipe';

const SOLVED_MS = 700;

@Component({
  selector: 'app-room-letters-round',
  imports: [TranslatePipe, BuilderRound, GapRound, MixedRound, TimerBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-letters-round.html',
  styleUrls: ['../../../shared/game-settings.scss', '../rooms.scss'],
})
export class RoomLettersRound {
  readonly letters = input.required<RoomLetters>();
  readonly language = input.required<LanguageId>();
  readonly round = input.required<Round>();
  readonly showScore = input(true);
  readonly scored = output<number>();

  private readonly dictionaries = inject(WordDictionaries);
  private readonly api = inject(GamesApi);
  protected readonly clock = roundClock(this.round);
  private readonly seed = computed(() => this.round().seed);
  protected readonly settings = computed(() => this.letters(), {
    equal: (first, second) =>
      first.mode === second.mode && first.hints === second.hints && first.builderLevel.id === second.builderLevel.id,
  });
  private readonly bank = computed(() => WORD_BANKS[this.language()]);
  protected readonly vowels = computed(() => this.bank().vowels);

  private readonly index = linkedSignal({ source: this.seed, computation: () => 0 });
  protected readonly score = linkedSignal({ source: this.seed, computation: () => 0 });
  private nextWord?: ReturnType<typeof setTimeout>;

  private readonly words = computed(() => roomWords(this.settings(), this.bank(), this.seed()));
  protected readonly gapWord = computed((): GapWord | null => {
    const words = this.words();
    return 'gaps' in words ? (words.gaps[this.index() % words.gaps.length] ?? null) : null;
  });
  protected readonly mixedWord = computed((): string | null => {
    const words = this.words();
    return 'mixed' in words ? (words.mixed[this.index() % words.mixed.length] ?? null) : null;
  });
  protected readonly letterSet = computed(() =>
    createLetterSet(this.bank(), this.settings().builderLevel.letters, roomRandom(this.seed(), this.index())),
  );
  protected readonly dictionary = computed(() => this.dictionaries.wordsOf(this.language()));
  protected readonly dictionaryStatus = computed(() => this.dictionaries.status(this.language()));
  protected readonly commonWords = computed(() => this.dictionaries.commonWordsOf(this.language()));

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.nextWord));
    afterNextRender(() => {
      if (this.settings().mode === 'word-builder') {
        void this.dictionaries.load(this.language());
      }
    });
  }

  protected onSolved(): void {
    if (this.clock.isOver()) {
      return;
    }
    this.addPoint();
    const seed = this.seed();
    this.nextWord = setTimeout(() => {
      if (seed === this.seed()) {
        this.index.update((index) => index + 1);
      }
    }, SOLVED_MS);
  }

  protected onWordFound(): void {
    if (!this.clock.isOver()) {
      this.addPoint();
    }
  }

  protected nextLetters(): void {
    this.index.update((index) => index + 1);
  }

  protected onReported(word: string): void {
    this.dictionaries.hide(this.language(), word);
    void this.api.reportWord(word, this.language());
  }

  private addPoint(): void {
    this.score.update((score) => score + 1);
    this.scored.emit(this.score());
  }
}
