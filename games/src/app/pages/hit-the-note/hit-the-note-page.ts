import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { NotePlayer } from '../../core/note-player';
import { findTheNoteRounds, getMusicLevel, higherOrLowerRound, HigherOrLowerRound, MUSIC_LEVELS, MUSIC_MODE_IDS, MusicLevelId, MusicModeId, Note, ROUNDS_PER_GAME, singItRounds } from '../../games/music-notes';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { FindNoteRound } from './rounds/find-note-round/find-note-round';
import { HigherLowerRound } from './rounds/higher-lower-round/higher-lower-round';
import { SingRound } from './rounds/sing-round/sing-round';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'ready' | 'playing' | 'done';

const NEXT_ROUND_MS = 1200;

@Component({
  selector: 'app-hit-the-note-page',
  imports: [TranslatePipe, FindNoteRound, GameBoard, GameFeedback, HigherLowerRound, RouterLink, SingRound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hit-the-note-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './hit-the-note-page.scss'],
})
export class HitTheNotePage {
  protected readonly modes = MUSIC_MODE_IDS;
  protected readonly levels = MUSIC_LEVELS;
  protected readonly minAge = gameInfo('hit-the-note').minAge;
  private readonly api = inject(GamesApi);
  private readonly player = inject(NotePlayer);

  protected readonly modeId = signal<MusicModeId>('find-the-note');
  protected readonly levelId = signal<MusicLevelId>('easy');
  protected readonly level = computed(() => getMusicLevel(this.levelId()));

  protected readonly phase = signal<Phase>('ready');
  protected readonly notes = signal<readonly Note[]>([]);
  protected readonly pairs = signal<readonly HigherOrLowerRound[]>([]);
  protected readonly index = signal(0);
  protected readonly mistakes = signal(0);
  protected readonly firstTries = signal(0);
  private hadMistake = false;
  protected readonly total = ROUNDS_PER_GAME;
  protected readonly note = computed(() => this.notes()[this.index()] ?? null);
  protected readonly pair = computed(() => this.pairs()[this.index()] ?? null);
  private nextRoundTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.nextRoundTimer));
  }

  protected start(): void {
    this.player.audioContext();
    this.api.countPlay('hit-the-note');
    const level = this.level();
    this.index.set(0);
    this.mistakes.set(0);
    this.firstTries.set(0);
    this.hadMistake = false;
    switch (this.modeId()) {
      case 'find-the-note':
        this.notes.set(findTheNoteRounds(level, Math.random));
        break;
      case 'higher-or-lower':
        this.pairs.set(Array.from({ length: ROUNDS_PER_GAME }, () => higherOrLowerRound(level, Math.random)));
        break;
      case 'sing-it':
        this.notes.set(singItRounds(level, Math.random));
        break;
    }
    this.phase.set('playing');
  }

  protected onSolved(): void {
    if (!this.hadMistake) {
      this.firstTries.update((rounds) => rounds + 1);
    }
    this.nextRoundTimer = setTimeout(() => {
      if (this.phase() !== 'playing') {
        return;
      }
      if (this.index() + 1 >= this.total) {
        this.phase.set('done');
      } else {
        this.hadMistake = false;
        this.index.update((index) => index + 1);
      }
    }, NEXT_ROUND_MS);
  }

  protected onMistake(): void {
    this.mistakes.update((mistakes) => mistakes + 1);
    this.hadMistake = true;
  }

  protected backToSettings(): void {
    clearTimeout(this.nextRoundTimer);
    this.phase.set('ready');
  }
}
