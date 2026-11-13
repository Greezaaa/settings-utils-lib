import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-screen-name-field',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './screen-name-field.html',
  styleUrls: ['../../admin/admin.scss', '../account.scss'],
})
export class ScreenNameField {
  readonly value = input('');
}
