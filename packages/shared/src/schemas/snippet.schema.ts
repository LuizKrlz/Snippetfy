import { z } from "zod";

/** Legado: POST .../snippets/create — partials/snippets.njk */
export const createSnippetSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

/** Legado: PUT .../snippets/:id — snippets/show.njk (method override) */
export const updateSnippetSchema = createSnippetSchema.partial().refine(
  (data) => data.title !== undefined || data.content !== undefined,
  { message: "Informe título ou conteúdo para atualizar" },
);

export const snippetParamsSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  id: z.coerce.number().int().positive(),
});
