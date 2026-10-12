# 🤝 MULTI-AGENT COLLABORATION HANDOFF (`HANDOFF.md`)

> **⚠️ 致后续接手的所有 AI 模型（重要协作铁律，严禁删除或覆盖历史记录）：**
> 1. **禁止覆盖本文件 (`HANDOFF.md`)**：每次只能在本文件底部的 `## 📈 迭代与交接日志 (Append-Only Changelog)` 追加记录，保留所有历史约束与设计上下文。
> 2. **每次修改必须阶段性推送到 GitHub (`https://github.com/deawfwaef2/head2`)**：不要等所有代码写完再保存/推送！每完成一个核心子模块或修复，必须立即生成/更新可双击直接运行的独立 HTML 并 `git commit && git push` 到远端仓库，防止平台会话中断导致进度丢失。
> 3. **必须优先打包双击即玩的 HTML (`点击开始游戏_CERVIX3D.html`)**：用户从 GitHub 下载 ZIP 解压后，必须能直接双击根目录的 `点击开始游戏_CERVIX3D.html`（兼容 `file://` 协议，无 CORS 报错，内嵌 3D 头雕网格数据与纹理生成，包含「点击开始游戏」启动画面解锁音效）立即游玩！
> 4. **工作区容量硬约束 (< 128MB)**：工作区总大小严禁超过 128MB（建议控制在 30MB 以内），切勿生成巨型二进制缓存文件，否则会导致快照随机丢文件。
> 5. **模型能力分级协作守则**：
>    - 如果你是**强力旗舰大模型**：请全面负责核心 3D 拓扑/法线平滑算法、写实亚洲女性五官与发丝渲染器、医学颈部解剖断面渲染、透视消失点盒型空间物理引擎的深度优化与疑难 BUG 修复。
>    - 如果你是**较弱/轻量级模型**：**严禁触碰或重构核心 3D 渲染管线、解剖切面算法与打包构建脚本**！仅可修改 UI 文案、预设档案数据、音效参数微调等外围边角料，防止引入破坏性 BUG。

---

## 🎯 用户核心产品设计要求（不可违背）

1. **核心定位**：**3D 效果的收藏品头部模型（只有头，无躯干）管理 & “桌宠”生成 & 设置软件**，头部底座带有精细的**写实医学解剖断面**。
2. **头部模型与发丝质量要求（重中之重）**：
   - 必须呈现**高精度、极其细腻写实的东亚/亚洲女性角色头部模型**（对标 Daz Studio Genesis 8.1/9 Asian Female 精致骨相：柔和眉弓、秀气鼻梁与鼻头、鹅蛋脸/V脸紧致下颌线、清晰双睑杏眼与水光唇，绝不能出现多边形棱角感、双下巴肥胖感或贴图错位！）。
   - **头发必须非常贴近真实**：具有自然发际线过渡、饱满高颅顶、贴合面颊的修颜侧发束、根根分明的刘海与发丝光泽（绝不能出现头皮与发片悬空脱节的穿帮空隙！）。
3. **底座颈部医学解剖断面（只有头 + 解剖切面底座）**：
   - 颈部截断面必须呈现写实医学横切面细节：表皮与真皮切缘、皮下浅筋膜脂肪层、双侧胸锁乳突肌与斜方肌肌束、气管透明软骨 C 形环与气管腔、食管、甲状腺叶、双侧颈动脉鞘（颈总动脉、颈内静脉、迷走神经）、第 4/5 颈椎（C4/C5）椎体与椎管内蝴蝶形脊髓灰质。
4. **输入照片 + 半自动化建模装配 + 高精建模教程**：
   - 允许玩家输入参考照片，提供半自动化流程（1:1 叠图对位、肤色采样、五官骨相高精滑块调节、导入外部 Daz `.glb/.obj` 自动截断颈部封口），并内置详细教程指导玩家如何找到/制作最真实贴近照片的 Daz 亚洲女性头模。
5. **收藏品命名与悬停档案浮窗**：
   - 生成桌宠时可命名并记录各种收藏品档案信息；在文件夹目录生成该收藏品的实体档案；鼠标靠上屏幕上的桌宠时，弹出浮窗显示该收藏品的详细档案。
