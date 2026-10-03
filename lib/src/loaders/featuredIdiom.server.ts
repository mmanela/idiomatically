import { gql } from "@apollo/client";
import { graphqlRequest } from "../graphql.server";

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
      literalTranslation
      equivalentCount
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

export interface FeaturedIdiom {
  id: string;
  slug: string;
  title: string;
  description: string | null;
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
  equivalentCount: number;
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
  idiom: FeaturedIdiom | null;
}

export async function loadFeaturedIdiom(
  request: Request,
  locale: string,
  totalCount: number,
  minimumIdioms = 5,
  rotationPool = 1000,
) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  if (
    totalCount < minimumIdioms ||
    url.searchParams.has("q") ||
    (!Number.isNaN(page) && page > 1)
  ) {
    return null;
  }

  const data = await graphqlRequest<
    FeaturedIdiomCandidates,
    { locale: string; limit: number }
  >(request, featuredIdiomCandidatesQuery, {
    locale,
    limit: rotationPool,
  });
  const candidates = data.idioms.edges
    .map((edge) => edge.node)
    .filter((idiom) => idiom.equivalentCount > 0);
  if (candidates.length === 0) {
    return null;
  }

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const index = (dayNumber + hashLocale(locale)) % candidates.length;
  const selected = await graphqlRequest<
    FeaturedIdiomResult,
    { id: string }
  >(request, featuredIdiomQuery, { id: candidates[index].id });
  return selected.idiom;
}

function hashLocale(locale: string) {
  return Array.from(locale).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
}
