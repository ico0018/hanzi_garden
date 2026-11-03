# Delivery Status

> Read before work. Every Agent updates this dashboard at start, block, and handoff.

## Current snapshot

## 2026-11-03 — Rolling 30-word notebook dev delivery

- Manager delivery: Corrected user-requested automatic notebook flow merged via PR #7 https://github.com/ico0018/hanzi_garden/pull/7 into dev as d547f5d114a58d845feba7ca0bbabdff9406c93a. Shared-source dedicated entry: https://hanzi-garden-git-dev-ico0018s-projects.vercel.app/index.html?view=mistakes .
- Exact-content QA: Connector feature 9c1ff3454758a7a2880bcd8c0d6d25a83839eaa3 and dev merge both have tree ec07bf60e6be70c406590df12e7d7479b89281ae, exactly matching tested local QA/report HEAD 7ad4624371544bcb793909a06fdbe0ff564ef232. Independent QA confirmed remote identity PASS. App/source content unchanged by this delivery record.
- Behavior verified: Automatic due-first/new rounds of 30 (70 -> 30/30/10), wrong -> next local calendar day/reset, correct -> 2/4/7/15/30/60 days, persisted active queue/results across reload/midnight, old completed day rolls into available work, v1 migration, source reorder/removal, unavailable storage memory fallback, handwriting/manual/stale gates, independent direct URL with failed/invalid textbook-safe navigation. Six focused/regression suites, independent controller/scheduler/index DOM tests, Shanghai/New York DST/calendar checks, syntax/diff and all new HTTP assets PASS.
- Preview: Vercel reports successful feature and dev deployment; dev dashboard https://vercel.com/ico0018s-projects/hanzi-garden/3mJ4tWVR4QuyXVtU8DLVRtxzXCKi . Existing Vercel sign-in protection remains. Actual browser/touch/stroke-data/audio playback remain unverified.
- External check: Cloudflare Workers Builds still failed on this feature candidate; Vercel and GitGuardian passed. No Cloudflare diagnosis or configuration change is claimed in this feature correction.
- Source / release: 错词.txt still has only comments, no personal words supplied. Root main remains production and was not changed; draft PR #6 now tracks this corrected automatic-round scope and awaits an explicit production decision. Next owner: User/Manager for actual source words and preview review.


## 2026-11-03 — User-corrected rolling 30-word mistake dictation

- Independent QA: PASS on exact implementation `f22061235ed71f7688bd87bff8113e34ca0bd49d`; tested HEAD `d49edbcce0e85d1dc76281d639703003d4b2a5af` differs only in STATUS. Independent controlled-clock scheduler and LinkeDOM controller/app tests verify 70→30/30/10, due backlog/order, same-day/future exclusion, persistent partial/midnight/source-edited rounds, v1 migration, local calendar/DST edges, intervals/reset, new-day auto-entry, full-word/manual and stale-callback gates, independent direct route despite curriculum errors, and isolated daily records. Six relevant repository suites, three JS syntax checks and diff check PASS. Evidence: `.agents/QA-mistake-rolling-30.md`.
- QA limits/handoff: Native controls, responsive CSS, hidden states and focus reviewed in source; real rendered viewports, pen/touch, external glyph loads and audible output remain unverified because no usable browser binary is available. No implementation defect found; source still comment-only. QA did not merge/push/deploy. Next owner Manager for exact-tree GitHub publication and feature -> dev integration; production authorization absent.

