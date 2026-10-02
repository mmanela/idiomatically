import { CombinedGraphQLErrors } from "@apollo/client";

export function isAuthenticationError(error?: unknown) {
  return getErrorMessage(error).includes("User must be logged in");
}

export function getErrorMessage(error?: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message || "Invalid idiom, please try again";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Invalid idiom, please try again";
}
