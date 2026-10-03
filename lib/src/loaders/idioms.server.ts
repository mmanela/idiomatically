import type { GetIdiomListQueryVariables } from "../__generated__/types";
import { graphqlRequest } from "../graphql.server";
import { getIdiomListQuery } from "../pages/IdiomListView";
import { IDIOM_PAGE_SIZE } from "../constants";

export interface IdiomListEntry {
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: {
    languageKey: string;
    languageName: string;
    countries: Array<{
      countryKey: string;
      countryName: string;
      emojiFlag: string;
    }>;
  };
  equivalents: Array<{ id: string }>;
}

export interface IdiomListData {
  idioms: {
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
    edges: Array<{ node: IdiomListEntry }>;
  };
}

export async function loadIdiomList(request: Request, locale: string) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const pageNumber = Number.isNaN(page) || page < 1 ? 1 : page;
  return graphqlRequest<IdiomListData, GetIdiomListQueryVariables>(
    request,
    getIdiomListQuery,
    {
      filter: url.searchParams.get("q"),
      locale,
      limit: IDIOM_PAGE_SIZE,
      cursor: String((pageNumber - 1) * IDIOM_PAGE_SIZE),
    },
  );
}
