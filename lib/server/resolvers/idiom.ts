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
            const limit = args && args.limit ? args.limit : 50;

            const expandOptions: IdiomExpandOptions = getIdiomExpandOptions(info);
            const idioms = await context.dataProviders.idiom.queryIdioms(args, expandOptions);
            let pageInfo: PageInfo = {
                endCursor: String(idioms.length - 1),
                hasNextPage: idioms.length > limit
            };

            let result: IdiomConnection = {
                edges: idioms.slice(0, limit).map<IdiomEdge>((idiom, index) => {
                    return {
                        node: idiom,
                        cursor: index.toString()
                    };
                }),
                pageInfo: pageInfo
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
