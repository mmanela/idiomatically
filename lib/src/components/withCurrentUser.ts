import { withApollo, withQuery, WithApolloClient } from "react-apollo";
import gql from "graphql-tag";
import {
    GetCurrentUser, GetCurrentUser_me
} from "../__generated__/types";
import { ApolloQueryResult } from "apollo-boost";

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

export type WithCurrentUserProps<TProps> = TProps & {
    resetOnLogout?: () => Promise<ApolloQueryResult<any>[] | null>,
    currentUser?: GetCurrentUser_me | null,
    currentUserLoading?: boolean
}

// Playing with using the HOC for querying and composing Apollo client. It is much easier to just use the Query component
// but this can be usefull for keeping child components pure. Overall, it it a pain to get the type "correct"
export function withCurrentUser<TProps = {}>(wrappedComponent: React.ComponentType<WithCurrentUserProps<TProps>>) {

    // This is gross but the problem is WithQuery assumes the wrapped component is of this type
    // WrappedComponent: React.ComponentType<TProps & TChildProps>
    // but I want it just to be WrappedComponent: React.ComponentType<TChildProps>
    // since I am re-writing the props in the props method in withQuery. Not sure why this is the type
    // since it prevents me from doing that.
    const castedComponent = wrappedComponent as unknown as React.ComponentType<WithApolloClient<WithCurrentUserProps<TProps>>>;
    const component = withQuery<WithApolloClient<TProps>, GetCurrentUser, {}, WithCurrentUserProps<TProps>>(getCurrentUserQuery, {
        props: ({ data, ownProps }) => {
            return {
                currentUser: data!.me,
                currentUserLoading: data!.loading,
                resetOnLogout: async () => ownProps.client.resetStore(),
                ...ownProps
            }
        }
    })(castedComponent);

    return withApollo<TProps>(component);
}