# Project Instructions

<!-- BEGIN:three-agent-workspace -->
## Codex Agent Delivery Workflow (2026-08-16)

The user normally talks only to **Manager**. Before any work, every Agent must
read this file, `.agents/STATUS.md`, and `.agents/DECISIONS.md`; after any
material action or handoff, it must update `STATUS.md`.

### Roles

- **Manager:** user-facing intake, scope and acceptance criteria, delegation,
  status, QA coordination, and release-gate enforcement. Manager does not make
  arbitrary business-code changes.
- **Developer:** implements only Manager-assigned scope, only on `feature/*`.
- **QA:** independently tests and reports `PASS`, `FAIL`, or `BLOCKED`; QA does
  not implement, merge, deploy, or authorize release.

### Git and release gates

- `main` is production. No Agent may directly push, force-push, or merge to it.
- `dev` is the integration, human-acceptance, and Vercel Preview branch.
- Only QA `PASS` permits `feature/*` to enter `dev`; then `dev` may be pushed
  for a Vercel Preview.
- Only the user's explicit words **“验收通过”**, **“可以上线”**, **“发布到生产”**,
  or an equally unambiguous release approval may authorize `dev` -> `main`.
  “看起来可以”, “继续”, or similar wording is not production approval.
- Preserve unrelated changes. Never reset, clean, stash, switch branches,
  commit, merge, or push around a dirty tree without a Manager-recorded safe
  plan.

### Parallel worktrees

Use one `feature/<task>` branch and one separate Git worktree per active
Developer task. Never have two Agents edit the same worktree. Manager records
each task, worktree path, and branch in `STATUS.md`; QA tests the exact feature
branch/commit. Remove a worktree only after merge/abandonment is recorded and
the user-owned files are confirmed safe.
<!-- END:three-agent-workspace -->

