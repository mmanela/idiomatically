import { mergeResolvers } from 'merge-graphql-schemas';
import userResolvers from '../resolvers/user';
import idiomResolvers from '../resolvers/idiom';
import languageResolvers from '../resolvers/language';
import { IResolvers } from 'apollo-server-express';

export default mergeResolvers([userResolvers, idiomResolvers, languageResolvers]) as IResolvers<any, any>;
