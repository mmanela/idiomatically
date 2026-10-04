import test from "node:test";
import assert from "node:assert/strict";
import {
  excerptAppearsInPage,
  hasApprovedCorroboratedMapping,
  normalizeIdiomTitle,
  normalizePageText,
  sourceHost,
  summarizeEvidence,
} from "../src/core.js";
import { createEmptyDataset } from "../src/core.js";

test("normalizes punctuation, case, and spacing for duplicate detection", () => {
  assert.equal(
    normalizeIdiomTitle("  Don’t   Count—Your Chickens! "),
    "don t count your chickens",
  );
});

test("requires two distinct verified publishers", () => {
  const summary = summarizeEvidence([
    {
      url: "https://example.com/a",
      title: "A",
      publisher: "Example",
      excerpt: "A sufficiently long evidence excerpt.",
      supports: "meaning",
      httpStatus: 200,
      excerptMatched: true,
    },
    {
      url: "https://www.example.com/b",
      title: "B",
      publisher: "Example",
      excerpt: "Another sufficiently long evidence excerpt.",
      supports: "meaning",
      httpStatus: 200,
      excerptMatched: true,
    },
  ]);
  assert.equal(summary.status, "insufficient");
  assert.equal(summary.distinctSourceCount, 1);
});

test("accepts corroboration from two verified publishers", () => {
  const summary = summarizeEvidence([
    {
      url: "https://dictionary.example/a",
      title: "A",
      publisher: "Dictionary",
      excerpt: "A sufficiently long evidence excerpt.",
      supports: "meaning",
      httpStatus: 200,
      excerptMatched: true,
    },
    {
      url: "https://university.example/b",
      title: "B",
      publisher: "University",
      excerpt: "Another sufficiently long evidence excerpt.",
      supports: "meaning",
      httpStatus: 200,
      excerptMatched: true,
    },
  ]);
  assert.equal(summary.status, "corroborated");
  assert.equal(summary.distinctSourceCount, 2);
});

test("matches exact or near-exact evidence excerpts in HTML", () => {
  assert.equal(
    excerptAppearsInPage(
      "The phrase means to reveal a secret unintentionally.",
      "<html><body>The phrase means to reveal a secret unintentionally.</body></html>",
    ),
    true,
  );
});

test("ignores script contents with browser-valid closing-tag whitespace", () => {
  assert.equal(
    excerptAppearsInPage(
      "The phrase means to reveal a secret unintentionally.",
      [
        "<html><body>",
        "<script>The phrase means to reveal a secret unintentionally.</script >",
        "<p>This visible paragraph discusses something else entirely.</p>",
        "</body></html>",
      ].join(""),
    ),
    false,
  );
});

test("decodes nested HTML entities only once", () => {
  assert.equal(
    normalizePageText("&amp;quot;quoted&amp;quot; and &amp;quot;literal&amp;quot;."),
    "&quot;quoted&quot; and &quot;literal&quot;.",
  );
  assert.equal(
    excerptAppearsInPage(
      '"quoted" and "literal".',
      "&amp;quot;quoted&amp;quot; and &amp;quot;literal&amp;quot;.",
    ),
    false,
  );
});

test("normalizes www when comparing source hosts", () => {
  assert.equal(sourceHost("https://www.example.com/path"), "example.com");
});

test("requires an approved corroborated mapping for a new English idiom", () => {
  const dataset = createEmptyDataset();
  dataset.mappings.push({
    id: "mapping",
    englishCandidateId: "candidate",
    languageKey: "es",
    countryKey: "ES",
    title: "Dar en el clavo",
    normalizedTitle: "dar en el clavo",
    meaning: "To be exactly right",
    sources: [],
    evidence: {
      status: "corroborated",
      distinctSourceCount: 2,
      notes: [],
    },
    reviewStatus: "pending",
  });
  assert.equal(
    hasApprovedCorroboratedMapping(dataset, "candidate"),
    false,
  );
  dataset.mappings[0].reviewStatus = "approved";
  assert.equal(
    hasApprovedCorroboratedMapping(dataset, "candidate"),
    true,
  );
});
