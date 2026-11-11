import { describe, expect, it } from 'vitest';
import { answersFor, getHowManyLevel, HOW_MANY_ROUNDS, howManyRounds, thingPlaces } from './how-many';
import { seededRandom } from './random';

describe('how many', () => {
  it('asks numbers from 1 to the level’s most', () => {
    expect(answersFor(getHowManyLevel('easy'))).toEqual([1, 2, 3]);
    expect(answersFor(getHowManyLevel('normal'))).toEqual([1, 2, 3, 4, 5]);
    expect(answersFor(getHowManyLevel('hard'))).toHaveLength(7);
    expect(answersFor(getHowManyLevel('expert'))).toHaveLength(10);
  });

  it('never repeats the count or the thing of the round before', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const rounds = howManyRounds(getHowManyLevel('normal'), seededRandom(seed));
      expect(rounds).toHaveLength(HOW_MANY_ROUNDS);
      rounds.forEach((round, index) => {
        expect(round.count).toBeGreaterThanOrEqual(1);
        expect(round.count).toBeLessThanOrEqual(5);
        if (index > 0) {
          expect(round.count).not.toBe(rounds[index - 1].count);
          expect(round.thing).not.toBe(rounds[index - 1].thing);
        }
      });
    }
  });

  it('places each thing with a small tilt, one after another', () => {
    const places = thingPlaces(4, seededRandom(3));
    expect(places.map(({ delayMs }) => delayMs)).toEqual([0, 180, 360, 540]);
    expect(places.every(({ rotate, lift }) => Math.abs(rotate) <= 12 && Math.abs(lift) <= 12)).toBe(true);
  });
});
