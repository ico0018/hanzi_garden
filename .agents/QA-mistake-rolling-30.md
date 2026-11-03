# Rolling 30-word mistake dictation QA — 2026-11-03

Result: **PASS** on exact implementation
`f22061235ed71f7688bd87bff8113e34ca0bd49d`.
The tested worktree HEAD `d49edbcce0e85d1dc76281d639703003d4b2a5af`
differs only in `.agents/STATUS.md`.

## Independent scheduler validation

An independently authored Node/VM harness executed the production scheduler
with a controlled local clock and 70 synthetic, unique words (test fixtures
only; none added to the deployed source).

- Exactly 30/30/10 source-ordered rounds; 70 distinct reviewed words; no
  same-day repeat or future-due padding. Duplicate assessment is idempotent.
- A 35-word due backlog precedes fresh words, ordered by oldest due date and
  source order for ties; unhandled due items continue into the next round.
- Wrong results reset streaks and return next local calendar day. Correct
  intervals are 2/4/7/15/30/60/60 days; a later wrong result resets the cap.
- Persisted partial rounds/results resume after a new scheduler instance,
  midnight and source reorder. Removed pending words are omitted without
  false results; saved full IDs remain intact; newly added words wait until
  the next round. Reviews completed after midnight use the completion date.
- Legacy v1 known/unknown timestamps migrate to local calendar dates with
  2-day/1-day scheduling; v1 data is unchanged and v2 reload is stable.
- Notebook writes use its v2 key only; sentinel original daily data is
  unchanged. Invalid stored JSON recovers visibly. Leap-day, month/year edges
  and Asia/Shanghai UTC-date boundaries passed. Additional independent
  America/New_York spring/fall DST and previous-local-day checks passed.

## Independent controller and app integration

Executed actual production controller code in LinkeDOM with real DOM parsing
and events, controlled dates/storage/source responses, and simulated writer
completion callbacks.

- Opens directly into automatic listening/writing, with no selection-first
  requirement. Confirmed complete 70-word UI flow as 30/30/10, same-day
  next-round buttons, actual summary counts, no immediate wrong-word retry,
  and next review date when exhausted.
- Answers and assessment are initially hidden. Replay and reveal/hide work.
  Partial or duplicate character completion cannot bypass the full-word
  manual assessment gate. Stale callbacks after rewrite, next word and tab
  leave cannot unlock or save results. Missing tools and rejected glyph-data
  promises remain blocked with visible retry guidance.
- A fresh controller reload resumes the assigned next word and results,
  including after midnight and source reorder/removal/additions. A prior-day
  completed round automatically opens due work on a new visit; finishing the
  current round still shows its summary. The optional source-reading list
  remains available and shows saved results/dates.
- Empty source, failed fetch/retry and denied storage behave as documented;
  storage failure retains an in-memory usable round and warns about reload.
- Loaded scripts in actual `index.html` order and ran real `app.js`.
  `?view=mistakes` works with curriculum fetch deliberately unavailable and
  with an invalid book parameter. Optional background textbook failure does
  not hide/block the independent notebook. Switching to learning shows a
  handled error with notebook tabs retained; returning works. Normal
  learning/daily loading and a byte-identical daily queue around notebook
  navigation also passed.

Session-local independent harness commands:

```text
TZ=Asia/Shanghai node /workspace/scratch/f53abdb3de03/qa-rolling-scheduler-independent.cjs /workspace/scratch/f53abdb3de03/hanzi_mistake_rolling
TZ=Asia/Shanghai node /workspace/scratch/f53abdb3de03/qa-rolling-controller-independent.cjs /workspace/scratch/f53abdb3de03/hanzi_mistake_rolling
TZ=Asia/Shanghai node /workspace/scratch/f53abdb3de03/qa-rolling-app-independent.cjs /workspace/scratch/f53abdb3de03/hanzi_mistake_rolling
```

LinkeDOM was installed outside the project in `/tmp/hanzi_qa`; no new project
dependency was introduced.

## Repository regressions and review

All passed:

```text
node scripts/test-mistake-scheduler.js
node scripts/test-mistake-notebook.js
node scripts/test-mistake-page.js
node scripts/test-daily-dictation-size.js
node scripts/test-dictation-count.js
node scripts/test-daily-word-bank.js
node --check app.js
node --check mistake-notebook.js
node --check mistake-scheduler.js
git diff --check b432116..HEAD
```

Reviewed the complete scheduler/controller and app/source/documentation diff.
Original daily queue/progress/scheduling functions and textbook data are
unchanged. Cache versions and script ordering include the new scheduler.
The root TXT remains the instruction-only starter; no personal word list was
invented. README matches the rolling/persistence/migration behavior. Responsive
wrapping, native keyboard controls, hidden states and focus handling were
reviewed in source; existing handwriting-grid responsiveness is retained.

## Limits and release gate

No usable real browser binary is installed; previous Chromium downloads were
truncated. This QA therefore does not claim rendered desktop/tablet/mobile
measurements, actual touch/pen strokes, live external glyph availability or
audible playback. Simulated writer events exercised the production completion
gate and failure paths. The shared audio implementation is unchanged.

Manager separately reported HTTP 200 for the direct index route, scheduler,
controller, app and encoded TXT on the frozen candidate. Deployment-system
checks, authenticated remote preview and the prior Cloudflare failure remain
separate from this local QA result. QA did not merge, push, deploy or authorize
production; this PASS permits Manager's feature -> dev integration only.
