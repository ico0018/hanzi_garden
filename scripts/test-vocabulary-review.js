const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {root,parse} = require('./curriculum-word-tools.js');
const {books,wordCandidates} = require('./build-twelve-book-curriculum.js');
const review = require('../curriculum/vocabulary-review.json');
const support = require('../curriculum/learning-support.json');
const banned = new Set(['乱伦','姨太太','上吊','裸体','玉音','京官','入阁','茅台','茅台酒']);
const used = [];
const all = [];
assert.equal(review.reviewedCharacters,966);
assert.equal(review.reviewedWordEntries,1397);
assert.equal(Object.keys(review.replacements).length,155);
for (const [character,items] of Object.entries(support.words)) for (const item of items) {
  assert.equal(item.reviewed,true,`unreviewed support ${character}/${item.word}`);
  assert(!banned.has(item.word),`inappropriate or obscure support ${item.word}`);
  if(review.readingOverrides[item.word]) assert.equal(item.pinyin,review.readingOverrides[item.word]);
}
for (const book of Object.keys(books)) {
  const chars = parse(fs.readFileSync(path.join(root,`curriculum/renjiao/learning-${book}.txt`),'utf8')).flatMap(l=>l.chars);
  for (const char of chars) {
    if(review.characterHeadings?.[book]?.[char.char]) assert.equal(char.pinyin,review.characterHeadings[book][char.char]);
    if(book==='3-lower' && char.char==='佛') {
      assert.equal(char.pinyin,'fú');
      assert.deepEqual(Array.from(char.words,w=>w.word),['仿佛','仿佛看见']);
    }
    // Contextual word readings, not the character's potentially different reading.
    for (const word of char.words) {
      assert(!banned.has(word.word),`${book}/${char.char}/${word.word}`);
      if(review.readingOverrides[word.word]) assert.equal(word.pinyin,review.readingOverrides[word.word],`${book}/${word.word}`);
      all.push({book,character:char.char,...word});
      const source = (support.words[char.char]||[]).find(w=>w.word===word.word&&w.meaning===word.meaning);
      if(source) used.push({book,character:char.char,...word,source:source.source,reviewed:source.reviewed});
    }
  }
}
// Explicitly retain readable evidence for QA; these assertions catch wrong
// pinyin-pro default selections rather than merely checking nonempty strings.
for (const [word,pinyin] of Object.entries({伯父:'bó fù',搜查:'sōu chá',呕吐:'ǒu tù',
  喧嚣:'xuān xiāo',晕倒:'yùn dǎo',肩膀:'jiān bǎng',仿佛:'fǎng fú',
  赢得:'yíng dé',蚂蚱:'mà zha',欺负:'qī fu'})) {
  assert.equal(wordCandidates({char:Array.from(word)[0],words:[{word,pinyin:'wrong-default',meaning:'review regression'}]})[0].pinyin,pinyin);
  assert(all.filter(w=>w.word===word).every(w=>w.pinyin===pinyin));
  if(['赢得','蚂蚱','欺负'].includes(word)) assert(all.some(w=>w.word===word),`${word}: runtime regression coverage`);
}
if(process.argv.includes('--export')) console.log(JSON.stringify({reviewedOriginalRecords:966,reviewedOriginalItems:1397,
  actualUsedSupportEntries:used.length,distinctUsedSupportWords:new Set(used.map(w=>w.word)).size,entries:used}));
else console.log(`Full vocabulary review: ${used.length} actual used support entries / ${new Set(used.map(w=>w.word)).size} distinct words; contextual readings and child-suitability regressions PASS`);
