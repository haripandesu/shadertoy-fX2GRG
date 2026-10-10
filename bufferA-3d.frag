mat2 Rotation(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat2(c,-s,s,c);
}

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

float Fbm(vec2 p)
{
    float v = 0.;
    float a = .5;
    for(int i=0; i<4; i++)
    {
        v += Noise(p)*a;
        p *= 2.;
        a *= .5;
    }
    return v;
}

float Sphere(vec3 p,float r)
{
    return length(p)-r;
}

float Capsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 pa = p-a;
    vec3 ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    return length(pa-ba*h)-r;
}

float Terrain(vec2 xz)
{
    float h = Fbm(xz*.12)*3.0;
    h += sin(xz.x*.15)*0.8;
    h += cos(xz.y*.12)*0.8;
    return h;
}

float Smin(float a, float b, float k)
{
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b,a,h) - k*h*(1.0-h);
}

float Creature(vec3 p)
{
    p.xz *= Rotation(3.14159);
    float t = 0.0;
    p.y-=2.6;
    p.z += p.y*0.08;
    vec3 tp = p;
    tp.y -= 2.2;
    float chest = Sphere(tp * vec3(1.2,1.0,0.8),0.9);
    float stomach = Sphere((tp-vec3(0,-0.9,0))*vec3(1.0,1.2,0.7),0.7);
    float torso = Smin(chest, stomach, 0.4);
    float spine = Capsule(p,vec3(0,1.0,-0.25),vec3(0,3.2,-0.2),0.08);
    torso = Smin(torso, spine, 0.25);
    vec3 hp = p - vec3(0,3.8,0.15);
    float skull = Sphere(hp * vec3(0.8,1.3,1.0),0.42);
    float jaw = Capsule(hp,vec3(0,-0.15,0.0),vec3(0,-0.55,0.25),0.12);
    float face = Capsule(hp,vec3(0,0.0,0.1),vec3(0,-0.1,0.45),0.16);
    float head = Smin(skull, jaw, 0.18);
    head = Smin(head, face, 0.2);
    float shoulderL = Sphere(p - vec3(-0.55,2.7,0), 0.28);
    float shoulderR = Sphere(p - vec3(0.55,2.7,0),0.28);
    float armL1 = Capsule(p,vec3(-0.45,2.6,0),vec3(-1.0,1.8,0.15),0.12);
    float armL2 = Capsule(p,vec3(-1.0,1.8,0.15),vec3(-1.15,0.8,0.3),0.09);
    float armR1 = Capsule(p,vec3(0.45,2.6,0),vec3(1.0,1.8,0.15),0.12);
    float armR2 = Capsule(p,vec3(1.0,1.8,0.15),vec3(1.15,0.8,0.3),0.09);
    float clawL = Capsule(p,vec3(-1.15,0.8,0.3),vec3(-1.35,0.55,0.65),0.035);
    float clawR = Capsule(p,vec3(1.15,0.8,0.3),vec3(1.35,0.55,0.65),0.035);
    float hips = Sphere((p-vec3(0,1.0,0))*vec3(1.0,0.8,0.8),0.45);
    float legL1 = Capsule(p,vec3(-0.22,0.9,0),vec3(-0.28,-0.3,0.05),0.14);
    float legL2 = Capsule(p,vec3(-0.28,-0.3,0.05),vec3(-0.22,-1.5,0.2),0.1);
    float legR1 = Capsule(p,vec3(0.22,0.9,0),vec3(0.28,-0.3,0.05),0.14);
    float legR2 = Capsule(p,vec3(0.28,-0.3,0.05),vec3(0.22,-1.5,0.2),0.1);
    float footL = Capsule(p,vec3(-0.22,-1.5,0.2),vec3(-0.22,-1.55,0.6),0.08);
    float footR = Capsule(p,vec3(0.22,-1.5,0.2),vec3(0.22,-1.55,0.6),0.08);
    float d = torso;
    d = Smin(d, head, 0.3);
    d = Smin(d, shoulderL, 0.2);
    d = Smin(d, shoulderR, 0.2);
    d = Smin(d, armL1, 0.2);
    d = Smin(d, armL2, 0.2);
    d = Smin(d, armR1, 0.2);
    d = Smin(d, armR2, 0.2);
    d = Smin(d, clawL, 0.08);
    d = Smin(d, clawR, 0.08);
    d = Smin(d, hips, 0.3);
    d = Smin(d, legL1, 0.2);
    d = Smin(d, legL2, 0.2);
    d = Smin(d, legR1, 0.2);
    d = Smin(d, legR2, 0.2);
    d = Smin(d, footL, 0.12);
    d = Smin(d, footR, 0.12);
    return d;
}

