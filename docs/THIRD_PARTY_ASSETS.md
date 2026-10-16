# 外部素材与许可（Stage 74）

## Poly Haven · Round Spectacles

- 资产：`public/models/polyhaven_round_spectacles.glb`（由官方 1K glTF、BIN 和三张 1K JPEG 纹理打包而成）。
- 原作者：**Sean Buckley**；官方素材页：https://polyhaven.com/a/round_spectacles 。
- 许可：**CC0 1.0 Universal**；以 Poly Haven 官方素材页及 https://polyhaven.com/license 为准。允许重用与再分发；这里注明来源以便追溯。
- 下载 API：https://api.polyhaven.com/files/round_spectacles ；分发源域名：`dl.polyhaven.org`。复现：`python3 scripts/pack_polyhaven_spectacles.py`；脚本逐个验证 API 的 MD5，然后打包独立 GLB（MD5 是发布方文件一致性检查，不是加密签名）。
- 已验证的打包文件 SHA-256：`ba6338b11581331524c5280bdd4cb679c58f0f84b8df13215178cd2034dc2684`，2,067,620 字节、约 11,810 三角面。
- 这是商品级材质的**一款可选圆形金属眼镜资产**，不是用户照片中眼镜的原件，也不是头部资产；镜片在本项目中改为低透明度绘制以免透射渲染在低端显卡上昂贵。模型的版权许可不等同于对具体用户照片肖像的授权。

## 头模与发型

项目原有内置示例头模/发型不会因新眼镜的 CC0 许可而自动变成 CC0。网上看见免费的高精人头，并不意味着允许重新分发或有用户本人肖像的可用版权；不能把他人照片、授权不明的扫描头模直接打包进公开仓库。当前工坊允许用户私下导入其拥有权利的 GLB/OBJ 及贴图；是否能接近真人应以实际三维多角度素材与目视复核为准。
