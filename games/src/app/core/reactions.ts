import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

/** The hand-drawn stickers players can send each other in a room (the rooms service knows the same ids) */
export const REACTIONS = ['shy', 'happy', 'love', 'angry', 'laugh', 'confused', 'cry'] as const;
export type Reaction = (typeof REACTIONS)[number];

/** Least time between two stickers from one player; the rooms service drops quicker ones */
export const REACTION_GAP_MS = 1500;
/** How long a sticker stays on its player's card */
export const REACTION_SHOW_MS = 3000;

export const isReaction = (value: unknown): value is Reaction =>
  REACTIONS.some((reaction) => reaction === value);

/** A sticker's picture, cut from the drawing */
export const reactionPicture = (reaction: Reaction): string => `/reactions/${reaction}.webp`;

/** The side of the screen the stickers stick to in a room */
export type ReactionSide = 'left' | 'right';
export const REACTION_SIDES: readonly ReactionSide[] = ['left', 'right'];

const STORAGE = 'reaction-side';

/**
 * Room stickers: whether they're on (the `room-reactions` switch) and the visitor's choice, in the header settings, of
 * the side they stick to: right until they pick left. Remembered in this browser.
 */
@Injectable({ providedIn: 'root' })
export class Reactions {
  private readonly features = inject(FeatureFlags);
  private readonly chosenSide = signal<ReactionSide>('right');

  readonly isAvailable = computed(() => this.features.canUse('room-reactions'));
  readonly side = this.chosenSide.asReadonly();

  constructor() {
    afterNextRender(() => {
      if (readStored(STORAGE) === 'left') {
        this.chosenSide.set('left');
      }
    });
  }

  setSide(side: ReactionSide): void {
    this.chosenSide.set(side);
    writeStored(STORAGE, side);
  }
}
