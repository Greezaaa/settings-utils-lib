import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameThemeId, isGameThemeId } from './game-themes';
import { readStored, writeStored } from './site-storage';
import { SiteTheme } from './site-theme';

const STORAGE = 'board-colours';
const OLD_STORAGE = 'math-games:theme';

@Injectable({ providedIn: 'root' })
export class BoardColours {
  private readonly siteTheme = inject(SiteTheme);
  private readonly chosenId = signal<GameThemeId | null>(null);

  readonly chosen = this.chosenId.asReadonly();

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
