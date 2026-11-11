import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import sharp from 'sharp';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { setUpApp } from '../src/app.setup.js';

/**
 * The whole API against a real PostgreSQL: run with TEST_DATABASE_URL pointing at an empty test database, e.g.
 * `docker run --rm -d -p 55432:5432 -e POSTGRES_PASSWORD=test postgres:17-alpine` and
 * `TEST_DATABASE_URL=postgres://postgres:test@localhost:55432/postgres npm run test:e2e`. Its tables are dropped.
 */
const databaseUrl = process.env.TEST_DATABASE_URL;
const ADMIN_TOKEN = 't'.repeat(40);
const admin = { Authorization: `Bearer ${ADMIN_TOKEN}` };

describe.runIf(databaseUrl)('API (e2e)', () => {
  let app: NestExpressApplication;
  let uploadsDir: string;

  beforeAll(async () => {
    uploadsDir = await mkdtemp(join(tmpdir(), 'su-labs-uploads-'));
    Object.assign(process.env, {
      DATABASE_URL: databaseUrl,
      ADMIN_TOKEN,
      UPLOADS_DIR: uploadsDir,
      COOKIE_SECURE: 'false',
      // Tests that sign in a lot pass their own visitor address, like Cloudflare does, to stay under the sign-in limit
      TRUST_CLOUDFLARE: 'true',
    });
    // Imported only now: the configuration reads the environment as soon as the module loads
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({
      bodyParser: false,
    });
    setUpApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.get(DataSource).dropDatabase();
    await app.close();
    await rm(uploadsDir, { recursive: true, force: true });
  });

  it('is healthy once migrated', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok' });
  });

  it('counts plays per game', async () => {
    await request(app.getHttpServer())
      .post('/v1/plays')
      .send({ game: 'letter-games' })
      .expect(204);
    await request(app.getHttpServer())
      .post('/v1/plays')
      .send({ game: 'letter-games' })
      .expect(204);
    await request(app.getHttpServer())
      .post('/v1/plays')
      .send({ game: 'chess' })
      .expect(400);
    const { body } = await request(app.getHttpServer())
      .get('/v1/plays')
      .expect(200);
    expect(body.games).toContainEqual({ game: 'letter-games', plays: 2 });
    expect(body.games).toContainEqual({ game: 'math-games', plays: 0 });
  });

  it('takes feedback with preset reasons only, and sums it up for moderators', async () => {
    const vote = {
      game: 'math-games',
      vote: 'up',
      reason: 'fun',
      language: 'es',
    };
    await request(app.getHttpServer())
      .post('/v1/feedback')
      .send(vote)
      .expect(204);
    await request(app.getHttpServer())
      .post('/v1/feedback')
      .send({ ...vote, reason: 'free text' })
      .expect(400);
    await request(app.getHttpServer()).get('/admin/feedback').expect(401);
    const { body } = await request(app.getHttpServer())
      .get('/admin/feedback')
      .set(admin)
      .expect(200);
    expect(body).toEqual([
      { game: 'math-games', up: 1, down: 0, reasons: { fun: 1 } },
    ]);
  });

  it('gives the admin team plays per period', async () => {
    await request(app.getHttpServer())
      .post('/v1/plays')
      .send({ game: 'find-pairs' })
      .expect(204);
    await request(app.getHttpServer()).get('/admin/plays').expect(401);
    for (const period of ['all', 'day', 'week', 'month', 'year']) {
      const { body } = await request(app.getHttpServer())
        .get(`/admin/plays?period=${period}`)
        .set(admin)
        .expect(200);
      expect(body).toContainEqual({ game: 'find-pairs', plays: 1 });
    }
    await request(app.getHttpServer())
      .get('/admin/plays?period=decade')
      .set(admin)
      .expect(400);
  });

  it('lets the super admin start the statistics again', async () => {
    await request(app.getHttpServer())
      .post('/v1/plays')
      .send({ game: 'find-pairs' })
      .expect(204);
    await request(app.getHttpServer()).delete('/admin/stats').expect(401);
    await request(app.getHttpServer())
      .delete('/admin/stats')
      .set(admin)
      .expect(204);
    const { body } = await request(app.getHttpServer())
      .get('/admin/plays?period=all')
      .set(admin)
      .expect(200);
    expect(body).toContainEqual({ game: 'find-pairs', plays: 0 });
    const { body: votes } = await request(app.getHttpServer())
      .get('/admin/feedback')
      .set(admin)
      .expect(200);
    expect(votes).toEqual([]);
  });

  it('hides a word after three visitors report it, until a moderator decides', async () => {
    const report = { word: 'rudeword', language: 'en' };
    const hidden = async () =>
      (
        await request(app.getHttpServer())
          .get('/v1/word-reports/hidden?language=en')
          .expect(200)
      ).body.words;
    const reportFrom = (visitor: string) =>
      request(app.getHttpServer())
        .post('/v1/word-reports')
        .set('cf-connecting-ip', visitor)
        .send(report)
        .expect(204);
    // One visitor reporting again and again counts once
    for (let reports = 1; reports <= 3; reports++) {
      await reportFrom('10.0.1.1');
    }
    expect(await hidden()).toEqual([]);
    await reportFrom('10.0.1.2');
    expect(await hidden()).toEqual([]);
    await reportFrom('10.0.1.3');
    expect(await hidden()).toEqual(['rudeword']);
    await request(app.getHttpServer())
      .patch('/admin/word-reports/en/rudeword')
      .set(admin)
      .send({ status: 'rejected' })
      .expect(204);
    expect(await hidden()).toEqual([]);
  });

  it('switches games on and off for the admin only', async () => {
    await request(app.getHttpServer()).get('/admin/check').expect(401);
    await request(app.getHttpServer())
      .get('/admin/check')
      .set(admin)
      .expect(204);
    await request(app.getHttpServer())
      .get('/v1/games')
      .expect(200, { games: [] });
    await request(app.getHttpServer())
      .put('/admin/games/hit-the-note')
      .send({ enabled: false })
      .expect(401);
    await request(app.getHttpServer())
      .put('/admin/games/chess')
      .set(admin)
      .send({ enabled: false })
      .expect(400);
    await request(app.getHttpServer())
      .put('/admin/games/hit-the-note')
      .set(admin)
      .send({ enabled: false })
      .expect(204);
    await request(app.getHttpServer())
      .put('/admin/games/hit-the-note')
      .set(admin)
      .send({ enabled: true })
      .expect(204);
    await request(app.getHttpServer())
      .get('/v1/games')
      .expect(200, { games: [{ game: 'hit-the-note', enabled: true }] });
  });

  it('signs in the super admin, who adds moderators by password or invite and turns them off', async () => {
    const { TeamService } = await import('../src/auth/team.service.js');
    const superPassword = await app
      .get(TeamService)
      .createSuperAdmin('Boss@su-labs.dev');
    const server = app.getHttpServer();
    const signIn = (email: string, password: string) =>
      request(server).post('/auth/login').send({ email, password });

    await signIn('boss@su-labs.dev', 'wrong password').expect(401);
    const boss = await signIn(' BOSS@su-labs.dev ', superPassword).expect(201);
    const bossCookie = boss.headers['set-cookie'];
    expect(String(bossCookie)).toMatch(/HttpOnly/);
    await request(server)
      .get('/auth/me')
      .set('Cookie', bossCookie)
      .expect(200, { email: 'boss@su-labs.dev', role: 'super' });

    // A moderator with a starting password
    await request(server)
      .post('/admin/team')
      .set('Cookie', bossCookie)
      .send({ email: 'mod@su-labs.dev', password: 'starting-password' })
      .expect(201);
    const mod = await signIn('mod@su-labs.dev', 'starting-password').expect(
      201,
    );
    const modCookie = mod.headers['set-cookie'];
    await request(server)
      .get('/admin/suggestions')
      .set('Cookie', modCookie)
      .expect(200);
    await request(server)
      .get('/admin/team')
      .set('Cookie', modCookie)
      .expect(403);
    await request(server)
      .put('/admin/games/math-games')
      .set('Cookie', modCookie)
      .send({ enabled: false })
      .expect(403);

    // A moderator invited by link, who chooses a password
    const invited = await request(server)
      .post('/admin/team')
      .set('Cookie', bossCookie)
      .send({ email: 'new@su-labs.dev' })
      .expect(201);
    const secret: string = invited.body.invite.secret;
    await request(server)
      .get(`/auth/invite/${secret}`)
      .expect(200, { email: 'new@su-labs.dev' });
    await request(server)
      .post(`/auth/invite/${secret}`)
      .send({ password: 'my own password' })
      .expect(201);
    await request(server)
      .post(`/auth/invite/${secret}`)
      .send({ password: 'my own password' })
      .expect(404);
    const newcomer = await signIn('new@su-labs.dev', 'my own password').expect(
      201,
    );
    const newcomerCookie = newcomer.headers['set-cookie'];

    // A new invite resets a forgotten password: accepting it signs out the browsers still on the old one
    const newcomerId = invited.body.member.id;
    const again = await request(server)
      .post(`/admin/team/${newcomerId}/invite`)
      .set('Cookie', bossCookie)
      .expect(201);
    await request(server)
      .post(`/auth/invite/${again.body.secret}`)
      .send({ password: 'a fresh password' })
      .expect(201);
    await request(server)
      .get('/admin/suggestions')
      .set('Cookie', newcomerCookie)
      .expect(401);

    // Turning a moderator off signs them out and stops sign-ins
    const team = await request(server)
      .get('/admin/team')
      .set('Cookie', bossCookie)
      .expect(200);
    const modId = team.body.find(
      (member: { email: string }) => member.email === 'mod@su-labs.dev',
    ).id;
    await request(server)
      .patch(`/admin/team/${modId}`)
      .set('Cookie', bossCookie)
      .send({ active: false })
      .expect(204);
    await request(server)
      .get('/admin/suggestions')
      .set('Cookie', modCookie)
      .expect(401);
    await signIn('mod@su-labs.dev', 'starting-password').expect(401);

    await request(server)
      .post('/auth/logout')
      .set('Cookie', bossCookie)
      .expect(204);
    await request(server).get('/auth/me').set('Cookie', bossCookie).expect(401);
  });

  it('adds testers, who moderate like moderators but switch nothing, and changes roles', async () => {
    const { TeamService } = await import('../src/auth/team.service.js');
    const superPassword = await app
      .get(TeamService)
      .createSuperAdmin('boss2@su-labs.dev');
    const server = app.getHttpServer();
    const signIn = (email: string, password: string) =>
      request(server)
        .post('/auth/login')
        .set('cf-connecting-ip', '10.0.0.2')
        .send({ email, password })
        .expect(201);
    const bossCookie = (await signIn('boss2@su-labs.dev', superPassword))
      .headers['set-cookie'];

    await request(server)
      .post('/admin/team')
      .set('Cookie', bossCookie)
      .send({
        email: 'tester@su-labs.dev',
        role: 'tester',
        password: 'tester-password',
      })
      .expect(201);
    await request(server)
      .post('/admin/team')
      .set('Cookie', bossCookie)
      .send({
        email: 'other@su-labs.dev',
        role: 'super',
        password: 'tester-password',
      })
      .expect(400);
    const testerCookie = (await signIn('tester@su-labs.dev', 'tester-password'))
      .headers['set-cookie'];
    await request(server)
      .get('/auth/me')
      .set('Cookie', testerCookie)
      .expect(200, { email: 'tester@su-labs.dev', role: 'tester' });
    await request(server)
      .get('/admin/suggestions')
      .set('Cookie', testerCookie)
      .expect(200);
    await request(server)
      .get('/admin/word-reports')
      .set('Cookie', testerCookie)
      .expect(200);
    await request(server)
      .get('/admin/feedback')
      .set('Cookie', testerCookie)
      .expect(200);
    await request(server)
      .get('/admin/team')
      .set('Cookie', testerCookie)
      .expect(403);
    await request(server)
      .put('/admin/features/rooms')
      .set('Cookie', testerCookie)
      .send({ enabled: true })
      .expect(403);
    await request(server)
      .put('/admin/games/math-games')
      .set('Cookie', testerCookie)
      .send({ enabled: false })
      .expect(403);

    const team = await request(server)
      .get('/admin/team')
      .set('Cookie', bossCookie)
      .expect(200);
    const testerId = team.body.find(
      (member: { email: string }) => member.email === 'tester@su-labs.dev',
    ).id;
    const bossId = team.body.find(
      (member: { email: string }) => member.email === 'boss2@su-labs.dev',
    ).id;
    await request(server)
      .patch(`/admin/team/${testerId}`)
      .set('Cookie', bossCookie)
      .send({ role: 'moderator' })
      .expect(204);
    await request(server)
      .get('/auth/me')
      .set('Cookie', testerCookie)
      .expect(200, { email: 'tester@su-labs.dev', role: 'moderator' });
    await request(server)
      .patch(`/admin/team/${bossId}`)
      .set('Cookie', bossCookie)
      .send({ role: 'tester' })
      .expect(403);
  });

  it('switches features on and off for the super admin only', async () => {
    const server = app.getHttpServer();
    await request(server).get('/v1/features').expect(200, { features: [] });
    await request(server)
      .put('/admin/features/rooms')
      .send({ enabled: true })
      .expect(401);
    await request(server)
      .put('/admin/features/teleport')
      .set(admin)
      .send({ enabled: true })
      .expect(400);
    await request(server)
      .put('/admin/features/rooms')
      .set(admin)
      .send({ enabled: true })
      .expect(204);
    await request(server)
      .get('/v1/features')
      .expect(200, { features: [{ feature: 'rooms', enabled: true }] });
  });

  it('keeps suggestions with a cleaned picture for moderators', async () => {
    const photo = await sharp({
      create: { width: 20, height: 20, channels: 3, background: '#ff0000' },
    })
      .withExif({ IFD0: { Make: 'Camera' } })
      .jpeg()
      .toBuffer();
    await request(app.getHttpServer())
      .post('/v1/suggestions')
      .field({
        category: 'new-game',
        text: 'A game with animals',
        language: 'es',
      })
      .attach('image', photo, 'photo.jpg')
      .expect(204);

    const { body } = await request(app.getHttpServer())
      .get('/admin/suggestions')
      .set(admin)
      .expect(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      category: 'new-game',
      text: 'A game with animals',
      status: 'new',
    });

    const image = await request(app.getHttpServer())
      .get(`/admin/suggestions/${body[0].id}/image`)
      .set(admin)
      .expect(200);
    expect((await sharp(image.body).metadata()).exif).toBeUndefined();

    await request(app.getHttpServer())
      .delete(`/admin/suggestions/${body[0].id}`)
      .set(admin)
      .expect(204);
    expect(
      (await request(app.getHttpServer()).get('/admin/suggestions').set(admin))
        .body,
    ).toEqual([]);
  });

  it('logs errors once each with a count, for the super admin to read and clear', async () => {
    const server = app.getHttpServer();
    const report = {
      code: 'js',
      title: 'TypeError',
      problem: 'x is undefined',
      path: '/find-pairs/',
    };
    for (let time = 0; time < 2; time++) {
      await request(server)
        .post('/v1/errors')
        .set('cf-connecting-ip', '10.2.0.1')
        .send(report)
        .expect(204);
    }
    await request(server)
      .post('/v1/errors')
      .set('cf-connecting-ip', '10.2.0.1')
      .send({ ...report, path: '/page?with=query' })
      .expect(400);
    await request(server).get('/admin/errors').expect(401);
    const { body } = await request(server)
      .get('/admin/errors')
      .set(admin)
      .expect(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ source: 'site', ...report, count: 2 });
    await request(server)
      .delete(`/admin/errors/${body[0].id}`)
      .set(admin)
      .expect(204);
    await request(server).get('/admin/errors').set(admin).expect(200, []);
  });

  describe('player accounts', () => {
    /** A browser of its own (keeping its cookies), from its own address so the sign-in limits don't add up */
    const browser = (address: string) => {
      const agent = request.agent(app.getHttpServer());
      return {
        agent,
        post: (path: string) =>
          agent.post(path).set('cf-connecting-ip', address),
        get: (path: string) => agent.get(path).set('cf-connecting-ip', address),
        put: (path: string) => agent.put(path).set('cf-connecting-ip', address),
        patch: (path: string) =>
          agent.patch(path).set('cf-connecting-ip', address),
        delete: (path: string) =>
          agent.delete(path).set('cf-connecting-ip', address),
      };
    };

    it('signs up with a login name, keeps names unique, and signs in on another device', async () => {
      const first = browser('10.1.0.1');
      const { body } = await first
        .post('/v1/account')
        .send({
          loginName: ' Lucia_7 ',
          password: 'a long password',
          screenName: '  Star   Cat ',
        })
        .expect(201);
      expect(body).toMatchObject({
        loginName: 'lucia_7',
        screenName: 'Star Cat',
        email: null,
        favorites: [],
        results: [],
      });
      await first.get('/v1/account').expect(200);

      const someoneElse = browser('10.1.0.2');
      await someoneElse
        .post('/v1/account')
        .send({
          loginName: 'lucia_7',
          password: 'a long password',
          screenName: 'Other',
        })
        .expect(409, /login-taken/);
      await someoneElse
        .post('/v1/account')
        .send({
          loginName: 'other',
          password: 'a long password',
          screenName: 'STAR CAT',
        })
        .expect(409, /screen-name-taken/);
      // No mail server here, so no emails either
      await someoneElse
        .post('/v1/account')
        .send({
          loginName: 'other',
          password: 'a long password',
          screenName: 'Other',
          email: 'a@b.dev',
        })
        .expect(400, /email-unavailable/);
      await someoneElse
        .get('/v1/account/options')
        .expect(200, { email: false });

      const phone = browser('10.1.0.3');
      await phone
        .post('/v1/account/login')
        .send({ loginName: 'lucia_7', password: 'wrong password' })
        .expect(401);
      await phone
        .post('/v1/account/login')
        .send({ loginName: 'LUCIA_7', password: 'a long password' })
        .expect(201);
      await phone.get('/v1/account').expect(200);
      await phone.post('/v1/account/logout').expect(204);
      await phone.get('/v1/account').expect(401);
    });

    it('keeps favourites and results, and ranks the leaderboards for signed-in players only', async () => {
      const ana = browser('10.1.1.1');
      const ben = browser('10.1.1.2');
      await ana
        .post('/v1/account')
        .send({
          loginName: 'ana',
          password: 'a long password',
          screenName: 'Ana',
          showOnLeaderboard: true,
        })
        .expect(201);
      await ben
        .post('/v1/account')
        .send({
          loginName: 'ben',
          password: 'a long password',
          screenName: 'Ben',
          showOnLeaderboard: true,
        })
        .expect(201);

      await ana
        .put('/v1/account/favorites')
        .send({ games: ['find-pairs', 'math-games'] })
        .expect(204);
      // Fewer moves is better in Find the pairs; a higher floor in Climb the tower
      for (const [player, value] of [
        [ana, 20],
        [ana, 16],
        [ben, 18],
      ] as const) {
        await player
          .post('/v1/account/results')
          .send({ game: 'find-pairs', key: 'normal', value })
          .expect(204);
      }
      await ben
        .post('/v1/account/results')
        .send({ game: 'climb-tower', key: 'which-one:easy', value: 7 })
        .expect(204);
      // Bests kept in the browser before signing in: counted when better, without plays
      await ben
        .put('/v1/account/bests')
        .send({
          bests: [{ game: 'climb-tower', key: 'which-one:easy', value: 12 }],
        })
        .expect(204);
      await ana
        .post('/v1/account/results')
        .send({ game: 'hit-the-note', key: 'x', value: 1 })
        .expect(400);

      const { body: account } = await ana.get('/v1/account').expect(200);
      expect(account.favorites).toEqual(['find-pairs', 'math-games']);
      expect(account.results).toEqual([
        { game: 'find-pairs', key: 'normal', plays: 2, best: 16 },
      ]);

      const { body: pairs } = await ana
        .get('/v1/leaderboard/find-pairs')
        .expect(200);
      expect(pairs.boards).toEqual([
        {
          key: 'normal',
          entries: [
            { place: 1, screenName: 'Ana', plays: 2, best: 16, isMe: true },
            { place: 2, screenName: 'Ben', plays: 1, best: 18, isMe: false },
          ],
        },
      ]);
      const { body: tower } = await ana
        .get('/v1/leaderboard/climb-tower')
        .expect(200);
      expect(tower.boards[0].entries[0]).toMatchObject({
        screenName: 'Ben',
        plays: 1,
        best: 12,
      });
      await request(app.getHttpServer())
        .get('/v1/leaderboard/find-pairs')
        .expect(401);

      // A player who stops showing on the leaderboards leaves them, and is back when they choose to show again
      await ben
        .patch('/v1/account')
        .send({ showOnLeaderboard: false })
        .expect(204);
      expect(
        (await ben.get('/v1/account').expect(200)).body.showOnLeaderboard,
      ).toBe(false);
      const { body: hidden } = await ana
        .get('/v1/leaderboard/find-pairs')
        .expect(200);
      expect(
        hidden.boards[0].entries.map(
          ({ screenName }: { screenName: string }) => screenName,
        ),
      ).toEqual(['Ana']);
      await ben
        .patch('/v1/account')
        .send({ showOnLeaderboard: true })
        .expect(204);

      // A player deletes their results and keeps the account
      await ana.delete('/v1/account/results').expect(204);
      expect((await ana.get('/v1/account').expect(200)).body.results).toEqual(
        [],
      );
      const { body: after } = await ana
        .get('/v1/leaderboard/find-pairs')
        .expect(200);
      expect(after.boards[0].entries).toEqual([
        { place: 1, screenName: 'Ben', plays: 1, best: 18, isMe: false },
      ]);
    });

    it('changes the screen name and password, resets a forgotten one, and deletes the account', async () => {
      const kid = browser('10.1.2.1');
      await kid
        .post('/v1/account')
        .send({
          loginName: 'kid',
          password: 'a long password',
          screenName: 'Kid',
        })
        .expect(201);
      // Nobody shows on the leaderboards without choosing it
      expect(
        (await kid.get('/v1/account').expect(200)).body.showOnLeaderboard,
      ).toBe(false);
      await kid
        .patch('/v1/account')
        .send({ screenName: 'Ana' })
        .expect(409, /screen-name-taken/);
      await kid.patch('/v1/account').send({ screenName: 'Rocket' }).expect(204);
      await kid
        .post('/v1/account/password')
        .send({ current: 'wrong', next: 'new long password' })
        .expect(401);
      await kid
        .post('/v1/account/password')
        .send({ current: 'a long password', next: 'new long password' })
        .expect(204);
      expect((await kid.get('/v1/account').expect(200)).body.screenName).toBe(
        'Rocket',
      );
      // Always the same answer, whether or not an account has that email
      await kid
        .post('/v1/account/forgot')
        .send({ email: 'nobody@su-labs.dev' })
        .expect(204);

      // A reset link (sent by email when a mail server is set up)
      const { hashToken } = await import('../src/auth/passwords.js');
      const secret = 'r'.repeat(43);
      await app
        .get(DataSource)
        .query(
          `UPDATE players SET reset_hash = $1, reset_expires = now() + interval '1 hour' WHERE login_name = 'kid'`,
          [hashToken(secret)],
        );
      const other = browser('10.1.2.2');
      await other
        .post(`/v1/account/reset/${secret}`)
        .send({ password: 'reset long password' })
        .expect(201);
      await other
        .post(`/v1/account/reset/${secret}`)
        .send({ password: 'reset long password' })
        .expect(404);
      // The reset signed out the browser still on the old password
      await kid.get('/v1/account').expect(401);

      await other.delete('/v1/account').send({ password: 'wrong' }).expect(401);
      await other
        .delete('/v1/account')
        .send({ password: 'reset long password' })
        .expect(204);
      await browser('10.1.2.3')
        .post('/v1/account/login')
        .send({ loginName: 'kid', password: 'reset long password' })
        .expect(401);
    });
  });

  it("sends the moderators' lists a page at a time", async () => {
    await app.get(DataSource).query(
      `INSERT INTO word_reports (language, word, reports, "firstReported")
         SELECT 'es', 'page' || i, 1, '2026-01-01' FROM generate_series(1, 5) i`,
    );
    const page = (offset: number) =>
      request(app.getHttpServer())
        .get(`/admin/word-reports?status=pending&offset=${offset}&limit=2`)
        .set(admin)
        .expect(200);
    const words = [
      ...(await page(0)).body,
      ...(await page(2)).body,
      ...(await page(4)).body,
    ]
      .map(({ word }: { word: string }) => word)
      .filter((word: string) => word.startsWith('page'));
    expect(words).toEqual(['page1', 'page2', 'page3', 'page4', 'page5']);
    await request(app.getHttpServer())
      .get('/admin/word-reports?limit=201')
      .set(admin)
      .expect(400);
  });
});
