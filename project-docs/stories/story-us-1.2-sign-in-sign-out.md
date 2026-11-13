# Story US-1.2: Sign in and sign out

| Field | Value |
|---|---|
| Epic | 1 — Authentication and profile |
| Status | review |
| PRD refs | FR-1, FR-2 |
| Depends on | US-1.1 |
| Branch | `feature/us-1.2-sign-in-sign-out` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** registered user,
**I want** to sign in and out,
**so that** I can access my account and end my session securely.

## Acceptance criteria
1. Given valid credentials, when I log in at `/login`, then I am redirected by role: customer to `/`, owner to `/owner`, admin to `/admin`.
2. Given wrong credentials, then I see "Invalid email or password" and stay on the page.
3. Given I have not confirmed my email, then I am told to confirm it.
4. My session survives a page refresh.
5. When I choose Log out, the session is cleared and I land on the guest home page.
6. Optional: Continue with Google works when the provider is enabled.

## Tasks
- [ ] Login page (mock A1).
- [ ] Header shows Log in / Sign up for guests and the user menu with Log out when signed in.
- [ ] Session handled by `@supabase/ssr` cookies.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`
