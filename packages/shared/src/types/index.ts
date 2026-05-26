import type { z } from "zod";

import type { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import type {
  createCategorySchema,
  categoryIdSchema,
} from "../schemas/category.schema.js";
import type {
  createSnippetSchema,
  snippetCategoryParamsSchema,
  updateSnippetSchema,
  snippetParamsSchema,
} from "../schemas/snippet.schema.js";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdSchema>;
export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type SnippetCategoryParams = z.infer<typeof snippetCategoryParamsSchema>;
export type SnippetParams = z.infer<typeof snippetParamsSchema>;

export type UserPublic = {
  id: number;
  name: string | null;
  email: string;
};

export type CategoryDto = {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  snippetCount?: number;
};

export type CategoryResponse = {
  category: CategoryDto;
};

export type CategoriesResponse = {
  categories: CategoryDto[];
};

export type SnippetDto = {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type SnippetListItemDto = {
  id: number;
  title: string;
  excerpt: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type SnippetResponse = {
  snippet: SnippetDto;
};

export type SnippetsResponse = {
  snippets: SnippetListItemDto[];
};

export type ApiHealth = {
  status: "ok";
  version: string;
};

export type ApiDbHealth = ApiHealth & {
  database: "connected";
};
