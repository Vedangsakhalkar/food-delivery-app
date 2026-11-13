# Story US-2.3: Owner manages menu categories

| Field | Value |
|---|---|
| Epic | 2 — Restaurant and menu management (owner) |
| Status | review |
| PRD refs | FR-18 |
| Depends on | US-2.1 |
| Branch | `feature/us-2.3-owner-manages-menu-categories` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** restaurant owner,
**I want** to create, rename, reorder and delete menu categories,
**so that** my menu is organised the way customers expect.

## Acceptance criteria
1. Given I open `/owner/menu`, then I see my categories in `sort_order` (mock O4).
2. Given I add or rename a category with a non-empty name, then it saves; a duplicate name within my restaurant is rejected with 409.
3. Given I move a category up or down, then the new order persists and is used on the customer restaurant page.
4. Given I delete a category that still has items, then I am asked to confirm and the items are deleted with it (or the delete is refused with 409 and a clear message, as decided in the PR).
5. An owner can only change categories of their own restaurant.

## Tasks
- [ ] Migration `menu_categories` table (RLS on, unique `(restaurant_id, name)`).
- [ ] `menuCategoryRepository`, `menuService` category methods.
- [ ] `CRUD /api/owner/categories`.
- [ ] Menu page category list with shadcn `Dialog` confirm and `Button` actions.

## Technical notes
- Pick one delete behaviour (cascade with confirmation recommended) and state it in the PR.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
