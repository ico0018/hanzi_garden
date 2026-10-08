# Delivery Status

> Read before work. Every Agent updates this dashboard at start, block, and handoff.

## Current snapshot

## 2026-10-07 — Project README refresh

```text
Task: Add a clear README that reflects the current Hanzi Garden implementation.
Acceptance criteria: Document only currently available books and implemented learning/dictation behavior; include local run, static deployment, curriculum data format, core files, browser-local progress, and frontend dependencies; do not claim unavailable curriculum support.
Developer branch: feature/update-readme-dev
Developer worktree: GitHub connector edit; no local worktree created
Developer state: Done — README added in 32b537369e568eb597eed9a369854832cd0bf2ca
QA result: PASS
QA evidence / defects: Diff contains only README.md plus this status record; README was checked against index.html, app.js, book-catalog.js, daily-word-bank.js, vercel.json and current curriculum availability; Vercel status check passed on 410eea340602a7f78c28fbfb1af779e9c6e41ae1.
dev merge: Completed — PR #2 merged as 4be195e3870e95e80e85ae9960d486ecdf854e3c
Preview: Vercel check passed
Human acceptance: Approved — user said “给main加一个readme”, 2026-10-07
Next owner: Manager — release dev to main
```

## 2026-09-19 — Explicit daily word-bank refresh

```text
Task: Replace generated daily-dictation phrases with an editable Grade 3 Upper word bank.
Acceptance criteria: The supplied 28 words are stored one per line in a UTF-8 TXT file; only that file supplies Grade 3 Upper daily dictation; other books show a configured-bank empty state; v4 keys do not read/migrate generated queues.
Developer branch: feature/daily-word-bank-current
Developer worktree: F:\chinese webapp\.worktrees\daily-word-bank-current
Developer state: Done — explicit Grade 3 Upper bank, v4 isolation, and focused Node behavior test completed.
QA result: PASS
QA evidence / defects: Independent QA passed exact `c793bacd551b0fe46e11b44717b3c991e0c5109a`: TXT contents/order, Grade 3-only source, non-generated empty state for other books, v4 storage isolation, load order, syntax checks, test script, and diff check. Final main checks also passed: `node --check app.js`, `node --check daily-word-bank.js`, `node scripts/test-daily-word-bank.js`, and `git diff --check origin/main...HEAD`.
dev merge: Completed — GitHub `dev` fast-forwarded to `c793bac`.
main merge: Completed — `735c106 merge: release editable daily word bank`.
GitHub push: Completed — origin/main advanced from 9e3645e to 5f05c94.
Next owner: Manager
```

## 2026-09-02 — Grade 3 sentence-learning candidate

```text
Task: Add an optional, backwards-compatible sentence and linked group-word field to the character data model; show it in the character-learning page; give every current Grade 3 Upper character a sentence; and add reproducible data validation.
Acceptance criteria: Every non-comment character entry in 生字数据.txt has a sentence linked to its first group word; each sentence contains that linked word; legacy textbook files remain parseable; the learning page renders the linked group word and “造句”; verification is reproducible.
Developer branch: feature/third-grade-pdf-sentences
Developer worktree: /root/Documents/Codex/2026-09-02/https-github-com-ico0018-hanzi-garden/worktrees/third-grade-pdf-sentences
Developer state: Done — QA-001 corrected: all 250 sentences are individually authored natural-context uses of their linked first group word; the former automatic metadata-population tool was removed.
QA result: PASS for the exact feature candidate `8e9073fea6dd266d444b19e4cf73836d2b72a373`; the user accepted the disclosed PDF-source and browser-runtime limitations for this release.
QA evidence / defects: Independent QA verified 250/250 linked unique contextual sentences and 600 legacy entries; parser, source-preservation, escaping, diff, and validator self-test checks passed. PDF source replacement and browser DOM/three-viewport evidence remain known gaps: neither a PDF nor Node/Chromium/agent-browser was available. The user explicitly accepted the current candidate rather than asserting that the PDF curriculum replacement is done; full evidence is in `.agents/QA.md` in the Manager worktree.
dev merge: Completed locally — fast-forwarded `dev` from `7eb22aa` to `8e9073f`; release checks passed, remote push pending
Preview: Static HTTP probe passed — `index.html`, scripts, styles and the current Grade 3 data file returned HTTP 200; browser runtime not available in this environment
Human acceptance: Approved — user said “验收pass，合并到main吧”, 2026-09-02
Next owner: Manager — push `dev`, fast-forward `main` through a clean release worktree, then push without force
```

