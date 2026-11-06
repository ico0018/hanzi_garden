const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scheduler = require('../dictation-scheduler.js');
const { parseWritingTable } = require('../writing-tables.js');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const items = Array.from({ length: 50 }, (_, order) => ({ id: `word-${order}`, order, word: '春天' }));

test('preview allows 10/20/30 with a stable prefix; start and persisted old results lock the same calendar day', () => {
  let saved = scheduler.planQueue({ items, progress: {}, date: '2026-11-06' });
  assert.equal(saved.size, 10); assert.equal(saved.ids.length, 10); assert.equal(saved.started, false);
  const first = saved.ids.slice();
  saved = scheduler.planQueue({ items, progress: {}, saved, date: '2026-11-06', requestedSize: 30 });
  assert.equal(saved.ids.length, 30); assert.deepEqual(saved.ids.slice(0, 10), first);
  saved = scheduler.planQueue({ items, progress: {}, saved, date: '2026-11-06', requestedSize: 20 });
  assert.equal(saved.ids.length, 20);
  saved.started = true;
  assert.deepEqual(scheduler.planQueue({ items, progress: {}, saved, date: '2026-11-06', requestedSize: 10 }), saved);
  const legacy = { date: '2026-11-06', ids: items.slice(0, 15).map(item => item.id), results: { 'word-0': 'unknown' } };
  const kept = scheduler.planQueue({ items, progress: {}, saved: legacy, date: legacy.date, requestedSize: 30 });
  assert.equal(kept.size, 15); assert.equal(kept.started, true);
  assert.deepEqual(kept.ids, legacy.ids); assert.deepEqual(kept.results, legacy.results);
  const tomorrow = scheduler.planQueue({ items, progress: {}, saved: kept, date: '2026-11-07', requestedSize: 20 });
  assert.equal(tomorrow.size, 20); assert.equal(tomorrow.started, false); assert.deepEqual(tomorrow.results, {});
});

test('reinforcement precedes ordinary due words, then new words, without exceeding the selected limit', () => {
  const progress = {};
  for (let index = 0; index < 40; index++) progress[`word-${index}`] = { dueDate: '2026-10-01', successCount: 3, lastResult: 'known', lastReviewed: '2026-10-01' };
  progress['word-39'] = { lastResult: 'unknown', lastReviewed: '2026-11-05', dueDate: '2026-11-07' };
  const state = scheduler.planQueue({ items, progress, date: '2026-11-06', requestedSize: 10 });
  assert.equal(state.ids.length, 10); assert.equal(state.ids[0], 'word-39');
  assert.equal(state.reviewIds.length, 10); assert.ok(!state.ids.includes('word-40'));
});

test('a wrong word needs two adjacent calendar dates; replay cannot increase days and exiting preserves history', () => {
  const wrong = scheduler.applyResult({}, false, '2026-11-06');
  assert.equal(wrong.wrongReview.active, true); assert.equal(wrong.wrongReview.correctDays, 0);
  assert.equal(scheduler.applyResult(wrong, true, '2026-11-06'), wrong);
  const first = scheduler.applyResult(wrong, true, '2026-11-07');
  assert.equal(first.wrongReview.active, true); assert.equal(first.wrongReview.correctDays, 1); assert.equal(first.dueDate, '2026-11-08');
  assert.equal(scheduler.applyResult(first, true, '2026-11-07'), first);
  const second = scheduler.applyResult(JSON.parse(JSON.stringify(first)), true, '2026-11-08');
  assert.equal(second.wrongReview.active, false); assert.equal(second.wrongReview.correctDays, 2);
  assert.equal(second.wrongReview.lastWrongDate, '2026-11-06'); assert.equal(second.dueDate, '2026-11-12');
  const nextNormal = scheduler.applyResult(second, true, '2026-11-12');
  assert.equal(nextNormal.dueDate, '2026-11-19'); assert.equal(nextNormal.successCount, 3);
});

test('missing a day restarts consecutive correctness; another error resets reinforcement and a backwards date cannot count', () => {
  let progress = scheduler.applyResult({}, false, '2026-11-06');
  progress = scheduler.applyResult(progress, true, '2026-11-07');
  progress = scheduler.applyResult(progress, true, '2026-11-09');
  assert.equal(progress.wrongReview.correctDays, 1); assert.equal(progress.wrongReview.active, true);
  assert.equal(scheduler.applyResult(progress, true, '2026-11-08'), progress);
  progress = scheduler.applyResult(progress, false, '2026-11-10');
  assert.equal(progress.wrongReview.correctDays, 0); assert.equal(progress.successCount, 0);
  assert.equal(progress.wrongReview.lastWrongDate, '2026-11-10');
  assert.throws(() => scheduler.applyResult(progress, true, '2026-02-30'), /日期/);
});

