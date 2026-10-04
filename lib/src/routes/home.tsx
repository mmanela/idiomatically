import { redirect, useLoaderData } from "react-router";
import { loadIdiomList } from "../loaders/idioms.server";
import type { Route } from "./+types/home";
import { buildPageMeta, pageTitle, SITE_DESCRIPTION } from "../seo";
import { getCanonicalUrl } from "../seo.server";
import {
  loadFeaturedIdiom,
  MINIMUM_FEATURED_IDIOMS,
} from "../loaders/featuredIdiom.server";
import { HomePage } from "../pages/HomePage";
import { getLanguagePath } from "../utilities/languagePath";

export async function loader({ request }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  if (requestUrl.search) {
    return redirect(
      `${getLanguagePath("English")}${requestUrl.search}`,
      301,
    );
  }

  const [data, featuredCandidate] = await Promise.all([
    loadIdiomList(request, "en", 7),
    loadFeaturedIdiom(request, "en"),
  ]);
  const featuredIdiom =
    data.idioms.totalCount >= MINIMUM_FEATURED_IDIOMS
      ? featuredCandidate
      : null;
  return {
    ...data,
    featuredIdiom,
    seo: {
      canonicalUrl: getCanonicalUrl(request, "/"),
      languageKey: "en",
      languageName: "English",
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
