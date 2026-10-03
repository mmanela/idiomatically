import { gql } from "@apollo/client";
import type { GetLanguagesWithIdioms } from "../__generated__/types";
import { graphqlRequest } from "../graphql.server";
import { toLanguageSlug } from "../utilities/languagePath";

const languagesWithIdiomsQuery = gql`
  query GetSeoLanguagesWithIdioms {
    languagesWithIdioms {
      languageName
      languageNativeName
      languageKey
    }
  }
`;

export async function loadLanguagesWithIdioms(request: Request) {
  const data = await graphqlRequest<GetLanguagesWithIdioms, Record<string, never>>(
    request,
    languagesWithIdiomsQuery,
    {},
  );
  return data.languagesWithIdioms;
}

export function findLanguageBySlug(
  languages: GetLanguagesWithIdioms["languagesWithIdioms"],
  slug: string | undefined,
) {
  return languages.find(
    (language) => toLanguageSlug(language.languageName) === slug,
  );
}