float sdSeg(vec3 p, vec3 a, vec3 b)
{
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
    return length(pa - ba*h);
}

// 丛生根须：参考真实根系形态——地表处纠结粗壮的根冠，
// 数条弯扭主根呈不对称扇形向外伸展，中段分出细侧根，逐级变细，
// 部分根拱起地表形成剪影；整体由 iTime 驱动持续细微蠕动。
float RootCluster(vec3 p)
{
    // 地面贴合（穿模修复）：p.xz 此处仍是世界水平偏移/uFigSize。取采样点
    // 所在世界位置与生物中心的地形高度差，把采样点沿 y 反向平移，
    // 使身体逐点趴附地表——跨起伏时不再陷入地面。
    // 穿透白名单：排线/散开粒子允许穿透（不做碰撞）；地面与实体不允许。
    float gh = Terrain(uCreaturePos.xz + p.xz * uFigSize) - (uCreaturePos.y - 0.02);
    p.y -= gh / uFigSize;

    // 转体：身体朝向随方向键转动（配合迈步完成转身）
    float ca = cos(uTurn), sa = sin(uTurn);
    vec2 rot = mat2(ca, sa, -sa, ca) * p.xz;
    p = vec3(rot.x, p.y, rot.y);

    float d = 1e9;

    // ---- 分节躯干：高于地面，爬行时沿体轴传递起伏波（非纯圆柱） ----
    vec3 prev = vec3(0.0, 0.14, -0.80);
    float prevR = 0.09;
    for (int s = 0; s < 6; s++)
    {
        float fs = float(s);
        float wave = sin(uGaitT*1.8 + fs*1.15);
        vec3 c = vec3(sin(fs*2.3 + uGaitT*0.4)*0.035*(0.4 + uCrawl),
                      0.34 + wave*(0.02 + 0.035*uCurl),
                      -0.62 + fs*0.30);
        float rr = 0.05 + 0.10 * pow(fs / 5.0, 0.85);   // 尾细头粗：fs=5 为头部端（P0-2 唯一前向）
        d = min(d, sdSeg(p, prev, c) - (prevR + rr)*0.5);
        d = min(d, length(p - c) - rr);
        // ---- 每节两侧的腿：相位交错，轮流抬起前摆（足部动作明显） ----
        if (s >= 1)
        {
            float phL = uGaitT*1.7 + fs*1.5;
            float phR = phL + 3.1416;
            float liftL = max(0.0, sin(phL));
            float liftR = max(0.0, sin(phR));
            vec3 hipL = vec3(-rr*0.7, c.y - rr*0.4, c.z);
            vec3 hipR = vec3( rr*0.7, c.y - rr*0.4, c.z);
            vec3 footL = vec3(-(rr + 0.30), liftL*0.13, c.z + 0.10 + (liftL - 0.3)*0.16*(0.4 + uCrawl));
            vec3 footR = vec3( rr + 0.30, liftR*0.13, c.z + 0.06 + (liftR - 0.3)*0.16*(0.4 + uCrawl));
            vec3 kneeL = mix(hipL, footL, 0.5) + vec3(-0.07, 0.10 + liftL*0.08, 0.0);
            vec3 kneeR = mix(hipR, footR, 0.5) + vec3( 0.07, 0.10 + liftR*0.08, 0.0);
            float r = 0.042 - fs*0.002;
            d = min(d, sdSeg(p, hipL, kneeL) - r);
            d = min(d, sdSeg(p, kneeL, footL) - r*0.7);
            d = min(d, sdSeg(p, hipR, kneeR) - r);
            d = min(d, sdSeg(p, kneeR, footR) - r*0.7);
        }
        prev = c; prevR = rr;
    }

    // 头部：局部 +z 端的膨大头球——主体唯一前向的视觉标识（P0-2）
    d = min(d, length(p - vec3(0.0, 0.36, 1.10)) - 0.16);

    // 揉弯：噪声轻微侵蚀距离（轮廓破碎毛躁）
    float wig = Noise(p.xz*6.5 + vec2(0.0, iTime*0.25)) - 0.5;
    d -= wig*0.045;
    return d;
}

