# Story US-2.2: Owner edits restaurant and uploads image

| Field | Value |
|---|---|
| Epic | 2 — Restaurant and menu management (owner) |
| Status | review |
| PRD refs | FR-17, FR-18a |
| Depends on | US-2.1 |
| Branch | `feature/us-2.2-owner-edits-restaurant-and-image` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** restaurant owner,
**I want** to edit my restaurant details and upload a photo,
**so that** customers see accurate information and an attractive listing.

## Acceptance criteria
1. Given I open `/owner/restaurant`, then the form is pre-filled with my restaurant's current values (mock O2).
2. Given I change fields and save, then the values persist after refresh and a success toast appears.
3. Given I upload a JPG, PNG or WebP image up to 5 MB, then it is stored in Supabase Storage bucket `images`, and only `image_path` and `image_url` are saved in the database.
4. Given the file is another type or over 5 MB, then the server rejects it with 422 and the UI shows the reason.
5. Given I replace the image, then the previous Storage object is deleted.
6. An owner can only edit their own restaurant.

## Tasks
- [ ] `storageService` adapter (interface + Supabase implementation, secret key server-side only).
- [ ] `POST /api/owner/uploads` controller validating type and size.
- [ ] `PATCH /api/owner/restaurant` and `restaurantService.update` with old-image cleanup.
- [ ] Image upload component built from shadcn primitives (`Input type=file`, `Button`, `AspectRatio`).

## Technical notes
- Image bytes never go into the database. Storage cleanup failures are logged and must not fail the save.
- `storageService` is reused by US-2.4.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
