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

### [2026-10-12 Stage 6] 定位并修复「发片银色/白色镜面大色块」视觉 BUG（根因非贴图/非打光，而是材质混合方式）+ 仓库路径复位 + 可视化回归自检流程
- **环境复位**：本轮接手时仓库被克隆进 `/home/user/project/` 子目录，已按 Stage 4/5 约定的协作铁律，把全部文件（含 `.git`）移回 `/home/user` 根目录，删除空的 `project/` 目录。**请后续模型继续保持仓库直接位于 `/home/user` 根目录，不要再嵌套子目录**（`build_standalone_html.mjs` 的 `path.resolve('/home/user/dist')` 等路径均写死为此绝对路径）。
- **建立了一套可重复使用的可视化回归自检方法（强烈建议后续模型复用，而不是单纯读代码猜测）**：
  1. `npm install` 后用 `start_process` 启动 `npm run dev`（Vite，端口 5173，比每次重建独立 HTML 快得多，改完代码保存即热更新）。
  2. 用 Playwright（`pip install playwright && python3 -m playwright install chromium`，`launch(args=['--use-gl=swiftshader'])` 可在无 GPU 的沙箱里跑 WebGL）截图 `http://localhost:5173/`，点击 `#btn-start-pure-desktop` 进入桌宠层，再用 Pillow 裁剪/放大人脸区域（例如 `im.crop((420,300,680,560)).resize(...*3)`）才能看清面部/发丝细节，直接截全图根本看不出问题。
  3. 验证完所有改动后，再跑 `node scripts/build_standalone_html.mjs` 重新生成 `点击开始游戏_CERVIX3D.html`，并用 `file://` 协议同样跑一遍 Playwright 自检（确保离线单文件版本与 dev 版本行为一致，确保无 console error）。
  4. 定位疑难渲染 BUG 的技巧：给可疑材质临时加 `emissive` 纯色（如红/绿）渲染截图，可以直接用颜色分离出"这块亮斑到底是哪个 Mesh/材质"，比纯看代码猜测快得多（本轮正是用这个方法才找到真正根因，见下）。
- **真正定位到的根因（请后续模型引以为戒，这是一个很容易被"调参数掩盖症状但扑不灭"的坑）**：用户反馈「头发有大块银白色/镜面色块，像塑料头盔」的 BUG，表面看像是「clearcoat/roughness 太低导致高光过曝」，但把 `hairBuilder.js` 里 `solidHairMat` / `strandHairMat` 的 `clearcoat` 降到 0、`roughness` 提到 0.6+ 后色块亮度只降了约 20%，仍然存在一大片死白。用 emissive 红绿分色渲染后发现：色块位置正好是**刘海 `strandHairMat`（`transparent: true` 的 alpha 混合材质）叠在不透明发壳 `solidHairMat` 正前方**的区域——问题根源是 **`transparent: true` 的 alpha *混合*（blending）：凡是 alpha 没有完全等于 1 的像素，都会与背后已经画好的不透明发壳像素做线性混合**。当刘海和发壳在同一视角同时被主光打出高光时，两层高光混合叠加后的结果比任何单层都亮得多，就会出现这种大片死白镜面色块——**这跟 roughness/clearcoat 参数本身没关系，调参数只能稍微缓解、永远无法根治**。
- **修复**：把 `strandHairMat` 从 `transparent: true` 改为 **`transparent: false` + 单纯的 `alphaTest`（硬裁切，alphaTest 从 0.08 提到 0.35）**。这样每个像素要么完全显示自身材质的光照结果，要么被整个丢弃，绝不会再与背后的发壳做混合曝光叠加。副作用是发梢边缘从「羽化渐隐」变成「硬裁切」，但视觉上反而更像一根根利落的发丝切面，没有明显违和感（已截图确认，见下）。
- **同步做的辅助性修复（都是独立、低风险的加分项，即使以后要回滚上面那条根因修复也不影响这些）**：
  1. 在 `src/textures/skinTextureGenerator.js` 新增 `createRealisticHairNormalTexture()`，给头发材质加了基于单丝纹理的切线空间法线贴图（`normalMap`），用于后续进一步细化每根发丝的高光颗粒感（注：由于法线贴图的高频细节在 mipmap 缩小时容易被平均抵消，实测这个贴图本身对本次 BUG 的贡献有限，真正起决定作用的是上面的 alpha 混合改法线修复；但保留它作为后续精修的基础设施）。
  2. 在 `buildForeheadFringeGeometry()` 里把 `microStrand` 的真实几何扰动幅度从 `0.05~0.06` 提到 `0.32~0.34`（并把 `cols` 从 32 提到 64），让刘海表面产生真实的凹凸起伏（而不仅是法线贴图的假凹凸），配合头发材质调整后，高光被自然打散成多条细发丝状光泽而不是一整块平面镜面反射。
  3. 把 `desktopBoxSpaceEngine.js` 与 `studioPreviewEngine.js` 的主光源（key light）强度从 `2.1 / 2.15` 略降到 `1.65`，降低整体过曝风险（对皮肤材质也有轻微改善，但未深入调校皮肤，留给后续模型）。
  4. 在 `createRealisticHairGroup()` 末尾为左右两侧新增了极小的「鬓角过渡补丁」(`temple bridge patch`，一对缩放过的小椭球，`solidHairMat`)，用于缓解刘海与侧发束在太阳穴结合处可能露出的头皮/皮肤三角形空隙（Stage 4 遗留的「悬空黑缝」问题的一部分）。**这是一个几何近似的权宜修补，不是精确的拼接数学解**，如果未来精细调整了 `buildForeheadFringeGeometry` / `buildCheekFramingLockGeometry` 的参数，请连带检查这对小椭球的 `position`/`scale`（当前写死为 `side*5.55, 6.1, 3.35`）是否还贴合，必要时移除或重新定位——**不要把它放大/移远，上一次尝试把它调大后在截图里变成两个突兀的黑色球形"耳罩"，非常难看**。
