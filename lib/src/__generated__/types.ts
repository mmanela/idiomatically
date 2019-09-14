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
// GraphQL query operation: GetIdiomListQuery
// ====================================================

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
  edges: GetIdiomListQuery_idioms_edges[];
}

export interface GetIdiomListQuery {
  idioms: GetIdiomListQuery_idioms;
}

export interface GetIdiomListQueryVariables {
  filter?: string | null;
  locale?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateIdiomMutation
// ====================================================

export interface CreateIdiomMutation_createIdiom_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface CreateIdiomMutation_createIdiom_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: CreateIdiomMutation_createIdiom_language_countries[];
}

export interface CreateIdiomMutation_createIdiom_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface CreateIdiomMutation_createIdiom_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: CreateIdiomMutation_createIdiom_equivalents_language_countries[];
}

export interface CreateIdiomMutation_createIdiom_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: CreateIdiomMutation_createIdiom_equivalents_language;
}

export interface CreateIdiomMutation_createIdiom {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: CreateIdiomMutation_createIdiom_language;
  equivalents: CreateIdiomMutation_createIdiom_equivalents[];
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

export interface UpdateIdiomMutation_updateIdiom_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface UpdateIdiomMutation_updateIdiom_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: UpdateIdiomMutation_updateIdiom_language_countries[];
}

export interface UpdateIdiomMutation_updateIdiom_equivalents_language_countries {
  __typename: "Country";
  countryKey: string;
  countryName: string;
  emojiFlag: string;
}

export interface UpdateIdiomMutation_updateIdiom_equivalents_language {
  __typename: "Language";
  languageKey: string;
  languageName: string;
  countries: UpdateIdiomMutation_updateIdiom_equivalents_language_countries[];
}

export interface UpdateIdiomMutation_updateIdiom_equivalents {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  language: UpdateIdiomMutation_updateIdiom_equivalents_language;
}

export interface UpdateIdiomMutation_updateIdiom {
  __typename: "Idiom";
  id: string;
  slug: string;
  title: string;
  literalTranslation: string | null;
  transliteration: string | null;
  description: string | null;
  language: UpdateIdiomMutation_updateIdiom_language;
  equivalents: UpdateIdiomMutation_updateIdiom_equivalents[];
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

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum UserRole {
  ADMIN = "ADMIN",
  CONTRIBUTOR = "CONTRIBUTOR",
  GENERAL = "GENERAL",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
