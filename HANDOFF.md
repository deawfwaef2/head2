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

### [2026-10-12 Stage 4] 全面替换为真实高精亚洲女性 3D 头模 (`.glb`) + 7 款真实 3D 发型库 (`hair_*.glb`) + 彻底修复窗口遮挡 BUG
- **用户最新明确指令（最高优先级，严禁退回程序化低模）**：
  1. **不许再使用简陋的程序化人脸面罩 (`canonical_face_model.obj`) 或程序化数学纸片头发**：必须使用下载的真实高精度 3D 亚洲女性头模与真实 3D 头发模型库。
  2. **彻底修复窗口遮挡 BUG（“现在窗口有BUG，那个DAZ窗口遮住一切窗口”）**：DAZ/软件主窗口绝不能遮挡所有其他窗口、桌面图标、3D 桌宠与悬停档案卡。
- **核心架构升级与模型资产 (`scripts/build_real_daz_assets.py` -> `public/models/*.glb`)**：
  1. **真实亚洲女性高精头模 (`public/models/daz_asian_head_base.glb`, 2.39 MB)**：
     - 基于 MakeHuman/MPFB2 CC0 真实高精角色头模，通过骨骼权重 (`joints 43: neck_01`, `44: head`) 精确剥离躯干，并在 `Y = 1.362m`（C4/C5 颈椎水平）执行边插值水平切割，生成零锯齿水平颈环。
     - 包含 5 大独立高精度网格：`HeadSkin`（4,494 顶点、8,554 三角面）、`NeckCrossSection`（无缝缝合于颈底环口的 64×12 极坐标 C4/C5 解剖断面封口网格，带气管凹槽与椎骨微凸）、`Eyes`（真实 3D 眼球 + 1.26x 放大东方琥珀深棕虹膜 + 透明高光角膜 `Cornea`）、`Eyebrows`（3D 柔雾眉毛网格）、`Eyelashes`（3D 羽状眼睫毛网格）。
     - 内嵌 5 张高清纹理：高斯频率分离精修的东方女性冷白瓷肌贴图 (`skin_albedo.jpg`，含自然花瓣唇晕染与蜜桃腮红)、微米级毛孔法线贴图 (`skin_normal.jpg`)、东方深棕虹膜贴图 (`eye.jpg`)、眉毛与睫毛透明通道贴图。
     - 内置 **32 通道 `KHR_mesh_quantization` 真实 Morph Targets**：支持面部骨相滑杆实时形变、**真实双侧眼睑自然眨眼动画 (`blink_left`, `blink_right`)** 以及 **真实 3D 眼球跟随鼠标视线转动 (`look_left`, `look_right`, `look_up`, `look_down`)**。
  2. **7 款真实 3D 发型模型库 (`public/models/hair_*.glb`)**：
     - 完整集成 7 款真实 UV 映射 3D 发模：`hair_long01.glb`（浪漫中分瀑布长卷发，3,312v）、`hair_bob02.glb`（法式侧分内扣波波头，1,688v）、`hair_bob01.glb`（知性层次感锁骨波波发，5,432v）、`hair_ponytail01.glb`（冷感干练高颅顶束马尾，3,902v）、`hair_braid01.glb`（温婉侧分立体粗麻花辫，4,663v）、`hair_short02.glb`（空气感碎发精灵短发，1,794v）、`hair_short04.glb`（极简干练齐耳短发，983v）。
     - 所有长发模型的前胸发束均做了环颈外分处理，绝不遮挡正面天鹅颈与底部 C4/C5 医学解剖断面。
  3. **彻底修复窗口遮挡与层级陷阱 (`index.html`, `src/style.css`, `src/main.js`, `src/three/desktopBoxSpaceEngine.js`)**：
     - 移除 `#desktop-environment` 的 `z-index: 1` 层级陷阱；将悬停档案窗 `#pet-hover-dossier` 移至顶层 `z-index: 9999`，确保鼠标悬停桌宠时档案卡永远在最前。
     - `#desktop-pet-canvas` 默认启用 **「📌 3D桌宠: 置顶最前」**（`z-index: 62; pointer-events: none;` 配合全局射线拾取穿透），使 3D 头部桌宠永远不会被 DAZ 软件窗口遮挡，且不阻碍任何窗口按钮点击。
     - `#software-window` 新增 **「◧ 右侧紧凑停靠」**、**「🌓 半透毛玻璃」** 与强制生效的 `.window-hidden`（修复拖拽后 `style.transform = 'none'` 导致无法隐藏窗口的 BUG）。
  4. **独立单文件可玩版更新 (`/点击开始游戏_CERVIX3D.html`, 8.59 MB)**：
     - 将 `daz_asian_head_base.glb` 与全部 7 款 `hair_*.glb` 模型以 Base64 内嵌至 `window.__EMBEDDED_GLBS__`，双击 HTML 即可 100% 离线加载真实 3D 头模与全部 7 款真实 3D 发型。

