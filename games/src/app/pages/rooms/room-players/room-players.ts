import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { reactionPicture } from '../../../core/reactions';
import { PlayerReaction } from '../../../core/room-client';
import { MAX_PLAYERS, RoomPlayer, RoomView } from '../../../core/room-view';
import { PlayerAvatar } from '../../../shared/player-avatar/player-avatar';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-room-players',
  imports: [TranslatePipe, PlayerAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-players.html',
  styleUrl: './room-players.scss',
})
export class RoomPlayers {
  readonly room = input.required<RoomView>();
  readonly meId = input<string | null>(null);
  readonly canKick = input(false);
  readonly canRename = input(false);
  readonly reactions = input<readonly PlayerReaction[]>([]);
  readonly kick = output<string>();
  readonly rename = output();
  readonly reportName = output<RoomPlayer>();

  protected readonly maxPlayers = MAX_PLAYERS;
  protected readonly openId = signal<string | null>(null);

  protected readonly pictureOf = reactionPicture;
  protected readonly latestReactions = computed(() => {
    const latest = new Map<string, PlayerReaction[]>();
    for (const shown of this.reactions()) {
      latest.set(shown.playerId, [shown]);
    }
    return latest;
  });

  protected toggle(playerId: string): void {
    this.openId.update((open) => (open === playerId ? null : playerId));
  }
}
