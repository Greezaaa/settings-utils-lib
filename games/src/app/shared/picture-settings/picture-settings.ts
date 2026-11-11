import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BoardLevelId } from '../../games/board';
import { PICTURE_LEVELS, PICTURE_MODE_IDS, PictureModeId } from '../../games/picture-game';
import { TranslatePipe } from '../../i18n/translate-pipe';

/** The settings both picture games share: Look or Memory, and the board size */
@Component({
  selector: 'app-picture-settings',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picture-settings.html',
  styleUrl: './picture-settings.scss',
})
export class PictureSettings {
  readonly mode = input.required<PictureModeId>();
  readonly level = input.required<BoardLevelId>();
  readonly modeChange = output<PictureModeId>();
  readonly levelChange = output<BoardLevelId>();

  protected readonly modes = PICTURE_MODE_IDS;
  protected readonly levels = PICTURE_LEVELS;
}
