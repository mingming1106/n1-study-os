#!/usr/bin/env python3
import json, sqlite3, sys, urllib.request, subprocess, os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
N1_URL='https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/vocab/n1.json'
TOMOSHI_URL='https://huggingface.co/datasets/yuany1z/tomoshi-dict-data/resolve/main/tomoshi-dict-open.db.zst'

def dl(url,path):
    print('download',url)
    urllib.request.urlretrieve(url,path)

def rows_as_dicts(db, table):
    cols=[r[1] for r in db.execute(f'PRAGMA table_info({table})')]
    return cols

def pick_id_col(cols):
    for c in ('entry_id','jmdict_id','ent_seq','id'):
        if c in cols:return c
    return next((c for c in cols if 'entry' in c.lower() and 'id' in c.lower()),None)

def normalize_defs(v):
    if v is None:return []
    if isinstance(v,(list,dict)):obj=v
    else:
        s=str(v).strip()
        try: obj=json.loads(s)
        except Exception: obj=s
    out=[]
    def walk(x):
        if isinstance(x,str):
            z=x.strip()
            if z and z not in out:out.append(z)
        elif isinstance(x,list):
            for y in x:walk(y)
        elif isinstance(x,dict):
            # Prefer fields that are actually gloss text; ignore ids/metadata.
            preferred=['glosses','gloss','definitions','definition','defs','meanings','meaning','zh','text','value']
            hit=False
            for k in preferred:
                if k in x: walk(x[k]); hit=True
            if not hit:
                for k,y in x.items():
                    if not any(t in k.lower() for t in ('id','seq','source','lang','pos','tag','meta')): walk(y)
    walk(obj)
    return out

def main():
    tmp=ROOT/'scripts'/'_build'; tmp.mkdir(exist_ok=True)
    n1p=tmp/'n1.json'; zp=tmp/'tomoshi.db.zst'; dbp=tmp/'tomoshi.db'
    if not n1p.exists(): dl(N1_URL,n1p)
    if not zp.exists(): dl(TOMOSHI_URL,zp)
    if not dbp.exists():
        try: subprocess.run(['zstd','-d','-f',str(zp),'-o',str(dbp)],check=True)
        except FileNotFoundError:
            import zstandard as zstd
            with open(zp,'rb') as src, open(dbp,'wb') as dst:zstd.ZstdDecompressor().copy_stream(src,dst)
    words=json.loads(n1p.read_text())
    db=sqlite3.connect(dbp); db.row_factory=sqlite3.Row
    tables={r[0] for r in db.execute("select name from sqlite_master where type='table'")}
    if 'zh_defs' not in tables: raise RuntimeError('Tomoshi database has no zh_defs table')
    cols=rows_as_dicts(db,'zh_defs'); idc=pick_id_col(cols)
    if not idc: raise RuntimeError('Cannot identify entry id column in zh_defs: '+repr(cols))
    value_cols=[c for c in cols if c!=idc and not any(t in c.lower() for t in ('created','updated','version','source','lang'))]
    print('zh_defs columns',cols,'id=',idc,'values=',value_cols)
    zh={}
    for row in db.execute('select * from zh_defs'):
        eid=row[idc]
        vals=[]
        for c in value_cols: vals += normalize_defs(row[c])
        # Chinese definitions should contain CJK often; keep text but remove obvious JSON labels/noise.
        vals=[x for x in vals if len(x)<500 and x not in vals[:vals.index(x)] ]
        if vals: zh[str(eid)]=vals
    matched=0
    for w in words:
        defs=zh.get(str(w.get('jmdict_id')))
        if defs:
            w['zh_meanings']=defs; w['zh_source']='Tomoshi/JMdict'; matched+=1
        else:w['zh_meanings']=[]
    out=ROOT/'n1-vocab-zh.json'; out.write_text(json.dumps(words,ensure_ascii=False,separators=(',',':')))
    report={'total':len(words),'zh_matched':matched,'coverage_pct':round(matched/len(words)*100,2),'unmatched':[{'word':w['word'],'reading':w.get('reading'),'jmdict_id':w.get('jmdict_id')} for w in words if not w.get('zh_meanings')]}
    (ROOT/'vocab-coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k!='unmatched'},ensure_ascii=False))
    if matched < int(len(words)*0.95):
        print('WARNING: Chinese coverage below 95%; inspect schema/matching before relying on it.',file=sys.stderr)
        sys.exit(2)
if __name__=='__main__':main()
