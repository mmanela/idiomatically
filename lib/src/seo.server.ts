const fallbackOrigin = "http://localhost:3000";

export function getPublicUrl(request: Request, path: string) {
  const configuredOrigin = process.env.SERVER_URL || fallbackOrigin;
  const requestOrigin = new URL(request.url).origin;
  const origin =
    process.env.NODE_ENV === "production" || process.env.SERVER_URL
      ? configuredOrigin
      : requestOrigin;
  return new URL(path, origin).toString();
}

export function getCanonicalUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const canonicalUrl = new URL(path, getPublicUrl(request, "/"));
  const page = requestUrl.searchParams.get("page");
  if (page && page !== "1" && !requestUrl.searchParams.has("q")) {
    canonicalUrl.searchParams.set("page", page);
  }
  return canonicalUrl.toString();
}
