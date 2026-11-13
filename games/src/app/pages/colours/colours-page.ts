import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BoardColours } from '../../core/board-colours';
import { GAME_THEMES } from '../../core/game-themes';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { GameBoard } from '../../shared/game-board';

const SAMPLE_ANSWERS = [6, 7, 8] as const;
const SAMPLE_CHOSEN = 7;

@Component({
  selector: 'app-colours-page',
  imports: [TranslatePipe, GameBoard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './colours-page.html',
  styleUrls: ['../../shared/utility-page.scss', './colours-page.scss'],
})
export class ColoursPage {
  protected readonly boardColours = inject(BoardColours);
  protected readonly themes = GAME_THEMES;
  protected readonly sampleAnswers = SAMPLE_ANSWERS;
  protected readonly sampleChosen = SAMPLE_CHOSEN;
}
