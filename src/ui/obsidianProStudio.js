// ============================================================================
// STAGE 63 · OBSIDIAN PRO UI & UNIFIED CHARACTER / HAIR DESIGN STUDIO
// - Minimalist Floating Capsule Dock (#desktop-overlay-bar)
// - Unified Visual Card + Compact Slider Studio (#obsidian-char-hair-studio)
// - 100% Exact Catalog IDs & Two-Way Sync with Desktop 3D Specimens + Studio 3D
// ============================================================================

import { REAL_HAIR_CATALOG, FACE_ARCHETYPE_CATALOG, HEAD_BLEND_CHANNELS } from '../data/defaultCollectibles.js';
import { DESKTOP_PET_BLUR_MODES, DESKTOP_PET_FILTER_PRESETS } from '../three/beautyPostChain.js';
import { BACKGROUNDS_LIST } from '../three/masterQuality/backgrounds.js';

const NEW_32_HAIR_IDS = new Set([
  'daz_hair_o4saken_long',
  'daz_hair_blunt_bob_bangs',
  'daz_hair_inverted_bob_bangs',
  'daz_hair_french_braid_bun',
  'daz_hair_double_braid',
  'daz_hair_unkempt_french_braid',
  'daz_hair_rehman_bun',
  'daz_hair_island_princess',
  'daz_hair_ashley_wave',
  'daz_hair_bow_bun_braids',
  'preset_sakura_pink_hime_bob',
  'preset_wolf_mullet_cool',
  'preset_FirstLove_air_bob',
  'preset_hime_cut_long',
  'preset_chaebol_sleek_long',
  'preset_gentle_sister_clavicle',
  'preset_ocean_blue_hime_long',
  'preset_hk_retro_glam_wave',
  'preset_ice_queen_silver_wave',
  'preset_burgundy_siren_wave',
  'preset_guofeng_twin_buns',
  'preset_french_lazy_chignon',
  'preset_song_aesthetic_updo',
  'preset_ballet_core_ribbons',
  'preset_clean_fit_sleek_bun',
  'preset_imperial_crown_braid_hime',
  'preset_jk_twin_ponytail',
  'preset_kpop_curtain_ponytail',
  'preset_republic_student_braids',
  'preset_mori_girl_unkempt_braid',
  'preset_sweet_milk_tea_halfup',
  'preset_cyber_hologram_twin',
]);

const HAIRSTYLE_CARDS = [
  // I. 短发波波 (12款)
  { id: 'hair_bob01', name: '空气刘海短波波', cat: 'bob', tag: '5,116面', svg: 'bob_air' },
  { id: 'hair_user_photo', name: '清透斜碎波波', cat: 'bob', tag: '方尧平同款', svg: 'bob_side' },
  { id: 'hair_bob02', name: '中分内扣A字波波', cat: 'bob', tag: '修饰下颌', svg: 'bob_center' },
  { id: 'hair_short02', name: '中式清纯学生短发', cat: 'bob', tag: '多层次', svg: 'bob_wave' },
  { id: 'daz_hair_asym_short', name: '法式复古齐眉波波', cat: 'bob', tag: '齐颌复古', svg: 'bob_air' },
  { id: 'daz_hair_pixie_chic', name: '智感露耳精灵短发', cat: 'bob', tag: '清爽露耳', svg: 'pixie' },
  { id: 'daz_hair_blunt_bob_bangs', name: '日系漫画齐眉学生波波', cat: 'bob', tag: '4,976面', svg: 'bob_air' },
  { id: 'daz_hair_inverted_bob_bangs', name: '韩系A字前长后短波波', cat: 'bob', tag: '4,996面', svg: 'bob_center' },
  { id: 'preset_sakura_pink_hime_bob', name: '涩谷樱粉公主切波波', cat: 'bob', tag: '地雷系尾染', svg: 'hime' },
  { id: 'preset_wolf_mullet_cool', name: '日杂少年感挂耳狼尾', cat: 'bob', tag: '清冷碎发', svg: 'clavicle' },
  { id: 'preset_FirstLove_air_bob', name: '韩系初恋挂耳内扣短发', cat: 'bob', tag: '空气碎刘海', svg: 'bob_air' },

  // II. 直发长发与锁骨发 (13款)
  { id: 'daz_hair_air_bangs_long', name: '空气刘海披肩中发', cat: 'straight', tag: '状元同款', svg: 'clavicle' },
  { id: 'hair_long01', name: '高颅顶八字黑长直', cat: 'straight', tag: '柔顺丝缎', svg: 'long_center' },
  { id: 'daz_hair_hime', name: '国风姬发式公主切', cat: 'straight', tag: '齐腮阶梯', svg: 'hime' },
  { id: 'hair_short04', name: '都市柔顺锁骨发', cat: 'straight', tag: '齐眉轻熟', svg: 'clavicle' },
  { id: 'daz_hair_side_long', name: '知性大偏分长直发', cat: 'straight', tag: '御姐气场', svg: 'long_straight' },
  { id: 'daz_hair_wolf_clavicle', name: '日杂碎发层次锁骨', cat: 'straight', tag: '轻盈羽化', svg: 'clavicle' },
  { id: 'daz_hair_o4saken_long', name: '东方垂顺及胸黑长直', cat: 'straight', tag: '13,268面', svg: 'long_straight' },
  { id: 'preset_hime_cut_long', name: '京都齐腮一刀切姬发', cat: 'straight', tag: '正统公主切', svg: 'hime' },
  { id: 'preset_chaebol_sleek_long', name: '财阀露额挽耳黑长直', cat: 'straight', tag: '高定露双耳', svg: 'long_center' },
  { id: 'preset_gentle_sister_clavicle', name: '冷茶棕三七斜分锁骨发', cat: 'straight', tag: '温柔学姐', svg: 'clavicle' },
  { id: 'preset_ocean_blue_hime_long', name: '星空蓝挑染姬发黑长直', cat: 'straight', tag: '二次元歌姬', svg: 'hime' },

  // III. 浪漫卷发与大波浪 (11款)
  { id: 'daz_hair_curtain_wave', name: '港风八字大波浪', cat: 'wave', tag: '高颅蓬松', svg: 'wave_big' },
  { id: 'daz_hair_hazel_wave', name: '千金中分浪漫卷发', cat: 'wave', tag: '温柔披肩', svg: 'wave_side' },
  { id: 'daz_hair_wavy_bob', name: '复古名伶偏分短卷', cat: 'wave', tag: '名伶波浪', svg: 'bob_wave' },
  { id: 'daz_hair_glam_wave', name: '超模大背头女神卷', cat: 'wave', tag: '丰盈气场', svg: 'wave_cloud' },
  { id: 'daz_hair_mermaid_curl', name: '法式丰盈人鱼卷发', cat: 'wave', tag: '羊毛长卷', svg: 'wave_water' },
  { id: 'daz_hair_french_lazy_roll', name: '慵懒法式内扣卷波', cat: 'wave', tag: '螺旋微卷', svg: 'bob_wave' },
  { id: 'daz_hair_island_princess', name: '法式名媛内扣卷曲短发', cat: 'wave', tag: '2,980面', svg: 'bob_wave' },
  { id: 'daz_hair_ashley_wave', name: '韩系S型水波纹长卷发', cat: 'wave', tag: '8,467面', svg: 'wave_big' },
  { id: 'preset_hk_retro_glam_wave', name: '90港风大偏分大波浪', cat: 'wave', tag: '红毯明艳', svg: 'wave_big' },
  { id: 'preset_ice_queen_silver_wave', name: '极光银灰挑染人鱼卷', cat: 'wave', tag: '清冷神女', svg: 'wave_water' },
  { id: 'preset_burgundy_siren_wave', name: '波尔多酒红八字女神卷', cat: 'wave', tag: '冷白显白', svg: 'wave_side' },

  // IV. 新中式古典盘发与发髻 (13款)
  { id: 'hair_braid01', name: '新中式斜刘海盘发', cat: 'updo', tag: '古典温婉', svg: 'updo_high' },
  { id: 'daz_hair_adrienne_updo', name: '法式名媛编发盘发', cat: 'updo', tag: '微卷斜分', svg: 'updo_braid' },
  { id: 'daz_hair_low_chignon', name: '温婉八字低挽发髻', cat: 'updo', tag: '江南学姐', svg: 'updo_low' },
  { id: 'daz_hair_crown_braid', name: '古典皇冠交织盘发', cat: 'updo', tag: '21,016面', svg: 'updo_braid' },
  { id: 'daz_hair_ballerina_bun', name: '芭蕾露额高丸子头', cat: 'updo', tag: '天鹅颈线', svg: 'bun_high' },
  { id: 'daz_hair_french_braid_bun', name: '法式蝎子辫高定盘髻', cat: 'updo', tag: '7,622面', svg: 'updo_braid' },
  { id: 'daz_hair_rehman_bun', name: '财阀千金高颅丸子髻', cat: 'updo', tag: '4,432面', svg: 'bun_high' },
  { id: 'daz_hair_bow_bun_braids', name: '国风蝴蝶结双髻盘发', cat: 'updo', tag: '5,372面', svg: 'updo_high' },
  { id: 'preset_guofeng_twin_buns', name: '新中式公主切双丸子', cat: 'updo', tag: '甜酷哪吒头', svg: 'twin_buns' },
  { id: 'preset_french_lazy_chignon', name: '法式碎刘海龙须低盘发', cat: 'updo', tag: '松弛感贵气', svg: 'updo_low' },
  { id: 'preset_song_aesthetic_updo', name: '宋制八字蝴蝶结高髻', cat: 'updo', tag: '清雅仕女', svg: 'updo_high' },
  { id: 'preset_ballet_core_ribbons', name: '芭蕾空气刘海高丸子', cat: 'updo', tag: 'S型龙须', svg: 'bun_high' },
  { id: 'preset_clean_fit_sleek_bun', name: '高智露耳极简低盘发', cat: 'updo', tag: 'CleanFit', svg: 'updo_low' },
  { id: 'preset_imperial_crown_braid_hime', name: '宫廷皇冠盘髻公主切', cat: 'updo', tag: '华贵贵女', svg: 'updo_braid' },

  // V. 元气束发、马尾与编发 (12款)
  { id: 'hair_ponytail01', name: '千金露耳高扎长辫', cat: 'tail', tag: '27,816面', svg: 'ponytail_high' },
  { id: 'daz_hair_twin_buns', name: '甜酷高颅双丸子头', cat: 'tail', tag: '元气幼态', svg: 'twin_buns' },
  { id: 'daz_hair_halfup_princess', name: '千金中分半扎公主', cat: 'tail', tag: '仙气披肩', svg: 'half_up' },
  { id: 'daz_hair_twin_braids', name: '学院风中分双麻花', cat: 'tail', tag: '清纯初恋', svg: 'braids' },
  { id: 'daz_hair_sport_ponytail', name: '元气八字清爽短束', cat: 'tail', tag: '利落收颈', svg: 'ponytail_low' },
  { id: 'daz_hair_double_braid', name: '邻家少女对称双麻花辫', cat: 'tail', tag: '9,866面', svg: 'braids' },
  { id: 'daz_hair_unkempt_french_braid', name: '森系微凌乱单侧长辫', cat: 'tail', tag: '8,200面', svg: 'ponytail_low' },
  { id: 'preset_jk_twin_ponytail', name: '东京JK空气刘海双辫', cat: 'tail', tag: '学院甜妹', svg: 'braids' },
  { id: 'preset_kpop_curtain_ponytail', name: '韩团八字刘海高马尾', cat: 'tail', tag: '打歌舞台', svg: 'ponytail_high' },
  { id: 'preset_republic_student_braids', name: '民国三七斜分双麻花', cat: 'tail', tag: '江南女校', svg: 'braids' },
  { id: 'preset_mori_girl_unkempt_braid', name: '森系焦糖棕慵懒长辫', cat: 'tail', tag: '氧气少女', svg: 'ponytail_low' },
  { id: 'preset_sweet_milk_tea_halfup', name: '焦糖奶茶公主切半扎', cat: 'tail', tag: '甜妹千金', svg: 'half_up' },
  { id: 'preset_cyber_hologram_twin', name: '赛博银挑染微碎双辫', cat: 'tail', tag: '机能少女', svg: 'braids' },
  { id: 'none', name: '无发解剖观察态', cat: 'tail', tag: '完整露颅', svg: 'pixie' },
];

