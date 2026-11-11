import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, DOCUMENT, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FeatureFlags } from '../../../core/feature-flags';
import { ROOM_GAME_FEATURES, ROOM_GAMES, RoomGame } from '../../../core/features';
import { gameInfo } from '../../../core/games';
import { GamesApi } from '../../../core/games-api';
import { RoomClient } from '../../../core/room-client';
import { MAX_PLAYERS, MIN_PLAYERS_TO_START, ROUND_SECONDS, RoundSeconds } from '../../../core/room-view';
import { ROOM_CHOICES, roomChoice, roomLetters, roomPicture, roomSliding } from '../../../games/room-games';
import { roomMeasure } from '../../../games/room-measure';
import { roomMath } from '../../../games/room-math';
import { SiteLanguage } from '../../../i18n/site-language';
import { OptionText } from '../../../i18n/site-messages';
import { GameBoard } from '../../../shared/game-board';
import { RoomLettersRound } from '../room-letters-round/room-letters-round';
import { RoomMathRound } from '../room-math-round/room-math-round';
import { RoomMeasureRound } from '../room-measure-round/room-measure-round';
import { roomLevelText, roomModeGroup, roomModeText } from '../room-option-text';
import { RoomPlaceRound } from '../room-place-round/room-place-round';
import { RoomPlayers } from '../room-players/room-players';
import { RoomSlidingRound } from '../room-sliding-round/room-sliding-round';
import { RoomTurnRound } from '../room-turn-round/room-turn-round';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/** How often the countdown is redrawn */
const TICK_MS = 100;

/**
 * A room, at /r/<code>: joins it (or comes back to this tab's seat), then shows the lobby (players, the host's game
 * settings, Ready and Start), the 3-2-1 countdown, the round for everyone at once, and the results.
 */
@Component({
  selector: 'app-room-page',
  imports: [
    TranslatePipe,
    GameBoard,
    RoomLettersRound,
    RoomMathRound,
    RoomMeasureRound,
    RoomPlaceRound,
    RoomPlayers,
    RoomSlidingRound,
    RoomTurnRound,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-page.html',
  styleUrls: [
    '../../../shared/utility-page.scss',
    '../../../shared/game-settings.scss',
    '../../../shared/switch.scss',
    '../rooms.scss',
  ],
})
export class RoomPage {
  /** From the address, through the router's component input binding */
  readonly code = input.required<string>();

  protected readonly client = inject(RoomClient);
  private readonly api = inject(GamesApi);
  private readonly features = inject(FeatureFlags);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly maxPlayers = MAX_PLAYERS;
  protected readonly minPlayers = MIN_PLAYERS_TO_START;
  protected readonly roundSeconds = ROUND_SECONDS;
  protected readonly isCopied = signal(false);
  /** The page has started connecting (it does right after the first render) */
  protected readonly hasEntered = signal(false);

  protected readonly room = this.client.room;
  protected readonly game = computed<RoomGame>(
    () => this.room()?.settings.game ?? 'math-games'
  );
  /** The room's mode and level, as ids the game has */
  protected readonly choice = computed(() => {
    const settings = this.room()?.settings;
    return roomChoice(this.game(), settings?.mode ?? '', settings?.level ?? '');
  });
  /** What the host can pick: the game's modes, and the chosen mode's levels */
  protected readonly modes = computed(() => ROOM_CHOICES[this.game()].modes);
  protected readonly levels = computed(() =>
    ROOM_CHOICES[this.game()].levelsOf(this.choice().mode)
  );
  /** Each game's settings for its round, read from the room's mode and level ids */
  protected readonly math = computed(() =>
    roomMath(this.choice().mode, this.choice().level)
  );
  protected readonly measure = computed(() =>
    roomMeasure(this.choice().mode, this.choice().level)
  );
  protected readonly letters = computed(() =>
    roomLetters(this.choice().mode, this.choice().level)
  );
  protected readonly sliding = computed(() =>
    roomSliding(this.choice().mode, this.choice().level)
  );
  protected readonly turnPicture = computed(() =>
    roomPicture('turn-picture', this.choice().mode, this.choice().level)
  );
  protected readonly placePieces = computed(() =>
    roomPicture('place-pieces', this.choice().mode, this.choice().level)
  );
  /** The lobby (games beside their settings) and the word builder (words beside the letters) need more room */
  protected readonly isWide = computed(
    () =>
      this.room()?.phase === 'lobby' ||
      (this.game() === 'letter-games' &&
        this.choice().mode === 'word-builder' &&
        this.room()?.phase === 'playing')
  );
  /** Each game has its own multiplayer switch (apart from its single-player one); the host picks among those open */
  protected readonly openGames = computed(() =>
    ROOM_GAMES.filter(game => this.features.canUse(ROOM_GAME_FEATURES[game]))
  );
  protected readonly canPlayGame = computed(() =>
    this.openGames().includes(this.game())
  );
  protected readonly canStart = computed(() => {
    const players = (this.room()?.players ?? []).filter(
      ({ connected }) => connected
    );
    return (
      players.length >= MIN_PLAYERS_TO_START &&
      players.every(({ ready }) => ready) &&
      this.canPlayGame()
    );
  });

  private readonly now = signal(0);
  protected readonly countdown = computed(() => {
    const startsAt = this.room()?.round?.startsAt ?? 0;
    return Math.max(1, Math.ceil((startsAt - this.now()) / 1000));
  });

  constructor() {
    afterNextRender(() => {
      this.client.enter(this.code());
      this.hasEntered.set(true);
    });
    const ticker = setInterval(
      () => this.now.set(this.client.serverNow()),
      TICK_MS
    );
    inject(DestroyRef).onDestroy(() => {
      clearInterval(ticker);
      // Leaving the page keeps the seat for a short while, so coming back (or a reload) returns to the room
      this.client.close();
    });
  }

  protected iconOf(game: RoomGame): string {
    return gameInfo(game).icon;
  }

  protected modeGroup(): string {
    return roomModeGroup(this.t(), this.game());
  }

  protected modeText(mode: string): OptionText {
    return roomModeText(this.t(), this.game(), mode);
  }

  protected levelText(level: string): OptionText {
    return roomLevelText(this.t(), this.game(), this.choice().mode, level);
  }

  /** Another game, starting from its own mode and level */
  protected chooseGame(game: RoomGame): void {
    const settings = this.room()?.settings;
    if (settings) {
      const { mode, level } = roomChoice(game, '', '');
      this.client.setSettings({ ...settings, game, mode, level });
    }
  }

  /** Another mode, keeping the level when the mode has it */
  protected chooseMode(mode: string): void {
    const settings = this.room()?.settings;
    if (settings) {
      this.client.setSettings({
        ...settings,
        ...roomChoice(settings.game, mode, settings.level),
      });
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

  /** Leaves the room for good and goes back to Play together */
  protected leave(): void {
    this.client.leave();
    void this.router.navigateByUrl('/rooms');
  }

  protected chooseShowScores(showScores: boolean): void {
    const settings = this.room()?.settings;
    if (settings) {
      this.client.setSettings({ ...settings, showScores });
    }
  }

  protected start(): void {
    this.client.start();
    this.api.countPlay(this.game());
  }

  protected async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(
      `${this.document.location.origin}/r/${this.code().toUpperCase()}`
    );
    this.isCopied.set(true);
  }
}
