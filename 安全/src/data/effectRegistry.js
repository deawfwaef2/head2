// 安全版 · 画面效果注册表（所有画面效果都在这里声明，不写死在渲染代码里）
// 每一项 = 一个可开关、可调值、可被“连线”的效果节点：
//   id      唯一 ID（也是连线端口名），如 'post.bloom'
//   scope   数据归属：post 后期 / skin 皮肤 / hairline 发际线 / light 布光 / char 角色 / render 渲染设置
//   key     对应状态字段
//   kind    range | toggle
//   off     关闭（旁路）时使用的值 —— 关掉某效果 = 用 off 值替代，原数值保留，重新打开即恢复
// 新增效果：在这里加一行 + 在对应 scope 的应用函数里读取 fx.effective(id) 即可，UI/存档/连线自动生效。
export const EFFECT_GROUPS = {
  skin: '🧴 皮肤质感', hairline: '🌱 发际线与碎发', light: '💡 布光', post: '🎞️ 胶片与后期', lens: '📷 镜头', char: '👁 五官与头发', render: '⚙️ 渲染',
};
const R = (id, group, scope, key, label, min, max, step, off, extra = {}) => ({ id, group, scope, key, label, kind: 'range', min, max, step, off, ...extra });
const T = (id, group, scope, key, label, extra = {}) => ({ id, group, scope, key, label, kind: 'toggle', off: false, ...extra });
export const EFFECT_REGISTRY = [
  // 皮肤
  R('skin.delight', 'skin', 'skin', 'delight', '去烘焙光影（去贴图自带的明暗/脏斑）', 0, 1, 0.01, 0),
  R('skin.scatter', 'skin', 'skin', 'scatter', '次表面散射（通透感）', 0, 2, 0.01, 0),
  R('skin.roughness', 'skin', 'skin', 'roughness', '粗糙度（低=油亮）', 0.3, 0.85, 0.01, 0.55),
  R('skin.normalScale', 'skin', 'skin', 'normalScale', '贴图毛孔', 0, 1.6, 0.01, 0),
  R('skin.normalHP', 'skin', 'skin', 'normalHP', '贴图法线去低频（去脸颊脏斑）', 0, 1, 0.01, 0),
  R('skin.micro', 'skin', 'skin', 'micro', '程序化毛孔（近看更真）', 0, 1.5, 0.01, 0),
  R('skin.breakup', 'skin', 'skin', 'breakup', '高光破碎（去塑料感）', 0, 1.5, 0.01, 0),
  R('skin.sheen', 'skin', 'skin', 'sheen', '面部绒毛柔光', 0, 0.6, 0.01, 0),
  R('skin.dualLobe', 'skin', 'skin', 'dualLobe', '皮脂光泽（第二高光瓣）', 0, 0.4, 0.01, 0),
  R('skin.albedoSaturation', 'skin', 'skin', 'albedoSaturation', '肤色饱和', 0.6, 1.6, 0.01, 1),
  R('skin.mottle', 'skin', 'skin', 'mottle', '肤色斑驳（自然不均）', 0, 1.5, 0.01, 0),
  R('skin.regional', 'skin', 'skin', 'regional', '面部分区（鼻颊红润/眼下/T区/唇润）', 0, 1.5, 0.01, 0),
  R('skin.translucency', 'skin', 'skin', 'translucency', '逆光透光（耳朵鼻翼透红）', 0, 2, 0.01, 0),
  // 发际线
  R('hairline.soft', 'hairline', 'hairline', 'soft', '发际线柔化（皮肤上的细发过渡）', 0, 1.6, 0.01, 0),
  R('hairline.scalpAO', 'hairline', 'hairline', 'scalpAO', '头皮遮蔽（发缝不透亮）', 0, 1, 0.01, 0),
  R('hairline.babyHair', 'hairline', 'hairline', 'babyHair', '碎发密度', 0, 3, 0.05, 0, { heavy: true }),
  R('hairline.babyLength', 'hairline', 'hairline', 'babyLength', '碎发长度', 0.3, 2.5, 0.05, 1, { heavy: true }),
  R('hairline.babyLift', 'hairline', 'hairline', 'babyLift', '碎发蓬松（离开皮肤）', 0, 3, 0.05, 1, { heavy: true }),
  // 布光
  R('light.keyMul', 'light', 'light', 'keyMul', '主光强度', 0.2, 2.5, 0.01, 1),
  R('light.softMul', 'light', 'light', 'softMul', '光源柔和度（柔光箱大小）', 0.3, 2.5, 0.01, 1),
  R('light.azimuth', 'light', 'light', 'azimuth', '主光方位（°）', -150, 150, 1, 0),
  R('light.elevation', 'light', 'light', 'elevation', '主光仰角（°）', -40, 50, 1, 0),
  R('light.kelvin', 'light', 'light', 'kelvin', '主光色温 K（0=预设）', 0, 9000, 50, 0),
  R('light.rimMul', 'light', 'light', 'rimMul', '轮廓光', 0, 3, 0.01, 0),
  R('light.fillMul', 'light', 'light', 'fillMul', '补光', 0, 3, 0.01, 0),
  R('light.envMul', 'light', 'light', 'envMul', '环境反射', 0, 2.5, 0.01, 0),
  R('light.exposureMul', 'light', 'light', 'exposureMul', '曝光', 0.5, 1.8, 0.01, 1),
  R('light.bgMul', 'light', 'light', 'bgMul', '背景亮度', 0, 1.5, 0.01, 0.55),
  R('light.shadowStrength', 'light', 'light', 'shadowStrength', '阴影浓度（真实室内阴影不死黑）', 0, 1, 0.01, 0),
  R('light.shadowSoft', 'light', 'light', 'shadowSoft', '阴影柔和度', 0.3, 3, 0.01, 1),
  R('light.goboScale', 'light', 'light', 'goboScale', '光斑尺寸', 0.5, 2, 0.01, 1),
  R('light.goboSoft', 'light', 'light', 'goboSoft', '光斑边缘柔和', 0, 1, 0.01, 0.5),
  // 后期
  R('post.contrast', 'post', 'post', 'contrast', '对比度', 0.7, 1.4, 0.01, 1),
  R('post.saturation', 'post', 'post', 'saturation', '饱和度', 0, 1.6, 0.01, 1),
  R('post.warmth', 'post', 'post', 'warmth', '冷暖', -1.5, 1.5, 0.01, 0),
  R('post.tint', 'post', 'post', 'tint', '品红 / 绿', -1, 1, 0.01, 0),
  R('post.lift', 'post', 'post', 'lift', '黑位提升', 0, 0.12, 0.001, 0),
  R('post.fade', 'post', 'post', 'fade', '褪色', 0, 0.4, 0.01, 0),
  R('post.toe', 'post', 'post', 'toe', '胶片趾部（暗部）', 0, 1, 0.01, 0),
  R('post.shoulder', 'post', 'post', 'shoulder', '胶片肩部（高光）', 0, 1, 0.01, 0),
  R('post.splitAmount', 'post', 'post', 'splitAmount', '色调分离', 0, 0.6, 0.01, 0),
  R('post.halation', 'post', 'post', 'halation', '晕光 Halation', 0, 1, 0.01, 0),
  R('post.diffusion', 'post', 'post', 'diffusion', '柔焦 Pro-Mist', 0, 1, 0.01, 0),
  R('post.bloom', 'post', 'post', 'bloom', '辉光', 0, 0.8, 0.01, 0),
  R('post.grain', 'post', 'post', 'grain', '颗粒', 0, 0.12, 0.001, 0),
  R('post.grainSize', 'post', 'post', 'grainSize', '颗粒大小', 1, 3, 0.1, 1),
  R('post.vignette', 'post', 'post', 'vignette', '暗角', 0, 1, 0.01, 0),
  R('post.chroma', 'post', 'post', 'chroma', '镜头色差', 0, 0.006, 0.0001, 0),
  R('post.sharpen', 'post', 'post', 'sharpen', '微对比锐化', 0, 1.2, 0.01, 0),
  R('post.bw', 'post', 'post', 'bw', '黑白', 0, 1, 0.01, 0),
  // 镜头
  T('post.ao', 'lens', 'post', 'ao', '环境光遮蔽 GTAO（接触阴影）'),
  R('post.aoIntensity', 'lens', 'post', 'aoIntensity', 'AO 强度', 0, 1.5, 0.01, 0),
  T('post.dof', 'lens', 'post', 'dof', '景深虚化（对焦面部）'),
  R('post.aperture', 'lens', 'post', 'aperture', '光圈（越大越虚）', 0.0002, 0.008, 0.0001, 0.0002),
  T('post.autoFocus', 'lens', 'post', 'autoFocus', '自动对焦到眼睛'),
  R('post.focus', 'lens', 'post', 'focus', '手动对焦距离', 0.4, 2.2, 0.01, 1.05),
  // 角色材质
  R('char.eyeOcc', 'char', 'char', 'eyeOcc', '眼部遮蔽（眼睑软阴影）', 0, 1.2, 0.01, 0),
  T('char.lashStrands', 'char', 'char', 'lashStrands', '程序化真实睫毛（替换旧贴片）'),
  R('char.lashDensity', 'char', 'char', 'lashDensity', '睫毛浓密度', 0, 2, 0.01, 0),
  R('char.lashLower', 'char', 'char', 'lashLower', '下睫毛强度', 0, 1, 0.01, 0),
  R('char.lashDark', 'char', 'char', 'lashDark', '睫毛深浅（棕→黑）', 0, 1, 0.01, 0),
  R('char.lashLine', 'char', 'char', 'lashLine', '睫毛根线（天然眼线）', 0, 1.5, 0.01, 0),
  T('char.browStrands', 'char', 'char', 'browStrands', '程序化真实眉毛（根根分明）'),
  R('char.browDensity', 'char', 'char', 'browDensity', '眉丝浓密度', 0, 2, 0.01, 0),
  R('char.browBase', 'char', 'char', 'browBase', '眉毛底色（原贴图）', 0, 1, 0.01, 0),
  R('char.hairShine', 'char', 'char', 'hairShine', '发丝光泽（R/TRT 高光）', 0, 2.5, 0.01, 0),
  R('char.hairBack', 'char', 'char', 'hairBack', '发丝逆光透射（TT）', 0, 3, 0.01, 0),
  // 渲染
  T('render.hairShadow', 'render', 'render', 'hairShadow', '头发投影到脸上（关掉可去脸上脏斑）'),
  T('render.blink', 'render', 'render', 'blink', '自然眨眼'),
  T('render.accum', 'render', 'render', 'accum', '静止多帧精修'),
  T('render.hairLOD', 'render', 'render', 'hairLOD', '拖动时头发降级'),
];
