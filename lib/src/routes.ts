import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("components/App.tsx", [
    index("routes/home.tsx"),
    route("idioms", "routes/idioms.tsx"),
    route("languages/:language/idioms", "routes/language-idioms.tsx"),
    route("idioms/:slug", "routes/idiom.tsx"),
    route("new", "routes/new-idiom.tsx"),
    route("idioms/:slug/update", "routes/update-idiom.tsx"),
    route("me", "routes/profile.tsx"),
    route("admin/proposals", "routes/change-proposals.tsx"),
    route("about", "routes/about.tsx"),
    route("partners", "routes/partners.tsx"),
    route("*", "routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;
