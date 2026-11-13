import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GamePicture } from '../../../core/pictures';
import { Shape } from '../../../games/board';
import { PicturePhase } from '../../../games/picture-game';
import { isRight, Turns } from '../../../games/turn-picture';
import { PictureSlice } from '../../../shared/picture-slice/picture-slice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-turn-board',
  imports: [TranslatePipe, PictureSlice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './turn-board.html',
  styleUrl: '../../../shared/picture-board.scss',
  host: { style: 'display: contents' },
})
export class TurnBoard {
  readonly picture = input.required<GamePicture>();
  readonly shape = input.required<Shape>();
  readonly turns = input.required<Turns>();
  readonly phase = input.required<PicturePhase>();
  readonly showHints = input(false);
  readonly tapped = output<number>();


  protected isTileRight(cell: number): boolean {
    return isRight(this.turns()[cell] ?? 0);
  }

  protected rotation(cell: number): string {
    return `rotate(${(this.turns()[cell] ?? 0) * 90}deg)`;
  }

  protected tap(cell: number): void {
    if (this.phase() === 'playing') {
      this.tapped.emit(cell);
    }
  }
}
