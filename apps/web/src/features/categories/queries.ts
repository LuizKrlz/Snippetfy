import { queryOptions } from "@tanstack/react-query";

import { getCategories } from "./api.js";

export const categoryKeys = {
  all: ["categories"] as const,
};

export const categoriesQueryOptions = queryOptions({
  queryKey: categoryKeys.all,
  queryFn: getCategories,
  staleTime: 30_000,
});
