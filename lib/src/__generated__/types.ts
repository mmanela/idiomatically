/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AddEquivalentIdiomMutation
// ====================================================

export interface AddEquivalentIdiomMutation_addEquivalent {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
}

export interface AddEquivalentIdiomMutation {
  addEquivalent: AddEquivalentIdiomMutation_addEquivalent;
}

export interface AddEquivalentIdiomMutationVariables {
  idiomId: string;
  equivalentId: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FindIdiomsQuery
// ====================================================

export interface FindIdiomsQuery_idioms_pageInfo {
  __typename: "PageInfo";
  endCursor: string;
  hasNextPage: boolean;
}

export interface FindIdiomsQuery_idioms_edges_node_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface FindIdiomsQuery_idioms_edges_node_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: FindIdiomsQuery_idioms_edges_node_language_countries[];
}

export interface FindIdiomsQuery_idioms_edges_node {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  language: FindIdiomsQuery_idioms_edges_node_language;
}

export interface FindIdiomsQuery_idioms_edges {
  __typename: "IdiomEdge";
  node: FindIdiomsQuery_idioms_edges_node;
}

export interface FindIdiomsQuery_idioms {
  __typename: "IdiomConnection";
  totalCount: number;
  pageInfo: FindIdiomsQuery_idioms_pageInfo;
  edges: FindIdiomsQuery_idioms_edges[];
}

export interface FindIdiomsQuery {
  idioms: FindIdiomsQuery_idioms;
}

export interface FindIdiomsQueryVariables {
  filter?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCountriesQuery
// ====================================================

export interface GetCountriesQuery_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  countryNativeName: string;
}

export interface GetCountriesQuery {
  countries: GetCountriesQuery_countries[];
}

