import { RoomGame } from '../../core/features';
import { BUILDER_LEVELS } from '../../games/letter-games';
import { OptionText, SiteMessages } from '../../i18n/site-messages';

/** A text by its id, or the id itself when unknown (an older or newer site) */
function textIn(texts: Readonly<Record<string, OptionText>>, id: string): OptionText {
  return Object.entries(texts).find(([key]) => key === id)?.[1] ?? { name: id, summary: '' };
}

function nameIn(names: Readonly<Record<string, string>>, id: string): string {
  return Object.entries(names).find(([key]) => key === id)?.[1] ?? id;
}

/** The name of the host's choice of mode in a room's settings, e.g. "Answer style" or "Game" */
export function roomModeGroup(t: SiteMessages, game: RoomGame): string {
  switch (game) {
    case 'math-games':
      return t.settings.answerStyleGroup;
    case 'measure-it':
      return t.measureIt.modeGroup;
    case 'letter-games':
      return t.letterGames.modeGroup;
    case 'sliding-puzzle':
      return t.slidingPuzzle.pictureGroup;
    case 'turn-picture':
    case 'place-pieces':
      return t.pictureGames.modeGroup;
  }
}

/** A mode's name and description, in the game's own words */
export function roomModeText(t: SiteMessages, game: RoomGame, mode: string): OptionText {
  switch (game) {
    case 'math-games':
      return textIn(t.settings.answerStyles, mode);
    case 'measure-it':
      return textIn(t.measureIt.modes, mode);
    case 'letter-games':
      return textIn(t.letterGames.modes, mode);
    case 'sliding-puzzle':
      return { name: nameIn(t.slidingPuzzle.pictureModes, mode), summary: '' };
    case 'turn-picture':
    case 'place-pieces':
      return textIn(t.pictureGames.modes, mode);
  }
}

/** A level's name and description for the chosen mode, in the game's own words */
export function roomLevelText(t: SiteMessages, game: RoomGame, mode: string, level: string): OptionText {
  switch (game) {
    case 'math-games':
      return textIn(mode === 'find-the-signs' ? t.settings.signsLevels : t.settings.levels, level);
    case 'measure-it':
      return {
        name: nameIn(t.measureIt.levels, level),
        summary: nameIn(textOfMode(t.measureIt.levelSummaries, mode), level),
      };
    case 'letter-games': {
      if (mode !== 'word-builder') {
        return textIn(t.letterGames.hints, level);
      }
      // The word builder's levels go by their number of letters
      const { name, summary } = textIn(t.letterGames.builderLevels, level);
      const letters = BUILDER_LEVELS.find(({ id }) => id === level)?.letters;
      return { name: letters ? `${name} · ${letters}` : name, summary };
    }
    case 'sliding-puzzle':
      return textIn(t.slidingPuzzle.levels, level);
    case 'turn-picture':
    case 'place-pieces':
      return textIn(t.pictureGames.levels, level);
  }
}

/** Measure it describes each level per mode */
function textOfMode(
  summaries: Readonly<Record<string, Readonly<Record<string, string>>>>,
  mode: string,
): Readonly<Record<string, string>> {
  return Object.entries(summaries).find(([key]) => key === mode)?.[1] ?? {};
}
