import * as React from "react";
import * as express from "express";
import { renderToStringWithData } from '@apollo/client/react/ssr';
import {
  ApolloClient, InMemoryCache,
  NormalizedCacheObject, ApolloProvider, createHttpLink, gql
} from "@apollo/client";
import { StaticRouter } from "react-router";
import { App } from "./../src/components/App";
import { renderToStaticMarkup } from "react-dom/server";
import * as fs from "fs";
import * as path from "path";
import { getSubTitle } from "../src/components/subTitles";
import fetch from "cross-fetch";
import { JSDOM } from "jsdom";
import { DEFAULT_PAGE_TITLE } from '../src/constants';

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
    cache: cache
  });

  client.writeQuery({
    query: gql`
      query GetsubTitle {
        subTitle
      }
    `,
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

  let titleOverride: string = DEFAULT_PAGE_TITLE;
  const idiomKeys = Object.keys(state.ROOT_QUERY).filter(x => x.indexOf("idiom(") == 0);
  if (idiomKeys && idiomKeys.length == 1) {
    const idiomInstanceId = (state.ROOT_QUERY[idiomKeys[0]] as any).id;
    const idiomInstance = state[idiomInstanceId];
    if (idiomInstance) {
      titleOverride = (idiomInstance.title as string) + " - " + titleOverride;
    }
  }


  // point to the html file created by CRA's build tool
  const filePath = path.resolve(clientPath, "index.html");

  fs.readFile(filePath, "utf8", (err, htmlData) => {
    if (err) {
      throw err;
    }
    htmlData = htmlData.replace(/<title>.*?<\/title>/i, `<title>${titleOverride}</title>`);
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
