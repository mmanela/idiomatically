import { Empty } from "antd";
import { data } from "react-router";
import type { Route } from "./+types/not-found";

export function loader() {
  return data(null, { status: 404 });
}

export const meta: Route.MetaFunction = () => [
  { title: "Page not found | Idiomatically" },
  { name: "robots", content: "noindex,follow" },
];

export default function NotFoundRoute() {
  return (
    <section>
      <h1>Page not found</h1>
      <Empty
        className="empty404"
        image="/static/dog404.jpg"
        description="Looks like you went barking up the wrong tree."
      />
    </section>
  );
}
