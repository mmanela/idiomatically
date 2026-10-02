import { redirect, useLoaderData } from "react-router";
import type {
  GetCurrentUser,
  GetIdiomQuery,
  GetIdiomQueryVariables,
} from "../__generated__/types";
import { getCurrentUserQuery } from "../components/withCurrentUser";
import { getIdiomQuery } from "../fragments/getIdiom";
import { graphqlRequest } from "../graphql.server";
import { NewIdiom } from "../pages/NewIdiom";
import type { Route } from "./+types/new-idiom";

export async function loader({ request }: Route.LoaderArgs) {
  const currentUserData = await graphqlRequest<
    GetCurrentUser,
    Record<string, never>
  >(
    request,
    getCurrentUserQuery,
    {},
  );

  if (!currentUserData.me) {
    return redirect("/login?returnTo=/new");
  }

  const equivalentIdiomId = new URL(request.url).searchParams.get(
    "equivalentIdiomId",
  );
  const equivalentIdiomData = equivalentIdiomId
    ? await graphqlRequest<GetIdiomQuery, GetIdiomQueryVariables>(
        request,
        getIdiomQuery,
        { id: equivalentIdiomId },
      )
    : null;

  return {
    equivalentIdiom: equivalentIdiomData?.idiom || null,
    equivalentIdiomId,
  };
}

export default function NewIdiomRoute() {
  const { equivalentIdiom, equivalentIdiomId } =
    useLoaderData<typeof loader>();
  return (
    <NewIdiom
      equivalentIdiom={equivalentIdiom}
      equivalentIdiomId={equivalentIdiomId || undefined}
    />
  );
}
