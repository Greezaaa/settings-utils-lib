import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { Reaction, REACTION_GAP_MS, reactionPicture, REACTIONS, Reactions } from '../../../core/reactions';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/**
 * The room's sticker bar, always open and stuck to the side of the screen the player chose in the settings. Tapping a
 * hand-drawn sticker sends it to everyone; the stickers rest a moment after, as the rooms service would drop a quicker
 * one.
 */
@Component({
  selector: 'app-room-reactions',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-reactions.html',
  styleUrl: './room-reactions.scss',
  host: { '[class.is-left]': "reactions.side() === 'left'" },
})
export class RoomReactions {
  protected readonly reactions = inject(Reactions);
  readonly react = output<Reaction>();

  protected readonly all = REACTIONS;
  protected readonly pictureOf = reactionPicture;
  protected readonly isResting = signal(false);

  protected send(reaction: Reaction): void {
    this.react.emit(reaction);
    this.isResting.set(true);
    setTimeout(() => this.isResting.set(false), REACTION_GAP_MS);
  }
}
