import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardDetail } from './card-detail/card-detail';
import { CopyButton } from './copy-button/copy-button';
import { CssTricks } from './css-tricks/css-tricks';
import { DateRangePicker } from './date-range/date-range';
import { DeleteList } from './delete-list/delete-list';
import { ElasticToggle } from './elastic-toggle/elastic-toggle';
import { FloatingField } from './floating-field/floating-field';
import { MorphMenu } from './morph-menu/morph-menu';
import { PinButton } from './pin-button/pin-button';
import { SpringPhoto } from './spring-photo/spring-photo';
import { UploadZone } from './upload-zone/upload-zone';

@Component({
  selector: 'app-lab-page',
  imports: [
    RouterLink,
    CardDetail,
    CopyButton,
    CssTricks,
    DateRangePicker,
    DeleteList,
    ElasticToggle,
    FloatingField,
    MorphMenu,
    PinButton,
    SpringPhoto,
    UploadZone,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lab-page.html',
  styleUrls: ['../../shared/utility-page.scss', './lab-page.scss'],
})
export class LabPage {
  protected readonly notifications = signal(true);
  protected readonly darkMode = signal(false);
}
