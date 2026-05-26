import type {
  CreateSnippetInput,
  SnippetDto,
  SnippetListItemDto,
  UpdateSnippetInput,
} from "@snippetfy/shared";

import { ApiError } from "../../lib/api-error.js";
import { prisma } from "../../lib/prisma.js";

type SnippetRecord = {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
};

type SnippetDbClient = {
  category: {
    findFirst: (args: {
      where: {
        id: number;
        userId: number;
      };
      select: {
        id: true;
      };
    }) => Promise<{ id: number } | null>;
  };
  snippet: {
    findFirst: (args: {
      where: {
        id: number;
        categoryId: number;
        category: {
          userId: number;
        };
      };
    }) => Promise<SnippetRecord | null>;
    findMany: (args: {
      where: {
        categoryId: number;
        category: {
          userId: number;
        };
      };
      orderBy: {
        updatedAt: "desc";
      };
    }) => Promise<SnippetRecord[]>;
    create: (args: {
      data: {
        categoryId: number;
        title: string;
        content: string;
      };
    }) => Promise<SnippetRecord>;
    update: (args: {
      where: {
        id: number;
      };
      data: {
        title?: string;
        content?: string;
      };
    }) => Promise<SnippetRecord>;
    delete: (args: {
      where: {
        id: number;
      };
    }) => Promise<unknown>;
  };
};

export function createExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 120) {
    return normalized;
  }

  const sliced = normalized.slice(0, 120);
  const cutoffIndex = sliced.lastIndexOf(" ");

  if (cutoffIndex <= 0) {
    return `${sliced}...`;
  }

  return `${sliced.slice(0, cutoffIndex)}...`;
}

function toSnippetDto(snippet: SnippetRecord): SnippetDto {
  return {
    id: snippet.id,
    title: snippet.title,
    content: snippet.content,
    categoryId: snippet.categoryId,
    createdAt: snippet.createdAt.toISOString(),
    updatedAt: snippet.updatedAt.toISOString(),
  };
}

function toSnippetListItemDto(snippet: SnippetRecord): SnippetListItemDto {
  return {
    id: snippet.id,
    title: snippet.title,
    excerpt: createExcerpt(snippet.content),
    categoryId: snippet.categoryId,
    createdAt: snippet.createdAt.toISOString(),
    updatedAt: snippet.updatedAt.toISOString(),
  };
}

async function assertCategoryOwnership(userId: number, categoryId: number, db: SnippetDbClient) {
  const category = await db.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found", "NOT_FOUND");
  }
}

async function getOwnedSnippetRecord(
  userId: number,
  categoryId: number,
  snippetId: number,
  db: SnippetDbClient,
) {
  const snippet = await db.snippet.findFirst({
    where: {
      id: snippetId,
      categoryId,
      category: {
        userId,
      },
    },
  });

  if (!snippet) {
    throw new ApiError(404, "Snippet not found", "NOT_FOUND");
  }

  return snippet;
}

export async function listSnippetsByCategory(
  userId: number,
  categoryId: number,
  db: SnippetDbClient = prisma,
): Promise<SnippetListItemDto[]> {
  await assertCategoryOwnership(userId, categoryId, db);

  const snippets = await db.snippet.findMany({
    where: {
      categoryId,
      category: {
        userId,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return snippets.map(toSnippetListItemDto);
}

export async function createSnippet(
  userId: number,
  categoryId: number,
  input: CreateSnippetInput,
  db: SnippetDbClient = prisma,
): Promise<SnippetDto> {
  await assertCategoryOwnership(userId, categoryId, db);

  const snippet = await db.snippet.create({
    data: {
      categoryId,
      title: input.title.trim(),
      content: input.content,
    },
  });

  return toSnippetDto(snippet);
}

export async function getSnippetById(
  userId: number,
  categoryId: number,
  snippetId: number,
  db: SnippetDbClient = prisma,
): Promise<SnippetDto> {
  const snippet = await getOwnedSnippetRecord(userId, categoryId, snippetId, db);

  return toSnippetDto(snippet);
}

export async function updateSnippetById(
  userId: number,
  categoryId: number,
  snippetId: number,
  input: UpdateSnippetInput,
  db: SnippetDbClient = prisma,
): Promise<SnippetDto> {
  await getOwnedSnippetRecord(userId, categoryId, snippetId, db);

  const snippet = await db.snippet.update({
    where: {
      id: snippetId,
    },
    data: {
      title: input.title !== undefined ? input.title.trim() : undefined,
      content: input.content,
    },
  });

  return toSnippetDto(snippet);
}

export async function deleteSnippetById(
  userId: number,
  categoryId: number,
  snippetId: number,
  db: SnippetDbClient = prisma,
) {
  await getOwnedSnippetRecord(userId, categoryId, snippetId, db);

  await db.snippet.delete({
    where: {
      id: snippetId,
    },
  });
}
