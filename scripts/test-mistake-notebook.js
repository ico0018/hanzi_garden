const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
const schedulerSource = fs.readFileSync(path.join(rootDir, "mistake-scheduler.js"), "utf8");
const source = fs.readFileSync(path.join(rootDir, "mistake-notebook.js"), "utf8");

// A small DOM/event harness executes production controller code. Real browser
// layout and external stroke-data availability remain separate QA checks.
function harness({ text = "早晨\n穿戴\n早晨", storage = new Map(), writerAvailable = true, fetchFailure = false, date = "2026-11-03T12:00:00" } = {}) {
  let nodes = new Map();
  let html = "";
  const calls = { requests: [], quizzes: [], writerOptions: [], spoken: [], stops: 0, cancels: 0 };
  function node(tag = "") {
    const handlers = {};
    const attributes = {};
    return {
      checked: /\schecked(?:\s|>)/.test(tag), hidden: /\shidden(?:\s|>)/.test(tag), disabled: false,
      value: /value="([^"]*)"/.exec(tag)?.[1], dataset: { index: /data-index="([^"]*)"/.exec(tag)?.[1] },
      clientWidth: 180, parentElement: { classList: { add() {} } },
      addEventListener: (type, fn) => { handlers[type] = fn; },
      setAttribute: (key, value) => { attributes[key] = value; },
      getAttribute: key => attributes[key],
      focus() {}, click() { handlers.click?.(); }, change() { handlers.change?.(); }
    };
  }
  const root = {
    get innerHTML() { return html; },
    set innerHTML(value) { html = value; nodes = new Map(); },
    querySelector(selector) {
      if (!nodes.has(selector)) {
        const tags = html.match(/<[^/!][^>]*>/g) || [];
        const tag = tags.find(tag => selector === "button" ? tag.startsWith("<button")
          : selector.startsWith("#") ? tag.includes(`id="${selector.slice(1)}"`)
          : selector.startsWith(".") ? new RegExp(`class="[^"]*\\b${selector.slice(1)}\\b`).test(tag) : false);
        if (!tag) return null;
        nodes.set(selector, node(tag));
      }
      return nodes.get(selector);
    },
    querySelectorAll(selector) {
      const tags = html.match(/<[^/!][^>]*>/g) || [];
      return tags.filter(tag => selector === 'input[type="checkbox"]' ? tag.startsWith("<input") : new RegExp(`class="[^"]*\\b${selector.slice(1)}\\b`).test(tag))
        .map((tag, i) => {
          const key = `${selector}:${i}`;
          if (!nodes.has(key)) nodes.set(key, node(tag));
          return nodes.get(key);
        });
    }
  };
  const global = {
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    fetch: async (url, options) => {
      calls.requests.push({ url, options });
      return { ok: !fetchFailure, status: 404, text: async () => text };
    },
    HanziWriter: writerAvailable ? { create: (target, char, options) => {
      calls.writerOptions.push(options);
      return { quiz: callbacks => calls.quizzes.push({ ...callbacks, char }), cancelQuiz: () => { calls.cancels += 1; } };
    } } : undefined
  };
  vm.runInNewContext(schedulerSource, { window: global, console });
  vm.runInNewContext(source, { window: global, console });
  const api = global.HANZI_MISTAKE_NOTEBOOK;
  const notebook = api.create({ now: () => new Date(date), root, escapeHtml: value => String(value).replace(/</g, "&lt;"), pinyin: () => "", speak: word => calls.spoken.push(word), stopSpeech: () => { calls.stops += 1; } });
  return { api, notebook, root, calls, storage, global, setText: value => { text = value; }, setFailure: value => { fetchFailure = value; }, setDate: value => { date = value; } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
const asPlain = value => JSON.parse(JSON.stringify(value));

(async () => {
  const h = harness();
  const parsed = h.api.parse("\uFEFF# 说明\r\n早晨\r\n\n 穿戴 \n早晨\n<script>\nhello\n词语|cí yǔ");
  assert.deepEqual(asPlain(parsed.words), [{ id: "mistake-v1:早晨", word: "早晨" }, { id: "mistake-v1:穿戴", word: "穿戴" }]);
  assert.equal(parsed.invalidCount, 3);
  assert.equal(h.api.parse("穿戴\n早晨").words[1].id, parsed.words[0].id);
  const key = h.global.HANZI_MISTAKE_SCHEDULER.STATE_KEY;
  const state = () => JSON.parse(h.storage.get(key));
  h.storage.set("hanzi-daily-dictation-queue-v4-3-upper", "untouched");
  h.notebook.enter(); assert.match(h.root.innerHTML, /正在打开错词本/); await flush();
  assert.equal(h.calls.requests[0].url, encodeURI("错词.txt"));
  assert.equal(h.calls.requests[0].options.cache, "no-store");
  assert.deepEqual(h.calls.quizzes.map(q => q.char), ["早", "晨"], "source directly opens automatic dictation");
  assert.equal(h.root.querySelector('input[type="checkbox"]'), null);
  assert.equal(h.root.querySelector(".dictation-answer").hidden, true);
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true);
  h.root.querySelector(".mistake-known").click();
  assert.deepEqual(state().progress, {}, "synthetic click cannot bypass handwriting");
  h.calls.quizzes[0].onComplete();
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true);
  h.root.querySelector(".mistake-reveal").click();
  assert.equal(h.root.querySelector(".dictation-answer").hidden, false);
  assert.equal(h.root.querySelector(".mistake-reveal").getAttribute("aria-expanded"), "true");
  h.root.querySelector(".mistake-listen").click(); h.root.querySelector(".mistake-listen").click();
  assert.deepEqual(h.calls.spoken, ["早晨", "早晨"]);
  h.calls.quizzes[1].onComplete();
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, false);
  h.root.querySelector(".mistake-unknown").click();
  assert.match(h.root.innerHTML, /第 2 \/ 2 个/);
  assert.equal(state().progress["mistake-v1:早晨"].dueDate, "2026-11-04");
  assert.equal(state().progress["mistake-v1:早晨"].successCount, 0);
  assert.equal(h.storage.get("hanzi-daily-dictation-queue-v4-3-upper"), "untouched");
  const stale = h.calls.quizzes.slice(-2);
  h.notebook.leave(); stale.forEach(q => q.onComplete());
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true);
  h.notebook.enter();
  h.setDate("2026-11-04T00:01:00");
  h.calls.quizzes.slice(-2).forEach(q => q.onComplete()); h.root.querySelector(".mistake-known").click();
  assert.match(h.root.innerHTML, /这轮 2 个词写完啦/);
  assert.equal(state().progress["mistake-v1:穿戴"].dueDate, "2026-11-06");
  assert.equal(state().round.startedAt, "2026-11-03", "cross-midnight completion preserves old round");
  h.root.querySelector(".mistake-next-round").click();
  assert.match(h.root.innerHTML, /第 1 \/ 1 个/);
  assert.deepEqual(h.calls.quizzes.slice(-2).map(q => q.char), ["早", "晨"]);
  h.calls.quizzes.slice(-2).forEach(q => q.onComplete()); h.root.querySelector(".mistake-known").click();
  assert.match(h.root.innerHTML, /下一次复习：2026-11-06/);
  assert.equal(h.root.querySelector(".mistake-next-round"), null);
  h.root.querySelector(".mistake-open-list").click();
  assert.match(h.root.innerHTML, /错词复习列表/); assert.match(h.root.innerHTML, /复习：2026-11-06/);
  h.root.querySelectorAll(".mistake-read")[1].click(); assert.equal(h.calls.spoken.at(-1), "穿戴");
  h.root.querySelector(".mistake-continue").click(); assert.match(h.root.innerHTML, /这轮 1 个词写完啦/);

  const resumed = harness({ storage: h.storage, text: "穿戴\n早晨", date: "2026-11-04T12:00:00" });
  resumed.notebook.enter(); await flush();
  assert.match(resumed.root.innerHTML, /这轮 1 个词写完啦/, "new create resumes finished round rather than repeating today's words");
  const futureEntry = harness({ storage: h.storage, text: "穿戴\n早晨", date: "2026-11-06T09:00:00" });
  futureEntry.notebook.enter(); await flush();
  assert.match(futureEntry.root.innerHTML, /第 1 \/ 2 个/, "completed older round rolls into due work on entry");
  assert.deepEqual(futureEntry.calls.quizzes.map(q => q.char), ["穿", "戴"], "same due date uses current source order");

  const partial = harness(); partial.notebook.enter(); await flush();
  partial.calls.quizzes.slice(-2).forEach(q => q.onComplete()); partial.root.querySelector(".mistake-known").click();
  const newPage = harness({ storage: partial.storage, text: "穿戴\n早晨" });
  newPage.notebook.enter(); await flush();
  assert.match(newPage.root.innerHTML, /第 2 \/ 2 个/);
  assert.deepEqual(newPage.calls.quizzes.map(q => q.char), ["穿", "戴"]);

  const empty = harness({ text: "# 请添加词语\n" }); empty.notebook.enter(); await flush();
  assert.match(empty.root.innerHTML, /错词本还是空的/); assert.equal(empty.root.querySelector(".mistake-listen"), null);
  const error = harness({ fetchFailure: true }); error.notebook.enter(); await flush();
  assert.match(error.root.innerHTML, /没有加载成功/);
  error.setFailure(false); error.root.querySelector(".mistake-reload").click(); await flush();
  assert.match(error.root.innerHTML, /第 1 \/ 2 个/);
  const noWriter = harness({ writerAvailable: false }); noWriter.notebook.enter(); await flush();
  assert.match(noWriter.root.querySelector("#mistake-writing-status").textContent, /加载失败/);
  noWriter.root.querySelector(".mistake-known").click(); assert.deepEqual(JSON.parse(noWriter.storage.get(key)).progress, {});
  const glyphError = harness({ text: "早晨" }); glyphError.notebook.enter(); await flush();
  glyphError.calls.writerOptions[0].onLoadCharDataError();
  assert.match(glyphError.root.querySelector("#mistake-writing-status").textContent, /笔顺数据未能加载/);
  assert.equal(glyphError.root.querySelector(".mistake-assessment").hidden, true);
  glyphError.root.querySelector(".mistake-rewrite").click(); assert.equal(glyphError.calls.quizzes.length, 4);
  assert.ok(glyphError.calls.cancels >= 2);
  const denied = harness({ text: "早晨" });
  denied.global.localStorage.setItem = () => { throw new Error("storage unavailable"); };
  denied.notebook.enter(); await flush(); denied.calls.quizzes.forEach(q => q.onComplete());
  denied.root.querySelector(".mistake-known").click();
  assert.match(denied.root.innerHTML, /这轮 1 个词写完啦/); assert.match(denied.root.innerHTML, /浏览器无法读取或保存部分记录/);
  assert.equal(denied.root.querySelector(".mistake-next-round"), null);
  assert.ok(h.calls.stops > 0);
  console.log("PASS: automatic notebook UI, shared source/stable IDs, hidden answer/replay, all-glyph gate, isolated scheduling, reload/midnight resume, optional review, no same-day retry, source/tool/glyph/storage errors.");
})().catch(error => { console.error(error); process.exitCode = 1; });
