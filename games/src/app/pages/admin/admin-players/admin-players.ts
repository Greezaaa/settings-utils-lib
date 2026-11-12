import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AdminApi, ModeratedPlayer } from '../../../core/admin-api';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { AdminNames } from '../admin-names/admin-names';
import { FeatureFlags } from '../../../core/feature-flags';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

/**
 * Admin tab: the players on the leaderboards, a page at a time. A rude screen name gets a plain one in its place;
 * made-up scores take the player off the leaderboards (they can't undo it), until a moderator puts them back.
 */
@Component({
  selector: 'app-admin-players',
  imports: [TranslatePipe, AdminNames],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-players.html',
  styleUrl: '../admin.scss',
})
export class AdminPlayers {
  private readonly admin = inject(AdminApi);
  /** Names wait for a moderator only while they can show in rooms (in preview too, to try it) */
  private readonly features = inject(FeatureFlags);
  protected readonly hasRoomNames = computed(() => this.features.canUse('room-names'));

  protected readonly list = new PagedList(offset => this.admin.players(offset));
  private readonly notifySaveFailed = saveFailedNotice();

  constructor() {
    void this.list.reload();
  }

  protected async rename(player: ModeratedPlayer): Promise<void> {
    const screenName = await this.admin.renamePlayer(player.id);
    if (screenName === null) {
      this.notifySaveFailed();
      return;
    }
    this.list.replace(player, { ...player, screenName });
  }

  protected async setRemoved(player: ModeratedPlayer, removedFromBoards: boolean): Promise<void> {
    if (await this.admin.setPlayerRemoved(player.id, removedFromBoards)) {
      this.list.replace(player, { ...player, removedFromBoards });
    } else {
      this.notifySaveFailed();
    }
  }
}
