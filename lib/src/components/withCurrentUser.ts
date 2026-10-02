import {
    GetCurrentUser, GetCurrentUser_me
} from "../__generated__/types";
import { ApolloQueryResult, gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";

export const getCurrentUserQuery = gql`
  query GetCurrentUser {
    me {
        id
        name
        avatar
        role
    }
  }
`;

export type CurrentUserModel = {
    resetOnLogout?: () => Promise<ApolloQueryResult<any>[] | null>,
    currentUser?: GetCurrentUser_me | null,
    currentUserLoading?: boolean
}


export function useCurrentUser(
    initialCurrentUser?: GetCurrentUser_me | null
) {
    const client = useApolloClient();
    const { data, loading } = useQuery<GetCurrentUser | null>(getCurrentUserQuery);
    const hasInitialCurrentUser = initialCurrentUser !== undefined;

    return {
        currentUser: loading && hasInitialCurrentUser
            ? initialCurrentUser
            : data && data.me,
        currentUserLoading: loading && !hasInitialCurrentUser,
        resetOnLogout: async () => client.resetStore()
    }
}