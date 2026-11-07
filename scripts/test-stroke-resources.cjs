const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createStrokeDataLoader } = require('../stroke-resources.js');
const { buildStatic, collectCurriculum } = require('./build-static.cjs');
const root = path.resolve(__dirname, '..');
const sample = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/hanzi-writer-data/一.json'), 'utf8'));
const load = (loader, character) => new Promise((resolve, reject) => {
  assert.equal(loader(character, resolve, reject), undefined, 'Writer 2.0.2 must receive callbacks, not a Promise returned as character data');
});

test('concurrent and repeated character requests share validated data at each supported site prefix', async () => {
  for (const base of ['https://hanzi.xuebabangbang.cn/index.html?book=2026-1-upper', 'https://xuebabangbang.cn/hanzi/index.html', 'https://134.175.136.31/hanzi/index.html']) {
    const calls = [];
    const loader = createStrokeDataLoader(async (url, options) => {
      calls.push([url, options.cache]);
      return { ok: true, json: async () => sample };
    }, base);
    const result = await Promise.all([load(loader, '一'), load(loader, '一')]);
    assert.equal(result[0], sample); assert.equal(result[1], sample);
    assert.equal(await load(loader, '一'), sample);
    assert.deepEqual(calls, [[new URL('vendor/hanzi-data/%E4%B8%80.json', base).href, 'no-cache']]);
  }
});

test('network, HTTP, JSON and shape failures are not cached and can recover on the next attempt', async () => {
  const failures = [
    () => { throw new Error('offline'); },
    () => ({ ok: false, status: 404 }),
    () => ({ ok: true, json: async () => { throw new SyntaxError('bad JSON'); } }),
    () => ({ ok: true, json: async () => ({ strokes: [], medians: [] }) }),
    () => ({ ok: true, json: async () => ({ ...sample, medians: [[[NaN, 1], [2, 3]]] }) })
  ];
  for (const failure of failures) {
    let attempts = 0;
    const loader = createStrokeDataLoader(async () => ++attempts === 1 ? failure() : { ok: true, json: async () => sample }, 'https://example.com/hanzi/index.html');
    await assert.rejects(load(loader, '一'));
    assert.equal(await load(loader, '一'), sample);
    assert.equal(attempts, 2);
  }
  const loader = createStrokeDataLoader(() => assert.fail('invalid input must not reach the network'), 'https://example.com/');
  await assert.rejects(load(loader, '../.env'));
});

test('the pinned actual Writer 2.0.2 accepts the local callback loader and reports failures before a retry', async () => {
  const HanziWriter = require('hanzi-writer');
  assert.equal(require('hanzi-writer/package.json').version, '2.0.2');
  let attempts = 0;
  let errors = 0;
  let successes = 0;
  const loader = createStrokeDataLoader(async () => ++attempts === 1 ? { ok: false, status: 503 } : { ok: true, json: async () => sample }, 'https://example.com/hanzi/');
  const options = { charDataLoader: loader, onLoadCharDataError: () => { errors++; }, onLoadCharDataSuccess: () => { successes++; } };
  assert.equal(await HanziWriter.loadCharacterData('一', options), undefined);
  assert.equal(errors, 1); assert.equal(successes, 0);
  assert.equal(await HanziWriter.loadCharacterData('一', options), sample);
  assert.equal(errors, 1); assert.equal(successes, 1);
});

test('practice failure after leaving the view updates only its captured status and never grants self assessment', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const oldStatus = { textContent: '' };
  let options;
  let modalCount = 0;
  let quiz;
  const nodes = { 'practice-status': oldStatus, 'practice-target': { clientWidth: 160, addEventListener() {} } };
  const scope = vm.createContext({
    currentLessonIndex: 0, currentCharIndex: 0, viewEpoch:0, activeView:'learning', invalidateStudyView:()=>++scope.viewEpoch, charDetail: { innerHTML: '', querySelector: () => ({ addEventListener() {} }) },
    document: { getElementById: id => nodes[id] }, window: { HanziWriter: true, XuebabangbangStrokeData: { charDataLoader() {} } },
    HanziWriter: { create: (target, char, settings) => { options = settings; return { quiz: settings => { quiz = settings; } }; } },
    escapeHtml: s => s, escapeAttr: s => s, openSelfAssessmentModal: () => { modalCount++; },
    savePracticeProgress: () => assert.fail('loading or writing alone cannot change learning records'), renderCharList() {}, renderDetail() {}
  });
  vm.runInContext(app.slice(app.indexOf('function renderCharacterPractice('), app.indexOf('function animateStrokes(')), scope);
  scope.renderCharacterPractice({ char: '一' });
  assert.equal(options.charDataLoader, scope.window.XuebabangbangStrokeData.charDataLoader);
  delete nodes['practice-status'];
  assert.doesNotThrow(() => options.onLoadCharDataError(new Error('offline')));
  assert.match(oldStatus.textContent, /重新书写/);
  assert.equal(modalCount, 0);
  scope.viewEpoch++;
  quiz.onComplete();
  assert.equal(modalCount, 0,'a stale quiz cannot open self assessment after leaving its view');
});

