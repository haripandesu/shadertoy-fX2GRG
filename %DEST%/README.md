# The Quiet Presence / The Horror of the Moorlands — 本地复刻与绘画改编

- **原作**：Shadertoy <https://www.shadertoy.com/view/fX2GRG>（The Horror of the Moorlands，作者 PrzemyslawZaworski）
- **原版复刻**：`index.html` — 与 Shadertoy 原作一致（荒原 + 生物 + 边缘排线风格化）。
  右上角参数面板可实时调节：线条密度、线条粗细、抖动幅度、抖动速度、
  线条卷曲、线条移动、人形大小、边缘强度。
  抖动幅度/速度作用于**所有线条**：边缘轮廓线、排线纹理本体、明暗随机层、
  采样偏移层；抖动速度默认 1（画面轻微颤动），卷曲/移动默认 0（原作静态构图）。
- **绘画版**：`art.html` — 保留原作场景骨架与人形，画面改编为铅笔排线风格的
  "不安静物"（The Quiet Presence）：奶油色纸面上，极细锐的铅笔圈线以人形为
  唯一中心一圈圈包裹、向全画发散；圈线随角度自由起伏、断笔、两套圈距互相
  交错，不规整也不闭合；形内交叉排线画实、头肩渐渐消散，胸口一枚小红点。
  右上角参数面板可实时调节：线条密度、粗细、抖动、深浅、断笔、交错线、
  线条移动速度、纸面扰动、人形大小、人形排线、包裹层。
  所有线条随时间极缓慢地游移、断续、重描——一张永远画不完、静而不安的画。

## 运行方式

- **方式一（推荐）**：目录下启动任意静态服务器后访问，例如
  `python -m http.server 8097`，打开 <http://127.0.0.1:8097/>。
- **方式二**：直接双击 `index.html` / `original.html`（页面内嵌了着色器副本，
  `file://` 下也能运行）。

需要支持 WebGL2 的浏览器。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 原版复刻：WebGL2 运行环境 + 内嵌原作着色器副本 + 控制条 |
| `bufferA-original.frag` / `image-original.frag` | 原作源码（光线步进 / 边缘排线），index.html 优先加载 |
| `art.html` | 绘画版：铅笔圈线改编 + 右上角参数面板 |
| `bufferA.frag` / `image.frag` | 绘画版着色器源码（art.html 优先加载） |
| `passes.json` | 从原页面导出的 Pass/通道连接信息 |

## 渲染管线（两个版本相同）

Buffer A（离屏渲染，乒乓缓冲）→ Image（iChannel0 采样 Buffer A，输出屏幕）。

绘画版中 Buffer A 不再输出颜色而是输出遮罩通道：
`R=人形、G=地面、B=投影、A=人形高度`；Image Pass 据此生成全部线条。
已实现 Shadertoy 环境接口（`iResolution/iTime/iFrame/iMouse/...`）与
Shadertoy 鼠标语义。

## 快捷键 / 控件

`空格` 暂停/继续；`R` 重新开始；底部按钮：全屏、分辨率 50%–100%。

## 修改着色器

原版：编辑 `bufferA-original.frag` / `image-original.frag` 后刷新 `index.html`；
绘画版：编辑 `bufferA.frag` / `image.frag` 后刷新 `art.html`（http 打开时生效）。
直接双击打开时请修改页面中对应的 `<script>` 内嵌副本（两者需保持同步）。
