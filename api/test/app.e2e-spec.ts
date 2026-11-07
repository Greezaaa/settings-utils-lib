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

  it('hides a word after three reports until a moderator decides', async () => {
    const report = { word: 'rudeword', language: 'en' };
    const hidden = async () =>
      (
        await request(app.getHttpServer())
          .get('/v1/word-reports/hidden?language=en')
          .expect(200)
      ).body.words;
    for (let reports = 1; reports <= 3; reports++) {
      expect(await hidden()).toEqual([]);
      await request(app.getHttpServer())
        .post('/v1/word-reports')
        .send(report)
        .expect(204);
    }
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
    await signIn('new@su-labs.dev', 'my own password').expect(201);

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
});