## 2026-08-19 Production release authorization

```text
Release scope: QA-passed multi-book curriculum support, audio/dictation fixes, and persistent switch-book navigation from dev.
Human acceptance: Approved — user said “合并到main并推送github”, 2026-08-19.
Rollback branch: backup/2026-08-19-pre-main-release at 60c04e5.
main merge: Completed — c62b93d merge: release dev to production.
Verification: node --check app.js, node --check welcome.js, node --check book-catalog.js, and git diff --check origin/main...HEAD passed.
GitHub push: Completed — origin/main advanced from 60c04e5 to dd77082.
Next owner: Manager
```

## 2026-08-19 Switch-book navigation integration

```text
Task: Add a persistent header-level “← 切换教材” control to the multi-book learning page.
Developer branch: feature/add-multi-grade-data
Developer commit: 7a5572c feat: add switch-book navigation
QA result: PASS
QA evidence / defects: Exact commit `7a5572c1e5a8033786adc10c03fda199c113737c` passed `node --check app.js` and `git diff --check 7a5572c^ 7a5572c`; static QA confirmed a persistent pre-tab header control, `welcome.html` navigation only, no storage mutation, and <=640px responsive layout.
dev merge: Completed — `e720efb merge: add switch-book navigation`
Preview: Not requested
Human acceptance: Waiting
Next owner: User
```

## 2026-08-19 Multi-book global navigation addition

