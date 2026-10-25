#!/usr/bin/env python3
"""لیست فایل‌های sw.js (PRECACHE) را از روی پوشه‌ی پروژه دوباره می‌سازد تا برنامه بعد از اولین اجرا آفلاین هم بالا بیاید.
اجرا از ریشه‌ی پروژه:   python3 tools/update-sw.py
هر بار نسخه‌ی کش (dani-vN) هم یکی بالا می‌رود تا فایل‌های قدیمی پاک شوند."""
import os,re,json
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files=['./']
for d,dirs,fs in os.walk(root):
    dirs[:]=[x for x in dirs if x not in ('tools','.git','docs','.github','android-shell','dist')]
    for f in fs:
        rel=os.path.relpath(os.path.join(d,f),root).replace(os.sep,'/')
        if rel in ('sw.js','.nojekyll') or rel.endswith(('.txt','.md','.bat','.command','.sh','.yml','.py')): continue
        files.append(rel)
files=sorted(set(files),key=lambda x:(x!='./',x!='index.html',x))
p=os.path.join(root,'sw.js'); s=open(p,encoding='utf-8').read()
s=re.sub(r"const PRECACHE=\[.*?\];","const PRECACHE="+json.dumps(files,ensure_ascii=False)+";",s,count=1,flags=re.S)
s=re.sub(r"const VERSION='dani-v(\d+)'",lambda m:"const VERSION='dani-v%d'"%(int(m.group(1))+1),s,count=1)
open(p,'w',encoding='utf-8').write(s); print(len(files),'فایل در PRECACHE؛ نسخه‌ی کش بالا رفت')
