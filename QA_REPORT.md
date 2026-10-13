# 发型修复版验收记录 · 2026-10-13

对应代码：Stage 11c（238cc71）。原始结果见 `QA_RESULTS.json`。

## 验证方式与范围

- 使用离线 `file://` 根目录 HTML，Chromium 无头浏览器 + SwiftShader 软件 WebGL。
- 为减少沙箱软件渲染开销，验收脚本限制了 requestAnimationFrame 频率；未修改交付 HTML 的正常动画频率。
- 测试脚本和浏览器只在临时目录，不打进离线 HTML 或仓库。
- **未验证 Windows/macOS Electron GUI、桌面穿透、多屏、系统托盘、目标 GPU 的帧率。**

## 已通过

| 项目 | 结果 |
| --- | --- |
| 模型尚在加载时点击开始 | 按钮已响应，启动层隐藏；加载状态可见 |
| 初始化 | 3 只默认桌宠加载完成，加载提示移除 |
| 8 款内置发型逐一加载/渲染 | 全部可解析、装配；纹理 flipY=false，AlphaTest=.14，生成图1024px |
| 发片法线 | 所有 8 款运行期法线有效、归一化；长发修复826个无效法线，两个bob样例各修复1个 |
| 黑色球壳 | 全部发型不存在旧 ScalpCap；无发模式不残留 |
| 光泽滑杆 | 直接更改材质，头模型 UUID 不变 |
| 旧异步结果覆盖新选择 | 并发切长发/无发，最终保留最新无发请求 |
| 鼠标悬停 | 射线命中桌宠，档案卡显示 |
| 鼠标单击 | 开启旋转；再次单击关闭 |
| 鼠标滚轮 | 实际改变深度 Z |
| 鼠标拖动 | 实际改变 X 位置 |
| 档案下载 | 下载ZIP成功，包含 manifest.json / dossier.md，CRC校验通过 |
| 私有GLB导入 | 使用仓库示例GLB作为测试输入；存入IndexedDB，原Skin材质和normalMap保留，原roughness=.44未覆盖，内置发型关闭 |
| 注册与重载 | 测试藏品注册、召唤后，重载仍能恢复参数和本机私有GLB并再次召唤 |
| 双发布HTML | 根目录文件与 docs/index.html 逐字节一致 |

## 不能忽略的限制

1. 第一轮连续渲染8发型时，沙箱出现过 `VALIDATE_STATUS false`、空编译日志的 WebGLProgram 错误。重复同一流程并添加 shader 诊断后未复现，随后鼠标交互、私人导入/重载无页面异常。**原因未完全确定，不能把一次重复成功当成所有GPU零故障保证。** 若用户真机复现，请记录浏览器/显卡/控制台信息继续排查。
2. 发型近景仍能看见原资产的片状造型、轮廓锯齿和层次局限。源发丝图256px，1024px增强不是新的高精扫描。没有宣称已达到照片级或“大师级”。
3. 当前只是修复图集对位、错误球壳、颅顶压缩和无效法线；更好的毛发结构仍需要高质量、许可明确的发型资产与正确烘焙。
4. 私人模型和浏览器档案不是完整跨电脑备份；ZIP不含GLB本体。系统桌宠仍需Electron，未提供一键安装包。
5. 内置资产上游授权仍待核验；本轮没有获取或分发商业DAZ原件。解剖盖为艺术示意。

## Stage 13 (2026-10-13) 渲染升级包 QA
- 构建：vite 6 生产构建通过；`node scripts/build_standalone_html.mjs` 跑通；根目录 `点击开始游戏_CERVIX3D.html` 17.76MB，与 `docs/index.html` byte-for-byte 一致；包内无外部脚本引用。
- 指纹：renderTarget1 / _outputColorSpace / separableBlurMaterials / uVignette / uSaturation / setBeautyPostEnabled / BokehDustAtmosphere / StudioBackdropGlow / chk-beauty-post / chk-atmosphere / setAtmosphereEnabled 全命中。
- 语法：新增与改动的 7 个 JS 文件 `node --check` 全过。
- 未做：浏览器 file:// 实机渲染验证（本轮沙箱无浏览器二进制）——需用户在 Chrome/Edge 双击验证辉光/尘埃/背幕效果并回传截图。
