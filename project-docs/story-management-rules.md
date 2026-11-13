# Story Management Rules

These rules are always followed. They are also summarised in CLAUDE.md.

## Files
- `project-docs/user-stories.md` — overview of all epics and stories.
- `project-docs/stories.yaml` — the single source of truth for each story's state, branch and PR (all epics).
- `project-docs/stories/` — one file per story. **Always create story files in this folder.**
- File name: kebab-case, `story-us-<epic>.<n>-<short-title>.md`, e.g. `story-us-1.1-sign-up-with-role.md`.
- Story files are created **only for the epic the user asks for**. All epics (0-9) are detailed today; add any new story to both `stories.yaml` and `stories/`.

## Story file format
Title, a small table (epic, status, PRD refs, dependencies, branch, PR), the user story (As a / I want / so that), numbered acceptance criteria, tasks, technical notes and a definition of done.

## States
`ready-for-dev` → `in-progress` → `review` → `done`

| State | Set when | Who/where |
|---|---|---|
| `ready-for-dev` | Story is defined (the initial state of every story) | `stories.yaml` |
| `in-progress` | You start building: create the story branch `feature/us-<id>-<slug>` from the latest `release/dev` | First commit on the story branch |
| `review` | You open the pull request into `release/dev` | Commit on the story branch, pushed before or with the PR; fill the `pr` field |
| `done` | The PR has been reviewed, issues resolved, and is ready to merge | Last commit in the PR, so the merge into `release/dev` carries `done` |

## Rules
1. Update `stories.yaml` **and** the status table in the story file together, in the same commit.
2. One story = one branch = one PR. Branch name: `feature/us-<id>-<slug>`.
3. Only move forward through the states, one step at a time. Do not start a story whose `depends_on` stories are not `done`.
4. Record the branch name and PR number in `stories.yaml` when they exist.
5. Never edit another story's state in your PR.
6. Follow the Branching Rules in CLAUDE.md for commit, push, PR, review and merge.
