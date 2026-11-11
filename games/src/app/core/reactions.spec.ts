import { isReaction, reactionPicture, REACTIONS } from './reactions';

describe('room stickers', () => {
  it('knows the 7 hand-drawn stickers, and nothing else', () => {
    expect(REACTIONS).toHaveLength(7);
    expect(isReaction('laugh')).toBe(true);
    expect(isReaction('kiss')).toBe(false);
    expect(isReaction(null)).toBe(false);
  });

  it('finds each sticker’s picture', () => {
    expect(reactionPicture('love')).toBe('/reactions/love.webp');
  });
});
