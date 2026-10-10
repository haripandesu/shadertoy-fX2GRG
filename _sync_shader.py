# -*- coding: utf-8 -*-
# 将 .frag 源文件逐字同步进 scene3d.html 的内嵌 shader 副本，并校验一致。
# 用法: py _sync_shader.py
import re
import io
import sys

BASE = r"E:\服设\新建文件夹\shadertoy-fX2GRG"
HTML = BASE + r"\scene3d.html"
MAP = [
    ("shader-bufferA", "bufferA-3d.frag"),
    ("shader-trail", "trail.frag"),
]

def read(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

html = read(HTML)
changed = False
for fid, fname in MAP:
    src = read(BASE + "\\" + fname)
    pat = re.compile(r'<script type="x-shader/x-fragment" id="%s">.*?</script>' % fid, re.S)
    m = pat.search(html)
    block = '<script type="x-shader/x-fragment" id="%s">%s</script>' % (fid, src)
    if m:
        if m.group(0) != block:
            html = pat.sub(lambda _: block, html, count=1)
            changed = True
            print("[sync] %s <- %s (已更新)" % (fid, fname))
        else:
            print("[sync] %s 已一致" % fid)
    else:
        # 不存在则插入到 bufferA 标签之后（trail 首次接入）
        anchor = re.compile(r'(<script type="x-shader/x-fragment" id="shader-bufferA">.*?</script>)', re.S)
        assert anchor.search(html), "anchor shader-bufferA not found"
        html = anchor.sub(lambda m_: m_.group(1) + "\n\n" + block, html, count=1)
        changed = True
        print("[sync] %s <- %s (新增标签)" % (fid, fname))

if changed:
    with io.open(HTML, "w", encoding="utf-8", newline="") as f:
        f.write(html)

# ---- 校验：内嵌副本必须与 .frag 逐字一致 ----
html2 = read(HTML)
ok = True
for fid, fname in MAP:
    src = read(BASE + "\\" + fname)
    m = re.search(r'<script type="x-shader/x-fragment" id="%s">(.*?)</script>' % fid, html2, re.S)
    if not m:
        print("[FAIL] %s 标签缺失" % fid); ok = False
    elif m.group(1) != src:
        print("[FAIL] %s 与 %s 不一致" % (fid, fname)); ok = False
    else:
        print("[OK] %s == %s (%d 字符)" % (fid, fname, len(src)))
sys.exit(0 if ok else 1)