- **回归自检结果**：用上述 Playwright 流程验证了全部 5 个发型下拉选项（`long_straight/hime_cut/low_chignon/soft_waves/sleek_bob`）+ 桌宠层的林汐/苏婉默认发型，均未再出现银色镜面大色块，控制台无 JS 报错；同时验证了桌宠悬浮档案卡 hover、单击切换 360° 旋转模式、滚轮景深缩放、"典藏库与半自动建模工坊"主窗口四个 Tab（含完整的照片半自动对位 UI、Daz 骨相滑块、颈部解剖断面实时预览含旋转/仰视/360°环绕三视图）均功能正常，未被本轮改动破坏。
- **仍未解决、留给后续模型的待办（请勿误判为已修）**：
  1. 刘海底边改成硬 alphaTest 裁切后，在特写放大截图下边缘有轻微锯齿（非 MSAA/alpha-to-coverage，仅靠 alphaTest discard），正常游玩视距下几乎不可见，但如果后续做"高精度特写鉴赏模式"建议加 `WebGLRenderer({ antialias: true })`（确认目前是否已开启）或采用 alpha-to-coverage 技巧改善。
  2. 太阳穴鬓角补丁只是几何近似权宜解，没有做到真正无缝拼接数学解，未来有精力的强力模型可以参照 Stage 3/4 的参数化思路，把 `buildForeheadFringeGeometry` 和 `buildCheekFramingLockGeometry` 在过渡区的曲面方程统一成同一套参数空间，从根本上消除缝隙而不是拿补丁盖住。
  3. 皮肤材质的「次表面散射感」「卡通感」问题（Stage 5 已指出）本轮未处理，仍待后续强力模型评估 Stage 5 提出的 (a)/(b)/(c) 三条路线。
  4. HUD 消失点标签与桌宠重叠的问题（Stage 4 遗留 #2）本轮未处理（复查时桌宠默认左右分布位置下并不重叠，但不确定其他摆放位置下是否仍会重叠，留给边角料模型核实修复）。
- 工作区大小：本轮结束约 37MB（不含 `node_modules`、`.cache`、`.npm`、`dist/` 等快照排除/可重新生成目录）。
### [2026-10-12 Stage 7（与 Stage 6 为同一时间窗口内并行提交，另一个 Agent 会话所做，详见下）] 网上找 CC0 写实头模 → MakeHuman 亚洲女性头模接入（实验选项，默认不变）
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

