# Story US-4.3: Manage saved delivery addresses

| Field | Value |
|---|---|
| Epic | 4 — Cart and checkout |
| Status | review |
| PRD refs | FR-4, FR-12 |
| Depends on | US-1.5 |
| Branch | `feature/us-4.3-manage-saved-addresses` |
| PR | #35 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to save, edit, delete and pick a default delivery address,
**so that** checkout is quick.

## Acceptance criteria
1. Given I open `/profile`, then I see my saved addresses (mock A4).
2. Given I add an address with label, line 1, city and a 6-digit pincode, then it is saved; invalid values show inline errors.
3. Given I mark an address as default, then exactly one default exists.
4. Given I delete an address used by past orders, then past orders are unaffected (they hold snapshots).
5. `/api/me/addresses` only ever returns and changes the signed-in user's addresses.

## Tasks
- [ ] Migration `addresses` table (RLS on, index on `user_id`).
- [ ] `addressRepository`, `addressService`.
- [ ] `GET/POST /api/me/addresses`, `PATCH/DELETE /api/me/addresses/[id]`.
- [ ] Addresses card on the profile page (shadcn `Dialog`, `Form`, `RadioGroup`).

## Technical notes
- Limit to 10 addresses per user.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
