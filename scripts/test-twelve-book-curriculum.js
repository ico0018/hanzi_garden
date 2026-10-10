const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {books, rawScope, baseLessons, buildBook, wordCandidates} = require('./build-twelve-book-curriculum.js');
const {root, parse} = require('./curriculum-word-tools.js');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const expectedCounts = {'1-upper':100,'1-lower':200,'2-upper':250,'2-lower':250,'3-upper':250,'3-lower':250,
  '4-upper':250,'4-lower':250,'5-upper':220,'5-lower':180,'6-upper':180,'6-lower':120};
const support = JSON.parse(read('curriculum/learning-support.json'));
const sandbox = {window:{}};
vm.runInNewContext(read('book-catalog.js'), sandbox);
const catalog = sandbox.window.HANZI_BOOK_CATALOG;
const requestFiles = [];
async function main() {
  assert.equal(Object.keys(catalog).length,12);
  for (const bookId of Object.keys(books)) {
    const book = catalog[bookId];
    assert.equal(book.available,true);
    assert(!/^https?:/.test(book.dataFile));
    requestFiles.push(book.dataFile);
    // Exact data consumed by app's real parser, not a sliced assertion of source.
    const text = read(book.dataFile);
    const lessons = parse(text);
    const chars = Array.from(lessons.flatMap(lesson=>lesson.chars));
    assert.equal(chars.length,expectedCounts[bookId]);
    assert.equal(new Set(chars.map(c=>c.char)).size,new Set(rawScope(bookId)).size,'retain original scope including any original repeated character');
    assert.deepEqual(chars.map(c=>c.char).sort(),rawScope(bookId).sort());
    assert.equal(text.replace(/\r\n/g,'\n'),buildBook(bookId,support),'content reproduction independent of Git checkout line endings');
    const originals = new Map(baseLessons(bookId,support).flatMap(lesson=>lesson.chars).map(c=>[c.char,c]));
    for(const character of chars) {
      assert(character.pinyin,`${bookId}/${character.char}: reading`);
      assert.equal(character.words.length,2,`${bookId}/${character.char}: exactly 2 displayed words`);
      assert.equal(new Set(character.words.map(word=>word.word)).size,2);
      for(const word of character.words) {
        assert(word.word.includes(character.char) && Array.from(word.word).filter(c=>/[\u3400-\u9fff]/.test(c)).length>=2,
          `${bookId}/${character.char}: meaningful multi-character word/usage phrase`);
        assert(word.pinyin && word.meaning);
        const sourced = wordCandidates(originals.get(character.char)).concat(support.words[character.char]||[]);
        assert(sourced.some(source=>source.word===word.word&&source.pinyin===word.pinyin&&source.meaning===word.meaning),
          `${bookId}/${character.char}/${word.word}: source or explicit reviewed supplement`);
      }
      const original=originals.get(character.char);
      if(original.sentence) {
        assert.equal(character.sentence.text,original.sentence.text);
        assert.equal(character.sentence.groupWord,original.sentence.groupWord);
      }
    }
    if(bookId==='3-lower') {
      assert(lessons.every(lesson=>lesson.title.includes('课次待核对')));
      assert.equal(chars[0].char,'融');
      assert.equal(chars[1].char,'燕');
    }
    console.log(`${bookId}: ${chars.length} local characters, exactly 2 distinct sourced words/usages each PASS`);
  }
  assert.equal(new Set(requestFiles).size,12,'book data must be distinct');
  assert.match(read('生字数据.txt'),/打欠欠/,'preserve original artifact');
  const corrected = parse(read(catalog['3-upper'].dataFile)).flatMap(lesson=>lesson.chars).find(char=>char.char==='欠');
  assert.equal(corrected.words[0].word,'哈欠');
  assert.equal(corrected.words[0].pinyin,'hā qian');
  assert.equal(corrected.sentence.groupWord,'哈欠');
  assert.match(corrected.sentence.text,/打哈欠/);
  for(const book of Object.values(catalog)) assert(!/曰过|曰道|打欠欠|露馅儿子/.test(read(book.dataFile)));
  const context={window:{}};
  vm.runInNewContext(read('daily-word-bank.js'),context);
  assert(!context.window.HANZI_DAILY_WORD_BANK.bankFiles['1-lower'],'no invented formal word table');
  assert(!context.window.HANZI_DAILY_WORD_BANK.bankFiles['3-lower'],'corrupt copied word table must not become lower bank');
  assert(context.window.HANZI_DAILY_WORD_BANK.bankFiles['2-lower']);
  console.log('Grade 3 sentences preserved; raw writing scopes retained; separate honest dictation configuration PASS');
}
main().catch(error=>{console.error(error);process.exitCode=1});
