# 安全/ · 写实收藏胸像桌宠 —— 多 Agent 交接文档（必读）

> 本文件只追加，不覆盖历史。每次开工前先读本文件与根目录 `HANDOFF.md` 末尾的「安全版」条目。
> 后续 Agent 请在文末「交接日志」追加一条，写清日期、做了什么、没做完什么、已知问题。

## 0. 这个文件夹是什么
- `安全/` 是从仓库 main 中**独立拆出**的安全版本：写实风格的**收藏胸像**（活人自然神态的虚构角色 + 中性展示底座）生成 / 管理 / 设置 / 桌宠软件。
- **不连接、不导入**根目录旧项目代码（`src/`、`index.html`、`点击开始游戏_CERVIX3D.html` 等）。旧项目由用户自述为“其他 AI 乱跑的”，用户本意不想继续它。
- 渲染模块来源：`画质提升/src/`（中性的写实渲染研究模块），复制后在本文件夹内独立演进。

## 1. 内容红线（硬约束，任何 Agent 都不得突破）
1. 只做**活人、自然神态、虚构**的成年角色胸像。不做断头/斩首/尸体/标本/解剖断面/血迹/伤痕/体液/泪血等设定。
2. 不使用、不内嵌任何**真人照片**或由真人照片生成的头模/发型（旧仓库中的 `*_ref.jpg`、`hair_user_photo.glb`、具名角色档案均**不得**复制进来）。
3. 不做“支配/羞辱/痛感/惩罚/把玩人头”类玩法、文案和角色背景故事。角色档案只写中性信息（名字、风格、创建时间、备注）。
4. 颈部末端必须由中性底座遮住（`displayStand.js`），资产中的 `NeckCrossSection` 已被 `tools/sanitize_assets.mjs` 移除并清零。
5. 不要把旧 `HANDOFF.md` / `SAFE_HANDOFF.md` 中的旧玩法搬进来。

## 2. 用户偏好与流程约束
- 目标：**真实系 / 真人感 / 精致感**画风（参考：柔和室内日光、窗格斜射光斑、暖色逆光轮廓 + 胶片颗粒）。提供**大量画面开关与调节项**，多种风格预设。
- **阶段性频繁推送到 GitHub**，不要全部做完才保存（用户的模型网站可能出错回退）。
- **始终保证可双击游玩**：`安全/点击开始_写实收藏胸像.html` 单文件、离线、file:// 可用，必须有「点击开始」按钮。**先打包 HTML 再提交**，任何中断时远端都应是最近可玩版本。
- Agent 工作区 ≤128MB（会随机丢文件）：仓库克隆放 `/tmp`，不要放进工作区；推回 GitHub 的文件不受此限。
- 不要强推（force push），推送前先 `git pull --rebase`，保留其他 Agent 的提交。
- 修改前检查明显 BUG；有条件时用 Playwright + SwiftShader 截图自检（软件渲染只能证明“能跑”，不能证明真机 GPU 画质）。
- 诚实写明局限，不要夸大“照片级”。

## 3. 目录
| 路径 | 作用 |
|---|---|
| `点击开始_写实收藏胸像.html` | **可玩单文件**（构建产物，提交到仓库） |
| `src/app.js` | 主程序：开始页、工坊、收藏管理、桌宠、设置 |
| `src/template.html` | 页面骨架与样式 |
| `src/skinMaterial.js` | 预积分次表面散射皮肤、双高光瓣、绒毛 sheen |
| `src/featureMaterials.js` | 角膜眼神光、巩膜、眉毛羽化、发片材质 |
| `src/strandHair.js` | 发片 → 真发丝（Marschner R/TT/TRT） |
| `src/studioLighting.js` | PMREM 虚拟摄影棚 + 布光预设 |
| `src/postChain.js` | HDR 后期链：GTAO、辉光、景深、胶片调色、颗粒、晕光等 |
| `src/displayStand.js` | 中性展示底座（多材质） |
| `assets/models/` | 清洗后的头模 `bust_head_base.glb` + 10 款中性发型 |
| `tools/sanitize_assets.mjs` | 资产清洗脚本 |
| `build.mjs` | 打包脚本 |

## 4. 构建
```bash
# 在仓库根目录
npm i --no-save three@0.170.0 esbuild
node 安全/build.mjs            # 生成 安全/点击开始_写实收藏胸像.html
# 可选自检
npm i --no-save playwright@1.48 && npx playwright install chromium
node 安全/tools/qa_shots.mjs /tmp/qa
```

