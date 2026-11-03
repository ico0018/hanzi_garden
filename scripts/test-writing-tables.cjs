const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseWritingTable } = require('../writing-tables.js');
const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const fixture = () => ({
  bookId: '2026-1-lower', edition: '2026年现用修订版', total: 3,
  recognition: ['风', '雪', '云'],
  lessons: [
    {lessonKey: 'literacy-1', title: '识字1 春夏秋冬', characters:[{char:'春',pinyin:'chūn'},{char:'冬',pinyin:'dōng'}]},
    {lessonKey: 'reading-1', title: '1 吃水不忘挖井人', characters:[{char:'吃',pinyin:'chī'}]}
  ]
});

test('writing lessons use only the checked writing table in source order', () => {
  const lessons = parseWritingTable(fixture(), '2026-1-lower', 3);
  assert.deepEqual(lessons.map(l=>l.title), ['识字1 春夏秋冬','1 吃水不忘挖井人']);
  assert.deepEqual(lessons.flatMap(l=>l.chars.map(c=>c.char)), ['春','冬','吃']);
  assert.ok(lessons.every(l=>l.writingTable));
  assert.ok(lessons.flatMap(l=>l.chars).every(c=>c.words.length===0 && c.sentence===null));
});

test('a wrong book, incomplete table or duplicate character cannot silently enter learning', () => {
  assert.throws(()=>parseWritingTable(fixture(),'2026-2-lower',3),/册次/);
  assert.throws(()=>parseWritingTable(fixture(),'2026-1-lower',4),/字数/);
  const missing=fixture();missing.lessons[0].characters[0].pinyin='';
  assert.throws(()=>parseWritingTable(missing,'2026-1-lower',3),/读音/);
  const duplicated=fixture();duplicated.lessons[1].characters[0].char='春';
  assert.throws(()=>parseWritingTable(duplicated,'2026-1-lower',3),/生字/);
  const badPhrase=fixture();badPhrase.lessons[0].characters[0].readingPhrase='冬天';
  assert.throws(()=>parseWritingTable(badPhrase,'2026-1-lower',3),/读音提示/);
});

test('new table loading uses the selected local JSON and fails closed on bad responses', async () => {
  const calls=[];
  const data=fixture();
  const scope=vm.createContext({
    BOOK_CATALOG: {'2026-1-lower': {available:true,dataFile:'writing-tables/2026-1-lower.json',dataFormat:'writing-json-v1',characterCount:3}},
    window:{HANZI_WRITING_TABLES:{parseWritingTable}},
    fetch:async(url,options)=>{calls.push([url,options.cache]);return {ok:true,json:async()=>data};},
    encodeURI
  });
  vm.runInContext(app.slice(app.indexOf('async function loadLessonsFromTxt('),app.indexOf('async function loadDailyDictationWordBank(')),scope);
  const lessons=await scope.loadLessonsFromTxt('2026-1-lower');
  assert.equal(lessons[0].chars[0].char,'春');
  assert.deepEqual(calls,[['writing-tables/2026-1-lower.json','no-store']]);
  await assert.rejects(scope.loadLessonsFromTxt('missing'),/unavailable/);
  scope.fetch=async()=>({ok:false,status:404});
  await assert.rejects(scope.loadLessonsFromTxt('2026-1-lower'),/Failed to load/);
});

test('new editions have independent progress and leave previous records readable', () => {
  function keys(bookId) {
    const scope=vm.createContext({selectedBookId:bookId});
    vm.runInContext(app.slice(app.indexOf('function stableItemId('),app.indexOf('function formatDate(')),scope);
    vm.runInContext(app.slice(app.indexOf('function practiceProgressKey('),app.indexOf('function getPracticeProgress(')),scope);
    vm.runInContext(app.slice(app.indexOf('function dailyDictationProgressKey('),app.indexOf('function dailyDictationQueueKey(')),scope);
    return {
      practice:scope.practiceProgressKey(),
      item:scope.stableItemId({title:'第1课'},{char:'春',words:[]}),
      daily:scope.dailyDictationProgressKey()
    };
  }
  assert.deepEqual(keys('3-upper'),{
    practice:'hanzi-practice-v3-3-upper',item:encodeURIComponent('3-upper|第1课|春|春'),daily:'hanzi-daily-dictation-progress-v4-3-upper'
  });
  assert.notEqual(keys('2026-3-upper').practice,keys('3-upper').practice);
  assert.notEqual(keys('2026-3-upper').item,keys('3-upper').item);
  assert.notEqual(keys('2026-3-upper').practice,keys('2026-3-lower').practice);
  const scope=vm.createContext({selectedBookId:'2026-1-lower'});
  vm.runInContext(app.slice(app.indexOf('function stableItemId('),app.indexOf('function formatDate(')),scope);
  const lesson=parseWritingTable(fixture(),'2026-1-lower',3)[0];
  const before=scope.stableItemId(lesson,lesson.chars[0]);
  lesson.title='识字1（补充课名后）';
  assert.equal(scope.stableItemId(lesson,lesson.chars[0]),before);
});

