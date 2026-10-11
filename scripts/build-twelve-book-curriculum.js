const fs = require('node:fs');
const path = require('node:path');
const { root, parse } = require('./curriculum-word-tools.js');
const books = {
  '1-upper': ['111', '生字数据_一年级上册.txt'], '1-lower': ['121', '生字数据_1年级下册.txt'],
  '2-upper': ['211', '生字数据_二年级上册.txt'], '2-lower': ['221', '生字数据_2年级下册.txt'],
  '3-upper': [null, '生字数据.txt'], '3-lower': ['321', '生字数据_3年级下册.txt'],
  '4-upper': ['411', '生字数据_四年级上册.txt'], '4-lower': ['421', '生字数据_4年级下册.txt'],
  '5-upper': ['511', '生字数据_5年级上册.txt'], '5-lower': ['521', '生字数据_5年级下册.txt'],
  '6-upper': ['611', '生字数据_6年级上册.txt'], '6-lower': ['621', '生字数据_6年级下册.txt']
};
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const vocabularyReview = JSON.parse(read('curriculum/vocabulary-review.json'));
const volumes = Object.fromEntries(Object.entries(books).filter(([, [source]]) => source)
  .map(([book, [source]]) => [book, JSON.parse(read(`curriculum/renjiao/${source}.json`)).grades[0].volumes[0]]));
function sourceWords(volume) {
  return (volume.words || []).flatMap(entry => entry.characters.map(chars => ({
    word: chars.map(c => c.character).join(''), pinyin: chars.map(c => c.pinyin).join(' '),
    meaning: '教材词语（组词拓展）'
  })));
}
const curated = Object.values(books).flatMap(([, file]) => parse(read(file)).flatMap(lesson => lesson.chars.flatMap(char => char.words)));
// 321's word/writing tables were copied from Grade 3 Upper. Never use them to
// claim lower-term curriculum; real words elsewhere still supply general use.
const corpus = curated.concat(Object.entries(volumes).filter(([book]) => book !== '3-lower').flatMap(([, volume]) => sourceWords(volume)),
  [{word:'美其名曰',pinyin:'měi qí míng yuē',meaning:'给某件事起一个好听的名字。'}]);
