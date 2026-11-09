import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bestText, boardLabel } from '../../core/board-labels';
import { Leaderboard, PlayerAccount } from '../../core/player-account';
import { RESULT_GAME_SLUGS, ResultGame } from '../../core/player-results';
import { SiteLanguage } from '../../i18n/site-language';

/** A game's leaderboards: loading, loaded, or out of reach */
type Boards = 'loading' | 'failed' | readonly Leaderboard[];

/**
 * The leaderboards (behind the `leaderboard` switch), for signed-in players only: pick a game and see a table per
 * setting, with each player's screen name, plays and best result.
 */
@Component({
  selector: 'app-leaderboard-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leaderboard-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../admin/admin.scss', './leaderboard-page.scss'],
})
export class LeaderboardPage {
  protected readonly account = inject(PlayerAccount);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly games = RESULT_GAME_SLUGS;
  protected readonly game = signal<ResultGame>(RESULT_GAME_SLUGS[0]);
  protected readonly boards = signal<Boards>('loading');
  protected readonly boardLabel = boardLabel;
  protected readonly bestText = bestText;

  constructor() {
    // Loads the chosen game's boards once signed in, and again whenever another game is picked
    effect(() => {
      const game = this.game();
      if (this.account.isSignedIn()) {
        void this.load(game);
      }
    });
  }

  protected isList(boards: Boards): boards is readonly Leaderboard[] {
    return Array.isArray(boards);
  }

  private async load(game: ResultGame): Promise<void> {
    this.boards.set('loading');
    const boards = await this.account.leaderboards(game);
    // Only the latest pick counts, when another game was picked meanwhile
    if (game === this.game()) {
      this.boards.set(boards ?? 'failed');
    }
  }
}
