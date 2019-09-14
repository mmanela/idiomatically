import { gql } from 'apollo-server-express';

export default gql`
  type Query {
    languages: [Language!]!
    countries(languageKey: String): [Country!]!
  }

  type Language {
    languageName: String!
    languageNativeName: String!
    languageKey: String!

    # Countries where this language is common
    countries: [Country!]!
  }

  type Country {
    countryKey: String!
    countryName: String!
    countryNativeName: String!
    emojiFlag: String!
  }
`;
