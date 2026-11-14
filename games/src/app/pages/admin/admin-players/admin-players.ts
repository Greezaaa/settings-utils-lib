import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SuTableAction, SuTableActionEvent, SuTableColumns, SuTableComponent } from '@su-labs/table';
import { AdminApi, ModeratedPlayer } from '../../../core/admin-api';
import { SiteLanguage } from '../../../i18n/site-language';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { AdminNames } from '../admin-names/admin-names';
import { FeatureFlags } from '../../../core/feature-flags';
import { ADMIN_TABLE_PAGE_SIZE, ADMIN_TABLE_PAGE_SIZES } from '../admin-table';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

@Component({
  selector: 'app-admin-players',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe, AdminNames, SuTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-players.html',
  styleUrl: '../admin.scss',
})
export class AdminPlayers {
  private readonly admin = inject(AdminApi);
  private readonly features = inject(FeatureFlags);
  protected readonly hasRoomNames = computed(() => this.features.canUse('room-names'));
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly useTable = computed(() => this.features.canUse('admin-tables'));
  protected readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  protected readonly pageSizes = ADMIN_TABLE_PAGE_SIZES;
  protected readonly playerId = (player: ModeratedPlayer): string => player.id;
  protected readonly columns = computed<SuTableColumns<ModeratedPlayer>>(() => {
    const { admin } = this.t();
    return [
      { key: 'screenName', header: admin.playerColumns.name, sortable: true },
      {
        key: 'removedFromBoards',
        header: admin.playerColumns.boards,
        sortable: true,
        format: removed => (removed ? admin.playerRemoved : admin.playerShown),
      },
      { key: 'joined', header: admin.playerColumns.joined, sortable: true },
    ];
  });
  protected readonly actions = computed<readonly SuTableAction<ModeratedPlayer>[]>(() => {
    const { admin } = this.t();
    return [
      { id: 'rename', label: admin.plainName },
      { id: 'take-off', label: admin.takeOff, hidden: player => player.removedFromBoards },
      { id: 'put-back', label: admin.putBack, hidden: player => !player.removedFromBoards },
    ];
  });

  protected readonly list = new PagedList(offset => this.admin.players(offset));
  private readonly notifySaveFailed = saveFailedNotice();

  constructor() {
    void this.list.reload();
  }

  protected onAction({ id, rows: [player] }: SuTableActionEvent<ModeratedPlayer>): void {
    if (!player) {
      return;
    }
    if (id === 'rename') {
      void this.rename(player);
    } else {
      void this.setRemoved(player, id === 'take-off');
    }
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
