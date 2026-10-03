import { useLoaderData, useSearchParams } from "react-router";
import { IdiomListView } from "../pages/IdiomListView";
import { loadIdiomList } from "../loaders/idioms.server";
import type { Route } from "./+types/home";
import { buildPageMeta, pageTitle, SITE_DESCRIPTION } from "../seo";
import { getCanonicalUrl } from "../seo.server";
import { loadFeaturedIdiom } from "../loaders/featuredIdiom.server";

export async function loader({ request }: Route.LoaderArgs) {
  const data = await loadIdiomList(request, "en");
  const featuredIdiom = await loadFeaturedIdiom(
    request,
    "en",
    data.idioms.totalCount,
  );
  return {
    ...data,
    featuredIdiom,
    seo: {
      canonicalUrl: getCanonicalUrl(request, "/"),
      languageKey: "en",
      languageName: "English",
      noIndex: new URL(request.url).searchParams.has("q"),
    },
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [{ title: "Idiomatically" }];
  }
  return buildPageMeta({
    title: pageTitle("Idioms translated across languages"),
    description: SITE_DESCRIPTION,
    canonicalUrl: loaderData.seo.canonicalUrl,
    noIndex: loaderData.seo.noIndex,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Idiomatically",
      url: loaderData.seo.canonicalUrl,
      description: SITE_DESCRIPTION,
    },
  });
};

export default function HomeRoute() {
  const initialData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <IdiomListView
      initialData={initialData}
      filter={searchParams.get("q")}
      language="en"
      page={searchParams.get("page")}
      heading="English idioms and equivalents across languages"
      introduction="Explore English idioms and their equivalents across languages."
      featuredIdiom={initialData.featuredIdiom}
      onPageChange={(page) => {
        searchParams.set("page", page);
        setSearchParams(searchParams);
      }}
    />
  );
}
