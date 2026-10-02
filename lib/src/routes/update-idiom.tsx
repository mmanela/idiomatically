import { useLoaderData } from "react-router";
import type {
  GetIdiomQuery,
  GetIdiomQueryVariables,
} from "../__generated__/types";
import { getIdiomQuery } from "../fragments/getIdiom";
import { graphqlRequest } from "../graphql.server";
import { UpdateIdiom } from "../pages/UpdateIdiom";
import type { Route } from "./+types/update-idiom";

export function loader({ params, request }: Route.LoaderArgs) {
  return graphqlRequest<GetIdiomQuery, GetIdiomQueryVariables>(
    request,
    getIdiomQuery,
    { slug: params.slug },
  );
}

export default function UpdateIdiomRoute() {
  const initialData = useLoaderData<typeof loader>();
  return (
    <UpdateIdiom
      slug={initialData.idiom?.slug || ""}
      initialData={initialData}
    />
  );
}