6. **真正在电脑屏幕上的 3D 盒型透视空间桌宠**：
   - 桌宠直接悬浮在电脑屏幕空间中（支持隐藏管理软件窗口）。
   - **屏幕中心为透视消失点（Vanishing Point）**，空间为**有限深度的盒型空间（Bounded 3D Box Space）**，区域不是无限大的，远端有深度后壁。
   - **滚轮调整远近深度（Z 轴）**，拖拽移动并带有盒壁物理碰撞反弹。
   - **追随 3D 效果**（平时视线/头部三维追随鼠标）。
   - **单击桌宠进入 360° 旋转模式，再次单击取消旋转模式**。
   - **物理音效系统**：具备逼真的拾取感、空间拖动感、滚轮深度感与物理碰撞感音效。

---

## 🔍 已知明显 BUG 与视觉缺陷清查（基于用户实机截图 `image-1.png`）

1. **[严重视觉 BUG - 已定位] 面部呈现粗糙多边形棱角（Flat Shading Facets）**：
   - **原因**：`OBJLoader` 解析 `.obj` 时生成的是非索引（Unindexed）独立三角面顶点，随后在 `applyHeadMorphsToGeometry()` 中调用 `geom.computeVertexNormals()` 会把每个三角形算成平面法线（Flat Normals），导致原本近万面的网格看起来像低模晶块！
   - **修复方案**：必须在变形计算后对重合位置的顶点进行平滑法线聚合（Smooth Vertex Normal Averaging by Position Hash），并采用高密度参数化双三次曲面/平滑细分网格，彻底消除任何多边形棱角！
2. **[严重视觉 BUG - 已定位] 下巴下方与脖子上出现诡异红线/眼睛贴图错位**：
   - **原因**：在 `build_head_models.py` 延伸下巴边界顶点（`v = 0.045`）到颈部环时，将 UV 坐标线性插值到了额头区域（`v = 0.83`），导致颈部网格的 UV 跨越了纹理图中央的红唇（`v = 0.30`）与眼睛（`v = 0.62`），从而在下巴底下印出了红唇线和眼角！
   - **修复方案**：下颌底面（Submental）与颈柱（Neck Cylinder）的 UV 必须严格锁定在纯皮肤无五官区域（如 `u ∈ [0.35, 0.65], v ∈ [0.01, 0.04]` 或独立纯肤色贴图区），严禁跨越五官 UV 区！
3. **[严重视觉 BUG - 已定位] 下颌与颈部过渡臃肿（像双下巴/粗脖子）**：
   - **原因**：原人脸面罩下边界直接连向较粗的颈环，缺少亚洲女性紧致流畅的下颌缘（Mandibular Border）向内收束的颌颈角（Cervicomental Angle，标准女性约 105°~110°），且颈部半径偏粗。
   - **修复方案**：重塑东亚女性精致 V 脸/鹅蛋脸下颌骨转折，在下巴后方构建紧致内收的颌下三角（Submental Tuck），并将女性颈柱纤细化（`Rx ≈ 3.15cm, Rz ≈ 3.35cm`），呈现优美天鹅颈与清晰胸锁乳突肌线条。
4. **[严重视觉 BUG - 已定位] 头发与额头/太阳穴之间存在明显悬空黑缝，发片像纸板**：
   - **原因**：原发帽与侧发束的控制点半径大于颅骨且缺少贴头皮发际线过渡层，刘海锯齿呆板。
   - **修复方案**：构建紧贴头皮的高颅顶包裹式立体发体（Volumetric Scalp & Crown Hair Mesh）+ 柔和绒毛发际线阴影 + 自然贴合颧骨的饱满侧发束与柔顺弧度刘海，彻底消除穿模与空隙。

---

## 📈 迭代与交接日志 (Append-Only Changelog)

### [2026-10-12 Stage 1] 初始化 `HANDOFF.md` 与 GitHub 远端同步
- 创建多 Agent 协作规范文档 `HANDOFF.md`，记录用户全部设计约束与 `image-1.png` 暴露的四大核心视觉 BUG。
- 准备构建双击即玩的独立打包版本 `点击开始游戏_CERVIX3D.html` 并推送至 `https://github.com/deawfwaef2/head2`。

