import test from "node:test";
import assert from "node:assert/strict";
import { buildImportPlan, type ImportItem } from "../src/importPlan.js";
import type { ExistingIdiom } from "../src/types.js";

function existing(
  overrides: Partial<ExistingIdiom> & Pick<ExistingIdiom, "id" | "title">,
): ExistingIdiom {
  return {
    normalizedTitle: overrides.title.toLowerCase(),
    slug: overrides.title.toLowerCase().replaceAll(" ", "-"),
    description: "Meaning",
    languageKey: "en",
    countryKeys: ["US"],
    equivalentIds: [],
    ...overrides,
  };
}

function item(overrides: Partial<ImportItem> = {}): ImportItem {
  return {
    researchId: "research-1",
    title: "Piece of cake",
    description: "Something very easy",
    languageKey: "en",
    countryKeys: ["US"],
    ...overrides,
  };
}

test("reuses an unambiguous existing idiom and skips an existing relationship", () => {
  const english = existing({ id: "english", title: "Piece of cake" });
  const spanish = existing({
    id: "spanish",
    title: "Pan comido",
    normalizedTitle: "pan comido",
    slug: "pan-comido",
    languageKey: "es",
    countryKeys: ["ES"],
    equivalentIds: ["english"],
  });
  english.equivalentIds = ["spanish"];

  const plan = buildImportPlan(
    [english, spanish],
    [
      item(),
      item({
        researchId: "research-2",
        title: "Pan comido",
        languageKey: "es",
        countryKeys: ["ES"],
      }),
    ],
    [{ fromResearchId: "research-1", toResearchId: "research-2" }],
  );

  assert.equal(plan.creations.length, 0);
  assert.equal(plan.relationships.length, 0);
  assert.equal(plan.skippedExistingRelationships, 1);
});

test("rejects ambiguous existing normalized-title matches", () => {
  assert.throws(
    () =>
      buildImportPlan(
        [
          existing({ id: "one", title: "Piece of cake" }),
          existing({
            id: "two",
            title: "Piece of cake!",
            normalizedTitle: "piece of cake",
            slug: "piece-of-cake-2",
          }),
        ],
        [item()],
        [],
      ),
    /Ambiguous duplicate match/,
  );
});

test("uses an explicit existing ID to disambiguate legacy duplicates", () => {
  const plan = buildImportPlan(
    [
      existing({ id: "one", title: "Piece of cake" }),
      existing({
        id: "two",
        title: "Piece of cake!",
        normalizedTitle: "piece of cake",
        slug: "piece-of-cake-2",
      }),
    ],
    [item({ preferredExistingId: "one" })],
    [],
  );

  assert.equal(plan.creations.length, 0);
  assert.equal(plan.researchToRef.get("research-1"), "existing:one");
});

test("rejects stale explicit existing IDs", () => {
  assert.throws(
    () =>
      buildImportPlan(
        [],
        [item({ preferredExistingId: "missing" })],
        [],
      ),
    /Stale existing idiom ID/,
  );
});

test("coalesces compatible duplicates within one batch", () => {
  const plan = buildImportPlan(
    [],
    [
      item({ countryKeys: ["US"] }),
      item({ researchId: "research-2", countryKeys: ["GB"] }),
    ],
    [],
  );

  assert.equal(plan.creations.length, 1);
  assert.deepEqual(plan.creations[0].researchIds, [
    "research-1",
    "research-2",
  ]);
  assert.deepEqual(plan.creations[0].input.countryKeys, ["GB", "US"]);
  assert.equal(
    plan.researchToRef.get("research-1"),
    plan.researchToRef.get("research-2"),
  );
});

test("rejects same-batch duplicate titles with conflicting content", () => {
  assert.throws(
    () =>
      buildImportPlan(
        [],
        [
          item(),
          item({
            researchId: "research-2",
            description: "A conflicting meaning",
          }),
        ],
        [],
      ),
    /conflicting content/,
  );
});

test("deduplicates relationships regardless of direction", () => {
  const plan = buildImportPlan(
    [],
    [
      item(),
      item({
        researchId: "research-2",
        title: "Pan comido",
        description: "Something very easy",
        languageKey: "es",
        countryKeys: ["ES"],
      }),
    ],
    [
      { fromResearchId: "research-1", toResearchId: "research-2" },
      { fromResearchId: "research-2", toResearchId: "research-1" },
    ],
  );

  assert.equal(plan.relationships.length, 1);
});
