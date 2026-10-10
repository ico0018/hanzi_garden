const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { sources, wordEntries, buildBank } = require("./build-textbook-word-banks.js");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const app = read("app.js");
const expectedCounts = { "2-lower": 278, "4-upper": 240, "4-lower": 171, "5-upper": 222, "5-lower": 139, "6-upper": 224, "6-lower": 162 };
function functionSource(name) {
  const match = new RegExp(`(?:async )?function ${name}\\(`).exec(app);
  assert(match, name);
  const tail = app.slice(match.index);
  const next = /\n(?:async )?function /.exec(tail);
  return next ? tail.slice(0, next.index) : tail;
}
async function main() {
  const storage = new Map();
  const context = { window: {}, URLSearchParams, console, Date,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    fetch: async file => ({ ok: true, text: async () => read(decodeURI(file)) }) };
  vm.createContext(context);
  vm.runInContext(read("daily-word-bank.js"), context);
  const bank = context.window.HANZI_DAILY_WORD_BANK;
  vm.runInContext(`let selectedBookId = ''; let dailyDictationItems = []; let dailyDictationBankStatus = '';
    const DAILY_DICTATION_SIZE_OPTIONS = [10, 20, 30]; const DAILY_DICTATION_BANK_FILES = window.HANZI_DAILY_WORD_BANK.bankFiles;\n` +
    ["loadDailyDictationWordBank", "formatDate", "todayKey", "dailyDictationProgressKey", "dailyDictationQueueKey", "dailyDictationSizeKey", "getDailyDictationSize", "getDictationItems", "getDailyDictationProgress", "saveDailyDictationProgress", "getDailyQueue"]
      .map(functionSource).join("\n"), context);
  const allIds = new Set();
  for (const [bookId, source] of Object.entries(sources)) {
    const file = bank.bankFiles[bookId];
    const text = read(file);
    assert.equal(text.replace(/\r\n/g,'\n'), buildBank(bookId),'exact content independent of checkout line endings');
    const words = Array.from(bank.parseDailyWordBank(text));
    const expectedWords = wordEntries(bookId).flatMap(entry => entry.characters.map(chars => chars.map(item => item.character).join("")))
      .map(word => bookId === "5-lower" && word === "露馅儿子" ? "露馅儿" : word);
    assert.deepEqual(words, expectedWords);
    assert.equal(words.length, expectedCounts[bookId]);
    const items = Array.from(bank.createDailyDictationItems(bookId, words));
    assert.deepEqual(items.map(item => item.word), words);
    assert.equal(new Set(items.map(item => item.id)).size, words.length);
    for (const item of items) { assert(!allIds.has(item.id)); allIds.add(item.id); }
    vm.runInContext(`selectedBookId = ${JSON.stringify(bookId)};`, context);
    await context.loadDailyDictationWordBank(bookId);
    assert.equal(vm.runInContext("dailyDictationBankStatus", context), "ready");
    const queue = Array.from(context.getDailyQueue());
    assert.equal(queue.length, 10);
    assert.deepEqual(queue.map(item => item.word), words.slice(0, 10));
    assert.deepEqual(Array.from(context.getDailyQueue(), item => item.id), queue.map(item => item.id));
    const queueKey = context.dailyDictationQueueKey();
    const progressKey = context.dailyDictationProgressKey();
    assert(queueKey.endsWith(bookId) && progressKey.endsWith(bookId));
    assert.equal(context.localStorage.getItem(progressKey), null, "another book must not supply progress");
    context.saveDailyDictationProgress({ [items[0].id]: { known: true, dueDate: "2099-01-01" } });
    storage.delete(queueKey);
    const resumed = Array.from(context.getDailyQueue());
    assert.equal(resumed.length, 10);
    assert.equal(resumed[0].word, words[1], "saved assessment advances within this book only");
    console.log(`${bookId}: ${words.length} source words; local loading / ordering / IDs / daily cap / isolated progress PASS`);
  }
  const duplicates = bank.createDailyDictationItems("4-upper", ["根据", "根据"]);
  assert.notEqual(duplicates[0].id, duplicates[1].id, "legitimate repeated entries need distinct IDs");
  assert.match(bank.textbookBankNotes["4-lower"], /未齐/);
  const source421 = JSON.parse(read("curriculum/renjiao/421.json")).grades[0].volumes[0].words;
  assert.equal(source421.length - wordEntries("4-lower").length, 4, "only four copied whole-lesson blocks are excluded");
  for (const bookId of ["1-upper", "1-lower", "2-upper", "3-lower", "unknown"]) {
    assert.deepEqual(Array.from(bank.createDailyDictationItems(bookId, ["根据"])), []);
    await context.loadDailyDictationWordBank(bookId);
    assert.equal(vm.runInContext("dailyDictationBankStatus", context), "not-configured");
    assert.equal(context.getDictationItems().length, 0);
  }
  assert.match(app, /assessmentOpened \|\| completedCharacters\.size !== wordCharacters\.length/);
  assert.match(app, /if \(!window\.HanziWriter \|\| !wordCharacters\.length\)/);
  console.log("Unsupported banks empty, repeated word IDs distinct, incomplete source disclosed, writing gate retained PASS");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
