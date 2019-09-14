import { Query } from "react-apollo";
import { GetIdiomQuery, GetIdiomQueryVariables } from "../__generated__/types";
import { FULL_IDIOM_ENTRY } from "./fragments";
import gql from "graphql-tag";

export class IdiomQuery extends Query<GetIdiomQuery, GetIdiomQueryVariables> {}

export const getIdiomQuery = gql`
  query GetIdiomQuery($slug: String, $id: ID) {
    idiom(slug: $slug, id: $id) {
      ...FullIdiomEntry
    }
  }
  ${FULL_IDIOM_ENTRY}
`;