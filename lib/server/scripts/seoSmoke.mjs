const rawTarget = process.env.SEO_SMOKE_URL || process.argv[2];

if (!rawTarget) {
  throw new Error(
    "Provide the deployed application URL as SEO_SMOKE_URL or the first argument",
  );
}

const target = new URL(rawTarget);

await assertPage("/", {
  status: 200,
  includes: [
    `<link rel="canonical" href="${target.origin}/"/>`,
    '"@type":"WebSite"',
  ],
});
await assertRedirect("/idioms?lang=all", "/idioms", 301);
await assertRedirect("/idioms?page=0", "/idioms", 301);
await assertRedirect("/idioms?page=abc", "/idioms", 301);
await assertPage("/idioms?page=999999", {
  status: 404,
  includes: ['<meta name="robots" content="noindex,follow"/>'],
  excludes: ['rel="canonical"'],
});
await assertPage("/missing-seo-smoke-page", {
  status: 404,
  includes: ['<meta name="robots" content="noindex,follow"/>'],
});

const sitemap = await fetchText("/sitemap.xml");
assert(sitemap.response.status === 200, "sitemap returns HTTP 200");
assert(
  sitemap.body.includes(`<loc>${target.origin}/idioms</loc>`),
  "sitemap contains the idiom directory",
);
assert(
  sitemap.body.includes(`${target.origin}/languages/`),
  "sitemap contains language directories",
);
assert(!sitemap.body.includes("?lang="), "sitemap excludes legacy lang URLs");

const idiomPath = firstSitemapPath(sitemap.body, /\/idioms\/[^<]+/);
if (idiomPath) {
  await assertPage(idiomPath, {
    status: 200,
    includes: [
      `<link rel="canonical" href="${target.origin}${idiomPath}"/>`,
      '"@type":"DefinedTerm"',
    ],
  });
}

console.log(`SEO smoke checks passed for ${target.origin}`);

async function assertRedirect(path, expectedLocation, expectedStatus) {
  const response = await fetch(new URL(path, target.origin), {
    redirect: "manual",
  });
  assert(
    response.status === expectedStatus,
    `${path} returns HTTP ${expectedStatus}`,
  );
  assert(
    response.headers.get("location") === expectedLocation,
    `${path} redirects to ${expectedLocation}`,
  );
}

async function assertPage(path, { status, includes = [], excludes = [] }) {
  const result = await fetchText(path);
  assert(result.response.status === status, `${path} returns HTTP ${status}`);
  for (const expected of includes) {
    assert(result.body.includes(expected), `${path} contains ${expected}`);
  }
  for (const unexpected of excludes) {
    assert(!result.body.includes(unexpected), `${path} excludes ${unexpected}`);
  }
}

async function fetchText(path) {
  const response = await fetch(new URL(path, target.origin), {
    redirect: "manual",
  });
  return { response, body: await response.text() };
}

function firstSitemapPath(xml, pattern) {
  const match = xml.match(pattern);
  if (!match) {
    return null;
  }
  return new URL(match[0], target.origin).pathname;
}

function assert(condition, description) {
  if (!condition) {
    throw new Error(`SEO smoke check failed: ${description}`);
  }
}
