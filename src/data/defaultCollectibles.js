// Pre-registered high-precision Asian female collectible heads, 8 MhcloFit high-poly 3D hairs & 7 post-mortem expressions

export const REAL_HAIR_CATALOG = [
  {
    id: 'hair_user_photo',
    label: '照片同款 · 空气碎刘海露耳束发 (hair_user_photo.glb · 5,029顶点)',
    url: '/models/hair_user_photo.glb',
    verts: 5029,
    desc: '基于 MhcloFit 精确拟合头骨的空气感齐眉碎刘海 + 脸颊修颜碎发 + 露耳后挽发髻，还原参考照片气质'
  },
  {
    id: 'hair_short02',
    label: 'O4saken · 中式空气刘海多层微卷波波 (hair_short02.glb · 12,547顶点)',
    url: '/models/hair_short02.glb',
    verts: 12547,
    desc: '1.25万顶点超精细多层 Alpha 发片交织，真实还原轻盈发丝层次与微卷内扣轮廓'
  },
  {
    id: 'hair_long01',
    label: 'Elvs Lara · 殿堂级中分柔顺长发 (hair_long01.glb · 17,360顶点)',
    url: '/models/hair_long01.glb',
    verts: 17360,
    desc: '1.73万顶点高精雕琢垂顺长发，于 C4/C5 颈部切口上方自然收束，绝不遮挡血迹断面'
  },
  {
    id: 'hair_braid01',
    label: 'Elvs Adrienne · 法式蓬松微卷刘海盘发 (hair_braid01.glb · 9,352顶点)',
    url: '/models/hair_braid01.glb',
    verts: 9352,
    desc: '9,352顶点浪漫微卷前额碎发与立体盘发纹理，360° 展现修长天鹅颈与切口断面'
  },
  {
    id: 'hair_short04',
    label: 'Elvs Daisy · 千金感斜刘海半束发 (hair_short04.glb · 6,721顶点)',
    url: '/models/hair_short04.glb',
    verts: 6721,
    desc: '6,721顶点柔和斜分刘海搭配双侧修颜发缕，极具东方温婉标本气质'
  },
  {
    id: 'hair_ponytail01',
    label: 'Elvs Hazel · 利落偏分高颅顶束发 (hair_ponytail01.glb · 4,891顶点)',
    url: '/models/hair_ponytail01.glb',
    verts: 4891,
    desc: '4,891顶点气质偏分刘海配脑后挽发，完整展露耳廓、下颌骨相与颈部断面'
  },
  {
    id: 'hair_bob02',
    label: 'Toigo · 日系层次内卷短波波 (hair_bob02.glb · 3,031顶点)',
    url: '/models/hair_bob02.glb',
    verts: 3031,
    desc: '3,031顶点斜分层次感内卷短波波，清爽干练，完整展露颈部血迹环'
  },
  {
    id: 'hair_bob01',
    label: 'Toigo · 经典齐刘海内扣学生波波 (hair_bob01.glb · 2,806顶点)',
    url: '/models/hair_bob01.glb',
    verts: 2806,
    desc: '2,806顶点饱满齐眉刘海配下颌内扣发尾，修饰幼态鹅蛋脸骨相'
  },
  {
    id: 'none',
    label: '无发型 · 纯净颅面骨相检视模式 (Bare Cranium)',
    url: null,
    verts: 0,
    desc: '隐藏发丝网格，完整检视颅骨顶部、耳廓结构与 42 通道面部法医尸相形变'
  }
];

