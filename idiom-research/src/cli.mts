import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  candidateId,
  createEmptyDataset,
  defaultResearchLocales,
  hasApprovedCorroboratedMapping,
  mappingId,
  mergeCandidate,
  mergeMapping,
  normalizeIdiomTitle,
} from "./core.js";
import { verifySources } from "./evidence.js";
import {
  IdiomaticallyGraphqlClient,
} from "./graphqlClient.js";
import { buildImportPlan, type ImportItem } from "./importPlan.js";
import { CopilotResearchClient } from "./copilotClient.js";
import type {
  EnglishCandidate,
  ExistingIdiom,
  IdiomResearchDataset,
  MappingAttempt,
  ResearchLocale,
  ReviewStatus,
} from "./types.js";

const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));
const datasetPath = resolve(
  stringArg(args, "dataset") || ".idiom-research/dataset.json",
);

if (!command || command === "help") {
  printHelp();
  process.exit(0);
}

await run();

async function run() {
  switch (command) {
    case "snapshot":
      await snapshot();
      break;
    case "discover":
      await discover();
      break;
    case "find-translations":
      await findTranslations();
      break;
    case "review":
      await review();
      break;
    case "audit":
      await audit();
      break;
    case "import":
      await importDataset();
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

async function snapshot() {
  const startedAt = new Date().toISOString();
  const dataset = await loadDataset(true);
  const existingIdioms = await loadExistingIdioms();
  let added = 0;
  let updated = 0;

  for (const idiom of existingIdioms.filter(
    (item) => item.languageKey === "en",
  )) {
    const existing = dataset.englishCandidates.find(
      (item) => item.normalizedTitle === idiom.normalizedTitle,
    );
    if (existing) {
      existing.existingIdiomId = idiom.id;
      existing.reviewStatus = "approved";
      existing.meaning = idiom.description;
      updated++;
    } else {
      dataset.englishCandidates.push({
        id: candidateId(idiom.title),
        title: idiom.title,
        normalizedTitle: idiom.normalizedTitle,
        meaning: idiom.description,
        commonness: "common",
        sources: [],
        evidence: {
          status: "unverified",
          distinctSourceCount: 0,
          notes: ["Existing site idiom; external evidence not audited yet."],
        },
        reviewStatus: "approved",
        existingIdiomId: idiom.id,
      });
      added++;
    }
  }

  const englishBySiteId = new Map(
    dataset.englishCandidates
      .filter((item) => item.existingIdiomId)
      .map((item) => [item.existingIdiomId!, item]),
  );
  for (const idiom of existingIdioms.filter(
    (item) => item.languageKey !== "en",
  )) {
    for (const english of idiom.equivalentIds
      .map((id) => englishBySiteId.get(id))
      .filter((item): item is EnglishCandidate => Boolean(item))) {
      const countryKey = idiom.countryKeys[0];
      if (!countryKey) {
        continue;
      }
      const existingMapping = dataset.mappings.find(
        (item) =>
          item.existingIdiomId === idiom.id &&
          item.englishCandidateId === english.id,
      );
      if (existingMapping) {
        updated++;
        continue;
      }
      dataset.mappings.push({
        id: mappingId(
          english.id,
          idiom.languageKey,
          countryKey,
          idiom.title,
        ),
        englishCandidateId: english.id,
        languageKey: idiom.languageKey,
        countryKey,
        title: idiom.title,
        normalizedTitle: idiom.normalizedTitle,
        meaning: idiom.description,
        sources: [],
        evidence: {
          status: "unverified",
          distinctSourceCount: 0,
          notes: ["Existing site mapping; external evidence not audited yet."],
        },
        reviewStatus: "approved",
        existingIdiomId: idiom.id,
      });
      added++;
    }
  }

  recordRun(dataset, "snapshot", startedAt, added, updated);
  await saveDataset(dataset);
  console.log(
    `GraphQL snapshot complete: ${added} added, ${updated} updated, ${existingIdioms.length} site idioms inspected.`,
  );
}

async function discover() {
  const startedAt = new Date().toISOString();
  const dataset = await loadDataset();
  const researchClient = new CopilotResearchClient();
  const rounds = numberArg(args, "rounds", 1);
  const batchSize = numberArg(args, "batch-size", 25);
  const locales = requestedLocales(dataset.locales);
  let added = 0;
  let updated = 0;

  for (let round = 0; round < rounds; round++) {
    const candidates = await researchClient.discoverEnglishIdioms(
      dataset.englishCandidates.map((item) => item.title),
      batchSize,
    );
    let roundAdded = 0;
    for (const discovered of candidates) {
      const verified = await verifySources(discovered.sources);
      const result = mergeCandidate(dataset, {
        ...discovered,
        sources: verified.sources,
        evidence: verified.evidence,
      });
      const candidate = dataset.englishCandidates.find(
        (item) =>
          item.normalizedTitle === normalizeIdiomTitle(discovered.title),
      )!;
      if (result === "added") {
        added++;
        roundAdded++;
      } else {
        updated++;
      }
      await saveDataset(dataset);

      if (candidate.evidence.status === "corroborated") {
        await ensureOneCorroboratedEquivalent(
          dataset,
          candidate,
          locales,
          researchClient,
          booleanArg(args, "refresh"),
        );
      }
      await saveDataset(dataset);
    }
    if (roundAdded === 0) {
      break;
    }
  }

  recordRun(
    dataset,
    "discover",
    startedAt,
    added,
    updated,
    researchClient.model,
  );
  await saveDataset(dataset);
  const qualified = dataset.englishCandidates.filter(
    (candidate) =>
      !candidate.existingIdiomId &&
      hasCorroboratedMapping(dataset, candidate.id),
  ).length;
  console.log(
    `Discovery complete: ${added} added, ${updated} updated, ${qualified} new English candidates have a corroborated foreign-language equivalent.`,
  );
}

async function findTranslations() {
  const startedAt = new Date().toISOString();
  const dataset = await loadDataset();
  const researchClient = new CopilotResearchClient();
  const locales = requestedLocales(dataset.locales);
  const sourceLanguage = (stringArg(args, "language") || "en").toLowerCase();
  const limit = numberArg(args, "limit", Number.MAX_SAFE_INTEGER);
  const candidateFilters = new Set(
    (stringArg(args, "candidates") || stringArg(args, "candidate") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const refresh = booleanArg(args, "refresh");
  const onePerCandidate = booleanArg(args, "one-per-candidate");
  const sourceIdioms = sourceIdiomsForLanguage(dataset, sourceLanguage)
    .filter(
      (item) =>
        candidateFilters.size === 0 ||
        candidateFilters.has(item.candidate.id),
    )
    .filter((item) => item.candidate.reviewStatus !== "rejected")
    .slice(0, limit);
  if (sourceIdioms.length === 0) {
    throw new Error(
      `No dataset idioms found for source language "${sourceLanguage}".`,
    );
  }
  let added = 0;
  let updated = 0;

  for (const sourceIdiom of sourceIdioms) {
    if (
      onePerCandidate &&
      hasCorroboratedMapping(dataset, sourceIdiom.candidate.id)
    ) {
      continue;
    }
    for (const locale of locales.filter(
      (item) => item.languageKey !== sourceLanguage,
    )) {
      const results = await researchTranslationsForLocale(
        dataset,
        sourceIdiom,
        locale,
        researchClient,
        refresh,
      );
      for (const result of results) {
        if (result === "added") {
          added++;
        } else if (result === "updated") {
          updated++;
        }
      }
      await saveDataset(dataset);
      if (
        onePerCandidate &&
        hasCorroboratedMapping(dataset, sourceIdiom.candidate.id)
      ) {
        break;
      }
    }
  }

  recordRun(
    dataset,
    "find-translations",
    startedAt,
    added,
    updated,
    researchClient.model,
  );
  await saveDataset(dataset);
  console.log(
    `Translation search complete for ${sourceLanguage}: ${added} added, ${updated} updated.`,
  );
}

async function ensureOneCorroboratedEquivalent(
  dataset: IdiomResearchDataset,
  candidate: EnglishCandidate,
  locales: ResearchLocale[],
  researchClient: CopilotResearchClient,
  refresh: boolean,
) {
  if (hasCorroboratedMapping(dataset, candidate.id)) {
    return;
  }
  for (const locale of locales) {
    await researchTranslationsForLocale(
      dataset,
      {
        candidate,
        sourceTitle: candidate.title,
        sourceMeaning: candidate.meaning,
        sourceLanguage: "en",
      },
      locale,
      researchClient,
      refresh,
    );
    await saveDataset(dataset);
    if (hasCorroboratedMapping(dataset, candidate.id)) {
      return;
    }
  }
}

interface SourceIdiom {
  candidate: EnglishCandidate;
  sourceTitle: string;
  sourceMeaning: string;
  sourceLanguage: string;
}

function sourceIdiomsForLanguage(
  dataset: IdiomResearchDataset,
  sourceLanguage: string,
): SourceIdiom[] {
  if (sourceLanguage === "en") {
    return dataset.englishCandidates.map((candidate) => ({
      candidate,
      sourceTitle: candidate.title,
      sourceMeaning: candidate.meaning,
      sourceLanguage,
    }));
  }
  const candidatesById = new Map(
    dataset.englishCandidates.map((candidate) => [candidate.id, candidate]),
  );
  return dataset.mappings
    .filter((mapping) => mapping.languageKey === sourceLanguage)
    .flatMap((mapping) => {
      const candidate = candidatesById.get(mapping.englishCandidateId);
      return candidate
        ? [
            {
              candidate,
              sourceTitle: mapping.title,
              sourceMeaning: mapping.meaning,
              sourceLanguage,
            },
          ]
        : [];
    });
}

async function researchTranslationsForLocale(
  dataset: IdiomResearchDataset,
  sourceIdiom: SourceIdiom,
  locale: ResearchLocale,
  researchClient: CopilotResearchClient,
  refresh: boolean,
): Promise<Array<"added" | "updated">> {
  const results: Array<"added" | "updated"> = [];
  const existingMappings = dataset.mappings.filter(
    (item) =>
      item.englishCandidateId === sourceIdiom.candidate.id &&
      item.languageKey === locale.languageKey &&
      item.countryKey === locale.countryKey,
  );

  for (const existingMapping of existingMappings.filter(
    (mapping) =>
      refresh || mapping.evidence.status !== "corroborated",
  )) {
    const priorVerification = latestAttempt(dataset, {
      englishCandidateId: sourceIdiom.candidate.id,
      locale,
      mode: "verify-existing",
      proposedTitle: existingMapping.title,
    });
    if (priorVerification && !refresh) {
      continue;
    }
    const result = await researchMapping(
      dataset,
      sourceIdiom,
      locale,
      researchClient,
      {
        mode: "verify-existing",
        proposedTitle: existingMapping.title,
      },
    );
    if (result) {
      results.push(result);
    }
  }

  const excludedTitles = dataset.mappings
    .filter(
      (mapping) =>
        mapping.englishCandidateId === sourceIdiom.candidate.id &&
        mapping.languageKey === locale.languageKey &&
        mapping.countryKey === locale.countryKey,
    )
    .map((mapping) => mapping.title);
  const excludedTitlesKey = excludedTitles
    .map(normalizeIdiomTitle)
    .sort()
    .join("|");
  const priorSearch = latestAttempt(dataset, {
    englishCandidateId: sourceIdiom.candidate.id,
    locale,
    mode: "find-new",
    excludedTitlesKey,
  });
  if (!priorSearch || refresh) {
    const result = await researchMapping(
      dataset,
      sourceIdiom,
      locale,
      researchClient,
      {
        mode: "find-new",
        excludedTitles,
        excludedTitlesKey,
      },
    );
    if (result) {
      results.push(result);
    }
  }
  return results;
}

async function researchMapping(
  dataset: IdiomResearchDataset,
  sourceIdiom: SourceIdiom,
  locale: ResearchLocale,
  researchClient: CopilotResearchClient,
  attempt: {
    mode: MappingAttempt["mode"];
    proposedTitle?: string;
    excludedTitles?: string[];
    excludedTitlesKey?: string;
  },
): Promise<"added" | "updated" | null> {
  let researched: Awaited<
    ReturnType<CopilotResearchClient["researchMapping"]>
  >;
  try {
    researched = await researchClient.researchMapping(
      sourceIdiom.candidate.title,
      sourceIdiom.candidate.meaning,
      locale,
      {
        proposedTitle: attempt.proposedTitle,
        excludedTitles: attempt.excludedTitles,
        sourceExpression: sourceIdiom.sourceTitle,
        sourceLanguage: sourceIdiom.sourceLanguage,
      },
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    recordMappingAttempt(dataset, sourceIdiom.candidate.id, locale, {
      ...attempt,
      result: "error",
      reason,
    });
    console.error(
      `Research error for ${sourceIdiom.candidate.title} -> ${locale.label}: ${reason}`,
    );
    return null;
  }
  if (!researched.found || !researched.title || !researched.meaning) {
    recordMappingAttempt(dataset, sourceIdiom.candidate.id, locale, {
      ...attempt,
      result: "not-found",
      reason:
        researched.noEquivalentReason ||
        "No well-attested equivalent was found.",
    });
    return null;
  }
  if (
    attempt.proposedTitle &&
    normalizeIdiomTitle(researched.title) !==
      normalizeIdiomTitle(attempt.proposedTitle)
  ) {
    recordMappingAttempt(dataset, sourceIdiom.candidate.id, locale, {
      ...attempt,
      result: "not-found",
      reason: `Research returned "${researched.title}" instead of corroborating the proposed expression "${attempt.proposedTitle}".`,
    });
    return null;
  }
  if (
    attempt.excludedTitles?.some(
      (title) =>
        normalizeIdiomTitle(title) ===
        normalizeIdiomTitle(researched.title!),
    )
  ) {
    recordMappingAttempt(dataset, sourceIdiom.candidate.id, locale, {
      ...attempt,
      result: "insufficient",
      reason: `Research returned the already-known expression "${researched.title}".`,
    });
    return null;
  }

  const verified = await verifySources(researched.sources, {
    requireAttestedForm: true,
  });
  const result = mergeMapping(dataset, {
    englishCandidateId: sourceIdiom.candidate.id,
    languageKey: locale.languageKey,
    countryKey: locale.countryKey,
    title: researched.title,
    meaning: researched.meaning,
    literalTranslation: researched.literalTranslation || undefined,
    transliteration: researched.transliteration || undefined,
    usageNotes: researched.usageNotes || undefined,
    sources: verified.sources,
    evidence: verified.evidence,
  });
  recordMappingAttempt(dataset, sourceIdiom.candidate.id, locale, {
    ...attempt,
    result:
      verified.evidence.status === "corroborated"
        ? "corroborated"
        : "insufficient",
    reason: verified.evidence.notes.join(" "),
  });
  return result;
}

async function review() {
  const dataset = await loadDataset();
  const id = requiredStringArg(args, "id");
  const decision = requiredStringArg(args, "decision") as ReviewStatus;
  const overrideEvidence = booleanArg(args, "override-evidence");
  if (!["approved", "rejected", "pending"].includes(decision)) {
    throw new Error("Review decision must be approved, rejected, or pending.");
  }
  const candidate = dataset.englishCandidates.find((item) => item.id === id);
  const mapping = dataset.mappings.find((item) => item.id === id);
  const item = candidate || mapping;
  if (!item) {
    throw new Error(`No candidate or mapping found with id ${id}.`);
  }
  if (
    decision === "approved" &&
    !item.existingIdiomId &&
    item.evidence.status !== "corroborated" &&
    !(candidate && overrideEvidence)
  ) {
    throw new Error("Only corroborated research can be approved.");
  }
  if (
    decision === "approved" &&
    candidate &&
    !candidate.existingIdiomId &&
    !hasApprovedCorroboratedMapping(dataset, candidate.id)
  ) {
    throw new Error(
      "Approve at least one corroborated foreign-language mapping before approving a new English idiom.",
    );
  }
  if (candidate && overrideEvidence) {
    if (decision !== "approved") {
      throw new Error("--override-evidence can only be used with approval.");
    }
    candidate.reviewOverride = {
      approvedAt: new Date().toISOString(),
      reason: requiredStringArg(args, "reason"),
    };
  } else if (candidate && decision !== "approved") {
    delete candidate.reviewOverride;
  }
  item.reviewStatus = decision;
  await saveDataset(dataset);
  console.log(`${id} marked ${decision}.`);
}

async function audit() {
  const startedAt = new Date().toISOString();
  const dataset = await loadDataset();
  const id = stringArg(args, "id");
  let updated = 0;

  for (const candidate of dataset.englishCandidates.filter(
    (item) => !id || item.id === id,
  )) {
    if (candidate.sources.length === 0) {
      continue;
    }
    const verified = await verifySources(candidate.sources);
    candidate.sources = verified.sources;
    candidate.evidence = verified.evidence;
    updated++;
  }
  for (const mapping of dataset.mappings.filter(
    (item) => !id || item.id === id,
  )) {
    if (mapping.sources.length === 0) {
      continue;
    }
    const verified = await verifySources(mapping.sources, {
      requireAttestedForm: true,
    });
    mapping.sources = verified.sources;
    mapping.evidence = verified.evidence;
    updated++;
  }

  for (const mapping of dataset.mappings) {
    if (
      mapping.reviewStatus === "approved" &&
      !mapping.existingIdiomId &&
      mapping.evidence.status !== "corroborated"
    ) {
      mapping.reviewStatus = "pending";
    }
  }
  for (const candidate of dataset.englishCandidates) {
    if (
      candidate.reviewStatus === "approved" &&
      !candidate.existingIdiomId &&
      ((!candidate.reviewOverride &&
        candidate.evidence.status !== "corroborated") ||
        !hasApprovedCorroboratedMapping(dataset, candidate.id))
    ) {
      candidate.reviewStatus = "pending";
    }
  }

  recordRun(dataset, "audit", startedAt, 0, updated);
  await saveDataset(dataset);
  console.log(`Audit complete: ${updated} records checked.`);
}

async function importDataset() {
  const dataset = await loadDataset();
  const api = new IdiomaticallyGraphqlClient();
  const apply = booleanArg(args, "apply");
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (
    apply &&
    !localHosts.has(api.url.hostname) &&
    !booleanArg(args, "allow-production")
  ) {
    throw new Error(
      "Refusing a non-local GraphQL import without --allow-production.",
    );
  }

  const approvedMappings = dataset.mappings.filter(
    (mapping) =>
      mapping.reviewStatus === "approved" &&
      mapping.evidence.status === "corroborated",
  );
  const approvedCandidates = dataset.englishCandidates.filter(
    (candidate) =>
      candidate.reviewStatus === "approved" &&
      (candidate.existingIdiomId ||
        ((candidate.evidence.status === "corroborated" ||
          Boolean(candidate.reviewOverride)) &&
          hasApprovedCorroboratedMapping(dataset, candidate.id))),
  );
  const approvedCandidateIds = new Set(
    approvedCandidates.map((candidate) => candidate.id),
  );
  const eligibleMappings = approvedMappings.filter((mapping) =>
    approvedCandidateIds.has(mapping.englishCandidateId),
  );

  const existing = await api.listIdioms();
  const existingById = new Map(existing.map((idiom) => [idiom.id, idiom]));
  const plannedCandidates: ImportItem[] = approvedCandidates.map(
    (candidate) => {
      const existingIdiom = candidate.existingIdiomId
        ? existingById.get(candidate.existingIdiomId)
        : undefined;
      return {
        researchId: candidate.id,
        preferredExistingId: candidate.existingIdiomId,
        title: candidate.title,
        description: candidate.meaning,
        languageKey: "en",
        countryKeys: existingIdiom?.countryKeys || ["US"],
      };
    },
  );
  const plannedMappings: ImportItem[] = eligibleMappings.map((mapping) => ({
    researchId: mapping.id,
    preferredExistingId: mapping.existingIdiomId,
    title: mapping.title,
    description: mapping.meaning,
    languageKey: mapping.languageKey,
    countryKeys: [mapping.countryKey],
    literalTranslation: mapping.literalTranslation,
    transliteration: mapping.transliteration,
  }));
  const importItems = [...plannedCandidates, ...plannedMappings];
  const plan = buildImportPlan(
    existing,
    importItems,
    eligibleMappings.map((mapping) => ({
      fromResearchId: mapping.englishCandidateId,
      toResearchId: mapping.id,
    })),
  );
  const existingResearchRecords = Array.from(
    plan.researchToRef.values(),
  ).filter((ref) => ref.startsWith("existing:")).length;
  const coalescedBatchDuplicates = plan.creations.reduce(
    (count, creation) => count + creation.researchIds.length - 1,
    0,
  );

  console.log(
    JSON.stringify(
      {
        apply,
        graphqlUrl: api.url.toString(),
        researchRecords: importItems.length,
        newIdioms: plan.creations.length,
        reusedExistingIdioms: existingResearchRecords,
        coalescedBatchDuplicates,
        relationshipsToAdd: plan.relationships.length,
        skippedExistingRelationships: plan.skippedExistingRelationships,
      },
      null,
      2,
    ),
  );
  if (!apply) {
    return;
  }

  const refToId = new Map(plan.existingRefIds);
  for (const creation of plan.creations) {
    const created = await api.createIdiom(creation.input);
    refToId.set(creation.ref, created.id);
  }

  for (const relationship of plan.relationships) {
    const fromId = refToId.get(relationship.fromRef);
    const toId = refToId.get(relationship.toRef);
    if (!fromId || !toId) {
      throw new Error(
        `Import plan failed to resolve relationship ${relationship.fromRef} -> ${relationship.toRef}.`,
      );
    }
    await api.addEquivalent(fromId, toId);
  }

  const verificationPlan = buildImportPlan(
    await api.listIdioms(),
    importItems,
    eligibleMappings.map((mapping) => ({
      fromResearchId: mapping.englishCandidateId,
      toResearchId: mapping.id,
    })),
  );
  if (
    verificationPlan.creations.length > 0 ||
    verificationPlan.relationships.length > 0
  ) {
    throw new Error(
      `Post-import verification failed: ${verificationPlan.creations.length} idioms and ${verificationPlan.relationships.length} relationships remain unapplied.`,
    );
  }
  console.log("GraphQL import applied successfully.");
}

function hasCorroboratedMapping(
  dataset: IdiomResearchDataset,
  englishCandidateId: string,
) {
  return dataset.mappings.some(
    (mapping) =>
      mapping.englishCandidateId === englishCandidateId &&
      mapping.evidence.status === "corroborated",
  );
}

function latestAttempt(
  dataset: IdiomResearchDataset,
  query: {
    englishCandidateId: string;
    locale: ResearchLocale;
    mode: MappingAttempt["mode"];
    proposedTitle?: string;
    excludedTitlesKey?: string;
  },
) {
  return [...dataset.mappingAttempts]
    .reverse()
    .find(
      (attempt) =>
        attempt.englishCandidateId === query.englishCandidateId &&
        attempt.languageKey === query.locale.languageKey &&
        attempt.countryKey === query.locale.countryKey &&
        attempt.mode === query.mode &&
        attempt.proposedTitle === query.proposedTitle &&
        attempt.excludedTitlesKey === query.excludedTitlesKey &&
        attempt.result !== "error",
    );
}

function recordMappingAttempt(
  dataset: IdiomResearchDataset,
  englishCandidateId: string,
  locale: ResearchLocale,
  result: Pick<
    MappingAttempt,
    | "mode"
    | "proposedTitle"
    | "excludedTitlesKey"
    | "result"
    | "reason"
  >,
) {
  dataset.mappingAttempts.push({
    englishCandidateId,
    languageKey: locale.languageKey,
    countryKey: locale.countryKey,
    attemptedAt: new Date().toISOString(),
    ...result,
  });
}

async function loadDataset(
  createIfMissing = false,
): Promise<IdiomResearchDataset> {
  try {
    const dataset = JSON.parse(
      await readFile(datasetPath, "utf8"),
    ) as IdiomResearchDataset;
    if (dataset.schemaVersion !== 1) {
      throw new Error(`Unsupported dataset schema ${dataset.schemaVersion}.`);
    }
    dataset.mappingAttempts ||= [];
    dataset.mappingAttempts = dataset.mappingAttempts.map((attempt) => ({
      ...attempt,
      mode: attempt.mode || "find-new",
    }));
    return dataset;
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (createIfMissing && code === "ENOENT") {
      return createEmptyDataset();
    }
    throw error;
  }
}

async function saveDataset(dataset: IdiomResearchDataset) {
  dataset.updatedAt = new Date().toISOString();
  dataset.englishCandidates.sort((a, b) => a.title.localeCompare(b.title));
  dataset.mappings.sort((a, b) => a.id.localeCompare(b.id));
  await mkdir(dirname(datasetPath), { recursive: true });
  await writeFile(datasetPath, `${JSON.stringify(dataset, null, 2)}\n`);
}

async function loadExistingIdioms(): Promise<ExistingIdiom[]> {
  return new IdiomaticallyGraphqlClient().listIdioms();
}

function requestedLocales(configured: ResearchLocale[]): ResearchLocale[] {
  const requested = stringArg(args, "locales");
  if (!requested) {
    return configured.length > 0 ? configured : defaultResearchLocales;
  }
  const keys = new Set(requested.split(",").map((item) => item.trim()));
  const locales = configured.filter((locale) =>
    keys.has(`${locale.languageKey}-${locale.countryKey}`),
  );
  if (locales.length !== keys.size) {
    throw new Error(
      `Unknown locale. Configured locales: ${configured
        .map((locale) => `${locale.languageKey}-${locale.countryKey}`)
        .join(", ")}`,
    );
  }
  return locales;
}

function recordRun(
  dataset: IdiomResearchDataset,
  runCommand: string,
  startedAt: string,
  added: number,
  updated: number,
  model?: string,
) {
  dataset.runs.push({
    command: runCommand,
    startedAt,
    completedAt: new Date().toISOString(),
    model,
    added,
    updated,
  });
}

function parseArgs(values: string[]): Map<string, string | boolean> {
  const parsed = new Map<string, string | boolean>();
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (!value.startsWith("--")) {
      throw new Error(`Unexpected argument: ${value}`);
    }
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      parsed.set(key, true);
    } else {
      parsed.set(key, next);
      index++;
    }
  }
  return parsed;
}

function stringArg(
  parsed: Map<string, string | boolean>,
  name: string,
): string | undefined {
  const value = parsed.get(name);
  return typeof value === "string" ? value : undefined;
}

function requiredStringArg(
  parsed: Map<string, string | boolean>,
  name: string,
) {
  const value = stringArg(parsed, name);
  if (!value) {
    throw new Error(`--${name} is required.`);
  }
  return value;
}

function booleanArg(parsed: Map<string, string | boolean>, name: string) {
  return parsed.get(name) === true;
}

function numberArg(
  parsed: Map<string, string | boolean>,
  name: string,
  fallback: number,
) {
  const value = stringArg(parsed, name);
  if (!value) {
    return fallback;
  }
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return parsedValue;
}

function printHelp() {
  console.log(`Idiomatically evidence-backed research pipeline

Commands:
  snapshot  Incrementally merge the site's current GraphQL data into the dataset.
  discover  Find English idioms and at least one corroborated foreign equivalent.
  find-translations
            Given a source language (default en), corroborate known and find new equivalents.
  review    Mark one candidate or mapping approved, rejected, or pending.
  audit     Re-fetch and re-check evidence URLs and approval invariants.
  import    Plan GraphQL mutations; add --apply to execute them.

Common options:
  --dataset <path>       Dataset JSON path (default .idiom-research/dataset.json)

Examples:
  npm run research -- snapshot
  npm run research -- discover --rounds 3 --batch-size 25
  npm run research -- find-translations
  npm run research -- find-translations --language es --locales fr-FR,de-DE
  npm run research -- find-translations --candidates <id-1>,<id-2>
  npm run research -- find-translations --candidates <ids> --one-per-candidate
  npm run research -- review --id <mapping-id> --decision approved
  npm run research -- review --id <candidate-id> --decision approved
  npm run research -- review --id <candidate-id> --decision approved --override-evidence --reason <reason>
  npm run research -- audit
  npm run research -- import
  npm run research -- import --apply --allow-production
`);
}
