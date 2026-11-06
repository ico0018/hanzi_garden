// Content checks are independent of the application parser.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let total=0;const keys=new Set();const usage=[];const books=[];
for(const grade of [4,5,6])for(const term of ['upper','lower']){
  const file=`writing-tables/2026-${grade}-${term}.json`;
  const old=JSON.parse(cp.execFileSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),'-C',root,'show','ba589dc:'+file],{encoding:'utf8'}));
  const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  assert.equal(data.learningSupportVersion,1);
  assert.equal(data.learningSupport.type,'author-created-supplement');
  const stripped=structuredClone(data);delete stripped.learningSupportVersion;delete stripped.learningSupport;
  for(const lesson of stripped.lessons)for(const char of lesson.characters){delete char.words;delete char.sentence;delete char.examplesLabel;}
  assert.deepEqual(stripped,old,`${file}: original curriculum changed`);
  let count=0;
  for(const lesson of data.lessons)for(const char of lesson.characters){
    count++;total++;keys.add(char.char+'|'+char.pinyin);
    assert.equal(char.words.length,2);
    assert.notEqual(char.words[0].word,char.words[1].word);
    for(const w of char.words){assert(w.word.includes(char.char));assert.equal(typeof w.pinyin,'string');assert.equal(typeof w.meaning,'string');}
    assert(char.words.some(w=>w.word===char.sentence.groupWord));
    if(char.char==='牺'){
      assert.equal(char.examplesLabel,undefined,'牺牲/牺牲品 are two real words, not a usage-only exception');
      assert(char.words.every(w=>w.kind===undefined));
      assert.deepEqual(char.words.map(w=>w.word),['牺牲','牺牲品']);
    }
    assert(char.sentence.text.includes(char.sentence.groupWord));
    assert(/[。！？][”’]?$/.test(char.sentence.text));
    assert(!/学习(?:了)?这个|老师教我认识|是个好词|用.+造句/.test(char.sentence.text));
    if(char.examplesLabel){assert.equal(char.examplesLabel,'用法示例');assert(char.words.every(w=>w.kind==='usage'));usage.push({book:data.bookId,char:char.char,pinyin:char.pinyin,examples:char.words.map(w=>w.word)});}
  }
  assert.equal(count,data.total);books.push({book:data.bookId,total:count});
}
assert.equal(total,1200);
console.log(JSON.stringify({status:'PASS',slots:total,uniqueReadingKeys:keys.size,books,usage},null,2));
