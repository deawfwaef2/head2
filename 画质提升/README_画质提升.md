# 画质提升（独立写实渲染模块 · 未接入主项目）

> Stage 48。本文件夹**不连接主项目**，作为以后干净分支沿用的渲染方案（同样是 three.js 0.170 + GLB 头模 + 后处理链）。

## 怎么打开
- 双击 `点击打开_画质提升演示.html`（约 12 MB，离线 file:// 可用，资源全部内嵌）。
- 右侧面板：**画质提升 开/关对比**、镜头、4 种布光、肤质、眉形、6 款发型、发色、散射/粗糙度/毛孔/曝光/颗粒/暗角/锐化滑杆、截图。
- **导入高精头模测试**：可多选 `.glb/.obj` + 颜色贴图 + 法线贴图（文件名含 col/albedo/diffuse 与 normal/nrm），用来检验渲染管线在好素材上的上限。

## 模块（`src/`）
| 文件 | 作用 | 接入方式 |
|---|---|---|
| `studioLighting.js` | 仅用于 PMREM 烘焙的虚拟摄影棚（柔光箱/反光板/轮廓灯条）→ IBL；VSM 柔和阴影主光；`softbox / window / rembrandt / overcast` 四种布光 | `createStudioRig(scene, renderer, 'softbox')` |
| `skinMaterial.js` | 预积分次表面散射（分通道包裹 + 曲率自适应）、分通道法线、双高光瓣、绒毛 sheen、反照率全局调色 | `mesh.material = upgradeSkinMaterial(oldMat)` |
| `featureMaterials.js` | 角膜反射眼神光、巩膜去纯白、眉毛 alpha 羽化、Kajiya-Kay 双高光头发（3D 流场切线 + 体积法线 + 内层变暗，两遍渲染） | `upgradeEyeMaterial / upgradeBrowMaterial / buildHairMaterials` |
| `postChain.js` | MSAA 半浮点 HDR → GTAO 接触阴影 → 轻辉光 → 色调映射 → 色差/暗角/颗粒/微对比锐化/调色 | `createPostChain(renderer, scene, camera).render(t)` |
| `displayStand.js` | 中性颈托底座（遮住颈部末端） | 可选 |

默认色调映射为 **Khronos PBR Neutral**（实测比 AgX 不发灰、比 ACES 肤色更准；URL 可加 `?tm=aces|agx|neutral` 对比）。
所有改进都在着色/光学层面：**没有手动捏脸、没有手绘五官/腮红贴图、没有场景内的假光束平面**（遵守根目录 HANDOFF 红线）。

## 自检结果（`qa/screens/`，Playwright + SwiftShader 实际渲染）
1. `01` → `02/03`：内置头模，原始渲染 vs 画质提升。肤色更自然、有方向光和投影、眼睛有柔光箱眼神光、头发不再是银灰色塑料条纹。
2. `04` → `05`：用 three.js 示例里的真实 3D 扫描头模（Lee Perry-Smith，Infinite Realities 制作，CC BY 3.0，仅用于测试截图，没有放进仓库）验证同一套管线。好素材下效果明显接近照片。

## 诚实结论：离参考图还差多少、差在哪
- 内置头模用了新管线后进步明显，但**离参考照片级真实感仍然很远**。主要卡在素材上，靠着色器补不回来：
  - `HeadSkin` 只有 4,494 个顶点（扫描头一般有几万到几十万个），轮廓和五官体积都不够；
  - 肤质贴图只有 1024，而且面部区域模糊，没有真实毛孔和色斑信息；鼻侧有一条贴图亮痕；
  - 眉毛贴图是实心填充（`eyebrow010` 稍好，已设为默认）；
  - 所有发型共用同一张合成发片贴图，发片大而平，所以看起来还是“纸片头发”。
- 想达到参考图的效果，**必须换上高精素材**，渲染管线已经准备好，可以直接接收：
  - Ten24 / 3D Scan Store 的免费女性扫描头（8K 贴图，**仅限非商业/私人使用，不能上传到公开仓库**）；
  - 你自己拥有授权的 Daz Genesis 8/9 头部（导出 GLB/OBJ + 4K 贴图）；
  - 发丝方面：曲线发丝（Blender 粒子毛发转发片或 strand 网格）配高质量发片贴图。
- 导入后先用面板里的「导入高精头模测试」看效果，再在干净分支里接入。

## 构建 / 自检
```bash
npm i --no-save three@0.170.0 esbuild playwright@1.48 && npx playwright install chromium
node 画质提升/build.mjs
node 画质提升/qa/qa_render.mjs /tmp/out "view=front" "mode=before&view=front"
IMPORT=head.glb,albedo.jpg,normal.jpg node 画质提升/qa/qa_render.mjs /tmp/out "view=threequarter"
```


---

## 头发 · 真发丝（Stage 49 新增）

- 面板「头发渲染」可选：**真发丝（发片→发丝转换，默认）** 或 **原版发片（对比用）**。「发丝密度」可选：流畅约 1.2 万根、标准约 3 万根、高精约 6 万根、极致约 10 万根。另有「发丝光泽」「逆光透射」两个滑杆。
- URL 参数：`?hairmode=strand|card&density=low|mid|high|ultra`。
- 新增发型：`hair_ponytail01`（低马尾 + 编发）。
- 方法、与主项目的区别、坑与注意事项：见 **`HAIR_发丝方法说明.md`**。
- 自检截图：`qa/screens_hair/`。
