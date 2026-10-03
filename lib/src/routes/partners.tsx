import type { Route } from "./+types/partners";
import { Partners } from "../pages/Partners";
import { buildPageMeta, pageTitle } from "../seo";
import { getPublicUrl } from "../seo.server";

export function loader({ request }: Route.LoaderArgs) {
  return { canonicalUrl: getPublicUrl(request, "/partners") };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) {
    return [{ title: "Idiom partners | Idiomatically" }];
  }
  return buildPageMeta({
    title: pageTitle("Idiom partners and related projects"),
    description:
      "Discover partner projects for researching idioms, detecting expressions in text, and finding culturally natural equivalents while writing.",
    canonicalUrl: loaderData.canonicalUrl,
  });
};

export default Partners;
