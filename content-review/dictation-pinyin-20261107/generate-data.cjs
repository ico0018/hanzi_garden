'use strict';
// Regenerates only the learning supplement from the reviewed whole-word table.
const fs = require('node:fs');
const path = require('node:path');
const dir = __dirname;
const root = path.resolve(dir, '../..');
const lines = fs.readFileSync(path.join(dir, 'reviewed-readings.tsv'), 'utf8').trim().split(/\r?\n/).slice(1);
const readings = {};
for (const line of lines) {
  const [, , , word, reading] = line.split('\t');
  if (!word || !reading || (readings[word] && readings[word] !== reading)) throw new Error('Inconsistent reviewed word: ' + word);
  readings[word] = reading;
}
const data = {schemaVersion: 1, readings, contextReadings: {}, note: '拼音为学习补注，非教材原词表注音'};
fs.writeFileSync(path.join(root, 'dictation-pinyin-data.js'), '// 逐词校读的学习补注；原教材词表无注音。\nwindow.HANZI_DICTATION_PINYIN_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
console.log(JSON.stringify({uniqueReadings: Object.keys(readings).length}));
