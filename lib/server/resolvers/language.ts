import { QueryResolvers, QueryCountriesArgs } from "../_graphql/types";
import { GlobalContext } from '../model/types';
import { Languages } from '../dataProvider/languages';

export default {
  Query: {
    languages: async (parent, args, context: GlobalContext) => {
      return Languages.Instance.getAllLanguages();
    },
    countries: async (parent, args: QueryCountriesArgs, context: GlobalContext) => {
      if (!args.languageKey) {
        return [];
      }
      return Languages.Instance.getLangugage(args.languageKey).countries;
    }
  } as QueryResolvers
};