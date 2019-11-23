import * as React from "react";
import { render } from "react-dom";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { ApolloProvider } from "@apollo/react-hooks";
import { BrowserRouter } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { App } from "./components/App";
import { getSubTitle } from "./components/subTitles";
import gql from "graphql-tag";

// Grab any server rendered state
const apolloState = (window as any).__APOLLO_STATE__;

const cache = new InMemoryCache().restore(apolloState);
const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    new HttpLink({
      uri: `${process.env.REACT_APP_SERVER}/graphql`,
      credentials: "include"
    })
  ]),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network"
    }
  },
  cache: cache,
  ssrForceFetchDelay: 300,
  resolvers: {}
});

type LocalState = {
  subTitle: string;
};

const GET_SUBTITLE = gql`
  {
    subTitle @client
  }
`;

function WrappedApp() {
  const { data } = useQuery<LocalState>(GET_SUBTITLE);
  const subTitle = (data && data.subTitle) || getSubTitle();
  return <App subTitle={subTitle} />;
}

function Root() {
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <WrappedApp />
      </ApolloProvider>
    </BrowserRouter>
  );
}

render(<Root />, document.getElementById("root"));
