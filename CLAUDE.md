# CLAUDE.md — Dabba (food delivery web app)

## Project
Browser-based food delivery web app inspired by Zomato. MVP only. Mobile app is out of scope until the web app launches.

## Tech Stack
TypeScript, Next.js (App Router), Tailwind CSS, shadcn/ui, Supabase (Auth, PostgreSQL, Storage) used with Supabase API keys (see `project-docs/auth-setup.md`). DB access via the `pg` driver with parameterised SQL (no ORM); the Supabase client is for auth/storage only. Email: Resend.

## Product Decisions
- Payment: Cash on Delivery only.
- Restaurants self-onboard and go live immediately (no admin approval); admin can disable.
- Images: Supabase Storage (bucket `images`). Never store image binaries in the database, only the path/URL.
- Never commit secrets (`.env.local`, secret/service keys, DB URLs).

## Architecture Rules (MVC)
- **View:** UI logic only in UI components (`src/app`, `src/components`). Components never access the DB or services directly; they call `/api`.
- **Controller:** all APIs in `src/app/api/**/route.ts`, following Next.js route handler standards. Validate, authorise, delegate to services. No business logic.
- **Services:** all business logic in `src/services`.
- **Models/Repositories:** DB access only via `src/repositories` (SQL via `pg`) / `src/models` (entity types). Nothing else touches the DB.
- Follow SOLID and standard design patterns; keep code well structured.

## UI Design Adherence (mock-ups are locked)
- The screens in `project-docs/mockups/` are the approved, locked UI design. Read the relevant mock screen(s) before doing any UI work in any story.
- Implemented UI must match the mock-ups: layout, sections, copy, states (loading, empty, error, closed, disabled) and flows. Build them with shadcn/ui components (see UI Component Rules).
- If a story needs something the mock-ups do not show, or a mock-up conflicts with the story or architecture, stop and ask the user. Do not silently deviate, and do not edit the mock-ups unless the user asks.
- State in the PR which mock screen(s) the UI follows (e.g. `A1`, `C6`).

## UI Component Rules
- Every UI component must come from the shadcn/ui library wherever possible (Button, Input, Card, Dialog, Select, Table, Form, etc.). Check shadcn/ui first before building anything custom.
- Add missing components via the CLI (`npx shadcn@latest add <component>`) into `src/components/ui`; do not hand-write equivalents.
- Build custom components only when shadcn/ui has no suitable one; compose them from shadcn/ui primitives and Tailwind utilities, and state why in the PR/commit.
- Do not introduce other UI libraries (MUI, Chakra, Ant, etc.).
- Do not modify generated files in `src/components/ui` except for theming/variants.

## Documentation Conventions
- All project-specific docs live in `project-docs/` (project root).
- `my-docs/` holds user-authored inputs (e.g. `requirements.md`); do not put generated docs there.

| Document | Location |
|---|---|
| Requirements (user input) | `my-docs/requirements.md` |
| PRD (Step 1) | `project-docs/prd.md` |
| Supabase setup guide (auth, DB, storage) | `project-docs/auth-setup.md` |
| Mock screens, locked UI design (open `index.html` in a browser) | `project-docs/mockups/index.html` |
| User stories (Step 2) | `project-docs/user-stories.md` |
| Story state tracker | `project-docs/stories.yaml` |
| Story files (all epics 0-9) | `project-docs/stories/` |
| Story management rules | `project-docs/story-management-rules.md` |
| Architecture (Step 3) | `project-docs/architecture.md` |

## Workflow
Deliverables are strictly ordered: PRD → User Stories → Architecture. Start each step only after the user approves the previous one. User stories are grouped into epics; project scaffolding is the first story. Read the docs above before starting any task.

## Story Management (always follow; details in `project-docs/story-management-rules.md`)
- Story files live **only** in `project-docs/stories/`, named in kebab-case: `story-us-<epic>.<n>-<short-title>.md` (e.g. `story-us-1.1-sign-up-with-role.md`).
- `project-docs/stories.yaml` is the single source of truth for every story (all epics): status, branch, PR.
- Create story files only for the epic the user asks for. All epics (0-9) are now detailed; any new story must be added to both `stories.yaml` and `stories/`.
- States: `ready-for-dev` (initial) → `in-progress` → `review` → `done`.
  - `in-progress`: when you start building and create the story branch `feature/us-<id>-<slug>` from the latest `release/dev`.
  - `review`: when you open the PR into `release/dev` (record the PR number).
  - `done`: once the story is reviewed and issues are resolved, as the last commit before merging.
- Update `stories.yaml` and the story file's status table together in the same commit. One story = one branch = one PR.
- Do not start a story until its `depends_on` stories are `done`.

## Branching Rules
- `release/dev` is the integration branch; `main` is the release branch.
- Every new task (i.e. each new Claude chat/context) must start on a new feature branch created from the latest `release/dev`:
  `git checkout release/dev && git pull && git checkout -b feature/<short-task-name>`
- Do this before making any changes: no file may be edited until the new feature branch exists. Never commit directly to `release/dev` or `main`.
- Branch names: `feature/<short-kebab-case-description>` (e.g. `feature/project-scaffolding`). Other prefixes: `fix/`, `docs/`, `chore/`.
- After the task is completed, follow this sequence:
  1. Commit the changes on the feature branch.
  2. Push the branch to the remote.
  3. Open a PR into `release/dev`.
  4. Review the PR — skip this step if the task is UI mock-ups only.
  5. Resolve any issues found in the review and push the fixes.
  6. Merge the PR, then switch back to `release/dev` and pull the latest.

## Status
- [x] Step 1: PRD (approved)
- [x] Mock screens drafted
- [x] Step 2: User stories drafted (awaiting approval; story files for all epics 0-9 created)
- [x] Step 3: Architecture document drafted (awaiting approval; user stories still pending)
