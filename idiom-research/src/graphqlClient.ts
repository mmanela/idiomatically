import type { ExistingIdiom } from "./types.js";
import { normalizeIdiomTitle } from "./core.js";

interface GraphqlEnvelope<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface GraphqlIdiom {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  literalTranslation?: string | null;
  transliteration?: string | null;
  language: {
    languageKey: string;
    countries: Array<{ countryKey: string }>;
  };
  equivalents: Array<{ id: string }>;
}

interface OperationResult {
  status: string;
  message?: string | null;
  idiom?: { id: string; slug: string; title: string } | null;
}

interface ListIdiomsData {
  idioms: {
    edges: Array<{ node: GraphqlIdiom }>;
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export interface CreateIdiomInput {
  title: string;
  description: string;
  languageKey: string;
  countryKeys: string[];
  literalTranslation?: string;
  transliteration?: string;
  relatedIdiomId?: string;
}

const listIdiomsQuery = `
  query ResearchIdioms($cursor: String, $limit: Int!) {
    idioms(cursor: $cursor, locale: "all", limit: $limit) {
      edges {
        node {
          id
          slug
          title
          description
          literalTranslation
          transliteration
          language {
            languageKey
            countries { countryKey }
          }
          equivalents { id }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const createIdiomMutation = `
  mutation ResearchCreateIdiom($idiom: IdiomCreateInput!) {
    createIdiom(idiom: $idiom) {
      status
      message
      idiom { id slug title }
    }
  }
`;

const addEquivalentMutation = `
  mutation ResearchAddEquivalent($idiomId: ID!, $equivalentId: ID!) {
    addEquivalent(idiomId: $idiomId, equivalentId: $equivalentId) {
      status
      message
    }
  }
`;

export class IdiomaticallyGraphqlClient {
  readonly url: URL;
  private readonly cookie?: string;

  constructor() {
    this.url = new URL(
      process.env.IDIOMATICALLY_GRAPHQL_URL ||
        "https://idiomatically.net/graphql",
    );
    this.cookie = process.env.IDIOMATICALLY_SESSION_COOKIE;
  }

  async listIdioms(): Promise<ExistingIdiom[]> {
    const idioms: ExistingIdiom[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const result: ListIdiomsData = await this.request<ListIdiomsData>(
        listIdiomsQuery,
        {
          ...(cursor === null ? {} : { cursor }),
          limit: 100,
        },
        false,
      );
      for (const { node } of result.idioms.edges) {
        idioms.push({
          id: node.id,
          title: node.title,
          normalizedTitle: normalizeIdiomTitle(node.title),
          slug: node.slug,
          description: node.description || "",
          languageKey: node.language.languageKey,
          countryKeys: node.language.countries.map(
            (country) => country.countryKey,
          ),
          equivalentIds: node.equivalents.map((equivalent) => equivalent.id),
        });
      }
      hasNextPage = result.idioms.pageInfo.hasNextPage;
      cursor = result.idioms.pageInfo.endCursor;
    }

    return idioms;
  }

  async createIdiom(input: CreateIdiomInput) {
    const result = await this.request<{ createIdiom: OperationResult }>(
      createIdiomMutation,
      {
        idiom: {
          title: input.title,
          description: input.description,
          languageKey: input.languageKey,
          countryKeys: input.countryKeys,
          ...(input.literalTranslation
            ? { literalTranslation: input.literalTranslation }
            : {}),
          ...(input.transliteration
            ? { transliteration: input.transliteration }
            : {}),
          ...(input.relatedIdiomId
            ? { relatedIdiomId: input.relatedIdiomId }
            : {}),
        },
      },
      true,
    );
    return requireSuccess("createIdiom", result.createIdiom, true);
  }

  async addEquivalent(idiomId: string, equivalentId: string) {
    const result = await this.request<{ addEquivalent: OperationResult }>(
      addEquivalentMutation,
      { idiomId, equivalentId },
      true,
    );
    requireSuccess("addEquivalent", result.addEquivalent, false);
  }

  private async request<T>(
    query: string,
    variables: Record<string, unknown>,
    authenticated: boolean,
  ): Promise<T> {
    if (authenticated && !this.cookie) {
      throw new Error(
        "IDIOMATICALLY_SESSION_COOKIE is required for GraphQL mutations.",
      );
    }
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = (await response.json()) as GraphqlEnvelope<T>;
    if (!response.ok) {
      throw new Error(`GraphQL request failed with HTTP ${response.status}.`);
    }
    if (body.errors?.length) {
      throw new Error(
        `GraphQL error: ${body.errors
          .map((error) => error.message || "Unknown error")
          .join("; ")}`,
      );
    }
    if (!body.data) {
      throw new Error("GraphQL response did not contain data.");
    }
    return body.data;
  }
}

function requireSuccess(
  operation: string,
  result: OperationResult,
  requireIdiom: true,
): { id: string; slug: string; title: string };
function requireSuccess(
  operation: string,
  result: OperationResult,
  requireIdiom: false,
): void;
function requireSuccess(
  operation: string,
  result: OperationResult,
  requireIdiom: boolean,
) {
  if (result.status !== "SUCCESS") {
    throw new Error(
      `${operation} returned ${result.status}: ${result.message || "No message"}`,
    );
  }
  if (requireIdiom && !result.idiom?.id) {
    throw new Error(`${operation} succeeded without returning an idiom ID.`);
  }
  return result.idiom || undefined;
}
