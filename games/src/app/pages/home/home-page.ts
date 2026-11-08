import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FeatureFlags } from '../../core/feature-flags';
import { GameAvailability } from '../../core/game-availability';
import { byCategory } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';
import { GameCard } from '../../shared/game-card';
import { RouterLink } from '@angular/router';
import { WhatsNew } from './whats-new';
import { Reveal } from '../../shared/reveal';

/** Home page: the games by category, and what's new */
@Component({
  selector: 'app-home-page',
  imports: [GameCard, Reveal, RouterLink, WhatsNew],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-cards.scss', './home-page.scss'],
})
export class HomePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  private readonly availability = inject(GameAvailability);
  protected readonly features = inject(FeatureFlags);
  protected readonly categories = computed(() => byCategory(this.availability.visibleGames()));
}
