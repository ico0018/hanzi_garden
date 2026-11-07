const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { applyReadings, findReading } = require('../dictation-readings.js');
const { createSequence } = require('../word-study-sequence.js');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('checked whole-word readings use context first and preserve neutral/erhua without character fallbacks or changed identity', () => {
  const data = { schemaVersion: 1, readings: { 便宜: 'pián yi', 孩子: 'hái zi', 哪儿: 'nǎr' }, contextReadings: { 'book|reading-2|便宜': 'biàn yí' } };
  const items = [{ id: 'stable-id', lessonKey: 'reading-2', word: '便宜', pinyin: '' }, { id: 'stable-erhua', word: '哪儿', pinyin: '' }];
  const original = JSON.stringify(items);
  const annotated = applyReadings(items, 'book', data);
  assert.deepEqual(annotated.map(item => item.pinyin), ['biàn yí', 'nǎr']);
  assert.deepEqual(annotated.map(item => item.id), items.map(item => item.id));
  assert.equal(JSON.stringify(items), original);
  assert.equal(findReading(data, 'other', { word: '便宜' }), 'pián yi');
  assert.equal(findReading(data, 'other', { word: '孩子' }), 'hái zi');
  for (const unavailable of [undefined, { ...data, schemaVersion: 2 }, { schemaVersion: 1, readings: { 便宜: '<img src=x>' } }]) {
    assert.equal(applyReadings([{ word: '便宜', pinyin: 'unreviewed fallback' }], 'book', unavailable)[0].pinyin, '');
  }
  assert.equal(findReading(data, 'book', { word: '缺词' }), '');
});

