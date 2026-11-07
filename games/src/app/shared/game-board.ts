import { DestroyRef, Directive, effect, ElementRef, inject } from '@angular/core';
import { SuStorage } from '@su-labs/core';
import { SuThemeController } from '@su-labs/core/theme';
import { BoardColours } from '../core/board-colours';
import { getGameTheme } from '../core/game-themes';

/** The board's theme controller saves nothing: BoardColours keeps the choice for every board */
const UNSAVED: SuStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

/**
 * Marks a game's board: it takes the board colours chosen in the header settings, applied to this element
 * only with @su-labs/theme's `target` option. The colour rules are `.game-board` in styles.scss, so a game
 * only needs this attribute on its board.
 */
@Directive({
  selector: '[appGameBoard]',
  host: { class: 'game-board' },
})
export class GameBoard {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly controller = new SuThemeController();

  constructor() {
    const colours = inject(BoardColours);
    effect(() => {
      const id = colours.chosen();
      if (id) {
        this.controller.init({
          target: this.element,
          storage: UNSAVED,
          defaultTheme: 'custom',
          themes: { custom: getGameTheme(id).palette },
        });
      }
    });
    inject(DestroyRef).onDestroy(() => this.controller.destroy());
  }
}
