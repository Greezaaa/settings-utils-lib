import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { AppInstall } from '../../core/app-install';
import { guidesFor, INSTALL_PLATFORMS } from '../../core/install-guides';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { InstallPicture } from './install-picture';

@Component({
  selector: 'app-install-page',
  imports: [TranslatePipe, InstallPicture],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './install-page.html',
  styleUrls: ['../../shared/utility-page.scss', './install-page.scss'],
})
export class InstallPage {
  protected readonly appInstall = inject(AppInstall);
  protected readonly platforms = INSTALL_PLATFORMS;
  protected readonly platform = linkedSignal(() => this.appInstall.platform());
  protected readonly guides = computed(() => guidesFor(this.platform()));
}
