// Pre-registered high-precision Asian female collectible heads & Daz3D -> CERVIX-3D modeling tutorial data

export const REAL_HAIR_CATALOG = [
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
    desc: '经典不对称侧分波波短发，自然贴合单侧下颌线，完全展露修长颈部'
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
    id: 'SPEC-2026-001',
    folderName: 'SPEC-2026-001_LinXi',
    name: '林汐 · Lin Xi',
    subtitle: '江南古典鹅蛋脸骨相 · 浪漫瀑布长卷发首号典藏',
    grade: 'SSR · 原初典藏',
    basePreset: 'linxi',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffe8df',
    blushIntensity: 0.45,
    lipColor: '#d45266',
    irisColor: '#5c3422',
    hairStyle: 'hair_long01',
    hairColor: '#1c1624',
    hairSheen: 0.92,
    neckClearance: 0.42,
    summoned: true,
    boxPosition: { x: -23, y: 2, z: -120 },
    morphs: {
      jawVLine: 0.16,
      cheekSoftness: 0.14,
      noseBridge: 0.15,
      eyeAlmond: 0.18,
      lipFullness: 0.18,
      neckDiameter: 0.96,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 颈椎间盘标准横断面 (含透明软骨气管环与蝴蝶形脊髓灰质)',
      vascularContrast: 1.15,
      dermisRimScale: 1.0,
      wetness: 0.86,
      showLabels: false
    },
    dossier: {
      origin: '基于真实高精东方女性三维头模(daz_asian_head_base.glb · 4,494v)与2K冷白皮贴图精修，搭配3,312顶点真实瀑布长卷发(hair_long01.glb)。支持实时眨眼与眼球3D鼠标视线追踪。',
      anatomyNotes: '颈部于C4–C5椎间盘水平精准横切，无缝封口网格清晰呈现表皮真皮环、胸锁乳突肌束、气管C形软骨、食管腔、双侧颈动脉鞘与C4椎管内脊髓灰质。',
      tags: ['真实3D头模.GLB', '瀑布长卷发(3312v)', 'C4/C5无缝解剖断面', '实时眨眼与视线追踪']
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
    blushIntensity: 0.32,
    lipColor: '#c84a5e',
    irisColor: '#4a2a1c',
    hairStyle: 'hair_bob02',
    hairColor: '#151824',
    hairSheen: 0.94,
    neckClearance: 0.50,
    summoned: true,
    boxPosition: { x: 0, y: 1, z: -240 },
    morphs: {
      jawVLine: 0.28,
      cheekSoftness: 0.08,
      noseBridge: 0.24,
      eyeAlmond: 0.26,
      lipFullness: 0.10,
      neckDiameter: 0.94,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4 颈椎体下缘标准解剖断面 (原位血管充盈态)',
      vascularContrast: 1.22,
      dermisRimScale: 1.0,
      wetness: 0.90,
      showLabels: false
    },
    dossier: {
      origin: '清冷高级感东方女性骨相，搭配法式不对称侧分修颜内扣波波头(hair_bob02.glb · 1,688v)。外眼角微挑丹凤眼型，鼻梁挺拔秀气。',
      anatomyNotes: '短发造型360°无遮挡展露修长天鹅颈与底部C4颈椎骨松质、双侧颈总动脉及颈内静脉横切面。',
      tags: ['法式侧分波波(1688v)', '丹凤微挑眼型', 'C4血管充盈断面', '360°全露修长颈部']
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
    blushIntensity: 0.42,
    lipColor: '#d94b62',
    irisColor: '#633824',
    hairStyle: 'hair_ponytail01',
    hairColor: '#26181d',
    hairSheen: 0.90,
    neckClearance: 0.65,
    summoned: true,
    boxPosition: { x: 23, y: 2, z: -150 },
    morphs: {
      jawVLine: 0.22,
      cheekSoftness: 0.18,
      noseBridge: 0.20,
      eyeAlmond: 0.22,
      lipFullness: 0.24,
      neckDiameter: 0.95,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C5 颈椎上关节面标准横切面 (高清微距封存)',
      vascularContrast: 1.18,
      dermisRimScale: 1.0,
      wetness: 0.88,
      showLabels: false
    },
    dossier: {
      origin: '搭载3,902顶点干练高颅顶束马尾模型(hair_ponytail01.glb)，完整展露饱满额头、双耳与精致V型下颌折角。',
      anatomyNotes: '高束马尾与后颈自然分离，进入360°旋转检视模式可完整观察后颈斜方肌群、高马尾发束与C5横断面解剖细节。',
      tags: ['高颅顶马尾(3902v)', '全露下颌折角', 'C5关节面横切面', '3D眼动追随']
    }
  },
  {
    id: 'SPEC-2026-004',
    folderName: 'SPEC-2026-004_ShenZhiwei',
    name: '沈知微 · Shen Zhiwei',
    subtitle: '温婉书香侧分粗麻花辫 · 杏眼花瓣唇标本',
    grade: 'SSR · 特级典藏',
    basePreset: 'shenzhiwei',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffede6',
    blushIntensity: 0.48,
    lipColor: '#db586c',
    irisColor: '#5e3622',
    hairStyle: 'hair_braid01',
    hairColor: '#2b1d18',
    hairSheen: 0.88,
    neckClearance: 0.40,
    summoned: false,
    boxPosition: { x: 10, y: -6, z: -190 },
    morphs: {
      jawVLine: 0.12,
      cheekSoftness: 0.24,
      noseBridge: 0.12,
      eyeAlmond: 0.14,
      lipFullness: 0.28,
      neckDiameter: 0.97,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 椎间盘横断面 (柔光次表面活性封存)',
      vascularContrast: 1.14,
      dermisRimScale: 1.0,
      wetness: 0.85,
      showLabels: false
    },
    dossier: {
      origin: '搭载4,663顶点高密度温婉侧分粗麻花辫模型(hair_braid01.glb)，杏仁大眼配温婉鹅蛋脸与饱满花瓣唇。',
      anatomyNotes: '斜分麻花辫垂于单侧肩颈外侧，底部C4/C5解剖断面完整展现颈部肌群筋膜室与椎骨横突孔椎动脉结构。',
      tags: ['侧分粗麻花辫(4663v)', '温婉书卷骨相', '花瓣饱满唇', 'C4/C5医学横切面']
    }
  }
];

export const DAZ_TUTORIAL_STEPS = [
  {
    step: 'STEP 01',
    title: 'Daz Studio 基底加载与东方女性骨相预设 (Genesis 9 / MakeHuman MPFB2)',
    subtitle: '如何建立高还原度的亚洲女性头颈基底，彻底告别简陋低模与欧美深眼窝',
    content: [
      '1. 在 Daz Studio 中加载 Genesis 9 Starter Essentials（或在 Blender MPFB2 中加载 Asian Female Young 基底 + CC0 Young Asian Female Diffuse 2K 皮肤贴图）。',
      '2. 在 Shaping 面板将 Head Proportion 设为东亚女性柔和鹅蛋/微V轮廓：将 Brow Ridge（眉弓突出度）降至 -35%，Cheekbones Smooth 调至 +45%，Mandible Angle Width（下颌角宽度）调至 -40%。',
      '3. 眼部关键参数：启用 Epicanthic Fold（内眦赘皮/东方杏眼折痕）+55%～+75%，并将 Upper Eyelid Relax 设为 +15%（避免欧美模型的惊恐瞪眼感），Iris Scale（虹膜比例）放大至 126%。'
    ],
    proTip: '本软件已内置编译好的真实亚洲女性高精头模 `daz_asian_head_base.glb`（含4,494顶点头颈皮肤、3D眼球/虹膜/角膜、3D羽状睫毛与眉毛、32通道真实Morph形变与C4/C5无缝解剖断面），无需外部软件即可直接在工坊微调！'
  },
  {
    step: 'STEP 02',
    title: '输入参考照片 · Face Transfer / 照片半自动骨相与肤色拟合法',
    subtitle: '使用正面平光人像照片自动反推肤色、唇色与 32 通道面部 Morph 权重',
    content: [
      '1. 准备一张光线均匀、无刘海遮挡眉眼的正面平视照片（推荐焦距 85mm 人像镜头）。',
      '2. 在本软件「半自动工坊」左侧点击「上传本地照片」，再点击「半自动采样对位」：系统会自动采样照片的额头/脸颊/双唇色温，并自动拟合面部 Morph 滑杆与真实 3D 发型。',
      '3. 若在 Daz Studio 中使用 Face Transfer 2 或 Blender KeenTools FaceBuilder：生成头部 Morph 后，导出为包含 `KHR_mesh_quantization` Morph Targets 的 `.glb` 文件即可直接拖入本软件。'
    ],
    proTip: '照片自动生成的肤色贴图常带有鼻翼暗影或唇齿亮斑；本软件采用了高斯频率分离（Frequency Separation）算法自动保留毛孔微纹理并匀化东方女性冷白瓷肌。'
  },
  {
    step: 'STEP 03',
    title: '只保留头颈 (Head-Only Bust) · C4/C5 颈椎水平横断面拓扑切割',
    subtitle: '如何精准剥离躯干并生成严丝合缝的 C4/C5 医学解剖横断面封口',
    content: [
      '1. 骨骼权重剥离：筛选 `neck_01` (Joint 43) 与 `head` (Joint 44) 权重之和 > 0.04 的头颈顶点，彻底移除锁骨、胸腔与四肢网格。',
      '2. C4/C5 水平面精确切割：在世界坐标 Y = 1.362m（颈中部 C4/C5 椎间盘水平）建立水平切割面，将跨越切面的三角面底部顶点沿颈部边线性插值吸附至 Y === 1.362000m，形成零锯齿水平环口。',
      '3. 解剖断面缝合 (`NeckCrossSection`)：沿颈部底环生成 64×12 极坐标同心医学断面网格（含气管凹槽、C4椎体微凸与真皮边缘倒角），赋予高分辨率医学解剖纹理。'
    ],
    proTip: '您也可以直接导入任意第三方 `.glb` 或 `.obj` 头模，软件会自动计算底部包围盒并装配 C4/C5 医学解剖横断面底座！'
  },
  {
    step: 'STEP 04',
    title: '7款真实 3D 发型库切换与独立发包导入 (`hair_*.glb`)',
    subtitle: '告别程序化纸片头发，使用 983～5,432 顶点真实 UV 发束网格与自定义 3D 发包',
    content: [
      '1. 软件内置 7 款真实 3D 发型模型 (`hair_long01.glb` 瀑布长卷发、`hair_bob02.glb` 法式侧分波波、`hair_bob01.glb` 层次锁骨发、`hair_ponytail01.glb` 高束马尾、`hair_braid01.glb` 侧分麻花辫、`hair_short02.glb` 精灵短发、`hair_short04.glb` 干练短发)。',
      '2. 颈部避让处理：所有长发模型前胸发束均已做环颈外分处理，绝不遮挡正面天鹅颈与底部 C4/C5 解剖断面。',
      '3. 外部发型导入：支持在工坊中直接上传自定义 `.glb` / `.obj` 头发模型，并实时调节发色与高光。'
    ],
    proTip: '切换不同发型时，头部的额头高低与下颌宽度 Morph 会自动同步驱动头发网格的自适应贴合形变！'
  }
];

export const DAZ3D_TUTORIAL_STEPS = DAZ_TUTORIAL_STEPS;