export const DEFAULT_COLLECTIBLES = [
  {
    id: 'SPEC-2026-000',
    folderName: 'SPEC-2026-000_UserPhoto',
    name: '初夏 · 照片真容定制标本',
    subtitle: '空气碎刘海露耳束发 · 右颊特征痣 · 失活微阖平直唇',
    grade: 'UR · 照片真容孤品',
    basePreset: 'user_photo',
    deadExpression: 'dead_calm',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffe9df',
    blushIntensity: 0.25,
    lipColor: '#bf6872',
    irisColor: '#3b2014',
    hairStyle: 'hair_user_photo',
    hairColor: '#191518',
    hairSheen: 0.88,
    neckClearance: 0.55,
    summoned: true,
    boxPosition: { x: -22, y: 2, z: -110 },
    morphs: {
      deadExpression: 'dead_calm',
      jawVLine: 0.04,
      cheekSoftness: 0.18,
      noseBridge: 0.04,
      eyeAlmond: 0.08,
      lipFullness: 0.0,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      neckDiameter: 0.96,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 颈椎鲜血横切面 (切缘凝血渗血态 + 气管软骨环 + 脊髓灰质)',
      vascularContrast: 1.28,
      dermisRimScale: 1.0,
      wetness: 0.92,
      showLabels: false
    },
    dossier: {
      origin: '依据用户上传照片 1:1 定制的少女头颈标本：采用 MhcloFit 精确拟合的空气碎刘海露耳束发(hair_user_photo.glb · 5,029v)、柔和鹅蛋脸、右脸颊3颗特征痣与平直失活唇形（支持7种死人尸相表情一键切换）。',
      anatomyNotes: '颈部C4/C5横切面周围皮肤附着真实暗红凝血与鲜红渗血痕迹，底部断面高亮度清晰展现C4椎骨、蝴蝶形脊髓灰质、气管透明软骨环与双侧颈动静脉。',
      tags: ['本人照片定制头模', '空气碎刘海束发(5029v)', '右颊特征痣还原', '切口凝血血迹感', '7种死人表情可调']
    }
  },
  {
    id: 'SPEC-2026-001',
    folderName: 'SPEC-2026-001_LinXi',
    name: '林汐 · 死不瞑目标本',
    subtitle: '1.7万顶点中分长发 · 翻白眼微张口露齿 · C4带血断面',
    grade: 'SSR · 原初典藏',
    basePreset: 'linxi',
    deadExpression: 'dead_hollow',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffe8df',
    blushIntensity: 0.26,
    lipColor: '#bf6872',
    irisColor: '#5c3422',
    hairStyle: 'hair_long01',
    hairColor: '#1c1624',
    hairSheen: 0.92,
    neckClearance: 0.42,
    summoned: true,
    boxPosition: { x: 0, y: 2, z: -200 },
    morphs: {
      deadExpression: 'dead_hollow',
      jawVLine: 0.14,
      cheekSoftness: 0.12,
      noseBridge: 0.12,
      eyeAlmond: 0.12,
      lipFullness: 0.0,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      neckDiameter: 0.96,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 颈椎间盘标准横断面 (含切缘血迹、透明软骨气管环与脊髓灰质)',
      vascularContrast: 1.22,
      dermisRimScale: 1.0,
      wetness: 0.90,
      showLabels: false
    },
    dossier: {
      origin: '搭载 Elvs Lara 17,360 顶点殿堂级中分柔顺长发(hair_long01.glb)，预设为「死不瞑目 · 翻白微张」尸相表情：眼帘半垂、黑仁上翻、双唇微张隐约露出内部 3D 上下门齿。',
      anatomyNotes: '长发于颈部 C4–C5 切缘上方平滑收束，完整露出颈部凝血渗血环与底部高亮度解剖横断面。',
      tags: ['1.7万顶点长发(17360v)', '死不瞑目翻白眼', '微张口露3D门齿', '切口真实血迹']
    }
  },
  {
    id: 'SPEC-2026-002',
    folderName: 'SPEC-2026-002_SuWan',
    name: '苏晚 · 安详永眠标本',
    subtitle: '1.2万顶点中式空气刘海波波 · 双目紧闭安详尸相',
    grade: 'SSR · 特级典藏',
    basePreset: 'suwan',
    deadExpression: 'dead_serene',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#fff0ea',
    blushIntensity: 0.22,
    lipColor: '#b8626c',
    irisColor: '#4a2a1c',
    hairStyle: 'hair_short02',
    hairColor: '#151824',
    hairSheen: 0.94,
    neckClearance: 0.50,
    summoned: true,
    boxPosition: { x: 22, y: 1, z: -145 },
    morphs: {
      deadExpression: 'dead_serene',
      jawVLine: 0.24,
      cheekSoftness: 0.06,
      noseBridge: 0.20,
      eyeAlmond: 0.20,
      lipFullness: 0.0,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      neckDiameter: 0.94,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4 颈椎体下缘带血解剖断面 (原位血管充盈态)',
      vascularContrast: 1.25,
      dermisRimScale: 1.0,
      wetness: 0.92,
      showLabels: false
    },
    dossier: {
      origin: '搭载 O4saken 12,547 顶点中式空气刘海多层微卷波波头(hair_short02.glb)，预设为「安详永眠 · 双目紧闭」神态，长睫低垂、双唇平直闭合。',
      anatomyNotes: '多层 Alpha 发丝卡片呈现真实轻盈蓬松度，360° 无遮挡展露修长颈部、切缘渗血与高亮度 C4 颈椎横切面。',
      tags: ['1.2万顶点中式波波(12547v)', '安详永眠闭目', '多层Alpha真发丝', '高亮度C4断面']
    }
  },
  {
    id: 'SPEC-2026-003',
    folderName: 'SPEC-2026-003_QianXue',
    name: '千雪 · 惊愕断首标本',
    subtitle: 'Elvs Hazel 偏分束发 · 瞳孔散大张口露齿尸相',
    grade: 'UR · 殿堂孤品',
    basePreset: 'qianxue',
    deadExpression: 'dead_shock',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffece5',
    blushIntensity: 0.24,
    lipColor: '#c2606c',
    irisColor: '#633824',
    hairStyle: 'hair_ponytail01',
    hairColor: '#26181d',
    hairSheen: 0.90,
    neckClearance: 0.65,
    summoned: false,
    boxPosition: { x: 14, y: -5, z: -180 },
    morphs: {
      deadExpression: 'dead_shock',
      jawVLine: 0.20,
      cheekSoftness: 0.14,
      noseBridge: 0.18,
      eyeAlmond: 0.16,
      lipFullness: 0.0,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      neckDiameter: 0.95,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C5 颈椎上关节面带血横切面 (高清微距封存)',
      vascularContrast: 1.22,
      dermisRimScale: 1.0,
      wetness: 0.90,
      showLabels: false
    },
    dossier: {
      origin: '搭载 Elvs Hazel 4,891 顶点利落偏分柔顺束发(hair_ponytail01.glb)，预设为「惊愕断首 · 圆睁张口」尸相：双目惊恐大睁、下颌大张露出内部 3D 上下牙列与舌腔。',
      anatomyNotes: '挽发造型完整露出双耳与下颌骨角，配合断首瞬间的惊愕张口神态与 C5 鲜血横断面，极具法医解剖视觉冲击力。',
      tags: ['偏分挽发(4891v)', '惊愕圆睁张口', '内置3D牙齿与舌腔', 'C5带血横切面']
    }
  },
  {
    id: 'SPEC-2026-004',
    folderName: 'SPEC-2026-004_ShenZhiwei',
    name: '沈知微 · 诡异尸笑标本',
    subtitle: 'Elvs Adrienne 9,352v法式微卷盘发 · 防腐微哂尸相',
    grade: 'SSR · 特级典藏',
    basePreset: 'shenzhiwei',
    deadExpression: 'dead_smile',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffede6',
    blushIntensity: 0.35,
    lipColor: '#c06975',
    irisColor: '#5e3622',
    hairStyle: 'hair_braid01',
    hairColor: '#2b1d18',
    hairSheen: 0.88,
    neckClearance: 0.40,
    summoned: false,
    boxPosition: { x: 10, y: -6, z: -190 },
    morphs: {
      deadExpression: 'dead_smile',
      jawVLine: 0.12,
      cheekSoftness: 0.24,
      noseBridge: 0.12,
      eyeAlmond: 0.14,
      lipFullness: 0.0,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      neckDiameter: 0.97,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 椎间盘带血横断面 (高清微距封存)',
      vascularContrast: 1.14,
      dermisRimScale: 1.0,
      wetness: 0.85,
      showLabels: false
    },
    dossier: {
      origin: '搭载 Elvs Adrienne 9,352 顶点法式蓬松微卷刘海盘发(hair_braid01.glb)，预设为「诡异尸笑 · 防腐微哂」表情，眼帘半垂、嘴角呈现不对称苦笑牵拉。',
      anatomyNotes: '还可在工坊或桌宠面板一键切换为「临终痉挛 · 尸僵咬牙」或「面瘫弛缓 · 歪嘴吐舌」等 7 种死人表情。',
      tags: ['法式微卷盘发(9352v)', '诡异尸笑表情', '42通道尸相形变', 'C4/C5带血横切面']
    }
  }
];