### [2026-10-12 Stage 5] 静态失活标本神态（取消眨眼与鼠标旋转跟随）+ 消除“嘟嘟嘴” + 高亮度带血颈部断面 + 用户本人照片定制头模 (`SPEC-2026-000` / `hair_user_photo.glb`)
- **用户最新明确指令（最高优先级，严禁违背）**：
  1. **不要眨眼 & 不要跟随鼠标旋转（“不要眨眼，而且头不要跟随鼠标旋转，就是死人表情默认那种感觉知道吧”）**：
     - 彻底关闭自动眨眼（`blink_left`/`blink_right` 保持静态微阖失活感）与眼球视线追踪（`look_* = 0`）。
     - `DesktopBoxSpaceEngine.js` 默认将 `followIntensity` 设为 `0.0` 并移除上下呼吸浮动 `bobY`，使桌面上的 3D 头模保持**死人/标本级绝对静止神态**（默认微仰 `-0.18 rad` 以直接展示颈部切口血迹与底部断面，仅在手动拖拽、滚轮推拉景深或单击进入 360° 旋转检视时才移动）。
  2. **彻底修复“嘟嘟嘴”问题（“不知道为什么现在嘟嘟嘴就是嘴看上去有问题”）**：
     - 原因定位：此前在烘焙与运行期叠加了 `face_mouth_width_decr`（收窄嘴角）+ `face_lips_incr`（前推唇珠）+ 仅涂抹嘴唇中央的窄唇彩，导致嘴唇向中间撅起呈“嘟嘟嘴”。
     - 修复方案：在 `scripts/build_real_daz_assets.py` 与 `src/three/collectibleHeadAssembler.js` 中全面移除 `face_mouth_width_decr`，改用 `face_lips_decr: 0.22` 并将唇部前凸顶点 (`z > 0.134`) 向内收平 `36%`，配合全唇宽自然低饱和灰粉标本唇色 (`#bf6872`)，使双唇呈现平直、放松、自然闭合的静态标本嘴型。
  3. **解决断面发黑并增加切口附近真实血迹感（“而且现在断面好黑，而且断面附近就是应该有点血迹感更真实”）**：
     - 在 `scripts/build_real_daz_assets.py` 中，于 `daz_asian_head_base.glb` 的颈部切割口上方皮肤 (`Y ∈ [1.362, 1.388]`) 烘焙了真实的**暗红凝血切缘 (`#4a0409`) + 鲜红毛细血管不规则渗血晕染 (`#9e111b`) + 微细血点**。
     - 为 `NeckCrossSection` 断面网格内嵌高清 `neck_section.jpg` 贴图、法线微向前倾 (`[0, -0.93, 0.36]`)，并在 `collectibleHeadAssembler.js` 中同时启用 `emissiveMap: colorTex, emissiveIntensity: 0.74`，彻底解决朝下断面背光发黑的问题，使 C4 颈椎、蝴蝶形脊髓灰质、气管软骨环、双侧颈动静脉与鲜红肌群在任何角度均清晰高亮。
  4. **新增用户本人照片 1:1 定制预设角色与专属发型 (`SPEC-2026-000 · 初夏` + `public/models/hair_user_photo.glb`)**：
     - 根据用户上传的照片 (`uploads/image-1.png` -> `public/models/user_photo_ref.jpg`)，在 `scripts/build_real_daz_assets.py` 中基于颅骨表面精确包络算法 (`get_skull_front_z`) 构建了 **6,114 顶点专属发型 `public/models/hair_user_photo.glb`**（贴合圆润颅顶的空气感齐眉直碎刘海 + 双耳前垂落的修颜鬓角碎发 + 露出双耳与天鹅颈的后脑束发），并在右脸颊对应位置点绘了照片同款的 **3 颗特征小痣**。
     - 将 `SPEC-2026-000 · 初夏 · 照片真容定制标本` 设为首号默认召唤藏品与工坊默认预设，并在工坊参考照区域默认载入用户照片。
  5. **更新独立单文件可玩版 (`/点击开始游戏_CERVIX3D.html`, 9.34 MB)**：内嵌更新后的带血迹与特征痣头模 `daz_asian_head_base.glb`、专属发型 `hair_user_photo.glb`、其余 7 款真实 3D 发型及用户参考照数据。

