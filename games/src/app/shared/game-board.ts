import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { SuStorage } from '@su-labs/core';
import { SuThemeController } from '@su-labs/core/theme';
import { BoardColours } from '../core/board-colours';
import { GameThemeId, getGameTheme } from '../core/game-themes';
import { Fullscreen } from '../core/fullscreen';

const UNSAVED: SuStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

const SAFARI_ZOOM_GESTURES = ['gesturestart', 'gesturechange'];

@Directive({
  selector: '[appGameBoard]',
  host: { class: 'game-board' },
})
export class GameBoard {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly controller = new SuThemeController();
  readonly theme = input<GameThemeId | null, GameThemeId | ''>(null, {
    alias: 'appGameBoard',
    transform: (value) => value || null,
  });

  constructor() {
    const colours = inject(BoardColours);
    const fullscreen = inject(Fullscreen);
    effect(() => {
      const id = this.theme() ?? colours.chosen();
      if (id) {
        this.controller.init({
          target: this.element,
          storage: UNSAVED,
          defaultTheme: 'custom',
          themes: { custom: getGameTheme(id).palette },
        });
      }
    });
    const stopZoom = (event: Event): void => event.preventDefault();
    afterNextRender(() => {
      fullscreen.register(this.element);
      for (const gesture of SAFARI_ZOOM_GESTURES) {
        this.element.addEventListener(gesture, stopZoom, { passive: false });
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.controller.destroy();
      fullscreen.unregister(this.element);
      for (const gesture of SAFARI_ZOOM_GESTURES) {
        this.element.removeEventListener(gesture, stopZoom);
      }
    });
  }
}
