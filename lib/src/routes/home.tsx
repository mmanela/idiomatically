import {
  data as responseData,
  redirect,
  useLoaderData,
  useSearchParams,
} from "react-router";
import {
  getIdiomListPage,
  loadIdiomList,
} from "../loaders/idioms.server";
import type { Route } from "./+types/home";
import { buildPageMeta, pageTitle, SITE_DESCRIPTION } from "../seo";
import { getCanonicalUrl } from "../seo.server";
import {
  loadFeaturedIdiom,
  MINIMUM_FEATURED_IDIOMS,
} from "../loaders/featuredIdiom.server";
import { HomePage, POPULAR_IDIOM_COUNT } from "../pages/HomePage";
import { getLanguagePath } from "../utilities/languagePath";

export async function loader({ request }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  const page = getIdiomListPage(request);
  const hasNonPageSearch = [...requestUrl.searchParams.keys()].some(
    (key) => key !== "page",
  );
  if (hasNonPageSearch) {
    return redirect(
      `${getLanguagePath("English")}${requestUrl.search}`,
      301,
    );
  }
  if (page.redirectTo) {
    return redirect(page.redirectTo, 301);
  }

  const [data, featuredCandidate] = await Promise.all([
    loadIdiomList(request, "en", POPULAR_IDIOM_COUNT),
    loadFeaturedIdiom(request, "en"),
  ]);
  const featuredIdiom =
    data.idioms.totalCount >= MINIMUM_FEATURED_IDIOMS
      ? featuredCandidate
      : null;
  const notFound = page.pageNumber > 1 && data.idioms.edges.length === 0;
  const result = {
    ...data,
    featuredIdiom,
    seo: {
      canonicalUrl: getCanonicalUrl(request, "/"),
      languageKey: "en",
      languageName: "English",
      page: requestUrl.searchParams.get("page"),
      notFound,
    },
  };
  return notFound ? responseData(result, { status: 404 }) : result;
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [{ title: "Idiomatically" }];
  }
  if (loaderData.seo.notFound) {
    return [
      { title: "Page not found | Idiomatically" },
      { name: "robots", content: "noindex,follow" },
    ];
  }
  const page = loaderData.seo.page;
  const suffix = page && page !== "1" ? ` – Page ${page}` : "";
  return buildPageMeta({
    title: pageTitle(`Idioms translated across languages${suffix}`),
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
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <HomePage
      idiomData={initialData}
      featuredIdiom={initialData.featuredIdiom}
      page={Number(searchParams.get("page") || "1")}
      onPageChange={(page) => {
        if (page <= 1) {
          searchParams.delete("page");
        } else {
          searchParams.set("page", String(page));
        }
        setSearchParams(searchParams);
      }}
    />
  );
}
