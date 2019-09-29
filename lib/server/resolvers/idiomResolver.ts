import {
    QueryResolvers, MutationResolvers,
    MutationUpdateIdiomArgs, MutationCreateIdiomArgs, MutationDeleteIdiomArgs,
    MutationAddEquivalentArgs, MutationRemoveEquivalentArgs,
    QueryIdiomArgs, QueryIdiomsArgs, IdiomConnection, PageInfo, IdiomEdge
} from "../_graphql/types";
import { GlobalContext, IdiomExpandOptions } from '../model/types';
import { GraphQLResolveInfo } from 'graphql';
import { traverse } from './traverser';

export default {
    Query: {
        idioms: async (parent, args: QueryIdiomsArgs, context: GlobalContext, info) => {
            const expandOptions: IdiomExpandOptions = getIdiomExpandOptions(info);
            const response = await context.dataProviders.idiom.queryIdioms(args, expandOptions);

            // This is really not right. Using skip/take is weak in two ways
            // 1. Performance isn't great since its paging whole query still
            // 2. If you order in certain ways, new items can appear in the middle of paging 
            // Ideally, we should order by date and use that as page but that then means
            // that we have to always prioritize oldest idiom first, which is also unfortunate.
            
            const nextEndPosition = response.skip + response.count;
            const hasNextPage = nextEndPosition < response.totalCount;
            let pageInfo: PageInfo = {
                endCursor: nextEndPosition.toString(),
                hasNextPage: hasNextPage
            };

            let result: IdiomConnection = {
                edges: response.result.map<IdiomEdge>((idiom, index) => {
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

        idiom: async (parent, args: QueryIdiomArgs, context: GlobalContext, info: GraphQLResolveInfo) => {
            if (!args || (!args.id && !args.slug)) {
                throw new Error("Id or slug must be passed");
            }

            const expandOptions: IdiomExpandOptions = getIdiomExpandOptions(info);

            return context.dataProviders.idiom.getIdiom(args, expandOptions);
        }
    } as QueryResolvers,

    Mutation: {
        updateIdiom: async (parent, args: MutationUpdateIdiomArgs, context: GlobalContext, info: GraphQLResolveInfo) => {

            const expandOptions: IdiomExpandOptions = getIdiomExpandOptions(info);
            return await context.dataProviders.idiom.updateIdiom(context.currentUser, args.idiom, expandOptions);
        },

        createIdiom: async (parent, args: MutationCreateIdiomArgs, context: GlobalContext, info: GraphQLResolveInfo) => {
            const expandOptions: IdiomExpandOptions = getIdiomExpandOptions(info);
            return await context.dataProviders.idiom.createIdiom(context.currentUser, args.idiom, expandOptions);
        },

        deleteIdiom: async (parent, args: MutationDeleteIdiomArgs, context: GlobalContext, info) => {
            return await context.dataProviders.idiom.deleteIdiom(context.currentUser, args.idiomId);
        },

        addEquivalent: async (parent, args: MutationAddEquivalentArgs, context: GlobalContext, info) => {
            return await context.dataProviders.idiom.addIdiomEquivalent(context.currentUser, args.idiomId, args.equivalentId);
        },

        removeEquivalent: async (parent, args: MutationRemoveEquivalentArgs, context: GlobalContext, info) => {
            return await context.dataProviders.idiom.removeIdiomEquivalent(context.currentUser, args.idiomId, args.equivalentId);
        }

    } as MutationResolvers
};

function getIdiomExpandOptions(info: GraphQLResolveInfo) {
    const expandOptions: IdiomExpandOptions = {
        expandEquivalents: false,
        expandUsers: false
    };

    traverse(info, fieldNode => {
        if (fieldNode.name.value === "equivalents") {
            expandOptions.expandEquivalents = true;
        }
        else if (fieldNode.name.value === "createdBy" || fieldNode.name.value === "updatedBy") {
            expandOptions.expandUsers = true;
        }
    });

    return expandOptions;
}
