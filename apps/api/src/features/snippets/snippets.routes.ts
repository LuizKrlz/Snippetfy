import {
  createSnippetSchema,
  snippetCategoryParamsSchema,
  snippetParamsSchema,
  type OkResponse,
  type SnippetResponse,
  type SnippetsResponse,
  updateSnippetSchema,
} from "@snippetfy/shared";
import { Hono } from "hono";

import { ApiError } from "../../lib/api-error.js";
import { requireAuth } from "../auth/auth.middleware.js";
import type { AuthVariables } from "../auth/auth.types.js";
import {
  createSnippet,
  deleteSnippetById,
  getSnippetById,
  listSnippetsByCategory,
  updateSnippetById,
} from "./snippets.service.js";

export const snippetsRoutes = new Hono<{ Variables: AuthVariables }>();

snippetsRoutes.get("/categories/:categoryId/snippets", requireAuth, async (c) => {
  const authUser = c.get("user");
  const params = snippetCategoryParamsSchema.safeParse(c.req.param());

  if (!params.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", params.error.flatten());
  }

  const snippets = await listSnippetsByCategory(authUser.id, params.data.categoryId);

  return c.json<SnippetsResponse>({ snippets });
});

snippetsRoutes.post("/categories/:categoryId/snippets", requireAuth, async (c) => {
  const authUser = c.get("user");
  const params = snippetCategoryParamsSchema.safeParse(c.req.param());
  const body = await c.req.json();
  const parsed = createSnippetSchema.safeParse(body);

  if (!params.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", params.error.flatten());
  }

  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.flatten());
  }

  const snippet = await createSnippet(authUser.id, params.data.categoryId, parsed.data);

  return c.json<SnippetResponse>({ snippet }, 201);
});

snippetsRoutes.get("/categories/:categoryId/snippets/:id", requireAuth, async (c) => {
  const authUser = c.get("user");
  const params = snippetParamsSchema.safeParse(c.req.param());

  if (!params.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", params.error.flatten());
  }

  const snippet = await getSnippetById(authUser.id, params.data.categoryId, params.data.id);

  return c.json<SnippetResponse>({ snippet });
});

snippetsRoutes.patch("/categories/:categoryId/snippets/:id", requireAuth, async (c) => {
  const authUser = c.get("user");
  const params = snippetParamsSchema.safeParse(c.req.param());
  const body = await c.req.json();
  const parsed = updateSnippetSchema.safeParse(body);

  if (!params.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", params.error.flatten());
  }

  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.flatten());
  }

  const snippet = await updateSnippetById(
    authUser.id,
    params.data.categoryId,
    params.data.id,
    parsed.data,
  );

  return c.json<SnippetResponse>({ snippet });
});

snippetsRoutes.delete("/categories/:categoryId/snippets/:id", requireAuth, async (c) => {
  const authUser = c.get("user");
  const params = snippetParamsSchema.safeParse(c.req.param());

  if (!params.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", params.error.flatten());
  }

  await deleteSnippetById(authUser.id, params.data.categoryId, params.data.id);

  return c.json<OkResponse>({ ok: true });
});
