import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

export const REACTIONS = ['shy', 'happy', 'love', 'angry', 'laugh', 'confused', 'cry'] as const;
export type Reaction = (typeof REACTIONS)[number];

export const REACTION_GAP_MS = 1500;
export const REACTION_SHOW_MS = 3000;

export const isReaction = (value: unknown): value is Reaction =>
  REACTIONS.some((reaction) => reaction === value);

export const reactionPicture = (reaction: Reaction): string => `/reactions/${reaction}.webp`;

export type ReactionSide = 'left' | 'right' | 'bottom';
export const REACTION_SIDES: readonly ReactionSide[] = ['left', 'right', 'bottom'];

const isReactionSide = (value: unknown): value is ReactionSide => REACTION_SIDES.some((side) => side === value);

const BOTTOM_SHARE = 0.25;

export function dockAt(x: number, y: number, width: number, height: number): ReactionSide {
  if (y > height * (1 - BOTTOM_SHARE)) {
    return 'bottom';
  }
  return x < width / 2 ? 'left' : 'right';
}

const STORAGE = 'reaction-side';
const DRAG_STORAGE = 'sticker-drag';

export type StickerDragChoice = 'on' | 'off';
export const STICKER_DRAG_CHOICES: readonly StickerDragChoice[] = ['on', 'off'];

@Injectable({ providedIn: 'root' })
export class Reactions {
  private readonly features = inject(FeatureFlags);
  private readonly chosenSide = signal<ReactionSide>('right');
  private readonly dragChoice = signal<StickerDragChoice>('on');

  readonly isAvailable = computed(() => this.features.canUse('room-reactions'));
  readonly side = this.chosenSide.asReadonly();
  readonly canChooseDrag = computed(() => this.isAvailable() && this.features.canUse('sticker-drag'));
  readonly dragChosen = this.dragChoice.asReadonly();
  readonly isMovable = computed(() => this.canChooseDrag() && this.dragChoice() === 'on');

  constructor() {
    afterNextRender(() => {
      const stored = readStored(STORAGE);
      if (isReactionSide(stored)) {
        this.chosenSide.set(stored);
      }
      if (readStored(DRAG_STORAGE) === 'off') {
        this.dragChoice.set('off');
      }
    });
  }

  setDrag(choice: StickerDragChoice): void {
    this.dragChoice.set(choice);
    writeStored(DRAG_STORAGE, choice);
  }

  setSide(side: ReactionSide): void {
    this.chosenSide.set(side);
    writeStored(STORAGE, side);
  }
}
