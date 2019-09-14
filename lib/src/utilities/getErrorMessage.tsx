import { ApolloError } from "apollo-boost";
export function getErrorMessage(error: ApolloError) {
  if (error) {
    // Hack until apollo exposes error in mutation component
    const networkError = error.networkError as any;
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    } else if (
      error.networkError &&
      networkError.result &&
      networkError.result.errors &&
      networkError.result.errors.length > 0
    ) {
      return networkError.result.errors[0].message;
    } else {
      return "Invalid idiom, please try again";
    }
  }
}