# Idiomatically research pipeline

This is a standalone data-research project. It does not import application
code or modify the web application's package configuration. It reads and
writes site data exclusively through the site's GraphQL API.

AI is limited to discovering candidates and finding potential evidence. A new
English idiom cannot be approved unless it has its own corroborating evidence
and at least one manually approved equivalent in another language. Every
mapping requires two real usage examples from distinct source domains, and the
program verifies that each cited excerpt and attested idiom form appears on the
source page.

## Setup

Use the repository's Node.js 22 release:

```sh
cd idiom-research
npm install
cp .env.example .env
```

The research commands invoke the authenticated GitHub Copilot CLI installed on
the machine and use its configured default model. No separate model API key or
model setting is required. `COPILOT_CLI_PATH` can override the executable name.
`COPILOT_RESEARCH_TIMEOUT_MS` controls the per-call timeout and defaults to
three minutes; timed-out calls are recorded and retried by later runs without
aborting the remaining batch.
`IDIOMATICALLY_GRAPHQL_URL` defaults to the production GraphQL endpoint but can
point to a local site.

## Workflow

```sh
# Copy existing idioms and relationships into the local research dataset.
npm run research -- snapshot

# Discover English idioms and automatically search configured locales until
# each candidate has at least one corroborated foreign-language equivalent.
npm run research -- discover --rounds 3 --batch-size 25

# For every English dataset idiom, corroborate known equivalents and find new
# ones across configured target locales.
npm run research -- find-translations

# Use Spanish dataset idioms as the source and limit target locales.
npm run research -- find-translations --language es --locales fr-FR,de-DE

# Restrict a run to specific stable candidate IDs.
npm run research -- find-translations --candidates <id-1>,<id-2>

# Fast pass: stop after the first corroborated equivalent for each candidate.
npm run research -- find-translations --candidates <ids> --one-per-candidate

# Manually approve a corroborated candidate or mapping.
npm run research -- review --id <candidate-or-mapping-id> --decision approved

# Re-fetch all evidence before an import.
npm run research -- audit

# Print an import plan without writing.
npm run research -- import
```

An explicit human owner decision can override insufficient English-candidate
evidence after its mapping has been corroborated and approved:

```sh
npm run research -- review --id <candidate-id> --decision approved \
  --override-evidence --reason "Owner approved after manual review"
```

Overrides are stored in the version-controlled dataset. They do not bypass the
two-source corroboration requirement for foreign-language mappings.

The generated dataset is `.idiom-research/dataset.json` inside this folder and
is version controlled as the canonical research and review record. Other files
inside `.idiom-research/` remain ignored so temporary caches cannot be
committed accidentally. The dataset is loaded and merged on every run, so the
process is incremental. Existing candidates and mappings are reused, failed
searches are remembered against the exact set of translations known at that
time, and each successful candidate or mapping is saved immediately. When a
new translation is added, the changed exclusion set allows a later run to
search for another one. Use `--refresh` only when you intentionally want to
repeat prior searches.

The dataset records source URLs, short evidence excerpts, exact attested forms,
HTTP and excerpt verification results, review decisions, failed searches, and
research runs.

The default target locales are Spanish (Spain), French (France), German
(Germany), Italian (Italy), Portuguese (Brazil), Japanese (Japan), Chinese
(China), Russian (Russia), and Greek (Greece). Edit the dataset's `locales`
array to expand or narrow that list.

`find-translations` defaults to `--language en`. It iterates idioms already in
the dataset for that source language, first corroborates any equivalent already
present but lacking evidence, and then searches the web for an additional
equivalent not already known in that target locale. Every proposed addition
still requires two verified usage examples from distinct domains.

Use `find-translations --refresh` to deliberately repeat previous
corroboration or discovery attempts.

## Import safety

`import` is dry-run by default. It refreshes existing site data through
GraphQL, considers only manually approved and currently corroborated records,
resolves normalized titles and slugs, and blocks ambiguous collisions.

Before any mutation, the importer resolves snapshot records by exact GraphQL
ID, rejects stale IDs, detects ambiguous normalized-title or slug matches,
coalesces compatible duplicates within the same batch, rejects conflicting
duplicate content, and deduplicates relationships regardless of direction.
After an applied import, it fetches the site again and requires a second plan
to contain zero remaining idioms and zero remaining relationships.

For writes, copy the `Cookie` request header from an authenticated contributor
or administrator browser session into `IDIOMATICALLY_SESSION_COOKIE`. General
users produce pending proposals, which this importer intentionally rejects.

To apply against a local GraphQL endpoint:

```sh
npm run research -- import --apply
```

A non-local endpoint additionally requires `--allow-production`. Idioms are
created with `createIdiom`, and existing records are connected with
`addEquivalent`, preserving the site's validation, authorization, proposal,
and relationship behavior. Keep the JSON dataset as the provenance and review
artifact for every applied batch.

The application API performs its own duplicate check before every creation.
Because the site does not currently enforce a database-level unique constraint,
avoid running multiple importers or manually creating idioms concurrently with
an import. A concurrent writer could still create a narrow check-then-insert
race; the post-import verification will detect the resulting ambiguity and
fail loudly rather than treating the import as successful.
