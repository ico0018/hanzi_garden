const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const expectedWords = [
  "早晨", "穿戴", "鲜艳", "服装", "打扮", "敬爱", "国旗", "敬礼", "安静", "树枝", "好奇", "孔雀", "招引", "粗壮",
  "枝干", "影子", "阵雨", "荒野", "跳舞", "狂欢", "功课", "放假", "互相", "狂风", "自然", "能够", "双臂", "急急忙忙"
];

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "daily-word-bank.js"), "utf8"), sandbox);
const bank = sandbox.window.HANZI_DAILY_WORD_BANK;
const words = Array.from(bank.parseDailyWordBank(fs.readFileSync(path.join(root, "每日词语听写题库.txt"), "utf8")));

assert.deepEqual(words, expectedWords, "the editable bank must retain the supplied words and order");
assert.deepEqual(Array.from(bank.createDailyDictationItems("4-upper", words)), [], "unconfigured books must not generate phrases");
assert.deepEqual(Array.from(bank.createDailyDictationItems("3-upper", words), (item) => item.word), expectedWords);

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
assert.match(app, /hanzi-daily-dictation-progress-v4-/);
assert.match(app, /hanzi-daily-dictation-queue-v4-/);
assert.doesNotMatch(app, /hanzi-daily-dictation-(?:progress|queue)-v3-/);
assert.match(app, /function getDictationItems\(\)\s*\{\s*return dailyDictationItems;/);

console.log("PASS: explicit Grade 3 word bank is ordered, scoped, and isolated from generated v3 queues.");