- User clarified: Needs a daily-dictation-style page loading 错词.txt, automatic rounds of 30 words, wrong words added to memory scheduling and rolling future dictation. This supersedes manual word-selection-first notebook as the main workflow. Cloudflare investigation is not a blocker for implementing the corrected feature.
- Manager acceptance: Dedicated directly linkable notebook view, default straight into automatic listening/writing flow; fixed maximum 30 unique eligible words per round (actual smaller count when insufficient), due reviews first (oldest due, source-order tie), then never-reviewed source words in order. Complete a round then continue to next available round the same day; never repeat a word reviewed today just to fill 30 or pull future-due words forward. When no eligible words remain, show next review date. Wrong -> next calendar day and reset streak; consecutive correct -> 2/4/7/15/30/60 days (reuse existing daily policy).
- Persistence: Separate stable word-keyed notebook scheduling and persistent active-round queue/results across reload, tab switches and calendar boundaries. Resume uncompleted round safely; preserve completed results and migrate old v1 known/unknown notebook records using their dates. Retain pronunciation and optional review list; remove need to select words before normal dictation. Handwriting completion for every glyph remains mandatory before child self-assessment. No daily queue/storage/schema changes.
- Safe plan: Clean isolated worktree /workspace/scratch/f53abdb3de03/hanzi_mistake_rolling, feature/mistake-rolling-30, from latest dev b4321168dd0dc0bbc932f98e391e88dba9c58e70. Earlier worktrees preserved. GitHub connector will publish exact validated tree because local git push has no credentials. No production release authorization.
- State: Developer complete — exact implementation f22061235ed71f7688bd87bff8113e34ca0bd49d on feature/mistake-rolling-30. Independent QA waiting before dev integration; no merge/push. Code frozen for QA; this handoff modifies STATUS only.
- Implemented: Direct validated index.html?view=mistakes opens notebook immediately without textbook prerequisites. Background curriculum loading/failure/invalid book leaves notebook usable; unavailable learning/daily tabs show honest loading/error states with return tabs. No selection step; automatic due-first/new-second rounds max30, next eligible same-day rounds, actual small counts and next-review date, no repeated-today/future-due filler. Optional reading list remains.
- Persistence: New notebook-only atomic v2 document stores word-keyed interval progress and full active round/results. Wrong resets/returns next calendar day; known follows2/4/7/15/30/60-day intervals. v1 migration converts timestamps using browser-local dates without deleting old records. Incomplete old round resumes across reload/date/source reorder; removed source words are skipped without false marks, stored full round retained until replacement. Completed earlier-day round automatically rolls forward on entry when eligible; just-finished round still shows summary. Memory-authoritative storage-failure fallback preserves this visit's successive rounds and warns about persistence.
- Developer verification: node --check app.js/mistake-notebook.js/mistake-scheduler.js; test-mistake-scheduler.js, test-mistake-notebook.js, test-mistake-page.js, original test-daily-dictation-size.js/test-dictation-count.js/test-daily-word-bank.js and git diff --check PASS. Tests cover70=>30/30/10,35 due backlog priority, v1 local dates, interval resets/cap, leap/month/year boundaries, persisted midnight results, source reorder/removal, automatic old-completed entry rollover, direct invalid-book/blocked-curriculum route with safe navigation, handwriting/stale callbacks, empty/fetch/tool/glyph/storage errors. Existing daily queue/progress functions and all source data unchanged; 错词.txt remains the instruction-only starter.
- Limits: VM DOM/event tests, not live browser pen/audio/render validation; Chromium remains unavailable. No Cloudflare/deployment configuration changed. Next owner: Independent QA on exact implementation, then Manager for protected preview integration.

## 2026-11-03 — Continued deployment investigation

- User said “继续”; continue diagnosis and review preparation only, not production release. Draft dev -> main PR #6 prepared: https://github.com/ico0018/hanzi_garden/pull/6 . main is unchanged.
- Rechecked remote dev 2c4a8676efa4bcd9816d3f734c60e9ba71a6f91b: Vercel success; Cloudflare Workers Builds failure f990d8ec-4b63-4063-a92b-7d6b71942f03 persists. GitHub check output has no error text, no annotations; Actions collection has zero runs. The GitHub connector rejects direct check-run/annotation endpoints and does not expose Cloudflare build logs; no Cloudflare tool or plugin-discovery capability is callable in this session.
- No speculative infrastructure/configuration changes made. No new code change or test rerun was needed: validated feature content is unchanged. Actual source still comment-only 错词.txt.
- Blocked input: Cloudflare build log (last error section) from https://dash.cloudflare.com/e966a8b149982fffb8abdf4dd660f15d/workers/services/view/hanzi-garden/production/builds/f990d8ec-4b63-4063-a92b-7d6b71942f03 . Need actual words to populate notebook and explicit production approval before release.


## 2026-11-03 — Mistake notebook dev integration and preview

