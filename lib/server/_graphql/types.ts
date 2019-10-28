import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};



export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Country = {
   __typename?: 'Country',
  countryKey: Scalars['String'],
  countryName: Scalars['String'],
  countryNativeName: Scalars['String'],
  emojiFlag: Scalars['String'],
};

export type Idiom = {
   __typename?: 'Idiom',
  id: Scalars['ID'],
  slug: Scalars['String'],
  title: Scalars['String'],
  description?: Maybe<Scalars['String']>,
  tags: Array<Scalars['String']>,
  transliteration?: Maybe<Scalars['String']>,
  literalTranslation?: Maybe<Scalars['String']>,
  equivalents: Array<Idiom>,
  language: Language,
  createdAt: Scalars['String'],
  createdBy?: Maybe<User>,
  updatedAt?: Maybe<Scalars['String']>,
  updatedBy?: Maybe<User>,
};

export type IdiomChangeProposal = {
   __typename?: 'IdiomChangeProposal',
  id: Scalars['ID'],
  type: Scalars['String'],
  createdBy: Scalars['String'],
  title?: Maybe<Scalars['String']>,
  body: Scalars['String'],
};

export type IdiomChangeProposalConnection = {
   __typename?: 'IdiomChangeProposalConnection',
  edges: Array<IdiomChangeProposalEdge>,
  pageInfo: PageInfo,
  totalCount: Scalars['Int'],
};

export type IdiomChangeProposalEdge = {
   __typename?: 'IdiomChangeProposalEdge',
  cursor: Scalars['String'],
  node: IdiomChangeProposal,
};

export type IdiomConnection = {
   __typename?: 'IdiomConnection',
  edges: Array<IdiomEdge>,
  pageInfo: PageInfo,
  totalCount: Scalars['Int'],
};

export type IdiomCreateInput = {
  title: Scalars['String'],
  description?: Maybe<Scalars['String']>,
  languageKey: Scalars['String'],
  countryKeys?: Maybe<Array<Scalars['String']>>,
  tags?: Maybe<Array<Scalars['String']>>,
  transliteration?: Maybe<Scalars['String']>,
  literalTranslation?: Maybe<Scalars['String']>,
  relatedIdiomId?: Maybe<Scalars['ID']>,
};

export type IdiomEdge = {
   __typename?: 'IdiomEdge',
  cursor: Scalars['String'],
  node: Idiom,
};

export type IdiomOperationResult = {
   __typename?: 'IdiomOperationResult',
  status: OperationStatus,
  message?: Maybe<Scalars['String']>,
  idiom?: Maybe<Idiom>,
};

export type IdiomUpdateInput = {
  id: Scalars['ID'],
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  transliteration?: Maybe<Scalars['String']>,
  literalTranslation?: Maybe<Scalars['String']>,
  tags?: Maybe<Array<Scalars['String']>>,
  countryKeys?: Maybe<Array<Scalars['String']>>,
};

export type Language = {
   __typename?: 'Language',
  languageName: Scalars['String'],
  languageNativeName: Scalars['String'],
  languageKey: Scalars['String'],
  countries: Array<Country>,
};

export type Login = {
   __typename?: 'Login',
  externalId: Scalars['ID'],
  name: Scalars['String'],
  email?: Maybe<Scalars['String']>,
  avatar?: Maybe<Scalars['String']>,
  type: ProviderType,
};

export type Mutation = {
   __typename?: 'Mutation',
  updateIdiom: IdiomOperationResult,
  createIdiom: IdiomOperationResult,
  deleteIdiom: IdiomOperationResult,
  addEquivalent: IdiomOperationResult,
  removeEquivalent: IdiomOperationResult,
  acceptIdiomChangeProposal: IdiomOperationResult,
  rejectIdiomChangeProposal: IdiomOperationResult,
};


export type MutationUpdateIdiomArgs = {
  idiom: IdiomUpdateInput
};


export type MutationCreateIdiomArgs = {
  idiom: IdiomCreateInput
};


export type MutationDeleteIdiomArgs = {
  idiomId: Scalars['ID']
};


export type MutationAddEquivalentArgs = {
  idiomId: Scalars['ID'],
  equivalentId: Scalars['ID']
};


export type MutationRemoveEquivalentArgs = {
  idiomId: Scalars['ID'],
  equivalentId: Scalars['ID']
};


export type MutationAcceptIdiomChangeProposalArgs = {
  proposalId: Scalars['ID'],
  body?: Maybe<Scalars['String']>
};


export type MutationRejectIdiomChangeProposalArgs = {
  proposalId: Scalars['ID']
};

export type OperationResult = {
   __typename?: 'OperationResult',
  status: OperationStatus,
  message?: Maybe<Scalars['String']>,
};

export enum OperationStatus {
  Success = 'SUCCESS',
  Failure = 'FAILURE',
  Pending = 'PENDING'
}

export type PageInfo = {
   __typename?: 'PageInfo',
  hasNextPage: Scalars['Boolean'],
  endCursor: Scalars['String'],
};

