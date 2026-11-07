import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminApi } from '../../core/admin-api';
import { GameAvailability } from '../../core/game-availability';
import { AdminGames } from './admin-games';
import { AdminPlays } from './admin-plays';
import { AdminSuggestions } from './admin-suggestions';
import { AdminWordReports } from './admin-word-reports';

type SignIn = 'idle' | 'checking' | 'wrong' | 'offline';

const TABS = ['games', 'plays', 'suggestions', 'words'] as const;
type Tab = (typeof TABS)[number];
const TAB_NAMES: Readonly<Record<Tab, string>> = {
  games: 'Games',
  plays: 'Plays and feedback',
  suggestions: 'Suggestions',
  words: 'Reported words',
};

/**
 * The site admin's page, at /admin and linked from nowhere: sign in with the API's admin token, then switch games,
 * see plays and feedback, and moderate suggestions and reported words, one tab each. Only the author uses it, so its
 * texts are in English only.
 */
@Component({
  selector: 'app-admin-page',
  imports: [AdminGames, AdminPlays, AdminSuggestions, AdminWordReports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-page.html',
  styleUrls: ['../../shared/utility-page.scss', './admin.scss'],
})
export class AdminPage {
  protected readonly admin = inject(AdminApi);
  private readonly availability = inject(GameAvailability);

  protected readonly signIn = signal<SignIn>('idle');
  protected readonly tabs = TABS;
  protected readonly tabNames = TAB_NAMES;
  protected readonly tab = signal<Tab>('games');

  constructor() {
    afterNextRender(() => {
      const token = this.admin.savedToken();
      if (token) {
        void this.check(token, false);
      }
    });
  }

  protected submit(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    void this.check(input.value.trim(), true);
  }

  protected signOut(): void {
    this.admin.signOut();
    this.availability.setPreview(false);
    this.signIn.set('idle');
  }

  /** Signs in; signing in by hand also turns preview on, coming back to the page keeps the choice */
  private async check(token: string, startPreview: boolean): Promise<void> {
    if (!token) {
      return;
    }
    this.signIn.set('checking');
    const answer = await this.admin.signIn(token);
    this.signIn.set(answer === 'right' ? 'idle' : answer);
    if (answer === 'right' && startPreview) {
      this.availability.setPreview(true);
    }
  }
}
