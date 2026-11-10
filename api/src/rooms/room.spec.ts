import {
  advance,
  canStart,
  CODE_ALPHABET,
  COUNTDOWN_MS,
  createRoom,
  join,
  MAX_PLAYERS,
  newCode,
  newPlayer,
  places,
  playAgain,
  removePlayer,
  reportScore,
  Room,
  SCORE_GRACE_MS,
  setReady,
  setSettings,
  startRound,
  viewOf,
} from './room.js';

/** Always the same "random" numbers */
const counter = () => {
  let next = 0;
  return (max: number) => next++ % max;
};

function roomWith(players: number): Room {
  const random = counter();
  const host = newPlayer([], random);
  const room = createRoom('ABC234', host, 'es', 0);
  for (let index = 1; index < players; index++) {
    join(room, newPlayer(room.players, random), 0);
  }
  return room;
}

describe('a player’s choice to be spoken to as a boy or a girl', () => {
  it('gives a girl an animal whose name is feminine, a boy a masculine one, while one is free', () => {
    const girl = newPlayer([], counter(), 'girl');
    expect([9, 11, 13, 15]).toContain(girl.nickname.animal);
    expect(girl.gender).toBe('girl');
    const boy = newPlayer([], counter(), 'boy');
    expect([9, 11, 13, 15]).not.toContain(boy.nickname.animal);
    expect(newPlayer([]).gender).toBeNull();
  });

  it('falls back to any free animal when every fitting one is taken', () => {
    const girls = [0, 1, 2, 3].map(() => newPlayer([], counter(), 'girl'));
    const taken = [9, 11, 13, 15].map((animal, index) => ({
      ...girls[index],
      nickname: { ...girls[index].nickname, animal },
    }));
    const fifth = newPlayer(taken, counter(), 'girl');
    expect([9, 11, 13, 15]).not.toContain(fifth.nickname.animal);
  });

  it('shows each player’s choice in the room’s view', () => {
    const room = createRoom(
      'ABCDEF',
      newPlayer([], counter(), 'girl'),
      'es',
      0,
    );
    expect(viewOf(room, 0).players[0].gender).toBe('girl');
  });
});

describe('rooms', () => {
  it('makes short codes from letters and digits that are hard to mix up, never twice', () => {
    const code = newCode(new Set());
    expect(code).toMatch(new RegExp(`^[${CODE_ALPHABET}]{6}$`));
    expect(code).not.toMatch(/[0O1IL]/);
    const random = counter();
    const first = newCode(new Set(), random);
    expect(newCode(new Set([first]), counter())).not.toBe(first);
  });

  it('gives every player a different nickname and colour', () => {
    const room = roomWith(MAX_PLAYERS);
    const nicknames = room.players.map(
      ({ nickname }) => `${nickname.adjective}-${nickname.animal}`,
    );
    expect(new Set(nicknames).size).toBe(MAX_PLAYERS);
    expect(new Set(room.players.map(({ color }) => color)).size).toBe(
      MAX_PLAYERS,
    );
  });

  it('takes at most 4 players, and nobody while a round is on', () => {
    const room = roomWith(MAX_PLAYERS);
    expect(join(room, newPlayer(room.players), 0)).toBe('full');
    const small = roomWith(2);
    small.phase = 'playing';
    expect(join(small, newPlayer(small.players), 0)).toBe('in-game');
  });

  it('lets only the host change the settings, and asks everyone to confirm again', () => {
    const room = roomWith(2);
    const [host, guest] = room.players;
    setReady(room, guest.id, true, 0);
    expect(
      setSettings(room, guest.id, { ...room.settings, seconds: 30 }, 0),
    ).toBe('not-host');
    expect(
      setSettings(room, host.id, { ...room.settings, seconds: 30 }, 0),
    ).toBeNull();
    expect(room.settings.seconds).toBe(30);
    expect(guest.ready).toBe(false);
  });

  it('starts only when at least 2 connected players are all ready', () => {
    const room = roomWith(3);
    const [host, second, third] = room.players;
    setReady(room, host.id, true, 0);
    setReady(room, second.id, true, 0);
    expect(canStart(room)).toBe(false);
    third.connected = false;
    expect(canStart(room)).toBe(true);
    expect(startRound(room, second.id, 0, 7)).toBe('not-host');
    expect(startRound(room, host.id, 1000, 7)).toBeNull();
    expect(room.round).toEqual({
      seed: 7,
      startsAt: 1000 + COUNTDOWN_MS,
      endsAt: 1000 + COUNTDOWN_MS + 60_000,
    });
    expect(roomWith(1).players.length).toBe(1);
    expect(canStart(roomWith(1))).toBe(false);
  });

  it('runs a round: countdown, playing, plausible scores, results with places', () => {
    const room = roomWith(3);
    room.players.forEach((player) => setReady(room, player.id, true, 0));
    startRound(room, room.hostId, 0, 1);
    const [first, second, third] = room.players;
    const round = room.round;
    if (!round) {
      throw new Error('The round should have started');
    }
    const { startsAt, endsAt } = round;

    reportScore(room, first.id, 5, startsAt - 1);
    expect(first.score).toBe(0);
    expect(advance(room, startsAt)).toBe(true);
    expect(room.phase).toBe('playing');

    reportScore(room, first.id, 1000, startsAt + 2000);
    expect(first.score).toBe(6);
    reportScore(room, first.id, 12, startsAt + 10_000);
    reportScore(room, first.id, 3, startsAt + 11_000);
    expect(first.score).toBe(12);
    reportScore(room, second.id, 12, startsAt + 10_000);
    reportScore(room, third.id, 4, startsAt + 10_000);

    expect(advance(room, endsAt)).toBe(false);
    expect(advance(room, endsAt + SCORE_GRACE_MS)).toBe(true);
    expect(room.phase).toBe('results');
    expect(places(room.players)).toEqual(
      new Map([
        [first.id, 1],
        [second.id, 1],
        [third.id, 3],
      ]),
    );
    expect(viewOf(room, 0).players.map(({ place }) => place)).toEqual([
      1, 1, 3,
    ]);

    expect(playAgain(room, room.hostId, 0)).toBeNull();
    expect(room.phase).toBe('lobby');
  });

  it('hands the room to the next connected player when the host leaves', () => {
    const room = roomWith(3);
    const [host, second, third] = room.players;
    second.connected = false;
    removePlayer(room, host.id, 0);
    expect(room.hostId).toBe(third.id);
  });

  it('never shows the players’ tokens', () => {
    const room = roomWith(2);
    expect(JSON.stringify(viewOf(room, 0))).not.toContain(
      room.players[0].token,
    );
  });

  it('hides scores during the round when the host turns them off, and shows them in the results', () => {
    const room = roomWith(2);
    setSettings(room, room.hostId, { ...room.settings, showScores: false }, 0);
    room.players.forEach((player) => setReady(room, player.id, true, 0));
    startRound(room, room.hostId, 0, 1);
    const round = room.round;
    if (!round) {
      throw new Error('The round should have started');
    }
    advance(room, round.startsAt);
    reportScore(room, room.players[0].id, 3, round.startsAt + 5000);
    expect(viewOf(room, 0).players.map(({ score }) => score)).toEqual([0, 0]);
    advance(room, round.endsAt + SCORE_GRACE_MS);
    expect(viewOf(room, 0).players.map(({ score }) => score)).toEqual([3, 0]);
  });
});
