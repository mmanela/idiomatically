import { useLoaderData, useSearchParams } from "react-router";
import { IdiomListView } from "../pages/IdiomListView";
import { loadIdiomList } from "../loaders/idioms.server";
import type { Route } from "./+types/home";

export function loader({ request }: Route.LoaderArgs) {
  return loadIdiomList(request);
}

export default function HomeRoute() {
  const initialData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <IdiomListView
      initialData={initialData}
      filter={searchParams.get("q")}
      language={searchParams.get("lang")}
      page={searchParams.get("page")}
      onPageChange={(page) => {
        searchParams.set("page", page);
        setSearchParams(searchParams);
      }}
    />
  );
}