export interface GetCountriesQueryVariables {
  languageKey?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RemoveEquivalentIdiomMutation
// ====================================================

export interface RemoveEquivalentIdiomMutation_removeEquivalent {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
}

export interface RemoveEquivalentIdiomMutation {
  removeEquivalent: RemoveEquivalentIdiomMutation_removeEquivalent;
}

export interface RemoveEquivalentIdiomMutationVariables {
  idiomId: string;
  equivalentId: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguagesQuery
// ====================================================

export interface GetLanguagesQuery_languages {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  languageNativeName: string;
}

export interface GetLanguagesQuery {
  languages: GetLanguagesQuery_languages[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguagesWithIdioms
// ====================================================

export interface GetLanguagesWithIdioms_languagesWithIdioms {
  __typename: "Language";
  languageName: string;
  languageNativeName: string;
  languageKey: string;
}

export interface GetLanguagesWithIdioms {
  languagesWithIdioms: GetLanguagesWithIdioms_languagesWithIdioms[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCurrentUser
// ====================================================

export interface GetCurrentUser_me {
  __typename: "User";
  id: string;
  name: string;
  avatar: string | null;
  role: UserRole | null;
}

export interface GetCurrentUser {
  me: GetCurrentUser_me | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetIdiomQuery
// ====================================================

export interface GetIdiomQuery_idiom_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface GetIdiomQuery_idiom_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: GetIdiomQuery_idiom_language_countries[];
}

export interface GetIdiomQuery_idiom_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface GetIdiomQuery_idiom_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: GetIdiomQuery_idiom_equivalents_language_countries[];
}

export interface GetIdiomQuery_idiom_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: GetIdiomQuery_idiom_equivalents_language;
}

export interface GetIdiomQuery_idiom {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: GetIdiomQuery_idiom_language;
  equivalents: GetIdiomQuery_idiom_equivalents[];
}

export interface GetIdiomQuery {
  idiom: GetIdiomQuery_idiom | null;
}

export interface GetIdiomQueryVariables {
  slug?: string | null;
  id?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetChangeProposalsQuery
// ====================================================

export interface GetChangeProposalsQuery_idiomChangeProposals_pageInfo {
  __typename: "PageInfo";
  endCursor: string;
  hasNextPage: boolean;
}

export interface GetChangeProposalsQuery_idiomChangeProposals_edges_node {
  __typename: "IdiomChangeProposal";
  id: string;
  body: string;
  readOnlyType: string;
  readOnlyCreatedBy: string;
  readOnlyTitle: string | null;
  readOnlySlug: string | null;
}

export interface GetChangeProposalsQuery_idiomChangeProposals_edges {
  __typename: "IdiomChangeProposalEdge";
  node: GetChangeProposalsQuery_idiomChangeProposals_edges_node;
}

export interface GetChangeProposalsQuery_idiomChangeProposals {
  __typename: "IdiomChangeProposalConnection";
  totalCount: number;
  pageInfo: GetChangeProposalsQuery_idiomChangeProposals_pageInfo;
  edges: GetChangeProposalsQuery_idiomChangeProposals_edges[];
}

export interface GetChangeProposalsQuery {
  idiomChangeProposals: GetChangeProposalsQuery_idiomChangeProposals;
}

export interface GetChangeProposalsQueryVariables {
  filter?: string | null;
  limit?: number | null;
  cursor?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AcceptChangeProposalMutation
// ====================================================

export interface AcceptChangeProposalMutation_acceptIdiomChangeProposal {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
}

export interface AcceptChangeProposalMutation {
  acceptIdiomChangeProposal: AcceptChangeProposalMutation_acceptIdiomChangeProposal;
}

export interface AcceptChangeProposalMutationVariables {
  id: string;
  body?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RejectChangeProposalMutation
// ====================================================

export interface RejectChangeProposalMutation_rejectIdiomChangeProposal {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
}

export interface RejectChangeProposalMutation {
  rejectIdiomChangeProposal: RejectChangeProposalMutation_rejectIdiomChangeProposal;
}

export interface RejectChangeProposalMutationVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteIdiomMutation
// ====================================================

export interface DeleteIdiomMutation_deleteIdiom {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
}

export interface DeleteIdiomMutation {
  deleteIdiom: DeleteIdiomMutation_deleteIdiom;
}

export interface DeleteIdiomMutationVariables {
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetIdiomListQuery
// ====================================================

export interface GetIdiomListQuery_idioms_pageInfo {
  __typename: "PageInfo";
  endCursor: string;
  hasNextPage: boolean;
}

export interface GetIdiomListQuery_idioms_edges_node_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface GetIdiomListQuery_idioms_edges_node_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: GetIdiomListQuery_idioms_edges_node_language_countries[];
}

export interface GetIdiomListQuery_idioms_edges_node_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface GetIdiomListQuery_idioms_edges_node_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: GetIdiomListQuery_idioms_edges_node_equivalents_language_countries[];
}

export interface GetIdiomListQuery_idioms_edges_node_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: GetIdiomListQuery_idioms_edges_node_equivalents_language;
}

export interface GetIdiomListQuery_idioms_edges_node {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: GetIdiomListQuery_idioms_edges_node_language;
  equivalents: GetIdiomListQuery_idioms_edges_node_equivalents[];
}

export interface GetIdiomListQuery_idioms_edges {
  __typename: "IdiomEdge";
  node: GetIdiomListQuery_idioms_edges_node;
}

export interface GetIdiomListQuery_idioms {
  __typename: "IdiomConnection";
  totalCount: number;
  pageInfo: GetIdiomListQuery_idioms_pageInfo;
  edges: GetIdiomListQuery_idioms_edges[];
}

export interface GetIdiomListQuery {
  idioms: GetIdiomListQuery_idioms;
}

export interface GetIdiomListQueryVariables {
  filter?: string | null;
  locale?: string | null;
  limit?: number | null;
  cursor?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateIdiomMutation
// ====================================================

export interface CreateIdiomMutation_createIdiom_idiom_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface CreateIdiomMutation_createIdiom_idiom_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: CreateIdiomMutation_createIdiom_idiom_language_countries[];
}

export interface CreateIdiomMutation_createIdiom_idiom_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface CreateIdiomMutation_createIdiom_idiom_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: CreateIdiomMutation_createIdiom_idiom_equivalents_language_countries[];
}

export interface CreateIdiomMutation_createIdiom_idiom_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: CreateIdiomMutation_createIdiom_idiom_equivalents_language;
}

export interface CreateIdiomMutation_createIdiom_idiom {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: CreateIdiomMutation_createIdiom_idiom_language;
  equivalents: CreateIdiomMutation_createIdiom_idiom_equivalents[];
}

export interface CreateIdiomMutation_createIdiom {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
  idiom: CreateIdiomMutation_createIdiom_idiom | null;
}

export interface CreateIdiomMutation {
  createIdiom: CreateIdiomMutation_createIdiom;
}

export interface CreateIdiomMutationVariables {
  title: string;
  languageKey: string;
  countryKeys: string[];
  description?: string | null;
  literalTranslation?: string | null;
  transliteration?: string | null;
  relatedIdiomId?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateIdiomMutation
// ====================================================

export interface UpdateIdiomMutation_updateIdiom_idiom_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface UpdateIdiomMutation_updateIdiom_idiom_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: UpdateIdiomMutation_updateIdiom_idiom_language_countries[];
}

export interface UpdateIdiomMutation_updateIdiom_idiom_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface UpdateIdiomMutation_updateIdiom_idiom_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: UpdateIdiomMutation_updateIdiom_idiom_equivalents_language_countries[];
}

export interface UpdateIdiomMutation_updateIdiom_idiom_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: UpdateIdiomMutation_updateIdiom_idiom_equivalents_language;
}

export interface UpdateIdiomMutation_updateIdiom_idiom {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: UpdateIdiomMutation_updateIdiom_idiom_language;
  equivalents: UpdateIdiomMutation_updateIdiom_idiom_equivalents[];
}

export interface UpdateIdiomMutation_updateIdiom {
  __typename: "IdiomOperationResult";
  status: OperationStatus;
  message: string | null;
  idiom: UpdateIdiomMutation_updateIdiom_idiom | null;
}

export interface UpdateIdiomMutation {
  updateIdiom: UpdateIdiomMutation_updateIdiom;
}

export interface UpdateIdiomMutationVariables {
  id: string;
  title?: string | null;
  countryKeys?: string[] | null;
  description?: string | null;
  literalTranslation?: string | null;
  transliteration?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: FullIdiomEntry
// ====================================================

export interface FullIdiomEntry_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface FullIdiomEntry_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: FullIdiomEntry_language_countries[];
}

export interface FullIdiomEntry_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface FullIdiomEntry_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: FullIdiomEntry_equivalents_language_countries[];
}

export interface FullIdiomEntry_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: FullIdiomEntry_equivalents_language;
}

export interface FullIdiomEntry {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: FullIdiomEntry_language;
  equivalents: FullIdiomEntry_equivalents[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: MinimalIdiomEntry
// ====================================================

export interface MinimalIdiomEntry_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface MinimalIdiomEntry_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: MinimalIdiomEntry_language_countries[];
}

export interface MinimalIdiomEntry {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  language: MinimalIdiomEntry_language;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum OperationStatus {
  FAILURE = "FAILURE",
  PENDING = "PENDING",
  PENDINGFAILURE = "PENDINGFAILURE",
  SUCCESS = "SUCCESS",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CONTRIBUTOR = "CONTRIBUTOR",
  GENERAL = "GENERAL",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
