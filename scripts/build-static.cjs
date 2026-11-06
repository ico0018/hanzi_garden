const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { validateStrokeData } = require('../stroke-resources.js');

const VERSIONS = { 'hanzi-writer': '2.0.2', 'hanzi-writer-data': '2.0.1', 'pinyin-pro': '3.18.2' };
const SITE_FILES = [
  'index.html', 'welcome.html', 'parent.html', 'styles.css', 'cloud-ui.css',
  'app.js', 'welcome.js', 'book-catalog.js', 'writing-tables.js', 'daily-word-bank.js',
  'stroke-resources.js', 'dictation-scheduler.js', 'cloud-config.js', 'cloud-sync.js', 'cloud-ui.js'
];
const LEGACY_FILES = {
  '1-upper': ['生字数据_一年级上册.txt', 100], '2-upper': ['生字数据_二年级上册.txt', 250],
  '3-upper': ['生字数据.txt', 250], '4-upper': ['生字数据_四年级上册.txt', 250]
};

function readFile(root, relative) {
  const full = path.resolve(root, relative);
  if (!full.startsWith(path.resolve(root) + path.sep) || !fs.lstatSync(full).isFile()) {
    throw new Error('资源必须是站内普通文件: ' + relative);
  }
  return fs.readFileSync(full);
}

function collectCurriculum(root) {
  const scope = { window: {} };
  vm.runInNewContext(readFile(root, 'book-catalog.js').toString(), scope);
  vm.runInNewContext(readFile(root, 'daily-word-bank.js').toString(), scope);
  const { parseWritingTable } = require(path.join(root, 'writing-tables.js'));
  const catalog = scope.window.HANZI_BOOK_CATALOG;
  const bank = scope.window.HANZI_DAILY_WORD_BANK;
  const current = new Set();
  const legacy = new Set();
  const files = new Set(SITE_FILES);
  const books = [];
  function add(characters, text) {
    for (const char of String(text).match(/[\u3400-\u9fff]/g) || []) characters.add(char);
  }
  let writingTotal = 0;
  let wordTotal = 0;
  for (let grade = 1; grade <= 6; grade++) {
    for (const term of ['upper', 'lower']) {
      const id = `2026-${grade}-${term}`;
      const book = catalog[id];
      const file = `writing-tables/${id}.json`;
      if (!book?.available || book.legacy || book.dataFormat !== 'writing-json-v1' || book.dataFile !== file) {
        throw new Error('当前教材目录不完整: ' + id);
      }
      const lessons = parseWritingTable(JSON.parse(readFile(root, file)), id, book.characterCount);
      files.add(file);
      const writingCount = lessons.reduce((total, lesson) => total + lesson.chars.length, 0);
      writingTotal += writingCount;
      lessons.forEach(lesson => lesson.chars.forEach(item => {
        add(current, item.char);
        item.words.forEach(word => add(current, word.word));
      }));
      let wordCount = 0;
      if (grade === 1) {
        if (book.wordTableFile || book.wordTableStatus !== 'not-in-textbook') throw new Error('一年级无独立词语表状态不匹配');
      } else {
        const wordFile = `word-tables/${id}.json`;
        if (book.wordTableFile !== wordFile) throw new Error('教材词语表目录不完整: ' + id);
        const table = bank.parseTextbookWordTable(JSON.parse(readFile(root, wordFile)), id);
        files.add(wordFile);
        table.items.forEach(item => add(current, item.word));
        wordCount = table.total;
        wordTotal += wordCount;
      }
      books.push({ bookId: id, writingCount, wordCount });
    }
  }
  if (writingTotal !== 2500 || wordTotal !== 2168) throw new Error('当前教材总数不匹配');

  // Reuse the actual app parser, rather than collecting unrelated Chinese UI/source text.
  const app = readFile(root, 'app.js').toString();
  const start = app.indexOf('function parseLessonsText(');
  const end = app.indexOf('async function loadLessonsFromTxt(');
  if (start < 0 || end <= start) throw new Error('旧教材解析器未找到');
  vm.runInNewContext(app.slice(start, end), scope);
  for (const [id, [file, expectedCount]] of Object.entries(LEGACY_FILES)) {
    if (!catalog[id]?.available || !catalog[id].legacy || catalog[id].dataFile !== file) throw new Error('旧教材目录不匹配: ' + id);
    const text = readFile(root, file).toString();
    const lessons = scope.parseLessonsText(text);
    const entries = lessons.flatMap(lesson => lesson.chars);
    const sourceRows = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#') && !/^\[.*\]$/.test(line));
    if (entries.length !== expectedCount || entries.length !== sourceRows.length) throw new Error('旧教材数据不完整: ' + file);
    entries.forEach(item => {
      if (!/^[\u3400-\u9fff]$/.test(item.char) || !item.pinyin || !item.words.length) throw new Error('旧教材生字不完整');
      add(legacy, item.char);
      item.words.forEach(word => {
        if (!/^[\u3400-\u9fff]+$/.test(word.word)) throw new Error('旧教材词条不完整');
        add(legacy, word.word);
      });
    });
    files.add(file);
  }
  const dailyFile = '每日词语听写题库.txt';
  const dailyWords = bank.parseDailyWordBank(readFile(root, dailyFile).toString());
  if (!dailyWords.length || !dailyWords.every(word => /^[\u3400-\u9fff]+$/.test(word))) throw new Error('旧每日词库不完整');
  bank.createDailyDictationItems('3-upper', dailyWords).forEach(item => add(legacy, item.word));
  files.add(dailyFile);
  return { files: [...files], current: [...current].sort(), legacy: [...legacy].sort(), characters: [...new Set([...current, ...legacy])].sort(), books };
}