### [2026-10-12 Stage 2] 修复 `image-1.png` 四大核心视觉 BUG + 优先打包独立可玩 `点击开始游戏_CERVIX3D.html`
- **重要环境提示（致后续模型）**：跨对话轮次时平台快照会自动清理 `node_modules/` 与后台进程，因此新轮次开始时请先执行 `npm install`，并在修改后执行 `node scripts/build_standalone_html.mjs` 更新根目录的 `点击开始游戏_CERVIX3D.html`。
- **修复 BUG 1（面部多边形棱角感）**：在 `src/three/collectibleHeadAssembler.js` 中新增 `buildPositionWeldData()` 与 `computeWeldedSmoothNormals()`，对 `OBJLoader` 解出的非索引网格按三维空间重合坐标进行焊接法线平滑，彻底消除 Flat Shading 晶面棱角。
- **修复 BUG 2（下巴与脖子红唇/眼线贴图错位）**：在 `scripts/build_head_models.py` 中重构面部外围至颈柱的 UV 映射路径（保持在纯肤色外圈 `0.5 + 0.44 * cos_t, 0.5 + 0.46 * sin_t`），严禁跨越纹理中心五官区，彻底消除脖子上的红线伪影。
- **修复 BUG 3（长下巴、双下巴臃肿与粗脖子）**：重塑东亚女性三庭五眼骨相比例（下巴尖从 `Y = -9.4` 提拉至 `Y = -6.85`，眼裂放大 `+28%`，构建紧致内收的颌下三角 `Submental Tuck` 与纤细天鹅颈 `Rx = 3.25cm`）。
- **修复 BUG 4（发际线/太阳穴悬空黑缝与发片发灰）**：在 `src/three/hairBuilder.js` 中新增连续包裹颅顶与太阳穴的 3D 立体发壳 `buildContinuousHairShellGeometry()` + 贴颊修颜侧发束 + 自然弧度齐眉/八字刘海，并在 `skinTextureGenerator.js` 中加深乌木黑发基底色度。
- **优先生成独立 HTML**：已生成单文件离线直玩版 `/点击开始游戏_CERVIX3D.html`（2.37 MB，内嵌全套代码与 3 套近万面东亚女性头雕模型数据，包含「▶ 点击开始游戏」启动弹窗）。

### [2026-10-12 Stage 3] 基于离线光栅化视觉诊断的骨相、颌下三角与高颅顶发壳精密校准
- **光栅化自检发现并修复的深层几何问题**：
  1. **下颌角至颈柱的水平颌下折角（Submental Horizontal Shelf）分离**：原本从下颌外缘（`loop0[11..25]`）向颈环同时插值 X 和 Y 会在两腮下方形成斜向圆锥过渡（显脸胖/双下巴），且非线性压缩下庭会导致嘴唇与下巴间距过短。现已在 `scripts/build_head_models.py` 中改为温和线性下庭比例（`0.84..0.89`），并将颌下区（`t <= 0.44`）改为**先沿水平面 `su_xz = sin(u*pi/2)` 快速向内收束至舌骨环、再由 `t > 0.44` 垂直向下延伸为纤细天鹅颈柱（`Rx = 2.92..3.05cm`）**，并在 Taubin 平滑阶段保护下颌骨缘（`loop0[11:26]`），从而塑造出极其紧致的东亚女性 V 脸/鹅蛋脸下颌线与清晰颌下阴影。
  2. **面部微表面平滑与花瓣唇/柔和山根重塑**：在 `scripts/build_head_models.py` 中新增 `smooth_facial_features()`，消除原始 `canonical_face_model.obj` 在嘴角、鼻翼旁、泪沟与颊部的拓扑凹凸感，微降山根高度并将内唇缝前推闭合为饱满柔和的花瓣唇。
  3. **高颅顶椭球发壳数学包络对齐（`cos(theta)/sin(theta)`）**：在 `src/three/hairBuilder.js` 中采用严格包络颅骨外侧的椭球参数方程（`y = 2.6 + 8.40 * cos(theta)`, `rx = 8.15 * sin(theta)`, `rz_back = 7.48 * sin(theta)`）构建连续发壳、贴颊修颜侧发（姬发式切口/长卷发束）与齐眉弧度刘海（`thetaSpan = 1.27`），彻底杜绝颅顶或后脑穿模。
- **同步重新构建 `/点击开始游戏_CERVIX3D.html`（2.46 MB）并推送至 GitHub 远端仓库**。

