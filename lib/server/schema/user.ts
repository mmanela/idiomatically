import { gql } from 'apollo-server-express';

export default gql`

  # Apollo defines these internally but
  # graphql-codegen was flipping out over it not
  # being define, so re-define it here
  directive @cacheControl(
    maxAge: Int,
    scope: CacheControlScope
  ) on OBJECT | FIELD_DEFINITION

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }


  enum UserRole {
    ADMIN
    CONTRIBUTOR
    GENERAL
  } 

  directive @auth(
    requires: UserRole = ADMIN,
  ) on OBJECT | FIELD_DEFINITION

  type Query {
    me: User @cacheControl(maxAge: 0)
    user(id: ID!): User @auth(requires: CONTRIBUTOR) @cacheControl(maxAge: 0)
    users(filter: String, limit: Int): [User]! @auth(requires: ADMIN) @cacheControl(maxAge: 0)
  }

  type User {
    id: ID!

    # These are denormalized from logins
    # but may let them be changed in the future
    name: String!
    avatar: String
    role: UserRole,
    providers: [Login]!
  }

  enum ProviderType {
    GOOGLE
    FACEBOOK
  } 

  type Login @auth(requires: ADMIN) {
    externalId: ID!
    name: String!
    email: String,
    avatar: String,
    type: ProviderType!
  }
`;
