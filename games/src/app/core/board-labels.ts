import { OptionText, SiteMessages } from '../i18n/site-messages';
import { formatTime } from '../shared/game-clock';
import { ResultGame } from './player-results';

type OptionTexts = Readonly<Record<string, OptionText>>;

const KEY_PARTS: Readonly<Record<ResultGame, (t: SiteMessages) => readonly OptionTexts[]>> = {
  'math-games': (t) => [t.settings.answerStyles, t.settings.timers, t.settings.levels],
  'climb-tower': (t) => [t.climbTower.modes, t.settings.levels],
  'find-pairs': (t) => [t.findPairs.levels],
  'sliding-puzzle': (t) => [t.slidingPuzzle.levels],
  'turn-picture': (t) => [t.pictureGames.modes, t.pictureGames.levels],
  'place-pieces': (t) => [t.pictureGames.modes, t.pictureGames.levels],
};

const nameOf = (texts: OptionTexts | undefined, part: string): string =>
  Object.entries(texts ?? {}).find(([id]) => id === part)?.[1].name ?? part;

export function boardLabel(t: SiteMessages, game: ResultGame, key: string): string {
  const texts = KEY_PARTS[game](t);
  return key
    .split(':')
    .map((part, index) => nameOf(texts[index], part))
    .join(' · ');
}

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
