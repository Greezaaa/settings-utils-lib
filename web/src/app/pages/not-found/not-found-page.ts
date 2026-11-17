import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { hostOf, SITE_APPS } from '../../core/apps';
import { UTILITIES } from '../../core/packages';
import { SITE_TOOLS } from '../../core/tools';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found-page.html',
  styleUrls: ['../../shared/utility-page.scss', './not-found-page.scss'],
})
export class NotFoundPage {
  protected readonly utilities = UTILITIES;
  protected readonly tools = SITE_TOOLS;
  protected readonly apps = SITE_APPS.filter((app) => app.url !== null);
  protected readonly hostOf = hostOf;
}
