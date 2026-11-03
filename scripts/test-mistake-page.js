const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
assert.ok(html.indexOf('src="mistake-scheduler.js') < html.indexOf('src="mistake-notebook.js'));
assert.ok(html.indexOf('src="mistake-notebook.js') < html.indexOf('src="app.js'));

function harness(search, configured) {
  const calls = { entered: 0, left: 0, fetches: [] };
  const elements = new Map();
  function element() {
    let markup = "";
    let children = new Map();
    return {
      hidden: false, textContent: "", dataset: {}, classList: { remove() {} },
      get innerHTML() { return markup; }, set innerHTML(value) { markup = value; children = new Map(); },
      addEventListener(event, fn) { this[event] = fn; }, focus() {},
      querySelector(selector) { return children.get(selector) || null; },
      querySelectorAll(selector) {
        if (selector !== ".app-tab") return [];
        return [...markup.matchAll(/data-view="([^"]+)"/g)].map(match => {
          const child = element(); child.dataset.view = match[1];
          children.set(`[data-view="${match[1]}"]`, child); return child;
        });
      }
    };
  }
  const document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    querySelector() { return element(); }
  };
  const context = vm.createContext({
    document, URLSearchParams, console: { error() {} },
    fetch: async file => { calls.fetches.push(file); throw new Error("curriculum unavailable"); },
    localStorage: { getItem: () => null, setItem() {} },
    window: { location: { search }, HANZI_BOOK_CATALOG: configured ? { "3-upper": { available: true, dataFile: "lesson.txt" } } : {},
      HANZI_MISTAKE_NOTEBOOK: { create: () => ({ enter: () => { calls.entered += 1; }, leave: () => { calls.left += 1; } }) } }
  });
  vm.runInContext(app, context);
  return { calls, elements, run: code => vm.runInContext(code, context) };
}
(async () => {
  const direct = harness("?view=mistakes", true);
  assert.equal(direct.calls.entered, 1, "notebook opens before textbook promise settles");
  assert.equal(direct.elements.get("mistake-view").hidden, false);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(direct.run("bookLoadStatus"), "error");
  assert.equal(direct.elements.get("mistake-view").hidden, false);
  direct.elements.get("app-tabs").querySelector('[data-view="learning"]').click();
  assert.match(direct.elements.get("lesson-overview").innerHTML, /教材数据加载失败/);
  assert.match(direct.elements.get("app-tabs").innerHTML, /错词本/);
  direct.elements.get("app-tabs").querySelector('[data-view="mistakes"]').click();
  assert.equal(direct.elements.get("mistake-view").hidden, false);
  assert.equal(direct.calls.entered, 2);
  const invalidBook = harness("?book=missing&view=mistakes", false);
  assert.equal(invalidBook.calls.entered, 1);
  invalidBook.elements.get("app-tabs").querySelector('[data-view="dictation"]').click();
  assert.match(invalidBook.elements.get("lesson-overview").innerHTML, /教材数据加载失败/);
  const invalidView = harness("?view=anything", false);
  assert.equal(invalidView.run("activeView"), "learning");
  assert.equal(invalidView.elements.get("mistake-view").hidden, true);
  console.log("PASS: direct notebook entry with no book choice/failed curriculum/invalid book, safe return navigation and validated view query.");
})().catch(error => { console.error(error); process.exitCode = 1; });
