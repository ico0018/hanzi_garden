// Build-time review application. Prints JSON for an explicit patch; no writes.
// Keep generated data local and reproducible without a runtime dictionary.
const fs = require('node:fs');
const path = require('node:path');
const {root} = require('./curriculum-word-tools.js');
const review = require('../curriculum/vocabulary-review.json');
const support = require('../curriculum/learning-support.json');
const {pinyin} = require(path.resolve(process.argv[2]));
for (const [character, items] of Object.entries(review.replacements)) {
  if (character === '佛') continue; // book-specific 三下 荷花 context in generator
  support.words[character] = items.map(item => ({
    word: item.word, pinyin: review.readingOverrides[item.word] || item.pinyin || pinyin(item.word, {toneType:'symbol'}),
    meaning: `${item.kind === 'phrase' ? '用法短语：' : ''}${item.definition}`,
    source:'reviewed-general-vocabulary', kind:item.kind, reviewed:true
  }));
}
for (const items of Object.values(support.words)) for (const item of items) {
  item.pinyin = review.readingOverrides[item.word] || item.pinyin;
  item.reviewed = true;
}
support.sources.reviewed = 'Full review of 966 character records / 1397 original support items; 155 character replacements, contextual reading overrides; not textbook word-table certification';
support.review = {originalCharacters:review.reviewedCharacters,originalItems:review.reviewedWordEntries,
  replacementCharacters:Object.keys(review.replacements).length, evidence:'curriculum/vocabulary-review.json'};
console.log(JSON.stringify(support));
