import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdminApi } from '../../core/admin-api';
import { GameAvailability } from '../../core/game-availability';
import { AdminAccount } from './admin-account/admin-account';
import { AdminErrors } from './admin-errors/admin-errors';
import { AdminGames } from './admin-games/admin-games';
import { AdminPlayers } from './admin-players/admin-players';
import { AdminPlays } from './admin-plays/admin-plays';
import { AdminSuggestions } from './admin-suggestions/admin-suggestions';
import { AdminTeam } from './admin-team/admin-team';
import { AdminWordReports } from './admin-word-reports/admin-word-reports';
import { TranslatePipe } from '../../i18n/translate-pipe';

type SignIn = 'restoring' | 'idle' | 'checking' | 'wrong' | 'too-many' | 'offline';

const TABS = ['games', 'plays', 'suggestions', 'words', 'players', 'errors', 'team', 'account'] as const;
type Tab = (typeof TABS)[number];
/** Tabs only the super admin sees: switching games and features, the error log, and the team */
const SUPER_TABS: readonly Tab[] = ['games', 'errors', 'team'];

/**
 * The admin page, at /<ADMIN_PATH> (see core/links.ts): sign in with email and password (the browser stays signed in
 * for 30 days), then switch games, see plays and feedback, and moderate suggestions, reported words and the players on
 * the leaderboards, one tab each.
 * Only the super admin switches games and features and manages the team; moderators and testers moderate, and
 * testers also use preview. Everyone can change their own password.
 */
@Component({
  selector: 'app-admin-page',
  imports: [TranslatePipe, AdminAccount, AdminErrors, AdminGames, AdminPlayers, AdminPlays, AdminSuggestions, AdminTeam, AdminWordReports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-page.html',
  styleUrls: ['../../shared/utility-page.scss', './admin.scss'],
})
export class AdminPage {
  protected readonly admin = inject(AdminApi);
  private readonly availability = inject(GameAvailability);

  protected readonly signIn = signal<SignIn>('restoring');
  protected readonly tab = signal<Tab>('plays');
  protected readonly tabs = computed(() => TABS.filter((tab) => this.admin.isSuper() || !SUPER_TABS.includes(tab)));

  constructor() {
    afterNextRender(async () => {
      const restored = await this.admin.restore();
      this.signIn.set(restored === 'offline' ? 'offline' : 'idle');
      if (this.admin.isSuper()) {
        this.tab.set('games');
      }
    });
  }

  protected async submit(event: Event, email: HTMLInputElement, password: HTMLInputElement): Promise<void> {
    event.preventDefault();
    this.signIn.set('checking');
    const answer = await this.admin.signIn(email.value.trim(), password.value);
    this.signIn.set(answer === 'right' ? 'idle' : answer);
    if (answer === 'right') {
      // The super admin starts on the switches; signing in turns preview on for those who may use it
      this.tab.set(this.admin.isSuper() ? 'games' : 'plays');
      this.availability.setPreview(this.admin.canPreview());
    }
  }

  protected async signOut(): Promise<void> {
    await this.admin.signOut();
    this.availability.setPreview(false);
    this.tab.set('plays');
  }
}
