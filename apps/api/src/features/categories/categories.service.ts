import type { CategoryDto, CreateCategoryInput } from "@snippetfy/shared";

import { ApiError } from "../../lib/api-error.js";
import { prisma } from "../../lib/prisma.js";

type CategoryRecord = {
  id: number;
  title: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    snippets: number;
  };
};

function toCategoryDto(category: CategoryRecord): CategoryDto {
  return {
    id: category.id,
    title: category.title,
    userId: category.userId,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    snippetCount: category._count?.snippets ?? 0,
  };
}

export async function listCategoriesByUser(userId: number): Promise<CategoryDto[]> {
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return categories.map(toCategoryDto);
}

export async function createCategory(userId: number, input: CreateCategoryInput) {
  const category = await prisma.category.create({
    data: {
      title: input.title.trim(),
      userId,
    },
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  });

  return toCategoryDto(category);
}

export async function deleteCategoryById(userId: number, categoryId: number) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found", "NOT_FOUND");
  }

  await prisma.category.delete({
    where: {
      id: category.id,
    },
  });
}