// ---------- 幻象（假目标）：从地面升起的盘绕烟雾线柱 ----------
// 形态对应参考图（烟雾线条效果）：像毛线一样盘绕弯曲的线圈自地表向上升起——
// 底部是一团纠结的线圈结，往上环圈逐节升高、渐细渐疏，顶端散出断续线缕；
// 全部为铅笔质感的黑色圈圈线条：无白色、无固定轮廓、无实心黑块。
// 原地抖动循环严格对应手绘序列帧节奏：6 帧 × 170ms（循环 1.02s），
// 四组关键帧参数（风扰 / 扭转 / 松紧 / 伸缩）以 smoothstep 缓动插值，
// 帧过渡柔和无硬切；所有形变绕地表锚点进行，幻象整体不位移。
// 形变与全局排线抖动（uJitter/uJitterSpeed）完全解耦，仅由自身循环时钟驱动。
const float PH_LOOP = 1.02;                                                // 循环时长（秒）＝6帧×170ms
const float KF_GUST[6]  = float[6](0.35, 0.55, 0.20, 0.50, 0.30, 0.60);    // 风扰幅度（烟柱歪斜）
const float KF_TWIST[6] = float[6](0.00, 0.40,-0.35, 0.55,-0.45, 0.30);    // 线圈扭转（弧度）
const float KF_LOOSE[6] = float[6](1.00, 1.10, 0.96, 1.06, 1.12, 1.02);    // 线圈松紧
const float KF_RISE[6]  = float[6](1.00, 0.97, 1.05, 0.96, 1.03, 1.00);    // 纵向伸缩