- Manager delivery: PR #5 https://github.com/ico0018/hanzi_garden/pull/5 merged feature/mistake-notebook into dev as 012d749226ac9e56e0f187feb08be5b14f9d943f. main remains d48ae830458e011e7027f3be98de75d59449eef4; no production authorization for this scope.
- QA equivalence: Authenticated connector candidate 6765b809a5b154da7ec09976f04ba8a5542cd59e and dev merge have full tree ce92c5ec20f0fb38df0fc25fbeca9028109d1d12, exactly matching independently tested local QA/report HEAD 55fa02469063d9daf2bbad321a1d0b612fc30e88. Independent QA confirmed remote equivalence PASS. Initial local git push failed for missing HTTPS credentials and changed no remote refs; connector publication preserved exact tree contents.
- Validation: Notebook independent controller and index/app DOM integration PASS; original three daily suites, syntax/diff and static HTTP resources PASS. Actual browser/touch/audio unverified (Chromium download unusable).
- Preview: Vercel reports successful feature and dev deployments. Feature preview https://hanzi-garden-git-feature-mistake-notebook-ico0018s-projects.vercel.app ; HTTP smoke reaches Vercel sign-in, so authenticated live UI not verified. dev deployment dashboard https://vercel.com/ico0018s-projects/hanzi-garden/5rz39x5y4PhuTFMjPQKuPu2FLxFo .
- External check: Cloudflare Workers Builds failed on feature candidate (build 5c2e66fa-edc3-4af8-b1b4-861410884f4a); GitHub check provides no error text or annotations. Cause unresolved; do not represent deployment checks as all passing. Vercel preview and GitGuardian passed. No Cloudflare settings changed.
- Source: 错词.txt is an instruction-only starter; parent must add actual words one per line and deploy the updated file before the child has a populated list.
- Next owner: User / Manager for preview acceptance, actual word source, real-device handwriting/audio verification, Cloudflare build log inspection and any explicit production-release decision.


## 2026-11-03 — Mistake-word notebook

- Independent QA: PASS on exact implementation `65d77e55131c5c6bee99f5317dcfea2ad7b72c69`; tested HEAD `6c8034ba9a7ff66592a2eb52f6246f631ec0a5e9` differs only in STATUS. Independent notebook VM/DOM and actual index/app LinkeDOM integration checks passed, as did focused notebook tests, all three relevant daily regressions, JS syntax and diff checks. Complete evidence: `.agents/QA-mistake-notebook.md`.
- QA limits: Desktop/tablet/mobile responsive CSS and native keyboard controls reviewed in source; real browser layout, pen strokes, remote glyph data and audible playback were not exercised because Chromium installation returned truncated downloads. Simulated callbacks verify the all-character/manual gate, stale-callback protection, retry and isolated storage. No implementation defect found. QA did not merge/push/deploy; next owner Manager for feature -> dev integration and preview. Production approval remains absent.

- Manager scope: Add an independent 错词本 tab loading root 错词.txt, a review list with pronunciation and word selection, and selected-word dictation reusing existing speech and handwriting/self-assessment behavior. Keep textbook learning and daily scheduling intact.
- Safe plan: Fresh clone at /workspace/scratch/f53abdb3de03/hanzi_garden is clean at d48ae830458e011e7027f3be98de75d59449eef4. Isolated Developer worktree /workspace/scratch/f53abdb3de03/hanzi_mistake_notebook, branch feature/mistake-notebook; no user-owned local checkout touched. DevSpace has two indistinguishable connections and no selection was supplied, so use the specified GitHub repository and isolated clone.
- Source state: 错词.txt is absent from current main/dev; add a UTF-8 comment-only starter rather than invented personal mistakes. One word per line; ignore blank/comment lines and deduplicate in source order. Distinguish empty, missing/error, and loading states with retry.
- Acceptance: List review/individual replay, select all/clear/subset, hidden-answer dictation, repeat/next and completion with retry of unknown words, no assessment before all handwriting targets complete; stable word IDs and separate browser-local notebook results; keyboard and narrow-screen usability; no daily queue/progress changes.
- Workflow: Developer implementation assigned; independent QA required on exact candidate before feature -> dev. No production release approval for this scope.
- State: Developer complete — exact implementation commit 65d77e55131c5c6bee99f5317dcfea2ad7b72c69 on feature/mistake-notebook. Independent QA waiting; no merge/push.
- Implemented: Separate notebook script/view; shared root UTF-8 source with BOM/blank/comment handling, Chinese-only validation and ordered deduplication; native checkbox selection and individual pronunciation; hidden-answer selected-word handwriting, complete-word manual assessment, next word, round totals and unknown-word retry; stable independent results and honest storage warning. Tab/session changes stop notebook playback and cancel/invalidate old writer callbacks. Missing/empty/failing sources and missing tool/glyph data fail visibly with retry; no assessment bypass. Local script failure has a visible refresh message.
- Developer verification: node --check app.js and mistake-notebook.js, scripts/test-mistake-notebook.js, test-daily-dictation-size.js, test-dictation-count.js, test-daily-word-bank.js and git diff --check PASS. Notebook harness runs actual production module and checks parsing/IDs, subset/all/clear, speech/reveal, all-character gate including synthetic premature clicks, isolated results, unknown retry, stale callbacks, empty/fetch/glyph/tool/storage failures. Textbook data and existing daily queue/progress functions unchanged.
- Limitation: DOM/event harness only; Chromium binary unavailable in local Playwright installation. Real-browser layout, touch handwriting and external pronunciation/stroke data remain unverified. Starter source is intentionally empty because no actual personal mistakes were provided.
- Next owner: Independent QA on exact implementation, then Manager. This follow-up changes delivery records only.

