import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SMART_GAMES } from '../../core/games';

/**
 * Shown for any address the games site doesn't have. Prerendered as 404.html, which the server
 * sends with a 404 status, and shown by the app itself for unknown links inside the site.
 * Says it in every language the games speak, since kids may not read English.
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './not-found-page.scss'],
})
export class NotFoundPage {
  protected readonly games = SMART_GAMES;
}
