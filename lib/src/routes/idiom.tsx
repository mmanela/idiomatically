import { useLoaderData } from "react-router";
import type {
  GetIdiomQuery,
  GetIdiomQueryVariables,
} from "../__generated__/types";
import { getIdiomQuery } from "../fragments/getIdiom";
import { graphqlRequest } from "../graphql.server";
import { Idiom } from "../pages/Idiom";
import type { Route } from "./+types/idiom";

export async function loader({ params, request }: Route.LoaderArgs) {
  const data = await graphqlRequest<GetIdiomQuery, GetIdiomQueryVariables>(
    request,
    getIdiomQuery,
    { slug: params.slug },
  );
  const requestUrl = new URL(request.url);
  return {
    ...data,
    canonicalUrl: data.idiom
      ? `${requestUrl.origin}/idioms/${data.idiom.slug}`
      : requestUrl.href,
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const idiom = loaderData?.idiom;
  if (!idiom) {
    return [{ title: "Idiomatically" }];
  }

  const language = idiom.language?.languageName;
  const socialTitle = language
    ? `${idiom.title} — ${language} idiom`
    : `${idiom.title} — Idiomatically`;
  const description = buildSocialDescription(idiom);
  const canonicalUrl = loaderData.canonicalUrl;
  const socialImageUrl = new URL(
    `/social/idioms/${idiom.slug}.png`,
    canonicalUrl,
  ).toString();

  return [
    { title: `${idiom.title} - Idiomatically` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "Idiomatically" },
    { property: "og:title", content: socialTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: socialImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    {
      property: "og:image:alt",
      content: "Idiomatically — idioms across languages and countries",
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: socialTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: socialImageUrl },
  ];
};

function buildSocialDescription(idiom: NonNullable<GetIdiomQuery["idiom"]>) {
  const details = [
    idiom.literalTranslation
      ? `Literally: “${plainText(idiom.literalTranslation)}”.`
      : null,
    idiom.description ? plainText(idiom.description) : null,
    idiom.equivalents.length
      ? `Explore ${idiom.equivalents.length} related ${
          idiom.equivalents.length === 1
            ? "idiom in another language"
            : "idioms in other languages"
        }.`
      : null,
  ].filter(Boolean);

  return truncate(
    details.join(" ") ||
      `Explore the meaning and usage of “${idiom.title}” on Idiomatically.`,
    240,
  );
}

function plainText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maximumLength: number) {
  if (value.length <= maximumLength) {
    return value;
  }
  return `${value.slice(0, maximumLength - 1).trimEnd()}…`;
}

export default function IdiomRoute() {
  const initialData = useLoaderData<typeof loader>();
  return <Idiom slug={initialData.idiom?.slug || ""} initialData={initialData} />;
}
