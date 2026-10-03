import type { MetaDescriptor } from "react-router";

export const SITE_NAME = "Idiomatically";
export const SITE_DESCRIPTION =
  "Explore idioms, meanings, literal translations, and equivalent expressions across languages and countries.";

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  noIndex?: boolean;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>;
}

export function buildPageMeta({
  title,
  description,
  canonicalUrl,
  noIndex = false,
  type = "website",
  jsonLd,
}: PageMetaOptions): MetaDescriptor[] {
  const descriptors: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (noIndex) {
    descriptors.push({ name: "robots", content: "noindex,follow" });
  }
  if (jsonLd) {
    descriptors.push({ "script:ld+json": jsonLd });
  }
  return descriptors;
}

export function pageTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}
