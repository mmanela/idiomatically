# Idiomatically

[![Node CI](https://github.com/mmanela/idiomatically/actions/workflows/nodejs.yml/badge.svg)](https://github.com/mmanela/idiomatically/actions/workflows/nodejs.yml) [![Deploy production](https://github.com/mmanela/idiomatically/actions/workflows/dockerimage.yml/badge.svg?branch=release)](https://github.com/mmanela/idiomatically/actions/workflows/dockerimage.yml)

Idiomatically is a site for exploring and connecting equivalent idioms across
languages and locales. Visit the production site at
[idiomatically.net](https://idiomatically.net).

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

Public idiom list, language directory, and detail routes load through the local
GraphQL API during server rendering, so their content is present in the initial
HTML. Client-side navigation continues to use React Router without full-page
reloads. Authenticated users can propose new idioms and changes; administrators
can edit, accept, or reject those proposals.

## Running locally

Local development requires:

- Node.js 22 (`lib/.nvmrc`); `lib/package.json` requires 22.22 or later
- npm 11 (`lib/package.json` pins npm 11.6.2)
- MongoDB 7, either installed locally or run through Docker

Install the application dependencies first:

```sh
cd lib
npm ci
```

Then start MongoDB with either Homebrew:

```sh
brew services start mongodb-community@7.0
```

or Docker:

```sh
npm run db:start
```

Seed the development database and start the unified application server:

```sh
npm run db:seed
npm run dev
```

The commands after `cd lib` are intended to run from the `lib` directory.
`npm run db:seed` adds an idempotent, local-only demo dataset with connected
idioms across multiple languages. Re-running it refreshes only the seeded
records and leaves manually created idioms untouched.

Open <http://localhost:3000>. Vite development middleware, React Router SSR,
GraphQL, and authentication all run on that single origin.

The committed `lib/.env.development` configuration enables a local role picker
for General, Contributor, and Administrator users. It exercises Better Auth
sessions plus the application's real role and GraphQL authorization paths
without contacting Google.

To test Google OAuth, create a local override, set
`LOCAL_AUTH_ENABLED=false`, and add Google credentials:

```sh
cp .env.example.local .env.development.local
```

Register these authorized redirect URIs with Google:

```text
http://localhost:3000/api/auth/callback/google
https://idiomatically.net/api/auth/callback/google
```

Google supports localhost callbacks, so ngrok is not required.

This manual Google login is the only way to verify the complete provider
round-trip before production. The automated suite also verifies that Better
Auth creates a Google authorization request with OAuth state, PKCE, a state
cookie, and the expected callback URL.

After deploying, run the non-interactive authentication and SEO smoke checks:

```sh
npm run auth:smoke -- https://idiomatically.net
npm run seo:smoke -- https://idiomatically.net
```

The authentication check validates the deployed Better Auth route and callback
URL without logging in or exposing Google credentials. The SEO check validates
canonical URLs, redirects, pagination errors, structured data, and sitemap
behavior. Before directing users to a new deployment, manually sign in once
through <https://idiomatically.net/login> using a Google test account you
control. If the Google OAuth consent screen is in testing mode, add that account
as an authorized test user first. Verify that Google returns to Idiomatically,
the user is signed in, and `/me` loads successfully. New accounts receive the
General role unless their email is listed in `ADMIN_EMAILS`.

Useful commands:

```sh
npm run dev                 # unified development server
npm run codegen             # regenerate GraphQL schema and typed artifacts
npm run typecheck           # React Router type generation and TypeScript
npm run build               # production React Router build
npm run check               # typecheck followed by the production build
npm run test:e2e            # isolated Chromium end-to-end suite
npm run test:e2e:headed     # end-to-end suite with a visible browser
npm run test:e2e:report     # open the most recent Playwright HTML report
npm run auth:smoke -- https://idiomatically.net
npm run seo:smoke -- https://idiomatically.net
npm run --silent seo:content-report -- https://idiomatically.net > seo-content.csv
npm run db:stop             # stop the Docker MongoDB service
```

Install Chromium once before the first local end-to-end test run:

```sh
npx playwright install chromium
```

The content report produces a prioritized CSV of idioms with missing or short
descriptions, literal translations, or transliterations. The end-to-end suite
starts the application on port 3100, resets the `idiomatically-e2e` database
before every test, and stores failure traces and screenshots under
`lib/test-results`.

## Containers

For local development, Docker Compose is used to run MongoDB through
`npm run db:start`; the application itself runs through `npm run dev`. The
production Dockerfile is built by the deployment workflow described below.

## Configuration

Production requires:

- `SERVER_URL`: public HTTPS origin, currently `https://idiomatically.net`
- `DB_CONNECTION`: MongoDB connection string
- `MONGO_DB`: MongoDB database name
- `BETTER_AUTH_SECRET`: non-placeholder secret with at least 32 characters
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Google OAuth credentials

Optional settings include `PORT`, comma-separated `ADMIN_EMAILS`, and
`SENDGRID_API_KEY` for proposal notifications. `LOCAL_AUTH_ENABLED=true` is
available only outside production. Environment-specific files are loaded from
`lib/.env.<NODE_ENV>` and then `lib/.env.<NODE_ENV>.local`, with the local file
taking precedence.

Production startup fails if `SERVER_URL` is missing, is not a public HTTPS URL,
the Better Auth secret is missing or too short, or Google credentials are
missing or placeholders.

## Production deployment and rollback

Pushing to the `release` branch builds and publishes an immutable container
tagged with the full commit SHA. The workflow also updates the `production`
alias, deploys the immutable SHA tag to Azure, and verifies both authentication
configuration and production SEO behavior.

To roll back, run the **Deploy production** workflow manually against the
`release` branch and enter the full 40-character commit SHA from a previous
successful deployment as `image_tag`. The workflow verifies that image exists,
deploys it directly, and reruns both production smoke checks.

## Continuous integration

The **Node CI** workflow runs on every push and pull request using Node.js 22
and MongoDB 7. It installs dependencies with `npm ci`, regenerates GraphQL
artifacts and rejects uncommitted generated changes, type-checks and builds the
application, installs Chromium, and runs the end-to-end suite.