test('all 2168 textbook items and the original 28-word bank have checked whole-word hints', () => {
  const scope = { window: {} };
  for (const file of ['book-catalog.js', 'daily-word-bank.js', 'dictation-pinyin-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), scope);
  const data = scope.window.HANZI_DICTATION_PINYIN_DATA;
  const bank = scope.window.HANZI_DAILY_WORD_BANK;
  let count = 0;
  for (const book of Object.values(scope.window.HANZI_BOOK_CATALOG).filter(book => !book.legacy && book.wordTableFile)) {
    const table = JSON.parse(fs.readFileSync(path.join(root, book.wordTableFile), 'utf8'));
    const items = bank.parseTextbookWordTable(table, book.id).items;
    assert.ok(items.every(item => findReading(data, book.id, item)), book.id);
    assert.deepEqual(Array.from(applyReadings(items, book.id, data), item => item.id), Array.from(items, item => item.id));
    count += items.length;
  }
  assert.equal(count, 2168);
  const words = bank.parseDailyWordBank(fs.readFileSync(path.join(root, '每日词语听写题库.txt'), 'utf8'));
  const oldItems = bank.createDailyDictationItems('3-upper', words);
  assert.equal(oldItems.length, 28); assert.ok(oldItems.every(item => findReading(data, '3-upper', item)));
  assert.equal(data.readings.古老, 'gǔ lǎo');
  assert.equal(data.readings.轰隆隆, 'hōng lōng lōng');
});

test('the actual daily loader annotates new and legacy banks without changing their source or losing missing-data recovery', async () => {
  const source = JSON.parse(fs.readFileSync(path.join(root, 'word-tables/2026-3-upper.json'), 'utf8'));
  const original = JSON.stringify(source);
  const box = { window: {} };
  for (const file of ['daily-word-bank.js', 'dictation-pinyin-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), box);
  const scope = vm.createContext({
    BOOK_CATALOG: { '2026-3-upper': { wordTableFile: 'word-tables/2026-3-upper.json' } },
    DAILY_DICTATION_BANK_FILES: { '3-upper': '每日词语听写题库.txt' },
    dailyDictationItems: [], dailyDictationTable: null, dailyDictationBankStatus: '',
    window: { ...box.window, HANZI_DICTATION_READINGS: { applyReadings } },
    fetch: async () => ({ ok: true, json: async () => source, text: async () => fs.readFileSync(path.join(root, '每日词语听写题库.txt'), 'utf8') })
  });
  vm.runInContext(app.slice(app.indexOf('async function loadDailyDictationWordBank('), app.indexOf('function stableItemId(')), scope);
  await scope.loadDailyDictationWordBank('2026-3-upper');
  assert.equal(scope.dailyDictationItems.length, 250); assert.ok(scope.dailyDictationItems.every(item => item.pinyin));
  const ids = Array.from(scope.dailyDictationItems, item => item.id);
  assert.equal(JSON.stringify(source), original);
  scope.window.HANZI_DICTATION_PINYIN_DATA = undefined;
  await scope.loadDailyDictationWordBank('2026-3-upper');
  assert.equal(scope.dailyDictationBankStatus, 'ready'); assert.ok(scope.dailyDictationItems.every(item => item.pinyin === ''));
  assert.deepEqual(Array.from(scope.dailyDictationItems, item => item.id), ids);
  scope.window.HANZI_DICTATION_PINYIN_DATA = box.window.HANZI_DICTATION_PINYIN_DATA;
  await scope.loadDailyDictationWordBank('3-upper');
  assert.equal(scope.dailyDictationItems.length, 28); assert.ok(scope.dailyDictationItems.every(item => item.pinyin));
});

function dictationScope(pinyin) {
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, { hidden: true, clientWidth: 160, listeners: {}, parentElement: { classList: { add() {} } }, classList: { add() {} }, addEventListener(type, callback) { this.listeners[type] = callback; }, setAttribute() {} });
    return nodes.get(key);
  };
  const scope = vm.createContext({
    dailyDictationBankStatus: 'ready', dailyDictationTable: null, viewEpoch: 0, activeView: 'dictation', dictationPhase: 'test',
    invalidateStudyView: () => ++scope.viewEpoch, todayKey: () => '2026-11-07',
    dictationOverview: { innerHTML: '', appendChild() {} }, dictationDetail: { innerHTML: '', querySelector: node },
    getDailyQueue: () => [{ id: 'old-id', word: '古老', pinyin, lessonTitle: '第一课' }], getTodayQueueState: () => ({ started: true, results: {} }),
    document: { createElement: () => node('back'), getElementById: node }, window: {}, cacheHumanAudio() {},
    playHumanChinese() {}
  });
  vm.runInContext(app.slice(app.indexOf('function escapeHtml('), app.indexOf('function loadSpeechVoices(')), scope);
  vm.runInContext(app.slice(app.indexOf('function renderDailyDictation('), app.indexOf('function renderLessons(')), scope);
  return { scope, node };
}
test('dictation pinyin is visible before the hidden character answer; missing hints are explicit and never reveal the answer', () => {
  for (const pinyin of ['gǔ lǎo', '']) {
    const { scope, node } = dictationScope(pinyin);
    scope.renderDailyDictation();
    const html = scope.dictationDetail.innerHTML;
    const answerAt = html.indexOf('<div class="dictation-answer" hidden>');
    assert.ok(answerAt > 0);
    const visible = html.slice(0, answerAt);
    assert.doesNotMatch(visible, /古老/);
    assert.ok(visible.includes(pinyin || '拼音暂不可用'));
    assert.match(visible, /class="dictation-pinyin"/);
    node('.reveal-dictation').listeners.click();
    assert.equal(node('.dictation-answer').hidden, false);
    assert.equal(node('.reveal-dictation').textContent, '隐藏汉字答案');
  }
});

test('a four-character sequence starts only after each real completion, preserving completed earlier characters', async () => {
  const created = [], work = [], completed = [];
  let finished = 0;
  const sequence = createSequence({
    createWriter(index) { created.push(index); const job = deferred(); work.push(job); return { animateCharacter: () => job.promise }; },
    onStepComplete: index => completed.push(index), onFinished: () => { finished++; }
  });
  const playing = sequence.play([0, 1, 2, 3]);
  assert.deepEqual(created, [0]);
  for (let index = 0; index < 4; index++) {
    assert.deepEqual(created, Array.from({ length: index + 1 }, (_, i) => i));
    work[index].resolve({ canceled: false }); await tick();
    assert.deepEqual(completed, Array.from({ length: index + 1 }, (_, i) => i));
  }
  await playing; assert.equal(finished, 1);
});

test('replay, practice cancellation, close and load failure cannot continue an old sequence', async () => {
  const jobs = [], created = []; let stopped = 0;
  const sequence = createSequence({ createWriter(index) {
    const job = deferred(); jobs.push(job); created.push(index);
    return { animateCharacter: () => job.promise, cancelQuiz: () => { stopped++; }, hideCharacter: () => Promise.resolve({ canceled: false }) };
  } });
  const old = sequence.play([0, 1, 2]); const replay = sequence.play([0, 1]);
  jobs[0].resolve({ canceled: false }); await old;
  assert.deepEqual(created, [0, 0]);
  jobs[1].resolve({ canceled: false }); await tick(); assert.deepEqual(created, [0, 0, 1]);
  sequence.dispose(); jobs[2].resolve({ canceled: false }); await replay;
  assert.deepEqual(created, [0, 0, 1]); assert.ok(stopped >= 2);
  for (const result of [undefined, { canceled: true }]) {
    const started = [];
    await createSequence({ createWriter(index) { started.push(index); return { animateCharacter: () => Promise.resolve(result) }; } }).play([0, 1]);
    assert.deepEqual(started, [0]);
  }
  let errors = 0;
  await createSequence({ createWriter() { return { animateCharacter() { throw new Error('already failed data'); } }; }, onError() { errors++; } }).play([0, 1]);
  assert.equal(errors, 1);
});

test('the actual pinned Writer 2.0.2 Promise retains completion/cancellation results and distinguishes failed loading', async () => {
  const Writer = require('hanzi-writer');
  assert.equal(require('hanzi-writer/package.json').version, '2.0.2');
  for (const canceled of [false, true]) {
    let callback;
    const result = { canceled };
    const writer = { cancelQuiz() {}, _character: { strokes: [{ strokeNum: 0, getLength: () => 100 }] }, _options: { strokeFadeDuration: 0, strokeAnimationSpeed: 1, delayBetweenStrokes: 0 }, _withData: task => Promise.resolve().then(task), _renderState: { run: () => Promise.resolve(result) } };
    const outcome = await Writer.prototype.animateCharacter.call(writer, { onComplete(value) { callback = value; } });
    assert.equal(callback, result); assert.equal(outcome, result);
  }
  const failedWhileLoading = { cancelQuiz() {}, _withData: () => Promise.resolve(undefined) };
  assert.equal(await Writer.prototype.animateCharacter.call(failedWhileLoading), undefined);
  const alreadyFailed = { cancelQuiz() {}, _withData() { throw new Error('failed data'); } };
  assert.throws(() => Writer.prototype.animateCharacter.call(alreadyFailed), /failed data/);
});

test('modal replay uses fresh mounts, leaves future grids blank, and stale word/practice callbacks cannot update the new dialog', async () => {
  const dialogs = [], records = [];
  function newDialog() {
    const nodes = new Map();
    const node = key => {
      if (!nodes.has(key)) nodes.set(key, { clientWidth: 150, textContent: '', style: {setProperty(name,value){this[name]=value;}}, children: [], listeners: {}, addEventListener(type, callback) { this.listeners[type] = callback; }, replaceChildren(...children) { this.children = children; } });
      return nodes.get(key);
    };
    const dialog = { innerHTML: '', querySelector: node, setAttribute() {}, addEventListener() {}, showModal() {}, close() {}, remove() {}, node };
    dialogs.push(dialog); return dialog;
  }
  const scope = vm.createContext({
    studySession: null, lessons: [], viewEpoch: 0,
    window: { HanziWriter: true, XuebabangbangStrokeData: { charDataLoader() {} }, HANZI_WORD_STUDY_SEQUENCE: { createSequence } },
    document: { createElement: tag => tag === 'dialog' ? newDialog() : {}, body: { appendChild() {} }, querySelectorAll: () => [] },
    escapeHtml: s => s, escapeAttr: s => s, playHumanChinese() {},
    saveManualDictationResult: () => assert.fail('study must not grade dictation'), openSelfAssessmentModal: () => assert.fail('study must not open grading'),
    HanziWriter: { create(mount, char, options) {
      assert.equal(options.showCharacter, false); assert.equal(options.showOutline, false);
      const record = { mount, char, options, job: deferred() }; records.push(record);
      return { animateCharacter: () => record.job.promise, cancelQuiz() {}, hideCharacter: () => Promise.resolve({ canceled: false }), quiz(options) { record.quiz = options; } };
    } }
  });
  vm.runInContext(app.slice(app.indexOf('function renderHelpDetails('), app.indexOf('function loadSpeechVoices(')), scope);
  vm.runInContext(app.slice(app.indexOf('function invalidateStudyView('), app.indexOf('function escapeHtml(')), scope);
  vm.runInContext(app.slice(app.indexOf('function openWordStudy('), app.indexOf('function renderDictationPreview(')), scope);
  scope.openWordStudy({ word: '古老', lessonTitle: '课文', pinyin: 'gǔ lǎo' });
  assert.deepEqual(records.map(record => record.char), ['古']);
  const firstDialog = dialogs[0]; assert.equal(firstDialog.node('#study-character-1').children.length, 0);
  let prevented = 0;
  firstDialog.node('#study-character-0').listeners.touchmove({ preventDefault() { prevented++; } });
  assert.equal(prevented, 0, 'stroke viewing must allow local horizontal swiping');
  firstDialog.node('.study-replay').listeners.click();
  assert.notEqual(records[0].mount, records[1].mount);
  records[0].job.resolve({ canceled: false }); await tick();
  assert.deepEqual(records.map(record => record.char), ['古', '古']);
  firstDialog.node('[data-study-practice="1"]').listeners.click();
  assert.equal(firstDialog.node('#study-character-1').style.touchAction, 'none');
  firstDialog.node('#study-character-1').listeners.touchmove({ preventDefault() { prevented++; } });
  assert.equal(prevented, 1, 'active handwriting must prevent a swipe from scrolling the grid');
  records[1].job.resolve({ canceled: false }); await tick();
  assert.deepEqual(records.map(record => record.char), ['古', '古', '老']);
  const oldPractice = records[2].quiz;
  scope.openWordStudy({ word: '年轻', lessonTitle: '课文', pinyin: 'nián qīng' });
  const newStatus = dialogs[1].node('.study-sequence-status'); const before = newStatus.textContent;
  oldPractice.onComplete(); records[1].options.onLoadCharDataError();
  assert.equal(newStatus.textContent, before);
  scope.invalidateStudyView(); records[3].job.resolve({ canceled: false }); await tick();
  assert.deepEqual(records.map(record => record.char), ['古', '古', '老', '年']);
});

test('phone first-open and desktop-to-phone resizing use actual content width and fresh Writer coordinates', async () => {
  for (const initialWidth of [292.66, 760]) {
    let width = initialWidth, resize, disconnected = false;
    const records = [], nodes = new Map();
    const node = key => {
      if (!nodes.has(key)) {
        const value = { textContent: '', style: { setProperty(name, value) { this[name] = value; } }, children: [], listeners: {}, addEventListener(type, callback) { this.listeners[type] = callback; }, replaceChildren(...children) { this.children = children; }, getBoundingClientRect: () => ({ width }) };
        Object.defineProperty(value, 'clientWidth', { get: () => key === '.study-word-scroll' ? Math.round(width) : key.startsWith('#study-character-') ? parseInt(node('.study-word-grids').style['--study-cell']) - 6 : 160 });
        nodes.set(key, value);
      }
      return nodes.get(key);
    };
    const dialog = { querySelector: node, setAttribute() {}, addEventListener() {}, showModal() {}, close() {}, remove() {} };
    const scope = vm.createContext({ studySession: null, lessons: [], window: { HanziWriter: true, XuebabangbangStrokeData: { charDataLoader() {} }, HANZI_WORD_STUDY_SEQUENCE: { createSequence }, ResizeObserver: class { constructor(callback) { resize = callback; } observe() {} disconnect() { disconnected = true; } } }, document: { createElement: tag => tag === 'dialog' ? dialog : {}, body: { appendChild() {} } }, escapeHtml: value => value, escapeAttr: value => value, playHumanChinese() {}, HanziWriter: { create(mount, char, options) { const record = { mount, char, options, job: deferred() }; records.push(record); return { animateCharacter: () => record.job.promise, cancelQuiz() {}, hideCharacter: () => Promise.resolve({ canceled: false }) }; } } });
    vm.runInContext(app.slice(app.indexOf('function renderHelpDetails('), app.indexOf('function loadSpeechVoices(')), scope);
    vm.runInContext(app.slice(app.indexOf('function openWordStudy('), app.indexOf('function renderDictationPreview(')), scope);
    scope.openWordStudy({ word: '古老', lessonTitle: '课文', pinyin: 'gǔ lǎo' });
    const expected = () => Math.min(180, Math.floor((Math.floor(width) + 3) / 2));
    assert.equal(records[0].options.width, expected() - 6);
    resize(); assert.equal(records.length, 1, 'unchanged dimensions must not restart');
    if (initialWidth > 300) {
      width = 292.66; resize();
      assert.equal(records.length, 2); assert.notEqual(records[0].mount, records[1].mount);
      records[0].job.resolve({ canceled: false }); await tick();
      assert.equal(records.length, 2, 'old resized animation cannot start the next glyph');
    }
    assert.ok(2 * expected() - 3 <= width, 'both shared-border cells fit the actual scroller');
    const current = records.at(-1); assert.equal(current.options.width, expected() - 6);
    current.job.resolve({ canceled: false }); await tick();
    assert.equal(records.at(-1).char, '老'); assert.equal(records.at(-1).options.width, expected() - 6);
    node('.close-study').listeners.click(); assert.equal(disconnected, true);
    const count = records.length; width = 760; resize(); records.at(-1).job.resolve({ canceled: false }); await tick();
    assert.equal(records.length, count);
  }
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /\.study-word-scroll[^}]*overflow-x: auto/);
  assert.match(css, /\.study-grid \+ \.study-grid[^}]*margin-left: -3px/);
});