test('character-only writing tables render usable learning controls without fabricated words', () => {
  const target={innerHTML:'',querySelector:()=>({addEventListener(){}}),querySelectorAll:()=>[]};
  const scope=vm.createContext({
    lessons:parseWritingTable(fixture(),'2026-1-lower',3),currentLessonIndex:0,currentCharIndex:0,
    window:{},charDetail:target,cacheHumanAudio(){},escapeHtml:s=>s,escapeAttr:s=>s,
    animateStrokes(){},renderCharacterPractice(){},playHumanChinese(){},getMeaningPinyin(){return '';}
  });
  vm.runInContext(app.slice(app.indexOf('function renderDetail('),app.indexOf('function renderCharacterPractice(')),scope);
  scope.renderDetail();
  assert.match(target.innerHTML,/写字表练习/);
  assert.match(target.innerHTML,/我来试试/);
  assert.doesNotMatch(target.innerHTML,/class="word-card"/);
  assert.doesNotMatch(target.innerHTML,/class="sentence-card"/);
});

test('all twelve 2026 books are available locally and the four earlier books retain their addresses', () => {
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'book-catalog.js'),'utf8'),context);
  const catalog=Object.values(context.window.HANZI_BOOK_CATALOG);
  const current=catalog.filter(book=>!book.legacy);
  assert.equal(current.length,12);
  assert.ok(current.every(book=>book.available && book.dataFormat==='writing-json-v1'));
  const expected={'1-upper':100,'1-lower':200,'2-upper':250,'2-lower':250,'3-upper':250,'3-lower':250,'4-upper':250,'4-lower':250,'5-upper':220,'5-lower':180,'6-upper':180,'6-lower':120};
  let total=0;
  for(const book of current){
    const data=JSON.parse(fs.readFileSync(path.join(root,book.dataFile),'utf8'));
    const expectedCount=expected[book.id.replace(/^2026-/,'')];
    assert.equal(book.characterCount,expectedCount);
    const lessons=parseWritingTable(data,book.id,expectedCount);
    total+=lessons.flatMap(l=>l.chars).length;
    assert.equal(data.source.table,'写字表');
    assert.ok(data.source.url.startsWith('https://'));
    assert.ok(data.source.printedPages.length);
    assert.ok(lessons.every(l=>l.lessonKey && l.title));
  }
  assert.equal(total,2500);
  assert.deepEqual(catalog.filter(book=>book.legacy && book.available).map(book=>book.id),['1-upper','2-upper','3-upper','4-upper']);
  assert.equal(catalog.find(book=>book.id==='3-upper').dataFile,'生字数据.txt');
});

test('checked modern-table glyphs and context readings survive conversion', () => {
  const book=id=>JSON.parse(fs.readFileSync(path.join(root,'writing-tables','2026-'+id+'.json'),'utf8'));
  const chars=id=>book(id).lessons.flatMap(l=>l.characters);
  const sequence=id=>chars(id).map(c=>c.char).join('');
  const reading=(id,char)=>chars(id).find(c=>c.char===char)?.pinyin;
  assert.match(sequence('1-upper'),/去年/);
  assert.ok(sequence('1-upper').includes('果'));
  for(const char of ['哦','睛','乏'])assert.ok(sequence('3-upper').includes(char));
  for(const char of ['噢','晴','之'])assert.ok(!sequence('3-upper').includes(char));
  assert.match(sequence('4-upper'),/浑牺牲庞/);
  assert.ok(!sequence('4-upper').includes('栖'));
  assert.equal(reading('2-upper','曲'),'qǔ');
  assert.equal(reading('2-lower','伯'),'bó');
  assert.equal(reading('2-lower','舍'),'shě');
  assert.equal(reading('2-lower','结'),'jiē');
  assert.equal(reading('2-lower','教'),'jiāo');
  assert.equal(reading('2-lower','倒'),'dào');
  assert.equal(reading('3-upper','挑'),'tiǎo');
  assert.equal(reading('3-upper','朝'),'cháo');
  assert.equal(reading('3-lower','系'),'jì');
  assert.equal(reading('3-lower','称'),'chèn');
  assert.equal(reading('3-lower','累'),'lěi');
  assert.equal(reading('4-lower','哩'),'li');
  assert.equal(reading('4-lower','晃'),'huàng');
  assert.equal(reading('4-lower','禁'),'jìn');
  assert.equal(reading('5-upper','哇'),'wa');
  assert.equal(reading('5-upper','扎'),'zā');
  assert.equal(reading('5-lower','监'),'jiàn');
  assert.equal(reading('5-lower','怔'),'zhèng');
  assert.equal(reading('5-lower','咧'),'liě');
  assert.equal(reading('6-upper','率'),'shuài');
  assert.equal(reading('6-upper','晕'),'yùn');
  assert.equal(reading('6-upper','薄'),'báo');
  assert.equal(reading('6-lower','脉'),'mò');
  assert.equal(reading('6-lower','哼'),'hng');
});
