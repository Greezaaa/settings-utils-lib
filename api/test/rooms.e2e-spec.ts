import type { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import { WebSocket } from 'ws';

const ORIGIN = 'https://games.su-labs.dev';
const ROOM_NAME_SECRET = 'n'.repeat(40);

class Client {
  readonly socket: WebSocket;
  private readonly messages: {
    event: string;
    data: Record<string, unknown>;
  }[] = [];

  constructor(url: string, origin = ORIGIN, ip?: string) {
    this.socket = new WebSocket(url, {
      origin,
      headers: ip ? { 'cf-connecting-ip': ip } : {},
    });
    this.socket.on('message', (raw) =>
      this.messages.push(JSON.parse(raw.toString())),
    );
  }

  open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.once('open', () => resolve());
      this.socket.once('error', reject);
    });
  }

  send(event: string, data: object = {}): void {
    this.socket.send(JSON.stringify({ event, data }));
  }

  async next(
    event: string,
    test: (data: Record<string, unknown>) => boolean = () => true,
    timeoutMs = 2000,
  ) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const index = this.messages.findIndex(
        (message) => message.event === event && test(message.data),
      );
      if (index !== -1) {
        return this.messages.splice(index, 1)[0].data;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error(`No "${event}" message`);
  }
}

const phase = (name: string) => (data: Record<string, unknown>) =>
  data['phase'] === name;
const playerCount = (count: number) => (data: Record<string, unknown>) =>
  Array.isArray(data['players']) && data['players'].length === count;

