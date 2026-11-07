import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GAMES_BY_CATEGORY } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';
import { GameCard } from '../../shared/game-card';
import { Reveal } from '../../shared/reveal';

/** Home page: the games, by category */
@Component({
  selector: 'app-home-page',
  imports: [GameCard, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './home-page.scss'],
})
export class HomePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly categories = GAMES_BY_CATEGORY;
}
