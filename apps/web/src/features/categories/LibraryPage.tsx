import type { CategoryDto } from "@snippetfy/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  AppAlert,
  AppBadge,
  AppButton,
  AppInput,
  AppModal,
  AppSpinner,
  PageShell,
  SectionCard,
} from "../../components/ui";
import { ApiClientError } from "../../lib/api-client.js";
import { logout } from "../auth/api.js";
import { authKeys, meQueryOptions } from "../auth/queries.js";
import { createCategory, deleteCategory } from "./api.js";
import { categoryKeys, categoriesQueryOptions } from "./queries.js";

function formatCategoryDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

export function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/library" });
  const { data: authData } = useQuery(meQueryOptions);
  const categoriesQuery = useQuery(categoriesQueryOptions);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: authKeys.me });
      await navigate({ to: "/login" });
    },
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async ({ category }) => {
      setCreateModalOpen(false);
      setNewCategoryTitle("");
      setCreateError(null);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId: category.id,
        }),
      });
    },
    onError: (error) => {
      setCreateError(getApiErrorMessage(error, "Unable to create category"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async (_, deletedCategoryId) => {
      setDeleteTargetId(null);
      setDeleteError(null);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId:
            previous.categoryId === deletedCategoryId ? undefined : previous.categoryId,
        }),
      });
    },
    onError: (error) => {
      setDeleteError(getApiErrorMessage(error, "Unable to delete category"));
    },
  });

  const categories = categoriesQuery.data?.categories ?? [];
  const user = authData?.user;

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === search.categoryId),
    [categories, search.categoryId],
  );

  const deleteTarget = useMemo(
    () => categories.find((category) => category.id === deleteTargetId) ?? null,
    [categories, deleteTargetId],
  );

  useEffect(() => {
    if (!categoriesQuery.data || !search.categoryId || selectedCategory) {
      return;
    }

    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        categoryId: undefined,
      }),
      replace: true,
    });
  }, [categoriesQuery.data, navigate, search.categoryId, selectedCategory]);

  function handleOpenCreateModal() {
    setCreateError(null);
    setCreateModalOpen(true);
  }

  function handleCreateCategory() {
    const title = newCategoryTitle.trim();

    if (!title) {
      setCreateError("Category title is required");
      return;
    }

    createMutation.mutate({ title });
  }

  function handleSelectCategory(categoryId: number) {
    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        categoryId,
      }),
    });
  }

  function handleDeleteCategory(category: CategoryDto) {
    setDeleteError(null);
    setDeleteTargetId(category.id);
  }

  const renderCreateModal = (
    <AppModal
      body={
        <div className="grid gap-4">
          {createError ? (
            <AppAlert tone="danger" title="Unable to create category">
              {createError}
            </AppAlert>
          ) : null}
          <AppInput
            autoFocus
            label="Category title"
            onChange={(event) => setNewCategoryTitle(event.currentTarget.value)}
            placeholder="Frontend snippets"
            value={newCategoryTitle}
          />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton
            intent="ghost"
            onClick={() => setCreateModalOpen(false)}
            type="button"
          >
            Cancel
          </AppButton>
          <AppButton
            isLoading={createMutation.isPending}
            onClick={handleCreateCategory}
            type="button"
          >
            {createMutation.isPending ? "Creating..." : "Create category"}
          </AppButton>
        </div>
      }
      isOpen={isCreateModalOpen}
      onOpenChange={setCreateModalOpen}
      title="New category"
    />
  );

  const renderDeleteModal = deleteTarget ? (
    <AppModal
      body={
        <div className="grid gap-4">
          {deleteError ? (
            <AppAlert tone="danger" title="Unable to delete category">
              {deleteError}
            </AppAlert>
          ) : null}
          <p className="text-sm text-slate-300">
            Delete <strong>{deleteTarget.title}</strong>? This also removes all snippets
            inside it from the current account.
          </p>
        </div>
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton
            intent="ghost"
            onClick={() => setDeleteTargetId(null)}
            type="button"
          >
            Cancel
          </AppButton>
          <AppButton
            intent="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleteTarget.id)}
            type="button"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete category"}
          </AppButton>
        </div>
      }
      isOpen={Boolean(deleteTarget)}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setDeleteTargetId(null);
        }
      }}
      title="Delete category"
    />
  ) : null;

  return (
    <PageShell size="xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              My library
            </h1>
            <AppBadge>{categories.length} categories</AppBadge>
          </div>
          <p className="text-slate-400">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <AppButton
          intent="ghost"
          isLoading={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          type="button"
        >
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </AppButton>
      </header>

      {categoriesQuery.isLoading ? (
        <SectionCard
          description="Loading your categories from the API."
          title="Categories"
        >
          <div className="flex min-h-48 items-center justify-center">
            <AppSpinner size="lg" />
          </div>
        </SectionCard>
      ) : categoriesQuery.isError ? (
        <SectionCard
          description="The categories request failed before the workspace could render."
          title="Categories unavailable"
        >
          <AppAlert tone="danger" title="Unable to load categories">
            {getApiErrorMessage(categoriesQuery.error, "Unexpected API error")}
          </AppAlert>
        </SectionCard>
      ) : categories.length === 0 ? (
        <SectionCard
          description="Create your first category to start organizing the library before snippets arrive in Phase 3."
          title="No categories yet"
        >
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center">
            <p className="mx-auto max-w-xl text-slate-400">
              Categories will drive the sidebar, snippet counts, and navigation in the
              next steps of the migration.
            </p>
            <div className="mt-6 flex justify-center">
              <AppButton onClick={handleOpenCreateModal} type="button">
                Create first category
              </AppButton>
            </div>
          </div>
          {renderCreateModal}
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <SectionCard
              description="Select a category to keep the active library context in the URL."
              footer={
                <AppButton className="w-full" onClick={handleOpenCreateModal} type="button">
                  New category
                </AppButton>
              }
              title="Categories"
            >
              <div className="grid gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategory?.id === category.id;

                  return (
                    <div className="flex items-start gap-2" key={category.id}>
                      <AppButton
                        className="w-full justify-between"
                        intent={isSelected ? "primary" : "secondary"}
                        onClick={() => handleSelectCategory(category.id)}
                        type="button"
                      >
                        <span className="truncate">{category.title}</span>
                        <AppBadge>{category.snippetCount ?? 0}</AppBadge>
                      </AppButton>
                      <AppButton
                        intent="ghost"
                        onClick={() => handleDeleteCategory(category)}
                        type="button"
                      >
                        Delete
                      </AppButton>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {selectedCategory ? (
              <SectionCard
                description={`Created ${formatCategoryDate(selectedCategory.createdAt)}.`}
                title={selectedCategory.title}
              >
                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-3">
                    <AppBadge>{selectedCategory.snippetCount ?? 0} snippets</AppBadge>
                    <AppBadge>Selected in URL</AppBadge>
                  </div>
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
                    Snippet management lands in Phase 3. For now, this panel confirms the
                    selected category and keeps the navigation structure ready.
                  </div>
                </div>
              </SectionCard>
            ) : (
              <SectionCard
                description="Choose one category from the sidebar to make it active in the library route."
                title="Select a category"
              >
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
                  The active category is stored in the query param so the page stays
                  shareable and refresh-safe.
                </div>
              </SectionCard>
            )}
          </div>

          {renderCreateModal}
          {renderDeleteModal}
        </>
      )}
    </PageShell>
  );
}
