import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnswerWords } from '../../core/answer-words';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { answersFor, getHowManyLevel, HOW_MANY_LEVELS, HowManyLevelId, HowManyRound, howManyRounds, thingPlaces } from '../../games/how-many';
import { seededRandom } from '../../games/random';
import { SiteLanguage } from '../../i18n/site-language';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { roundFeedback } from '../../shared/round-feedback';
import { CountVoice } from './count-voice';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'playing' | 'done';

const MAX_ANSWER_COLUMNS = 5;
const CELEBRATE_MS = 1600;
const CONFETTI = ['🎉', '⭐', '✨', '🌟', '🎊', '💫', '⭐', '✨'];

@Component({
  selector: 'app-how-many-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './how-many-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
    '../../shared/play-layout.scss',
    './how-many-page.scss',
  ],
})
export class HowManyPage {
  private readonly language = inject(SiteLanguage);
  private readonly api = inject(GamesApi);
  protected readonly voice = inject(CountVoice);
  protected readonly answerWords = inject(AnswerWords);
  protected readonly feedback = roundFeedback();
  protected readonly t = this.language.messages;
  protected readonly minAge = gameInfo('how-many').minAge;
  protected readonly levels = HOW_MANY_LEVELS;
  protected readonly confetti = CONFETTI.map((piece, index) => ({ piece, angle: (360 / CONFETTI.length) * index }));

  protected readonly levelId = signal<HowManyLevelId>('easy');
  protected readonly answers = computed(() => answersFor(getHowManyLevel(this.levelId())));
  protected readonly answerColumns = computed(() => Math.min(this.answers().length, MAX_ANSWER_COLUMNS));
  protected readonly phase = signal<Phase>('playing');
  protected readonly rounds = signal<readonly HowManyRound[]>([]);
  protected readonly index = signal(0);
  protected readonly round = computed(() => this.rounds()[this.index()] ?? null);
  protected readonly places = computed(() => {
    const round = this.round();
    return round ? thingPlaces(round.count, seededRandom(this.index() * 97 + round.count)) : [];
  });

  protected readonly counted = linkedSignal({ source: this.index, computation: (): readonly number[] => [] });
  private readonly missed = linkedSignal({ source: this.index, computation: () => false });
  protected readonly wrongPick = linkedSignal({ source: this.index, computation: (): number | null => null });
  protected readonly isCelebrating = linkedSignal({ source: this.index, computation: () => false });
  protected readonly results = signal<readonly boolean[]>([]);
  protected readonly stars = computed(() => this.results().filter(Boolean).length);

  private hasStarted = false;
  private nextRound?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.newGame());
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.nextRound);
      this.voice.stop();
    });
  }

  protected chooseLevel(id: HowManyLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    clearTimeout(this.nextRound);
    this.rounds.set(howManyRounds(getHowManyLevel(this.levelId()), Math.random));
    this.index.set(0);
    this.results.set([]);
    this.phase.set('playing');
  }

  protected count(thing: number): void {
    if (this.isCelebrating() || this.counted().includes(thing)) {
      return;
    }
    this.counted.update((counted) => [...counted, thing]);
    this.voice.say(String(this.counted().length), this.language.language());
  }

  protected numberOf(thing: number): number | null {
    const position = this.counted().indexOf(thing);
    return position === -1 ? null : position + 1;
  }

  protected answer(value: number): void {
    const round = this.round();
    if (!round || this.isCelebrating() || this.phase() !== 'playing') {
      return;
    }
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.api.countPlay('how-many');
    }
    if (value !== round.count) {
      this.missed.set(true);
      this.wrongPick.set(value);
      this.feedback.wrong(() => this.wrongPick.set(null));
      return;
    }
    this.isCelebrating.set(true);
    this.voice.say(`${value}! ${this.t().howMany.great}`, this.language.language());
    this.results.update((results) => [...results, !this.missed()]);
    this.nextRound = setTimeout(() => {
      if (this.index() + 1 >= this.rounds().length) {
        this.phase.set('done');
        this.voice.say(this.t().howMany.done, this.language.language());
      } else {
        this.index.update((index) => index + 1);
      }
    }, CELEBRATE_MS);
  }

  protected dots(value: number): readonly number[] {
    return Array.from({ length: value }, (_, index) => index);
  }
}
