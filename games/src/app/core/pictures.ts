import { pick, Random } from '../games/random';

export type PictureId = 'family';

export interface GamePicture {
  readonly id: PictureId;
  readonly src: string;
}

export const PICTURES: readonly GamePicture[] = [{ id: 'family', src: 'pictures/family.jpg' }];

export function nextPicture(previous: PictureId | null, random: Random = Math.random): GamePicture {
  const others = PICTURES.filter(({ id }) => id !== previous);
  return pick(others.length > 0 ? others : PICTURES, random);
}
