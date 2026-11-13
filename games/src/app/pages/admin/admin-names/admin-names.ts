import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminApi, PendingName } from '../../../core/admin-api';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

@Component({
  selector: 'app-admin-names',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-names.html',
  styleUrl: '../admin.scss',
})
export class AdminNames {
  private readonly admin = inject(AdminApi);

  protected readonly list = new PagedList(offset => this.admin.pendingNames(offset));
  private readonly notifySaveFailed = saveFailedNotice();

  constructor() {
    void this.list.reload();
  }

  protected async approve(name: PendingName): Promise<void> {
    await this.decided(name, this.admin.approveName(name.id));
  }

  protected async replace(name: PendingName): Promise<void> {
    await this.decided(name, this.admin.renamePlayer(name.id).then(screenName => screenName !== null));
  }

  private async decided(name: PendingName, saved: Promise<boolean>): Promise<void> {
    if (await saved) {
      this.list.remove(name);
    } else {
      this.notifySaveFailed();
    }
  }
}
