import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MAX_PLAYERS, RoomView } from '../../../core/room-view';
import { PlayerAvatar } from '../../../shared/player-avatar/player-avatar';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/**
 * The players of a room: avatar, nickname, host, ready, away and score; the host can remove a player, and a player can
 * ask for another nickname. When the names don't fit in one row, only small avatars show; tapping one shows its name.
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
  readonly kick = output<string>();
  readonly rename = output();

  protected readonly maxPlayers = MAX_PLAYERS;
  /** The player whose name is shown while the bar only has room for avatars */
  protected readonly openId = signal<string | null>(null);

  protected toggle(playerId: string): void {
    this.openId.update((open) => (open === playerId ? null : playerId));
  }
}
