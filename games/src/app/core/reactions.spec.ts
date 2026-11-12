import { dockAt, isReaction, reactionPicture, REACTIONS } from './reactions';

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

describe('dockAt', () => {
  it('puts stickers dropped low on the screen in a row at the bottom, and the others on the nearer edge', () => {
    expect(dockAt(200, 700, 375, 812)).toBe('bottom');
    expect(dockAt(40, 300, 375, 812)).toBe('left');
    expect(dockAt(300, 300, 375, 812)).toBe('right');
  });
});
