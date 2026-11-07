import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdminApi } from '../../core/admin-api';
import { GameAvailability } from '../../core/game-availability';
import { SiteLanguage } from '../../i18n/site-language';
import { AdminAccount } from './admin-account';
import { AdminGames } from './admin-games';
import { AdminPlays } from './admin-plays';
import { AdminSuggestions } from './admin-suggestions';
import { AdminTeam } from './admin-team';
import { AdminWordReports } from './admin-word-reports';

type SignIn = 'restoring' | 'idle' | 'checking' | 'wrong' | 'offline';

const TABS = ['games', 'plays', 'suggestions', 'words', 'team', 'account'] as const;
type Tab = (typeof TABS)[number];
/** Tabs only the super admin sees */
const SUPER_TABS: readonly Tab[] = ['team'];

/**
 * The admin page, at /<ADMIN_PATH> (see core/links.ts): sign in with email and password (the browser stays signed in
 * for 30 days), then switch games, see plays and feedback, and moderate suggestions and reported words, one tab each.
 * The super admin also manages the team; everyone can change their own password.
 */
@Component({
  selector: 'app-admin-page',
  imports: [AdminAccount, AdminGames, AdminPlays, AdminSuggestions, AdminTeam, AdminWordReports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-page.html',
  styleUrls: ['../../shared/utility-page.scss', './admin.scss'],
})
export class AdminPage {
  protected readonly admin = inject(AdminApi);
  private readonly availability = inject(GameAvailability);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly signIn = signal<SignIn>('restoring');
  protected readonly tab = signal<Tab>('games');
  protected readonly tabs = computed(() => TABS.filter((tab) => this.admin.isSuper() || !SUPER_TABS.includes(tab)));

  constructor() {
    afterNextRender(async () => {
      const restored = await this.admin.restore();
      this.signIn.set(restored === 'offline' ? 'offline' : 'idle');
    });
  }

  protected async submit(event: Event, email: HTMLInputElement, password: HTMLInputElement): Promise<void> {
    event.preventDefault();
    this.signIn.set('checking');
    const answer = await this.admin.signIn(email.value.trim(), password.value);
    this.signIn.set(answer === 'right' ? 'idle' : answer);
    if (answer === 'right') {
      // Signing in turns preview on; coming back later keeps whatever the admin chose
      this.availability.setPreview(true);
    }
  }

  protected async signOut(): Promise<void> {
    await this.admin.signOut();
    this.availability.setPreview(false);
    this.tab.set('games');
  }
}
