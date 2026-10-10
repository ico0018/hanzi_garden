# Decisions Log

## 2026-10-10 — Adjustable daily count and two-word learning cards

- Decision: Every book offers 10/20/30 daily dictation choices, default 10, stored per book. Existing queue/progress IDs remain compatible; resizing retains results and assigned order without repeats.
- Decision: Every learning character has exactly two distinct multi-character words containing it, with readings and meanings. Existing curated priority and Grade 3 sentence linkage stay intact; additional general words are identified as vocabulary supplements, not textbook word-table entries.
- Decision: Enable Grade 1/2/3 lower terms using preserved checked-in writing-table scope and local metadata. Dictation banks continue to use source volume.words only, not learned group words.
- Source: User's three-part request, 2026-10-10; this replaces the fixed 15-item daily cap and prior three-word display.
- Vocabulary exception: Characters with limited standalone compounds (particles, surnames etc.) use two natural usage phrases, explicitly marked 用法短语; no single-character or 学X/写X filler. General-dictionary imports show a provenance label rather than unreviewed archaic definitions; authored supplements carry brief Chinese meanings.
- Source errata: Preserve original data artifacts, but correct exposed 露馅儿子 -> 露馅儿 in the fifth-lower word bank; exclude 曰过/曰道/噢呀/噢哟 as questionable learning words; normalize third-upper 欠 to 哈欠 and its existing sentence to 打哈欠. Manager approved the learning sentence erratum.
- Grade 3 Lower constraint: Pinned 321 writing/words incorrectly contain upper-term content. Do not use its word bank or lesson assignments; display preserved raw lower writing-table characters in honest 25-character groups with lesson verification pending.

## 2026-10-10 — Grade 4–6 explicit textbook word-table banks

- Decision: Configure editable one-word-per-line daily dictation banks for Grade 4, 5 and 6, both terms, sourced solely from pinned volume.words (textbook word-table transcription), not generated character group words or writing/recognition scope.
- Decision: Preserve source lesson/word order and legitimate repeated entries; remove only four exact copied whole-lesson blocks in source 421, and label that bank incomplete. New banks use occurrence-order IDs to distinguish duplicates and namespace by book; Grade 3 Upper retains its supplied 28 words and current IDs/results.
- Decision: Unsupported books retain the unconfigured empty state. Daily cap and write-before-assessment gate remain unchanged.
- Source: User said “词语表也要补全，就用课本后面词语表”, 2026-10-10. This extends the earlier Grade 3-only bank policy for these six books.
- Limitation: Community 2019 transcription is available; primary textbook pages have not been supplied or verified against this source.

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

