export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Country = {
  countryKey: Scalars["String"];
  countryName: Scalars["String"];
  countryNativeName: Scalars["String"];
  emojiFlag: Scalars["String"];
};

export type Idiom = {
  id: Scalars["ID"];
  slug: Scalars["String"];
  title: Scalars["String"];
  description?: Maybe<Scalars["String"]>;
  tags: Array<Scalars["String"]>;
  transliteration?: Maybe<Scalars["String"]>;
  literalTranslation?: Maybe<Scalars["String"]>;
  equivalents: Array<Idiom>;
  language: Language;
  createdAt: Scalars["String"];
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars["String"]>;
  updatedBy?: Maybe<User>;
};

export type IdiomConnection = {
  edges: Array<IdiomEdge>;
  pageInfo: PageInfo;
};

export type IdiomCreateInput = {
  title: Scalars["String"];
  description?: Maybe<Scalars["String"]>;
  languageKey: Scalars["String"];
  countryKeys?: Maybe<Array<Scalars["String"]>>;
  tags?: Maybe<Array<Scalars["String"]>>;
  transliteration?: Maybe<Scalars["String"]>;
  literalTranslation?: Maybe<Scalars["String"]>;
  relatedIdiomId?: Maybe<Scalars["ID"]>;
};

export type IdiomEdge = {
  cursor: Scalars["String"];
  node: Idiom;
};

export type IdiomUpdateInput = {
  id: Scalars["ID"];
  title?: Maybe<Scalars["String"]>;
  description?: Maybe<Scalars["String"]>;
  transliteration?: Maybe<Scalars["String"]>;
  literalTranslation?: Maybe<Scalars["String"]>;
  tags?: Maybe<Array<Scalars["String"]>>;
  countryKeys?: Maybe<Array<Scalars["String"]>>;
};

export type Language = {
  languageName: Scalars["String"];
  languageNativeName: Scalars["String"];
  languageKey: Scalars["String"];
  countries: Array<Country>;
};

export type Login = {
  externalId: Scalars["ID"];
  name: Scalars["String"];
  email?: Maybe<Scalars["String"]>;
  avatar?: Maybe<Scalars["String"]>;
  type: ProviderType;
};

export type Mutation = {
  updateIdiom: Idiom;
  createIdiom: Idiom;
  deleteIdiom: Scalars["Boolean"];
  addEquivalent: Scalars["Boolean"];
  removeEquivalent: Scalars["Boolean"];
};

export type MutationUpdateIdiomArgs = {
  idiom: IdiomUpdateInput;
};

export type MutationCreateIdiomArgs = {
  idiom: IdiomCreateInput;
};

export type MutationDeleteIdiomArgs = {
  idiomId: Scalars["ID"];
};

export type MutationAddEquivalentArgs = {
  idiomId: Scalars["ID"];
  equivalentId: Scalars["ID"];
};

export type MutationRemoveEquivalentArgs = {
  idiomId: Scalars["ID"];
  equivalentId: Scalars["ID"];
};

export type PageInfo = {
  hasNextPage: Scalars["Boolean"];
  endCursor: Scalars["String"];
};

export enum ProviderType {
  Google = "GOOGLE",
  Facebook = "FACEBOOK"
}

export type Query = {
  me?: Maybe<User>;
  user?: Maybe<User>;
  users: Array<Maybe<User>>;
  idiom?: Maybe<Idiom>;
  idioms: IdiomConnection;
  languages: Array<Language>;
  countries: Array<Country>;
};

export type QueryUserArgs = {
  id: Scalars["ID"];
};

export type QueryUsersArgs = {
  filter?: Maybe<Scalars["String"]>;
  limit?: Maybe<Scalars["Int"]>;
};

export type QueryIdiomArgs = {
  id?: Maybe<Scalars["ID"]>;
  slug?: Maybe<Scalars["String"]>;
};

export type QueryIdiomsArgs = {
  cursor?: Maybe<Scalars["String"]>;
  filter?: Maybe<Scalars["String"]>;
  locale?: Maybe<Scalars["String"]>;
  limit?: Maybe<Scalars["Int"]>;
};

export type QueryCountriesArgs = {
  languageKey?: Maybe<Scalars["String"]>;
};

export type User = {
  id: Scalars["ID"];
  name: Scalars["String"];
  avatar?: Maybe<Scalars["String"]>;
  role?: Maybe<UserRole>;
  providers: Array<Maybe<Login>>;
};

