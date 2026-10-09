# Independent QA — daily dictation count options

Date: 2026-10-09 (Asia/Shanghai)
Result: **PASS**
Tested code commit: `6f559c3ead74ac43f893508fa541ca436988bb64`
Branch: `feature/dictation-count-options`
Worktree was clean at handoff and unchanged throughout code testing. This report commit contains QA documentation only. QA did not implement, merge, push, deploy, or authorize production.

## Validation evidence

- Syntax checks for `app.js` and `daily-word-bank.js`, existing `scripts/test-daily-word-bank.js`, new `scripts/test-daily-dictation-size.js`, and `git diff --check HEAD^ HEAD` all passed.
- Independent Playwright scenarios used installed Chrome, real DOM, isolated browser contexts, and a local static server. They verified the fieldset accessible name, exactly three 10/20/30 buttons, default 10, single `aria-pressed` selection, Enter/Space activation, and preserved focus.
- Selecting 20 and 30 changes the actual queue cap. The current 28-word bank returns 28 unique words when 30 is selected and explicitly displays that actual count; it never fills by repeating words.
- Two words were manually marked known/unknown after controlled character completion callbacks. The first known review stays at two days and unknown stays at one day. The answer starts hidden; revealing it and completing only one character do not open assessment. All characters must complete before manual self-assessment appears. No mark is automatic.
- Real DOM 10 → 20 → 30 → 10 → 30 and reload retained the full saved queue IDs and results; lowering only hid the tail. A saved old 15-word queue retained a result on its hidden 15th word, then restored it and extended to 20 without replacing the first 15 IDs.
- Increasing a queue appended oldest due words first, tie-broken by bank order, followed by new words. Future reviews were excluded and no duplicate IDs appeared.
- Book 3 preference persisted through reload and book navigation. Unconfigured Book 4 remained empty with its own default 10; changing its separate preference did not overwrite Book 3's 30 selection.
- All 28 current bank words completed through gated manual button actions. Completion/overview correctly displayed 28, then 10 on shrink, then restored 28 with every result retained. Seeded future reviews gave an actual 0-word empty state; one eligible word gave actual 1-word progress and completion even with 30 selected.
- Desktop 1440 × 1000, tablet 768 × 1024, mobile 375 × 812, and narrow mobile 320 × 800 were tested. All choices stayed on screen with at least 44 px width/height and no document horizontal overflow. Screenshots were visually reviewed: narrow mobile wraps the third choice cleanly; no overlap or clipped controls.
- No app page errors occurred in isolated test scenarios.
- An additional unmocked local smoke loaded the actual external HanziWriter and pinyin libraries, rendered two SVG handwriting targets, and produced no app page errors.

## Scope and limits

The deterministic assessment tests used controlled HanziWriter `onComplete` callbacks rather than human stroke tracing. The actual library load/render smoke and unchanged handwriting/self-assessment code diff supplement that check. External audio was aborted during deterministic queue tests; the feature does not alter audio code.

Manager reported the feature branch pushed and its Vercel deployment successful at https://hanzi-garden-jvsfgkkv5-ico0018s-projects.vercel.app . Independent browser navigation redirected to Vercel login, so deployed UI interactions could not be tested without the protected-preview session. This does not block the independently passed local acceptance checks.

No defects found within assigned scope. PASS permits feature integration into `dev`; it does not authorize production.

## Local reproducibility and screenshots

QA scratch scripts and result JSON are outside this feature worktree in the parent `work/qa-dictation/` directory:

- `browser-environment.js` — local server and isolated browser harness
- `test-browser.js` — independent acceptance/regression suite
- `results.json` — checks and measured viewport/choice dimensions
- `desktop.png`, `tablet.png`, `mobile.png`, `narrow-mobile.png` — visually inspected captures

Absolute screenshot directory: `C:\Users\Administrator\Documents\Codex\2026-10-09\https-github-com-ico0018-hanzi-garden\work\qa-dictation`
