# Local two-word learning curriculum

All twelve catalog entries now load `renjiao/learning-<book>.txt` locally. Original rich/character-only TXT files remain untouched. Counts: 1-upper 100, 1-lower 200, 2-upper 250, 2-lower 250, 3-upper 250, 3-lower 250, 4-upper 250, 4-lower 250, 5-upper 220, 5-lower 180, 6-upper 180, 6-lower 120 (2,600 entries). The existing second-upper file has 250 entries but 246 distinct characters; these original repeated entries are preserved rather than replaced by guessed missing characters.

Each learning entry has exactly two distinct multi-character terms containing its character. Original curated words retain priority when valid. Supplementary words come from other available textbook/curated lists, dictionary-listed words, and explicit reviewed natural vocabulary. Limited compound characters can use short natural expressions, marked **用法短语** (for example 姓邓/小邓, 噢，明白了/噢，原来如此). A few genuine geographic or literary examples remain for characters such as 浙/杭/弗/哉; these are not invented textbook vocabulary. The generator never creates generic 学X/写X placeholders. Supplemental learning examples do not enter the daily textbook word-table banks.

`learning-support.json` contains selected supplemental words, readings, brief reviewed definitions or clear source labels. Word candidates were sourced from [pwxcoo/chinese-xinhua](https://github.com/pwxcoo/chinese-xinhua/tree/fe6d6c2e8baa82187f4c96bbe042e43f96c05666) and ranked using [fxsjy/jieba](https://github.com/fxsjy/jieba/tree/67fa2e36e72f69d9134b8a1037b83fbb070b9775), both MIT; original notices are included as LICENSE-chinese-xinhua.txt and LICENSE-jieba.txt. Dictionary imports use **拓展组词（词典收录）** rather than exposing unreviewed archaic/corrupted definitions. Existing real meanings are retained; some existing/source words have provenance labels, not dictionary definitions. Explicit reviewed additions have authored short Chinese meanings. Readings use the fixed pinyin-pro 3.18.2 already used by this app, with reviewed polyphonic overrides where needed.

Lower-term source additions are pinned 121/221/321 JSONs from the same shukong-app commit documented in renjiao/README.md. 121 differs by eight characters from the original local first-lower table; its missing local characters are retained under honest supplemental grouping. 221 matches the second-lower character scope. **321 is corrupt:** recognition/lesson metadata reflects third-lower, while writing and word arrays contain third-upper content. Therefore third-lower learning uses all 250 preserved local characters in ten groups of 25 labeled 课次待核对; it does not claim these are verified textbook lesson assignments. Its daily word-table bank stays unconfigured. First-grade sources do not provide independent word tables. Second-lower has an available 278-entry source word table, now a separate editable bank.

Documented runtime errata keep original artifacts intact: fifth-lower 露馅儿子 -> 露馅儿; exclude questionable 曰过/曰道/噢呀/噢哟 and nonstandard 打欠欠 from learning terms. Third-upper 欠 uses 哈欠 (hā qian), and its linked sentence changes only 打欠欠 to 打哈欠. All other third-upper sentence texts/link metadata remain preserved. Original-style single-character sentence links can stay independent of the two displayed learning terms (for example 噢).

Offline reproduction: `node scripts/build-twelve-book-curriculum.js`. Verification: `node scripts/test-twelve-book-curriculum.js`, `node scripts/test-dictation-count.js`, `node scripts/test-textbook-word-banks.js`, `node scripts/test-daily-word-bank.js`. Build-time support import uses explicit externally downloaded source/review files via prepare-learning-support.js; those dependencies are not needed at runtime or for reproduction of the checked-in curriculum.

Daily counts are per-book 10/20/30, default 10. Queue IDs/results and book progress remain v4-compatible. The saved assigned list retains previously assigned items even when shrinking; increasing restores that order and appends unseen candidates. Completed results and scheduled reviews are never deleted by resizing. Completion text uses the actual available count, including banks smaller than the selected limit.

Original textbook facsimile/printing alignment is still unverified. Four-lower textbook word-table source remains incomplete. See renjiao/README.md for those source limitations; implementation tests do not certify authoritative textbook completeness.
# Supplemental vocabulary review

After QA found inappropriate automatic selections and incorrect contextual
readings, all 966 original support records / 1,397 items were reviewed.
`vocabulary-review.json` records 155 explicit selection replacements, contextual
pinyin/neutral-tone overrides and book-specific character headings.
`used-vocabulary-review.json` records 1,399 actual support occurrences (1,348
distinct words) in the 2,600-entry local runtime curriculum. Reproduce it with
`node scripts/test-vocabulary-review.js --export`; review regression checks use
the actual app parser and generated book files. Original source artifacts remain
unchanged. Dictionary provenance labels are not dictionary definitions; authored
meanings and explicitly labelled usage phrases remain distinct from textbook
word-table entries. Primary textbook page/version verification remains pending.
