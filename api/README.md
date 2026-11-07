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

Moderation, with `Authorization: Bearer <ADMIN_TOKEN>`:
`GET /admin/feedback`, `GET /admin/word-reports?status=`, `PATCH /admin/word-reports/:language/:word`
(`{ status: approved|rejected }`), `GET /admin/suggestions?status=`, `GET /admin/suggestions/:id/image`,
`PATCH /admin/suggestions/:id` (`{ status: new|read|archived }`), `DELETE /admin/suggestions/:id`.

## Development

```bash
npm install
docker run --rm -d --name su-labs-db -p 55432:5432 -e POSTGRES_PASSWORD=dev postgres:17-alpine
DATABASE_URL=postgres://postgres:dev@localhost:55432/postgres ADMIN_TOKEN=$(openssl rand -hex 32) \
  CORS_ORIGINS=http://localhost:4310 UPLOADS_DIR=./uploads npm run start:dev
```

- `npm test`: unit tests. `TEST_DATABASE_URL=… npm run test:e2e`: the whole API against a real database (its tables
  are dropped afterwards).
- Tables only change through migrations in `src/database/migrations/`, which run when the API starts.

## Server

`compose.yaml` runs the API and PostgreSQL; secrets go in `.env` on the server (see `.env.example`). From the repo
root, `npm run deploy:api` uploads this folder and rebuilds. The API listens on `127.0.0.1:3002`, reached only
through the Cloudflare Tunnel route for api.su-labs.dev.
