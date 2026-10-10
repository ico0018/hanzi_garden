# Local Grade 4–6 curriculum

Original metadata: [vipzhicheng/shukong-app](https://github.com/vipzhicheng/shukong-app/tree/68faa378f2211fb1b9152f9df45eb8fa2c4fb2b4/public/books/renjiao), commit `68faa378f2211fb1b9152f9df45eb8fa2c4fb2b4`. The six JSON files are downloaded verbatim. Source license: MIT, see LICENSE.txt (Copyright (c) [2025] [Shu Kong APP]). These are the same pinned datasets used previously by writing-table-support.js remotely.

For newly enabled books, the existing repository writing-table TXT determines the exact character set. Source JSON supplies lesson grouping, readings and word-list vocabulary for matching characters. Source-only characters are excluded; repeated source characters are deduplicated. Missing characters remain available under **写字表补充（课次待核对）**, with one honest single-character fallback rather than invented vocabulary or a guessed lesson. Readings for these entries come from the same book's recognition/word records when available; otherwise the fixed pinyin-pro 3.18.2 dictionary already used by this app. Dictionary defaults for polyphonic characters need contextual textbook confirmation.

| Book | Local scope | Source entries (unique) | Supplement |
| --- | ---: | ---: | --- |
| 4-lower | 250 | 251 (250) | 笼投凌晃哩荣爆炸 |
| 5-upper | 220 | 214 (213) | 访鞋挽隔懒绰溜酷暑罩械孙黎晕漆幕愈旷怡逸免 |
| 5-lower | 180 | 179 (178) | 蚱拔瞎锄尾疑惑 |
| 6-upper | 180 | 170 (170) | 玻璃窥帘恰迈政爆射瞪勺蒜 |
| 6-lower | 120 | 117 (117) | 筝皎抵 |

4-upper now directly loads the existing curated 250-entry TXT, preserved byte-for-byte. This restores its full character set instead of the previous remote adapter's 249 entries (248 unique). 411.json is retained for source audit only. All other original TXT files are also preserved.

Metadata is a community transcription of the 2019 textbook edition, not a claim of alignment with every current textbook printing. Some source lesson titles have transcription errors (including 4-upper “观测”, “一个豆英里的五粒豆”, and 4-lower lesson 22's poem list); these are retained as source metadata and need a supplied textbook for authoritative correction. Source vocabulary labels express provenance, not dictionary definitions.

## Textbook word-table banks (2026-10-10)

User requested the textbook's back-of-book 词语表. `words-<book>.txt` imports **volume.words only**, independently of the character scope, character word suggestions and recognition table. Each word occupies one editable UTF-8 line; `#` lines preserve lesson grouping and are ignored by the bank parser. Grade 3 Upper's existing 28 words/IDs remain unchanged; unsupported books stay unconfigured.

| Book | Words | Source status |
| --- | ---: | --- |
| 4-upper | 240 | Full available source export; textbook printing not verified |
| 4-lower | 171 | **Incomplete source**; missing lesson blocks; four copied blocks excluded |
| 5-upper | 222 | Full available source export; textbook printing not verified |
| 5-lower | 139 | Full available source export; textbook printing not verified |
| 6-upper | 224 | Full available source export; textbook printing not verified |
| 6-lower | 162 | Full available source export; textbook printing not verified |

421.json repeats the identical entire lesson 2/3/5/6 blocks, creating a misleading raw count of 228. The bank excludes only these exact duplicate blocks, retaining the original order of 13 distinct blocks (2/3/5/6/14/15/16/17/19/23/24/26/27). It does not invent missing lesson words or call 171 words a complete textbook table. The UI explicitly says 四下词语表未齐. The [GitHub file history](https://api.github.com/repos/vipzhicheng/shukong-app/commits?path=public/books/renjiao/421.json&per_page=5), checked 2026-10-10, contains only commit `283c9990fc56fc7d4760da261ce9dc5fc643c2cf`; no newer corrected file was available. Primary textbook photos/PDF are needed to complete and verify the missing source content.

Legitimate repeated words remain separate occurrences. New IDs include book, word-bank version, occurrence order and word; a future manual reorder changes affected IDs. Grade 3 IDs are preserved for existing progress compatibility. No words are generated from character groupings. `node scripts/build-textbook-word-banks.js` verifies exact source exports (allowing only the documented duplicate-block exclusion); `node scripts/test-textbook-word-banks.js` tests ordering, source counts, local runtime loading, duplicate-safe IDs, bank independence and daily cap. Deliberate human edits can differ from the export validator and should be documented.

Reproduce/verify offline: `node scripts/build-grade-4-6.js` checks generated TXT against raw scope and pinned JSON; `node scripts/test-grade-4-6.js` verifies local runtime loading, exact character scope, vocabulary provenance, deduplication and failure behavior. `--patch` emits an apply_patch patch for regeneration. No generator dependency or runtime curriculum CDN is needed for Grade 4–6.
