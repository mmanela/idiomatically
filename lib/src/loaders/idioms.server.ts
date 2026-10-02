import type {
  GetIdiomListQuery,
  GetIdiomListQueryVariables,
} from "../__generated__/types";
import { graphqlRequest } from "../graphql.server";
import { getIdiomListQuery } from "../pages/IdiomListView";

export async function loadIdiomList(request: Request) {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const pageNumber = Number.isNaN(page) || page < 1 ? 1 : page;
  const pageSize = 10;

  return graphqlRequest<GetIdiomListQuery, GetIdiomListQueryVariables>(
    request,
    getIdiomListQuery,
    {
      filter: url.searchParams.get("q"),
      locale: url.searchParams.get("lang"),
      limit: pageSize,
      cursor: String((pageNumber - 1) * pageSize),
    },
  );
}
