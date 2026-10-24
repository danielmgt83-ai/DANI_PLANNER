#!/usr/bin/env python3
"""ساخت نسخه‌ی تک‌فایل (برای ارسال، پشتیبان یا باز کردن بدون سرور) از روی پوشه‌ی پروژه.
اجرا از ریشه‌ی پروژه:   python3 tools/make-single-file.py
خروجی:  dist/DANI_Planner_single.html
- CSS و JS داخل HTML قرار می‌گیرند (به همان ترتیب index.html).
- هر مسیر img/…  و audio/…  به فایل base64 تبدیل می‌شود.
- manifest و سرویس‌ورکر در تک‌فایل کار نمی‌کنند (فقط با آدرس http/https فعال می‌شوند)."""
import os,re,base64,mimetypes
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(root,p),encoding='utf-8').read()
def uri(rel):
    mt=mimetypes.guess_type(rel)[0] or 'application/octet-stream'
    return 'data:%s;base64,%s'%(mt,base64.b64encode(open(os.path.join(root,rel),'rb').read()).decode())
html=rd('index.html')
html=re.sub(r'<link rel="manifest"[^>]*>','',html)
html=re.sub(r'<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">',lambda m:'<style>\n'+rd(m.group(1))+'\n</style>',html)
html=re.sub(r'<script src="([^"?]+)(?:\?[^"]*)?"></script>',lambda m:'<script>\n'+rd(m.group(1)).replace('</script','<\\/script')+'\n</script>',html)
for icon in set(re.findall(r'href="(icons/[^"]+)"',html)): html=html.replace('href="%s"'%icon,'href="%s"'%uri(icon))
files=[]
for d in ('img','audio'):
    for f in sorted(os.listdir(os.path.join(root,d))):
        if f.lower().endswith(('.jpg','.jpeg','.png','.webp','.mp3','.gif','.svg')): files.append(d+'/'+f)
cache={}
def sub(m):
    p=m.group(0)
    if p not in cache: cache[p]=uri(p)
    return cache[p]
pat=re.compile('|'.join(re.escape(f) for f in sorted(files,key=len,reverse=True)))
html=pat.sub(sub,html)
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
out=os.path.join(root,'dist','DANI_Planner_single.html'); open(out,'w',encoding='utf-8').write(html)
print('ساخته شد:',out,round(os.path.getsize(out)/1048576,2),'MB؛',len(cache),'فایل داخل آن قرار گرفت')
