import { getOperationAST, print, type DocumentNode } from "graphql";

export async function graphqlRequest<TData, TVariables>(
  request: Request,
  query: DocumentNode,
  variables: TVariables,
) {
  const operationName =
    getOperationAST(query)?.name?.value || "ServerSideRender";
  const graphqlUrl = new URL(
    "/graphql",
    `http://127.0.0.1:${process.env.PORT || "3000"}`,
  );
  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "apollo-require-preflight": "true",
      "content-type": "application/json",
      cookie: request.headers.get("cookie") || "",
      "x-apollo-operation-name": operationName,
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
