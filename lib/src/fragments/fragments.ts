import gql from "graphql-tag";

export const FULL_IDIOM_ENTRY = gql`
fragment FullIdiomEntry on Idiom {
    id
    slug
    title
    literalTranslation
    transliteration
    description
    language {
        languageKey
        languageName
        countries {
            countryKey
            countryName
            emojiFlag
        }
    }
    equivalents {
        id
        slug
        title
        literalTranslation
        transliteration
        language {
            languageKey
            languageName
            countries {
                countryKey
                countryName
                emojiFlag
            }
        }
    }
}`;

export const MINIMAL_IDIOM_ENTRY = gql`
fragment MinimalIdiomEntry on Idiom {
    id
    slug
    title
    language {
        languageKey
        languageName
        countries {
            countryKey
            countryName
            emojiFlag
        }
    } 
}`;