export enum ProviderType {
  Google = 'GOOGLE',
  Facebook = 'FACEBOOK'
}

export type Query = {
   __typename?: 'Query',
  me?: Maybe<User>,
  user?: Maybe<User>,
  users: Array<Maybe<User>>,
  idiom?: Maybe<Idiom>,
  idioms: IdiomConnection,
  languages: Array<Language>,
  countries: Array<Country>,
  idiomChangeProposal: IdiomChangeProposal,
  idiomChangeProposals: IdiomChangeProposalConnection,
};


export type QueryUserArgs = {
  id: Scalars['ID']
};


export type QueryUsersArgs = {
  filter?: Maybe<Scalars['String']>,
  limit?: Maybe<Scalars['Int']>
};


export type QueryIdiomArgs = {
  id?: Maybe<Scalars['ID']>,
  slug?: Maybe<Scalars['String']>
};


export type QueryIdiomsArgs = {
  cursor?: Maybe<Scalars['String']>,
  filter?: Maybe<Scalars['String']>,
  locale?: Maybe<Scalars['String']>,
  limit?: Maybe<Scalars['Int']>
};


export type QueryCountriesArgs = {
  languageKey?: Maybe<Scalars['String']>
};


export type QueryIdiomChangeProposalArgs = {
  id?: Maybe<Scalars['ID']>
};


export type QueryIdiomChangeProposalsArgs = {
  cursor?: Maybe<Scalars['String']>,
  filter?: Maybe<Scalars['String']>,
  limit?: Maybe<Scalars['Int']>
};

export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  name: Scalars['String'],
  avatar?: Maybe<Scalars['String']>,
  role?: Maybe<UserRole>,
  providers: Array<Maybe<Login>>,
};

export enum UserRole {
  Admin = 'ADMIN',
  Contributor = 'CONTRIBUTOR',
  General = 'GENERAL'
}