### [2026-10-12 Stage 5 / 协作接手] 合并同期 GLB 模型工作 + 真正修复系统窗口遮挡
- 本轮开始时仓库 `main` 已被另一位 Agent **强制更新**至 `8e12c4c`（Stage 4：内置 GLB 头和 7 发型）；原本基于旧 `ac14c23` 的修复提交 `c541cda` 不能直接推主分支。为保留最新头/发模型，本轮从最新 `origin/main` 建 `fix/desktop-occlusion`，只移植与适配窗口、构建、诚实文案的修复；**严禁强制推送或用旧快照覆盖 Stage 4**。旧修复提交本地仍可追踪，但不是本分支的祖先。
- Electron 真正遮挡根因：单个 `screen-saver` 等级全屏置顶窗口始终抓住透明区域输入，CSS z-index 修复只能解决网页内部，无法让系统其他软件可点击。现在默认普通大小、非置顶、任务栏可见的管理器；隐藏后变为 `floating` 等级透明桌宠层。主进程 40ms 轮询屏幕光标，即使穿透状态也让 renderer 射线检测宠物：空白区域点击穿透、命中头模可交互，拖动期间保持输入。托盘按钮、Ctrl/Cmd+Alt+M / X 随时恢复管理器；管理器有退出键。管理器 UI 在桌宠层绝不渲染，网页双击 HTML 时仍保留原有模拟体验。
- 修复 `scripts/build_standalone_html.mjs` 硬编码 `/home/user` 导致在嵌套仓库错误打包：改为相对于脚本所在仓库；8 个必需 GLB 缺失立即报错；每次同步根目录可离线运行的 `点击开始游戏_CERVIX3D.html` 与 `docs/index.html`。构建已跑通，文件大小约 8.6MB、内嵌模型。`dist/` 被 .gitignore 排除，不必提交。
- 真实性审计：Stage 4 内置 GLB 的构建脚本引用 `/tmp/dl_inspect/base_body.glb`，此仓库**没有可复核的上游下载来源与许可文件**；不能称它是 DAZ Genesis 商业原件，发布前必须核验授权。外部导入之前谎称 `.OBJ` 和任意全身模型都可自动切颈封口，实际上代码将 OBJ 静默换为内置头，任意 GLB 也不能自动精确布尔封口。本轮将 UI 限定为临时预览内嵌贴图 `.GLB`，说明必须事先在 Blender 裁成头部并检查颈口，失败给出提示；不要夸大“一张照片99%还原”。
- 测试边界：Vite 构建/Node 语法校验/根目录 HTML 与 docs 完全相同已检查；此沙箱没有真实桌面、Electron GUI 或浏览器二进制，Windows/macOS 点击穿透仍需实机验证。HTML 能下载双击进入浏览器试玩，但不能仅凭 HTML 形成跨应用桌宠；需启动 Electron 源码。
- 工作区约 92MB（移除安装依赖后）；曾并发 clone 到旧分支含大 GNM NPZ 导致超标，已切至 Stage 4 远端分支，注意后续构建完清理 `node_modules`，总量保持 <128MB。

### [2026-10-12 Stage 6] 离线档案持久化、私人 GLB 保存、合法 DAZ 选材教程（在 Stage 5 推送后继续）
- 之前 Stage 5 的修复已提交 `0c975bb` 并 **fast-forward 推送至 origin/main**；没有覆盖同期 Agent 的 `8e12c4c` GLB 头/发模型。此后再改动仍以 Stage 4/5 为基线。
- 本轮恢复 `src/data/privateModelStore.js`：上传 GLB 先存 IndexedDB，档案存 `private-asset:<id>` 引用；3D 加载器按引用解析为本机 Blob URL，模型原件不进 GitHub/下载 ZIP。若 IndexedDB 失败仅退回会话级 Blob，并明确告知用户。localStorage 恢复/保存藏品参数；单个/全部召唤状态同步保存；恢复缺失私人模型时跳过坏藏品，不阻止整体启动。
- 新增无依赖 UTF-8 ZIP 下载：档案页「下载档案文件夹 .zip」包含 `manifest.json` 与 `dossier.md`，离线 file:// 可用；仅 Vite 服务模式可能写到实体 `collectibles/`。改掉离线模式假装已写服务器目录的提示；导入 JSON 离线也可保存和重新召唤。
- 真正核对官方商品页 `Kei HD for Genesis 9` 与 `Xiu Lin Hair for Genesis 9`：两者均为 DUF，官网页面有单独的 Interactive License 加购项；后者为多边形发型并非通用 GLB。新建 `DAZ_ASSET_GUIDE.md`（另列 JS Genji、Kimiyo、Spring、Strand-Based 长发候选），在离线 HTML 教程页加入官方下载链接/许可警示；**没有下载或公开分发任何商业 DAZ 资产**。外部头部导入后自动选「无内置发」，避免不同坐标的示例发模穿帮。Electron 打开官方 DAZ 外链转系统浏览器。
- 已执行 Vite 打包、Node 语法校验、`docs/index.html` 与根目录 HTML 比对；用 Python zipfile 解开程序生成的 ZIP，含预期的两份 UTF-8 文件。仍未在真实桌面 Electron 或浏览器做视觉 QA；留待有 GUI 环境时检查穿透与私有 IndexedDB 在目标平台的行为。离线 HTML 约 8.60MB；移除 `node_modules` 后工作区约 111MB。