const CHARACTER_CARDS = [
  // --- 中式骨相 (14款) ---
  { id: 'cn_oval_scholar', region: 'cn', preset: 'fangyaoping', name: '方尧平 · 书卷鹅蛋', sub: '19岁怀集状元原生脸', skin: 'cn_scholar_natural' },
  { id: 'cn_round_babyface', region: 'cn', preset: 'user_photo', name: '初夏 · 幼态娃娃圆脸', sub: '饱满婴儿肥圆润杏眼', skin: 'kr_dewy_peach' },
  { id: 'cn_classical_melon', region: 'cn', preset: 'suwan', name: '苏晚 · 江南古典瓜子', sub: '温婉柳叶眉仕女骨相', skin: 'cn_jiangnan_jade' },
  { id: 'cn_cold_royal', region: 'cn', preset: 'shenzhiwei', name: '沈知微 · 清冷高智菱形', sub: '立体颧弓高鼻梁冷艳', skin: 'cn_intellectual_olive' },
  { id: 'cn_pure_campus_bell', region: 'cn', preset: 'fangyaoping', name: '东方冷白校花鹅蛋', sub: '纯净素颜初恋原模', skin: 'cn_porcelain_ivory' },
  { id: 'cn_tang_peony', region: 'cn', preset: 'suwan', name: '京派珠圆玉润贵女', sub: '国泰民安端庄鹅蛋脸', skin: 'cn_jiangnan_jade' },
  { id: 'cn_northern_danfeng', region: 'cn', preset: 'shenzhiwei', name: '华北古典丹凤瑞凤', sub: '平缓眉弓内尖外挑凤眼', skin: 'cn_porcelain_ivory' },
  { id: 'cn_cat_fox_siren', region: 'cn', preset: 'linxi', name: '钓系狐系清冷名伶', sub: '窄长中庭魅惑吊梢狐眼', skin: 'kr_chaebol_cool' },
  { id: 'cn_wide_catfish_chic', region: 'cn', preset: 'shenzhiwei', name: '宽眼距电影高级脸', sub: '舒展留白微方颌单睑', skin: 'cn_intellectual_olive' },
  { id: 'cn_imperial_square', region: 'cn', preset: 'fangyaoping', name: '东方英气端方青衣', sub: '清晰下颌折角开扇内双', skin: 'cn_scholar_natural' },
  { id: 'cn_puppy_innocent', region: 'cn', preset: 'user_photo', name: '纯欲无辜小狗下至', sub: '满胶原苹果肌下至圆眼', skin: 'kr_dewy_peach' },
  { id: 'cn_jiangnan_water_lily', region: 'cn', preset: 'suwan', name: '江南烟雨清瘦白莲', sub: '窄长清减双颊古典内双', skin: 'cn_jiangnan_jade' },
  { id: 'cn_sichuan_doll_peach', region: 'cn', preset: 'qianxue', name: '川渝灵动蜜桃甜妹', sub: '高位苹果肌短翘尖下巴', skin: 'kr_dewy_peach' },
  { id: 'cn_dunhuang_apsara_noble', region: 'cn', preset: 'suwan', name: '敦煌飞天盛唐神女', sub: '饱满额弓希腊鼻瑞凤眸', skin: 'cn_jiangnan_jade' },

  // --- 韩系女团与财阀骨相 (8款) ---
  { id: 'kr_idol_vline', region: 'kr', preset: 'linxi', name: '林汐 · 财阀千金V脸', sub: '利落下颌冷艳丹凤', skin: 'kr_chaebol_cool' },
  { id: 'kr_sweet_heart', region: 'kr', preset: 'qianxue', name: '千雪 · 女团初恋心形', sub: '饱满上镜桃花眼骨相', skin: 'kr_firstlove_camellia' },
  { id: 'kr_waterglow_idol', region: 'kr', preset: 'user_photo', name: '首尔水光画报神颜', sub: '奶油肌饱满卧蚕小V脸', skin: 'kr_dewy_peach' },
  { id: 'kr_chaebol_heiress', region: 'kr', preset: 'linxi', name: '清潭洞财阀长女鹅蛋', sub: '修长窄鹅蛋高直鼻名媛', skin: 'kr_chaebol_cool' },
  { id: 'kr_cat_idol_ace', region: 'kr', preset: 'qianxue', name: '韩团四代神颜猫系ACE', sub: '精致短V脸奶凶上挑猫眼', skin: 'kr_firstlove_camellia' },
  { id: 'kr_quail_egg_pure', region: 'kr', preset: 'user_photo', name: '韩系零棱角流畅鹌鹑蛋', sub: '360°无死角头包脸小鹅蛋', skin: 'kr_dewy_peach' },
  { id: 'kr_mellow_spoon_chic', region: 'kr', preset: 'fangyaoping', name: '忠武路电影感淡颜女主', sub: '留白清冷鹅蛋高级单睑', skin: 'cn_porcelain_ivory' },
  { id: 'kr_bunny_firstlove', region: 'kr', preset: 'qianxue', name: '首尔国民初恋兔系甜妹', sub: '澎润苹果肌弯弯月牙眼', skin: 'kr_firstlove_camellia' },

  // --- 日系透明感与杂志骨相 (8款) ---
  { id: 'jp_yamato_clear', region: 'jp', preset: 'fangyaoping', name: '日系透明感森系少女', sub: '短人中微翘鼻小鹿圆眼', skin: 'cn_porcelain_ivory' },
  { id: 'jp_showa_cinema_muse', region: 'jp', preset: 'suwan', name: '昭和银幕绝代佳人鹅蛋', sub: '端庄明眸皓齿平行大杏眼', skin: 'cn_porcelain_ivory' },
  { id: 'jp_tokyo_sweet_pear', region: 'jp', preset: 'user_photo', name: '东京日杂甜美微梨形脸', sub: '下颊软糯胶原无辜下至眼', skin: 'kr_dewy_peach' },
  { id: 'jp_kyoto_noble_slender', region: 'jp', preset: 'suwan', name: '京都华族清冷狭长瓜子', sub: '纤薄骨相古典细长单凤眼', skin: 'cn_jiangnan_jade' },
  { id: 'jp_harajuku_fairy_triangle', region: 'jp', preset: 'qianxue', name: '原宿二次元精灵倒三角', sub: '饱满额头尖颏漫画大鹿眼', skin: 'cn_porcelain_ivory' },
  { id: 'jp_idol_round_dimple', region: 'jp', preset: 'user_photo', name: '坂道系元气酒窝小圆脸', sub: '甜美梨涡苹果肌治愈笑眼', skin: 'kr_firstlove_camellia' },
  { id: 'jp_cool_model_Clean', region: 'jp', preset: 'shenzhiwei', name: '东京银座高冷盐系超模', sub: '清癯微凹面颊疏离眼神', skin: 'cn_intellectual_olive' },
  { id: 'jp_forest_mori_soft', region: 'jp', preset: 'fangyaoping', name: '北海道氧气感森女淡颜', sub: '柔和宽眼距微翘小鼻杏眼', skin: 'cn_scholar_natural' },

  // --- 港台与亚欧混血骨相 (8款) ---
  { id: 'eurasian_sculpted_mix', region: 'mix', preset: 'shenzhiwei', name: '东亚西域丝绒轻混血', sub: '深邃眉弓高鼻梁平行大双', skin: 'eurasian_velvet_rose' },
  { id: 'hk_90s_glamour_queen', region: 'mix', preset: 'linxi', name: '90年代香江浓颜女神', sub: '英气微方颌美人沟桃花眼', skin: 'kr_firstlove_camellia' },
  { id: 'tw_campus_sweet_oxygen', region: 'mix', preset: 'fangyaoping', name: '台北文艺校园氧气校花', sub: '温润无棱角鹅蛋含笑杏眼', skin: 'cn_scholar_natural' },
  { id: 'cyber_cg_angel_v', region: 'mix', preset: 'qianxue', name: '次世代CG建模黄金V脸', sub: '极致对称小头包脸大眼', skin: 'cn_porcelain_ivory' },
  { id: 'asia_high_fashion_runway', region: 'mix', preset: 'shenzhiwei', name: '高定T台冰山超模钻石脸', sub: '高颧弓削瘦双颊上挑凤眼', skin: 'cn_intellectual_olive' },
  { id: 'asia_sweet_cool_bambi', region: 'mix', preset: 'user_photo', name: '亚洲甜酷纯欲芭比小鹿', sub: '混血翘鼻嘟嘟唇芭比圆眼', skin: 'kr_dewy_peach' },
  { id: 'asia_pear_gentle_sister', region: 'mix', preset: 'suwan', name: '名门温婉知性姐姐方圆脸', sub: '柔和下颌支点温柔笑眼', skin: 'cn_jiangnan_jade' },
  { id: 'asia_noble_swan_oval', region: 'mix', preset: 'linxi', name: '古典芭蕾天鹅修长鹅蛋脸', sub: '黄金三庭五眼正统名媛', skin: 'kr_chaebol_cool' },
];

const SKIN_CARDS = [
  { id: 'cn_scholar_natural', name: '书卷暖玉', hex: '#f4d9c6', sub: '状元三颗痣' },
  { id: 'kr_dewy_peach', name: '水光蜜桃', hex: '#f7d2c4', sub: '初夏奶油肌' },
  { id: 'kr_chaebol_cool', name: '财阀冷白', hex: '#f8e3d8', sub: '林汐泪痣肌' },
  { id: 'cn_porcelain_ivory', name: '中式凝脂', hex: '#fae6dc', sub: '零瑕少女肌' },
  { id: 'cn_jiangnan_jade', name: '江南羊脂', hex: '#f5decb', sub: '苏晚点绛唇' },
  { id: 'kr_firstlove_camellia', name: '初恋雪瓷', hex: '#fce4dc', sub: '千雪鼻梁痣' },
  { id: 'cn_intellectual_olive', name: '高智象牙', hex: '#eed1ba', sub: '沈知微哑光' },
  { id: 'eurasian_velvet_rose', name: '混血奶油', hex: '#f6dfd0', sub: '丝绒玫瑰唇' },
];

const EYE_CARDS = [
  { id: 'almond_classic', name: '标准杏眼', svg: 'M6 18 Q18 9 30 18 Q18 25 6 18 Z' },
  { id: 'danfeng_phoenix', name: '古典丹凤', svg: 'M5 19 Q17 11 31 14 Q20 23 5 19 Z' },
  { id: 'peach_blossom', name: '含情桃花', svg: 'M5 18 Q16 8 30 17 Q22 26 5 18 Z' },
  { id: 'willow_leaf', name: '江南柳叶', svg: 'M4 18 Q18 12 32 16 Q18 22 4 18 Z' },
  { id: 'puppy_downturned', name: '无辜下至', svg: 'M6 16 Q18 9 30 19 Q19 26 6 16 Z' },
  { id: 'fox_slanted', name: '钓系狐狸', svg: 'M5 20 Q17 11 31 13 Q21 22 5 20 Z' },
  { id: 'pure_monolid', name: '东方单睑', svg: 'M5 18 Q18 13 31 17 Q18 22 5 18 Z' },
  { id: 'in_out_double', name: '开扇内双', svg: 'M6 18 Q18 10 30 17 Q18 24 6 18 Z' },
  { id: 'parallel_double', name: '平行大双', svg: 'M5 18 Q18 7 31 18 Q18 26 5 18 Z' },
  { id: 'fawn_round', name: '灵动小鹿', svg: 'M7 18 Q18 7 29 18 Q18 27 7 18 Z' },
  { id: 'sleepy_phoenix', name: '微醺睡凤', svg: 'M5 17 Q18 14 31 16 Q18 23 5 17 Z' },
  { id: 'sanpaku_cool', name: '清冷下三白', svg: 'M5 17 Q18 11 31 17 Q18 25 5 17 Z' },
];

const BROW_CARDS = [
  { id: 'cn_scholar_natural', name: '原生书卷眉', svg: 'M5 19 Q17 13 31 17' },
  { id: 'kr_straight_mist', name: '平直一字眉', svg: 'M5 17 Q18 15 31 16' },
  { id: 'kr_idol_arch', name: '微挑流星眉', svg: 'M5 19 Q20 11 31 18' },
  { id: 'cn_willow_classical', name: '古典柳叶眉', svg: 'M5 20 Q18 9 31 19' },
  { id: 'kr_sweet_droop', name: '无辜微垂眉', svg: 'M5 16 Q18 15 31 20' },
  { id: 'cn_cold_sword', name: '清冷英气眉', svg: 'M5 20 L22 13 L31 15' },
  { id: 'kr_wild_feathered', name: '浓密野生眉', svg: 'M5 19 Q17 12 31 16' },
  { id: 'cn_tang_moth', name: '古典远山眉', svg: 'M7 18 Q18 12 29 17' },
];

function renderHairSvg(type) {
  const stroke = '#d4b483';
  const fill = 'rgba(212, 180, 131, 0.16)';
  const face = '<ellipse cx="19" cy="20" rx="7.5" ry="9" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" stroke-width="1.1"/>';
  switch (type) {
    case 'bob_air':
    case 'bob_side':
    case 'bob_center':
    case 'bob_wave':
      return `<svg viewBox="0 0 38 38">${face}<path d="M9 24 C8 12 13 7 19 7 C25 7 30 12 29 24 C27 27 25 27 25 22 C23 13 15 13 13 22 C13 27 11 27 9 24 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/></svg>`;
    case 'pixie':
      return `<svg viewBox="0 0 38 38">${face}<path d="M10 19 C10 10 14 7 19 7 C24 7 28 10 28 19 C26 14 22 12 19 13 C16 12 12 14 10 19 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/></svg>`;
    case 'hime':
    case 'long_straight':
    case 'long_center':
    case 'clavicle':
      return `<svg viewBox="0 0 38 38">${face}<path d="M8 34 L9 16 C9 9 14 6 19 6 C24 6 29 9 29 16 L30 34 L25 34 L25 16 C22 13 16 13 13 16 L13 34 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/></svg>`;
    case 'updo_high':
    case 'updo_low':
    case 'bun_high':
    case 'updo_braid':
      return `<svg viewBox="0 0 38 38"><circle cx="19" cy="6.5" r="4.2" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>${face}<path d="M11 18 C11 10 15 8 19 8 C23 8 27 10 27 18 C24 13 14 13 11 18 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/></svg>`;
    case 'twin_buns':
    case 'braids':
      return `<svg viewBox="0 0 38 38"><circle cx="9" cy="11" r="3.5" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/><circle cx="29" cy="11" r="3.5" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>${face}<path d="M7 32 C6 22 8 14 11 14 M31 32 C32 22 30 14 27 14" stroke="${stroke}" stroke-width="1.5" fill="none"/></svg>`;
    default:
      return `<svg viewBox="0 0 38 38">${face}<path d="M7 33 C6 24 9 9 19 7 C29 9 32 24 31 33 C27 29 26 22 25 16 C22 13 16 13 13 16 C12 22 11 29 7 33 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/></svg>`;
  }
}

