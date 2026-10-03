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
import { IdiomListView } from "../pages/IdiomListView";
import type { Route } from "./+types/idioms";
import { loadLanguagesWithIdioms } from "../loaders/languages.server";
import { getLanguageName } from "../utilities/languageUtil";
import { getLanguagePath } from "../utilities/languagePath";
import { getCanonicalUrl } from "../seo.server";
import { buildPageMeta, pageTitle } from "../seo";
import { loadFeaturedIdiom } from "../loaders/featuredIdiom.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = getIdiomListPage(request);
  const legacyLanguageKey = url.searchParams.get("lang");
  if (legacyLanguageKey) {
    url.searchParams.delete("lang");
    if (page.redirectTo) {
      url.searchParams.delete("page");
    }
    if (legacyLanguageKey.toLowerCase() === "all") {
      return redirect(`/idioms${url.search}`, 301);
    }
    const languageName = getLanguageName(legacyLanguageKey);
    if (!languageName) {
      throw new Response("Language not found", { status: 404 });
    }
    return redirect(`${getLanguagePath(languageName)}${url.search}`, 301);
  }
  if (page.redirectTo) {
    return redirect(page.redirectTo, 301);
  }

  const [data, languages] = await Promise.all([
    loadIdiomList(request, "all"),
    loadLanguagesWithIdioms(request),
  ]);
  const featuredIdiom = await loadFeaturedIdiom(
    request,
    "all",
    data.idioms.totalCount,
  );
  const notFound = page.pageNumber > 1 && data.idioms.edges.length === 0;
  const result = {
    ...data,
    languageCount: languages.length,
    featuredIdiom,
    seo: {
      canonicalUrl: getCanonicalUrl(request, "/idioms"),
      languageKey: "all",
      languageName: "All",
      noIndex: url.searchParams.has("q"),
      page: url.searchParams.get("page"),
      notFound,
    },
  };
  return notFound ? responseData(result, { status: 404 }) : result;
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [{ title: "Idioms | Idiomatically" }];
  }
  if (loaderData.seo.notFound) {
    return [
      { title: "Page not found | Idiomatically" },
      { name: "robots", content: "noindex,follow" },
    ];
  }
  const page = loaderData?.seo.page;
  const suffix = page && page !== "1" ? ` – Page ${page}` : "";
  return buildPageMeta({
    title: pageTitle(`Idioms from around the world${suffix}`),
    description: `Browse idioms from ${loaderData.languageCount} languages with meanings, literal translations, regional usage, and equivalent expressions.`,
    canonicalUrl: loaderData.seo.canonicalUrl,
    noIndex: loaderData.seo.noIndex,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: "Idioms from around the world",
          url: loaderData.seo.canonicalUrl,
        },
        {
          "@type": "ItemList",
          itemListElement: loaderData.idioms.edges.map((edge, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: edge.node.title,
            url: new URL(
              `/idioms/${edge.node.slug}`,
              loaderData.seo.canonicalUrl,
            ).toString(),
          })),
        },
      ],
    },
  });
};

export default function IdiomsRoute() {
  const initialData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <IdiomListView
      initialData={initialData}
      filter={searchParams.get("q")}
      language="all"
      page={searchParams.get("page")}
      heading="Idioms from around the world"
      introduction={`Explore ${initialData.idioms.totalCount} idioms and their equivalents across languages.`}
      featuredIdiom={initialData.featuredIdiom}
      onPageChange={(page) => {
        searchParams.set("page", page);
        setSearchParams(searchParams);
      }}
    />
  );
}
