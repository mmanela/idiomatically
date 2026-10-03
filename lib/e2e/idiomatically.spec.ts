import { expect, Page, test } from '@playwright/test';
import { MongoClient } from 'mongodb';

const appUrl = 'http://localhost:3100';
const graphqlUrl = `${appUrl}/graphql`;

test.beforeEach(async () => {
  const client = await MongoClient.connect('mongodb://localhost:27017');

  try {
    await client.db('idiomatically-e2e').dropDatabase();
  } finally {
    await client.close();
  }
});

async function loginAs(page: Page, role: 'General user' | 'Contributor' | 'Administrator') {
  await page.goto(`${appUrl}/login?returnTo=/`);
  await page.getByRole('link', { name: role }).click();
  await expect(page).toHaveURL('http://localhost:3100/');
  await waitForHydration(page);
}

async function waitForHydration(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true', {
    timeout: 15_000
  });
}

async function waitForRoute(page: Page, route: string) {
  await expect(page.locator('html')).toHaveAttribute('data-route', route, {
    timeout: 15_000
  });
}

async function gotoHydrated(page: Page, url: string) {
  await page.goto(url);
  await waitForHydration(page);
  const parsedUrl = new URL(url, appUrl);
  await waitForRoute(page, `${parsedUrl.pathname}${parsedUrl.search}`);
}

async function logout(page: Page) {
  await page.goto('/me');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
}

async function graphql<T>(page: Page, query: string, variables: Record<string, unknown> = {}) {
  const response = await page.request.post(graphqlUrl, {
    data: { query, variables }
  });
  expect(response.ok()).toBeTruthy();
  return await response.json() as { data?: T; errors?: Array<{ message: string }> };
}

async function createEnglishIdiomViaApi(page: Page, title: string, description: string) {
  const result = await graphql<{
    createIdiom: { status: string; idiom?: { id: string; slug: string; title: string } };
  }>(page, `
    mutation CreateTestIdiom($title: String!, $description: String!) {
      createIdiom(idiom: {
        title: $title,
        description: $description,
        languageKey: "en",
        countryKeys: ["AG"]
      }) {
        status
        idiom { id slug title }
      }
    }
  `, { title, description });

  expect(result.errors).toBeUndefined();
  expect(result.data?.createIdiom.status).toBe('SUCCESS');
  return result.data!.createIdiom.idiom!;
}

type IdiomInput = {
  title: string;
  description: string;
  languageSearch: string;
  languageDisplay: string;
  countrySearch: string;
  countryDisplay: string;
  literalTranslation?: string;
};

