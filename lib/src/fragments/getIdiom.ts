import { FULL_IDIOM_ENTRY } from "./fragments";
import { gql } from "@apollo/client";

export const getIdiomQuery = gql`
  query GetIdiomQuery($slug: String, $id: ID) {
    idiom(slug: $slug, id: $id) {
      ...FullIdiomEntry
    }
  }
  ${FULL_IDIOM_ENTRY}
`;