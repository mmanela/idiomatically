import { useLoaderData } from "react-router";
import type {
  GetIdiomQuery,
  GetIdiomQueryVariables,
} from "../__generated__/types";
import { getIdiomQuery } from "../fragments/getIdiom";
import { graphqlRequest } from "../graphql.server";
import { Idiom } from "../pages/Idiom";
import type { Route } from "./+types/idiom";

export function loader({ params, request }: Route.LoaderArgs) {
  return graphqlRequest<GetIdiomQuery, GetIdiomQueryVariables>(
    request,
    getIdiomQuery,
    { slug: params.slug },
  );
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  {
    title: loaderData?.idiom
      ? `${loaderData.idiom.title} - Idiomatically`
      : "Idiomatically",
  },
];

export default function IdiomRoute() {
  const initialData = useLoaderData<typeof loader>();
  return <Idiom slug={initialData.idiom?.slug || ""} initialData={initialData} />;
}