## 2026-10-11 — All-book original learning sentences

- Task: Check Grade 1–6 both terms for exactly two existing words and one linked natural sentence per character; fill missing sentences without changing vocabulary, readings, original Grade 3 Upper sentences, dictation banks/IDs, or UI architecture.
- Safe plan: New feature/all-book-sentences at F:\chinese webapp\.worktrees\all-book-sentences from origin/main 84bff58. Preserve dirty root and all prior worktrees. Developer integrates only this tree; another Developer authors Grade 4–6 in separate feature/sentences-grades-4-6, transferred by reviewed commit only.
- Counts corrected by actual runtime parser: 2,500 learning entries (prior 2,600 total was arithmetic error), all exactly two words. Grade 3 Upper has 250 sentences; 2,250 entries need sentences. Low-grade Developer scope: five books / 1,050 entries; Grade 4–6 helper: six books / 1,200 entries.
- Data format: curriculum/sentences/{bookId}.json with bookId, provenance '原创学习例句，非教材原句', and entries keyed by character to {groupWord,text}. Same-book repeated characters may share a sentence linked to an unchanged displayed word.
- Acceptance: Deterministic buildBook sentence overlay; actual-parser full coverage/link tests, unchanged word/reading/original sentence/bank assertions, original age-appropriate contexts and language review, independent QA on exact candidate.
- Existing sentence exception: Manager approved retaining 三上 噢's original natural sentence and its single-character linked field unchanged. It predates the current two usage phrases and does not contain either; all 2,250 new sentences strictly link one displayed word. This unique preserved legacy case does not waive new-sentence quality or change words/readings.
- State: Integrated all 11 new sentence JSONs; Grade 4–6 helper commit 7bab1c1 transferred as d01a1ed without editing its worktree. All 2,250 new example records have completed full-language pre-review; requested collocation/sense fixes applied. Three-upper's 250 original sentences preserved. Full actual-parser/baseline comparison PASS for 2,500 entries / 5,000 unchanged words/readings and all new linked sentences, with unique preserved 噢 exception. No production approval; no dev/main merge or push.
- Final QA: Independent PASS on exact implementation `6742502c30e61108b442b7ae81cfdab726b88273`. All twelve books contain 2,500 records / 5,000 unchanged words/readings, 2,250 new original sentences plus 250 preserved Grade 3 Upper sentences. All new sentence language pre-review revisions verified; unique original 噢 link exception preserved as approved.
- Evidence: Eight test suites, two deterministic generators, syntax/diff checks PASS. Independent raw-line field comparison against baseline confirmed every character/word/reading field unchanged. Real app parser and renderDetail exercised all 2,500 HTML outputs, each with one sentence card; local pages and all twelve TXT requests returned HTTP 200. Baseline audit with matching per-book SHA256 word/reading fingerprints remains curriculum/sentences/baseline-audit.json.
- Local review: http://127.0.0.1:4181/welcome.html . Rendering checks used DOM stubs, not a real browser; live browser handwriting interaction was not newly tested. Old textbook edition/lesson alignment gaps and incomplete/unconfigured dictation word banks are outside this sentence-only scope and remain unchanged.
- Release gate: User explicitly said “发布” on 2026-10-11, authorizing production release of this sentence scope after independent QA PASS on exact implementation `6742502c30e61108b442b7ae81cfdab726b88273`. This documentation-only follow-up does not alter tested implementation. Developer has not merged, pushed or deployed.
- Manager release safety plan: Fetch confirmed remote main/dev both at `84bff5834a1f5eba4f05a8a8f96bb0850d0680cf`, with no concurrent remote changes; main-local is clean. Preserve every other worktree and do not reset old local dev. Fast-forward push feature/all-book-sentences to remote dev, create `backup/2026-10-11-before-sentence-release` at 84bff58 in main-local, then fast-forward main-local to the same candidate and push main. Vercel automatic deployment follows; Manager alone executes and verifies the release.
- Next owner: Manager — execute the explicitly approved release plan and verify production assets; existing QA/browser/source limitations remain unchanged.

