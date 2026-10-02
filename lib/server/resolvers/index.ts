import { mergeResolvers } from '@graphql-tools/merge';
import userResolvers from './userResolver';
import idiomResolvers from './idiomResolver';
import languageResolvers from './languageResolver';
import idiomChangeProposalResolver from './idiomChangeProposalResolver';

export default mergeResolvers([userResolvers, idiomResolvers, languageResolvers, idiomChangeProposalResolver]);
