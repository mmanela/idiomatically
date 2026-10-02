import {
  createCache,
  extractStyle,
  StyleProvider,
} from "@ant-design/cssinjs";
import { ApolloProvider } from "@apollo/client/react";
import type {
  EntryContext,
  RouterContextProvider,
} from "react-router";
import { ServerRouter } from "react-router";
import { renderToReadableStream } from "react-dom/server";
import { createApolloClient } from "./apollo";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: RouterContextProvider,
) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  const client = createApolloClient(request);
  const styleCache = createCache();
  const stream = await renderToReadableStream(
    <StyleProvider cache={styleCache}>
      <ApolloProvider client={client}>
        <ServerRouter context={routerContext} url={request.url} />
      </ApolloProvider>
    </StyleProvider>,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        console.error(error);
      },
    },
  );
  await stream.allReady;
  const html = await new Response(stream).text();
  const antStyles = extractStyle(styleCache);
  const document = `${html.startsWith("<!DOCTYPE") ? "" : "<!DOCTYPE html>"}${html}`
    .replace(
      /<meta name="antd-style-insertion-point"[^>]*>/,
      antStyles,
    );

  responseHeaders.set("Content-Type", "text/html");
  return new Response(document, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
