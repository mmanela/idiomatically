export {};

const rawTarget = process.env.AUTH_SMOKE_URL || process.argv[2];

if (!rawTarget) {
  throw new Error(
    "Provide the deployed application URL as AUTH_SMOKE_URL or the first argument",
  );
}

const target = new URL(rawTarget);
const endpoint = new URL("/api/auth/sign-in/social", target.origin);
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: target.origin,
  },
  body: JSON.stringify({
    provider: "google",
    callbackURL: "/",
    disableRedirect: true,
  }),
});

if (!response.ok) {
  throw new Error(
    `OAuth initiation failed with ${response.status}: ${await response.text()}`,
  );
}

const result = (await response.json()) as {
  redirect?: boolean;
  url?: string;
};
if (!result.url) {
  throw new Error("OAuth initiation did not return an authorization URL");
}

const authorizationUrl = new URL(result.url);
const expectedCallback = `${target.origin}/api/auth/callback/google`;
const checks = [
  [
    authorizationUrl.origin === "https://accounts.google.com",
    "Google authorization host",
  ],
  [
    authorizationUrl.searchParams.get("redirect_uri") === expectedCallback,
    `callback URL (${expectedCallback})`,
  ],
  [Boolean(authorizationUrl.searchParams.get("client_id")), "Google client ID"],
  [Boolean(authorizationUrl.searchParams.get("state")), "OAuth state"],
  [Boolean(authorizationUrl.searchParams.get("code_challenge")), "PKCE challenge"],
  [
    authorizationUrl.searchParams.get("code_challenge_method") === "S256",
    "PKCE S256 method",
  ],
  [response.headers.get("set-cookie")?.includes("idiomatically.") === true, "state cookie"],
] as const;

const failedChecks = checks
  .filter(([passed]) => !passed)
  .map(([, description]) => description);
if (failedChecks.length) {
  throw new Error(`OAuth smoke check failed: ${failedChecks.join(", ")}`);
}

console.log(`Google OAuth initiation is configured for ${target.origin}`);
console.log(`Callback URL: ${expectedCallback}`);
