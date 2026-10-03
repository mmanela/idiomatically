import { About } from "../pages/About";
import type { Route } from "./+types/about";
import { buildPageMeta, pageTitle } from "../seo";
import { getPublicUrl } from "../seo.server";

export function loader({ request }: Route.LoaderArgs) {
  return { canonicalUrl: getPublicUrl(request, "/about") };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [{ title: "About | Idiomatically" }];
  }
  return buildPageMeta({
    title: pageTitle("About"),
    description:
      "Learn how Idiomatically documents idioms, literal translations, regional usage, and equivalent expressions across languages.",
    canonicalUrl: loaderData.canonicalUrl,
  });
};

export default About;
