const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const date = "2026-10-09";
const items = Array.from({ length: 28 }, (_, order) => ({ id: `word-${order}`, order, word: "早晨", lessonTitle: "词语听写" }));

function createHarness(book = "3-upper", storage = new Map()) {
  function element() {
    const children = new Map();
    return {
      innerHTML: "", dataset: {}, classList: { add() {} },
      addEventListener(type, fn) { this[type] = fn; },
      setAttribute() {}, focus() {},
      querySelector(selector) {
        if (!children.has(selector)) children.set(selector, element());
        return children.get(selector);
      },
      querySelectorAll(selector) {
        if (selector !== ".daily-size-option") return [];
        return Array.from(this.innerHTML.matchAll(/data-size="(\d+)"/g), (match) => {
          const button = this.querySelector(`[data-size="${match[1]}"]`);
          button.dataset.size = match[1];
          return button;
        });
      }
    };
  }
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    querySelector: () => element()
  };
  const context = vm.createContext({
    document, window: { location: { search: `?book=${book}` } }, URLSearchParams, console,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
  });
  // Load production functions without starting curriculum/network initialization.
  vm.runInContext(app.replace(/init\(\);\s*$/, ""), context);
  context.testItems = items;
  vm.runInContext(`todayKey = () => "${date}"; dailyDictationItems = testItems; dailyDictationBankStatus = "ready"; cacheHumanAudio = () => null;`, context);
  const run = (code) => vm.runInContext(code, context);
  const queueIds = () => Array.from(run("getDailyQueue()"), (item) => item.id);
  const key = `hanzi-daily-dictation-queue-v4-${book}`;
  const progressKey = `hanzi-daily-dictation-progress-v4-${book}`;
  const sizeKey = `hanzi-daily-dictation-size-v1-${book}`;
  const setSize = (size) => storage.set(sizeKey, String(size));
  const state = () => JSON.parse(storage.get(key));
  return { run, queueIds, key, progressKey, sizeKey, setSize, state, storage, elements };
}

const h = createHarness();
assert.equal(h.run("getDailyDictationSize()"), 10);
assert.deepEqual(h.queueIds(), items.slice(0, 10).map((item) => item.id));
for (const invalid of ["15", "0", "oops", "null", ""] ) {
  h.setSize(invalid);
  assert.equal(h.run("getDailyDictationSize()"), 10);
}
h.setSize(20);
assert.equal(h.queueIds().length, 20);
h.run("saveManualDictationResult(getDailyQueue()[14], true)");
const expandedState = h.state();
assert.equal(expandedState.results["word-14"], "known");
assert.equal(JSON.parse(h.storage.get(h.progressKey))["word-14"].dueDate, "2026-10-11", "first known uses existing two-day interval");
h.setSize(10);
assert.equal(h.queueIds().length, 10);
assert.deepEqual(h.state(), expandedState, "lowering must not mutate saved ids/results");
h.setSize(30);
assert.deepEqual(h.queueIds(), items.map((item) => item.id));
assert.equal(new Set(h.queueIds()).size, 28, "30 must not repeat words to fill the current bank");
assert.equal(h.state().results["word-14"], "known");
assert.equal(createHarness("3-upper", h.storage).run("getDailyDictationSize()"), 30, "reload retains preference");
assert.equal(createHarness("4-upper", h.storage).run("getDailyDictationSize()"), 10, "preference is book-scoped");

const legacy = createHarness();
legacy.storage.set(legacy.key, JSON.stringify({ date, ids: items.slice(0, 15).map((item) => item.id), results: { "word-14": "unknown" } }));
const legacyState = legacy.state();
assert.equal(legacy.queueIds().length, 10);
assert.deepEqual(legacy.state(), legacyState, "legacy 15-word queue must be fully retained");
legacy.setSize(20);
assert.equal(legacy.queueIds().length, 20);
assert.equal(legacy.state().results["word-14"], "unknown");
assert.deepEqual(legacy.state().ids.slice(0, 15), legacyState.ids);

const due = createHarness();
due.queueIds();
const progress = {
  "word-10": { dueDate: "2026-10-20" },
  "word-12": { dueDate: "2026-10-07" },
  "word-20": { dueDate: "2026-10-05" },
  "word-22": { dueDate: "2026-10-07" }
};
due.storage.set(due.progressKey, JSON.stringify(progress));
due.setSize(20);
assert.deepEqual(due.queueIds().slice(10, 14), ["word-20", "word-12", "word-22", "word-11"], "extension appends oldest due first, then new words in order");
assert.ok(!due.queueIds().includes("word-10"), "future review must not be added");
assert.equal(new Set(due.queueIds()).size, 20);
due.run("saveManualDictationResult(getDailyQueue()[0], false)");
assert.equal(JSON.parse(due.storage.get(due.progressKey))["word-0"].dueDate, "2026-10-10");
due.run("todayKey = () => '2026-10-10'");
assert.equal(due.queueIds().length, 20);
assert.deepEqual(due.state().results, {}, "new day resets daily marks");
assert.equal(due.state().date, "2026-10-10");
assert.ok(due.queueIds().includes("word-0"));

const empty = createHarness();
empty.storage.set(empty.progressKey, JSON.stringify(Object.fromEntries(items.map((item) => [item.id, { dueDate: "2026-10-20" }]))));
empty.setSize(30);
assert.deepEqual(empty.queueIds(), []);
empty.run("renderDailyDictation()");
assert.match(empty.elements.get("dictation-overview").innerHTML, /今天可听写 0 个词/);
assert.match(empty.elements.get("dictation-detail").innerHTML, /今天还没有可听写/);

const finished = createHarness();
finished.setSize(30);
finished.queueIds();
finished.storage.set(finished.key, JSON.stringify({ ...finished.state(), results: Object.fromEntries(items.map((item) => [item.id, "known"])) }));
finished.run("renderDailyDictation()");
assert.match(finished.elements.get("dictation-detail").innerHTML, /今日 28 词已完成/);
const overview = finished.elements.get("dictation-overview");
assert.equal((overview.innerHTML.match(/class="daily-size-option"/g) || []).length, 3);
assert.match(overview.innerHTML, /<legend>每天听写几个词？<\/legend>/);
assert.equal((overview.innerHTML.match(/aria-pressed="true"/g) || []).length, 1);
overview.querySelector('[data-size="10"]').click();
assert.equal(finished.run("getDailyDictationSize()"), 10);
assert.match(finished.elements.get("dictation-detail").innerHTML, /今日 10 词已完成/);
assert.equal(finished.state().ids.length, 28);
assert.equal(Object.keys(finished.state().results).length, 28);

for (const broken of ["{", "null", JSON.stringify({ date, ids: "bad" })]) {
  const corrupt = createHarness();
  corrupt.storage.set(corrupt.key, broken);
  assert.equal(corrupt.queueIds().length, 10);
}
console.log("PASS: daily 10/20/30 selection, book persistence, resize/legacy preservation, due/new ordering, actual counts and unchanged review timing.");
