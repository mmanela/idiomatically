import test from "node:test";
import assert from "node:assert/strict";
import { parseStructuredResponse } from "../src/copilotClient.js";

test("parses plain Copilot JSON output", () => {
  assert.deepEqual(parseStructuredResponse('{"found":true}'), {
    found: true,
  });
});

test("tolerates a fenced Copilot JSON response", () => {
  assert.deepEqual(
    parseStructuredResponse('```json\n{"found":false}\n```'),
    { found: false },
  );
});

test("rejects Copilot output without JSON", () => {
  assert.throws(
    () => parseStructuredResponse("No structured result was returned."),
    /did not contain a JSON object/,
  );
});
