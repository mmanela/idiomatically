import { QueryResolvers, QueryUserArgs, QueryUsersArgs } from "../_graphql/types";
import { GlobalContext } from '../model/types';

export default {

  Query: {
    user: async (parent, args: QueryUserArgs, context: GlobalContext) => {

      if (!args || !args.id) {
        throw new Error("Id must passed");
      }

      return context.dataProviders.user.getUser(args.id);
    },

    users: async (parent, args: QueryUsersArgs, context: GlobalContext) => {
      const limit = args && args.limit ? args.limit : 50;
      const users = await context.dataProviders.user.queryUsers(args);
      let result = users.slice(0, limit);
      return result;
    },

    me: async (parent, args, context: GlobalContext) => {
      return context.currentUser;
    }
  } as QueryResolvers
};