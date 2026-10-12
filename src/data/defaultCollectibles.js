// Pre-registered high-precision Asian female collectible heads & Daz3D -> CERVIX-3D modeling tutorial data

export const REAL_HAIR_CATALOG = [
  {
    id: 'hair_user_photo',
    label: '照片同款 · 清纯齐刘海碎发束发 (hair_user_photo.glb · 6,114顶点)',
    url: '/models/hair_user_photo.glb',
    verts: 6114,
    desc: '根据参考照片定制的齐眉碎刘海+耳前修颜鬓角+清爽束发，完整露出双耳与颈部血迹断面'
  },
  {
    id: 'hair_long01',
    label: '浪漫中分瀑布长卷发 (hair_long01.glb · 3,312顶点)',
    url: '/models/hair_long01.glb',
    verts: 3312,
    desc: '真实3D多层垂顺长卷发网格，自动避让天鹅颈与C4/C5解剖断面'
  },
  {
    id: 'hair_bob02',
    label: '法式侧分修颜内扣波波头 (hair_bob02.glb · 1,688顶点)',
    url: '/models/hair_bob02.glb',
    verts: 1688,
    desc: '经典不对称侧分波波短发，自然贴合单侧下颌线，完全展露修长颈部与血迹切口'
  },
  {
    id: 'hair_bob01',
    label: '知性层次感锁骨波波发 (hair_bob01.glb · 5,432顶点)',
    url: '/models/hair_bob01.glb',
    verts: 5432,
    desc: '高密度5432顶点蓬松层次长款波波头，斜刘海修饰面部轮廓'
  },
  {
    id: 'hair_ponytail01',
    label: '冷感干练高颅顶束马尾 (hair_ponytail01.glb · 3,902顶点)',
    url: '/models/hair_ponytail01.glb',
    verts: 3902,
    desc: '完整展露饱满额头、双耳与精致下颌折角，脑后垂落高束马尾'
  },
  {
    id: 'hair_braid01',
    label: '温婉侧分立体粗麻花辫 (hair_braid01.glb · 4,663顶点)',
    url: '/models/hair_braid01.glb',
    verts: 4663,
    desc: '温婉斜分前额发流搭配立体缠绕肩侧麻花长辫，极具东方书卷气韵'
  },
  {
    id: 'hair_short02',
    label: '空气感碎发精灵短发 (hair_short02.glb · 1,794顶点)',
    url: '/models/hair_short02.glb',
    verts: 1794,
    desc: '清爽蓬松碎刘海精灵短发，360°无遮挡展示五官与颈部解剖断面'
  },
  {
    id: 'hair_short04',
    label: '极简干练齐耳短发 (hair_short04.glb · 983顶点)',
    url: '/models/hair_short04.glb',
    verts: 983,
    desc: '利落贴合颅骨轮廓的极简短发，适合观察骨骼解剖比例与微表情'
  },
  {
    id: 'none',
    label: '无发型 · 纯净颅面骨相检视模式 (Bare Cranium)',
    url: null,
    verts: 0,
    desc: '隐藏发丝网格，完整检视颅骨顶部、耳廓结构与面部32通道Morph形变'
  }
];