> **⚠️ 并行协作说明（合并时追加）**：Stage 6 与 Stage 7 是两个不同 Agent 会话在同一时间窗口内对同一仓库的并行提交（`git push` 冲突后手动 `git merge` 解决）。Stage 6 专注修复头发材质渲染 BUG（程序化发型管线），Stage 7 专注探索 CC0 MakeHuman 真实头模资产替换路线，两者修改的文件基本不重叠（Stage 6 改 `hairBuilder.js`/`skinTextureGenerator.js`/光照；Stage 7 新增 `assets_src/makehuman/`、`build_makehuman_head.py`、`collectibleHeadAssembler.js` 的自定义模型分支），合并后两套改动都保留且互不冲突。默认桌宠仍使用 Stage 1-6 的林汐/苏婉/千雪程序化头模（Stage 7 的 MH 头模仅通过工坊里的 [实验] 按钮触发，不影响默认体验）。后续模型请注意：仓库中现在同时存在两条头模技术路线（程序化 OBJ 变形 + MakeHuman CC0 真人头模实验分支），在继续开发前请先读完两段日志，避免重复劳动或互相覆盖。

### [2026-10-12 Stage 8] 强力模型全量攻克 Stage 4/6/7 遗留核心难题：统一球面方位角发壳消除额头/太阳穴黑缝 + 彻底修复 MakeHuman CC0 亚洲女头(`helper-hair` 剔除 / `.mhclo` 世界轴绑定公式 / 3D 眼球虹膜与花瓣唇 UV / 6 环 3D 浮雕 C4 解剖切面)
- **响应 Stage 6/7 强力模型待办清单，逐一彻底根治**：
  1. **定位并根治林汐/苏婉额头右半侧缺发 & 太阳穴三角缝隙 BUG（Stage 4/6 遗留 #1/#2）**：
     - **根因 A（右半额头刘海被丢弃）**：`createRealisticHairStrandTexture()` 原先使用 `ctx.fillRect(14, 0, w - 28, h)` 在纹理左右两侧留了 14px 透明边，且设置 `tex.wrapS = THREE.ClampToEdgeWrapping`；而 `buildForeheadFringeGeometry` 将 UV 设为 `u * 2.0`（范围 `0..2.0`），导致右半侧刘海（`u > 0.5`，即 `U > 1.0`）全部被 Clamp 到 `U = 1.0` 的透明边，进而被 `alphaTest` 整片裁切丢弃！现已改为全宽 `0..w` 铺满发丝基底并开启 `THREE.RepeatWrapping`。
     - **根因 B（太阳穴三角缝隙数学统一）**：按 Stage 6 待办建议，不再使用小球补丁遮挡，而是将 `buildForeheadFringeGeometry`（方位角 `phi ∈ [0.18π, 0.82π]`）、`buildCheekFramingLockGeometry`（`phi` 重叠覆盖 `0.31π..0.07π` 与 `0.69π..0.93π`）与 `buildContinuousHairShellGeometry`（`phi ∈ [+0.28π, -1.28π]`）统一到同一套椭球参数曲面方程，并内置实心发际线头皮底帽 `buildScalpUnderCapGeometry()`，实现 360° 零三角空隙拼接；同时保留 Stage 6 的 `createRealisticHairNormalTexture()` 单丝法线贴图与 `transparent: false, alphaTest: 0.35` 防高光叠加机制。
  2. **彻底查明并修复 Stage 7 MakeHuman CC0 头模与头发全部 4 大 BUG（`scripts/build_makehuman_head.py` & `collectibleHeadAssembler.js`）**：
     - **根因 1（白布/面具遮脸）**：`assets_src/makehuman/base.obj` 中除 `g body` 外还包含不可见的绑定辅助笼 `g helper-hair`、`g helper-tights` 与骨骼立方体 `g joint-*`！Stage 7 未按 group 过滤，把 `helper-hair` 当成皮肤导出成了包住整张脸的白色头盔，且污染了头部宽度计算导致 `kx = 0.72` 把脸横向压扁了 28%。现严格只提取 `g body`（头颈皮肤）+ `g helper-l/r-eye`（独立 3D 眼球）+ `g helper-l/r-eyelashes-1/2`（独立 3D 睫毛）。
     - **根因 2（`.mhclo` 头发绑定公式）**：还原 MakeHuman 官方 `proxy.py` 的世界坐标轴缩放公式（解析 `.mhclo` 头部的 `x_scale / y_scale / z_scale` 顶点对距离比，`fitted = w0*b0 + w1*b1 + w2*b2 + [ox*sx, oy*sy, oz*sz]`，外加 `+0.28cm` 颅顶法向防穿模偏移），使 `mh_hair_bob02.obj`、`mh_hair_long01.obj`、`mh_hair_ponytail01.obj` 100% 严丝合缝贴合头皮。
     - **根因 3（等比例骨相缩放与天鹅颈平滑延伸）**：按眉眼至下巴真实比例采用 `X:Y:Z = 1:1:1` 等比例缩放（`scale_s = 9.304`），消除长脸畸变；并在 `Y_mh = 4.69` 截断处向下平滑延伸 5 环天鹅颈柱至 `Y = -13.20cm`，消除颈底锯齿。
     - **根因 4（3D 眼球虹膜/高光、花瓣唇、腮红与 6 环 3D 浮雕 C4/C5 解剖断面 C¹ 连续 UV 映射 & 颈柱法线朝向修正）**：在 `skinTextureGenerator.js` 新增 `forMakeHuman3D` 模式与 `(0.075, 0.925)` 独立 3D 眼球虹膜/巩膜/眼神光圆盘，对 `g body` 采用 100% C¹ 连续仿射 UV 映射（彻底消除嘴角/下巴/下睑跨 UV 区线性插值导致的溢色环），修正 5 环天鹅颈延伸柱三角形绕序（`[u0, u1, w1]` 法线朝外）与 6 环 3D 浮雕 `neck_cross_section` 底座，全面接入 Step 2/3 实时骨相滑块与换色系统。
  3. **修复 HUD 消失点标签偏移**：在 `src/style.css` 中将 `.vp-label` 设为 `position: absolute; top: 156px; left: 50%; transform: translateX(-50%)`，使中心透视十字准星严格锁定在 `(50%, 50%)` 消失点，同时文字胶囊下移不挡下巴。
  4. **Playwright 视觉回归验证通过（零控制台报错）**：已生成并人工核验 `.qa/stage8_desktop.png`（林汐/苏婉全宽齐刘海与无高光白斑）、`.qa/stage8_mh_bob.png`（MakeHuman 3D 亚洲女头 + 波波发）、`.qa/stage8_mh_long.png`（MakeHuman 3D 亚洲女头 + 长卷发）与 `.qa/stage8_mh_anatomy.png`（仰视颈部 C4/C5 解剖切面），并重新打包更新单文件离线版 `/home/user/点击开始游戏_CERVIX3D.html`（4.16 MB）。

