import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'menu-animation';

/** Whether the header menu is animated (a shape drifts after the pointer and fills the link it reaches) */
export type MenuAnimationChoice = 'on' | 'off';
export const MENU_ANIMATION_CHOICES: readonly MenuAnimationChoice[] = ['on', 'off'];

/**
 * The visitor's choice, in the header settings, of an animated menu: off until they turn it on. Remembered in this
 * browser; the setting only shows, and the menu only animates, while its feature switch (`menu-ring`) is on.
 */
@Injectable({ providedIn: 'root' })
export class MenuAnimation {
  private readonly features = inject(FeatureFlags);
  private readonly chosen = signal<MenuAnimationChoice>('off');

  readonly isAvailable = computed(() => this.features.canUse('menu-ring'));
  readonly choice = this.chosen.asReadonly();
  readonly isOn = computed(() => this.isAvailable() && this.chosen() === 'on');

  constructor() {
    afterNextRender(() => {
      if (readStored(STORAGE) === 'on') {
        this.chosen.set('on');
      }
    });
  }

  set(choice: MenuAnimationChoice): void {
    this.chosen.set(choice);
    writeStored(STORAGE, choice);
  }
}
