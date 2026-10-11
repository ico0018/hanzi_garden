const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const {root,parse} = require('./curriculum-word-tools.js');
const {books,buildBook} = require('./build-twelve-book-curriculum.js');
const baseline = '84bff5834a1f5eba4f05a8a8f96bb0850d0680cf';
const support = require('../curriculum/learning-support.json');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const original = file => execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
const plain = value => JSON.parse(JSON.stringify(value));
const skeleton = lessons => plain(lessons).map(l=>({title:l.title,chars:l.chars.map(c=>({char:c.char,pinyin:c.pinyin,words:c.words}))}));
const digest = lessons => createHash('sha256').update(JSON.stringify(skeleton(lessons))).digest('hex');
const report = {baseline,books:[],totalEntries:0,totalWords:0,preservedSentences:0,addedSentences:0,
  preservedLegacyLinkExceptions:[{bookId:'3-upper',character:'噢',reason:'原句及单字关联字段原样保留，新增句均严格关联两个现词之一'}]};
for (const bookId of Object.keys(books)) {
  const file = `curriculum/renjiao/learning-${bookId}.txt`;
  const lessons = parse(read(file)), prior = parse(original(file));
  assert.deepEqual(skeleton(lessons),skeleton(prior),`${bookId}: lessons, every character reading and both words unchanged`);
  assert.equal(read(file).replace(/\r\n/g,'\n'),buildBook(bookId,support),'deterministic sentence regeneration');
  const chars = lessons.flatMap(l=>l.chars), previous = prior.flatMap(l=>l.chars);
  let added = 0;
  const supplementFile = `curriculum/sentences/${bookId}.json`;
  let supplement = null;
  if(bookId!=='3-upper') {
    supplement = JSON.parse(read(supplementFile));
    assert.equal(supplement.bookId,bookId);
    assert.equal(supplement.provenance,'原创学习例句，非教材原句');
    assert.deepEqual(Object.keys(supplement.entries).sort(),Array.from(new Set(chars.map(c=>c.char))).sort(),'exact same-book coverage, including repeated chars');
  }
  for (let i=0;i<chars.length;i++) {
    const character=chars[i], sentence=character.sentence;
    assert.equal(character.words.length,2);
    assert(sentence && sentence.groupWord && sentence.text,`${bookId}/${character.char}: one sentence`);
    const preservedOhSentence = bookId==='3-upper' && character.char==='噢';
    if(preservedOhSentence) {
      assert.equal(sentence.groupWord,'噢');
      assert.equal(sentence.text,'噢，我知道这道题怎么做了！');
    } else assert(character.words.some(w=>w.word===sentence.groupWord),'linked to one of the unchanged two words');
    assert(sentence.text.includes(sentence.groupWord) && sentence.text.includes(character.char),'literal character and linked-word use');
    assert(/[。！？][”’]?$/u.test(sentence.text),'full sentence punctuation');
    assert(Array.from(sentence.text).length>=8,'not a bare word/fragment');
    assert(!/我学会了|这个词|这个字|词语是|用.{0,12}造句|在词典|读音是|字的意思/.test(sentence.text),'no metalinguistic fill template');
    if(previous[i].sentence) {
      assert.deepEqual(plain(sentence),plain(previous[i].sentence),'all 250 existing Grade 3 Upper sentences untouched');
      report.preservedSentences++;
    } else {
      assert.deepEqual(plain(sentence),supplement.entries[character.char]);
      added++;
      report.addedSentences++;
    }
  }
  report.books.push({bookId,entries:chars.length,uniqueChars:new Set(chars.map(c=>c.char)).size,addedSentences:added,
    unchangedWords:chars.length*2,baselineWordsReadingsSha256:digest(prior),currentWordsReadingsSha256:digest(lessons)});
  report.totalEntries+=chars.length;
  report.totalWords+=chars.length*2;
}
assert.equal(report.totalEntries,2500,'actual twelve-book count; prior 2600 was an arithmetic error');
assert.equal(report.totalWords,5000);
assert.equal(report.preservedSentences,250);
assert.equal(report.addedSentences,2250);
// Explicitly guard independent dictation/progress architecture and source data.
for (const file of ['app.js','book-catalog.js','daily-word-bank.js','每日词语听写题库.txt',
  ...Object.values(books).map(([,file])=>file),
  ...Object.keys(books).filter(b=>['2-lower','4-upper','4-lower','5-upper','5-lower','6-upper','6-lower'].includes(b)).map(b=>`curriculum/renjiao/words-${b}.txt`)]) {
  assert.equal(read(file).replace(/\r\n/g,'\n'),original(file).replace(/\r\n/g,'\n'),`${file}: no source/bank/UI/ID change`);
}
if(process.argv.includes('--export'))console.log(JSON.stringify(report,null,2));
else console.log('PASS: 2500 entries each exactly 2 unchanged words + 1 sentence; all 2250 new examples linked, only preserved legacy 噢 link exception; 5000 words/readings and 250 original sentences preserved; banks/UI/IDs unchanged');
