import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME_SLUGS } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';
import { Reveal } from '../../shared/reveal';

/** Home page: the list of games */
@Component({
  selector: 'app-home-page',
  imports: [Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss'],
})
export class HomePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly games = GAME_SLUGS;
}
