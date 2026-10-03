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
  equivalentCount: number;
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

export function getIdiomListPage(request: Request) {
  const url = new URL(request.url);
  const rawPage = url.searchParams.get("page");
  if (rawPage === null) {
    return { pageNumber: 1, redirectTo: null };
  }
  const pageNumber = Number(rawPage);
  if (
    !/^[1-9]\d*$/.test(rawPage) ||
    !Number.isSafeInteger(pageNumber) ||
    rawPage === "1"
  ) {
    url.searchParams.delete("page");
    return {
      pageNumber: 1,
      redirectTo: `${url.pathname}${url.search}`,
    };
  }
  return {
    pageNumber,
    redirectTo: null,
  };
}

export async function loadIdiomList(
  request: Request,
  locale: string,
  limit = IDIOM_PAGE_SIZE,
) {
  const url = new URL(request.url);
  const { pageNumber } = getIdiomListPage(request);
  return graphqlRequest<IdiomListData, GetIdiomListQueryVariables>(
    request,
    getIdiomListQuery,
    {
      filter: url.searchParams.get("q"),
      locale,
      limit,
      cursor: String((pageNumber - 1) * limit),
    },
  );
}
