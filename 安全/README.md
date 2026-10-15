# 安全版 · 写实收藏胸像桌宠工作室

**双击 `点击开始_写实收藏胸像.html` → 点「▶ 点击开始」。** 单文件离线可用（约 15 MB），建议 Chrome / Edge 并开启硬件加速。

## 功能
- **工坊（生成）**：8 种一键风格（室内日光 / 窗格光影 / 暖阳逆光 / 棚拍精修 / 树影午后 / 电影冷暖 / 柔焦唯美 / 黑白经典）；
  头型 7 种 + 10 项五官滑杆 + 微笑/恬静/眉毛；10 种肤质、8 种眉形；10 款发型、7 种发色 + 自定义取色；6 个镜头。
- **布光**：11 种预设 + 主光方位/仰角/强度/柔和度/色温(K)/轮廓/补光/环境/曝光；窗格、树叶光斑遮挡（只进阴影，不出现假光板）。
- **皮肤**：预积分次表面散射、粗糙度、毛孔、绒毛柔光、皮脂第二高光瓣、肤色饱和。
- **头发**：发片 → 真发丝（Marschner R/TT/TRT），光泽与逆光透射可调，4 档密度。
- **胶片与后期**：8 种胶片预设（Portra 400 / Pro 400H / CineStill 800T / Gold 200 / Pro-Mist / 暗调 / Tri-X 黑白 / 干净数码），
  对比/饱和/冷暖/品绿/黑位/褪色/趾部/肩部/色调分离/晕光/柔焦/辉光/颗粒与颗粒大小/暗角/色差/锐化/黑白、GTAO、景深。
- **收藏（管理）**：保存缩略图、编辑、复制、删除、导入/导出 JSON。
- **桌宠**：浏览器内可拖动的展示窗，滚轮缩放、转身、自然眨眼、轻微呼吸、偶尔提醒休息；双击或 Esc 返回。
- **设置**：发丝模式与密度、渲染分辨率、阴影贴图、色调映射、GTAO、眨眼、桌宠大小、清空数据。
- **A/B 对比**：一键切回原始渲染，看写实管线前后差异。

## 局限（诚实说明）
- 内置头模约 4.5k 顶点、1024 贴图，**离照片级仍有距离**；渲染管线已可接收更高精度素材（后续可加“导入自有授权 GLB”）。
- HTML 版桌宠在浏览器窗口内，不是跨应用系统桌宠。

协作规则见 `HANDOFF_安全.md`。


## 目录结构（与主项目一致）
```
安全/
  index.html            页面骨架（开发时由 Vite 直接加载 src/main.js）
  package.json / vite.config.js
  src/main.js           应用入口（工坊/收藏/桌宠/设置）
  src/style.css
  src/three/            渲染模块：skinMaterial / featureMaterials / strandHair / hairlineBlend / faceTargets / studioLighting / postChain / backgrounds / displayStand
  src/data/             数据：hairCatalog / faceArchetypes / eastAsianHeadTargets / effectRegistry / effectBus / assetLoader
  src/ui/ src/textures/ 预留（对应主项目同名目录）
  public/models/        头模 + 37 款发型 GLB
  scripts/              build_standalone_html.mjs（打包单文件 HTML）/ sanitize_assets.mjs / qa_shots.mjs
```
- 开发预览：`cd 安全 && npx vite` → http://localhost:5174
- 打包可双击 HTML：`node 安全/scripts/build_standalone_html.mjs`

## 效果开关与连线（二次开发）
所有画面效果登记在 `src/data/effectRegistry.js`，渲染代码只读 `fx.effective(id)`，没有写死。
```js
const fx = window.SafeBust.fx;
fx.enable('post.grain', false);              // 关掉颗粒
fx.set('hairline.babyHair', 1.5);            // 碎发更密
fx.link('light.keyMul', 'post.bloom', { scale: 0.2, offset: 0 }); // 主光越强辉光越强
fx.on('*', (v, id) => console.log(id, v));   // 监听所有效果
fx.export();                                  // 导出开关+连线 JSON
```
URL 参数：`fxoff=post.ao,render.hairShadow`、`face=<骨相id>`、`hair=<发型id>`、`look=<风格>`、`view=hairline` 等。
