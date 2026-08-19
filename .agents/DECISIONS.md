# Decisions Log

## 2026-08-19 — Daily dictation write-before-review gate

- Decision: Daily Dictation manual “我会写 / 我不会写” assessment is available only after every HanziWriter target for the current word fires `onComplete`.
- Decision: There is no manual “完成书写 / 开始自评” bypass.
- Decision: If HanziWriter is unavailable, the learner cannot advance through manual assessment.
- Rationale: A child must perform the handwriting task before receiving or submitting the review result.
- Source: User instruction, 2026-08-19.

## 2026-08-16 — Protected release flow reaffirmed

- Decision: `main` is production; `dev` is the integration, human-acceptance,
  and Vercel Preview branch; Developer works on `feature/*` only.
- Gate: QA must record PASS before feature -> dev. Manager may authorize dev ->
  main only after the user's explicit “验收通过”, “可以上线”, “发布到生产”, or equally
  unambiguous approval. Ambiguous phrases are not approval.
- Parallelism: each active feature uses its own branch and worktree.
- Source: User instruction, 2026-08-16.

Add durable decisions at the top with date, decision, rationale, and source.

## 2026-08-16 — Direct GitHub main visibility

## 2026-08-16 — Protected release flow reaffirmed

- Decision: `main` is production; `dev` is the integration, human-acceptance,
  and Vercel Preview branch; Developer works on `feature/*` only.
- Gate: QA must record PASS before feature -> dev. Manager may authorize dev ->
  main only after the user's explicit “验收通过”, “可以上线”, “发布到生产”, or equally
  unambiguous approval. Ambiguous phrases are not approval.
- Parallelism: each active feature uses its own branch and worktree.
- Source: User instruction, 2026-08-16.

- Decision: The verified current work is pushed directly to GitHub `main` so the user can view it immediately.
- Safeguard: Before every such push, Manager creates a local `backup/*` branch at the exact pre-push commit. Never force-push `main`; correct a problem from the named backup branch.
- Source: User instruction.

## 2026-08-16 — Daily dictation scheduling

## 2026-08-16 — Protected release flow reaffirmed

- Decision: `main` is production; `dev` is the integration, human-acceptance,
  and Vercel Preview branch; Developer works on `feature/*` only.
- Gate: QA must record PASS before feature -> dev. Manager may authorize dev ->
  main only after the user's explicit “验收通过”, “可以上线”, “发布到生产”, or equally
  unambiguous approval. Ambiguous phrases are not approval.
- Parallelism: each active feature uses its own branch and worktree.
- Source: User instruction, 2026-08-16.

- Decision: The Dictation tab uses existing lesson characters in lesson order, with each character's first listed word as the listening prompt.
- Decision: A daily queue is capped at 15 items and stored locally for the calendar day. Only the learner's manual “会写 / 不会写” mark changes progress.
- Decision: “不会写” schedules the item for the next day. Consecutive “会写” marks use 2, 4, 7, 15, 30, then 60-day review intervals.
- Source: User request.

## Workspace baseline

## 2026-08-16 — Protected release flow reaffirmed

- Decision: `main` is production; `dev` is the integration, human-acceptance,
  and Vercel Preview branch; Developer works on `feature/*` only.
- Gate: QA must record PASS before feature -> dev. Manager may authorize dev ->
  main only after the user's explicit “验收通过”, “可以上线”, “发布到生产”, or equally
  unambiguous approval. Ambiguous phrases are not approval.
- Parallelism: each active feature uses its own branch and worktree.
- Source: User instruction, 2026-08-16.

- Manager is the user's normal entry point.
- Developer works only on `feature/*`.
- QA `PASS` is required before merge to `dev`.
- `dev` is for human acceptance and Vercel Preview.
- `main` is production and requires explicit human release approval.

