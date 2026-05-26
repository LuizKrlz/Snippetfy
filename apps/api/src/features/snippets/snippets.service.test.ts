import assert from "node:assert/strict";
import { test } from "node:test";

import { ApiError } from "../../lib/api-error.js";
import {
  createSnippet,
  createExcerpt,
  getSnippetById,
  listSnippetsByCategory,
} from "./snippets.service.js";

type Db = NonNullable<Parameters<typeof listSnippetsByCategory>[2]>;
type DbOverrides = {
  category?: Partial<Db["category"]>;
  snippet?: Partial<Db["snippet"]>;
};
type CreateArgs = Parameters<Db["snippet"]["create"]>[0];

function createDb(overrides?: DbOverrides) {
  return {
    category: {
      findFirst: async () => ({ id: 10 }),
      ...overrides?.category,
    },
    snippet: {
      findFirst: async () => ({
        id: 1,
        title: "Snippet",
        content: "body",
        categoryId: 10,
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        updatedAt: new Date("2026-05-01T12:00:00.000Z"),
      }),
      findMany: async () => [],
      create: async ({ data }: CreateArgs) => ({
        id: 99,
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        createdAt: new Date("2026-05-03T12:00:00.000Z"),
        updatedAt: new Date("2026-05-03T12:00:00.000Z"),
      }),
      update: async () => {
        throw new Error("Not implemented in tests");
      },
      delete: async () => undefined,
      ...overrides?.snippet,
    },
  } as Db;
}

test("createExcerpt truncates long content on word boundaries", () => {
  const excerpt = createExcerpt(
    "This snippet contains a longer body that should be truncated for the sidebar preview because it exceeds the expected excerpt length.",
  );

  assert.match(excerpt, /\.\.\.$/);
  assert.ok(excerpt.length <= 123);
});

test("listSnippetsByCategory returns excerpted list items", async () => {
  const db = createDb({
    snippet: {
      findMany: async () => [
        {
          id: 1,
          title: "Reusable hook",
          content:
            "This snippet contains a longer body that should be truncated for the sidebar preview because it exceeds the expected excerpt length.",
          categoryId: 10,
          createdAt: new Date("2026-05-01T12:00:00.000Z"),
          updatedAt: new Date("2026-05-02T12:00:00.000Z"),
        },
      ],
    },
  });

  const result = await listSnippetsByCategory(7, 10, db);

  assert.equal(result.length, 1);
  assert.equal(result[0]?.title, "Reusable hook");
  assert.equal(result[0]?.categoryId, 10);
  assert.match(result[0]?.excerpt ?? "", /\.\.\.$/);
});

test("createSnippet trims title before returning the dto", async () => {
  const db = createDb({
    category: {
      findFirst: async () => ({ id: 5 }),
    },
    snippet: {
      create: async ({ data }: CreateArgs) => ({
        id: 99,
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        createdAt: new Date("2026-05-03T12:00:00.000Z"),
        updatedAt: new Date("2026-05-03T12:00:00.000Z"),
      }),
    },
  });

  const snippet = await createSnippet(
    3,
    5,
    {
      title: "  Trimmed title  ",
      content: "const answer = 42;",
    },
    db,
  );

  assert.equal(snippet.title, "Trimmed title");
  assert.equal(snippet.categoryId, 5);
});

test("getSnippetById throws ApiError when snippet does not exist", async () => {
  const db = createDb({
    snippet: {
      findFirst: async () => null,
    },
  });

  await assert.rejects(
    () => getSnippetById(3, 5, 99, db),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 404 &&
      error.code === "NOT_FOUND" &&
      error.message === "Snippet not found",
  );
});