async function addIdiom(page: Page, idiom: IdiomInput) {
  if (new URL(page.url()).pathname !== '/new') {
    await page.getByRole('button', { name: 'Add an idiom' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Add an Idiom' })).toBeVisible();

  const form = page.locator('form');
  await page.getByRole('textbox', { name: /Idiom \(In the language's own alphabet\)/ }).fill(idiom.title);
  const languageInput = form.locator('.ant-form-item').filter({ hasText: /^Language/ }).getByRole('combobox');
  await languageInput.evaluate((element: HTMLInputElement) => element.focus());
  await page.keyboard.type(idiom.languageSearch);
  await page.getByText(idiom.languageDisplay, { exact: true }).click();
  const countryInput = form.locator('.ant-form-item').filter({ hasText: /^Country/ }).getByRole('combobox');
  await countryInput.evaluate((element: HTMLInputElement) => element.focus());
  await page.keyboard.type(idiom.countrySearch);
  await expect(page.getByText(idiom.countryDisplay, { exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(form.getByText(idiom.countrySearch, { exact: false })).toBeVisible();
  if (idiom.literalTranslation) {
    await page.getByRole('textbox', { name: /Literal Translation/ }).fill(idiom.literalTranslation);
  }
  await page.locator('.mde-text').fill(idiom.description);
  await page.getByRole('button', { name: 'Submit' }).click();
}

async function addEnglishIdiom(page: Page, title: string, description: string) {
  await addIdiom(page, {
    title,
    description,
    languageSearch: 'English',
    languageDisplay: 'English (English)',
    countrySearch: 'Antigua',
    countryDisplay: 'Antigua and Barbuda (Antigua and Barbuda)'
  });
}

test('public navigation is readable and consistently spaced', async ({ page }) => {
  await gotoHydrated(page, '/');

  await expect(page.locator('#root > .container')).toBeVisible();
  await expect.poll(async () => {
    const currentLayout = await readLayout(page);
    return currentLayout.background;
  }, { timeout: 15_000 }).toBe('rgb(230, 236, 240)');
  const layout = await readLayout(page);
  expect(layout.background).toBe('rgb(230, 236, 240)');
  expect(layout.bodyMargin).toBe('0px');
  expect(layout.container.width).toBe(800);
  expect(layout.container.x).toBeGreaterThan(0);
  expect(layout.mainTop).toBeGreaterThanOrEqual(layout.headerBottom - 1);
  expect(layout.footerTop).toBeGreaterThanOrEqual(layout.mainBottom - 1);
  expect(layout.title.fontFamily).toContain('Lucida Sans');
  expect(layout.title.fontSize).toBe(42);
  expect(layout.title.fontWeight).toBe('500');
  expect(layout.title.marginTop).toBe('0px');
  expect(layout.subtitle.fontWeight).toBe('500');
  expect(layout.subtitle.marginTop).toBe('0px');
  expect(layout.subtitle.top).toBeCloseTo(layout.title.bottom + 2, 0);
  expect(layout.navigation.top).toBeCloseTo(layout.subtitle.bottom + 15, 0);
  expect(layout.searchControls.top).toBeCloseTo(layout.navigation.bottom, 0);
  expect(layout.searchControls.width).toBe(700);
  expect(layout.languageSelectWidth).toBeGreaterThanOrEqual(100);
  expect(layout.languageSelectWidth).toBeLessThanOrEqual(220);
  expect(layout.languageSelectorBackground).toBe('rgb(24, 144, 255)');
  expect(layout.homeLinkColor).toBe('rgba(0, 0, 0, 0.65)');
  expect(layout.searchButtonRightRadius).toEqual({ bottom: '0px', top: '0px' });

  await expect(page.getByRole('searchbox', { name: 'Find an idiom' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Language' })).toBeVisible();

  for (const name of ['Home', 'About', 'Partners', 'Login']) {
    const link = page.getByRole('link', { name });
    await expect(link).toBeVisible();
    const linkGap = await link.evaluate(element =>
      Number.parseFloat(window.getComputedStyle(element).columnGap)
    );
    expect(linkGap).toBeGreaterThan(0);
  }
});

test('server-rendered page is styled before JavaScript hydration', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  try {
    await page.goto(appUrl);
    await expect(page.locator('#root > .container')).toBeVisible();
    const firstPaint = await readLayout(page);
    expect(firstPaint.background).toBe('rgb(230, 236, 240)');
    expect(firstPaint.bodyMargin).toBe('0px');
    expect(firstPaint.container.width).toBe(800);
    expect(firstPaint.title.fontSize).toBe(42);
    expect(firstPaint.navigation.height).toBe(47);
    expect(firstPaint.searchControls.height).toBeCloseTo(40, 0);
    expect(firstPaint.mainTop).toBeCloseTo(firstPaint.headerBottom, 0);
  } finally {
    await context.close();
  }
});

async function readLayout(page: Page) {
  return page.evaluate(() => {
    const container = document.querySelector('#root > .container')!.getBoundingClientRect();
    const header = document.querySelector('header.ant-layout-header')!.getBoundingClientRect();
    const main = document.querySelector('main')!.getBoundingClientRect();
    const footer = document.querySelector('footer.mainFooter')!.getBoundingClientRect();
    const title = document.querySelector('header .siteTitle')!;
    const subtitle = document.querySelector('header h2')!;
    const navigation = document.querySelector('.navCommandBar')!.getBoundingClientRect();
    const searchControls = document.querySelector('.idiomSearchControls')!.getBoundingClientRect();
    const languageSelect = document.querySelector('.languageSelect')!.getBoundingClientRect();
    const languageSelector = document.querySelector('.languageSelect')!;
    const homeLink = document.querySelector('.navCommandBar a')!;
    const searchButton = document.querySelector('.ant-input-search-btn')!;
    const titleStyles = window.getComputedStyle(title);
    const subtitleStyles = window.getComputedStyle(subtitle);
    const searchButtonStyles = window.getComputedStyle(searchButton);
    return {
      background: window.getComputedStyle(document.body).backgroundColor,
      bodyMargin: window.getComputedStyle(document.body).margin,
      container: { x: container.x, width: container.width },
      headerBottom: header.bottom,
      mainTop: main.top,
      mainBottom: main.bottom,
      footerTop: footer.top,
      title: {
        bottom: title.getBoundingClientRect().bottom,
        fontFamily: titleStyles.fontFamily,
        fontSize: Number.parseFloat(titleStyles.fontSize),
        fontWeight: titleStyles.fontWeight,
        marginTop: titleStyles.marginTop
      },
      subtitle: {
        bottom: subtitle.getBoundingClientRect().bottom,
        fontWeight: subtitleStyles.fontWeight,
        marginTop: subtitleStyles.marginTop,
        top: subtitle.getBoundingClientRect().top
      },
      navigation: {
        bottom: navigation.bottom,
        height: navigation.height,
        top: navigation.top
      },
      searchControls: {
        height: searchControls.height,
        top: searchControls.top,
        width: searchControls.width
      },
      languageSelectWidth: languageSelect.width,
      languageSelectorBackground: window.getComputedStyle(languageSelector).backgroundColor,
      homeLinkColor: window.getComputedStyle(homeLink).color,
      searchButtonRightRadius: {
        bottom: searchButtonStyles.borderBottomRightRadius,
        top: searchButtonStyles.borderTopRightRadius
      }
    };
  });
}

test('anonymous users are sent to local sign in before adding an idiom', async ({ page }) => {
  await page.goto('/new');

  await expect(page).toHaveURL(`${appUrl}/login?returnTo=/new`);
  await expect(page.getByRole('link', { name: 'General user' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contributor' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administrator' })).toBeVisible();
});

test('Better Auth generates a valid Google OAuth request', async ({ page }) => {
  const response = await page.request.post('/api/auth/sign-in/social', {
    data: {
      provider: 'google',
      callbackURL: '/me',
      disableRedirect: true
    },
    headers: {
      Origin: appUrl
    }
  });

  expect(response.ok()).toBeTruthy();
  const result = await response.json() as {
    redirect: boolean;
    url: string;
  };
  const authorizationUrl = new URL(result.url);

  expect(result.redirect).toBe(false);
  expect(authorizationUrl.origin).toBe('https://accounts.google.com');
  expect(authorizationUrl.searchParams.get('client_id')).toBe('e2e-disabled');
  expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(
    `${appUrl}/api/auth/callback/google`
  );
  expect(authorizationUrl.searchParams.get('state')).toBeTruthy();
  expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
  expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe('S256');
  expect(response.headers()['set-cookie']).toContain('idiomatically.');
});

test('sitemap reflects newly created idioms without a server restart', async ({ page }) => {
  const initialResponse = await page.request.get('/sitemap.xml', {
    headers: { 'Accept-Encoding': 'identity' }
  });
  expect(initialResponse.ok()).toBeTruthy();
  expect(initialResponse.headers()['content-type']).toContain('application/xml');
  expect(initialResponse.headers()['content-encoding']).toBeUndefined();
  expect(initialResponse.headers()['cache-control']).toBe(
    'public, max-age=0, must-revalidate'
  );
  const initialSitemap = await initialResponse.text();
  expect(initialSitemap).toContain('<loc>http://localhost:3100/idioms</loc>');
  expect(initialSitemap).toContain('<loc>http://localhost:3100/partners</loc>');
  expect(initialSitemap).not.toContain('/idioms/fresh-from-the-sitemap');

  await loginAs(page, 'Administrator');
  await createEnglishIdiomViaApi(
    page,
    'Fresh from the sitemap',
    'An entry created after the sitemap was first requested.'
  );

  const updatedResponse = await page.request.get('/sitemap.xml');
  expect(updatedResponse.ok()).toBeTruthy();
  const updatedSitemap = await updatedResponse.text();
  expect(updatedSitemap).toContain(
    '<loc>http://localhost:3100/idioms/fresh-from-the-sitemap</loc>'
  );
  expect(updatedSitemap).toMatch(
    /<lastmod>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z<\/lastmod>/
  );
  expect(updatedSitemap).toContain(
    '<loc>http://localhost:3100/languages/english/idioms</loc>'
  );
  expect(updatedSitemap).toMatch(
    /<loc>http:\/\/localhost:3100\/idioms<\/loc><lastmod>[^<]+<\/lastmod>/
  );
  expect(updatedSitemap).toMatch(
    /<loc>http:\/\/localhost:3100\/languages\/english\/idioms<\/loc><lastmod>[^<]+<\/lastmod>/
  );

  const robotsResponse = await page.request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  expect(await robotsResponse.text()).toContain(
    'Sitemap: https://idiomatically.net/sitemap.xml'
  );
});

test('local authentication supports role selection and logout', async ({ browser, page }) => {
  await page.goto(`${appUrl}/login?returnTo=/me`);
  await expect(page.getByRole('link', { name: 'General user' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contributor' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administrator' })).toBeVisible();

  await page.getByRole('link', { name: 'Administrator' }).click();
  await expect(page).toHaveURL('http://localhost:3100/me');
  await expect(page.getByRole('heading', { name: 'Local admin' })).toBeVisible();
  await expect(page.getByText('Ardent Admin')).toBeVisible();

  const serverRenderedContext = await browser.newContext({
    javaScriptEnabled: false,
    storageState: await page.context().storageState()
  });
  const serverRenderedPage = await serverRenderedContext.newPage();
  await serverRenderedPage.goto(appUrl);
  await expect(serverRenderedPage.getByRole('button', { name: 'Add an idiom' })).toBeVisible();
  await expect(serverRenderedPage.getByRole('link', { name: 'Local admin' })).toBeVisible();
  await expect(serverRenderedPage.getByRole('link', { name: 'Login' })).toHaveCount(0);
  await serverRenderedContext.close();

  for (const navigationItem of [
    page.getByRole('button', { name: 'Add an idiom' }),
    page.getByRole('link', { name: 'Local admin' })
  ]) {
    const gap = await navigationItem.evaluate(element =>
      Number.parseFloat(window.getComputedStyle(element).columnGap)
    );
    expect(gap).toBe(6);
  }
  const navigationCenters = await page.evaluate(() => {
    const home = document.querySelector('.navCommandBar a')!.getBoundingClientRect();
    const user = document.querySelector('.userMenuItem a')!.getBoundingClientRect();
    const avatar = document.querySelector('.userMenuItem .profileImage')!.getBoundingClientRect();
    return {
      avatar: avatar.top + avatar.height / 2,
      home: home.top + home.height / 2,
      user: user.top + user.height / 2
    };
  });
  expect(navigationCenters.user).toBeCloseTo(navigationCenters.home, 0);
  expect(navigationCenters.avatar).toBeCloseTo(navigationCenters.home, 0);

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('administrator can add an English idiom and view it', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await addEnglishIdiom(page, 'Break a leg', 'A way to wish someone good luck.');

  await expect(page).toHaveURL(/\/idioms\/break-a-leg$/);
  await expect(page.getByRole('heading', { name: 'Break a leg' })).toBeVisible();
  await expect(page.getByText('A way to wish someone good luck.')).toBeVisible();
});

test('public idiom content is server rendered and client navigation stays hydrated', async ({ page }) => {
  await loginAs(page, 'Administrator');
  const sourceIdiom = await createEnglishIdiomViaApi(
    page,
    'Read between the lines',
    'Find the hidden meaning.'
  );
  const equivalent = await graphql<{
    createIdiom: { status: string; idiom?: { slug: string } };
  }>(page, `
    mutation CreateRelatedIdiom($relatedIdiomId: ID!) {
      createIdiom(idiom: {
        title: "Leer entre líneas",
        description: "Descubrir el significado oculto.",
        literalTranslation: "Read between the lines",
        languageKey: "es",
        countryKeys: ["AR"],
        relatedIdiomId: $relatedIdiomId
      }) {
        status
        idiom { slug }
      }
    }
  `, { relatedIdiomId: sourceIdiom.id });
  expect(equivalent.errors).toBeUndefined();
  expect(equivalent.data?.createIdiom.status).toBe('SUCCESS');
  await logout(page);

  const listResponse = await page.request.get('/languages/english/idioms');
  expect(listResponse.ok()).toBeTruthy();
  expect(await listResponse.text()).toContain('Read between the lines');

  for (const userAgent of [
    'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
    'Twitterbot/1.0'
  ]) {
    const detailResponse = await page.request.get(
      '/idioms/read-between-the-lines',
      { headers: { 'user-agent': userAgent } }
    );
    expect(detailResponse.ok()).toBeTruthy();
    const detailHtml = await detailResponse.text();
    expect(detailHtml).toContain('Read between the lines');
    expect(detailHtml).toContain('Find the hidden meaning.');
    expect(detailHtml).toContain(
      '<meta property="og:title" content="Read between the lines — English idiom"/>'
    );
    expect(detailHtml).toContain(
      '<meta property="og:description" content="Find the hidden meaning. Explore 1 related idiom in another language."/>'
    );
    expect(detailHtml).toContain(
      '<meta property="og:image" content="http://localhost:3100/social/idioms/read-between-the-lines.png?v=3"/>'
    );
    expect(detailHtml).toContain(
      '<meta name="twitter:card" content="summary_large_image"/>'
    );
    expect(detailHtml).toContain(
      '<link rel="canonical" href="http://localhost:3100/idioms/read-between-the-lines"/>'
    );
  }
  const socialImageResponse = await page.request.get(
    '/social/idioms/read-between-the-lines.png'
  );
  expect(socialImageResponse.ok()).toBeTruthy();
  expect(socialImageResponse.headers()['content-type']).toBe('image/png');
  const socialImage = await socialImageResponse.body();
  expect(socialImage.subarray(0, 8).toString('hex')).toBe(
    '89504e470d0a1a0a'
  );

  await gotoHydrated(page, '/idioms/read-between-the-lines');
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL('/');
  await waitForRoute(page, '/');
  await expect(
    page.locator('.homeIdiomList').getByRole('link', {
      name: 'Read between the lines',
      exact: true
    })
  ).toBeVisible();
});

test('home page is a global discovery hub', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await createEnglishIdiomViaApi(
    page,
    'English discovery idiom',
    'An English idiom for the global homepage.'
  );
  const related = await graphql<{
    createIdiom: { status: string };
  }>(page, `
    mutation {
      createIdiom(idiom: {
        title: "Descubrimiento global"
        description: "Un modismo en español para la página principal."
        literalTranslation: "Global discovery"
        languageKey: "es"
        countryKeys: ["ES"]
      }) {
        status
      }
    }
  `);
  expect(related.errors).toBeUndefined();
  expect(related.data?.createIdiom.status).toBe('SUCCESS');
  await logout(page);

  await gotoHydrated(page, '/');
  await expect(
    page.getByRole('heading', {
      name: 'Idioms across languages and cultures'
    })
  ).toBeVisible();
  await expect(
    page.locator('.languageSelect .ant-select-content-value')
  ).toHaveText('All');
  await expect(
    page.getByRole('link', { name: 'Browse all idioms' })
  ).toHaveAttribute('href', '/idioms');

  const redirectedSearch = await page.request.get('/?q=global', {
    maxRedirects: 0
  });
  expect(redirectedSearch.status()).toBe(301);
  expect(redirectedSearch.headers()['location']).toBe('/idioms?q=global');
});

test('partner projects are discoverable and server rendered', async ({ page }) => {
  const response = await page.request.get('/partners');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Idiom partners');
  expect(html).toContain('https://idiomator.com/');
  expect(html).toContain('https://github.com/MachhDev/Idiomatic');
  expect(html).toContain(
    '<link rel="canonical" href="http://localhost:3100/partners"/>'
  );

  await gotoHydrated(page, '/');
  await page.getByRole('link', { name: 'Partners', exact: true }).click();
  await expect(page).toHaveURL('/partners');
  await expect(
    page.getByRole('heading', { name: 'Idiom partners' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Visit Idiomator' })
  ).toHaveAttribute('href', 'https://idiomator.com/');
  await expect(
    page.getByRole('link', { name: 'Explore Idiomatic on GitHub' })
  ).toHaveAttribute('href', 'https://github.com/MachhDev/Idiomatic');
});

test('SEO routes expose canonical metadata, complete mappings, and true 404 responses', async ({ page }) => {
  await loginAs(page, 'Administrator');
  const sourceIdiom = await createEnglishIdiomViaApi(
    page,
    'A rising tide lifts all boats',
    'Improvement in the general situation benefits everyone.'
  );
  const equivalents = [
    ['La unión hace la fuerza', 'Unity creates strength', 'es', 'AR'],
    ['L’union fait la force', 'Unity creates strength', 'fr', 'FR'],
    ['Einigkeit macht stark', 'Unity makes strong', 'de', 'DE'],
    ['L’unione fa la forza', 'Unity creates strength', 'it', 'IT'],
    ['A união faz a força', 'Unity creates strength', 'pt', 'BR'],
    ['Η ισχύς εν τη ενώσει', 'Strength lies in unity', 'el', 'GR']
  ] as const;
  for (const [title, literalTranslation, languageKey, countryKey] of equivalents) {
    const result = await graphql<{
      createIdiom: { status: string };
    }>(page, `
      mutation CreateSeoEquivalent(
        $title: String!
        $literalTranslation: String!
        $languageKey: String!
        $countryKeys: [String!]
        $relatedIdiomId: ID!
      ) {
        createIdiom(idiom: {
          title: $title
          literalTranslation: $literalTranslation
          languageKey: $languageKey
          countryKeys: $countryKeys
          relatedIdiomId: $relatedIdiomId
        }) {
          status
        }
      }
    `, {
      title,
      literalTranslation,
      languageKey,
      countryKeys: [countryKey],
      relatedIdiomId: sourceIdiom.id
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.createIdiom.status).toBe('SUCCESS');
  }
  await logout(page);

  const detailResponse = await page.request.get(
    '/idioms/a-rising-tide-lifts-all-boats'
  );
  expect(detailResponse.status()).toBe(200);
  const detailHtml = await detailResponse.text();
  for (const [title] of equivalents) {
    expect(detailHtml).toContain(title);
  }
  expect(detailHtml).toContain('"@type":"DefinedTerm"');
  expect(detailHtml).toContain('"@type":"BreadcrumbList"');

  const spanishResponse = await page.request.get(
    '/languages/spanish/idioms'
  );
  expect(spanishResponse.status()).toBe(200);
  const spanishHtml = await spanishResponse.text();
  expect(spanishHtml).toContain('Spanish idioms');
  expect(spanishHtml).not.toContain('Featured idiom');
  expect(spanishHtml).toContain(
    '<link rel="canonical" href="http://localhost:3100/languages/spanish/idioms"/>'
  );
  expect(spanishHtml).toContain('La unión hace la fuerza');

  const allIdiomsHtml = await (await page.request.get('/idioms')).text();
  expect(allIdiomsHtml).toContain('Featured idiom');
  expect(allIdiomsHtml).toContain('featuredIdiomEquivalentCount');
  expect(allIdiomsHtml).not.toContain('0 equivalent idioms');

  const legacyResponse = await page.request.get('/idioms?lang=es', {
    maxRedirects: 0
  });
  expect(legacyResponse.status()).toBe(301);
  expect(legacyResponse.headers()['location']).toBe(
    '/languages/spanish/idioms'
  );

  const searchResponse = await page.request.get(
    '/languages/spanish/idioms?q=union'
  );
  expect(await searchResponse.text()).toContain(
    '<meta name="robots" content="noindex,follow"/>'
  );

  expect((await page.request.get('/missing-page')).status()).toBe(404);
  expect(
    (await page.request.get('/idioms/missing-idiom')).status()
  ).toBe(404);
});

test('directory pagination normalizes invalid pages and rejects pages beyond the result set', async ({ page }) => {
  await loginAs(page, 'Administrator');
  for (let index = 1; index <= 12; index++) {
    await createEnglishIdiomViaApi(
      page,
      `Pagination idiom ${String(index).padStart(2, '0')}`,
      `Pagination description ${index}`
    );
  }
  await logout(page);

  for (const path of [
    '/idioms?page=0',
    '/idioms?page=1',
    '/idioms?page=abc',
    '/idioms?page=999999999999999999999'
  ]) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/idioms');
  }

  for (const path of [
    '/languages/english/idioms?page=0',
    '/languages/english/idioms?page=1',
    '/languages/english/idioms?page=abc'
  ]) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe(
      '/languages/english/idioms'
    );
  }

  for (const path of [
    '/idioms?page=999',
    '/languages/english/idioms?page=999'
  ]) {
    const response = await page.request.get(path);
    expect(response.status()).toBe(404);
    const html = await response.text();
    expect(html).toContain(
      '<meta name="robots" content="noindex,follow"/>'
    );
    expect(html).not.toContain('rel="canonical"');
    expect(html).toContain('Could not find a needle in a haystack.');
  }
});

test('administrator can update an existing idiom', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await addEnglishIdiom(page, 'Hit the road', 'To leave or begin a journey.');
  await expect(page).toHaveURL(/\/idioms\/hit-the-road$/);

  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Update an Idiom' })).toBeVisible();

  await page.getByRole('textbox', { name: /Idiom \(In the language's own alphabet\)/ }).fill('Hit the open road');
  await page.locator('.mde-text').fill('To leave and begin a journey.');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL(/\/idioms\/hit-the-road$/);
  await expect(page.getByRole('heading', { name: 'Hit the open road' })).toBeVisible();
  await expect(page.getByText('To leave and begin a journey.')).toBeVisible();
});

test('administrator can review and accept a public idiom proposal', async ({ page }) => {
  await loginAs(page, 'General user');
  await addEnglishIdiom(page, 'On the same page', 'To share the same understanding.');

  const proposalDialog = page.getByRole('dialog');
  await expect(proposalDialog.locator('.ant-modal-confirm-title')).toHaveText('Idiom change proposal received!');
  await expect(proposalDialog.getByText('Thanks for suggesting the change, we will review it shortly.')).toBeVisible();
  await proposalDialog.getByRole('button', { name: 'OK' }).click();
  await expect(page).toHaveURL('http://localhost:3100/idioms');

  await page.goto('/me');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

  await loginAs(page, 'Administrator');
  await page.goto('/admin/proposals');
  const proposal = page.locator('.changeProposalItem');
  await expect(proposal.getByRole('link', { name: /On the same page/ })).toBeVisible();
  await expect(proposal.locator('.proposalType')).toHaveText('Create idiom');
  await expect(proposal.getByText('Submitted by', { exact: true })).toBeVisible();
  await expect(proposal.getByText('Local general', { exact: true })).toBeVisible();
  await expect(proposal.locator('.proposalEditor')).toHaveCount(1);
  await expect(page.locator('.jsoneditor-react-container')).toHaveCount(0);
  await expect(proposal.getByLabel('Proposed title')).toHaveValue('On the same page');
  await proposal.getByLabel('Proposed description').fill(
    'Reviewed: To share the same understanding.'
  );

  await page.getByRole('button', { name: 'Accept Proposal' }).click();
  await page.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(proposal).not.toBeVisible();

  await page.goto('/idioms/on-the-same-page');
  await expect(page.getByRole('heading', { name: 'On the same page' })).toBeVisible();
  await expect(page.getByText('Reviewed: To share the same understanding.')).toBeVisible();
});

test('related idiom proposal links to the existing idiom', async ({ page }) => {
  await loginAs(page, 'Administrator');
  const sourceIdiom = await createEnglishIdiomViaApi(
    page,
    'Piece of cake',
    'Something that is easy.'
  );
  await logout(page);

  await loginAs(page, 'General user');
  await page.goto(`/idioms/${sourceIdiom.slug}`);
  await page.locator('.addNew').getByRole('button', { name: 'Add idiom' }).click();
  await expect(page).toHaveURL(`/new?equivalentIdiomId=${sourceIdiom.id}`);
  await addEnglishIdiom(
    page,
    'Easy as pie',
    'Something that is straightforward to accomplish.'
  );
  await page.getByRole('dialog').getByRole('button', { name: 'OK' }).click();
  await logout(page);

  await loginAs(page, 'Administrator');
  await page.goto('/admin/proposals');
  const proposal = page.locator('.changeProposalItem');
  await expect(proposal.locator('.proposalType')).toHaveText(
    'Create related idiom'
  );
  const relationship = proposal.locator('.proposalRelationship');
  await expect(relationship).toContainText(
    'This new idiom will be added as an equivalent of Piece of cake.'
  );
  const relatedIdiomLink = relationship.getByRole('link', {
    name: 'Piece of cake'
  });
  await expect(relatedIdiomLink).toHaveAttribute(
    'href',
    `/idioms/${sourceIdiom.slug}`
  );

  await proposal.getByRole('button', { name: 'Accept Proposal' }).click();
  await proposal.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(proposal).not.toBeVisible();

  await page.goto(`/idioms/${sourceIdiom.slug}`);
  await expect(
    page.locator('.equivalentList').getByText('Easy as pie', { exact: true })
  ).toBeVisible();
});

test('all-language filter lists non-English idioms without a render loop', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await addIdiom(page, {
    title: 'Die koeël is deur die kerk',
    description: 'The decision has been made and cannot be reversed.',
    languageSearch: 'Afrikaans',
    languageDisplay: 'Afrikaans (Afrikaans)',
    countrySearch: 'South Africa',
    countryDisplay: 'South Africa (South Africa)',
    literalTranslation: 'The bullet is through the church'
  });
  await expect(page).toHaveURL(/\/idioms\/die-koeel-is-deur-die-kerk$/);
  await waitForRoute(page, '/idioms/die-koeel-is-deur-die-kerk');

  const mapTab = page.getByRole('tab', { name: 'Map' });
  await mapTab.click();
  await expect(mapTab).toHaveAttribute('aria-selected', 'true');
  const map = page.locator('.worldIdiomMap');
  const southAfrica = map.locator('[aria-label="South Africa"]');
  await expect(map).toBeVisible({ timeout: 15_000 });
  await expect(southAfrica).toBeVisible({ timeout: 15_000 });
  await southAfrica.hover();
  const mapTooltip = page.getByRole('tooltip');
  await expect(mapTooltip).toContainText('South Africa');
  await expect(mapTooltip).toContainText('Afrikaans: Die koeël is deur die kerk');
  const tooltipLayout = await page.evaluate(() => {
    const mapBounds = document.querySelector('.worldIdiomMap')!.getBoundingClientRect();
    const tooltip = document.querySelector('.worldIdiomTooltip')!;
    const tooltipBounds = tooltip.getBoundingClientRect();
    return {
      map: {
        bottom: mapBounds.bottom,
        left: mapBounds.left,
        right: mapBounds.right,
        top: mapBounds.top
      },
      position: window.getComputedStyle(tooltip).position,
      tooltip: {
        bottom: tooltipBounds.bottom,
        left: tooltipBounds.left,
        right: tooltipBounds.right,
        top: tooltipBounds.top
      }
    };
  });
  expect(tooltipLayout.position).toBe('absolute');
  expect(tooltipLayout.tooltip.left).toBeGreaterThanOrEqual(tooltipLayout.map.left);
  expect(tooltipLayout.tooltip.right).toBeLessThanOrEqual(tooltipLayout.map.right);
  expect(tooltipLayout.tooltip.top).toBeGreaterThanOrEqual(tooltipLayout.map.top);
  expect(tooltipLayout.tooltip.bottom).toBeLessThanOrEqual(tooltipLayout.map.bottom);

  await page.goto('/languages/afrikaans/idioms');
  await expect(page.getByText('Die koeël is deur die kerk')).toBeVisible();
  const languageFilter = page.getByRole('combobox', { name: 'Language' });
  const languageFilterLabel = page.locator('.languageSelect .ant-select-content-value');
  await expect(languageFilterLabel).toHaveText('Afrikaans');
  const languageLabelFits = await languageFilterLabel.evaluate(
    element => element.scrollWidth <= element.clientWidth
  );
  expect(languageLabelFits).toBe(true);

  await languageFilter.click();
  const languageMenuMotion = await page
    .locator('.languageOptionContainer')
    .evaluate(element => {
      const styles = window.getComputedStyle(element);
      return {
        animationDuration: styles.animationDuration,
        opacity: styles.opacity,
        transform: styles.transform
      };
    });
  expect(languageMenuMotion).toEqual({
    animationDuration: '0.001s',
    opacity: '1',
    transform: 'none'
  });
  await languageFilter.click();
  await expect(page.locator('.languageOptionContainer')).toBeHidden();
  await languageFilter.click();
  await page.locator('.languageOption').filter({ hasText: /^All$/ }).click();

  await expect(page).toHaveURL('/idioms');
  await expect(page.getByText('Die koeël is deur die kerk')).toBeVisible();
  await expect(page.locator('#webpack-dev-server-client-overlay')).toHaveCount(0);
});

test('administrator can reject a public idiom proposal', async ({ page }) => {
  await loginAs(page, 'General user');
  await addEnglishIdiom(page, 'A watched pot never boils', 'Waiting makes time feel slower.');
  await page.getByRole('dialog').getByRole('button', { name: 'OK' }).last().click();
  await logout(page);

  await loginAs(page, 'Administrator');
  await page.goto('/admin/proposals');
  const proposal = page.locator('.changeProposalItem');
  await expect(proposal.getByRole('link', { name: /A watched pot never boils/ })).toBeVisible();
  await proposal.getByRole('button', { name: 'Reject Proposal' }).click();
  await proposal.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(proposal).not.toBeVisible();

  await page.goto('/idioms/a-watched-pot-never-boils');
  await expect(page.getByText('It looks like you went barking up the wrong tree.')).toBeVisible();
});

test('administrator can accept a General-user update proposal', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await createEnglishIdiomViaApi(page, 'Bite the bullet', 'To face a difficult task.');
  await logout(page);

  await loginAs(page, 'General user');
  await page.goto('/idioms/bite-the-bullet');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: /Idiom \(In the language's own alphabet\)/ }).fill('Bite the proverbial bullet');
  await page.locator('.mde-text').fill('To face a difficult or unpleasant task.');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'OK' }).last().click();
  await logout(page);

  await loginAs(page, 'Administrator');
  await page.goto('/admin/proposals');
  const proposal = page.locator('.changeProposalItem');
  await expect(proposal.locator('.proposalType')).toHaveText('Update idiom');
  await expect(proposal.getByLabel('Proposed title')).toHaveValue('Bite the proverbial bullet');
  await proposal.getByLabel('Proposed title').fill('Bite the reviewed bullet');
  await proposal.getByRole('button', { name: 'Accept Proposal' }).click();
  await proposal.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(proposal).not.toBeVisible();

  await page.goto('/idioms/bite-the-bullet');
  await expect(page.getByRole('heading', { name: 'Bite the reviewed bullet' })).toBeVisible();
  await expect(page.getByText('To face a difficult or unpleasant task.')).toBeVisible();
});

test('administrator can add and remove equivalent idioms', async ({ page }) => {
  await loginAs(page, 'Administrator');
  const sourceIdiom = await createEnglishIdiomViaApi(page, 'Piece of cake', 'Something that is easy.');
  const equivalent = await graphql<{
    createIdiom: { status: string; idiom?: { id: string; slug: string; title: string } };
  }>(page, `
    mutation CreateEquivalent {
      createIdiom(idiom: {
        title: "Pan comido",
        description: "Something very easy.",
        literalTranslation: "Eaten bread",
        languageKey: "es",
        countryKeys: ["AR"]
      }) {
        status
        idiom { id slug title }
      }
    }
  `);
  expect(equivalent.data?.createIdiom.status).toBe('SUCCESS');

  await page.goto('/idioms/piece-of-cake');
  await page.locator('.addNew').getByRole('button', { name: 'Add idiom' }).click();
  await expect(page).toHaveURL(`/new?equivalentIdiomId=${sourceIdiom.id}`);
  await expect(page.getByRole('heading', { name: 'Add an Idiom' })).toBeVisible();
  await expect(page.getByText('Add an equivalent idiom for')).toBeVisible();
  await expect(page.getByText('Piece of cake', { exact: true })).toBeVisible();
  await expect(page.getByText(/useLazyQuery/)).toHaveCount(0);

  await page.goto('/idioms/piece-of-cake');
  const equivalentSearch = page.locator('.findSelectControl').getByRole('combobox');
  await equivalentSearch.fill('Pan comido');
  await page.getByText('Pan comido', { exact: true }).click();
  await page.locator('.addExisting').getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Successfully added!')).toBeVisible();

  await page.reload();
  const equivalentList = page.locator('.equivalentList');
  await expect(equivalentList.getByText('Pan comido', { exact: true })).toBeVisible();
  await equivalentList.locator('.removeEquivalentButton').click();
  await equivalentList.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(equivalentList.getByText('Pan comido', { exact: true })).not.toBeVisible();
});

test('idiom form validates required fields and duplicate titles', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await page.goto('/new');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('An Idiom is required')).toBeVisible();
  await expect(page.getByText('Unknown language')).toBeVisible();
  await expect(page.getByText('Unknown country')).toBeVisible();

  await createEnglishIdiomViaApi(page, 'Under the weather', 'To feel unwell.');
  await page.goto('/new');
  await addIdiom(page, {
    title: 'Under the weather',
    description: 'Duplicate idiom.',
    languageSearch: 'English',
    languageDisplay: 'English (English)',
    countrySearch: 'Antigua',
    countryDisplay: 'Antigua and Barbuda (Antigua and Barbuda)'
  });
  await expect(page.getByRole('alert')).toContainText('This idiom already exists');
});

test('search and pagination preserve filters in deep links', async ({ page }) => {
  await loginAs(page, 'Administrator');
  for (let index = 1; index <= 12; index++) {
    await createEnglishIdiomViaApi(page, `Test idiom ${String(index).padStart(2, '0')}`, `Description ${index}`);
  }

  await gotoHydrated(page, '/languages/english/idioms');
  await expect(page.getByText('Test idiom 01', { exact: true })).toBeVisible();
  await page.getByTitle('2').click();
  await expect(page).toHaveURL('/languages/english/idioms?page=2');
  await expect(page.getByText('Test idiom 11', { exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Find an idiom' }).fill('Test idiom 03');
  await page.getByRole('button', { name: 'search' }).click();
  await expect(page).toHaveURL(
    '/languages/english/idioms?q=Test+idiom+03'
  );
  await expect(page.getByText('Test idiom 03', { exact: true })).toBeVisible();
  await expect(page.getByText('Test idiom 11', { exact: true })).not.toBeVisible();
});

test('GraphQL authorization and resolver contracts are preserved', async ({ page }) => {
  const anonymousCreate = await graphql(page, `
    mutation {
      createIdiom(idiom: {
        title: "Anonymous idiom",
        languageKey: "en",
        countryKeys: ["AG"]
      }) { status }
    }
  `);
  expect(anonymousCreate.errors?.[0].message).toBe('User must be logged in');

  await loginAs(page, 'General user');
  const generalCreate = await graphql<{ createIdiom: { status: string } }>(page, `
    mutation {
      createIdiom(idiom: {
        title: "General proposal",
        languageKey: "en",
        countryKeys: ["AG"]
      }) { status }
    }
  `);
  expect(generalCreate.data?.createIdiom.status).toBe('PENDING');
  const generalUsers = await graphql(page, `query { users { id } }`);
  expect(generalUsers.errors?.[0].message).toBe('User is not authorized to access this resource');
  await logout(page);

  await loginAs(page, 'Contributor');
  const contributorCreate = await graphql<{ createIdiom: { status: string; idiom?: { slug: string } } }>(page, `
    mutation {
      createIdiom(idiom: {
        title: "Contributor idiom",
        languageKey: "en",
        countryKeys: ["AG"]
      }) {
        status
        idiom { slug }
      }
    }
  `);
  expect(contributorCreate.data?.createIdiom.status).toBe('SUCCESS');
  expect(contributorCreate.data?.createIdiom.idiom?.slug).toBe('contributor-idiom');
  await logout(page);

  await loginAs(page, 'Administrator');
  const adminContract = await graphql<{
    users: Array<{ name: string; role: string }>;
    languages: Array<{ languageKey: string }>;
    countries: Array<{ countryKey: string }>;
    idioms: { totalCount: number; edges: Array<{ node: { slug: string } }> };
  }>(page, `
    query {
      users { name role }
      languages { languageKey }
      countries(languageKey: "en") { countryKey }
      idioms(locale: "all", filter: "Contributor idiom") {
        totalCount
        edges { node { slug } }
      }
    }
  `);
  expect(adminContract.errors).toBeUndefined();
  expect(adminContract.data?.users.some(user => user.role === 'ADMIN')).toBeTruthy();
  expect(adminContract.data?.languages.some(language => language.languageKey === 'en')).toBeTruthy();
  expect(adminContract.data?.countries.some(country => country.countryKey === 'AG')).toBeTruthy();
  expect(adminContract.data?.idioms.edges[0].node.slug).toBe('contributor-idiom');
});