## 2026-10-11 — Grades 4–6 original learning sentences

- Manager-assigned task: Author natural, age-appropriate learning examples for every missing-sentence character in Grade 4, 5 and 6, both terms (250/250/220/180/180/120 = 1200 entries).
- Developer branch/worktree: feature/sentences-grades-4-6, F:\chinese webapp\.worktrees\sentences-grades-4-6, clean isolated base origin/main 84bff58. Parent's dirty primary and other feature worktrees preserved.
- Scope: Only six curriculum/sentences/{bookId}.json files plus this isolated delivery record. Shared integration worktree is read-only. Each entry is {groupWord,text}, uses one current displayed word, and clearly states original learning example, not textbook quotation. Existing character/word/pinyin data unchanged.
- Developer state: All six original sentence files authored (250/250/220/180/180/120 = 1200). Author individually reviewed every written sentence; same natural sentence may be reused for the same existing group word. No generic teaching/metalinguistic filler, no word/pinyin/source changes.
- Structural verification: Scratch validator independently reads all six final JSON files and all six current learning sources; exact character sets/counts, displayed group-word membership, sentence includes character/group word, provenance, and sentence punctuation PASS. This structural result is not a substitute for language QA.
- Independent language pre-review: QA read every entry in all six books (1200 total); reported collocation/style corrections have been applied, including six-lower's actual 元宵/遥控 usage and explicit deceased-animal 埋葬 context. Full integration QA and release permission remain separate; no merge or push.
- Next owner: Manager's integration Developer for scoped commit integration and final tests, then independent QA on the exact integrated commit.

## 2026-10-10 — Authorized twelve-book production integration

- Human release authorization: User explicitly said “合并到main，发布”. Manager owns final main/dev integration and push; Developer must not push or merge production branches.
- Safe plan: Manager confirmed main-local and daily-dictation-dev clean; preserve all unrelated dirty worktrees. New isolated feature/release-twelve-books at F:\chinese webapp\.worktrees\release-twelve-books starts from origin/dev e9c7bdf (origin/main 0e776d1); integrate reviewed feature c92dd48, retaining newer README and existing daily-count design while meeting per-book and compatible-queue requirements.
- Developer: Integrated; prior grades-4-6 candidate remains untouched. Conflict resolution retains latest production accessible 10/20/30 buttons, keyboard focus restoration and queue algorithm; shares those controls with unconfigured books and adds honest bank/source notes. Preserves latest README with only current book/bank facts updated. App/CSS cache versions bumped. Original source artifacts unchanged.
- Acceptance: Run both daily-count suites, twelve-book 2600/5200 parser/scope/word review, source-bank regressions, generation reproduction and syntax checks. Existing source/completeness/browser-handwriting limitations remain disclosed.
- Verification: Both daily-count behavior suites (including unconfigured UI), twelve-book 2600/5200 exact-two/source/parser checks, full vocabulary/context reading regression, Grade 4–6 local loading, all textbook banks and Grade 3 preserved bank, data reproduction, JS syntax and diff checks PASS. Content-reproduction tests now normalize checkout CRLF without weakening content/scope assertions.
- QA: Independent PASS on exact integrated implementation commit `b4dfd7524bfc9cff3cbcc474068870727667b223`; this STATUS-only follow-up does not change tested app/data assets. User production approval remains the explicit words “合并到main，发布”.
- Manager release safety plan: Confirm clean main-local and preserve other worktrees. Local dev 9b4d149 differs from remote dev only by prior history; do not reset it. Fast-forward remote dev (currently e9c7bdf) directly from feature/release-twelve-books; create backup/2026-10-10-before-twelve-book-release at latest remote main 0e776d1, then fast-forward clean main-local to the same approved candidate and push. Manager alone executes main/dev updates and checks Vercel automatic deployment.
- Release: Not yet executed by Developer; no push or main/dev merge. Source gaps, unconfigured Grade 1/2-upper/3-lower dictation banks, incomplete four-lower bank and untested real-browser handwriting remain recorded limitations.
- Next owner: Manager — execute approved release plan and verify deployment.

