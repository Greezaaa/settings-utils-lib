import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameThemeId, isGameThemeId } from './game-themes';
import { readStored, writeStored } from './site-storage';
import { SiteTheme } from './site-theme';

const STORAGE = 'board-colours';
/** Where Math games kept the choice before it became a setting for every game */
const OLD_STORAGE = 'math-games:theme';

/**
 * Colours of every game board, chosen once in the header settings and remembered in this browser.
 * Each board applies them with the `appGameBoard` directive.
 */
@Injectable({ providedIn: 'root' })
export class BoardColours {
  private readonly siteTheme = inject(SiteTheme);
  private readonly chosenId = signal<GameThemeId | null>(null);

  /** The visitor's choice; `null` until they pick one, and boards then keep the page's colours */
  readonly chosen = this.chosenId.asReadonly();

  /** The option the picker shows as selected: the choice, or the site's light or dark until there is one */
  readonly selected = computed<GameThemeId>(
    () => this.chosenId() ?? (this.siteTheme.resolved() === 'dark' ? 'dark' : 'light'),
  );

  constructor() {
    afterNextRender(() => {
      const stored = readStored(STORAGE) ?? readStored(OLD_STORAGE);
      if (isGameThemeId(stored)) {
        this.chosenId.set(stored);
      }
    });
  }

  set(id: GameThemeId): void {
    this.chosenId.set(id);
    writeStored(STORAGE, id);
  }
}
