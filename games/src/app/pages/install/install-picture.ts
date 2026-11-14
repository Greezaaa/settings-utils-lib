import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InstallPicture as InstallPictureId } from '../../core/install-guides';

@Component({
  selector: 'app-install-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './install-picture.html',
  styleUrl: './install-picture.scss',
})
export class InstallPicture {
  readonly picture = input.required<InstallPictureId>();
}
