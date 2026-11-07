import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameSlug, gameInfo } from '../core/games';
import { NewGames } from '../core/new-games';
import { SiteLanguage } from '../i18n/site-language';

/** A card that links to a game: its recommended age, a "New" badge when it was added lately, name and summary */
@Component({
  selector: 'app-game-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  readonly game = input.required<GameSlug>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  private readonly newGames = inject(NewGames).games;

  protected readonly minAge = computed(() => gameInfo(this.game()).minAge);
  protected readonly isNew = computed(() => this.newGames().includes(this.game()));
}