## 5. 交接日志（只追加）

### 2026-10-15 · 安全版 阶段 1
- 新建 `安全/`；复制 `画质提升/src` 的中性渲染模块；清洗头模（移除 NeckCrossSection），复制 10 款中性发型。
- 先用画质提升演示打包出一个可玩预览 HTML，保证远端随时可玩。
- 下一步：完整 app（开始页 + 工坊/收藏/桌宠/设置 + 大量画质开关 + 胶片预设 + 新布光）。

### 2026-10-15 · 安全版 阶段 2（完整应用）
- `src/app.js` + `src/template.html` + `build.mjs`：开始页（加载中点击也会在就绪后自动进入）、工坊/收藏/桌宠/设置四个页签。
- `studioLighting.js`：新增 7 种布光；`apply(id, overrides)` 支持方位/仰角/强度/柔和/色温/轮廓/补光/环境/曝光叠加；
  Gobo（窗格/树叶）放在 layer 5，只被主光阴影相机看到 → 不出现在画面、也不进 GTAO。环境贴图只在参数变化时重烘焙。
- `postChain.js`：重写胶片层（白平衡、趾/肩曲线、褪色、色调分离、晕光、柔焦、颗粒大小、黑白）+ BokehPass 景深 + `FILM_PRESETS`。
- `displayStand.js`：5 种底座材质 `STAND_STYLES`。
- 面板打开时用 `camera.setViewOffset` 让胸像居中于左侧空白区域。
- 自检（SwiftShader）：daylight 发片、window 真发丝、golden 3/4 均正常出图，无控制台错误。
- 待办：导入自有授权 GLB 头模；多个桌宠同时摆放；Electron 透明系统桌宠；眼睛虹膜颜色；更真实的发际线。

### 2026-10-15 · 安全版 阶段 3（卡顿修复 + 不靠高模的写实技巧）
- 用户反馈：**非常卡**、效果偏假。
- 性能：
  - **按需渲染**：`dirty/invalidate()`，画面静止时不渲染（以前每帧跑满 HDR+GTAO+辉光+胶片链）。
  - **交互降级**：拖动/滚轮时像素比 × `interactScale`(默认 0.6) 且关闭 GTAO/景深/柔焦/晕光，松手 120~260ms 后渲染满画质帧。
  - **画质档位** `QUALITY`：流畅/均衡/高/极致（自动：软件渲染→流畅，否则均衡）；默认发丝密度降到 low、MSAA 2、AO 采样 10。
  - **阴影缓存**：`shadowMap.autoUpdate=false`，仅灯光/形体/转身时 `invalidateShadow()`。
  - 拖灯光滑杆时跳过 PMREM 重烘焙，停手 180ms 后再烘焙。桌宠待机限 30fps。修复 dt 恒为 0 导致桌宠转身无效的 BUG。
  - 设置版本 `SETTINGS_VER=2`：旧版保存的重画质设置会被重置。
- 写实（`skinMaterial.js` v2，全部程序化，不改网格、不手绘贴图）：
  - 程序化毛孔微凹凸（对象空间噪声 + 屏幕导数 bump，远处自动淡出防闪烁）`micro`；
  - 高光破碎（粗糙度微变化）`breakup`；肤色斑驳（低频红润+中频色素不均）`mottle`。工坊「皮肤质感」里有滑杆。
- 默认风格改为「窗格光影 + 暗调胶片」（低调光更像照片，也更能藏住低模缺陷）。

### 2026-10-15 · 安全版 阶段 4（静止精修超采样 + 头发 LOD）
- 用户要求：画质更高、发丝不要卡，问能否“烘焙”；每次交付附几张效果图。
- `postChain.createAccumulator`：静止时 Halton 亚像素抖动 + 后期结果滑动平均（流畅12/均衡20/高28/极致40 帧），交互时不累积；颗粒种子固定以免被平均掉。
- 头发 LOD `setHairLOD()`：拖动/缩放时真发丝→发片（只改 uniform/visible，不重编译），停手后换回真发丝并重新累积。
  → 真发丝只在“静止的十几帧”里渲染，因此各档默认密度上调（均衡 mid / 高 high / 极致 ultra）。
- 📷 截图改为超清：2 倍像素比 × 32 帧超采样（`prOverride`）。
- 去掉桌宠持续呼吸起伏（它会让画面每帧都重渲染，无法收敛精修）。`SETTINGS_VER=3`。
- 自检图：1400×1000 窗格光影正面，发丝明显变细变干净。

