import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameAvailability } from '../../core/game-availability';
import { GameCard } from '../../shared/game-card/game-card';
import { TranslatePipe } from '../../i18n/translate-pipe';

@Component({
  selector: 'app-not-found-page',
  imports: [TranslatePipe, GameCard, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './not-found-page.scss'],
})
export class NotFoundPage {
  protected readonly games = inject(GameAvailability).visibleGames;
}
