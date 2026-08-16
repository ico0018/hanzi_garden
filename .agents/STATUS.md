# Delivery Status

> Update this dashboard at every material state change and handoff.

| Field | Current state |
| --- | --- |
| Last updated | 2026-08-16 — dictation feature triaged; backup requested |
| Manager | ACTIVE — backup then coordinate dictation feature |
| Developer | ASSIGNED — implement isolated Dictation tab on `feature/dictation-spaced-repetition` |
| QA | WAITING — validate after implementation handoff |
| Current task | Add a 15-word/day manual-marking dictation trainer with spaced repetition |
| Branch | `main` |
| Working tree | Workspace files awaiting backup commit at inspection time |
| QA status | NOT STARTED |
| Preview status | NOT REQUESTED / NOT VERIFIED |
| Human acceptance | NOT REQUESTED — `dev` -> `main` forbidden until explicit approval |

## Active task template

```text
Task: Add an independent Dictation tab.
Scope: Draw only from existing lesson vocabulary in lesson order; offer exactly 15 items per day; require a manual "can write" or "cannot write" mark for each item; persist progress locally; schedule repeats by an Ebbinghaus-style interval plan.
Acceptance criteria: New words begin with lesson 1 in order; a "cannot write" mark makes the item eligible again tomorrow; a "can write" mark increases its review interval; no automatic correctness marking; daily queue never exceeds 15 items; existing learning tab remains available.
Developer branch: feature/dictation-spaced-repetition
Developer state: IN PROGRESS
QA result: NOT STARTED
QA evidence / defects: Pending implementation.
dev merge: NOT ALLOWED
Preview: NOT REQUESTED
Human acceptance: WAITING
Next owner: Developer
```
