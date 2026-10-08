# Decisions Log

## 2026-08-19 — Multi-book character dataset architecture

- Decision: Hanzi Garden uses one shared learning application and selects curriculum data through the `book` query parameter.
- Decision: Each available grade/term maps explicitly to one user-provided data file.
- Decision: Learning and dictation progress are isolated by book ID.
- Decision: Missing curriculum data must never silently fall back to another grade.
- Rationale: Multiple grades now share the same application and must not mix curriculum or learner progress.
- Source: User instruction, 2026-08-19.

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


## 2026-10-08 — Unified users and Tencent isolated preview
- Keep the static tool and old guest localStorage keys. Cloud cache is scoped by both account and child, with revision/outbox metadata; importing guest data is explicit on the original tool origin.
- Keep curriculum and handwriting/self-review rules unchanged. Conflicts require an explicit decision; preserve both candidates and a downloadable recovery copy.
- The user requested deployment of feature/unified-user-system to a Tencent isolated preview. This overrides the historical Vercel preview preference for this task. DNS and production are unchanged; no main merge until explicit owner approval after manual review.

## 2026-10-08 — Deployed inspection access
- Current user explicitly authorized reusing prior SSH credential. Host key remains pinned; password is neither printed nor committed.
- Preview uses Ubuntu rootless Docker and separate loopback Nginx listeners. Main/DNS and existing services remain unchanged; direct Tencent preview supersedes Vercel for this task.
- COS/SMTP missing configuration remains a visible gate. Daily backup explicitly targets local storage until COS is configured and tested.


## 2026-10-08 — Parent arithmetic and current-login access
- Source: User's follow-up requirement. Parent mode uses a Chinese-number multiplication question with three answers; remove password/PIN setup and the 15-minute parent lock.
- Signed-in permission follows server Session parentReady and ends at explicit parent-lock or logout. Guest mode is a local tab-scoped misclick guard, not authentication.
- Sync status, imports, exports and conflict/recovery actions belong on each tool's same-origin parent page; student learning keeps only a compact parent entry while automatic sync continues.
- Keep learning rules, old localStorage and account/profile isolation. Existing production and main remain unchanged pending separate owner acceptance.

## 2026-10-08 — Central Taskhelper parent records (supersedes earlier student entry placement)

- Source: User now explicitly removes parent entries from Hanzi/Guwen and selects Taskhelper /parent/ for both tools' local record buttons.
- Student DOM creates no entry/panel/record placeholders; automatic cloud sync and original curriculum continue.
- Central parent embeds each original tool origin with one central child/mode selector. No record/ID/URL action payload traverses postMessage; exact origin/window and allowed fields enforced. Signed permission still requires server parentReady; guest hint only follows central local arithmetic and cannot activate signed accounts.
- Inline confirmations permit cancel without learning-record writes; conflicts preserve both versions. Only isolated branch preview is deployed, no main/dev merge, DNS or production change. Manual acceptance is still pending.

## 2026-10-08 — User-authorized public IP preview

- User now explicitly requests a direct public IP rather than localhost/SSH. This supersedes the earlier loopback-only inspection restriction solely for the isolated preview; DNS, main/dev and production remain protected.
- Use trusted HTTPS IP and one443 frontend with /hanzi/, /guwen/, /taskhelper/ prefixes. Keep account/DB containers private, Secure/HttpOnly host-only cookies, exact Origin and real auth; no remote HTTP downgrade.
- Same account/child cloud IDs remain; browser-local records stay at their original origin. No deletion or fabricated migration.
- Server deployment/renewal/local checks passed, but actual exterior443 access is blocked. Manual-ready gate requires cloud-rule reachability and actual public browser checks; do not turn internal TLS success into exterior PASS.
