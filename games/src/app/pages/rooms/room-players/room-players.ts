import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MAX_PLAYERS, RoomView } from '../../../core/room-view';
import { PlayerAvatar } from '../../../shared/player-avatar/player-avatar';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/** The players of a room: avatar, nickname, host, ready, away and score; the host can remove a player */
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
  readonly kick = output<string>();

  protected readonly maxPlayers = MAX_PLAYERS;
}