## 2026-10-09 — Daily dictation count options

```text
Task: Let the learner choose 10, 20 or 30 daily dictation words.
Acceptance criteria: Exactly three accessible choices, default 10 and book-scoped persistent preference; queue respects selected cap, preserves same-day queue/results when resizing, appends due/new items without duplicates; old 15-word queues remain usable; actual queue count is shown when fewer words are eligible; completion copy uses actual count; desktop/tablet/mobile layout works; existing self-assessment and scheduling remain intact.
Developer branch: feature/dictation-count-options
Developer worktree: C:\Users\Administrator\Documents\Codex\2026-10-09\https-github-com-ico0018-hanzi-garden\work\dictation-count-options
Developer state: Done — exact code commit 6f559c3ead74ac43f893508fa541ca436988bb64 on feature/dictation-count-options; feature pushed to origin by Manager.
QA result: PASS — independently tested exact code commit 6f559c3ead74ac43f893508fa541ca436988bb64.
QA evidence / defects: Independent Chrome/Playwright browser scenarios, syntax checks, both behavior tests and diff checks passed. Verified accessible keyboard choices, persistence/book scope, preserved resized/legacy 15 queues/results, due/new ordering, unique bank 28 cap, actual 0/1/10/28 copy, manual writing gate and 2/1-day schedule, and desktop/tablet/mobile layouts. Actual external HanziWriter/pinyin load smoke passed. No defects. Full evidence: .agents/QA-dictation-count-options.md.
dev merge: Completed — QA-passed feature and delivery records integrated; production approval recorded below.
Preview: Ready — dev code deployment 8997bfc succeeded at https://hanzi-garden-15kbalrse-ico0018s-projects.vercel.app ; Vercel login required. Feature preview remote smoke was auth-protected; local UI and external-library smoke PASS.
Human acceptance: Approved — user said “可以上线”, recorded 2026-10-09 21:01 Asia/Shanghai.
Production release: Completed — main merge 6e3d613a979f4987532f31d38a3e7342da094cb6, published main commit 0e776d14d60187ca9c652f487a3dfa28e430dbb3. Vercel Production reports success at https://hanzi-garden-4jdl2qnef-ico0018s-projects.vercel.app . Syntax, both behavior tests and merged diff checks PASS; released app/assets unchanged from independent QA commit. Live browser smoke redirected to Vercel login, so production interactions remain unverified without an authenticated session. Rollback branch backup/2026-10-09-pre-dictation-count-release at bc62e56ea3eb8b9c3e1acfcc5651041fae4aee0a. Final delivery record is on dev to avoid another documentation-only production redeploy.
```


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

## 2026-10-10 — Final three contextual-reading corrections

- Task: QA found 赢得 / 蚂蚱 / 欺负 readings still wrong on cc01a38; Manager assigned only these three corrections.
- Branch/worktree: feature/grades-4-6, F:\chinese webapp\.worktrees\grades-4-6; clean isolated candidate continued; no merge/push.
- Developer state: Corrected to yíng dé / mà zha / qī fu with explicit contextual overrides, actual-runtime regression coverage, and regenerated local learning/support-review exports. All other behavior and word selection unchanged.
- QA: Independent PASS on exact implementation commit `3c7d5a59f70a4f1e2b997ba6d18189d97e488f80`. Earlier failed candidates remain recorded; this documentation-only follow-up does not alter the tested implementation.
- Verification: All twelve books / 2,600 learning records / 5,200 displayed words or marked usage phrases passed actual-parser, exact-two, local scope and reproduction checks. Full support-word review, independent vocabulary spot checks, contextual readings (including final 赢得 / 蚂蚱 / 欺负 corrections), 10/20/30 persistence, mid-day increase/shrink, retained completed results, legacy-15 compatibility, new-day/book isolation, and existing word-bank regressions PASS.
- Local preview: Ready — http://127.0.0.1:4180/welcome.html; human acceptance waiting. No merge, push or deployment.
- Limits: Real-browser handwriting interaction was not tested. Grade 1 Upper/Lower, Grade 2 Upper and Grade 3 Lower have no configured dictation word bank; their selection controls do not imply usable dictation. Grade 4 Lower word table remains incomplete. Lesson mapping / textbook edition alignment still require original textbook pages for verification.
- Next owner: Manager / User — local acceptance, source-page verification and protected release gates.

