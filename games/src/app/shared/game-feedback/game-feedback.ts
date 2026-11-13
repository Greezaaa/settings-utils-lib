import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { GameSlug } from '../../core/games';
import { FEEDBACK_REASONS, FeedbackReason, GamesApi, Vote } from '../../core/games-api';
import { readStored, writeStored } from '../../core/site-storage';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

const RATED_STORAGE = 'rated-games';

type Step = 'ask' | 'reason' | 'sending' | 'thanks' | 'failed';

function readRated(): string[] {
  const stored = readStored(RATED_STORAGE);
  return Array.isArray(stored) ? stored.filter((game: unknown): game is string => typeof game === 'string') : [];
}

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