function buildStatic({ root = path.resolve(__dirname, '..'), dependencyRoot = path.join(root, 'node_modules') } = {}) {
  root = path.resolve(root);
  const curriculum = collectCurriculum(root);
  for (const [name, version] of Object.entries(VERSIONS)) {
    const info = JSON.parse(readFile(dependencyRoot, `${name}/package.json`));
    if (info.version !== version) throw new Error('本地依赖版本不匹配: ' + name);
  }
  const dependencies = [
    ['hanzi-writer/dist/hanzi-writer.min.js', 'vendor/hanzi-writer.min.js'],
    ['pinyin-pro/dist/index.js', 'vendor/pinyin-pro.js'],
    ['hanzi-writer/LICENSE', 'vendor/HANZI-WRITER-LICENSE.txt'],
    ['hanzi-writer-data/ARPHICPL.TXT', 'vendor/ARPHICPL.TXT'],
    ['hanzi-writer/COPYING.md', 'vendor/HANZI-WRITER-COPYING.md'],
    ['pinyin-pro/LICENSE', 'vendor/PINYIN-PRO-LICENSE.txt']
  ];
  const prepared = curriculum.files.map(file => [file, readFile(root, file)]);
  dependencies.forEach(([source, target]) => prepared.push([target, readFile(dependencyRoot, source)]));
  for (const character of curriculum.characters) {
    let raw;
    try {
      raw = readFile(dependencyRoot, `hanzi-writer-data/${character}.json`);
      validateStrokeData(JSON.parse(raw), character);
    } catch (error) {
      throw new Error('缺失或损坏的必需笔画: ' + character, { cause: error });
    }
    prepared.push([`vendor/hanzi-data/${character}.json`, raw]);
  }
  const manifest = {
    versions: VERSIONS, currentRequired: curriculum.current.length, legacyRequired: curriculum.legacy.length,
    copied: curriculum.characters.length, missing: [], characters: curriculum.characters, books: curriculum.books
  };
  prepared.push(['vendor/hanzi-data/manifest.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n')]);

  // Validate everything before replacing an old build. Delete only this root's fixed dist directory.
  const out = path.resolve(root, 'dist');
  if (path.dirname(out) !== root || path.basename(out) !== 'dist' || fs.lstatSync(out, { throwIfNoEntry: false })?.isSymbolicLink()) {
    throw new Error('不安全的构建输出目录');
  }
  fs.rmSync(out, { recursive: true, force: true });
  for (const [relative, data] of prepared) {
    const target = path.join(out, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
  return manifest;
}

module.exports = { buildStatic, collectCurriculum, SITE_FILES, VERSIONS };
if (require.main === module) {
  const result = buildStatic();
  console.log(`dist/ 已生成；当前教材 ${result.currentRequired} 个独特汉字，全部教材合计 ${result.copied} 个，缺失0个。`);
}
