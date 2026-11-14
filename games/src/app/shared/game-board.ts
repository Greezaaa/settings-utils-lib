import { afterNextRender, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { SuStorage } from '@su-labs/core';
import { SuThemeController } from '@su-labs/core/theme';
import { BoardColours } from '../core/board-colours';
import { GameThemeId, getGameTheme } from '../core/game-themes';
import { Fullscreen } from '../core/fullscreen';
import { SiteLanguage } from '../i18n/site-language';

const UNSAVED: SuStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

const SAFARI_ZOOM_GESTURES = ['gesturestart', 'gesturechange'];

const EXIT_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>';

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
    const messages = inject(SiteLanguage).messages;
    const exit = this.element.ownerDocument.createElement('button');
    exit.type = 'button';
    exit.className = 'icon-button board-exit';
    exit.innerHTML = EXIT_ICON;
    exit.addEventListener('click', () => void fullscreen.toggle());
    effect(() => {
      const label = messages().site.exitFullscreen;
      exit.setAttribute('aria-label', label);
      exit.title = label;
    });
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
      this.element.prepend(exit);
      fullscreen.register(this.element);
      for (const gesture of SAFARI_ZOOM_GESTURES) {
        this.element.addEventListener(gesture, stopZoom, { passive: false });
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.controller.destroy();
      fullscreen.unregister(this.element);
      exit.remove();
      for (const gesture of SAFARI_ZOOM_GESTURES) {
        this.element.removeEventListener(gesture, stopZoom);
      }
    });
  }
}