export const DAZ_TUTORIAL_STEPS = [
  {
    step: 'STEP 01',
    title: '7种法医死人/尸相表情预设 (`FORENSIC_EXPRESSION_PRESETS`) 与 3D 口腔牙舌联动',
    subtitle: '从安详合目、死不瞑目、惊愕断首、临终痉挛、诡异尸笑到面瘫吐舌的全谱系尸相控制',
    content: [
      '1. 基于 MakeHuman MPFB2 官方 `faceunits01` (52通道 ARKit 面部肌肉 Target) 精确映射至 4,494 顶点东方女性头模，并内置独立 3D 上下颌牙列 (`Teeth`) 与 3D 舌体 (`Tongue`)。',
      '2. 预设 7 种典型死人/标本表情：① 失活标本（默认微阖平直唇）、② 安详永眠（双目紧闭）、③ 死不瞑目（翻白眼微张口露齿）、④ 惊愕断首（双目圆睁下颌大张）、⑤ 临终痉挛（尸僵痛苦咬牙蹙眉）、⑥ 诡异尸笑（防腐标本不对称微哂）、⑦ 面瘫弛缓（大小眼歪嘴吐舌）。',
      '3. 支持通过滑杆实时叠加「下颌张口度 (`jawOpen`)」、「眼球上翻翻白度 (`eyeRollUp`)」、「舌头吐出度 (`tongueOut`)」与「下颌歪斜度 (`jawSide`)」。'
    ],
    proTip: '在工坊左侧面板或桌宠快捷控制栏中点击任意「死人表情预设」按钮，即可实时切换并观察上下牙列、舌头与眼睑的解剖级联动！'
  },
  {
    step: 'STEP 02',
    title: 'MhcloFit 亚微米级颅骨拟合 · 8款殿堂级高多边形 3D 发型库 (`2,806v ~ 17,360v`)',
    subtitle: '彻底告别低级程序化发片，采用 MakeHuman 艺术家精雕 `.mhclo` 顶点绑定算法 (0.67µm 精度)',
    content: [
      '1. 通过重心坐标 + 法向尺度传递算法 (`MhcloFit`)，将 Elvaerwyn、Toigo、O4saken 等艺术家创作的高多边形 3D 发型精确拟合至亚洲女性头模颅骨表面。',
      '2. 内置 8 款高精 3D 发型：`hair_user_photo`（照片同款空气碎刘海露耳束发 5,029v）、`hair_long01`（Elvs Lara 殿堂中分长发 17,360v）、`hair_short02`（O4saken 中式空气刘海微卷波波 12,547v）、`hair_braid01`（Elvs Adrienne 法式微卷盘发 9,352v）、`hair_short04`（Elvs Daisy 千金斜刘海半束发 6,721v）、`hair_ponytail01`（Elvs Hazel 偏分挽发 4,891v）、`hair_bob02`（Toigo 日系内卷短波波 3,031v）、`hair_bob01`（Toigo 齐刘海内扣波波 2,806v）。'
    ],
    proTip: '所有 8 款高精发型均内置 `hair_length`（发长）、`hair_volume`（蓬松度）与 `bangs_length`（刘海长度）3 通道三维形变 Target，且绝不遮挡颈部 C4/C5 解剖断面！'
  },
  {
    step: 'STEP 03',
    title: '颈部 C4/C5 切缘真实血迹渗出 (`Bloodstain Rim`) 与高亮度解剖断面绘制',
    subtitle: '如何解决断面过暗问题，并在切口皮肤边缘制作逼真的凝血与渗血效果',
    content: [
      '1. 切口皮肤血迹层：在水平切割面 `Y = 1.362m` 上方 `0~25mm` 的颈部皮肤 UV 区域，绘制底部深暗红凝血 (`#4a0409`) 向上过渡为鲜红毛细血管渗血 (`#9e111b`) 的不规则波浪边缘与微细飞溅血点。',
      '2. 解决断面背光发黑：由于颈部横断面法线朝下 (`-Y`)，在 PBR 渲染器中同时开启 **自发光贴图通道 (`emissiveMap = anatomyAlbedo`, `emissiveIntensity = 0.74`)** 并配合底部补光灯，让椎骨、气管与鲜红肌肉群在任何角度都清晰明亮。'
    ],
    proTip: '点击工坊预览窗上方的「🩸 仰视颈部解剖断面」或在桌面上单击头模进入 360° 旋转模式向上拖拽，即可近距离检视高亮度断面与切口血迹！'
  }
];

export const DAZ3D_TUTORIAL_STEPS = DAZ_TUTORIAL_STEPS;