### [2026-10-12 Stage 4] 修复「林汐无发」BUG（发型 ID 不匹配）+ 重建单文件 HTML + 浏览器自检
- **根因**：`index.html` 下拉与默认档案使用 `long_straight / low_chignon / soft_waves / sleek_bob`，但 `src/three/hairBuilder.js` 的 `createRealisticHairGroup()` 只实现了 `long_silk / hime_cut / clavicle_bob / cyber_updo`，其余 ID 落入空分支 → 静默无发（林汐桌宠光头）。
- **修复**：在 `hairBuilder.js` 顶部新增 `HAIR_STYLE_ALIAS` 映射表（只改入口，不动发丝/发壳算法）。以后新增发型请同时更新「下拉 ID」「别名表」「分支」三处。
- **自检**：用 Playwright(Chromium) 以 `file://` 打开 `点击开始游戏_CERVIX3D.html`，点击「开始游戏」后桌宠层正常渲染，两个桌宠均有头发。控制台无 JS 报错（仅 SwiftShader 的 WebGL context lost 警告）。
- **仍未解决（给后续模型的待办，请勿误判为已修）**：
  1. 苏婉（姬发切）与林汐的刘海/鬓角上方仍有少量**肤色/灰白缝隙**，发壳与额头交界处未完全贴合（用户截图中的「悬空黑缝」问题只修了一半）。建议由强力模型在 `buildForeheadFringeGeometry` / `buildContinuousHairShellGeometry` 处做贴合度调整，并以 `file://` 截图核对。
  2. 桌宠 HUD 底部标签「透视消失点 VP…」与头部重叠，可在 `src/style.css` 中给 HUD 设置位置偏移（边角料，弱模型可改）。
  3. 「收藏品注册 / 照片建模 / 音效」等功能在代码中已有入口，但本轮未做端到端验证。
- **工作区**：仓库已改为直接位于 `/home/user` 根目录（与 `build_standalone_html.mjs` 的绝对路径约定一致）。`node_modules/`、`dist/`、`.cache/`（Playwright 浏览器）均属快照排除目录，不会被保存。

### [2026-10-12 Stage 5] 接手审阅 + 仓库结构纠正 + 清理误提交缓存（Claude 接手，Agent 协作记录）
- **仓库位置纠正**：本轮接手时仓库被克隆到 `head2_repo/` 子目录，已按 Stage 4 约定移回 `/home/user` 根目录（`.git` 也一并移回）。以后不要再嵌套子目录。
- **误提交清理**：Stage 1~4 中 `.npm/_cacache`（约 22MB npm 缓存）被误提交进 git。本轮已从索引删除，并在 `.gitignore` 中加入 `.npm/`、`.cache/`。**禁止再提交缓存目录。**
- **密钥处理**：GitHub Token 只在单次命令的 `http.extraheader` 中使用，不写入 `.git/config`、文件或 HANDOFF。后续 push 同样使用此方式，不要把 token 写进任何文件。
- **截图审阅结论（当前 `点击开始游戏_CERVIX3D.html`，Playwright 无错误运行，「开始游戏」可点击）**：
  1. 当前两个桌宠（林汐/苏婉）可以正常显示，盒型透视空间与 VP 标签也正常。
  2. **质量远未达到用户要求的 DAZ G8/G9 级别**：脸部是程序化面部，眼眶、鼻梁、唇部比例仍偏卡通；发型是硬壳式黑色"头盔"，缺少发丝层次与发际线细节；皮肤缺少次表面散射感。
  3. 结论：纯程序化（OBJ 变形 + 手写发壳）路线的上限不够，无法靠修补达到用户期望。
- **版权约束**：DAZ Studio 资产是受许可限制的商业内容，不能直接打包进仓库或 HTML。可行路线：(a) 用户自备 DAZ 导出件 `.obj/.glb`（已有导入通道，需要完善自动颈部截断与对位）；(b) 寻找 CC0 或可再分发的高质量亚洲女性基础头模并替换 `public/models/`；(c) 继续优化程序化管线作为离线备选。
- **给后续模型的建议**：
  - 强力模型：优先评估 (b) 的可行性（许可证、拓扑质量、面数），并确认 `build_standalone_html.mjs` 能把新模型打包进单文件。
  - 较弱模型：请只修改 UI 文案、档案数据、音效参数，不要动 `hairBuilder.js`、`collectibleHeadAssembler.js`、`build_head_models.py`。
- 工作区大小：本轮结束约 37MB（不含 `.cache` Playwright 浏览器，该目录属于快照排除项）。

