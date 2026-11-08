import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MAX_PLAYERS, RoomView } from '../../core/room-view';
import { SiteLanguage } from '../../i18n/site-language';
import { PlayerAvatar } from '../../shared/player-avatar';

/** The players of a room: avatar, nickname, host, ready, away and score; the host can remove a player */
@Component({
  selector: 'app-room-players',
  imports: [PlayerAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-players.html',
  styleUrl: './room-players.scss',
})
export class RoomPlayers {
  readonly room = input.required<RoomView>();
  readonly meId = input<string | null>(null);
  readonly canKick = input(false);
  readonly kick = output<string>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly maxPlayers = MAX_PLAYERS;
}
