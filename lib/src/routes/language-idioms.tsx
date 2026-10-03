import { useLoaderData, useSearchParams } from "react-router";
import { LanguageDirectory } from "../components/LanguageDirectory";
import {
  findLanguageBySlug,
  loadLanguagesWithIdioms,
} from "../loaders/languages.server";
import { loadIdiomList } from "../loaders/idioms.server";
import { IdiomListView } from "../pages/IdiomListView";
import { buildPageMeta, pageTitle } from "../seo";
import { getCanonicalUrl } from "../seo.server";
import { getLanguagePath } from "../utilities/languageUtil";
import type { Route } from "./+types/language-idioms";

export async function loader({ params, request }: Route.LoaderArgs) {
  const languages = await loadLanguagesWithIdioms(request);
  const language = findLanguageBySlug(languages, params.language);
  if (!language) {
    throw new Response("Language not found", { status: 404 });
  }

  const data = await loadIdiomList(request, language.languageKey);
  const requestUrl = new URL(request.url);
  const canonicalPath = getLanguagePath(language.languageName);
  return {
    ...data,
    languages,
    language,
    seo: {
      canonicalUrl: getCanonicalUrl(request, canonicalPath),
      languageKey: language.languageKey,
      languageName: language.languageName,
      noIndex: requestUrl.searchParams.has("q"),
      page: requestUrl.searchParams.get("page"),
    },
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [];
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
  return (
    <IdiomListView
      initialData={initialData}
      filter={searchParams.get("q")}
      language={language.languageKey}
      page={searchParams.get("page")}
      heading={`${language.languageName} idioms and equivalents`}
      introduction={`Explore ${initialData.idioms.totalCount} ${language.languageName} idioms, including their meanings, literal translations, regional usage, and equivalent expressions in other languages.`}
      languageDirectory={
        <LanguageDirectory languages={initialData.languages} />
      }
      onPageChange={(page) => {
        searchParams.set("page", page);
        setSearchParams(searchParams);
      }}
    />
  );
}
