# Star Wars Character Archive (MERN + TypeScript)

A full MERN-stack app: a React + TypeScript frontend for browsing Star Wars characters from [swapi.info](https://swapi.info/api/people), backed by an Express + MongoDB API that provides real JWT authentication (with silent refresh) and a per-user favorites list.

> **Screenshots:** add screenshots of the grid, hover state, and the character modal here before submitting.
>
> ```md
> ![Character grid](docs/screenshot-grid.png)
> ![Character modal](docs/screenshot-modal.png)
> ```


## Stack

| Layer | Tech |
| --- | --- |
| **M**ongoDB | Mongoose models for `User`, `RefreshToken`, `Favorite` |
| **E**xpress | REST API for auth + favorites, in `server/` |
| **R**eact | Character grid, search/filter, modal, in `src/` |
| **N**ode | Runs the Express API |
| + TypeScript | End to end, both client and server |

## Repo layout

This is two npm projects in one repo: the React app at the root, and the API in `server/`.

```
sw-character-app/
  src/                    # React + TypeScript frontend (Vite)
    api/                  # fetch clients: swapi.ts, authApi.ts, favoritesApi.ts
    components/
    context/AuthContext.tsx
    hooks/                # useSwapiData, useFavorites
    ...
  server/                 # Express + TypeScript + MongoDB backend
    src/
      models/             # User, RefreshToken, Favorite (Mongoose)
      controllers/        # auth.controller.ts, favorites.controller.ts
      routes/
      services/token.service.ts   # JWT sign/verify, refresh-token hashing
      middleware/auth.ts  # requireAuth
      scripts/seed.ts     # creates the demo login user
```

## Features

- **Character grid** fetched from `/people`, species-colored cards with a hover animation.
- **Client-side pagination.** swapi.info returns its full collection in one response (no `?page=` support), so pagination happens client-side, 12 characters per page.
- **Loading and error states**, with a retry action if the API is unreachable.
- **Character modal**: name, height (m), mass (kg), birth year, film count, date added to the archive (`dd-MM-yyyy`), plus homeworld name, climate, terrain, and resident count.
- **Search and filters** by name, species, film, and homeworld — combinable.
- **Real JWT authentication** against the Express/Mongo backend, with a working login/logout UI and genuine silent refresh (see below).
- **Favorites**, backed by MongoDB: star a character while logged in, filter the grid to "Favorites only."
- **Integration test** verifying the modal opens with the correct character's data.

## Getting started

You need a MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Backend (`server/`)

```bash
cd server
cp .env.example .env       # then fill in MONGO_URI and JWT secrets
npm install
npm run seed                # creates the demo user: lukeskywalker / force123
npm run dev                 # starts the API on http://localhost:4000
```

Other backend scripts: `npm run build` (compile), `npm run start` (run compiled output), `npm run test` (JWT service unit tests), `npm run typecheck`.

### 2. Frontend (repo root)

```bash
cp .env.example .env        # VITE_API_URL defaults to http://localhost:4000, override if needed
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Other frontend scripts: `npm run build`, `npm run test`, `npm run test:watch`, `npm run lint`.

Run both `npm run dev` commands side by side (two terminals) for local development.

## Data notes

- `swapi.info/api/people` (and `/planets`, `/films`, `/species`) each return their **entire** collection in one call — there's no real server-side paging on this mirror. The frontend fetches all four collections once on load, cross-references them locally, and paginates/filters entirely in the browser.
- Character portraits use [Picsum Photos](https://picsum.photos/), seeded per character ID so each character keeps a stable image across re-renders. Since Picsum returns unrelated stock photography, each portrait gets a duotone "holo-scan" treatment (grayscale + a species-accent color wash + scanline overlay) so it reads as a stylized in-archive scan rather than a literal, mismatched photo.
- Card color is derived from the character's first listed species (defaulting to "Human" when the array is empty, matching SWAPI's convention).

## Authentication & favorites (real backend)

Unlike a purely client-side mock, this login flow talks to a real Express API:

- Demo credentials (seeded via `npm run seed`): **username** `lukeskywalker`, **password** `force123`.
- `POST /api/auth/login` verifies the bcrypt-hashed password and returns a short-lived **access token** (15 min by default) and a longer-lived **refresh token** (7 days), both real signed JWTs (`jsonwebtoken`, HS256).
- Refresh tokens are never stored in the database in plaintext — only a SHA-256 hash of the token's unique id (`jti`), with a MongoDB TTL index so expired records clean themselves up automatically.
- `POST /api/auth/refresh` **rotates** the refresh token: the old one is marked revoked and a new pair is issued. If a revoked or expired refresh token is replayed, the request is rejected.
- The frontend's `AuthContext` decodes the access token's `exp` (no signature check needed client-side — only the server needs to trust it) and schedules a silent refresh a few seconds before it expires, so a logged-in session renews itself transparently.
- Favorites (`/api/favorites`) require a valid access token via `Authorization: Bearer <token>` and are scoped per-user in MongoDB.

## Testing

- Frontend: `src/test/format.test.ts` (unit tests for formatting) and `src/test/CharacterModal.integration.test.tsx` (mocks `fetch` for the SWAPI collections, renders the full `App`, clicks a character card, and asserts the modal shows that character's correct data, then verifies it closes).
- Backend: `server/src/test/token.service.test.ts` covers JWT signing/verification and refresh-token hashing.

## Deployment

**Frontend (Netlify or Vercel)**

1. Push to GitHub, import the repo, framework preset "Vite".
2. Build command `npm run build`, output directory `dist`.
3. Set `VITE_API_URL` to your deployed API's URL.

**Backend (Render, Railway, Fly.io, or similar Node host)**

1. Point the service at the `server/` directory.
2. Build command `npm run build`, start command `npm run start`.
3. Set `MONGO_URI` (e.g. a MongoDB Atlas connection string), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CORS_ORIGIN` (your deployed frontend's URL) as environment variables.
4. Run `npm run seed` once against the deployed database (e.g. via the host's one-off command runner) to create the demo user.

## Known trade-offs

- SWAPI's `species` field is empty for most Human characters by convention, so species filtering defaults empty arrays to "Human" rather than "Unknown."
- Reference data (people/planets/films/species) loads up front in a handful of parallel requests rather than true incremental paging — a reasonable trade-off given the mirror's response shape.
- Access/refresh token TTLs (15m / 7d) are configurable via `server/.env` — shorten them locally if you want to see the silent-refresh cycle fire more often while testing.
