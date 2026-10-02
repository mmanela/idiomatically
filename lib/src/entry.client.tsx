import { ApolloProvider } from "@apollo/client/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { createApolloClient } from "./apollo";

const client = createApolloClient();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <ApolloProvider client={client}>
        <HydratedRouter />
      </ApolloProvider>
    </StrictMode>,
  );
});
