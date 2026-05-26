# Snippets Phase 3 SDD

## Goal

Deliver `Phase 3` with functional parity to the legacy snippets flow while preserving the current SPA + API architecture:

- list snippets inside the active category
- create snippet
- open snippet details
- edit snippet
- delete snippet
- show excerpt in the list
- render markdown in the detail pane

## Scope

### In scope

- Shared snippet schemas and DTOs in `packages/shared`
- Snippets API in `apps/api`
- Snippets data layer in `apps/web`
- `/library` route state with `categoryId` and `snippetId`
- Sidebar/list/detail composition inside the existing library page
- Markdown rendering with a safe default strategy
- Focused tests for shared contracts and API behavior

### Out of scope

- Separate page route for snippets
- Rich WYSIWYG or external markdown editor
- Syntax highlighting parity with the legacy `highlight.js` implementation
- Search, filtering, tags, pinning, favorites, or bulk actions
- Autosave or drafts

## Legacy parity target

Legacy references:

- `legacy-app/app/controllers/snippetController.js`
- `legacy-app/app/views/partials/snippets.njk`
- `legacy-app/app/views/snippets/show.njk`
- `legacy-app/app/models/snippet.js`

Behavior to preserve:

1. snippets belong to a category
2. the list is category-scoped
3. creating a snippet makes it selectable immediately
4. editing keeps the user in the same snippet context
5. deleting returns the user to the category view
6. the list shows title plus excerpt
7. the detail area renders formatted markdown

## Architecture decisions

### URL state

The library route remains the single workspace screen.

- `/library?categoryId=1`
- `/library?categoryId=1&snippetId=42`

Rules:

- `categoryId` selects the active category
- `snippetId` is only valid within the active category
- if the category disappears, both params are cleared
- if the snippet disappears or does not belong to the active category, `snippetId` is cleared
- after create:
  - category stays selected
  - new snippet becomes active
- after delete:
  - clear `snippetId`
  - keep `categoryId`

### API shape

Snippets are nested under categories for clearer ownership and authorization:

- `GET /categories/:categoryId/snippets`
- `POST /categories/:categoryId/snippets`
- `GET /categories/:categoryId/snippets/:id`
- `PATCH /categories/:categoryId/snippets/:id`
- `DELETE /categories/:categoryId/snippets/:id`

Authorization rule:

- every snippet operation must prove that the category belongs to the authenticated user

### Data contracts

Two payload shapes are used:

- `SnippetListItemDto`
  - optimized for the middle list
  - includes `excerpt`
- `SnippetDto`
  - complete payload for detail/edit

This avoids using full snippet content when only the list is needed.

### Markdown strategy

Persist raw markdown in the database and render it in the frontend.

Recommended implementation:

- `react-markdown` for rendering
- `remark-gfm` for common markdown features
- keep raw HTML disabled

Security rule:

- do not use `dangerouslySetInnerHTML`
- do not enable raw HTML rendering unless a dedicated sanitization policy is added later

## Frontend conventions

### Forms

All non-trivial forms in this phase must use:

- `react-hook-form`
- `zodResolver`
- schemas from `@snippetfy/shared`

This applies to:

- create snippet form
- edit snippet form

Reference pattern:

- `apps/web/src/features/auth/LoginForm.tsx`
- `apps/web/src/features/auth/SignupForm.tsx`

### UI primitives

Feature code should prefer the local `App*` wrappers instead of importing HeroUI directly.

Allowed direct HeroUI usage:

- inside `apps/web/src/components/ui/*` wrappers only

If a new primitive is needed:

1. create or extend an `App*` wrapper first
2. consume the wrapper from the feature code

Current primitives expected for this phase:

- `AppButton`
- `AppInput`
- `AppTextarea`
- `AppModal`
- `AppAlert`
- `AppBadge`
- `SectionCard`

### Feature structure

Use the same feature layout already adopted in the app:

- `apps/web/src/features/snippets/api.ts`
- `apps/web/src/features/snippets/queries.ts`

Page-level composition may stay in `LibraryPage.tsx` while the feature is still small, but helper components are preferred if the file starts growing too much.

### TanStack Query rules

- define feature-local query keys
- use `queryOptions(...)` in `queries.ts`
- invalidate affected list/detail queries after mutations
- preserve URL-driven state instead of duplicating selection state locally

## Backend conventions

### Feature structure

Keep API code in:

- `apps/api/src/features/snippets/snippets.routes.ts`
- `apps/api/src/features/snippets/snippets.service.ts`

### Validation

- validate params and request bodies with shared Zod schemas
- return `ApiError` for validation and not-found cases

### Service boundaries

Service responsibilities:

- verify category ownership
- read/write snippets through Prisma
- map Prisma records into DTOs
- compute list excerpt

Route responsibilities:

- parse input
- call service
- serialize response

## Excerpt rules

Excerpt is computed for list items only.

Rules:

- normalize whitespace before slicing
- target about 120 characters
- avoid cutting in the middle of a word when practical
- append `...` only when truncation happens

## Testing strategy

Keep coverage pragmatic and focused:

- shared schema tests for snippet contracts
- API route or service tests for happy path and ownership/not-found failures
- manual validation for `/library` interactions

Manual verification checklist:

1. create snippet from an active category
2. open snippet from the list
3. edit title and content
4. delete active snippet
5. switch categories with and without snippets
6. refresh the page with `categoryId` and `snippetId` present

## Delivery order

1. shared contracts
2. snippets API
3. web data layer
4. route search state
5. library UI
6. markdown rendering
7. tests and manual verification