export enum UserRole {
  Admin = "ADMIN",
  Contributor = "CONTRIBUTOR",
  General = "GENERAL"
}

import { GraphQLResolveInfo } from "graphql";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>;
}

export type SubscriptionResolver<
  TResult,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: {};
  User: User;
  ID: Scalars["ID"];
  String: Scalars["String"];
  UserRole: UserRole;
  Login: Login;
  ProviderType: ProviderType;
  Int: Scalars["Int"];
  Idiom: Idiom;
  Language: Language;
  Country: Country;
  IdiomConnection: IdiomConnection;
  IdiomEdge: IdiomEdge;
  PageInfo: PageInfo;
  Boolean: Scalars["Boolean"];
  Mutation: {};
  IdiomUpdateInput: IdiomUpdateInput;
  IdiomCreateInput: IdiomCreateInput;
};

export type AuthDirectiveResolver<
  Result,
  Parent,
  ContextType = any,
  Args = { requires: Maybe<UserRole> }
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CountryResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Country"]
> = {
  countryKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  countryName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  countryNativeName?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  emojiFlag?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
};

export type IdiomResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Idiom"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  title?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  tags?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  transliteration?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  literalTranslation?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  equivalents?: Resolver<
    Array<ResolversTypes["Idiom"]>,
    ParentType,
    ContextType
  >;
  language?: Resolver<ResolversTypes["Language"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  updatedAt?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  updatedBy?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
};

export type IdiomConnectionResolvers<
  ContextType = any,
  ParentType = ResolversTypes["IdiomConnection"]
> = {
  edges?: Resolver<Array<ResolversTypes["IdiomEdge"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
};

export type IdiomEdgeResolvers<
  ContextType = any,
  ParentType = ResolversTypes["IdiomEdge"]
> = {
  cursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  node?: Resolver<ResolversTypes["Idiom"], ParentType, ContextType>;
};

export type LanguageResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Language"]
> = {
  languageName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  languageNativeName?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  languageKey?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  countries?: Resolver<
    Array<ResolversTypes["Country"]>,
    ParentType,
    ContextType
  >;
};

export type LoginResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Login"]
> = {
  externalId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes["ProviderType"], ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Mutation"]
> = {
  updateIdiom?: Resolver<
    ResolversTypes["Idiom"],
    ParentType,
    ContextType,
    MutationUpdateIdiomArgs
  >;
  createIdiom?: Resolver<
    ResolversTypes["Idiom"],
    ParentType,
    ContextType,
    MutationCreateIdiomArgs
  >;
  deleteIdiom?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    MutationDeleteIdiomArgs
  >;
  addEquivalent?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    MutationAddEquivalentArgs
  >;
  removeEquivalent?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    MutationRemoveEquivalentArgs
  >;
};

export type PageInfoResolvers<
  ContextType = any,
  ParentType = ResolversTypes["PageInfo"]
> = {
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  endCursor?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Query"]
> = {
  me?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  user?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    QueryUserArgs
  >;
  users?: Resolver<
    Array<Maybe<ResolversTypes["User"]>>,
    ParentType,
    ContextType,
    QueryUsersArgs
  >;
  idiom?: Resolver<
    Maybe<ResolversTypes["Idiom"]>,
    ParentType,
    ContextType,
    QueryIdiomArgs
  >;
  idioms?: Resolver<
    ResolversTypes["IdiomConnection"],
    ParentType,
    ContextType,
    QueryIdiomsArgs
  >;
  languages?: Resolver<
    Array<ResolversTypes["Language"]>,
    ParentType,
    ContextType
  >;
  countries?: Resolver<
    Array<ResolversTypes["Country"]>,
    ParentType,
    ContextType,
    QueryCountriesArgs
  >;
};

export type UserResolvers<
  ContextType = any,
  ParentType = ResolversTypes["User"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes["UserRole"]>, ParentType, ContextType>;
  providers?: Resolver<
    Array<Maybe<ResolversTypes["Login"]>>,
    ParentType,
    ContextType
  >;
};

export type Resolvers<ContextType = any> = {
  Country?: CountryResolvers<ContextType>;
  Idiom?: IdiomResolvers<ContextType>;
  IdiomConnection?: IdiomConnectionResolvers<ContextType>;
  IdiomEdge?: IdiomEdgeResolvers<ContextType>;
  Language?: LanguageResolvers<ContextType>;
  Login?: LoginResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
};

/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<
  ContextType
>;
