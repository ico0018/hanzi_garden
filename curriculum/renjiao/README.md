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

Metadata is a community transcription of the 2019 textbook edition, not a claim of alignment with every current textbook printing. Some source lesson titles have transcription errors (including 4-upper “观测”, “一个豆英里的五粒豆”, and 4-lower lesson 22's poem list); these are retained as source metadata and need a supplied textbook for authoritative correction. Source vocabulary labels express provenance, not dictionary definitions. Grade 3 Upper remains the only configured daily dictation word bank; these books add learning curriculum, not new dictation banks.

Reproduce/verify offline: `node scripts/build-grade-4-6.js` checks generated TXT against raw scope and pinned JSON; `node scripts/test-grade-4-6.js` verifies local runtime loading, exact character scope, vocabulary provenance, deduplication and failure behavior. `--patch` emits an apply_patch patch for regeneration. No generator dependency or runtime curriculum CDN is needed for Grade 4–6.
