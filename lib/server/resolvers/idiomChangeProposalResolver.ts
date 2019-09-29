import {
    QueryResolvers, MutationResolvers, PageInfo, QueryIdiomChangeProposalArgs, QueryIdiomChangeProposalsArgs, MutationRejectIdiomChangeProposalArgs, MutationAcceptIdiomChangeProposalArgs
} from "../_graphql/types";
import { GlobalContext } from '../model/types';
import { GraphQLResolveInfo } from 'graphql';;

export default {
    Query: {
        idiomChangeProposals: async (parent, args: QueryIdiomChangeProposalsArgs, context: GlobalContext, info) => {
            const limit = args && args.limit ? args.limit : 50;
            return null;
        },

        idiomChangeProposal: async (parent, args: QueryIdiomChangeProposalArgs, context: GlobalContext, info: GraphQLResolveInfo) => {
            if (!args || !args.id) {
                throw new Error("Id must be passed");
            }

            return null;
        }
    } as QueryResolvers,

    Mutation: {
        acceptIdiomChangeProposal: async (parent, args: MutationAcceptIdiomChangeProposalArgs, context: GlobalContext, info) => {
            return null;
        },

        rejectIdiomChangeProposal: async (parent, args: MutationRejectIdiomChangeProposalArgs, context: GlobalContext, info) => {
            return null;
        }

    } as MutationResolvers
};