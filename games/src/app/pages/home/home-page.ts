import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FeatureFlags } from '../../core/feature-flags';
import { GameAvailability } from '../../core/game-availability';
import { FavoriteGames } from '../../core/favorite-games';
import { byCategory, GameSlug } from '../../core/games';
import { recentlyAdded } from '../../core/new-games';
import { PopularGames, toppedUp } from '../../core/popular-games';
import { GameCard } from '../../shared/game-card/game-card';
import { RouterLink } from '@angular/router';
import { WhatsNew } from './whats-new/whats-new';
import { Reveal } from '../../shared/reveal';
import { TranslatePipe } from '../../i18n/translate-pipe';

/** Games in the home page's "Recently added" section */
const RECENT_LIMIT = 4;

/**
 * Home page: the games by category, and what's new. With the categories menu: the player's favourites, the most
 * played and the latest games first, then a card per category.
 */
@Component({
  selector: 'app-home-page',
  imports: [TranslatePipe, GameCard, Reveal, RouterLink, WhatsNew],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './home-page.scss'],
})
export class HomePage {
  private readonly availability = inject(GameAvailability);
  protected readonly features = inject(FeatureFlags);
  protected readonly categories = computed(() => byCategory(this.availability.visibleGames()));
  protected readonly hasCategoryMenu = computed(() => this.features.canUse('category-menu'));

  private readonly favoriteGames = inject(FavoriteGames).games;
  private readonly mostPlayed = inject(PopularGames).mostPlayed;
  protected readonly favorites = computed(() => this.visible(this.favoriteGames()));
  protected readonly popular = computed(() =>
    toppedUp(this.visible(this.mostPlayed()), this.availability.visibleGames()),
  );
  protected readonly recent = computed(() => this.visible(recentlyAdded()).slice(0, RECENT_LIMIT));

  /** The games of a list that are open (or all of them, in preview) */
  private visible(games: readonly GameSlug[]): GameSlug[] {
    const open = this.availability.visibleGames();
    return games.filter((game) => open.includes(game));
  }
}