float Phantom(vec3 p, int i)
{
    vec4 A = uPhantomA[i];   // xyz = 地表锚点, w = 淡入可见度（0~1）
    vec4 B = uPhantomB[i];   // x = 形态种子, y = 抖动循环相位偏移, z = 线柱尺度, w = 风向方位角
    float dis = uPhantomDis[i];   // 消散进度（0 完整 → 1 完全消散），抵达触发后由页面平滑推进
    float S = max(B.z, 1.0) * max(uPhantomSize, 0.05);
    vec3 q = p - A.xyz;
    // 外包快速剔除（含风扰/消散弥散与断裂侵蚀余量），远处光线不付出细算代价
    float reach = S * (1.1 + 0.9 * dis);
    if (dot(q.xz, q.xz) > reach*reach || q.y < -0.1*S || q.y > S*(1.25 + 0.45*dis))
        return 1e9;

    // ---- 手绘序列帧关键帧插值（smoothstep 缓动，帧过渡柔和） ----
    float tt = fract(iTime / PH_LOOP + B.y) * 6.0;
    int k0 = int(floor(tt));
    int k1 = (k0 < 5) ? (k0 + 1) : 0;
    float ff = smoothstep(0.0, 1.0, fract(tt));
    float gust  = mix(KF_GUST[k0],  KF_GUST[k1],  ff) * uPhantomJitter;
    float twist = mix(KF_TWIST[k0], KF_TWIST[k1], ff) * uPhantomJitter;
    float loose = 1.0 + (mix(KF_LOOSE[k0], KF_LOOSE[k1], ff) - 1.0) * uPhantomJitter;
    float rise  = 1.0 + (mix(KF_RISE[k0],  KF_RISE[k1],  ff) - 1.0) * uPhantomJitter;

    // 单位线柱空间（尺度 S → 1，地面 y=0）
    q /= S;
    // 纵向伸缩：整柱轻微起伏（锚点贴地不动，不是位移）
    q.y /= max(rise, 0.8);
    // 风扰：风向固定（逐实例种子），越高的线圈被吹得越远——烟雾感
    vec2 wind = vec2(cos(B.w), sin(B.w));
    float hgt = max(q.y, 0.0);
    q.xz -= wind * (gust * 0.28 + 0.12) * pow(hgt, 1.4);

    // ---- 消散形变：线圈松解后化作轻薄烟雾顺风向上升、向外弥散 ----
    // 全部随消散进度 dis 平滑推进（页面端 smoothstep），无硬跳变
    if (dis > 0.001) {
        float d2 = dis * dis;
        q.xz += wind * d2 * (0.28 + 0.42 * hgt);                                    // 顺风带走，越高飘越远
        q.xz += normalize(q.xz + vec2(0.0013, 0.0011)) * dis * 0.32 * (0.35 + hgt); // 径向向外弥散
        q.y  += dis * 0.28 * hgt;                                                   // 线缕缓缓上升
    }

    float d = 1e9;
    // ---- 盘绕烟柱：5 节自下而上的螺旋线圈 + 顶端断续线缕 ----
    // 每节线圈用 4 段胶囊近似螺旋，绕竖轴盘绕同时缓缓上升（毛线缠绕感）
    for (int k = 0; k < 5; k++)
    {
        float fk = float(k);
        float h    = 0.10 + fk * 0.17;                                   // 节高
        float cr   = (0.29 - fk * 0.026) * loose
                   * (0.85 + 0.30 * Hash(vec2(B.x, fk * 2.7 + 1.0)))
                   * (1.0 + dis * 0.85);                                 // 消散：线圈松解放大
        vec3  c    = vec3((Hash(vec2(B.x, fk * 2.7 + 2.0)) - 0.5) * 0.26,
                          h,
                          (Hash(vec2(B.x, fk * 2.7 + 3.0)) - 0.5) * 0.26);
        float ph   = Hash(vec2(B.x, fk * 2.7 + 4.0)) * 6.2831 + twist * (0.5 + fk * 0.22);
        float turns= 1.1 + Hash(vec2(B.x, fk * 2.7 + 5.0)) * 0.7;
        float rad  = (0.012 + Hash(vec2(B.x, fk * 2.7 + 6.0)) * 0.007)
                   * (1.0 - dis * 0.3);                                  // 消散：线条渐渐变细
        float yr   = 0.09 + Hash(vec2(B.x, fk * 2.7 + 7.0)) * 0.07;      // 线圈爬升
        vec3 prev = c + vec3(cr * cos(ph), 0.0, cr * sin(ph));
        for (int s = 0; s < 4; s++)
        {
            float fs = (float(s) + 1.0) / 4.0;
            float ang = ph + fs * turns * 6.2831;
            vec3 nxt = c + vec3(cr * cos(ang), fs * yr, cr * sin(ang));
            d = min(d, Capsule(q, prev, nxt, rad));
            prev = nxt;
        }
    }
    // 顶端线缕：2 根随风飘散的弯折细线
    for (int k = 0; k < 2; k++)
    {
        float fk = float(k + 5);
        float az  = Hash(vec2(B.x, fk * 2.7 + 1.0)) * 6.2831;
        vec3  a   = vec3(cos(az) * 0.10, 0.80 + fk * 0.05, sin(az) * 0.10);
        vec3  m   = a + vec3(wind.x * 0.07 + (Hash(vec2(B.x, fk * 2.7 + 2.0)) - 0.5) * 0.10,
                             0.06,
                             wind.y * 0.07 + (Hash(vec2(B.x, fk * 2.7 + 3.0)) - 0.5) * 0.10);
        vec3  b   = m + vec3(wind.x * 0.10 + (Hash(vec2(B.x, fk * 2.7 + 4.0)) - 0.5) * 0.12,
                             0.05 + Hash(vec2(B.x, fk * 2.7 + 5.0)) * 0.05,
                             wind.y * 0.10 + (Hash(vec2(B.x, fk * 2.7 + 6.0)) - 0.5) * 0.12);
        d = min(d, Capsule(q, a, m, 0.010));
        d = min(d, Capsule(q, m, b, 0.008));
    }
    // 断裂侵蚀：静态噪声把线条打断成铅笔断续炭痕；消散时侵蚀频率增大、深度收敛——
    // 碎片碎得更细如烟雾屑（不结成块），断裂纹样随进度向上爬升，仿佛被上升气流带走，
    // 残留碎屑再由渲染端透明度淡出抹去
    // （逐实例种子；无时间项——外形变化只来自关键帧与消散进度）
    float n = Noise(q.xy * (9.5 + 30.0 * dis) + vec2(B.x * 3.1, -q.z * 8.6 + B.x * 5.3 - dis * 5.0));
    d -= (n - 0.5) * (0.028 + 0.14 * dis);

    return d * S * min(rise, 1.0);
}

