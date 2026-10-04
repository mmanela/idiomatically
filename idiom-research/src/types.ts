export type ReviewStatus = "pending" | "approved" | "rejected";
export type EvidenceStatus = "unverified" | "corroborated" | "insufficient";

export interface ResearchLocale {
  languageKey: string;
  countryKey: string;
  label: string;
}

export interface EvidenceSource {
  url: string;
  title: string;
  publisher: string;
  excerpt: string;
  attestedForm?: string;
  supports: string;
  accessedAt?: string;
  httpStatus?: number;
  finalUrl?: string;
  excerptMatched?: boolean;
  verificationError?: string;
}

export interface EvidenceSummary {
  status: EvidenceStatus;
  distinctSourceCount: number;
  verifiedAt?: string;
  notes: string[];
}

export interface EnglishCandidate {
  id: string;
  title: string;
  normalizedTitle: string;
  meaning: string;
  usageNotes?: string;
  commonness: "very-common" | "common" | "regional";
  sources: EvidenceSource[];
  evidence: EvidenceSummary;
  reviewStatus: ReviewStatus;
  reviewOverride?: {
    approvedAt: string;
    reason: string;
  };
  existingIdiomId?: string;
}

export interface IdiomMapping {
  id: string;
  englishCandidateId: string;
  languageKey: string;
  countryKey: string;
  title: string;
  normalizedTitle: string;
  meaning: string;
  literalTranslation?: string;
  transliteration?: string;
  usageNotes?: string;
  sources: EvidenceSource[];
  evidence: EvidenceSummary;
  reviewStatus: ReviewStatus;
  existingIdiomId?: string;
}

export interface ResearchRun {
  command: string;
  startedAt: string;
  completedAt: string;
  model?: string;
  added: number;
  updated: number;
}

export interface MappingAttempt {
  englishCandidateId: string;
  languageKey: string;
  countryKey: string;
  attemptedAt: string;
  mode: "verify-existing" | "find-new";
  proposedTitle?: string;
  excludedTitlesKey?: string;
  result: "not-found" | "insufficient" | "corroborated" | "error";
  reason?: string;
}

export interface IdiomResearchDataset {
  schemaVersion: 1;
  updatedAt: string;
  locales: ResearchLocale[];
  englishCandidates: EnglishCandidate[];
  mappings: IdiomMapping[];
  mappingAttempts: MappingAttempt[];
  runs: ResearchRun[];
}

export interface ExistingIdiom {
  id: string;
  title: string;
  normalizedTitle: string;
  slug: string;
  description: string;
  languageKey: string;
  countryKeys: string[];
  equivalentIds: string[];
}
