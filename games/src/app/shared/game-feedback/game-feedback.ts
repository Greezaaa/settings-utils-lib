import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { GameSlug } from '../../core/games';
import { FEEDBACK_REASONS, FeedbackReason, GamesApi, Vote } from '../../core/games-api';
import { readStored, writeStored } from '../../core/site-storage';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

/** The games this browser already rated, so it isn't asked again */
const RATED_STORAGE = 'rated-games';

type Step = 'ask' | 'reason' | 'sending' | 'thanks' | 'failed';

function readRated(): string[] {
  const stored = readStored(RATED_STORAGE);
  return Array.isArray(stored) ? stored.filter((game: unknown): game is string => typeof game === 'string') : [];
}

/**
 * "Do you like this game?" under a game: 👍 or 👎, then an optional preset reason, sent anonymously to the API.
 * Once a game is rated in this browser, the question no longer shows.
 */
@Component({
  selector: 'app-game-feedback',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-feedback.html',
  styleUrl: './game-feedback.scss',
})
export class GameFeedback {
  readonly game = input.required<GameSlug>();

  private readonly api = inject(GamesApi);
  private readonly language = inject(SiteLanguage);

  /** Hidden until the browser says whether this game was rated, so prerendered pages never show it */
  protected readonly step = signal<Step | null>(null);
  protected readonly vote = signal<Vote>('up');
  protected readonly reasons = FEEDBACK_REASONS;

  constructor() {
    afterNextRender(() => this.step.set(readRated().includes(this.game()) ? null : 'ask'));
  }

  protected choose(vote: Vote): void {
    this.vote.set(vote);
    this.step.set('reason');
  }

  protected async send(reason?: FeedbackReason): Promise<void> {
    this.step.set('sending');
    const sent = await this.api.sendFeedback(this.game(), this.vote(), this.language.language(), reason);
    if (sent) {
      writeStored(RATED_STORAGE, [...new Set([...readRated(), this.game()])]);
    }
    this.step.set(sent ? 'thanks' : 'failed');
  }
}