## 2026-10-10 — QA vocabulary and contextual-reading repair

- Task: Repair QA FAIL on `3b7fd90177bdaf1fa20b0655d91c87b44fde02f1`: default dictionary readings and inappropriate/obscure supplemental words.
- Developer branch/worktree: `feature/grades-4-6`, `F:\chinese webapp\.worktrees\grades-4-6`; clean isolated worktree continued; no merge/push.
- Developer state: Ready for new QA. Vocabulary reviewer inspected all 966 original support-character records / 1,397 original support items; applied 155 reviewed character replacements plus contextual reading/neutral-tone fixes and per-book character headings. Exported actual runtime support usage: 1,399 occurrences / 1,348 distinct words in curriculum/used-vocabulary-review.json. All 2,600 learning entries retain exactly two words/usages.
- QA: FAIL on prior candidate; new candidate pending. Keep curated words and book-specific character readings distinct from contextual word readings; 三下 仿佛 uses fú without globally rewriting 佛像/活佛.
- Verification: Actual twelve-book parser/scope/exact-two/source/sentence checks, full vocabulary review/contextual-reading/child-suitability checks, 10/20/30 resizing and persistence, legacy-15 queue compatibility, textbook-bank and Grade 3 bank regression, reproduction and diff checks PASS. Independent QA remains pending; prior QA FAIL is not erased.
- Limits: Original textbook facsimile/version and faulty lower-term source gaps remain unresolved. Grade 1 banks and Grade 3 Lower bank are not configured; selector visible with an honest no-bank explanation. Four-lower word bank remains partial. No merge/push.
- Next owner: Independent QA on new scoped feature commit.

## 2026-10-10 — Twelve-book curriculum and adjustable dictation

- Task: User requests 10/20/30 daily dictation choices for every grade, exactly two useful words per character, and Grade 1/2/3 lower-term completion.
- Developer branch/worktree: `feature/grades-4-6`, `F:\chinese webapp\.worktrees\grades-4-6`; continue clean isolated worktree; preserve original curriculum files and existing progress IDs. No merge/push.
- Developer state: Done; QA: Waiting for this candidate. New choices default to 10; resizing preserves completed results, the full assigned list, order and review progress; old v4 15-item queues remain compatible.
- Implementation: All twelve books enabled and loaded locally; first/second/third lower scopes 200/250/250. All 2,600 learning entries have exactly two distinct multi-character words or clearly marked natural usage phrases; original TXT files untouched, curated first-word priority retained where valid, Grade 3 sentences preserved except explicit 打欠欠 -> 打哈欠 correction. Existing Grade 2 Upper has 250 entries / 246 unique chars, preserved.
- Dictation: Per-book 10/20/30 setting; dynamic actual completion count; controls remain visible for unconfigured banks. Grade 2 Lower imports 278 available source words; Grade 1 sources have no formal word table, Grade 3 Lower source words are incorrectly copied from Grade 3 Upper and are not enabled. Four-lower source remains incomplete.
- Verification: All-twelve runtime-parser/scope/exact-two/provenance/reading/meaning/sentence tests, 10/20/30 persistence and resizing / new-day / legacy-15 / small-bank / book-isolation tests, source-bank and Grade 3 bank regressions, data reproduction, JS syntax and diff checks PASS. Browser QA pending.
- Data audit: Pinned 321 writing and words have incorrect upper-term content. Lower-term learning uses its preserved raw writing table with honest 25-character groups labeled 课次待核对, not the copied lesson mapping. Reviewed general vocabulary and dictionary word provenance are separate from textbook dictation banks.
- Source plan: Existing raw writing tables fix character scope; pinned community textbook JSON and existing curated words provide metadata; honest general-vocabulary supplement for gaps, separate from textbook dictation tables.
- Next owner: Independent QA on scoped feature commit, then Manager / User; no merge/push.

