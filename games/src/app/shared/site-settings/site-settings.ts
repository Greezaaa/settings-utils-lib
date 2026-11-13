import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontSizeService } from '@su-labs/font-size';
import { isSuBaseThemeName, SuThemeName } from '@su-labs/theme';
import { ANSWER_STYLES, AnswerWords } from '../../core/answer-words';
import { BoardColours } from '../../core/board-colours';
import { AppInstall } from '../../core/app-install';
import { FeatureFlags } from '../../core/feature-flags';
import { GAME_THEMES, getGameTheme, isGameThemeId } from '../../core/game-themes';
import { MENU_ANIMATION_CHOICES, MenuAnimation } from '../../core/menu-animation';
import { OFFLINE_CHOICES, OfflineMode } from '../../core/offline-mode';
import { PlayerGender } from '../../core/player-gender';
import { REACTION_SIDES, Reactions, STICKER_DRAG_CHOICES } from '../../core/reactions';
import { SiteTheme } from '../../core/site-theme';
import { LANGUAGE_IDS, SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { WORD_GENDERS } from '../../i18n/word-gender';

@Component({
  selector: 'app-site-settings',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-settings.html',
  styleUrl: './site-settings.scss',
})
export class SiteSettings {
  readonly navigated = output();

  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);
  protected readonly siteLanguage = inject(SiteLanguage);
  protected readonly boardColours = inject(BoardColours);
  protected readonly answerWords = inject(AnswerWords);
  protected readonly playerGender = inject(PlayerGender);
  protected readonly reactions = inject(Reactions);
  protected readonly menuAnimation = inject(MenuAnimation);
  protected readonly offlineMode = inject(OfflineMode);
  protected readonly appInstall = inject(AppInstall);
  protected readonly features = inject(FeatureFlags);

  protected readonly languages = LANGUAGE_IDS;
  protected readonly answerStyles = ANSWER_STYLES;
  protected readonly reactionSides = REACTION_SIDES;
  protected readonly stickerDragChoices = STICKER_DRAG_CHOICES;
  protected readonly menuAnimationChoices = MENU_ANIMATION_CHOICES;
  protected readonly offlineChoices = OFFLINE_CHOICES;
  protected readonly wordGenders = WORD_GENDERS;
  protected readonly gameThemes = GAME_THEMES;
  protected readonly selectedBoardTheme = computed(() => getGameTheme(this.boardColours.selected()));
  protected readonly themeSwatch = computed(() => this.theme.coloursOf(this.theme.preference()));

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
