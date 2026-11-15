import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { SiteSettings } from '../../shared/site-settings/site-settings';

@Component({
  selector: 'app-settings-page',
  imports: [TranslatePipe, SiteSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings-page.html',
  styleUrls: ['../../shared/utility-page.scss', './settings-page.scss'],
})
export class SettingsPage {}