describe('rooms service (e2e)', () => {
  let app: INestApplication;
  let url: string;
  const clients: Client[] = [];

  const connect = async (origin?: string, ip?: string) => {
    const client = new Client(url, origin, ip);
    clients.push(client);
    await client.open();
    return client;
  };

  beforeAll(async () => {
    Object.assign(process.env, {
      CORS_ORIGINS: ORIGIN,
      PORT: '3999',
      TRUST_CLOUDFLARE: 'true',
      ROOM_NAME_SECRET,
    });
    const { RoomsModule } = await import('../src/rooms/rooms.module.js');
    const moduleRef = await Test.createTestingModule({
      imports: [RoomsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(0);
    const address = app.getHttpServer().address();
    url = `ws://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}/rooms`;
  });

  afterAll(async () => {
    clients.forEach((client) => client.socket.close());
    await app.close();
  });

  it('refuses connections from other sites', async () => {
    const stranger = new Client(url, 'https://evil.example');
    const closed = new Promise<number>((resolve) =>
      stranger.socket.on('close', (code) => resolve(code)),
    );
    expect(await closed).toBe(1008);
  });

  it('shows an approved name only when the host turns names on, and anyone can hide it', async () => {
    const { signNamePass } = await import('../src/shared/name-pass.js');
    const names = (data: Record<string, unknown>) =>
      Array.isArray(data['players'])
        ? data['players'].map((player: { name: string | null }) => player.name)
        : [];
    const settings = {
      game: 'math-games',
      mode: 'true-or-false',
      level: 'normal',
      seconds: 60,
      language: 'es',
    };

    const host = await connect(undefined, '10.8.0.1');
    host.send('create', {
      language: 'es',
      namePass: signNamePass('Lucía', ROOM_NAME_SECRET),
    });
    const code = String((await host.next('joined'))['code']);
    const guest = await connect(undefined, '10.8.0.2');
    guest.send('join', {
      code,
      namePass: signNamePass('Rude', 'x'.repeat(40)),
    });
    await guest.next('joined');
    await host.next('room', playerCount(2));

    host.send('settings', { ...settings, ownNames: true });
    const shown = await guest.next('room', (data) => names(data)[0] !== null);
    expect(names(shown)).toEqual(['Lucía', null]);

    guest.send('hide-name', { playerId: String(shown['hostId']) });
    expect(
      names(
        await host.next(
          'room',
          (data) => names(data).length === 2 && names(data)[0] === null,
        ),
      ),
    ).toEqual([null, null]);
  });

  it('plays a round: create, join by code, settings, ready, start, scores, results', async () => {
    const host = await connect();
    host.send('create', { language: 'es' });
    const joined = await host.next('joined');
    const code = String(joined['code']);
    expect(code).toMatch(/^[A-Z2-9]{6}$/);

    const guest = await connect();
    guest.send('join', { code: code.toLowerCase() });
    const guestJoined = await guest.next('joined');
    await host.next('room', playerCount(2));

    guest.send('settings', {
      game: 'math-games',
      mode: 'your-answer',
      level: 'easy',
      seconds: 30,
      language: 'es',
    });
    expect(await guest.next('error')).toEqual({ error: 'not-host' });
    host.send('settings', {
      game: 'math-games',
      mode: 'your-answer',
      level: 'easy',
      seconds: 30,
      language: 'es',
    });
    await guest.next(
      'room',
      (data) => (data['settings'] as { seconds: number }).seconds === 30,
    );

    host.send('start');
    expect(await host.next('error')).toEqual({ error: 'not-ready' });
    host.send('ready', { ready: true });
    guest.send('ready', { ready: true });
    await host.next('room', (data) =>
      (data['players'] as { ready: boolean }[]).every(({ ready }) => ready),
    );
    host.send('start');
    const countdown = await guest.next('room', phase('countdown'));
    const round = countdown['round'] as {
      seed: number;
      startsAt: number;
      endsAt: number;
    };
    expect(round.endsAt - round.startsAt).toBe(30_000);

    await guest.next('room', phase('playing'), 5000);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    guest.send('score', { score: 3 });
    host.send('score', { score: 2 });
    const scored = await host.next('room', (data) =>
      (data['players'] as { id: string; score: number }[]).some(
        ({ id, score }) => id === guestJoined['playerId'] && score === 3,
      ),
    );
    expect(JSON.stringify(scored)).not.toContain(String(joined['token']));
  }, 15_000);

  it('keeps a seat for a reload, and tells a wrong code apart', async () => {
    const host = await connect();
    host.send('create', { language: 'en' });
    const joined = await host.next('joined');
    host.socket.close();

    const again = await connect();
    again.send('rejoin', { code: joined['code'], token: joined['token'] });
    const rejoined = await again.next('joined');
    expect(rejoined['playerId']).toBe(joined['playerId']);

    const stranger = await connect();
    stranger.send('join', { code: 'ZZZZZZ' });
    expect(await stranger.next('error')).toEqual({ error: 'not-found' });
    stranger.send('join', { code: 'not a code' });
    expect(await stranger.next('error')).toEqual({ error: 'invalid' });
  });

  it('takes at most 4 players', async () => {
    const host = await connect();
    host.send('create', { language: 'en' });
    const code = String((await host.next('joined'))['code']);
    for (let index = 0; index < 3; index++) {
      const player = await connect();
      player.send('join', { code });
      await player.next('joined');
    }
    const fifth = await connect();
    fifth.send('join', { code });
    expect(await fifth.next('error')).toEqual({ error: 'full' });
  });

  it('gives up the old seat when a connection joins again, leaving no ghost player', async () => {
    const host = await connect();
    host.send('create', { language: 'en' });
    const code = String((await host.next('joined'))['code']);
    const guest = await connect();
    for (let index = 0; index < 3; index++) {
      guest.send('join', { code });
      await guest.next('joined');
    }
    for (let index = 0; index < 2; index++) {
      const other = await connect();
      other.send('join', { code });
      await other.next('joined');
    }
  });

  it('passes a sticker on to everyone in the room, one every 1.5 s, and only known ones', async () => {
    const host = await connect();
    host.send('create', { language: 'en' });
    const joined = await host.next('joined');
    const guest = await connect();
    guest.send('join', { code: joined['code'] });
    await guest.next('joined');

    host.send('react', { reaction: 'love' });
    const sticker = { playerId: joined['playerId'], reaction: 'love' };
    expect(await guest.next('reaction')).toEqual(sticker);
    expect(await host.next('reaction')).toEqual(sticker);

    host.send('react', { reaction: 'laugh' });
    await expect(guest.next('reaction', () => true, 300)).rejects.toThrow();

    guest.send('react', { reaction: 'kiss' });
    expect(await guest.next('error')).toEqual({ error: 'invalid' });
  });

  it('lets one visitor keep only a few rooms open, so nobody can take them all', async () => {
    const { MAX_ROOMS_PER_VISITOR } =
      await import('../src/rooms/rooms.gateway.js');
    for (let index = 0; index < MAX_ROOMS_PER_VISITOR; index++) {
      const host = await connect(ORIGIN, '10.9.0.1');
      host.send('create', { language: 'en' });
      await host.next('joined');
    }
    const oneTooMany = await connect(ORIGIN, '10.9.0.1');
    oneTooMany.send('create', { language: 'en' });
    expect(await oneTooMany.next('error')).toEqual({ error: 'too-many' });
  });

  it('closes connections beyond the per-visitor limit', async () => {
    const { MAX_CONNECTIONS_PER_VISITOR } =
      await import('../src/rooms/rooms.gateway.js');
    for (let index = 0; index < MAX_CONNECTIONS_PER_VISITOR; index++) {
      await connect(ORIGIN, '10.9.0.2');
    }
    const extra = new Client(url, ORIGIN, '10.9.0.2');
    clients.push(extra);
    const closed = new Promise<number>((resolve) =>
      extra.socket.on('close', (code) => resolve(code)),
    );
    expect(await closed).toBe(1008);
  });
});
