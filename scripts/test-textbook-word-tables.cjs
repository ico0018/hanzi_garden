const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'daily-word-bank.js'), 'utf8'), context);
const bank = context.window.HANZI_DAILY_WORD_BANK;
// Test-only words do not claim to be a transcribed textbook table.
const fixture = () => ({
  schemaVersion: 1, bookId: '2026-3-upper', edition: '测试版', total: 3,
  source: { publisher: '人民教育出版社', table: '词语表', url: 'https://example.com/test.pdf', printedPages: [100], reviewedAt: '2026-11-04' },
  lessons: [
    { lessonKey: 'reading-1', title: '测试第一课', words: [{ word: '早晨', pinyin: 'zǎo chén' }, { word: '树枝' }] },
    { lessonKey: 'reading-3', title: '测试第三课', words: [{ word: '早晨' }] }
  ]
});
const plain = value => JSON.parse(JSON.stringify(value));
const parse = data => bank.parseTextbookWordTable(data, '2026-3-upper');

test('only transcribed words enter dictation in lesson and word order, with contextual pinyin optional', () => {
  const data = fixture();
  data.characters = [{ char: '晨', words: [{ word: '晨光' }] }];
  const result = parse(data);
  assert.deepEqual(plain(result.items.map(item => [item.word, item.order, item.lessonKey, item.pinyin])), [
    ['早晨', 0, 'reading-1', 'zǎo chén'], ['树枝', 1, 'reading-1', ''], ['早晨', 2, 'reading-3', '']
  ]);
  assert.equal(result.edition, '测试版');
  assert.equal(result.source.table, '词语表');
  assert.equal(result.total, 3);
  assert.ok(result.items.every(item => !('meaning' in item) && !('sentence' in item)));
});

test('item identity survives inserted words, changed titles and reordered lessons, and isolates books and source lessons', () => {
  const data = fixture();
  const original = parse(data).items;
  data.lessons[0].title = '补充标题';
  data.lessons[0].words.unshift({ word: '安静' });
  data.lessons.reverse();
  data.total++;
  const changed = parse(data).items;
  for (const item of original) assert.equal(changed.find(next => next.word === item.word && next.lessonKey === item.lessonKey).id, item.id);
  assert.notEqual(original[0].id, original[2].id);
  assert.equal(decodeURIComponent(original[0].id), '2026-3-upper|textbook-word-table-v1|reading-1|早晨');
  data.bookId = '2026-3-lower';
  assert.notEqual(bank.parseTextbookWordTable(data, data.bookId).items.find(item => item.lessonKey === 'reading-1' && item.word === '早晨').id, original[0].id);
  assert.equal(bank.createDailyDictationItems('3-upper', ['早晨'])[0].id, encodeURIComponent('3-upper|daily-word-bank-v4|早晨'));
});

test('wrong book, wrong source, missing lessons, count mismatches and same-lesson duplicates fail closed', () => {
  for (const mutate of [
    d => { d.bookId = '2026-4-upper'; }, d => { d.schemaVersion = 2; },
    d => { d.source.table = '写字表'; }, d => { d.source.printedPages = []; },
    d => { d.source.url = 'javascript:alert(1)'; }, d => { d.lessons = []; },
    d => { d.total++; }, d => { d.lessons[1].lessonKey = 'reading-1'; },
    d => { d.lessons[0].words[1].word = '早晨'; }, d => { d.lessons[0].words[0].word = ''; },
    d => { d.lessons[0].words[0].pinyin = {}; }
  ]) {
    const data = fixture(); mutate(data); assert.throws(() => parse(data));
  }
  assert.throws(() => bank.parseTextbookWordTable(fixture(), '3-upper'));
});

function loaderScope() {
  const calls = [];
  const scope = vm.createContext({
    BOOK_CATALOG: {
      '2026-3-upper': { wordTableFile: 'word-tables/2026-3-upper.json' },
      '2026-1-upper': { wordTableStatus: 'not-in-textbook' }
    },
    DAILY_DICTATION_BANK_FILES: { '3-upper': '每日词语听写题库.txt' },
    dailyDictationItems: [], dailyDictationTable: null, dailyDictationBankStatus: '',
    window: { HANZI_DAILY_WORD_BANK: bank }, encodeURI,
    fetch: async (url, options) => {
      calls.push([url, options.cache]);
      return { ok: true, json: async () => fixture(), text: async () => '早晨\n树枝' };
    }
  });
  vm.runInContext(app.slice(app.indexOf('async function loadDailyDictationWordBank('), app.indexOf('function stableItemId(')), scope);
  return { scope, calls };
}