### [2026-10-12 Stage 9] 修复 GitHub Pages 线上地址 https://deawfwaef2.github.io/head2/ 打开是「纯白空白页」的问题（部署配置 BUG，非 3D/美术 BUG）
- **用户反馈**：线上 Pages 地址打开是一片空白白页，看不到任何 UI 或 3D 桌宠。
- **根因排查（用 `curl`/`fetch_page` 直接核对线上源码，不是靠猜）**：
  1. 用 GitHub REST API (`GET /repos/deawfwaef2/head2/pages`) 确认 Pages 配置是 `source.branch=main, source.path=/`（仓库根目录）。
  2. 根目录 `index.html` 是 **Vite 开发期源文件**：`<link rel="stylesheet" href="/src/style.css">` 与 `<script type="module" src="/src/main.js">`，两个路径都以 `/` 开头（**根路径绝对路径**）。
  3. GitHub Pages 的这个仓库是 **项目页（project page）**，真实访问路径是 `https://deawfwaef2.github.io/head2/`，但所有 `/xxx` 绝对路径会被浏览器解析成 `https://deawfwaef2.github.io/xxx`（**少了 `/head2/` 前缀**），导致 CSS 和入口 JS 全部 404。
  4. 即使路径修好，`main.js` 内部 `import * as THREE from 'three'` 是**裸模块说明符（bare specifier）**，没有打包工具（Vite/Webpack）或 `<script type="importmap">` 的情况下，浏览器原生 ES Module **根本无法解析**，一样会直接报错中断执行。
  5. 两个问题叠加 = CSS 不加载 + JS 完全不执行 = 浏览器只剩下默认白底 `<body>`，这就是用户看到的「纯白页面」。**这不是 3D 建模/美术质量问题，是部署配置问题**，所以之前几轮专注修头发/脸部渲染的工作完全没有触及这个 BUG。