export type ResolverTypeWrapper<T> = Promise<T> | T;

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

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  User: ResolverTypeWrapper<User>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  String: ResolverTypeWrapper<Scalars['String']>,
  UserRole: UserRole,
  Login: ResolverTypeWrapper<Login>,
  ProviderType: ProviderType,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  Idiom: ResolverTypeWrapper<Idiom>,
  Language: ResolverTypeWrapper<Language>,
  Country: ResolverTypeWrapper<Country>,
  IdiomConnection: ResolverTypeWrapper<IdiomConnection>,
  IdiomEdge: ResolverTypeWrapper<IdiomEdge>,
  PageInfo: ResolverTypeWrapper<PageInfo>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  IdiomChangeProposal: ResolverTypeWrapper<IdiomChangeProposal>,
  IdiomChangeProposalConnection: ResolverTypeWrapper<IdiomChangeProposalConnection>,
  IdiomChangeProposalEdge: ResolverTypeWrapper<IdiomChangeProposalEdge>,
  Mutation: ResolverTypeWrapper<{}>,
  IdiomUpdateInput: IdiomUpdateInput,
  IdiomOperationResult: ResolverTypeWrapper<IdiomOperationResult>,
  OperationStatus: OperationStatus,
  IdiomCreateInput: IdiomCreateInput,
  CacheControlScope: CacheControlScope,
  OperationResult: ResolverTypeWrapper<OperationResult>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  User: User,
  ID: Scalars['ID'],
  String: Scalars['String'],
  UserRole: UserRole,
  Login: Login,
  ProviderType: ProviderType,
  Int: Scalars['Int'],
  Idiom: Idiom,
  Language: Language,
  Country: Country,
  IdiomConnection: IdiomConnection,
  IdiomEdge: IdiomEdge,
  PageInfo: PageInfo,
  Boolean: Scalars['Boolean'],
  IdiomChangeProposal: IdiomChangeProposal,
  IdiomChangeProposalConnection: IdiomChangeProposalConnection,
  IdiomChangeProposalEdge: IdiomChangeProposalEdge,
  Mutation: {},
  IdiomUpdateInput: IdiomUpdateInput,
  IdiomOperationResult: IdiomOperationResult,
  OperationStatus: OperationStatus,
  IdiomCreateInput: IdiomCreateInput,
  CacheControlScope: CacheControlScope,
  OperationResult: OperationResult,
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = {   maxAge?: Maybe<Maybe<Scalars['Int']>>,
  scope?: Maybe<Maybe<CacheControlScope>> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = {   requires?: Maybe<Maybe<UserRole>> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CountryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Country'] = ResolversParentTypes['Country']> = {
  countryKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  countryName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  countryNativeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  emojiFlag?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type IdiomResolvers<ContextType = any, ParentType extends ResolversParentTypes['Idiom'] = ResolversParentTypes['Idiom']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  transliteration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  literalTranslation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  equivalents?: Resolver<Array<ResolversTypes['Idiom']>, ParentType, ContextType>,
  language?: Resolver<ResolversTypes['Language'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
};

export type IdiomChangeProposalResolvers<ContextType = any, ParentType extends ResolversParentTypes['IdiomChangeProposal'] = ResolversParentTypes['IdiomChangeProposal']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type IdiomChangeProposalConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['IdiomChangeProposalConnection'] = ResolversParentTypes['IdiomChangeProposalConnection']> = {
  edges?: Resolver<Array<ResolversTypes['IdiomChangeProposalEdge']>, ParentType, ContextType>,
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>,
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
};

export type IdiomChangeProposalEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['IdiomChangeProposalEdge'] = ResolversParentTypes['IdiomChangeProposalEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  node?: Resolver<ResolversTypes['IdiomChangeProposal'], ParentType, ContextType>,
};

export type IdiomConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['IdiomConnection'] = ResolversParentTypes['IdiomConnection']> = {
  edges?: Resolver<Array<ResolversTypes['IdiomEdge']>, ParentType, ContextType>,
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>,
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
};

export type IdiomEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['IdiomEdge'] = ResolversParentTypes['IdiomEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  node?: Resolver<ResolversTypes['Idiom'], ParentType, ContextType>,
};

export type IdiomOperationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['IdiomOperationResult'] = ResolversParentTypes['IdiomOperationResult']> = {
  status?: Resolver<ResolversTypes['OperationStatus'], ParentType, ContextType>,
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  idiom?: Resolver<Maybe<ResolversTypes['Idiom']>, ParentType, ContextType>,
};

export type LanguageResolvers<ContextType = any, ParentType extends ResolversParentTypes['Language'] = ResolversParentTypes['Language']> = {
  languageName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  languageNativeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  languageKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  countries?: Resolver<Array<ResolversTypes['Country']>, ParentType, ContextType>,
};

export type LoginResolvers<ContextType = any, ParentType extends ResolversParentTypes['Login'] = ResolversParentTypes['Login']> = {
  externalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  type?: Resolver<ResolversTypes['ProviderType'], ParentType, ContextType>,
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationUpdateIdiomArgs, 'idiom'>>,
  createIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationCreateIdiomArgs, 'idiom'>>,
  deleteIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationDeleteIdiomArgs, 'idiomId'>>,
  addEquivalent?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationAddEquivalentArgs, 'idiomId' | 'equivalentId'>>,
  removeEquivalent?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationRemoveEquivalentArgs, 'idiomId' | 'equivalentId'>>,
  acceptIdiomChangeProposal?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationAcceptIdiomChangeProposalArgs, 'proposalId'>>,
  rejectIdiomChangeProposal?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationRejectIdiomChangeProposalArgs, 'proposalId'>>,
};

export type OperationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['OperationResult'] = ResolversParentTypes['OperationResult']> = {
  status?: Resolver<ResolversTypes['OperationStatus'], ParentType, ContextType>,
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  endCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>,
  users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType, QueryUsersArgs>,
  idiom?: Resolver<Maybe<ResolversTypes['Idiom']>, ParentType, ContextType, QueryIdiomArgs>,
  idioms?: Resolver<ResolversTypes['IdiomConnection'], ParentType, ContextType, QueryIdiomsArgs>,
  languages?: Resolver<Array<ResolversTypes['Language']>, ParentType, ContextType>,
  countries?: Resolver<Array<ResolversTypes['Country']>, ParentType, ContextType, QueryCountriesArgs>,
  idiomChangeProposal?: Resolver<ResolversTypes['IdiomChangeProposal'], ParentType, ContextType, QueryIdiomChangeProposalArgs>,
  idiomChangeProposals?: Resolver<ResolversTypes['IdiomChangeProposalConnection'], ParentType, ContextType, QueryIdiomChangeProposalsArgs>,
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  role?: Resolver<Maybe<ResolversTypes['UserRole']>, ParentType, ContextType>,
  providers?: Resolver<Array<Maybe<ResolversTypes['Login']>>, ParentType, ContextType>,
};

export type Resolvers<ContextType = any> = {
  Country?: CountryResolvers<ContextType>,
  Idiom?: IdiomResolvers<ContextType>,
  IdiomChangeProposal?: IdiomChangeProposalResolvers<ContextType>,
  IdiomChangeProposalConnection?: IdiomChangeProposalConnectionResolvers<ContextType>,
  IdiomChangeProposalEdge?: IdiomChangeProposalEdgeResolvers<ContextType>,
  IdiomConnection?: IdiomConnectionResolvers<ContextType>,
  IdiomEdge?: IdiomEdgeResolvers<ContextType>,
  IdiomOperationResult?: IdiomOperationResultResolvers<ContextType>,
  Language?: LanguageResolvers<ContextType>,
  Login?: LoginResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  OperationResult?: OperationResultResolvers<ContextType>,
  PageInfo?: PageInfoResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>,
  auth?: AuthDirectiveResolver<any, any, ContextType>,
};


/**
* @deprecated
* Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
*/
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;