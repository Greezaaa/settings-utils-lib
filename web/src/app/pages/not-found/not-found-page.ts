import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAMES_URL } from '../../core/links';
import { UTILITIES } from '../../core/packages';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found-page.html',
  styleUrls: ['../../shared/utility-page.scss', './not-found-page.scss'],
})
export class NotFoundPage {
  protected readonly utilities = UTILITIES;
  protected readonly gamesUrl = GAMES_URL;
}
