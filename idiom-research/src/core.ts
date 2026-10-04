import { createHash } from "node:crypto";
import type {
  EvidenceSource,
  EvidenceSummary,
  EnglishCandidate,
  IdiomMapping,
  IdiomResearchDataset,
  ResearchLocale,
} from "./types.js";

export const defaultResearchLocales: ResearchLocale[] = [
  { languageKey: "es", countryKey: "ES", label: "Spanish (Spain)" },
  { languageKey: "fr", countryKey: "FR", label: "French (France)" },
  { languageKey: "de", countryKey: "DE", label: "German (Germany)" },
  { languageKey: "it", countryKey: "IT", label: "Italian (Italy)" },
  { languageKey: "pt", countryKey: "BR", label: "Portuguese (Brazil)" },
  { languageKey: "ja", countryKey: "JP", label: "Japanese (Japan)" },
  { languageKey: "zh", countryKey: "CN", label: "Chinese (China)" },
  { languageKey: "ru", countryKey: "RU", label: "Russian (Russia)" },
  { languageKey: "el", countryKey: "GR", label: "Greek (Greece)" },
];

export function createEmptyDataset(
  locales = defaultResearchLocales,
): IdiomResearchDataset {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    locales,
    englishCandidates: [],
    mappings: [],
    mappingAttempts: [],
    runs: [],
  };
}

export function normalizeIdiomTitle(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’‘`]/g, "'")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stableId(...parts: string[]): string {
  return createHash("sha256")
    .update(parts.join("\u001f"))
    .digest("hex")
    .slice(0, 24);
}

export function candidateId(title: string): string {
  return `en-${stableId(normalizeIdiomTitle(title))}`;
}

export function mappingId(
  englishCandidateId: string,
  languageKey: string,
  countryKey: string,
  title: string,
): string {
  return `${languageKey}-${countryKey.toLowerCase()}-${stableId(
    englishCandidateId,
    languageKey.toLowerCase(),
    countryKey.toUpperCase(),
    normalizeIdiomTitle(title),
  )}`;
}

export function sourceHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function hasApprovedCorroboratedMapping(
  dataset: IdiomResearchDataset,
  englishCandidateId: string,
): boolean {
  return dataset.mappings.some(
    (mapping) =>
      mapping.englishCandidateId === englishCandidateId &&
      mapping.reviewStatus === "approved" &&
      mapping.evidence.status === "corroborated",
  );
}

export function summarizeEvidence(sources: EvidenceSource[]): EvidenceSummary {
  const verifiedSources = sources.filter(
    (source) =>
      source.excerptMatched === true &&
      source.httpStatus !== undefined &&
      source.httpStatus >= 200 &&
      source.httpStatus < 400,
  );
  const distinctSourceCount = new Set(
    verifiedSources.map((source) => sourceHost(source.finalUrl || source.url)),
  ).size;
  const notes: string[] = [];

  if (verifiedSources.length < 2) {
    notes.push("Fewer than two source excerpts were verified.");
  }
  if (distinctSourceCount < 2) {
    notes.push("Evidence must come from at least two distinct publishers.");
  }

  return {
    status:
      verifiedSources.length >= 2 && distinctSourceCount >= 2
        ? "corroborated"
        : "insufficient",
    distinctSourceCount,
    verifiedAt: new Date().toISOString(),
    notes,
  };
}

export function mergeCandidate(
  dataset: IdiomResearchDataset,
  candidate: Omit<
    EnglishCandidate,
    "id" | "normalizedTitle" | "reviewStatus"
  >,
): "added" | "updated" {
  const normalizedTitle = normalizeIdiomTitle(candidate.title);
  const existing = dataset.englishCandidates.find(
    (item) => item.normalizedTitle === normalizedTitle,
  );
  if (existing) {
    existing.sources = candidate.sources;
    existing.evidence = candidate.evidence;
    if (!existing.existingIdiomId) {
      existing.meaning = candidate.meaning;
      existing.usageNotes = candidate.usageNotes;
      existing.commonness = candidate.commonness;
    }
    return "updated";
  }

  dataset.englishCandidates.push({
    ...candidate,
    id: candidateId(candidate.title),
    normalizedTitle,
    reviewStatus: "pending",
  });
  return "added";
}

export function mergeMapping(
  dataset: IdiomResearchDataset,
  mapping: Omit<IdiomMapping, "id" | "normalizedTitle" | "reviewStatus">,
): "added" | "updated" {
  const normalizedTitle = normalizeIdiomTitle(mapping.title);
  const existing = dataset.mappings.find(
    (item) =>
      item.englishCandidateId === mapping.englishCandidateId &&
      item.languageKey === mapping.languageKey &&
      item.countryKey === mapping.countryKey &&
      item.normalizedTitle === normalizedTitle,
  );
  if (existing) {
    existing.sources = mapping.sources;
    existing.evidence = mapping.evidence;
    if (!existing.existingIdiomId) {
      existing.meaning = mapping.meaning;
      existing.literalTranslation = mapping.literalTranslation;
      existing.transliteration = mapping.transliteration;
      existing.usageNotes = mapping.usageNotes;
    }
    return "updated";
  }

  dataset.mappings.push({
    ...mapping,
    id: mappingId(
      mapping.englishCandidateId,
      mapping.languageKey,
      mapping.countryKey,
      mapping.title,
    ),
    normalizedTitle,
    reviewStatus: "pending",
  });
  return "added";
}

export function normalizePageText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

export function excerptAppearsInPage(excerpt: string, page: string): boolean {
  const normalizedExcerpt = normalizePageText(excerpt);
  const normalizedPage = normalizePageText(page);
  if (normalizedExcerpt.length < 20) {
    return false;
  }
  if (normalizedPage.includes(normalizedExcerpt)) {
    return true;
  }

  const meaningfulTokens = normalizedExcerpt
    .split(/\s+/)
    .filter((token) => token.length >= 4);
  if (meaningfulTokens.length < 4) {
    return false;
  }
  const matchedTokens = meaningfulTokens.filter((token) =>
    normalizedPage.includes(token),
  ).length;
  return matchedTokens / meaningfulTokens.length >= 0.85;
}