test('old unknown and explicit wrong-review records need dates proving two correct days', () => {
  const unknown = { lastResult: 'unknown', successCount: 0, lastReviewed: '2026-11-05' };
  assert.equal(scheduler.wrongState(unknown).active, true);
  let first = scheduler.applyResult(unknown, true, '2026-11-06');
  assert.equal(first.wrongReview.correctDays, 1); assert.equal(first.wrongReview.active, true);
  assert.equal(scheduler.applyResult(first, true, '2026-11-07').wrongReview.active, false);
  const explicitOne = { lastResult: 'known', successCount: 1, lastReviewed: '2026-11-05', wrongReview: { active: true, correctDays: 1, lastCorrectDate: '2026-11-05', lastWrongDate: '2026-11-04' } };
  assert.equal(scheduler.applyResult(explicitOne, true, '2026-11-06').wrongReview.active, false);
  const noDate = { lastResult: 'known', successCount: 1, wrongReview: { active: true, correctDays: 2 } };
  first = scheduler.applyResult(noDate, true, '2026-11-06');
  assert.equal(first.wrongReview.active, true); assert.equal(first.wrongReview.correctDays, 1);
  const skipped = scheduler.applyResult(explicitOne, true, '2026-11-07');
  assert.equal(skipped.wrongReview.active, true); assert.equal(skipped.wrongReview.correctDays, 1);
});

test('a legacy first success without error evidence is not red-marked or pulled into next-day reinforcement', () => {
  const oldOne = { lastResult: 'known', successCount: 1, lastReviewed: '2026-11-05', dueDate: '2026-11-07' };
  const original = structuredClone(oldOne);
  assert.equal(scheduler.wrongState(oldOne).active, false);
  const queue = scheduler.planQueue({ items, progress: { 'word-0': oldOne }, date: '2026-11-06', requestedSize: 10 });
  assert.ok(!queue.ids.includes('word-0'));
  assert.deepEqual(oldOne, original, 'reading legacy progress must not rewrite it');
  const next = scheduler.applyResult(oldOne, true, '2026-11-07');
  assert.equal(next.wrongReview.active, false); assert.equal(next.successCount, 2); assert.equal(next.dueDate, '2026-11-11');
});

test('normal successful words keep the existing 2/4/7/15/30/60 calendar-day intervals', () => {
  const dates = ['2026-01-01', '2026-01-03', '2026-01-07', '2026-01-14', '2026-01-29', '2026-02-28', '2026-04-29'];
  const due = ['2026-01-03', '2026-01-07', '2026-01-14', '2026-01-29', '2026-02-28', '2026-04-29', '2026-06-28'];
  let progress;
  dates.forEach((date, index) => { progress = scheduler.applyResult(progress, true, date); assert.equal(progress.dueDate, due[index]); assert.equal(progress.wrongReview.active, false); });
});

function supportFixture() {
  return { bookId: '2026-1-upper', edition: '测试', total: 1, learningSupportVersion: 1, lessons: [
    { lessonKey: 'reading-1', title: '1', characters: [{ char: '春', pinyin: 'chūn', words: [
      { word: '春天', pinyin: 'chūn tiān', meaning: '' }, { word: '春风', pinyin: '', meaning: '' }
    ], sentence: { groupWord: '春天', text: '春天到了。' } }] }
  ] };
}
test('two words and a linked sentence are validated without changing the textbook reading; marked usage may contain natural punctuation', () => {
  const data = supportFixture();
  const parsed = parseWritingTable(data, data.bookId, 1)[0].chars[0];
  assert.equal(parsed.pinyin, 'chūn'); assert.equal(parsed.words.length, 2); assert.equal(parsed.sentence.text, '春天到了。');
  const char = data.lessons[0].characters[0];
  char.char = '哼'; char.pinyin = 'hng'; char.examplesLabel = '用法示例';
  char.words = [{ word: '哼，我才不信', pinyin: '', meaning: '', kind: 'usage' }, { word: '哼，别想骗我', pinyin: '', meaning: '', kind: 'usage' }];
  char.sentence = { groupWord: char.words[0].word, text: '他生气地说：“哼，我才不信！”' };
  const usage = parseWritingTable(data, data.bookId, 1)[0].chars[0];
  assert.equal(usage.examplesLabel, '用法示例'); assert.equal(usage.pinyin, 'hng');
  delete char.examplesLabel;
  assert.throws(() => parseWritingTable(data, data.bookId, 1), /组词/);
  for (const corrupt of [d => { d.lessons[0].characters[0].words.pop(); }, d => { d.lessons[0].characters[0].sentence.groupWord = '夏天'; }]) {
    const invalid = supportFixture(); corrupt(invalid); assert.throws(() => parseWritingTable(invalid, invalid.bookId, 1), /组词/);
  }
});