test('new books use only their configured local table; missing tables never generate phrases, legacy keeps its TXT source', async () => {
  const { scope, calls } = loaderScope();
  await scope.loadDailyDictationWordBank('2026-3-upper');
  assert.equal(scope.dailyDictationItems.length, 3);
  assert.equal(scope.dailyDictationBankStatus, 'ready');
  assert.deepEqual(calls, [['word-tables/2026-3-upper.json', 'no-store']]);
  await scope.loadDailyDictationWordBank('2026-1-upper');
  assert.equal(scope.dailyDictationBankStatus, 'not-in-textbook');
  assert.equal(scope.dailyDictationItems.length, 0);
  assert.equal(scope.dailyDictationTable, null);
  await scope.loadDailyDictationWordBank('2026-2-upper');
  assert.equal(scope.dailyDictationBankStatus, 'not-configured');
  assert.equal(calls.length, 1);
  await scope.loadDailyDictationWordBank('3-upper');
  assert.deepEqual(plain(scope.dailyDictationItems.map(item => item.word)), ['早晨', '树枝']);
  assert.equal(scope.dailyDictationTable, null);
  assert.equal(calls[1][0], encodeURI('每日词语听写题库.txt'));
  scope.fetch = async () => ({ ok: false, status: 404 });
  await assert.rejects(scope.loadDailyDictationWordBank('2026-3-upper'), /404/);
  assert.equal(scope.dailyDictationItems.length, 0);
});

test('a failed word table leaves the writing curriculum available and shows a retry state without creating records', async () => {
  const heading = { textContent: '' };
  let rendered = 0;
  const scope = vm.createContext({
    window: {}, selectedBookId: '2026-3-upper', selectedBook: { available: true, label: '三年级上册' },
    lessons: [], dailyDictationItems: [{ id: 'stale' }], dailyDictationTable: {}, dailyDictationBankStatus: 'ready',
    console: { error() {} }, document: { querySelector: () => heading },
    loadSpeechVoices() {}, loadLessonsFromTxt: async () => [{ lessonKey: 'reading-1', chars: [{ char: '早' }] }],
    migratePracticeProgress() {}, loadDailyDictationWordBank: async () => { throw new Error('404'); },
    render: () => { rendered++; }, renderLoadError: () => assert.fail('word-table error must not hide writing curriculum')
  });
  vm.runInContext(app.slice(app.indexOf('async function init()'), app.lastIndexOf('\ninit();')), scope);
  await scope.init();
  assert.equal(rendered, 1);
  assert.equal(scope.lessons[0].chars[0].char, '早');
  assert.equal(scope.dailyDictationBankStatus, 'error');
  assert.equal(scope.dailyDictationItems.length, 0);
  assert.equal(scope.dailyDictationTable, null);
  assert.match(heading.textContent, /三年级上册/);
});

test('daily selection stays capped at 15, due words precede new words, saved queue and review intervals remain compatible', () => {
  const store = new Map();
  const items = Array.from({ length: 20 }, (_, order) => ({ id: 'item-' + order, order }));
  const scope = vm.createContext({
    selectedBookId: '2026-3-upper', dailyDictationItems: items, DAILY_DICTATION_SIZE: 15,
    EBBINGHAUS_INTERVALS: [2, 4, 7, 15, 30, 60], window: {},
    localStorage: { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value) },
    todayKey: () => '2026-11-04', addDays: (date, days) => 'after-' + days
  });
  vm.runInContext(app.slice(app.indexOf('function dailyDictationProgressKey('), app.indexOf('function openSelfAssessmentModal(')), scope);
  assert.equal(scope.dailyDictationProgressKey(), 'hanzi-daily-dictation-progress-v4-2026-3-upper');
  assert.equal(scope.dailyDictationQueueKey(), 'hanzi-daily-dictation-queue-v4-2026-3-upper');
  scope.saveDailyDictationProgress({ 'item-18': { dueDate: '2026-11-03' }, 'item-19': { dueDate: '2026-11-10' } });
  const queue = scope.getDailyQueue();
  assert.equal(queue.length, 15);
  assert.deepEqual(plain(queue.map(item => item.id)), ['item-18', ...items.slice(0, 14).map(item => item.id)]);
  scope.dailyDictationItems.reverse();
  assert.deepEqual(plain(scope.getDailyQueue().map(item => item.id)), plain(queue.map(item => item.id)));
  for (const interval of [2, 4, 7, 15, 30, 60, 60]) {
    scope.saveManualDictationResult(items[0], true);
    assert.equal(scope.getDailyDictationProgress()[items[0].id].dueDate, 'after-' + interval);
  }
  scope.saveManualDictationResult(items[0], false);
  assert.equal(scope.getDailyDictationProgress()[items[0].id].dueDate, 'after-1');
  assert.equal(scope.getDailyDictationProgress()[items[0].id].successCount, 0);
  assert.ok(!store.has('hanzi-daily-dictation-progress-v4-3-upper'));
});

