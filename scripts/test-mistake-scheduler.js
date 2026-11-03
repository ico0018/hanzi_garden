const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "mistake-scheduler.js"), "utf8");
const window = {};
vm.runInNewContext(source, { window, Date });
const api = window.HANZI_MISTAKE_SCHEDULER;
const plain = value => JSON.parse(JSON.stringify(value));
const items = Array.from({ length: 70 }, (_, index) => ({ id: `mistake-v1:${String.fromCharCode(0x4e00 + index)}词`, word: `${String.fromCharCode(0x4e00 + index)}词` }));
function harness(initial = new Map(), date = "2026-11-03T12:00:00") {
  let current = date;
  const storage = { getItem: key => initial.get(key) ?? null, setItem: (key, value) => initial.set(key, value) };
  const create = () => api.create({ storage, now: () => new Date(current) });
  return { storage, data: initial, create, date: value => { current = value; } };
}

const h = harness();
const engine = h.create();
const sizes = [];
const reviewed = [];
for (let round = engine.nextRound(items); round; round = engine.nextRound(items)) {
  sizes.push(round.queue.length);
  round.pending.forEach(item => { reviewed.push(item.id); assert.equal(engine.mark(item.id, false), true); });
  assert.equal(engine.mark(round.queue[0].id, true), false, "duplicate assessment is rejected");
}
assert.deepEqual(sizes, [30, 30, 10]);
assert.equal(new Set(reviewed).size, 70);
assert.equal(engine.nextReviewDate(items), "2026-11-04");
assert.equal(engine.eligible(items).length, 0, "no same-day retry even for wrong answers");
h.date("2026-11-04T00:01:00");
assert.equal(engine.eligible(items).length, 70);
assert.equal(engine.nextRound(items).queue.length, 30);

const migration = harness();
const legacy = {};
items.slice(0, 35).forEach((item, index) => { legacy[item.id] = { result: "unknown", updatedAt: index < 5 ? "2026-10-30T12:00:00Z" : "2026-11-01T12:00:00Z" }; });
legacy[items[40].id] = { result: "known", updatedAt: "2026-11-03T01:00:00" };
legacy[items[41].id] = { result: "unknown", updatedAt: "2026-11-03T01:00:00" };
migration.data.set(api.LEGACY_KEY, JSON.stringify(legacy));
const migrated = migration.create();
const first = migrated.nextRound(items);
assert.deepEqual(plain(first.queue.map(item => item.id)), items.slice(0, 30).map(item => item.id));
first.pending.forEach(item => migrated.mark(item.id, true));
const second = migrated.nextRound(items);
assert.deepEqual(plain(second.queue.slice(0, 5).map(item => item.id)), items.slice(30, 35).map(item => item.id));
assert.equal(second.queue[5].id, items[35].id, "new words follow remaining due words");
assert.ok(!second.queue.some(item => item.id === items[40].id || item.id === items[41].id));
assert.ok(migration.data.has(api.LEGACY_KEY), "migration preserves the old source records");

const midnight = harness(new Map(), "2026-12-31T23:59:00");
const before = midnight.create();
before.nextRound(items); before.mark(items[0].id, false);
const savedRound = before.snapshot().round;
midnight.date("2027-01-01T00:01:00");
const after = midnight.create();
const reversed = items.slice().reverse();
assert.deepEqual(plain(after.currentRound(reversed).ids), plain(savedRound.ids));
assert.deepEqual(plain(after.currentRound(reversed).results), plain(savedRound.results));
assert.equal(after.currentRound(reversed).pending[0].id, items[1].id);
assert.equal(after.progress()[items[0].id].dueDate, "2027-01-01");
const removed = items.filter(item => item.id !== items[1].id);
assert.equal(after.currentRound(removed).pending[0].id, items[2].id);
assert.equal(after.snapshot().round.ids.length, 30, "source removal never rewrites persisted round");
after.mark(items[2].id, true);
assert.equal(after.progress()[items[2].id].dueDate, "2027-01-03");
assert.equal(after.snapshot().round.startedAt, "2026-12-31");

const intervals = harness(new Map(), "2028-02-28T12:00:00");
const spaced = intervals.create();
const one = items.slice(0, 1);
spaced.nextRound(one); spaced.mark(one[0].id, false);
assert.equal(spaced.progress()[one[0].id].dueDate, "2028-02-29");
for (const interval of [2, 4, 7, 15, 30, 60, 60]) {
  const date = spaced.progress()[one[0].id].dueDate;
  intervals.date(`${date}T12:00:00`);
  spaced.nextRound(one); spaced.mark(one[0].id, true);
  assert.equal(spaced.progress()[one[0].id].dueDate, api.addDays(date, interval));
}
intervals.date(`${spaced.progress()[one[0].id].dueDate}T12:00:00`);
spaced.nextRound(one); spaced.mark(one[0].id, false);
assert.equal(spaced.progress()[one[0].id].successCount, 0);
assert.equal(spaced.progress()[one[0].id].dueDate, api.addDays(spaced.today(), 1));
assert.equal(api.addDays("2026-01-31", 1), "2026-02-01");
assert.equal(api.addDays("2028-02-29", 2), "2028-03-02");

const badStorage = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
const memory = api.create({ storage: badStorage, now: () => new Date("2026-11-03T12:00:00") });
for (const count of [30, 30, 10]) {
  const round = memory.nextRound(items); assert.equal(round.queue.length, count);
  round.pending.forEach(item => memory.mark(item.id, true));
}
assert.equal(memory.nextRound(items), null);
assert.equal(memory.hasStorageWarning(), true);

const tzBefore = process.env.TZ;
process.env.TZ = "Asia/Shanghai";
const local = harness(new Map(), "2026-11-04T00:10:00+08:00");
local.data.set(api.LEGACY_KEY, JSON.stringify({ [one[0].id]: { result: "unknown", updatedAt: "2026-11-03T16:05:00Z" } }));
const localEngine = local.create();
assert.equal(localEngine.progress()[one[0].id].lastReviewed, "2026-11-04");
assert.equal(localEngine.progress()[one[0].id].dueDate, "2026-11-05");
assert.equal(localEngine.eligible(one).length, 0);
if (tzBefore === undefined) delete process.env.TZ; else process.env.TZ = tzBefore;

for (const corrupt of ["{", "null", "[]", '{"version":2,"progress":[],"round":{"ids":"bad"}}']) {
  const data = new Map([[api.STATE_KEY, corrupt]]);
  assert.equal(harness(data).create().nextRound(one).queue.length, 1);
}
console.log("PASS: rolling 30/30/10, due priority/backlog, v1 local-date migration, persistent midnight/file-change rounds, spaced intervals/reset/calendar edges and memory-only storage failure.");