## 2026-10-10 — Grade 4–6 textbook word-table banks

- Task: User requested “词语表也要补全，就用课本后面词语表”. Populate all six daily dictation banks only from the pinned source volume.words, retaining order and legitimate duplicate entries.
- Developer branch/worktree: `feature/grades-4-6`, `F:\chinese webapp\.worktrees\grades-4-6`; safe plan: continue the clean isolated worktree, preserve existing curricula and Grade 3 Upper bank/IDs; no merge/push.
- Developer state: Done for available-source integration; implementation QA: PASS on exact commit `c09ce64bde79263b7c701d1c9516c8981b4f0f47`. Earlier curriculum QA PASS remains recorded separately.
- Implementation: Editable one-word-per-line TXT banks: 四上240、四下171（未齐）、五上222、五下139、六上224、六下162词。Four copied whole-lesson blocks removed from source 421; missing lessons explicitly disclosed in UI. New book/occurrence IDs isolate results; Grade 3 bank and IDs preserved.
- Verification: `node scripts/test-textbook-word-banks.js`, `node scripts/build-textbook-word-banks.js`, `node scripts/test-grade-4-6.js`, `node scripts/test-daily-word-bank.js`, JS syntax and diff checks PASS. Local bank loader, source order/counts, duplicate IDs, book-isolated persisted progress, 15-item cap and unsupported-book empty state tested.
- Content completeness: Pending — four-lower source has missing lesson words; all six original textbook facsimiles / printing versions remain unverified. Implementation QA PASS does not certify textbook completeness.
- Local preview: Ready — http://127.0.0.1:4180/welcome.html; human acceptance waiting. No merge, push or deployment.
- Source limitation: Community 2019 textbook transcription; no primary textbook facsimile supplied. Source 4-lower misses lessons and contains four copied blocks. GitHub file history (2026-10-10 check) shows only source commit 283c9990fc56fc7d4760da261ce9dc5fc643c2cf, no newer correction. Full four-lower word-table completion requires reliable missing textbook pages; other banks remain version-unverified transcriptions.
- Next owner: Manager / User — review preview and provide reliable textbook word-table pages for source gap; no merge/push.

## 2026-10-10 — Grade 4–6 local curriculum completion

- Task: Enable Grade 4, 5 and 6, both terms, with pinned local writing-table and vocabulary data.
- Developer branch/worktree: `feature/grades-4-6`, `F:\chinese webapp\.worktrees\grades-4-6` (main baseline c4f5b75).
- Safe plan: Dedicated clean feature worktree; preserve the dirty primary checkout and all existing curated TXT files. No merge or push.
- Developer state: Done; QA: PASS on exact feature commit `743c72a35397d279dd4b439ed7b758e542f67a89`. Grade 3 daily word-bank policy stays unchanged.
- Implementation: All six books available, local-only curriculum loading. 四上250字 uses its preserved curated TXT; 四下250、五上220、五下180、六上180、六下120字 exactly match existing raw writing tables. Five new rich local TXTs include pinned lesson/vocabulary metadata plus honest supplementary sections (8/21/7/12/3 chars) where source metadata is missing.
- Verification: Independent QA passed all-six catalog/navigation checks, local HTTP 200, character counts/scope, nonempty pinyin, vocabulary source checks, generated-data reproduction, Grade 3 daily-bank regression, syntax and diff checks. Live browser handwriting interaction was not tested; textbook edition alignment and source metadata remain documented limitations in curriculum/renjiao/README.md.
- Local preview: Ready — http://127.0.0.1:4180/welcome.html.
- Feature delivery: Ready for human review; dev merge not performed; main unchanged; no deployment or push.
- Human acceptance: Waiting.
- Source: vipzhicheng/shukong-app commit 68faa378f2211fb1b9152f9df45eb8fa2c4fb2b4, MIT.
- Next owner: Manager / User — review local preview; protected release gates remain in force.

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
