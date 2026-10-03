import { expressMiddleware } from "@as-integrations/express5";
import { createRequestHandler } from "@react-router/express";
import { toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import { SitemapStream, streamToPromise } from "sitemap";
import { createAuth, getLocalIdentity } from "./auth";
import { createGraphqlRuntime, getCurrentUser } from "./graphql";
import { initializeJobs, stopJobs } from "./jobScheduler";
import { renderIdiomSocialImage } from "./socialImage";
import { getLanguagePath } from "../src/utilities/languagePath";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
dotenv.config({ path: `.env.${process.env.NODE_ENV}.local`, override: true });

const isProduction = process.env.NODE_ENV === "production";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;
const databaseName = process.env.MONGO_DB || "idiomatically";
const databaseConnection = process.env.DB_CONNECTION || "mongodb://localhost:27017";
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const localAuthEnabled =
  !isProduction && process.env.LOCAL_AUTH_ENABLED === "true";

const mongoClient = new MongoClient(databaseConnection);
await mongoClient.connect();
const database = mongoClient.db(databaseName);
const auth = createAuth({
  client: mongoClient,
  database,
  serverUrl,
  adminEmails,
  localAuthEnabled,
});
const { dataProviders, server: apolloServer } = createGraphqlRuntime({
  auth,
  database,
  isProduction,
  adminEmails,
});

await initializeJobs(dataProviders, adminEmails);
await apolloServer.start();

export const app = express();

app.disable("x-powered-by");
app.get("/service-worker.js", (req, res) => {
  res.set({
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/javascript; charset=utf-8",
    "Service-Worker-Allowed": "/",
  });
  res.send(`
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.all(clients.map((client) => client.navigate("/")));
  })());
});
`);
});
app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/hello", async (req, res) => {
  const currentUser = await getCurrentUser(
    auth,
    dataProviders,
    requestHeaders(req),
    adminEmails,
  );
  res.send(
    currentUser
      ? `Welcome back, ${currentUser.name}`
      : "Welcome to Idiomatically!",
  );
});

