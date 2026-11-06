// Read-only final coverage/identity audit against the deployed source baseline.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const vm = require('node:vm');
const { parseWritingTable } = require('../writing-tables.js');
const root = path.resolve(__dirname, '..');
const baseline = 'ba589dc';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const before = file => cp.execFileSync('git', ['-C', root, 'show', `${baseline}:${file}`], { encoding: 'utf8', maxBuffer: 10000000 });
const app = read('app.js');
const oldApp = before('app.js');
function idScope(source) {
  const scope = vm.createContext({ selectedBookId: '' });
  vm.runInContext(source.slice(source.indexOf('function stableItemId('), source.indexOf('function formatDate(')), scope);
  vm.runInContext(source.slice(source.indexOf('function parseLessonsText('), source.indexOf('async function loadLessonsFromTxt(')), scope);
  return scope;
}
const nowIds = idScope(app), oldIds = idScope(oldApp);
const catalogScope = { window: {} };
vm.runInNewContext(read('book-catalog.js'), catalogScope);
const catalog = Object.values(catalogScope.window.HANZI_BOOK_CATALOG);
const oldBankScope = { window: {} }, bankScope = { window: {} };
vm.runInNewContext(before('daily-word-bank.js'), oldBankScope);
vm.runInNewContext(read('daily-word-bank.js'), bankScope);
const bank = bankScope.window.HANZI_DAILY_WORD_BANK;
const oldBank = oldBankScope.window.HANZI_DAILY_WORD_BANK;
const corrections = [
  { bookId: '2026-3-lower', lessonKey: '18', index: 4, char: '膀', from: 'páng', to: 'bǎng', phrase: '翅膀' },
  { bookId: '2026-3-lower', lessonKey: '16', index: 1, char: '卜', from: 'bǔ', to: 'bo', phrase: '萝卜' }
];
let positions = 0, entries = 0, sentences = 0, usage = 0, wordIds = 0, legacyIds = 0;
const books = [];
for (const book of catalog.filter(book => !book.legacy)) {
  const data = JSON.parse(read(book.dataFile));
  const original = JSON.parse(before(book.dataFile));
  const expected = structuredClone(original);
  for (const correction of corrections.filter(item => item.bookId === book.id)) {
    const target = expected.lessons.find(lesson => lesson.lessonKey === correction.lessonKey).characters[correction.index];
    assert.deepEqual(target, { char: correction.char, pinyin: correction.from });
    target.pinyin = correction.to;
    target.readingPhrase = correction.phrase;
  }
  const stripped = structuredClone(data);
  delete stripped.learningSupportVersion; delete stripped.learningSupport;
  for (const lesson of stripped.lessons) for (const char of lesson.characters) {
    delete char.words; delete char.sentence; delete char.examplesLabel;
  }
  assert.deepEqual(stripped, expected, `${book.id}: only four specifically authorized field paths may differ`);
  assert.equal(data.learningSupportVersion, 1);
  assert.ok(['author-created-supplement', 'author-created-teaching-supplement'].includes(data.learningSupport.type));
  const lessons = parseWritingTable(data, book.id, book.characterCount);
  nowIds.selectedBookId = oldIds.selectedBookId = book.id;
  const existing = original.lessons.flatMap(lesson => lesson.characters.map(char => oldIds.stableItemId({ ...lesson, writingTable: true }, { ...char, words: [] })));
  const current = lessons.flatMap(lesson => lesson.chars.map(char => nowIds.stableItemId(lesson, char)));
  assert.deepEqual(current, existing, `${book.id}: deployed learning identities must remain readable`);
  for (const lesson of lessons) for (const char of lesson.chars) {
    positions++; entries += char.words.length; sentences++;
    assert.equal(char.words.length, 2);
    assert.ok(char.words.some(word => word.word === char.sentence.groupWord));
    assert.ok(char.sentence.text.includes(char.sentence.groupWord));
    if (char.examplesLabel) { usage++; assert.ok(char.words.every(word => word.kind === 'usage')); }
  }
  if (book.id === '2026-4-lower') assert.equal(lessons.flatMap(lesson => lesson.chars).find(char => char.char === '卜').pinyin, 'bǔ');
  if (book.wordTableFile) {
    const table = JSON.parse(read(book.wordTableFile));
    const oldTable = JSON.parse(before(book.wordTableFile));
    assert.deepEqual(table, oldTable, 'textbook dictation content must not be replaced by supplemental words');
    const ids = Array.from(bank.parseTextbookWordTable(table, book.id).items, item => item.id);
    assert.deepEqual(ids, Array.from(oldBank.parseTextbookWordTable(oldTable, book.id).items, item => item.id));
    wordIds += ids.length;
  }
  books.push({ book: book.id, positions: current.length });
}
for (const book of catalog.filter(book => book.legacy && book.available)) {
  assert.equal(read(book.dataFile).replaceAll('\r\n', '\n'), before(book.dataFile).replaceAll('\r\n', '\n'));
  nowIds.selectedBookId = oldIds.selectedBookId = book.id;
  const original = Array.from(oldIds.parseLessonsText(before(book.dataFile)), lesson => Array.from(lesson.chars, char => oldIds.stableItemId(lesson, char))).flat();
  const current = Array.from(nowIds.parseLessonsText(read(book.dataFile)), lesson => Array.from(lesson.chars, char => nowIds.stableItemId(lesson, char))).flat();
  assert.deepEqual(current, original); legacyIds += current.length;
}
const oldWords = oldBank.parseDailyWordBank(before('每日词语听写题库.txt'));
const words = bank.parseDailyWordBank(read('每日词语听写题库.txt'));
assert.deepEqual(Array.from(words), Array.from(oldWords));
assert.deepEqual(Array.from(bank.createDailyDictationItems('3-upper', words), item => item.id), Array.from(oldBank.createDailyDictationItems('3-upper', oldWords), item => item.id));
assert.equal(positions, 2500); assert.equal(entries, 5000); assert.equal(sentences, 2500);
assert.equal(wordIds, 2168); assert.equal(legacyIds, 850);
console.log(JSON.stringify({ status: 'PASS', baseline, positions, entries, sentences, usagePositions: usage, preservedWritingIds: positions, preservedWordIds: wordIds, preservedLegacyCharacterIds: legacyIds, preservedLegacyWordIds: words.length, authorizedCorrections: corrections, books }, null, 2));
