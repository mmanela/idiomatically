import { redirect, useSearchParams } from "react-router";
import type { GetCurrentUser } from "../__generated__/types";
import { getCurrentUserQuery } from "../components/withCurrentUser";
import { graphqlRequest } from "../graphql.server";
import { NewIdiom } from "../pages/NewIdiom";
import type { Route } from "./+types/new-idiom";

export async function loader({ request }: Route.LoaderArgs) {
  const data = await graphqlRequest<GetCurrentUser, Record<string, never>>(
    request,
    getCurrentUserQuery,
    {},
  );

  if (!data.me) {
    return redirect("/login?returnTo=/new");
  }

  return null;
}

export default function NewIdiomRoute() {
  const [searchParams] = useSearchParams();
  return (
    <NewIdiom
      equivalentIdiomId={searchParams.get("equivalentIdiomId") || undefined}
    />
  );
}
