import {
    QueryResolvers, MutationResolvers, PageInfo, QueryIdiomChangeProposalArgs, QueryIdiomChangeProposalsArgs, MutationRejectIdiomChangeProposalArgs, MutationAcceptIdiomChangeProposalArgs, IdiomChangeProposalConnection, IdiomChangeProposalEdge
} from "../_graphql/types";
import { GlobalContext } from '../model/types';
import { GraphQLResolveInfo } from 'graphql';

export default {
    Query: {
        idiomChangeProposals: async (parent, args: QueryIdiomChangeProposalsArgs, context: GlobalContext, info) => {
            const response = await context.dataProviders.changeProposal.queryIdiomChangeProposals(args);
            const nextEndPosition = response.skip + response.count;
            const hasNextPage = nextEndPosition < response.totalCount;
            let pageInfo: PageInfo = {
                endCursor: nextEndPosition.toString(),
                hasNextPage: hasNextPage
            };

            let result: IdiomChangeProposalConnection = {
                edges: response.result.map<IdiomChangeProposalEdge>((idiom, index) => {
                    return {
                        node: idiom,
                        cursor: (index + response.skip).toString()
                    };
                }),
                pageInfo: pageInfo,
                totalCount: response.totalCount
            };

            return result;
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
            const response = context.dataProviders.changeProposal.acceptIdiomChangeProposal(args);
            return response;
        },

        rejectIdiomChangeProposal: async (parent, args: MutationRejectIdiomChangeProposalArgs, context: GlobalContext, info) => {
            const response = context.dataProviders.changeProposal.rejectIdiomChangeProposal(args);
            return response;
        }

    } as MutationResolvers
};