### 2026-10-15 · 安全版 阶段 5（参考大师人像后的写实修正）
- 对照参考：真实人像背景更暗、光有衰减；眼睛需要眼睑软阴影；浅景深；下睫毛很细。
- 眼部遮蔽（`featureMaterials.upgradeEyeMaterial` v2）：按每只眼球中心计算上/下眼睑与眼角的柔和遮蔽 + 眼角湿润粉红；工坊「眼部遮蔽」滑杆。
- 背景亮度 `lightOv.bgMul`（默认 0.55）；景深默认开 + **自动对焦到眼睛**（每帧按相机到眼球中点的距离设置 Bokeh focus）。
- 毛孔改为稀疏圆润凹点 + 细皮纹（频率 2300、幅度大幅降低），去掉“拉毛墙面”感。
- 下睫毛按眼球中心以下淡化（`photoreal-lash-v2`）；室内日光预设降曝光、减补光，避免发灰过曝。
- URL `?hideui=1` 可隐藏面板截图。效果图在 Agent 工作区 `安全版/效果图/`（不进仓库）。

### 2026-10-15 · 安全版 阶段 6（不换模型，继续用光影/虚化/滤镜提升真实度）
- 用户：不想换高清模型，要求继续用打光、虚化、滤镜提高真实度和风格质感。
- `src/backgrounds.js`：9 种程序化虚化环境背景（暖色卧室窗边/白纱帘/窗影墙/冷灰墙/绿植/黄昏光斑/咖啡馆/城市夜景/纯色影棚），Canvas 绘制+模糊+光斑，**不用任何照片**；
  `createBackdrop` 新增屏幕空间贴图模式，随相机方位轻微视差；亮度跟随「背景亮度」。
- `skinMaterial.js` v3：面部分区（鼻头/脸颊微红、眼下微暗、T 区与嘴唇更润，锚点=眼球中心+自动求得的鼻尖）+ 逆光透光（Barré-Brisebois 近似，曲率越大越透）。
- `postChain.js`：新增 8 种滤镜（日系清透/韩系奶油/港风复古/好莱坞青橙/宝丽来/Classic Chrome/古典油画/手机人像）；一键风格扩展到 12 个，每个绑定背景。
- 胸像全景机位拉近。效果图：工作区 `安全版/效果图/v6_*.jpg`。

### 2026-10-15 · 安全版 阶段 7（架构对齐主项目 + 效果总线 + 发际线 + 骨相 + 脸部脏斑根因修复）
用户要求：①主项目新头模/发型复制到安全区；②脸经常很怪；③发际线硬边像假发；④**所有画面效果不要写死，要能开关、后期可自己连线**；⑤**安全区架构与主项目一致**。
- **架构（与主项目同构）**：`安全/package.json`（vite）、`vite.config.js`、`index.html`、`src/main.js`、`src/style.css`、`src/three/*`（渲染模块）、`src/data/*`（数据/目录/总线）、`src/ui/`、`src/textures/`、`public/models/*.glb`、`scripts/build_standalone_html.mjs`（单文件 HTML，模型 base64 内嵌到 `window.__SAFE_EMBEDDED__`）、`scripts/sanitize_assets.mjs`、`scripts/qa_shots.mjs`。开发：`cd 安全 && npx vite`；打包：`node 安全/scripts/build_standalone_html.mjs`。旧的 `build.mjs / tools/ / assets/ / src/template.html / src/app.js` 已移走。
- **资产**：从主项目同步 37 款纯发型 GLB（`src/data/hairCatalog.js`，按长发/中短/短发/盘编发分组）；**排除 `hair_user_photo.glb` 及所有 `*_ref.jpg` 真人参考照**。头模仍是清洗过的 `bust_head_base.glb`（与主项目 HeadSkin 顶点完全一致，maxdiff=0）。
- **骨相**：`src/data/eastAsianHeadTargets.js`（MPFB2 CC0 雕刻形变，删除 `user_photo_clone` 配方）+ `src/data/faceArchetypes.js`（39 款，标签去掉所有人名）+ `src/three/faceTargets.js`（叠加到基础顶点；头顶/后脑衰减防发型穿模；法线用“原法线+形状差”避免接缝；眼球只随眼距平移，同主项目）。默认强度 0.6。URL `face=<id>`。
- **效果总线**：`src/data/effectRegistry.js`（约 65 个效果：皮肤/发际线/布光/后期/镜头/角色/渲染）+ `src/data/effectBus.js`（get/effective/set/enable/on/link/unlink/export/import）。UI 由注册表自动生成，每项左侧勾=开关（关闭时用 off 值，原数值保留）。「🔌 效果开关与连线」面板：源→目标（目标=偏移+倍数×源，可多级、防环）、导入/导出 JSON。控制台：`window.SafeBust.fx`。URL `fxoff=id1,id2` 可批量关闭（QA 二分排查很好用）。连线/开关随藏品保存（`ch.fx`）。
- **发际线**：`src/three/hairlineBlend.js` —— 按当前发型网格自动计算皮肤覆盖度（发片表面撒点+alpha 检查+法线方向邻域）、拓扑平滑出几毫米过渡带、头皮区域遮罩（脸颊/下颌前的长发不算，否则会像胡茬）；皮肤着色器：发根暗色+细噪声渐隐+头皮遮蔽（**不要用条纹图案，插值方向会出摩尔纹**）；沿额头/太阳穴生成极细短碎发（与 strandHair 同几何格式，独立材质，发片/发丝两种模式都显示）。
- **脸上脏斑根因（重要）**：用 `fxoff` 二分确认 —— 不是阴影/AO/皮肤分区，而是**照片烘焙的法线贴图里有大块错误低频起伏**。修复：法线高通（减去 mip bias 2 的低频法线，`skin.normalHP`）+ 默认贴图法线强度 0.8→0.3（旧存档自动迁移）+ 去烘焙光影 `skin.delight`（albedo 除以模糊 mip 再乘平均肤色）。
- **暖阳逆光脸发光/三角面块**：逆光透射原来用屏幕导数曲率 gSkinCurv（逐三角形跳变）且整脸都透 → 改为只在轮廓薄处透光（1-N·V），强度降低。
- 新增阴影浓度/柔和度（`light.shadowStrength` 0.8、`light.shadowSoft` 1.3，用 three r170 的 `shadow.intensity`）。新镜头 `view=hairline` 发际线特写。
- 已知待办：卡片模式下 10 款 Stage64 `.mhclo` 发型（HairCardMaterial，贴图 160px 几乎不透明）像头盔，发丝模式正常；唇上方仍有轻微法线残影；低模在逆光暗部能看出面片。

