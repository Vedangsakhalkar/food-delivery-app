# CLAUDE.md — Food Delivery App

## Project
Browser-based food delivery web app inspired by Zomato. MVP only. Mobile app is out of scope until the web app launches.

## Tech Stack
- TypeScript, Next.js (App Router), Tailwind CSS, shadcn/ui
- MongoDB (MongoDB Atlas) via Mongoose
- Authentication: Firebase Authentication (see `project-docs/auth-setup.md`)
- Payments: Cash on delivery only (MVP). Email: Resend.
- Images: Cloudinary. Never store image binaries in MongoDB, only `url` and `public_id`.

## Architecture Rules (MVC)
- **Model:** Mongoose schemas/models in `src/models`.
- **Services layer:** ALL business logic and DB access lives in `src/services`. Nothing else touches the DB.
- **Controllers/API:** Next.js route handlers in `src/app/api/**/route.ts`, following Next.js API conventions. They validate input, call services, and return responses. No business logic.
- **View:** ALL UI logic lives in UI components (`src/components`, `src/app`). Components never access the DB or services directly. They call `/api`.
- Follow SOLID and established design patterns. Keep code well structured.

## Documentation Conventions
- All project-specific documents live in `project-docs/` (project root).
- Documents are created in order, and each step starts only after the previous one is approved:
  1. `project-docs/prd.md` — Product Requirements Document
  2. `project-docs/user-stories.md` — user stories grouped into epics, scaffolding first (after PRD approval)
  3. `project-docs/architecture.md` — detailed architecture (after user stories approval)
- `project-docs/auth-setup.md` — step-by-step auth service setup guide.
- Original requirements: `my-docs/requirements.md`.

## Branching Rules
- `release/dev` is the integration branch; `main` is the release branch.
- Every new task (i.e. each new Claude chat/context) must start on a new feature branch created from the latest `release/dev`: `git checkout release/dev && git pull && git checkout -b feature/<short-task-name>`.
- Do this before making any changes. Never commit directly to `release/dev` or `main`.
- Branch names: `feature/<short-kebab-case-description>` (e.g. `feature/project-scaffolding`). Other prefixes: `fix/`, `docs/`, `chore/`.
- After the task is completed, follow this sequence:
  1. Commit the changes on the feature branch.
  2. Push the branch to the remote.
  3. Open a PR into `release/dev`.
  4. Review the PR — skip this step if the task is UI mock-ups only.
  5. Resolve any issues found in the review and push the fixes.
  6. Merge the PR, then switch back to `release/dev` and pull the latest.

## Reference Docs (read before working)
Read and follow these before starting any task; they are the source of truth:
- `my-docs/requirements.md` — original requirements
- `project-docs/prd.md` — approved PRD (scope, features, MVP boundaries)
- `project-docs/auth-setup.md` — Firebase Authentication setup
- `project-docs/mockups/index.html` — static mock screens for every page (for UI review; open in a browser)
- `project-docs/user-stories.md` and `project-docs/architecture.md` — once created and approved

## Status
- [x] Step 1: PRD (approved)
- [x] Mock screens drafted (branch `feature/mock-screens`, awaiting review)
- [ ] Step 2: User stories
- [ ] Step 3: Architecture document
