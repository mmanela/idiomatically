const rawTarget =
  process.env.SEO_REPORT_URL || process.argv[2] || "http://localhost:3000";
const target = new URL(rawTarget);
const endpoint = new URL("/graphql", target.origin);

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `
      query SeoContentReport {
        idioms(locale: "all", limit: 5000, cursor: "0") {
          totalCount
          edges {
            node {
              slug
              title
              description
              literalTranslation
              transliteration
              equivalentCount
              language {
                languageKey
                languageName
              }
            }
          }
        }
      }
    `,
  }),
});

if (!response.ok) {
  throw new Error(
    `Content report query failed with ${response.status}: ${await response.text()}`,
  );
}

const result = await response.json();
if (result.errors?.length) {
  throw new Error(
    `Content report query failed: ${result.errors
      .map((error) => error.message)
      .join(", ")}`,
  );
}

const idioms = result.data.idioms.edges.map((edge) => edge.node);
const rows = idioms
  .map((idiom) => {
    const descriptionLength = plainText(idiom.description).length;
    const missingDescription = descriptionLength === 0;
    const missingLiteral =
      idiom.language.languageKey !== "en" && !idiom.literalTranslation;
    const missingTransliteration =
      idiom.language.languageKey !== "en" && !idiom.transliteration;
    const priority =
      (missingDescription ? 1000 : 0) +
      (missingLiteral ? 200 : 0) +
      (missingTransliteration ? 100 : 0) +
      idiom.equivalentCount * 10;
    return {
      priority,
      language: idiom.language.languageName,
      languageKey: idiom.language.languageKey,
      title: idiom.title,
      url: new URL(`/idioms/${idiom.slug}`, target.origin).toString(),
      equivalentCount: idiom.equivalentCount,
      missingDescription,
      missingLiteral,
      missingTransliteration,
      descriptionLength,
    };
  })
  .filter(
    (row) =>
      row.missingDescription ||
      row.missingLiteral ||
      row.missingTransliteration ||
      row.descriptionLength < 100,
  )
  .sort(
    (left, right) =>
      right.priority - left.priority ||
      left.language.localeCompare(right.language) ||
      left.title.localeCompare(right.title),
  );

const missingDescriptions = rows.filter((row) => row.missingDescription).length;
const missingLiterals = rows.filter((row) => row.missingLiteral).length;
const missingTransliterations = rows.filter(
  (row) => row.missingTransliteration,
).length;

console.error(
  [
    `Audited ${idioms.length} idioms from ${target.origin}.`,
    `${missingDescriptions} ${missingDescriptions === 1 ? "is" : "are"} missing descriptions.`,
    `${missingLiterals} non-English ${
      missingLiterals === 1 ? "idiom is" : "idioms are"
    } missing literal translations.`,
    `${missingTransliterations} non-English ${
      missingTransliterations === 1 ? "idiom is" : "idioms are"
    } missing transliterations.`,
    `Writing ${rows.length} prioritized rows as CSV.`,
  ].join(" "),
);

console.log(
  [
    "priority",
    "language",
    "language_key",
    "title",
    "url",
    "equivalent_count",
    "missing_description",
    "missing_literal_translation",
    "missing_transliteration",
    "description_characters",
  ].join(","),
);
for (const row of rows) {
  console.log(
    [
      row.priority,
      row.language,
      row.languageKey,
      row.title,
      row.url,
      row.equivalentCount,
      row.missingDescription,
      row.missingLiteral,
      row.missingTransliteration,
      row.descriptionLength,
    ]
      .map(csv)
      .join(","),
  );
}

function plainText(value) {
  return (value || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function csv(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