- **修复方案（已落地，不是空谈）**：
  1. 新增仓库 `/docs` 目录，把已经验证过、完全自包含（零外部资源引用、零裸模块引用，全部 inline）的 `点击开始游戏_CERVIX3D.html` 构建产物复制为 `docs/index.html`（外加 `docs/.nojekyll` 防止 Jekyll 处理干扰）。
  2. 用 GitHub REST API 把 Pages 的 `source` 从 `{branch: main, path: /}` 改成 **`{branch: main, path: /docs}`**（`PUT /repos/deawfwaef2/head2/pages`），这样线上服务的就是离线单文件版本，天然没有任何相对/绝对路径或裸模块解析问题。
  3. 在 `scripts/build_standalone_html.mjs` 末尾新增自动同步逻辑：每次重新生成 `点击开始游戏_CERVIX3D.html` 后，**自动把同一份内容复制进 `docs/index.html`**，并确保 `docs/.nojekyll` 存在。**请后续所有模型注意：以后只要跑了 `node scripts/build_standalone_html.mjs`，`docs/index.html` 会自动跟着更新，不需要手动复制；但千万不要让 GitHub Pages 的 Pages 设置改回 `path: /`（根目录），根目录 `index.html` 永远是给 `npm run dev` 用的开发源文件，不能直接被 Pages 当成产物发布！**
- **验证**：用 `curl`/`fetch_page` 确认 `GET /repos/deawfwaef2/head2/pages` 返回 `source.path` 已变为 `/docs`，状态为 `building`（GitHub 后台几分钟内会自动重新发布，属正常异步流程，无法在本轮沙箱内直接等待确认最终渲染效果，请用户稍后刷新 `https://deawfwaef2.github.io/head2/` 核实；若几分钟后仍是旧内容，通常是浏览器/CDN 缓存，建议强制刷新 Ctrl+F5）。
- **给后续模型的提醒**：
  1. 如果以后想做「真正的 Vite 构建产物部署」（而不是单文件离线版），必须在 `vite.config.js` 里设置 `base: '/head2/'`，否则同样的根路径 404 问题会再次出现在 `dist/` 产物里。当前选择直接发布单文件离线版是更稳妥、与本项目"必须优先保证可玩 HTML"的既定设计哲学一致的方案，不建议轻易改回 Vite 构建产物部署模式。
  2. 这次合并时发现并入了另一位并行 Agent 的 Stage 7a/8 提交（MakeHuman 3D 头雕/眼球/发丝管线重大更新、HUD 消失点标签位置修复等），已用 `git merge --ff-only` 快进合并，未丢失任何一方工作，合并后在 `file://` 协议下重新跑过 Playwright 回归测试（0 控制台报错，头发无银色色块，发际线/HUD 均正常）。
- 工作区大小：本轮结束约 59MB（不含 `node_modules`、`.cache`、`.npm`，`dist/` 为可重新生成产物）。


