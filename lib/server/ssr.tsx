import * as React from "react";
import * as express from "express";
import { renderToStringWithData } from "@apollo/react-ssr";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { StaticRouter } from "react-router";
import { App } from "./../src/components/App";
import { renderToStaticMarkup } from "react-dom/server";
import * as fs from "fs";
import * as path from "path";
import { getSubTitle } from "../src/components/subTitles";
import { ApolloProvider } from "@apollo/react-common";
import { createHttpLink } from "apollo-link-http";
import fetch from "cross-fetch";
import { JSDOM } from "jsdom";

// When running in staging or prod we setup to run using SSR for improved performance
export function setupSSR(app: express.Application, clientPath: string, localPort: number) {
  (global as any).window = new JSDOM("").window;

  app.use("^/$", (req, res, next) => {
    render(req, res, clientPath, localPort);
  });

  app.use(express.static(path.resolve(clientPath), { maxAge: "30d" }));

  app.use("*", (req, res, next) => {
    render(req, res, clientPath, localPort);
  });
}

function render(req: express.Request, res: express.Response, clientPath: string, localPort: number) {
  const cache = new InMemoryCache();

  const subTitle = getSubTitle();
  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: `http://localhost:${localPort}/graphql`,
      credentials: "same-origin",
      headers: {
        cookie: req.header("Cookie")
      },
      fetch: fetch
    }),
    // Remember that this is the interface the SSR server will use to connect to the
    // API server, so we need to ensure it isn't firewalled, etc
    /* link: new SchemaLink({
      schema,
      context: globalContext
    }),*/
    cache: cache
  });

  cache.writeData({
    data: {
      subTitle: subTitle
    }
  });

  const context = {};
  // The client-side App will instead use <BrowserRouter>
  const WrappedApp = (
    <ApolloProvider client={client}>
      <StaticRouter location={req.originalUrl} context={context}>
        <App subTitle={subTitle} />
      </StaticRouter>
    </ApolloProvider>
  );
  renderToStringWithData(WrappedApp).then(content => {
    const initialState = client.extract();
    getHtml(content, initialState, clientPath, (html: string) => {
      // Note sure if this really does anything //res.setHeader('Cache-Control', 'public, max-age=1800');
      res.status(200);
      res.send(html);
      res.end();
    });
  });
}

function getHtml(content: string, state: NormalizedCacheObject, clientPath: string, callback: (arg: string) => void) {
  // point to the html file created by CRA's build tool
  const filePath = path.resolve(clientPath, "index.html");

  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      throw err;
    }
    const htmlToInject = (
      <>
        <script>window = </script>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, "\\u003c")};`
          }}
        />
      </>
    );

    const result = htmlData.replace('<div id="root"></div>', renderToStaticMarkup(htmlToInject));

    callback(result);
  });
}
