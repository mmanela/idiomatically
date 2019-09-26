import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    idiom(id: ID, slug: String): Idiom
    idioms(cursor: String, filter: String, locale: String, limit: Int): IdiomConnection!
  }

  type Mutation {
    updateIdiom(
      idiom: IdiomUpdateInput!
    ): IdiomOperationResult! @auth(requires: CONTRIBUTOR)

    createIdiom(
      idiom: IdiomCreateInput!
    ): IdiomOperationResult! @auth(requires: CONTRIBUTOR)

    deleteIdiom(
      idiomId: ID!
    ): OperationResult! @auth(requires: ADMIN)

    addEquivalent(idiomId:ID!, equivalentId: ID!): OperationResult! @auth(requires: CONTRIBUTOR)

    removeEquivalent(idiomId:ID!, equivalentId: ID!): OperationResult! @auth(requires: CONTRIBUTOR)
  }


  enum OperationStatus {
    SUCCESS
    FAILURE
    PENDING
  } 

  type OperationResult {
    status: OperationStatus!
    message: String
  }

  type IdiomOperationResult {
    status: OperationStatus!
    message: String
    idiom: Idiom
  }
  
  type IdiomConnection {
    edges: [IdiomEdge!]!
    pageInfo: PageInfo!
  }
  
  type IdiomEdge {
    cursor: String!
    node: Idiom!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  input IdiomCreateInput {
    title: String!
    description: String

    # The 2 letter language key
    languageKey: String!

    # The 2 letter country key
    countryKeys: [String!]

    tags: [String!]

    transliteration: String
    literalTranslation: String

    # When creating an idiom we let you quickly correlate
    # it to another one since often these are quick added
    relatedIdiomId: ID
  }

  input IdiomUpdateInput {
    id: ID!
    title: String
    description: String
    transliteration: String
    literalTranslation: String
    tags: [String!]

    # One or more countries to associate this idiom with
    countryKeys: [String!]
  }

  type Idiom {
    id: ID!

    # The url friendly unique identifier
    slug: String!,

    # The Idiom
    title: String!

    # Description of the idiom
    description: String

    tags: [String!]!
    
    # How to phonetically pronounce in English
    transliteration: String

    # What it literally means in English
    literalTranslation: String

    equivalents: [Idiom!]!
    language: Language!
    createdAt: String!
    createdBy: User
    updatedAt: String
    updatedBy: User
  }
`;
