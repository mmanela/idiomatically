import {
  defaultFieldResolver,
  type GraphQLSchema,
} from "graphql";
import {
  getDirective,
  MapperKind,
  mapSchema,
} from "@graphql-tools/utils";
import type { GlobalContext } from "../model/types";

export function authDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName = "auth",
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const fieldDirective =
        getDirective(schema, fieldConfig, directiveName)?.[0];
      if (!fieldDirective) {
        return fieldConfig;
      }

      const requiredRole = String(fieldDirective.requires || "ADMIN");
      const { resolve = defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async function (source, args, context, info) {
        const currentUser = (context as GlobalContext).currentUser;
        if (!currentUser) {
          throw new Error("User must be logged in");
        }
        if (!currentUser.hasRole(requiredRole)) {
          throw new Error("User is not authorized to access this resource");
        }
        return resolve(source, args, context, info);
      };
      return fieldConfig;
    },
  });
}
