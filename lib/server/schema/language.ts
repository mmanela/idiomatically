import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    languages: [Language!]! @cacheControl(maxAge: 3600)
    countries(languageKey: String): [Country!]! @cacheControl(maxAge: 3600)
  }

  type Language  @cacheControl(maxAge: 3600) {
    languageName: String!
    languageNativeName: String!
    languageKey: String!

    # Countries where this language is common
    countries: [Country!]!
  }

  type Country  @cacheControl(maxAge: 3600) {
    countryKey: String!
    countryName: String!
    countryNativeName: String!
    emojiFlag: String!
  }
`;
