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

/** Where the stickers sit in a room on phones and tablets: a column on the left or right edge, or a row at the bottom */
export type ReactionSide = 'left' | 'right' | 'bottom';
export const REACTION_SIDES: readonly ReactionSide[] = ['left', 'right', 'bottom'];

const isReactionSide = (value: unknown): value is ReactionSide => REACTION_SIDES.some((side) => side === value);

/** The lowest part of the screen, as a share of its height, where dropping the stickers puts them in a row */
const BOTTOM_SHARE = 0.25;

/** Where stickers dragged to a point of the screen settle: a row near the bottom, else the nearer edge */
export function dockAt(x: number, y: number, width: number, height: number): ReactionSide {
  if (y > height * (1 - BOTTOM_SHARE)) {
    return 'bottom';
  }
  return x < width / 2 ? 'left' : 'right';
}

const STORAGE = 'reaction-side';
const DRAG_STORAGE = 'sticker-drag';

/** Whether this player moves the stickers by holding them (while the `sticker-drag` switch is on) */
export type StickerDragChoice = 'on' | 'off';
export const STICKER_DRAG_CHOICES: readonly StickerDragChoice[] = ['on', 'off'];

/**
 * Room stickers: whether they're on (the `room-reactions` switch) and where they sit on phones and tablets, chosen in the
 * header settings or by dragging them: right until the visitor picks another place. Remembered in this browser.
 */
@Injectable({ providedIn: 'root' })
export class Reactions {
  private readonly features = inject(FeatureFlags);
  private readonly chosenSide = signal<ReactionSide>('right');
  private readonly dragChoice = signal<StickerDragChoice>('on');

  readonly isAvailable = computed(() => this.features.canUse('room-reactions'));
  readonly side = this.chosenSide.asReadonly();
  /** Whether moving the stickers is offered to everyone (the admin's switch); each player can then turn it off */
  readonly canChooseDrag = computed(() => this.isAvailable() && this.features.canUse('sticker-drag'));
  readonly dragChosen = this.dragChoice.asReadonly();
  /** Whether holding the stickers lifts them so they can be moved */
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
