export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};



export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export enum UserRole {
  Admin = 'ADMIN',
  Contributor = 'CONTRIBUTOR',
  General = 'GENERAL'
}

export type Query = {
   __typename?: 'Query';
  me?: Maybe<User>;
  user?: Maybe<User>;
  users: Array<Maybe<User>>;
  idiom?: Maybe<Idiom>;
  idioms: IdiomConnection;
  languages: Array<Language>;
  languagesWithIdioms: Array<Language>;
  countries: Array<Country>;
  idiomChangeProposal: IdiomChangeProposal;
  idiomChangeProposals: IdiomChangeProposalConnection;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryUsersArgs = {
  filter?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
};


export type QueryIdiomArgs = {
  id?: Maybe<Scalars['ID']>;
  slug?: Maybe<Scalars['String']>;
};


export type QueryIdiomsArgs = {
  cursor?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
};


export type QueryCountriesArgs = {
  languageKey?: Maybe<Scalars['String']>;
};


export type QueryIdiomChangeProposalArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryIdiomChangeProposalsArgs = {
  cursor?: Maybe<Scalars['String']>;
  filter?: Maybe<Scalars['String']>;
  limit?: Maybe<Scalars['Int']>;
};

export type User = {
   __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  role?: Maybe<UserRole>;
  providers: Array<Maybe<Login>>;
};

export enum ProviderType {
  Google = 'GOOGLE',
  Facebook = 'FACEBOOK'
}

export type Login = {
   __typename?: 'Login';
  externalId: Scalars['ID'];
  name: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  avatar?: Maybe<Scalars['String']>;
  type: ProviderType;
};

export type Mutation = {
   __typename?: 'Mutation';
  updateIdiom: IdiomOperationResult;
  createIdiom: IdiomOperationResult;
  deleteIdiom: IdiomOperationResult;
  addEquivalent: IdiomOperationResult;
  removeEquivalent: IdiomOperationResult;
  computeEquivalentClosure: IdiomOperationResult;
  acceptIdiomChangeProposal: IdiomOperationResult;
  rejectIdiomChangeProposal: IdiomOperationResult;
};


export type MutationUpdateIdiomArgs = {
  idiom: IdiomUpdateInput;
};


export type MutationCreateIdiomArgs = {
  idiom: IdiomCreateInput;
};


export type MutationDeleteIdiomArgs = {
  idiomId: Scalars['ID'];
};


export type MutationAddEquivalentArgs = {
  idiomId: Scalars['ID'];
  equivalentId: Scalars['ID'];
};


export type MutationRemoveEquivalentArgs = {
  idiomId: Scalars['ID'];
  equivalentId: Scalars['ID'];
};


export type MutationComputeEquivalentClosureArgs = {
  forceRun?: Maybe<Scalars['Boolean']>;
};


export type MutationAcceptIdiomChangeProposalArgs = {
  proposalId: Scalars['ID'];
  body?: Maybe<Scalars['String']>;
};


export type MutationRejectIdiomChangeProposalArgs = {
  proposalId: Scalars['ID'];
};

export enum OperationStatus {
  Success = 'SUCCESS',
  Failure = 'FAILURE',
  Pending = 'PENDING',
  Pendingfailure = 'PENDINGFAILURE'
}

export type IdiomOperationResult = {
   __typename?: 'IdiomOperationResult';
  status: OperationStatus;
  message?: Maybe<Scalars['String']>;
  idiom?: Maybe<Idiom>;
};

export type IdiomConnection = {
   __typename?: 'IdiomConnection';
  edges: Array<IdiomEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type IdiomEdge = {
   __typename?: 'IdiomEdge';
  cursor: Scalars['String'];
  node: Idiom;
};

export type PageInfo = {
   __typename?: 'PageInfo';
  hasNextPage: Scalars['Boolean'];
  endCursor: Scalars['String'];
};

export type IdiomCreateInput = {
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  languageKey: Scalars['String'];
  countryKeys?: Maybe<Array<Scalars['String']>>;
  tags?: Maybe<Array<Scalars['String']>>;
  transliteration?: Maybe<Scalars['String']>;
  literalTranslation?: Maybe<Scalars['String']>;
  relatedIdiomId?: Maybe<Scalars['ID']>;
};

export type IdiomUpdateInput = {
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  transliteration?: Maybe<Scalars['String']>;
  literalTranslation?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  countryKeys?: Maybe<Array<Scalars['String']>>;
};

export type Idiom = {
   __typename?: 'Idiom';
  id: Scalars['ID'];
  slug: Scalars['String'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  tags: Array<Scalars['String']>;
  transliteration?: Maybe<Scalars['String']>;
  literalTranslation?: Maybe<Scalars['String']>;
  equivalents: Array<Idiom>;
  language: Language;
  createdAt: Scalars['String'];
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['String']>;
  updatedBy?: Maybe<User>;
};

export type Language = {
   __typename?: 'Language';
  languageName: Scalars['String'];
  languageNativeName: Scalars['String'];
  languageKey: Scalars['String'];
  countries: Array<Country>;
};

export type Country = {
   __typename?: 'Country';
  countryKey: Scalars['String'];
  countryName: Scalars['String'];
  countryNativeName: Scalars['String'];
  emojiFlag: Scalars['String'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
};

export type IdiomChangeProposalConnection = {
   __typename?: 'IdiomChangeProposalConnection';
  edges: Array<IdiomChangeProposalEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type IdiomChangeProposalEdge = {
   __typename?: 'IdiomChangeProposalEdge';
  cursor: Scalars['String'];
  node: IdiomChangeProposal;
};

export type IdiomChangeProposal = {
   __typename?: 'IdiomChangeProposal';
  id: Scalars['ID'];
  readOnlyType: Scalars['String'];
  readOnlyCreatedBy: Scalars['String'];
  readOnlyTitle?: Maybe<Scalars['String']>;
  readOnlySlug?: Maybe<Scalars['String']>;
  body: Scalars['String'];
};



import { GraphQLResolveInfo } from 'graphql';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>



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

export type SubscriptionResolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

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
  CacheControlScope: CacheControlScope,
  UserRole: UserRole,
  Query: {},
  ID: Scalars['ID'],
  String: Scalars['String'],
  Int: Scalars['Int'],
  User: User,
  ProviderType: ProviderType,
  Login: Login,
  Mutation: {},
  Boolean: Scalars['Boolean'],
  OperationStatus: OperationStatus,
  IdiomOperationResult: IdiomOperationResult,
  IdiomConnection: IdiomConnection,
  IdiomEdge: IdiomEdge,
  PageInfo: PageInfo,
  IdiomCreateInput: IdiomCreateInput,
  IdiomUpdateInput: IdiomUpdateInput,
  Idiom: Idiom,
  Language: Language,
  Country: Country,
  Float: Scalars['Float'],
  IdiomChangeProposalConnection: IdiomChangeProposalConnection,
  IdiomChangeProposalEdge: IdiomChangeProposalEdge,
  IdiomChangeProposal: IdiomChangeProposal,
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = {   maxAge?: Maybe<Maybe<Scalars['Int']>>,
  scope?: Maybe<Maybe<CacheControlScope>> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = {   requires: Maybe<UserRole> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type QueryResolvers<ContextType = any, ParentType = ResolversTypes['Query']> = {
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, QueryUserArgs>,
  users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType, QueryUsersArgs>,
  idiom?: Resolver<Maybe<ResolversTypes['Idiom']>, ParentType, ContextType, QueryIdiomArgs>,
  idioms?: Resolver<ResolversTypes['IdiomConnection'], ParentType, ContextType, QueryIdiomsArgs>,
  languages?: Resolver<Array<ResolversTypes['Language']>, ParentType, ContextType>,
  languagesWithIdioms?: Resolver<Array<ResolversTypes['Language']>, ParentType, ContextType>,
  countries?: Resolver<Array<ResolversTypes['Country']>, ParentType, ContextType, QueryCountriesArgs>,
  idiomChangeProposal?: Resolver<ResolversTypes['IdiomChangeProposal'], ParentType, ContextType, QueryIdiomChangeProposalArgs>,
  idiomChangeProposals?: Resolver<ResolversTypes['IdiomChangeProposalConnection'], ParentType, ContextType, QueryIdiomChangeProposalsArgs>,
};

export type UserResolvers<ContextType = any, ParentType = ResolversTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  role?: Resolver<Maybe<ResolversTypes['UserRole']>, ParentType, ContextType>,
  providers?: Resolver<Array<Maybe<ResolversTypes['Login']>>, ParentType, ContextType>,
};

export type LoginResolvers<ContextType = any, ParentType = ResolversTypes['Login']> = {
  externalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  type?: Resolver<ResolversTypes['ProviderType'], ParentType, ContextType>,
};

export type MutationResolvers<ContextType = any, ParentType = ResolversTypes['Mutation']> = {
  updateIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationUpdateIdiomArgs>,
  createIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationCreateIdiomArgs>,
  deleteIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationDeleteIdiomArgs>,
  addEquivalent?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationAddEquivalentArgs>,
  removeEquivalent?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationRemoveEquivalentArgs>,
  computeEquivalentClosure?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationComputeEquivalentClosureArgs>,
  acceptIdiomChangeProposal?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationAcceptIdiomChangeProposalArgs>,
  rejectIdiomChangeProposal?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, MutationRejectIdiomChangeProposalArgs>,
};

export type IdiomOperationResultResolvers<ContextType = any, ParentType = ResolversTypes['IdiomOperationResult']> = {
  status?: Resolver<ResolversTypes['OperationStatus'], ParentType, ContextType>,
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  idiom?: Resolver<Maybe<ResolversTypes['Idiom']>, ParentType, ContextType>,
};

export type IdiomConnectionResolvers<ContextType = any, ParentType = ResolversTypes['IdiomConnection']> = {
  edges?: Resolver<Array<ResolversTypes['IdiomEdge']>, ParentType, ContextType>,
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>,
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
};

export type IdiomEdgeResolvers<ContextType = any, ParentType = ResolversTypes['IdiomEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  node?: Resolver<ResolversTypes['Idiom'], ParentType, ContextType>,
};

export type PageInfoResolvers<ContextType = any, ParentType = ResolversTypes['PageInfo']> = {
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  endCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type IdiomResolvers<ContextType = any, ParentType = ResolversTypes['Idiom']> = {
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

export type LanguageResolvers<ContextType = any, ParentType = ResolversTypes['Language']> = {
  languageName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  languageNativeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  languageKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  countries?: Resolver<Array<ResolversTypes['Country']>, ParentType, ContextType>,
};

export type CountryResolvers<ContextType = any, ParentType = ResolversTypes['Country']> = {
  countryKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  countryName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  countryNativeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  emojiFlag?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>,
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>,
};

export type IdiomChangeProposalConnectionResolvers<ContextType = any, ParentType = ResolversTypes['IdiomChangeProposalConnection']> = {
  edges?: Resolver<Array<ResolversTypes['IdiomChangeProposalEdge']>, ParentType, ContextType>,
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>,
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
};

export type IdiomChangeProposalEdgeResolvers<ContextType = any, ParentType = ResolversTypes['IdiomChangeProposalEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  node?: Resolver<ResolversTypes['IdiomChangeProposal'], ParentType, ContextType>,
};

export type IdiomChangeProposalResolvers<ContextType = any, ParentType = ResolversTypes['IdiomChangeProposal']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  readOnlyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  readOnlyCreatedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  readOnlyTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  readOnlySlug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  Login?: LoginResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  IdiomOperationResult?: IdiomOperationResultResolvers<ContextType>,
  IdiomConnection?: IdiomConnectionResolvers<ContextType>,
  IdiomEdge?: IdiomEdgeResolvers<ContextType>,
  PageInfo?: PageInfoResolvers<ContextType>,
  Idiom?: IdiomResolvers<ContextType>,
  Language?: LanguageResolvers<ContextType>,
  Country?: CountryResolvers<ContextType>,
  IdiomChangeProposalConnection?: IdiomChangeProposalConnectionResolvers<ContextType>,
  IdiomChangeProposalEdge?: IdiomChangeProposalEdgeResolvers<ContextType>,
  IdiomChangeProposal?: IdiomChangeProposalResolvers<ContextType>,
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