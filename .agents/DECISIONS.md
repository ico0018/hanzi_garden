# Decisions Log

Add durable decisions at the top with date, decision, rationale, and source.

## 2026-08-16 — Daily dictation scheduling

- Decision: The Dictation tab uses existing lesson characters in lesson order, with each character's first listed word as the listening prompt.
- Decision: A daily queue is capped at 15 items and stored locally for the calendar day. Only the learner's manual “会写 / 不会写” mark changes progress.
- Decision: “不会写” schedules the item for the next day. Consecutive “会写” marks use 2, 4, 7, 15, 30, then 60-day review intervals.
- Source: User request.

## Workspace baseline

- Manager is the user's normal entry point.
- Developer works only on `feature/*`.
- QA `PASS` is required before merge to `dev`.
- `dev` is for human acceptance and Vercel Preview.
- `main` is production and requires explicit human release approval.
