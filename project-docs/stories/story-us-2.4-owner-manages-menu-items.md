# Story US-2.4: Owner manages menu items with images

| Field | Value |
|---|---|
| Epic | 2 — Restaurant and menu management (owner) |
| Status | review |
| PRD refs | FR-18, FR-18a |
| Depends on | US-2.3, US-2.2 |
| Branch | `feature/us-2.4-owner-manages-menu-items` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** restaurant owner,
**I want** to add, edit, hide and delete menu items with a photo,
**so that** customers can see and order what I sell.

## Acceptance criteria
1. Given I add an item with name, price (rupees, greater than 0), category and veg flag, then it appears under its category (mock O5).
2. Prices are stored as integer paise; display uses the shared money formatter.
3. Given I toggle availability, then the item shows as unavailable to customers without being deleted.
4. Given I upload or replace an item image (JPG/PNG/WebP, max 5 MB), then the old Storage object is deleted; deleting the item also deletes its image.
5. An owner can only manage items in their own restaurant; other ids return 404.

## Tasks
- [ ] Migration `menu_items` table (RLS on, index on `restaurant_id`).
- [ ] `menuItemRepository`, `menuService` item methods.
- [ ] `CRUD /api/owner/items` and item form page `/owner/menu/items/[id]`.
- [ ] Reuse `storageService` and the image upload component from US-2.2.

## Technical notes
- Keep `restaurant_id` on items (denormalised) to make ownership checks and search simple.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
