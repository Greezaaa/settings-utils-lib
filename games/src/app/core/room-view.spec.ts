import { describe, expect, it } from 'vitest';
import { parseRoomView } from './room-view';

const VIEW = {
  code: 'K7MPQ2',
  hostId: 'host',
  phase: 'lobby',
  settings: { game: 'math-games', mode: 'true-or-false', level: 'normal', seconds: 60, language: 'es' },
  round: null,
  players: [
    {
      id: 'host',
      nickname: { adjective: 1, animal: 2 },
      color: 3,
      ready: true,
      connected: true,
      score: 0,
      place: null,
    },
    { id: 'broken' },
  ],
  serverNow: 1000,
};

describe('parseRoomView', () => {
  it('reads a room and leaves out players that don’t have the right shape', () => {
    const view = parseRoomView(VIEW);
    expect(view?.code).toBe('K7MPQ2');
    expect(view?.players.map(({ id }) => id)).toEqual(['host']);
    expect(view?.round).toBeNull();
  });

  it('refuses a room with unknown settings or phase', () => {
    expect(parseRoomView({ ...VIEW, phase: 'party' })).toBeNull();
    expect(parseRoomView({ ...VIEW, settings: { ...VIEW.settings, seconds: 45 } })).toBeNull();
    expect(parseRoomView(null)).toBeNull();
  });
});
