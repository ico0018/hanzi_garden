const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {buildBook: buildLearningBook} = require("./build-twelve-book-curriculum.js");
const { books, buildBook, scopeFor } = require("./build-grade-4-6.js");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const app = read("app.js");
const parser = app.slice(app.indexOf("function parseLessonsText("), app.indexOf("async function loadLessonsFromTxt("));
const expected = { "4-upper": 250, "4-lower": 250, "5-upper": 220, "5-lower": 180, "6-upper": 180, "6-lower": 120 };
async function main() {
  for (const [bookId, count] of Object.entries(expected)) {
    const requests = [];
    const context = { URLSearchParams, Response, console, window: {
      location: { search: `?book=${bookId}` },
      fetch: async file => {
        requests.push(file);
        assert(!/^https?:/.test(file), `${bookId} must load local curriculum`);
        const text = read(decodeURI(file));
        return new Response(text, { headers: { "Content-Type": file.endsWith(".json") ? "application/json" : "text/plain" } });
      }
    }};
    vm.createContext(context);
    vm.runInContext(read("book-catalog.js") + "\n" + read("writing-table-support.js") + "\n" + parser, context);
    const book = context.window.HANZI_BOOK_CATALOG[bookId];
    assert.equal(book.available, true);
    const response = await context.window.fetch(encodeURI(book.dataFile));
    assert.equal(response.status, 200);
    const text = (await response.text()).replace(/\r\n/g,'\n');
    const lessons = context.parseLessonsText(text);
    const characters = lessons.flatMap(lesson => lesson.chars);
    assert.equal(characters.length, count);
    assert(characters.every(char => char.char && char.pinyin && char.words.length));
    assert.equal(new Set(characters.map(char => char.char)).size, count);
    if (bookId === "4-upper") {
      assert.equal(text, buildLearningBook(bookId, JSON.parse(read('curriculum/learning-support.json'))));
      assert.deepEqual(Array.from(characters, char => char.char), read("生字数据_四年级上册.txt").split(/\r?\n/)
        .map(line => line.trim()).filter(line => line && !line.startsWith("#") && !line.startsWith("["))
        .map(line => line.split("|")[0].trim()));
    }
    if (books[bookId]) {
      assert.equal(text, buildLearningBook(bookId, JSON.parse(read('curriculum/learning-support.json'))));
      assert.deepEqual(Array.from(characters, char => char.char).sort(), scopeFor(books[bookId][1]).sort());
      assert.equal(new Set(characters.map(char => char.char)).size, count);
      const volume = JSON.parse(read(`curriculum/renjiao/${books[bookId][0]}.json`)).grades[0].volumes[0];
      const sourceWords = new Set(volume.words.flatMap(entry => entry.characters.map(chars => chars.map(char => char.character).join(""))));
      for (const character of characters) {
        for (const word of character.words) {
          assert(word.word.includes(character.char));
          assert(word.word.length > 1, `Two-word learning overlay must not contain single-character filler: ${bookId}/${word.word}`);
        }
      }
      const supplement = lessons.find(lesson => lesson.title.startsWith("写字表补充"));
      assert(supplement && supplement.chars.every(char => char.words.length === 2));
    }
    console.log(`${bookId}: ${lessons.length} lesson sections, ${characters.length} characters; local loading / scope / vocabulary PASS`);
  }
  // Local metadata failure must not silently substitute another grade.
  const context = { URLSearchParams, Response, console: { error() {} }, window: {
    location: { search: "?book=1-upper" }, fetch: async () => new Response("", { status: 404 })
  }};
  vm.createContext(context);
  vm.runInContext(read("writing-table-support.js"), context);
  assert.equal((await context.window.fetch("生字数据_四年级上册.txt")).status, 503);
  console.log("Unavailable local source fails closed PASS");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
