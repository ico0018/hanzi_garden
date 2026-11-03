# Mistake notebook QA — 2026-11-03

Result: **PASS** for implementation `65d77e55131c5c6bee99f5317dcfea2ad7b72c69`.
The tested worktree HEAD `6c8034ba9a7ff66592a2eb52f6246f631ec0a5e9`
differs from that implementation only in `.agents/STATUS.md`.

## Independent checks

- Executed the production notebook controller in an independent Node VM/DOM
  event harness with fixtures supplied outside the repository. Confirmed UTF-8
  BOM, CRLF, blank/comment lines, source-order deduplication and invalid-row
  counts. Source fetch uses the encoded root `错词.txt` path with `no-store`.
- Verified initial all-selection, clear/disabled-start, a subset selected out of
  source order, and actual source-ordered dictation. Individual speech and
  answer reveal/hide work. Answers and assessment start hidden.
- Verified partial handwriting and duplicate first-character completion cannot
  permit a manual result; all character targets must complete. Results advance
  exactly once, show actual known/unknown totals, and retry only unknown words.
- Captured obsolete writer/assessment callbacks. After rewrite, tab leave and
  reentry, stale callbacks neither unlock current assessment nor save results.
  Current word restarts after reentry; the round retains its position.
- Verified refreshed/reordered source retains stable word identities, existing
  choice state and saved results; new words are available for selection. Empty
  source and 404 errors show distinct usable states; retry reloads the source.
- Verified notebook writes use only `hanzi-mistake-notebook-progress-v1`, with a
  sentinel daily-progress value unchanged. Unavailable handwriting prevents
  assessment. Denied storage still lets the round finish and shows a warning.
- Ran the actual `index.html`, book catalog, daily bank, notebook and `app.js`
  scripts in a separate LinkeDOM environment. Confirmed three integrated tabs,
  initial hidden notebook, mutually hidden views, tab-focus restoration,
  notebook list/start and hidden answers, resumed round after tab changes, and
  byte-identical daily queue before and after notebook use. LinkeDOM was
  installed only in `/tmp/hanzi_qa`, adding no project dependency.

Independent harnesses used during this session:

```text
node /workspace/scratch/f53abdb3de03/qa-notebook-independent.cjs /workspace/scratch/f53abdb3de03/hanzi_mistake_notebook
node /workspace/scratch/f53abdb3de03/qa-notebook-integration.cjs /workspace/scratch/f53abdb3de03/hanzi_mistake_notebook
```

## Repository regressions and source review

All passed:

```text
node scripts/test-mistake-notebook.js
node scripts/test-daily-dictation-size.js
node scripts/test-dictation-count.js
node scripts/test-daily-word-bank.js
node --check mistake-notebook.js
node --check app.js
git diff --check d48ae83..HEAD
```

Reviewed the complete notebook controller and integration diff. Existing daily
queue, scheduling, assessment and textbook-data code is unchanged. Only the
new notebook, its tab/view wiring and cache versions, additive styles, starter
TXT, focused test, README and delivery records changed. The starter TXT is
comment-only; no unprovided personal mistakes were invented. README accurately
describes parent-edited/deployed source, cross-book notebook results,
browser-local storage and session behavior.

Desktop/tablet/mobile source review found wrapping toolbars and rows, native
labeled checkboxes/buttons, keyboard focus styles, hidden-state handling and
wrapping handwriting grids with existing responsive widths. This is a source
review, not a rendered viewport measurement.

## Limits and release gate

No real browser was available. Chromium installation repeatedly downloaded a
truncated/non-ZIP archive, so real desktop/tablet/mobile appearance, touch/pen
strokes, external character-data loading and audible output were not exercised.
The controller's actual production callbacks were tested using simulated
HanziWriter events; no automatic handwriting or audio quality claim is made.
The common reader/audio implementation is unchanged.

Manager separately reported HTTP 200 for index, the new script, CSS and encoded
TXT on the frozen candidate. QA did not merge, push, deploy or authorize
production. This PASS permits Manager's feature -> dev integration; no current
user production approval applies to this scope.