function rawScope(bookId) {
  return read(books[bookId][1]).split(/\r?\n/).map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('[')).map(line => line.split('|')[0].trim());
}
function baseLessons(bookId, support = {}) {
  const parsed = parse(read(books[bookId][1]));
  if (parsed.length) {
    if (bookId === '3-upper') for (const lesson of parsed) for (const character of lesson.chars) {
      if (character.char !== '欠') continue;
      character.words.unshift({word:'哈欠',pinyin:'hā qian',meaning:'困倦时张嘴深吸气的动作。'});
      if (character.sentence) character.sentence = {groupWord:'哈欠',text:character.sentence.text.replace(/打欠欠/g,'打哈欠')};
    }
    for (const lesson of parsed) for (const character of lesson.chars) {
      character.pinyin = vocabularyReview.characterHeadings?.[bookId]?.[character.char] || character.pinyin;
    }
    return parsed;
  }
  if (!['1-lower', '2-lower', '3-lower'].includes(bookId)) {
    const existing = parse(read(`curriculum/renjiao/${bookId}.txt`));
    for (const lesson of existing) for (const character of lesson.chars) {
      character.pinyin = vocabularyReview.characterHeadings?.[bookId]?.[character.char] || character.pinyin;
    }
    return existing;
  }
  const scope = rawScope(bookId);
  const allowed = new Set(scope);
  const volume = volumes[bookId];
  const lessons = [];
  const emitted = new Set();
  // Faulty 321 writing table is not usable for lesson grouping.
  if (bookId !== '3-lower') for (const entry of volume.writing) {
    const chars = entry.characters.filter(c => allowed.has(c.character) && !emitted.has(c.character)).map(c => {
      emitted.add(c.character);
      return {char: c.character, pinyin: c.pinyin, words: sourceWords({words: (volume.words || []).filter(word => word.lesson === entry.lesson)}), sentence: null};
    });
    if (chars.length) lessons.push({title: `${entry.short || ''} ${volume.lessons[entry.lesson] || entry.lesson}`, chars});
  }
  const remaining = scope.filter(c => !emitted.has(c));
  const readings = (volume.recognition || []).flatMap(entry => entry.characters || []);
  const groupSize = bookId === '3-lower' ? 25 : Math.max(remaining.length, 1);
  for (let start = 0; start < remaining.length; start += groupSize) {
    lessons.push({title: bookId === '3-lower' ? `写字表第${start / groupSize + 1}组（课次待核对）` : '写字表补充（课次待核对）',
      chars: remaining.slice(start, start + groupSize).map(char => ({char,
        pinyin: readings.find(c => c.character === char)?.pinyin || support.characterReadings?.[char] || '', words: [], sentence: null}))});
  }
  if (bookId === '3-lower') for (const lesson of lessons) for (const character of lesson.chars) {
    // 荷花 uses 仿佛. This contextual character reading must not change
    // 佛像/活佛 in other books or their independent word readings.
    if (character.char === '佛') {
      character.pinyin = 'fú';
      character.words = vocabularyReview.replacements['佛'].map(item => ({
        word: item.word, pinyin: item.pinyin,
        meaning: `${item.kind === 'phrase' ? '用法短语：' : ''}${item.definition}`
      }));
    }
  }
  for (const lesson of lessons) for (const character of lesson.chars) {
    character.pinyin = vocabularyReview.characterHeadings?.[bookId]?.[character.char] || character.pinyin;
  }
  return lessons;
}
function validWords(character, words) {
  const result = [];
  const seen = new Set();
  for (const word of words) {
    if (!word.word || ['噢呀', '噢哟', '露馅儿子', '曰过', '曰道', '打欠欠', '哭笑', '乱伦', '姨太太', '上吊', '裸体', '玉音', '京官', '入阁', '茅台', '茅台酒'].includes(word.word) || Array.from(word.word).length < 2 || !word.word.includes(character) || !word.pinyin || !word.meaning || seen.has(word.word)) continue;
    seen.add(word.word);
    result.push({...word, pinyin: vocabularyReview.readingOverrides[word.word] || word.pinyin});
  }
  return result;
}
function wordCandidates(character) { return validWords(character.char, character.words.concat(corpus)); }
function buildBook(bookId, support) {
  const output = ['# 每字两个真实组词；原始教材文件保留；拓展组词不进入教材词语表题库。'];
  const sentenceFile = `curriculum/sentences/${bookId}.json`;
  const sentenceSupplement = fs.existsSync(path.join(root,sentenceFile)) ? JSON.parse(read(sentenceFile)) : null;
  if (sentenceSupplement && sentenceSupplement.bookId !== bookId) throw new Error(`${bookId}: sentence book mismatch`);
  for (const lesson of baseLessons(bookId, support)) {
    output.push(`[${lesson.title}]`);
    for (const character of lesson.chars) {
      const words = validWords(character.char, wordCandidates(character).concat(support.words?.[character.char] || [])).slice(0, 2);
      if (words.length !== 2 || !character.pinyin) throw new Error(`${bookId}/${character.char}: missing sourced words/readings`);
      // Existing Grade 3 Upper sentences have priority and stay byte-for-byte.
      // Newly authored examples are book-specific, never textbook quotations.
      const sentence = character.sentence || sentenceSupplement?.entries[character.char] || null;
      const preservedOhSentence = bookId === '3-upper' && character.char === '噢' && character.sentence?.groupWord === '噢';
      if (sentence && ((!preservedOhSentence && !words.some(word => word.word === sentence.groupWord)) || !sentence.text.includes(sentence.groupWord) || !sentence.text.includes(character.char))) {
        throw new Error(`${bookId}/${character.char}: sentence must use an unchanged displayed word`);
      }
      let line = `${character.char}|${character.pinyin}|${words.map(word => `${word.word}|${word.pinyin}|${word.meaning}`).join(';')}`;
      if (sentence) line += `||${sentence.groupWord}||${sentence.text}`;
      output.push(line);
    }
  }
  return output.join('\n') + '\n';
}
if (require.main === module) {
  if (process.argv.includes('--audit')) {
    const deficits = {};
    const readings = new Set();
    for (const bookId of Object.keys(books)) for (const lesson of baseLessons(bookId)) for (const char of lesson.chars) {
      const candidates = wordCandidates(char);
      if (candidates.length < 2) deficits[char.char] = candidates.map(word => word.word);
      if (!char.pinyin) readings.add(char.char);
    }
    console.log(JSON.stringify({deficits, missingReadings: [...readings]}, null, 2));
  } else {
    const support = JSON.parse(read('curriculum/learning-support.json'));
    if (process.argv.includes('--patch')) console.log('*** Begin Patch');
    const requestedBook = process.argv.find(arg => arg.startsWith('--book='))?.slice(7);
    for (const bookId of requestedBook ? [requestedBook] : Object.keys(books)) {
      const text = buildBook(bookId, support);
      const file = `curriculum/renjiao/learning-${bookId}.txt`;
      if (process.argv.includes('--patch')) {
        console.log(`*** Add File: ${path.join(root, file).replace(/\\/g, '/')}`);
        console.log(text.trimEnd().split('\n').map(line => '+' + line).join('\n'));
      } else if (read(file).replace(/\r\n/g, '\n') !== text) throw new Error(`${bookId}: generated learning data drift`);
      else console.log(`${bookId}: two-word curriculum reproduction PASS`);
    }
    if (process.argv.includes('--patch')) console.log('*** End Patch');
  }
}
module.exports = { books, rawScope, baseLessons, wordCandidates, buildBook };
