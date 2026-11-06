"""Apply explicitly authored and reviewed higher-grade supplements (not textbook prose)."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
SPECIAL={('2026-4-upper','哩'),('2026-4-upper','啦'),('2026-4-upper','崛'),
         ('2026-5-upper','吩'),('2026-5-upper','冯'),('2026-5-upper','哇'),
         ('2026-5-upper','迪'),('2026-5-upper','矣'),
         ('2026-5-lower','彭'),('2026-5-lower','骏'),('2026-5-lower','咙'),
         ('2026-6-upper','裳'),('2026-6-upper','娜'),('2026-6-upper','唉'),
         ('2026-6-upper','嘿'),('2026-6-upper','嘛'),('2026-6-upper','蟋'),
         ('2026-6-upper','蟀'),('2026-6-upper','猬'),
         ('2026-6-lower','哼'),('2026-6-lower','蚯'),('2026-6-lower','蚓')}
corpus={}
for source in sorted((ROOT/'scripts').glob('higher-examples-*.tsv')):
    book='2026-'+source.stem.removeprefix('higher-examples-')
    original=json.loads((ROOT/'writing-tables'/f'{book}.json').read_text(encoding='utf-8'))
    readings={c['char']:c['pinyin'] for lesson in original['lessons'] for c in lesson['characters']}
    for index,line in enumerate(source.read_text(encoding='utf-8').splitlines(),1):
        if not line.strip():continue
        char,word1,word2,sentence=line.split('|')
        assert char in readings,(source,index,char)
        assert word1!=word2 and char in word1 and char in word2,(char,word1,word2)
        linked=next((w for w in [word1,word2] if w in sentence),None)
        assert linked and sentence.rstrip('”’')[-1] in '。！？',(char,sentence)
        entry={'words':[{'word':word1,'pinyin':'','meaning':''},{'word':word2,'pinyin':'','meaning':''}],
               'sentence':{'groupWord':linked,'text':sentence}}
        if (book,char) in SPECIAL:
            entry['examplesLabel']='用法示例'
            for w in entry['words']:w['kind']='usage'
        corpus[(char,readings[char])]=entry

report=[]
for file in sorted((ROOT/'writing-tables').glob('2026-[456]-*.json')):
    data=json.loads(file.read_text(encoding='utf-8'));missing=[]
    for lesson in data['lessons']:
        for char in lesson['characters']:
            entry=corpus.get((char['char'],char['pinyin']))
            if entry:
                for field in ('words','sentence','examplesLabel'):
                    char.pop(field,None)
                char.update(entry)
            else:missing.append(char['char'])
    if missing:
        print(file.stem,'missing',len(missing),''.join(missing))
        continue
    data['learningSupportVersion']=1
    data['learningSupport']={'type':'author-created-supplement','note':'组词与例句为教学补充；例句为自编内容，不是教材原文。'}
    file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    report.append({'book':data['bookId'],'total':data['total']})
print(json.dumps(report,ensure_ascii=False))