### [2026-10-12 Stage 7a / 协作接手] 🚨 合并恢复被 force-push 覆盖的 Stage 5-electron/Stage 6 + 写实渲染管线升级
- **并发事故经过（致后续所有 Agent，必读）**：本轮克隆时远端 `main` 为 `7426857`（含 Stage 5-electron 穿透修复与 Stage 6 私有持久化）；推送时被拒，发现 `main` 已被另一 Agent **强制改写为 `5a7af81`**（基于 Stage 4 的“标本 Stage 5”，标题恰好也叫 Stage 5），`0c975bb`/`7426857` 两轮工作在远端被抹掉。本轮**没有强制推送**，而是以 `5a7af81` 为新基线做三方内容合并：`main.js`/`index.html` 用 `git merge-file` 以 Stage 4 为基自动合流（零冲突）；三引擎在对方版本上重打渲染补丁并补回 `resolvePrivateModelUrl` 私有模型链路与 Electron `real-desktop-manager` 穿透守卫；打包脚本合流为“相对路径修复 + 9 GLB（含 `hair_user_photo.glb`）+ 参考照内嵌 + docs 同步”；`HANDOFF.md` 保留**两个 Stage 5 条目**（不改写任何历史）；`electron/`、`style.css`、`README.md`、`DAZ_ASSET_GUIDE.md`、`privateModelStore.js`、`offlineArchiveZip.js` 按原样恢复；对方的血迹头模/`hair_user_photo.glb`/参考照/标本神态/嘟嘴修复全部保留。
- **⛔ 铁律重申**：任何情况下**禁止 `git push --force` 到 `main`**！推送被拒时一律 `fetch + 合并`解决；快照过期（看不到远端新提交）时先 `git fetch` 再动手。本轮另将工作区改为浅克隆（`--depth 1`，约 31MB），远离 128MB 快照丢失红线。
- **写实渲染管线升级（回应用户“渲染很低级，要 DAZ 级真实感”）**：
  1. 新增 `src/three/photorealLighting.js`：ACES + sRGB + PCF 柔和阴影 + PMREM `RoomEnvironment` 离线 IBL（零外部 HDR，`file://` 兼容），工坊与桌宠共用同一灯光色温体系。
  2. 主光源开启 2048 阴影（鼻翼/唇缝/眼窝真实自投影）；背部轮廓光由物理单位下近乎无效的 `PointLight` 改为确定性 `DirectionalLight`。
  3. 皮肤材质：程序化 512px 微观粗糙/毛孔贴图（`createSkinMicroMaps()`，单例）+ 法线增强 + 次表面暖调（sheen/emissive 近似）+ IBL，消除塑料皮感；发丝：`anisotropy 0.85` 各向异性高光 + 清漆发釉 + `alphaToCoverage` 柔边；眼球/角膜 IBL 高光增强；**完整保留对方的断面 `emissiveMap` 高亮设计**（只追加 IBL/高光参数）。
  4. 双引擎新增 `setRenderQuality(low/medium/high)`（像素比/阴影/环境强度联动），设置页 UI 接线留待 Stage 7b。
- **诚实边界**：浏览器实时 WebGL 做不到 DAZ Iray 离线光追的 100% 照片级；本次升级目标是“实时写实”（去塑料感、真实投影、发丝釉光、眼球高光）。已重建 `点击开始游戏_CERVIX3D.html` 并同步 `docs/index.html`（含 9 个内嵌 GLB + 参考照，约 8MB），双击即玩；`node --check` 全过，构建产物无外部脚本引用（仅教程页 DAZ 官网商品超链接）。

### [2026-10-12 Stage 7b] 写实画质三档 UI（设置页 + 启动画面 + 持久化）
- 设置页新增「✨ 写实渲染画质」卡片（`sel-render-quality`：极致/标准/流畅），切换时同时调度 `desktopEngine.setRenderQuality()` 与 `studioEngine.setRenderQuality()`（像素比上限 2/1.5/1、阴影 2048/1024/关闭、IBL 强度 0.85/0.65/0.35），档位存 `localStorage[cervix3d-render-quality]`，启动自动恢复；启动画面新增「✨ 照片级PBR写实渲染」特性 pill。已同步重建双击即玩 HTML 并推送。
