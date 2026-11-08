import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, DOCUMENT, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameAvailability } from '../../core/game-availability';
import { GamesApi } from '../../core/games-api';
import { RoomClient } from '../../core/room-client';
import { MAX_PLAYERS, MIN_PLAYERS_TO_START, ROUND_SECONDS, RoundSeconds } from '../../core/room-view';
import { ANSWER_STYLE_IDS, AnswerStyleId } from '../../games/math-games';
import { levelIdsFor, roomMath } from '../../games/room-math';
import { SiteLanguage } from '../../i18n/site-language';
import { GameBoard } from '../../shared/game-board';
import { RoomMathRound } from './room-math-round';
import { RoomPlayers } from './room-players';

/** How often the countdown is redrawn */
const TICK_MS = 100;

/**
 * A room, at /r/<code>: joins it (or comes back to this tab's seat), then shows the lobby (players, the host's game
 * settings, Ready and Start), the 3-2-1 countdown, the round for everyone at once, and the results.
 */
@Component({
  selector: 'app-room-page',
  imports: [GameBoard, RoomMathRound, RoomPlayers, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './rooms.scss'],
})
export class RoomPage {
  /** From the address, through the router's component input binding */
  readonly code = input.required<string>();

  protected readonly client = inject(RoomClient);
  private readonly api = inject(GamesApi);
  private readonly availability = inject(GameAvailability);
  private readonly document = inject(DOCUMENT);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly maxPlayers = MAX_PLAYERS;
  protected readonly minPlayers = MIN_PLAYERS_TO_START;
  protected readonly roundSeconds = ROUND_SECONDS;
  protected readonly answerStyles = ANSWER_STYLE_IDS;
  protected readonly isCopied = signal(false);

  protected readonly room = this.client.room;
  protected readonly math = computed(() => {
    const settings = this.room()?.settings;
    return roomMath(settings?.mode ?? '', settings?.level ?? '');
  });
  protected readonly levels = computed(() => levelIdsFor(this.math().style));
  /** Math is the room game for now; when it's switched off for the public, rooms can't play it either */
  protected readonly canPlayMath = computed(() => this.availability.canPlay('math-games'));
  protected readonly canStart = computed(() => {
    const players = (this.room()?.players ?? []).filter(({ connected }) => connected);
    return players.length >= MIN_PLAYERS_TO_START && players.every(({ ready }) => ready) && this.canPlayMath();
  });

  private readonly now = signal(0);
  protected readonly countdown = computed(() => {
    const startsAt = this.room()?.round?.startsAt ?? 0;
    return Math.max(1, Math.ceil((startsAt - this.now()) / 1000));
  });

  constructor() {
    afterNextRender(() => this.client.enter(this.code()));
    const ticker = setInterval(() => this.now.set(this.client.serverNow()), TICK_MS);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(ticker);
      // Leaving the page keeps the seat for a short while, so coming back (or a reload) returns to the room
      this.client.close();
    });
  }

  /** A level's name in the site's language; Find the signs names its levels its own way */
  protected levelName(level: string): string {
    const names = this.math().style === 'find-the-signs' ? this.t().settings.signsLevels : this.t().settings.levels;
    return Object.entries(names).find(([id]) => id === level)?.[1].name ?? level;
  }

  protected chooseStyle(style: AnswerStyleId): void {
    const settings = this.room()?.settings;
    if (settings) {
      this.client.setSettings({ ...settings, mode: style, level: roomMath(style, settings.level).levelId });
    }
  }

  protected chooseLevel(level: string): void {
    const settings = this.room()?.settings;
    if (settings) {
      this.client.setSettings({ ...settings, level });
    }
  }

  protected chooseSeconds(seconds: RoundSeconds): void {
    const settings = this.room()?.settings;
    if (settings) {
      this.client.setSettings({ ...settings, seconds });
    }
  }

  protected start(): void {
    this.client.start();
    this.api.countPlay('math-games');
  }

  protected async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(`${this.document.location.origin}/r/${this.code().toUpperCase()}`);
    this.isCopied.set(true);
  }
}
