import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SMART_GAMES } from '../../core/games';
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
  protected readonly games = SMART_GAMES;
}
