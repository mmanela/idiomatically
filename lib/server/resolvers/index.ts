import { mergeResolvers } from 'merge-graphql-schemas';
import userResolvers from './userResolver';
import idiomResolvers from './idiomResolver';
import languageResolvers from './languageResolver';
import { IResolvers } from 'apollo-server-express';
import idiomChangeProposalResolver from './idiomChangeProposalResolver';

export default mergeResolvers([userResolvers, idiomResolvers, languageResolvers, idiomChangeProposalResolver]) as IResolvers<any, any>;
