# Story US-8.1: Order placed emails to customer and owner

| Field | Value |
|---|---|
| Epic | 8 — Email notifications |
| Status | review |
| PRD refs | FR-23, FR-25, FR-26 |
| Depends on | US-4.5 |
| Branch | `feature/us-8.1-order-placed-emails` |
| PR | #48 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer and restaurant owner,
**I want** to receive an email when an order is placed,
**so that** I have a confirmation and the owner knows to act.

## Acceptance criteria
1. Given an order is placed, then the customer receives a confirmation with items, totals and order code, and the owner receives a new-order email.
2. `emailService` is an adapter over Resend behind an interface; templates live in one place.
3. A failed send is caught and logged and never fails or delays the order response.
4. Emails are not sent when `RESEND_API_KEY` is unset (dev/test), and this is logged once.

## Tasks
- [ ] `emailService` and email templates.
- [ ] Hook into `orderService.placeOrder` after the transaction commits.
- [ ] Unit tests with a fake email adapter, including the failure path.

## Technical notes
- Use plain HTML templates; no UI library is needed for emails.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
