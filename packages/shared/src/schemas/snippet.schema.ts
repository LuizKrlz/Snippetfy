import { z } from "zod";

function requiredText(message: string) {
  return z.string().refine((value) => value.trim().length > 0, {
    message,
  });
}

/** Legado: POST .../snippets/create — partials/snippets.njk */
export const createSnippetSchema = z.object({
  title: requiredText("Título é obrigatório"),
  content: requiredText("Conteúdo é obrigatório"),
});

/** Legado: PUT .../snippets/:id — snippets/show.njk (method override) */
export const updateSnippetSchema = createSnippetSchema.partial().refine(
  (data) => data.title !== undefined || data.content !== undefined,
  { message: "Informe título ou conteúdo para atualizar" },
);

export const snippetCategoryParamsSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
});

export const snippetParamsSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  id: z.coerce.number().int().positive(),
});
