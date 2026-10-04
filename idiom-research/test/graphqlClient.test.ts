import test from "node:test";
import assert from "node:assert/strict";
import { IdiomaticallyGraphqlClient } from "../src/graphqlClient.js";

test("omits a null cursor from the first GraphQL page request", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.IDIOMATICALLY_GRAPHQL_URL;
  const requestBodies: Array<{
    query: string;
    variables: Record<string, unknown>;
  }> = [];
  process.env.IDIOMATICALLY_GRAPHQL_URL = "https://example.test/graphql";
  globalThis.fetch = async (_input, init) => {
    requestBodies.push(JSON.parse(String(init?.body)));
    return new Response(
      JSON.stringify({
        data: {
          idioms: {
            edges: [],
            pageInfo: { hasNextPage: false, endCursor: "0" },
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  };

  try {
    const idioms = await new IdiomaticallyGraphqlClient().listIdioms();
    assert.deepEqual(idioms, []);
    assert.equal(requestBodies.length, 1);
    assert.deepEqual(requestBodies[0].variables, { limit: 100 });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) {
      delete process.env.IDIOMATICALLY_GRAPHQL_URL;
    } else {
      process.env.IDIOMATICALLY_GRAPHQL_URL = originalUrl;
    }
  }
});
