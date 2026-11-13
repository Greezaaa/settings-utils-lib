import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameAvailability } from '../../core/game-availability';
import { byCategory, GameCategory } from '../../core/games';
import { GameCard } from '../../shared/game-card/game-card';
import { Reveal } from '../../shared/reveal';
import { TranslatePipe } from '../../i18n/translate-pipe';

@Component({
  selector: 'app-category-page',
  imports: [TranslatePipe, GameCard, Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss'],
})
export class CategoryPage {
  readonly category = input.required<GameCategory>();

  private readonly availability = inject(GameAvailability);
  protected readonly games = computed(
    () => byCategory(this.availability.visibleGames()).find(({ category }) => category === this.category())?.games ?? [],
  );
}