test('build covers the exact current and legacy sources, publishes only runtime files, and blocks missing or broken data', async t => {
  const curriculum = collectCurriculum(root);
  assert.ok(curriculum.current.length >= 2405);
  assert.ok(curriculum.characters.length >= 2480);
  const parent = path.resolve(root, '../ops/hanzi-local-strokes-20261105/developer-tests');
  fs.mkdirSync(parent, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(parent, 'case-'));
  t.after(() => {
    assert.equal(path.dirname(fixture), parent);
    assert.ok(path.basename(fixture).startsWith('case-'));
    fs.rmSync(fixture, { recursive: true, force: true });
  });
  function copy(from, relative) {
    const target = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(from, target);
  }
  curriculum.files.forEach(file => copy(path.join(root, file), file));
  for (const name of ['hanzi-writer', 'hanzi-writer-data', 'pinyin-pro']) copy(path.join(root, 'node_modules', name, 'package.json'), `node_modules/${name}/package.json`);
  for (const relative of ['hanzi-writer/dist/hanzi-writer.min.js', 'hanzi-writer/LICENSE', 'hanzi-writer/COPYING.md', 'hanzi-writer-data/ARPHICPL.TXT', 'pinyin-pro/dist/index.js', 'pinyin-pro/LICENSE', ...curriculum.characters.map(char => `hanzi-writer-data/${char}.json`)]) {
    copy(path.join(root, 'node_modules', relative), 'node_modules/' + relative);
  }
  // A worktree's .git is a file. Neither it nor any arbitrary internal file may be published.
  for (const relative of ['.git', '.env', '.agents/internal.txt', 'scripts/internal.js', 'writing-tables/source-checks.json', 'word-tables/source-checks.json', 'README.md']) {
    const target = path.join(fixture, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, 'private-test-marker');
  }
  const built = buildStatic({ root: fixture });
  assert.equal(built.currentRequired, curriculum.current.length); assert.equal(built.copied, curriculum.characters.length); assert.deepEqual(built.missing, []);
  const out = path.join(fixture, 'dist');
  const listed = fs.readdirSync(out, { recursive: true }).filter(file => fs.statSync(path.join(out, file)).isFile()).map(file => file.replaceAll('\\', '/'));
  const expected = [...curriculum.files, 'vendor/hanzi-writer.min.js', 'vendor/pinyin-pro.js', 'vendor/HANZI-WRITER-LICENSE.txt', 'vendor/HANZI-WRITER-COPYING.md', 'vendor/ARPHICPL.TXT', 'vendor/PINYIN-PRO-LICENSE.txt', 'vendor/hanzi-data/manifest.json', ...curriculum.characters.map(char => `vendor/hanzi-data/${char}.json`)];
  assert.deepEqual(listed.sort(), expected.sort());
  assert.equal(fs.readFileSync(path.join(out, 'cloud-config.js'), 'utf8'), fs.readFileSync(path.join(root, 'cloud-config.js'), 'utf8'));
  const before = fs.readFileSync(path.join(out, 'vendor/hanzi-data/manifest.json'));
  const readingsFile = path.join(fixture, 'dictation-pinyin-data.js');
  const originalReadings = fs.readFileSync(readingsFile);
  fs.unlinkSync(readingsFile);
  assert.throws(() => buildStatic({ root: fixture }), /ENOENT/);
  fs.writeFileSync(readingsFile, originalReadings);
  const readingScope = { window: {} };
  vm.runInNewContext(originalReadings.toString(), readingScope);
  delete readingScope.window.HANZI_DICTATION_PINYIN_DATA.readings.古老;
  fs.writeFileSync(readingsFile, 'window.HANZI_DICTATION_PINYIN_DATA=' + JSON.stringify(readingScope.window.HANZI_DICTATION_PINYIN_DATA));
  assert.throws(() => buildStatic({ root: fixture }), /听写拼音缺失或格式错误/);
  assert.deepEqual(fs.readFileSync(path.join(out, 'vendor/hanzi-data/manifest.json')), before);
  fs.writeFileSync(readingsFile, originalReadings);
  const glyph = path.join(fixture, 'node_modules/hanzi-writer-data/乏.json');
  const original = fs.readFileSync(glyph);
  fs.unlinkSync(glyph);
  assert.throws(() => buildStatic({ root: fixture }), /缺失或损坏的必需笔画: 乏/);
  assert.deepEqual(fs.readFileSync(path.join(out, 'vendor/hanzi-data/manifest.json')), before, 'failed preflight preserves the previous complete build');
  fs.writeFileSync(glyph, JSON.stringify({ strokes: ['M 0 0'], medians: [] }));
  assert.throws(() => buildStatic({ root: fixture }), /缺失或损坏的必需笔画: 乏/);
  fs.writeFileSync(glyph, original);
  // A newly supplied study word must also have local stroke data; UI/source text alone is not a source.
  const extra = fs.readdirSync(path.join(root, 'node_modules/hanzi-writer-data')).filter(file => /^[\u3400-\u9fff]\.json$/.test(file)).map(file => file.slice(0, -5)).find(char => !curriculum.characters.includes(char));
  const writingFile = path.join(fixture, 'writing-tables/2026-1-upper.json');
  const originalWriting = fs.readFileSync(writingFile);
  const writing = JSON.parse(originalWriting);
  const entry = writing.lessons[0].characters[0];
  delete entry.examplesLabel;
  entry.words = [{ word: entry.char + extra, pinyin: '', meaning: '' }, { word: entry.char + '人', pinyin: '', meaning: '' }];
  entry.sentence = { groupWord: entry.words[0].word, text: entry.words[0].word + '。' };
  fs.writeFileSync(writingFile, JSON.stringify(writing));
  assert.ok(collectCurriculum(fixture).current.includes(extra));
  assert.throws(() => buildStatic({ root: fixture }), new RegExp('缺失或损坏的必需笔画: ' + extra));
  fs.writeFileSync(writingFile, originalWriting);
  fs.writeFileSync(path.join(fixture, 'word-tables/2026-2-upper.json'), '{broken');
  assert.throws(() => buildStatic({ root: fixture }), SyntaxError);
  assert.deepEqual(fs.readFileSync(path.join(out, 'vendor/hanzi-data/manifest.json')), before);
});
