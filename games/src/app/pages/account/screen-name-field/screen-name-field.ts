import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/**
 * The screen-name field of the account forms (named `screenName`), with a tooltip saying it is what other players see
 * and needn't be a real name
 */
@Component({
  selector: 'app-screen-name-field',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './screen-name-field.html',
  styleUrls: ['../../admin/admin.scss', '../account.scss'],
})
export class ScreenNameField {
  /** The current screen name, when changing it */
  readonly value = input('');
}
