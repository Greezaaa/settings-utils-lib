import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SuSwitchComponent } from '@su-labs/fields';
import { FontSizeService } from '@su-labs/font-size';
import { isSuBaseThemeName, SuThemeName } from '@su-labs/theme';
import { ANSWER_STYLES, AnswerWords } from '../../core/answer-words';
import { BoardColours } from '../../core/board-colours';
import { AppInstall } from '../../core/app-install';
import { AppUpdate } from '../../core/app-update';
import { FeatureFlags } from '../../core/feature-flags';
import { GAME_THEMES, getGameTheme, isGameThemeId } from '../../core/game-themes';
import { byTone, TONES } from '../../core/theme-tone';
import { MENU_ANIMATION_CHOICES, MenuAnimation } from '../../core/menu-animation';
import { OFFLINE_CHOICES, OfflineMode } from '../../core/offline-mode';
import { PlayerGender } from '../../core/player-gender';
import { REACTION_SIDES, Reactions, STICKER_DRAG_CHOICES } from '../../core/reactions';
import { SETTING_IDS, SettingId, SettingsMenu } from '../../core/settings-menu';
import { SiteMotion } from '../../core/site-motion';
import { SiteTheme } from '../../core/site-theme';
import { LANGUAGE_IDS, SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';
import { WORD_GENDERS } from '../../i18n/word-gender';

export type SettingsPlace = 'menu' | 'page';

const SMALL_SCREENS_ONLY: readonly SettingId[] = ['reaction-side', 'sticker-drag'];

@Component({
  selector: 'app-site-settings',
  imports: [TranslatePipe, RouterLink, SuSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-settings.html',
  styleUrl: './site-settings.scss',
  host: { '[class.is-page]': "place() === 'page'" },
})
export class SiteSettings {
  readonly place = input<SettingsPlace>('menu');
  readonly navigated = output();

  protected readonly theme = inject(SiteTheme);
  protected readonly fontSize = inject(FontSizeService);
  protected readonly motion = inject(SiteMotion);
  protected readonly siteLanguage = inject(SiteLanguage);
  protected readonly boardColours = inject(BoardColours);
  protected readonly answerWords = inject(AnswerWords);
  protected readonly playerGender = inject(PlayerGender);
  protected readonly reactions = inject(Reactions);
  protected readonly menuAnimation = inject(MenuAnimation);
  protected readonly offlineMode = inject(OfflineMode);
  protected readonly appInstall = inject(AppInstall);
  protected readonly appUpdate = inject(AppUpdate);
  protected readonly features = inject(FeatureFlags);
  protected readonly settingsMenu = inject(SettingsMenu);

  protected readonly languages = LANGUAGE_IDS;
  protected readonly answerStyles = ANSWER_STYLES;
  protected readonly reactionSides = REACTION_SIDES;
  protected readonly stickerDragChoices = STICKER_DRAG_CHOICES;
  protected readonly menuAnimationChoices = MENU_ANIMATION_CHOICES;
  protected readonly offlineChoices = OFFLINE_CHOICES;
  protected readonly wordGenders = WORD_GENDERS;
  protected readonly tones = TONES;
  protected readonly gameThemesByTone = byTone(GAME_THEMES, ({ palette }) => palette.background);
  protected readonly siteThemesByTone = byTone(
    this.theme.choices.filter((choice) => choice !== 'system'),
    (choice) => this.theme.coloursOf(choice).background,
  );
  protected readonly selectedBoardTheme = computed(() => getGameTheme(this.boardColours.selected()));
  protected readonly themeSwatch = computed(() => this.theme.coloursOf(this.theme.preference()));

  private readonly isOffered: Record<SettingId, () => boolean> = {
    'text-size': () => true,
    'reduce-motion': () => true,
    theme: () => true,
    'board-colours': () => true,
    'answer-style': () => this.answerWords.isAvailable(),
    'menu-animation': () => this.menuAnimation.isAvailable(),
    'offline-play': () => this.offlineMode.isAvailable(),
    install: () => this.appInstall.isAvailable(),
    'reaction-side': () => this.reactions.isAvailable(),
    'sticker-drag': () => this.reactions.isAvailable() && this.reactions.canChooseDrag(),
    'word-gender': () => this.playerGender.isAvailable(),
    language: () => true,
    version: () => this.appUpdate.isAvailable(),
  };

  protected readonly settings = computed(() =>
    SETTING_IDS.filter((id) => this.isOffered[id]() && (this.place() === 'page' || this.settingsMenu.showsInMenu(id))),
  );

  protected readonly versionStatus = computed(() => {
    const state = this.appUpdate.state();
    if (state === 'ready') {
      return this.appUpdate.isCritical() ? 'critical' : 'update';
    }
    return state === 'latest' ? 'latest' : 'unknown';
  });

  protected readonly versionText = computed(() => {
    const { upToDate, checkFailed, newVersion, criticalVersion } = this.siteLanguage.messages().site;
    const latest = this.appUpdate.latest() ?? '';
    switch (this.versionStatus()) {
      case 'latest':
        return upToDate;
      case 'update':
        return newVersion(latest);
      case 'critical':
        return criticalVersion(latest);
      default:
        return this.appUpdate.state() === 'failed' ? checkFailed : '';
    }
  });

  protected isSmallScreensOnly(id: SettingId): boolean {
    return this.place() === 'menu' && SMALL_SCREENS_ONLY.includes(id);
  }

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
