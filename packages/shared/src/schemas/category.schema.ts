import { z } from "zod";

/** Legado: POST /app/categories/create — partials/nav.njk */
export const createCategorySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
});

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
