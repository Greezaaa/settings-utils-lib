import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameSlug, gameInfo } from '../../core/games';
import { FavoriteGames } from '../../core/favorite-games';
import { FeatureFlags } from '../../core/feature-flags';
import { GameAvailability } from '../../core/game-availability';
import { NewGames } from '../../core/new-games';
import { PopularGames } from '../../core/popular-games';
import { TranslatePipe } from '../../i18n/translate-pipe';

/** A card that links to a game: its recommended age, "New" and "Popular" badges, name, summary and favourite heart */
@Component({
  selector: 'app-game-card',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  readonly game = input.required<GameSlug>();

  private readonly newGames = inject(NewGames).games;
  private readonly popularGames = inject(PopularGames).games;
  private readonly availability = inject(GameAvailability);
  protected readonly favorites = inject(FavoriteGames);
  private readonly features = inject(FeatureFlags);

  protected readonly minAge = computed(() => gameInfo(this.game()).minAge);
  protected readonly isNew = computed(() => this.newGames().includes(this.game()));
  protected readonly isPopular = computed(() => this.popularGames().includes(this.game()));
  /** Shown to the admin in preview: the game isn't open to the public */
  protected readonly isHidden = computed(() => !this.availability.isOpen(this.game()));
  /** Favourites come with the categories menu */
  protected readonly canFavorite = computed(() => this.features.canUse('category-menu'));
  protected readonly isFavorite = computed(() => this.favorites.games().includes(this.game()));
}
