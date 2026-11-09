import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SiteLanguage } from '../../i18n/site-language';

/**
 * The screen-name field of the account forms (named `screenName`), with a tooltip saying it is what other players see
 * and needn't be a real name
 */
@Component({
  selector: 'app-screen-name-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './screen-name-field.html',
  styleUrls: ['../admin/admin.scss', './account.scss'],
})
export class ScreenNameField {
  /** The current screen name, when changing it */
  readonly value = input('');
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
}
