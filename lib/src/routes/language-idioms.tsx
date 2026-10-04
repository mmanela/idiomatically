import {
  data as responseData,
  redirect,
  useLoaderData,
  useSearchParams,
} from "react-router";
import {
  findLanguageBySlug,
  loadLanguagesWithIdioms,
} from "../loaders/languages.server";
import {
  getIdiomListPage,
  loadIdiomList,
} from "../loaders/idioms.server";
import { IdiomListView } from "../pages/IdiomListView";
import { buildPageMeta, pageTitle } from "../seo";
import { getCanonicalUrl } from "../seo.server";
import { getLanguagePath } from "../utilities/languagePath";
import type { Route } from "./+types/language-idioms";
import {
  loadFeaturedIdiom,
  MINIMUM_FEATURED_IDIOMS,
} from "../loaders/featuredIdiom.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  const page = getIdiomListPage(request);
  if (page.redirectTo) {
    return redirect(page.redirectTo, 301);
  }
  const languages = await loadLanguagesWithIdioms(request);
  const language = findLanguageBySlug(languages, params.language);
  if (!language) {
    throw new Response("Language not found", { status: 404 });
  }

  const [data, featuredCandidate] = await Promise.all([
    loadIdiomList(request, language.languageKey),
    loadFeaturedIdiom(request, language.languageKey),
  ]);
  const featuredIdiom =
    data.idioms.totalCount >= MINIMUM_FEATURED_IDIOMS
      ? featuredCandidate
      : null;
  const requestUrl = new URL(request.url);
  const canonicalPath = getLanguagePath(language.languageName);
  const notFound = page.pageNumber > 1 && data.idioms.edges.length === 0;
  const result = {
    ...data,
    language,
    featuredIdiom,
    seo: {
      canonicalUrl: getCanonicalUrl(request, canonicalPath),
      languageKey: language.languageKey,
      languageName: language.languageName,
      noIndex: requestUrl.searchParams.has("q"),
      page: requestUrl.searchParams.get("page"),
      notFound,
    },
  };
  return notFound ? responseData(result, { status: 404 }) : result;
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [];
  }
  if (loaderData.seo.notFound) {
    return [
      { title: "Page not found | Idiomatically" },
      { name: "robots", content: "noindex,follow" },
    ];
  }
  const { language, idioms, seo } = loaderData;
  const pageSuffix =
    seo.page && seo.page !== "1" ? ` – Page ${seo.page}` : "";
  const title = `${idioms.totalCount} ${language.languageName} idioms: meanings and equivalents${pageSuffix}`;
  const description = `Explore ${idioms.totalCount} ${language.languageName} idioms with meanings, literal translations, regional usage, and equivalent expressions in other languages.`;
  return buildPageMeta({
    title: pageTitle(title),
    description,
    canonicalUrl: seo.canonicalUrl,
    noIndex: seo.noIndex,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: `${language.languageName} idioms`,
          url: seo.canonicalUrl,
          description,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Idioms",
              item: new URL("/idioms", seo.canonicalUrl).toString(),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: `${language.languageName} idioms`,
              item: seo.canonicalUrl,
            },
          ],
        },
        {
          "@type": "ItemList",
          itemListElement: idioms.edges.map((edge, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: edge.node.title,
            url: new URL(
              `/idioms/${edge.node.slug}`,
              seo.canonicalUrl,
            ).toString(),
          })),
        },
      ],
    },
  });
};

export default function LanguageIdiomsRoute() {
  const initialData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = initialData;
  const idiomCount = initialData.idioms.totalCount;
  return (
    <IdiomListView
      initialData={initialData}
      filter={searchParams.get("q")}
      language={language.languageKey}
      page={searchParams.get("page")}
      heading={`${language.languageName} idioms`}
      introduction={
        idiomCount === 1
          ? "Compare this expression with related idioms in other languages."
          : `Compare ${idiomCount} expressions with related idioms in other languages.`
      }
      featuredIdiom={initialData.featuredIdiom}
      onPageChange={(page) => {
        searchParams.set("page", page);
        setSearchParams(searchParams);
      }}
    />
  );
}