app.get("/login", async (req, res, next) => {
  try {
    const returnTo = safeReturnPath(req.query.returnTo);
    const currentSession = await auth.api.getSession({
      headers: requestHeaders(req),
    });
    if (currentSession) {
      return res.redirect(returnTo);
    }

    if (localAuthEnabled) {
      const encodedReturnPath = encodeURIComponent(returnTo);
      return res.send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Local sign in</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 480px; margin: 64px auto; padding: 0 24px; }
              a { display: block; margin: 12px 0; padding: 12px 16px; color: white; background: #1677ff; border-radius: 6px; text-align: center; text-decoration: none; }
            </style>
          </head>
          <body>
            <h1>Local sign in</h1>
            <p>Choose a role to test the authenticated experience.</p>
            <a href="/auth/local?role=GENERAL&returnTo=${encodedReturnPath}">General user</a>
            <a href="/auth/local?role=CONTRIBUTOR&returnTo=${encodedReturnPath}">Contributor</a>
            <a href="/auth/local?role=ADMIN&returnTo=${encodedReturnPath}">Administrator</a>
          </body>
        </html>
      `);
    }

    const result = await auth.api.signInSocial({
      returnHeaders: true,
      headers: requestHeaders(req),
      body: {
        provider: "google",
        callbackURL: returnTo,
      },
    });
    appendSetCookieHeaders(res, result.headers);
    return res.redirect(result.response.url);
  } catch (error) {
    next(error);
  }
});

app.get("/auth/local", async (req, res, next) => {
  try {
    if (!localAuthEnabled) {
      return res.sendStatus(404);
    }

    const identity = getLocalIdentity(String(req.query.role || ""));
    if (!identity) {
      return res.status(400).send("Invalid local role");
    }

    const existingUser = await database
      .collection("authUser")
      .findOne({ email: identity.email });
    const response = existingUser
      ? await auth.api.signInEmail({
          asResponse: true,
          headers: requestHeaders(req),
          body: {
            email: identity.email,
            password: identity.password,
          },
        })
      : await auth.api.signUpEmail({
          asResponse: true,
          headers: requestHeaders(req),
          body: identity,
        });

    if (!response.ok) {
      return res
        .status(response.status)
        .send(await response.text());
    }

    appendSetCookieHeaders(res, response.headers);
    return res.redirect(safeReturnPath(req.query.returnTo));
  } catch (error) {
    next(error);
  }
});

app.post("/logout", async (req, res, next) => {
  try {
    const response = await auth.api.signOut({
      asResponse: true,
      headers: requestHeaders(req),
    });
    appendSetCookieHeaders(res, response.headers);
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(apolloServer, {
    context: async ({ req }) => ({
      dataProviders,
      currentUser: await getCurrentUser(
        auth,
        dataProviders,
        requestHeaders(req),
        adminEmails,
      ),
    }),
  }),
);

app.get("/social/idioms/:slug.png", async (req, res, next) => {
  try {
    const idiom = await dataProviders.idiom.getIdiom(
      { slug: req.params.slug },
      { expandEquivalents: true, expandUsers: false },
    );
    if (!idiom) {
      return res.sendStatus(404);
    }

    const image = await renderIdiomSocialImage(idiom);
    res.set({
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "image/png",
    });
    return res.send(image);
  } catch (error) {
    next(error);
  }
});

app.get("/sitemap.xml", async (req, res) => {
  const sitemapStream = new SitemapStream({ hostname: serverUrl });
  const idioms = await dataProviders.idiom.getAllIdioms();
  const languages = await dataProviders.idiom.getLanguagesWithIdioms();
  const latestIdiomDate = latestDate(idioms.map((idiom) => idiom.lastModifiedDate));
  const languageLastModified = new Map(
    languages.map((language) => [
      language.languageKey,
      latestDate(
        idioms
          .filter((idiom) => idiom.languageKey === language.languageKey)
          .map((idiom) => idiom.lastModifiedDate),
      ),
    ]),
  );

  sitemapStream.write({ url: "/", priority: 1, lastmod: latestIdiomDate });
  sitemapStream.write({ url: "/about", priority: 0.8 });
  sitemapStream.write({ url: "/partners", priority: 0.6 });
  sitemapStream.write({
    url: "/idioms",
    priority: 0.9,
    lastmod: latestIdiomDate,
  });
  for (const idiom of idioms) {
    sitemapStream.write({
      url: `/idioms/${idiom.slug}`,
      priority: 0.8,
      lastmod: idiom.lastModifiedDate.toISOString(),
    });
  }
  for (const language of languages) {
    sitemapStream.write({
      url: getLanguagePath(language.languageName),
      priority: 0.7,
      lastmod: languageLastModified.get(language.languageKey),
    });
  }
  sitemapStream.end();

  const sitemap = await streamToPromise(sitemapStream);
  res.set({
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Content-Type": "application/xml; charset=utf-8",
  });
  return res.send(sitemap);
});

function latestDate(dates: Date[]) {
  return dates.reduce<Date | undefined>(
    (latest, candidate) =>
      !latest || candidate > latest ? candidate : latest,
    undefined,
  );
}

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
  }),
);

function requestHeaders(req: express.Request) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(name, entry);
      }
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return headers;
}

function appendSetCookieHeaders(
  res: express.Response,
  headers: Headers,
) {
  for (const cookie of headers.getSetCookie()) {
    res.append("Set-Cookie", cookie);
  }
}

function safeReturnPath(value: unknown) {
  const candidate = typeof value === "string" ? value : "/";
  try {
    const parsed = new URL(candidate, serverUrl);
    return parsed.origin === serverUrl ? `${parsed.pathname}${parsed.search}` : "/";
  } catch {
    return "/";
  }
}

async function shutdown() {
  stopJobs();
  await apolloServer.stop();
  await mongoClient.close();
}

process.once("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});
process.once("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});
