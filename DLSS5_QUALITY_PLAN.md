# DLSS 5 级画质方案（给用户拍板，2026-10-13）

> 结论先行：**“最高质量 + 真正桌面桌宠”最终应走原生路线；现有 Electron+Three.js 版是保证随时可玩的保底路线。**
> 两条路不冲突：先把现有版画质拉到 WebGL 上限，同时按原生路线准备资产（高模/4K-8K PBR/头发），资产可无损迁移到 Unreal/Unity。

## 先纠正一个事实
- DLSS 5 是 NVIDIA 在 GTC 2026 公布的神经渲染技术，首发面向 RTX 50 系、需游戏引擎以 DirectX 12 接入 NGX/Streamline，并由 NVIDIA 提供专有 DLL。
- **浏览器 / Electron / Three.js（WebGL）无法调用真 DLSS**：没有 DX12 设备、运动矢量/深度以 NGX 要求格式喂给驱动的通道。网页里任何“DLSS”只能是等效算法（时域重建/超采样/锐化），不能冒充 DLSS。
- 因此想要“真 DLSS 5”，必须做原生 Windows 程序；想要“双击 HTML 就能玩”，必须接受 WebGL 等效画质。二者不可兼得，只能双路线。

## 选项 A（推荐·最终形态）：Unreal Engine 5 原生桌宠 — 真 DLSS
- 引擎：UE5 + DirectX 12 + NVIDIA DLSS 插件（Super Resolution / Frame Generation / 后续 DLSS 5 神经渲染 DLL）
- 画质上限：★★★★★ 路径追踪/Lumen、Nanite 高模、Chaos 毛发、皮肤次表面散射、眼球折射
- 桌宠实现：UE 无边框透明窗口 / 或 UE 渲染一帧带 Alpha 的离屏画面贴到 Win32 分层窗口（Layered Window），空白穿透、命中才拦截
- 代价：需装 UE5+VS2022 构建，安装包数百 MB 起；DLSS DLL 需向 NVIDIA 开发者计划申请、不能随便再分发；RTX 50 首发，老卡用 DLSS 4.5 超分
- 适合：你说的“最高质量、唯美感、不惜代价”

## 选项 B：Unity 6 HDRP 原生桌宠 — 真 DLSS（接入更轻）
- 引擎：Unity 6 + HDRP（DLSS 仅支持 HDRP 管线）+ DLSS Super Resolution
- 画质上限：★★★★☆ HDRP 光照/SSS/头发着色器成熟，生态教程多
- 代价：同样要原生构建；DLSS 5 神经渲染目前只有社区 UnityRHI 实验集成，非官方稳定版
- 适合：想较快做出原生桌宠安装包的团队

## 选项 C（当前保底·已在做）：Electron + Three.js — DLSS 等效最高画质
- 管线：WebGL2 + ACES + PMREM IBL + PCFSoft 阴影 + Bloom/调色后期 + 各向异性发丝 + 程序化解剖断面
- 本轮新增：**Ultra 电影档** = 工坊最高 3x 超采样、桌宠最高 2.5x、4096 阴影（工坊）、16x 各向异性贴图过滤、high-performance GPU 偏好
- 画质上限：★★★☆☆ 受限于内置示例资产（约 18K 三角面 / 1K 贴图）——**渲染器再强也变不出不存在的毛孔和发丝**
- 优势：双击 HTML 即玩、真桌面透明桌宠（Electron）、跨平台、迭代最快

## 选项 D（资产路线，决定 80% 真实感，与引擎无关，必须做）
真实感排序：**模型 > 贴图 > 头发 > 灯光 > 后期 > 超分**。DLSS 只负责“放大和稳定”，不负责“长出细节”。
1. 头模：在 DAZ/Blender 用你有权使用的亚洲女性高模，只留头部、C4/C5 封口，目标 80K–300K 三角面（原生）/ 30K–80K（WebGL）
2. 贴图：Albedo/Normal/Roughness/SSS 至少 4K，理想 8K；眼球独立材质（角膜折射+虹膜深度）
3. 头发：发片+发丝纹理或毛发曲线（Groom），发际线过渡层；拒绝整块“头盔发”
4. 导入：合并头+发导出一份内嵌贴图的 `.glb`（WebGL）或 FBX（UE/Unity），在本软件工坊导入验收

## 我的执行顺序（已开始）
1. ✅ 本文件：方案与选项落盘
2. ✅ 现有版加 Ultra 最高档（本轮 Stage 14），保证你现在就能以最高 WebGL 画质玩
3. ⏭ 你回复选 A 还是 B 后，另开 `native/` 原生工程骨架（不破坏现有可玩 HTML），逐步迁移资产与桌宠逻辑
4. 每个阶段：先重建双击 HTML → commit → push，绝不等全做完

## 需要你确认的一句话
回复 **“选A”**（Unreal 真 DLSS·画质最高）或 **“选B”**（Unity 接入更快）或 **“先C”**（只把现有版做到极致，原生以后再说）。
在你确认前，我不会擅自下载数 GB 的引擎，也不会把你的私人模型/照片上传到任何公开仓库。