### [2026-10-12 Stage 6] 网上找 CC0 写实头模 → MakeHuman 亚洲女性头模接入（实验选项，默认不变）
- **来源与许可（全部 CC0，已写入 `assets_src/makehuman/LICENSE_NOTE.txt`）**：
  - MakeHuman 基础网格 `base.obj`（19158 顶点）、宏观目标 `asian-female-young.target`、头部/颈部/下巴目标。
  - MakeHuman system assets：头发 `bob02` / `long01`、眉毛 `eyebrow001`（`.mhclo` 绑定 + `.obj`，无贴图）。
  - **没有使用任何 DAZ 资产。** 不要把 DAZ 原文件放进仓库（DAZ 许可证不允许公开再分发）。
- **新增脚本**：`scripts/build_makehuman_head.py`（可复现）。流程：应用 Asian Female Young 形变 → 头/颈/下巴瘦化目标 → 只保留头部 + 窄颈柱（|x|≤1.1 且 y≥5.2 的规则排除肩斜方肌）→ 沿颈部截断 y=4.72，生成 50 点颈部断面圆盘 → 按林汐坐标系（头高 23.5、颈切面 y=-13.2）线性映射 → 用 `.mhclo` 绑定公式拟合头发/眉毛。
- **输出**：`public/models/mh_asian_female_head.obj`（皮肤 5393 顶点 + `neck_cross_section` + `eyebrows`）、`mh_hair_bob02.obj`、`mh_hair_long01.obj`。
- **代码改动（强力模型做的、不影响原预设）**：
  - `collectibleHeadAssembler.js`：新增 `embeddedModelText()` / `loadObjAny()`（支持 file:// 离线版内嵌模型）；自定义模型分支对 `mh_asian_female_head` 使用**无贴图纯肤色**（MakeHuman UV 与 DAZ 贴图布局不同，原来的五官贴图会错位）；新增 `customHairUrl`，头发与头部使用同一变换与截断平面。
  - `main.js`：`customHairUrl` 贯穿草稿、保存、读取；新增两个按钮 `btn-mh-bob` / `btn-mh-long`（界面标注 **[实验]**）。
  - `index.html`：两个 [实验] 按钮。
  - `scripts/build_standalone_html.mjs`：把三个 MH OBJ 以原始文本（保留 vn）内嵌进单文件 HTML。
- **验证**：Playwright 下开始游戏 → 展开主窗口 → 工坊 → 点击 CC0 头模按钮，状态文字正常更新，**控制台无报错**。截图存 `.qa/stage5_mh_experimental.png`，测试脚本 `.qa/mh_test.py`。
- **已知问题（诚实记录，给后续模型的待办）**：
  1. **头发贴合错误**：当前 bob 发在正面像一块披风盖住前额和脸，发片与头皮间有大量悬空与穿插。`fit_proxy()` 对 `.mhclo` 偏移采用的是近似局部坐标系（x=边、y=面内、z=法线），**很可能是错的**，需要对照 MakeHuman 的 `proxy.py` 确认公式后再修。也可能是头发本身的缩放与颅顶高度不匹配。
  2. **头部比例**：截图中头偏高、颈偏长，脸部“像面具”，缺少颧骨/鼻梁/唇形细节；MakeHuman 基础网格细节有限，远达不到 DAZ G8/G9 的精度。
  3. **颈部断面**：目前只是通用圆盘（`CircleGeometry` 式），不是 `anatomyTextureGenerator` 的分层断面；要做成完整解剖断面，需要把 `neck_cross_section` 的 UV 按解剖纹理布局重新映射。
  4. **眼睛/唇色**：皮肤是纯色，没有唇色、眼白、虹膜；可以用顶点颜色按区域上色作为过渡。
  5. 默认仍是林汐/苏婉/千雪的 DAZ-风格程序化头，**不要**把默认切换到 MH 头模，直到头发问题修好。
- **给后续模型的分工**：
  - 强力模型：先修 `fit_proxy` 的偏移公式（对照 MakeHuman 源码 `proxy.py` 的 getCoords），再调头发缩放，最后做颈部解剖断面 UV；每修一步都要在 `.qa/` 截图并推送。
  - 较弱模型：只调整 [实验] 按钮的文案和头发颜色参数（`hairColor`、`hairSheen`），不要改 `build_makehuman_head.py` 与 `collectibleHeadAssembler.js` 的分支结构。
- **用户反馈待确认**：用户说已购买 DAZ 模型。若用户自行从 DAZ Studio 导出 Genesis 亚洲女性头 `.obj`，可以放进 `public/models/` 本地使用（不要提交到公开仓库）。
- 工作区约 61MB（不含 `.cache`、`node_modules`）。
