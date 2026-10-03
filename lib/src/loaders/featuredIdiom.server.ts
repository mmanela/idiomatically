import { gql } from "@apollo/client";
import { graphqlRequest } from "../graphql.server";
import { requiresTransliteration } from "../utilities/script";

const ENGLISH_LANGUAGE_KEY = "en";

const featuredIdiomCandidatesQuery = gql`
  query GetFeaturedIdiomCandidates($locale: String!, $limit: Int!) {
    idioms(locale: $locale, limit: $limit, cursor: "0") {
      totalCount
      edges {
        node {
          id
          equivalentCount
        }
      }
    }
  }
`;

const featuredIdiomQuery = gql`
  query GetFeaturedIdiom($id: ID!) {
    idiom(id: $id) {
      id
      slug
      title
      description
      transliteration
      literalTranslation
      equivalentCount
      equivalents {
        id
        slug
        title
        description
        transliteration
        literalTranslation
        language {
          languageKey
          languageName
          countries {
            countryKey
            countryName
            emojiFlag
          }
        }
      }
      language {
        languageKey
        languageName
        countries {
          countryKey
          countryName
          emojiFlag
        }
      }
    }
  }
`;

interface FeaturedIdiomEntry {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  transliteration: string | null;
  literalTranslation: string | null;
  language: {
    languageKey: string;
    languageName: string;
    countries: Array<{
      countryKey: string;
      countryName: string;
      emojiFlag: string;
    }>;
  };
}

export interface FeaturedIdiom extends FeaturedIdiomEntry {
  description: string | null;
  equivalentCount: number;
  featuredEquivalent: FeaturedIdiomEntry;
}

interface FeaturedIdiomCandidates {
  idioms: {
    totalCount: number;
    edges: Array<{
      node: {
        id: string;
        equivalentCount: number;
      };
    }>;
  };
}

interface FeaturedIdiomResult {
  idiom:
    | (Omit<FeaturedIdiom, "featuredEquivalent"> & {
        equivalents: FeaturedIdiomEntry[];
      })
    | null;
}

export async function loadFeaturedIdiom(
  request: Request,
  locale: string,
  totalCount: number,
  minimumIdioms = 5,
  rotationPool = 1000,
): Promise<FeaturedIdiom | null> {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  if (
    totalCount < minimumIdioms ||
    url.searchParams.has("q") ||
    (!Number.isNaN(page) && page > 1)
  ) {
    return null;
  }

  const requestedLocale = locale.toLowerCase();
  const sourceLanguageKey =
    requestedLocale === "all" ? ENGLISH_LANGUAGE_KEY : requestedLocale;
  const data = await graphqlRequest<
    FeaturedIdiomCandidates,
    { locale: string; limit: number }
  >(request, featuredIdiomCandidatesQuery, {
    locale: sourceLanguageKey,
    limit: rotationPool,
  });
  const candidates = data.idioms.edges
    .map((edge) => edge.node)
    .filter((idiom) => idiom.equivalentCount > 0);
  if (candidates.length === 0) {
    return null;
  }

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const startIndex = (dayNumber + hashValue(locale)) % candidates.length;
  for (let offset = 0; offset < candidates.length; offset++) {
    const candidate = candidates[(startIndex + offset) % candidates.length];
    const selected = await graphqlRequest<
      FeaturedIdiomResult,
      { id: string }
    >(request, featuredIdiomQuery, { id: candidate.id });
    if (!selected.idiom) {
      continue;
    }

    const selectedLanguageKey =
      selected.idiom.language.languageKey.toLowerCase();
    if (selectedLanguageKey !== sourceLanguageKey) {
      continue;
    }
    if (
      selectedLanguageKey !== ENGLISH_LANGUAGE_KEY &&
      !selected.idiom.literalTranslation
    ) {
      continue;
    }
    if (
      requiresTransliteration(selected.idiom.title) &&
      !selected.idiom.transliteration
    ) {
      continue;
    }

    const eligibleEquivalents = selected.idiom.equivalents
      .filter(
        (equivalent) => {
          const equivalentLanguageKey =
            equivalent.language.languageKey.toLowerCase();
          const isNonEnglish =
            equivalentLanguageKey !== ENGLISH_LANGUAGE_KEY;
          return (
            equivalentLanguageKey !== sourceLanguageKey &&
            (!isNonEnglish || Boolean(equivalent.literalTranslation)) &&
            (!requiresTransliteration(equivalent.title) ||
              Boolean(equivalent.transliteration))
          );
        },
      )
      .sort(
        (left, right) =>
          left.language.languageName.localeCompare(
            right.language.languageName,
          ) || left.title.localeCompare(right.title),
      );
    if (eligibleEquivalents.length === 0) {
      continue;
    }

    const equivalentIndex =
      hashValue(`${locale}:${selected.idiom.id}:${dayNumber}`) %
      eligibleEquivalents.length;
    const { equivalents, ...idiom } = selected.idiom;
    return {
      ...idiom,
      featuredEquivalent: eligibleEquivalents[equivalentIndex],
    };
  }

  return null;
}

function hashValue(value: string) {
  return Array.from(value).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
}
