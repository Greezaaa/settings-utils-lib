import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME_SLUGS } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';

/**
 * Shown for any address the games site doesn't have. Prerendered as 404.html, which the server
 * sends with a 404 status, and shown by the app itself for unknown links inside the site.
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './not-found-page.scss'],
})
export class NotFoundPage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly games = GAME_SLUGS;
}
