import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";

export function createApolloClient(request?: Request) {
  const graphqlUrl = request
    ? new URL("/graphql", request.url).toString()
    : "/graphql";
  const headers = request?.headers.get("cookie")
    ? { cookie: request.headers.get("cookie")! }
    : undefined;

  const errorLink = new ErrorLink(({ error }) => {
    console.error("[GraphQL error]", error);
  });

  return new ApolloClient({
    ssrMode: Boolean(request),
    link: ApolloLink.from([
      errorLink,
      new HttpLink({
        uri: graphqlUrl,
        credentials: "same-origin",
        headers,
      }),
    ]),
    cache: new InMemoryCache(),
  });
}
