import type { GraphQLResolveInfo } from 'graphql';
import type { GlobalContext } from '../model/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type Country = {
  __typename?: 'Country';
  countryKey: Scalars['String']['output'];
  countryName: Scalars['String']['output'];
  countryNativeName: Scalars['String']['output'];
  emojiFlag: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type Idiom = {
  __typename?: 'Idiom';
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<User>;
  description?: Maybe<Scalars['String']['output']>;
  equivalentCount: Scalars['Int']['output'];
  equivalents: Array<Idiom>;
  id: Scalars['ID']['output'];
  language: Language;
  literalTranslation?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  transliteration?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<User>;
};

export type IdiomChangeProposal = {
  __typename?: 'IdiomChangeProposal';
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  readOnlyCreatedBy: Scalars['String']['output'];
  readOnlySlug?: Maybe<Scalars['String']['output']>;
  readOnlyTitle?: Maybe<Scalars['String']['output']>;
  readOnlyType: Scalars['String']['output'];
};

export type IdiomChangeProposalConnection = {
  __typename?: 'IdiomChangeProposalConnection';
  edges: Array<IdiomChangeProposalEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdiomChangeProposalEdge = {
  __typename?: 'IdiomChangeProposalEdge';
  cursor: Scalars['String']['output'];
  node: IdiomChangeProposal;
};

export type IdiomConnection = {
  __typename?: 'IdiomConnection';
  edges: Array<IdiomEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IdiomCreateInput = {
  countryKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  languageKey: Scalars['String']['input'];
  literalTranslation?: InputMaybe<Scalars['String']['input']>;
  relatedIdiomId?: InputMaybe<Scalars['ID']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  transliteration?: InputMaybe<Scalars['String']['input']>;
};

export type IdiomEdge = {
  __typename?: 'IdiomEdge';
  cursor: Scalars['String']['output'];
  node: Idiom;
};

export type IdiomOperationResult = {
  __typename?: 'IdiomOperationResult';
  idiom?: Maybe<Idiom>;
  message?: Maybe<Scalars['String']['output']>;
  status: OperationStatus;
};

export type IdiomUpdateInput = {
  countryKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  literalTranslation?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  transliteration?: InputMaybe<Scalars['String']['input']>;
};

export type Language = {
  __typename?: 'Language';
  countries: Array<Country>;
  languageKey: Scalars['String']['output'];
  languageName: Scalars['String']['output'];
  languageNativeName: Scalars['String']['output'];
};

export type Login = {
  __typename?: 'Login';
  avatar?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  externalId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: ProviderType;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptIdiomChangeProposal: IdiomOperationResult;
  addEquivalent: IdiomOperationResult;
  computeEquivalentClosure: IdiomOperationResult;
  createIdiom: IdiomOperationResult;
  deleteIdiom: IdiomOperationResult;
  rejectIdiomChangeProposal: IdiomOperationResult;
  removeEquivalent: IdiomOperationResult;
  updateIdiom: IdiomOperationResult;
};


export type MutationAcceptIdiomChangeProposalArgs = {
  body?: InputMaybe<Scalars['String']['input']>;
  proposalId: Scalars['ID']['input'];
};


export type MutationAddEquivalentArgs = {
  equivalentId: Scalars['ID']['input'];
  idiomId: Scalars['ID']['input'];
};


export type MutationComputeEquivalentClosureArgs = {
  forceRun?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateIdiomArgs = {
  idiom: IdiomCreateInput;
};


export type MutationDeleteIdiomArgs = {
  idiomId: Scalars['ID']['input'];
};


export type MutationRejectIdiomChangeProposalArgs = {
  proposalId: Scalars['ID']['input'];
};


export type MutationRemoveEquivalentArgs = {
  equivalentId: Scalars['ID']['input'];
  idiomId: Scalars['ID']['input'];
};


export type MutationUpdateIdiomArgs = {
  idiom: IdiomUpdateInput;
};

export enum OperationStatus {
  Failure = 'FAILURE',
  Pending = 'PENDING',
  Pendingfailure = 'PENDINGFAILURE',
  Success = 'SUCCESS'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['String']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

export enum ProviderType {
  Facebook = 'FACEBOOK',
  Google = 'GOOGLE',
  Local = 'LOCAL'
}

export type Query = {
  __typename?: 'Query';
  countries: Array<Country>;
  idiom?: Maybe<Idiom>;
  idiomChangeProposal: IdiomChangeProposal;
  idiomChangeProposals: IdiomChangeProposalConnection;
  idioms: IdiomConnection;
  languages: Array<Language>;
  languagesWithIdioms: Array<Language>;
  me?: Maybe<User>;
  user?: Maybe<User>;
  users: Array<Maybe<User>>;
};


export type QueryCountriesArgs = {
  languageKey?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIdiomArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIdiomChangeProposalArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryIdiomChangeProposalsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryIdiomsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  filter?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  providers: Array<Maybe<Login>>;
  role?: Maybe<UserRole>;
};

export enum UserRole {
  Admin = 'ADMIN',
  Contributor = 'CONTRIBUTOR',
  General = 'GENERAL'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

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

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CacheControlScope: CacheControlScope;
  Country: ResolverTypeWrapper<Country>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Idiom: ResolverTypeWrapper<Idiom>;
  IdiomChangeProposal: ResolverTypeWrapper<IdiomChangeProposal>;
  IdiomChangeProposalConnection: ResolverTypeWrapper<IdiomChangeProposalConnection>;
  IdiomChangeProposalEdge: ResolverTypeWrapper<IdiomChangeProposalEdge>;
  IdiomConnection: ResolverTypeWrapper<IdiomConnection>;
  IdiomCreateInput: IdiomCreateInput;
  IdiomEdge: ResolverTypeWrapper<IdiomEdge>;
  IdiomOperationResult: ResolverTypeWrapper<IdiomOperationResult>;
  IdiomUpdateInput: IdiomUpdateInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Language: ResolverTypeWrapper<Language>;
  Login: ResolverTypeWrapper<Login>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OperationStatus: OperationStatus;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  ProviderType: ProviderType;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
  UserRole: UserRole;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Country: Country;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Idiom: Idiom;
  IdiomChangeProposal: IdiomChangeProposal;
  IdiomChangeProposalConnection: IdiomChangeProposalConnection;
  IdiomChangeProposalEdge: IdiomChangeProposalEdge;
  IdiomConnection: IdiomConnection;
  IdiomCreateInput: IdiomCreateInput;
  IdiomEdge: IdiomEdge;
  IdiomOperationResult: IdiomOperationResult;
  IdiomUpdateInput: IdiomUpdateInput;
  Int: Scalars['Int']['output'];
  Language: Language;
  Login: Login;
  Mutation: Record<PropertyKey, never>;
  PageInfo: PageInfo;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  User: User;
};

export type AuthDirectiveArgs = {
  requires?: Maybe<UserRole>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = GlobalContext, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CacheControlDirectiveArgs = {
  maxAge?: Maybe<Scalars['Int']['input']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = GlobalContext, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CountryResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['Country'] = ResolversParentTypes['Country']> = {
  countryKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  countryName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  countryNativeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emojiFlag?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type IdiomResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['Idiom'] = ResolversParentTypes['Idiom']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  equivalentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  equivalents?: Resolver<Array<ResolversTypes['Idiom']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  language?: Resolver<ResolversTypes['Language'], ParentType, ContextType>;
  literalTranslation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transliteration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type IdiomChangeProposalResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['IdiomChangeProposal'] = ResolversParentTypes['IdiomChangeProposal']> = {
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  readOnlyCreatedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readOnlySlug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  readOnlyTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  readOnlyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type IdiomChangeProposalConnectionResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['IdiomChangeProposalConnection'] = ResolversParentTypes['IdiomChangeProposalConnection']> = {
  edges?: Resolver<Array<ResolversTypes['IdiomChangeProposalEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type IdiomChangeProposalEdgeResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['IdiomChangeProposalEdge'] = ResolversParentTypes['IdiomChangeProposalEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['IdiomChangeProposal'], ParentType, ContextType>;
};

export type IdiomConnectionResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['IdiomConnection'] = ResolversParentTypes['IdiomConnection']> = {
  edges?: Resolver<Array<ResolversTypes['IdiomEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type IdiomEdgeResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['IdiomEdge'] = ResolversParentTypes['IdiomEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Idiom'], ParentType, ContextType>;
};

export type IdiomOperationResultResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['IdiomOperationResult'] = ResolversParentTypes['IdiomOperationResult']> = {
  idiom?: Resolver<Maybe<ResolversTypes['Idiom']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OperationStatus'], ParentType, ContextType>;
};

export type LanguageResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['Language'] = ResolversParentTypes['Language']> = {
  countries?: Resolver<Array<ResolversTypes['Country']>, ParentType, ContextType>;
  languageKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  languageName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  languageNativeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type LoginResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['Login'] = ResolversParentTypes['Login']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  externalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ProviderType'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  acceptIdiomChangeProposal?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationAcceptIdiomChangeProposalArgs, 'proposalId'>>;
  addEquivalent?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationAddEquivalentArgs, 'equivalentId' | 'idiomId'>>;
  computeEquivalentClosure?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, Partial<MutationComputeEquivalentClosureArgs>>;
  createIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationCreateIdiomArgs, 'idiom'>>;
  deleteIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationDeleteIdiomArgs, 'idiomId'>>;
  rejectIdiomChangeProposal?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationRejectIdiomChangeProposalArgs, 'proposalId'>>;
  removeEquivalent?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationRemoveEquivalentArgs, 'equivalentId' | 'idiomId'>>;
  updateIdiom?: Resolver<ResolversTypes['IdiomOperationResult'], ParentType, ContextType, RequireFields<MutationUpdateIdiomArgs, 'idiom'>>;
};

export type PageInfoResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  countries?: Resolver<Array<ResolversTypes['Country']>, ParentType, ContextType, Partial<QueryCountriesArgs>>;
  idiom?: Resolver<Maybe<ResolversTypes['Idiom']>, ParentType, ContextType, Partial<QueryIdiomArgs>>;
  idiomChangeProposal?: Resolver<ResolversTypes['IdiomChangeProposal'], ParentType, ContextType, Partial<QueryIdiomChangeProposalArgs>>;
  idiomChangeProposals?: Resolver<ResolversTypes['IdiomChangeProposalConnection'], ParentType, ContextType, Partial<QueryIdiomChangeProposalsArgs>>;
  idioms?: Resolver<ResolversTypes['IdiomConnection'], ParentType, ContextType, Partial<QueryIdiomsArgs>>;
  languages?: Resolver<Array<ResolversTypes['Language']>, ParentType, ContextType>;
  languagesWithIdioms?: Resolver<Array<ResolversTypes['Language']>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType, Partial<QueryUsersArgs>>;
};

export type UserResolvers<ContextType = GlobalContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  providers?: Resolver<Array<Maybe<ResolversTypes['Login']>>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['UserRole']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = GlobalContext> = {
  Country?: CountryResolvers<ContextType>;
  Idiom?: IdiomResolvers<ContextType>;
  IdiomChangeProposal?: IdiomChangeProposalResolvers<ContextType>;
  IdiomChangeProposalConnection?: IdiomChangeProposalConnectionResolvers<ContextType>;
  IdiomChangeProposalEdge?: IdiomChangeProposalEdgeResolvers<ContextType>;
  IdiomConnection?: IdiomConnectionResolvers<ContextType>;
  IdiomEdge?: IdiomEdgeResolvers<ContextType>;
  IdiomOperationResult?: IdiomOperationResultResolvers<ContextType>;
  Language?: LanguageResolvers<ContextType>;
  Login?: LoginResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = GlobalContext> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};
