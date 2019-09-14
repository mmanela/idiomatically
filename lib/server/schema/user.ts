import { gql } from 'apollo-server-express';

export default gql`
  enum UserRole {
    ADMIN
    CONTRIBUTOR
    GENERAL
  } 

  directive @auth(
    requires: UserRole = ADMIN,
  ) on OBJECT | FIELD_DEFINITION

  type Query {
    me: User
    user(id: ID!): User @auth(requires: CONTRIBUTOR)
    users(filter: String, limit: Int): [User]! @auth(requires: ADMIN)
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
