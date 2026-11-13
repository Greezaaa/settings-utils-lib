import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { createWordSearch, DEFAULT_SEARCH_LEVEL, getSearchLevel, HiddenWord, lineCells, SEARCH_LEVELS, SearchLevelId, WordSearch, wordAt } from '../../games/word-search';
import { WORD_BANKS } from '../../games/words';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { GameBoard } from '../../shared/game-board';
import { GameClock } from '../../shared/game-clock';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';

type Phase = 'playing' | 'done';

interface Press {
  readonly pointerId: number;
  readonly from: number;
  readonly to: number;
}

const FOUND_COLOURS = 4;

@Component({
  selector: 'app-word-search-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './word-search-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
    '../../shared/play-layout.scss',
    './word-search-page.scss',
  ],
})
export class WordSearchPage {
  protected readonly levels = SEARCH_LEVELS;
  protected readonly minAge = gameInfo('word-search').minAge;
  private readonly api = inject(GamesApi);
  private readonly language = inject(SiteLanguage).language;
  protected readonly clock = new GameClock();

  protected readonly levelId = signal<SearchLevelId>(DEFAULT_SEARCH_LEVEL);
  protected readonly phase = signal<Phase>('playing');
  protected readonly search = signal<WordSearch | null>(null);
  protected readonly found = signal<readonly HiddenWord[]>([]);
  private readonly foundWords = computed(() => new Set(this.found().map(({ word }) => word.word)));

  protected readonly anchor = signal<number | null>(null);
  protected readonly press = signal<Press | null>(null);
  protected readonly selected = computed<ReadonlySet<number>>(() => {
    const [press, search, anchor] = [this.press(), this.search(), this.anchor()];
    const line = press && search ? lineCells(press.from, press.to, search.size) : null;
    return new Set(line ?? (anchor === null ? [] : [anchor]));
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
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

  protected shown(letter: string): string {
    return letter.toLocaleUpperCase(this.language());
  }

  protected isFound(word: HiddenWord): boolean {
    return this.foundWords().has(word.word.word);
  }

  protected foundColour(cell: number): number | null {
    const index = this.found().findIndex(({ cells }) => cells.includes(cell));
    return index < 0 ? null : index % FOUND_COLOURS;
  }

  protected rowOf(cell: number): number {
    return Math.floor(cell / (this.search()?.size ?? 1)) + 1;
  }

  protected columnOf(cell: number): number {
    return (cell % (this.search()?.size ?? 1)) + 1;
  }

  protected chooseLevel(id: SearchLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    this.clock.reset();
    this.hasStarted = false;
    const pictures = WORD_BANKS[this.language()].pictures;
    this.search.set(createWordSearch(getSearchLevel(this.levelId()), pictures, Math.random));
    this.found.set([]);
    this.anchor.set(null);
    this.press.set(null);
    this.phase.set('playing');
  }

  protected onPointerDown(event: PointerEvent): void {
    const cell = this.cellAt(event.clientX, event.clientY);
    if (this.phase() !== 'playing' || !event.isPrimary || cell === null) {
      return;
    }
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    this.press.set({ pointerId: event.pointerId, from: cell, to: cell });
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.press();
    const cell = press?.pointerId === event.pointerId ? this.cellAt(event.clientX, event.clientY) : null;
    if (press && cell !== null && cell !== press.to) {
      this.press.set({ ...press, to: cell });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const press = this.press();
    if (press?.pointerId !== event.pointerId) {
      return;
    }
    this.press.set(null);
    if (press.from === press.to) {
      this.tap(press.from);
    } else {
      this.anchor.set(null);
      this.choose(press.from, press.to);
    }
  }

  protected cancelPress(): void {
    this.press.set(null);
  }

  protected onClick(event: MouseEvent, cell: number): void {
    if (event.detail === 0 && this.phase() === 'playing') {
      this.tap(cell);
    }
  }

  private tap(cell: number): void {
    const anchor = this.anchor();
    this.anchor.set(anchor === null ? cell : null);
    if (anchor !== null && anchor !== cell) {
      this.choose(anchor, cell);
    }
  }

  private choose(from: number, to: number): void {
    const search = this.search();
    const cells = search && lineCells(from, to, search.size);
    const word = search && cells ? wordAt(search, cells, this.foundWords()) : null;
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.api.countPlay('word-search');
      this.clock.start();
    }
    if (!search || !word) {
      return;
    }
    this.found.update((found) => [...found, word]);
    if (this.found().length === search.words.length) {
      this.clock.stop();
      this.phase.set('done');
    }
  }

  private cellAt(x: number, y: number): number | null {
    const tile = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]');
    const cell = Number(tile?.dataset['cell']);
    return tile && Number.isInteger(cell) ? cell : null;
  }
}