export const DEFAULT_COLLECTIBLES = [
  {
    id: 'SPEC-2026-000',
    folderName: 'SPEC-2026-000_UserPhoto',
    name: '初夏 · 照片真容定制标本',
    subtitle: '齐刘海碎发少女骨相 · 右颊特征痣 · C4颈部带血横断面',
    grade: 'UR · 照片真容孤品',
    basePreset: 'user_photo',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffe9df',
    blushIntensity: 0.25,
    lipColor: '#bf6872',
    irisColor: '#3b2014',
    hairStyle: 'hair_user_photo',
    hairColor: '#191518',
    hairSheen: 0.85,
    neckClearance: 0.55,
    summoned: true,
    boxPosition: { x: -22, y: 2, z: -110 },
    morphs: {
      jawVLine: 0.04,
      cheekSoftness: 0.18,
      noseBridge: 0.04,
      eyeAlmond: 0.08,
      lipFullness: 0.0,
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
      origin: '依据用户上传照片 1:1 定制的少女头颈标本：还原清纯齐眉碎刘海与耳前鬓角碎发(hair_user_photo.glb · 6,114v)、柔和饱满鹅蛋脸、右脸颊3颗特征痣与平直自然的静态失活唇形（无眨眼/无视线追随）。',
      anatomyNotes: '颈部C4/C5横切面周围皮肤附着真实暗红凝血与鲜红渗血痕迹，底部断面高亮度清晰展现C4椎骨、蝴蝶形脊髓灰质、气管透明软骨环与双侧颈动静脉。',
      tags: ['本人照片定制头模', '齐刘海碎发(6114v)', '右颊特征痣还原', '切口凝血血迹感', '静态失活标本表情']
    }
  },
  {
    id: 'SPEC-2026-001',
    folderName: 'SPEC-2026-001_LinXi',
    name: '林汐 · Lin Xi',
    subtitle: '江南古典鹅蛋脸骨相 · 浪漫瀑布长卷发标本',
    grade: 'SSR · 原初典藏',
    basePreset: 'linxi',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffe8df',
    blushIntensity: 0.30,
    lipColor: '#bf6872',
    irisColor: '#5c3422',
    hairStyle: 'hair_long01',
    hairColor: '#1c1624',
    hairSheen: 0.92,
    neckClearance: 0.42,
    summoned: true,
    boxPosition: { x: 0, y: 2, z: -210 },
    morphs: {
      jawVLine: 0.14,
      cheekSoftness: 0.12,
      noseBridge: 0.12,
      eyeAlmond: 0.12,
      lipFullness: 0.0,
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
      origin: '基于真实高精东方女性三维头模(daz_asian_head_base.glb · 4,494v)与3,312顶点真实瀑布长卷发(hair_long01.glb)。默认保持死人/标本级静止失活神态，不眨眼、不随鼠标乱转。',
      anatomyNotes: '颈部于C4–C5椎间盘水平精准横切，切缘上方带有真实凝血与渗血过渡，底部高亮度断面清晰呈现气管C形软骨、食管腔、双侧颈动脉鞘与C4脊髓灰质。',
      tags: ['真实3D头模.GLB', '瀑布长卷发(3312v)', '切口真实血迹', '静态标本表情']
    }
  },
  {
    id: 'SPEC-2026-002',
    folderName: 'SPEC-2026-002_SuWan',
    name: '苏晚 · Su Wan',
    subtitle: '清冷丹凤侧分波波 · 高智感东方骨相标本',
    grade: 'SSR · 特级典藏',
    basePreset: 'suwan',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#fff0ea',
    blushIntensity: 0.24,
    lipColor: '#b8626c',
    irisColor: '#4a2a1c',
    hairStyle: 'hair_bob02',
    hairColor: '#151824',
    hairSheen: 0.94,
    neckClearance: 0.50,
    summoned: true,
    boxPosition: { x: 22, y: 1, z: -150 },
    morphs: {
      jawVLine: 0.24,
      cheekSoftness: 0.06,
      noseBridge: 0.20,
      eyeAlmond: 0.20,
      lipFullness: -0.04,
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
      origin: '清冷高级感东方女性骨相，搭配法式不对称侧分修颜内扣波波头(hair_bob02.glb · 1,688v)。平直自然闭合唇线，静态失活眼神。',
      anatomyNotes: '短发造型360°无遮挡展露修长天鹅颈、颈底鲜血渗出切缘与底部高亮度C4颈椎横切面。',
      tags: ['法式侧分波波(1688v)', '切缘渗血细节', '高亮度C4断面', '静态失活标本']
    }
  },
  {
    id: 'SPEC-2026-003',
    folderName: 'SPEC-2026-003_QianXue',
    name: '千雪 · Qian Xue',
    subtitle: '冷艳高束马尾 · 财阀千金立体骨相典藏',
    grade: 'UR · 殿堂孤品',
    basePreset: 'qianxue',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffece5',
    blushIntensity: 0.28,
    lipColor: '#c2606c',
    irisColor: '#633824',
    hairStyle: 'hair_ponytail01',
    hairColor: '#26181d',
    hairSheen: 0.90,
    neckClearance: 0.65,
    summoned: false,
    boxPosition: { x: 14, y: -5, z: -180 },
    morphs: {
      jawVLine: 0.20,
      cheekSoftness: 0.14,
      noseBridge: 0.18,
      eyeAlmond: 0.16,
      lipFullness: 0.0,
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
      origin: '搭载3,902顶点干练高颅顶束马尾模型(hair_ponytail01.glb)，完整展露饱满额头、双耳与精致V型下颌折角。',
      anatomyNotes: '高束马尾与后颈自然分离，进入360°旋转检视模式可完整观察后颈斜方肌群、切口血迹与高亮度C5横断面解剖细节。',
      tags: ['高颅顶马尾(3902v)', '全露下颌折角', 'C5带血横切面', '静态标本表情']
    }
  }
];

