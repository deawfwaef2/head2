# CERVIX-3D · 颅相典藏馆 (PRO v2.7)
**3D 头部收藏品管理 · 参考照片对位 · 盒型透视桌宠预览与管理**

## 先玩起来
- 下载仓库 ZIP 并解压，双击根目录的 **`点击开始游戏_CERVIX3D.html`**；不需要安装依赖或联网即可进入「点击开始游戏」。这是一份自包含的离线 HTML，GitHub Pages 也使用同一构建产物。
- 网页版的桌宠只在浏览器视口内显示；要让它跨应用悬浮在真实电脑桌面，需要本地运行 Electron 源码。仓库没有已签名/打包的 Windows/macOS 安装程序。
- 档案保存到浏览器本地存储；离线模式可下载 `.zip` 档案夹（`manifest.json` + `dossier.md`）。自备模型文件单独保存在当前浏览器的 IndexedDB，不会被打进 HTML、档案 ZIP 或公开仓库。

## 当前版本实际能做什么
- 典藏库：注册/命名藏品、写档案、召唤与收回桌宠、悬停看档案、360°旋转、滚轮推拉景深、拖动碰撞与 WebAudio 音效。
- 工坊：上传参考照做叠图对位与肤色采样；五官滑块需要手动调参。**它不识别人脸关键点，也不会从一张照片自动重建头模。**
- 内置模型：林汐/苏婉/千雪是程序化东亚风格示例；另有 CC0 MakeHuman 实验头模。它们不是 DAZ Genesis 原始商业网格，也不是照片级重建。内置程序化头发/CC0 发片只是预览级资产，不应视为影视级独立发丝 groom。
- 自备模型：接受 `.glb` 或 `.obj`。优先使用内嵌 PBR 贴图的 GLB；OBJ 单文件目前只导入几何，不自动关联 `.MTL` 或贴图。DAZ `.DUF` 不能直接载入，需要先用你有权使用的流程导出为 GLB。
- 外部模型的颈部效果由实时裁切平面加程序化解剖示意盖组成，**不是任意网格的真实布尔封口，也不保证 watertight 拓扑或切缘完美贴合**。请用正面、侧面、仰视检查；正式模型建议先在 Blender 人工裁切/封口。

## DAZ 资产与发型
工坊「DAZ资产选型与导入指南」页已加入官方产品候选、代数兼容、发型导出提醒和导入教程；详细清单见 [`DAZ_ASSET_GUIDE.md`](DAZ_ASSET_GUIDE.md)。

**许可特别重要：**DAZ 官方说明，DAZ 3D 内容用于游戏或其他交互应用时，使用/分发原始 3D 数据需要 Interactive License；若某产品不提供该许可选项，则不可把它作为 app/game 的 3D 资产。购买前逐件查看商品页、现行 EULA，并确认你的个人桌宠用途。产品链接与信息截至 2026-10-12 核对；价格、库存与许可选项可能变化。

项目不会捆绑任何付费 DAZ 模型、贴图或发型。已导入的私有模型留在当前浏览器的 IndexedDB；清除站点数据/更换浏览器后，需要从备份重新选原文件。档案 ZIP 不包含模型本体。

## DAZ → Blender → CERVIX-3D 基本路线
1. 按许可在 DAZ Studio 准备 Genesis 角色、皮肤与发型；先保存源 `.DUF` 场景副本。
2. 使用与资产/版本兼容的导出桥接或流程，将头与发导入 Blender；整理为静态网格并检查眼球、睫毛、发际线和侧脸。
3. 转换 DAZ/Iray 专有材质为 glTF/Principled PBR；尽量嵌入纹理，导出 `.GLB`。分开导出头与发时，二者要保持共同原点、坐标与尺度。
4. 在本软件先导入头部，再导入配套发型；检查材质透明度与发际线，用缩放/X/Y/Z 控件校准。旋转到仰视后检查颈部切口。
5. 保存藏品档案。模型资产在本机私有仓库，不会自动进入档案 ZIP。

## 本地开发 / Electron 桌面层
```bash
npm ci
npm run dev
```

重新生成可双击的独立 HTML 与 GitHub Pages 版本：
```bash
node scripts/build_standalone_html.mjs
```
脚本会同时更新根目录 `点击开始游戏_CERVIX3D.html` 和 `docs/index.html`。Pages 应继续指向 `main` 分支的 `/docs`，不要把开发用根目录 `index.html` 当作 Pages 产物。

在支持 Electron 的桌面环境测试透明置顶层（需另行安装 Electron；尚非打包安装程序）：
```bash
npm install --no-save electron
npm run electron
```
Electron 默认从根目录独立 HTML 启动，不依赖 Vite。**Ctrl/Cmd + Alt + X** 切换鼠标穿透。实际透明窗口、穿透与显示器行为依操作系统而异，需在目标机器实测。

## 许可与来源
- MakeHuman CC0 资产说明：[`assets_src/makehuman/LICENSE_NOTE.txt`](assets_src/makehuman/LICENSE_NOTE.txt)。
- DAZ 产品链接、导出/许可边界：[`DAZ_ASSET_GUIDE.md`](DAZ_ASSET_GUIDE.md)。
- 不要把个人购买的 DAZ 网格、贴图、发型或含它们的 HTML/ZIP 推送到公开 GitHub。
