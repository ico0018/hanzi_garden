const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(rootDir, "mistake-notebook.js"), "utf8");

// A small DOM/event harness executes production controller code. Real browser
// layout and external stroke-data availability remain separate QA checks.
function harness({ text = "早晨\n穿戴\n早晨", storage = new Map(), writerAvailable = true, fetchFailure = false } = {}) {
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
  vm.runInNewContext(source, { window: global, console });
  const api = global.HANZI_MISTAKE_NOTEBOOK;
  const notebook = api.create({ root, escapeHtml: value => String(value).replace(/</g, "&lt;"), pinyin: () => "", speak: word => calls.spoken.push(word), stopSpeech: () => { calls.stops += 1; } });
  return { api, notebook, root, calls, storage, global, setText: value => { text = value; }, setFailure: value => { fetchFailure = value; } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
const asPlain = value => JSON.parse(JSON.stringify(value));

(async () => {
  const h = harness();
  const parsed = h.api.parse("\uFEFF# 说明\r\n早晨\r\n\n 穿戴 \n早晨\n<script>\nhello\n词语|cí yǔ");
  assert.deepEqual(asPlain(parsed.words), [{ id: "mistake-v1:早晨", word: "早晨" }, { id: "mistake-v1:穿戴", word: "穿戴" }]);
  assert.equal(parsed.invalidCount, 3);
  assert.equal(h.api.parse("穿戴\n早晨").words[1].id, parsed.words[0].id, "source order cannot change word IDs");
  for (const invalid of ["null", "[]", "{", '"bad"']) {
    h.storage.set(h.api.PROGRESS_KEY, invalid);
    assert.deepEqual(asPlain(h.api.readProgress(h.global.localStorage)), {});
  }
  h.storage.clear();
  h.storage.set("hanzi-daily-dictation-queue-v4-3-upper", "untouched");
  h.notebook.enter();
  assert.match(h.root.innerHTML, /正在打开错词本/);
  await flush();
  assert.equal(h.calls.requests[0].url, encodeURI("错词.txt"));
  assert.equal(h.calls.requests[0].options.cache, "no-store");
  assert.equal(h.root.querySelector("#mistake-selection-count").textContent, "已选 2 / 2 个词");
  h.root.querySelectorAll(".mistake-read")[0].click();
  assert.deepEqual(h.calls.spoken, ["早晨"]);
  h.root.querySelector(".mistake-clear").click();
  assert.equal(h.root.querySelector(".mistake-start").disabled, true);
  const inputs = h.root.querySelectorAll('input[type="checkbox"]');
  inputs[1].checked = true; inputs[1].change();
  h.root.querySelector(".mistake-start").click();
  assert.deepEqual(h.calls.quizzes.map(q => q.char), ["穿", "戴"], "only selected words enter the round");
  assert.equal(h.root.querySelector(".dictation-answer").hidden, true);
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true);
  h.root.querySelector(".mistake-known").click();
  assert.equal(h.storage.has(h.api.PROGRESS_KEY), false, "even a synthetic click cannot bypass handwriting gate");
  h.calls.quizzes[0].onComplete();
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true, "partial word cannot be assessed");
  h.root.querySelector(".mistake-reveal").click();
  assert.equal(h.root.querySelector(".dictation-answer").hidden, false);
  assert.equal(h.root.querySelector(".mistake-reveal").getAttribute("aria-expanded"), "true");
  h.root.querySelector(".mistake-listen").click();
  h.root.querySelector(".mistake-listen").click();
  assert.deepEqual(h.calls.spoken.slice(-2), ["穿戴", "穿戴"]);
  h.calls.quizzes[1].onComplete();
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, false);
  h.root.querySelector(".mistake-unknown").click();
  assert.match(h.root.innerHTML, /这轮 1 个词写完啦/);
  assert.equal(JSON.parse(h.storage.get(h.api.PROGRESS_KEY))["mistake-v1:穿戴"].result, "unknown");
  assert.equal(h.storage.get("hanzi-daily-dictation-queue-v4-3-upper"), "untouched");
  h.root.querySelector(".mistake-retry-unknown").click();
  const stale = h.calls.quizzes.slice(-2);
  h.notebook.leave();
  stale.forEach(q => q.onComplete());
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true, "stale callbacks cannot unlock hidden view");
  h.notebook.enter();
  assert.equal(h.root.querySelector(".mistake-assessment").hidden, true, "reentry restarts current word");
  h.calls.quizzes.slice(-2).forEach(q => q.onComplete());
  h.root.querySelector(".mistake-known").click();
  assert.match(h.root.innerHTML, /会写 1 个，还要复习 0 个/);
  assert.equal(h.root.querySelector(".mistake-retry-unknown"), null);
  h.root.querySelector(".mistake-back").click();
  assert.match(h.root.innerHTML, /会写了/);
  h.setText("穿戴\n早晨");
  h.root.querySelector(".mistake-refresh").click(); await flush();
  assert.match(h.root.innerHTML, /会写了/);
  assert.equal(h.root.querySelectorAll('input[type="checkbox"]')[0].checked, true, "refresh preserves source-word selection");

  const empty = harness({ text: "# 请添加词语\n" });
  empty.notebook.enter(); await flush();
  assert.match(empty.root.innerHTML, /错词本还是空的/);
  assert.equal(empty.root.querySelector(".mistake-start"), null);
  const error = harness({ fetchFailure: true });
  error.notebook.enter(); await flush();
  assert.match(error.root.innerHTML, /没有加载成功/);
  error.setFailure(false); error.root.querySelector(".mistake-reload").click(); await flush();
  assert.match(error.root.innerHTML, /错词复习列表/);

  const noWriter = harness({ writerAvailable: false });
  noWriter.notebook.enter(); await flush(); noWriter.root.querySelector(".mistake-start").click();
  assert.match(noWriter.root.querySelector("#mistake-writing-status").textContent, /加载失败/);
  noWriter.root.querySelector(".mistake-known").click();
  assert.equal(noWriter.storage.has(noWriter.api.PROGRESS_KEY), false);
  const glyphError = harness({ text: "早晨" });
  glyphError.notebook.enter(); await flush(); glyphError.root.querySelector(".mistake-start").click();
  glyphError.calls.writerOptions[0].onLoadCharDataError();
  assert.match(glyphError.root.querySelector("#mistake-writing-status").textContent, /笔顺数据未能加载/);
  assert.equal(glyphError.root.querySelector(".mistake-assessment").hidden, true);
  glyphError.root.querySelector(".mistake-rewrite").click();
  assert.equal(glyphError.calls.quizzes.length, 4);
  assert.ok(glyphError.calls.cancels >= 2);
  const deniedStorage = harness({ text: "早晨" });
  deniedStorage.global.localStorage.setItem = () => { throw new Error("storage unavailable"); };
  deniedStorage.notebook.enter(); await flush(); deniedStorage.root.querySelector(".mistake-start").click();
  deniedStorage.calls.quizzes.forEach(q => q.onComplete());
  deniedStorage.root.querySelector(".mistake-known").click();
  assert.match(deniedStorage.root.innerHTML, /这轮 1 个词写完啦/);
  assert.match(deniedStorage.root.innerHTML, /浏览器无法保存记录/);
  assert.ok(h.calls.stops > 0);
  console.log("PASS: notebook source/IDs, selection, speech/reveal, complete-word manual gate, result isolation, retry, stale callbacks, empty/fetch/glyph/tool failures.");
})().catch(error => { console.error(error); process.exitCode = 1; });
