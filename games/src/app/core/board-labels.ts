import { OptionText, SiteMessages } from '../i18n/site-messages';
import { formatTime } from '../shared/game-clock';
import { ResultGame } from './player-results';

type OptionTexts = Readonly<Record<string, OptionText>>;

/** The texts naming each part of a game's settings key, in key order (e.g. math games: answer style, timer, level) */
const KEY_PARTS: Readonly<Record<ResultGame, (t: SiteMessages) => readonly OptionTexts[]>> = {
  'math-games': (t) => [t.settings.answerStyles, t.settings.timers, t.settings.levels],
  'climb-tower': (t) => [t.climbTower.modes, t.settings.levels],
  'find-pairs': (t) => [t.findPairs.levels],
  'sliding-puzzle': (t) => [t.slidingPuzzle.levels],
  'turn-picture': (t) => [t.pictureGames.modes, t.pictureGames.levels],
  'place-pieces': (t) => [t.pictureGames.modes, t.pictureGames.levels],
};

/** The name of a setting in a key, or the part itself when unknown */
const nameOf = (texts: OptionTexts | undefined, part: string): string =>
  Object.entries(texts ?? {}).find(([id]) => id === part)?.[1].name ?? part;

/** A leaderboard's title from its settings key, e.g. `which-one:normal` → `Which one · Normal` */
export function boardLabel(t: SiteMessages, game: ResultGame, key: string): string {
  const texts = KEY_PARTS[game](t);
  return key
    .split(':')
    .map((part, index) => nameOf(texts[index], part))
    .join(' · ');
}

/** A best result as the game shows it: points, a floor, moves or a time */
export function bestText(t: SiteMessages, game: ResultGame, value: number): string {
  switch (game) {
    case 'math-games':
      return t.rooms.points(value);
    case 'climb-tower':
      return t.climbTower.floors(value);
    case 'find-pairs':
      return t.findPairs.moves(value);
    case 'sliding-puzzle':
      return t.slidingPuzzle.moves(value);
    case 'turn-picture':
    case 'place-pieces':
      return formatTime(value);
  }
}
