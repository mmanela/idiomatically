import { slugify } from "transliteration";
import { normalizeIdiomTitle } from "./core.js";
import type { ExistingIdiom } from "./types.js";

export interface ImportItem {
  researchId: string;
  preferredExistingId?: string;
  title: string;
  description: string;
  languageKey: string;
  countryKeys: string[];
  literalTranslation?: string;
  transliteration?: string;
}

export interface ImportRelationship {
  fromResearchId: string;
  toResearchId: string;
}

export interface ImportCreation {
  ref: string;
  researchIds: string[];
  input: Omit<ImportItem, "researchId" | "preferredExistingId">;
}

export interface ImportPlan {
  researchToRef: Map<string, string>;
  existingRefIds: Map<string, string>;
  creations: ImportCreation[];
  relationships: Array<{ fromRef: string; toRef: string }>;
  skippedExistingRelationships: number;
}

export function buildImportPlan(
  existing: ExistingIdiom[],
  items: ImportItem[],
  relationships: ImportRelationship[],
): ImportPlan {
  assertUniqueResearchIds(items);
  const titleIndex = groupBy(existing, (idiom) => idiom.normalizedTitle);
  const slugIndex = groupBy(existing, (idiom) => idiom.slug);
  const existingById = new Map(existing.map((idiom) => [idiom.id, idiom]));
  const researchToRef = new Map<string, string>();
  const existingRefIds = new Map<string, string>();
  const creations: ImportCreation[] = [];
  const creationByTitle = new Map<string, ImportCreation>();
  const creationBySlug = new Map<string, ImportCreation>();

  for (const item of items) {
    if (item.preferredExistingId) {
      const preferred = existingById.get(item.preferredExistingId);
      if (!preferred) {
        throw new Error(
          `Stale existing idiom ID for "${item.title}": ${item.preferredExistingId}. Run snapshot again before importing.`,
        );
      }
      assertExistingCompatible(item, preferred);
      const ref = `existing:${preferred.id}`;
      researchToRef.set(item.researchId, ref);
      existingRefIds.set(ref, preferred.id);
      continue;
    }
    const normalizedTitle = normalizeIdiomTitle(item.title);
    const slug = slugify(item.title);
    const matches = uniqueIdioms([
      ...(titleIndex.get(normalizedTitle) || []),
      ...(slugIndex.get(slug) || []),
    ]);
    if (matches.length > 1) {
      throw new Error(
        `Ambiguous duplicate match for "${item.title}": ${matches
          .map((match) => `${match.id} (${match.title})`)
          .join(", ")}.`,
      );
    }
    if (matches.length === 1) {
      const match = matches[0];
      assertExistingCompatible(item, match);
      const ref = `existing:${match.id}`;
      researchToRef.set(item.researchId, ref);
      existingRefIds.set(ref, match.id);
      continue;
    }

    const titleCreation = creationByTitle.get(normalizedTitle);
    const slugCreation = creationBySlug.get(slug);
    if (
      titleCreation &&
      slugCreation &&
      titleCreation.ref !== slugCreation.ref
    ) {
      throw new Error(
        `Planned title and slug resolve to different records for "${item.title}".`,
      );
    }
    const creation = titleCreation || slugCreation;
    if (creation) {
      assertPlannedCompatible(item, creation);
      creation.researchIds.push(item.researchId);
      creation.input.countryKeys = Array.from(
        new Set([...creation.input.countryKeys, ...item.countryKeys]),
      ).sort();
      researchToRef.set(item.researchId, creation.ref);
      continue;
    }

    const ref = `new:${creations.length + 1}`;
    const newCreation: ImportCreation = {
      ref,
      researchIds: [item.researchId],
      input: {
        title: item.title,
        description: item.description,
        languageKey: item.languageKey,
        countryKeys: [...new Set(item.countryKeys)].sort(),
        literalTranslation: item.literalTranslation,
        transliteration: item.transliteration,
      },
    };
    creations.push(newCreation);
    creationByTitle.set(normalizedTitle, newCreation);
    creationBySlug.set(slug, newCreation);
    researchToRef.set(item.researchId, ref);
  }

  const plannedRelationships: Array<{ fromRef: string; toRef: string }> = [];
  const seenPairs = new Set<string>();
  let skippedExistingRelationships = 0;
  for (const relationship of relationships) {
    const fromRef = researchToRef.get(relationship.fromResearchId);
    const toRef = researchToRef.get(relationship.toResearchId);
    if (!fromRef || !toRef) {
      throw new Error(
        `Relationship references an unplanned record: ${relationship.fromResearchId} -> ${relationship.toResearchId}.`,
      );
    }
    if (fromRef === toRef) {
      throw new Error(
        `Relationship collapses to the same idiom: ${relationship.fromResearchId} -> ${relationship.toResearchId}.`,
      );
    }
    const pairKey = [fromRef, toRef].sort().join("\u001f");
    if (seenPairs.has(pairKey)) {
      continue;
    }
    seenPairs.add(pairKey);

    if (fromRef.startsWith("existing:") && toRef.startsWith("existing:")) {
      const fromId = existingRefIds.get(fromRef)!;
      const toId = existingRefIds.get(toRef)!;
      const alreadyRelated =
        existingById.get(fromId)?.equivalentIds.includes(toId) ||
        existingById.get(toId)?.equivalentIds.includes(fromId);
      if (alreadyRelated) {
        skippedExistingRelationships++;
        continue;
      }
    }
    plannedRelationships.push({ fromRef, toRef });
  }

  return {
    researchToRef,
    existingRefIds,
    creations,
    relationships: plannedRelationships,
    skippedExistingRelationships,
  };
}

function assertUniqueResearchIds(items: ImportItem[]) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.researchId)) {
      throw new Error(`Duplicate research ID in import batch: ${item.researchId}.`);
    }
    seen.add(item.researchId);
  }
}

function assertExistingCompatible(item: ImportItem, existing: ExistingIdiom) {
  if (existing.languageKey !== item.languageKey) {
    throw new Error(
      `Duplicate collision for "${item.title}": existing idiom ${existing.id} uses language ${existing.languageKey}, not ${item.languageKey}.`,
    );
  }
  const missingCountries = item.countryKeys.filter(
    (country) => !existing.countryKeys.includes(country),
  );
  if (missingCountries.length > 0) {
    throw new Error(
      `Duplicate collision for "${item.title}": existing idiom ${existing.id} is missing countries ${missingCountries.join(", ")}. Update it explicitly instead of creating a duplicate.`,
    );
  }
}

function assertPlannedCompatible(
  item: ImportItem,
  creation: ImportCreation,
) {
  if (creation.input.languageKey !== item.languageKey) {
    throw new Error(
      `Planned duplicate "${item.title}" has conflicting languages ${creation.input.languageKey} and ${item.languageKey}.`,
    );
  }
  if (
    normalizeField(creation.input.description) !==
      normalizeField(item.description) ||
    normalizeField(creation.input.literalTranslation) !==
      normalizeField(item.literalTranslation) ||
    normalizeField(creation.input.transliteration) !==
      normalizeField(item.transliteration)
  ) {
    throw new Error(
      `Planned duplicate "${item.title}" has conflicting content and requires manual review.`,
    );
  }
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const value = key(item);
    groups.set(value, [...(groups.get(value) || []), item]);
  }
  return groups;
}

function uniqueIdioms(items: ExistingIdiom[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function normalizeField(value?: string) {
  return (value || "").normalize("NFKC").replace(/\s+/g, " ").trim();
}
