const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const app = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');
function source(name) {
  const match = new RegExp(`function ${name}\\(`).exec(app);
  const tail = app.slice(match.index);
  const next = /\n(?:async )?function /.exec(tail);
  return next ? tail.slice(0, next.index) : tail;
}
const storage = new Map();
const context = { console, localStorage: {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value)
}};
vm.createContext(context);
vm.runInContext(`let selectedBookId = '4-upper'; let dailyDictationItems = Array.from({length: 50}, (_, i) => ({id: '4-upper-' + i, order: i}));
  let today = '2026-10-10'; function todayKey() { return today; }
  const DAILY_DICTATION_SIZE_OPTIONS = [10,20,30];\n` +
  ['dailyDictationProgressKey', 'dailyDictationQueueKey', 'dailyDictationSizeKey', 'getDailyDictationSize', 'setDailyDictationSize',
    'getDictationItems', 'getDailyDictationProgress', 'saveDailyDictationProgress', 'getDailyQueue', 'getTodayQueueState'].map(source).join('\n'), context);
const queue = () => Array.from(context.getDailyQueue(), item => item.id);
assert.equal(context.getDailyDictationSize(), 10);
const initial = queue();
assert.equal(initial.length, 10);
let state = context.getTodayQueueState();
state.results[initial[0]] = { known: true };
storage.set(context.dailyDictationQueueKey(), JSON.stringify(state));
context.saveDailyDictationProgress({[initial[0]]: {known: true, dueDate: '2026-11-01'}});
context.setDailyDictationSize(20);
const expanded = queue();
assert.equal(expanded.length, 20);
assert.deepEqual(expanded.slice(0, 10), initial);
assert.equal(new Set(expanded).size, 20);
assert(context.getTodayQueueState().results[initial[0]]);
context.setDailyDictationSize(30);
const expandedAgain = queue();
assert.equal(expandedAgain.length, 30);
assert.deepEqual(expandedAgain.slice(0, 20), expanded);
context.setDailyDictationSize(10);
assert.deepEqual(queue(), initial);
assert.equal(context.getTodayQueueState().ids.length, 30);
assert(context.getTodayQueueState().results[initial[0]]);
assert(context.getDailyDictationProgress()[initial[0]]);
context.setDailyDictationSize(20);
assert.deepEqual(queue(), expanded);
vm.runInContext("today = '2026-10-11'", context);
assert.equal(queue()[0], '4-upper-1');
assert.deepEqual(Object.keys(context.getTodayQueueState().results), []);
assert.equal(queue().length, 20);
// Independent book preference/progress; no previous book's queue IDs.
vm.runInContext("selectedBookId='5-upper'; dailyDictationItems = Array.from({length: 8}, (_, i) => ({id: '5-upper-' + i, order:i}));", context);
assert.equal(context.getDailyDictationSize(), 10);
context.setDailyDictationSize(30);
assert.equal(queue().length, 8);
assert(queue().every(id => id.startsWith('5-upper-')));
assert.equal(storage.get('hanzi-daily-dictation-size-v1-4-upper'), '20');
// Old v4 15-item queue keeps all assigned IDs and assessment when first opened.
vm.runInContext("selectedBookId='6-upper'; dailyDictationItems = Array.from({length: 40}, (_, i) => ({id:'legacy-'+i,order:i}));", context);
const legacyIds = Array.from({length: 15}, (_, i) => 'legacy-' + i);
storage.set(context.dailyDictationQueueKey(), JSON.stringify({date:'2026-10-11',ids:legacyIds,results:{'legacy-12':{known:false}}}));
assert.deepEqual(queue(), legacyIds.slice(0,10));
assert.equal(context.getTodayQueueState().ids.length,15);
context.setDailyDictationSize(20);
assert.deepEqual(queue().slice(0,15),legacyIds);
assert(context.getTodayQueueState().results['legacy-12']);
context.setDailyDictationSize(99);
assert.equal(context.getDailyDictationSize(),20);
assert.match(app,/今日 \$\{queue\.length\} 词已完成/);
assert.equal((app.match(/bindDailyDictationSizeControl\(\);/g)||[]).length,2,'both configured and unconfigured views expose selector');
console.log('PASS: 10/20/30 persistence, mid-day resize, completed-results preservation, new day, book isolation, small bank and legacy 15 queue');
