import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Db } from "mongodb";
import type { Auth } from "./auth";
import { createDataProviders } from "./dataProvider/dataProviderFactory";
import type { DataProviders } from "./dataProvider/dataProviders";
import type { GlobalContext } from "./model/types";
import resolvers from "./resolvers";
import typeDefs from "./schema";
import { authDirectiveTransformer } from "./schemaDirectives/auth";

export function createGraphqlRuntime(options: {
  auth: Auth;
  database: Db;
  isProduction: boolean;
  adminEmails: string[];
}) {
  const dataProviders = createDataProviders(options.database, options.isProduction);
  const baseSchema = makeExecutableSchema({ typeDefs, resolvers });
  const schema = authDirectiveTransformer(baseSchema);
  const server = new ApolloServer<GlobalContext>({
    schema,
    introspection: !options.isProduction,
  });

  return { dataProviders, server };
}

export async function getCurrentUser(
  auth: Auth,
  dataProviders: DataProviders,
  headers: Headers,
  adminEmails: string[],
) {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) {
    return null;
  }

  return dataProviders.user.ensureUserFromAuth(
    {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatar: session.user.image,
      role: session.user.role,
      provider: session.user.email.endsWith("@idiomatically.test")
        ? "LOCAL"
        : "GOOGLE",
    },
    adminEmails,
  );
}
