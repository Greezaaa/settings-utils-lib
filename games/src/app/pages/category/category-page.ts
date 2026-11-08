import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameAvailability } from '../../core/game-availability';
import { byCategory, GameCategory } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';
import { GameCard } from '../../shared/game-card';
import { Reveal } from '../../shared/reveal';

/** A category's page, at /category/<category> (from the categories menu): its open games as cards */
@Component({
  selector: 'app-category-page',
  imports: [GameCard, Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss'],
})
export class CategoryPage {
  /** From the route's data, through the router's component input binding */
  readonly category = input.required<GameCategory>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  private readonly availability = inject(GameAvailability);
  protected readonly games = computed(
    () => byCategory(this.availability.visibleGames()).find(({ category }) => category === this.category())?.games ?? [],
  );
}
