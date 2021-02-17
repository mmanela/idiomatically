import * as React from "react";
import { render } from "react-dom";
import {
  ApolloClient, InMemoryCache, ApolloProvider,
  useQuery, ApolloLink, HttpLink
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { BrowserRouter } from "react-router-dom";
import { App } from "./components/App";
import { getSubTitle } from "./components/subTitles";
import { gql } from "@apollo/client";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { ReportHandler } from 'web-vitals';

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



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
const sendToAnalytics: ReportHandler = ({ id, name, value }) => {
  if (window["appInsights"]) {
    window["appInsights"].trackEvent({
      name: name,
      properties: { // accepts any type
        eventCategory: 'Web Vitals',
        eventAction: name,
        eventValue: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
        eventLabel: id, // id unique to current page load
        nonInteraction: true, // avoids affecting bounce rate
      }
    });
  }
};

reportWebVitals(sendToAnalytics);