## 阶段 8 · 眼睛：睫毛修复 + 程序化睫毛/眉毛（2026-10-15）
用户反馈"眼睛诡异、没睫毛"。排查结论（之前各阶段其实也一直看不到睫毛）：
1. 原睫毛贴图每根丝只有 1~2px，mipmap 后 alpha < alphaTest 0.14 → 整根被丢弃，只剩根部几个点；
2. 下睫毛 alpha 再 ×0.18 → ≈0.10 < 0.14 → 全部丢弃；
3. 原贴片即使显示出来也是一团团色块（贴图质量差），正面看像"贴纸"。
修复：
- `src/three/lashStrands.js`（新）：以原 Eyelashes 网格为"睑缘向导"（每个 x 区间离眼球中心最近的顶点 = 根），沿上/下睑缘长出 150/60 根弯曲睫毛丝 + 一条深色睫毛根线（天然眼线）；
  每根丝复制根部顶点的 morph 增量，`morphTargetInfluences` 与向导网格共享数组 → 眨眼/表情自动跟随。
  屏幕空间最小宽度 0.75px + alpha 补偿（与发丝同思路），累积超采样下不闪。
- 同文件 `buildBrowGeometry`：按原眉毛贴图 alpha 密度撒 1800 根贴肤眉丝（眉头竖、眉身斜上、眉尾微下），原眉毛贴图降为底色（`uBrowBase`）。
- 眼球着色加"上睑缘接触阴影"（`photoreal-eye-v3`）。
- 旧贴片材质也修好（`photoreal-lash-v3`，负 LOD + 邻域 max），关闭程序化睫毛时作为回退。
- 新效果节点（effectRegistry，全部可开关/连线）：`char.lashStrands` `char.lashDensity` `char.lashLower` `char.lashDark` `char.lashLine` `char.browStrands` `char.browDensity` `char.browBase`。
- 调试：`window.SafeBust.debug.{parts,scene,camera,renderer,head,renderNow(n)}`；`renderNow` 同步渲染，避免 rAF 在 swiftshader 下截到旧帧（之前"改了材质截图没变"就是这个坑）。
- 注意：沙箱仅 2GB 内存且 /tmp 为 tmpfs，**不要并行跑两个 QA 浏览器**，会把机器卡死。
待办：卡片模式发片像头盔、唇部涂抹感、左眼外眼角少量散落睫毛丝。
