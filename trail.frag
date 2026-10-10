// ============ 行走痕迹 pass：足迹盖印 + 逐像素寿命衰减（ping-pong） ============
// R 通道 = 墨量（0~1 封顶，新足迹叠加累加——交叉重叠处排线自然加深，互不擦除）；
// G/B 通道 = 16 位打包的"距上次盖印秒数"。每帧先把旧迹按寿命包络衰减
// （留存期内 1:1 完整保留，期满后 smoothstep 缓淡归零，帧率无关、无硬切），
// 再把页面端按行进距离投递的足迹队列盖印进纹理（墨量累加、重置寿命）。
// 足迹形状：沿行进方向拉长的宽墨渍（重叠成参考图的连续拖痕）+ 噪声啃出的
// 撕扯毛边 + 内部横向炭纹留白，纹样全部以世界坐标为锚（同一路径上稳定不闪）；炭笔排线质感交给
// Buffer A 压暗 + Image pass 风格化完成，与全局画面统一。
uniform sampler2D uPrevTrail;
uniform vec2  uOriginPrev;   // 上一帧纹理 uv(0,0) 的世界坐标
uniform vec2  uOriginNow;    // 本帧纹理 uv(0,0) 的世界坐标（窗口跟随主体滚动）
uniform float uWindow;       // 纹理覆盖的世界边长
uniform float uDt;           // 真实帧间隔（不经帧率钳制，寿命按墙钟推进）
uniform float uLife;         // 痕迹留存时间（面板滑杆，秒）
uniform float uTrailWidth;   // 痕迹粗细（面板滑杆）
uniform int   uStampCount;   // 本帧盖印数
uniform vec4  uStamp[8];     // xy = 地表世界坐标, z = 行进朝向角, w = 墨量

float Hash(vec2 p)
{
    p = fract(p*vec2(234.5,435.6));
    p += dot(p,p+34.5);
    return fract(p.x*p.y);
}

float Noise(vec2 p)
{
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = Hash(i);
    float b = Hash(i+vec2(1,0));
    float c = Hash(i+vec2(0,1));
    float d = Hash(i+vec2(1,1));
    vec2 u = f*f*(3.-2.*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}

// 寿命 16 位打包（0~64s，精度约 1ms）；Buffer A 只读 R 通道，互不干扰
const float AGE_MAX = 64.0;
vec2 encAge(float a)
{
    float v = clamp(a / AGE_MAX, 0.0, 1.0) * 65535.0;
    float hi = floor(v / 256.0);
    return vec2(hi, v - hi * 256.0) / 255.0;
}
float decAge(vec2 gb)
{
    return (floor(gb.x * 255.0 + 0.5) * 256.0 + floor(gb.y * 255.0 + 0.5)) / 65535.0 * AGE_MAX;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;
    vec2 world = uOriginNow + uv * uWindow;
    vec2 puv = (world - uOriginPrev) / uWindow;   // 本像素世界位置在上一帧纹理中的位置

    float ink = 0.0;
    float age = AGE_MAX;
    if (all(greaterThan(puv, vec2(0.0))) && all(lessThan(puv, vec2(1.0))))
    {
        vec4 prev = texture(uPrevTrail, puv);
        ink = prev.r;
        age = decAge(prev.gb);
    }

    // ---- 寿命衰减：留存期内完整保留（包络=1），期满 smoothstep 缓淡归零 ----
    const float FADE = 4.0;
    age += uDt;
    ink *= 1.0 - smoothstep(uLife, uLife + FADE, age);
    if (age >= uLife + FADE) ink = 0.0;

    // ---- 盖印本帧拖痕（参考图：虫体拖出的连续宽墨渍，不是离散脚印） ----
    float add = 0.0;
    float hit = 0.0;
    for (int i = 0; i < 8; i++)
    {
        if (i >= uStampCount) break;
        vec4 s = uStamp[i];
        vec2 d = world - s.xy;
        float ca = cos(s.z), sa = sin(s.z);
        vec2 l = mat2(ca, -sa, sa, ca) * d;          // x = 横向, y = 沿行进方向
        // 墨渍：沿行进方向拉长，半径逐印微随机（手绘宽窄不一）；
        // 宽度约取虫体一半——参考图的拖痕远窄于虫体投影
        float r = 0.30 * uTrailWidth * (0.82 + 0.36 * Hash(s.xy + vec2(7.1, 3.7)));
        vec2 el = vec2(l.x * 1.12, l.y * 0.78);
        float sd = length(el) - r;
        // 撕扯毛边：粗颗粒噪声啃出破碎轮廓 + 细颗粒尘雾（世界锚定，盖印后稳定）
        sd += (Noise(world * 3.2 + s.xy * 0.11) - 0.5) * 0.34 * r;
        sd += (Noise(world * 13.0 + s.xy * 0.31) - 0.5) * 0.14 * r;
        float mask = smoothstep(0.16, -0.05, sd);
        if (mask > 0.001)
        {
            // 内部炭纹：横亘行进方向的擦痕留白（核心仍近实心，重叠处自然加深）
            float hn = Noise(l * (11.0 / uTrailWidth) + s.xy * 1.7);
            float strokes = 0.72 + 0.28 * sin(l.x * (9.0 / uTrailWidth) + hn * 6.0 + s.z * 4.0);
            add += s.w * mask * mix(1.0, strokes, 0.30);
            hit = max(hit, mask);
        }
    }
    ink = min(1.0, ink + add);
    if (hit > 0.0) age = 0.0;   // 新墨覆盖处寿命重置

    fragColor = vec4(ink, encAge(min(age, AGE_MAX)), 1.0);
}
