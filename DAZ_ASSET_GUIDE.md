# DAZ 亚洲女性头模与发型候选清单

**核对日期：2026-10-12。** 下面只链接 DAZ 官方商品/许可页；价格、库存、兼容软件与授权选项可能变动。这里不下载、复制或重新分发商品文件。

## 先选头模 / 角色

| 候选 | 适合做什么 | 已核对的商品信息 | 注意 |
|---|---|---|---|
| [Kei HD for Genesis 9](https://www.daz3d.com/kei-hd-for-genesis-9) | 想尽快有一张完成度较高的 G9 亚洲女性底脸 | 商品页列有 2 个头型、头/身体 HD 细节、PBR/Uber 材质、4K/8K 贴图、FiberMesh 眉毛 | 需要 Genesis 9 Starter Essentials；DAZ 的 `.DUF` 场景不能直接上传到本软件。页面中的 anatomical elements hair 不是普通长发造型，需另购/选择头发。 |
| [JS Genji for Genesis 9 Feminine](https://www.daz3d.com/js-genji-for-genesis-9-feminine) | 另一款 G9 亚洲女性角色，适合先比较脸型与皮肤细节 | 商品页列有自定义头/身体形状、HD 细节、PBR/Uber、8K 法线、FiberMesh 眉毛 | 需要 Genesis 9 Starter Essentials；产品也列 anatomical elements hair，不要把它误当成头顶长发。 |
| [Kimiyo Asian Beauty: Heads & Bodies for Genesis 9 Feminine](https://www.daz3d.com/kimiyo-asian-beauty-heads--bodies-for-genesis-9-feminine) | 想从多个亚洲骨相里挑选/混合，再自行贴近参考照片 | 8 个头型、6 个身体 morph | **Morph-only，不含皮肤贴图**；不是独立头模，需要 Genesis 9 基础、肤质和头发。 |

### 建议选择
- **先做一个较完整的角色底模：**比较 Kei HD 与 JS Genji 的官方预览，选最接近目标脸型的一款，再单独选头发。
- **重点是照片骨相：**Kimiyo 可作为头型 morph 候选，但它不会自动拟合照片；仍要逐视角手动雕刻/调形。
- 所有“亚洲风格”都只是商品创作方向，不代表自动适配任意照片。先对比眼距、脸宽、鼻尖、下颌角和侧面轮廓。

## 头发候选（从 DAZ Iray 到实时 GLB）

| 候选 | 优点 / 风格 | 导出提醒 |
|---|---|---|
| [Everyday Spring Style Hair for Genesis 8 and 9](https://www.daz3d.com/everyday-spring-style-hair-for-genesis-8-and-9) | G8/G8.1/G9；多层发束与蓬松体积；官方列有 10 种造型、24 个吹风形态和多种调整 morph | 商品页描述的材质为 DAZ Iray 工作流；转 GLB 前先转换/烘焙材质，并检查透明贴图、发际线与实时面数。 |
| [dForce Strand-Based Beauty Style Long Hair](https://www.daz3d.com/dforce-strand-based-beauty-style-long-hair-for-genesis-9-and-genesis-8-female) | G8/G8.1/G9；Iray curves、OmniHair 着色器、30 个发色；更偏 DAZ 静帧渲染 | 商品页注明 DAZ Studio 4.22+、Iray 优化。曲线与 OmniHair 不是通用 glTF 材质；转实时模型需先转几何/烘焙并优化。 |
| [Xiu Lin Hair for Genesis 9](https://www.daz3d.com/xiu-lin-hair-for-genesis-9) | G9 长马尾多边形发型；含头围/发际线/造型调整，以及短波浪、长晚宴造型预设 | 相比未转换曲线发丝更适合作为实时导出的起点，但它是 polygonal hair，不是逐根毛发 groom；仍要检查卡片透明与侧脸贴合。 |

## 导入 CERVIX-3D 的推荐流水线

1. **DAZ Studio 保存源场景。** 确认角色代数、依赖包、头部形状、皮肤贴图和发型都已正确加载。保留一份 `.DUF` 原工程，不要只留导出件。
2. **把目标裁为头部 + 短颈段。** 眼球、睫毛、眉毛、耳朵、发际线可能是分开的物件；逐一确认导出清单。先输出低分辨率测试件检查轴向与尺度。
3. **转入 Blender 并检查材质。** 使用你已获许可且与版本兼容的 DAZ/Blender 导出流程。将 DAZ/Iray 专有材质转为 Principled / glTF PBR；把可用贴图烘焙/嵌入 GLB。发型透明边缘要检查 alpha mode、法线与排序。
4. **导出 GLB。** 本软件可读取 `.GLB` 或 `.OBJ`；建议 GLB 内嵌 PBR 贴图。OBJ 单文件导入只保几何，本版本不自动寻找 `.MTL` 与纹理文件。
5. **头与发保持同一坐标。** 如分开导出 `head.glb`、`hair.glb`，不要对其中一件单独归零、居中或缩放。先在工坊选头，再选发，微调缩放与 X/Y/Z。
6. **逐视角验收。** 正面、45°、侧面、背面、顶部、仰视逐一检查：眉眼是否被遮、太阳穴是否露缝、头皮是否悬空、后颈发束是否挡断面。
7. **检查断面。** 当前外部模型截断器是平面裁切 + 解剖示意盖，不是任意模型的精确布尔封口。若要精致展品效果，在 Blender 先对模型做真实裁切与封口，之后再用本软件的示意盖做视觉装配。

## 许可、隐私与公开仓库

- DAZ 官方许可说明：[Interactive Licenses](https://www.daz3d.com/interactive-license-info) 与 [EULA](https://www.daz3d.com/eula)。DAZ 表示，3D 内容用于游戏或其他交互应用时，使用/分发原始 3D 数据需要 Interactive License；如果某商品页没有提供该选项，则不能把该商品当作 app/game 的 3D 资产。请逐件核对现行条款，并向 DAZ 确认个人本机桌宠用途，不要把这段指南当作法律意见。
- 本仓库不包含以上商业网格或贴图。上传的私人 GLB/OBJ 保存在**当前浏览器**的 IndexedDB，不会上传 GitHub，也不会随档案 ZIP 导出；更换浏览器或清除站点数据后需从原始备份重新导入。
- 参考照片只在当前页面作叠图/颜色采样，不会自动作为新头模贴图保存到档案。请只上传自己有权使用的照片。

## ⚠️ 关于 ShadowCore / 免费 DAZ 下载站的说明（必读）

用户曾建议从 **ShadowCore（shadowcore.ru）** 等站点“注册下载 DAZ 头模与头发”。经核查，这类站点提供的是 **未经授权的 DAZ 付费商品拷贝**（与 render-state、3d-load 等同类），从这些渠道下载、分发或打包进本项目，都违反 DAZ EULA 与著作权法，并会污染整个公开仓库的合法性。

**本项目的立场（与既往 HANDOFF 一致）：**

1. **绝不从 ShadowCore 或任何非官方渠道下载 DAZ 商品**，也不把任何来源不明的 `.duf/.obj/.glb` 提交到仓库或打包进离线 HTML。
2. **合法获得高精度头模/发型的正确途径：**
   - DAZ 官方商店购买（上方候选清单），按 Interactive License 要求使用；
   - DAZ 官方每周免费区 / DAZ Freebies（需登录官方账号领取，许可仍以商品页为准）；
   - 你已购买资产的 **Blender 私有导出 GLB**，经由本软件「选本机高精头部 / 选配套头发」导入（只存当前浏览器 IndexedDB，不进仓库）；
   - 本仓库内置的 **MakeHuman CC0 头模 + CC0 发型**（见下表），可放心打包与分发。
3. 如果你已在 DAZ 官方购买角色/头发，告诉 Agent 商品名与代数（G8/G8.1/G9），Agent 会帮你核对导出清单（眼球/睫毛/眉毛/发际线）与 GLB 材质转换步骤，而不是去第三方站点找“免费版”。

## 📦 本仓库内置 CC0 发型目录（可直接用，无需购买）

| 发型 | 来源 | 工坊入口 | 特点 |
|---|---|---|---|
| 波波头 Bob | MakeHuman CC0 `bob02` | 「CC0 亚洲女头 + 波波发」 | 短发包脸轮廓 + 贴颊微发束 |
| 长直发 Long | MakeHuman CC0 `long01` | 「CC0 亚洲女头 + 长发」 | 及腰长发 + 贴颊微发束 |
| 低马尾 Ponytail | MakeHuman CC0 `ponytail01` | 「CC0 亚洲女头 + 低马尾」 | 绑发造型，露出颈部断面 |
| 麻花辫 Braid | MakeHuman CC0 `braid01` | 「CC0 亚洲女头 + 麻花辫」 | 长辫垂背，适合展示后颈 |
| 短发 Short | MakeHuman CC0 `short02` | 「CC0 亚洲女头 + 知性短发」 | 清爽短发，露出完整颈切面 |
| 程序化长直/姬发/低盘发/微卷/波波 | 本项目程序化发壳 | 发型下拉菜单 | 参数化发壳，可调光泽与颈部避让 |

> CC0 发型的原始 `.obj/.mhclo` 见 `assets_src/makehuman/`（含 `LICENSE_NOTE.txt`），构建脚本 `scripts/build_makehuman_head.py` 可复现 `public/models/mh_hair_*.obj`。它们是低面数发片资产，定位是“离线可玩的合法备选”，不是 DAZ 电影级毛发；追求照片级请走上方 DAZ 官方私有导入流程。