function renderScope(status = 'ready') {
  const callbacks = [];
  const marks = [];
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, { textContent: '', hidden: true, clientWidth: 150, parentElement: { classList: { add() {} } }, classList: { add() {} }, addEventListener() {}, setAttribute() {} });
    return nodes.get(key);
  };
  let modal;
  const scope = vm.createContext({
    dailyDictationBankStatus: status, dailyDictationTable: { edition: '测试版', total: 3 },
    dictationOverview: { innerHTML: '' }, dictationDetail: { innerHTML: '', querySelector: node },
    window: { HanziWriter: true }, document: { getElementById: node },
    HanziWriter: { create: () => ({ quiz: options => callbacks.push(options.onComplete) }) },
    getDailyQueue: () => [{ id: 'checked-word', word: '早晨', lessonTitle: '测试第一课', pinyin: 'zǎo chén' }],
    getTodayQueueState: () => ({ results: {} }), cacheHumanAudio() {}, escapeHtml: value => value,
    playHumanChinese() {}, openSelfAssessmentModal: options => { modal = options; },
    saveManualDictationResult: (item, known) => marks.push([item.id, known])
  });
  vm.runInContext(app.slice(app.indexOf('function renderDailyDictation('), app.indexOf('function renderLessons(')), scope);
  return { scope, callbacks, marks, getModal: () => modal };
}

test('dictation requires every character to be written, then changes progress only after the learner marks it', () => {
  const { scope, callbacks, marks, getModal } = renderScope();
  scope.renderDailyDictation();
  assert.match(scope.dictationOverview.innerHTML, /测试版 · 教材词语表 3 词/);
  assert.equal(callbacks.length, 2);
  assert.equal(getModal(), undefined);
  callbacks[0](); callbacks[0]();
  assert.equal(getModal(), undefined);
  callbacks[1]();
  assert.ok(getModal());
  assert.equal(marks.length, 0);
  getModal().onKnown();
  assert.deepEqual(marks, [['checked-word', true]]);
});

test('no-table, not-yet-transcribed and load-error views are distinct and do not start a queue', () => {
  for (const [status, text] of [['not-in-textbook', '本册教材没有独立词语表'], ['not-configured', '本册教材词语表正在整理'], ['error', '教材词语表加载失败']]) {
    const { scope, callbacks } = renderScope(status);
    scope.getDailyQueue = () => assert.fail('unavailable tables cannot start a queue');
    scope.renderDailyDictation();
    assert.ok(scope.dictationDetail.innerHTML.includes(text));
    assert.equal(callbacks.length, 0);
    assert.doesNotMatch(scope.dictationDetail.innerHTML, /daily-listen|daily-writing-0/);
  }
});

test('completion reports the actual short queue rather than an assumed fifteen words', () => {
  const { scope } = renderScope();
  scope.getTodayQueueState = () => ({ results: { 'checked-word': 'known' } });
  scope.renderDailyDictation();
  assert.match(scope.dictationDetail.innerHTML, /今日 1 词已完成/);
});

test('catalog tables match every reviewed source sequence, count and local asset without replacing legacy books', () => {
  const catalogScope = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'book-catalog.js'), 'utf8'), catalogScope);
  const catalog = catalogScope.window.HANZI_BOOK_CATALOG;
  const checks = JSON.parse(fs.readFileSync(path.join(root, 'word-tables/source-checks.json'), 'utf8'));
  for (const check of checks.books) {
    const book = catalog[check.bookId];
    if (!check.hasWordTable) {
      assert.equal(book.wordTableStatus, 'not-in-textbook');
      assert.equal(book.wordTableFile, undefined);
      assert.ok(check.evidence.contentsPdfPages.length && check.evidence.endMatterPdfPages.length);
      continue;
    }
    assert.equal(book.wordTableFile, 'word-tables/' + book.id + '.json');
    const data = JSON.parse(fs.readFileSync(path.join(root, book.wordTableFile), 'utf8'));
    const result = bank.parseTextbookWordTable(data, book.id);
    assert.equal(result.total, check.total);
    assert.equal(data.lessons.length, check.lessons);
    assert.equal(data.source.url, check.source.url);
    assert.deepEqual(data.source.printedPages, check.source.printedPages);
    const rows = data.lessons.map(lesson => [lesson.lessonKey, lesson.words.map(entry => entry.word)]);
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'), check.sequenceSha256);
    assert.ok(result.items.every(item => item.pinyin === ''), 'the unannotated source table must not gain guessed pinyin');
  }
  assert.equal(catalog['3-upper'].dataFile, '生字数据.txt');
  assert.equal(catalog['3-upper'].wordTableFile, undefined);
  assert.equal(catalog['3-upper'].legacy, true);
});
