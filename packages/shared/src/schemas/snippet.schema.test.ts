import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createSnippetSchema,
  snippetCategoryParamsSchema,
  updateSnippetSchema,
} from "./snippet.schema.js";

test("createSnippetSchema rejects whitespace-only fields", () => {
  const result = createSnippetSchema.safeParse({
    title: "   ",
    content: "\n\t",
  });

  assert.equal(result.success, false);
});

test("updateSnippetSchema requires at least one field", () => {
  const result = updateSnippetSchema.safeParse({});

  assert.equal(result.success, false);
});

test("snippetCategoryParamsSchema coerces categoryId", () => {
  const result = snippetCategoryParamsSchema.safeParse({
    categoryId: "12",
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.categoryId, 12);
  }
});