export const DAZ_TUTORIAL_STEPS = [
  {
    step: 'STEP 01',
    title: 'Daz Studio 基底加载与静态失活标本表情设定 (Genesis 9 / MakeHuman MPFB2)',
    subtitle: '如何建立高还原度的亚洲女性头颈基底，消除“嘟嘟嘴”并呈现真实的静态失活标本神态',
    content: [
      '1. 在 Daz Studio 中加载 Genesis 9 亚洲女性基底，将嘴部宽度 `Mouth Width` 保持自然舒展（切忌过度收窄嘴宽或叠加 `Lips Fullness`，否则会造成撅嘴/嘟嘟嘴伪影）。',
      '2. 将上眼睑 `Upper Eyelids Relax` 设为 +20%（微阖静态失活眼神），关闭自动眨眼与眼球追踪控制器，使头雕呈现标本级绝对静止神态。',
      '3. 在皮肤贴图的指定 UV 坐标处点绘个人面部特征（如右脸颊三颗特征痣），并使用高斯频率分离算法匀化肤色。'
    ],
    proTip: '本软件已内置根据您上传照片 1:1 定制的「初夏 · 照片真容定制标本 (`SPEC-2026-000`)」，还原了齐刘海碎发束发、鹅蛋脸、右颊特征痣与平直自然的静态嘴型！'
  },
  {
    step: 'STEP 02',
    title: '颈部 C4/C5 切缘真实血迹渗出 (`Bloodstain Rim`) 与高亮度解剖断面绘制',
    subtitle: '如何解决断面过暗问题，并在切口皮肤边缘制作逼真的凝血与渗血效果',
    content: [
      '1. 切口皮肤血迹层：在水平切割面 `Y = 1.362m` 上方 `0~25mm` 的颈部皮肤 UV 区域，绘制底部深暗红凝血 (`#4a0409`) 向上过渡为鲜红毛细血管渗血 (`#9e111b`) 的不规则波浪边缘与微细飞溅血点。',
      '2. 解决断面背光发黑：由于颈部横断面法线朝下 (`-Y`)，在 PBR 渲染器中必须为断面材质同时开启 **自发光贴图通道 (`emissiveMap = anatomyAlbedo`, `emissiveIntensity = 0.72`)** 并配合底部补光灯，才能让椎骨、气管与鲜红肌肉群在任何角度都清晰明亮。'
    ],
    proTip: '点击工坊预览窗上方的「🩸 仰视颈部解剖断面」或在桌面上单击头模进入 360° 旋转模式向上拖拽，即可近距离检视高亮度断面与切口血迹！'
  },
  {
    step: 'STEP 03',
    title: '8款真实 3D 发型库 (`hair_user_photo.glb` + 7款 MakeHuman 发模)',
    subtitle: '包含照片同款齐刘海碎发束发及 7 款不同长短发型的实时切换',
    content: [
      '1. `hair_user_photo.glb`（6,114顶点）：专为参考照片定制的贴颅骨齐眉碎刘海 + 耳前修颜碎发鬓角 + 脑后清爽束发。',
      '2. 内置其余 7 款真实 3D 发型：`hair_long01`（瀑布长卷发）、`hair_bob02`（法式侧分波波）、`hair_bob01`（层次锁骨发）、`hair_ponytail01`（高束马尾）、`hair_braid01`（侧分麻花辫）、`hair_short02`（精灵短发）、`hair_short04`（极简短发）。'
    ],
    proTip: '所有发型均做过颈部避让处理，绝不遮挡颈部下方的血迹环与 C4/C5 解剖断面。'
  }
];

export const DAZ3D_TUTORIAL_STEPS = DAZ_TUTORIAL_STEPS;
