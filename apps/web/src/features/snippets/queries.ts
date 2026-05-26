import { queryOptions } from "@tanstack/react-query";

import { getSnippet, getSnippets } from "./api.js";

export const snippetKeys = {
  all: ["snippets"] as const,
  lists: () => [...snippetKeys.all, "list"] as const,
  list: (categoryId: number) => [...snippetKeys.lists(), categoryId] as const,
  details: () => [...snippetKeys.all, "detail"] as const,
  detail: (categoryId: number, snippetId: number) =>
    [...snippetKeys.details(), categoryId, snippetId] as const,
};

export function snippetsQueryOptions(categoryId: number) {
  return queryOptions({
    queryKey: snippetKeys.list(categoryId),
    queryFn: () => getSnippets(categoryId),
    staleTime: 30_000,
  });
}

export function snippetQueryOptions(categoryId: number, snippetId: number) {
  return queryOptions({
    queryKey: snippetKeys.detail(categoryId, snippetId),
    queryFn: () => getSnippet(categoryId, snippetId),
    staleTime: 30_000,
  });
}
