import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AdminApi, ModeratedPlayer } from '../../../core/admin-api';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { AdminNames } from '../admin-names/admin-names';
import { FeatureFlags } from '../../../core/feature-flags';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

@Component({
  selector: 'app-admin-players',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe, AdminNames],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-players.html',
  styleUrl: '../admin.scss',
})
export class AdminPlayers {
  private readonly admin = inject(AdminApi);
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
