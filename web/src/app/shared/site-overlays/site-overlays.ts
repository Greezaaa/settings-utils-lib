import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SuDialogComponent } from '@su-labs/dialog';
import { SuNotificationComponent } from '@su-labs/notifications';

@Component({
  selector: 'app-site-overlays',
  imports: [SuDialogComponent, SuNotificationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-overlays.html',
})
export class SiteOverlays {}
