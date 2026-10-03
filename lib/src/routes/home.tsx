import { redirect, useLoaderData } from "react-router";
import { loadIdiomList } from "../loaders/idioms.server";
import type { Route } from "./+types/home";
import { buildPageMeta, pageTitle, SITE_DESCRIPTION } from "../seo";
import { getCanonicalUrl } from "../seo.server";
import { loadFeaturedIdiom } from "../loaders/featuredIdiom.server";
import { HomePage } from "../pages/HomePage";

export async function loader({ request }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  if (requestUrl.search) {
    return redirect(`/idioms${requestUrl.search}`);
  }

  const data = await loadIdiomList(request, "all");
  const featuredIdiom = await loadFeaturedIdiom(
    request,
    "all",
    data.idioms.totalCount,
  );
  return {
    ...data,
    featuredIdiom,
    seo: {
      canonicalUrl: getCanonicalUrl(request, "/"),
      languageKey: "all",
      languageName: "All",
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
  return (
    <HomePage
      idiomData={initialData}
      featuredIdiom={initialData.featuredIdiom}
    />
  );
}
