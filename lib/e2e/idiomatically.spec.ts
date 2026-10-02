import { expect, Page, test } from '@playwright/test';
import { MongoClient } from 'mongodb';

const apiUrl = 'http://localhost:8100';

test.beforeEach(async () => {
  const client = await MongoClient.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.db('idiomatically-e2e').dropDatabase();
  } finally {
    await client.close();
  }
});

async function loginAs(page: Page, role: 'General user' | 'Contributor' | 'Administrator') {
  await page.goto(`${apiUrl}/login?returnTo=/`);
  await page.getByRole('link', { name: role }).click();
  await expect(page).toHaveURL('http://localhost:3100/');
}

async function addEnglishIdiom(page: Page, title: string, description: string) {
  await page.getByRole('button', { name: 'Add an idiom' }).click();
  await expect(page.getByRole('heading', { name: 'Add an Idiom' })).toBeVisible();

  const form = page.locator('form');
  await page.getByRole('textbox', { name: /Idiom \(In the language's own alphabet\)/ }).fill(title);
  const languageInput = form.locator('.ant-form-item').filter({ hasText: /^Language/ }).getByRole('combobox');
  await languageInput.evaluate((element: HTMLInputElement) => element.focus());
  await page.keyboard.type('English');
  await page.getByText('English (English)', { exact: true }).click();
  const countryInput = form.locator('.ant-form-item').filter({ hasText: /^Country/ }).getByRole('combobox');
  await countryInput.evaluate((element: HTMLInputElement) => element.focus());
  await page.keyboard.type('Antigua');
  await expect(page.getByText('Antigua and Barbuda (Antigua and Barbuda)', { exact: true })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(form.getByText('Antigua and Barbuda', { exact: false })).toBeVisible();
  await page.locator('.mde-text').fill(description);
  await page.getByRole('button', { name: 'Submit' }).click();
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

  await expect(page).toHaveURL(`${apiUrl}/login?returnTo=/new`);
  await expect(page.getByRole('link', { name: 'General user' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contributor' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administrator' })).toBeVisible();
});

test('local authentication supports role selection and logout', async ({ page }) => {
  await page.goto(`${apiUrl}/login?returnTo=/me`);
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
  await expect(proposalDialog.getByText('Idiom change proposal received!')).toBeVisible();
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
