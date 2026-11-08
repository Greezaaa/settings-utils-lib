# api.su-labs.dev

NestJS API for [games.su-labs.dev](https://games.su-labs.dev): anonymous play counts, feedback, word reports and
suggestions. No accounts and no personal data; visitor addresses are only held in memory by the rate limits.

## Endpoints

| Method | Path | What |
| --- | --- | --- |
| GET | `/health` | API and database are up |
| POST | `/v1/plays` | `{ game }`: one more play today |
| GET | `/v1/plays` | Plays per game in the last 30 days |
| POST | `/v1/feedback` | `{ game, vote: up\|down, reason?, language }`, preset reasons only |
| POST | `/v1/word-reports` | `{ word, language }`: report a rude word |
| GET | `/v1/word-reports/hidden?language=` | Words that don't count (approved, or reported 3+ times and pending) |
| POST | `/v1/suggestions` | Multipart: `category`, `text`, `language`, `turnstileToken?`, `image?` |

Admin sign-in (a 30-day HttpOnly session cookie): `POST /auth/login` (`{ email, password }`), `GET /auth/me`,
`POST /auth/logout`, `POST /auth/password` (`{ current, next }`), `GET`/`POST /auth/invite/:secret` (accept an invite
with `{ password }`). The super admin manages the team: `GET /admin/team`, `POST /admin/team` (`{ email, role: moderator|tester, password? }`;
without a password the answer has an invite link secret), `POST /admin/team/:id/invite`, `PATCH /admin/team/:id`
(`{ active?, role? }`), and switches games (`PUT /admin/games/:game`).

Moderation, signed in or with the backup key `Authorization: Bearer <ADMIN_TOKEN>`:
`GET /admin/feedback`, `GET /admin/word-reports?status=`, `PATCH /admin/word-reports/:language/:word`
(`{ status: approved|rejected }`), `GET /admin/suggestions?status=`, `GET /admin/suggestions/:id/image`,
`PATCH /admin/suggestions/:id` (`{ status: new|read|archived }`), `DELETE /admin/suggestions/:id`.

## Development

```bash
npm install
docker run --rm -d --name su-labs-db -p 55432:5432 -e POSTGRES_PASSWORD=dev postgres:17-alpine
DATABASE_URL=postgres://postgres:dev@localhost:55432/postgres ADMIN_TOKEN=$(openssl rand -hex 32) \
  CORS_ORIGINS=http://localhost:4310 UPLOADS_DIR=./uploads COOKIE_SECURE=false npm run start:dev
```

- `npm test`: unit tests. `TEST_DATABASE_URL=… npm run test:e2e`: the whole API against a real database (its tables
  are dropped afterwards).
- Tables only change through migrations in `src/database/migrations/`, which run when the API starts.

## Rooms (rooms.su-labs.dev)

Multiplayer rooms run as a separate process from the same code: `node dist/rooms-main.js` (`npm run start:rooms` in
development). Players connect to `wss://rooms.su-labs.dev/rooms` and send `{ event, data }` messages: `create`,
`join` (by 6-character code), `rejoin` (after a reload), `settings`, `ready`, `start`, `score`, `again`, `kick`,
`leave`. Rooms hold at most 4 players, live in memory only and store nothing about them.

## Admin team

Create the super admin on the server (or give that account a new password, printed once):

```bash
docker compose exec api node dist/cli/create-admin.js you@example.com
```

Sign in at games.su-labs.dev/crew (the address is set in games/src/app/core/links.ts) and change the password in the Account tab. Add moderators and testers in the Team tab,
with a starting password or an invite link (it works once, for 7 days). Moderators read suggestions, decide on
reported words and see plays and feedback; testers do the same and also see switched-off games and features in
preview. Only the super admin switches games and features and manages the team. `ADMIN_TOKEN` stays as a backup key for scripts.

## Server

`compose.yaml` runs the API and PostgreSQL; secrets go in `.env` on the server (see `.env.example`). From the repo
root, `npm run deploy:api` uploads this folder and rebuilds. The API listens on `127.0.0.1:3002`, reached only
through the Cloudflare Tunnel route for api.su-labs.dev.
