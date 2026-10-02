import { print, type DocumentNode } from "graphql";

export async function graphqlRequest<TData, TVariables>(
  request: Request,
  query: DocumentNode,
  variables: TVariables,
) {
  const response = await fetch(new URL("/graphql", request.url), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify({
      query: print(query),
      variables,
    }),
  });
  const result = (await response.json()) as {
    data?: TData;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || result.errors?.length || !result.data) {
    throw new Response(
      result.errors?.[0]?.message || "GraphQL request failed",
      { status: response.ok ? 500 : response.status },
    );
  }

  return result.data;
}
