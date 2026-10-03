# Idiomatically

[![](https://github.com/mmanela/idiomatically/workflows/Node%20CI/badge.svg)](https://github.com/mmanela/idiomatically/actions?workflow=Node+CI) [![Docker Image CI](https://github.com/mmanela/idiomatically/actions/workflows/dockerimage.yml/badge.svg?branch=release)](https://github.com/mmanela/idiomatically/actions/workflows/dockerimage.yml)

Idiomatically is a site for exploring and correlating idioms across languages and locales.

## Architecture

- React 19 and React Router 8 Framework Mode
- Server-side rendering with hydrated client-side navigation
- Express 5 serving the React application, GraphQL API, and authentication on one origin
- Apollo Server 5 and Apollo Client 4
- Better Auth with Google OAuth and MongoDB-backed sessions
- MongoDB 7
- Ant Design 6
- Vite 8 and TypeScript 7
- Playwright end-to-end characterization tests

Public idiom list and detail routes load through the GraphQL API during server rendering, so their content is present in the initial HTML. Client-side navigation continues to use React Router without full-page reloads.

## Running locally

Local development requires Node.js 22, npm, and MongoDB.

Start MongoDB with either Homebrew:

```sh
brew services start mongodb-community@7.0
```

or Docker:

```sh
cd lib
npm run db:start
```

Then start the unified application server:

```sh
cd lib
npm install
npm run dev
```

Open http://localhost:3000. Vite development middleware, React Router SSR, GraphQL, and authentication all run on that single origin.

The committed development configuration enables a local role picker for General, Contributor, and Administrator users. It exercises Better Auth sessions plus the application's real role and GraphQL authorization paths without contacting Google.

To test Google OAuth, copy `lib/.env.example.local` to `lib/.env.development.local`, set `LOCAL_AUTH_ENABLED=false`, and add Google credentials. Register these authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://idiomatically.net/api/auth/callback/google
```

Google supports localhost callbacks, so ngrok is not required.

This manual Google login is the only way to verify the complete provider
round-trip before production. The automated suite also verifies that Better
Auth creates a Google authorization request with OAuth state, PKCE, a state
cookie, and the expected callback URL.

After deploying, run the non-interactive OAuth configuration smoke check:

```sh
cd lib
npm run auth:smoke -- https://idiomatically.net
```

This checks the deployed Better Auth route and callback URL without logging in
or exposing Google credentials. Then complete one real Google login on the
deployed environment before directing users to it.

Useful commands:

```sh
npm run dev       # unified development server
npm run codegen   # regenerate GraphQL schema and typed artifacts
npm run check     # React Router type generation, TypeScript, and production build
npm run test:e2e  # isolated Chromium end-to-end suite
npm run seo:smoke -- https://idiomatically.net
npm run --silent seo:content-report -- https://idiomatically.net > seo-content.csv
npm run db:stop   # stop the Docker MongoDB service
```

The SEO smoke check validates canonical URLs, redirects, pagination errors,
structured data, and sitemap behavior against a deployed environment. The
content report produces a prioritized CSV of idioms with missing or short
descriptions, literal translations, or transliterations.

The end-to-end suite starts the application on port 3100, resets the `idiomatically-e2e` database before every test, and stores failure traces under `lib/test-results`.

## Containerized application

```sh
docker compose --profile app up --build
```

The containerized application is available at http://localhost:8000. Stop it with:

```sh
docker compose --profile app down
```

Production requires `SERVER_URL`, `DB_CONNECTION`, `MONGO_DB`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Startup fails if the public URL is not HTTPS, the Better Auth secret is too short, or Google credentials are missing/placeholders.

## Production deployment and rollback

Pushing to the `release` branch builds and publishes an immutable container
tagged with the full commit SHA. The workflow also updates the `production`
alias, but Azure deploys the immutable SHA tag so the running version is
unambiguous.

To roll back, run the **Deploy production** workflow manually against the
`release` branch and enter the full 40-character commit SHA from a previous
successful deployment as `image_tag`. The workflow verifies that image exists,
deploys it directly, and reruns the production Google authentication smoke
check.