```text
Task: Add a persistent, header-level “← 切换教材” control to the multi-book learning page.
Acceptance criteria:
- `index.html?book=1-upper`, `2-upper`, `3-upper`, and `4-upper` each show the control at the upper left in the app header.
- The control is visible in both 生字学习 and 每日听写, returns to `welcome.html`, and makes no localStorage or progress mutation.
- Desktop, iPad, and narrow mobile layouts keep the title unobstructed.
Developer branch: feature/add-multi-grade-data
Developer worktree: F:\chinese webapp\.worktrees\add-multi-grade-data
Developer state: Done - header-level switch-book control implemented; no commit created.
QA result: PASS
QA evidence / defects: Independent QA on the uncommitted `feature/add-multi-grade-data` candidate: `node --check app.js` and `git diff --check` passed. The `switch-book-button` is in the static App Shell header before `#app-tabs`, so it remains present for both learning and dictation views. Its click handler only sets `window.location.href = "welcome.html"`; the handler contains no storage mutation. At <=640px `.topbar-left` becomes a left-aligned column with an 8px gap, preserving the title. Static assertions passed for all of these conditions. Browser interaction was not run.
dev merge: Not allowed — awaiting QA PASS
Next owner: QA
```

## 2026-08-19 Multi-book dataset integration

```text
Task: Integrate user-provided Grade 1, Grade 2 and Grade 4 character datasets and complete multi-book loading.
Developer branch: feature/add-multi-grade-data
Developer worktree: F:\chinese webapp\.worktrees\add-multi-grade-data
Developer state: Done — `a56c6d4 feat: add multi-grade book datasets`
QA result: PASS
QA evidence / defects: Independent QA verified exact `a30251b` / `a56c6d4`: syntax and diff checks, catalog availability, script load order, URL propagation, fail-closed invalid selection, original-data preservation, parser counts, and book-scoped practice/dictation keys all passed.
dev merge: Completed — `1e2dd42 merge: add multi-grade book datasets`
Next owner: Manager
```

## 2026-08-19 Audio fallback and write-before-review

```text
Task: Fix audio fallback and enforce write-before-review daily dictation.
Developer branch: feature/fix-audio-dictation-flow
Developer worktree: F:\chinese webapp\.worktrees\fix-audio-dictation-flow
Developer state: Done — `ad0ec06 fix: fallback audio and require dictation writing`
QA result: PASS
QA evidence / defects: Independent QA passed exact `a983df0` / `ad0ec06`: syntax and diff checks; mocked error, rejected play, synchronous throw, and timeout each produced one TTS fallback; human `onplaying` suppressed fallback; the daily flow has no manual bypass, gates assessment on every HanziWriter completion, and fails closed without HanziWriter. Browser/iPad interaction remains unexecuted.
dev merge: Completed — `0bb73cb merge: fix audio and dictation flow`
Next owner: Manager
```

| Field | Current state |
| --- | --- |
| Last updated | 2026-08-17 — Daily Dictation commit 7954325 integrated into dev after QA PASS |
| Manager | Active — daily dictation preview coordination |
| Developer | Done — daily dictation feature integrated |
| QA | PASS — commit 7954325 |
| Current task | Daily Dictation first — legacy-aligned flow; memory redesign deferred |
| Branch | `dev` |
| Worktree | Integration: `F:\chinese webapp\.worktrees\daily-dictation-dev` |
| QA status | PASS — 15-item persisted queue, reveal control, listening, Tianzige and manual self-assessment verified |
| Preview status | Not requested / not verified — dev contains 7954325 |
| Human acceptance | Waiting — main release forbidden without explicit approval |

## 2026-08-17 Daily dictation handoff

```text
Task: Complete the old-version-style daily dictation flow before any memory/spacing redesign.
Acceptance criteria: Daily queue is capped at 15; each prompt has a listen action; pinyin and word answer are hidden until the learner chooses to reveal them; each word character has a Tianzige handwriting area; learner manually marks “我会写 / 我不会写” after writing; queue and result persist locally. Memory/spacing redesign is out of scope.
Developer branch: feature/dictation-interaction
Developer worktree: F:\chinese webapp\.worktrees\dictation-interaction
Developer state: Done — `7954325 feat: align daily dictation flow`
QA result: PASS
QA evidence / defects: `node --check app.js` and `git diff 7954325^ 7954325 --check` passed. QA confirmed queue cap/persistence, hidden pinyin and answer, listen control, Tianzige/HanziWriter targets, manual self-assessment and next-item progression.
dev merge: Completed — fast-forwarded to `7954325`
Preview: Not requested
Human acceptance: Waiting
Next owner: Manager
```

## 2026-08-18 Welcome start-button repair

```text
Task: Repair the welcome-page “开始学习” control reported as unresponsive.
Acceptance criteria: Clicking the default Grade 3 Upper start control must enter `index.html?book=3-upper`, including when the external welcome script does not execute; normal welcome-script behavior remains intact.
Developer branch: feature/start-learning-button-fix
Developer worktree: F:\chinese webapp\.worktrees\start-learning-button-fix
Developer state: Done — `427ff63 fix: make welcome start control navigate reliably`
QA result: PASS
QA evidence / defects: QA independently verified exact `427ff63`: clean worktree, `node --check welcome.js`, `node --check app.js`, and `git diff 427ff63^ 427ff63 --check` pass; a DOM-stub test confirmed the fallback invokes `window.location.assign('index.html?book=3-upper')`, preserving the only enabled Grade 3 Upper selection.
dev merge: Completed — merged as `e633745 merge: repair welcome start control`
Preview: Ready locally — http://127.0.0.1:4173/welcome.html (HTTP 200)
Human acceptance: Waiting
Next owner: User
```

## Required task record

`
Task:
Acceptance criteria:
Developer branch: feature/<task>
Developer worktree:
Developer state: Running | Waiting | Blocked | Done
QA result: Waiting | PASS | FAIL | BLOCKED
QA evidence / defects:
dev merge: Not allowed | Ready | Completed
Preview: Not requested | Deploying | Ready — <URL>
Human acceptance: Waiting | Approved — <exact user words and timestamp>
Next owner:
`

## Previous status preserved for context

# Delivery Status

> Update this dashboard at every material state change and handoff.

| Field | Current state |
| --- | --- |
| Last updated | 2026-08-16 — direct-to-main push requested; backup pending |
| Manager | ACTIVE — create rollback branch then push current feature to `main` |
| Developer | READY FOR QA — implementation completed on `feature/dictation-spaced-repetition` |
| QA | WAITING — interaction validation pending after main push |
| Current task | Add a 15-word/day manual-marking dictation trainer with spaced repetition |
| Branch | `feature/dictation-spaced-repetition` |
| Working tree | Policy update awaiting commit at inspection time |
| QA status | NOT STARTED — syntax and diff checks passed; interaction validation pending |
| Preview status | NOT REQUESTED / NOT VERIFIED |
| Human acceptance | NOT REQUIRED for the user-approved direct-to-main workflow |

## Active task template

```text
Task: Add an independent Dictation tab.
Scope: Draw only from existing lesson vocabulary in lesson order; offer exactly 15 items per day; require a manual "can write" or "cannot write" mark for each item; persist progress locally; schedule repeats by an Ebbinghaus-style interval plan.
Acceptance criteria: New words begin with lesson 1 in order; a "cannot write" mark makes the item eligible again tomorrow; a "can write" mark increases its review interval; no automatic correctness marking; daily queue never exceeds 15 items; existing learning tab remains available.
Developer branch: feature/dictation-spaced-repetition
Developer state: READY FOR QA
QA result: NOT STARTED
QA evidence / defects: `node --check app.js` and `git diff --check` passed. Interactive browser verification is pending.
dev merge: NOT REQUIRED for the user-approved direct-to-main workflow
Preview: NOT REQUESTED
Human acceptance: WAITING
Next owner: Developer
```
## 2026-10-08 — Unified user system tool sync
Task: Integrate account/profile scoped cloud learning data without changing learning rules.
Developer branch: feature/unified-user-system
Developer worktree: F:/taskHelper/unified/hanzi (separate checkout; sole Developer)
Developer state: Running — storage inventory complete, implementing durable optimistic sync.
QA result: Waiting
Preview: Tencent isolated preview requested; production and DNS forbidden.
Human acceptance: Waiting; do not merge main.
Next owner: Developer / Manager

## 2026-10-08 — Unified user sync handoff
Developer state: Done — static account UI, isolated per-user/profile caches, durable outbox, optimistic conflict and export/recovery handling implemented; old guest keys retained.
Tests: 10 tool cloud regressions PASS; existing daily word-bank test PASS; app/cloud/ui syntax and diff checks PASS. Cross-tool independent QA 27 PASS.
QA result: Waiting — exact feature commit pending independent API/browser review.
dev/main merge: Not allowed; user requested Tencent branch preview and owner review before main.
Next owner: QA / Manager.

2026-10-08 follow-up: canonical payload comparison handles PostgreSQL JSONB key ordering without false dirty/conflict; accounts without child do not reload on every focus. New regression cases PASS.

2026-10-08 follow-up: local storage quota failures now explicitly report not saved/not synced; last readable payload is retained. Cloud regression remains 10 PASS per tool.

## 2026-10-08 — Unified accounts and cloud sync: Manager final local gate

Task: Connect existing static Hanzi learning records to the shared parent/child API, preserve guest history and original curriculum, and prepare only isolated Tencent branch deployment.
Developer worktree: F:/taskHelper/unified/hanzi
Developer branch: feature/unified-user-system
Developer state: Done; business commit 94fe0ff29bb1fbc658a4ad94a9d231bd6e16bd7d.
QA result: LOCAL IMPLEMENTATION PASS. Original word-bank and syntax tests; cloud10; independent three-adapter sync30; real PostgreSQL/API integration and browser account/child/offline/multi-device checks pass. Main QA report is recorded in portal docs/unified-qa.md.
Draft PR: https://github.com/ico0018/hanzi_garden/pull/4 (base dev).
dev merge: Not performed; draft review only.
Preview: Current local localhost8321 available. Tencent deployment NOT VERIFIED; awaiting current user SSH-credential reuse authorization after auto-review rejection. COS/SMTP and deployed HTTPS remain pending.
Human acceptance: Waiting; main merge and production release forbidden.
Next owner: Manager — finish authorized isolated deployment after credential confirmation; user then checks actual cloud environment.

## 2026-10-08 — Tencent isolated owner-review gate

Manager state: Done — feature branch deployed to Tencent Guangzhou, /srv/xuebabangbang-unified-preview with rootless Docker and loopback Nginx; original production services and content unchanged.
QA result: Deployed cloud account/security, three tools, child isolation, offline recovery, second-browser restore, authenticated account/admin mobile layouts PASS. Database restart and fresh restore match all11 table hashes; cloud-backup-server-results evidence recorded in portal/docs/evidence.
Preview: http://localhost:8321/ through fixed-host-key SSH tunnel; account8320, guwen8322, taskhelper8323; local private mail helper8324.
External gates: COS missing bucket/role, real SMTP and production-domain HTTPS/filing unverified; timer explicitly local-only and ubuntu.
Human acceptance: WAITING — READY FOR OWNER REVIEW; main/dev merge not performed, DNS NOT CHANGED.
Next owner: User — manual check; Manager handles requested fixes, no production action without separate authorization.

## 2026-10-08 — Parent controls simplification (active)
Task: Chinese arithmetic three-choice parent gate; move sync/import/export to parent pages; remove repeated password and 15-minute lock.
Acceptance: Server checks arithmetic for signed-in sessions, same login retains parent access; student UI hides record tools; preserve account/admin authentication and learning data isolation.
Developer branch: feature/unified-user-system in all four repositories.
Developer worktrees: accounts sole owner F:/taskHelper/unified/portal; tool_sync sole owner F:/taskHelper/unified/taskhelper, hanzi, guwen. Separate existing feature checkouts; no overlapping business-file writers.
QA: qa independently verifies exact candidate; Manager coordinates/deploys only after PASS.
Safe plan: Existing trees clean at intake; preserve all prior changes. No merges, production/DNS changes. Tencent isolated preview only.
Human acceptance: Waiting. Next owner: Developers / QA.


## 2026-10-08 — Parent controls simplification: Developer handoff
Developer worktrees: Sole editor of taskhelper/hanzi/guwen feature/unified-user-system checkouts; no curriculum edits.
Developer state: Implemented Chinese multiplication question with three numeric choices. Signed mode uses server parentReady for the whole current login; guest uses tab-scoped sessionStorage and explicit parent exit. Password/PIN setup and 15-minute timer removed. Task records inside /parent/ gate; Hanzi/Guwen parent.html on original origin. Student pages show only parent entry and learning content; automatic cloud sync still runs.
Tests: Task40 core/parent PASS; each tool11 cloud regressions PASS; each static tool4 parent UI regressions PASS. Final lint/typecheck/build and exact candidate QA follow.
Safety: No push/deploy/merge/DNS/production actions; original guest records, caches and recovery copies retained. Explicit parent-lock/logout clears grant.
Next owner: QA / Manager — inspect exact feature heads and only update isolated Tencent preview after PASS.

Final developer checks: Task40 tests/lint/typecheck/webpack build PASS; each cloud11 and static parent UI4 PASS; Hanzi original word-bank PASS; Guwen original Node20 and Python27 PASS. Feature candidates ready for independent QA, no release performed.

Parent UI follow-up: wrong/expired server challenge400 and rate-limit429 display friendly Chinese; no changes to authentication or learning rules. Targeted tests updated.

## 2026-10-08 — Parent simplification final isolated gate
Business source ffaa0b705497b2371889f5a3783c7bc5aa5dc77f; later status-only commit. Sole tool_sync Developer handed off final source, no overlap.
QA: PASS — independent local/API and deployed375/768/1440 browser. Student record management hidden, parent same-origin import/conflict export/restore works, one current-login arithmetic grant reused, task/child data isolated, no browser errors. Full report portal/docs/unified-parent-qa.md.
Preview: Deployed Tencent existing isolated rootless/ubuntu/loopback environment. Original production and existing data unchanged. No database migration.
Manager: Feature branches saved; no dev/main merges or DNS changes.
Human acceptance: WAITING — ready for manual inspection, no release authorized.
Next owner: User.

## 2026-10-08 — Central parent record controls (active follow-up)
Task: Remove every parent entry from Hanzi/Guwen student pages; put both tools' local import/backup/recovery controls directly on the central parent page.
Confirmed user preference: Taskhelper /parent/ is the central parent page; portal business changes unnecessary.
Developer tool_sync sole writer static Hanzi/Guwen and taskhelper existing feature/unified-user-system checkouts; accounts read-only portal preparation if preference changes. QA independently verifies exact candidate.
Safe plan: Four trees clean at intake; preserve existing auth/math/learning data, no unrelated refactors. UI embedding must keep records at each tool's own origin, no cross-origin storage access or arbitrary postMessage data operations.
Release: Only existing Tencent isolated preview; no main/dev merges, DNS/production changes.
Next owner: Developer / QA; human acceptance waiting.

## 2026-10-08 — Central parent controls: isolated deployment handoff

User confirmed Taskhelper /parent/ placement. Exact final business sources Task9e9c98b, Hanzi5af7888, Guwend9fcc04 passed independent local13 and applicable Developer checks. Manager deployed static-only archive plus two exact preview CSP locations, EXIT0. Database content and app image unchanged, production homepage unchanged, no migrations or new public ports. Deployment evidence unified/qa/central-release-results.json.
QA is now running actual cloud browser record/import/cancel/conflict/child/gate checks. Human readiness stays PENDING cloud browser PASS; no main/dev merges or production release. Manager-owned STATUS remains the only unstaged Hanzi file, intentionally preserved for final documentation commit.
Next owner: QA / Manager.
## 2026-10-08 — Central parent record controls: final isolated gate

User confirmed Taskhelper /parent/ as central parent page. All Hanzi/Guwen learning pages now have no parent entry or record-management DOM. Both same-origin record widgets are directly visible under the existing Task parent gate; one child selector and exit, no repeated password/math or fifteen-minute lock. Original guest data, account/child isolation and background sync preserved.

Business sources: Task9e9c98bbb8f9059a471451116cbbed86985dc08b / Hanzi5af788877c523fa2b0e563ae171845aee3fce3f9 / Guwend9fcc04e721ff89e1333cea3915e89e270c965fb. Portal business81abd4a89b9f37295c7e8c5c3aa64940b8a5eb61/image unchanged; portal ops/docs-only changes and later Hanzi Manager docs separately saved.

PASS: independent13 local cases; Task43 + cloud11 + lint/typecheck/final static build; both staticUI8/cloud11/syntax and original curriculum checks. Independent actual cloud browser375/768/1440: student removal, real two widgets, inline import cancellation/confirmation, backups/conflict recovery, child isolation, one mode exit, signed/forged activation rejected. Report portal/docs/unified-parent-central-qa.md and evidence parent-central-controls-*.json.

Only /srv/xuebabangbang-unified-preview updated, static-only and two exact preview CSP locations. No database migration/container restart; original business data SHA 5ed4a9b04bdbf33caba9bfe130c5b5f0791d1e10edbd79093baad07553cd1e26 unchanged, appimage sha256:60c4365bf757b85fd55c382164f5338bda5f3d02f26c0a873a711664371b60f0 unchanged, productionhomepage SHA 05c355b6bf439819fc155d2508da24451bd96ddb1f8a7f4d18f2b074c4de84c5 unchanged. Backup backups/preview-20261008T095858Z-21637.dump, original static/Nginx rollback private parent-central-review/rollback. Rootless Docker/ubuntu/loopback/SSH retained; no new public ports, main/dev/DNS/production unchanged.

Manual entry http://localhost:8323/parent/ with existing SSH connection; student8321/8322 can inspect entry removal. All Draft PRs stay unmerged. SMTP/COS still unconfigured, no new claim. STOP for manual owner acceptance; no production action or merge without explicit approval.

Safe commit plan: Developer business files already committed and independently validated at above heads; Manager commits only owned STATUS/DECISIONS and portal docs/evidence, stages exact paths, excludes private runtime and secrets. No merges or resets, later documentation heads do not change deployed business artifacts.
Next owner: User — manual acceptance.
