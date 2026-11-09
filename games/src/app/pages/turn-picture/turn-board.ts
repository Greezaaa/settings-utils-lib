import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { GamePicture } from '../../core/pictures';
import { Shape } from '../../games/board';
import { PicturePhase } from '../../games/picture-game';
import { isRight, Turns } from '../../games/turn-picture';
import { SiteLanguage } from '../../i18n/site-language';
import { PictureSlice } from '../../shared/picture-slice';

/**
 * The board of Turn the picture: a square per cell, turned a quarter per tap. Shared by the game's page and its room
 * round, which keep the game's state and turn the square they're told.
 */
@Component({
  selector: 'app-turn-board',
  imports: [PictureSlice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './turn-board.html',
  styleUrl: '../../shared/picture-board.scss',
  // The board sits straight in its parent's layout
  host: { style: 'display: contents' },
})
export class TurnBoard {
  readonly picture = input.required<GamePicture>();
  readonly shape = input.required<Shape>();
  readonly turns = input.required<Turns>();
  readonly phase = input.required<PicturePhase>();
  /** Look mode marks the squares that are already right */
  readonly showHints = input(false);
  readonly tapped = output<number>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected isTileRight(cell: number): boolean {
    return isRight(this.turns()[cell] ?? 0);
  }

  /** CSS rotation of a square: a quarter turn per tap, always clockwise */
  protected rotation(cell: number): string {
    return `rotate(${(this.turns()[cell] ?? 0) * 90}deg)`;
  }

  protected tap(cell: number): void {
    if (this.phase() === 'playing') {
      this.tapped.emit(cell);
    }
  }
}
