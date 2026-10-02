import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "antd/dist/reset.css";
import type { Route } from "./+types/root";
import { DEFAULT_PAGE_TITLE } from "./constants";

export const meta: Route.MetaFunction = () => [
  { title: DEFAULT_PAGE_TITLE },
  {
    name: "description",
    content: "Explore idioms translated across languages and countries",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? "Page not found"
      : error.statusText
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred";

  return (
    <main>
      <h1>Oops!</h1>
      <p>{message}</p>
    </main>
  );
}
