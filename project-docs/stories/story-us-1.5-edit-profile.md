# Story US-1.5: Edit my profile

| Field | Value |
|---|---|
| Epic | 1 — Authentication and profile |
| Status | in-progress |
| PRD refs | FR-4 |
| Depends on | US-1.3 |
| Branch | `feature/us-1.5-edit-profile` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** signed-in user,
**I want** to edit my name and phone,
**so that** my orders carry correct contact details.

## Acceptance criteria
1. Given I open `/profile`, then I see my name, phone and a read-only email.
2. Given I change name or phone and save, then the values persist after refresh and a success toast appears.
3. Invalid phone numbers or empty names are rejected with inline errors.
4. `GET/PATCH /api/me` only ever affect the signed-in user.

## Tasks
- [ ] Profile page (mock A4, details card only; addresses come in story 4.3).
- [ ] `PATCH /api/me` with Zod validation.
- [ ] `userService.updateProfile`.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