test('a word-study dialog has whole-word reading and per-character local demos/practice, with no grading when closed', () => {
  const nodes = new Map();
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { clientWidth: 160, textContent: '', listeners: {}, addEventListener(type, callback) { this.listeners[type] = callback; }, replaceChildren() {} });
    return nodes.get(selector);
  };
  const dialog = { innerHTML: '', listeners: {}, querySelector: node, setAttribute() {}, addEventListener(type, callback) { this.listeners[type] = callback; }, showModal() {}, close() {}, remove() {} };
  const quizzes = [];
  const demos = [];
  let spoken;
  let focused = 0;
  const loader = () => {};
  const scope = vm.createContext({
    studySession: null, lessons: [], window: { HanziWriter: true, XuebabangbangStrokeData: { charDataLoader: loader } },
    document: { createElement: () => dialog, body: { appendChild() {} } }, escapeHtml: s => s, escapeAttr: s => s,
    playHumanChinese: word => { spoken = word; },
    HanziWriter: { create(target, char, options) { assert.equal(options.charDataLoader, loader); return { animateCharacter: () => demos.push(char), quiz: options => quizzes.push(options.onComplete) }; } }
  });
  vm.runInContext(app.slice(app.indexOf('function openWordStudy('), app.indexOf('function renderDictationPreview(')), scope);
  scope.openWordStudy({ word: '音乐', lessonTitle: '测试课', pinyin: '' }, { isConnected: true, focus() { focused++; } });
  assert.deepEqual(demos, ['音', '乐']);
  node('.study-listen').listeners.click(); assert.equal(spoken, '音乐');
  node('[data-study-practice="1"]').listeners.click(); assert.equal(quizzes.length, 1);
  const status = node('[data-study-status="1"]'); const before = status.textContent;
  node('.close-study').listeners.click();
  assert.doesNotThrow(() => quizzes[0]()); assert.equal(status.textContent, before); assert.equal(focused, 1);
});

test('welcome no longer advertises old books while the original catalog and records remain addressable', () => {
  const html = fs.readFileSync(path.join(root, 'welcome.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'welcome.js'), 'utf8');
  assert.doesNotMatch(html, /以前的教材|legacy-book-selector|原有课内组词/);
  assert.doesNotMatch(js, /legacyBookSelector/);
  assert.match(js, /!book\.legacy/);
});

test('preview exposes an accessible triangle warning, separates review/new words, and starts without losing legacy results', () => {
  const events = new Map();
  const buttons = new Map();
  const button = selector => {
    if (!buttons.has(selector)) buttons.set(selector, { addEventListener(type, callback) { events.set(selector + ':' + type, callback); } });
    return buttons.get(selector);
  };
  const state = { date: '2026-11-06', size: 15, started: true, ids: ['review', 'new'], reviewIds: ['review'], results: { review: 'unknown' } };
  let saved;
  let rendered = 0;
  const scope = vm.createContext({
    dictationDetail: { innerHTML: '', querySelector: button, querySelectorAll: () => [] },
    window: { HANZI_DICTATION: scheduler }, localStorage: { setItem(key, value) { saved = JSON.parse(value); } },
    escapeHtml: s => s, escapeAttr: s => s, getDailyDictationProgress: () => ({ review: { lastResult: 'unknown', lastReviewed: '2026-11-05' } }),
    getTodayQueueState: () => state, todayKey: () => '2026-11-06', dailyDictationQueueKey: () => 'same-v4-key',
    dictationPhase: 'preview', renderDailyDictation: () => { rendered++; }, getDailyQueue() {}
  });
  vm.runInContext(app.slice(app.indexOf('function renderDictationPreview('), app.indexOf('function renderDailyDictation(')), scope);
  scope.renderDictationPreview([{ id: 'review', word: '春风', lessonTitle: '第一课' }, { id: 'new', word: '春天', lessonTitle: '第二课' }], state);
  const html = scope.dictationDetail.innerHTML;
  assert.match(html, /复习词/); assert.match(html, /待学词/);
  assert.match(html, /<svg aria-hidden="true"/); assert.match(html, /fill="white"/); assert.match(html, /错词强化复习：/);
  assert.match(html, /id="dictation-size" disabled/); assert.match(html, /15词（今日原有）/);
  events.get('.begin-dictation:click')();
  assert.deepEqual(saved.results, state.results); assert.deepEqual(saved.ids, state.ids);
  assert.equal(scope.dictationPhase, 'test'); assert.equal(rendered, 1);
});
