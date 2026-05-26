import type {
  CreateSnippetInput,
  OkResponse,
  SnippetResponse,
  SnippetsResponse,
  UpdateSnippetInput,
} from "@snippetfy/shared";

import { apiFetch } from "../../lib/api-client.js";

export function getSnippets(categoryId: number) {
  return apiFetch<SnippetsResponse>(`/categories/${categoryId}/snippets`);
}

export function getSnippet(categoryId: number, snippetId: number) {
  return apiFetch<SnippetResponse>(`/categories/${categoryId}/snippets/${snippetId}`);
}

export function createSnippet(categoryId: number, input: CreateSnippetInput) {
  return apiFetch<SnippetResponse>(`/categories/${categoryId}/snippets`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSnippet(
  categoryId: number,
  snippetId: number,
  input: UpdateSnippetInput,
) {
  return apiFetch<SnippetResponse>(`/categories/${categoryId}/snippets/${snippetId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteSnippet(categoryId: number, snippetId: number) {
  return apiFetch<OkResponse>(`/categories/${categoryId}/snippets/${snippetId}`, {
    method: "DELETE",
  });
}