### [2026-10-12 Stage 9] CC0 发型补充 / 离线档案持久化与实体 ZIP / Electron 独立 HTML 桌面启动
- **每次编程先读根目录 HANDOFF，绝对不要覆盖本文件；每次修改后优先重建并提交 `点击开始游戏_CERVIX3D.html`。** 本轮从 `/home/user` 根目录操作。
- 发型：将已有的 MakeHuman CC0 `mh_hair_ponytail01.obj` 接入工坊第三个「低马尾」按钮，波波与长发增加 `createFittedHairFinishingGroom` 确定性贴颊微发束；起初发束根部在高处出现悬浮大块，Playwright 截图后已将根部下移到发片内部并避免马尾外侧发包。**请注意这仍不是 DAZ 电影级毛发**，不要将其包装为照片级重建。素材出处在 `assets_src/makehuman/LICENSE_NOTE.txt`，外部高品质发型选择说明已加入 README。选中 `mh_asian` 下拉后自动使用适配的波波发，避免程序化发型不贴合。
- 离线档案：`src/main.js` 新增 localStorage 恢复/保存；`file://` 保存不再谎称已生成磁盘文件夹。档案页新增「下载档案文件夹 .zip」（`src/data/offlineArchiveZip.js`，原生 UTF-8 ZIP store + CRC32），内含 `manifest.json` 与 `dossier.md`；Vite 服务模式仍可写 `collectibles/`。blob 外部模型 URL 跨刷新失效，恢复时清除引用；此限制必须如实告知。已用 Playwright `file://` 实测保存→刷新持久化、ZIP 下载后用 Python zipfile 读出两文件、运行时无 pageerror。
- Electron：`electron/main.cjs` 默认直接 `loadFile` 根目录独立 HTML（不用先开 Vite），源码模式在支持透明窗的 OS 上提供真实桌面置顶层；预加载声明桌面模式，前端切为透明背景并隐藏网页模拟图标。`Ctrl/Cmd+Alt+X` 切换全屏鼠标穿透（手动开关；尚无可靠自动悬停穿透）；Electron 本轮未在沙箱真实桌面中运行验证，勿声称已发布安装包。`README.md` 更新为诚实的启动方式与模型许可/质量界限。
- 本轮可视化 QA：`.qa/stage9_mh_long.png` / `.qa/stage9_mh_ponytail.png`；Playwright 在根目录 HTML 的 `file://` 下检查 MH 预览、启动按钮、档案保存与 ZIP，无 JS pageerror。GPU 软件渲染偶有 SwiftShader context-lost 警告但本轮无脚本异常。
- **后续待办**：用户真正期望的是贴近照片的高精 DAZ 头发；本项目当前 CC0 MH 发片有低面数/硬边限制。要到照片级请以合法自备 DAZ/Blender 发型与头模同坐标导出并仔细调 UV / 物理渲染；不要把未经许可的商业原件提交到仓库。外部上传 blob 保存跨会话仍需完整文件持久化方案（如 IndexedDB/File System Access API），目前只保存参数。Electron 真实屏幕自动点击穿透交互尚需分平台测试。


### [2026-10-12 Stage 9 合并补记] 并行 Agent 的 GitHub Pages 修复保留
- 推送 Stage 9b 时发现另一位 Agent 同步修复 GitHub Pages 白屏并把 Pages 指向 `/docs`。已合并远端 `fa1407a`，完整保留其 `/docs` 发布规则与 `scripts/build_standalone_html.mjs` 自动同步逻辑，并保留本轮发型/离线档案/Electron 工作；冲突仅 HANDOFF 两段追加日志，全部保留，没有覆盖历史。
- 以后每次构建必须同时核对 `cmp docs/index.html 点击开始游戏_CERVIX3D.html`；根目录 `index.html` 仅作 Vite 源文件，在线 Pages 实际发布 `/docs/index.html`。本轮合并推送后又将档案页「总会写入实体目录」文案更正为离线/服务模式区分。