vec2 Map(vec3 p)
{
    float g = p.y - Terrain(p.xz);
    float c = RootCluster((p - uCreaturePos)/uFigSize)*uFigSize;
    float best = min(c, g);
    float id = (c < g) ? 1.0 : 2.0;
    for (int i = 0; i < 3; i++)
    {
        if (uPhantomA[i].w > 0.001)
        {
            float t = Phantom(p, i);
            if (t < best) { best = t; id = 3.0; }
        }
    }
    return vec2(best, id);
}

#define ZERO (min(iFrame,0))
vec3 Normal( in vec3 pos )
{
    vec3 n = vec3(0.0);
    for( int i=ZERO; i<4; i++ )
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*Map(pos+0.0005*e).x;
    }
    return normalize(n);
}

vec2 Raymarching(vec3 ro, vec3 rd)
{
    float d = 0.;
    float m = -1.;
    for(int i=0;i<128;i++)
    {
        vec3 p = ro + rd*d;
        vec2 h = Map(p);
        // 幻象 SDF 带噪声侵蚀、非严格距离场，临近时缩短步长防穿透
        d += h.x * (h.y > 2.5 ? 0.2 : 1.0);
        m = h.y;
        if(abs(h.x) < (h.y > 2.5 ? 0.03 : 0.001) || d>160.)
            break;
    }
    return vec2(d,m);
}