function setFormValueAndTrigger(id, value, eventType = 'input') {
  const el = document.getElementById(id);
  if (!el) return false;
  if (el.tagName === 'SELECT' && value !== undefined && value !== null) {
    const strVal = String(value);
    const hasOpt = Array.from(el.options || []).some((o) => o.value === strVal);
    if (!hasOpt) {
      const opt = document.createElement('option');
      opt.value = strVal;
      opt.textContent = strVal;
      el.appendChild(opt);
    }
  }
  el.value = value;
  el.dispatchEvent(new Event(eventType, { bubbles: true }));
  if (eventType !== 'change') {
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return true;
}

function syncCatalogSelectOptions() {
  for (const selId of ['vcd-hair-style', 'sel-hair-style']) {
    const sel = document.getElementById(selId);
    if (!sel) continue;
    const existing = new Set(Array.from(sel.options).map((o) => o.value));
    for (const h of REAL_HAIR_CATALOG) {
      if (!existing.has(h.id)) {
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = h.shortLabel || h.label || h.id;
        sel.appendChild(opt);
      }
    }
  }
  for (const selId of ['vcd-sel-face-archetype', 'sel-face-archetype']) {
    const sel = document.getElementById(selId);
    if (!sel) continue;
    const existing = new Set(Array.from(sel.options).map((o) => o.value));
    for (const fa of FACE_ARCHETYPE_CATALOG) {
      if (!existing.has(fa.id)) {
        const opt = document.createElement('option');
        opt.value = fa.id;
        opt.textContent = fa.shortLabel || fa.label || fa.id;
        sel.appendChild(opt);
      }
    }
  }
}

function formatSliderDisplay(val, fmt) {
  const n = Number(val);
  if (fmt === 'pct') return `${Math.round(n * 100)}%`;
  if (fmt === 'signed') return `${n >= 0 ? '+' : ''}${n.toFixed(2)}`;
  return `${n}`;
}

function makeShortSliderRow({ label, targetId, fallbackId = '', min, max, step, val, fmt = 'pct' }) {
  return `
    <div class="obs-slider-row" data-sync-target="${targetId}" data-sync-fallback="${fallbackId}" data-fmt="${fmt}">
      <span>${label}</span>
      <input type="range" class="obs-proxy-range" min="${min}" max="${max}" step="${step}" value="${val}" />
      <span class="obs-proxy-val">${formatSliderDisplay(val, fmt)}</span>
    </div>
  `;
}

export function initObsidianProStudio() {
  if (document.getElementById('obsidian-char-hair-studio')) return;

  // 1. Force all floating drawers, toasts, and modals hidden at boot so NOTHING blocks the 3D viewport
  for (const id of [
    'comfort-reader-drawer',
    'victor-puzzle-hub-modal',
    'tactile-sculpt-hud-toast',
    'structure-floating-hud',
    'pet-hover-dossier',
    'visual-customizer-drawer',
    'heartbeat-anticheat-banner',
    'start-game-overlay',
  ]) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      if (el.style && el.style.display === 'flex') {
        el.style.removeProperty('display');
      }
    }
  }

  // Ensure #software-window starts hidden, while #specimen-placards-layer starts visible with clean 4-field placards
  const swWin = document.getElementById('software-window');
  if (swWin) swWin.classList.add('window-hidden');
  const placardsLayer = document.getElementById('specimen-placards-layer');
  if (placardsLayer) placardsLayer.classList.remove('hidden');
  const btnPlacards = document.getElementById('btn-quick-placards');
  if (btnPlacards) btnPlacards.classList.add('active-top');

  // 2. Transform #desktop-overlay-bar into a sleek High-Contrast Command Dock
  transformTopOverlayBar();
  syncCatalogSelectOptions();

  // 3. Clean up verbose slider labels across existing drawers/windows
  cleanExistingVerboseLabels();

  // 3. Build Unified Character & Hair Studio Drawer (#obsidian-char-hair-studio)
  const studio = document.createElement('aside');
  studio.id = 'obsidian-char-hair-studio';
  studio.className = 'hidden';
  studio.innerHTML = `
    <div class="obs-studio-header">
      <div class="obs-studio-title-group">
        <span class="obs-studio-eyebrow">OBSIDIAN PRO · STUDIO</span>
        <span class="obs-studio-title">人物 · 发型 · 建筑 · 光影滤镜总控台</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button id="btn-obs-open-comfort-reader" class="obs-icon-btn" title="打开46篇伴学宽心手札作文阅读器" style="border-color:rgba(244,114,182,0.75);color:#fce7f3;">📖 作文手札</button>
        <button id="btn-obs-open-3d-workbench" class="obs-icon-btn" title="打开独立3D工坊与典藏库">3D工坊</button>
        <button id="btn-obs-close-studio" class="obs-icon-btn" title="收起面板 (Esc)">✕</button>
      </div>
    </div>

    <div class="obs-target-bar">
      <label for="obs-target-select">当前编辑目标</label>
      <select id="obs-target-select" class="obs-select">
        <option value="selected">当前选中桌面标本 (实时联动)</option>
        <option value="all">全部在屏标本同步应用</option>
      </select>
    </div>

    <div class="obs-main-tabs" role="tablist">
      <button class="obs-tab-btn active" data-obs-tab="hair">发型高定</button>
      <button class="obs-tab-btn" data-obs-tab="character">人物与标牌</button>
      <button class="obs-tab-btn" data-obs-tab="face">眉眼五官</button>
      <button class="obs-tab-btn" data-obs-tab="material">肤质断面</button>
      <button class="obs-tab-btn" data-obs-tab="arch_filter">建筑与滤镜</button>
    </div>

    <div class="obs-studio-body">
      <!-- ==================== TAB 1: 发型高定 (HAIR) ==================== -->
      <div class="obs-pane active" data-obs-pane="hair">
        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">61款东亚全覆盖3D高定发型图鉴</span>
          <div class="obs-sec-head">
            <span class="obs-sec-title">61款东亚全覆盖3D高定发型图鉴 (新增32款置顶)</span>
            <span id="obs-hair-current-label" class="obs-sec-sub">清透斜碎波波</span>
          </div>
          <div class="obs-filter-strip" id="obs-hair-cat-strip">
            <button class="obs-filter-pill active" data-hair-cat="all">全部 (${HAIRSTYLE_CARDS.length})</button>
            <button class="obs-filter-pill" data-hair-cat="new32" style="border-color:rgba(245,196,81,0.55);color:#fde68a;">✨ 新增32款</button>
            <button class="obs-filter-pill" data-hair-cat="bob">波波短发</button>
            <button class="obs-filter-pill" data-hair-cat="straight">直发锁骨</button>
            <button class="obs-filter-pill" data-hair-cat="wave">浪漫卷发</button>
            <button class="obs-filter-pill" data-hair-cat="updo">古典盘发</button>
            <button class="obs-filter-pill" data-hair-cat="tail">马尾编发</button>
          </div>
          <div class="obs-card-grid" id="obs-hair-card-grid" style="max-height:260px;overflow-y:auto;padding-right:2px;">
            ${[
              ...HAIRSTYLE_CARDS.filter((h) => NEW_32_HAIR_IDS.has(h.id)),
              ...HAIRSTYLE_CARDS.filter((h) => !NEW_32_HAIR_IDS.has(h.id)),
            ].map((h) => {
              const isNew = NEW_32_HAIR_IDS.has(h.id);
              return `
              <div class="obs-visual-card ${h.id === 'hair_user_photo' ? 'active' : ''}" data-hair-id="${h.id}" data-hair-cat="${h.cat}" data-hair-new="${isNew ? '1' : '0'}" style="${isNew ? 'border-color:rgba(245,196,81,0.42);position:relative;' : 'position:relative;'}">
                ${isNew ? '<span style="position:absolute;top:4px;right:4px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#111;font-size:9px;font-weight:800;padding:1px 4px;border-radius:4px;line-height:1.2;">NEW</span>' : ''}
                <div class="obs-card-thumb">${renderHairSvg(h.svg)}</div>
                <div class="obs-card-title">${h.name}</div>
                <div class="obs-card-meta">${isNew ? '✨ ' + h.tag : h.tag}</div>
              </div>
            `;
            }).join('')}
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">四区模块化自由拼装</span>
            <button id="obs-btn-reset-mod-hair" class="obs-icon-btn" style="padding:2px 8px;font-size:10.5px;">恢复原配</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div>
              <div class="obs-sec-sub" style="margin-bottom:4px;">前额刘海</div>
              <div class="obs-pill-grid" data-mod-select="vcd-hair-bangs" data-mod-fallback="sel-hair-bangs">
                <button class="obs-choice-pill active" data-val="default">原配</button>
                <button class="obs-choice-pill" data-val="wispy_air">空气碎刘海</button>
                <button class="obs-choice-pill" data-val="curtain_part">八字长刘海</button>
                <button class="obs-choice-pill" data-val="hime_blunt">齐眉姬发</button>
                <button class="obs-choice-pill" data-val="side_swept">三七斜分</button>
                <button class="obs-choice-pill" data-val="french_light">法式碎刘海</button>
                <button class="obs-choice-pill" data-val="forehead_bare">清爽露额</button>
              </div>
            </div>
            <div>
              <div class="obs-sec-sub" style="margin-bottom:4px;">两侧鬓角</div>
              <div class="obs-pill-grid" data-mod-select="vcd-hair-sidelocks" data-mod-fallback="sel-hair-sidelocks">
                <button class="obs-choice-pill active" data-val="default">原配</button>
                <button class="obs-choice-pill" data-val="photo_asymmetric_ear">右露耳左碎鬓</button>
                <button class="obs-choice-pill" data-val="tucked_ear">双侧挽耳后</button>
                <button class="obs-choice-pill" data-val="photo_wisp">轻薄耳前碎发</button>
                <button class="obs-choice-pill" data-val="hime_cheek">齐腮公主切</button>
                <button class="obs-choice-pill" data-val="wavy_tendril">S型微卷龙须</button>
                <button class="obs-choice-pill" data-val="long_chest_locks">垂肩修颜长束</button>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <div class="obs-sec-sub" style="margin-bottom:4px;">颅顶发缝</div>
                <select class="obs-select" style="width:100%;" data-obs-bind="vcd-hair-top" data-obs-fallback="sel-hair-top-crown">
                  <option value="default">原配颅顶</option>
                  <option value="photo_sleek_crown">清爽束发露耳</option>
                  <option value="fluffy_high_crown">高颅顶蓬松</option>
                  <option value="center_part_crown">清冷八字中分</option>
                  <option value="side_part_crown">温柔三七偏分</option>
                </select>
              </div>
              <div>
                <div class="obs-sec-sub" style="margin-bottom:4px;">后脑尾饰</div>
                <select class="obs-select" style="width:100%;" data-obs-bind="vcd-hair-back" data-obs-fallback="sel-hair-back">
                  <option value="none">原配后发</option>
                  <option value="photo_tied_ponytail">照片同款高束马尾</option>
                  <option value="short_nape_crop">清爽齐颈短发</option>
                  <option value="high_ponytail">飒爽高扎长马尾</option>
                  <option value="low_chignon">古典温婉低盘发</option>
                  <option value="twin_buns">甜酷双丸子头</option>
                  <option value="twin_braids">学院双麻花辫</option>
                  <option value="sleek_long_back">垂顺黑长直披发</option>
                  <option value="wavy_long_back">浪漫大波浪披发</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">发色染膏与渲染管线</span>
            <select class="obs-select" style="width:auto;padding:3px 8px;font-size:11px;" data-obs-bind="vcd-master-hair-mode">
              <option value="card">精雕发片 (完整丰盈发量)</option>
              <option value="strand">3D真发丝 (微距单根发丝)</option>
            </select>
          </div>
          <div class="obs-swatch-row" id="obs-hair-swatches">
            <button class="obs-color-dot active" data-hair-hex="#141110" style="background:#141110;" title="自然乌黑"></button>
            <button class="obs-color-dot" data-hair-hex="#2a1d17" style="background:#2a1d17;" title="深摩卡棕"></button>
            <button class="obs-color-dot" data-hair-hex="#4a2e1b" style="background:#4a2e1b;" title="焦糖栗棕"></button>
            <button class="obs-color-dot" data-hair-hex="#5c2622" style="background:#5c2622;" title="微醺酒红"></button>
            <button class="obs-color-dot" data-hair-hex="#6b4c35" style="background:#6b4c35;" title="冷茶亚麻"></button>
            <button class="obs-color-dot" data-hair-hex="#1a2436" style="background:#1a2436;" title="午夜蓝黑"></button>
            <button class="obs-color-dot" data-hair-hex="#d8c29d" style="background:#d8c29d;" title="流光浅金"></button>
            <button class="obs-color-dot" data-hair-hex="#b8bfc6" style="background:#b8bfc6;" title="月光银灰"></button>
            <label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--obs-text-secondary);margin-left:auto;">
              底色 <input type="color" id="obs-hair-main-color" value="#141110" style="width:22px;height:22px;border:none;background:none;cursor:pointer;" />
            </label>
            <label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--obs-text-secondary);">
              挑染 <input type="color" id="obs-hair-tip-color" value="#4a3528" style="width:22px;height:22px;border:none;background:none;cursor:pointer;" />
            </label>
          </div>
        </div>

        <details class="obs-accordion" open>
          <summary>发型形态精调 (11项实时滑块)</summary>
          <div class="obs-accordion-body">
            ${makeShortSliderRow({ label: '刘海长度', targetId: 'morph-bangs-len', min: -0.45, max: 0.55, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '八字分缝', targetId: 'morph-bangs-part', min: -0.45, max: 0.75, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '颅顶蓬松', targetId: 'morph-hair-vol', min: -0.35, max: 0.60, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '发尾长度', targetId: 'morph-hair-len', min: -0.45, max: 0.75, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '鬓角收拢', targetId: 'morph-sideburn-lock', min: -0.45, max: 0.55, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '发梢外翘', targetId: 'morph-hair-flare', min: -0.55, max: 0.75, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '卷曲波浪', targetId: 'morph-hair-curl', min: 0, max: 1.0, step: 0.02, val: 0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '空气羽化', targetId: 'vcd-hair-feather', fallbackId: 'slider-hair-feather', min: 0, max: 1.0, step: 0.02, val: 0.45, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '挑染比例', targetId: 'vcd-hair-ombre', fallbackId: 'slider-hair-ombre', min: 0, max: 1.0, step: 0.02, val: 0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '发丝光泽', targetId: 'slider-hair-sheen', min: 0.1, max: 1.0, step: 0.02, val: 0.65, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '颈部净空', targetId: 'slider-neck-clearance', min: 0, max: 1.0, step: 0.02, val: 0.78, fmt: 'pct' })}
          </div>
        </details>
      </div>

      <!-- ==================== TAB 2: 人物与标牌 (CHARACTER & PLACARD) ==================== -->
      <div class="obs-pane" data-obs-pane="character">
        <div class="obs-section" style="border-color:rgba(251,191,36,0.55);">
          <div class="obs-sec-head">
            <span class="obs-sec-title" style="color:#fef08a;">🏷️ 标牌信息设置 (照片 · 名字 · 年龄 · 简要故事)</span>
            <label style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:#f8fafc;cursor:pointer;">
              <input type="checkbox" id="obs-chk-placards-visible" checked style="accent-color:#fbbf24;cursor:pointer;" />
              <span>显示桌面标牌</span>
            </label>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;">
              <div style="width:68px;height:68px;border-radius:10px;overflow:hidden;border:2px solid rgba(251,191,36,0.75);background:#0f172a;">
                <img id="obs-placard-photo-preview" src="" alt="人物照片" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <label class="obs-icon-btn" style="padding:3px 8px;font-size:11px;text-align:center;cursor:pointer;">
                📷 换照片
                <input type="file" id="obs-placard-photo-upload" accept="image/*" style="display:none;" />
              </label>
              <button type="button" id="obs-placard-photo-reset" class="obs-icon-btn" style="padding:2px 6px;font-size:10.5px;">↺ 默认照</button>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:7px;min-width:0;">
              <div style="display:grid;grid-template-columns:1fr 90px;gap:7px;">
                <div>
                  <div style="font-size:11px;color:#cbd5e1;margin-bottom:3px;font-weight:600;">人物名字</div>
                  <input type="text" id="obs-placard-name-input" class="obs-select" style="width:100%;padding:5px 8px;" placeholder="输入名字 (如：方尧平)" />
                </div>
                <div>
                  <div style="font-size:11px;color:#cbd5e1;margin-bottom:3px;font-weight:600;">人物年龄</div>
                  <input type="text" id="obs-placard-age-input" class="obs-select" style="width:100%;padding:5px 8px;" placeholder="如：19岁" />
                </div>
              </div>
              <div>
                <div style="font-size:11px;color:#cbd5e1;margin-bottom:3px;font-weight:600;">一段简要故事 (实时显示在标牌上)</div>
                <textarea id="obs-placard-story-input" class="obs-select" rows="2" style="width:100%;padding:6px 8px;resize:vertical;line-height:1.4;" placeholder="输入人物生前身份或简要故事..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">38款东亚全覆盖真实3D骨相脸型</span>
            <span id="obs-char-current-label" class="obs-sec-sub">点选切换骨相与原皮</span>
          </div>
          <div class="obs-filter-strip" id="obs-char-region-strip" style="margin-bottom:8px;">
            <button class="obs-filter-pill active" data-char-region="all">全部 (${CHARACTER_CARDS.length})</button>
            <button class="obs-filter-pill" data-char-region="cn">中式骨相 (14)</button>
            <button class="obs-filter-pill" data-char-region="kr">韩系女团 (8)</button>
            <button class="obs-filter-pill" data-char-region="jp">日系透明 (8)</button>
            <button class="obs-filter-pill" data-char-region="mix">港台与混血 (8)</button>
          </div>
          <div class="obs-card-grid cols-2" id="obs-char-card-grid" style="max-height:225px;overflow-y:auto;padding-right:2px;">
            ${CHARACTER_CARDS.map((c, i) => `
              <div class="obs-visual-card ${i === 0 ? 'active' : ''}" data-char-arch="${c.id}" data-char-region="${c.region || 'cn'}" data-char-preset="${c.preset}" style="flex-direction:row;text-align:left;padding:8px 10px;gap:9px;">
                <div style="width:10px;height:28px;border-radius:4px;background:rgba(212,180,131,0.45);flex-shrink:0;"></div>
                <div style="min-width:0;flex:1;">
                  <div class="obs-card-title" style="font-size:12px;font-weight:600;">${c.name}</div>
                  <div class="obs-card-meta">${c.sub}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head" style="flex-wrap:wrap;gap:6px;">
            <span class="obs-sec-title">🧬 38款全头模自由混合矩阵 (独立开关 + 权重滑块)</span>
            <div style="display:flex;align-items:center;gap:6px;">
              <span id="obs-blend-active-count" style="font-size:10.5px;color:#34d399;font-weight:600;">已开启 0 / 38 款</span>
              <button id="obs-btn-random-blend-2" class="obs-icon-btn" style="padding:2px 7px;font-size:10px;" title="随机开启2款东亚头模进行混血融合">🎲 随机混血</button>
              <button id="obs-btn-zero-blend" class="obs-icon-btn" style="padding:2px 7px;font-size:10px;" title="关闭全部38款头模混合开关，恢复纯净单脸">↺ 全部关闭</button>
            </div>
          </div>
          <div class="obs-filter-strip" id="obs-blend-region-strip" style="margin-bottom:6px;">
            <button class="obs-filter-pill active" data-blend-filter="all">全部 (${HEAD_BLEND_CHANNELS.length})</button>
            <button class="obs-filter-pill" data-blend-filter="active" style="border-color:rgba(52,211,153,0.5);color:#6ee7b7;">⚡ 已开启</button>
            <button class="obs-filter-pill" data-blend-filter="cn">中式 (14)</button>
            <button class="obs-filter-pill" data-blend-filter="kr">韩系 (8)</button>
            <button class="obs-filter-pill" data-blend-filter="jp">日系 (8)</button>
            <button class="obs-filter-pill" data-blend-filter="mix">港台与混血 (8)</button>
          </div>
          <div id="obs-head-blend-38-list" style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding-right:4px;">
            ${HEAD_BLEND_CHANNELS.map((ch, idx) => `
              <div class="obs-blend-38-row" data-obs-blend-row="${ch.id}" data-obs-blend-region="${ch.region || 'cn'}" style="display:grid;grid-template-columns:48px minmax(118px,1.25fr) 1fr 38px;align-items:center;gap:6px;padding:4px 6px;border-radius:7px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);">
                <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:10.5px;color:#cbd5e1;user-select:none;" title="开启/关闭「${ch.label}」头模混合开关">
                  <input type="checkbox" data-obs-blend-on="${ch.id}" style="accent-color:#10b981;width:13px;height:13px;cursor:pointer;" />
                  <span>开关</span>
                </label>
                <span style="font-size:11px;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${idx + 1}. ${ch.label}">${ch.shortLabel}</span>
                <input type="range" class="obs-range" data-obs-blend-val="${ch.id}" data-last-weight="0.50" min="0" max="1" step="0.01" value="0" />
                <span class="obs-slider-val" data-obs-blend-txt="${ch.id}" style="font-size:10.5px;text-align:right;">0%</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">8款高定真皮肤色贴图</span>
            <span class="obs-sec-sub">2K 摄影级毛孔与痣相</span>
          </div>
          <div class="obs-card-grid cols-4" id="obs-skin-card-grid">
            ${SKIN_CARDS.map((s, i) => `
              <div class="obs-visual-card ${i === 0 ? 'active' : ''}" data-skin-id="${s.id}">
                <div style="width:24px;height:24px;border-radius:50%;background:${s.hex};border:1.5px solid rgba(255,255,255,0.28);"></div>
                <div class="obs-card-title">${s.name}</div>
                <div class="obs-card-meta">${s.sub}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">定格神态预设</span>
            <button id="obs-btn-zero-blend" class="obs-icon-btn" style="padding:2px 8px;font-size:10.5px;">归零混脸</button>
          </div>
          <div class="obs-pill-grid" id="obs-expr-pill-grid">
            <button class="obs-choice-pill active" data-expr-id="dead_calm">安详闭合</button>
            <button class="obs-choice-pill" data-expr-id="dead_half_open">半睁迷离</button>
            <button class="obs-choice-pill" data-expr-id="dead_shock">死前惊恐</button>
            <button class="obs-choice-pill" data-expr-id="dead_agony">临终痉挛</button>
            <button class="obs-choice-pill" data-expr-id="dead_slack">面瘫弛缓</button>
            <button class="obs-choice-pill" data-expr-id="dead_gasp">窒息微张</button>
            <button class="obs-choice-pill" data-expr-id="dead_smile">定格浅笑</button>
          </div>
        </div>

        <details class="obs-accordion" open>
          <summary>神态与多头模混合微调 (8项)</summary>
          <div class="obs-accordion-body">
            ${makeShortSliderRow({ label: '下颌微张', targetId: 'morph-jaw-open', min: 0, max: 1.0, step: 0.02, val: 0.18, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '眼球上翻', targetId: 'morph-eye-roll', min: -0.4, max: 1.0, step: 0.02, val: 0.22, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '舌头伸出', targetId: 'morph-tongue-out', min: 0, max: 1.0, step: 0.02, val: 0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '下颌歪斜', targetId: 'morph-jaw-side', min: -0.8, max: 0.8, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '视线左右', targetId: 'morph-gaze-yaw', min: -0.6, max: 0.6, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '视线上下', targetId: 'morph-gaze-pitch', min: -0.5, max: 0.5, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '头宽比例', targetId: 'morph-head-width', min: -0.25, max: 0.25, step: 0.01, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '头长比例', targetId: 'morph-head-length', min: -0.25, max: 0.25, step: 0.01, val: 0, fmt: 'signed' })}
          </div>
        </details>
      </div>

      <!-- ==================== TAB 3: 眉眼五官 (FACE & EYES) ==================== -->
      <div class="obs-pane" data-obs-pane="face">
        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">12款东亚眼型预设卡片</span>
            <span class="obs-sec-sub">眼睑与卧蚕联动</span>
          </div>
          <div class="obs-card-grid cols-4" id="obs-eye-card-grid">
            ${EYE_CARDS.map((e, i) => `
              <div class="obs-visual-card ${i === 0 ? 'active' : ''}" data-eye-id="${e.id}">
                <div class="obs-card-thumb" style="height:32px;">
                  <svg viewBox="0 0 36 32">
                    <path d="${e.svg}" fill="rgba(212,180,131,0.14)" stroke="#d4b483" stroke-width="1.4"/>
                    <circle cx="18" cy="17.5" r="3.4" fill="#d4b483"/>
                  </svg>
                </div>
                <div class="obs-card-title">${e.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">8款3D立体眉毛模型</span>
            <span class="obs-sec-sub">MakeHuman真眉拓扑</span>
          </div>
          <div class="obs-card-grid cols-4" id="obs-brow-card-grid">
            ${BROW_CARDS.map((b, i) => `
              <div class="obs-visual-card ${i === 0 ? 'active' : ''}" data-brow-id="${b.id}">
                <div class="obs-card-thumb" style="height:28px;">
                  <svg viewBox="0 0 36 30">
                    <path d="${b.svg}" fill="none" stroke="#d4b483" stroke-width="2.6" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="obs-card-title">${b.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">高透虹膜瞳色</span>
          </div>
          <div class="obs-swatch-row" id="obs-iris-swatches">
            <button class="obs-color-dot active" data-iris-hex="#3b2316" style="background:#3b2316;" title="琥珀深棕"></button>
            <button class="obs-color-dot" data-iris-hex="#1c1512" style="background:#1c1512;" title="东方琉璃黑"></button>
            <button class="obs-color-dot" data-iris-hex="#6e4b26" style="background:#6e4b26;" title="浅茶榛果"></button>
            <button class="obs-color-dot" data-iris-hex="#4a5868" style="background:#4a5868;" title="混血冷灰蓝"></button>
            <button class="obs-color-dot" data-iris-hex="#3e5948" style="background:#3e5948;" title="祖母绿棕"></button>
            <button class="obs-color-dot" data-iris-hex="#543861" style="background:#543861;" title="星云紫灰"></button>
            <button class="obs-color-dot" data-iris-hex="#732828" style="background:#732828;" title="微醺绯红"></button>
            <input type="color" id="obs-iris-custom-color" value="#3b2316" style="width:24px;height:24px;border:none;background:none;cursor:pointer;margin-left:auto;" />
          </div>
        </div>

        <details class="obs-accordion" open>
          <summary>眼部与虹膜精调 (13项)</summary>
          <div class="obs-accordion-body">
            ${makeShortSliderRow({ label: '眼睛大小', targetId: 'vcd-eye-size', fallbackId: 'morph-eye-size', min: -0.45, max: 0.55, step: 0.02, val: 0.12, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '杏眼圆长', targetId: 'vcd-eye-almond', fallbackId: 'morph-eye', min: -0.45, max: 0.55, step: 0.02, val: 0.08, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '眼睑开合', targetId: 'vcd-eye-aperture', fallbackId: 'morph-eyelid-open', min: -0.40, max: 0.50, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '眼尾弧度', targetId: 'vcd-eye-tilt', fallbackId: 'morph-eye-tilt', min: -0.45, max: 0.55, step: 0.02, val: -0.04, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '眼距宽窄', targetId: 'vcd-eye-spacing', fallbackId: 'morph-eye-spacing', min: -0.40, max: 0.40, step: 0.02, val: 0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '内眦开合', targetId: 'vcd-eye-epicanthus', fallbackId: 'morph-eye-epicanthus', min: -0.40, max: 0.50, step: 0.02, val: 0.15, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '双眼皮深', targetId: 'vcd-eye-crease', fallbackId: 'morph-eye-crease', min: 0, max: 0.65, step: 0.02, val: 0.25, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '卧蚕饱满', targetId: 'vcd-eye-bag', fallbackId: 'morph-eye-bag', min: 0, max: 0.65, step: 0.02, val: 0.20, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '虹膜大小', targetId: 'vcd-iris-scale', fallbackId: 'morph-iris-scale', min: 0.78, max: 1.25, step: 0.01, val: 1.02, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '瞳孔缩放', targetId: 'vcd-pupil-size', fallbackId: 'morph-pupil-size', min: 0.55, max: 1.45, step: 0.02, val: 1.00, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '虹膜通透', targetId: 'vcd-iris-brightness', fallbackId: 'slider-iris-brightness', min: 0.60, max: 1.80, step: 0.02, val: 1.15, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '美瞳暗环', targetId: 'vcd-limbal-ring', fallbackId: 'slider-limbal-ring', min: 0.20, max: 1.50, step: 0.02, val: 0.90, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '眼白清澈', targetId: 'vcd-sclera-brightness', fallbackId: 'slider-sclera-brightness', min: 0.75, max: 1.35, step: 0.02, val: 1.08, fmt: 'pct' })}
          </div>
        </details>

        <details class="obs-accordion">
          <summary>面部骨相精雕 (8项)</summary>
          <div class="obs-accordion-body">
            ${makeShortSliderRow({ label: '下颌V线', targetId: 'morph-jaw', min: -0.50, max: 0.60, step: 0.02, val: -0.08, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '下巴长度', targetId: 'morph-chin', min: -0.45, max: 0.50, step: 0.02, val: -0.04, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '面颊胶原', targetId: 'morph-cheek', min: -0.45, max: 0.55, step: 0.02, val: 0.16, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '鼻梁高度', targetId: 'morph-nose', min: -0.45, max: 0.55, step: 0.02, val: 0.04, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '鼻翼宽窄', targetId: 'morph-nose-width', min: -0.45, max: 0.45, step: 0.02, val: 0.04, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '嘴唇丰满', targetId: 'morph-lip', min: -0.40, max: 0.55, step: 0.02, val: 0.08, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '嘴角笑意', targetId: 'morph-mouth-smile', min: -0.45, max: 0.45, step: 0.02, val: 0.06, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '额头高度', targetId: 'morph-forehead', min: -0.35, max: 0.45, step: 0.02, val: 0.04, fmt: 'signed' })}
          </div>
        </details>
      </div>

      <!-- ==================== TAB 4: 肤质与断面 (MATERIAL & ANATOMY) ==================== -->
      <div class="obs-pane" data-obs-pane="material">
        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">6款超写实皮肤材质方案</span>
          </div>
          <div class="obs-pill-grid" id="obs-realism-preset-pills">
            <button class="obs-choice-pill active" data-realism="dlss5_bare_scholar">素颜哑光瓷肌</button>
            <button class="obs-choice-pill" data-realism="dlss5_dewy_peach">水光蜜桃胶原</button>
            <button class="obs-choice-pill" data-realism="dlss5_chaebol_velvet">财阀冷白丝绒</button>
            <button class="obs-choice-pill" data-realism="dlss5_jiangnan_jade">江南羊脂白玉</button>
            <button class="obs-choice-pill" data-realism="dlss5_forensic_specimen">法医冰鲜冷瓷</button>
            <button class="obs-choice-pill" data-realism="dlss5_editorial_glam">8K画报精修肌</button>
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">眼线款式与高定彩妆</span>
          </div>
          <div class="obs-pill-grid" style="margin-bottom:8px;" data-mod-select="sel-eyeliner-style">
            <button class="obs-choice-pill active" data-val="0">纯净素颜裸睑</button>
            <button class="obs-choice-pill" data-val="1">隐形内眼线</button>
            <button class="obs-choice-pill" data-val="2">自然细眼尾</button>
            <button class="obs-choice-pill" data-val="3">微挑猫眼线</button>
            <button class="obs-choice-pill" data-val="4">无辜下至线</button>
          </div>
          <div class="obs-swatch-row" style="justify-content:space-between;">
            <label style="font-size:11px;color:var(--obs-text-secondary);display:flex;align-items:center;gap:4px;">肤色 <input type="color" data-obs-color="col-skin" value="#fae3d2" style="width:20px;height:20px;border:none;background:none;"/></label>
            <label style="font-size:11px;color:var(--obs-text-secondary);display:flex;align-items:center;gap:4px;">唇彩 <input type="color" data-obs-color="col-lip" value="#c45866" style="width:20px;height:20px;border:none;background:none;"/></label>
            <label style="font-size:11px;color:var(--obs-text-secondary);display:flex;align-items:center;gap:4px;">腮红 <input type="color" data-obs-color="col-blush" value="#e87a88" style="width:20px;height:20px;border:none;background:none;"/></label>
            <label style="font-size:11px;color:var(--obs-text-secondary);display:flex;align-items:center;gap:4px;">眼影 <input type="color" data-obs-color="col-eyeshadow" value="#c88278" style="width:20px;height:20px;border:none;background:none;"/></label>
          </div>
        </div>

        <details class="obs-accordion" open>
          <summary>真皮微距与彩妆浓度 (11项)</summary>
          <div class="obs-accordion-body">
            ${makeShortSliderRow({ label: '毛孔法线', targetId: 'slider-normal-map-strength', min: 0, max: 1.0, step: 0.02, val: 0.26, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '毛孔深度', targetId: 'slider-pore-relief', min: 0, max: 1.0, step: 0.02, val: 0.24, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '表皮哑光', targetId: 'slider-skin-roughness', min: 0.15, max: 0.85, step: 0.02, val: 0.38, fmt: 'pct' })}
            ${makeShortSliderRow({ label: 'T区水光', targetId: 'slider-tzone-oiliness', min: 0, max: 1.0, step: 0.02, val: 0.30, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '散射深度', targetId: 'slider-char-sss-depth', min: 0, max: 1.5, step: 0.02, val: 0.80, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '面颊绒毛', targetId: 'slider-vellus-fuzz', min: 0, max: 1.0, step: 0.02, val: 0.36, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '唇彩浓度', targetId: 'slider-lip-strength', min: 0, max: 1.0, step: 0.02, val: 0.38, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '唇部水光', targetId: 'slider-lip-gloss', min: 0, max: 1.0, step: 0.02, val: 0.48, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '腮红微醺', targetId: 'slider-blush', min: 0, max: 1.0, step: 0.02, val: 0.22, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '眼影晕染', targetId: 'slider-eyeshadow', min: 0, max: 1.0, step: 0.02, val: 0.0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '眼线浓度', targetId: 'slider-eyeliner-strength', min: 0, max: 1.0, step: 0.02, val: 0.0, fmt: 'pct' })}
          </div>
        </details>

        <details class="obs-accordion">
          <summary>解剖断面与鲜血流体 (8项)</summary>
          <div class="obs-accordion-body">
            ${makeShortSliderRow({ label: '颈部血迹', targetId: 'slider-neck-blood', min: 0, max: 1.5, step: 0.02, val: 0.82, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '鼻血浓度', targetId: 'slider-nosebleed', min: 0, max: 1.5, step: 0.02, val: 0.0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '血泪浓度', targetId: 'slider-tear-track', min: 0, max: 1.5, step: 0.02, val: 0.0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '嘴角溢血', targetId: 'slider-mouth-blood', min: 0, max: 1.5, step: 0.02, val: 0.0, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '面部血溅', targetId: 'slider-face-splatter', min: 0, max: 1.5, step: 0.02, val: 0.22, fmt: 'pct' })}
            ${makeShortSliderRow({ label: '切口高度', targetId: 'morph-cut-height', min: -1.2, max: 1.5, step: 0.05, val: 0.0, fmt: 'signed' })}
            ${makeShortSliderRow({ label: '切面倾角', targetId: 'morph-cut-pitch', min: -18, max: 18, step: 0.5, val: 0.0, fmt: 'raw' })}
            ${makeShortSliderRow({ label: '断面湿润', targetId: 'slider-anatomy-wetness', min: 0.1, max: 1.0, step: 0.02, val: 0.92, fmt: 'pct' })}
          </div>
        </details>
      </div>

      <!-- ==================== TAB 5: 建筑与滤镜 (ARCHITECTURE & DESKTOP PET FILTERS) ==================== -->
      <div class="obs-pane" data-obs-pane="arch_filter">
        <div class="obs-section" style="border-color:rgba(56,189,248,0.55);">
          <div class="obs-sec-head">
            <span class="obs-sec-title" style="color:#bae6fd;">🐾 桌面宠物模式与3D地板防遮挡开关</span>
            <button type="button" id="obs-btn-toggle-pet-mode" class="obs-icon-btn" style="border-color:#38bdf8;color:#e0f2fe;">切换纯净桌宠无地板</button>
          </div>
          <div style="font-size:11.5px;color:#cbd5e1;margin-bottom:8px;">
            已修复3D地板向屏幕上方透视遮挡显示器画面的问题；开启「纯净桌宠无地板」即可隐藏全部3D案台与书架，让头颅悬浮/安放在透明桌面上。
          </div>
          <div class="obs-sec-sub" style="margin-bottom:5px;">3D案台/地板材质切换</div>
          <div class="obs-pill-grid" id="obs-floor-style-pills" style="margin-bottom:8px;">
            <button class="obs-choice-pill active" data-floor-style="walnut_desk">🪵 核桃木案台</button>
            <button class="obs-choice-pill" data-floor-style="dark_obsidian">🖤 黑曜石展台</button>
            <button class="obs-choice-pill" data-floor-style="marble_museum">🏛️ 卢浮宫白玉</button>
            <button class="obs-choice-pill" data-floor-style="surgical_steel">🔬 法医不锈钢</button>
            <button class="obs-choice-pill" data-floor-style="none">🐾 无地板纯透明</button>
          </div>
          <div class="obs-sec-sub" style="margin-bottom:5px;">3D多格陈列架建筑布局</div>
          <div class="obs-pill-grid" id="obs-shelf-layout-pills" style="margin-bottom:8px;">
            <button class="obs-choice-pill active" data-shelf-layout="study_side_rack">📚 双侧伴学博古架</button>
            <button class="obs-choice-pill" data-shelf-layout="museum_tiered">🏛️ 博物馆三层阶梯台</button>
            <button class="obs-choice-pill" data-shelf-layout="pillar_colonnade">🏺 凯旋科林斯柱阵</button>
            <button class="obs-choice-pill" data-shelf-layout="none">✨ 无展架开阔桌面</button>
          </div>
          <div class="obs-sec-sub" style="margin-bottom:5px;">一键桌面阵型排布</div>
          <div class="obs-pill-grid" id="obs-formation-pills">
            <button class="obs-choice-pill" data-formation="study_sides">📐 伴学分列两侧</button>
            <button class="obs-choice-pill" data-formation="bottom_row">📏 底部一字排开</button>
            <button class="obs-choice-pill" data-formation="altar_pyramid">👑 祭坛金字塔阵</button>
            <button class="obs-choice-pill" data-formation="macro_focus">🔍 居中微距特写</button>
          </div>
        </div>

        <div class="obs-section">
          <div class="obs-sec-head">
            <span class="obs-sec-title">🏛️ 放置独立3D头颅收纳容器与伴学道具</span>
          </div>
          <div class="obs-sec-sub" style="margin-bottom:5px;">点击即可在桌面新增或为当前选中标本装配3D容器</div>
          <div class="obs-pill-grid" id="obs-place-container-pills" style="margin-bottom:8px;">
            <button class="obs-choice-pill" data-place-container="glass_bell_jar">🔔 博物馆玻璃钟罩</button>
            <button class="obs-choice-pill" data-place-container="velvet_chalice">🍷 丝绒高脚圣杯底座</button>
            <button class="obs-choice-pill" data-place-container="formalin_cylinder">🧪 福尔马林玻璃标本罐</button>
            <button class="obs-choice-pill" data-place-container="acrylic_cube">🧊 亚克力防尘展盒</button>
            <button class="obs-choice-pill" data-place-container="surgical_tray">🩺 法医不锈钢解剖盘</button>
          </div>
          <div class="obs-sec-sub" style="margin-bottom:5px;">当前标本伴学装饰物切换</div>
          <div class="obs-pill-grid" id="obs-decor-prop-pills">
            <button class="obs-choice-pill active" data-decor-style="study_tomes">📖 伴学古籍与金笔</button>
            <button class="obs-choice-pill" data-decor-style="trophy_candles">🕯️ 哥特祭坛烛台</button>
            <button class="obs-choice-pill" data-decor-style="soul_siphon">⚡ 脑波汲取导管</button>
            <button class="obs-choice-pill" data-decor-style="forensic_evidence">🏷️ 法医物证号牌</button>
            <button class="obs-choice-pill" data-decor-style="none">✨ 无装饰物</button>
          </div>
        </div>

        <div class="obs-section" style="border-color:rgba(167,139,250,0.55);">
          <div class="obs-sec-head">
            <span class="obs-sec-title" style="color:#ddd6fe;">🌫️ 桌面宠物后期模糊滤镜 (6种光学模糊)</span>
            <span id="obs-blur-current-label" class="obs-sec-sub">无模糊 (4K超清锐利)</span>
          </div>
          <div class="obs-pill-grid" id="obs-pet-blur-pills" style="margin-bottom:10px;">
            ${DESKTOP_PET_BLUR_MODES.map((bm, idx) => `
              <button class="obs-choice-pill ${idx === 0 ? 'active' : ''}" data-pet-blur="${bm.id}">${bm.label}</button>
            `).join('')}
          </div>
          <div class="obs-slider-row">
            <span>模糊强度</span>
            <input type="range" id="obs-pet-blur-power" min="0" max="1.2" step="0.02" value="0.55" />
            <span id="obs-pet-blur-power-val">55%</span>
          </div>
          <div class="obs-slider-row">
            <span>清晰焦点高度</span>
            <input type="range" id="obs-pet-blur-focus-y" min="0.15" max="0.85" step="0.02" value="0.52" />
            <span id="obs-pet-blur-focus-y-val">52%</span>
          </div>
        </div>

        <div class="obs-section" style="border-color:rgba(244,114,182,0.55);">
          <div class="obs-sec-head">
            <span class="obs-sec-title" style="color:#fbcfe8;">🎞️ 桌面宠物光影与胶片滤镜 (12款光影色调)</span>
            <span id="obs-filter-current-label" class="obs-sec-sub">原片直出</span>
          </div>
          <div class="obs-pill-grid" id="obs-pet-filter-pills" style="margin-bottom:10px;">
            ${DESKTOP_PET_FILTER_PRESETS.map((fp, idx) => `
              <button class="obs-choice-pill ${idx === 0 ? 'active' : ''}" data-pet-filter="${fp.id}">${fp.label}</button>
            `).join('')}
          </div>
          <div class="obs-sec-sub" style="margin-bottom:5px;">影棚散景背景切换 (或保持透明桌宠底)</div>
          <div class="obs-pill-grid" id="obs-backdrop-preset-pills">
            <button class="obs-choice-pill active" data-backdrop-id="transparent">🪟 透明桌宠底 (默认)</button>
            ${BACKGROUNDS_LIST.map((bg) => `
              <button class="obs-choice-pill" data-backdrop-id="${bg.id}">🎨 ${bg.name}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(studio);

  // Wire all interactive events inside #obsidian-char-hair-studio
  wireObsidianStudioEvents(studio);

  // Hook into window.__syncVcdSelectedPetUI so clicking a desktop pet updates card selection
  const origSync = window.__syncVcdSelectedPetUI;
  if (typeof origSync === 'function') {
    window.__syncVcdSelectedPetUI = function (...args) {
      const res = origSync.apply(this, args);
      syncObsidianCardsFromDOM(studio);
      return res;
    };
  }
  syncObsidianCardsFromDOM(studio);
}

function syncObsidianCardsFromDOM(studio) {
  const hs = document.getElementById('vcd-hair-style')?.value || document.getElementById('sel-hair-style')?.value;
  if (hs) {
    studio.querySelectorAll('#obs-hair-card-grid .obs-visual-card').forEach((c) => {
      const match = c.dataset.hairId === hs;
      c.classList.toggle('active', match);
      if (match) {
        const lbl = document.getElementById('obs-hair-current-label');
        if (lbl) lbl.textContent = c.querySelector('.obs-card-title')?.textContent || hs;
      }
    });
  }
  const skin = document.getElementById('vcd-skin-variant')?.value || document.getElementById('sel-skin-variant')?.value;
  if (skin) {
    studio.querySelectorAll('#obs-skin-card-grid .obs-visual-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.skinId === skin);
    });
  }
  const arch = document.getElementById('vcd-sel-face-archetype')?.value || document.getElementById('sel-face-archetype')?.value;
  if (arch) {
    studio.querySelectorAll('#obs-char-card-grid .obs-visual-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.charArch === arch);
    });
  }
  const brow = document.getElementById('vcd-sel-eyebrow-style')?.value || document.getElementById('sel-eyebrow-style')?.value;
  if (brow) {
    studio.querySelectorAll('#obs-brow-card-grid .obs-visual-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.browId === brow);
    });
  }

  // Sync Character Placard Settings (Photo, Name, Age, Brief Story)
  const qa = window.__cervixQA;
  if (qa && typeof qa.getActiveCollectible === 'function') {
    const col = qa.getActiveCollectible();
    if (col) {
      syncPlacardEditorFromCollectible(col);
    }
  }
}

function syncPlacardEditorFromCollectible(col) {
  if (!col) return;
  const qa = window.__cervixQA;
  const baseShortName = (col.name || '').split('·')[0].trim();
  const displayName = col.customDisplayName || baseShortName;
  const displayAge = col.customAge || col.fateRecord?.ageAtCollection || '19岁';
  const briefStory = col.customBriefStory || col.customContrastText || col.fateRecord?.cause || col.subtitle || '静默案头藏品 · 任由主人端详摆布';
  const photoSrc = qa?.resolveCollectibleLifePhotoSrc ? qa.resolveCollectibleLifePhotoSrc(col) : (col.customLifePhotoUrl || '');

  const nameInp = document.getElementById('obs-placard-name-input');
  if (nameInp && document.activeElement !== nameInp) nameInp.value = displayName;
  const ageInp = document.getElementById('obs-placard-age-input');
  if (ageInp && document.activeElement !== ageInp) ageInp.value = displayAge;
  const storyInp = document.getElementById('obs-placard-story-input');
  if (storyInp && document.activeElement !== storyInp) storyInp.value = briefStory;
  const photoImg = document.getElementById('obs-placard-photo-preview');
  if (photoImg && photoSrc) photoImg.src = photoSrc;
}
window.__syncPlacardEditorFields = syncPlacardEditorFromCollectible;

function transformTopOverlayBar() {
  const bar = document.getElementById('desktop-overlay-bar');
  if (!bar) return;

  const brandStrong = bar.querySelector('.overlay-brand strong');
  if (brandStrong) brandStrong.textContent = 'CERVIX PRO';

  const actions = bar.querySelector('.overlay-actions');
  if (!actions) return;

  // Create primary "✦ 人物与发型" button in the dock
  let btnStudio = document.getElementById('btn-open-obsidian-studio');
  if (!btnStudio) {
    btnStudio = document.createElement('button');
    btnStudio.id = 'btn-open-obsidian-studio';
    btnStudio.className = 'overlay-btn obs-primary-pill';
    btnStudio.textContent = '✦ 人物与发型';
    actions.insertBefore(btnStudio, actions.firstChild);
  }

  // Keep primary buttons (including 46-essay Comfort Reader, Architecture, Placard Toggle, Desktop Pet Mode) directly on top bar!
  const coreLabels = {
    'btn-open-comfort-reader': '📖 宽心作文手札 (46篇)',
    'btn-quick-place-container': '🏛️ 建筑与展柜',
    'btn-quick-placards': '🏷️ 标牌显隐',
    'btn-visual-repair': '画风调制',
    'btn-toggle-window': '颅相工坊',
    'btn-quick-customizer': '光影镜头',
    'btn-quick-pure-screen': '纯享画面',
  };
  Object.entries(coreLabels).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
      el.removeAttribute('style');
      el.classList.remove('hidden');
      actions.appendChild(el);
    }
  });

  // Add 1-click Desktop Pet Mode (no floor blocking monitor screen) button directly on top bar
  let btnPetMode = document.getElementById('btn-desktop-pet-mode-toggle');
  if (!btnPetMode) {
    btnPetMode = document.createElement('button');
    btnPetMode.id = 'btn-desktop-pet-mode-toggle';
    btnPetMode.className = 'overlay-btn';
    btnPetMode.title = '一键切换纯净桌面宠物模式（隐藏3D地板/展架，绝不遮挡显示器画面）';
    btnPetMode.textContent = '🐾 桌宠无地板';
    actions.appendChild(btnPetMode);
  }

  // Add inline Desktop Pet Blur Mode selector & Lighting/Film Filter selector directly on top bar
  let blurSelect = document.getElementById('top-pet-blur-select');
  if (!blurSelect) {
    blurSelect = document.createElement('select');
    blurSelect.id = 'top-pet-blur-select';
    blurSelect.className = 'obs-top-select';
    blurSelect.title = '桌面宠物后期模糊模式切换';
    blurSelect.innerHTML = DESKTOP_PET_BLUR_MODES.map(
      (bm) => `<option value="${bm.id}">🌫️ ${bm.label.split(' ')[0]}</option>`
    ).join('');
    actions.appendChild(blurSelect);
  }

  let filterSelect = document.getElementById('top-pet-filter-select');
  if (!filterSelect) {
    filterSelect = document.createElement('select');
    filterSelect.id = 'top-pet-filter-select';
    filterSelect.className = 'obs-top-select';
    filterSelect.title = '桌面宠物光影与色调滤镜切换';
    filterSelect.innerHTML = DESKTOP_PET_FILTER_PRESETS.map(
      (fp) => `<option value="${fp.id}">${fp.label}</option>`
    ).join('');
    actions.appendChild(filterSelect);
  }

  // Shorten tactile mode button labels using [data-tactile-mode]
  const tactileModes = {
    move: '移动',
    pinch_face: '捏脸',
    roll_eyeball: '瞳孔',
    groom_hair: '拨发',
    bow_gaze: '姿态',
    paint_fluid: '流体',
  };
  Object.entries(tactileModes).forEach(([mode, text]) => {
    const el = bar.querySelector(`[data-tactile-mode="${mode}"]`);
    if (el) {
      el.textContent = text;
      el.removeAttribute('style');
    }
  });

  // Move secondary utility buttons into #obs-more-popover
  const secondaryIds = [
    ['btn-open-puzzle-hub', '🏆 积分与整备台'],
    ['btn-desktop-superiority-pulse', '👑 一键泄压'],
    ['btn-desktop-lookdown-view', '📐 俯视视角'],
    ['btn-quick-ultra-crisp', '🔪 4K超清'],
    ['btn-quick-chiaroscuro', '🌓 强光影'],
    ['btn-quick-postfx', '🎞️ 胶片调色'],
    ['btn-quick-dyn-light', '🌅 慢速流光'],
    ['btn-quick-rain-study', '🌧️ 雨声伴学'],
    ['btn-quick-gravity', '🍎 物理重力'],
    ['btn-quick-dock-window', '◧ 右侧停靠'],
    ['btn-quick-pets-top', '📌 桌宠置顶'],
    ['btn-quick-box-grid', '🕸️ 透视网格'],
    ['btn-quick-bg-mode', '🖼️ 背景切换'],
    ['btn-quick-mute', '🔊 音效开关'],
  ];

  const moreWrap = document.createElement('div');
  moreWrap.id = 'obs-more-wrap';
  const moreBtn = document.createElement('button');
  moreBtn.id = 'btn-obsidian-more-menu';
  moreBtn.className = 'overlay-btn';
  moreBtn.textContent = '更多工具 ▾';

  const popover = document.createElement('div');
  popover.id = 'obs-more-popover';
  popover.className = 'hidden';

  secondaryIds.forEach(([id, cleanLabel]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.textContent = cleanLabel;
      btn.removeAttribute('style');
      btn.classList.remove('hidden');
      popover.appendChild(btn);
    }
  });

  moreWrap.appendChild(moreBtn);
  moreWrap.appendChild(popover);
  actions.appendChild(moreWrap);

  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popover.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!moreWrap.contains(e.target)) {
      popover.classList.add('hidden');
    }
  });
}

function cleanExistingVerboseLabels() {
  // 1. Keep #visual-customizer-drawer sections visible so users can access 61 hairstyles & 38 head blends from any drawer
  const vcd = document.getElementById('visual-customizer-drawer');
  if (vcd) {
    const sections = vcd.querySelectorAll('.vcd-section');
    sections.forEach((sec) => {
      sec.style.display = '';
    });
    const headerTitle = vcd.querySelector('.vcd-title');
    if (headerTitle) headerTitle.textContent = '全功能快捷微调 · 38头模混合 / 61发型 / 光影';
  }

  // 2. Clean main software window navigation tabs & titlebar
  const winTitle = document.querySelector('#window-titlebar .win-title');
  if (winTitle) winTitle.textContent = 'CERVIX 3D · 标本典藏与颅相工坊';
  const navTabTitles = {
    vault: '标本典藏库',
    studio: '3D 颅相工坊',
    blueprint: '照片特征对位',
    archive: '本地典藏包',
  };
  document.querySelectorAll('#software-tabs .nav-tab').forEach((tab) => {
    const key = tab.dataset.tab;
    const tEl = tab.querySelector('.tab-title');
    if (tEl && navTabTitles[key]) tEl.textContent = navTabTitles[key];
  });

  // 3. Clean Studio right-column subtabs
  const subtabTitles = {
    base: '基底人像',
    morph: '眉眼骨相',
    skin: '真皮彩妆',
    hair: '发型高定',
    anatomy: '解剖流体',
    export: '光影出库',
  };
  document.querySelectorAll('#studio-right-subtabs .studio-subtab-btn').forEach((btn) => {
    const key = btn.dataset.studioSubtab;
    if (subtabTitles[key]) btn.textContent = subtabTitles[key];
  });
  const expandBtn = document.getElementById('btn-studio-expand-all');
  if (expandBtn) expandBtn.textContent = '展开全部';

  // 4. Clean Start Game Overlay
  const startTitle = document.querySelector('#start-game-overlay h1');
  if (startTitle) startTitle.textContent = 'CERVIX 3D · 桌面标本陈列室';
  const startBadge = document.querySelector('#start-game-overlay .start-badge');
  if (startBadge) startBadge.textContent = 'OBSIDIAN PRO · EDITION';
  const btnPure = document.getElementById('btn-start-pure-desktop');
  if (btnPure) btnPure.textContent = '进入桌面陈列室';
  const btnWithStudio = document.getElementById('btn-start-with-studio');
  if (btnWithStudio) btnWithStudio.textContent = '打开 3D 颅相工坊';

  // 5. Strip only parenthetical English notes from .slider-row > span:first-child WITHOUT truncating Chinese labels!
  document.querySelectorAll('.slider-row > span:first-child').forEach((span) => {
    const raw = (span.textContent || '').trim();
    if (!raw) return;
    const cleaned = raw
      .replace(/[\(（][^\)）]*[\)）]/g, '')
      .replace(/^[0-9\.\s·•✦❖]+/u, '')
      .trim();
    if (cleaned) {
      span.textContent = cleaned;
    }
  });
}

function wireObsidianStudioEvents(studio) {
  const btnOpen = document.getElementById('btn-open-obsidian-studio');
  const btnClose = document.getElementById('btn-obs-close-studio');
  const btnOpen3D = document.getElementById('btn-obs-open-3d-workbench');
  const targetSelect = document.getElementById('obs-target-select');

  const refreshTargetDropdown = () => {
    const vcdTarget = document.getElementById('vcd-target-pet-select');
    if (vcdTarget && targetSelect) {
      const currentVal = targetSelect.value;
      targetSelect.innerHTML = vcdTarget.innerHTML;
      if ([...targetSelect.options].some((o) => o.value === currentVal)) {
        targetSelect.value = currentVal;
      }
    }
  };

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      refreshTargetDropdown();
      syncObsidianCardsFromDOM(studio);
      const willOpen = studio.classList.contains('hidden');
      if (willOpen) {
        document.getElementById('visual-customizer-drawer')?.classList.add('hidden');
      }
      studio.classList.toggle('hidden');
      btnOpen.classList.toggle('active-top', !studio.classList.contains('hidden'));
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      studio.classList.add('hidden');
      btnOpen?.classList.remove('active-top');
    });
  }

  if (btnOpen3D) {
    btnOpen3D.addEventListener('click', () => {
      studio.classList.add('hidden');
      btnOpen?.classList.remove('active-top');
      const win = document.getElementById('software-window');
      if (win && (win.classList.contains('window-hidden') || win.classList.contains('hidden'))) {
        document.getElementById('btn-toggle-window')?.click();
      }
      const studioTab = document.querySelector('#software-tabs .nav-tab[data-tab="studio"]');
      studioTab?.click();
    });
  }

  if (targetSelect) {
    targetSelect.addEventListener('change', () => {
      setFormValueAndTrigger('vcd-target-pet-select', targetSelect.value, 'change');
    });
  }

  // Tab switching
  studio.querySelectorAll('.obs-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.obsTab;
      studio.querySelectorAll('.obs-tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
      studio.querySelectorAll('.obs-pane').forEach((p) => p.classList.toggle('active', p.dataset.obsPane === tab));
    });
  });

  // Hairstyle category filter (including ✨ 新增32款 'new32')
  studio.querySelectorAll('#obs-hair-cat-strip .obs-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.hairCat;
      studio.querySelectorAll('#obs-hair-cat-strip .obs-filter-pill').forEach((p) => p.classList.toggle('active', p === pill));
      studio.querySelectorAll('#obs-hair-card-grid .obs-visual-card').forEach((card) => {
        const match = cat === 'all' || (cat === 'new32' ? card.dataset.hairNew === '1' : card.dataset.hairCat === cat);
        card.style.display = match ? 'flex' : 'none';
      });
    });
  });

  // 29 Hairstyle visual cards click -> update BOTH desktop pet & studio head
  studio.querySelectorAll('#obs-hair-card-grid .obs-visual-card').forEach((card) => {
    card.addEventListener('click', () => {
      const hairId = card.dataset.hairId;
      studio.querySelectorAll('#obs-hair-card-grid .obs-visual-card').forEach((c) => c.classList.toggle('active', c === card));
      const label = document.getElementById('obs-hair-current-label');
      if (label) label.textContent = card.querySelector('.obs-card-title')?.textContent || hairId;
      setFormValueAndTrigger('vcd-hair-style', hairId, 'change');
      setFormValueAndTrigger('sel-hair-style', hairId, 'change');
    });
  });

  // 4-Zone Modular Hair pill selectors
  studio.querySelectorAll('[data-mod-select]').forEach((group) => {
    const selectId = group.dataset.modSelect;
    const fallbackId = group.dataset.modFallback;
    group.querySelectorAll('.obs-choice-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
        setFormValueAndTrigger(selectId, pill.dataset.val, 'change');
        if (fallbackId) setFormValueAndTrigger(fallbackId, pill.dataset.val, 'change');
      });
    });
  });

  // Bound <select> elements
  studio.querySelectorAll('select[data-obs-bind]').forEach((sel) => {
    sel.addEventListener('change', () => {
      setFormValueAndTrigger(sel.dataset.obsBind, sel.value, 'change');
      if (sel.dataset.obsFallback) {
        setFormValueAndTrigger(sel.dataset.obsFallback, sel.value, 'change');
      }
    });
  });

  // Reset modular hair
  document.getElementById('obs-btn-reset-mod-hair')?.addEventListener('click', () => {
    setFormValueAndTrigger('vcd-hair-top', 'default', 'change');
    setFormValueAndTrigger('vcd-hair-bangs', 'default', 'change');
    setFormValueAndTrigger('vcd-hair-sidelocks', 'default', 'change');
    setFormValueAndTrigger('vcd-hair-back', 'none', 'change');
    document.getElementById('btn-reset-hair-morphs')?.click();
    studio.querySelectorAll('[data-mod-select]').forEach((g) => {
      g.querySelectorAll('.obs-choice-pill').forEach((p, idx) => p.classList.toggle('active', idx === 0));
    });
    studio.querySelector('select[data-obs-bind="vcd-hair-top"]').value = 'default';
    studio.querySelector('select[data-obs-bind="vcd-hair-back"]').value = 'none';
  });

  // Hair color swatches & pickers
  studio.querySelectorAll('#obs-hair-swatches .obs-color-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const hex = dot.dataset.hairHex;
      studio.querySelectorAll('#obs-hair-swatches .obs-color-dot').forEach((d) => d.classList.toggle('active', d === dot));
      const mainPicker = document.getElementById('obs-hair-main-color');
      if (mainPicker) mainPicker.value = hex;
      setFormValueAndTrigger('col-hair', hex, 'input');
    });
  });

  document.getElementById('obs-hair-main-color')?.addEventListener('input', (e) => {
    setFormValueAndTrigger('col-hair', e.target.value, 'input');
  });
  document.getElementById('obs-hair-tip-color')?.addEventListener('input', (e) => {
    setFormValueAndTrigger('col-hair-tip', e.target.value, 'input');
  });

  // Character regional filter pills (cn / kr / jp / mix)
  studio.querySelectorAll('#obs-char-region-strip .obs-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const reg = pill.dataset.charRegion;
      studio.querySelectorAll('#obs-char-region-strip .obs-filter-pill').forEach((p) => p.classList.toggle('active', p === pill));
      studio.querySelectorAll('#obs-char-card-grid .obs-visual-card').forEach((card) => {
        const match = reg === 'all' || card.dataset.charRegion === reg;
        card.style.display = match ? 'flex' : 'none';
      });
    });
  });

  // 38 Character archetype cards
  studio.querySelectorAll('#obs-char-card-grid .obs-visual-card').forEach((card) => {
    card.addEventListener('click', () => {
      const archId = card.dataset.charArch;
      studio.querySelectorAll('#obs-char-card-grid .obs-visual-card').forEach((c) => c.classList.toggle('active', c === card));
      const lbl = document.getElementById('obs-char-current-label');
      if (lbl) lbl.textContent = card.querySelector('.obs-card-title')?.textContent || archId;
      setFormValueAndTrigger('vcd-sel-face-archetype', archId, 'change');
      setFormValueAndTrigger('sel-face-archetype', archId, 'change');
    });
  });

  // 8 Skin cards
  studio.querySelectorAll('#obs-skin-card-grid .obs-visual-card').forEach((card) => {
    card.addEventListener('click', () => {
      const skinId = card.dataset.skinId;
      studio.querySelectorAll('#obs-skin-card-grid .obs-visual-card').forEach((c) => c.classList.toggle('active', c === card));
      setFormValueAndTrigger('vcd-skin-variant', skinId, 'change');
      setFormValueAndTrigger('sel-skin-variant', skinId, 'change');
    });
  });

  // 7 Expression pills
  studio.querySelectorAll('#obs-expr-pill-grid .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const exprId = pill.dataset.exprId;
      studio.querySelectorAll('#obs-expr-pill-grid .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      const origExprBtn = document.querySelector(`[data-expr="${exprId}"]`);
      origExprBtn?.click();
    });
  });

  // Stage 65: 38-Model Multi-Head Blend Matrix (ON/OFF Switches + Weight Sliders + Regional Filter + Random Mix)
  const updateObsBlendActiveBadge = () => {
    let activeCount = 0;
    studio.querySelectorAll('[data-obs-blend-val]').forEach((inp) => {
      const k = inp.dataset.obsBlendVal;
      const v = parseFloat(inp.value) || 0;
      const isOn = v > 0.005;
      if (isOn) activeCount++;
      const row = studio.querySelector(`[data-obs-blend-row="${k}"]`);
      if (row) {
        row.style.borderColor = isOn ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.05)';
        row.style.background = isOn ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.03)';
      }
    });
    const badge = document.getElementById('obs-blend-active-count');
    if (badge) badge.textContent = `已开启 ${activeCount} / ${HEAD_BLEND_CHANNELS.length} 款`;
  };

  const applyObsBlendChannelValue = (k, v) => {
    const numV = Math.max(0, Math.min(1, parseFloat(v) || 0));
    const isOn = numV > 0.005;
    const obsInp = studio.querySelector(`[data-obs-blend-val="${k}"]`);
    if (obsInp) {
      if (numV > 0.01) obsInp.dataset.lastWeight = String(numV);
      obsInp.value = String(numV);
    }
    const obsChk = studio.querySelector(`[data-obs-blend-on="${k}"]`);
    if (obsChk) obsChk.checked = isOn;
    const obsTxt = studio.querySelector(`[data-obs-blend-txt="${k}"]`);
    if (obsTxt) obsTxt.textContent = `${Math.round(numV * 100)}%`;

    const vcdInp = document.querySelector(`[data-head-blend="${k}"]`);
    if (vcdInp) {
      vcdInp.value = String(numV);
      vcdInp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const stuInp = document.querySelector(`[data-studio-head-blend="${k}"]`);
    if (stuInp) {
      stuInp.value = String(numV);
      stuInp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    updateObsBlendActiveBadge();
  };

  studio.querySelectorAll('[data-obs-blend-val]').forEach((inp) => {
    inp.addEventListener('input', () => {
      applyObsBlendChannelValue(inp.dataset.obsBlendVal, inp.value);
    });
  });

  studio.querySelectorAll('[data-obs-blend-on]').forEach((chk) => {
    chk.addEventListener('change', () => {
      const k = chk.dataset.obsBlendOn;
      const inp = studio.querySelector(`[data-obs-blend-val="${k}"]`);
      if (chk.checked) {
        const w = (inp && parseFloat(inp.value) > 0.01) ? inp.value : (inp?.dataset.lastWeight || '0.50');
        applyObsBlendChannelValue(k, w);
      } else {
        if (inp && parseFloat(inp.value) > 0.01) inp.dataset.lastWeight = inp.value;
        applyObsBlendChannelValue(k, 0);
      }
    });
  });

  studio.querySelectorAll('#obs-blend-region-strip .obs-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.blendFilter;
      studio.querySelectorAll('#obs-blend-region-strip .obs-filter-pill').forEach((p) => p.classList.toggle('active', p === pill));
      studio.querySelectorAll('#obs-head-blend-38-list .obs-blend-38-row').forEach((row) => {
        const k = row.dataset.obsBlendRow;
        const inp = row.querySelector(`[data-obs-blend-val="${k}"]`);
        const isOn = inp && parseFloat(inp.value) > 0.005;
        const match = filter === 'all' || (filter === 'active' ? isOn : row.dataset.obsBlendRegion === filter);
        row.style.display = match ? 'grid' : 'none';
      });
    });
  });

  document.getElementById('obs-btn-zero-blend')?.addEventListener('click', () => {
    document.getElementById('btn-vcd-reset-blend')?.click();
    studio.querySelectorAll('[data-obs-blend-val]').forEach((inp) => {
      const k = inp.dataset.obsBlendVal;
      inp.value = '0';
      const chk = studio.querySelector(`[data-obs-blend-on="${k}"]`);
      if (chk) chk.checked = false;
      const txt = studio.querySelector(`[data-obs-blend-txt="${k}"]`);
      if (txt) txt.textContent = '0%';
    });
    updateObsBlendActiveBadge();
  });

  document.getElementById('obs-btn-random-blend-2')?.addEventListener('click', () => {
    document.getElementById('btn-vcd-reset-blend')?.click();
    const n = HEAD_BLEND_CHANNELS.length;
    const i1 = Math.floor(Math.random() * n);
    let i2 = Math.floor(Math.random() * (n - 1));
    if (i2 >= i1) i2++;
    applyObsBlendChannelValue(HEAD_BLEND_CHANNELS[i1].id, 0.55);
    applyObsBlendChannelValue(HEAD_BLEND_CHANNELS[i2].id, 0.45);
  });

  // 12 Eye shape cards
  studio.querySelectorAll('#obs-eye-card-grid .obs-visual-card').forEach((card) => {
    card.addEventListener('click', () => {
      const eyeId = card.dataset.eyeId;
      studio.querySelectorAll('#obs-eye-card-grid .obs-visual-card').forEach((c) => c.classList.toggle('active', c === card));
      setFormValueAndTrigger('vcd-eye-preset-select', eyeId, 'change');
      setFormValueAndTrigger('studio-eye-preset-select', eyeId, 'change');
    });
  });

  // 8 Eyebrow cards
  studio.querySelectorAll('#obs-brow-card-grid .obs-visual-card').forEach((card) => {
    card.addEventListener('click', () => {
      const browId = card.dataset.browId;
      studio.querySelectorAll('#obs-brow-card-grid .obs-visual-card').forEach((c) => c.classList.toggle('active', c === card));
      setFormValueAndTrigger('vcd-sel-eyebrow-style', browId, 'change');
      setFormValueAndTrigger('sel-eyebrow-style', browId, 'change');
    });
  });

  // Iris color swatches
  studio.querySelectorAll('#obs-iris-swatches .obs-color-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const hex = dot.dataset.irisHex;
      studio.querySelectorAll('#obs-iris-swatches .obs-color-dot').forEach((d) => d.classList.toggle('active', d === dot));
      const custom = document.getElementById('obs-iris-custom-color');
      if (custom) custom.value = hex;
      setFormValueAndTrigger('vcd-iris-color', hex, 'input');
      setFormValueAndTrigger('col-iris', hex, 'input');
    });
  });
  document.getElementById('obs-iris-custom-color')?.addEventListener('input', (e) => {
    setFormValueAndTrigger('vcd-iris-color', e.target.value, 'input');
    setFormValueAndTrigger('col-iris', e.target.value, 'input');
  });

  // Realism material preset pills
  studio.querySelectorAll('#obs-realism-preset-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const key = pill.dataset.realism;
      studio.querySelectorAll('#obs-realism-preset-pills .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      const origBtn = document.querySelector(`[data-char-mat-preset="${key}"]`);
      origBtn?.click();
    });
  });

  // Makeup color pickers
  studio.querySelectorAll('input[data-obs-color]').forEach((inp) => {
    inp.addEventListener('input', () => {
      setFormValueAndTrigger(inp.dataset.obsColor, inp.value, 'input');
    });
  });

  // Proxy compact sliders -> drive both targetId and fallbackId
  studio.querySelectorAll('.obs-slider-row').forEach((row) => {
    const range = row.querySelector('.obs-proxy-range');
    const valSpan = row.querySelector('.obs-proxy-val');
    const targetId = row.dataset.syncTarget;
    const fallbackId = row.dataset.syncFallback;
    const fmt = row.dataset.fmt || 'pct';

    if (!range) return;
    range.addEventListener('input', () => {
      const v = range.value;
      if (valSpan) valSpan.textContent = formatSliderDisplay(v, fmt);
      if (targetId) setFormValueAndTrigger(targetId, v, 'input');
      if (fallbackId) setFormValueAndTrigger(fallbackId, v, 'input');
    });
  });

  // =========================================================================
  // Stage 66 · Comfort Reader Essay Button, 4-Field Placard Editor,
  //            Desktop Pet Mode / Architecture & Blur / Lighting Filters
  // =========================================================================
  document.getElementById('btn-obs-open-comfort-reader')?.addEventListener('click', () => {
    if (typeof window.__openComfortReaderDrawer === 'function') {
      window.__openComfortReaderDrawer();
    } else {
      document.getElementById('btn-open-comfort-reader')?.click();
    }
  });

  // 1. Character Placard 4-Field Editor (照片 · 名字 · 年龄 · 简要故事)
  const placardChk = document.getElementById('obs-chk-placards-visible');
  placardChk?.addEventListener('change', () => {
    const qa = window.__cervixQA;
    if (qa?.state) {
      qa.state.placardsEnabled = placardChk.checked;
      document.getElementById('btn-quick-placards')?.classList.toggle('active-top', placardChk.checked);
      qa.refreshPlacards?.();
    }
  });

  const nameInput = document.getElementById('obs-placard-name-input');
  nameInput?.addEventListener('input', () => {
    const qa = window.__cervixQA;
    const col = qa?.getActiveCollectible?.();
    if (!col) return;
    col.customDisplayName = nameInput.value.trim();
    qa.persistCollectibles?.();
    qa.refreshPlacards?.();
  });

  const ageInput = document.getElementById('obs-placard-age-input');
  ageInput?.addEventListener('input', () => {
    const qa = window.__cervixQA;
    const col = qa?.getActiveCollectible?.();
    if (!col) return;
    const rawAge = ageInput.value.trim();
    col.customAge = rawAge;
    if (col.fateRecord && rawAge) col.fateRecord.ageAtCollection = rawAge;
    qa.persistCollectibles?.();
    qa.refreshPlacards?.();
  });

  const storyInput = document.getElementById('obs-placard-story-input');
  storyInput?.addEventListener('input', () => {
    const qa = window.__cervixQA;
    const col = qa?.getActiveCollectible?.();
    if (!col) return;
    const text = storyInput.value.trim();
    col.customBriefStory = text;
    col.customContrastText = text;
    qa.persistCollectibles?.();
    qa.refreshPlacards?.();
  });

  const photoUpload = document.getElementById('obs-placard-photo-upload');
  photoUpload?.addEventListener('change', (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const qa = window.__cervixQA;
      const col = qa?.getActiveCollectible?.();
      if (!col || !dataUrl) return;
      col.customLifePhotoUrl = dataUrl;
      const preview = document.getElementById('obs-placard-photo-preview');
      if (preview) preview.src = dataUrl;
      qa.persistCollectibles?.();
      qa.refreshPlacards?.();
      qa.showToast?.('📷 已更新人物标牌照片！');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('obs-placard-photo-reset')?.addEventListener('click', () => {
    const qa = window.__cervixQA;
    const col = qa?.getActiveCollectible?.();
    if (!col) return;
    delete col.customLifePhotoUrl;
    const src = qa.resolveCollectibleLifePhotoSrc?.(col) || '';
    const preview = document.getElementById('obs-placard-photo-preview');
    if (preview && src) preview.src = src;
    qa.persistCollectibles?.();
    qa.refreshPlacards?.();
    qa.showToast?.('↺ 已恢复人物默认生前照片');
  });

  // 2. Desktop Pet Mode Toggle (Hides 3D Floor/Shelves so monitor screen is never blocked)
  const toggleDesktopPetModeAll = (forceVal) => {
    const qa = window.__cervixQA;
    const eng = qa?.desktop;
    if (!eng) return;
    const next = typeof forceVal === 'boolean' ? forceVal : !eng.desktopPetMode;
    eng.setDesktopPetMode(next);
    if (qa?.state) qa.state.desktopPetMode = next;
    const topBtn = document.getElementById('btn-desktop-pet-mode-toggle');
    if (topBtn) {
      topBtn.classList.toggle('active-top', next);
      topBtn.textContent = next ? '🐾 桌宠模式:开' : '🐾 桌宠无地板';
    }
    const studioBtn = document.getElementById('obs-btn-toggle-pet-mode');
    if (studioBtn) {
      studioBtn.textContent = next ? '✅ 已开启纯净桌宠无地板' : '切换纯净桌宠无地板';
    }
    qa?.showToast?.(next ? '🐾 已开启纯净桌面宠物模式：已隐藏3D地板与展架，绝不遮挡显示器画面！' : '🪵 已恢复3D案台与书架陈列室模式');
  };

  document.getElementById('btn-desktop-pet-mode-toggle')?.addEventListener('click', () => toggleDesktopPetModeAll());
  document.getElementById('obs-btn-toggle-pet-mode')?.addEventListener('click', () => toggleDesktopPetModeAll());

  // 3. Architecture: Floor Style, Shelf Layout, Formations, Containers & Props
  studio.querySelectorAll('#obs-floor-style-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const fs = pill.dataset.floorStyle;
      studio.querySelectorAll('#obs-floor-style-pills .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      const qa = window.__cervixQA;
      if (fs === 'none') {
        toggleDesktopPetModeAll(true);
      } else {
        toggleDesktopPetModeAll(false);
        qa?.desktop?.updateSettings?.({ floorStyle: fs });
        setFormValueAndTrigger('sel-floor-style', fs, 'change');
      }
    });
  });

  studio.querySelectorAll('#obs-shelf-layout-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const sl = pill.dataset.shelfLayout;
      studio.querySelectorAll('#obs-shelf-layout-pills .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      const qa = window.__cervixQA;
      toggleDesktopPetModeAll(false);
      qa?.desktop?.updateSettings?.({ shelfLayout: sl });
      setFormValueAndTrigger('sel-shelf-layout', sl, 'change');
    });
  });

  studio.querySelectorAll('#obs-formation-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const fm = pill.dataset.formation;
      studio.querySelectorAll('#obs-formation-pills .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      const origBtn = document.querySelector(`[data-stage-formation="${fm}"]`);
      if (origBtn) {
        origBtn.click();
      } else {
        window.__cervixQA?.desktop?.applyStageFormation?.(fm);
      }
    });
  });

  studio.querySelectorAll('#obs-place-container-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const cs = pill.dataset.placeContainer;
      const qa = window.__cervixQA;
      if (qa?.desktop) {
        qa.desktop.placeContainerStructure(cs, { playSound: true });
        qa.showToast?.(`🏛️ 已在桌面放置 3D 容器建筑（可直接将头颅拖入容器内）`);
      }
    });
  });

  studio.querySelectorAll('#obs-decor-prop-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const ds = pill.dataset.decorStyle;
      studio.querySelectorAll('#obs-decor-prop-pills .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      setFormValueAndTrigger('sel-decor-style', ds, 'change');
      setFormValueAndTrigger('vcd-decor-style', ds, 'change');
    });
  });

  // 4. Desktop Pet Blur Modes (6 modes + blurPower + focusCenterY)
  const applyPetBlurState = (blurMode, blurPower, focusCenterY) => {
    const qa = window.__cervixQA;
    const bm = blurMode ?? document.getElementById('top-pet-blur-select')?.value ?? 'none';
    const bp = Number(blurPower ?? document.getElementById('obs-pet-blur-power')?.value ?? 0.55);
    const fy = Number(focusCenterY ?? document.getElementById('obs-pet-blur-focus-y')?.value ?? 0.52);
    const effectivePower = bm === 'none' ? 0.0 : bp;

    if (qa?.state?.visualCustomConfig) {
      qa.state.visualCustomConfig.blurMode = bm;
      qa.state.visualCustomConfig.blurPower = effectivePower;
      qa.state.visualCustomConfig.focusCenterY = fy;
    }
    qa?.desktop?.beautyPost?.setGradeParams?.({ blurMode: bm, blurPower: effectivePower, focusCenterY: fy });
    qa?.studio?.beautyPost?.setGradeParams?.({ blurMode: bm, blurPower: effectivePower, focusCenterY: fy });
    qa?.desktop?.wakeRender?.(1.8, true);

    const topSel = document.getElementById('top-pet-blur-select');
    if (topSel && topSel.value !== bm) topSel.value = bm;
    studio.querySelectorAll('#obs-pet-blur-pills .obs-choice-pill').forEach((p) => {
      const match = p.dataset.petBlur === bm;
      p.classList.toggle('active', match);
      if (match) {
        const lbl = document.getElementById('obs-blur-current-label');
        if (lbl) lbl.textContent = p.textContent;
      }
    });
  };

  document.getElementById('top-pet-blur-select')?.addEventListener('change', (e) => {
    applyPetBlurState(e.target.value);
  });

  studio.querySelectorAll('#obs-pet-blur-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      applyPetBlurState(pill.dataset.petBlur);
    });
  });

  const blurPowerSlider = document.getElementById('obs-pet-blur-power');
  blurPowerSlider?.addEventListener('input', () => {
    const v = Number(blurPowerSlider.value);
    const txt = document.getElementById('obs-pet-blur-power-val');
    if (txt) txt.textContent = `${Math.round(v * 100)}%`;
    const curMode = document.getElementById('top-pet-blur-select')?.value || 'portrait_dof';
    const activeMode = curMode === 'none' && v > 0.02 ? 'portrait_dof' : curMode;
    applyPetBlurState(activeMode, v);
  });

  const blurFocusSlider = document.getElementById('obs-pet-blur-focus-y');
  blurFocusSlider?.addEventListener('input', () => {
    const v = Number(blurFocusSlider.value);
    const txt = document.getElementById('obs-pet-blur-focus-y-val');
    if (txt) txt.textContent = `${Math.round(v * 100)}%`;
    applyPetBlurState(undefined, undefined, v);
  });

  // 5. Desktop Pet Lighting & Film Filter Presets (12 presets) + 9 Bokeh Backdrops
  const applyPetFilterPreset = (presetId) => {
    const qa = window.__cervixQA;
    const fp = DESKTOP_PET_FILTER_PRESETS.find((p) => p.id === presetId) || DESKTOP_PET_FILTER_PRESETS[0];
    if (!fp) return;
    if (qa?.state?.visualCustomConfig) {
      qa.state.visualCustomConfig.filterPreset = fp.id;
    }
    qa?.desktop?.beautyPost?.setGradeParams?.({ filterPreset: fp.id });
    qa?.studio?.beautyPost?.setGradeParams?.({ filterPreset: fp.id });
    if (fp.gobo && qa?.desktop) {
      setFormValueAndTrigger('vcd-window-gobo', fp.gobo, 'change');
    }
    qa?.desktop?.wakeRender?.(1.8, true);

    const topSel = document.getElementById('top-pet-filter-select');
    if (topSel && topSel.value !== fp.id) topSel.value = fp.id;
    studio.querySelectorAll('#obs-pet-filter-pills .obs-choice-pill').forEach((p) => {
      const match = p.dataset.petFilter === fp.id;
      p.classList.toggle('active', match);
      if (match) {
        const lbl = document.getElementById('obs-filter-current-label');
        if (lbl) lbl.textContent = fp.label;
      }
    });
    qa?.showToast?.(`🎞️ 已切换桌宠光影滤镜：${fp.label}`);
  };

  document.getElementById('top-pet-filter-select')?.addEventListener('change', (e) => {
    applyPetFilterPreset(e.target.value);
  });

  studio.querySelectorAll('#obs-pet-filter-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      applyPetFilterPreset(pill.dataset.petFilter);
    });
  });

  studio.querySelectorAll('#obs-backdrop-preset-pills .obs-choice-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const bgId = pill.dataset.backdropId;
      studio.querySelectorAll('#obs-backdrop-preset-pills .obs-choice-pill').forEach((p) => p.classList.toggle('active', p === pill));
      window.__cervixQA?.desktop?.setBackdropPreset?.(bgId);
    });
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !studio.classList.contains('hidden')) {
      studio.classList.add('hidden');
      btnOpen?.classList.remove('active-top');
    }
  });
}
