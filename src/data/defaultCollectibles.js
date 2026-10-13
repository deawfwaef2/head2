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
    name: '初夏 · 照片参照发型标本',
    subtitle: '空气碎刘海露耳束发 · 右颊特征痣 · 失活微阖平直唇',
    grade: 'UR · 照片真容孤品',
    basePreset: 'user_photo',
    deadExpression: 'dead_calm',
    modelUrl: '/models/daz_asian_head_base.glb',
    skinTone: '#ffe9df',
    blushIntensity: 0.25,
    lipColor: '#bf6872',
    irisColor: '#3b2014',
    hairStyle: 'groom_photo_tied',
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
    hairStyle: 'groom_center_long',
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
    hairStyle: 'groom_photo_tied',
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
    hairStyle: 'groom_low_chignon',
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
    hairStyle: 'groom_low_chignon',
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
    title: '从照片参考到可信骨相：先多视角，再局部精修',
    subtitle: '本软件提供照片叠图、粗略肤色采样、示例形变；不是单照自动三维重建',
    content: [
      '准备正面、45°、左右侧面参考，尽量使用一致焦距和光线。先对齐眼线、鼻底、下巴、耳朵与颅顶，再调整眼鼻唇和下颌。透视畸变不能靠肤色滑杆解决。',
      '在 DAZ 或 Blender 中选您有权使用的角色。工程保留原始模型和贴图，另存实时导出版本。软件内置头是演示资产，不是 DAZ Genesis HD 商品原件。',
      '头部的皮肤、眼睛、眉睫、头发一起导出为带内嵌贴图的 GLB。当前仅支持 GLB；OBJ 的 MTL、外置图和 DAZ strand curves 不会自动转换。'
    ],
    proTip: '先比较正面与侧面，避免只把正面照片贴得像、侧面骨相却完全不同。商业素材不要上传公开仓库。'
  },
  {
    step: 'STEP 02',
    title: '头发质量验收：发际线、层次、透明遮罩与反射',
    subtitle: '真实感靠正确发型资产与材质配合，放大纹理或提高画质不能凭空补细节',
    content: [
      '在 Blender 中先做头皮根层、大束造型、过渡小束与稀疏飞发。头皮根层必须取自实际头皮，不要用整套长发包围盒生成球壳；刘海与鬓角不能埋入额头或穿过面颊。',
      '发片 UV 的发根至发梢走向应连贯，Alpha 图覆盖必须与 UV 一致。保留原始软边，避免高阈值把发丝切成厚纸板；颜色贴图使用 sRGB，法线/粗糙度/遮罩作为数据图处理。',
      '尽量从原始高分辨率图烘焙清晰的发缕边缘、粗糙度和微法线，而不是把低分图放大后宣称 4K 扫描。发根较密，轮廓边缘与发梢逐渐稀疏。',
      '导出后在黑/白背景、正面/侧面/后脑与近/远景检查秃洞、棋盘碎片、反向法线、硬三角高光及透明排序。细束还要在桌宠实际大小下验收，不只看放大静帧。'
    ],
    proTip: '本轮修复了 GLB 纹理对位、错误头皮球壳和默认发型颅顶压缩；内置发型仍是低分源图演示，不宣称照片级成品。'
  },
  {
    step: 'STEP 03',
    title: '只保留头部：裁切、封口、统一导出与私有预览',
    subtitle: '模型裁切和解剖底座须先在建模工具完成',
    content: [
      '在 Blender 删除肩胸，选择颈部切割高度，整理闭合边环、封口并检查面朝向。解剖盖为独立艺术示意模型；软件不会对任意上传全身模型自动切颈封口。',
      '将头和发型在同一场景对齐，应用比例与坐标变换。导出 GLB 时内嵌 base-color、normal、roughness、AO 与必要 Alpha 图；检查 glTF PBR 转换后的结果。',
      '通过工坊步骤2上传。程序等比适配头部大小并保留原 PBR；外部头默认不叠加内置发型。若贴图缺失，请回到导出工具修复，不要用示例材质遮掩。'
    ],
    proTip: '私人 GLB 保存在当前浏览器 IndexedDB；仍须备份 GLB/BLEND/DUF 原件，清除浏览器数据后不会自动找回。'
  },
  {
    step: 'STEP 04',
    title: '命名、档案与召唤：浏览器试玩和系统桌宠是两种运行方式',
    subtitle: '先预览验收，再注册藏品；文件与本地存储各自备份',
    content: [
      '填写编号、名称、背景、断面说明后注册并召唤。鼠标悬停看档案，滚轮改变深度，拖拽移动并碰撞有限盒壁，单击切换旋转检视。默认保留静态表情与关闭自动眨眼。',
      '档案页可下载 ZIP 文件夹，包含 manifest.json 与 dossier.md，不含私人模型本体。跨浏览器迁移时先重新上传原模型，再保存对应藏品。',
      '双击根目录 HTML 是浏览器内离线体验；跨应用的透明桌面层必须运行 Electron。托盘或 Ctrl/Cmd+Alt+M 可恢复管理器，目标系统的点击穿透仍需实机检查。'
    ],
    proTip: '正式分发前核验每个模型与贴图的再分发许可。解剖切面仅用于艺术展示，不用于医学判断。'
  }
];

export const DAZ3D_TUTORIAL_STEPS = DAZ_TUTORIAL_STEPS;
