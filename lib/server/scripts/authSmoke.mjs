const rawTarget = process.env.AUTH_SMOKE_URL || process.argv[2];

if (!rawTarget) {
  throw new Error(
    "Provide the deployed application URL as AUTH_SMOKE_URL or the first argument",
  );
}

const target = new URL(rawTarget);
const attempts = Number.parseInt(process.env.AUTH_SMOKE_ATTEMPTS || "1", 10);
const retryDelayMs = Number.parseInt(
  process.env.AUTH_SMOKE_RETRY_DELAY_MS || "10000",
  10,
);

let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await verifyOAuthInitiation(target);
    console.log(`Google OAuth initiation is configured for ${target.origin}`);
    console.log(
      `Callback URL: ${target.origin}/api/auth/callback/google`,
    );
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < attempts) {
      console.log(
        `OAuth smoke check attempt ${attempt}/${attempts} failed; retrying...`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

throw lastError;

async function verifyOAuthInitiation(target) {
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

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `OAuth endpoint returned ${contentType || "an unknown content type"} instead of JSON; Better Auth may not be deployed`,
    );
  }

  const result = await response.json();
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
    [
      Boolean(authorizationUrl.searchParams.get("code_challenge")),
      "PKCE challenge",
    ],
    [
      authorizationUrl.searchParams.get("code_challenge_method") === "S256",
      "PKCE S256 method",
    ],
    [
      response.headers.get("set-cookie")?.includes("idiomatically.") === true,
      "state cookie",
    ],
  ];

  const failedChecks = checks
    .filter(([passed]) => !passed)
    .map(([, description]) => description);
  if (failedChecks.length) {
    throw new Error(`OAuth smoke check failed: ${failedChecks.join(", ")}`);
  }
}
