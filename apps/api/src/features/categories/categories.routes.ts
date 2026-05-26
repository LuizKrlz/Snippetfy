import {
  categoryIdSchema,
  createCategorySchema,
  type CategoriesResponse,
  type CategoryResponse,
  type OkResponse,
} from "@snippetfy/shared";
import { Hono } from "hono";

import { ApiError } from "../../lib/api-error.js";
import { requireAuth } from "../auth/auth.middleware.js";
import type { AuthVariables } from "../auth/auth.types.js";
import {
  createCategory,
  deleteCategoryById,
  listCategoriesByUser,
} from "./categories.service.js";

export const categoriesRoutes = new Hono<{ Variables: AuthVariables }>();

categoriesRoutes.get("/categories", requireAuth, async (c) => {
  const authUser = c.get("user");
  const categories = await listCategoriesByUser(authUser.id);

  return c.json<CategoriesResponse>({ categories });
});

categoriesRoutes.post("/categories", requireAuth, async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", parsed.error.flatten());
  }

  const category = await createCategory(authUser.id, parsed.data);

  return c.json<CategoryResponse>({ category }, 201);
});

categoriesRoutes.delete("/categories/:id", requireAuth, async (c) => {
  const authUser = c.get("user");
  const params = categoryIdSchema.safeParse(c.req.param());

  if (!params.success) {
    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", params.error.flatten());
  }

  await deleteCategoryById(authUser.id, params.data.id);

  return c.json<OkResponse>({ ok: true });
});
