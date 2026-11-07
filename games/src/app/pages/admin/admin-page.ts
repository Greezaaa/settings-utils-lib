import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameAvailability } from '../../core/game-availability';
import { GAMES, GameSlug } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { SiteLanguage } from '../../i18n/site-language';

/** Keeps the token for this tab only, so the admin can reload without typing it again; gone when the tab closes */
const TOKEN_SESSION_KEY = 'su-labs-games:admin-token';

type SignIn = 'idle' | 'checking' | 'wrong' | 'offline';

/**
 * The site admin's page, at /admin and linked from nowhere: sign in with the API's admin token, turn preview mode
 * on (every game shows, open or not) and switch each game on or off for the public. Only the author uses it, so its
 * texts are in English only.
 */
@Component({
  selector: 'app-admin-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-page.html',
  styleUrls: ['../../shared/utility-page.scss', './admin-page.scss'],
})
export class AdminPage {
  private readonly api = inject(GamesApi);
  protected readonly availability = inject(GameAvailability);
  /** Game names in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  private readonly token = signal<string | null>(null);
  protected readonly isSignedIn = computed(() => this.token() !== null);
  protected readonly signIn = signal<SignIn>('idle');
  /** The game being switched, while the API answers */
  protected readonly saving = signal<GameSlug | null>(null);
  protected readonly saveFailed = signal(false);
  protected readonly games = GAMES;

  constructor() {
    afterNextRender(() => {
      const token = sessionStorage.getItem(TOKEN_SESSION_KEY);
      if (token) {
        void this.check(token, false);
      }
    });
  }

  protected submit(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    void this.check(input.value.trim(), true);
  }

  protected async toggle(game: GameSlug): Promise<void> {
    const token = this.token();
    if (!token || this.saving()) {
      return;
    }
    this.saving.set(game);
    this.saveFailed.set(false);
    const saved = await this.api.setGameEnabled(token, game, !this.availability.isOpen(game));
    if (saved) {
      await this.availability.refresh();
    }
    this.saveFailed.set(!saved);
    this.saving.set(null);
  }

  protected togglePreview(): void {
    this.availability.setPreview(!this.availability.isPreview());
  }

  protected signOut(): void {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    this.token.set(null);
    this.availability.setPreview(false);
    this.signIn.set('idle');
  }

  /** Signs in with a token; signing in by hand also turns preview on, coming back to the page keeps the choice */
  private async check(token: string, startPreview: boolean): Promise<void> {
    if (!token) {
      return;
    }
    this.signIn.set('checking');
    const answer = await this.api.checkAdmin(token);
    if (answer !== 'right') {
      this.signIn.set(answer);
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
      return;
    }
    sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    this.token.set(token);
    this.signIn.set('idle');
    if (startPreview) {
      this.availability.setPreview(true);
    }
    await this.availability.refresh();
  }
}
