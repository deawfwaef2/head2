# 高精东亚女性头部与发型：合法选材及导入指南

更新时间：2026-10-12。以下是**官方商品候选**，不是本仓库已经下载或拥有的模型。购买前逐件检查 Genesis 代数、依赖、是否支持 Interactive License 和现行 EULA；网页价格、许可与库存随时变化。

## 官方角色 / 头型

| 商品 | 优点 | 重要限制 |
| --- | --- | --- |
| [Kei HD for Genesis 9](https://www.daz3d.com/kei-hd-for-genesis-9) | G9 亚洲女性角色，2 款头型，HD 细节、PBR 材质、4K/8K 纹理与 Fibermesh 眉毛。 | 官方文件为 `.DUF`，不是可直接导入的 GLB；商品里的 anatomical elements hair **不是头顶完整发型**。 |
| [JS Genji for Genesis 9 Feminine](https://www.daz3d.com/js-genji-for-genesis-9-feminine) | 另一款 G9 骨相候选，适合比较颅面宽度与眼鼻比例。 | 需配 Genesis 9 Essentials；肤质、形变与发型仍要配套核对。 |
| [Kimiyo Asian Beauty: Heads & Bodies for Genesis 9 Feminine](https://www.daz3d.com/kimiyo-asian-beauty-heads--bodies-for-genesis-9-feminine) | 多个东亚风格头型 morph，适合以照片作为前/侧面参考做手动混形。 | **Morph-only**：不是独立头模，不含完整皮肤和发型。 |

## 官方发型

| 商品 | 导出适用性 |
| --- | --- |
| [Xiu Lin Hair for Genesis 9](https://www.daz3d.com/xiu-lin-hair-for-genesis-9) | 官方称为 polygonal 长马尾，带发际线、造型与运动 morph；相对易于导出实时网格，但需调整材质与透明贴图。 |
| [Everyday Spring Style Hair for Genesis 8 and 9](https://www.daz3d.com/everyday-spring-style-hair-for-genesis-8-and-9) | 比较造型体积和刘海的候选；检查产品页当前依赖与导出后的面数。 |
| [dForce Strand-Based Beauty Style Long Hair](https://www.daz3d.com/dforce-strand-based-beauty-style-long-hair-for-genesis-9-and-genesis-8-female) | 静帧细节候选，但 DAZ/Iray strand curves 和 OmniHair **不是 glTF 原生格式**；实时导出前需转换为发片/几何并烘焙。 |

官方 [Interactive License 说明](https://www.daz3d.com/interactive-license-info) 与 [EULA](https://www.daz3d.com/eula)。**不能把购买的商业原始网格、纹理或发型直接加入公开仓库、离线 HTML、或对其他玩家分发**；具体使用/分发权限以该商品的许可为准。若只是本机私有用途，也应自行核查条款。不要从搬运/盗版站下载商品。

## 从照片到只有头的 GLB（建议可复现工作流）

1. **收集参考**：一张正面、一张三分之四侧面照片；在 Blender/DAZ 校准同焦距、眼距、鼻翼宽度、下颌与颅顶高度。单张照片无法唯一确定头部深度与耳后发型，软件不会自动做到“99% 相似”。
2. **在 DAZ Studio 装配**：以合法取得的 Genesis 角色、皮肤、眼球、睫毛、眉毛与同代数发型组成完整场景；保存 `.DUF` 原工程。对照参考照，先改整体骨相，再改五官和发际线。
3. **在 Blender 处理头部**：经与你的资产版本兼容的授权导出/桥接流程转入。保留头皮、眼睛、眉睫和发型，去掉肩胸；在目标颈高做真正的 Mesh 裁切，整理闭合颈环，手工封口并检查法线/UV。要做解剖收藏品，另建颈部解剖盖并和颈环真实焊接；本软件无法对任意新网格自动布尔封口。
4. **实时材质**：将 DAZ Iray 专有 shader 转换/烘焙为 glTF PBR；最好一份 GLB 内嵌皮肤颜色/粗糙度/法线、眼球、眉睫 alpha、发卡 alpha（检查 `alphaMode` 与背面）。发型要与头模共享原点、比例和坐标；目前本软件外部导入只有**一个头部 GLB**入口，最稳妥的是把头与发一起导出到**同一个 GLB**，选择「无发」避免重复叠上内置发模。
5. **在工坊导入验收**：只选择 `.glb`，观察正面、45°、侧面、顶部、仰视、后脑；检查发际线缝隙、睫毛透明、眼球材质、颈底封口，必要时返回 Blender 修改。若模型在别的坐标/单位制下太大或太小，先在 Blender 应用 Transform 再导出。
6. **保存与备份**：注册藏品后参数与档案存当前浏览器 localStorage，用户 GLB 文件存当前浏览器 IndexedDB；档案页下载的 ZIP **只含 manifest + dossier，不含私有 GLB**。换浏览器、清除浏览器数据或更换电脑后请拿原始 `.GLB/.BLEND/.DUF` 重新导入。不要把私人原件上传公开 GitHub。

## 当前项目的真实边界

内置 `daz_asian_head_base.glb` 是项目示例文件名，**不是 DAZ Genesis 商品原件**。仓库里对应生成脚本引用旧环境 `/tmp/dl_inspect/base_body.glb`，上游授权文件和可核验来源尚未随仓库提供；在核查来源及再分发许可前，不应声称这些示例可用于公开商业分发。高品质 DAZ 发丝、真实单照复原、任意外部模型的拓扑封口仍是未完成项目，不要将“可导入 GLB”混同于已完成上述能力。

## 2026-10-13：头发的可复现质量验收

### 造型与几何

- 在 Blender 原工程保留“参考头 / 头皮根层 / 主发束 / 过渡碎束 / 飞发”分组。头皮根层应从实际头皮曲面取得，向外留极小余量；不能用整个长发的包围盒生成球壳。
- 先匹配分缝、刘海形状、颅顶与太阳穴体积，再做细丝。只加高光或放大贴图不能修复错误发型。
- 发束贴合颅骨但不穿过脸、耳、颈。切面周围需要保留空间时，手工调整束流或真实裁短，不要把整片长发压缩到同一高度。
- 发片细分沿弯曲方向分配，不能让长曲束仅由两三个平面折出来。检查重复面、非流形边、零面积面和零长度法线；正反发片不得互相抵消法线。

### 烘焙与导出

- 从原始高分素材制作有清晰边缘的发缕 Alpha；发根较密，轮廓和发梢更稀疏。颜色、Alpha、微法线和粗糙度必须使用同一 UV 图集对位。
- 对正常 glTF PBR，base-color 是 sRGB；roughness / normal / AO 等是数据图。不要把强白色摄影高光烘焙进 base-color 后再叠加很强的实时镜面。
- Blender curves / DAZ strand-based hair 需要转换为导出格式支持的几何或经过烘焙的发片；它们不是直接改文件后缀就能变为 GLB。极细的独立几何发丝会显著增加面数和显存，要以实际桌宠大小验收性能。
- 使用已匹配的头和发一起导出，应用变换、内嵌图集，保持原 PBR。先在其他 glTF 查看器确认，再在本程序中选择“无内置发”，避免重复叠加。

### 六视角验收表

| 视角 / 条件 | 应检查的问题 |
| --- | --- |
| 正面、45° | 刘海透明空洞、侧发穿脸、发际线悬空、粗三角高光 |
| 左右侧面 | 额头到颅顶弧线、耳周穿插、发片折线、鬓角厚纸板 |
| 头顶、后脑 | 根层是否贴合真实头皮、分缝方向、错误球壳、法线突变 |
| 黑背景、白背景 | Alpha 光晕、边缘锯齿、图集倒置、排序遮挡 |
| 桌宠实际尺寸 | 细丝是否闪烁、束流能否辨认、远景是否糊成灰块 |
| 滚轮、旋转、拖动 | 高光是否随真实灯光变化、是否穿模、帧率是否可接受 |

本轮默认发型已恢复被压缩的颅顶，材质图继承 glTF UV/采样设置，原 Alpha 不被硬化；移除了错误球壳与固定方向白色发光高光。**现有源资产仍限制近景质量，这些修复不能代替更好的模型与源贴图。**


## Stage 12 原生Groom补充

本轮新曲线没有引入或公开商业DAZ素材。内置头/照片授权仍待核验。新Groom专为项目参考头匹配，不自动适配任意DAZ头；自备高精度头发GLB的PBR导入分支保留。原生Hair Curves编辑与导回流程见`BLENDER_GROOM_GUIDE.md`，Blender材质不会无损搬运到WebGL。
