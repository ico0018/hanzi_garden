import json,pathlib,subprocess,re,collections,unicodedata
ROOT=pathlib.Path(__file__).resolve().parent.parent
results={'baseline':'ba589dc','totalTextbookPositions':0,'completedBooks':[],'checks':[]}
for f in sorted((ROOT/'writing-tables').glob('2026-*.json')):
 b=json.loads(subprocess.check_output(['git','show','ba589dc:writing-tables/'+f.name],cwd=ROOT).decode('utf-8'))
 n=json.loads(f.read_text(encoding='utf-8'))
 stripped=json.loads(json.dumps(n,ensure_ascii=False))
 stripped.pop('learningSupportVersion',None);stripped.pop('learningSupport',None)
 for l in stripped['lessons']:
  for c in l['characters']:
   for key in ['words','sentence','examplesLabel']:c.pop(key,None)
 assert stripped==b, f'{f.name}: original textbook fields changed'
 count=sum(len(l['characters']) for l in n['lessons']);results['totalTextbookPositions']+=count
 if n.get('learningSupportVersion')!=1 or n['bookId'].split('-')[1] not in ['1','2','3']:continue
 phrases=[]
 for lesson in n['lessons']:
  for c in lesson['characters']:
   words=c['words'];sentence=c['sentence'];assert len(words)==2
   assert len({w['word'] for w in words})==2,(n['bookId'],c)
   for w in words:
    assert c['char'] in w['word'],(c,w)
    assert isinstance(w['pinyin'],str) and isinstance(w['meaning'],str)
    usage=c.get('examplesLabel')=='用法示例' and w.get('kind')=='usage'
    assert (2<=len(w['word'])<=20 if usage else re.fullmatch(r'[\u3400-\u9fff]{2,8}',w['word'])),(c,w)
    if not usage:
     base=''.join(ch for ch in unicodedata.normalize('NFD',c['pinyin']) if unicodedata.category(ch)!='Mn')
     assert any(ch==c['char'] and py in [c['pinyin'],base] for ch,py in zip(w['word'],w['pinyin'].split())),(c,w)
    else:phrases.append(c['char'])
   assert sentence['groupWord'] in [w['word'] for w in words]
   assert sentence['groupWord'] in sentence['text']
   assert 6<=len(sentence['text'])<=70,(c,sentence)
   assert not re.search(r'我学会了.*这个词|我认真读了|这是.*的组词',sentence['text']),sentence
 results['completedBooks'].append({'book':n['bookId'],'positions':count,'usageCharacters':sorted(set(phrases))})
assert results['totalTextbookPositions']==2500
results['checks']=['all original textbook fields, orders and sources identical to baseline','completed books have exactly 2 unique words and linked natural sentence','ordinary words contain target character and matching textbook reading','usage exceptions explicit, bounded and not passed off as ordinary words','2500 total textbook positions retained']
(ROOT/'content-review/content-check-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