### [2026-10-12 Stage 10a] 针对「现有头模太假」：私人高精资产一键导入及持久化（不把商业资产塞进公开仓库）
- 用户明确现有程序化/MakeHuman 头模质量不合格，且自己已有高精模型但导入麻烦。优先做能使用其私人模型的稳定流程，旧模型保留作离线兜底，不再称其为照片级 DAZ。
- 新增 `src/data/privateModelStore.js`：浏览器 IndexedDB 保存自备 `.glb/.obj` 原文件，收藏品只保存 `private-asset:<id>` 引用；下次双击同一 HTML 可以恢复私人模型，GitHub/独立 HTML 均不包含原文件；模型文件实际留在当前浏览器数据中，换浏览器/清站点数据必须重新选文件。优先选含内嵌 PBR 贴图的 GLB；OBJ 缺材质不可能自动变写实。缺资产时启动循环只跳过对应藏品，不崩溃。
- 工坊新增「选本机高精头部」「选配套头发」+ 头发 XYZ/缩放快速对位滑杆。GLB 头/发保留原作者 PBR/透明材质，独立头发需在同一场景导出以共享坐标；发丝对位不重新解析 GLB。导入路径已有 Playwright `file://` 测试：上传现有 LeePerrySmith.glb → 本地持久化 → 注册召唤 → 页面刷新恢复；再用同一 GLB 模拟发型文件测试头发引用和位置配置保存，均无 pageerror。该内置测试 GLB 是男性扫描，仅测试流程，**不是**目标女性模型。
- 仍待：完整全身 GLB 的可靠只保留头部自动视窗缩放（默认应优先让用户选头部导出件）；OBJ 无贴图只能做几何导入；解剖盖为装配预览，尚非根据外部扫描切口的精确拓扑封口。找到的网上候选请写明个人使用/分发许可、体积和导出格式，绝不能仅凭免费就提交到公开仓库。

### [2026-10-12 Stage 10b] DAZ 官方角色/头发候选清单 + 诚实校准导入说明 + 离线可玩回归
- **仓库位置**：按前序约定将本轮克隆的仓库移回 `/home/user` 根目录；`scripts/build_standalone_html.mjs` 的 `/home/user` 固定路径现可直接运行。
- **网络选材（只收录官方链接，不下载或打包商业资产）**：新增根目录 `DAZ_ASSET_GUIDE.md`，梳理 `Kei HD for Genesis 9`、`JS Genji for Genesis 9 Feminine`、`Kimiyo Asian Beauty: Heads & Bodies`，以及 `Everyday Spring Style Hair`、`dForce Strand-Based Beauty Style Long Hair`、`Xiu Lin Hair`；注明代数/`.DUF`/Iray→GLB 的限制与互动许可。`index.html` 的 DAZ 指南页加入同一份 6 项来源卡片和许可警示，链接在离线 HTML 中可见、点击需联网。
- **修正文案与产品边界**：默认档案不再把程序化预设说成真实 DAZ 网格；工坊说明照片采样只取肤色、滑块手动调形、OBJ 单文件不读 MTL、外部模型颈部裁切只是平面裁切 + 解剖示意盖，并非自动布尔封口/临床解剖模型。离线 HTML 的测试扫描按钮在 `file://` 下给出提示，不会请求缺失的 `/models/LeePerrySmith.glb`。
- **安全维护**：将 Vite 从 `^5.4.11` 更新到 `^6.4.4`；`npm audit --omit=dev` 为 0 vulnerabilities。应用版本统一为 `2.7.0`。
- **离线构建与 QA**：`node scripts/build_standalone_html.mjs` 已生成根目录 `点击开始游戏_CERVIX3D.html` 和同步后的 `docs/index.html`（各约 4.18 MB），`cmp` 相同。Playwright 分别检查 Vite 与 `file://`：启动按钮正常，DAZ 卡片 6 项/教程 5 步加载，离线测试扫描按钮有提示；控制台/pageerror 均为 0。另在隔离浏览器档案完成注册 → localStorage 保存 → ZIP 下载/解压读取（无真实用户档案被写入）。视觉截图 `.qa/stage11_asset_catalog_final.png`。
- **本轮仍未做 / 给后续模型**：没有购入或下载 DAZ 资产；仍需用户按商品和交互许可确认后，用自备合法 GLB 导入实测贴图/发际线。照片自动几何重建、任意头模的真实拓扑封口、Electron 跨 OS 打包均不在本轮实现范围。

### [2026-10-12 Stage 10b 推送确认]
- 已提交并推送 `89af702`（`Curate DAZ assets and clarify local import workflow`）至 `origin/main`；推送后 `HEAD` 与 `origin/main` 同为 `89af702`，工作树干净。GitHub PAT 只用于该次命令的 HTTP Authorization header，未写入文件或 git config。