test('concise headings keep book names and controls while help stays natively closed', () => {
  const nodes = Object.fromEntries(['book-selector', 'book-selection-status', 'start-learning-button'].map(id => [id, { innerHTML: '', textContent: '', addEventListener() {}, querySelectorAll: () => [] }]));
  const welcome = vm.createContext({ window: { HANZI_BOOK_CATALOG: { book: { id: 'book', label: '三年级上册', edition: '2026年版', characterCount: 250, available: true } } }, document: { getElementById: id => nodes[id] } });
  vm.runInContext(fs.readFileSync(path.join(root, 'welcome.js'), 'utf8'), welcome);
  assert.equal(nodes['book-selection-status'].textContent, '当前选择：三年级上册');
  assert.match(nodes['book-selector'].innerHTML, /250 个生字/); assert.doesNotMatch(nodes['book-selector'].innerHTML, /2026年版/);
  const scope = vm.createContext({ escapeHtml: value => value, escapeAttr: value => value });
  vm.runInContext(app.slice(app.indexOf('function renderHelpDetails('), app.indexOf('function loadSpeechVoices(')), scope);
  const html = scope.renderHelpDetails('学习说明', '<p>按顺序练习。</p>');
  assert.match(html, /<summary aria-label="学习说明">/); assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'welcome.html'), 'utf8').replace(/<script[\s\S]*?<\/script>|<link[^>]*>/g, ''), /2026|v3\.2/);
});
