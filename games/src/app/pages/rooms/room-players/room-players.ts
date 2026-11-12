import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { reactionPicture } from '../../../core/reactions';
import { PlayerReaction } from '../../../core/room-client';
import { MAX_PLAYERS, RoomPlayer, RoomView } from '../../../core/room-view';
import { PlayerAvatar } from '../../../shared/player-avatar/player-avatar';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/**
 * The players of a room: avatar, nickname (or approved own name), host, ready, away and score; the host can remove a
 * player, a player can ask for another nickname, and anyone can hide and report another player's name. A sticker a player sends pops on their card for a moment, with a heartbeat. When the names don't fit in one row, only small avatars show; tapping one shows its name.
 */
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
  /** The player whose name is shown while the bar only has room for avatars */
  protected readonly openId = signal<string | null>(null);

  protected readonly pictureOf = reactionPicture;
  /** Each player's latest sticker, as a list of one so a new one replays the heartbeat */
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
