import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteGames } from '../../core/favorite-games';
import { FeatureFlags } from '../../core/feature-flags';
import { GameAvailability } from '../../core/game-availability';
import { CategoryFilter, filterGames } from '../../core/game-filter';
import { GAME_CATEGORIES, gameInfo } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { GameCard } from '../../shared/game-card/game-card';
import { Reveal } from '../../shared/reveal';
import { WhatsNew } from './whats-new/whats-new';

@Component({
  selector: 'app-home-page',
  imports: [TranslatePipe, GameCard, Reveal, RouterLink, WhatsNew],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './home-page.scss'],
})
export class HomePage {
  private readonly availability = inject(GameAvailability);
  private readonly favorites = inject(FavoriteGames).games;
  private readonly messages = inject(SiteLanguage).messages;
  protected readonly features = inject(FeatureFlags);

  protected readonly query = signal('');
  protected readonly category = signal<CategoryFilter>('all');
  protected readonly favoritesOnly = signal(false);

  protected readonly categoryOptions = computed(() =>
    GAME_CATEGORIES.filter((category) =>
      this.availability.visibleGames().some((game) => gameInfo(game).category === category),
    ),
  );
  protected readonly canFilterFavorites = computed(
    () => this.features.canUse('category-menu') && this.favorites().length > 0,
  );
  protected readonly shownGames = computed(() => {
    const { games } = this.messages();
    return filterGames(
      this.availability.visibleGames(),
      { query: this.query(), category: this.category(), favoritesOnly: this.favoritesOnly() && this.canFilterFavorites() },
      {
        categoriesOf: (game) => [gameInfo(game).category],
        textOf: (game) => `${games[game].name} ${games[game].subtitle}`,
        favorites: this.favorites(),
      },
    );
  });

  protected searchText(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '';
  }
}
