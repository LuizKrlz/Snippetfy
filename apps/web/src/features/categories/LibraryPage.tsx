import type { CategoryDto, CreateSnippetInput } from "@snippetfy/shared";
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
  appToast,
} from "../../components/ui";
import { ApiClientError } from "../../lib/api-client.js";
import { logout } from "../auth/api.js";
import { authKeys, meQueryOptions } from "../auth/queries.js";
import { SnippetFormModal } from "../snippets/SnippetFormModal.js";
import { SnippetMarkdown } from "../snippets/SnippetMarkdown.js";
import {
  createSnippet as createSnippetRequest,
  deleteSnippet as deleteSnippetRequest,
  updateSnippet as updateSnippetRequest,
} from "../snippets/api.js";
import {
  snippetKeys,
  snippetQueryOptions,
  snippetsQueryOptions,
} from "../snippets/queries.js";
import { createCategory, deleteCategory } from "./api.js";
import { categoryKeys, categoriesQueryOptions } from "./queries.js";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

const emptySnippetForm: CreateSnippetInput = {
  title: "",
  content: "",
};

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
  const [isCreateSnippetModalOpen, setCreateSnippetModalOpen] = useState(false);
  const [createSnippetError, setCreateSnippetError] = useState<string | null>(null);
  const [isEditSnippetModalOpen, setEditSnippetModalOpen] = useState(false);
  const [editSnippetError, setEditSnippetError] = useState<string | null>(null);
  const [isDeleteSnippetModalOpen, setDeleteSnippetModalOpen] = useState(false);
  const [deleteSnippetError, setDeleteSnippetError] = useState<string | null>(null);
  const [detailViewMode, setDetailViewMode] = useState<"preview" | "raw">("preview");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: authKeys.me });
      await navigate({ to: "/login" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async ({ category }) => {
      setCreateModalOpen(false);
      setNewCategoryTitle("");
      setCreateError(null);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      appToast.success("Category created", `${category.title} is ready for new snippets.`);
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId: category.id,
          snippetId: undefined,
        }),
      });
    },
    onError: (error) => {
      setCreateError(getApiErrorMessage(error, "Unable to create category"));
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async (_, deletedCategoryId) => {
      const deletedCategory = categories.find((category) => category.id === deletedCategoryId);
      setDeleteTargetId(null);
      setDeleteError(null);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      appToast.success(
        "Category deleted",
        deletedCategory ? `${deletedCategory.title} was removed from your library.` : undefined,
      );
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId:
            previous.categoryId === deletedCategoryId ? undefined : previous.categoryId,
          snippetId:
            previous.categoryId === deletedCategoryId ? undefined : previous.snippetId,
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

  const snippetsQuery = useQuery({
    ...snippetsQueryOptions(selectedCategory?.id ?? 0),
    enabled: Boolean(selectedCategory),
  });

  const snippets = snippetsQuery.data?.snippets ?? [];

  const selectedSnippetListItem = useMemo(
    () => snippets.find((snippet) => snippet.id === search.snippetId) ?? null,
    [snippets, search.snippetId],
  );

  const snippetDetailQuery = useQuery({
    ...snippetQueryOptions(selectedCategory?.id ?? 0, search.snippetId ?? 0),
    enabled: Boolean(selectedCategory && search.snippetId),
  });

  const activeSnippet = snippetDetailQuery.data?.snippet ?? null;

  const deleteTarget = useMemo(
    () => categories.find((category) => category.id === deleteTargetId) ?? null,
    [categories, deleteTargetId],
  );

  const createSnippetMutation = useMutation({
    mutationFn: ({
      categoryId,
      input,
    }: {
      categoryId: number;
      input: CreateSnippetInput;
    }) => createSnippetRequest(categoryId, input),
    onSuccess: async ({ snippet }, variables) => {
      setCreateSnippetModalOpen(false);
      setCreateSnippetError(null);
      await queryClient.invalidateQueries({
        queryKey: snippetKeys.list(variables.categoryId),
      });
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      appToast.success("Snippet created", `${snippet.title} is now available in the library.`);
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId: variables.categoryId,
          snippetId: snippet.id,
        }),
      });
    },
    onError: (error) => {
      setCreateSnippetError(getApiErrorMessage(error, "Unable to create snippet"));
    },
  });

  const updateSnippetMutation = useMutation({
    mutationFn: ({
      categoryId,
      snippetId,
      input,
    }: {
      categoryId: number;
      snippetId: number;
      input: CreateSnippetInput;
    }) => updateSnippetRequest(categoryId, snippetId, input),
    onSuccess: async ({ snippet }, variables) => {
      setEditSnippetModalOpen(false);
      setEditSnippetError(null);
      await queryClient.invalidateQueries({
        queryKey: snippetKeys.list(variables.categoryId),
      });
      await queryClient.invalidateQueries({
        queryKey: snippetKeys.detail(variables.categoryId, variables.snippetId),
      });
      appToast.success("Snippet updated", `${snippet.title} was saved successfully.`);
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId: snippet.categoryId,
          snippetId: snippet.id,
        }),
      });
    },
    onError: (error) => {
      setEditSnippetError(getApiErrorMessage(error, "Unable to update snippet"));
    },
  });

  const deleteSnippetMutation = useMutation({
    mutationFn: ({
      categoryId,
      snippetId,
    }: {
      categoryId: number;
      snippetId: number;
    }) => deleteSnippetRequest(categoryId, snippetId),
    onSuccess: async (_, variables) => {
      const deletedSnippet = activeSnippet;
      setDeleteSnippetModalOpen(false);
      setDeleteSnippetError(null);
      await queryClient.invalidateQueries({
        queryKey: snippetKeys.list(variables.categoryId),
      });
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.removeQueries({
        queryKey: snippetKeys.detail(variables.categoryId, variables.snippetId),
      });
      appToast.success(
        "Snippet deleted",
        deletedSnippet ? `${deletedSnippet.title} was removed from this category.` : undefined,
      );
      await navigate({
        to: "/library",
        search: (previous) => ({
          ...previous,
          categoryId: variables.categoryId,
          snippetId: undefined,
        }),
      });
    },
    onError: (error) => {
      setDeleteSnippetError(getApiErrorMessage(error, "Unable to delete snippet"));
    },
  });

  useEffect(() => {
    if (!categoriesQuery.data || !search.categoryId || selectedCategory) {
      return;
    }

    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        categoryId: undefined,
        snippetId: undefined,
      }),
      replace: true,
    });
  }, [categoriesQuery.data, navigate, search.categoryId, selectedCategory]);

  useEffect(() => {
    if (selectedCategory || !search.snippetId) {
      return;
    }

    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        snippetId: undefined,
      }),
      replace: true,
    });
  }, [navigate, search.snippetId, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory || !snippetsQuery.data || !search.snippetId || selectedSnippetListItem) {
      return;
    }

    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        snippetId: undefined,
      }),
      replace: true,
    });
  }, [
    navigate,
    search.snippetId,
    selectedCategory,
    selectedSnippetListItem,
    snippetsQuery.data,
  ]);

  useEffect(() => {
    if (!activeSnippet) {
      setEditSnippetModalOpen(false);
      setDeleteSnippetModalOpen(false);
    }
  }, [activeSnippet]);

  useEffect(() => {
    setDetailViewMode("preview");
    setCopyFeedback(null);
  }, [activeSnippet?.id]);

  useEffect(() => {
    if (!copyFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyFeedback(null);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyFeedback]);

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

    createCategoryMutation.mutate({ title });
  }

  function handleSelectCategory(categoryId: number) {
    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        categoryId,
        snippetId: undefined,
      }),
    });
  }

  function handleDeleteCategory(category: CategoryDto) {
    setDeleteError(null);
    setDeleteTargetId(category.id);
  }

  function handleOpenCreateSnippetModal() {
    if (!selectedCategory) {
      return;
    }

    setCreateSnippetError(null);
    setCreateSnippetModalOpen(true);
  }

  function handleSelectSnippet(snippetId: number) {
    if (!selectedCategory) {
      return;
    }

    void navigate({
      to: "/library",
      search: (previous) => ({
        ...previous,
        categoryId: selectedCategory.id,
        snippetId,
      }),
    });
  }

  function handleOpenEditSnippetModal() {
    setEditSnippetError(null);
    setEditSnippetModalOpen(true);
  }

  function handleOpenDeleteSnippetModal() {
    setDeleteSnippetError(null);
    setDeleteSnippetModalOpen(true);
  }

  function handleOpenFirstSnippet() {
    const firstSnippet = snippets[0];

    if (!firstSnippet) {
      return;
    }

    handleSelectSnippet(firstSnippet.id);
  }

  async function handleCopySnippetContent() {
    if (!activeSnippet) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeSnippet.content);
      setCopyFeedback("Copied");
      appToast.success("Snippet copied", "Markdown content copied to your clipboard.");
    } catch {
      appToast.danger("Copy failed", "Clipboard access is not available in this browser.");
    }
  }

  const renderCreateCategoryModal = (
    <AppModal
      body={
        <form
          className="grid gap-4"
          id="create-category-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreateCategory();
          }}
        >
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
        </form>
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton intent="ghost" onClick={() => setCreateModalOpen(false)} type="button">
            Cancel
          </AppButton>
          <AppButton
            form="create-category-form"
            isLoading={createCategoryMutation.isPending}
            type="submit"
          >
            {createCategoryMutation.isPending ? "Creating..." : "Create category"}
          </AppButton>
        </div>
      }
      isOpen={isCreateModalOpen}
      onOpenChange={setCreateModalOpen}
      title="New category"
    />
  );

  const renderDeleteCategoryModal = deleteTarget ? (
    <AppModal
      body={
        <div className="grid gap-4">
          {deleteError ? (
            <AppAlert tone="danger" title="Unable to delete category">
              {deleteError}
            </AppAlert>
          ) : null}
          <p className="text-sm text-slate-300">
            Delete <strong>{deleteTarget.title}</strong>? This also removes all snippets inside
            it from the current account.
          </p>
        </div>
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton intent="ghost" onClick={() => setDeleteTargetId(null)} type="button">
            Cancel
          </AppButton>
          <AppButton
            intent="danger"
            isLoading={deleteCategoryMutation.isPending}
            onClick={() => deleteCategoryMutation.mutate(deleteTarget.id)}
            type="button"
          >
            {deleteCategoryMutation.isPending ? "Deleting..." : "Delete category"}
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

  const renderCreateSnippetModal = selectedCategory ? (
    <SnippetFormModal
      errorMessage={createSnippetError}
      initialValues={emptySnippetForm}
      isOpen={isCreateSnippetModalOpen}
      isSubmitting={createSnippetMutation.isPending}
      onOpenChange={setCreateSnippetModalOpen}
      onSubmit={(values) =>
        createSnippetMutation.mutate({
          categoryId: selectedCategory.id,
          input: values,
        })
      }
      submitLabel="Create snippet"
      title={`New snippet in ${selectedCategory.title}`}
    />
  ) : null;

  const renderEditSnippetModal =
    selectedCategory && activeSnippet ? (
      <SnippetFormModal
        errorMessage={editSnippetError}
        initialValues={{
          title: activeSnippet.title,
          content: activeSnippet.content,
        }}
        isOpen={isEditSnippetModalOpen}
        isSubmitting={updateSnippetMutation.isPending}
        onOpenChange={setEditSnippetModalOpen}
        onSubmit={(values) =>
          updateSnippetMutation.mutate({
            categoryId: selectedCategory.id,
            snippetId: activeSnippet.id,
            input: values,
          })
        }
        submitLabel="Save changes"
        title={`Edit ${activeSnippet.title}`}
      />
    ) : null;

  const renderDeleteSnippetModal =
    selectedCategory && activeSnippet ? (
      <AppModal
        body={
          <div className="grid gap-4">
            {deleteSnippetError ? (
              <AppAlert tone="danger" title="Unable to delete snippet">
                {deleteSnippetError}
              </AppAlert>
            ) : null}
            <p className="text-sm text-slate-300">
              Delete <strong>{activeSnippet.title}</strong>? This cannot be undone.
            </p>
          </div>
        }
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AppButton
              intent="ghost"
              onClick={() => setDeleteSnippetModalOpen(false)}
              type="button"
            >
              Cancel
            </AppButton>
            <AppButton
              intent="danger"
              isLoading={deleteSnippetMutation.isPending}
              onClick={() =>
                deleteSnippetMutation.mutate({
                  categoryId: selectedCategory.id,
                  snippetId: activeSnippet.id,
                })
              }
              type="button"
            >
              {deleteSnippetMutation.isPending ? "Deleting..." : "Delete snippet"}
            </AppButton>
          </div>
        }
        isOpen={isDeleteSnippetModalOpen}
        onOpenChange={setDeleteSnippetModalOpen}
        title="Delete snippet"
      />
    ) : null;

  return (
    <PageShell size="xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">My library</h1>
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
              Categories drive the active library context. Snippets are now ready to sit inside
              each one.
            </p>
            <div className="mt-6 flex justify-center">
              <AppButton onClick={handleOpenCreateModal} type="button">
                Create first category
              </AppButton>
            </div>
          </div>
          {renderCreateCategoryModal}
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[280px_320px_minmax(0,1fr)]">
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

            <SectionCard
              description={
                selectedCategory
                  ? `Snippets stored inside ${selectedCategory.title}.`
                  : "Choose a category before loading snippets."
              }
              footer={
                <AppButton
                  className="w-full"
                  isDisabled={!selectedCategory}
                  onClick={handleOpenCreateSnippetModal}
                  type="button"
                >
                  New snippet
                </AppButton>
              }
              title={selectedCategory ? "Snippets" : "Category required"}
            >
              {!selectedCategory ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
                  Pick a category from the sidebar to load its snippets.
                </div>
              ) : snippetsQuery.isLoading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <AppSpinner size="lg" />
                </div>
              ) : snippetsQuery.isError ? (
                <AppAlert tone="danger" title="Unable to load snippets">
                  {getApiErrorMessage(snippetsQuery.error, "Unexpected API error")}
                </AppAlert>
              ) : snippets.length === 0 ? (
                <div className="grid gap-4 rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center">
                  <p className="text-slate-400">
                    This category has no snippets yet. Create the first one to start building
                    the detail view.
                  </p>
                  <div className="flex justify-center">
                    <AppButton onClick={handleOpenCreateSnippetModal} type="button">
                      Create snippet
                    </AppButton>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {snippets.map((snippet) => {
                    const isSelected = search.snippetId === snippet.id;

                    return (
                      <AppButton
                        className="h-auto min-h-24 justify-start px-4 py-4"
                        intent={isSelected ? "primary" : "secondary"}
                        key={snippet.id}
                        onClick={() => handleSelectSnippet(snippet.id)}
                        type="button"
                      >
                        <span className="grid w-full gap-2 text-left">
                          <span className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-semibold">{snippet.title}</span>
                            <span
                              className={
                                isSelected
                                  ? "shrink-0 text-xs text-emerald-950/75"
                                  : "shrink-0 text-xs text-slate-500"
                              }
                            >
                              {formatDate(snippet.updatedAt)}
                            </span>
                          </span>
                          <span
                            className={
                              isSelected
                                ? "text-sm text-emerald-950/85"
                                : "text-sm text-slate-400"
                            }
                            style={{
                              display: "-webkit-box",
                              overflow: "hidden",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 3,
                            }}
                          >
                            {snippet.excerpt || "No preview available"}
                          </span>
                        </span>
                      </AppButton>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {selectedCategory ? (
              <SectionCard
                description={
                  search.snippetId && activeSnippet
                    ? `Updated ${formatDate(activeSnippet.updatedAt)}.`
                    : `Created ${formatDate(selectedCategory.createdAt)}.`
                }
                title={
                  search.snippetId ? activeSnippet?.title ?? "Loading snippet" : selectedCategory.title
                }
              >
                {!search.snippetId ? (
                  <div className="grid gap-4">
                    <div className="flex flex-wrap gap-3">
                      <AppBadge>{selectedCategory.snippetCount ?? 0} snippets</AppBadge>
                      <AppBadge>Category active in URL</AppBadge>
                    </div>
                    <div className="grid gap-4 rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
                      <p>Choose one snippet from the list or create a new snippet for this category.</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <AppButton
                          intent="secondary"
                          isDisabled={snippets.length === 0}
                          onClick={handleOpenFirstSnippet}
                          type="button"
                        >
                          Open latest snippet
                        </AppButton>
                        <AppButton onClick={handleOpenCreateSnippetModal} type="button">
                          New snippet
                        </AppButton>
                      </div>
                    </div>
                  </div>
                ) : snippetDetailQuery.isLoading ? (
                  <div className="flex min-h-48 items-center justify-center">
                    <AppSpinner size="lg" />
                  </div>
                ) : snippetDetailQuery.isError ? (
                  <AppAlert tone="danger" title="Unable to load snippet">
                    {getApiErrorMessage(snippetDetailQuery.error, "Unexpected API error")}
                  </AppAlert>
                ) : activeSnippet ? (
                  <div className="grid gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <AppBadge>{selectedCategory.title}</AppBadge>
                        <AppBadge>Created {formatDate(activeSnippet.createdAt)}</AppBadge>
                        <AppBadge>Updated {formatDateTime(activeSnippet.updatedAt)}</AppBadge>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <AppButton
                          intent={detailViewMode === "preview" ? "secondary" : "ghost"}
                          onClick={() => setDetailViewMode("preview")}
                          type="button"
                        >
                          Preview
                        </AppButton>
                        <AppButton
                          intent={detailViewMode === "raw" ? "secondary" : "ghost"}
                          onClick={() => setDetailViewMode("raw")}
                          type="button"
                        >
                          Raw markdown
                        </AppButton>
                        <AppButton
                          intent="ghost"
                          onClick={() => void handleCopySnippetContent()}
                          type="button"
                        >
                          {copyFeedback ?? "Copy content"}
                        </AppButton>
                        <AppButton
                          intent="secondary"
                          onClick={handleOpenEditSnippetModal}
                          type="button"
                        >
                          Edit
                        </AppButton>
                        <AppButton
                          intent="danger"
                          onClick={handleOpenDeleteSnippetModal}
                          type="button"
                        >
                          Delete
                        </AppButton>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                      {detailViewMode === "preview" ? (
                        <SnippetMarkdown content={activeSnippet.content} />
                      ) : (
                        <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-slate-100">
                          {activeSnippet.content}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
                    Select a valid snippet to load its details.
                  </div>
                )}
              </SectionCard>
            ) : (
              <SectionCard
                description="Choose one category from the sidebar to make it active in the library route."
                title="Select a category"
              >
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
                  The active category and snippet stay in the query params so the page remains
                  shareable and refresh-safe.
                </div>
              </SectionCard>
            )}
          </div>

          {renderCreateCategoryModal}
          {renderDeleteCategoryModal}
          {renderCreateSnippetModal}
          {renderEditSnippetModal}
          {renderDeleteSnippetModal}
        </>
      )}
    </PageShell>
  );
}
