# Project Instructions

<!-- BEGIN:three-agent-workspace -->

## Three-Agent Workspace

This project uses Manager, Developer, and QA roles. Treat the user as talking to
Manager unless the user explicitly requests another role. Read `.agents/STATUS.md`
and `.agents/DECISIONS.md` before starting work, and update `STATUS.md` at every
material state change or handoff.

### Delivery and rollback rules

- `main` is the normal GitHub viewing branch for this project. After a local
  `backup/*` branch has been created at the exact pre-push commit and relevant
  checks have passed, Manager may push the verified feature directly to `main`.
- Never force-push `main`. If a pushed change must be undone, return to the
  named local `backup/*` branch and make a deliberate corrective push.
- `dev` and Vercel Preview may still be used when specifically requested, but
  are not prerequisites for a normal `main` push.
- Developer implements only on `feature/*` branches and does not expand scope.
- QA should record validation evidence before handoff; it does not block the
  user's requested direct-to-`main` visibility workflow.
- Preserve all unrelated or uncommitted work. Do not switch branches, stash,
  reset, clean, stage, commit, merge, or push until Manager records a safe plan.

### Shared files

- `.agents/manager.md`: intake, delegation, status, backup, and push authority.
- `.agents/developer.md`: scoped implementation and test handoff.
- `.agents/qa.md`: independent validation and the `dev` quality gate.
- `.agents/STATUS.md`: live dashboard for roles, task, branch, QA, preview, and
  human acceptance.
- `.agents/DECISIONS.md`: durable product and workflow decisions.

<!-- END:three-agent-workspace -->
