import type {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryInput,
  OkResponse,
} from "@snippetfy/shared";

import { apiFetch } from "../../lib/api-client.js";

export function getCategories() {
  return apiFetch<CategoriesResponse>("/categories");
}

export function createCategory(input: CreateCategoryInput) {
  return apiFetch<CategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: number) {
  return apiFetch<OkResponse>(`/categories/${id}`, {
    method: "DELETE",
  });
}
