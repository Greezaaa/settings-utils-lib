import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bestText, boardLabel } from '../../core/board-labels';
import { FeatureFlags } from '../../core/feature-flags';
import { Leaderboard, LEADERBOARD_SIZE, PlayerAccount } from '../../core/player-account';
import { isBetter, RESULT_GAME_SLUGS, RESULT_GAMES, ResultGame, storedBests } from '../../core/player-results';
import { readStored } from '../../core/site-storage';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Boards = 'loading' | 'failed' | readonly Leaderboard[];

interface YourScore {
  readonly best: number;
  readonly place: number | null;
  readonly isRanked: boolean;
}

@Component({
  selector: 'app-leaderboard-page',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leaderboard-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../admin/admin.scss', './leaderboard-page.scss'],
})
export class LeaderboardPage {
  protected readonly account = inject(PlayerAccount);
  private readonly features = inject(FeatureFlags);
  protected readonly messages = inject(SiteLanguage).messages;
  protected readonly games = RESULT_GAME_SLUGS;
  protected readonly game = signal<ResultGame>(RESULT_GAME_SLUGS[0]);
  protected readonly boards = signal<Boards>('loading');
  protected readonly boardLabel = boardLabel;
  protected readonly bestText = bestText;

  protected readonly isPublic = computed(() => this.features.canUse('public-leaderboard'));
  protected readonly canSee = computed(() => this.account.isSignedIn() || this.isPublic());
  private readonly localBests = signal<ReadonlyMap<string, number>>(new Map());

  protected readonly yourScores = computed(() => {
    const boards = this.boards();
    const scores = new Map<string, YourScore>();
    if (!this.isList(boards)) {
      return scores;
    }
    for (const board of boards) {
      const score = this.yourScore(board);
      if (score) {
        scores.set(board.key, score);
      }
    }
    return scores;
  });

  protected readonly yourPlays = computed(() => {
    const boards = this.boards();
    const plays = new Map<string, number>();
    if (this.isList(boards)) {
      for (const board of boards) {
        const mine = board.entries.find(({ isMe }) => isMe) ?? board.me;
        if (mine) {
          plays.set(board.key, mine.plays);
        }
      }
    }
    return plays;
  });

  constructor() {
    effect(() => {
      const game = this.game();
      if (this.account.isRestored() && this.canSee()) {
        void this.load(game);
      }
    });
  }

  protected isList(boards: Boards): boards is readonly Leaderboard[] {
    return Array.isArray(boards);
  }

  private yourScore(board: Leaderboard): YourScore | null {
    if (this.account.isSignedIn()) {
      return board.me ? { best: board.me.best, place: board.me.place, isRanked: true } : null;
    }
    const best = this.localBests().get(board.key);
    if (best === undefined) {
      return null;
    }
    const place = board.entries.filter((entry) => isBetter(this.game(), entry.best, best)).length + 1;
    return { best, place: place <= LEADERBOARD_SIZE ? place : null, isRanked: false };
  }

  private async load(game: ResultGame): Promise<void> {
    this.boards.set('loading');
    const boards = await this.account.leaderboards(game);
    if (game === this.game()) {
      this.localBests.set(new Map(storedBests(game, readStored(RESULT_GAMES[game].storage)).map(({ key, value }) => [key, value])));
      this.boards.set(boards ?? 'failed');
    }
  }
}
