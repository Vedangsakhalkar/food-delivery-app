# Story US-8.2: Status change emails to the customer

| Field | Value |
|---|---|
| Epic | 8 — Email notifications |
| Status | in-progress |
| PRD refs | FR-24, FR-26 |
| Depends on | US-5.4, US-8.1 |
| Branch | `feature/us-8.2-status-change-emails` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to be emailed when my order status changes,
**so that** I know progress without keeping the page open.

## Acceptance criteria
1. Given the status changes to Accepted, Out for Delivery, Delivered, Rejected or Cancelled, then the customer receives an email naming the new status (no email for Preparing).
2. Rejected emails include the reason.
3. Send failures never fail the status update.
4. Each transition sends at most one email.

## Tasks
- [ ] Add status templates to `emailService`.
- [ ] Call from `orderService.updateStatus` and cancel flow after commit.
- [ ] Unit tests for each transition.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
