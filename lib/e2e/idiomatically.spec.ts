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
  await page.goto('/');

  for (const name of ['Home', 'About', 'Login']) {
    const link = page.getByRole('link', { name });
    await expect(link).toBeVisible();
    const linkGap = await link.evaluate(element =>
      Number.parseFloat(window.getComputedStyle(element).columnGap)
    );
    expect(linkGap).toBeGreaterThan(0);
  }
});

test('anonymous users are sent to local sign in before adding an idiom', async ({ page }) => {
  await page.goto('/new');

  await expect(page).toHaveURL(`${appUrl}/login?returnTo=/new`);
  await expect(page.getByRole('link', { name: 'General user' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contributor' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administrator' })).toBeVisible();
});

test('local authentication supports role selection and logout', async ({ page }) => {
  await page.goto(`${appUrl}/login?returnTo=/me`);
  await expect(page.getByRole('link', { name: 'General user' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contributor' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administrator' })).toBeVisible();

  await page.getByRole('link', { name: 'Administrator' }).click();
  await expect(page).toHaveURL('http://localhost:3100/me');
  await expect(page.getByRole('heading', { name: 'Local admin' })).toBeVisible();
  await expect(page.getByText('Ardent Admin')).toBeVisible();

  for (const navigationItem of [
    page.getByRole('button', { name: 'Add an idiom' }),
    page.getByRole('link', { name: 'Local admin' })
  ]) {
    const gap = await navigationItem.evaluate(element =>
      Number.parseFloat(window.getComputedStyle(element).columnGap)
    );
    expect(gap).toBe(6);
  }

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
  await createEnglishIdiomViaApi(page, 'Read between the lines', 'Find the hidden meaning.');
  await logout(page);

  const listResponse = await page.request.get('/idioms?lang=en');
  expect(listResponse.ok()).toBeTruthy();
  expect(await listResponse.text()).toContain('Read between the lines');

  const detailResponse = await page.request.get('/idioms/read-between-the-lines');
  expect(detailResponse.ok()).toBeTruthy();
  const detailHtml = await detailResponse.text();
  expect(detailHtml).toContain('Read between the lines');
  expect(detailHtml).toContain('Find the hidden meaning.');

  await page.goto('/idioms/read-between-the-lines');
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Read between the lines', { exact: true })).toBeVisible();
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
  await expect(proposal.locator('.proposalType')).toHaveText('CreateIdiom');
  await expect(proposal.getByText('By Local general', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Accept Proposal' }).click();
  await page.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(proposal).not.toBeVisible();

  await page.goto('/idioms/on-the-same-page');
  await expect(page.getByRole('heading', { name: 'On the same page' })).toBeVisible();
  await expect(page.getByText('To share the same understanding.')).toBeVisible();
});

test('all-language filter lists non-English idioms without a render loop', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await addIdiom(page, {
    title: 'Más vale tarde que nunca',
    description: 'It is better to do something late than not at all.',
    languageSearch: 'Spanish',
    languageDisplay: 'Spanish (Español)',
    countrySearch: 'Argentina',
    countryDisplay: 'Argentina (Argentina)',
    literalTranslation: 'Better late than never'
  });
  await expect(page).toHaveURL(/\/idioms\/mas-vale-tarde-que-nunca$/);

  await page.goto('/idioms?lang=es');
  await expect(page.getByText('Más vale tarde que nunca')).toBeVisible();

  await page.getByRole('combobox', { name: 'Language' }).click();
  await page.locator('.languageOption').filter({ hasText: /^All$/ }).click();

  await expect(page).toHaveURL('/idioms?lang=all');
  await expect(page.getByText('Más vale tarde que nunca')).toBeVisible();
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
  await expect(proposal.locator('.proposalType')).toHaveText('UpdateIdiom');
  await proposal.getByRole('button', { name: 'Accept Proposal' }).click();
  await proposal.getByRole('button', { name: 'Are you sure?' }).click();
  await expect(proposal).not.toBeVisible();

  await page.goto('/idioms/bite-the-bullet');
  await expect(page.getByRole('heading', { name: 'Bite the proverbial bullet' })).toBeVisible();
  await expect(page.getByText('To face a difficult or unpleasant task.')).toBeVisible();
});

test('administrator can add and remove equivalent idioms', async ({ page }) => {
  await loginAs(page, 'Administrator');
  await createEnglishIdiomViaApi(page, 'Piece of cake', 'Something that is easy.');
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

  await page.goto('/idioms?lang=en');
  await expect(page.getByText('Test idiom 01', { exact: true })).toBeVisible();
  await page.getByTitle('2').click();
  await expect(page).toHaveURL('/idioms?lang=en&page=2');
  await expect(page.getByText('Test idiom 11', { exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Find an idiom' }).fill('Test idiom 03');
  await page.getByRole('button', { name: 'search' }).click();
  await expect(page).toHaveURL('/idioms?q=Test+idiom+03&lang=en');
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
