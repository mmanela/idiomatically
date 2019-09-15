import * as React from "react";
import { render } from "react-dom";
import ApolloClient, { InMemoryCache } from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter } from "react-router-dom";

import { App } from "./components/App";

// Grab any server rendered state
const apolloState = (window as any).__APOLLO_STATE__;

const cache = new InMemoryCache().restore(apolloState);
const client = new ApolloClient({
  uri: `${process.env.REACT_APP_SERVER}/graphql`,
  credentials: "include",
  cache: cache,
  resolvers: {}
});

cache.writeData({
  data: {}
});

const WrappedApp = (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
);

render(WrappedApp, document.getElementById("root"));
