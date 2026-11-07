'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const read = f => fs.readFileSync(path.join(root, f));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const box = {window:{}};
vm.runInNewContext(read('dictation-pinyin-data.js').toString('utf8'), box);
const data = box.window.HANZI_DICTATION_PINYIN_DATA;
assert.equal(data.schemaVersion, 1);
assert.equal(data.note, '拼音为学习补注，非教材原词表注音');
const all = [];
const sources = [];
const perBook = {};
for (const f of fs.readdirSync(path.join(root, 'word-tables')).filter(f => /^2026-.*\.json$/.test(f)).sort()) {
  sources.push('word-tables/' + f);
  const d = JSON.parse(read('word-tables/' + f));
  for (const l of d.lessons) for (const e of l.words) all.push({book:d.bookId, lesson:l.lessonKey, word:e.word});
  perBook[d.bookId] = d.total;
}
assert.equal(all.length, 2168);
const old = read('每日词语听写题库.txt').toString('utf8').trim().split(/\r?\n/);
assert.equal(old.length, 28);
for (const word of old) all.push({book:'3-upper',lesson:'',word});
sources.push('每日词语听写题库.txt', 'book-catalog.js', 'daily-word-bank.js');
for (const f of fs.readdirSync(path.join(root,'writing-tables')).filter(f=>/^2026-.*\.json$/.test(f))) sources.push('writing-tables/'+f);
// Git stores LF; this Windows checkout uses CRLF. Compare every source text byte after CRLF normalization only.
// No JSON parsing/field exclusion is used, so orders, annotations and stable ID inputs remain frozen.
for (const file of sources) {
  const baseline = cp.execFileSync('git', ['show', '2d4a088:' + file], {cwd:root, maxBuffer:10*1024*1024});
  assert.equal(hash(read(file).toString('utf8').replace(/\r\n/g,'\n')), hash(baseline.toString('utf8').replace(/\r\n/g,'\n')), 'Original source modified: ' + file);
}
const erhua = {'哪儿':'nǎr','一块儿':'yī kuàir','一点儿':'yī diǎnr','一会儿':'yī huìr','露馅儿':'lòu xiànr','摆摊儿':'bǎi tānr'};
const tone = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g;
for (const e of all) {
  const key = [e.book,e.lesson,e.word].join('|');
  const p = data.contextReadings[key] || data.readings[e.word];
  assert.ok(typeof p === 'string' && p.trim(), 'Missing whole word: ' + key);
  assert.match(p, /^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(?: [a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)*$/u, key);
  assert.equal(p, p.normalize('NFC'), 'Non-NFC: ' + key);
  assert.equal(p.split(' ').length, [...e.word].length - (Object.hasOwn(erhua,e.word)?1:0), 'Incomplete word: ' + key);
  for (const syllable of p.split(' ')) assert.ok((syllable.match(tone)||[]).length <= 1, 'Multiple tones: '+key);
  if (Object.hasOwn(erhua,e.word)) assert.equal(p,erhua[e.word]);
}
const unique = [...new Set(all.map(e=>e.word))];
assert.equal(unique.length,2131);
assert.deepEqual(Object.keys(data.readings).sort(),unique.sort());
for (const k of Object.keys(data.contextReadings)) assert.ok(all.some(e=>[e.book,e.lesson,e.word].join('|')===k), 'Orphan context: '+k);
// Independent expected examples cover the actual library failure classes and semantic readings.
const examples = {
 '古老':'gǔ lǎo','肚子':'dù zi','骨头':'gǔ tou','翅膀':'chì bǎng','朝阳':'zhāo yáng',
 '朝霞':'zhāo xiá','散发':'sàn fā','倒映':'dào yìng','何曾':'hé céng','发怔':'fā zhèng',
 '肝脏':'gān zàng','星斗':'xīng dǒu','供养':'gōng yǎng','地道':'dì dào','播种':'bō zhǒng',
 '寻思':'xún sī','成家立业':'chéng jiā lì yè','轰隆隆':'hōng lōng lōng','尽管':'jǐn guǎn',
 '一溜烟':'yī liù yān','结实':'jiē shi','胡萝卜':'hú luó bo','眼睛':'yǎn jing',
 '认识':'rèn shi','朋友':'péng you','匀称':'yún chèn','纤细':'xiān xì','屏息':'bǐng xī',
 '相貌':'xiàng mào','角色':'jué sè','兴奋':'xīng fèn','衣裳':'yī shang'
};
for (const [w,p] of Object.entries(examples)) assert.equal(data.readings[w],p,w);
const table = fs.readFileSync(path.join(__dirname,'reviewed-readings.tsv'),'utf8').trim().split(/\r?\n/).slice(1);
assert.equal(table.length,all.length);
for (let i=0;i<table.length;i++) {
  const [no,book,lesson,word,pinyin] = table[i].split('\t');
  const e=all[i];
  assert.equal(Number(no),i+1);
  assert.deepEqual([book,lesson,word],[e.book,e.lesson,e.word]);
  assert.equal(pinyin,data.contextReadings[[book,lesson,word].join('|')]||data.readings[word]);
}
console.log(JSON.stringify({result:'PASS',entries:all.length,uniqueReadings:unique.length,perBook,oldWordBank:old.length,contextOverrides:Object.keys(data.contextReadings).length,sourceFilesUnchanged:sources.length,semanticRegressionExamples:Object.keys(examples).length,erhuaWords:Object.keys(erhua).length},null,2));
