import { pick, Random } from '../games/random';

/**
 * Pictures for the picture games, kept in games/public/pictures/. They must be square.
 * To add one: put the file there, add its id here and its description to `pictures` in every
 * language file under i18n/ (the compiler lists any language that misses it).
 */
export type PictureId = 'family';

export interface GamePicture {
  readonly id: PictureId;
  /** Path from the site root */
  readonly src: string;
}

export const PICTURES: readonly GamePicture[] = [{ id: 'family', src: 'pictures/family.jpg' }];

/** A picture for a new game, different from the last one when there is more than one */
export function nextPicture(previous: PictureId | null, random: Random = Math.random): GamePicture {
  const others = PICTURES.filter(({ id }) => id !== previous);
  return pick(others.length > 0 ? others : PICTURES, random);
}