float Shadow(vec3 ro, vec3 rd)
{
    float res = 1.;
    float t = .02;
    for(int i=0;i<48;i++)
    {
        float h = Map(ro+rd*t).x;
        res = min(res,10.*h/t);
        t += clamp(h,.02,.25);
        if(h<.001 || t>20.) break;
    }
    return clamp(res,0.,1.);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    // 3D 轨道相机：绕注视点（根须生物）旋转，方位/俯仰/距离由页面鼠标控制
    vec3 ro = uCamTarget + uCamDist * vec3(sin(uCamYaw) * cos(uCamPitch),
                                           sin(uCamPitch),
                                           cos(uCamYaw) * cos(uCamPitch));
    vec3 ta = uCamTarget;
    vec3 f = normalize(ta-ro);
    vec3 r = normalize(cross(vec3(0,1,0),f));
    vec3 u = cross(f,r);
    vec3 rd = normalize(f + uv.x*r + uv.y*u);
    vec3 col = mix(vec3(0.02,0.03,0.08),vec3(0.4,0.05,0.08),uv.y*0.5+0.5);
    vec2 muv = uv - vec2(0.45,0.25);
    vec2 hit = Raymarching(ro,rd);
    if(hit.x < 160.)
    {
        vec3 p = ro + rd*hit.x;
        vec3 n = Normal(p);
        vec3 lightPos = vec3(5,8,-4);
        vec3 l = normalize(lightPos-p);
        float diff = max(dot(n,l),0.);
        float sh = Shadow(p+n*.01,l);
        diff *= sh;
        float rim = pow(1.-max(dot(n,-rd),0.),3.);
        if(hit.y < 1.5)
        {
            vec3 base = vec3(0.03,0.03,0.04);
            base += vec3(0.4,0.0,0.0)*rim;
            vec3 lp = p;
            lp.y -= Terrain(vec2(0.));
            base += diff*0.25;
            col = base;
        }
        else if(hit.y < 2.5)
        {
            vec3 ground = mix(vec3(0.8,0.2,0.3), vec3(0.1,0.8,1.0), Fbm(p.xz*.1));
            ground *= 0.25 + diff*.75;
            // ---- 行走痕迹：足迹墨迹压暗地表。只在地面分支采样，采样点即地表
            // 命中点——痕迹贴着地形起伏渲染，不悬浮不穿模；墨迹自带炭纹留白，
            // 排线风格化仍由 Image pass 完成，与全局炭笔质感统一 ----
            vec2 tuv = (p.xz - uTrailOrigin) / uTrailWindow;
            if (all(greaterThan(tuv, vec2(0.001))) && all(lessThan(tuv, vec2(0.999))))
            {
                float tInk = texture(uTrailTex, tuv).r;
                vec2  bm = min(tuv, 1.0 - tuv);
                float bMask = smoothstep(0.0, 0.06, min(bm.x, bm.y));   // 纹理窗口边缘渐隐，绝不硬切
                // 参考图实测：拖痕平均压暗约 2 成、核心线约 4 成——系数 0.45、
                // 上限 0.62 标定出"深核心 + 羽化毛边"的剖面（黑度仍透排线）
                ground *= 1.0 - clamp(0.45 * uTrailInk * tInk * bMask, 0.0, 0.62);
            }
            col = ground;
        }
        else
        {
            // 幻象：铅笔质感的黑色盘绕线圈（无白色、无实心黑块），
            // 墨色深浅起伏让排线透出；消散进度后段透明度平滑降低（先形变后淡出）
            float phFade = 0.0, phBest = 1e9;
            int phIdx = 0;
            for (int i = 0; i < 3; i++)
            {
                float dd = length(p - uPhantomA[i].xyz);
                if (dd < phBest) { phBest = dd; phFade = uPhantomA[i].w; phIdx = i; }
            }
            // 淡出贯穿整个 3 秒消散：透明度按 1.6 次幂加速衰减——碎片随碎化同步变淡，
            // 中段已半透明、末段无痕消隐，不再是浓黑显眼的残块
            float vis = phFade * pow(1.0 - smoothstep(0.0, 1.0, uPhantomDis[phIdx]), 1.6);
            float streak = Fbm(vec2(p.x*2.2 - p.z*1.1, p.y*0.85));
            vec3 ink = vec3(0.030, 0.022, 0.036) * (0.45 + 0.95 * streak);
            ink = mix(ink, vec3(0.45, 0.41, 0.49), 0.55 * uPhantomDis[phIdx]);  // 墨色随消散提浅为灰烟色
            col = mix(col, ink, vis * 0.8 * uPhantomInk);
        }
        float fog = exp(-hit.x*.03);
        vec3 fogCol = mix(vec3(0.6,0.2,0.3), vec3(0.1,0.6,1.0), uv.y + 0.3);
    }
    col = pow(col,vec3(.75));
    fragColor = vec4(col,1);
}
