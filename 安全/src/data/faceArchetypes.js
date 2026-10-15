// 安全版 · 骨相/脸型预设（对应主项目 FACE_ARCHETYPE_CATALOG；全部为虚构风格描述，不关联任何真人）
// recipe = eastAsianHeadTargets.js 里 EAST_ASIAN_ARCHETYPE_MPFB_RECIPES 的键
export const FACE_ARCHETYPES = [
  { id: 'none', label: '原始底模（不叠加）', region: '' },
  { id: 'cn_oval_scholar', label: '书卷鹅蛋脸', region: 'cn' },
  { id: 'cn_round_babyface', label: '幼态圆润脸', region: 'cn' },
  { id: 'cn_classical_melon', label: '古典瓜子脸', region: 'cn' },
  { id: 'cn_cold_royal', label: '清冷高智脸', region: 'cn' },
  { id: 'cn_pure_campus_bell', label: '清纯校园脸', region: 'cn' },
  { id: 'cn_tang_peony', label: '端庄大气脸', region: 'cn' },
  { id: 'cn_northern_danfeng', label: '古典丹凤眼', region: 'cn' },
  { id: 'cn_cat_fox_siren', label: '狐系清冷脸', region: 'cn' },
  { id: 'cn_wide_catfish_chic', label: '宽眼距高级脸', region: 'cn' },
  { id: 'cn_imperial_square', label: '英气端方脸', region: 'cn' },
  { id: 'cn_puppy_innocent', label: '小狗下垂眼', region: 'cn' },
  { id: 'cn_jiangnan_water_lily', label: '江南清瘦脸', region: 'cn' },
  { id: 'cn_sichuan_doll_peach', label: '灵动蜜桃脸', region: 'cn' },
  { id: 'cn_dunhuang_apsara_noble', label: '盛唐浓颜脸', region: 'cn' },
  { id: 'kr_idol_vline', label: '韩系 V 脸', region: 'kr' },
  { id: 'kr_sweet_heart', label: '韩系心形脸', region: 'kr' },
  { id: 'kr_waterglow_idol', label: '水光画报脸', region: 'kr' },
  { id: 'kr_chaebol_heiress', label: '优雅鹅蛋脸', region: 'kr' },
  { id: 'kr_cat_idol_ace', label: '猫系脸', region: 'kr' },
  { id: 'kr_quail_egg_pure', label: '零棱角流畅脸', region: 'kr' },
  { id: 'kr_mellow_spoon_chic', label: '淡颜单眼皮脸', region: 'kr' },
  { id: 'kr_bunny_firstlove', label: '元气兔系脸', region: 'kr' },
  { id: 'jp_yamato_clear', label: '透明感少女脸', region: 'jp' },
  { id: 'jp_showa_cinema_muse', label: '昭和银幕鹅蛋脸', region: 'jp' },
  { id: 'jp_tokyo_sweet_pear', label: '甜美微梨形脸', region: 'jp' },
  { id: 'jp_kyoto_noble_slender', label: '狭长古典脸', region: 'jp' },
  { id: 'jp_harajuku_fairy_triangle', label: '精灵倒三角脸', region: 'jp' },
  { id: 'jp_idol_round_dimple', label: '酒窝小圆脸', region: 'jp' },
  { id: 'jp_cool_model_Clean', label: '盐系超模脸', region: 'jp' },
  { id: 'jp_forest_mori_soft', label: '氧气森女脸', region: 'jp' },
  { id: 'eurasian_sculpted_mix', label: '轻混血深邃脸', region: 'mix' },
  { id: 'hk_90s_glamour_queen', label: '90 年代明艳脸', region: 'mix' },
  { id: 'tw_campus_sweet_oxygen', label: '文艺甜润脸', region: 'mix' },
  { id: 'cyber_cg_angel_v', label: '黄金比例 V 脸', region: 'mix' },
  { id: 'asia_high_fashion_runway', label: 'T 台钻石脸', region: 'mix' },
  { id: 'asia_sweet_cool_bambi', label: '甜酷小鹿脸', region: 'mix' },
  { id: 'asia_pear_gentle_sister', label: '温婉微方圆脸', region: 'mix' },
  { id: 'asia_noble_swan_oval', label: '修长名媛鹅蛋脸', region: 'mix' },
];
export const FACE_REGIONS = { cn: '中式', kr: '韩系', jp: '日系', mix: '港台/混血' };
// 眼型细调（与主项目 applyMpfbEastAsianTargetsToGroup 的映射一致）
export const EYE_SLIDERS = [
  ['epicanthus', '内眼角（蒙古褶 ↔ 开眼角）'], ['crease', '眼皮（单眼皮 ↔ 平行双）'], ['height', '眼睛开合（细长 ↔ 圆）'],
  ['spacing', '眼距（窄 ↔ 宽）'], ['bag', '卧蚕'],
];
export function eyeSliderWeights(e = {}) {
  const w = {}; const add = (k, v) => { if (Math.abs(v) > 1e-4) w[k] = (w[k] || 0) + v; };
  const ep = e.epicanthus || 0, cr = e.crease || 0, he = e.height || 0, sp = e.spacing || 0, bag = Math.max(0, e.bag || 0);
  if (ep > 0) { add('eye_epicanthus_in', ep * 0.85); add('eye_outer_corner_down', ep * 0.45); } else if (ep < 0) { add('eye_epicanthus_out', -ep * 0.85); add('eye_outer_corner_down', -ep * 0.35); }
  if (cr < 0) { add('eye_eyefold_down', -cr * 0.35); add('eye_eyefold_convex', -cr * 0.65); add('eye_depth_shallow', -cr * 0.28); } else if (cr > 0) { add('eye_eyefold_up', cr * 0.72); add('eye_eyefold_concave', cr * 0.65); }
  if (he > 0) { add('eye_height_mid_incr', he * 0.42); add('eye_height_outer_incr', he * 0.32); } else if (he < 0) { add('eye_height_mid_decr', -he * 0.45); add('eye_height_outer_decr', -he * 0.35); }
  if (sp > 0) add('eye_spacing_wide', sp * 0.55); else if (sp < 0) add('eye_spacing_narrow', -sp * 0.55);
  if (bag > 0) { add('eye_bag_incr', bag * 0.75); add('eye_bag_height_incr', bag * 0.55); }
  return w;
}
