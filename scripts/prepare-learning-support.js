// Build-time import only. Runtime and curriculum reproduction use the exported
// support JSON, without these source dictionaries or an installed dependency.
const fs = require('node:fs');
const path = require('node:path');
const {root} = require('./curriculum-word-tools.js');
const {books, baseLessons, wordCandidates} = require('./build-twelve-book-curriculum.js');
const candidateFile = process.argv[2];
const reviewedFile = process.argv[3];
const pinyinFile = process.argv[4];
if (!candidateFile || !reviewedFile || !pinyinFile) throw new Error('Usage: node prepare-learning-support.js candidates.json reviewed.json pinyin-pro.js');
const candidates = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
const reviewed = Object.assign({}, ...reviewedFile.split(';').map(file => JSON.parse(fs.readFileSync(file, 'utf8'))));
const {pinyin} = require(path.resolve(pinyinFile));
const support = {sources: {
  dictionary: 'pwxcoo/chinese-xinhua@fe6d6c2e8baa82187f4c96bbe042e43f96c05666, MIT',
  frequency: 'fxsjy/jieba@67fa2e36e72f69d9134b8a1037b83fbb070b9775, MIT',
  readings: 'pinyin-pro@3.18.2',
  reviewed: 'Explicit natural-word/usage-phrase review; not textbook word-table additions'
}, characterReadings: {}, words: {}};
const gaps = {};
for (const bookId of Object.keys(books)) for (const lesson of baseLessons(bookId)) for (const character of lesson.chars) {
  if (!character.pinyin) support.characterReadings[character.char] = pinyin(character.char, {toneType: 'symbol'});
  const existing = wordCandidates(character);
  if (existing.length >= 2 || support.words[character.char]) continue;
  const selected = [];
  const seen = new Set(existing.map(word => word.word));
  const all = (reviewed[character.char] || []).filter(word => word.reviewed)
    .concat(candidates[character.char] || []);
  for (const item of all) {
    if (seen.has(item.word) || !item.word.includes(character.char) || Array.from(item.word).length < 2 || !item.definition) continue;
    seen.add(item.word);
    // The community dictionary includes archaic/corrupted definitions. Imported
    // words get a transparent provenance label, not an unreviewed definition.
    // Reviewed supplements instead have their authored brief Chinese meaning.
    const meaning = item.reviewed ? `${item.kind === 'phrase' ? '用法短语：' : ''}${item.definition}` : '拓展组词（词典收录）';
    selected.push({word: item.word, pinyin: item.pinyin || pinyin(item.word, {toneType: 'symbol'}), meaning,
      source: item.reviewed ? 'reviewed-general-vocabulary' : 'chinese-xinhua', kind: item.kind || 'word'});
    if (selected.length + existing.length >= 2) break;
  }
  support.words[character.char] = selected;
  if (selected.length + existing.length < 2) gaps[character.char] = {existing: existing.map(word => word.word), selected};
}
if (process.argv.includes('--gaps')) console.log(JSON.stringify(gaps, null, 2));
else {
  console.log('*** Begin Patch');
  console.log(`*** Add File: ${path.join(root, 'curriculum/learning-support.json').replace(/\\/g, '/')}`);
  console.log('+' + JSON.stringify(support));
  console.log('*** End Patch');
}
