import * as React from "react";
import { render } from "react-dom";
import ApolloClient, { InMemoryCache, gql } from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { BrowserRouter } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { App } from "./components/App";
import { getSubTitle } from "./components/subTitles";

// Grab any server rendered state
const apolloState = (window as any).__APOLLO_STATE__;

const cache = new InMemoryCache().restore(apolloState);
const client = new ApolloClient({
  uri: `${process.env.REACT_APP_SERVER}/graphql`,
  credentials: "include",
  cache: cache,
  resolvers: {}
});

const GET_SUBTITLE = gql`
  {
    subTitle @client
  }
`;

function WrappedApp() {
  const { data } = useQuery<string>(GET_SUBTITLE);
  return <App subTitle={data || getSubTitle()} />;
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
