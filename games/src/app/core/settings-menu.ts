import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'pinned-settings';

export const SETTING_IDS = [
  'text-size',
  'reduce-motion',
  'theme',
  'board-colours',
  'answer-style',
  'menu-animation',
  'offline-play',
  'install',
  'reaction-side',
  'sticker-drag',
  'word-gender',
  'language',
  'version',
] as const;

export type SettingId = (typeof SETTING_IDS)[number];

const DEFAULT_PINNED: readonly SettingId[] = ['text-size', 'theme', 'language', 'version'];

const isSettingId = (value: unknown): value is SettingId => SETTING_IDS.some((id) => id === value);

/**
 * Which settings the settings menu shows. With the settings page switched on, players pin the ones they want
 * close at hand and find the rest on /settings; with it off, the menu shows every setting.
 */
@Injectable({ providedIn: 'root' })
export class SettingsMenu {
  private readonly features = inject(FeatureFlags);
  private readonly pinned = signal<ReadonlySet<SettingId>>(new Set(DEFAULT_PINNED));

  readonly isAvailable = computed(() => this.features.canUse('settings-page'));

  constructor() {
    afterNextRender(() => {
      const stored = readStored(STORAGE);
      if (Array.isArray(stored)) {
        this.pinned.set(new Set(stored.filter(isSettingId)));
      }
    });
  }

  isPinned(id: SettingId): boolean {
    return this.pinned().has(id);
  }

  showsInMenu(id: SettingId): boolean {
    return !this.isAvailable() || this.isPinned(id);
  }

  togglePin(id: SettingId): void {
    const next = new Set(this.pinned());
    if (!next.delete(id)) {
      next.add(id);
    }
    this.pinned.set(next);
    writeStored(STORAGE, [...next]);
  }
}
