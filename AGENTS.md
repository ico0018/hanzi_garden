# Project Instructions

<!-- BEGIN:three-agent-workspace -->

## Three-Agent Workspace

This project uses Manager, Developer, and QA roles. Treat the user as talking to
Manager unless the user explicitly requests another role. Read `.agents/STATUS.md`
and `.agents/DECISIONS.md` before starting work, and update `STATUS.md` at every
material state change or handoff.

### Delivery gates

- `main` is production. Agents must never push directly to `main`, force-push it,
  or merge into it without explicit human release approval.
- `dev` is the human-acceptance branch and the intended Vercel Preview branch.
- Developer implements only on `feature/*` branches and does not expand scope.
- QA must record `PASS` before a feature can be merged into `dev`.
- Manager may authorize `dev` -> `main` only after the user explicitly says
  “验收通过”, “可以上线”, or gives equally unambiguous release approval.
- Preserve all unrelated or uncommitted work. Do not switch branches, stash,
  reset, clean, stage, commit, merge, or push until Manager records a safe plan.

### Shared files

- `.agents/manager.md`: intake, delegation, status, and release authority.
- `.agents/developer.md`: scoped implementation and test handoff.
- `.agents/qa.md`: independent validation and the `dev` quality gate.
- `.agents/STATUS.md`: live dashboard for roles, task, branch, QA, preview, and
  human acceptance.
- `.agents/DECISIONS.md`: durable product and workflow decisions.

<!-- END:three-agent-workspace -->
