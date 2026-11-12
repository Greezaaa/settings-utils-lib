import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { isSuBaseThemeName, SuThemeName } from '@su-labs/theme';
import { ANSWER_STYLES, AnswerWords } from '../../core/answer-words';
import { BoardColours } from '../../core/board-colours';
import { FeatureFlags } from '../../core/feature-flags';
import { GAME_THEMES, getGameTheme, isGameThemeId } from '../../core/game-themes';
import { MENU_ANIMATION_CHOICES, MenuAnimation } from '../../core/menu-animation';
import { PlayerGender } from '../../core/player-gender';
import { REACTION_SIDES, Reactions } from '../../core/reactions';
import { SiteTheme } from '../../core/site-theme';
import { LANGUAGE_IDS, SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { WORD_GENDERS } from '../../i18n/word-gender';

/**
 * The site's settings, one labelled row each, inside the header's settings panel: text size, theme, game colours, and
 * (while their switches are on) answers in words, the animated menu, the stickers' side, how to be spoken to, then the
 * language. The header opens and closes the panel.
 */
@Component({
  selector: 'app-site-settings',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-settings.html',
  styleUrl: './site-settings.scss',
})
export class SiteSettings {
  /** A link in the settings went to another page, so the panel can close */
  readonly navigated = output();

  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);
  protected readonly siteLanguage = inject(SiteLanguage);
  protected readonly boardColours = inject(BoardColours);
  protected readonly answerWords = inject(AnswerWords);
  protected readonly playerGender = inject(PlayerGender);
  protected readonly reactions = inject(Reactions);
  protected readonly menuAnimation = inject(MenuAnimation);
  protected readonly features = inject(FeatureFlags);

  protected readonly languages = LANGUAGE_IDS;
  protected readonly answerStyles = ANSWER_STYLES;
  protected readonly reactionSides = REACTION_SIDES;
  protected readonly menuAnimationChoices = MENU_ANIMATION_CHOICES;
  protected readonly wordGenders = WORD_GENDERS;
  protected readonly gameThemes = GAME_THEMES;
  protected readonly selectedBoardTheme = computed(() => getGameTheme(this.boardColours.selected()));
  /** The chosen theme's colours, for the swatch beside the picker */
  protected readonly themeSwatch = computed(() => this.theme.coloursOf(this.theme.preference()));

  /** A theme's name in the picker: the site's own themes, or a palette by its board-colours name */
  protected themeName(theme: SuThemeName): string {
    const { themeNames, boardThemes } = this.siteLanguage.messages().site;
    return isSuBaseThemeName(theme) ? themeNames[theme] : boardThemes[theme].name;
  }

  protected chooseTheme(event: Event): void {
    const value = event.target instanceof HTMLSelectElement ? event.target.value : null;
    const theme = this.theme.choices.find((choice) => choice === value);
    if (theme) {
      this.theme.set(theme);
    }
  }

  protected chooseBoardColours(event: Event): void {
    if (event.target instanceof HTMLSelectElement && isGameThemeId(event.target.value)) {
      this.boardColours.set(event.target.value);
    }
  }
}
