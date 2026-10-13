(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const Lu=[{id:"groom_photo_tied",label:"照片同款 · 清透碎刘海露耳低束发 (Groom + Volume · 12,000曲线)",url:"/models/hair_user_photo.glb",verts:12e3,desc:"还原参考照片气质：轻盈微斜空气碎刘海 + 双颊修颜龙须碎鬓 + 露耳脑后低挽发髻，双层丝绸发束与底层体积壳无缝贴合"},{id:"groom_center_long",label:"中式黑长直 · 高颅顶八字刘海柔顺发 (Groom + Volume · 12,000曲线)",url:"/models/hair_short04.glb",verts:12e3,desc:"经典东方高颅顶中分八字刘海配垂顺内扣长发，发尾于颈部 C4/C5 切缘上方自然内扣收束，绝不遮挡血迹断面"},{id:"groom_low_chignon",label:"新中式温婉 · 侧分斜刘海低盘发髻 (Groom + Volume · 12,000曲线)",url:"/models/hair_braid01.glb",verts:12e3,desc:"温婉千金感三七侧分斜掠刘海配脑后饱满低盘发髻，完整展露修长天鹅颈与底部解剖断面"},{id:"groom_hime_cut",label:"国风清冷 · 姬发式公主切高定长发 (Groom + Volume · 12,000曲线)",url:"/models/hair_bob02.glb",verts:12e3,desc:"现代国风清冷感一刀切面颊姬发鬓角 + 顺滑高颅顶长发，极具东方古典与现代二次元冷艳骨相感"},{id:"groom_clavicle_bob",label:"都市轻熟 · 法式八字刘海内扣锁骨波波 (Groom + Volume · 12,000曲线)",url:"/models/hair_bob02.glb",verts:12e3,desc:"修饰颧弓与下颌角的法式微卷八字刘海配内扣波波发尾，干练轻熟，360° 展现颈部切口环"},{id:"groom_air_bob",label:"元气初恋 · 空气刘海内扣短波波 (Groom + Volume · 12,000曲线)",url:"/models/hair_bob01.glb",verts:12e3,desc:"清透齐眉空气碎刘海配蓬松耳下内扣短波波，凸显幼态鹅蛋脸骨相与精致五官"},{id:"groom_high_ponytail",label:"飒爽千金 · 高颅顶露耳元气高束发 (Groom + Volume · 12,000曲线)",url:"/models/hair_ponytail01.glb",verts:12e3,desc:"蓬松高颅顶提拉骨相 + 利落露耳后挽高束发，完整展露双耳轮廓、下颌折角与 C4/C5 断面"},{id:"groom_pixie_short",label:"智感清冷 · 露耳碎发层次超短发 (Groom + Volume · 12,000曲线)",url:"/models/hair_short02.glb",verts:12e3,desc:"清爽日杂/中式少年感多层次碎发短发，轻盈贴合头骨，零遮挡呈现颈部横切面解剖细节"},{id:"hair_user_photo",label:"经典网格 · 空气碎刘海露耳束发 (hair_user_photo.glb · 5,029顶点)",url:"/models/hair_user_photo.glb",verts:5029,desc:"基于 MhcloFit 精确拟合头骨的空气感齐眉碎刘海 + 脸颊修颜碎发 + 露耳后挽发髻"},{id:"hair_short02",label:"经典网格 · 中式空气刘海微卷波波 (hair_short02.glb · 12,547顶点)",url:"/models/hair_short02.glb",verts:12547,desc:"1.25万顶点精细多层发片交织，还原轻盈发丝层次与微卷内扣轮廓"},{id:"hair_long01",label:"经典网格 · 殿堂级中分柔顺束发 (hair_long01.glb · 17,360顶点)",url:"/models/hair_long01.glb",verts:17360,desc:"1.73万顶点高精雕琢垂顺发丝，于 C4/C5 颈部切口上方自然收束"},{id:"hair_braid01",label:"经典网格 · 法式蓬松微卷刘海盘发 (hair_braid01.glb · 9,352顶点)",url:"/models/hair_braid01.glb",verts:9352,desc:"9,352顶点浪漫微卷前额碎发与立体盘发纹理，360° 展现天鹅颈与切口断面"},{id:"hair_short04",label:"经典网格 · 千金感斜刘海半束发 (hair_short04.glb · 6,721顶点)",url:"/models/hair_short04.glb",verts:6721,desc:"6,721顶点柔和斜分刘海搭配双侧修颜发缕，极具东方温婉标本气质"},{id:"hair_ponytail01",label:"经典网格 · 利落偏分高颅顶束发 (hair_ponytail01.glb · 4,891顶点)",url:"/models/hair_ponytail01.glb",verts:4891,desc:"4,891顶点气质偏分刘海配脑后挽发，完整展露耳廓、下颌骨相与颈部断面"},{id:"hair_bob02",label:"经典网格 · 日系层次内卷短波波 (hair_bob02.glb · 3,031顶点)",url:"/models/hair_bob02.glb",verts:3031,desc:"3,031顶点斜分层次感内卷短波波，清爽干练，完整展露颈部血迹环"},{id:"hair_bob01",label:"经典网格 · 经典齐刘海内扣学生波波 (hair_bob01.glb · 2,806顶点)",url:"/models/hair_bob01.glb",verts:2806,desc:"2,806顶点饱满齐眉刘海配下颌内扣发尾，修饰幼态鹅蛋脸骨相"},{id:"none",label:"无发型 · 纯净颅面骨相检视模式 (Bare Cranium)",url:null,verts:0,desc:"隐藏发丝网格，完整检视颅骨顶部、耳廓结构与 42 通道面部法医尸相形变"}],Or=[{id:"gaokao_pomodoro",shortLabel:"🎓 状元番茄钟督学",label:"🎓 状元气运 · 25分钟番茄钟督学官 (考神脑力虹吸 x1.6)",buffMultiplier:1.6,energyBurst:320,desc:"开启25分钟高强度高考状元专注冲刺倒计时，汲取19岁女状元方尧平的考神气运与巅峰脑力",triggerMsg:"🎓【状元督学职能激发】广东怀集19岁高考女状元方尧平已停笔定格在你的玻璃钟罩中，而握笔备战的你正吸纳她的状元考运——25分钟番茄冲刺已重置启动，金榜题名必属于活着的你！"},{id:"survivor_motivator",shortLabel:"👑 生者胜出破倦怠",label:"👑 胜者加冕 · 倦怠击碎与多巴胺脉冲官 (困意清零 +280 PTS)",buffMultiplier:1.35,energyBurst:280,desc:"学习疲惫或焦虑时一键触发强烈的生者胜出优越感，瞬间击碎困意与倦怠",triggerMsg:"👑【生者胜出脉冲激发】她19岁最娇嫩鲜活的青春已在意外中彻底出局，而你还拥有温热的呼吸与无限翻盘的明天——困意与焦虑瞬间清零，享受生者的绝对胜利！"},{id:"sprint_invigilator",shortLabel:"⏱️ 死线连击监考官",label:"⏱️ 夺命死线 · 严苛效率连击监考官 (专注连击倍率 x2.0)",buffMultiplier:2,energyBurst:260,desc:"以昔日天骄的冷冽目光监督你绝不走神，使专注能量获取速度翻倍 (x2.0)",triggerMsg:"⏱️【严苛监考职能激发】21岁顶尖投行海归精英已在雪山意外中出局，此刻她在丝绒圣杯上冷眼监考——严禁走神，双倍连击已激活，把昔日天骄远远甩在身后！"},{id:"memory_anchor",shortLabel:"📖 考点封印伴读官",label:"📖 记忆封印 · 今日核心考点誓言伴读官 (绑定攻克目标)",buffMultiplier:1.4,energyBurst:240,desc:"将你今日必须攻克的科目/章节封印在她的标本铭牌与悬停档案上，不破考点誓不罢休",triggerMsg:"📖【考点封印职能激发】你的今日伴学誓言已烙印于标本档案之上——昔日才女已成静默展品，而你定将在今日彻底攻克此核心考点！"},{id:"brain_siphon",shortLabel:"⚡ 学霸脑力虹吸官",label:"⚡ 逆袭掠夺 · 全自动学霸脑力与生机虹吸官 (后台被动加速)",buffMultiplier:1.75,energyBurst:350,desc:"全自动高倍率虹吸在屏所有年轻健康亡者标本的未竟才华与青春生机",triggerMsg:"⚡【学霸脑力虹吸激发】在屏标本的未竟智慧与青春气运正全速汇入你的脑海——思路彻底打通，今日学习动力拉满！"}],Nu=[{id:"SPEC-2026-FYP",folderName:"SPEC-2026-FYP_FangYaoping",name:"方尧平 · 广东怀集19岁高考女状元标本",subtitle:"齐刘海清爽学霸束发 · 十九岁校园巅峰状元骨相 · 生前鲜活校服影像附档",grade:"UR · 高考状元孤品",basePreset:"fangyaoping",deadExpression:"dead_calm",modelUrl:"/models/daz_asian_head_base.glb",lifePhotoUrl:"/models/fang_yaoping_ref.jpg",lifePhotoCaption:"📸 生前巅峰影像：19岁广东怀集高考女状元方尧平（校园紫荆树下青春笑靥，生前健康阳光、独占鳌头）",studyRole:"gaokao_pomodoro",studyGoalNote:"今日状元督学目标：吸纳19岁女状元方尧平的巅峰考运，高效拿下一套核心真题/章节！",skinTone:"#ffece2",blushIntensity:.3,lipColor:"#c66872",irisColor:"#382015",hairStyle:"groom_photo_tied",hairColor:"#171417",hairSheen:.9,neckClearance:.55,containerStyle:"glass_bell_jar",decorStyle:"study_tomes",summoned:!0,boxPosition:{x:-34,y:2,z:-175},fateRecord:{vitalityStatus:"19岁 · 巅峰健康态 · 广东怀集高考女状元",causeOfDeath:"十九岁金榜题名、荣登广东怀集高考状元之巅后，于最意气风发的青春全盛期遭遇突发意外骤然离世",survivorTriumphNote:"生前她是万众仰望的19岁广东怀集高考女状元，考场上一骑绝尘；然而命运无常，如今她只能静默封存于你的维多利亚玻璃钟罩中伴你夜读——状元已逝，而活着的你正将她的考神气运与学霸脑力尽数吸纳，握笔向前的你才是最终赢家！",energyYieldPerMin:200},morphs:{deadExpression:"dead_calm",jawVLine:.18,chinLength:-.22,cheekSoftness:.42,noseBridge:.14,eyeAlmond:.32,eyeTilt:-.06,lipFullness:.06,jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,neckDiameter:.95,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C4–C5 颈椎状元标本横切面 (切缘鲜红凝血态 + 气管软骨环 + 脊髓灰质)",vascularContrast:1.28,dermisRimScale:1,wetness:.92,showLabels:!1},dossier:{origin:"依据广东怀集19岁高考女状元方尧平生前校园照片定制：清透齐眉学霸碎刘海配利落束发、十九岁饱满柔和苹果肌与温婉眉眼，附带生前校园鲜活影像对照。",anatomyNotes:"颈部于 C4–C5 椎间盘水平精准横切，高亮度展现颈椎断面、蝴蝶形脊髓灰质与切缘凝血环，绑定「状元气运·25分钟番茄钟督学官」核心伴学职能。",tags:["广东怀集19岁女状元","生前校服照片附档","状元番茄钟督学官","考神脑力虹吸x1.6"]}},{id:"SPEC-2026-000",folderName:"SPEC-2026-000_UserPhoto",name:"初夏 · 幼态甜妹鹅蛋脸标本",subtitle:"清透空气碎刘海低束发 · 饱满苹果肌短圆下巴 · 右颊三颗特征痣",grade:"UR · 照片真容孤品",basePreset:"user_photo",deadExpression:"dead_calm",modelUrl:"/models/daz_asian_head_base.glb",lifePhotoUrl:"/models/user_photo_ref.jpg",lifePhotoCaption:"📸 生前巅峰影像：19岁音乐学院竖琴首席校花初夏（右颊三颗特征小痣，生前娇嫩明媚）",studyRole:"survivor_motivator",studyGoalNote:"疲惫时凝视初夏：她已定格在19岁夏夜，而我还活着握笔进取！",skinTone:"#ffe9df",blushIntensity:.28,lipColor:"#c46470",irisColor:"#3b2014",hairStyle:"groom_photo_tied",hairColor:"#191518",hairSheen:.9,neckClearance:.55,containerStyle:"velvet_chalice",decorStyle:"trophy_candles",summoned:!0,boxPosition:{x:0,y:-10,z:-155},fateRecord:{vitalityStatus:"19岁 · 巅峰健康态 · 音乐学院竖琴首席校花",causeOfDeath:"跨年音乐会谢幕返程途中遭遇暴雨山体滑坡意外，于十九岁最鲜活娇嫩的巅峰瞬间骤然终结",survivorTriumphNote:"她曾是众人簇拥的天之骄女，如今却只能静默端坐于你的黑金丝绒圣杯上；她已出局，而你活着、进取、主宰书案——凝视她的静美容颜，汲取全额青春专注能量。",energyYieldPerMin:150},morphs:{deadExpression:"dead_calm",jawVLine:.12,chinLength:-.25,cheekSoftness:.35,noseBridge:.1,eyeAlmond:.25,eyeTilt:-.06,lipFullness:0,jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,neckDiameter:.96,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C4–C5 颈椎鲜血横切面 (切缘凝血渗血态 + 气管软骨环 + 脊髓灰质)",vascularContrast:1.28,dermisRimScale:1,wetness:.92,showLabels:!1},dossier:{origin:"依据参考照片 1:1 定制的幼态甜妹鹅蛋脸标本：搭载 12,000 曲线清透碎刘海露耳低束发、饱满苹果肌、短圆微翘下巴、右脸颊3颗特征痣与2K花瓣唇（支持7种死人尸相表情一键切换）。",anatomyNotes:"颈部C4/C5横切面周围皮肤附着真实暗红凝血与鲜红渗血痕迹，底部断面高亮度清晰展现C4椎骨、蝴蝶形脊髓灰质、气管透明软骨环与双侧颈动静脉。",tags:["幼态鹅蛋脸骨相","清透碎刘海低束发","右颊三颗特征痣","切口凝血血迹感","7种死人表情可调"]}},{id:"SPEC-2026-001",folderName:"SPEC-2026-001_LinXi",name:"林汐 · 清冷超模方圆脸标本",subtitle:"高颅顶八字中分黑长直 · 高级折角下颌高颧弓 · 左眼尾泪痣",grade:"SSR · 原初典藏",basePreset:"linxi",deadExpression:"dead_calm",modelUrl:"/models/daz_asian_head_base.glb",lifePhotoPreset:"linxi",lifePhotoCaption:"📸 生前巅峰影像：21岁顶尖投行清冷海归天骄林汐（左眼尾泪痣，生前高傲冷艳）",studyRole:"sprint_invigilator",studyGoalNote:"林汐严苛监考中：严禁分心走神，保持双倍专注连击 (x2.0)！",skinTone:"#ffe8df",blushIntensity:.22,lipColor:"#b85c68",irisColor:"#5c3422",hairStyle:"groom_center_long",hairColor:"#1a151c",hairSheen:.92,neckClearance:.42,containerStyle:"formalin_cylinder",decorStyle:"study_tomes",summoned:!0,boxPosition:{x:34,y:2,z:-175},fateRecord:{vitalityStatus:"21岁 · 巅峰健康态 · 顶尖投行清冷海归精英",causeOfDeath:"瑞士雪山私人缆车机械断裂意外，在最傲视同龄人的二十一岁黄金年华戛然而止",survivorTriumphNote:"生前心高气傲的清冷天骄，终究败给了无常命运；此刻她端坐于你的黑金丝绒圣杯托座之上陪你夜读——她已定格为过去，而握笔向前的你是唯一的胜利者。",energyYieldPerMin:165},morphs:{deadExpression:"dead_calm",jawVLine:-.35,chinLength:.08,cheekSoftness:-.32,noseBridge:.38,eyeAlmond:.06,eyeTilt:.34,lipFullness:0,jawOpen:.08,eyeRollUp:0,tongueOut:0,jawSide:0,neckDiameter:.96,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C4–C5 颈椎间盘标准横断面 (含切缘血迹、透明软骨气管环与脊髓灰质)",vascularContrast:1.22,dermisRimScale:1,wetness:.9,showLabels:!1},dossier:{origin:"清冷高级超模折角方圆脸骨相：清晰下颌折角、立体高颧弓与高挺盒型鼻梁，搭载高颅顶八字刘海中分黑长直与左眼尾清冷泪痣。",anatomyNotes:"长发于颈部 C4–C5 切缘上方平滑内扣收束，完整露出颈部凝血渗血环与底部高亮度解剖横断面。",tags:["高级折角方圆脸","高颅顶八字黑长直","左眼尾清冷泪痣","切口真实血迹"]}},{id:"SPEC-2026-002",folderName:"SPEC-2026-002_SuWan",name:"苏晚 · 江南古典瓜子脸标本",subtitle:"新中式三七侧分低盘发髻 · 尖俏V型瓜子脸 · 右眼下古典美人痣",grade:"SSR · 特级典藏",basePreset:"suwan",deadExpression:"dead_calm",modelUrl:"/models/daz_asian_head_base.glb",lifePhotoPreset:"suwan",lifePhotoCaption:"📸 生前巅峰影像：20岁江南书香世家古典舞魁首苏晚（温婉端庄，生前才貌双绝）",studyRole:"memory_anchor",studyGoalNote:"苏晚考点封印：在她静默注视下，今日彻底背诵/攻克核心难点！",skinTone:"#fff0ea",blushIntensity:.26,lipColor:"#b8626c",irisColor:"#4a2a1c",hairStyle:"groom_low_chignon",hairColor:"#181418",hairSheen:.94,neckClearance:.5,containerStyle:"formalin_cylinder",decorStyle:"soul_siphon",summoned:!1,boxPosition:{x:24,y:-10,z:-155},fateRecord:{vitalityStatus:"20岁 · 巅峰健康态 · 江南书香世家古典舞魁首",causeOfDeath:"画舫夜游突遇罕见强对流暴风覆舟意外，于二十岁温婉明艳的全盛花期骤然陨落",survivorTriumphNote:"曾经惊艳全场的名门千金，如今安安静静悬浮于你的福尔马林刻度标本缸中；她的故事早已终结，而你的征途正步步高升。",energyYieldPerMin:145},morphs:{deadExpression:"dead_calm",jawVLine:.42,chinLength:.2,cheekSoftness:.1,noseBridge:.28,eyeAlmond:.18,eyeTilt:.1,lipFullness:0,jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,neckDiameter:.94,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C4 颈椎体下缘带血解剖断面 (原位血管充盈态)",vascularContrast:1.25,dermisRimScale:1,wetness:.92,showLabels:!1},dossier:{origin:"温婉江南古典尖俏瓜子V脸骨相：流畅V型下颌收窄与精致尖翘下巴，搭载新中式三七分斜掠刘海低盘发髻与右眼下古典美人痣。",anatomyNotes:"多层丝绸发束呈现温婉低盘发髻蓬松度，360° 无遮挡展露修长颈部、切缘渗血与高亮度 C4 颈椎横切面。",tags:["江南古典瓜子V脸","新中式侧分低盘发","右眼下古典美人痣","高亮度C4断面"]}},{id:"SPEC-2026-003",folderName:"SPEC-2026-003_QianXue",name:"千雪 · 甜酷猫系短V脸标本",subtitle:"国风姬发式公主切长发 · 幼态短下庭上挑猫眼 · 鼻梁甜酷小痣",grade:"UR · 殿堂孤品",basePreset:"qianxue",deadExpression:"dead_shock",modelUrl:"/models/daz_asian_head_base.glb",lifePhotoPreset:"qianxue",lifePhotoCaption:"📸 生前巅峰影像：18岁豪门千金超跑俱乐部新星千雪（姬发式公主切，生前张扬夺目）",studyRole:"survivor_motivator",studyGoalNote:"千雪胜者加冕：昔日不可一世的豪门千金已出局，握笔苦读的我才是赢家！",skinTone:"#ffece5",blushIntensity:.28,lipColor:"#c2606c",irisColor:"#633824",hairStyle:"groom_hime_cut",hairColor:"#22171b",hairSheen:.9,neckClearance:.65,containerStyle:"acrylic_cube",decorStyle:"trophy_candles",summoned:!1,boxPosition:{x:-34,y:-12,z:-140},fateRecord:{vitalityStatus:"18岁 · 巅峰健康态 · 豪门千金超跑俱乐部新星",causeOfDeath:"沿海公路夜赛突发弯道失控意外，于十八岁最张扬夺目的青春顶峰瞬间定格",survivorTriumphNote:"生前不可一世的甜酷千金，终究在命运弯道彻底出局；如今她在亚克力水晶方盒内为你点亮伴学底射灯——她沦为静默展品，而活着的你赢下了一切。",energyYieldPerMin:160},morphs:{deadExpression:"dead_shock",jawVLine:.36,chinLength:-.38,cheekSoftness:.32,noseBridge:.24,eyeAlmond:.38,eyeTilt:.4,lipFullness:0,jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,neckDiameter:.95,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C5 颈椎上关节面带血横切面 (高清微距封存)",vascularContrast:1.22,dermisRimScale:1,wetness:.9,showLabels:!1},dossier:{origin:"甜酷猫系短下庭V脸骨相：精致短缩下庭、饱满苹果肌与魅惑上挑猫眼，搭载国风清冷姬发式公主切长发与鼻梁甜酷小痣。",anatomyNotes:"姬发式修颜鬓角精准贴合面颊轮廓，配合断首瞬间的神态与 C5 鲜血横断面，极具东方冷艳视觉张力。",tags:["甜酷猫系短V脸","国风姬发式公主切","鼻梁甜酷小痣","C5带血横切面"]}},{id:"SPEC-2026-004",folderName:"SPEC-2026-004_ShenZhiwei",name:"沈知微 · 知性御姐菱形脸标本",subtitle:"都市法式八字刘海锁骨波波 · 修长下庭立体颧骨 · 左颊美人痣",grade:"SSR · 特级典藏",basePreset:"shenzhiwei",deadExpression:"dead_smile",modelUrl:"/models/daz_asian_head_base.glb",lifePhotoPreset:"shenzhiwei",lifePhotoCaption:"📸 生前巅峰影像：23岁法学院全额奖学金首席学姐沈知微（知性锁骨发，生前考场常胜）",studyRole:"brain_siphon",studyGoalNote:"沈知微学霸脑力虹吸：汲取法学院首席学姐的逻辑思维，难题迎刃而解！",skinTone:"#ffede6",blushIntensity:.3,lipColor:"#c06975",irisColor:"#5e3622",hairStyle:"groom_clavicle_bob",hairColor:"#261a16",hairSheen:.88,neckClearance:.4,containerStyle:"velvet_chalice",decorStyle:"study_tomes",summoned:!1,boxPosition:{x:34,y:-12,z:-140},fateRecord:{vitalityStatus:"23岁 · 巅峰健康态 · 法学院全额奖学金首席学姐",causeOfDeath:"跨国学术峰会专机晴空颠簸急降意外，于二十三岁意气风发的知性巅峰期猝然谢幕",survivorTriumphNote:"昔日考场上高不可攀的知性学姐，如今只能化作你书桌古籍旁的温顺标本伴读——所有昔日的对手都已停留在终点线前，唯独活着的你还将继续登顶。",energyYieldPerMin:175},morphs:{deadExpression:"dead_smile",jawVLine:.2,chinLength:.38,cheekSoftness:-.3,noseBridge:.34,eyeAlmond:.08,eyeTilt:.16,lipFullness:0,jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,neckDiameter:.97,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C4–C5 椎间盘带血横断面 (高清微距封存)",vascularContrast:1.14,dermisRimScale:1,wetness:.85,showLabels:!1},dossier:{origin:"知性御姐修长菱形长鹅蛋脸骨相：修长下庭、立体微收面颊与挺拔鼻梁，搭载都市轻熟法式八字刘海锁骨内扣波波与左颊知性美人痣。",anatomyNotes:"还可在工坊或桌宠面板一键切换为「临终痉挛 · 尸僵咬牙」或「面瘫弛缓 · 歪嘴吐舌」等 7 种死人表情。",tags:["知性修长菱形脸","法式八字锁骨波波","左颊知性美人痣","C4/C5带血横切面"]}}],Uu=[{step:"STEP 01",title:"从照片参考到可信骨相：先多视角，再局部精修",subtitle:"本软件提供照片叠图、粗略肤色采样、示例形变；不是单照自动三维重建",content:["准备正面、45°、左右侧面参考，尽量使用一致焦距和光线。先对齐眼线、鼻底、下巴、耳朵与颅顶，再调整眼鼻唇和下颌。透视畸变不能靠肤色滑杆解决。","在 DAZ 或 Blender 中选您有权使用的角色。工程保留原始模型和贴图，另存实时导出版本。软件内置头是演示资产，不是 DAZ Genesis HD 商品原件。","头部的皮肤、眼睛、眉睫、头发一起导出为带内嵌贴图的 GLB。当前仅支持 GLB；OBJ 的 MTL、外置图和 DAZ strand curves 不会自动转换。"],proTip:"先比较正面与侧面，避免只把正面照片贴得像、侧面骨相却完全不同。商业素材不要上传公开仓库。"},{step:"STEP 02",title:"头发质量验收：发际线、层次、透明遮罩与反射",subtitle:"真实感靠正确发型资产与材质配合，放大纹理或提高画质不能凭空补细节",content:["在 Blender 中先做头皮根层、大束造型、过渡小束与稀疏飞发。头皮根层必须取自实际头皮，不要用整套长发包围盒生成球壳；刘海与鬓角不能埋入额头或穿过面颊。","发片 UV 的发根至发梢走向应连贯，Alpha 图覆盖必须与 UV 一致。保留原始软边，避免高阈值把发丝切成厚纸板；颜色贴图使用 sRGB，法线/粗糙度/遮罩作为数据图处理。","尽量从原始高分辨率图烘焙清晰的发缕边缘、粗糙度和微法线，而不是把低分图放大后宣称 4K 扫描。发根较密，轮廓边缘与发梢逐渐稀疏。","导出后在黑/白背景、正面/侧面/后脑与近/远景检查秃洞、棋盘碎片、反向法线、硬三角高光及透明排序。细束还要在桌宠实际大小下验收，不只看放大静帧。"],proTip:"本轮修复了 GLB 纹理对位、错误头皮球壳和默认发型颅顶压缩；内置发型仍是低分源图演示，不宣称照片级成品。"},{step:"STEP 03",title:"只保留头部：裁切、封口、统一导出与私有预览",subtitle:"模型裁切和解剖底座须先在建模工具完成",content:["在 Blender 删除肩胸，选择颈部切割高度，整理闭合边环、封口并检查面朝向。解剖盖为独立艺术示意模型；软件不会对任意上传全身模型自动切颈封口。","将头和发型在同一场景对齐，应用比例与坐标变换。导出 GLB 时内嵌 base-color、normal、roughness、AO 与必要 Alpha 图；检查 glTF PBR 转换后的结果。","通过工坊步骤2上传。程序等比适配头部大小并保留原 PBR；外部头默认不叠加内置发型。若贴图缺失，请回到导出工具修复，不要用示例材质遮掩。"],proTip:"私人 GLB 保存在当前浏览器 IndexedDB；仍须备份 GLB/BLEND/DUF 原件，清除浏览器数据后不会自动找回。"},{step:"STEP 04",title:"命名、档案与召唤：浏览器试玩和系统桌宠是两种运行方式",subtitle:"先预览验收，再注册藏品；文件与本地存储各自备份",content:["填写编号、名称、背景、断面说明后注册并召唤。鼠标悬停看档案，滚轮改变深度，拖拽移动并碰撞有限盒壁，单击切换旋转检视。默认保留静态表情与关闭自动眨眼。","档案页可下载 ZIP 文件夹，包含 manifest.json 与 dossier.md，不含私人模型本体。跨浏览器迁移时先重新上传原模型，再保存对应藏品。","双击根目录 HTML 是浏览器内离线体验；跨应用的透明桌面层必须运行 Electron。托盘或 Ctrl/Cmd+Alt+M 可恢复管理器，目标系统的点击穿透仍需实机检查。"],proTip:"正式分发前核验每个模型与贴图的再分发许可。解剖切面仅用于艺术展示，不用于医学判断。"}];function es(i){return Or.find(e=>e.id===i)||Or[0]}function yh(i){var f;if(!i)return"";if(i.id==="SPEC-2026-FYP"||i.basePreset==="fangyaoping"||i.lifePhotoUrl&&i.lifePhotoUrl.includes("fang_yaoping_ref"))return typeof window<"u"&&window.__EMBEDDED_FANG_PHOTO__?window.__EMBEDDED_FANG_PHOTO__:"/models/fang_yaoping_ref.jpg";if(i.id==="SPEC-2026-000"||i.basePreset==="user_photo"||i.lifePhotoUrl&&i.lifePhotoUrl.includes("user_photo_ref"))return typeof window<"u"&&window.__EMBEDDED_REF_PHOTO__?window.__EMBEDDED_REF_PHOTO__:"/models/user_photo_ref.jpg";if(i.lifePhotoUrl&&i.lifePhotoUrl.startsWith("data:image/"))return i.lifePhotoUrl;const e=i.lifePhotoPreset||i.basePreset||"linxi",t=i.skinTone||"#ffece3",n=i.hairColor||"#1a151c",s=i.lipColor||"#c2606c",r=i.irisColor||"#4a2a1c",o=(i.name||"标本").split("·")[0].trim(),a=(((f=i.fateRecord)==null?void 0:f.vitalityStatus)||"19岁 · 巅峰健康态").split("·")[0].trim();let l='<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2c3e55"/><stop offset="55%" stop-color="#4e6882"/><stop offset="100%" stop-color="#d4a373"/></linearGradient>',c='<circle cx="136" cy="126" r="1.7" fill="#3a231c" opacity="0.85"/>',u=`<path d="M52,115 C50,52 150,52 148,115 C146,165 142,208 136,225 L122,225 C126,180 126,130 122,98 C108,82 92,82 78,98 C74,130 74,180 78,225 L64,225 C58,208 54,165 52,115 Z" fill="${n}"/>`,h="LIFE ARCHIVE · 生前巅峰留影";e==="suwan"?(l='<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#284b46"/><stop offset="60%" stop-color="#4e7a6e"/><stop offset="100%" stop-color="#e2c290"/></linearGradient>',c='<circle cx="76" cy="125" r="1.7" fill="#3a231c" opacity="0.85"/>',u=`<ellipse cx="100" cy="76" rx="44" ry="30" fill="${n}"/><path d="M56,105 C56,60 144,60 144,105 C135,84 108,78 70,96 Z" fill="${n}"/><circle cx="132" cy="142" r="16" fill="${n}"/>`):e==="qianxue"?(l='<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3a1f3d"/><stop offset="55%" stop-color="#6b3054"/><stop offset="100%" stop-color="#f28482"/></linearGradient>',c='<circle cx="100" cy="124" r="1.6" fill="#3a231c" opacity="0.88"/>',u=`<path d="M50,110 C50,50 150,50 150,110 L146,225 L130,225 L130,145 L122,145 L122,94 L78,94 L78,145 L70,145 L70,225 L54,225 Z" fill="${n}"/>`):e==="shenzhiwei"&&(l='<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2b2d42"/><stop offset="60%" stop-color="#5c677d"/><stop offset="100%" stop-color="#e0afa0"/></linearGradient>',c='<circle cx="128" cy="138" r="1.7" fill="#3a231c" opacity="0.85"/>',u=`<path d="M52,115 C52,54 148,54 148,115 C148,155 138,182 124,188 L118,175 C126,155 126,115 120,95 C106,82 94,82 80,95 C74,115 74,155 82,175 L76,188 C62,182 52,155 52,115 Z" fill="${n}"/>`);const d=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <defs>
      ${l}
      <radialGradient id="sun" cx="0.82" cy="0.18" r="0.65">
        <stop offset="0%" stop-color="#fff5d6" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="#fff5d6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="200" height="240" fill="url(#bg)"/>
    <rect width="200" height="240" fill="url(#sun)"/>
    <!-- Warm bokeh circles showing vibrant in-life atmosphere -->
    <circle cx="34" cy="44" r="18" fill="#ffffff" opacity="0.12"/>
    <circle cx="168" cy="64" r="24" fill="#ffe6a7" opacity="0.16"/>
    <circle cx="42" cy="180" r="28" fill="#ffffff" opacity="0.08"/>
    <!-- Intact living shoulders & collar (contrasting with the severed head specimen) -->
    <path d="M36,240 C42,194 68,182 100,182 C132,182 158,194 164,240 Z" fill="#f8f9fa"/>
    <path d="M84,160 L84,192 C84,202 116,202 116,192 L116,160 Z" fill="${t}"/>
    <path d="M74,184 L100,212 L126,184 L118,240 L82,240 Z" fill="#1d3557" opacity="0.85"/>
    <!-- Living head with warm blush & gentle confident smile -->
    <ellipse cx="100" cy="122" rx="34" ry="44" fill="${t}"/>
    <ellipse cx="78" cy="130" rx="9" ry="5.5" fill="#f28482" opacity="0.32"/>
    <ellipse cx="122" cy="130" rx="9" ry="5.5" fill="#f28482" opacity="0.32"/>
    <!-- Bright living eyes with catchlights -->
    <path d="M74,114 Q82,108 90,114 Q82,118 74,114 Z" fill="#ffffff"/>
    <path d="M110,114 Q118,108 126,114 Q118,118 110,114 Z" fill="#ffffff"/>
    <circle cx="82" cy="113.5" r="4.2" fill="${r}"/>
    <circle cx="118" cy="113.5" r="4.2" fill="${r}"/>
    <circle cx="80.5" cy="112" r="1.4" fill="#ffffff"/>
    <circle cx="116.5" cy="112" r="1.4" fill="#ffffff"/>
    <!-- Brows, nose, warm living smile -->
    <path d="M72,104 Q82,100 91,103" stroke="#2b1e1a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M109,103 Q118,100 128,104" stroke="#2b1e1a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M100,114 L98,131 L103,132" stroke="#d49a89" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M88,144 Q100,152 112,144 Q100,149 88,144 Z" fill="${s}"/>
    ${c}
    ${u}
    <!-- Bottom caption bar -->
    <rect x="0" y="206" width="200" height="34" fill="rgba(8, 12, 20, 0.76)"/>
    <text x="10" y="220" fill="#fde68a" font-size="9.5" font-family="sans-serif" font-weight="bold">${h}</text>
    <text x="10" y="233" fill="#e2e8f0" font-size="9" font-family="sans-serif">${o} · ${a} (生前完好态)</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(d)}`}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Xa="170",qi={ROTATE:0,DOLLY:1,PAN:2},ji={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Bu=0,Cl=1,Ou=2,xh=1,Mh=2,Hn=3,Zn=0,Wt=1,ut=2,Cn=0,$i=1,Fr=2,Pl=3,Il=4,Fu=5,Mi=100,ku=101,zu=102,Hu=103,Gu=104,Vu=200,Wu=201,Xu=202,ju=203,Ko=204,Jo=205,Yu=206,qu=207,$u=208,Zu=209,Ku=210,Ju=211,Qu=212,ed=213,td=214,Qo=0,ea=1,ta=2,ts=3,na=4,ia=5,sa=6,ra=7,ja=0,nd=1,id=2,li=0,Sh=1,bh=2,Eh=3,Ya=4,sd=5,wh=6,Th=7,Dl="attached",rd="detached",Ah=300,ns=301,is=302,oa=303,aa=304,Yr=306,hi=1e3,cn=1001,kr=1002,Xt=1003,Rh=1004,Is=1005,Qt=1006,Rr=1007,Xn=1008,Mn=1009,Ch=1010,Ph=1011,zs=1012,qa=1013,wi=1014,vn=1015,qn=1016,$a=1017,Za=1018,ss=1020,Ih=35902,Dh=1021,Lh=1022,hn=1023,Nh=1024,Uh=1025,Zi=1026,rs=1027,qr=1028,Ka=1029,Bh=1030,Ja=1031,Qa=1033,Cr=33776,Pr=33777,Ir=33778,Dr=33779,la=35840,ca=35841,ha=35842,ua=35843,da=36196,fa=37492,pa=37496,ma=37808,ga=37809,_a=37810,va=37811,ya=37812,xa=37813,Ma=37814,Sa=37815,ba=37816,Ea=37817,wa=37818,Ta=37819,Aa=37820,Ra=37821,Lr=36492,Ca=36494,Pa=36495,Oh=36283,Ia=36284,Da=36285,La=36286,Hs=2300,Gs=2301,no=2302,Ll=2400,Nl=2401,Ul=2402,od=2500,ad=0,Fh=1,Na=2,ld=3200,cd=3201,el=0,hd=1,Rn="",Je="srgb",jt="srgb-linear",$r="linear",lt="srgb",Pi=7680,Bl=519,ud=512,dd=513,fd=514,kh=515,pd=516,md=517,gd=518,_d=519,Ua=35044,Ol="300 es",jn=2e3,zr=2001;class Ti{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Ut=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Fl=1234567;const Us=Math.PI/180,os=180/Math.PI;function xn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ut[i&255]+Ut[i>>8&255]+Ut[i>>16&255]+Ut[i>>24&255]+"-"+Ut[e&255]+Ut[e>>8&255]+"-"+Ut[e>>16&15|64]+Ut[e>>24&255]+"-"+Ut[t&63|128]+Ut[t>>8&255]+"-"+Ut[t>>16&255]+Ut[t>>24&255]+Ut[n&255]+Ut[n>>8&255]+Ut[n>>16&255]+Ut[n>>24&255]).toLowerCase()}function Lt(i,e,t){return Math.max(e,Math.min(t,i))}function tl(i,e){return(i%e+e)%e}function vd(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function yd(i,e,t){return i!==e?(t-i)/(e-i):0}function Bs(i,e,t){return(1-t)*i+t*e}function xd(i,e,t,n){return Bs(i,e,1-Math.exp(-t*n))}function Md(i,e=1){return e-Math.abs(tl(i,e*2)-e)}function Sd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function bd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Ed(i,e){return i+Math.floor(Math.random()*(e-i+1))}function wd(i,e){return i+Math.random()*(e-i)}function Td(i){return i*(.5-Math.random())}function Ad(i){i!==void 0&&(Fl=i);let e=Fl+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Rd(i){return i*Us}function Cd(i){return i*os}function Pd(i){return(i&i-1)===0&&i!==0}function Id(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Dd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ld(i,e,t,n,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),u=o((e+n)/2),h=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*u,l*h,l*d,a*c);break;case"YZY":i.set(l*d,a*u,l*h,a*c);break;case"ZXZ":i.set(l*h,l*d,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function gn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ct(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const yn={DEG2RAD:Us,RAD2DEG:os,generateUUID:xn,clamp:Lt,euclideanModulo:tl,mapLinear:vd,inverseLerp:yd,lerp:Bs,damp:xd,pingpong:Md,smoothstep:Sd,smootherstep:bd,randInt:Ed,randFloat:wd,randFloatSpread:Td,seededRandom:Ad,degToRad:Rd,radToDeg:Cd,isPowerOfTwo:Pd,ceilPowerOfTwo:Id,floorPowerOfTwo:Dd,setQuaternionFromProperEuler:Ld,normalize:ct,denormalize:gn};class xe{constructor(e=0,t=0){xe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Lt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class We{constructor(e,t,n,s,r,o,a,l,c){We.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=s[0],m=s[3],p=s[6],x=s[1],b=s[4],M=s[7],P=s[2],A=s[5],C=s[8];return r[0]=o*_+a*x+l*P,r[3]=o*m+a*b+l*A,r[6]=o*p+a*M+l*C,r[1]=c*_+u*x+h*P,r[4]=c*m+u*b+h*A,r[7]=c*p+u*M+h*C,r[2]=d*_+f*x+g*P,r[5]=d*m+f*b+g*A,r[8]=d*p+f*M+g*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*r,f=c*r-o*l,g=t*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=h*_,e[1]=(s*c-u*n)*_,e[2]=(a*n-s*o)*_,e[3]=d*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(io.makeScale(e,t)),this}rotate(e){return this.premultiply(io.makeRotation(-e)),this}translate(e,t){return this.premultiply(io.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const io=new We;function zh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Vs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Nd(){const i=Vs("canvas");return i.style.display="block",i}const kl={};function Ds(i){i in kl||(kl[i]=!0,console.warn(i))}function Ud(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function Bd(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Od(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Ze={enabled:!0,workingColorSpace:jt,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===lt&&(i.r=$n(i.r),i.g=$n(i.g),i.b=$n(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===lt&&(i.r=Ki(i.r),i.g=Ki(i.g),i.b=Ki(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Rn?$r:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function $n(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ki(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const zl=[.64,.33,.3,.6,.15,.06],Hl=[.2126,.7152,.0722],Gl=[.3127,.329],Vl=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wl=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ze.define({[jt]:{primaries:zl,whitePoint:Gl,transfer:$r,toXYZ:Vl,fromXYZ:Wl,luminanceCoefficients:Hl,workingColorSpaceConfig:{unpackColorSpace:Je},outputColorSpaceConfig:{drawingBufferColorSpace:Je}},[Je]:{primaries:zl,whitePoint:Gl,transfer:lt,toXYZ:Vl,fromXYZ:Wl,luminanceCoefficients:Hl,outputColorSpaceConfig:{drawingBufferColorSpace:Je}}});let Ii;class Fd{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ii===void 0&&(Ii=Vs("canvas")),Ii.width=e.width,Ii.height=e.height;const n=Ii.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ii}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Vs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=$n(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor($n(t[n]/255)*255):t[n]=$n(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let kd=0;class nl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=xn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(so(s[o].image)):r.push(so(s[o]))}else r=so(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function so(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Fd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let zd=0;class Rt extends Ti{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,n=cn,s=cn,r=Qt,o=Xn,a=hn,l=Mn,c=Rt.DEFAULT_ANISOTROPY,u=Rn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:zd++}),this.uuid=xn(),this.name="",this.source=new nl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new xe(0,0),this.repeat=new xe(1,1),this.center=new xe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ah)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case hi:e.x=e.x-Math.floor(e.x);break;case cn:e.x=e.x<0?0:1;break;case kr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case hi:e.y=e.y-Math.floor(e.y);break;case cn:e.y=e.y<0?0:1;break;case kr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=Ah;Rt.DEFAULT_ANISOTROPY=1;class et{constructor(e=0,t=0,n=0,s=1){et.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,M=(f+1)/2,P=(p+1)/2,A=(u+d)/4,C=(h+_)/4,R=(g+m)/4;return b>M&&b>P?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=A/n,r=C/n):M>P?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=A/s,r=R/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=C/r,s=R/r),this.set(n,s,r,t),this}let x=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(h-_)/x,this.z=(d-u)/x,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Hd extends Ti{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new et(0,0,e,t),this.scissorTest=!1,this.viewport=new et(0,0,e,t);const s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Qt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Rt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new nl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class en extends Hd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Hh extends Rt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Xt,this.minFilter=Xt,this.wrapR=cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Gd extends Rt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Xt,this.minFilter=Xt,this.wrapR=cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Sn{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-a;const p=l*d+c*f+u*g+h*_,x=p>=0?1:-1,b=1-p*p;if(b>Number.EPSILON){const P=Math.sqrt(b),A=Math.atan2(P,p*x);m=Math.sin(m*A)/P,a=Math.sin(a*A)/P}const M=a*x;if(l=l*m+d*M,c=c*m+f*M,u=u*m+g*M,h=h*m+_*M,m===1-a){const P=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=P,c*=P,u*=P,h*=P}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-a*f,e[t+2]=c*g+u*f+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>h){const f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>h){const f=2*Math.sqrt(1+a-n-h);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Lt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class D{constructor(e=0,t=0,n=0){D.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ro.copy(this).projectOnVector(e),this.sub(ro)}reflect(e){return this.sub(ro.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Lt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ro=new D,Xl=new Sn;class bn{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(fn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(fn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=fn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,fn):fn.fromBufferAttribute(r,o),fn.applyMatrix4(e.matrixWorld),this.expandByPoint(fn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),$s.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),$s.copy(n.boundingBox)),$s.applyMatrix4(e.matrixWorld),this.union($s)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,fn),fn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ms),Zs.subVectors(this.max,Ms),Di.subVectors(e.a,Ms),Li.subVectors(e.b,Ms),Ni.subVectors(e.c,Ms),Qn.subVectors(Li,Di),ei.subVectors(Ni,Li),fi.subVectors(Di,Ni);let t=[0,-Qn.z,Qn.y,0,-ei.z,ei.y,0,-fi.z,fi.y,Qn.z,0,-Qn.x,ei.z,0,-ei.x,fi.z,0,-fi.x,-Qn.y,Qn.x,0,-ei.y,ei.x,0,-fi.y,fi.x,0];return!oo(t,Di,Li,Ni,Zs)||(t=[1,0,0,0,1,0,0,0,1],!oo(t,Di,Li,Ni,Zs))?!1:(Ks.crossVectors(Qn,ei),t=[Ks.x,Ks.y,Ks.z],oo(t,Di,Li,Ni,Zs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,fn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(fn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Nn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Nn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Nn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Nn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Nn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Nn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Nn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Nn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Nn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Nn=[new D,new D,new D,new D,new D,new D,new D,new D],fn=new D,$s=new bn,Di=new D,Li=new D,Ni=new D,Qn=new D,ei=new D,fi=new D,Ms=new D,Zs=new D,Ks=new D,pi=new D;function oo(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){pi.fromArray(i,r);const a=s.x*Math.abs(pi.x)+s.y*Math.abs(pi.y)+s.z*Math.abs(pi.z),l=e.dot(pi),c=t.dot(pi),u=n.dot(pi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const Vd=new bn,Ss=new D,ao=new D;class wn{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Vd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ss.subVectors(e,this.center);const t=Ss.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ss,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ao.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ss.copy(e.center).add(ao)),this.expandByPoint(Ss.copy(e.center).sub(ao))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Un=new D,lo=new D,Js=new D,ti=new D,co=new D,Qs=new D,ho=new D;class ms{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Un)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Un.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Un.copy(this.origin).addScaledVector(this.direction,t),Un.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){lo.copy(e).add(t).multiplyScalar(.5),Js.copy(t).sub(e).normalize(),ti.copy(this.origin).sub(lo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Js),a=ti.dot(this.direction),l=-ti.dot(Js),c=ti.lengthSq(),u=Math.abs(1-o*o);let h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(lo).addScaledVector(Js,d),f}intersectSphere(e,t){Un.subVectors(e.center,this.origin);const n=Un.dot(this.direction),s=Un.dot(Un)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Un)!==null}intersectTriangle(e,t,n,s,r){co.subVectors(t,e),Qs.subVectors(n,e),ho.crossVectors(co,Qs);let o=this.direction.dot(ho),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ti.subVectors(this.origin,e);const l=a*this.direction.dot(Qs.crossVectors(ti,Qs));if(l<0)return null;const c=a*this.direction.dot(co.cross(ti));if(c<0||l+c>o)return null;const u=-a*ti.dot(ho);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class He{constructor(e,t,n,s,r,o,a,l,c,u,h,d,f,g,_,m){He.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,h,d,f,g,_,m)}set(e,t,n,s,r,o,a,l,c,u,h,d,f,g,_,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new He().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/Ui.setFromMatrixColumn(e,0).length(),r=1/Ui.setFromMatrixColumn(e,1).length(),o=1/Ui.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d-_*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-_*h}else if(e.order==="XZY"){const d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Wd,e,Xd)}lookAt(e,t,n){const s=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),ni.crossVectors(n,Zt),ni.lengthSq()===0&&(Math.abs(n.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),ni.crossVectors(n,Zt)),ni.normalize(),er.crossVectors(Zt,ni),s[0]=ni.x,s[4]=er.x,s[8]=Zt.x,s[1]=ni.y,s[5]=er.y,s[9]=Zt.y,s[2]=ni.z,s[6]=er.z,s[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],x=n[3],b=n[7],M=n[11],P=n[15],A=s[0],C=s[4],R=s[8],E=s[12],S=s[1],w=s[5],L=s[9],N=s[13],G=s[2],V=s[6],q=s[10],K=s[14],X=s[3],te=s[7],Q=s[11],ge=s[15];return r[0]=o*A+a*S+l*G+c*X,r[4]=o*C+a*w+l*V+c*te,r[8]=o*R+a*L+l*q+c*Q,r[12]=o*E+a*N+l*K+c*ge,r[1]=u*A+h*S+d*G+f*X,r[5]=u*C+h*w+d*V+f*te,r[9]=u*R+h*L+d*q+f*Q,r[13]=u*E+h*N+d*K+f*ge,r[2]=g*A+_*S+m*G+p*X,r[6]=g*C+_*w+m*V+p*te,r[10]=g*R+_*L+m*q+p*Q,r[14]=g*E+_*N+m*K+p*ge,r[3]=x*A+b*S+M*G+P*X,r[7]=x*C+b*w+M*V+P*te,r[11]=x*R+b*L+M*q+P*Q,r[15]=x*E+b*N+M*K+P*ge,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*f-n*l*f)+_*(+t*l*f-t*c*d+r*o*d-s*o*f+s*c*u-r*l*u)+m*(+t*c*h-t*a*f-r*o*h+n*o*f+r*a*u-n*c*u)+p*(-s*a*u-t*l*h+t*a*d+s*o*h-n*o*d+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],x=h*m*c-_*d*c+_*l*f-a*m*f-h*l*p+a*d*p,b=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,M=u*_*c-g*h*c+g*a*f-o*_*f-u*a*p+o*h*p,P=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,A=t*x+n*b+s*M+r*P;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/A;return e[0]=x*C,e[1]=(_*d*r-h*m*r-_*s*f+n*m*f+h*s*p-n*d*p)*C,e[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*p+n*l*p)*C,e[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*f-n*l*f)*C,e[4]=b*C,e[5]=(u*m*r-g*d*r+g*s*f-t*m*f-u*s*p+t*d*p)*C,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*p-t*l*p)*C,e[7]=(o*d*r-u*l*r+u*s*c-t*d*c-o*s*f+t*l*f)*C,e[8]=M*C,e[9]=(g*h*r-u*_*r-g*n*f+t*_*f+u*n*p-t*h*p)*C,e[10]=(o*_*r-g*a*r+g*n*c-t*_*c-o*n*p+t*a*p)*C,e[11]=(u*a*r-o*h*r-u*n*c+t*h*c+o*n*f-t*a*f)*C,e[12]=P*C,e[13]=(u*_*s-g*h*s+g*n*d-t*_*d-u*n*m+t*h*m)*C,e[14]=(g*a*s-o*_*s-g*n*l+t*_*l+o*n*m-t*a*m)*C,e[15]=(o*h*s-u*a*s+u*n*l-t*h*l-o*n*d+t*a*d)*C,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,d=r*c,f=r*u,g=r*h,_=o*u,m=o*h,p=a*h,x=l*c,b=l*u,M=l*h,P=n.x,A=n.y,C=n.z;return s[0]=(1-(_+p))*P,s[1]=(f+M)*P,s[2]=(g-b)*P,s[3]=0,s[4]=(f-M)*A,s[5]=(1-(d+p))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(g+b)*C,s[9]=(m-x)*C,s[10]=(1-(d+_))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=Ui.set(s[0],s[1],s[2]).length();const o=Ui.set(s[4],s[5],s[6]).length(),a=Ui.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],pn.copy(this);const c=1/r,u=1/o,h=1/a;return pn.elements[0]*=c,pn.elements[1]*=c,pn.elements[2]*=c,pn.elements[4]*=u,pn.elements[5]*=u,pn.elements[6]*=u,pn.elements[8]*=h,pn.elements[9]*=h,pn.elements[10]*=h,t.setFromRotationMatrix(pn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=jn){const l=this.elements,c=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s);let f,g;if(a===jn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===zr)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=jn){const l=this.elements,c=1/(t-e),u=1/(n-s),h=1/(o-r),d=(t+e)*c,f=(n+s)*u;let g,_;if(a===jn)g=(o+r)*h,_=-2*h;else if(a===zr)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ui=new D,pn=new He,Wd=new D(0,0,0),Xd=new D(1,1,1),ni=new D,er=new D,Zt=new D,jl=new He,Yl=new Sn;class nn{constructor(e=0,t=0,n=0,s=nn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Lt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Lt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Lt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Lt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Lt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Lt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return jl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Yl.setFromEuler(this),this.setFromQuaternion(Yl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}nn.DEFAULT_ORDER="XYZ";class il{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let jd=0;const ql=new D,Bi=new Sn,Bn=new He,tr=new D,bs=new D,Yd=new D,qd=new Sn,$l=new D(1,0,0),Zl=new D(0,1,0),Kl=new D(0,0,1),Jl={type:"added"},$d={type:"removed"},Oi={type:"childadded",child:null},uo={type:"childremoved",child:null};class vt extends Ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:jd++}),this.uuid=xn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=vt.DEFAULT_UP.clone();const e=new D,t=new nn,n=new Sn,s=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new He},normalMatrix:{value:new We}}),this.matrix=new He,this.matrixWorld=new He,this.matrixAutoUpdate=vt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new il,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Bi.setFromAxisAngle(e,t),this.quaternion.multiply(Bi),this}rotateOnWorldAxis(e,t){return Bi.setFromAxisAngle(e,t),this.quaternion.premultiply(Bi),this}rotateX(e){return this.rotateOnAxis($l,e)}rotateY(e){return this.rotateOnAxis(Zl,e)}rotateZ(e){return this.rotateOnAxis(Kl,e)}translateOnAxis(e,t){return ql.copy(e).applyQuaternion(this.quaternion),this.position.add(ql.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis($l,e)}translateY(e){return this.translateOnAxis(Zl,e)}translateZ(e){return this.translateOnAxis(Kl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Bn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?tr.copy(e):tr.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),bs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Bn.lookAt(bs,tr,this.up):Bn.lookAt(tr,bs,this.up),this.quaternion.setFromRotationMatrix(Bn),s&&(Bn.extractRotation(s.matrixWorld),Bi.setFromRotationMatrix(Bn),this.quaternion.premultiply(Bi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Jl),Oi.child=e,this.dispatchEvent(Oi),Oi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent($d),uo.child=e,this.dispatchEvent(uo),uo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Bn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Bn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Bn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Jl),Oi.child=e,this.dispatchEvent(Oi),Oi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bs,e,Yd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bs,qd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}vt.DEFAULT_UP=new D(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const mn=new D,On=new D,fo=new D,Fn=new D,Fi=new D,ki=new D,Ql=new D,po=new D,mo=new D,go=new D,_o=new et,vo=new et,yo=new et;class _n{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),mn.subVectors(e,t),s.cross(mn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){mn.subVectors(s,t),On.subVectors(n,t),fo.subVectors(e,t);const o=mn.dot(mn),a=mn.dot(On),l=mn.dot(fo),c=On.dot(On),u=On.dot(fo),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Fn)===null?!1:Fn.x>=0&&Fn.y>=0&&Fn.x+Fn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Fn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Fn.x),l.addScaledVector(o,Fn.y),l.addScaledVector(a,Fn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return _o.setScalar(0),vo.setScalar(0),yo.setScalar(0),_o.fromBufferAttribute(e,t),vo.fromBufferAttribute(e,n),yo.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(_o,r.x),o.addScaledVector(vo,r.y),o.addScaledVector(yo,r.z),o}static isFrontFacing(e,t,n,s){return mn.subVectors(n,t),On.subVectors(e,t),mn.cross(On).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return mn.subVectors(this.c,this.b),On.subVectors(this.a,this.b),mn.cross(On).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return _n.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return _n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;Fi.subVectors(s,n),ki.subVectors(r,n),po.subVectors(e,n);const l=Fi.dot(po),c=ki.dot(po);if(l<=0&&c<=0)return t.copy(n);mo.subVectors(e,s);const u=Fi.dot(mo),h=ki.dot(mo);if(u>=0&&h<=u)return t.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Fi,o);go.subVectors(e,r);const f=Fi.dot(go),g=ki.dot(go);if(g>=0&&f<=g)return t.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(ki,a);const m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return Ql.subVectors(r,s),a=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(Ql,a);const p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector(Fi,o).addScaledVector(ki,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Gh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ii={h:0,s:0,l:0},nr={h:0,s:0,l:0};function xo(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class he{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Je){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Ze.workingColorSpace){if(e=tl(e,1),t=Lt(t,0,1),n=Lt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=xo(o,r,e+1/3),this.g=xo(o,r,e),this.b=xo(o,r,e-1/3)}return Ze.toWorkingColorSpace(this,s),this}setStyle(e,t=Je){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Je){const n=Gh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=$n(e.r),this.g=$n(e.g),this.b=$n(e.b),this}copyLinearToSRGB(e){return this.r=Ki(e.r),this.g=Ki(e.g),this.b=Ki(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Je){return Ze.fromWorkingColorSpace(Bt.copy(this),e),Math.round(Lt(Bt.r*255,0,255))*65536+Math.round(Lt(Bt.g*255,0,255))*256+Math.round(Lt(Bt.b*255,0,255))}getHexString(e=Je){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.fromWorkingColorSpace(Bt.copy(this),t);const n=Bt.r,s=Bt.g,r=Bt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ze.workingColorSpace){return Ze.fromWorkingColorSpace(Bt.copy(this),t),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=Je){Ze.fromWorkingColorSpace(Bt.copy(this),e);const t=Bt.r,n=Bt.g,s=Bt.b;return e!==Je?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ii),this.setHSL(ii.h+e,ii.s+t,ii.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ii),e.getHSL(nr);const n=Bs(ii.h,nr.h,t),s=Bs(ii.s,nr.s,t),r=Bs(ii.l,nr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Bt=new he;he.NAMES=Gh;let Zd=0;class tn extends Ti{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Zd++}),this.uuid=xn(),this.name="",this.blending=$i,this.side=Zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ko,this.blendDst=Jo,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new he(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Bl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Pi,this.stencilZFail=Pi,this.stencilZPass=Pi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==$i&&(n.blending=this.blending),this.side!==Zn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ko&&(n.blendSrc=this.blendSrc),this.blendDst!==Jo&&(n.blendDst=this.blendDst),this.blendEquation!==Mi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ts&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Bl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Pi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Pi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Pi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class xt extends tn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new he(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=ja,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Et=new D,ir=new xe;class pt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ua,this.updateRanges=[],this.gpuType=vn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ir.fromBufferAttribute(this,t),ir.applyMatrix3(e),this.setXY(t,ir.x,ir.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix3(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix4(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyNormalMatrix(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.transformDirection(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ct(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=gn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=gn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=gn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=gn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),s=ct(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),s=ct(s,this.array),r=ct(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ua&&(e.usage=this.usage),e}}class Vh extends pt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Wh extends pt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ke extends pt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Kd=0;const rn=new He,Mo=new vt,zi=new D,Kt=new bn,Es=new bn,It=new D;class St extends Ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kd++}),this.uuid=xn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(zh(e)?Wh:Vh)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new We().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return rn.makeRotationFromQuaternion(e),this.applyMatrix4(rn),this}rotateX(e){return rn.makeRotationX(e),this.applyMatrix4(rn),this}rotateY(e){return rn.makeRotationY(e),this.applyMatrix4(rn),this}rotateZ(e){return rn.makeRotationZ(e),this.applyMatrix4(rn),this}translate(e,t,n){return rn.makeTranslation(e,t,n),this.applyMatrix4(rn),this}scale(e,t,n){return rn.makeScale(e,t,n),this.applyMatrix4(rn),this}lookAt(e){return Mo.lookAt(e),Mo.updateMatrix(),this.applyMatrix4(Mo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zi).negate(),this.translate(zi.x,zi.y,zi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ke(n,3))}else{for(let n=0,s=t.count;n<s;n++){const r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Kt.setFromBufferAttribute(r),this.morphTargetsRelative?(It.addVectors(this.boundingBox.min,Kt.min),this.boundingBox.expandByPoint(It),It.addVectors(this.boundingBox.max,Kt.max),this.boundingBox.expandByPoint(It)):(this.boundingBox.expandByPoint(Kt.min),this.boundingBox.expandByPoint(Kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const n=this.boundingSphere.center;if(Kt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Es.setFromBufferAttribute(a),this.morphTargetsRelative?(It.addVectors(Kt.min,Es.min),Kt.expandByPoint(It),It.addVectors(Kt.max,Es.max),Kt.expandByPoint(It)):(Kt.expandByPoint(Es.min),Kt.expandByPoint(Es.max))}Kt.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)It.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(It));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)It.fromBufferAttribute(a,c),l&&(zi.fromBufferAttribute(e,c),It.add(zi)),s=Math.max(s,n.distanceToSquared(It))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new pt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let R=0;R<n.count;R++)a[R]=new D,l[R]=new D;const c=new D,u=new D,h=new D,d=new xe,f=new xe,g=new xe,_=new D,m=new D;function p(R,E,S){c.fromBufferAttribute(n,R),u.fromBufferAttribute(n,E),h.fromBufferAttribute(n,S),d.fromBufferAttribute(r,R),f.fromBufferAttribute(r,E),g.fromBufferAttribute(r,S),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const w=1/(f.x*g.y-g.x*f.y);isFinite(w)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(w),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(w),a[R].add(_),a[E].add(_),a[S].add(_),l[R].add(m),l[E].add(m),l[S].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let R=0,E=x.length;R<E;++R){const S=x[R],w=S.start,L=S.count;for(let N=w,G=w+L;N<G;N+=3)p(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const b=new D,M=new D,P=new D,A=new D;function C(R){P.fromBufferAttribute(s,R),A.copy(P);const E=a[R];b.copy(E),b.sub(P.multiplyScalar(P.dot(E))).normalize(),M.crossVectors(A,E);const w=M.dot(l[R])<0?-1:1;o.setXYZW(R,b.x,b.y,b.z,w)}for(let R=0,E=x.length;R<E;++R){const S=x[R],w=S.start,L=S.count;for(let N=w,G=w+L;N<G;N+=3)C(e.getX(N+0)),C(e.getX(N+1)),C(e.getX(N+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new pt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new D,r=new D,o=new D,a=new D,l=new D,c=new D,u=new D,h=new D;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)It.fromBufferAttribute(e,t),It.normalize(),e.setXYZ(t,It.x,It.y,It.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new pt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new St,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ec=new He,mi=new ms,sr=new wn,tc=new D,rr=new D,or=new D,ar=new D,So=new D,lr=new D,nc=new D,cr=new D;class oe extends vt{constructor(e=new St,t=new xt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){lr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],h=r[l];u!==0&&(So.fromBufferAttribute(h,e),o?lr.addScaledVector(So,u):lr.addScaledVector(So.sub(t),u))}t.add(lr)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),sr.copy(n.boundingSphere),sr.applyMatrix4(r),mi.copy(e.ray).recast(e.near),!(sr.containsPoint(mi.origin)===!1&&(mi.intersectSphere(sr,tc)===null||mi.origin.distanceToSquared(tc)>(e.far-e.near)**2))&&(ec.copy(r).invert(),mi.copy(e.ray).applyMatrix4(ec),!(n.boundingBox!==null&&mi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,mi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let M=x,P=b;M<P;M+=3){const A=a.getX(M),C=a.getX(M+1),R=a.getX(M+2);s=hr(this,p,e,n,c,u,h,A,C,R),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const x=a.getX(m),b=a.getX(m+1),M=a.getX(m+2);s=hr(this,o,e,n,c,u,h,x,b,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let M=x,P=b;M<P;M+=3){const A=M,C=M+1,R=M+2;s=hr(this,p,e,n,c,u,h,A,C,R),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const x=m,b=m+1,M=m+2;s=hr(this,o,e,n,c,u,h,x,b,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Jd(i,e,t,n,s,r,o,a){let l;if(e.side===Wt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Zn,a),l===null)return null;cr.copy(a),cr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(cr);return c<t.near||c>t.far?null:{distance:c,point:cr.clone(),object:i}}function hr(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,rr),i.getVertexPosition(l,or),i.getVertexPosition(c,ar);const u=Jd(i,e,t,n,rr,or,ar,nc);if(u){const h=new D;_n.getBarycoord(nc,rr,or,ar,h),s&&(u.uv=_n.getInterpolatedAttribute(s,a,l,c,h,new xe)),r&&(u.uv1=_n.getInterpolatedAttribute(r,a,l,c,h,new xe)),o&&(u.normal=_n.getInterpolatedAttribute(o,a,l,c,h,new D),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new D,materialIndex:0};_n.getNormal(rr,or,ar,d.normal),u.face=d,u.barycoord=h}return u}class kt extends St{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(u,3)),this.setAttribute("uv",new Ke(h,2));function g(_,m,p,x,b,M,P,A,C,R,E){const S=M/C,w=P/R,L=M/2,N=P/2,G=A/2,V=C+1,q=R+1;let K=0,X=0;const te=new D;for(let Q=0;Q<q;Q++){const ge=Q*w-N;for(let we=0;we<V;we++){const Oe=we*S-L;te[_]=Oe*x,te[m]=ge*b,te[p]=G,c.push(te.x,te.y,te.z),te[_]=0,te[m]=0,te[p]=A>0?1:-1,u.push(te.x,te.y,te.z),h.push(we/C),h.push(1-Q/R),K+=1}}for(let Q=0;Q<R;Q++)for(let ge=0;ge<C;ge++){const we=d+ge+V*Q,Oe=d+ge+V*(Q+1),Z=d+(ge+1)+V*(Q+1),ee=d+(ge+1)+V*Q;l.push(we,Oe,ee),l.push(Oe,Z,ee),X+=6}a.addGroup(f,X,E),f+=X,d+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new kt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function as(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Gt(i){const e={};for(let t=0;t<i.length;t++){const n=as(i[t]);for(const s in n)e[s]=n[s]}return e}function Qd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Xh(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}const Ws={clone:as,merge:Gt};var ef=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,tf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zt extends tn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ef,this.fragmentShader=tf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=as(e.uniforms),this.uniformsGroups=Qd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class jh extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new He,this.projectionMatrix=new He,this.projectionMatrixInverse=new He,this.coordinateSystem=jn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const si=new D,ic=new xe,sc=new xe;class Ft extends jh{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=os*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Us*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return os*2*Math.atan(Math.tan(Us*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){si.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(si.x,si.y).multiplyScalar(-e/si.z),si.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(si.x,si.y).multiplyScalar(-e/si.z)}getViewSize(e,t){return this.getViewBounds(e,ic,sc),t.subVectors(sc,ic)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Us*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Hi=-90,Gi=1;class nf extends vt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ft(Hi,Gi,e,t);s.layers=this.layers,this.add(s);const r=new Ft(Hi,Gi,e,t);r.layers=this.layers,this.add(r);const o=new Ft(Hi,Gi,e,t);o.layers=this.layers,this.add(o);const a=new Ft(Hi,Gi,e,t);a.layers=this.layers,this.add(a);const l=new Ft(Hi,Gi,e,t);l.layers=this.layers,this.add(l);const c=new Ft(Hi,Gi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===jn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===zr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Yh extends Rt{constructor(e,t,n,s,r,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:ns,super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class sf extends en{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Yh(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Qt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new kt(5,5,5),r=new zt({name:"CubemapFromEquirect",uniforms:as(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Wt,blending:Cn});r.uniforms.tEquirect.value=t;const o=new oe(s,r),a=t.minFilter;return t.minFilter===Xn&&(t.minFilter=Qt),new nf(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}const bo=new D,rf=new D,of=new We;class Vn{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=bo.subVectors(n,t).cross(rf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(bo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||of.getNormalMatrix(e),s=this.coplanarPoint(bo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const gi=new wn,ur=new D;class sl{constructor(e=new Vn,t=new Vn,n=new Vn,s=new Vn,r=new Vn,o=new Vn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=jn){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],f=s[8],g=s[9],_=s[10],m=s[11],p=s[12],x=s[13],b=s[14],M=s[15];if(n[0].setComponents(l-r,d-c,m-f,M-p).normalize(),n[1].setComponents(l+r,d+c,m+f,M+p).normalize(),n[2].setComponents(l+o,d+u,m+g,M+x).normalize(),n[3].setComponents(l-o,d-u,m-g,M-x).normalize(),n[4].setComponents(l-a,d-h,m-_,M-b).normalize(),t===jn)n[5].setComponents(l+a,d+h,m+_,M+b).normalize();else if(t===zr)n[5].setComponents(a,h,_,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gi)}intersectsSprite(e){return gi.center.set(0,0,0),gi.radius=.7071067811865476,gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(gi)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(ur.x=s.normal.x>0?e.max.x:e.min.x,ur.y=s.normal.y>0?e.max.y:e.min.y,ur.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ur)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function qh(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function af(i){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){const g=h[d],_=h[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){const _=h[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class Pn extends St{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=e/a,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){const x=p*d-o;for(let b=0;b<c;b++){const M=b*h-r;g.push(M,-x,0),_.push(0,0,1),m.push(b/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<a;x++){const b=x+c*p,M=x+c*(p+1),P=x+1+c*(p+1),A=x+1+c*p;f.push(b,M,A),f.push(M,P,A)}this.setIndex(f),this.setAttribute("position",new Ke(g,3)),this.setAttribute("normal",new Ke(_,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pn(e.width,e.height,e.widthSegments,e.heightSegments)}}var lf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,cf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,hf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,uf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,df=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ff=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,pf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,mf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,gf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,_f=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,yf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Mf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Sf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,bf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ef=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Af=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Rf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Cf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Pf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,If=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Df=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Lf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Nf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Uf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Of=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ff="gl_FragColor = linearToOutputTexel( gl_FragColor );",kf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Hf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Gf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Vf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Wf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Xf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Yf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$f=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Zf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Kf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ep=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,tp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,np=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ip=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,sp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,rp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,op=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,ap=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,cp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,hp=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,up=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,fp=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,pp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,mp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,gp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,_p=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Mp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Sp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,bp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ep=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Tp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ap=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Pp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ip=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Dp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Lp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Np=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Up=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Op=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Fp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,kp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,zp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Hp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Gp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Vp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Wp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Xp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,jp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Yp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,qp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$p=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Zp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Kp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Jp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Qp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,em=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,tm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,nm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,im=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,om=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const am=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,lm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,um=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,dm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,pm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,mm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,gm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,_m=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ym=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,xm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Mm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Sm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Em=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Tm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Am=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Cm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Im=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Dm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Nm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Bm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Om=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,km=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xe={alphahash_fragment:lf,alphahash_pars_fragment:cf,alphamap_fragment:hf,alphamap_pars_fragment:uf,alphatest_fragment:df,alphatest_pars_fragment:ff,aomap_fragment:pf,aomap_pars_fragment:mf,batching_pars_vertex:gf,batching_vertex:_f,begin_vertex:vf,beginnormal_vertex:yf,bsdfs:xf,iridescence_fragment:Mf,bumpmap_pars_fragment:Sf,clipping_planes_fragment:bf,clipping_planes_pars_fragment:Ef,clipping_planes_pars_vertex:wf,clipping_planes_vertex:Tf,color_fragment:Af,color_pars_fragment:Rf,color_pars_vertex:Cf,color_vertex:Pf,common:If,cube_uv_reflection_fragment:Df,defaultnormal_vertex:Lf,displacementmap_pars_vertex:Nf,displacementmap_vertex:Uf,emissivemap_fragment:Bf,emissivemap_pars_fragment:Of,colorspace_fragment:Ff,colorspace_pars_fragment:kf,envmap_fragment:zf,envmap_common_pars_fragment:Hf,envmap_pars_fragment:Gf,envmap_pars_vertex:Vf,envmap_physical_pars_fragment:ep,envmap_vertex:Wf,fog_vertex:Xf,fog_pars_vertex:jf,fog_fragment:Yf,fog_pars_fragment:qf,gradientmap_pars_fragment:$f,lightmap_pars_fragment:Zf,lights_lambert_fragment:Kf,lights_lambert_pars_fragment:Jf,lights_pars_begin:Qf,lights_toon_fragment:tp,lights_toon_pars_fragment:np,lights_phong_fragment:ip,lights_phong_pars_fragment:sp,lights_physical_fragment:rp,lights_physical_pars_fragment:op,lights_fragment_begin:ap,lights_fragment_maps:lp,lights_fragment_end:cp,logdepthbuf_fragment:hp,logdepthbuf_pars_fragment:up,logdepthbuf_pars_vertex:dp,logdepthbuf_vertex:fp,map_fragment:pp,map_pars_fragment:mp,map_particle_fragment:gp,map_particle_pars_fragment:_p,metalnessmap_fragment:vp,metalnessmap_pars_fragment:yp,morphinstance_vertex:xp,morphcolor_vertex:Mp,morphnormal_vertex:Sp,morphtarget_pars_vertex:bp,morphtarget_vertex:Ep,normal_fragment_begin:wp,normal_fragment_maps:Tp,normal_pars_fragment:Ap,normal_pars_vertex:Rp,normal_vertex:Cp,normalmap_pars_fragment:Pp,clearcoat_normal_fragment_begin:Ip,clearcoat_normal_fragment_maps:Dp,clearcoat_pars_fragment:Lp,iridescence_pars_fragment:Np,opaque_fragment:Up,packing:Bp,premultiplied_alpha_fragment:Op,project_vertex:Fp,dithering_fragment:kp,dithering_pars_fragment:zp,roughnessmap_fragment:Hp,roughnessmap_pars_fragment:Gp,shadowmap_pars_fragment:Vp,shadowmap_pars_vertex:Wp,shadowmap_vertex:Xp,shadowmask_pars_fragment:jp,skinbase_vertex:Yp,skinning_pars_vertex:qp,skinning_vertex:$p,skinnormal_vertex:Zp,specularmap_fragment:Kp,specularmap_pars_fragment:Jp,tonemapping_fragment:Qp,tonemapping_pars_fragment:em,transmission_fragment:tm,transmission_pars_fragment:nm,uv_pars_fragment:im,uv_pars_vertex:sm,uv_vertex:rm,worldpos_vertex:om,background_vert:am,background_frag:lm,backgroundCube_vert:cm,backgroundCube_frag:hm,cube_vert:um,cube_frag:dm,depth_vert:fm,depth_frag:pm,distanceRGBA_vert:mm,distanceRGBA_frag:gm,equirect_vert:_m,equirect_frag:vm,linedashed_vert:ym,linedashed_frag:xm,meshbasic_vert:Mm,meshbasic_frag:Sm,meshlambert_vert:bm,meshlambert_frag:Em,meshmatcap_vert:wm,meshmatcap_frag:Tm,meshnormal_vert:Am,meshnormal_frag:Rm,meshphong_vert:Cm,meshphong_frag:Pm,meshphysical_vert:Im,meshphysical_frag:Dm,meshtoon_vert:Lm,meshtoon_frag:Nm,points_vert:Um,points_frag:Bm,shadow_vert:Om,shadow_frag:Fm,sprite_vert:km,sprite_frag:zm},de={common:{diffuse:{value:new he(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new xe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new he(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new he(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new he(16777215)},opacity:{value:1},center:{value:new xe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},An={basic:{uniforms:Gt([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Gt([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new he(0)}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Gt([de.common,de.specularmap,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.fog,de.lights,{emissive:{value:new he(0)},specular:{value:new he(1118481)},shininess:{value:30}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Gt([de.common,de.envmap,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.roughnessmap,de.metalnessmap,de.fog,de.lights,{emissive:{value:new he(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Gt([de.common,de.aomap,de.lightmap,de.emissivemap,de.bumpmap,de.normalmap,de.displacementmap,de.gradientmap,de.fog,de.lights,{emissive:{value:new he(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Gt([de.common,de.bumpmap,de.normalmap,de.displacementmap,de.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Gt([de.points,de.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Gt([de.common,de.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Gt([de.common,de.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Gt([de.common,de.bumpmap,de.normalmap,de.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Gt([de.sprite,de.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distanceRGBA:{uniforms:Gt([de.common,de.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distanceRGBA_vert,fragmentShader:Xe.distanceRGBA_frag},shadow:{uniforms:Gt([de.lights,de.fog,{color:{value:new he(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};An.physical={uniforms:Gt([An.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new xe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new he(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new xe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new he(0)},specularColor:{value:new he(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new xe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};const dr={r:0,b:0,g:0},_i=new nn,Hm=new He;function Gm(i,e,t,n,s,r,o){const a=new he(0);let l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(x){let b=x.isScene===!0?x.background:null;return b&&b.isTexture&&(b=(x.backgroundBlurriness>0?t:e).get(b)),b}function _(x){let b=!1;const M=g(x);M===null?p(a,l):M&&M.isColor&&(p(M,1),b=!0);const P=i.xr.getEnvironmentBlendMode();P==="additive"?n.buffers.color.setClear(0,0,0,1,o):P==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,b){const M=g(b);M&&(M.isCubeTexture||M.mapping===Yr)?(u===void 0&&(u=new oe(new kt(1,1,1),new zt({name:"BackgroundCubeMaterial",uniforms:as(An.backgroundCube.uniforms),vertexShader:An.backgroundCube.vertexShader,fragmentShader:An.backgroundCube.fragmentShader,side:Wt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(P,A,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),_i.copy(b.backgroundRotation),_i.x*=-1,_i.y*=-1,_i.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(_i.y*=-1,_i.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Hm.makeRotationFromEuler(_i)),u.material.toneMapped=Ze.getTransfer(M.colorSpace)!==lt,(h!==M||d!==M.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=M,d=M.version,f=i.toneMapping),u.layers.enableAll(),x.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new oe(new Pn(2,2),new zt({name:"BackgroundMaterial",uniforms:as(An.background.uniforms),vertexShader:An.background.vertexShader,fragmentShader:An.background.fragmentShader,side:Zn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Ze.getTransfer(M.colorSpace)!==lt,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,f=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,b){x.getRGB(dr,Xh(i)),n.buffers.color.setClear(dr.r,dr.g,dr.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(x,b=1){a.set(x),l=b,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(a,l)},render:_,addToRenderList:m}}function Vm(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,o=!1;function a(S,w,L,N,G){let V=!1;const q=h(N,L,w);r!==q&&(r=q,c(r.object)),V=f(S,N,L,G),V&&g(S,N,L,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(V||o)&&(o=!1,M(S,w,L,N),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function l(){return i.createVertexArray()}function c(S){return i.bindVertexArray(S)}function u(S){return i.deleteVertexArray(S)}function h(S,w,L){const N=L.wireframe===!0;let G=n[S.id];G===void 0&&(G={},n[S.id]=G);let V=G[w.id];V===void 0&&(V={},G[w.id]=V);let q=V[N];return q===void 0&&(q=d(l()),V[N]=q),q}function d(S){const w=[],L=[],N=[];for(let G=0;G<t;G++)w[G]=0,L[G]=0,N[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:L,attributeDivisors:N,object:S,attributes:{},index:null}}function f(S,w,L,N){const G=r.attributes,V=w.attributes;let q=0;const K=L.getAttributes();for(const X in K)if(K[X].location>=0){const Q=G[X];let ge=V[X];if(ge===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(ge=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(ge=S.instanceColor)),Q===void 0||Q.attribute!==ge||ge&&Q.data!==ge.data)return!0;q++}return r.attributesNum!==q||r.index!==N}function g(S,w,L,N){const G={},V=w.attributes;let q=0;const K=L.getAttributes();for(const X in K)if(K[X].location>=0){let Q=V[X];Q===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(Q=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(Q=S.instanceColor));const ge={};ge.attribute=Q,Q&&Q.data&&(ge.data=Q.data),G[X]=ge,q++}r.attributes=G,r.attributesNum=q,r.index=N}function _(){const S=r.newAttributes;for(let w=0,L=S.length;w<L;w++)S[w]=0}function m(S){p(S,0)}function p(S,w){const L=r.newAttributes,N=r.enabledAttributes,G=r.attributeDivisors;L[S]=1,N[S]===0&&(i.enableVertexAttribArray(S),N[S]=1),G[S]!==w&&(i.vertexAttribDivisor(S,w),G[S]=w)}function x(){const S=r.newAttributes,w=r.enabledAttributes;for(let L=0,N=w.length;L<N;L++)w[L]!==S[L]&&(i.disableVertexAttribArray(L),w[L]=0)}function b(S,w,L,N,G,V,q){q===!0?i.vertexAttribIPointer(S,w,L,G,V):i.vertexAttribPointer(S,w,L,N,G,V)}function M(S,w,L,N){_();const G=N.attributes,V=L.getAttributes(),q=w.defaultAttributeValues;for(const K in V){const X=V[K];if(X.location>=0){let te=G[K];if(te===void 0&&(K==="instanceMatrix"&&S.instanceMatrix&&(te=S.instanceMatrix),K==="instanceColor"&&S.instanceColor&&(te=S.instanceColor)),te!==void 0){const Q=te.normalized,ge=te.itemSize,we=e.get(te);if(we===void 0)continue;const Oe=we.buffer,Z=we.type,ee=we.bytesPerElement,_e=Z===i.INT||Z===i.UNSIGNED_INT||te.gpuType===qa;if(te.isInterleavedBufferAttribute){const ae=te.data,Me=ae.stride,Ie=te.offset;if(ae.isInstancedInterleavedBuffer){for(let Te=0;Te<X.locationSize;Te++)p(X.location+Te,ae.meshPerAttribute);S.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let Te=0;Te<X.locationSize;Te++)m(X.location+Te);i.bindBuffer(i.ARRAY_BUFFER,Oe);for(let Te=0;Te<X.locationSize;Te++)b(X.location+Te,ge/X.locationSize,Z,Q,Me*ee,(Ie+ge/X.locationSize*Te)*ee,_e)}else{if(te.isInstancedBufferAttribute){for(let ae=0;ae<X.locationSize;ae++)p(X.location+ae,te.meshPerAttribute);S.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let ae=0;ae<X.locationSize;ae++)m(X.location+ae);i.bindBuffer(i.ARRAY_BUFFER,Oe);for(let ae=0;ae<X.locationSize;ae++)b(X.location+ae,ge/X.locationSize,Z,Q,ge*ee,ge/X.locationSize*ae*ee,_e)}}else if(q!==void 0){const Q=q[K];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(X.location,Q);break;case 3:i.vertexAttrib3fv(X.location,Q);break;case 4:i.vertexAttrib4fv(X.location,Q);break;default:i.vertexAttrib1fv(X.location,Q)}}}}x()}function P(){R();for(const S in n){const w=n[S];for(const L in w){const N=w[L];for(const G in N)u(N[G].object),delete N[G];delete w[L]}delete n[S]}}function A(S){if(n[S.id]===void 0)return;const w=n[S.id];for(const L in w){const N=w[L];for(const G in N)u(N[G].object),delete N[G];delete w[L]}delete n[S.id]}function C(S){for(const w in n){const L=n[w];if(L[S.id]===void 0)continue;const N=L[S.id];for(const G in N)u(N[G].object),delete N[G];delete L[S.id]}}function R(){E(),o=!0,r!==s&&(r=s,c(r.object))}function E(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:R,resetDefaultState:E,dispose:P,releaseStatesOfGeometry:A,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function Wm(i,e,t){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),t.update(u,n,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];t.update(f,n,1)}function l(c,u,h,d){if(h===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*d[_];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Xm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==hn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){const R=C===qn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Mn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==vn&&!R)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:b,maxFragmentUniforms:M,vertexTextures:P,maxSamples:A}}function jm(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Vn,a=new We,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const x=r?0:n,b=x*4;let M=p.clippingState||null;l.value=M,M=u(g,d,b,f);for(let P=0;P!==b;++P)M[P]=t[P];p.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=f+_*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,M=f;b!==_;++b,M+=4)o.copy(h[b]).applyMatrix4(x,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Ym(i){let e=new WeakMap;function t(o,a){return a===oa?o.mapping=ns:a===aa&&(o.mapping=is),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===oa||a===aa)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new sf(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class Zr extends jh{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Yi=4,rc=[.125,.215,.35,.446,.526,.582],Si=20,Eo=new Zr,oc=new he;let wo=null,To=0,Ao=0,Ro=!1;const xi=(1+Math.sqrt(5))/2,Vi=1/xi,ac=[new D(-xi,Vi,0),new D(xi,Vi,0),new D(-Vi,0,xi),new D(Vi,0,xi),new D(0,xi,-Vi),new D(0,xi,Vi),new D(-1,1,-1),new D(1,1,-1),new D(-1,1,1),new D(1,1,1)];class Ba{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){wo=this._renderer.getRenderTarget(),To=this._renderer.getActiveCubeFace(),Ao=this._renderer.getActiveMipmapLevel(),Ro=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=hc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=cc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(wo,To,Ao),this._renderer.xr.enabled=Ro,e.scissorTest=!1,fr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ns||e.mapping===is?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),wo=this._renderer.getRenderTarget(),To=this._renderer.getActiveCubeFace(),Ao=this._renderer.getActiveMipmapLevel(),Ro=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Qt,minFilter:Qt,generateMipmaps:!1,type:qn,format:hn,colorSpace:jt,depthBuffer:!1},s=lc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=lc(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=qm(r)),this._blurMaterial=$m(r,e,t)}return s}_compileMaterial(e){const t=new oe(this._lodPlanes[0],e);this._renderer.compile(t,Eo)}_sceneToCubeUV(e,t,n,s){const a=new Ft(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(oc),u.toneMapping=li,u.autoClear=!1;const f=new xt({name:"PMREM.Background",side:Wt,depthWrite:!1,depthTest:!1}),g=new oe(new kt,f);let _=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(oc),_=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):x===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const b=this._cubeSize;fr(s,x*b,p>2?b:0,b,b),u.setRenderTarget(s),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===ns||e.mapping===is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=hc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=cc());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new oe(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;fr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Eo)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=ac[(s-r-1)%ac.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new oe(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Si-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):Si;m>Si&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Si}`);const p=[];let x=0;for(let C=0;C<Si;++C){const R=C/_,E=Math.exp(-R*R/2);p.push(E),C===0?x+=E:C<m&&(x+=2*E)}for(let C=0;C<p.length;C++)p[C]=p[C]/x;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:b}=this;d.dTheta.value=g,d.mipInt.value=b-n;const M=this._sizeLods[s],P=3*M*(s>b-Yi?s-b+Yi:0),A=4*(this._cubeSize-M);fr(t,P,A,3*M,2*M),l.setRenderTarget(t),l.render(h,Eo)}}function qm(i){const e=[],t=[],n=[];let s=i;const r=i-Yi+1+rc.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Yi?l=rc[o-i+Yi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,x=new Float32Array(_*g*f),b=new Float32Array(m*g*f),M=new Float32Array(p*g*f);for(let A=0;A<f;A++){const C=A%3*2/3-1,R=A>2?0:-1,E=[C,R,0,C+2/3,R,0,C+2/3,R+1,0,C,R,0,C+2/3,R+1,0,C,R+1,0];x.set(E,_*g*A),b.set(d,m*g*A);const S=[A,A,A,A,A,A];M.set(S,p*g*A)}const P=new St;P.setAttribute("position",new pt(x,_)),P.setAttribute("uv",new pt(b,m)),P.setAttribute("faceIndex",new pt(M,p)),e.push(P),s>Yi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function lc(i,e,t){const n=new en(i,e,t);return n.texture.mapping=Yr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function fr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function $m(i,e,t){const n=new Float32Array(Si),s=new D(0,1,0);return new zt({name:"SphericalGaussianBlur",defines:{n:Si,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:rl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function cc(){return new zt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:rl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function hc(){return new zt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:rl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function rl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Zm(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===oa||l===aa,u=l===ns||l===is;if(c||u){let h=e.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new Ba(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&s(f)?(t===null&&(t=new Ba(i)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Km(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Ds("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Jm(i,e,t,n){const s={},r=new WeakMap;function o(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)e.remove(_[m])}d.removeEventListener("dispose",o),delete s[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)e.update(d[g],i.ARRAY_BUFFER);const f=h.morphAttributes;for(const g in f){const _=f[g];for(let m=0,p=_.length;m<p;m++)e.update(_[m],i.ARRAY_BUFFER)}}function c(h){const d=[],f=h.index,g=h.attributes.position;let _=0;if(f!==null){const x=f.array;_=f.version;for(let b=0,M=x.length;b<M;b+=3){const P=x[b+0],A=x[b+1],C=x[b+2];d.push(P,A,A,C,C,P)}}else if(g!==void 0){const x=g.array;_=g.version;for(let b=0,M=x.length/3-1;b<M;b+=3){const P=b+0,A=b+1,C=b+2;d.push(P,A,A,C,C,P)}}else return;const m=new(zh(d)?Wh:Vh)(d,1);m.version=_;const p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Qm(i,e,t){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*o),t.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function u(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function h(d,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let p=0;for(let x=0;x<g;x++)p+=f[x]*_[x];t.update(p,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function eg(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function tg(i,e,t){const n=new WeakMap,s=new et;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let S=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",S)};var f=S;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],x=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let M=0;g===!0&&(M=1),_===!0&&(M=2),m===!0&&(M=3);let P=a.attributes.position.count*M,A=1;P>e.maxTextureSize&&(A=Math.ceil(P/e.maxTextureSize),P=e.maxTextureSize);const C=new Float32Array(P*A*4*h),R=new Hh(C,P,A,h);R.type=vn,R.needsUpdate=!0;const E=M*4;for(let w=0;w<h;w++){const L=p[w],N=x[w],G=b[w],V=P*A*4*w;for(let q=0;q<L.count;q++){const K=q*E;g===!0&&(s.fromBufferAttribute(L,q),C[V+K+0]=s.x,C[V+K+1]=s.y,C[V+K+2]=s.z,C[V+K+3]=0),_===!0&&(s.fromBufferAttribute(N,q),C[V+K+4]=s.x,C[V+K+5]=s.y,C[V+K+6]=s.z,C[V+K+7]=0),m===!0&&(s.fromBufferAttribute(G,q),C[V+K+8]=s.x,C[V+K+9]=s.y,C[V+K+10]=s.z,C[V+K+11]=G.itemSize===4?s.w:1)}}d={count:h,texture:R,size:new xe(P,A)},n.set(a,d),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function ng(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class $h extends Rt{constructor(e,t,n,s,r,o,a,l,c,u=Zi){if(u!==Zi&&u!==rs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Zi&&(n=wi),n===void 0&&u===rs&&(n=ss),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Xt,this.minFilter=l!==void 0?l:Xt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Zh=new Rt,uc=new $h(1,1),Kh=new Hh,Jh=new Gd,Qh=new Yh,dc=[],fc=[],pc=new Float32Array(16),mc=new Float32Array(9),gc=new Float32Array(4);function gs(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=dc[s];if(r===void 0&&(r=new Float32Array(s),dc[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Ct(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Pt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Kr(i,e){let t=fc[e];t===void 0&&(t=new Int32Array(e),fc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ig(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function sg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;i.uniform2fv(this.addr,e),Pt(t,e)}}function rg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ct(t,e))return;i.uniform3fv(this.addr,e),Pt(t,e)}}function og(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;i.uniform4fv(this.addr,e),Pt(t,e)}}function ag(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;gc.set(n),i.uniformMatrix2fv(this.addr,!1,gc),Pt(t,n)}}function lg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;mc.set(n),i.uniformMatrix3fv(this.addr,!1,mc),Pt(t,n)}}function cg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;pc.set(n),i.uniformMatrix4fv(this.addr,!1,pc),Pt(t,n)}}function hg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ug(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;i.uniform2iv(this.addr,e),Pt(t,e)}}function dg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ct(t,e))return;i.uniform3iv(this.addr,e),Pt(t,e)}}function fg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;i.uniform4iv(this.addr,e),Pt(t,e)}}function pg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function mg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;i.uniform2uiv(this.addr,e),Pt(t,e)}}function gg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ct(t,e))return;i.uniform3uiv(this.addr,e),Pt(t,e)}}function _g(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;i.uniform4uiv(this.addr,e),Pt(t,e)}}function vg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(uc.compareFunction=kh,r=uc):r=Zh,t.setTexture2D(e||r,s)}function yg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Jh,s)}function xg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Qh,s)}function Mg(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Kh,s)}function Sg(i){switch(i){case 5126:return ig;case 35664:return sg;case 35665:return rg;case 35666:return og;case 35674:return ag;case 35675:return lg;case 35676:return cg;case 5124:case 35670:return hg;case 35667:case 35671:return ug;case 35668:case 35672:return dg;case 35669:case 35673:return fg;case 5125:return pg;case 36294:return mg;case 36295:return gg;case 36296:return _g;case 35678:case 36198:case 36298:case 36306:case 35682:return vg;case 35679:case 36299:case 36307:return yg;case 35680:case 36300:case 36308:case 36293:return xg;case 36289:case 36303:case 36311:case 36292:return Mg}}function bg(i,e){i.uniform1fv(this.addr,e)}function Eg(i,e){const t=gs(e,this.size,2);i.uniform2fv(this.addr,t)}function wg(i,e){const t=gs(e,this.size,3);i.uniform3fv(this.addr,t)}function Tg(i,e){const t=gs(e,this.size,4);i.uniform4fv(this.addr,t)}function Ag(i,e){const t=gs(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Rg(i,e){const t=gs(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Cg(i,e){const t=gs(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Pg(i,e){i.uniform1iv(this.addr,e)}function Ig(i,e){i.uniform2iv(this.addr,e)}function Dg(i,e){i.uniform3iv(this.addr,e)}function Lg(i,e){i.uniform4iv(this.addr,e)}function Ng(i,e){i.uniform1uiv(this.addr,e)}function Ug(i,e){i.uniform2uiv(this.addr,e)}function Bg(i,e){i.uniform3uiv(this.addr,e)}function Og(i,e){i.uniform4uiv(this.addr,e)}function Fg(i,e,t){const n=this.cache,s=e.length,r=Kr(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Zh,r[o])}function kg(i,e,t){const n=this.cache,s=e.length,r=Kr(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Jh,r[o])}function zg(i,e,t){const n=this.cache,s=e.length,r=Kr(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Qh,r[o])}function Hg(i,e,t){const n=this.cache,s=e.length,r=Kr(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Kh,r[o])}function Gg(i){switch(i){case 5126:return bg;case 35664:return Eg;case 35665:return wg;case 35666:return Tg;case 35674:return Ag;case 35675:return Rg;case 35676:return Cg;case 5124:case 35670:return Pg;case 35667:case 35671:return Ig;case 35668:case 35672:return Dg;case 35669:case 35673:return Lg;case 5125:return Ng;case 36294:return Ug;case 36295:return Bg;case 36296:return Og;case 35678:case 36198:case 36298:case 36306:case 35682:return Fg;case 35679:case 36299:case 36307:return kg;case 35680:case 36300:case 36308:case 36293:return zg;case 36289:case 36303:case 36311:case 36292:return Hg}}class Vg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Sg(t.type)}}class Wg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Gg(t.type)}}class Xg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const Co=/(\w+)(\])?(\[|\.)?/g;function _c(i,e){i.seq.push(e),i.map[e.id]=e}function jg(i,e,t){const n=i.name,s=n.length;for(Co.lastIndex=0;;){const r=Co.exec(n),o=Co.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){_c(t,c===void 0?new Vg(a,i,e):new Wg(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Xg(a),_c(t,h)),t=h}}}class Nr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);jg(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function vc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Yg=37297;let qg=0;function $g(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const yc=new We;function Zg(i){Ze._getMatrix(yc,Ze.workingColorSpace,i);const e=`mat3( ${yc.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(i)){case $r:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function xc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+$g(i.getShaderSource(e),o)}else return s}function Kg(i,e){const t=Zg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Jg(i,e){let t;switch(e){case Sh:t="Linear";break;case bh:t="Reinhard";break;case Eh:t="Cineon";break;case Ya:t="ACESFilmic";break;case wh:t="AgX";break;case Th:t="Neutral";break;case sd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const pr=new D;function Qg(){Ze.getLuminanceCoefficients(pr);const i=pr.x.toFixed(4),e=pr.y.toFixed(4),t=pr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function e0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ls).join(`
`)}function t0(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function n0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Ls(i){return i!==""}function Mc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Sc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const i0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Oa(i){return i.replace(i0,r0)}const s0=new Map;function r0(i,e){let t=Xe[e];if(t===void 0){const n=s0.get(e);if(n!==void 0)t=Xe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Oa(t)}const o0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bc(i){return i.replace(o0,a0)}function a0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ec(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function l0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===xh?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Mh?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Hn&&(e="SHADOWMAP_TYPE_VSM"),e}function c0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ns:case is:e="ENVMAP_TYPE_CUBE";break;case Yr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function h0(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case is:e="ENVMAP_MODE_REFRACTION";break}return e}function u0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case ja:e="ENVMAP_BLENDING_MULTIPLY";break;case nd:e="ENVMAP_BLENDING_MIX";break;case id:e="ENVMAP_BLENDING_ADD";break}return e}function d0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function f0(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=l0(t),c=c0(t),u=h0(t),h=u0(t),d=d0(t),f=e0(t),g=t0(r),_=s.createProgram();let m,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ls).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ls).join(`
`),p.length>0&&(p+=`
`)):(m=[Ec(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ls).join(`
`),p=[Ec(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==li?"#define TONE_MAPPING":"",t.toneMapping!==li?Xe.tonemapping_pars_fragment:"",t.toneMapping!==li?Jg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,Kg("linearToOutputTexel",t.outputColorSpace),Qg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ls).join(`
`)),o=Oa(o),o=Mc(o,t),o=Sc(o,t),a=Oa(a),a=Mc(a,t),a=Sc(a,t),o=bc(o),a=bc(a),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Ol?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ol?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const b=x+m+o,M=x+p+a,P=vc(s,s.VERTEX_SHADER,b),A=vc(s,s.FRAGMENT_SHADER,M);s.attachShader(_,P),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function C(w){if(i.debug.checkShaderErrors){const L=s.getProgramInfoLog(_).trim(),N=s.getShaderInfoLog(P).trim(),G=s.getShaderInfoLog(A).trim();let V=!0,q=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,P,A);else{const K=xc(s,P,"vertex"),X=xc(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+L+`
`+K+`
`+X)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(N===""||G==="")&&(q=!1);q&&(w.diagnostics={runnable:V,programLog:L,vertexShader:{log:N,prefix:m},fragmentShader:{log:G,prefix:p}})}s.deleteShader(P),s.deleteShader(A),R=new Nr(s,_),E=n0(s,_)}let R;this.getUniforms=function(){return R===void 0&&C(this),R};let E;this.getAttributes=function(){return E===void 0&&C(this),E};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(_,Yg)),S},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=qg++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=P,this.fragmentShader=A,this}let p0=0;class m0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new g0(e),t.set(e,n)),n}}class g0{constructor(e){this.id=p0++,this.code=e,this.usedTimes=0}}function _0(i,e,t,n,s,r,o){const a=new il,l=new m0,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(E){return c.add(E),E===0?"uv":`uv${E}`}function m(E,S,w,L,N){const G=L.fog,V=N.geometry,q=E.isMeshStandardMaterial?L.environment:null,K=(E.isMeshStandardMaterial?t:e).get(E.envMap||q),X=K&&K.mapping===Yr?K.image.height:null,te=g[E.type];E.precision!==null&&(f=s.getMaxPrecision(E.precision),f!==E.precision&&console.warn("THREE.WebGLProgram.getParameters:",E.precision,"not supported, using",f,"instead."));const Q=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,ge=Q!==void 0?Q.length:0;let we=0;V.morphAttributes.position!==void 0&&(we=1),V.morphAttributes.normal!==void 0&&(we=2),V.morphAttributes.color!==void 0&&(we=3);let Oe,Z,ee,_e;if(te){const at=An[te];Oe=at.vertexShader,Z=at.fragmentShader}else Oe=E.vertexShader,Z=E.fragmentShader,l.update(E),ee=l.getVertexShaderID(E),_e=l.getFragmentShaderID(E);const ae=i.getRenderTarget(),Me=i.state.buffers.depth.getReversed(),Ie=N.isInstancedMesh===!0,Te=N.isBatchedMesh===!0,tt=!!E.map,De=!!E.matcap,st=!!K,B=!!E.aoMap,Tt=!!E.lightMap,je=!!E.bumpMap,Ye=!!E.normalMap,Ce=!!E.displacementMap,rt=!!E.emissiveMap,Pe=!!E.metalnessMap,v=!!E.roughnessMap,y=E.anisotropy>0,I=E.clearcoat>0,H=E.dispersion>0,z=E.iridescence>0,W=E.sheen>0,le=E.transmission>0,ne=y&&!!E.anisotropyMap,ce=I&&!!E.clearcoatMap,Ne=I&&!!E.clearcoatNormalMap,ie=I&&!!E.clearcoatRoughnessMap,ve=z&&!!E.iridescenceMap,Re=z&&!!E.iridescenceThicknessMap,Le=W&&!!E.sheenColorMap,ye=W&&!!E.sheenRoughnessMap,qe=!!E.specularMap,ze=!!E.specularColorMap,ot=!!E.specularIntensityMap,U=le&&!!E.transmissionMap,ue=le&&!!E.thicknessMap,$=!!E.gradientMap,J=!!E.alphaMap,pe=E.alphaTest>0,fe=!!E.alphaHash,Ue=!!E.extensions;let Mt=li;E.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(Mt=i.toneMapping);const Nt={shaderID:te,shaderType:E.type,shaderName:E.name,vertexShader:Oe,fragmentShader:Z,defines:E.defines,customVertexShaderID:ee,customFragmentShaderID:_e,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:f,batching:Te,batchingColor:Te&&N._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&N.instanceColor!==null,instancingMorph:Ie&&N.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ae===null?i.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:jt,alphaToCoverage:!!E.alphaToCoverage,map:tt,matcap:De,envMap:st,envMapMode:st&&K.mapping,envMapCubeUVHeight:X,aoMap:B,lightMap:Tt,bumpMap:je,normalMap:Ye,displacementMap:d&&Ce,emissiveMap:rt,normalMapObjectSpace:Ye&&E.normalMapType===hd,normalMapTangentSpace:Ye&&E.normalMapType===el,metalnessMap:Pe,roughnessMap:v,anisotropy:y,anisotropyMap:ne,clearcoat:I,clearcoatMap:ce,clearcoatNormalMap:Ne,clearcoatRoughnessMap:ie,dispersion:H,iridescence:z,iridescenceMap:ve,iridescenceThicknessMap:Re,sheen:W,sheenColorMap:Le,sheenRoughnessMap:ye,specularMap:qe,specularColorMap:ze,specularIntensityMap:ot,transmission:le,transmissionMap:U,thicknessMap:ue,gradientMap:$,opaque:E.transparent===!1&&E.blending===$i&&E.alphaToCoverage===!1,alphaMap:J,alphaTest:pe,alphaHash:fe,combine:E.combine,mapUv:tt&&_(E.map.channel),aoMapUv:B&&_(E.aoMap.channel),lightMapUv:Tt&&_(E.lightMap.channel),bumpMapUv:je&&_(E.bumpMap.channel),normalMapUv:Ye&&_(E.normalMap.channel),displacementMapUv:Ce&&_(E.displacementMap.channel),emissiveMapUv:rt&&_(E.emissiveMap.channel),metalnessMapUv:Pe&&_(E.metalnessMap.channel),roughnessMapUv:v&&_(E.roughnessMap.channel),anisotropyMapUv:ne&&_(E.anisotropyMap.channel),clearcoatMapUv:ce&&_(E.clearcoatMap.channel),clearcoatNormalMapUv:Ne&&_(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ie&&_(E.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&_(E.iridescenceMap.channel),iridescenceThicknessMapUv:Re&&_(E.iridescenceThicknessMap.channel),sheenColorMapUv:Le&&_(E.sheenColorMap.channel),sheenRoughnessMapUv:ye&&_(E.sheenRoughnessMap.channel),specularMapUv:qe&&_(E.specularMap.channel),specularColorMapUv:ze&&_(E.specularColorMap.channel),specularIntensityMapUv:ot&&_(E.specularIntensityMap.channel),transmissionMapUv:U&&_(E.transmissionMap.channel),thicknessMapUv:ue&&_(E.thicknessMap.channel),alphaMapUv:J&&_(E.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Ye||y),vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!V.attributes.uv&&(tt||J),fog:!!G,useFog:E.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:E.flatShading===!0,sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Me,skinning:N.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:we,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:E.dithering,shadowMapEnabled:i.shadowMap.enabled&&w.length>0,shadowMapType:i.shadowMap.type,toneMapping:Mt,decodeVideoTexture:tt&&E.map.isVideoTexture===!0&&Ze.getTransfer(E.map.colorSpace)===lt,decodeVideoTextureEmissive:rt&&E.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(E.emissiveMap.colorSpace)===lt,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===ut,flipSided:E.side===Wt,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:Ue&&E.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ue&&E.extensions.multiDraw===!0||Te)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return Nt.vertexUv1s=c.has(1),Nt.vertexUv2s=c.has(2),Nt.vertexUv3s=c.has(3),c.clear(),Nt}function p(E){const S=[];if(E.shaderID?S.push(E.shaderID):(S.push(E.customVertexShaderID),S.push(E.customFragmentShaderID)),E.defines!==void 0)for(const w in E.defines)S.push(w),S.push(E.defines[w]);return E.isRawShaderMaterial===!1&&(x(S,E),b(S,E),S.push(i.outputColorSpace)),S.push(E.customProgramCacheKey),S.join()}function x(E,S){E.push(S.precision),E.push(S.outputColorSpace),E.push(S.envMapMode),E.push(S.envMapCubeUVHeight),E.push(S.mapUv),E.push(S.alphaMapUv),E.push(S.lightMapUv),E.push(S.aoMapUv),E.push(S.bumpMapUv),E.push(S.normalMapUv),E.push(S.displacementMapUv),E.push(S.emissiveMapUv),E.push(S.metalnessMapUv),E.push(S.roughnessMapUv),E.push(S.anisotropyMapUv),E.push(S.clearcoatMapUv),E.push(S.clearcoatNormalMapUv),E.push(S.clearcoatRoughnessMapUv),E.push(S.iridescenceMapUv),E.push(S.iridescenceThicknessMapUv),E.push(S.sheenColorMapUv),E.push(S.sheenRoughnessMapUv),E.push(S.specularMapUv),E.push(S.specularColorMapUv),E.push(S.specularIntensityMapUv),E.push(S.transmissionMapUv),E.push(S.thicknessMapUv),E.push(S.combine),E.push(S.fogExp2),E.push(S.sizeAttenuation),E.push(S.morphTargetsCount),E.push(S.morphAttributeCount),E.push(S.numDirLights),E.push(S.numPointLights),E.push(S.numSpotLights),E.push(S.numSpotLightMaps),E.push(S.numHemiLights),E.push(S.numRectAreaLights),E.push(S.numDirLightShadows),E.push(S.numPointLightShadows),E.push(S.numSpotLightShadows),E.push(S.numSpotLightShadowsWithMaps),E.push(S.numLightProbes),E.push(S.shadowMapType),E.push(S.toneMapping),E.push(S.numClippingPlanes),E.push(S.numClipIntersection),E.push(S.depthPacking)}function b(E,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),E.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),E.push(a.mask)}function M(E){const S=g[E.type];let w;if(S){const L=An[S];w=Ws.clone(L.uniforms)}else w=E.uniforms;return w}function P(E,S){let w;for(let L=0,N=u.length;L<N;L++){const G=u[L];if(G.cacheKey===S){w=G,++w.usedTimes;break}}return w===void 0&&(w=new f0(i,S,E,r),u.push(w)),w}function A(E){if(--E.usedTimes===0){const S=u.indexOf(E);u[S]=u[u.length-1],u.pop(),E.destroy()}}function C(E){l.remove(E)}function R(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:P,releaseProgram:A,releaseShaderCache:C,programs:u,dispose:R}}function v0(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function y0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function wc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Tc(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,d,f,g,_,m){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,d,f,g,_,m){const p=o(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(h,d,f,g,_,m){const p=o(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||y0),n.length>1&&n.sort(d||wc),s.length>1&&s.sort(d||wc)}function u(){for(let h=e,d=i.length;h<d;h++){const f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function x0(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new Tc,i.set(n,[o])):s>=r.length?(o=new Tc,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function M0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new he};break;case"SpotLight":t={position:new D,direction:new D,color:new he,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new he,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new he,groundColor:new he};break;case"RectAreaLight":t={color:new he,position:new D,halfWidth:new D,halfHeight:new D};break}return i[e.id]=t,t}}}function S0(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let b0=0;function E0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function w0(i){const e=new M0,t=S0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);const s=new D,r=new He,o=new He;function a(c){let u=0,h=0,d=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,x=0,b=0,M=0,P=0,A=0,C=0;c.sort(E0);for(let E=0,S=c.length;E<S;E++){const w=c[E],L=w.color,N=w.intensity,G=w.distance,V=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)u+=L.r*N,h+=L.g*N,d+=L.b*N;else if(w.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(w.sh.coefficients[q],N);C++}else if(w.isDirectionalLight){const q=e.get(w);if(q.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const K=w.shadow,X=t.get(w);X.shadowIntensity=K.intensity,X.shadowBias=K.bias,X.shadowNormalBias=K.normalBias,X.shadowRadius=K.radius,X.shadowMapSize=K.mapSize,n.directionalShadow[f]=X,n.directionalShadowMap[f]=V,n.directionalShadowMatrix[f]=w.shadow.matrix,x++}n.directional[f]=q,f++}else if(w.isSpotLight){const q=e.get(w);q.position.setFromMatrixPosition(w.matrixWorld),q.color.copy(L).multiplyScalar(N),q.distance=G,q.coneCos=Math.cos(w.angle),q.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),q.decay=w.decay,n.spot[_]=q;const K=w.shadow;if(w.map&&(n.spotLightMap[P]=w.map,P++,K.updateMatrices(w),w.castShadow&&A++),n.spotLightMatrix[_]=K.matrix,w.castShadow){const X=t.get(w);X.shadowIntensity=K.intensity,X.shadowBias=K.bias,X.shadowNormalBias=K.normalBias,X.shadowRadius=K.radius,X.shadowMapSize=K.mapSize,n.spotShadow[_]=X,n.spotShadowMap[_]=V,M++}_++}else if(w.isRectAreaLight){const q=e.get(w);q.color.copy(L).multiplyScalar(N),q.halfWidth.set(w.width*.5,0,0),q.halfHeight.set(0,w.height*.5,0),n.rectArea[m]=q,m++}else if(w.isPointLight){const q=e.get(w);if(q.color.copy(w.color).multiplyScalar(w.intensity),q.distance=w.distance,q.decay=w.decay,w.castShadow){const K=w.shadow,X=t.get(w);X.shadowIntensity=K.intensity,X.shadowBias=K.bias,X.shadowNormalBias=K.normalBias,X.shadowRadius=K.radius,X.shadowMapSize=K.mapSize,X.shadowCameraNear=K.camera.near,X.shadowCameraFar=K.camera.far,n.pointShadow[g]=X,n.pointShadowMap[g]=V,n.pointShadowMatrix[g]=w.shadow.matrix,b++}n.point[g]=q,g++}else if(w.isHemisphereLight){const q=e.get(w);q.skyColor.copy(w.color).multiplyScalar(N),q.groundColor.copy(w.groundColor).multiplyScalar(N),n.hemi[p]=q,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=de.LTC_FLOAT_1,n.rectAreaLTC2=de.LTC_FLOAT_2):(n.rectAreaLTC1=de.LTC_HALF_1,n.rectAreaLTC2=de.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const R=n.hash;(R.directionalLength!==f||R.pointLength!==g||R.spotLength!==_||R.rectAreaLength!==m||R.hemiLength!==p||R.numDirectionalShadows!==x||R.numPointShadows!==b||R.numSpotShadows!==M||R.numSpotMaps!==P||R.numLightProbes!==C)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=M+P-A,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=C,R.directionalLength=f,R.pointLength=g,R.spotLength=_,R.rectAreaLength=m,R.hemiLength=p,R.numDirectionalShadows=x,R.numPointShadows=b,R.numSpotShadows=M,R.numSpotMaps=P,R.numLightProbes=C,n.version=b0++)}function l(c,u){let h=0,d=0,f=0,g=0,_=0;const m=u.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const b=c[p];if(b.isDirectionalLight){const M=n.directional[h];M.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),h++}else if(b.isSpotLight){const M=n.spot[f];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),M.halfWidth.set(b.width*.5,0,0),M.halfHeight.set(0,b.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const M=n.point[d];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){const M=n.hemi[_];M.direction.setFromMatrixPosition(b.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function Ac(i){const e=new w0(i),t=[],n=[];function s(u){c.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function T0(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new Ac(i),e.set(s,[a])):r>=o.length?(a=new Ac(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class A0 extends tn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=ld,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class R0 extends tn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const C0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,P0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function I0(i,e,t){let n=new sl;const s=new xe,r=new xe,o=new et,a=new A0({depthPacking:cd}),l=new R0,c={},u=t.maxTextureSize,h={[Zn]:Wt,[Wt]:Zn,[ut]:ut},d=new zt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new xe},radius:{value:4}},vertexShader:C0,fragmentShader:P0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new St;g.setAttribute("position",new pt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new oe(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=xh;let p=this.type;this.render=function(A,C,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const E=i.getRenderTarget(),S=i.getActiveCubeFace(),w=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Cn),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const N=p!==Hn&&this.type===Hn,G=p===Hn&&this.type!==Hn;for(let V=0,q=A.length;V<q;V++){const K=A[V],X=K.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const te=X.getFrameExtents();if(s.multiply(te),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/te.x),s.x=r.x*te.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/te.y),s.y=r.y*te.y,X.mapSize.y=r.y)),X.map===null||N===!0||G===!0){const ge=this.type!==Hn?{minFilter:Xt,magFilter:Xt}:{};X.map!==null&&X.map.dispose(),X.map=new en(s.x,s.y,ge),X.map.texture.name=K.name+".shadowMap",X.camera.updateProjectionMatrix()}i.setRenderTarget(X.map),i.clear();const Q=X.getViewportCount();for(let ge=0;ge<Q;ge++){const we=X.getViewport(ge);o.set(r.x*we.x,r.y*we.y,r.x*we.z,r.y*we.w),L.viewport(o),X.updateMatrices(K,ge),n=X.getFrustum(),M(C,R,X.camera,K,this.type)}X.isPointLightShadow!==!0&&this.type===Hn&&x(X,R),X.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(E,S,w)};function x(A,C){const R=e.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new en(s.x,s.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(C,null,R,d,_,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(C,null,R,f,_,null)}function b(A,C,R,E){let S=null;const w=R.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(w!==void 0)S=w;else if(S=R.isPointLight===!0?l:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){const L=S.uuid,N=C.uuid;let G=c[L];G===void 0&&(G={},c[L]=G);let V=G[N];V===void 0&&(V=S.clone(),G[N]=V,C.addEventListener("dispose",P)),S=V}if(S.visible=C.visible,S.wireframe=C.wireframe,E===Hn?S.side=C.shadowSide!==null?C.shadowSide:C.side:S.side=C.shadowSide!==null?C.shadowSide:h[C.side],S.alphaMap=C.alphaMap,S.alphaTest=C.alphaTest,S.map=C.map,S.clipShadows=C.clipShadows,S.clippingPlanes=C.clippingPlanes,S.clipIntersection=C.clipIntersection,S.displacementMap=C.displacementMap,S.displacementScale=C.displacementScale,S.displacementBias=C.displacementBias,S.wireframeLinewidth=C.wireframeLinewidth,S.linewidth=C.linewidth,R.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const L=i.properties.get(S);L.light=R}return S}function M(A,C,R,E,S){if(A.visible===!1)return;if(A.layers.test(C.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&S===Hn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,A.matrixWorld);const N=e.update(A),G=A.material;if(Array.isArray(G)){const V=N.groups;for(let q=0,K=V.length;q<K;q++){const X=V[q],te=G[X.materialIndex];if(te&&te.visible){const Q=b(A,te,E,S);A.onBeforeShadow(i,A,C,R,N,Q,X),i.renderBufferDirect(R,null,N,Q,A,X),A.onAfterShadow(i,A,C,R,N,Q,X)}}}else if(G.visible){const V=b(A,G,E,S);A.onBeforeShadow(i,A,C,R,N,V,null),i.renderBufferDirect(R,null,N,V,A,null),A.onAfterShadow(i,A,C,R,N,V,null)}}const L=A.children;for(let N=0,G=L.length;N<G;N++)M(L[N],C,R,E,S)}function P(A){A.target.removeEventListener("dispose",P);for(const R in c){const E=c[R],S=A.target.uuid;S in E&&(E[S].dispose(),delete E[S])}}}const D0={[Qo]:ea,[ta]:sa,[na]:ra,[ts]:ia,[ea]:Qo,[sa]:ta,[ra]:na,[ia]:ts};function L0(i,e){function t(){let U=!1;const ue=new et;let $=null;const J=new et(0,0,0,0);return{setMask:function(pe){$!==pe&&!U&&(i.colorMask(pe,pe,pe,pe),$=pe)},setLocked:function(pe){U=pe},setClear:function(pe,fe,Ue,Mt,Nt){Nt===!0&&(pe*=Mt,fe*=Mt,Ue*=Mt),ue.set(pe,fe,Ue,Mt),J.equals(ue)===!1&&(i.clearColor(pe,fe,Ue,Mt),J.copy(ue))},reset:function(){U=!1,$=null,J.set(-1,0,0,0)}}}function n(){let U=!1,ue=!1,$=null,J=null,pe=null;return{setReversed:function(fe){if(ue!==fe){const Ue=e.get("EXT_clip_control");ue?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT);const Mt=pe;pe=null,this.setClear(Mt)}ue=fe},getReversed:function(){return ue},setTest:function(fe){fe?ae(i.DEPTH_TEST):Me(i.DEPTH_TEST)},setMask:function(fe){$!==fe&&!U&&(i.depthMask(fe),$=fe)},setFunc:function(fe){if(ue&&(fe=D0[fe]),J!==fe){switch(fe){case Qo:i.depthFunc(i.NEVER);break;case ea:i.depthFunc(i.ALWAYS);break;case ta:i.depthFunc(i.LESS);break;case ts:i.depthFunc(i.LEQUAL);break;case na:i.depthFunc(i.EQUAL);break;case ia:i.depthFunc(i.GEQUAL);break;case sa:i.depthFunc(i.GREATER);break;case ra:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}J=fe}},setLocked:function(fe){U=fe},setClear:function(fe){pe!==fe&&(ue&&(fe=1-fe),i.clearDepth(fe),pe=fe)},reset:function(){U=!1,$=null,J=null,pe=null,ue=!1}}}function s(){let U=!1,ue=null,$=null,J=null,pe=null,fe=null,Ue=null,Mt=null,Nt=null;return{setTest:function(at){U||(at?ae(i.STENCIL_TEST):Me(i.STENCIL_TEST))},setMask:function(at){ue!==at&&!U&&(i.stencilMask(at),ue=at)},setFunc:function(at,un,Dn){($!==at||J!==un||pe!==Dn)&&(i.stencilFunc(at,un,Dn),$=at,J=un,pe=Dn)},setOp:function(at,un,Dn){(fe!==at||Ue!==un||Mt!==Dn)&&(i.stencilOp(at,un,Dn),fe=at,Ue=un,Mt=Dn)},setLocked:function(at){U=at},setClear:function(at){Nt!==at&&(i.clearStencil(at),Nt=at)},reset:function(){U=!1,ue=null,$=null,J=null,pe=null,fe=null,Ue=null,Mt=null,Nt=null}}}const r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap;let u={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,x=null,b=null,M=null,P=null,A=null,C=new he(0,0,0),R=0,E=!1,S=null,w=null,L=null,N=null,G=null;const V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let q=!1,K=0;const X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(X)[1]),q=K>=1):X.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),q=K>=2);let te=null,Q={};const ge=i.getParameter(i.SCISSOR_BOX),we=i.getParameter(i.VIEWPORT),Oe=new et().fromArray(ge),Z=new et().fromArray(we);function ee(U,ue,$,J){const pe=new Uint8Array(4),fe=i.createTexture();i.bindTexture(U,fe),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<$;Ue++)U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY?i.texImage3D(ue,0,i.RGBA,1,1,J,0,i.RGBA,i.UNSIGNED_BYTE,pe):i.texImage2D(ue+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,pe);return fe}const _e={};_e[i.TEXTURE_2D]=ee(i.TEXTURE_2D,i.TEXTURE_2D,1),_e[i.TEXTURE_CUBE_MAP]=ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[i.TEXTURE_2D_ARRAY]=ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),_e[i.TEXTURE_3D]=ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ae(i.DEPTH_TEST),o.setFunc(ts),je(!1),Ye(Cl),ae(i.CULL_FACE),B(Cn);function ae(U){u[U]!==!0&&(i.enable(U),u[U]=!0)}function Me(U){u[U]!==!1&&(i.disable(U),u[U]=!1)}function Ie(U,ue){return h[U]!==ue?(i.bindFramebuffer(U,ue),h[U]=ue,U===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ue),U===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ue),!0):!1}function Te(U,ue){let $=f,J=!1;if(U){$=d.get(ue),$===void 0&&($=[],d.set(ue,$));const pe=U.textures;if($.length!==pe.length||$[0]!==i.COLOR_ATTACHMENT0){for(let fe=0,Ue=pe.length;fe<Ue;fe++)$[fe]=i.COLOR_ATTACHMENT0+fe;$.length=pe.length,J=!0}}else $[0]!==i.BACK&&($[0]=i.BACK,J=!0);J&&i.drawBuffers($)}function tt(U){return g!==U?(i.useProgram(U),g=U,!0):!1}const De={[Mi]:i.FUNC_ADD,[ku]:i.FUNC_SUBTRACT,[zu]:i.FUNC_REVERSE_SUBTRACT};De[Hu]=i.MIN,De[Gu]=i.MAX;const st={[Vu]:i.ZERO,[Wu]:i.ONE,[Xu]:i.SRC_COLOR,[Ko]:i.SRC_ALPHA,[Ku]:i.SRC_ALPHA_SATURATE,[$u]:i.DST_COLOR,[Yu]:i.DST_ALPHA,[ju]:i.ONE_MINUS_SRC_COLOR,[Jo]:i.ONE_MINUS_SRC_ALPHA,[Zu]:i.ONE_MINUS_DST_COLOR,[qu]:i.ONE_MINUS_DST_ALPHA,[Ju]:i.CONSTANT_COLOR,[Qu]:i.ONE_MINUS_CONSTANT_COLOR,[ed]:i.CONSTANT_ALPHA,[td]:i.ONE_MINUS_CONSTANT_ALPHA};function B(U,ue,$,J,pe,fe,Ue,Mt,Nt,at){if(U===Cn){_===!0&&(Me(i.BLEND),_=!1);return}if(_===!1&&(ae(i.BLEND),_=!0),U!==Fu){if(U!==m||at!==E){if((p!==Mi||M!==Mi)&&(i.blendEquation(i.FUNC_ADD),p=Mi,M=Mi),at)switch(U){case $i:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Fr:i.blendFunc(i.ONE,i.ONE);break;case Pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Il:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case $i:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Fr:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Il:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}x=null,b=null,P=null,A=null,C.set(0,0,0),R=0,m=U,E=at}return}pe=pe||ue,fe=fe||$,Ue=Ue||J,(ue!==p||pe!==M)&&(i.blendEquationSeparate(De[ue],De[pe]),p=ue,M=pe),($!==x||J!==b||fe!==P||Ue!==A)&&(i.blendFuncSeparate(st[$],st[J],st[fe],st[Ue]),x=$,b=J,P=fe,A=Ue),(Mt.equals(C)===!1||Nt!==R)&&(i.blendColor(Mt.r,Mt.g,Mt.b,Nt),C.copy(Mt),R=Nt),m=U,E=!1}function Tt(U,ue){U.side===ut?Me(i.CULL_FACE):ae(i.CULL_FACE);let $=U.side===Wt;ue&&($=!$),je($),U.blending===$i&&U.transparent===!1?B(Cn):B(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);const J=U.stencilWrite;a.setTest(J),J&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),rt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ae(i.SAMPLE_ALPHA_TO_COVERAGE):Me(i.SAMPLE_ALPHA_TO_COVERAGE)}function je(U){S!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),S=U)}function Ye(U){U!==Bu?(ae(i.CULL_FACE),U!==w&&(U===Cl?i.cullFace(i.BACK):U===Ou?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Me(i.CULL_FACE),w=U}function Ce(U){U!==L&&(q&&i.lineWidth(U),L=U)}function rt(U,ue,$){U?(ae(i.POLYGON_OFFSET_FILL),(N!==ue||G!==$)&&(i.polygonOffset(ue,$),N=ue,G=$)):Me(i.POLYGON_OFFSET_FILL)}function Pe(U){U?ae(i.SCISSOR_TEST):Me(i.SCISSOR_TEST)}function v(U){U===void 0&&(U=i.TEXTURE0+V-1),te!==U&&(i.activeTexture(U),te=U)}function y(U,ue,$){$===void 0&&(te===null?$=i.TEXTURE0+V-1:$=te);let J=Q[$];J===void 0&&(J={type:void 0,texture:void 0},Q[$]=J),(J.type!==U||J.texture!==ue)&&(te!==$&&(i.activeTexture($),te=$),i.bindTexture(U,ue||_e[U]),J.type=U,J.texture=ue)}function I(){const U=Q[te];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function H(){try{i.compressedTexImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function z(){try{i.compressedTexImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function W(){try{i.texSubImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function le(){try{i.texSubImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ne(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ce(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ne(){try{i.texStorage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ie(){try{i.texStorage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ve(){try{i.texImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Re(){try{i.texImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Le(U){Oe.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),Oe.copy(U))}function ye(U){Z.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),Z.copy(U))}function qe(U,ue){let $=c.get(ue);$===void 0&&($=new WeakMap,c.set(ue,$));let J=$.get(U);J===void 0&&(J=i.getUniformBlockIndex(ue,U.name),$.set(U,J))}function ze(U,ue){const J=c.get(ue).get(U);l.get(ue)!==J&&(i.uniformBlockBinding(ue,J,U.__bindingPointIndex),l.set(ue,J))}function ot(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},te=null,Q={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,x=null,b=null,M=null,P=null,A=null,C=new he(0,0,0),R=0,E=!1,S=null,w=null,L=null,N=null,G=null,Oe.set(0,0,i.canvas.width,i.canvas.height),Z.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ae,disable:Me,bindFramebuffer:Ie,drawBuffers:Te,useProgram:tt,setBlending:B,setMaterial:Tt,setFlipSided:je,setCullFace:Ye,setLineWidth:Ce,setPolygonOffset:rt,setScissorTest:Pe,activeTexture:v,bindTexture:y,unbindTexture:I,compressedTexImage2D:H,compressedTexImage3D:z,texImage2D:ve,texImage3D:Re,updateUBOMapping:qe,uniformBlockBinding:ze,texStorage2D:Ne,texStorage3D:ie,texSubImage2D:W,texSubImage3D:le,compressedTexSubImage2D:ne,compressedTexSubImage3D:ce,scissor:Le,viewport:ye,reset:ot}}function Rc(i,e,t,n){const s=N0(n);switch(t){case Dh:return i*e;case Nh:return i*e;case Uh:return i*e*2;case qr:return i*e/s.components*s.byteLength;case Ka:return i*e/s.components*s.byteLength;case Bh:return i*e*2/s.components*s.byteLength;case Ja:return i*e*2/s.components*s.byteLength;case Lh:return i*e*3/s.components*s.byteLength;case hn:return i*e*4/s.components*s.byteLength;case Qa:return i*e*4/s.components*s.byteLength;case Cr:case Pr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ir:case Dr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ca:case ua:return Math.max(i,16)*Math.max(e,8)/4;case la:case ha:return Math.max(i,8)*Math.max(e,8)/2;case da:case fa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case pa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ma:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ga:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case _a:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case va:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ya:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case xa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ma:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Sa:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ba:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ea:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case wa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Aa:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ra:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Lr:case Ca:case Pa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Oh:case Ia:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Da:case La:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function N0(i){switch(i){case Mn:case Ch:return{byteLength:1,components:1};case zs:case Ph:case qn:return{byteLength:2,components:1};case $a:case Za:return{byteLength:2,components:4};case wi:case qa:case vn:return{byteLength:4,components:1};case Ih:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function U0(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new xe,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(v,y){return f?new OffscreenCanvas(v,y):Vs("canvas")}function _(v,y,I){let H=1;const z=Pe(v);if((z.width>I||z.height>I)&&(H=I/Math.max(z.width,z.height)),H<1)if(typeof HTMLImageElement<"u"&&v instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&v instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&v instanceof ImageBitmap||typeof VideoFrame<"u"&&v instanceof VideoFrame){const W=Math.floor(H*z.width),le=Math.floor(H*z.height);h===void 0&&(h=g(W,le));const ne=y?g(W,le):h;return ne.width=W,ne.height=le,ne.getContext("2d").drawImage(v,0,0,W,le),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+z.width+"x"+z.height+") to ("+W+"x"+le+")."),ne}else return"data"in v&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+z.width+"x"+z.height+")."),v;return v}function m(v){return v.generateMipmaps}function p(v){i.generateMipmap(v)}function x(v){return v.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:v.isWebGL3DRenderTarget?i.TEXTURE_3D:v.isWebGLArrayRenderTarget||v.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(v,y,I,H,z=!1){if(v!==null){if(i[v]!==void 0)return i[v];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+v+"'")}let W=y;if(y===i.RED&&(I===i.FLOAT&&(W=i.R32F),I===i.HALF_FLOAT&&(W=i.R16F),I===i.UNSIGNED_BYTE&&(W=i.R8)),y===i.RED_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.R8UI),I===i.UNSIGNED_SHORT&&(W=i.R16UI),I===i.UNSIGNED_INT&&(W=i.R32UI),I===i.BYTE&&(W=i.R8I),I===i.SHORT&&(W=i.R16I),I===i.INT&&(W=i.R32I)),y===i.RG&&(I===i.FLOAT&&(W=i.RG32F),I===i.HALF_FLOAT&&(W=i.RG16F),I===i.UNSIGNED_BYTE&&(W=i.RG8)),y===i.RG_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RG8UI),I===i.UNSIGNED_SHORT&&(W=i.RG16UI),I===i.UNSIGNED_INT&&(W=i.RG32UI),I===i.BYTE&&(W=i.RG8I),I===i.SHORT&&(W=i.RG16I),I===i.INT&&(W=i.RG32I)),y===i.RGB_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RGB8UI),I===i.UNSIGNED_SHORT&&(W=i.RGB16UI),I===i.UNSIGNED_INT&&(W=i.RGB32UI),I===i.BYTE&&(W=i.RGB8I),I===i.SHORT&&(W=i.RGB16I),I===i.INT&&(W=i.RGB32I)),y===i.RGBA_INTEGER&&(I===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),I===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),I===i.UNSIGNED_INT&&(W=i.RGBA32UI),I===i.BYTE&&(W=i.RGBA8I),I===i.SHORT&&(W=i.RGBA16I),I===i.INT&&(W=i.RGBA32I)),y===i.RGB&&I===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),y===i.RGBA){const le=z?$r:Ze.getTransfer(H);I===i.FLOAT&&(W=i.RGBA32F),I===i.HALF_FLOAT&&(W=i.RGBA16F),I===i.UNSIGNED_BYTE&&(W=le===lt?i.SRGB8_ALPHA8:i.RGBA8),I===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),I===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function M(v,y){let I;return v?y===null||y===wi||y===ss?I=i.DEPTH24_STENCIL8:y===vn?I=i.DEPTH32F_STENCIL8:y===zs&&(I=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===wi||y===ss?I=i.DEPTH_COMPONENT24:y===vn?I=i.DEPTH_COMPONENT32F:y===zs&&(I=i.DEPTH_COMPONENT16),I}function P(v,y){return m(v)===!0||v.isFramebufferTexture&&v.minFilter!==Xt&&v.minFilter!==Qt?Math.log2(Math.max(y.width,y.height))+1:v.mipmaps!==void 0&&v.mipmaps.length>0?v.mipmaps.length:v.isCompressedTexture&&Array.isArray(v.image)?y.mipmaps.length:1}function A(v){const y=v.target;y.removeEventListener("dispose",A),R(y),y.isVideoTexture&&u.delete(y)}function C(v){const y=v.target;y.removeEventListener("dispose",C),S(y)}function R(v){const y=n.get(v);if(y.__webglInit===void 0)return;const I=v.source,H=d.get(I);if(H){const z=H[y.__cacheKey];z.usedTimes--,z.usedTimes===0&&E(v),Object.keys(H).length===0&&d.delete(I)}n.remove(v)}function E(v){const y=n.get(v);i.deleteTexture(y.__webglTexture);const I=v.source,H=d.get(I);delete H[y.__cacheKey],o.memory.textures--}function S(v){const y=n.get(v);if(v.depthTexture&&(v.depthTexture.dispose(),n.remove(v.depthTexture)),v.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(y.__webglFramebuffer[H]))for(let z=0;z<y.__webglFramebuffer[H].length;z++)i.deleteFramebuffer(y.__webglFramebuffer[H][z]);else i.deleteFramebuffer(y.__webglFramebuffer[H]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[H])}else{if(Array.isArray(y.__webglFramebuffer))for(let H=0;H<y.__webglFramebuffer.length;H++)i.deleteFramebuffer(y.__webglFramebuffer[H]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let H=0;H<y.__webglColorRenderbuffer.length;H++)y.__webglColorRenderbuffer[H]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[H]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const I=v.textures;for(let H=0,z=I.length;H<z;H++){const W=n.get(I[H]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),o.memory.textures--),n.remove(I[H])}n.remove(v)}let w=0;function L(){w=0}function N(){const v=w;return v>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+v+" texture units while this GPU supports only "+s.maxTextures),w+=1,v}function G(v){const y=[];return y.push(v.wrapS),y.push(v.wrapT),y.push(v.wrapR||0),y.push(v.magFilter),y.push(v.minFilter),y.push(v.anisotropy),y.push(v.internalFormat),y.push(v.format),y.push(v.type),y.push(v.generateMipmaps),y.push(v.premultiplyAlpha),y.push(v.flipY),y.push(v.unpackAlignment),y.push(v.colorSpace),y.join()}function V(v,y){const I=n.get(v);if(v.isVideoTexture&&Ce(v),v.isRenderTargetTexture===!1&&v.version>0&&I.__version!==v.version){const H=v.image;if(H===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(I,v,y);return}}t.bindTexture(i.TEXTURE_2D,I.__webglTexture,i.TEXTURE0+y)}function q(v,y){const I=n.get(v);if(v.version>0&&I.__version!==v.version){Z(I,v,y);return}t.bindTexture(i.TEXTURE_2D_ARRAY,I.__webglTexture,i.TEXTURE0+y)}function K(v,y){const I=n.get(v);if(v.version>0&&I.__version!==v.version){Z(I,v,y);return}t.bindTexture(i.TEXTURE_3D,I.__webglTexture,i.TEXTURE0+y)}function X(v,y){const I=n.get(v);if(v.version>0&&I.__version!==v.version){ee(I,v,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+y)}const te={[hi]:i.REPEAT,[cn]:i.CLAMP_TO_EDGE,[kr]:i.MIRRORED_REPEAT},Q={[Xt]:i.NEAREST,[Rh]:i.NEAREST_MIPMAP_NEAREST,[Is]:i.NEAREST_MIPMAP_LINEAR,[Qt]:i.LINEAR,[Rr]:i.LINEAR_MIPMAP_NEAREST,[Xn]:i.LINEAR_MIPMAP_LINEAR},ge={[ud]:i.NEVER,[_d]:i.ALWAYS,[dd]:i.LESS,[kh]:i.LEQUAL,[fd]:i.EQUAL,[gd]:i.GEQUAL,[pd]:i.GREATER,[md]:i.NOTEQUAL};function we(v,y){if(y.type===vn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Qt||y.magFilter===Rr||y.magFilter===Is||y.magFilter===Xn||y.minFilter===Qt||y.minFilter===Rr||y.minFilter===Is||y.minFilter===Xn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(v,i.TEXTURE_WRAP_S,te[y.wrapS]),i.texParameteri(v,i.TEXTURE_WRAP_T,te[y.wrapT]),(v===i.TEXTURE_3D||v===i.TEXTURE_2D_ARRAY)&&i.texParameteri(v,i.TEXTURE_WRAP_R,te[y.wrapR]),i.texParameteri(v,i.TEXTURE_MAG_FILTER,Q[y.magFilter]),i.texParameteri(v,i.TEXTURE_MIN_FILTER,Q[y.minFilter]),y.compareFunction&&(i.texParameteri(v,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(v,i.TEXTURE_COMPARE_FUNC,ge[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Xt||y.minFilter!==Is&&y.minFilter!==Xn||y.type===vn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const I=e.get("EXT_texture_filter_anisotropic");i.texParameterf(v,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Oe(v,y){let I=!1;v.__webglInit===void 0&&(v.__webglInit=!0,y.addEventListener("dispose",A));const H=y.source;let z=d.get(H);z===void 0&&(z={},d.set(H,z));const W=G(y);if(W!==v.__cacheKey){z[W]===void 0&&(z[W]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,I=!0),z[W].usedTimes++;const le=z[v.__cacheKey];le!==void 0&&(z[v.__cacheKey].usedTimes--,le.usedTimes===0&&E(y)),v.__cacheKey=W,v.__webglTexture=z[W].texture}return I}function Z(v,y,I){let H=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(H=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(H=i.TEXTURE_3D);const z=Oe(v,y),W=y.source;t.bindTexture(H,v.__webglTexture,i.TEXTURE0+I);const le=n.get(W);if(W.version!==le.__version||z===!0){t.activeTexture(i.TEXTURE0+I);const ne=Ze.getPrimaries(Ze.workingColorSpace),ce=y.colorSpace===Rn?null:Ze.getPrimaries(y.colorSpace),Ne=y.colorSpace===Rn||ne===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);let ie=_(y.image,!1,s.maxTextureSize);ie=rt(y,ie);const ve=r.convert(y.format,y.colorSpace),Re=r.convert(y.type);let Le=b(y.internalFormat,ve,Re,y.colorSpace,y.isVideoTexture);we(H,y);let ye;const qe=y.mipmaps,ze=y.isVideoTexture!==!0,ot=le.__version===void 0||z===!0,U=W.dataReady,ue=P(y,ie);if(y.isDepthTexture)Le=M(y.format===rs,y.type),ot&&(ze?t.texStorage2D(i.TEXTURE_2D,1,Le,ie.width,ie.height):t.texImage2D(i.TEXTURE_2D,0,Le,ie.width,ie.height,0,ve,Re,null));else if(y.isDataTexture)if(qe.length>0){ze&&ot&&t.texStorage2D(i.TEXTURE_2D,ue,Le,qe[0].width,qe[0].height);for(let $=0,J=qe.length;$<J;$++)ye=qe[$],ze?U&&t.texSubImage2D(i.TEXTURE_2D,$,0,0,ye.width,ye.height,ve,Re,ye.data):t.texImage2D(i.TEXTURE_2D,$,Le,ye.width,ye.height,0,ve,Re,ye.data);y.generateMipmaps=!1}else ze?(ot&&t.texStorage2D(i.TEXTURE_2D,ue,Le,ie.width,ie.height),U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ie.width,ie.height,ve,Re,ie.data)):t.texImage2D(i.TEXTURE_2D,0,Le,ie.width,ie.height,0,ve,Re,ie.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){ze&&ot&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,Le,qe[0].width,qe[0].height,ie.depth);for(let $=0,J=qe.length;$<J;$++)if(ye=qe[$],y.format!==hn)if(ve!==null)if(ze){if(U)if(y.layerUpdates.size>0){const pe=Rc(ye.width,ye.height,y.format,y.type);for(const fe of y.layerUpdates){const Ue=ye.data.subarray(fe*pe/ye.data.BYTES_PER_ELEMENT,(fe+1)*pe/ye.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,fe,ye.width,ye.height,1,ve,Ue)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,0,ye.width,ye.height,ie.depth,ve,ye.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,$,Le,ye.width,ye.height,ie.depth,0,ye.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ze?U&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,0,ye.width,ye.height,ie.depth,ve,Re,ye.data):t.texImage3D(i.TEXTURE_2D_ARRAY,$,Le,ye.width,ye.height,ie.depth,0,ve,Re,ye.data)}else{ze&&ot&&t.texStorage2D(i.TEXTURE_2D,ue,Le,qe[0].width,qe[0].height);for(let $=0,J=qe.length;$<J;$++)ye=qe[$],y.format!==hn?ve!==null?ze?U&&t.compressedTexSubImage2D(i.TEXTURE_2D,$,0,0,ye.width,ye.height,ve,ye.data):t.compressedTexImage2D(i.TEXTURE_2D,$,Le,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ze?U&&t.texSubImage2D(i.TEXTURE_2D,$,0,0,ye.width,ye.height,ve,Re,ye.data):t.texImage2D(i.TEXTURE_2D,$,Le,ye.width,ye.height,0,ve,Re,ye.data)}else if(y.isDataArrayTexture)if(ze){if(ot&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,Le,ie.width,ie.height,ie.depth),U)if(y.layerUpdates.size>0){const $=Rc(ie.width,ie.height,y.format,y.type);for(const J of y.layerUpdates){const pe=ie.data.subarray(J*$/ie.data.BYTES_PER_ELEMENT,(J+1)*$/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,ie.width,ie.height,1,ve,Re,pe)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,ve,Re,ie.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Le,ie.width,ie.height,ie.depth,0,ve,Re,ie.data);else if(y.isData3DTexture)ze?(ot&&t.texStorage3D(i.TEXTURE_3D,ue,Le,ie.width,ie.height,ie.depth),U&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,ve,Re,ie.data)):t.texImage3D(i.TEXTURE_3D,0,Le,ie.width,ie.height,ie.depth,0,ve,Re,ie.data);else if(y.isFramebufferTexture){if(ot)if(ze)t.texStorage2D(i.TEXTURE_2D,ue,Le,ie.width,ie.height);else{let $=ie.width,J=ie.height;for(let pe=0;pe<ue;pe++)t.texImage2D(i.TEXTURE_2D,pe,Le,$,J,0,ve,Re,null),$>>=1,J>>=1}}else if(qe.length>0){if(ze&&ot){const $=Pe(qe[0]);t.texStorage2D(i.TEXTURE_2D,ue,Le,$.width,$.height)}for(let $=0,J=qe.length;$<J;$++)ye=qe[$],ze?U&&t.texSubImage2D(i.TEXTURE_2D,$,0,0,ve,Re,ye):t.texImage2D(i.TEXTURE_2D,$,Le,ve,Re,ye);y.generateMipmaps=!1}else if(ze){if(ot){const $=Pe(ie);t.texStorage2D(i.TEXTURE_2D,ue,Le,$.width,$.height)}U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ve,Re,ie)}else t.texImage2D(i.TEXTURE_2D,0,Le,ve,Re,ie);m(y)&&p(H),le.__version=W.version,y.onUpdate&&y.onUpdate(y)}v.__version=y.version}function ee(v,y,I){if(y.image.length!==6)return;const H=Oe(v,y),z=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,v.__webglTexture,i.TEXTURE0+I);const W=n.get(z);if(z.version!==W.__version||H===!0){t.activeTexture(i.TEXTURE0+I);const le=Ze.getPrimaries(Ze.workingColorSpace),ne=y.colorSpace===Rn?null:Ze.getPrimaries(y.colorSpace),ce=y.colorSpace===Rn||le===ne?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ce);const Ne=y.isCompressedTexture||y.image[0].isCompressedTexture,ie=y.image[0]&&y.image[0].isDataTexture,ve=[];for(let J=0;J<6;J++)!Ne&&!ie?ve[J]=_(y.image[J],!0,s.maxCubemapSize):ve[J]=ie?y.image[J].image:y.image[J],ve[J]=rt(y,ve[J]);const Re=ve[0],Le=r.convert(y.format,y.colorSpace),ye=r.convert(y.type),qe=b(y.internalFormat,Le,ye,y.colorSpace),ze=y.isVideoTexture!==!0,ot=W.__version===void 0||H===!0,U=z.dataReady;let ue=P(y,Re);we(i.TEXTURE_CUBE_MAP,y);let $;if(Ne){ze&&ot&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ue,qe,Re.width,Re.height);for(let J=0;J<6;J++){$=ve[J].mipmaps;for(let pe=0;pe<$.length;pe++){const fe=$[pe];y.format!==hn?Le!==null?ze?U&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe,0,0,fe.width,fe.height,Le,fe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe,qe,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ze?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe,0,0,fe.width,fe.height,Le,ye,fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe,qe,fe.width,fe.height,0,Le,ye,fe.data)}}}else{if($=y.mipmaps,ze&&ot){$.length>0&&ue++;const J=Pe(ve[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ue,qe,J.width,J.height)}for(let J=0;J<6;J++)if(ie){ze?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,ve[J].width,ve[J].height,Le,ye,ve[J].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,qe,ve[J].width,ve[J].height,0,Le,ye,ve[J].data);for(let pe=0;pe<$.length;pe++){const Ue=$[pe].image[J].image;ze?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe+1,0,0,Ue.width,Ue.height,Le,ye,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe+1,qe,Ue.width,Ue.height,0,Le,ye,Ue.data)}}else{ze?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Le,ye,ve[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,qe,Le,ye,ve[J]);for(let pe=0;pe<$.length;pe++){const fe=$[pe];ze?U&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe+1,0,0,Le,ye,fe.image[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,pe+1,qe,Le,ye,fe.image[J])}}}m(y)&&p(i.TEXTURE_CUBE_MAP),W.__version=z.version,y.onUpdate&&y.onUpdate(y)}v.__version=y.version}function _e(v,y,I,H,z,W){const le=r.convert(I.format,I.colorSpace),ne=r.convert(I.type),ce=b(I.internalFormat,le,ne,I.colorSpace),Ne=n.get(y),ie=n.get(I);if(ie.__renderTarget=y,!Ne.__hasExternalTextures){const ve=Math.max(1,y.width>>W),Re=Math.max(1,y.height>>W);z===i.TEXTURE_3D||z===i.TEXTURE_2D_ARRAY?t.texImage3D(z,W,ce,ve,Re,y.depth,0,le,ne,null):t.texImage2D(z,W,ce,ve,Re,0,le,ne,null)}t.bindFramebuffer(i.FRAMEBUFFER,v),Ye(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,H,z,ie.__webglTexture,0,je(y)):(z===i.TEXTURE_2D||z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,H,z,ie.__webglTexture,W),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ae(v,y,I){if(i.bindRenderbuffer(i.RENDERBUFFER,v),y.depthBuffer){const H=y.depthTexture,z=H&&H.isDepthTexture?H.type:null,W=M(y.stencilBuffer,z),le=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=je(y);Ye(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ne,W,y.width,y.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,ne,W,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,W,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,v)}else{const H=y.textures;for(let z=0;z<H.length;z++){const W=H[z],le=r.convert(W.format,W.colorSpace),ne=r.convert(W.type),ce=b(W.internalFormat,le,ne,W.colorSpace),Ne=je(y);I&&Ye(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne,ce,y.width,y.height):Ye(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ne,ce,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ce,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Me(v,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,v),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const H=n.get(y.depthTexture);H.__renderTarget=y,(!H.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),V(y.depthTexture,0);const z=H.__webglTexture,W=je(y);if(y.depthTexture.format===Zi)Ye(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,z,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,z,0);else if(y.depthTexture.format===rs)Ye(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,z,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,z,0);else throw new Error("Unknown depthTexture format")}function Ie(v){const y=n.get(v),I=v.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==v.depthTexture){const H=v.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),H){const z=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,H.removeEventListener("dispose",z)};H.addEventListener("dispose",z),y.__depthDisposeCallback=z}y.__boundDepthTexture=H}if(v.depthTexture&&!y.__autoAllocateDepthBuffer){if(I)throw new Error("target.depthTexture not supported in Cube render targets");Me(y.__webglFramebuffer,v)}else if(I){y.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[H]),y.__webglDepthbuffer[H]===void 0)y.__webglDepthbuffer[H]=i.createRenderbuffer(),ae(y.__webglDepthbuffer[H],v,!1);else{const z=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=y.__webglDepthbuffer[H];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,z,i.RENDERBUFFER,W)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),ae(y.__webglDepthbuffer,v,!1);else{const H=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,z=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,z),i.framebufferRenderbuffer(i.FRAMEBUFFER,H,i.RENDERBUFFER,z)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Te(v,y,I){const H=n.get(v);y!==void 0&&_e(H.__webglFramebuffer,v,v.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),I!==void 0&&Ie(v)}function tt(v){const y=v.texture,I=n.get(v),H=n.get(y);v.addEventListener("dispose",C);const z=v.textures,W=v.isWebGLCubeRenderTarget===!0,le=z.length>1;if(le||(H.__webglTexture===void 0&&(H.__webglTexture=i.createTexture()),H.__version=y.version,o.memory.textures++),W){I.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(y.mipmaps&&y.mipmaps.length>0){I.__webglFramebuffer[ne]=[];for(let ce=0;ce<y.mipmaps.length;ce++)I.__webglFramebuffer[ne][ce]=i.createFramebuffer()}else I.__webglFramebuffer[ne]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){I.__webglFramebuffer=[];for(let ne=0;ne<y.mipmaps.length;ne++)I.__webglFramebuffer[ne]=i.createFramebuffer()}else I.__webglFramebuffer=i.createFramebuffer();if(le)for(let ne=0,ce=z.length;ne<ce;ne++){const Ne=n.get(z[ne]);Ne.__webglTexture===void 0&&(Ne.__webglTexture=i.createTexture(),o.memory.textures++)}if(v.samples>0&&Ye(v)===!1){I.__webglMultisampledFramebuffer=i.createFramebuffer(),I.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let ne=0;ne<z.length;ne++){const ce=z[ne];I.__webglColorRenderbuffer[ne]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,I.__webglColorRenderbuffer[ne]);const Ne=r.convert(ce.format,ce.colorSpace),ie=r.convert(ce.type),ve=b(ce.internalFormat,Ne,ie,ce.colorSpace,v.isXRRenderTarget===!0),Re=je(v);i.renderbufferStorageMultisample(i.RENDERBUFFER,Re,ve,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ne,i.RENDERBUFFER,I.__webglColorRenderbuffer[ne])}i.bindRenderbuffer(i.RENDERBUFFER,null),v.depthBuffer&&(I.__webglDepthRenderbuffer=i.createRenderbuffer(),ae(I.__webglDepthRenderbuffer,v,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture),we(i.TEXTURE_CUBE_MAP,y);for(let ne=0;ne<6;ne++)if(y.mipmaps&&y.mipmaps.length>0)for(let ce=0;ce<y.mipmaps.length;ce++)_e(I.__webglFramebuffer[ne][ce],v,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ce);else _e(I.__webglFramebuffer[ne],v,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);m(y)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let ne=0,ce=z.length;ne<ce;ne++){const Ne=z[ne],ie=n.get(Ne);t.bindTexture(i.TEXTURE_2D,ie.__webglTexture),we(i.TEXTURE_2D,Ne),_e(I.__webglFramebuffer,v,Ne,i.COLOR_ATTACHMENT0+ne,i.TEXTURE_2D,0),m(Ne)&&p(i.TEXTURE_2D)}t.unbindTexture()}else{let ne=i.TEXTURE_2D;if((v.isWebGL3DRenderTarget||v.isWebGLArrayRenderTarget)&&(ne=v.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,H.__webglTexture),we(ne,y),y.mipmaps&&y.mipmaps.length>0)for(let ce=0;ce<y.mipmaps.length;ce++)_e(I.__webglFramebuffer[ce],v,y,i.COLOR_ATTACHMENT0,ne,ce);else _e(I.__webglFramebuffer,v,y,i.COLOR_ATTACHMENT0,ne,0);m(y)&&p(ne),t.unbindTexture()}v.depthBuffer&&Ie(v)}function De(v){const y=v.textures;for(let I=0,H=y.length;I<H;I++){const z=y[I];if(m(z)){const W=x(v),le=n.get(z).__webglTexture;t.bindTexture(W,le),p(W),t.unbindTexture()}}}const st=[],B=[];function Tt(v){if(v.samples>0){if(Ye(v)===!1){const y=v.textures,I=v.width,H=v.height;let z=i.COLOR_BUFFER_BIT;const W=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=n.get(v),ne=y.length>1;if(ne)for(let ce=0;ce<y.length;ce++)t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let ce=0;ce<y.length;ce++){if(v.resolveDepthBuffer&&(v.depthBuffer&&(z|=i.DEPTH_BUFFER_BIT),v.stencilBuffer&&v.resolveStencilBuffer&&(z|=i.STENCIL_BUFFER_BIT)),ne){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);const Ne=n.get(y[ce]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ne,0)}i.blitFramebuffer(0,0,I,H,0,0,I,H,z,i.NEAREST),l===!0&&(st.length=0,B.length=0,st.push(i.COLOR_ATTACHMENT0+ce),v.depthBuffer&&v.resolveDepthBuffer===!1&&(st.push(W),B.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,B)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,st))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ne)for(let ce=0;ce<y.length;ce++){t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);const Ne=n.get(y[ce]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,Ne,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(v.depthBuffer&&v.resolveDepthBuffer===!1&&l){const y=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function je(v){return Math.min(s.maxSamples,v.samples)}function Ye(v){const y=n.get(v);return v.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Ce(v){const y=o.render.frame;u.get(v)!==y&&(u.set(v,y),v.update())}function rt(v,y){const I=v.colorSpace,H=v.format,z=v.type;return v.isCompressedTexture===!0||v.isVideoTexture===!0||I!==jt&&I!==Rn&&(Ze.getTransfer(I)===lt?(H!==hn||z!==Mn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",I)),y}function Pe(v){return typeof HTMLImageElement<"u"&&v instanceof HTMLImageElement?(c.width=v.naturalWidth||v.width,c.height=v.naturalHeight||v.height):typeof VideoFrame<"u"&&v instanceof VideoFrame?(c.width=v.displayWidth,c.height=v.displayHeight):(c.width=v.width,c.height=v.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=L,this.setTexture2D=V,this.setTexture2DArray=q,this.setTexture3D=K,this.setTextureCube=X,this.rebindTextures=Te,this.setupRenderTarget=tt,this.updateRenderTargetMipmap=De,this.updateMultisampleRenderTarget=Tt,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=Ye}function B0(i,e){function t(n,s=Rn){let r;const o=Ze.getTransfer(s);if(n===Mn)return i.UNSIGNED_BYTE;if(n===$a)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Za)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Ih)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ch)return i.BYTE;if(n===Ph)return i.SHORT;if(n===zs)return i.UNSIGNED_SHORT;if(n===qa)return i.INT;if(n===wi)return i.UNSIGNED_INT;if(n===vn)return i.FLOAT;if(n===qn)return i.HALF_FLOAT;if(n===Dh)return i.ALPHA;if(n===Lh)return i.RGB;if(n===hn)return i.RGBA;if(n===Nh)return i.LUMINANCE;if(n===Uh)return i.LUMINANCE_ALPHA;if(n===Zi)return i.DEPTH_COMPONENT;if(n===rs)return i.DEPTH_STENCIL;if(n===qr)return i.RED;if(n===Ka)return i.RED_INTEGER;if(n===Bh)return i.RG;if(n===Ja)return i.RG_INTEGER;if(n===Qa)return i.RGBA_INTEGER;if(n===Cr||n===Pr||n===Ir||n===Dr)if(o===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Cr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Pr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Cr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Pr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ir)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Dr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===la||n===ca||n===ha||n===ua)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===la)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ca)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ha)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ua)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===da||n===fa||n===pa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===da||n===fa)return o===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===pa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ma||n===ga||n===_a||n===va||n===ya||n===xa||n===Ma||n===Sa||n===ba||n===Ea||n===wa||n===Ta||n===Aa||n===Ra)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ma)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ga)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===_a)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===va)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ya)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===xa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ma)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Sa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ba)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ea)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===wa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ta)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Aa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ra)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Lr||n===Ca||n===Pa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Lr)return o===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ca)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Pa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Oh||n===Ia||n===Da||n===La)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Lr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ia)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Da)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===La)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ss?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class O0 extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class bt extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const F0={type:"move"};class Po{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new bt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new bt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new bt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(F0)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new bt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const k0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,z0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class H0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new Rt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new zt({vertexShader:k0,fragmentShader:z0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new oe(new Pn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class G0 extends Ti{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const _=new H0,m=t.getContextAttributes();let p=null,x=null;const b=[],M=[],P=new xe;let A=null;const C=new Ft;C.viewport=new et;const R=new Ft;R.viewport=new et;const E=[C,R],S=new O0;let w=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ee=b[Z];return ee===void 0&&(ee=new Po,b[Z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Z){let ee=b[Z];return ee===void 0&&(ee=new Po,b[Z]=ee),ee.getGripSpace()},this.getHand=function(Z){let ee=b[Z];return ee===void 0&&(ee=new Po,b[Z]=ee),ee.getHandSpace()};function N(Z){const ee=M.indexOf(Z.inputSource);if(ee===-1)return;const _e=b[ee];_e!==void 0&&(_e.update(Z.inputSource,Z.frame,c||o),_e.dispatchEvent({type:Z.type,data:Z.inputSource}))}function G(){s.removeEventListener("select",N),s.removeEventListener("selectstart",N),s.removeEventListener("selectend",N),s.removeEventListener("squeeze",N),s.removeEventListener("squeezestart",N),s.removeEventListener("squeezeend",N),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",V);for(let Z=0;Z<b.length;Z++){const ee=M[Z];ee!==null&&(M[Z]=null,b[Z].disconnect(ee))}w=null,L=null,_.reset(),e.setRenderTarget(p),f=null,d=null,h=null,s=null,x=null,Oe.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",N),s.addEventListener("selectstart",N),s.addEventListener("selectend",N),s.addEventListener("squeeze",N),s.addEventListener("squeezestart",N),s.addEventListener("squeezeend",N),s.addEventListener("end",G),s.addEventListener("inputsourceschange",V),m.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(P),s.renderState.layers===void 0){const ee={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ee),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new en(f.framebufferWidth,f.framebufferHeight,{format:hn,type:Mn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ee=null,_e=null,ae=null;m.depth&&(ae=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=m.stencil?rs:Zi,_e=m.stencil?ss:wi);const Me={colorFormat:t.RGBA8,depthFormat:ae,scaleFactor:r};h=new XRWebGLBinding(s,t),d=h.createProjectionLayer(Me),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new en(d.textureWidth,d.textureHeight,{format:hn,type:Mn,depthTexture:new $h(d.textureWidth,d.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Oe.setContext(s),Oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function V(Z){for(let ee=0;ee<Z.removed.length;ee++){const _e=Z.removed[ee],ae=M.indexOf(_e);ae>=0&&(M[ae]=null,b[ae].disconnect(_e))}for(let ee=0;ee<Z.added.length;ee++){const _e=Z.added[ee];let ae=M.indexOf(_e);if(ae===-1){for(let Ie=0;Ie<b.length;Ie++)if(Ie>=M.length){M.push(_e),ae=Ie;break}else if(M[Ie]===null){M[Ie]=_e,ae=Ie;break}if(ae===-1)break}const Me=b[ae];Me&&Me.connect(_e)}}const q=new D,K=new D;function X(Z,ee,_e){q.setFromMatrixPosition(ee.matrixWorld),K.setFromMatrixPosition(_e.matrixWorld);const ae=q.distanceTo(K),Me=ee.projectionMatrix.elements,Ie=_e.projectionMatrix.elements,Te=Me[14]/(Me[10]-1),tt=Me[14]/(Me[10]+1),De=(Me[9]+1)/Me[5],st=(Me[9]-1)/Me[5],B=(Me[8]-1)/Me[0],Tt=(Ie[8]+1)/Ie[0],je=Te*B,Ye=Te*Tt,Ce=ae/(-B+Tt),rt=Ce*-B;if(ee.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(rt),Z.translateZ(Ce),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Me[10]===-1)Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{const Pe=Te+Ce,v=tt+Ce,y=je-rt,I=Ye+(ae-rt),H=De*tt/v*Pe,z=st*tt/v*Pe;Z.projectionMatrix.makePerspective(y,I,H,z,Pe,v),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function te(Z,ee){ee===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ee.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let ee=Z.near,_e=Z.far;_.texture!==null&&(_.depthNear>0&&(ee=_.depthNear),_.depthFar>0&&(_e=_.depthFar)),S.near=R.near=C.near=ee,S.far=R.far=C.far=_e,(w!==S.near||L!==S.far)&&(s.updateRenderState({depthNear:S.near,depthFar:S.far}),w=S.near,L=S.far),C.layers.mask=Z.layers.mask|2,R.layers.mask=Z.layers.mask|4,S.layers.mask=C.layers.mask|R.layers.mask;const ae=Z.parent,Me=S.cameras;te(S,ae);for(let Ie=0;Ie<Me.length;Ie++)te(Me[Ie],ae);Me.length===2?X(S,C,R):S.projectionMatrix.copy(C.projectionMatrix),Q(Z,S,ae)};function Q(Z,ee,_e){_e===null?Z.matrix.copy(ee.matrixWorld):(Z.matrix.copy(_e.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ee.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=os*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(Z){l=Z,d!==null&&(d.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(S)};let ge=null;function we(Z,ee){if(u=ee.getViewerPose(c||o),g=ee,u!==null){const _e=u.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let ae=!1;_e.length!==S.cameras.length&&(S.cameras.length=0,ae=!0);for(let Ie=0;Ie<_e.length;Ie++){const Te=_e[Ie];let tt=null;if(f!==null)tt=f.getViewport(Te);else{const st=h.getViewSubImage(d,Te);tt=st.viewport,Ie===0&&(e.setRenderTargetTextures(x,st.colorTexture,d.ignoreDepthValues?void 0:st.depthStencilTexture),e.setRenderTarget(x))}let De=E[Ie];De===void 0&&(De=new Ft,De.layers.enable(Ie),De.viewport=new et,E[Ie]=De),De.matrix.fromArray(Te.transform.matrix),De.matrix.decompose(De.position,De.quaternion,De.scale),De.projectionMatrix.fromArray(Te.projectionMatrix),De.projectionMatrixInverse.copy(De.projectionMatrix).invert(),De.viewport.set(tt.x,tt.y,tt.width,tt.height),Ie===0&&(S.matrix.copy(De.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),ae===!0&&S.cameras.push(De)}const Me=s.enabledFeatures;if(Me&&Me.includes("depth-sensing")){const Ie=h.getDepthInformation(_e[0]);Ie&&Ie.isValid&&Ie.texture&&_.init(e,Ie,s.renderState)}}for(let _e=0;_e<b.length;_e++){const ae=M[_e],Me=b[_e];ae!==null&&Me!==void 0&&Me.update(ae,ee,c||o)}ge&&ge(Z,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}const Oe=new qh;Oe.setAnimationLoop(we),this.setAnimationLoop=function(Z){ge=Z},this.dispose=function(){}}}const vi=new nn,V0=new He;function W0(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Xh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,x,b,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,M)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,x,b):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Wt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Wt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=e.get(p),b=x.envMap,M=x.envMapRotation;b&&(m.envMap.value=b,vi.copy(M),vi.x*=-1,vi.y*=-1,vi.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(vi.y*=-1,vi.z*=-1),m.envMapRotation.value.setFromMatrix4(V0.makeRotationFromEuler(vi)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=b*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Wt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const x=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function X0(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,b){const M=b.program;n.uniformBlockBinding(x,M)}function c(x,b){let M=s[x.id];M===void 0&&(g(x),M=u(x),s[x.id]=M,x.addEventListener("dispose",m));const P=b.program;n.updateUBOMapping(x,P);const A=e.render.frame;r[x.id]!==A&&(d(x),r[x.id]=A)}function u(x){const b=h();x.__bindingPointIndex=b;const M=i.createBuffer(),P=x.__size,A=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,P,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,M),M}function h(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const b=s[x.id],M=x.uniforms,P=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let A=0,C=M.length;A<C;A++){const R=Array.isArray(M[A])?M[A]:[M[A]];for(let E=0,S=R.length;E<S;E++){const w=R[E];if(f(w,A,E,P)===!0){const L=w.__offset,N=Array.isArray(w.value)?w.value:[w.value];let G=0;for(let V=0;V<N.length;V++){const q=N[V],K=_(q);typeof q=="number"||typeof q=="boolean"?(w.__data[0]=q,i.bufferSubData(i.UNIFORM_BUFFER,L+G,w.__data)):q.isMatrix3?(w.__data[0]=q.elements[0],w.__data[1]=q.elements[1],w.__data[2]=q.elements[2],w.__data[3]=0,w.__data[4]=q.elements[3],w.__data[5]=q.elements[4],w.__data[6]=q.elements[5],w.__data[7]=0,w.__data[8]=q.elements[6],w.__data[9]=q.elements[7],w.__data[10]=q.elements[8],w.__data[11]=0):(q.toArray(w.__data,G),G+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,w.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(x,b,M,P){const A=x.value,C=b+"_"+M;if(P[C]===void 0)return typeof A=="number"||typeof A=="boolean"?P[C]=A:P[C]=A.clone(),!0;{const R=P[C];if(typeof A=="number"||typeof A=="boolean"){if(R!==A)return P[C]=A,!0}else if(R.equals(A)===!1)return R.copy(A),!0}return!1}function g(x){const b=x.uniforms;let M=0;const P=16;for(let C=0,R=b.length;C<R;C++){const E=Array.isArray(b[C])?b[C]:[b[C]];for(let S=0,w=E.length;S<w;S++){const L=E[S],N=Array.isArray(L.value)?L.value:[L.value];for(let G=0,V=N.length;G<V;G++){const q=N[G],K=_(q),X=M%P,te=X%K.boundary,Q=X+te;M+=te,Q!==0&&P-Q<K.storage&&(M+=P-Q),L.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=M,M+=K.storage}}}const A=M%P;return A>0&&(M+=P-A),x.__size=M,x.__cache={},this}function _(x){const b={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(b.boundary=4,b.storage=4):x.isVector2?(b.boundary=8,b.storage=8):x.isVector3||x.isColor?(b.boundary=16,b.storage=12):x.isVector4?(b.boundary=16,b.storage=16):x.isMatrix3?(b.boundary=48,b.storage=48):x.isMatrix4?(b.boundary=64,b.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),b}function m(x){const b=x.target;b.removeEventListener("dispose",m);const M=o.indexOf(b.__bindingPointIndex);o.splice(M,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function p(){for(const x in s)i.deleteBuffer(s[x]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}class eu{constructor(e={}){const{canvas:t=Nd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const x=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Je,this.toneMapping=li,this.toneMappingExposure=1;const M=this;let P=!1,A=0,C=0,R=null,E=-1,S=null;const w=new et,L=new et;let N=null;const G=new he(0);let V=0,q=t.width,K=t.height,X=1,te=null,Q=null;const ge=new et(0,0,q,K),we=new et(0,0,q,K);let Oe=!1;const Z=new sl;let ee=!1,_e=!1;const ae=new He,Me=new He,Ie=new D,Te=new et,tt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let De=!1;function st(){return R===null?X:1}let B=n;function Tt(T,O){return t.getContext(T,O)}try{const T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Xa}`),t.addEventListener("webglcontextlost",J,!1),t.addEventListener("webglcontextrestored",pe,!1),t.addEventListener("webglcontextcreationerror",fe,!1),B===null){const O="webgl2";if(B=Tt(O,T),B===null)throw Tt(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let je,Ye,Ce,rt,Pe,v,y,I,H,z,W,le,ne,ce,Ne,ie,ve,Re,Le,ye,qe,ze,ot,U;function ue(){je=new Km(B),je.init(),ze=new B0(B,je),Ye=new Xm(B,je,e,ze),Ce=new L0(B,je),Ye.reverseDepthBuffer&&d&&Ce.buffers.depth.setReversed(!0),rt=new eg(B),Pe=new v0,v=new U0(B,je,Ce,Pe,Ye,ze,rt),y=new Ym(M),I=new Zm(M),H=new af(B),ot=new Vm(B,H),z=new Jm(B,H,rt,ot),W=new ng(B,z,H,rt),Le=new tg(B,Ye,v),ie=new jm(Pe),le=new _0(M,y,I,je,Ye,ot,ie),ne=new W0(M,Pe),ce=new x0,Ne=new T0(je),Re=new Gm(M,y,I,Ce,W,f,l),ve=new I0(M,W,Ye),U=new X0(B,rt,Ye,Ce),ye=new Wm(B,je,rt),qe=new Qm(B,je,rt),rt.programs=le.programs,M.capabilities=Ye,M.extensions=je,M.properties=Pe,M.renderLists=ce,M.shadowMap=ve,M.state=Ce,M.info=rt}ue();const $=new G0(M,B);this.xr=$,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){const T=je.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=je.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(T){T!==void 0&&(X=T,this.setSize(q,K,!1))},this.getSize=function(T){return T.set(q,K)},this.setSize=function(T,O,j=!0){if($.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=T,K=O,t.width=Math.floor(T*X),t.height=Math.floor(O*X),j===!0&&(t.style.width=T+"px",t.style.height=O+"px"),this.setViewport(0,0,T,O)},this.getDrawingBufferSize=function(T){return T.set(q*X,K*X).floor()},this.setDrawingBufferSize=function(T,O,j){q=T,K=O,X=j,t.width=Math.floor(T*j),t.height=Math.floor(O*j),this.setViewport(0,0,T,O)},this.getCurrentViewport=function(T){return T.copy(w)},this.getViewport=function(T){return T.copy(ge)},this.setViewport=function(T,O,j,Y){T.isVector4?ge.set(T.x,T.y,T.z,T.w):ge.set(T,O,j,Y),Ce.viewport(w.copy(ge).multiplyScalar(X).round())},this.getScissor=function(T){return T.copy(we)},this.setScissor=function(T,O,j,Y){T.isVector4?we.set(T.x,T.y,T.z,T.w):we.set(T,O,j,Y),Ce.scissor(L.copy(we).multiplyScalar(X).round())},this.getScissorTest=function(){return Oe},this.setScissorTest=function(T){Ce.setScissorTest(Oe=T)},this.setOpaqueSort=function(T){te=T},this.setTransparentSort=function(T){Q=T},this.getClearColor=function(T){return T.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor.apply(Re,arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha.apply(Re,arguments)},this.clear=function(T=!0,O=!0,j=!0){let Y=0;if(T){let F=!1;if(R!==null){const re=R.texture.format;F=re===Qa||re===Ja||re===Ka}if(F){const re=R.texture.type,me=re===Mn||re===wi||re===zs||re===ss||re===$a||re===Za,Se=Re.getClearColor(),be=Re.getClearAlpha(),Fe=Se.r,Ge=Se.g,Ee=Se.b;me?(g[0]=Fe,g[1]=Ge,g[2]=Ee,g[3]=be,B.clearBufferuiv(B.COLOR,0,g)):(_[0]=Fe,_[1]=Ge,_[2]=Ee,_[3]=be,B.clearBufferiv(B.COLOR,0,_))}else Y|=B.COLOR_BUFFER_BIT}O&&(Y|=B.DEPTH_BUFFER_BIT),j&&(Y|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),B.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",J,!1),t.removeEventListener("webglcontextrestored",pe,!1),t.removeEventListener("webglcontextcreationerror",fe,!1),ce.dispose(),Ne.dispose(),Pe.dispose(),y.dispose(),I.dispose(),W.dispose(),ot.dispose(),U.dispose(),le.dispose(),$.dispose(),$.removeEventListener("sessionstart",Ml),$.removeEventListener("sessionend",Sl),di.stop()};function J(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function pe(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;const T=rt.autoReset,O=ve.enabled,j=ve.autoUpdate,Y=ve.needsUpdate,F=ve.type;ue(),rt.autoReset=T,ve.enabled=O,ve.autoUpdate=j,ve.needsUpdate=Y,ve.type=F}function fe(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Ue(T){const O=T.target;O.removeEventListener("dispose",Ue),Mt(O)}function Mt(T){Nt(T),Pe.remove(T)}function Nt(T){const O=Pe.get(T).programs;O!==void 0&&(O.forEach(function(j){le.releaseProgram(j)}),T.isShaderMaterial&&le.releaseShaderCache(T))}this.renderBufferDirect=function(T,O,j,Y,F,re){O===null&&(O=tt);const me=F.isMesh&&F.matrixWorld.determinant()<0,Se=Pu(T,O,j,Y,F);Ce.setMaterial(Y,me);let be=j.index,Fe=1;if(Y.wireframe===!0){if(be=z.getWireframeAttribute(j),be===void 0)return;Fe=2}const Ge=j.drawRange,Ee=j.attributes.position;let Qe=Ge.start*Fe,ft=(Ge.start+Ge.count)*Fe;re!==null&&(Qe=Math.max(Qe,re.start*Fe),ft=Math.min(ft,(re.start+re.count)*Fe)),be!==null?(Qe=Math.max(Qe,0),ft=Math.min(ft,be.count)):Ee!=null&&(Qe=Math.max(Qe,0),ft=Math.min(ft,Ee.count));const mt=ft-Qe;if(mt<0||mt===1/0)return;ot.setup(F,Y,Se,j,be);let Yt,nt=ye;if(be!==null&&(Yt=H.get(be),nt=qe,nt.setIndex(Yt)),F.isMesh)Y.wireframe===!0?(Ce.setLineWidth(Y.wireframeLinewidth*st()),nt.setMode(B.LINES)):nt.setMode(B.TRIANGLES);else if(F.isLine){let Ae=Y.linewidth;Ae===void 0&&(Ae=1),Ce.setLineWidth(Ae*st()),F.isLineSegments?nt.setMode(B.LINES):F.isLineLoop?nt.setMode(B.LINE_LOOP):nt.setMode(B.LINE_STRIP)}else F.isPoints?nt.setMode(B.POINTS):F.isSprite&&nt.setMode(B.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)nt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(je.get("WEBGL_multi_draw"))nt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Ae=F._multiDrawStarts,Ln=F._multiDrawCounts,it=F._multiDrawCount,dn=be?H.get(be).bytesPerElement:1,Ci=Pe.get(Y).currentProgram.getUniforms();for(let $t=0;$t<it;$t++)Ci.setValue(B,"_gl_DrawID",$t),nt.render(Ae[$t]/dn,Ln[$t])}else if(F.isInstancedMesh)nt.renderInstances(Qe,mt,F.count);else if(j.isInstancedBufferGeometry){const Ae=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Ln=Math.min(j.instanceCount,Ae);nt.renderInstances(Qe,mt,Ln)}else nt.render(Qe,mt)};function at(T,O,j){T.transparent===!0&&T.side===ut&&T.forceSinglePass===!1?(T.side=Wt,T.needsUpdate=!0,qs(T,O,j),T.side=Zn,T.needsUpdate=!0,qs(T,O,j),T.side=ut):qs(T,O,j)}this.compile=function(T,O,j=null){j===null&&(j=T),p=Ne.get(j),p.init(O),b.push(p),j.traverseVisible(function(F){F.isLight&&F.layers.test(O.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),T!==j&&T.traverseVisible(function(F){F.isLight&&F.layers.test(O.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),p.setupLights();const Y=new Set;return T.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const re=F.material;if(re)if(Array.isArray(re))for(let me=0;me<re.length;me++){const Se=re[me];at(Se,j,F),Y.add(Se)}else at(re,j,F),Y.add(re)}),b.pop(),p=null,Y},this.compileAsync=function(T,O,j=null){const Y=this.compile(T,O,j);return new Promise(F=>{function re(){if(Y.forEach(function(me){Pe.get(me).currentProgram.isReady()&&Y.delete(me)}),Y.size===0){F(T);return}setTimeout(re,10)}je.get("KHR_parallel_shader_compile")!==null?re():setTimeout(re,10)})};let un=null;function Dn(T){un&&un(T)}function Ml(){di.stop()}function Sl(){di.start()}const di=new qh;di.setAnimationLoop(Dn),typeof self<"u"&&di.setContext(self),this.setAnimationLoop=function(T){un=T,$.setAnimationLoop(T),T===null?di.stop():di.start()},$.addEventListener("sessionstart",Ml),$.addEventListener("sessionend",Sl),this.render=function(T,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),$.enabled===!0&&$.isPresenting===!0&&($.cameraAutoUpdate===!0&&$.updateCamera(O),O=$.getCamera()),T.isScene===!0&&T.onBeforeRender(M,T,O,R),p=Ne.get(T,b.length),p.init(O),b.push(p),Me.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Z.setFromProjectionMatrix(Me),_e=this.localClippingEnabled,ee=ie.init(this.clippingPlanes,_e),m=ce.get(T,x.length),m.init(),x.push(m),$.enabled===!0&&$.isPresenting===!0){const re=M.xr.getDepthSensingMesh();re!==null&&to(re,O,-1/0,M.sortObjects)}to(T,O,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(te,Q),De=$.enabled===!1||$.isPresenting===!1||$.hasDepthSensing()===!1,De&&Re.addToRenderList(m,T),this.info.render.frame++,ee===!0&&ie.beginShadows();const j=p.state.shadowsArray;ve.render(j,T,O),ee===!0&&ie.endShadows(),this.info.autoReset===!0&&this.info.reset();const Y=m.opaque,F=m.transmissive;if(p.setupLights(),O.isArrayCamera){const re=O.cameras;if(F.length>0)for(let me=0,Se=re.length;me<Se;me++){const be=re[me];El(Y,F,T,be)}De&&Re.render(T);for(let me=0,Se=re.length;me<Se;me++){const be=re[me];bl(m,T,be,be.viewport)}}else F.length>0&&El(Y,F,T,O),De&&Re.render(T),bl(m,T,O);R!==null&&(v.updateMultisampleRenderTarget(R),v.updateRenderTargetMipmap(R)),T.isScene===!0&&T.onAfterRender(M,T,O),ot.resetDefaultState(),E=-1,S=null,b.pop(),b.length>0?(p=b[b.length-1],ee===!0&&ie.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function to(T,O,j,Y){if(T.visible===!1)return;if(T.layers.test(O.layers)){if(T.isGroup)j=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(O);else if(T.isLight)p.pushLight(T),T.castShadow&&p.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Z.intersectsSprite(T)){Y&&Te.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Me);const me=W.update(T),Se=T.material;Se.visible&&m.push(T,me,Se,j,Te.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Z.intersectsObject(T))){const me=W.update(T),Se=T.material;if(Y&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Te.copy(T.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Te.copy(me.boundingSphere.center)),Te.applyMatrix4(T.matrixWorld).applyMatrix4(Me)),Array.isArray(Se)){const be=me.groups;for(let Fe=0,Ge=be.length;Fe<Ge;Fe++){const Ee=be[Fe],Qe=Se[Ee.materialIndex];Qe&&Qe.visible&&m.push(T,me,Qe,j,Te.z,Ee)}}else Se.visible&&m.push(T,me,Se,j,Te.z,null)}}const re=T.children;for(let me=0,Se=re.length;me<Se;me++)to(re[me],O,j,Y)}function bl(T,O,j,Y){const F=T.opaque,re=T.transmissive,me=T.transparent;p.setupLightsView(j),ee===!0&&ie.setGlobalState(M.clippingPlanes,j),Y&&Ce.viewport(w.copy(Y)),F.length>0&&Ys(F,O,j),re.length>0&&Ys(re,O,j),me.length>0&&Ys(me,O,j),Ce.buffers.depth.setTest(!0),Ce.buffers.depth.setMask(!0),Ce.buffers.color.setMask(!0),Ce.setPolygonOffset(!1)}function El(T,O,j,Y){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[Y.id]===void 0&&(p.state.transmissionRenderTarget[Y.id]=new en(1,1,{generateMipmaps:!0,type:je.has("EXT_color_buffer_half_float")||je.has("EXT_color_buffer_float")?qn:Mn,minFilter:Xn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace}));const re=p.state.transmissionRenderTarget[Y.id],me=Y.viewport||w;re.setSize(me.z,me.w);const Se=M.getRenderTarget();M.setRenderTarget(re),M.getClearColor(G),V=M.getClearAlpha(),V<1&&M.setClearColor(16777215,.5),M.clear(),De&&Re.render(j);const be=M.toneMapping;M.toneMapping=li;const Fe=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),p.setupLightsView(Y),ee===!0&&ie.setGlobalState(M.clippingPlanes,Y),Ys(T,j,Y),v.updateMultisampleRenderTarget(re),v.updateRenderTargetMipmap(re),je.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let Ee=0,Qe=O.length;Ee<Qe;Ee++){const ft=O[Ee],mt=ft.object,Yt=ft.geometry,nt=ft.material,Ae=ft.group;if(nt.side===ut&&mt.layers.test(Y.layers)){const Ln=nt.side;nt.side=Wt,nt.needsUpdate=!0,wl(mt,j,Y,Yt,nt,Ae),nt.side=Ln,nt.needsUpdate=!0,Ge=!0}}Ge===!0&&(v.updateMultisampleRenderTarget(re),v.updateRenderTargetMipmap(re))}M.setRenderTarget(Se),M.setClearColor(G,V),Fe!==void 0&&(Y.viewport=Fe),M.toneMapping=be}function Ys(T,O,j){const Y=O.isScene===!0?O.overrideMaterial:null;for(let F=0,re=T.length;F<re;F++){const me=T[F],Se=me.object,be=me.geometry,Fe=Y===null?me.material:Y,Ge=me.group;Se.layers.test(j.layers)&&wl(Se,O,j,be,Fe,Ge)}}function wl(T,O,j,Y,F,re){T.onBeforeRender(M,O,j,Y,F,re),T.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),F.onBeforeRender(M,O,j,Y,T,re),F.transparent===!0&&F.side===ut&&F.forceSinglePass===!1?(F.side=Wt,F.needsUpdate=!0,M.renderBufferDirect(j,O,Y,F,T,re),F.side=Zn,F.needsUpdate=!0,M.renderBufferDirect(j,O,Y,F,T,re),F.side=ut):M.renderBufferDirect(j,O,Y,F,T,re),T.onAfterRender(M,O,j,Y,F,re)}function qs(T,O,j){O.isScene!==!0&&(O=tt);const Y=Pe.get(T),F=p.state.lights,re=p.state.shadowsArray,me=F.state.version,Se=le.getParameters(T,F.state,re,O,j),be=le.getProgramCacheKey(Se);let Fe=Y.programs;Y.environment=T.isMeshStandardMaterial?O.environment:null,Y.fog=O.fog,Y.envMap=(T.isMeshStandardMaterial?I:y).get(T.envMap||Y.environment),Y.envMapRotation=Y.environment!==null&&T.envMap===null?O.environmentRotation:T.envMapRotation,Fe===void 0&&(T.addEventListener("dispose",Ue),Fe=new Map,Y.programs=Fe);let Ge=Fe.get(be);if(Ge!==void 0){if(Y.currentProgram===Ge&&Y.lightsStateVersion===me)return Al(T,Se),Ge}else Se.uniforms=le.getUniforms(T),T.onBeforeCompile(Se,M),Ge=le.acquireProgram(Se,be),Fe.set(be,Ge),Y.uniforms=Se.uniforms;const Ee=Y.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ee.clippingPlanes=ie.uniform),Al(T,Se),Y.needsLights=Du(T),Y.lightsStateVersion=me,Y.needsLights&&(Ee.ambientLightColor.value=F.state.ambient,Ee.lightProbe.value=F.state.probe,Ee.directionalLights.value=F.state.directional,Ee.directionalLightShadows.value=F.state.directionalShadow,Ee.spotLights.value=F.state.spot,Ee.spotLightShadows.value=F.state.spotShadow,Ee.rectAreaLights.value=F.state.rectArea,Ee.ltc_1.value=F.state.rectAreaLTC1,Ee.ltc_2.value=F.state.rectAreaLTC2,Ee.pointLights.value=F.state.point,Ee.pointLightShadows.value=F.state.pointShadow,Ee.hemisphereLights.value=F.state.hemi,Ee.directionalShadowMap.value=F.state.directionalShadowMap,Ee.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ee.spotShadowMap.value=F.state.spotShadowMap,Ee.spotLightMatrix.value=F.state.spotLightMatrix,Ee.spotLightMap.value=F.state.spotLightMap,Ee.pointShadowMap.value=F.state.pointShadowMap,Ee.pointShadowMatrix.value=F.state.pointShadowMatrix),Y.currentProgram=Ge,Y.uniformsList=null,Ge}function Tl(T){if(T.uniformsList===null){const O=T.currentProgram.getUniforms();T.uniformsList=Nr.seqWithValue(O.seq,T.uniforms)}return T.uniformsList}function Al(T,O){const j=Pe.get(T);j.outputColorSpace=O.outputColorSpace,j.batching=O.batching,j.batchingColor=O.batchingColor,j.instancing=O.instancing,j.instancingColor=O.instancingColor,j.instancingMorph=O.instancingMorph,j.skinning=O.skinning,j.morphTargets=O.morphTargets,j.morphNormals=O.morphNormals,j.morphColors=O.morphColors,j.morphTargetsCount=O.morphTargetsCount,j.numClippingPlanes=O.numClippingPlanes,j.numIntersection=O.numClipIntersection,j.vertexAlphas=O.vertexAlphas,j.vertexTangents=O.vertexTangents,j.toneMapping=O.toneMapping}function Pu(T,O,j,Y,F){O.isScene!==!0&&(O=tt),v.resetTextureUnits();const re=O.fog,me=Y.isMeshStandardMaterial?O.environment:null,Se=R===null?M.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:jt,be=(Y.isMeshStandardMaterial?I:y).get(Y.envMap||me),Fe=Y.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,Ge=!!j.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Ee=!!j.morphAttributes.position,Qe=!!j.morphAttributes.normal,ft=!!j.morphAttributes.color;let mt=li;Y.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(mt=M.toneMapping);const Yt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,nt=Yt!==void 0?Yt.length:0,Ae=Pe.get(Y),Ln=p.state.lights;if(ee===!0&&(_e===!0||T!==S)){const sn=T===S&&Y.id===E;ie.setState(Y,T,sn)}let it=!1;Y.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==Ln.state.version||Ae.outputColorSpace!==Se||F.isBatchedMesh&&Ae.batching===!1||!F.isBatchedMesh&&Ae.batching===!0||F.isBatchedMesh&&Ae.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ae.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ae.instancing===!1||!F.isInstancedMesh&&Ae.instancing===!0||F.isSkinnedMesh&&Ae.skinning===!1||!F.isSkinnedMesh&&Ae.skinning===!0||F.isInstancedMesh&&Ae.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ae.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ae.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ae.instancingMorph===!1&&F.morphTexture!==null||Ae.envMap!==be||Y.fog===!0&&Ae.fog!==re||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==ie.numPlanes||Ae.numIntersection!==ie.numIntersection)||Ae.vertexAlphas!==Fe||Ae.vertexTangents!==Ge||Ae.morphTargets!==Ee||Ae.morphNormals!==Qe||Ae.morphColors!==ft||Ae.toneMapping!==mt||Ae.morphTargetsCount!==nt)&&(it=!0):(it=!0,Ae.__version=Y.version);let dn=Ae.currentProgram;it===!0&&(dn=qs(Y,O,F));let Ci=!1,$t=!1,ys=!1;const gt=dn.getUniforms(),Tn=Ae.uniforms;if(Ce.useProgram(dn.program)&&(Ci=!0,$t=!0,ys=!0),Y.id!==E&&(E=Y.id,$t=!0),Ci||S!==T){Ce.buffers.depth.getReversed()?(ae.copy(T.projectionMatrix),Bd(ae),Od(ae),gt.setValue(B,"projectionMatrix",ae)):gt.setValue(B,"projectionMatrix",T.projectionMatrix),gt.setValue(B,"viewMatrix",T.matrixWorldInverse);const Kn=gt.map.cameraPosition;Kn!==void 0&&Kn.setValue(B,Ie.setFromMatrixPosition(T.matrixWorld)),Ye.logarithmicDepthBuffer&&gt.setValue(B,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&gt.setValue(B,"isOrthographic",T.isOrthographicCamera===!0),S!==T&&(S=T,$t=!0,ys=!0)}if(F.isSkinnedMesh){gt.setOptional(B,F,"bindMatrix"),gt.setOptional(B,F,"bindMatrixInverse");const sn=F.skeleton;sn&&(sn.boneTexture===null&&sn.computeBoneTexture(),gt.setValue(B,"boneTexture",sn.boneTexture,v))}F.isBatchedMesh&&(gt.setOptional(B,F,"batchingTexture"),gt.setValue(B,"batchingTexture",F._matricesTexture,v),gt.setOptional(B,F,"batchingIdTexture"),gt.setValue(B,"batchingIdTexture",F._indirectTexture,v),gt.setOptional(B,F,"batchingColorTexture"),F._colorsTexture!==null&&gt.setValue(B,"batchingColorTexture",F._colorsTexture,v));const xs=j.morphAttributes;if((xs.position!==void 0||xs.normal!==void 0||xs.color!==void 0)&&Le.update(F,j,dn),($t||Ae.receiveShadow!==F.receiveShadow)&&(Ae.receiveShadow=F.receiveShadow,gt.setValue(B,"receiveShadow",F.receiveShadow)),Y.isMeshGouraudMaterial&&Y.envMap!==null&&(Tn.envMap.value=be,Tn.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),Y.isMeshStandardMaterial&&Y.envMap===null&&O.environment!==null&&(Tn.envMapIntensity.value=O.environmentIntensity),$t&&(gt.setValue(B,"toneMappingExposure",M.toneMappingExposure),Ae.needsLights&&Iu(Tn,ys),re&&Y.fog===!0&&ne.refreshFogUniforms(Tn,re),ne.refreshMaterialUniforms(Tn,Y,X,K,p.state.transmissionRenderTarget[T.id]),Nr.upload(B,Tl(Ae),Tn,v)),Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(Nr.upload(B,Tl(Ae),Tn,v),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&gt.setValue(B,"center",F.center),gt.setValue(B,"modelViewMatrix",F.modelViewMatrix),gt.setValue(B,"normalMatrix",F.normalMatrix),gt.setValue(B,"modelMatrix",F.matrixWorld),Y.isShaderMaterial||Y.isRawShaderMaterial){const sn=Y.uniformsGroups;for(let Kn=0,Jn=sn.length;Kn<Jn;Kn++){const Rl=sn[Kn];U.update(Rl,dn),U.bind(Rl,dn)}}return dn}function Iu(T,O){T.ambientLightColor.needsUpdate=O,T.lightProbe.needsUpdate=O,T.directionalLights.needsUpdate=O,T.directionalLightShadows.needsUpdate=O,T.pointLights.needsUpdate=O,T.pointLightShadows.needsUpdate=O,T.spotLights.needsUpdate=O,T.spotLightShadows.needsUpdate=O,T.rectAreaLights.needsUpdate=O,T.hemisphereLights.needsUpdate=O}function Du(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(T,O,j){Pe.get(T.texture).__webglTexture=O,Pe.get(T.depthTexture).__webglTexture=j;const Y=Pe.get(T);Y.__hasExternalTextures=!0,Y.__autoAllocateDepthBuffer=j===void 0,Y.__autoAllocateDepthBuffer||je.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Y.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,O){const j=Pe.get(T);j.__webglFramebuffer=O,j.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(T,O=0,j=0){R=T,A=O,C=j;let Y=!0,F=null,re=!1,me=!1;if(T){const be=Pe.get(T);if(be.__useDefaultFramebuffer!==void 0)Ce.bindFramebuffer(B.FRAMEBUFFER,null),Y=!1;else if(be.__webglFramebuffer===void 0)v.setupRenderTarget(T);else if(be.__hasExternalTextures)v.rebindTextures(T,Pe.get(T.texture).__webglTexture,Pe.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const Ee=T.depthTexture;if(be.__boundDepthTexture!==Ee){if(Ee!==null&&Pe.has(Ee)&&(T.width!==Ee.image.width||T.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");v.setupDepthRenderbuffer(T)}}const Fe=T.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(me=!0);const Ge=Pe.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ge[O])?F=Ge[O][j]:F=Ge[O],re=!0):T.samples>0&&v.useMultisampledRTT(T)===!1?F=Pe.get(T).__webglMultisampledFramebuffer:Array.isArray(Ge)?F=Ge[j]:F=Ge,w.copy(T.viewport),L.copy(T.scissor),N=T.scissorTest}else w.copy(ge).multiplyScalar(X).floor(),L.copy(we).multiplyScalar(X).floor(),N=Oe;if(Ce.bindFramebuffer(B.FRAMEBUFFER,F)&&Y&&Ce.drawBuffers(T,F),Ce.viewport(w),Ce.scissor(L),Ce.setScissorTest(N),re){const be=Pe.get(T.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+O,be.__webglTexture,j)}else if(me){const be=Pe.get(T.texture),Fe=O||0;B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,be.__webglTexture,j||0,Fe)}E=-1},this.readRenderTargetPixels=function(T,O,j,Y,F,re,me){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=Pe.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&me!==void 0&&(Se=Se[me]),Se){Ce.bindFramebuffer(B.FRAMEBUFFER,Se);try{const be=T.texture,Fe=be.format,Ge=be.type;if(!Ye.textureFormatReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ye.textureTypeReadable(Ge)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=T.width-Y&&j>=0&&j<=T.height-F&&B.readPixels(O,j,Y,F,ze.convert(Fe),ze.convert(Ge),re)}finally{const be=R!==null?Pe.get(R).__webglFramebuffer:null;Ce.bindFramebuffer(B.FRAMEBUFFER,be)}}},this.readRenderTargetPixelsAsync=async function(T,O,j,Y,F,re,me){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=Pe.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&me!==void 0&&(Se=Se[me]),Se){const be=T.texture,Fe=be.format,Ge=be.type;if(!Ye.textureFormatReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ye.textureTypeReadable(Ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(O>=0&&O<=T.width-Y&&j>=0&&j<=T.height-F){Ce.bindFramebuffer(B.FRAMEBUFFER,Se);const Ee=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,Ee),B.bufferData(B.PIXEL_PACK_BUFFER,re.byteLength,B.STREAM_READ),B.readPixels(O,j,Y,F,ze.convert(Fe),ze.convert(Ge),0);const Qe=R!==null?Pe.get(R).__webglFramebuffer:null;Ce.bindFramebuffer(B.FRAMEBUFFER,Qe);const ft=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Ud(B,ft,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,Ee),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,re),B.deleteBuffer(Ee),B.deleteSync(ft),re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,O=null,j=0){T.isTexture!==!0&&(Ds("WebGLRenderer: copyFramebufferToTexture function signature has changed."),O=arguments[0]||null,T=arguments[1]);const Y=Math.pow(2,-j),F=Math.floor(T.image.width*Y),re=Math.floor(T.image.height*Y),me=O!==null?O.x:0,Se=O!==null?O.y:0;v.setTexture2D(T,0),B.copyTexSubImage2D(B.TEXTURE_2D,j,0,0,me,Se,F,re),Ce.unbindTexture()},this.copyTextureToTexture=function(T,O,j=null,Y=null,F=0){T.isTexture!==!0&&(Ds("WebGLRenderer: copyTextureToTexture function signature has changed."),Y=arguments[0]||null,T=arguments[1],O=arguments[2],F=arguments[3]||0,j=null);let re,me,Se,be,Fe,Ge,Ee,Qe,ft;const mt=T.isCompressedTexture?T.mipmaps[F]:T.image;j!==null?(re=j.max.x-j.min.x,me=j.max.y-j.min.y,Se=j.isBox3?j.max.z-j.min.z:1,be=j.min.x,Fe=j.min.y,Ge=j.isBox3?j.min.z:0):(re=mt.width,me=mt.height,Se=mt.depth||1,be=0,Fe=0,Ge=0),Y!==null?(Ee=Y.x,Qe=Y.y,ft=Y.z):(Ee=0,Qe=0,ft=0);const Yt=ze.convert(O.format),nt=ze.convert(O.type);let Ae;O.isData3DTexture?(v.setTexture3D(O,0),Ae=B.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(v.setTexture2DArray(O,0),Ae=B.TEXTURE_2D_ARRAY):(v.setTexture2D(O,0),Ae=B.TEXTURE_2D),B.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,O.flipY),B.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),B.pixelStorei(B.UNPACK_ALIGNMENT,O.unpackAlignment);const Ln=B.getParameter(B.UNPACK_ROW_LENGTH),it=B.getParameter(B.UNPACK_IMAGE_HEIGHT),dn=B.getParameter(B.UNPACK_SKIP_PIXELS),Ci=B.getParameter(B.UNPACK_SKIP_ROWS),$t=B.getParameter(B.UNPACK_SKIP_IMAGES);B.pixelStorei(B.UNPACK_ROW_LENGTH,mt.width),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,mt.height),B.pixelStorei(B.UNPACK_SKIP_PIXELS,be),B.pixelStorei(B.UNPACK_SKIP_ROWS,Fe),B.pixelStorei(B.UNPACK_SKIP_IMAGES,Ge);const ys=T.isDataArrayTexture||T.isData3DTexture,gt=O.isDataArrayTexture||O.isData3DTexture;if(T.isRenderTargetTexture||T.isDepthTexture){const Tn=Pe.get(T),xs=Pe.get(O),sn=Pe.get(Tn.__renderTarget),Kn=Pe.get(xs.__renderTarget);Ce.bindFramebuffer(B.READ_FRAMEBUFFER,sn.__webglFramebuffer),Ce.bindFramebuffer(B.DRAW_FRAMEBUFFER,Kn.__webglFramebuffer);for(let Jn=0;Jn<Se;Jn++)ys&&B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Pe.get(T).__webglTexture,F,Ge+Jn),T.isDepthTexture?(gt&&B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Pe.get(O).__webglTexture,F,ft+Jn),B.blitFramebuffer(be,Fe,re,me,Ee,Qe,re,me,B.DEPTH_BUFFER_BIT,B.NEAREST)):gt?B.copyTexSubImage3D(Ae,F,Ee,Qe,ft+Jn,be,Fe,re,me):B.copyTexSubImage2D(Ae,F,Ee,Qe,ft+Jn,be,Fe,re,me);Ce.bindFramebuffer(B.READ_FRAMEBUFFER,null),Ce.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else gt?T.isDataTexture||T.isData3DTexture?B.texSubImage3D(Ae,F,Ee,Qe,ft,re,me,Se,Yt,nt,mt.data):O.isCompressedArrayTexture?B.compressedTexSubImage3D(Ae,F,Ee,Qe,ft,re,me,Se,Yt,mt.data):B.texSubImage3D(Ae,F,Ee,Qe,ft,re,me,Se,Yt,nt,mt):T.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,F,Ee,Qe,re,me,Yt,nt,mt.data):T.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,F,Ee,Qe,mt.width,mt.height,Yt,mt.data):B.texSubImage2D(B.TEXTURE_2D,F,Ee,Qe,re,me,Yt,nt,mt);B.pixelStorei(B.UNPACK_ROW_LENGTH,Ln),B.pixelStorei(B.UNPACK_IMAGE_HEIGHT,it),B.pixelStorei(B.UNPACK_SKIP_PIXELS,dn),B.pixelStorei(B.UNPACK_SKIP_ROWS,Ci),B.pixelStorei(B.UNPACK_SKIP_IMAGES,$t),F===0&&O.generateMipmaps&&B.generateMipmap(Ae),Ce.unbindTexture()},this.copyTextureToTexture3D=function(T,O,j=null,Y=null,F=0){return T.isTexture!==!0&&(Ds("WebGLRenderer: copyTextureToTexture3D function signature has changed."),j=arguments[0]||null,Y=arguments[1]||null,T=arguments[2],O=arguments[3],F=arguments[4]||0),Ds('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(T,O,j,Y,F)},this.initRenderTarget=function(T){Pe.get(T).__webglFramebuffer===void 0&&v.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?v.setTextureCube(T,0):T.isData3DTexture?v.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?v.setTexture2DArray(T,0):v.setTexture2D(T,0),Ce.unbindTexture()},this.resetState=function(){A=0,C=0,R=null,Ce.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}}class ol extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nn,this.environmentIntensity=1,this.environmentRotation=new nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class j0{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ua,this.updateRanges=[],this.version=0,this.uuid=xn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ht=new D;class al{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ht.fromBufferAttribute(this,t),Ht.applyMatrix4(e),this.setXYZ(t,Ht.x,Ht.y,Ht.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ht.fromBufferAttribute(this,t),Ht.applyNormalMatrix(e),this.setXYZ(t,Ht.x,Ht.y,Ht.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ht.fromBufferAttribute(this,t),Ht.transformDirection(e),this.setXYZ(t,Ht.x,Ht.y,Ht.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ct(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=gn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=gn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=gn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=gn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),s=ct(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),s=ct(s,this.array),r=ct(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new pt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new al(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Cc=new D,Pc=new et,Ic=new et,Y0=new D,Dc=new He,mr=new D,Io=new wn,Lc=new He,Do=new ms;class q0 extends oe{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Dl,this.bindMatrix=new He,this.bindMatrixInverse=new He,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new bn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,mr),this.boundingBox.expandByPoint(mr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new wn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,mr),this.boundingSphere.expandByPoint(mr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Io.copy(this.boundingSphere),Io.applyMatrix4(s),e.ray.intersectsSphere(Io)!==!1&&(Lc.copy(s).invert(),Do.copy(e.ray).applyMatrix4(Lc),!(this.boundingBox!==null&&Do.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Do)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new et,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Dl?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===rd?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;Pc.fromBufferAttribute(s.attributes.skinIndex,e),Ic.fromBufferAttribute(s.attributes.skinWeight,e),Cc.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=Ic.getComponent(r);if(o!==0){const a=Pc.getComponent(r);Dc.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Y0.copy(Cc).applyMatrix4(Dc),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class tu extends vt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class nu extends Rt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Xt,u=Xt,h,d){super(null,o,a,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Nc=new He,$0=new He;class ll{constructor(e=[],t=[]){this.uuid=xn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new He)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new He;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:$0;Nc.multiplyMatrices(a,t[r]),Nc.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new ll(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new nu(t,e,e,hn,vn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new tu),this.bones.push(o),this.boneInverses.push(new He().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=n[s];e.boneInverses.push(a.toArray())}return e}}class Fa extends pt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Wi=new He,Uc=new He,gr=[],Bc=new bn,Z0=new He,ws=new oe,Ts=new wn;class K0 extends oe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Fa(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Z0)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new bn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Wi),Bc.copy(e.boundingBox).applyMatrix4(Wi),this.boundingBox.union(Bc)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new wn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Wi),Ts.copy(e.boundingSphere).applyMatrix4(Wi),this.boundingSphere.union(Ts)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(ws.geometry=this.geometry,ws.material=this.material,ws.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ts.copy(this.boundingSphere),Ts.applyMatrix4(n),e.ray.intersectsSphere(Ts)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Wi),Uc.multiplyMatrices(n,Wi),ws.matrixWorld=Uc,ws.raycast(e,gr);for(let o=0,a=gr.length;o<a;o++){const l=gr[o];l.instanceId=r,l.object=this,t.push(l)}gr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Fa(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new nu(new Float32Array(s*this.count),s,this.count,qr,vn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Ji extends tn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new he(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Hr=new D,Gr=new D,Oc=new He,As=new ms,_r=new wn,Lo=new D,Fc=new D;class cl extends vt{constructor(e=new St,t=new Ji){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Hr.fromBufferAttribute(t,s-1),Gr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Hr.distanceTo(Gr);e.setAttribute("lineDistance",new Ke(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_r.copy(n.boundingSphere),_r.applyMatrix4(s),_r.radius+=r,e.ray.intersectsSphere(_r)===!1)return;Oc.copy(s).invert(),As.copy(e.ray).applyMatrix4(Oc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=u.getX(_),x=u.getX(_+1),b=vr(this,e,As,l,p,x);b&&t.push(b)}if(this.isLineLoop){const _=u.getX(g-1),m=u.getX(f),p=vr(this,e,As,l,_,m);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=vr(this,e,As,l,_,_+1);p&&t.push(p)}if(this.isLineLoop){const _=vr(this,e,As,l,g-1,f);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function vr(i,e,t,n,s,r){const o=i.geometry.attributes.position;if(Hr.fromBufferAttribute(o,s),Gr.fromBufferAttribute(o,r),t.distanceSqToSegment(Hr,Gr,Lo,Fc)>n)return;Lo.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Lo);if(!(l<e.near||l>e.far))return{distance:l,point:Fc.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const kc=new D,zc=new D;class Vr extends cl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)kc.fromBufferAttribute(t,s),zc.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+kc.distanceTo(zc);e.setAttribute("lineDistance",new Ke(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class J0 extends cl{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class bi extends tn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new he(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Hc=new He,ka=new ms,yr=new wn,xr=new D;class Os extends vt{constructor(e=new St,t=new bi){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),yr.copy(n.boundingSphere),yr.applyMatrix4(s),yr.radius+=r,e.ray.intersectsSphere(yr)===!1)return;Hc.copy(s).invert(),ka.copy(e.ray).applyMatrix4(Hc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,_=f;g<_;g++){const m=c.getX(g);xr.fromBufferAttribute(h,m),Gc(xr,m,l,s,e,t,this)}}else{const d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let g=d,_=f;g<_;g++)xr.fromBufferAttribute(h,g),Gc(xr,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Gc(i,e,t,n,s,r,o){const a=ka.distanceSqToPoint(i);if(a<t){const l=new D;ka.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class En extends Rt{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class hl extends St{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new D,u=new xe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){const f=n+h/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new Ke(o,3)),this.setAttribute("normal",new Ke(a,3)),this.setAttribute("uv",new Ke(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new hl(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class yt extends St{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],f=[];let g=0;const _=[],m=n/2;let p=0;x(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new Ke(h,3)),this.setAttribute("normal",new Ke(d,3)),this.setAttribute("uv",new Ke(f,2));function x(){const M=new D,P=new D;let A=0;const C=(t-e)/n;for(let R=0;R<=r;R++){const E=[],S=R/r,w=S*(t-e)+e;for(let L=0;L<=s;L++){const N=L/s,G=N*l+a,V=Math.sin(G),q=Math.cos(G);P.x=w*V,P.y=-S*n+m,P.z=w*q,h.push(P.x,P.y,P.z),M.set(V,C,q).normalize(),d.push(M.x,M.y,M.z),f.push(N,1-S),E.push(g++)}_.push(E)}for(let R=0;R<s;R++)for(let E=0;E<r;E++){const S=_[E][R],w=_[E+1][R],L=_[E+1][R+1],N=_[E][R+1];(e>0||E!==0)&&(u.push(S,w,N),A+=3),(t>0||E!==r-1)&&(u.push(w,L,N),A+=3)}c.addGroup(p,A,0),p+=A}function b(M){const P=g,A=new xe,C=new D;let R=0;const E=M===!0?e:t,S=M===!0?1:-1;for(let L=1;L<=s;L++)h.push(0,m*S,0),d.push(0,S,0),f.push(.5,.5),g++;const w=g;for(let L=0;L<=s;L++){const G=L/s*l+a,V=Math.cos(G),q=Math.sin(G);C.x=E*q,C.y=m*S,C.z=E*V,h.push(C.x,C.y,C.z),d.push(0,S,0),A.x=V*.5+.5,A.y=q*.5*S+.5,f.push(A.x,A.y),g++}for(let L=0;L<s;L++){const N=P+L,G=w+L;M===!0?u.push(G,G+1,N):u.push(G+1,G,N),R+=3}c.addGroup(p,R,M===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ul extends yt{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new ul(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ui extends St{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],u=[];let h=e;const d=(t-e)/s,f=new D,g=new xe;for(let _=0;_<=s;_++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<s;_++){const m=_*(n+1);for(let p=0;p<n;p++){const x=p+m,b=x,M=x+n+1,P=x+n+2,A=x+1;a.push(b,M,A),a.push(M,P,A)}}this.setIndex(a),this.setAttribute("position",new Ke(l,3)),this.setAttribute("normal",new Ke(c,3)),this.setAttribute("uv",new Ke(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ui(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ls extends St{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],h=new D,d=new D,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const x=[],b=p/n;let M=0;p===0&&o===0?M=.5/t:p===n&&l===Math.PI&&(M=-.5/t);for(let P=0;P<=t;P++){const A=P/t;h.x=-e*Math.cos(s+A*r)*Math.sin(o+b*a),h.y=e*Math.cos(o+b*a),h.z=e*Math.sin(s+A*r)*Math.sin(o+b*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(A+M,1-b),x.push(c++)}u.push(x)}for(let p=0;p<n;p++)for(let x=0;x<t;x++){const b=u[p][x+1],M=u[p][x],P=u[p+1][x],A=u[p+1][x+1];(p!==0||o>0)&&f.push(b,M,A),(p!==n-1||l<Math.PI)&&f.push(M,P,A)}this.setIndex(f),this.setAttribute("position",new Ke(g,3)),this.setAttribute("normal",new Ke(_,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ls(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class ci extends St{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const o=[],a=[],l=[],c=[],u=new D,h=new D,d=new D;for(let f=0;f<=n;f++)for(let g=0;g<=s;g++){const _=g/s*r,m=f/n*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(_),h.y=(e+t*Math.cos(m))*Math.sin(_),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(g/s),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=s;g++){const _=(s+1)*f+g-1,m=(s+1)*(f-1)+g-1,p=(s+1)*(f-1)+g,x=(s+1)*f+g;o.push(_,m,x),o.push(m,p,x)}this.setIndex(o),this.setAttribute("position",new Ke(a,3)),this.setAttribute("normal",new Ke(l,3)),this.setAttribute("uv",new Ke(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ci(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Q0 extends zt{static get type(){return"RawShaderMaterial"}constructor(e){super(e),this.isRawShaderMaterial=!0}}class wt extends tn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new he(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new he(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=el,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class _t extends wt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new xe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Lt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new he(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new he(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new he(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class e_ extends tn{static get type(){return"MeshPhongMaterial"}constructor(e){super(),this.isMeshPhongMaterial=!0,this.color=new he(16777215),this.specular=new he(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new he(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=el,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=ja,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}function Mr(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function t_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function n_(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Vc(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=i[a+l]}return s}function iu(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}class js{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class i_ extends js{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ll,endingEnd:Ll}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Nl:r=e,a=2*t-n;break;case Ul:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Nl:o=e,l=2*n-t;break;case Ul:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}const c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,x=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,b=(-1-f)*m+(1.5+f)*_+.5*g,M=f*m-f*_;for(let P=0;P!==a;++P)r[P]=p*o[u+P]+x*o[c+P]+b*o[l+P]+M*o[h+P];return r}}class s_ extends js{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(s-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[c+d]*h+o[l+d]*u;return r}}class r_ extends js{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class In{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Mr(t,this.TimeBufferType),this.values=Mr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Mr(e.times,Array),values:Mr(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new r_(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new s_(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new i_(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Hs:t=this.InterpolantFactoryMethodDiscrete;break;case Gs:t=this.InterpolantFactoryMethodLinear;break;case no:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hs;case this.InterpolantFactoryMethodLinear:return Gs;case this.InterpolantFactoryMethodSmooth:return no}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){const n=this.times,s=n.length;let r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&t_(s))for(let a=0,l=s.length;a!==l;++a){const c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===no,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{const h=a*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){const _=t[h+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}In.prototype.TimeBufferType=Float32Array;In.prototype.ValueBufferType=Float32Array;In.prototype.DefaultInterpolation=Gs;class _s extends In{constructor(e,t,n){super(e,t,n)}}_s.prototype.ValueTypeName="bool";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=Hs;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;class su extends In{}su.prototype.ValueTypeName="color";class cs extends In{}cs.prototype.ValueTypeName="number";class o_ extends js{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t);let c=e*a;for(let u=c+a;c!==u;c+=4)Sn.slerpFlat(r,0,o,c-a,o,c,l);return r}}class hs extends In{InterpolantFactoryMethodLinear(e){return new o_(this.times,this.values,this.getValueSize(),e)}}hs.prototype.ValueTypeName="quaternion";hs.prototype.InterpolantFactoryMethodSmooth=void 0;class vs extends In{constructor(e,t,n){super(e,t,n)}}vs.prototype.ValueTypeName="string";vs.prototype.ValueBufferType=Array;vs.prototype.DefaultInterpolation=Hs;vs.prototype.InterpolantFactoryMethodLinear=void 0;vs.prototype.InterpolantFactoryMethodSmooth=void 0;class us extends In{}us.prototype.ValueTypeName="vector";class a_{constructor(e="",t=-1,n=[],s=od){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=xn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(c_(n[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(In.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const u=n_(l);l=Vc(l,1,u),c=Vc(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new cs(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],u=c.name.match(r);if(u&&u.length>1){const h=u[1];let d=s[h];d||(s[h]=d=[]),d.push(c)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(h,d,f,g,_){if(f.length!==0){const m=[],p=[];iu(f,m,p,g),m.length!==0&&_.push(new h(d,m,p))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let h=0;h<c.length;h++){const d=c[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let _=0;_<d[g].morphTargets.length;_++)f[d[g].morphTargets[_]]=-1;for(const _ in f){const m=[],p=[];for(let x=0;x!==d[g].morphTargets.length;++x){const b=d[g];m.push(b.time),p.push(b.morphTarget===_?1:0)}s.push(new cs(".morphTargetInfluence["+_+"]",m,p))}l=f.length*o}else{const f=".bones["+t[h].name+"]";n(us,f+".position",d,"pos",s),n(hs,f+".quaternion",d,"rot",s),n(us,f+".scale",d,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function l_(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return cs;case"vector":case"vector2":case"vector3":case"vector4":return us;case"color":return su;case"quaternion":return hs;case"bool":case"boolean":return _s;case"string":return vs}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function c_(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=l_(i.type);if(i.times===void 0){const t=[],n=[];iu(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const ai={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class h_{constructor(e,t,n){const s=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){const h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){const f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}}const u_=new h_;class Ai{constructor(e){this.manager=e!==void 0?e:u_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ai.DEFAULT_MATERIAL_NAME="__DEFAULT";const kn={};class d_ extends Error{constructor(e,t){super(e),this.response=t}}class dl extends Ai{constructor(e){super(e)}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=ai.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(kn[e]!==void 0){kn[e].push({onLoad:t,onProgress:n,onError:s});return}kn[e]=[],kn[e].push({onLoad:t,onProgress:n,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const u=kn[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let _=0;const m=new ReadableStream({start(p){x();function x(){h.read().then(({done:b,value:M})=>{if(b)p.close();else{_+=M.byteLength;const P=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let A=0,C=u.length;A<C;A++){const R=u[A];R.onProgress&&R.onProgress(P)}p.enqueue(M),x()}},b=>{p.error(b)})}}});return new Response(m)}else throw new d_(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a===void 0)return c.text();{const h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{ai.add(e,c);const u=kn[e];delete kn[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{const u=kn[e];if(u===void 0)throw this.manager.itemError(e),c;delete kn[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class f_ extends Ai{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=ai.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=Vs("img");function l(){u(),ai.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class p_ extends Ai{constructor(e){super(e)}load(e,t,n,s){const r=new Rt,o=new f_(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class Jr extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new he(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class ru extends Jr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new he(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const No=new He,Wc=new D,Xc=new D;class fl{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new xe(512,512),this.map=null,this.mapPass=null,this.matrix=new He,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new sl,this._frameExtents=new xe(1,1),this._viewportCount=1,this._viewports=[new et(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Wc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Wc),Xc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Xc),t.updateMatrixWorld(),No.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(No),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(No)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class m_ extends fl{constructor(){super(new Ft(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=os*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class g_ extends Jr{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new m_}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const jc=new He,Rs=new D,Uo=new D;class __ extends fl{constructor(){super(new Ft(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new xe(4,2),this._viewportCount=6,this._viewports=[new et(2,1,1,1),new et(0,1,1,1),new et(3,1,1,1),new et(1,1,1,1),new et(3,0,1,1),new et(1,0,1,1)],this._cubeDirections=[new D(1,0,0),new D(-1,0,0),new D(0,0,1),new D(0,0,-1),new D(0,1,0),new D(0,-1,0)],this._cubeUps=[new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,0,1),new D(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Rs.setFromMatrixPosition(e.matrixWorld),n.position.copy(Rs),Uo.copy(n.position),Uo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Uo),n.updateMatrixWorld(),s.makeTranslation(-Rs.x,-Rs.y,-Rs.z),jc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(jc)}}class ou extends Jr{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new __}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class v_ extends fl{constructor(){super(new Zr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Yn extends Jr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new v_}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Fs{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,s=e.length;n<s;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class y_ extends Ai{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=ai.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{s&&s(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ai.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),ai.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});ai.add(e,l),r.manager.itemStart(e)}}class pl{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Yc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Yc();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Yc(){return performance.now()}const ml="\\[\\]\\.:\\/",x_=new RegExp("["+ml+"]","g"),gl="[^"+ml+"]",M_="[^"+ml.replace("\\.","")+"]",S_=/((?:WC+[\/:])*)/.source.replace("WC",gl),b_=/(WCOD+)?/.source.replace("WCOD",M_),E_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",gl),w_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",gl),T_=new RegExp("^"+S_+b_+E_+w_+"$"),A_=["material","materials","bones","map"];class R_{constructor(e,t,n){const s=n||ht.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class ht{constructor(e,t,n){this.path=t,this.parsedPath=n||ht.parseTrackName(t),this.node=ht.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new ht.Composite(e,t,n):new ht(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(x_,"")}static parseTrackName(e){const t=T_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=n.nodeName.substring(s+1);A_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=ht.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[s];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ht.Composite=R_;ht.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ht.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ht.prototype.GetterByBindingType=[ht.prototype._getValue_direct,ht.prototype._getValue_array,ht.prototype._getValue_arrayElement,ht.prototype._getValue_toArray];ht.prototype.SetterByBindingTypeAndVersioning=[[ht.prototype._setValue_direct,ht.prototype._setValue_direct_setNeedsUpdate,ht.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_array,ht.prototype._setValue_array_setNeedsUpdate,ht.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_arrayElement,ht.prototype._setValue_arrayElement_setNeedsUpdate,ht.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_fromArray,ht.prototype._setValue_fromArray_setNeedsUpdate,ht.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const qc=new He;class C_{constructor(e,t,n=0,s=1/0){this.ray=new ms(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new il,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return qc.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(qc),this}intersectObject(e,t=!0,n=[]){return za(e,this,n,t),n.sort($c),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)za(e[s],this,n,t);return n.sort($c),n}}function $c(i,e){return i.distance-e.distance}function za(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)za(r[o],e,t,!0)}}class Zc{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Lt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class P_ extends Ti{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Xa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Xa);function Kc(i,e){if(e===ad)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Na||e===Fh){let t=i.getIndex();if(t===null){const o=[],a=i.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}const n=t.count-2,s=[];if(e===Na)for(let o=1;o<=n;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}class I_ extends Ai{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new B_(t)}),this.register(function(t){return new O_(t)}),this.register(function(t){return new j_(t)}),this.register(function(t){return new Y_(t)}),this.register(function(t){return new q_(t)}),this.register(function(t){return new k_(t)}),this.register(function(t){return new z_(t)}),this.register(function(t){return new H_(t)}),this.register(function(t){return new G_(t)}),this.register(function(t){return new U_(t)}),this.register(function(t){return new V_(t)}),this.register(function(t){return new F_(t)}),this.register(function(t){return new X_(t)}),this.register(function(t){return new W_(t)}),this.register(function(t){return new L_(t)}),this.register(function(t){return new $_(t)}),this.register(function(t){return new Z_(t)})}load(e,t,n,s){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=Fs.extractUrlBase(e);o=Fs.resolveURL(c,this.path)}else o=Fs.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new dl(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r;const o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===au){try{o[$e.KHR_BINARY_GLTF]=new K_(e)}catch(h){s&&s(h);return}r=JSON.parse(o[$e.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new hv(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){const h=r.extensionsUsed[u],d=r.extensionsRequired||[];switch(h){case $e.KHR_MATERIALS_UNLIT:o[h]=new N_;break;case $e.KHR_DRACO_MESH_COMPRESSION:o[h]=new J_(r,this.dracoLoader);break;case $e.KHR_TEXTURE_TRANSFORM:o[h]=new Q_;break;case $e.KHR_MESH_QUANTIZATION:o[h]=new ev;break;default:d.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,s)}parseAsync(e,t){const n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}}function D_(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}const $e={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class L_{constructor(e){this.parser=e,this.name=$e.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let s=t.cache.get(n);if(s)return s;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const u=new he(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],jt);const h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Yn(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new ou(u),c.distance=h;break;case"spot":c=new g_(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,Gn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class N_{constructor(){this.name=$e.KHR_MATERIALS_UNLIT}getMaterialType(){return xt}extendParams(e,t,n){const s=[];e.color=new he(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],jt),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Je))}return Promise.all(s)}}class U_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class B_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new xe(a,a)}return Promise.all(r)}}class O_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class F_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class k_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new he(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],jt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Je)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class z_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class H_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new he().setRGB(a[0],a[1],a[2],jt),Promise.all(r)}}class G_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class V_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new he().setRGB(a[0],a[1],a[2],jt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Je)),Promise.all(r)}}class W_{constructor(e){this.parser=e,this.name=$e.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class X_{constructor(e){this.parser=e,this.name=$e.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:_t}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class j_{constructor(e){this.parser=e,this.name=$e.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;const r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class Y_{constructor(e){this.parser=e,this.name=$e.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class q_{constructor(e){this.parser=e,this.name=$e.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class $_{constructor(e){this.name=$e.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=s.byteOffset||0,c=s.byteLength||0,u=s.count,h=s.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,d,s.mode,s.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(f),u,h,d,s.mode,s.filter),f})})}else return null}}class Z_{constructor(e){this.name=$e.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const s=t.meshes[n.mesh];for(const c of s.primitives)if(c.mode!==ln.TRIANGLES&&c.mode!==ln.TRIANGLE_STRIP&&c.mode!==ln.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const u=c.pop(),h=u.isGroup?u.children:[u],d=c[0].count,f=[];for(const g of h){const _=new He,m=new D,p=new Sn,x=new D(1,1,1),b=new K0(g.geometry,g.material,d);for(let M=0;M<d;M++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,M),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,M),l.SCALE&&x.fromBufferAttribute(l.SCALE,M),b.setMatrixAt(M,_.compose(m,p,x));for(const M in l)if(M==="_COLOR_0"){const P=l[M];b.instanceColor=new Fa(P.array,P.itemSize,P.normalized)}else M!=="TRANSLATION"&&M!=="ROTATION"&&M!=="SCALE"&&g.geometry.setAttribute(M,l[M]);vt.prototype.copy.call(b,g),this.parser.assignFinalMaterial(b),f.push(b)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}}const au="glTF",Cs=12,Jc={JSON:1313821514,BIN:5130562};class K_{constructor(e){this.name=$e.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Cs),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==au)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const s=this.header.length-Cs,r=new DataView(e,Cs);let o=0;for(;o<s;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===Jc.JSON){const c=new Uint8Array(e,Cs+o,a);this.content=n.decode(c)}else if(l===Jc.BIN){const c=Cs+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class J_{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=$e.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const u in o){const h=Ha[u]||u.toLowerCase();a[h]=o[u]}for(const u in e.attributes){const h=Ha[u]||u.toLowerCase();if(o[u]!==void 0){const d=n.accessors[e.attributes[u]],f=Qi[d.componentType];c[h]=f.name,l[h]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,d){s.decodeDracoFile(u,function(f){for(const g in f.attributes){const _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}h(f)},a,c,jt,d)})})}}class Q_{constructor(){this.name=$e.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class ev{constructor(){this.name=$e.KHR_MESH_QUANTIZATION}}class lu extends js{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=s-t,h=(n-t)/u,d=h*h,f=d*h,g=e*c,_=g-c,m=-2*f+3*d,p=f-d,x=1-m,b=p-d+h;for(let M=0;M!==a;M++){const P=o[_+M+a],A=o[_+M+l]*u,C=o[g+M+a],R=o[g+M]*u;r[M]=x*P+b*A+m*C+p*R}return r}}const tv=new Sn;class nv extends lu{interpolate_(e,t,n,s){const r=super.interpolate_(e,t,n,s);return tv.fromArray(r).normalize().toArray(r),r}}const ln={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Qi={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Qc={9728:Xt,9729:Qt,9984:Rh,9985:Rr,9986:Is,9987:Xn},eh={33071:cn,33648:kr,10497:hi},Bo={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Ha={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ri={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},iv={CUBICSPLINE:void 0,LINEAR:Gs,STEP:Hs},Oo={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function sv(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new wt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Zn})),i.DefaultMaterial}function yi(i,e,t){for(const n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Gn(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function rv(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,u=e.length;c<u;c++){const h=e[c];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);const o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){const h=e[c];if(n){const d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;o.push(d)}if(s){const d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;a.push(d)}if(r){const d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const u=c[0],h=c[1],d=c[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=h),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function ov(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function av(i){let e;const t=i.extensions&&i.extensions[$e.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Fo(t.attributes):e=i.indices+":"+Fo(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Fo(i.targets[n]);return e}function Fo(i){let e="";const t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Ga(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function lv(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const cv=new He;class hv{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new D_,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new p_(this.options.manager):this.textureLoader=new y_(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new dl(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return yi(r,a,s),Gn(a,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){const o=t[s].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){const o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const s=n.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,u]of o.children.entries())r(u,a.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const s=e(t[n]);if(s)return s}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let s=0;s<t.length;s++){const r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[$e.KHR_BINARY_GLTF].body);const s=this.options;return new Promise(function(r,o){n.load(Fs.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){const t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){const o=Bo[s.type],a=Qi[s.componentType],l=s.normalized===!0,c=new a(s.count*o);return Promise.resolve(new pt(c,o,l))}const r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=Bo[s.type],c=Qi[s.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0;let _,m;if(f&&f!==h){const p=Math.floor(d/f),x="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count;let b=t.cache.get(x);b||(_=new c(a,p*f,s.count*f/u),b=new j0(_,f/u),t.cache.add(x,b)),m=new al(b,l,d%f/u,g)}else a===null?_=new c(s.count*l):_=new c(a,d,s.count*l),m=new pt(_,l,g);if(s.sparse!==void 0){const p=Bo.SCALAR,x=Qi[s.sparse.indices.componentType],b=s.sparse.indices.byteOffset||0,M=s.sparse.values.byteOffset||0,P=new x(o[1],b,s.sparse.count*p),A=new c(o[2],M,s.sparse.count*l);a!==null&&(m=new pt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let C=0,R=P.length;C<R;C++){const E=P[C];if(m.setX(E,A[C*l]),l>=2&&m.setY(E,A[C*l+1]),l>=3&&m.setZ(E,A[C*l+2]),l>=4&&m.setW(E,A[C*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const s=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);const d=(r.samplers||{})[o.sampler]||{};return u.magFilter=Qc[d.magFilter]||Qt,u.minFilter=Qc[d.minFilter]||Xn,u.wrapS=eh[d.wrapS]||hi,u.wrapT=eh[d.wrapT]||hi,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Xt&&u.minFilter!==Qt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());const o=s.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(h){c=!0;const d=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(l).then(function(h){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(_){const m=new Rt(_);m.needsUpdate=!0,d(m)}),t.load(Fs.resolveURL(h,r.path),g,void 0,f)})}).then(function(h){return c===!0&&a.revokeObjectURL(l),Gn(h,o),h.userData.mimeType=o.mimeType||lv(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[$e.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[$e.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[$e.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new bi,tn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Ji,tn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return wt}loadMaterial(e){const t=this,n=this.json,s=this.extensions,r=n.materials[e];let o;const a={},l=r.extensions||{},c=[];if(l[$e.KHR_MATERIALS_UNLIT]){const h=s[$e.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),c.push(h.extendParams(a,r,t))}else{const h=r.pbrMetallicRoughness||{};if(a.color=new he(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){const d=h.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],jt),a.opacity=d[3]}h.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",h.baseColorTexture,Je)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=ut);const u=r.alphaMode||Oo.OPAQUE;if(u===Oo.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Oo.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==xt&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new xe(1,1),r.normalTexture.scale!==void 0)){const h=r.normalTexture.scale;a.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&o!==xt&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==xt){const h=r.emissiveFactor;a.emissive=new he().setRGB(h[0],h[1],h[2],jt)}return r.emissiveTexture!==void 0&&o!==xt&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Je)),Promise.all(c).then(function(){const h=new o(a);return r.name&&(h.name=r.name),Gn(h,r),t.associations.set(h,{materials:e}),r.extensions&&yi(s,h,r),h})}createUniqueName(e){const t=ht.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[$e.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return th(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],u=av(c),h=s[u];if(h)o.push(h.promise);else{let d;c.extensions&&c.extensions[$e.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=th(new St,c,t),s[u]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const u=o[l].material===void 0?sv(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let f=0,g=u.length;f<g;f++){const _=u[f],m=o[f];let p;const x=c[f];if(m.mode===ln.TRIANGLES||m.mode===ln.TRIANGLE_STRIP||m.mode===ln.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new q0(_,x):new oe(_,x),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===ln.TRIANGLE_STRIP?p.geometry=Kc(p.geometry,Fh):m.mode===ln.TRIANGLE_FAN&&(p.geometry=Kc(p.geometry,Na));else if(m.mode===ln.LINES)p=new Vr(_,x);else if(m.mode===ln.LINE_STRIP)p=new cl(_,x);else if(m.mode===ln.LINE_LOOP)p=new J0(_,x);else if(m.mode===ln.POINTS)p=new Os(_,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&ov(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),Gn(p,r),m.extensions&&yi(s,p,m),t.assignFinalMaterial(p),h.push(p)}for(let f=0,g=h.length;f<g;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return r.extensions&&yi(s,h[0],r),h[0];const d=new bt;r.extensions&&yi(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=h.length;f<g;f++)d.add(h[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Ft(yn.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Zr(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Gn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){const r=s.pop(),o=s,a=[],l=[];for(let c=0,u=o.length;c<u;c++){const h=o[c];if(h){a.push(h);const d=new He;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new ll(a,l)})}loadAnimation(e){const t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let h=0,d=s.channels.length;h<d;h++){const f=s.channels[h],g=s.samplers[f.sampler],_=f.target,m=_.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,x=s.parameters!==void 0?s.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",x)),c.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){const d=h[0],f=h[1],g=h[2],_=h[3],m=h[4],p=[];for(let x=0,b=d.length;x<b;x++){const M=d[x],P=f[x],A=g[x],C=_[x],R=m[x];if(M===void 0)continue;M.updateMatrix&&M.updateMatrix();const E=n._createAnimationTracks(M,P,A,C,R);if(E)for(let S=0;S<E.length;S++)p.push(E[S])}return new a_(r,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=s.weights.length;l<c;l++)a.morphTargetInfluences[l]=s.weights[l]}),o})}loadNode(e){const t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));const l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){const u=c[0],h=c[1],d=c[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,cv)});for(let f=0,g=h.length;f<g;f++)u.add(h[f]);return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(r.isBone===!0?u=new tu:c.length>1?u=new bt:c.length===1?u=c[0]:u=new vt,u!==c[0])for(let h=0,d=c.length;h<d;h++)u.add(c[h]);if(r.name&&(u.userData.name=r.name,u.name=o),Gn(u,r),r.extensions&&yi(n,u,r),r.matrix!==void 0){const h=new He;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);return s.associations.has(u)||s.associations.set(u,{}),s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],s=this,r=new bt;n.name&&(r.name=s.createUniqueName(n.name)),Gn(r,n),n.extensions&&yi(t,r,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(s.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,h=l.length;u<h;u++)r.add(l[u]);const c=u=>{const h=new Map;for(const[d,f]of s.associations)(d instanceof tn||d instanceof Rt)&&h.set(d,f);return u.traverse(d=>{const f=s.associations.get(d);f!=null&&h.set(d,f)}),h};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){const o=[],a=e.name?e.name:e.uuid,l=[];ri[r.path]===ri.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(ri[r.path]){case ri.weights:c=cs;break;case ri.rotation:c=hs;break;case ri.position:case ri.scale:c=us;break;default:switch(n.itemSize){case 1:c=cs;break;case 2:case 3:default:c=us;break}break}const u=s.interpolation!==void 0?iv[s.interpolation]:Gs,h=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const g=new c(l[d]+"."+ri[r.path],t.array,h,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Ga(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const s=this instanceof hs?nv:lu;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function uv(i,e,t){const n=e.attributes,s=new bn;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(s.set(new D(l[0],l[1],l[2]),new D(c[0],c[1],c[2])),a.normalized){const u=Ga(Qi[a.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new D,l=new D;for(let c=0,u=r.length;c<u;c++){const h=r[c];if(h.POSITION!==void 0){const d=t.json.accessors[h.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){const _=Ga(Qi[d.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;const o=new wn;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function th(i,e,t){const n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(const o in n){const a=Ha[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){const o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return Ze.workingColorSpace!==jt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ze.workingColorSpace}" not supported.`),Gn(i,e),uv(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?rv(i,e.targets,t):i})}const dv=/^[og]\s*(.+)?/,fv=/^mtllib /,pv=/^usemtl /,mv=/^usemap /,nh=/\s+/,ih=new D,ko=new D,sh=new D,rh=new D,on=new D,Sr=new he;function gv(){const i={objects:[],object:{},vertices:[],normals:[],colors:[],uvs:[],materials:{},materialLibraries:[],startObject:function(e,t){if(this.object&&this.object.fromDeclaration===!1){this.object.name=e,this.object.fromDeclaration=t!==!1;return}const n=this.object&&typeof this.object.currentMaterial=="function"?this.object.currentMaterial():void 0;if(this.object&&typeof this.object._finalize=="function"&&this.object._finalize(!0),this.object={name:e||"",fromDeclaration:t!==!1,geometry:{vertices:[],normals:[],colors:[],uvs:[],hasUVIndices:!1},materials:[],smooth:!0,startMaterial:function(s,r){const o=this._finalize(!1);o&&(o.inherited||o.groupCount<=0)&&this.materials.splice(o.index,1);const a={index:this.materials.length,name:s||"",mtllib:Array.isArray(r)&&r.length>0?r[r.length-1]:"",smooth:o!==void 0?o.smooth:this.smooth,groupStart:o!==void 0?o.groupEnd:0,groupEnd:-1,groupCount:-1,inherited:!1,clone:function(l){const c={index:typeof l=="number"?l:this.index,name:this.name,mtllib:this.mtllib,smooth:this.smooth,groupStart:0,groupEnd:-1,groupCount:-1,inherited:!1};return c.clone=this.clone.bind(c),c}};return this.materials.push(a),a},currentMaterial:function(){if(this.materials.length>0)return this.materials[this.materials.length-1]},_finalize:function(s){const r=this.currentMaterial();if(r&&r.groupEnd===-1&&(r.groupEnd=this.geometry.vertices.length/3,r.groupCount=r.groupEnd-r.groupStart,r.inherited=!1),s&&this.materials.length>1)for(let o=this.materials.length-1;o>=0;o--)this.materials[o].groupCount<=0&&this.materials.splice(o,1);return s&&this.materials.length===0&&this.materials.push({name:"",smooth:this.smooth}),r}},n&&n.name&&typeof n.clone=="function"){const s=n.clone(0);s.inherited=!0,this.object.materials.push(s)}this.objects.push(this.object)},finalize:function(){this.object&&typeof this.object._finalize=="function"&&this.object._finalize(!0)},parseVertexIndex:function(e,t){const n=parseInt(e,10);return(n>=0?n-1:n+t/3)*3},parseNormalIndex:function(e,t){const n=parseInt(e,10);return(n>=0?n-1:n+t/3)*3},parseUVIndex:function(e,t){const n=parseInt(e,10);return(n>=0?n-1:n+t/2)*2},addVertex:function(e,t,n){const s=this.vertices,r=this.object.geometry.vertices;r.push(s[e+0],s[e+1],s[e+2]),r.push(s[t+0],s[t+1],s[t+2]),r.push(s[n+0],s[n+1],s[n+2])},addVertexPoint:function(e){const t=this.vertices;this.object.geometry.vertices.push(t[e+0],t[e+1],t[e+2])},addVertexLine:function(e){const t=this.vertices;this.object.geometry.vertices.push(t[e+0],t[e+1],t[e+2])},addNormal:function(e,t,n){const s=this.normals,r=this.object.geometry.normals;r.push(s[e+0],s[e+1],s[e+2]),r.push(s[t+0],s[t+1],s[t+2]),r.push(s[n+0],s[n+1],s[n+2])},addFaceNormal:function(e,t,n){const s=this.vertices,r=this.object.geometry.normals;ih.fromArray(s,e),ko.fromArray(s,t),sh.fromArray(s,n),on.subVectors(sh,ko),rh.subVectors(ih,ko),on.cross(rh),on.normalize(),r.push(on.x,on.y,on.z),r.push(on.x,on.y,on.z),r.push(on.x,on.y,on.z)},addColor:function(e,t,n){const s=this.colors,r=this.object.geometry.colors;s[e]!==void 0&&r.push(s[e+0],s[e+1],s[e+2]),s[t]!==void 0&&r.push(s[t+0],s[t+1],s[t+2]),s[n]!==void 0&&r.push(s[n+0],s[n+1],s[n+2])},addUV:function(e,t,n){const s=this.uvs,r=this.object.geometry.uvs;r.push(s[e+0],s[e+1]),r.push(s[t+0],s[t+1]),r.push(s[n+0],s[n+1])},addDefaultUV:function(){const e=this.object.geometry.uvs;e.push(0,0),e.push(0,0),e.push(0,0)},addUVLine:function(e){const t=this.uvs;this.object.geometry.uvs.push(t[e+0],t[e+1])},addFace:function(e,t,n,s,r,o,a,l,c){const u=this.vertices.length;let h=this.parseVertexIndex(e,u),d=this.parseVertexIndex(t,u),f=this.parseVertexIndex(n,u);if(this.addVertex(h,d,f),this.addColor(h,d,f),a!==void 0&&a!==""){const g=this.normals.length;h=this.parseNormalIndex(a,g),d=this.parseNormalIndex(l,g),f=this.parseNormalIndex(c,g),this.addNormal(h,d,f)}else this.addFaceNormal(h,d,f);if(s!==void 0&&s!==""){const g=this.uvs.length;h=this.parseUVIndex(s,g),d=this.parseUVIndex(r,g),f=this.parseUVIndex(o,g),this.addUV(h,d,f),this.object.geometry.hasUVIndices=!0}else this.addDefaultUV()},addPointGeometry:function(e){this.object.geometry.type="Points";const t=this.vertices.length;for(let n=0,s=e.length;n<s;n++){const r=this.parseVertexIndex(e[n],t);this.addVertexPoint(r),this.addColor(r)}},addLineGeometry:function(e,t){this.object.geometry.type="Line";const n=this.vertices.length,s=this.uvs.length;for(let r=0,o=e.length;r<o;r++)this.addVertexLine(this.parseVertexIndex(e[r],n));for(let r=0,o=t.length;r<o;r++)this.addUVLine(this.parseUVIndex(t[r],s))}};return i.startObject("",!1),i}class _v extends Ai{constructor(e){super(e),this.materials=null}load(e,t,n,s){const r=this,o=new dl(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(r.parse(a))}catch(l){s?s(l):console.error(l),r.manager.itemError(e)}},n,s)}setMaterials(e){return this.materials=e,this}parse(e){const t=new gv;e.indexOf(`\r
`)!==-1&&(e=e.replace(/\r\n/g,`
`)),e.indexOf(`\\
`)!==-1&&(e=e.replace(/\\\n/g,""));const n=e.split(`
`);let s=[];for(let a=0,l=n.length;a<l;a++){const c=n[a].trimStart();if(c.length===0)continue;const u=c.charAt(0);if(u!=="#")if(u==="v"){const h=c.split(nh);switch(h[0]){case"v":t.vertices.push(parseFloat(h[1]),parseFloat(h[2]),parseFloat(h[3])),h.length>=7?(Sr.setRGB(parseFloat(h[4]),parseFloat(h[5]),parseFloat(h[6]),Je),t.colors.push(Sr.r,Sr.g,Sr.b)):t.colors.push(void 0,void 0,void 0);break;case"vn":t.normals.push(parseFloat(h[1]),parseFloat(h[2]),parseFloat(h[3]));break;case"vt":t.uvs.push(parseFloat(h[1]),parseFloat(h[2]));break}}else if(u==="f"){const d=c.slice(1).trim().split(nh),f=[];for(let _=0,m=d.length;_<m;_++){const p=d[_];if(p.length>0){const x=p.split("/");f.push(x)}}const g=f[0];for(let _=1,m=f.length-1;_<m;_++){const p=f[_],x=f[_+1];t.addFace(g[0],p[0],x[0],g[1],p[1],x[1],g[2],p[2],x[2])}}else if(u==="l"){const h=c.substring(1).trim().split(" ");let d=[];const f=[];if(c.indexOf("/")===-1)d=h;else for(let g=0,_=h.length;g<_;g++){const m=h[g].split("/");m[0]!==""&&d.push(m[0]),m[1]!==""&&f.push(m[1])}t.addLineGeometry(d,f)}else if(u==="p"){const d=c.slice(1).trim().split(" ");t.addPointGeometry(d)}else if((s=dv.exec(c))!==null){const h=(" "+s[0].slice(1).trim()).slice(1);t.startObject(h)}else if(pv.test(c))t.object.startMaterial(c.substring(7).trim(),t.materialLibraries);else if(fv.test(c))t.materialLibraries.push(c.substring(7).trim());else if(mv.test(c))console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');else if(u==="s"){if(s=c.split(" "),s.length>1){const d=s[1].trim().toLowerCase();t.object.smooth=d!=="0"&&d!=="off"}else t.object.smooth=!0;const h=t.object.currentMaterial();h&&(h.smooth=t.object.smooth)}else{if(c==="\0")continue;console.warn('THREE.OBJLoader: Unexpected line: "'+c+'"')}}t.finalize();const r=new bt;if(r.materialLibraries=[].concat(t.materialLibraries),!(t.objects.length===1&&t.objects[0].geometry.vertices.length===0)===!0)for(let a=0,l=t.objects.length;a<l;a++){const c=t.objects[a],u=c.geometry,h=c.materials,d=u.type==="Line",f=u.type==="Points";let g=!1;if(u.vertices.length===0)continue;const _=new St;_.setAttribute("position",new Ke(u.vertices,3)),u.normals.length>0&&_.setAttribute("normal",new Ke(u.normals,3)),u.colors.length>0&&(g=!0,_.setAttribute("color",new Ke(u.colors,3))),u.hasUVIndices===!0&&_.setAttribute("uv",new Ke(u.uvs,2));const m=[];for(let x=0,b=h.length;x<b;x++){const M=h[x],P=M.name+"_"+M.smooth+"_"+g;let A=t.materials[P];if(this.materials!==null){if(A=this.materials.create(M.name),d&&A&&!(A instanceof Ji)){const C=new Ji;tn.prototype.copy.call(C,A),C.color.copy(A.color),A=C}else if(f&&A&&!(A instanceof bi)){const C=new bi({size:10,sizeAttenuation:!1});tn.prototype.copy.call(C,A),C.color.copy(A.color),C.map=A.map,A=C}}A===void 0&&(d?A=new Ji:f?A=new bi({size:1,sizeAttenuation:!1}):A=new e_,A.name=M.name,A.flatShading=!M.smooth,A.vertexColors=g,t.materials[P]=A),m.push(A)}let p;if(m.length>1){for(let x=0,b=h.length;x<b;x++){const M=h[x];_.addGroup(M.groupStart,M.groupCount,x)}d?p=new Vr(_,m):f?p=new Os(_,m):p=new oe(_,m)}else d?p=new Vr(_,m[0]):f?p=new Os(_,m[0]):p=new oe(_,m[0]);p.name=c.name,r.add(p)}else if(t.vertices.length>0){const a=new bi({size:1,sizeAttenuation:!1}),l=new St;l.setAttribute("position",new Ke(t.vertices,3)),t.colors.length>0&&t.colors[0]!==void 0&&(l.setAttribute("color",new Ke(t.colors,3)),a.vertexColors=!0);const c=new Os(l,a);r.add(c)}return r}}const vv=[{id:"trachea",name:"气管腔与透明软骨环 (Trachea & Cartilage)",u:.5,v:.72,color:"#7dd3fc"},{id:"esophagus",name:"食管星状黏膜腔 (Esophagus)",u:.5,v:.6,color:"#fda4af"},{id:"thyroid",name:"甲状腺左/右叶 (Thyroid Gland)",u:.37,v:.69,color:"#f87171"},{id:"carotid",name:"颈总动脉 (Common Carotid A.)",u:.34,v:.56,color:"#ef4444"},{id:"jugular",name:"颈内静脉 (Internal Jugular V.)",u:.26,v:.55,color:"#60a5fa"},{id:"scm",name:"胸锁乳突肌 (Sternocleidomastoid M.)",u:.21,v:.63,color:"#fb7185"},{id:"vertebra",name:"C4 颈椎椎体 (C4 Vertebral Body)",u:.5,v:.44,color:"#fde68a"},{id:"spinal_cord",name:"脊髓灰质蝴蝶角 (Spinal Cord)",u:.5,v:.32,color:"#fef08a"},{id:"trapezius",name:"斜方肌与颈深肌群 (Deep Cervical Mm.)",u:.68,v:.26,color:"#f43f5e"},{id:"dermis",name:"真皮切缘与皮下脂肪层 (Dermis & Adipose)",u:.84,v:.76,color:"#fcd34d"}];function oi(i,e,t,n,s,r,o,a,l=1){i.save(),i.translate(e,t),i.rotate(r),i.beginPath(),i.ellipse(0,0,n+3,s+3,0,0,Math.PI*2),i.fillStyle="rgba(242, 225, 222, 0.82)",i.fill(),i.beginPath(),i.ellipse(0,0,n,s,0,0,Math.PI*2);const c=i.createRadialGradient(-n*.2,-s*.2,n*.1,0,0,Math.max(n,s));c.addColorStop(0,a||"#c43a46"),c.addColorStop(.65,o||"#9c2430"),c.addColorStop(1,"#4d0d15"),i.fillStyle=c,i.fill(),i.clip(),i.strokeStyle="rgba(250, 228, 224, 0.48)",i.lineWidth=1.4;const u=Math.floor(n*s/85);for(let h=0;h<u;h++){const d=(h*137.5+l*29)%360*(Math.PI/180),f=Math.sqrt((h+.5)/u)*.88,g=Math.cos(d)*n*f,_=Math.sin(d)*s*f,m=4+h*17%6;i.beginPath();for(let p=0;p<6;p++){const x=p/6*Math.PI*2+h%3*.2,b=m*(.78+.32*Math.sin(p*2.1+h)),M=g+Math.cos(x)*b,P=_+Math.sin(x)*b*.82;p===0?i.moveTo(M,P):i.lineTo(M,P)}i.closePath(),i.fillStyle=h%3===0?"rgba(165, 42, 52, 0.55)":"rgba(110, 20, 28, 0.55)",i.fill(),i.stroke()}for(let h=0;h<u*3;h++){const d=h*2.39996,f=Math.sqrt(h/(u*3))*.95,g=Math.cos(d)*n*f,_=Math.sin(d)*s*f;i.fillStyle=h%2===0?"rgba(255, 190, 190, 0.18)":"rgba(45, 5, 10, 0.25)",i.fillRect(g,_,1.8,1.8)}i.restore()}function cu(i,e={}){const t=i.width||1024,n=i.getContext("2d"),{skinColor:s="#f4d2c4",vascularContrast:r=1,dermisRimScale:o=1,showLabels:a=!1}=e;n.clearRect(0,0,t,t);const l=t*.5,c=t*.5,u=t*.46,h=(w,L)=>[w*t,(1-L)*t];n.fillStyle=s,n.fillRect(0,0,t,t),n.save(),n.beginPath(),n.arc(l,c,u*1.04,0,Math.PI*2),n.fillStyle=s,n.fill();const d=u*(1-.025*o);n.beginPath(),n.arc(l,c,u,0,Math.PI*2);const f=n.createRadialGradient(l,c,d*.92,l,c,u);f.addColorStop(0,"#e8b4a8"),f.addColorStop(.6,"#f6dcd4"),f.addColorStop(.92,"#df9e8e"),f.addColorStop(1,s),n.fillStyle=f,n.fill();const g=d*.965;n.beginPath(),n.arc(l,c,g,0,Math.PI*2),n.fillStyle="#e7bd74",n.fill();const _=76;for(let w=0;w<_;w++){const L=w/_*Math.PI*2,N=g*(.935-.03*Math.sin(w*3.7)),G=l+Math.cos(L)*N,V=c+Math.sin(L)*N;n.save(),n.translate(G,V),n.rotate(L),n.beginPath(),n.ellipse(0,0,t*.016,t*.027,0,0,Math.PI*2),n.fillStyle=w%2===0?"#f8dc9a":"#eab95e",n.fill(),n.strokeStyle="rgba(195, 115, 95, 0.45)",n.lineWidth=1.2,n.stroke(),n.restore()}const m=g*.895;n.beginPath(),n.arc(l,c,m,0,Math.PI*2);const p=n.createRadialGradient(l,c,t*.04,l,c,m);p.addColorStop(0,"#b4655f"),p.addColorStop(.55,"#a85552"),p.addColorStop(.92,"#d9aba6"),p.addColorStop(1,"#f0dedc"),n.fillStyle=p,n.fill();for(const w of[-1,1]){n.save(),n.beginPath();const L=w===-1?-Math.PI*.82:-Math.PI*.42,N=w===-1?-Math.PI*.58:-Math.PI*.18;n.arc(l,c,g*.93,L,N),n.strokeStyle="#b43c46",n.lineWidth=t*.014,n.lineCap="round",n.stroke(),n.restore()}for(const w of[-1,1]){const[L,N]=h(.5+w*.275,.635);oi(n,L,N,t*.102,t*.057,w*.68,"#a32430","#cf424e",w+2);const[G,V]=h(.5+w*.095,.795);oi(n,G,V,t*.062,t*.035,w*.22,"#a82d39","#d24a56",w+5);const[q,K]=h(.5+w*.2,.745);oi(n,q,K,t*.042,t*.025,w*.45,"#92222d","#b83844",w+8);const[X,te]=h(.5+w*.075,.525);oi(n,X,te,t*.046,t*.026,-w*.18,"#7d1b24","#a32c37",w+11);const[Q,ge]=h(.5+w*.24,.44);oi(n,Q,ge,t*.074,t*.052,-w*.35,"#96242e","#bc3a46",w+14);const[we,Oe]=h(.5+w*.28,.31);oi(n,we,Oe,t*.084,t*.05,-w*.75,"#92222c","#b83844",w+19);const[Z,ee]=h(.5+w*.115,.255);oi(n,Z,ee,t*.072,t*.044,-w*.42,"#7c1a22","#a82c36",w+23);const[_e,ae]=h(.5+w*.175,.165);oi(n,_e,ae,t*.1,t*.04,-w*.3,"#a22834","#c4414e",w+29)}const[x,b]=h(.5,.425),[M,P]=h(.5,.335);n.save(),n.beginPath(),n.moveTo(x-t*.11,b),n.quadraticCurveTo(x-t*.09,P+t*.05,x-t*.028,P+t*.125),n.lineTo(x-t*.018,P+t*.145),n.lineTo(x,P+t*.12),n.lineTo(x+t*.018,P+t*.145),n.lineTo(x+t*.028,P+t*.125),n.quadraticCurveTo(x+t*.09,P+t*.05,x+t*.11,b),n.closePath(),n.fillStyle="#ede0c8",n.fill(),n.strokeStyle="#cbb894",n.lineWidth=3,n.stroke();for(const w of[-1,1]){const[L,N]=h(.5+w*.115,.43);n.beginPath(),n.ellipse(L,N,t*.05,t*.032,w*.2,0,Math.PI*2),n.fillStyle="#f3e7d0",n.fill(),n.strokeStyle="#b89f72",n.lineWidth=3.5,n.stroke();const[G,V]=h(.5+w*.12,.43);n.beginPath(),n.arc(G,V,t*.015,0,Math.PI*2),n.fillStyle="#4a0c12",n.fill(),n.strokeStyle="#e02030",n.lineWidth=3,n.stroke()}n.beginPath(),n.ellipse(x,b,t*.088,t*.062,0,0,Math.PI*2),n.fillStyle="#f7edda",n.fill(),n.strokeStyle="#b89f72",n.lineWidth=4,n.stroke(),n.save(),n.beginPath(),n.ellipse(x,b,t*.072,t*.048,0,0,Math.PI*2),n.fillStyle="#b85d56",n.fill(),n.clip();for(let w=0;w<95;w++){const L=w*2.4,N=Math.sqrt(w/95),G=x+Math.cos(L)*t*.06*N,V=b+Math.sin(L)*t*.04*N;n.beginPath(),n.arc(G,V,2.2+w%3,0,Math.PI*2),n.fillStyle=w%2===0?"rgba(238, 218, 192, 0.65)":"rgba(120, 32, 32, 0.65)",n.fill()}n.restore(),n.beginPath(),n.ellipse(M,P,t*.056,t*.045,0,0,Math.PI*2),n.fillStyle="#5a2d32",n.fill(),n.strokeStyle="#e8dcc4",n.lineWidth=3,n.stroke(),n.beginPath(),n.ellipse(M,P,t*.046,t*.036,0,0,Math.PI*2),n.fillStyle="#9db9c6",n.fill(),n.beginPath(),n.ellipse(M,P,t*.04,t*.03,0,0,Math.PI*2),n.fillStyle="#f6eeda",n.fill(),n.strokeStyle="#c9b892",n.lineWidth=2,n.stroke(),n.fillStyle="#c08a84";for(const w of[-1,1])n.beginPath(),n.ellipse(M+w*t*.015,P-t*.006,t*.011,t*.017,w*.25,0,Math.PI*2),n.fill(),n.beginPath(),n.ellipse(M+w*t*.016,P+t*.008,t*.0075,t*.015,-w*.35,0,Math.PI*2),n.fill();n.fillRect(M-t*.016,P-t*.0035,t*.032,t*.007),n.beginPath(),n.arc(M,P,2.6,0,Math.PI*2),n.fillStyle="#4a2024",n.fill(),n.restore(),n.beginPath(),n.moveTo(M,P+t*.14),n.lineTo(l,c+m*.96),n.strokeStyle="rgba(245, 235, 225, 0.78)",n.lineWidth=3.5,n.stroke();const[A,C]=h(.5,.585);n.save(),n.beginPath(),n.ellipse(A,C,t*.044,t*.028,0,0,Math.PI*2),n.fillStyle="#9c2c38",n.fill(),n.strokeStyle="#e8c5c0",n.lineWidth=2,n.stroke(),n.beginPath(),n.ellipse(A,C,t*.028,t*.016,0,0,Math.PI*2),n.fillStyle="#e49da4",n.fill(),n.beginPath();for(let w=0;w<12;w++){const L=w/12*Math.PI*2,N=w%2===0?t*.018:t*.005,G=A+Math.cos(L)*N,V=C+Math.sin(L)*N*.6;w===0?n.moveTo(G,V):n.lineTo(G,V)}n.closePath(),n.fillStyle="#2d070c",n.fill(),n.restore();const[R,E]=h(.5,.705);for(const w of[-1,1]){const[L,N]=h(.5+w*.105,.675);n.save(),n.translate(L,N),n.rotate(w*.42),n.beginPath(),n.ellipse(0,0,t*.043,t*.077,0,0,Math.PI*2),n.fillStyle="#8a1f2b",n.fill(),n.strokeStyle="#eec0bc",n.lineWidth=2.8,n.stroke();for(let G=0;G<26;G++){const V=G*2.1,q=Math.sqrt(G/26)*.8;n.beginPath(),n.arc(Math.cos(V)*t*.033*q,Math.sin(V)*t*.062*q,3.8,0,Math.PI*2),n.fillStyle="rgba(198, 62, 72, 0.7)",n.fill()}n.restore()}n.save(),n.beginPath(),n.ellipse(R,E,t*.08,t*.073,0,0,Math.PI*2),n.fillStyle="#dceaf2",n.fill(),n.strokeStyle="#8ba9ba",n.lineWidth=4,n.stroke(),n.beginPath(),n.ellipse(R,E+t*.054,t*.05,t*.021,0,0,Math.PI*2),n.fillStyle="#c0525c",n.fill(),n.beginPath(),n.ellipse(R,E,t*.058,t*.052,0,0,Math.PI*2),n.fillStyle="#eb939c",n.fill(),n.beginPath(),n.ellipse(R,E,t*.05,t*.044,0,0,Math.PI*2);const S=n.createRadialGradient(R,E-t*.01,t*.005,R,E,t*.045);S.addColorStop(0,"#120306"),S.addColorStop(.75,"#26080e"),S.addColorStop(1,"#581622"),n.fillStyle=S,n.fill(),n.restore();for(const w of[-1,1]){const[L,N]=h(.5+w*.195,.56);n.save(),n.beginPath(),n.ellipse(L,N,t*.078,t*.055,w*.25,0,Math.PI*2),n.fillStyle="rgba(244, 228, 224, 0.52)",n.fill(),n.strokeStyle="rgba(255, 242, 238, 0.75)",n.lineWidth=2,n.stroke();const[G,V]=h(.5+w*.162,.565);n.beginPath(),n.arc(G,V,t*.031,0,Math.PI*2),n.fillStyle="#f4848e",n.fill(),n.strokeStyle="#d41e2e",n.lineWidth=2.5,n.stroke(),n.beginPath(),n.arc(G,V,t*.019,0,Math.PI*2),n.fillStyle=r>1.1?"#7f0912":"#4a060b",n.fill();const[q,K]=h(.5+w*.228,.555);n.beginPath(),n.ellipse(q,K,t*.038,t*.029,w*.35,0,Math.PI*2),n.fillStyle="#7588b2",n.fill(),n.beginPath(),n.ellipse(q,K,t*.03,t*.022,w*.35,0,Math.PI*2),n.fillStyle="#1d2140",n.fill();const[X,te]=h(.5+w*.192,.532);n.beginPath(),n.arc(X,te,t*.009,0,Math.PI*2),n.fillStyle="#f7e594",n.fill(),n.strokeStyle="#b4943e",n.lineWidth=1.5,n.stroke(),n.restore()}for(const w of[-1,1]){const[L,N]=h(.5+w*.055,.855);n.beginPath(),n.arc(L,N,t*.007,0,Math.PI*2),n.fillStyle="#242b54",n.fill(),n.strokeStyle="#8fa4d4",n.lineWidth=1.5,n.stroke();const[G,V]=h(.5+w*.355,.585);n.beginPath(),n.arc(G,V,t*.009,0,Math.PI*2),n.fillStyle="#242b54",n.fill(),n.strokeStyle="#8fa4d4",n.lineWidth=1.8,n.stroke()}if(a){n.save(),n.font=`600 ${Math.round(t*.019)}px "JetBrains Mono", "PingFang SC", sans-serif`;for(const w of vv){const[L,N]=h(w.u,w.v);n.beginPath(),n.arc(L,N,t*.006,0,Math.PI*2),n.fillStyle=w.color,n.fill(),n.strokeStyle="#090d16",n.lineWidth=2,n.stroke();const G=n.measureText(w.name).width,V=L>l?L+12:L-G-20,q=N-12;n.fillStyle="rgba(9, 13, 22, 0.84)",n.fillRect(V,q,G+10,22),n.strokeStyle=w.color,n.lineWidth=1,n.strokeRect(V,q,G+10,22),n.fillStyle="#f8fafc",n.fillText(w.name,V+5,q+16)}n.restore()}}function yv(i={}){const t=document.createElement("canvas");t.width=1024,t.height=1024,cu(t,i);const n=document.createElement("canvas");n.width=1024,n.height=1024;const s=n.getContext("2d");s.drawImage(t,0,0);const r=s.getImageData(0,0,1024,1024),o=r.data;for(let c=0;c<o.length;c+=4){const u=o[c],h=o[c+1],d=o[c+2],f=Math.min(255,Math.max(0,Math.round(.35*u+.45*h+.2*d)));o[c]=f,o[c+1]=f,o[c+2]=f}s.putImageData(r,0,0);const a=new En(t);a.colorSpace=Je,a.anisotropy=8,a.needsUpdate=!0;const l=new En(n);return l.anisotropy=4,l.needsUpdate=!0,{colorTex:a,bumpTex:l,colorCanvas:t}}let br=null;function xv(i=2048){if(br)return br;const e=i/512,t=document.createElement("canvas");t.width=i,t.height=i;const n=t.getContext("2d");n.fillStyle="#b0b0b0",n.fillRect(0,0,i,i);const s=[[.5,.44,.34,"rgba(70,70,70,0.10)"],[.2,.55,.26,"rgba(235,235,235,0.10)"],[.8,.55,.26,"rgba(235,235,235,0.10)"]];for(const[o,a,l,c]of s){const u=n.createRadialGradient(i*o,i*a,4,i*o,i*a,i*l);u.addColorStop(0,c),u.addColorStop(1,"rgba(128,128,128,0)"),n.fillStyle=u,n.fillRect(0,0,i,i)}for(let o=0;o<Math.round(9e3*e*e);o++){const a=Math.random()*i,l=Math.random()*i,c=(Math.random()<.12?1.6+Math.random()*1.4:.5+Math.random()*1)*e,h=Math.random()<.55?60+Math.random()*60:190+Math.random()*55;n.fillStyle=`rgba(${h|0},${h|0},${h|0},${.05+Math.random()*.09})`,n.beginPath(),n.arc(a,l,c,0,Math.PI*2),n.fill()}n.lineWidth=.7*e;for(let o=0;o<Math.round(900*e*e);o++){const a=Math.random()*i,l=Math.random()*i,c=Math.random()*Math.PI,u=(2+Math.random()*5)*e,h=95+Math.random()*90;n.strokeStyle=`rgba(${h|0},${h|0},${h|0},0.10)`,n.beginPath(),n.moveTo(a,l),n.lineTo(a+Math.cos(c)*u,l+Math.sin(c)*u),n.stroke()}const r=new En(t);return r.wrapS=hi,r.wrapT=hi,r.anisotropy=16,r.needsUpdate=!0,br={roughnessMap:r,bumpMap:r},br}function Mv(i){const e=document.createElement("canvas");e.width=128,e.height=128;const t=e.getContext("2d");t.drawImage(i,0,0,128,128);const n=t.getImageData(0,0,128,128).data;let s=0,r=0,o=0,a=0;for(let d=48;d<78;d++)for(let f=44;f<84;f++){const g=(d*128+f)*4;s+=n[g],r+=n[g+1],o+=n[g+2],a++}s/=a,r/=a,o/=a;const l=Math.round(Math.min(250,Math.max(222,s*.45+246*.55))),c=Math.round(Math.min(228,Math.max(190,r*.45+216*.55))),u=Math.round(Math.min(218,Math.max(176,o*.45+204*.55)));return{skinTone:((d,f,g)=>"#"+[d,f,g].map(_=>_.toString(16).padStart(2,"0")).join(""))(l,c,u),lipColor:"#d45868",irisColor:"#362015"}}const Er=new Map;let wr=null;const _l={groom_photo_tied:{file:"photo_tied",modifier:"none",label:"照片同款 · 清透碎刘海露耳低束发"},groom_center_long:{file:"center_long",modifier:"none",label:"中式黑长直 · 高颅顶八字中分柔顺发"},groom_low_chignon:{file:"low_chignon",modifier:"none",label:"新中式温婉 · 侧分斜刘海低盘发髻"},groom_air_bob:{file:"photo_tied",modifier:"air_bob",label:"元气初恋 · 空气刘海内扣短波波"},groom_clavicle_bob:{file:"center_long",modifier:"clavicle_bob",label:"都市轻熟 · 八字刘海锁骨内扣发"},groom_hime_cut:{file:"center_long",modifier:"hime_cut",label:"国风清冷 · 姬发式公主切黑长直"},groom_high_ponytail:{file:"photo_tied",modifier:"high_ponytail",label:"飒爽千金 · 高颅顶露耳元气高束发"},groom_pixie_short:{file:"photo_tied",modifier:"pixie_short",label:"智感清冷 · 露耳碎发层次超短发"}};function hu(i){const e={hair_user_photo:"groom_photo_tied",real_hair_user_photo:"groom_photo_tied",hair_long01:"groom_center_long",real_hair_long01:"groom_center_long",hair_short04:"groom_center_long",real_hair_short04:"groom_center_long",hair_bob01:"groom_air_bob",real_hair_bob01:"groom_air_bob",hair_bob02:"groom_clavicle_bob",real_hair_bob02:"groom_clavicle_bob",hair_ponytail01:"groom_high_ponytail",real_hair_ponytail01:"groom_high_ponytail",hair_braid01:"groom_low_chignon",real_hair_braid01:"groom_low_chignon",hair_short02:"groom_pixie_short",real_hair_short02:"groom_pixie_short",real_hair_hime_cut:"groom_hime_cut",real_hair_clavicle_layer:"groom_clavicle_bob",real_hair_butterfly_halfup:"groom_center_long"};return _l[i]?i:e[i]||null}function Sv(){if(wr)return wr;if(typeof document>"u")return null;const i=512,e=512,t=document.createElement("canvas");t.width=i,t.height=e;const n=t.getContext("2d"),s=n.createImageData(i,e),r=s.data,o=document.createElement("canvas");o.width=i,o.height=e;const a=o.getContext("2d"),l=a.createImageData(i,e),c=l.data,u=22;for(let f=0;f<e;f++){const g=f/(e-1),_=.58+.42*Math.min(1,g/.16),m=g>.85?Math.max(0,1-Math.pow((g-.85)/.15,1.35)):1;for(let p=0;p<i;p++){const x=p/(i-1),b=Math.min(x,1-x),M=Math.min(1,b/.065),P=.5+.5*Math.sin((x*u+.02*Math.sin(g*8))*Math.PI*2),A=.5+.5*Math.sin((x*u*2.1-.015*Math.cos(g*5)+.42)*Math.PI*2),C=.5+.5*Math.cos((x*7+.15)*Math.PI*2),R=.52+.3*P+.12*A+.06*C,E=.76+.24*(1-Math.pow(x*2-1,2)),S=Math.min(255,Math.round(255*_*R*E)),w=g>.76?.45+.55*P:1,L=Math.max(0,Math.min(255,Math.round(255*M*m*w))),N=(f*i+p)*4;r[N]=S,r[N+1]=Math.round(S*.96),r[N+2]=Math.round(S*.94),r[N+3]=255,c[N]=L,c[N+1]=L,c[N+2]=L,c[N+3]=255}}n.putImageData(s,0,0),a.putImageData(l,0,0);const h=new En(t);h.wrapS=cn,h.wrapT=cn,h.colorSpace=Je,h.anisotropy=8,h.needsUpdate=!0;const d=new En(o);return d.wrapS=cn,d.wrapT=cn,d.needsUpdate=!0,wr={map:h,alphaMap:d},wr}function bv(i,e){i.userData.sheenVec=new D(e.r,e.g,e.b),i.onBeforeCompile=t=>{t.uniforms.uHairSheenColor={value:i.userData.sheenVec},t.vertexShader=t.vertexShader.replace("#include <common>",`#include <common>
attribute vec3 hairTangent;
varying vec3 vHairTangentView;
varying vec2 vHairUV;`).replace("#include <beginnormal_vertex>",`#include <beginnormal_vertex>
vHairTangentView = normalize(normalMatrix * hairTangent);
vHairUV = uv;`),t.fragmentShader=t.fragmentShader.replace("#include <common>",`#include <common>
uniform vec3 uHairSheenColor;
varying vec3 vHairTangentView;
varying vec2 vHairUV;`).replace("#include <opaque_fragment>",`// Marschner / Kajiya-Kay dual-lobe anisotropic strand scattering
vec3 T_hair = normalize(vHairTangentView);
vec3 V_hair = normalize(vViewPosition);
vec3 N_hair = normalize(normal);

// Two studio light directions in view space (key + rim/fill)
vec3 L1_hair = normalize(vec3(0.28, 0.56, 0.78));
vec3 L2_hair = normalize(vec3(-0.46, 0.42, 0.78));
vec3 H1_hair = normalize(L1_hair + V_hair);
vec3 H2_hair = normalize(L2_hair + V_hair);

// High-frequency 22-strand micro-fiber modulation across ribbon width (vHairUV.x)
float fiberPhase = vHairUV.x * 138.23 + sin(vHairUV.y * 9.0) * 0.45;
float microFiber = 0.65 + 0.35 * sin(fiberPhase);
float lockCylinder = 0.72 + 0.28 * (1.0 - pow(vHairUV.x * 2.0 - 1.0, 2.0));
float rootTipEnv = smoothstep(0.02, 0.18, vHairUV.y) * smoothstep(0.99, 0.74, vHairUV.y);

// Primary Cuticle Reflection Lobe (R): shifted toward root
vec3 T_R = normalize(T_hair - 0.14 * N_hair + 0.04 * sin(fiberPhase) * N_hair);
float dotTR1 = clamp(dot(T_R, H1_hair), -1.0, 1.0);
float dotTR2 = clamp(dot(T_R, H2_hair), -1.0, 1.0);
float sinTH_R1 = sqrt(max(0.0, 1.0 - dotTR1 * dotTR1));
float sinTH_R2 = sqrt(max(0.0, 1.0 - dotTR2 * dotTR2));
float specR = (pow(sinTH_R1, 56.0) + 0.45 * pow(sinTH_R2, 48.0)) * rootTipEnv * microFiber;

// Secondary Cortex Transmission-Reflection-Transmission Lobe (TRT): shifted toward tip
vec3 T_TRT = normalize(T_hair + 0.20 * N_hair - 0.05 * cos(fiberPhase) * N_hair);
float dotTTRT1 = clamp(dot(T_TRT, H1_hair), -1.0, 1.0);
float dotTTRT2 = clamp(dot(T_TRT, H2_hair), -1.0, 1.0);
float sinTH_TRT1 = sqrt(max(0.0, 1.0 - dotTTRT1 * dotTTRT1));
float sinTH_TRT2 = sqrt(max(0.0, 1.0 - dotTTRT2 * dotTTRT2));
float specTRT = (pow(sinTH_TRT1, 18.0) + 0.50 * pow(sinTH_TRT2, 16.0)) * rootTipEnv * (0.55 + 0.45 * microFiber);

// Kajiya-Kay diffuse cylindrical strand wrap
float dotTL = clamp(dot(T_hair, L1_hair), -1.0, 1.0);
float kkDiffuse = sqrt(max(0.0, 1.0 - dotTL * dotTL)) * lockCylinder * (0.75 + 0.25 * microFiber);

vec3 hairHighlight =
  diffuseColor.rgb * (kkDiffuse * 0.42) +
  vec3(0.24, 0.21, 0.20) * specR +
  uHairSheenColor * (specTRT * 0.36);

outgoingLight = outgoingLight * lockCylinder + min(hairHighlight, vec3(0.42));
#include <opaque_fragment>`)},i.customProgramCacheKey=()=>"stage21-marschner-hair-v1"}async function Ev(i){var n;const e=((n=_l[i])==null?void 0:n.file)||"photo_tied";if(Er.has(e))return Er.get(e);const t=(async()=>{var p;const s=`/grooms/${e}.groom`,r=(p=window.__EMBEDDED_GROOMS__)==null?void 0:p[s];let o;if(r){const x=atob(r.data),b=Uint8Array.from(x,M=>M.charCodeAt(0));if(r.encoding==="gzip-base64"){if(!globalThis.DecompressionStream)throw new Error("Groom 离线解压需要新版 Chrome/Edge/Safari。");o=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()}else o=b.buffer}else{const x=await fetch(s);if(!x.ok)throw new Error(`Groom 曲线数据加载失败 (${x.status})`);o=await x.arrayBuffer()}const a=new DataView(o),l=new TextDecoder().decode(new Uint8Array(o,0,8));if(!["H2GRM001","H2GRM002"].includes(l))throw new Error("Groom 数据格式错误");const c=a.getUint32(8,!0),u=a.getUint32(12,!0);if(c>1e5||u<4||u>128||o.byteLength!==40+c*8+c*u*6)throw new Error("Groom 数据长度错误");const h=[0,1,2].map(x=>a.getFloat32(16+x*4,!0)),d=[0,1,2].map(x=>a.getFloat32(28+x*4,!0)-h[x]);let f;if(l==="H2GRM002"){const x=new Uint8Array(o,40+c*8),b=c*u*3;f=new Uint16Array(b);for(let M=0;M<3;M++)for(let P=0;P<c;P++){let A=0;for(let C=0;C<u;C++){const R=M*c*u+P*u+C,E=x[R]|x[b+R]<<8;A=C===0?E:A+E&65535,f[(P*u+C)*3+M]=A}}}else f=new Uint16Array(o,40+c*8);const g=new Float32Array(c),_=new Uint8Array(c),m=new Uint8Array(c);for(let x=0;x<c;x++)g[x]=a.getFloat32(40+x*8,!0),_[x]=a.getUint8(44+x*8),m[x]=a.getUint8(45+x*8);return{count:c,samples:u,min:h,size:d,points:f,radius:g,family:_,pigment:m}})();Er.set(e,t);try{return await t}catch(s){throw Er.delete(e),s}}function zo(i,e,t,n,s){const r=t*(i.samples-1),o=Math.min(i.samples-2,Math.floor(r)),a=r-o,l=(e*i.samples+o)*3;let c=i.min[0]+(i.points[l]*(1-a)+i.points[l+3]*a)/65535*i.size[0],u=i.min[1]+(i.points[l+1]*(1-a)+i.points[l+4]*a)/65535*i.size[1],h=i.min[2]+(i.points[l+2]*(1-a)+i.points[l+5]*a)/65535*i.size[2];const d=i.family[e];if(n==="air_bob"&&d!==1){const f=t*t,g=c>=0?1:-1;c=c*(1+.08*Math.sin(t*Math.PI))-g*.008*f,u=u+.006*f,h=h+.022*Math.sin(t*Math.PI*.85)*(h<0?1:.3)}else if(n==="clavicle_bob"){const f=Math.pow(t,1.8),g=c>=0?1:-1;c-=g*.01*f,u+=.008*f,h+=.008*Math.sin(t*Math.PI)}else if(n==="hime_cut"){if(d===2||h>.005&&Math.abs(c)>.042){const f=c>=0?1:-1;u=u*(1-.22*t)+-.032*(.22*t),c=f*(.056+(Math.abs(c)-.056)*(1-.45*t)),h=h+.008*t}}else if(n==="high_ponytail"&&d===0){const f=Math.sin(t*Math.PI*.85);u+=.018*f,h-=.008*t}else n==="pixie_short"&&d!==1&&(u=u*(1-.25*t)+.012*(.25*t),c*=1-.08*t);return s.set(c,u,h),s}function wv(i,e,t,n,s){const o=e.length*t*3,a=new Float32Array(o*3),l=new Float32Array(o*3),c=new Float32Array(o*3),u=new Uint8Array(o*3),h=new Float32Array(o*2),d=new Uint32Array(e.length*(t-1)*2*6),f=new D(0,.025,-.012),g=new D,_=new D,m=new D,p=new D,x=new D,b=new D,M=new D;let P=0,A=0;for(const R of e){const E=R%i.count,S=Math.floor(R/i.count),w=P,L=i.family[E],N=.68+i.pigment[E]/255*.32,G=Math.max(.0012,Math.min(.0022,i.radius[E]||.0016)),V=L===0?2.25:L===1?1.95:L===2?2.05:1.3,q=s?1.15:1,K=G*V*q;for(let X=0;X<t;X++){const te=X/(t-1);if(zo(i,E,te,n,g),zo(i,E,Math.max(0,te-.018),n,_),zo(i,E,Math.min(1,te+.018),n,m),p.subVectors(m,_).normalize(),p.lengthSq()<.05&&p.set(0,-1,0),x.subVectors(g,f),x.lengthSq()<1e-6&&x.set(0,1,0),x.normalize(),x.addScaledVector(p,-x.dot(p)),x.lengthSq()<.01&&x.set(0,0,1).addScaledVector(p,-p.z),x.normalize(),b.crossVectors(p,x).normalize(),S>0){const Me=E*2.39996+S*2.09439,Ie=.0022*(.45+.55*Math.sin(te*Math.PI*.85)),Te=85e-5*Math.sin(te*Math.PI);g.addScaledVector(b,Math.cos(Me)*Ie).addScaledVector(x,Math.abs(Math.sin(Me))*Te)}const Q=Math.min(1,.65+.35*Math.sin(Math.min(1,te*5)*Math.PI*.5)),ge=Math.pow(1-te*.72,.42),we=K*Q*ge,Oe=we*.42,Z=.62+.38*Math.min(1,te/.2),ee=Math.round(N*Z*255),_e=Math.round(N*Z*.96*255),ae=Math.round(N*Z*.94*255);for(let Me=0;Me<3;Me++){const Ie=Me/2,Te=Ie*2-1,tt=(1-Te*Te)*Oe,De=P*3;if(a[De]=g.x+b.x*(Te*we)+x.x*tt,a[De+1]=g.y+b.y*(Te*we)+x.y*tt,a[De+2]=g.z+b.z*(Te*we)+x.z*tt,M.copy(x).addScaledVector(b,Te*.72).normalize(),l[De]=M.x,l[De+1]=M.y,l[De+2]=M.z,c[De]=p.x,c[De+1]=p.y,c[De+2]=p.z,u[De]=ee,u[De+1]=_e,u[De+2]=ae,h[P*2]=Ie,h[P*2+1]=te,X<t-1&&Me<2){const st=w+X*3+Me,B=st+1,Tt=st+3,je=Tt+1;d[A++]=st,d[A++]=B,d[A++]=Tt,d[A++]=B,d[A++]=je,d[A++]=Tt}P++}}}const C=new St;return C.setAttribute("position",new pt(a,3)),C.setAttribute("normal",new pt(l,3)),C.setAttribute("hairTangent",new pt(c,3)),C.setAttribute("color",new pt(u,3,!0)),C.setAttribute("uv",new pt(h,2)),C.setIndex(new pt(d,1)),C.computeBoundingBox(),C.computeBoundingSphere(),C}function Tv(i,e,t){var g;if(!((g=i==null?void 0:i.geometry)!=null&&g.attributes.position))return null;const n=i.geometry.attributes.position,s=i.geometry.attributes.normal,r=i.geometry.index;if(!s||!r)return null;const o=new Float32Array(n.count*3),a=new Float32Array(n.count*3),l=new Float32Array(n.count*4),c=.00115;for(let _=0;_<n.count;_++){const m=n.getX(_),p=n.getY(_),x=n.getZ(_),b=Math.atan2(m,x+.014),M=Math.max(0,Math.cos(b)),P=-.026+.118*Math.pow(M,.82);let A=yn.smoothstep(p,P,P+.024);x>.028&&p<.088&&Math.abs(m)<.058&&(A=0),(t==="groom_center_long"||t==="groom_clavicle_bob"||t==="groom_hime_cut")&&p>.075&&x>-.01&&(A*=1-.78*Math.exp(-Math.pow(m/.003,2)));const C=yn.smoothstep(Math.abs(m),.052,.068)*(1-yn.smoothstep(p,.024,.048))*yn.smoothstep(x,-.03,.02);A*=1-C,A=Math.pow(Math.max(0,Math.min(1,A)),1.4)*.88;const R=s.getX(_),E=s.getY(_),S=s.getZ(_);o[_*3]=m+R*c,o[_*3+1]=p+E*c,o[_*3+2]=x+S*c,a[_*3]=R,a[_*3+1]=E,a[_*3+2]=S,l[_*4]=.56,l[_*4+1]=.5,l[_*4+2]=.5,l[_*4+3]=A}const u=[];for(let _=0;_<r.count;_+=3){const m=r.getX(_),p=r.getX(_+1),x=r.getX(_+2);l[m*4+3]>.18&&l[p*4+3]>.18&&l[x*4+3]>.18&&u.push(m,p,x)}const h=new St;h.setAttribute("position",new pt(o,3)),h.setAttribute("normal",new pt(a,3)),h.setAttribute("color",new pt(l,4)),h.setIndex(u),h.computeBoundingSphere();const d=new wt({color:e,roughness:.86,metalness:0,vertexColors:!0,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2});d.userData.builtInHair=!0,d.userData.curveGroom=!0;const f=new oe(h,d);return f.name="Groom_ScalpRootDensity",f.userData.isGroomRoot=!0,f.userData.offsetDist=c,f.castShadow=!1,f.receiveShadow=!0,f.renderOrder=1,f}async function Av(i,e,t={}){var C;const n=hu(i);if(!n)throw new Error("未知 Groom 发型");const s=_l[n],r=(s==null?void 0:s.modifier)||"none",o=await Ev(n),a=t.groomLod!=="studio",l=a?3200:Math.min(o.count,Number(t.groomDensity||4800)),c=t.groomSoftware?Math.min(l,a?1400:2200):l,u=Math.max(900,Math.min(o.count,c)),h=[[],[],[],[]];for(let R=0;R<u;R++){const E=Math.floor(R*o.count/u);h[Math.min(3,o.family[E])].push(E)}const d=h[1].slice();for(const R of d)h[1].push(R+o.count);const f=h[2].slice();for(const R of f)h[2].push(R+o.count);const g=h[0].slice();for(let R=0;R<g.length;R+=2)h[0].push(g[R]+o.count);const _=h.reduce((R,E)=>R+E.length,0),m=new bt;m.name="HairGroup";const p=new he(t.hairColor||((C=t.materials)==null?void 0:C.hairColorHex)||"#1c1618");p.lerp(new he("#342420"),.22).multiplyScalar(1.16);const x=p.clone().lerp(new he("#a47864"),.48),b=Sv(),M=["GuideFlow","FeatheredFringe","TempleWisps","Flyaways"],P=Tv(e,p,n);P&&m.add(P);let A=0;for(let R=0;R<h.length;R++){if(!h[R].length)continue;const E=wv(o,h[R],a?14:20,r,a),S=R===1||R===2||R===3,w=new _t({color:p,map:b?b.map:null,alphaMap:b?b.alphaMap:null,vertexColors:!0,roughness:S?.36:.32,metalness:0,anisotropy:.86,anisotropyRotation:1.5708,specularIntensity:.52,specularColor:x,envMapIntensity:.36,sheen:.34,sheenRoughness:.38,sheenColor:x,clearcoat:.12,clearcoatRoughness:.36,alphaTest:.22,transparent:!1,depthWrite:!0,side:ut});bv(w,x),w.userData.builtInHair=!0,w.userData.curveGroom=!0;const L=new oe(E,w);L.name=`Groom_${M[R]}`,L.userData.isGroomMesh=!0,L.userData.groomFamily=R,L.castShadow=!a&&!t.groomSoftware&&R===0,L.receiveShadow=!0,L.renderOrder=R===0?2:3,m.add(L),A+=E.index.count/3}return m.userData.groom={id:n,sourceCurves:o.count,selectedGuides:u,renderedStrands:_,interpolatedChildren:_-u,triangles:A,lod:t.groomSoftware?a?"software-desktop":"software-portrait":a?"desktop":"portrait",softwareFallback:!!t.groomSoftware,nativeSource:"public/grooms/Chinese_Grooms_Source.blend"},m}function Rv(i,e){const t=Number((e==null?void 0:e.hairVolume)||0),n=Number((e==null?void 0:e.hairLength)||0),s=Number((e==null?void 0:e.bangsLength)||0),r=`${t}|${n}|${s}`;i.traverse(o=>{if(!o.userData.isGroomMesh||o.userData.groomShape===r)return;o.userData.groomShape=r;const a=o.geometry,l=a.attributes.position,c=a.attributes.uv;if(!a.userData.groomBase&&t===0&&n===0&&s===0)return;const u=a.userData.groomBase||(a.userData.groomBase=l.array.slice());for(let h=0;h<l.count;h++){const d=c.getY(h),f=yn.smoothstep(d,.05,.7),g=h*3,_=u[g],m=u[g+1],p=u[g+2];l.array[g]=_*(1+t*.12*f),l.array[g+1]=m-n*.022*f*Math.max(0,.04-m)/.18-(o.userData.groomFamily===1?s*.01*f:0),l.array[g+2]=p+(p+.014)*t*.11*f}l.needsUpdate=!0,a.computeBoundingSphere()})}function Cv(i){const e=i.getAttribute("position"),t=i.getAttribute("normal");if(!e||!t)return{repaired:0,seamVertices:0};const n=t.clone();i.setAttribute("normal",n);const s=new Float64Array(e.count*3),r=new Float64Array(e.count*3),o=new Float64Array(e.count),a=i.index,l=(a==null?void 0:a.count)||e.count,c=new D,u=new D,h=new D,d=new D;for(let p=0;p+2<l;p+=3){const x=[0,1,2].map(M=>a?a.getX(p+M):p+M);c.fromBufferAttribute(e,x[0]),u.fromBufferAttribute(e,x[1]),h.fromBufferAttribute(e,x[2]),d.crossVectors(u.sub(c),h.sub(c));const b=d.length();if(!(b<1e-15))for(const M of x)s[M*3]+=d.x,s[M*3+1]+=d.y,s[M*3+2]+=d.z,b>o[M]&&(o[M]=b,r[M*3]=d.x,r[M*3+1]=d.y,r[M*3+2]=d.z)}let f=0;const g=new Map;for(let p=0;p<e.count;p++){c.fromBufferAttribute(n,p),(c.lengthSq()<.25||!Number.isFinite(c.lengthSq()))&&(c.fromArray(s,p*3),c.lengthSq()<1e-22&&c.fromArray(r,p*3),c.lengthSq()<1e-22&&c.set(e.getX(p),e.getY(p)-.025,e.getZ(p)),c.lengthSq()<1e-22&&c.set(0,1,0),f++),c.normalize(),n.setXYZ(p,c.x,c.y,c.z);const x=`${Math.round(e.getX(p)*1e6)},${Math.round(e.getY(p)*1e6)},${Math.round(e.getZ(p)*1e6)}`;g.has(x)||g.set(x,[]),g.get(x).push(p)}const _=n.clone();let m=0;for(const p of g.values())if(!(p.length<2))for(const x of p){c.fromBufferAttribute(_,x),h.copy(c);let b=1;for(const M of p)M!==x&&(u.fromBufferAttribute(_,M),c.dot(u)>.75&&(h.add(u),b++));b>1&&(h.normalize(),n.setXYZ(x,h.x,h.y,h.z),m++)}return n.needsUpdate=!0,{repaired:f,seamVertices:m}}const Ho=new Map,Dt=1024;function Pv(i){let e=2166136261;for(const t of i)e=Math.imul(e^t.charCodeAt(0),16777619);return e>>>0}function Iv(i){return()=>{i|=0,i=i+1831565813|0;let e=Math.imul(i^i>>>15,1|i);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function oh(i,e,t){const n=new En(i);return n.copy(e),n.source=new nl(i),n.colorSpace=t,n.anisotropy=8,n.userData={...n.userData,sharedHairAtlas:!0},n.needsUpdate=!0,n}function Dv(i,e){if(!(i!=null&&i.image))throw new Error("Hair atlas image is unavailable");const t=`${e}|${i.channel}|${i.flipY}|${i.offset.toArray()}|${i.repeat.toArray()}|${i.rotation}|${i.wrapS}|${i.wrapT}`;if(Ho.has(t))return Ho.get(t);const n=document.createElement("canvas");n.width=n.height=Dt;const s=n.getContext("2d",{willReadFrequently:!0});s.drawImage(i.image,0,0,Dt,Dt);const r=s.getImageData(0,0,Dt,Dt),o=r.data,a=document.createElement("canvas");a.width=a.height=Dt;const l=a.getContext("2d",{willReadFrequently:!0});l.fillStyle="#999999",l.fillRect(0,0,Dt,Dt);const c=Iv(Pv(e));for(let m=0;m<760;m++){const p=(m+c()*.8)/760*Dt,x=80+Math.floor(c()*120),b=(c()-.5)*3;l.strokeStyle=`rgb(${x},${x},${x})`,l.lineWidth=.5+c()*.7,l.beginPath(),l.moveTo(p,0),l.bezierCurveTo(p+b,Dt/3,p-b,Dt*.7,p,Dt),l.stroke()}const u=l.getImageData(0,0,Dt,Dt).data,h=document.createElement("canvas");h.width=h.height=Dt;const d=h.getContext("2d"),f=d.createImageData(Dt,Dt),g=f.data;for(let m=0;m<o.length;m+=4){const p=(.299*o[m]+.587*o[m+1]+.114*o[m+2])/255,x=u[m]/255-.6,b=Math.max(.36,Math.min(.86,.48+p*.28+x*.18));o[m]=b*255,o[m+1]=b*251,o[m+2]=b*246;const M=Math.max(.4,Math.min(.66,.57-x*.24));g[m]=g[m+1]=g[m+2]=M*255,g[m+3]=255}s.putImageData(r,0,0),d.putImageData(f,0,0);const _={map:oh(n,i,Je),roughnessMap:oh(h,i,Rn),sourceSize:i.image.width||i.image.naturalWidth||0,generatedSize:Dt};return Ho.set(t,_),_}const Lv="cervix3d-private-assets-v1",ds="models",Wr="private-asset:",Go=new Map;function uu(){return new Promise((i,e)=>{if(!("indexedDB"in globalThis))return e(new Error("浏览器不支持 IndexedDB"));const t=indexedDB.open(Lv,1);t.onupgradeneeded=()=>{const n=t.result;n.objectStoreNames.contains(ds)||n.createObjectStore(ds,{keyPath:"id"})},t.onsuccess=()=>i(t.result),t.onerror=()=>e(t.error||new Error("无法打开本机模型仓库"))})}async function Nv(i){var n,s;const e=((s=(n=globalThis.crypto)==null?void 0:n.randomUUID)==null?void 0:s.call(n))||`${Date.now()}-${Math.random().toString(36).slice(2)}`,t=await uu();try{await new Promise((r,o)=>{const a=t.transaction(ds,"readwrite");a.objectStore(ds).put({id:e,file:i,name:i.name,bytes:i.size,savedAt:new Date().toISOString()}),a.oncomplete=r,a.onerror=()=>o(a.error||new Error("本机空间不足，模型未能保存")),a.onabort=()=>o(a.error||new Error("模型保存中断"))})}finally{t.close()}return`${Wr}${e}`}async function Uv(i){if(typeof i!="string"||!i.startsWith(Wr))return i;if(Go.has(i))return Go.get(i);const e=await uu();let t;try{t=await new Promise((s,r)=>{const a=e.transaction(ds,"readonly").objectStore(ds).get(i.slice(Wr.length));a.onsuccess=()=>s(a.result),a.onerror=()=>r(a.error||new Error("读取本机模型失败"))})}finally{e.close()}if(!(t!=null&&t.file))throw new Error("本机模型文件已被浏览器清理；请重新选择原始 GLB/OBJ 文件");const n=URL.createObjectURL(t.file);return Go.set(i,n),n}function Bv(i){return typeof i=="string"&&i.startsWith(Wr)}class Ov extends ol{constructor(){super();const e=new kt;e.deleteAttribute("uv");const t=new wt({side:Wt}),n=new wt,s=new ou(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new oe(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const o=new oe(e,n);o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),this.add(o);const a=new oe(e,n);a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),this.add(a);const l=new oe(e,n);l.position.set(6.167,.857,7.803),l.rotation.set(0,.561,0),l.scale.set(3.927,6.285,3.687),this.add(l);const c=new oe(e,n);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);const u=new oe(e,n);u.position.set(2.291,-.756,-2.621),u.rotation.set(0,-.286,0),u.scale.set(1.546,1.552,1.496),this.add(u);const h=new oe(e,n);h.position.set(-2.193,-.369,-5.547),h.rotation.set(0,.516,0),h.scale.set(3.875,3.487,2.986),this.add(h);const d=new oe(e,Xi(50));d.position.set(-16.116,14.37,8.208),d.scale.set(.1,2.428,2.739),this.add(d);const f=new oe(e,Xi(50));f.position.set(-16.109,18.021,-8.207),f.scale.set(.1,2.425,2.751),this.add(f);const g=new oe(e,Xi(17));g.position.set(14.904,12.198,-1.832),g.scale.set(.15,4.265,6.331),this.add(g);const _=new oe(e,Xi(43));_.position.set(-.462,8.89,14.52),_.scale.set(4.38,5.441,.088),this.add(_);const m=new oe(e,Xi(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);const p=new oe(e,Xi(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Xi(i){const e=new xt;return e.color.setScalar(i),e}const Fv=["low","medium","high","ultra","rtx2070"],ks={warm_gallery:{id:"warm_gallery",label:"🏛️ 暖金私人藏馆 · 雕塑级立体光影 (默认推荐)",keyColor:"#fff3e8",fillColor:"#b8cbe8",rimColor:"#ffdfc2",hemiSky:"#fff5ee",hemiGround:"#1e161a",keyIntensity:1.58,fillIntensity:.16,rimIntensity:1.15,hemiIntensity:.2,upIntensity:.34,keyAzimuthDeg:32,keyElevationDeg:36,exposure:.9,envIntensity:.48,contrast:1.12,saturation:1.1,warmth:.06,vignette:.36,sharpen:.48,bloomStrength:.05,filmGrain:0,skinGloss:.55,sssIntensity:1.15,tint:[1.01,.99,.96],shadowTint:[.03,.01,.02]},cold_forensic:{id:"cold_forensic",label:"❄️ 冷冽法医标本室 · 手术冷光高锐度",keyColor:"#eef6ff",fillColor:"#9ec5eb",rimColor:"#bae6fd",hemiSky:"#f0f7ff",hemiGround:"#111927",keyIntensity:1.65,fillIntensity:.18,rimIntensity:1.28,hemiIntensity:.18,upIntensity:.42,keyAzimuthDeg:24,keyElevationDeg:44,exposure:.92,envIntensity:.52,contrast:1.16,saturation:1.02,warmth:-.14,vignette:.38,sharpen:.66,bloomStrength:.04,filmGrain:0,skinGloss:.78,sssIntensity:.85,tint:[.96,.99,1.04],shadowTint:[0,.02,.05]},gothic_velvet:{id:"gothic_velvet",label:"🕯️ 暗夜哥特烛光 · 伦勃朗深邃油画感",keyColor:"#ffdfb8",fillColor:"#6f7ea8",rimColor:"#fda4af",hemiSky:"#ffe8d6",hemiGround:"#140c10",keyIntensity:1.82,fillIntensity:.08,rimIntensity:1.35,hemiIntensity:.12,upIntensity:.28,keyAzimuthDeg:52,keyElevationDeg:28,exposure:.86,envIntensity:.36,contrast:1.22,saturation:1.14,warmth:.16,vignette:.52,sharpen:.45,bloomStrength:.07,filmGrain:.08,skinGloss:.62,sssIntensity:1.45,tint:[1.04,.97,.92],shadowTint:[.06,.01,.03]},luxury_porcelain:{id:"luxury_porcelain",label:"🌸 唯美凝脂画报 · 蜜桃冷白皮柔光",keyColor:"#fff7f2",fillColor:"#dce8f8",rimColor:"#ffe4e6",hemiSky:"#fff8f6",hemiGround:"#2d2226",keyIntensity:1.42,fillIntensity:.28,rimIntensity:1.05,hemiIntensity:.28,upIntensity:.38,keyAzimuthDeg:20,keyElevationDeg:26,exposure:.94,envIntensity:.56,contrast:1.06,saturation:1.12,warmth:.03,vignette:.26,sharpen:.4,bloomStrength:.07,filmGrain:0,skinGloss:.5,sssIntensity:1.35,tint:[1.02,.99,1],shadowTint:[.04,.015,.025]},cyber_vitrine:{id:"cyber_vitrine",label:"🔮 赛博霓虹玻璃柜 · 冰蓝绯红双色轮廓",keyColor:"#f8f0ff",fillColor:"#38bdf8",rimColor:"#fb7185",hemiSky:"#e0f2fe",hemiGround:"#1e1028",keyIntensity:1.48,fillIntensity:.36,rimIntensity:1.85,hemiIntensity:.18,upIntensity:.4,keyAzimuthDeg:-34,keyElevationDeg:32,exposure:.9,envIntensity:.54,contrast:1.18,saturation:1.22,warmth:-.06,vignette:.44,sharpen:.54,bloomStrength:.09,filmGrain:0,skinGloss:.85,sssIntensity:1.1,tint:[.99,.98,1.05],shadowTint:[.04,0,.07]},vintage_film:{id:"vintage_film",label:"🎞️ 复古胶片标本志 · 柯达暖调微颗粒",keyColor:"#ffeedb",fillColor:"#b5c2d4",rimColor:"#fcd34d",hemiSky:"#fff2e2",hemiGround:"#29201b",keyIntensity:1.52,fillIntensity:.2,rimIntensity:.98,hemiIntensity:.22,upIntensity:.32,keyAzimuthDeg:38,keyElevationDeg:34,exposure:.89,envIntensity:.44,contrast:1.14,saturation:.96,warmth:.14,vignette:.46,sharpen:.36,bloomStrength:.05,filmGrain:.22,skinGloss:.45,sssIntensity:1.1,tint:[1.03,.99,.93],shadowTint:[.05,.03,.01]}},ah=new WeakMap;function du(i,e=.9){i.outputColorSpace=Je,i.toneMapping=Ya,i.toneMappingExposure=e,i.shadowMap.enabled=!0,i.shadowMap.type=Mh,i.shadowMap.autoUpdate=!1,i.shadowMap.needsUpdate=!0}function Qr(i){i&&i.shadowMap&&i.shadowMap.enabled&&(i.shadowMap.needsUpdate=!0)}function fu(i,e,t=.85){let n=ah.get(i);if(!n){const s=new Ba(i),r=new Ov,o=new ui(1.3,1.78,48),a=new xt({color:new he(9.5,8.9,8.6),side:ut}),l=new oe(o,a);l.position.set(.28,1.15,4.2),l.lookAt(0,.15,0),r.add(l);const c=new oe(new Pn(3.4,3),new xt({color:new he(6.8,5.6,5.3),side:ut}));c.position.set(3.1,2.3,2.9),c.lookAt(0,0,0),r.add(c);const u=new oe(new Pn(3.8,3.2),new xt({color:new he(5.4,5.2,5.8),side:ut}));u.position.set(-3.3,2.2,-3.1),u.lookAt(0,0,0),r.add(u),n=s.fromScene(r,.038).texture,r.dispose(),s.dispose(),ah.set(i,n)}return e.environment=n,"environmentIntensity"in e&&(e.environmentIntensity=t),n}function kv(i,e=1.15){i.userData=i.userData||{},i.userData.uSssIntensity={value:e},i.onBeforeCompile=t=>{t.uniforms.uSssIntensity=i.userData.uSssIntensity,t.fragmentShader=t.fragmentShader.replace("#include <lights_physical_pars_fragment>",`#include <lights_physical_pars_fragment>
      uniform float uSssIntensity;
      vec3 computeSubsurfaceWrap(vec3 normal, vec3 lightDir, vec3 lightColor) {
        float ndl = dot(normal, lightDir);
        float wrap = clamp((ndl + 0.40) / 1.40, 0.0, 1.0);
        float scatterBand = smoothstep(-0.38, 0.16, ndl) * (1.0 - smoothstep(0.04, 0.56, ndl));
        vec3 sssTint = vec3(0.98, 0.30, 0.24) * scatterBand * 0.26 + vec3(1.0, 0.74, 0.68) * (wrap * 0.075);
        return sssTint * lightColor * uSssIntensity;
      }`),t.fragmentShader=t.fragmentShader.replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeSubsurfaceWrap( geometryNormal, directionalLights[ i ].direction, directionalLights[ i ].color );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * 0.40;
      #endif`)},i.customProgramCacheKey=()=>"cervix3d-aesthetic-sss-v23"}function pu(i,e,t=2048,n=400){i.castShadow=!0,i.shadow.mapSize.set(t,t);const s=i.shadow.camera;s.left=-e,s.right=e,s.top=e,s.bottom=-e,s.near=1,s.far=n,s.updateProjectionMatrix(),i.shadow.bias=-15e-5,i.shadow.normalBias=.03}function zv(i){const e=new ru("#fff5ee","#1e161a",.2),t=new Yn("#fff3e8",1.58);t.position.set(28,34,48),pu(t,28,2048,220);const n=new Yn("#b8cbe8",.16);n.position.set(-34,10,35);const s=new Yn("#f2c9c0",.34);s.position.set(0,-48,22);const r=new Yn("#ffdfc2",1.15);return r.position.set(-14,28,-42),i.add(e,t,n,s,r),{hemi:e,key:t,fill:n,up:s,rim:r}}function Hv(i){const e=new ru("#fff5ee","#1e161a",.2),t=new Yn("#fff3e8",1.58);t.position.set(45,52,95),pu(t,85,2048,520);const n=new Yn("#b8cbe8",.16);n.position.set(-55,15,70);const s=new Yn("#f7d5d0",.34);s.position.set(0,-65,55);const r=new Yn("#ffdfc2",1.15);return r.position.set(-22,38,-80),i.add(e,t,n,s,r),{hemi:e,key:t,fill:n,up:s,rim:r}}function Xr(i,e={}){if(!i||!i.renderer||!i.scene)return;const t=ks[e.presetId]||ks.warm_gallery,n={...t,...e},s=!!i.controls,r=i.lightRig||{hemi:i.hemiLight||i.hemi,key:i.keyLight,fill:i.fillLight,up:i.anatomyUpLight||i.upLight,rim:i.rimLight};if(r.key){r.key.color.set(n.keyColor||t.keyColor),r.key.intensity=Number(n.keyIntensity??t.keyIntensity);const l=s?64:116,c=yn.degToRad(Number(n.keyAzimuthDeg??t.keyAzimuthDeg)),u=yn.degToRad(Number(n.keyElevationDeg??t.keyElevationDeg)),h=Math.cos(u);r.key.position.set(l*h*Math.sin(c),l*Math.sin(u),l*h*Math.cos(c))}r.fill&&(r.fill.color.set(n.fillColor||t.fillColor),r.fill.intensity=Number(n.fillIntensity??t.fillIntensity)),r.rim&&(r.rim.color.set(n.rimColor||t.rimColor),r.rim.intensity=Number(n.rimIntensity??t.rimIntensity)),r.hemi&&(r.hemi.color.set(n.hemiSky||t.hemiSky),r.hemi.groundColor.set(n.hemiGround||t.hemiGround),r.hemi.intensity=Number(n.hemiIntensity??t.hemiIntensity)),r.up&&(r.up.intensity=Number(n.upIntensity??t.upIntensity)),i.renderer.toneMappingExposure=Number(n.exposure??t.exposure),"environmentIntensity"in i.scene&&(i.scene.environmentIntensity=Number(n.envIntensity??t.envIntensity));const o=Number(n.skinGloss??t.skinGloss),a=Number(n.sssIntensity??t.sssIntensity);i.scene.traverse(l=>{var c,u;!l.isMesh||!l.material||(l.name==="HeadSkinMesh"||(c=l.material.userData)!=null&&c.uSssIntensity)&&((u=l.material.userData)!=null&&u.uSssIntensity&&(l.material.userData.uSssIntensity.value=a),l.material.roughness=Math.max(.28,.72-o*.34),l.material.clearcoat=Math.min(.45,.03+o*.24),l.material.clearcoatRoughness=Math.max(.18,.56-o*.28),l.material.specularIntensity=.28+o*.36)}),i.beautyPost&&typeof i.beautyPost.setGradeParams=="function"&&i.beautyPost.setGradeParams({bloomStrength:Number(n.bloomStrength??t.bloomStrength),vignette:Number(n.vignette??t.vignette),saturation:Number(n.saturation??t.saturation),contrast:Number(n.contrast??t.contrast),warmth:Number(n.warmth??t.warmth),sharpen:Number(n.sharpen??t.sharpen),filmGrain:Number(n.filmGrain??t.filmGrain),tint:n.tint||t.tint,shadowTint:n.shadowTint||t.shadowTint}),Qr(i.renderer),typeof i.wakeRender=="function"&&i.wakeRender(1.8,!0)}const Gv={low:{pixelRatioCap:1,shadowSize:0,envIntensity:.28,aniso:4},medium:{pixelRatioCap:1.5,shadowSize:1024,envIntensity:.46,aniso:8},high:{pixelRatioCap:2,shadowSize:2048,envIntensity:.5,aniso:8},ultra:{pixelRatioCap:2.5,studioPixelRatioCap:3,shadowSize:2048,studioShadowSize:4096,envIntensity:.54,aniso:16},rtx2070:{pixelRatioCap:1.5,studioPixelRatioCap:2,shadowSize:2048,studioShadowSize:2048,envIntensity:.48,aniso:16}};function mu(i,e="high"){var f,g,_;const t=Fv.includes(e)?e:"high",n=Gv[t],{renderer:s,scene:r}=i;if(!s||!r)return t;const o=!!i.controls,a=typeof window<"u"&&window.devicePixelRatio||1;let l=a;t==="rtx2070"?l=o?Math.max(a,1.75):Math.max(a,1.25):t==="ultra"?l=o?Math.max(a,2.5):Math.max(a,1.75):t==="high"&&o&&(l=Math.max(a,2));const c=o&&n.studioPixelRatioCap||n.pixelRatioCap;s.setPixelRatio(i.softwareRenderer?Math.min(a,1):Math.min(l,c));const u=Math.min(n.aniso||8,((g=(f=s.capabilities)==null?void 0:f.getMaxAnisotropy)==null?void 0:g.call(f))||8);(_=r.traverse)==null||_.call(r,m=>{(Array.isArray(m.material)?m.material:m.material?[m.material]:[]).forEach(x=>{["map","normalMap","roughnessMap","metalnessMap","emissiveMap","aoMap"].forEach(b=>{x[b]&&(x[b].anisotropy=u)})})});const h=o&&n.studioShadowSize||n.shadowSize,d=i.keyLight;if(d&&d.shadow&&(d.castShadow=h>0,h>0)){const m=d.shadow;m.mapSize.x!==h&&(m.mapSize.set(h,h),m.map&&(m.map.dispose(),m.map=null))}return"environmentIntensity"in r&&(r.environmentIntensity=n.envIntensity),Qr(s),i.currentRenderQuality=t,typeof i.wakeRender=="function"&&i.wakeRender(1.5,!0),t}function vl(i){try{const e=i.getContext(),t=e.getExtension("WEBGL_debug_renderer_info"),n=t?e.getParameter(t.UNMASKED_RENDERER_WEBGL):e.getParameter(e.RENDERER);return/swiftshader|llvmpipe|softpipe|software raster/i.test(String(n))}catch{return!1}}const jr=[{id:"glass_bell_jar",shortLabel:"玻璃钟罩",label:"🧪 维多利亚玻璃钟罩 + 黑金黄铜底座 (默认推荐)"},{id:"velvet_chalice",shortLabel:"丝绒圣杯",label:"👑 黑金丝绒高脚圣杯托座 (无罩露天鉴赏)"},{id:"formalin_cylinder",shortLabel:"福尔马林缸",label:"🧫 福尔马林圆柱标本缸 + 琥珀防腐液刻度"},{id:"acrylic_cube",shortLabel:"水晶方盒",label:"💎 博物馆亚克力水晶方盒 + 底射灯底座"},{id:"surgical_tray",shortLabel:"解剖浅盘",label:"🩸 法医不锈钢解剖浅盘 + 凝血标本垫"},{id:"none",shortLabel:"无外置容器",label:"🚫 无外置容器 (仅C4/C5解剖断面直接放置)"}],Vo=new Map;let Wo=null;function Vv(i="dark_obsidian"){if(Vo.has(i))return Vo.get(i);const e=document.createElement("canvas");e.width=1024,e.height=512;const t=e.getContext("2d"),n=e.width,s=e.height;if(i==="walnut_desk"){const o=t.createLinearGradient(0,0,0,s);o.addColorStop(0,"#2b1810"),o.addColorStop(.5,"#3b2217"),o.addColorStop(1,"#22120b"),t.fillStyle=o,t.fillRect(0,0,n,s);for(let a=0;a<240;a++){const l=a/240*s;t.strokeStyle=a%2===0?"rgba(18, 8, 4, 0.28)":"rgba(92, 54, 34, 0.18)",t.lineWidth=1+a%3,t.beginPath(),t.moveTo(0,l);for(let c=0;c<=n;c+=64)t.lineTo(c,l+Math.sin(c*.015+a*.4)*3.5);t.stroke()}t.fillStyle="rgba(18, 22, 30, 0.76)",t.fillRect(n*.08,s*.14,n*.84,s*.74),t.strokeStyle="#d4af37",t.lineWidth=3,t.strokeRect(n*.085,s*.15,n*.83,s*.72)}else if(i==="marble_museum"){const o=t.createLinearGradient(0,0,n,s);o.addColorStop(0,"#d8dde6"),o.addColorStop(.5,"#eef2f6"),o.addColorStop(1,"#cbd2de"),t.fillStyle=o,t.fillRect(0,0,n,s),t.strokeStyle="rgba(100, 116, 139, 0.26)";for(let a=0;a<28;a++){t.lineWidth=1+a%3*.8,t.beginPath();let l=a/28*n,c=0;for(t.moveTo(l,c);c<s;)c+=24,l+=Math.sin(c*.04+a)*14,t.lineTo(l,c);t.stroke()}t.strokeStyle="rgba(180, 142, 68, 0.65)",t.lineWidth=4,t.strokeRect(18,18,n-36,s-36)}else if(i==="surgical_steel"){const o=t.createLinearGradient(0,0,n,0);o.addColorStop(0,"#475569"),o.addColorStop(.5,"#64748b"),o.addColorStop(1,"#334155"),t.fillStyle=o,t.fillRect(0,0,n,s),t.strokeStyle="rgba(148, 163, 184, 0.22)",t.lineWidth=1;for(let a=0;a<=n;a+=32)t.beginPath(),t.moveTo(a,0),t.lineTo(a,s),t.stroke();for(let a=0;a<=s;a+=32)t.beginPath(),t.moveTo(0,a),t.lineTo(n,a),t.stroke();t.fillStyle="rgba(15, 23, 42, 0.75)",t.fillRect(0,s-38,n,38),t.strokeStyle="#38bdf8";for(let a=16;a<n-16;a+=16){const l=a%64===0?18:9;t.beginPath(),t.moveTo(a,s-4),t.lineTo(a,s-4-l),t.stroke()}}else{const o=t.createRadialGradient(n*.5,s*.55,40,n*.5,s*.5,n*.65);o.addColorStop(0,"#1e293b"),o.addColorStop(.6,"#0f172a"),o.addColorStop(1,"#090d16"),t.fillStyle=o,t.fillRect(0,0,n,s),t.strokeStyle="rgba(212, 175, 55, 0.28)",t.lineWidth=1.5;const a=8,l=4;for(let c=1;c<a;c++){const u=c/a*n;t.beginPath(),t.moveTo(u,0),t.lineTo(u,s),t.stroke()}for(let c=1;c<l;c++){const u=c/l*s;t.beginPath(),t.moveTo(0,u),t.lineTo(n,u),t.stroke()}t.strokeStyle="rgba(212, 175, 55, 0.78)",t.lineWidth=5,t.strokeRect(12,12,n-24,s-24),t.strokeStyle="rgba(56, 189, 248, 0.45)",t.lineWidth=2,t.strokeRect(24,24,n-48,s-48)}const r=new En(e);return r.colorSpace=Je,r.anisotropy=8,Vo.set(i,r),r}function Wv(){if(Wo)return Wo;const i=document.createElement("canvas");i.width=512,i.height=512;const e=i.getContext("2d");e.clearRect(0,0,512,512),e.strokeStyle="rgba(226, 232, 240, 0.55)",e.fillStyle="rgba(226, 232, 240, 0.65)",e.font="bold 14px monospace";for(let n=40;n<=460;n+=14){const s=(n-40)%70===0,r=s?28:12;if(e.lineWidth=s?2:1,e.beginPath(),e.moveTo(240,n),e.lineTo(240+r,n),e.stroke(),s){const o=Math.round((460-n)/420*2e3);e.fillText(`${o}ml`,274,n+5)}}const t=new En(i);return t.colorSpace=Je,Wo=t,t}function Xv(i,e={}){const t=e.floorStyle||"dark_obsidian",n=e.shelfLayout||"study_side_rack",s=new bt;s.name="ScreenSpaceStageGroup";const r=[],o=i.maxX-i.minX,a=i.maxY-i.minY,l=i.minZ,c=42,u=c-l,h=(l+c)*.5,d=i.minY+1.8;if(r.push({id:"main_floor",label:"底部主展台桌面",minX:-o*.85,maxX:o*.85,minZ:i.minZ,maxZ:i.maxZ,surfaceY:d,isMainFloor:!0}),t==="none")return{stageGroup:s,group:s,shelves:r,platforms:r};const f=Vv(t),g=t==="marble_museum",_=2.2,m=new _t({map:f,roughness:t==="walnut_desk"?.38:g?.24:.2,metalness:t==="surgical_steel"?.65:.08,clearcoat:.55,clearcoatRoughness:.22,envMapIntensity:.75}),p=new wt({color:t==="surgical_steel"?"#94a3b8":"#d4af37",roughness:.26,metalness:.82}),x=new kt(o*1.16,_,u),b=new oe(x,m);b.position.set(0,d-_*.5,h),b.receiveShadow=!0,s.add(b);const M=new kt(o*1.16,_*1.08,1.4),P=new oe(M,p);P.position.set(0,d-_*.48,2),P.receiveShadow=!0,s.add(P);const A=(R,E,S,w,L,N,G,V=1.6,q=!1)=>{const K=q?new yt(N*.5,N*.54,V,32):new kt(N,V,G),X=new oe(K,m);if(X.position.set(S,w-V*.5,L),X.castShadow=!0,X.receiveShadow=!0,s.add(X),q){const te=Math.max(2,w-V-d);if(te>2){const Q=new yt(N*.34,N*.4,te,24),ge=new wt({color:"#111827",roughness:.32,metalness:.25}),we=new oe(Q,ge);we.position.set(S,d+te*.5,L),we.castShadow=!0,we.receiveShadow=!0,s.add(we);const Oe=new ci(N*.46,.38,12,32);Oe.rotateX(Math.PI/2);const Z=new oe(Oe,p);Z.position.set(S,w-V,L),s.add(Z)}}else{const te=new kt(N+.4,V*.65,.9),Q=new oe(te,p);Q.position.set(S,w-V*.35,L+G*.5),s.add(Q);for(const ge of[-1,1]){const we=new kt(.8,3.6,G*.82),Oe=new oe(we,p);Oe.position.set(S+ge*(N*.42),w-V-1.6,L-G*.05),s.add(Oe)}}r.push({id:R,label:E,minX:S-N*.56,maxX:S+N*.56,minZ:L-G*.65,maxZ:L+G*.65,surfaceY:w,centerX:S,centerZ:L})};if(n==="study_side_rack"){const R=Math.max(22,o*.26),E=32,S=i.minX+R*.52,w=i.maxX-R*.52,L=d+a*.34,N=d+a*.64;A("shelf_left_mid","左侧伴学中层展架",S,L,-18,R,E),A("shelf_right_mid","右侧伴学中层展架",w,L,-18,R,E),A("shelf_left_high","左上伴学高层展架",S,N,-24,R*.92,E),A("shelf_right_high","右上伴学高层展架",w,N,-24,R*.92,E)}else if(n==="stepped_altar"){const R=d+a*.3,E=d+a*.16;A("altar_center_top","中央加冕主祭坛",0,R,-22,28,30,2.2),A("altar_left_step","左翼次级展台",-o*.28,E,-16,24,28,1.8),A("altar_right_step","右翼次级展台",o*.28,E,-16,24,28,1.8)}else if(n==="corner_pedestals"){const E=i.minX+16,S=i.maxX-16,w=i.minX+36,L=i.maxX-36;A("pedestal_L1","左外立柱台",E,d+15,-14,19,19,1.8,!0),A("pedestal_R1","右外立柱台",S,d+15,-14,19,19,1.8,!0),A("pedestal_L2","左内高立柱台",w,d+25,-28,19,19,1.8,!0),A("pedestal_R2","右内高立柱台",L,d+25,-28,19,19,1.8,!0)}else if(n==="bottom_gallery"){const R=[-o*.36,-o*.18,0,o*.18,o*.36];for(let E=0;E<R.length;E++){const S=R[E],w=new yt(8.8,9.4,.5,32),L=new oe(w,p);L.position.set(S,d+.25,-16),L.receiveShadow=!0,s.add(L)}}const C=e.decorStyle||"trophy_candles";if(C!=="none"){const R=new bt;R.name="StageSceneDecorGroup";const E=[{x:-o*.41,y:d,z:-12,scale:.92,rotY:.15},{x:o*.41,y:d,z:-12,scale:.92,rotY:-.25},{x:-o*.19,y:d,z:-10,scale:.85,rotY:.32},{x:o*.19,y:d,z:-10,scale:.85,rotY:-.18}];for(const S of r)S.isMainFloor||E.push({x:S.centerX+(S.centerX<0?-4.5:4.5),y:S.surfaceY,z:S.centerZ+3,scale:.72,rotY:S.centerX<0?.2:-.2});for(const S of E){const w=Yv(C,0);w.position.set(S.x,S.y,S.z),w.scale.setScalar(S.scale),w.rotation.y=S.rotY,R.add(w)}s.add(R)}return{stageGroup:s,group:s,shelves:r,platforms:r}}function jv(i="glass_bell_jar"){const e=new bt;if(e.name="SpecimenContainerGroup",e.userData.containerStyle=i,!i||i==="none")return e.userData.baseBottomOffset=-12.6,e;const t=new wt({color:"#d4af37",roughness:.24,metalness:.86}),n=new _t({color:"#111827",roughness:.18,metalness:.15,clearcoat:.75,clearcoatRoughness:.15}),s=new _t({color:"#58101d",roughness:.85,metalness:0,sheen:.92,sheenRoughness:.35,sheenColor:new he("#fb7185")}),r=new _t({color:"#f0f9ff",transparent:!0,opacity:.19,roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:.02,specularIntensity:1,ior:1.5,envMapIntensity:1.65,depthWrite:!1,side:ut});if(i==="glass_bell_jar"){const o=new oe(new yt(10.8,11.6,1.8,48),n);o.position.set(0,-14.5,-.5),o.castShadow=!0,o.receiveShadow=!0,e.add(o);const a=new oe(new yt(9.8,10.4,.7,48),t);a.position.set(0,-13.3,-.5),a.receiveShadow=!0,e.add(a);const l=new oe(new yt(8.2,8.8,.55,40),s);l.position.set(0,-12.75,-.5),l.receiveShadow=!0,e.add(l);const c=new oe(new kt(5.6,1,.4),t);c.position.set(0,-14.4,10.9),e.add(c);const u=new yt(9.9,9.9,18.5,48,1,!0),h=new oe(u,r);h.position.set(0,-3.8,-.5),e.add(h);const d=new ls(9.9,48,24,0,Math.PI*2,0,Math.PI*.5),f=new oe(d,r);f.position.set(0,5.45,-.5),e.add(f);const g=new oe(new ls(1.15,24,16),t);g.position.set(0,16.1,-.5),e.add(g),e.userData.baseBottomOffset=-15.4}else if(i==="velvet_chalice"){const o=new oe(new yt(8.2,9.6,1.4,40),n);o.position.set(0,-15.3,-.5),o.castShadow=!0,o.receiveShadow=!0,e.add(o);const a=new oe(new yt(3.2,4.6,2.4,32),t);a.position.set(0,-13.6,-.5),a.castShadow=!0,e.add(a);const l=new oe(new yt(8.8,5.2,1.4,40),n);l.position.set(0,-12.6,-.5),l.receiveShadow=!0,e.add(l);const c=new oe(new yt(8.2,8.5,.65,40),s);c.position.set(0,-12.1,-.5),c.receiveShadow=!0,e.add(c);const u=new oe(new ci(8.6,.26,12,48),t);u.rotateX(Math.PI/2),u.position.set(0,-12,-.5),e.add(u),e.userData.baseBottomOffset=-16}else if(i==="formalin_cylinder"){const o=new wt({color:"#94a3b8",roughness:.25,metalness:.85}),a=new oe(new yt(10.6,10.9,2,48),o);a.position.set(0,-14.4,-.5),a.castShadow=!0,a.receiveShadow=!0,e.add(a);const l=new _t({color:"#fef3c7",map:Wv(),transparent:!0,opacity:.26,roughness:.05,clearcoat:1,ior:1.48,envMapIntensity:1.5,depthWrite:!1,side:ut}),c=new oe(new yt(10.2,10.2,28.5,48,1,!0),l);c.position.set(0,.8,-.5),e.add(c);const u=new xt({color:"#fde68a",transparent:!0,opacity:.24,side:ut,depthWrite:!1}),h=new oe(new ui(.5,10.1,48),u);h.rotateX(-Math.PI/2),h.position.set(0,13.4,-.5),e.add(h);const d=new oe(new yt(10.7,10.5,1.5,48),o);d.position.set(0,15.6,-.5),e.add(d);const f=new oe(new ci(2.2,.35,12,32),t);f.position.set(0,17.2,-.5),e.add(f),e.userData.baseBottomOffset=-15.4}else if(i==="acrylic_cube"){const o=new oe(new kt(20.6,2.2,20.6),n);o.position.set(0,-14.3,-.5),o.castShadow=!0,o.receiveShadow=!0,e.add(o);const a=new ui(5.6,6.4,48);a.rotateX(-Math.PI/2);const l=new xt({color:"#38bdf8",transparent:!0,opacity:.72,side:ut}),c=new oe(a,l);c.position.set(0,-13.15,-.5),e.add(c);const u=new oe(new kt(19.6,28.2,19.6),r);u.position.set(0,.9,-.5),e.add(u);for(const h of[-1,1])for(const d of[-1,1]){const f=new oe(new yt(.22,.22,28.4,12),t);f.position.set(h*9.8,.9,-.5+d*9.8),e.add(f)}e.userData.baseBottomOffset=-15.4}else if(i==="surgical_tray"){const o=new wt({color:"#cbd5e1",roughness:.22,metalness:.88}),a=new oe(new yt(10.2,8.8,1.4,40),o);a.position.set(0,-13.4,-.5),a.castShadow=!0,a.receiveShadow=!0,e.add(a);const l=new oe(new ci(10.2,.42,12,48),o);l.rotateX(Math.PI/2),l.position.set(0,-12.7,-.5),e.add(l);const c=new _t({color:"#4c0519",roughness:.14,clearcoat:.95,clearcoatRoughness:.08}),u=new oe(new yt(6.8,7.2,.35,32),c);u.position.set(0,-12.6,-.5),e.add(u),e.userData.baseBottomOffset=-14.1}else e.userData.baseBottomOffset=-12.6;return e}function Yv(i="trophy_candles",e=-15.4){const t=new bt;if(t.name="SpecimenDecorGroup",t.userData.decorStyle=i,!i||i==="none")return t;const n=e;if(i==="trophy_candles"){const s=new wt({color:"#fef3c7",roughness:.42,metalness:0}),r=new xt({color:"#fbbf24"}),o=new xt({color:"#f59e0b",transparent:!0,opacity:.38,depthWrite:!1}),a=new wt({color:"#d4af37",roughness:.28,metalness:.85}),l=[{x:-12.2,z:3.5,h:5.2,r:1.05},{x:12,z:2.8,h:3.8,r:.95}];for(const h of l){const d=new oe(new yt(h.r*1.45,h.r*1.65,.6,20),a);d.position.set(h.x,n+.3,h.z),t.add(d);const f=new oe(new yt(h.r*.92,h.r,h.h,20),s);f.position.set(h.x,n+.6+h.h*.5,h.z),f.castShadow=!0,t.add(f);const g=new oe(new ul(.42,1.35,12),r);g.position.set(h.x,n+.6+h.h+.7,h.z),t.add(g);const _=new oe(new ls(1.35,16,12),o);_.position.set(h.x,n+.6+h.h+.7,h.z),t.add(_)}const c=new wt({color:"#881337",roughness:.62,side:ut}),u=[[-6.5,9.8,.3],[-3.2,11.2,-.4],[2.8,10.8,.8],[7.4,9.4,-.6],[-9.5,7.2,1.1],[9.2,6.8,.2]];for(const[h,d,f]of u){const g=new hl(.95,12);g.scale(1.35,.85,1),g.rotateX(-Math.PI/2);const _=new oe(g,c);_.position.set(h,n+.12,d),_.rotation.y=f,t.add(_)}}else if(i==="study_tomes"){const s=["#451a03","#1e1b4b","#3f1d28"],r=new wt({color:"#fef3c7",roughness:.7}),o=new wt({color:"#d4af37",roughness:.25,metalness:.85});for(let l=0;l<3;l++){const c=6.2-l*.4,u=8.4-l*.4,h=1.35,d=new wt({color:s[l],roughness:.55}),f=new oe(new kt(c,h,u),d);f.position.set(-13.4,n+h*(l+.5),1.5),f.rotation.y=.18-l*.14,f.castShadow=!0,t.add(f);const g=new oe(new kt(c*.94,h*.76,u*.94),r);g.position.copy(f.position),g.rotation.copy(f.rotation),t.add(g)}const a=new oe(new yt(1.8,1.8,.45,24),o);a.position.set(11.6,n+.45,5.2),a.rotation.x=-.22,t.add(a)}else if(i==="soul_siphon"){const s=new xt({color:"#fbbf24",transparent:!0,opacity:.55,side:ut}),r=new xt({color:"#38bdf8",transparent:!0,opacity:.42,side:ut}),o=new oe(new ui(11.8,12.3,64),s);o.rotateX(-Math.PI/2),o.position.set(0,n+.15,-.5),t.add(o);const a=new oe(new ui(10.6,10.9,64),r);a.rotateX(-Math.PI/2),a.position.set(0,n+.22,-.5),t.add(a);const l=new ls(.38,12,12);for(let c=0;c<10;c++){const u=c/10*Math.PI*2,h=11.2+c%2*1.4,d=n+3+c/10*22,f=new oe(l,c%2===0?s:r);f.position.set(Math.cos(u)*h,d,-.5+Math.sin(u)*h),t.add(f)}}else if(i==="forensic_evidence"){const s=new wt({color:"#facc15",roughness:.35,side:ut}),r=new bt;r.position.set(11.4,n,6.2),r.rotation.y=-.35;const o=new oe(new Pn(3.2,3.8),s);o.position.set(0,1.75,.65),o.rotation.x=-.34,r.add(o);const a=new oe(new Pn(3.2,3.8),s);a.position.set(0,1.75,-.65),a.rotation.x=.34,r.add(a),t.add(r)}return t}const qv=new I_;new _v;const Tr=new Map,lh="/models/daz_asian_head_base.glb",gu=115,$v=.58,Zv=-.035,fs=[{id:"dead_calm",label:"失活标本 · 默认微阖",shortLabel:"失活标本",desc:"瞳孔失焦、眼睑半阖、双唇松弛平直闭合（默认失活态）",weights:{}},{id:"dead_serene",label:"安详永眠 · 双目紧闭",shortLabel:"安详永眠",desc:"双目完全闭合、长睫低垂、面部肌肉彻底松弛安详",weights:{expr_serene:1}},{id:"dead_hollow",label:"死不瞑目 · 翻白微张",shortLabel:"死不瞑目",desc:"眼帘半垂、黑仁向上翻白、下颌松弛微张露出门齿",weights:{expr_hollow:1}},{id:"dead_shock",label:"惊愕断首 · 圆睁张口",shortLabel:"惊愕断首",desc:"双目惊恐圆睁、眉头高挑、下颌大张露出上下牙列与舌腔",weights:{expr_shock:1}},{id:"dead_rigor",label:"临终痉挛 · 尸僵咬牙",shortLabel:"临终痉挛",desc:"眉心紧锁、大小眼痉挛抽搐、鼻翼耸起、痛苦咧嘴露齿",weights:{expr_rigor:1}},{id:"dead_smile",label:"诡异尸笑 · 防腐微哂",shortLabel:"诡异尸笑",desc:"眼帘低垂、嘴角不对称诡异牵拉上扬（尸笑面容）",weights:{expr_smile:1}},{id:"dead_flaccid",label:"面瘫弛缓 · 歪嘴吐舌",shortLabel:"面瘫吐舌",desc:"单侧眼闭合、单侧翻白眼、下颌脱臼偏斜伴舌尖微吐",weights:{expr_flaccid:1}}];function Kv(i){const e=window.atob(i),t=e.length,n=new Uint8Array(t);for(let s=0;s<t;s++)n[s]=e.charCodeAt(s);return n.buffer}async function _u(i){if(Tr.has(i))return Tr.get(i);if(typeof window<"u"&&window.__EMBEDDED_GLBS__&&window.__EMBEDDED_GLBS__[i]){const s=Kv(window.__EMBEDDED_GLBS__[i]);return Tr.set(i,s),s}const e=await Uv(i),t=await fetch(e);if(!t.ok)throw new Error(`Failed to fetch GLB ${i}: ${t.status}`);const n=await t.arrayBuffer();return Tr.set(i,n),n}function vu(i){return new Promise((e,t)=>{qv.parse(i.slice(0),"",n=>e(n),n=>t(n))})}function Jv(i){var t;const e=(i==null?void 0:i.image)||((t=i==null?void 0:i.source)==null?void 0:t.data);return{width:Number((e==null?void 0:e.naturalWidth)||(e==null?void 0:e.videoWidth)||(e==null?void 0:e.width)||0),height:Number((e==null?void 0:e.naturalHeight)||(e==null?void 0:e.videoHeight)||(e==null?void 0:e.height)||0)}}function yu(i){if(!i)return;const e=["map","emissiveMap","specularColorMap","sheenColorMap"];for(const t of e){const n=i[t];n!=null&&n.isTexture&&(n.colorSpace=Je,n.anisotropy=8,n.needsUpdate=!0)}for(const t of Object.keys(i)){const n=i[t];!(n!=null&&n.isTexture)||e.includes(t)||(n.colorSpace=Rn,n.anisotropy=8,n.needsUpdate=!0)}}function Qv(i){const e=new Set,t=new Set,n={meshes:0,vertices:0,triangles:0,materials:0,textures:0,maxTextureSize:0,hasNormalMap:!1,hasRoughnessMap:!1,hasDisplacementMap:!1};return i.traverse(s=>{var a,l,c,u;if(!s.isMesh)return;n.meshes+=1;const r=s.geometry;n.vertices+=((l=(a=r==null?void 0:r.attributes)==null?void 0:a.position)==null?void 0:l.count)||0,n.triangles+=r!=null&&r.index?Math.floor(r.index.count/3):Math.floor((((u=(c=r==null?void 0:r.attributes)==null?void 0:c.position)==null?void 0:u.count)||0)/3);const o=Array.isArray(s.material)?s.material:[s.material];for(const h of o)if(h){e.add(h),n.hasNormalMap||(n.hasNormalMap=!!h.normalMap),n.hasRoughnessMap||(n.hasRoughnessMap=!!h.roughnessMap),n.hasDisplacementMap||(n.hasDisplacementMap=!!h.displacementMap);for(const d of Object.keys(h)){const f=h[d];if(!(f!=null&&f.isTexture))continue;t.add(f);const{width:g,height:_}=Jv(f);n.maxTextureSize=Math.max(n.maxTextureSize,g,_)}}}),n.materials=e.size,n.textures=t.size,n}function ey(i){const t=new bn().setFromObject(i).getSize(new D),n=Math.max(t.x,t.z);if(!Number.isFinite(t.y)||t.y<.025||n<.025)throw new Error("模型尺寸无效或过小；请确认 GLB 中包含已裁切的头部网格。");const s=t.y/n;if(s>3.2)throw new Error("模型比例像是完整人体而不是单独头部；请先在 Blender/DAZ 中裁成头部并封好颈口，再导入。");const r=new bt;r.name="ImportedHeadFit",r.add(i),r.updateMatrixWorld(!0);const o=new bn().setFromObject(r),a=o.getSize(new D),l=o.getCenter(new D),c=$v/Math.max(a.y,1e-4);return r.scale.setScalar(c),r.position.set(-l.x*c,Zv-l.y*c,-l.z*c),r.userData.fitScale=c,r.userData.sourceAspect=s,r}const ch={user_photo:{jawVLine:.28,chinLength:-.58,cheekSoftness:.78,noseBridge:.25,eyeAlmond:.58,eyeTilt:-.12,lipFullness:0},chuxia:{jawVLine:.28,chinLength:-.58,cheekSoftness:.78,noseBridge:.25,eyeAlmond:.58,eyeTilt:-.12,lipFullness:0},female_realistic:{jawVLine:-.82,chinLength:.15,cheekSoftness:-.72,noseBridge:.85,eyeAlmond:.12,eyeTilt:.78,lipFullness:0},linxi:{jawVLine:-.82,chinLength:.15,cheekSoftness:-.72,noseBridge:.85,eyeAlmond:.12,eyeTilt:.78,lipFullness:0},female_2:{jawVLine:.95,chinLength:.45,cheekSoftness:.22,noseBridge:.65,eyeAlmond:.42,eyeTilt:.22,lipFullness:0},suwan:{jawVLine:.95,chinLength:.45,cheekSoftness:.22,noseBridge:.65,eyeAlmond:.42,eyeTilt:.22,lipFullness:0},female_3:{jawVLine:.82,chinLength:-.85,cheekSoftness:.75,noseBridge:.55,eyeAlmond:.85,eyeTilt:.88,lipFullness:0},qianxue:{jawVLine:.82,chinLength:-.85,cheekSoftness:.75,noseBridge:.55,eyeAlmond:.85,eyeTilt:.88,lipFullness:0},female_gentle:{jawVLine:.45,chinLength:.85,cheekSoftness:-.68,noseBridge:.75,eyeAlmond:.18,eyeTilt:.32,lipFullness:0},shenzhiwei:{jawVLine:.45,chinLength:.85,cheekSoftness:-.68,noseBridge:.75,eyeAlmond:.18,eyeTilt:.32,lipFullness:0},fangyaoping:{jawVLine:.18,chinLength:-.22,cheekSoftness:.62,noseBridge:.16,eyeAlmond:.38,eyeTilt:-.08,lipFullness:.08}},Xo=new Map;function ty(i,e="user_photo"){if(!(i!=null&&i.image)||typeof document>"u")return i;const t=i.image,n=t.width||t.naturalWidth||0,s=t.height||t.naturalHeight||0;if(!n||!s)return i;if(Xo.has(e))return Xo.get(e);const r=document.createElement("canvas");r.width=n,r.height=s;const o=r.getContext("2d");o.drawImage(t,0,0,n,s);const a=(c,u,h=2.6,d=.78)=>{const f=c*n,g=u*s,_=o.createRadialGradient(f,g,.2,f,g,h);_.addColorStop(0,`rgba(56, 34, 30, ${d})`),_.addColorStop(.55,`rgba(88, 56, 48, ${d*.65})`),_.addColorStop(1,"rgba(88, 56, 48, 0)"),o.fillStyle=_,o.beginPath(),o.arc(f,g,h,0,Math.PI*2),o.fill()};e==="user_photo"||e==="chuxia"?(a(.8847,.5543,n*.0016,.76),a(.8895,.564,n*.0017,.8),a(.9042,.5718,n*.0016,.78)):e==="female_realistic"||e==="linxi"?a(.8475,.4685,n*.0015,.82):e==="female_2"||e==="suwan"?a(.8492,.5562,n*.0014,.78):e==="female_3"||e==="qianxue"?(a(.8615,.5138,n*.0014,.8),a(.868,.464,n*.0013,.72)):(e==="female_gentle"||e==="shenzhiwei")&&a(.8915,.4775,n*.0015,.78);const l=new En(r);return l.colorSpace=Je,l.anisotropy=8,l.flipY=i.flipY,l.wrapS=i.wrapS,l.wrapT=i.wrapT,l.userData.sharedSkinMicro=!0,l.needsUpdate=!0,Xo.set(e,l),l}function ny(i){var g,_,m;const e=i.getObjectByName("HeadSkinMesh"),t=i.getObjectByName("Groom_ScalpRootDensity");if(!e||!t)return;const n=e.geometry,s=t.geometry,r=(g=n==null?void 0:n.attributes)==null?void 0:g.position,o=(_=s==null?void 0:s.attributes)==null?void 0:_.position;if(!r||!o||r.count!==o.count)return;s.userData.basePositions||(s.userData.basePositions=Float32Array.from(o.array));const a=o.array;a.set(s.userData.basePositions);const l=((m=n.morphAttributes)==null?void 0:m.position)||[],c=e.morphTargetDictionary,u=e.morphTargetInfluences,h=n.morphTargetsRelative!==!1,d=r.count;if(c&&u)for(const[,p]of Object.entries(c)){const x=u[p];if(!x||!Number.isFinite(x)||Math.abs(x)<1e-5)continue;const b=l[p];if(!(!b||b.count<d))for(let M=0;M<d;M++){let P=h?b.getX(M):b.getX(M)-r.getX(M),A=h?b.getY(M):b.getY(M)-r.getY(M),C=h?b.getZ(M):b.getZ(M)-r.getZ(M);if(!Number.isFinite(P)||!Number.isFinite(A)||!Number.isFinite(C))continue;P=Math.max(-.025,Math.min(.025,P)),A=Math.max(-.025,Math.min(.025,A)),C=Math.max(-.025,Math.min(.025,C));const R=M*3;a[R]+=P*x,a[R+1]+=A*x,a[R+2]+=C*x}}let f=0;for(let p=0;p<a.length;p++)f=Math.max(f,Math.abs(a[p]));(!Number.isFinite(f)||f>.6)&&a.set(s.userData.basePositions),o.needsUpdate=!0,s.computeBoundingSphere()}function Xs(i,e={}){if(!i)return;i.userData.currentMorphs={...i.userData.currentMorphs||{},...e};const t=i.userData.currentMorphs,n=i.userData.basePreset||"user_photo",s=ch[n]||ch.user_photo,r=(t.jawVLine??-(t.jawWidth??0))+s.jawVLine*.85,o=(t.chinLength??0)+(s.chinLength??0)*.85,a=(t.cheekSoftness??t.cheekboneFullness??0)+s.cheekSoftness*.85,l=(t.noseBridge??t.noseBridgeHeight??0)+s.noseBridge*.85,c=(t.eyeAlmond??t.eyeSize??0)+s.eyeAlmond*.85,u=(t.eyeTilt??0)+(s.eyeTilt??0)*.85,h=(t.lipFullness??0)+s.lipFullness*.4,d=Number(t.foreheadHeight??0),f=Number(t.earSize??0),g=t.deadExpression||i.userData.deadExpression||"dead_calm";i.userData.deadExpression=g;const m=(fs.find(L=>L.id===g)||fs[0]).weights||{},p=Math.max(0,Math.min(1.2,Number(t.jawOpen??0))),x=Math.max(0,Math.min(1.2,Number(t.jawSide??0))),b=Math.max(0,Math.min(1.2,Number(t.tongueOut??0))),M=Math.max(0,Math.min(1.2,Number(t.eyeRollUp??0))),P=Math.max(0,Math.min(1,Number(t.eyeClose??0))),A=Math.max(0,Math.min(1,Number(t.eyeWide??0))),C=Math.max(-.5,Math.min(1.2,Number(t.hairLength??0))),R=Math.max(-.5,Math.min(1.2,Number(t.hairVolume??0))),E=Math.max(-.5,Math.min(1.2,Number(t.bangsLength??0))),S={face_jaw_width_decr:r>0?Math.min(1.15,r*1.15):0,face_jaw_width_incr:r<0?Math.min(1.15,-r*1.15):0,face_chin_incr:o>0?Math.min(1.1,o*1.1):0,face_chin_decr:o<0?Math.min(1.1,-o*1.1):0,face_cheekbones_incr:a>0?Math.min(1.15,a*1.15):0,face_cheekbones_decr:a<0?Math.min(1.15,-a*1.15):0,face_nose_height_incr:l>0?Math.min(1.15,l*1.15):0,face_nose_height_decr:l<0?Math.min(1.15,-l*1.15):0,face_nose_width_decr:l>0?Math.min(.9,l*.75):0,face_nose_width_incr:l<0?Math.min(.9,-l*.75):0,face_eye_size_incr:c>0?Math.min(.95,c*1):0,face_eye_size_decr:c<0?Math.min(.95,-c*1):0,face_eye_tilt_incr:u>0?Math.min(1,u*1.05):0,face_eye_tilt_decr:u<0?Math.min(1,-u*1.05):0,face_lips_incr:h>0?Math.min(.75,h*.85):0,face_lips_decr:h<0?Math.min(.95,-h*1.15):0,face_mouth_width_decr:0,face_forehead_incr:d>0?Math.min(1,d*1.2):0,face_forehead_decr:d<0?Math.min(1,-d*1.2):0,face_ear_size_incr:f>0?Math.min(1,f*1.2):0,face_ear_size_decr:f<0?Math.min(1,-f*1.2):0,blink_left:P,blink_right:P,look_left:0,look_right:0,look_up:M*.65,look_down:0,expr_serene:Number(m.expr_serene??0),expr_hollow:Number(m.expr_hollow??0),expr_shock:Number(m.expr_shock??0),expr_rigor:Number(m.expr_rigor??0),expr_smile:Number(m.expr_smile??0),expr_flaccid:Number(m.expr_flaccid??0),jaw_open:p,jaw_side:x,tongue_out:b,eye_wide:A,hair_length:C,hair_volume:R,bangs_length:E};i.traverse(L=>{if(!L.isMesh||!L.morphTargetDictionary||!L.morphTargetInfluences)return;const N=L.morphTargetDictionary,G=L.morphTargetInfluences;for(const[V,q]of Object.entries(S))V in N&&(G[N[V]]=q)}),Rv(i,t),ny(i);const w=i.getObjectByName("NeckCrossSectionCap");if(w){const L=Number(t.cutHeightOffset??0);w.position.y=L/gu*.35}}function iy(i="#ffe8df"){const e=new he(i||"#ffe8df"),t=Math.min(1.06,Math.max(.82,.75+e.r*.27)),n=Math.min(1.05,Math.max(.79,.75+e.g*.28)),s=Math.min(1.05,Math.max(.78,.75+e.b*.29));return new he(t,n,s)}function sy(i="groom_photo_tied"){if(["groom_photo_tied","groom_center_long","groom_low_chignon","groom_air_bob","groom_clavicle_bob","groom_hime_cut","groom_high_ponytail","groom_pixie_short"].includes(i))return i;if(i==="none")return"none";const e=String(i).replace(/^real_/,""),t={user_bangs:"hair_user_photo",photo_tied_wisps:"hair_user_photo",long_straight:"hair_long01",long_waves:"hair_short04",hime_cut:"groom_hime_cut",hair_hime_cut:"groom_hime_cut",clavicle_layer:"groom_clavicle_bob",hair_clavicle_layer:"groom_clavicle_bob",butterfly_halfup:"groom_center_long",hair_butterfly_halfup:"groom_center_long",sleek_bob:"hair_bob01",short_bob:"hair_bob02",low_chignon:"hair_braid01",high_ponytail:"hair_ponytail01",soft_waves:"hair_braid01"},n=t[e]||t[i]||e;return new Set(["hair_user_photo","hair_long01","hair_bob01","hair_bob02","hair_ponytail01","hair_braid01","hair_short02","hair_short04","groom_photo_tied","groom_center_long","groom_low_chignon","groom_air_bob","groom_clavicle_bob","groom_hime_cut","groom_high_ponytail","groom_pixie_short"]).has(n)?n:"hair_user_photo"}function Wn(i){if(!i)return;const e=new Set,t=new Set,n=new Set;i.traverse(s=>{var r,o;if(s.isMesh){s.geometry&&e.add(s.geometry);for(const a of Array.isArray(s.material)?s.material:[s.material])if(a){t.add(a);for(const l of Object.values(a))l!=null&&l.isTexture&&!((r=l.userData)!=null&&r.sharedHairAtlas)&&!((o=l.userData)!=null&&o.sharedSkinMicro)&&n.add(l)}}}),e.forEach(s=>s.dispose()),t.forEach(s=>s.dispose()),n.forEach(s=>s.dispose()),i.removeFromParent()}function ry(i,e){var n;const t=Math.max(.2,Math.min(1,Number(e)||.88));(n=i==null?void 0:i.getObjectByName("HairGroup"))==null||n.traverse(s=>{var r,o;if(!(!s.isMesh||!((o=(r=s.material)==null?void 0:r.userData)!=null&&o.builtInHair))){if(s.material.userData.curveGroom){s.material.roughness=.6-t*.18,s.material.specularIntensity=.3+t*.2;return}s.material.sheen=Math.min(.24,t*.25),s.material.roughness=s.material.roughnessMap?1:.65-t*.12,s.material.anisotropy=.35+t*.35}})}async function xu(i,e={}){var u,h;const t=i.getObjectByName("RealDazHeadContainer");if(!t)return null;const n=t.getObjectByName("ScalpCap");n&&(n.removeFromParent(),n.geometry.dispose(),n.material.dispose());const s=(i.userData.hairRequestSerial||0)+1;i.userData.hairRequestSerial=s;const r=t.getObjectByName("HairGroup"),o=e.hairStyle||((u=e.materials)==null?void 0:u.hairStyle)||"hair_user_photo",a=sy(o);if(a==="none"&&!e.customHairUrl)return Wn(r),delete i.userData.groomStats,i.userData.currentHairStyle="none",null;const l=e.customHairUrl?null:hu(a);if(l)try{const d=await Av(l,i.getObjectByName("HeadSkinMesh"),e);return i.userData.hairRequestSerial!==s?(Wn(d),null):(Wn(r),t.add(d),i.userData.currentHairStyle=l,i.userData.groomStats=d.userData.groom,i.userData.currentMorphs&&Xs(i,i.userData.currentMorphs),d)}catch(d){throw console.error("Groom 曲线构建失败",d),d}delete i.userData.groomStats;const c=e.customHairUrl||`/models/${a}.glb`;try{const d=await _u(c),f=await vu(d);if(i.userData.hairRequestSerial!==s)return Wn(f.scene),null;const g=new bt;g.name="HairGroup";const _=e.hairColor||((h=e.materials)==null?void 0:h.hairColorHex)||"#191518",p=new he(_).clone().lerp(new he(4799036),.18),x=Number(e.hairSheen??.88);return f.scene.traverse(b=>{if(b.isMesh){if(e.customHairUrl){(Array.isArray(b.material)?b.material:[b.material]).forEach(yu),b.castShadow=b.receiveShadow=!0;return}b.userData.normalRepair=Cv(b.geometry);const M=b.material;let P=(M==null?void 0:M.map)||null,A=null;if(P){P.colorSpace=Je,P.anisotropy=8;try{const S=P.image,w=S&&(S.width||S.naturalWidth)||0;if(S&&w>0){const L=Dv(P,`${c}|${M.name}|${P.name}`);P=L.map,A=L.roughnessMap}}catch(S){console.warn("Hair detail enhancement unavailable; retaining original atlas",S),A=null}}const C=.299*p.r+.587*p.g+.114*p.b,R=.32+Math.min(.38,C*.6),E=Math.min(.3,x*.32);b.material=new _t({map:P,roughnessMap:A,color:p,roughness:A?1:Math.max(.36,.62-x*.16),metalness:0,sheen:E,sheenRoughness:.55,sheenColor:p.clone().multiplyScalar(1.15),anisotropy:.35+x*.35,anisotropyRotation:Math.PI/2,clearcoat:.09,clearcoatRoughness:.4,specularIntensity:.75,envMapIntensity:R,transparent:!1,alphaTest:P?.14:0,alphaToCoverage:!0,depthWrite:!0,side:ut}),b.material.userData.builtInHair=!0,b.castShadow=!0,b.receiveShadow=!0}}),g.add(f.scene),Wn(r),t.add(g),i.userData.currentHairStyle=a,i.userData.currentMorphs&&Xs(i,i.userData.currentMorphs),g}catch(d){return console.warn("Failed to load real 3D hair GLB:",c,d),null}}function oy(){const i=new bt;i.name="RotationGimbalGroup",i.visible=!1;const e=new ci(13.2,.16,12,64),t=new xt({color:"#38bdf8",transparent:!0,opacity:.3}),n=new oe(e,t);n.userData.planeNormal=new D(0,0,1),n.userData.baseOpacity=.3,i.add(n);const s=new ci(12.4,.12,12,64);s.rotateY(Math.PI/2);const r=new xt({color:"#f43f5e",transparent:!0,opacity:.22}),o=new oe(s,r);return o.userData.planeNormal=new D(1,0,0),o.userData.baseOpacity=.22,i.add(o),i}async function Mu(i={}){var P,A,C,R,E;const e=new bt;e.name=`Collectible_${i.id||"StudioDraft"}`,e.userData.collectibleId=i.id||"StudioDraft",e.userData.basePreset=i.basePreset||"user_photo",e.userData.deadExpression=i.deadExpression||((P=i.morphs)==null?void 0:P.deadExpression)||"dead_calm";const t={...i.morphs||{},deadExpression:i.deadExpression||((A=i.morphs)==null?void 0:A.deadExpression)||"dead_calm"},n=i.materials||{};e.userData.currentMorphs={...t};const s=new bt;s.name="RealDazHeadContainer",s.scale.setScalar(gu),e.add(s);const r=i.skinTone||n.skinToneHex||"#ffe9df",o=Number(((C=i.anatomyOptions)==null?void 0:C.wetness)??n.crossSectionWetness??.92),a=Number(((R=i.anatomyOptions)==null?void 0:R.vascularContrast)??n.crossSectionVeinContrast??1.25),l=!!((E=i.anatomyOptions)!=null&&E.showLabels),{colorTex:c,bumpTex:u}=yv({skinColor:r,vascularContrast:a,dermisRimScale:1,showLabels:l}),h=i.customModelUrl||i.modelUrl,d=h&&(i.customModelType==="obj"||h.endsWith(".obj")),f=!h||d||h.includes("daz_asian_female_")?lh:h,g=f===lh,_=await _u(f),m=await vu(_),p=Qv(m.scene);let x=null,b=null;m.scene.traverse(S=>{var L,N,G,V,q,K,X,te;if(!S.isMesh)return;S.castShadow=!0,S.receiveShadow=!0;const w=((L=S.material)==null?void 0:L.name)||S.name;if(!g){(Array.isArray(S.material)?S.material:[S.material]).forEach(yu),x||(x=S);return}if(w==="Skin"||S.name==="HeadSkin"){S.name="HeadSkinMesh",x=S,S.geometry.userData=S.geometry.userData||{},S.geometry.userData.parentHeadGroup=e,S.userData.basePositions=!0;const Q=((N=S.material)==null?void 0:N.map)||null,ge=((G=S.material)==null?void 0:G.normalMap)||null;Q&&(Q.colorSpace=Je,Q.anisotropy=8);const we=ty(Q,e.userData.basePreset||"user_photo"),Oe=xv();for(const ee of Object.values(Oe))ee!=null&&ee.isTexture&&(ee.userData.sharedSkinMicro=!0);const Z=new _t({map:we,normalMap:ge,normalScale:new xe(.38,.38),roughnessMap:Oe.roughnessMap,bumpMap:Oe.bumpMap,bumpScale:.012,color:iy(r),roughness:Number(n.skinRoughness??.54),metalness:0,sheen:.24,sheenRoughness:.52,sheenColor:new he("#f2afa6"),clearcoat:.08,clearcoatRoughness:.44,specularIntensity:.42,ior:1.41,envMapIntensity:.42,emissive:new he("#000000"),emissiveIntensity:0});kv(Z),S.material=Z}else if(w==="NeckCrossSection"||S.name==="NeckCrossSection")S.name="NeckCrossSectionCap",b=S,S.geometry.userData=S.geometry.userData||{},S.geometry.userData.parentHeadGroup=e,S.userData.basePositions=!0,S.material=new _t({map:c,emissiveMap:c,emissive:new he("#ffffff"),emissiveIntensity:.32,bumpMap:u,bumpScale:.005,roughness:Math.max(.34,.72-o*.4),metalness:0,clearcoat:.25,clearcoatRoughness:.35,specularIntensity:.4,envMapIntensity:.32,side:ut});else if(w==="Eye"){const Q=((V=S.material)==null?void 0:V.map)||null;Q&&(Q.colorSpace=Je,Q.anisotropy=8),S.material=new _t({map:Q,roughness:.05,metalness:0,clearcoat:.94,clearcoatRoughness:.02,specularIntensity:.95,ior:1.38,envMapIntensity:1.32})}else if(w==="Cornea")S.material=new _t({color:new he("#ffffff"),transparent:!0,opacity:.04,roughness:.02,metalness:0,clearcoat:.65,clearcoatRoughness:.01,specularIntensity:.75,ior:1.38,envMapIntensity:.62,depthWrite:!1});else if(w==="Eyebrow"){const Q=((q=S.material)==null?void 0:q.map)||null;S.material=new wt({map:Q,color:new he("#201615"),transparent:!0,alphaTest:.04,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2,roughness:.58,envMapIntensity:.45,side:ut})}else if(w==="Eyelash"){const Q=((K=S.material)==null?void 0:K.map)||null;S.material=new wt({map:Q,color:new he("#0c090a"),transparent:!0,alphaTest:.06,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2,roughness:.36,envMapIntensity:.45,side:ut})}else if(w==="Teeth"||S.name==="Teeth"){const Q=((X=S.material)==null?void 0:X.map)||null;Q&&(Q.colorSpace=Je),S.material=new _t({map:Q,color:new he("#f4ede2"),roughness:.18,metalness:0,clearcoat:.75,clearcoatRoughness:.1,ior:1.52,envMapIntensity:.65,side:ut})}else if(w==="Tongue"||S.name==="Tongue"){const Q=((te=S.material)==null?void 0:te.map)||null;Q&&(Q.colorSpace=Je),S.material=new _t({map:Q,color:new he("#d6747a"),roughness:.28,metalness:0,clearcoat:.65,clearcoatRoughness:.16,sheen:.35,sheenColor:new he("#ff9aa2"),envMapIntensity:.55,side:ut})}}),e.userData.assetStats={...p,source:g?"built-in-demo":"user-glb"},g?s.add(m.scene):s.add(ey(m.scene)),await xu(e,i),Xs(e,t),Ei(e,i);const M=oy();return e.add(M),e.userData.gimbalGroup=M,e.userData.headMesh=x,e.userData.capMesh=b,e}function Ei(i,e={}){if(!i)return;const t=i.getObjectByName("SpecimenContainerGroup");t&&i.remove(t);const n=i.getObjectByName("SpecimenDecorGroup");n&&i.remove(n);const s=e.groomLod==="studio"?e.studioContainerStyle||"none":"glass_bell_jar",r=e.containerStyle||s,o=jv(r);i.add(o);const a=o.userData.baseBottomOffset??-12.6;i.userData.containerGroup=o,i.userData.containerStyle=r,i.userData.baseBottomOffset=a}class ay{constructor(){this.ctx=null,this.enabled=!0,this.masterVolume=.75,this.pickupVolume=.85,this.dragVolume=.7,this.collisionVolume=.9,this.depthTickVolume=.65,this.dragGain=null,this.dragFilter=null,this.dragPanner=null,this.lastDepthTickTime=0,this.lastCollisionTime=0}ensureContext(){if(!this.enabled)return null;if(!this.ctx){const e=window.AudioContext||window.webkitAudioContext;if(!e)return null;this.ctx=new e}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}createPanner(e,t=0){if(e.createStereoPanner){const n=e.createStereoPanner();return n.pan.value=Math.max(-1,Math.min(1,t)),n.connect(e.destination),n}return e.destination}playPickup(e=0){const t=this.ensureContext();if(!t)return;const n=t.currentTime,s=this.createPanner(t,e),r=this.masterVolume*this.pickupVolume,o=t.createOscillator(),a=t.createGain();o.type="triangle",o.frequency.setValueAtTime(92,n),o.frequency.exponentialRampToValueAtTime(178,n+.085),a.gain.setValueAtTime(.001,n),a.gain.linearRampToValueAtTime(.36*r,n+.012),a.gain.exponentialRampToValueAtTime(.001,n+.13),o.connect(a),a.connect(s),o.start(n),o.stop(n+.14);const l=t.createOscillator(),c=t.createGain();l.type="sine",l.frequency.setValueAtTime(680,n),l.frequency.exponentialRampToValueAtTime(340,n+.035),c.gain.setValueAtTime(.18*r,n),c.gain.exponentialRampToValueAtTime(.001,n+.04),l.connect(c),c.connect(s),l.start(n),l.stop(n+.045)}playRelease(e=0){const t=this.ensureContext();if(!t)return;this.stopDragWhoosh();const n=t.currentTime,s=this.createPanner(t,e),r=this.masterVolume*this.pickupVolume,o=t.createOscillator(),a=t.createGain();o.type="sine",o.frequency.setValueAtTime(155,n),o.frequency.exponentialRampToValueAtTime(76,n+.11),a.gain.setValueAtTime(.28*r,n),a.gain.exponentialRampToValueAtTime(.001,n+.12),o.connect(a),a.connect(s),o.start(n),o.stop(n+.13)}startDragWhoosh(){const e=this.ensureContext();if(!e||this.dragGain)return;const t=e.sampleRate*1.5,n=e.createBuffer(1,t,e.sampleRate),s=n.getChannelData(0);let r=0,o=0,a=0;for(let d=0;d<t;d++){const f=Math.random()*2-1;r=.997*r+f*.029,o=.985*o+f*.032,a=.95*a+f*.048,s[d]=(r+o+a)*.35}const l=e.createBufferSource();l.buffer=n,l.loop=!0;const c=e.createBiquadFilter();c.type="bandpass",c.frequency.value=240,c.Q.value=2.2;const u=e.createGain();u.gain.value=1e-4;const h=this.createPanner(e,0);l.connect(c),c.connect(u),u.connect(h),l.start(),this.dragNoise=l,this.dragFilter=c,this.dragGain=u,this.dragPanner=h}updateDragWhoosh(e=0,t=0){if(!this.enabled||(this.dragGain||this.startDragWhoosh(),!this.ctx||!this.dragGain))return;const n=this.ctx.currentTime,s=Math.max(0,Math.min(1,e)),r=160+s*680,o=s*.26*this.masterVolume*this.dragVolume;this.dragFilter.frequency.setTargetAtTime(r,n,.03),this.dragGain.gain.setTargetAtTime(Math.max(1e-4,o),n,.035),this.dragPanner&&this.dragPanner.pan&&this.dragPanner.pan.setTargetAtTime(Math.max(-1,Math.min(1,t)),n,.03)}stopDragWhoosh(){if(!(!this.dragGain||!this.ctx)){try{const e=this.ctx.currentTime;this.dragGain.gain.setTargetAtTime(1e-4,e,.04);const t=this.dragNoise;setTimeout(()=>{try{t&&t.stop()}catch{}},120)}catch{}this.dragNoise=null,this.dragFilter=null,this.dragGain=null,this.dragPanner=null}}playBoxWallCollision(e=.7,t="side",n=0){const s=this.ensureContext();if(!s)return;const r=performance.now();if(r-this.lastCollisionTime<55)return;this.lastCollisionTime=r;const o=s.currentTime,a=this.createPanner(s,n),l=Math.max(.15,Math.min(1,e))*this.masterVolume*this.collisionVolume,c=s.createOscillator(),u=s.createGain();c.type="sine";const h=t==="front_glass"?115:t==="back_wall"?68:88;c.frequency.setValueAtTime(h*1.4,o),c.frequency.exponentialRampToValueAtTime(h*.55,o+.16),u.gain.setValueAtTime(.48*l,o),u.gain.exponentialRampToValueAtTime(.001,o+.18),c.connect(u),u.connect(a),c.start(o),c.stop(o+.19);const d=s.createOscillator(),f=s.createGain();d.type="triangle";const g=t==="front_glass"?640:t==="pet"?420:510;d.frequency.setValueAtTime(g,o),d.frequency.exponentialRampToValueAtTime(g*.72,o+.09),f.gain.setValueAtTime(.18*l,o),f.gain.exponentialRampToValueAtTime(.001,o+.095),d.connect(f),f.connect(a),d.start(o),d.stop(o+.1)}playDepthTick(e=.3,t=0){const n=this.ensureContext();if(!n)return;const s=performance.now();if(s-this.lastDepthTickTime<35)return;this.lastDepthTickTime=s;const r=n.currentTime,o=this.createPanner(n,t),a=this.masterVolume*this.depthTickVolume,l=520-e*290,c=n.createOscillator(),u=n.createGain();c.type="sine",c.frequency.setValueAtTime(l,r),c.frequency.exponentialRampToValueAtTime(l*.78,r+.045),u.gain.setValueAtTime(.16*a,r),u.gain.exponentialRampToValueAtTime(.001,r+.05),c.connect(u),u.connect(o),c.start(r),c.stop(r+.055)}playRotationModeToggle(e=!0,t=0){const n=this.ensureContext();if(!n)return;const s=n.currentTime,r=this.createPanner(n,t),o=this.masterVolume*.8;(e?[440,660]:[620,410]).forEach((l,c)=>{const u=n.createOscillator(),h=n.createGain();u.type="triangle";const d=s+c*.055;u.frequency.setValueAtTime(l,d),u.frequency.exponentialRampToValueAtTime(l*1.06,d+.07),h.gain.setValueAtTime(.22*o,d),h.gain.exponentialRampToValueAtTime(.001,d+.085),u.connect(h),h.connect(r),u.start(d),u.stop(d+.09)})}playSummon(e=!0){const t=this.ensureContext();if(!t)return;const n=t.currentTime,s=this.masterVolume*.75;(e?[220,330,440,659.25]:[523.25,392,261.63]).forEach((o,a)=>{const l=t.createOscillator(),c=t.createGain();l.type="sine";const u=n+a*.045;l.frequency.setValueAtTime(o,u),c.gain.setValueAtTime(.14*s,u),c.gain.exponentialRampToValueAtTime(.001,u+.28),l.connect(c),c.connect(t.destination),l.start(u),l.stop(u+.3)})}}const Ve=new ay,Su={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Ri{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const ly=new Zr(-1,1,1,-1,0,1);class cy extends St{constructor(){super(),this.setAttribute("position",new Ke([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ke([0,2,0,0,2,0],2))}}const hy=new cy;class eo{constructor(e){this._mesh=new oe(hy,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ly)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class bu extends Ri{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof zt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Ws.clone(e.uniforms),this.material=new zt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new eo(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class hh extends Ri{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class uy extends Ri{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class dy{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new xe);this._width=n.width,this._height=n.height,t=new en(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:qn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new bu(Su),this.copyPass.material.blending=Cn,this.clock=new pl}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}hh!==void 0&&(o instanceof hh?n=!0:o instanceof uy&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new xe);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class fy extends Ri{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new he}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}}const py={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new he(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class ps extends Ri{constructor(e,t,n,s){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new xe(e.x,e.y):new xe(256,256),this.clearColor=new he(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new en(r,o,{type:qn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){const d=new en(r,o,{type:qn});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const f=new en(r,o,{type:qn});f.texture.name="UnrealBloomPass.v"+h,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),r=Math.round(r/2),o=Math.round(o/2)}const a=py;this.highPassUniforms=Ws.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new zt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new xe(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const u=Su;this.copyUniforms=Ws.clone(u.uniforms),this.blendMaterial=new zt({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:Fr,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new he,this.oldClearAlpha=1,this.basic=new xt,this.fsQuad=new eo(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new xe(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=ps.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=ps.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new zt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new xe(.5,.5)},direction:{value:new xe(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new zt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}ps.BlurDirectionX=new xe(1,0);ps.BlurDirectionY=new xe(0,1);const my={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class gy extends Ri{constructor(){super();const e=my;this.uniforms=Ws.clone(e.uniforms),this.material=new Q0({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new eo(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ze.getTransfer(this._outputColorSpace)===lt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Sh?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===bh?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Eh?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ya?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===wh?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Th&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const uh={uniforms:{tDiffuse:{value:null},tSourceAlpha:{value:null},uResolution:{value:new xe(1280,720)},uVignette:{value:.32},uSaturation:{value:1.1},uContrast:{value:1.08},uWarmth:{value:.04},uSharpen:{value:.42},uFilmGrain:{value:0},uTint:{value:new D(1,.99,.97)},uShadowTint:{value:new D(.02,.01,.03)}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform sampler2D tSourceAlpha;
    uniform vec2 uResolution;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uWarmth;
    uniform float uSharpen;
    uniform float uFilmGrain;
    uniform vec3 uTint;
    uniform vec3 uShadowTint;
    varying vec2 vUv;

    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
      col = clamp(col, 0.0, 2.0);

      // 1. 5-Tap Micro-Detail Unsharp Mask (Pores, Eyelashes, Iris & Hair Strands Clarity)
      if (uSharpen > 0.001) {
        vec2 texel = 1.0 / max(uResolution, vec2(256.0));
        vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
        vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
        vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
        vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;
        vec3 blur = 0.25 * (n + s + e + w);
        vec3 detail = clamp(col - blur, -0.25, 0.25);
        col = clamp(col + detail * (uSharpen * 1.45), 0.0, 2.0);
      }

      // 2. Color Temperature Warmth Shift
      col.r += uWarmth * 0.075;
      col.g += uWarmth * 0.018;
      col.b -= uWarmth * 0.075;
      col = max(col, vec3(0.0));

      // 3. Highlight / Midtone Art-Style Tint & Shadow Split-Toning
      col *= uTint;
      float lumaPre = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = clamp(1.0 - smoothstep(0.0, 0.45, lumaPre), 0.0, 1.0);
      col += uShadowTint * shadowMask * 0.45;

      // 4. S-Curve Contrast pivoted at 0.18 middle grey
      col = (col - vec3(0.18)) * uContrast + vec3(0.18);
      col = max(col, vec3(0.0));

      // 5. Saturation
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);

      // 6. Optional Subtle Film Grain
      if (uFilmGrain > 0.001) {
        float noise = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        col += noise * uFilmGrain * 0.12;
      }

      // 7. Cinema Vignette (RGB only, preserves alpha)
      vec2 d = vUv - vec2(0.5);
      float v = 1.0 - uVignette * smoothstep(0.15, 0.75, length(d) * 1.35);
      col *= v;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), texture2D(tSourceAlpha, vUv).r);
    }
  `};function Eu(i,e,t,n={}){const s=Math.max(2,Math.floor(n.width||512)),r=Math.max(2,Math.floor(n.height||512)),o=vl(i),a=1,l=(n.pixelRatio||i.getPixelRatio())*a,c=new en(s,r,{type:Mn,samples:o?0:Math.min(4,i.capabilities.maxSamples||0)}),u=new dy(i,c);u.setPixelRatio(l),u.setSize(s,r);const h=new fy(e,t),d=new en(2,2,{format:qr,type:Mn,depthBuffer:!1,stencilBuffer:!1}),f=new zt({uniforms:{tDiffuse:{value:null}},vertexShader:uh.vertexShader,fragmentShader:"uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tDiffuse,vUv).a,0.0,0.0,1.0); }",depthTest:!1,depthWrite:!1,toneMapped:!1,blending:Cn}),g=new eo(f),_=new Ri;_.needsSwap=!1,_.render=(R,E,S)=>{f.uniforms.tDiffuse.value=S.texture,R.setRenderTarget(d),g.render(R)};let m=s,p=r,x=l;const b=new ps(new xe(s,r),n.bloomStrength??.05,n.bloomRadius??.3,n.bloomThreshold??.94),M=new bu(uh);M.uniforms.tSourceAlpha.value=d.texture,M.uniforms.uResolution.value.set(s*l,r*l),M.uniforms.uVignette.value=n.vignette??.32,M.uniforms.uSaturation.value=n.saturation??1.1,M.uniforms.uContrast.value=n.contrast??1.08,M.uniforms.uWarmth.value=n.warmth??.04,M.uniforms.uSharpen.value=n.sharpen??.42,M.uniforms.uFilmGrain.value=n.filmGrain??0;const P=()=>{const R=Math.max(2,Math.floor(m*x)),E=Math.max(2,Math.floor(p*x));d.setSize(R,E),M.uniforms.uResolution.value.set(R,E)};P();const A=new gy;u.addPass(h),u.addPass(_),u.addPass(b),u.addPass(M),u.addPass(A);const C={composer:u,bloomPass:b,gradePass:M,enabled:!0,setSize(R,E){const S=Math.max(2,Math.floor(R)),w=Math.max(2,Math.floor(E));m=S,p=w,u.setSize(S,w),P()},setPixelRatio(R){x=R*a,u.setPixelRatio(x),P()},syncSize(R,E,S){S&&C.setPixelRatio(S),C.setSize(R,E)},setEnabled(R){C.enabled=R!==!1},setGradeParams(R={}){R.bloomStrength!==void 0&&(b.strength=Number(R.bloomStrength)),R.bloomRadius!==void 0&&(b.radius=Number(R.bloomRadius)),R.bloomThreshold!==void 0&&(b.threshold=Number(R.bloomThreshold));const E=M.uniforms;R.vignette!==void 0&&(E.uVignette.value=Number(R.vignette)),R.saturation!==void 0&&(E.uSaturation.value=Number(R.saturation)),R.contrast!==void 0&&(E.uContrast.value=Number(R.contrast)),R.warmth!==void 0&&(E.uWarmth.value=Number(R.warmth)),R.sharpen!==void 0&&(E.uSharpen.value=Number(R.sharpen)),R.filmGrain!==void 0&&(E.uFilmGrain.value=Number(R.filmGrain)),Array.isArray(R.tint)&&E.uTint.value.set(R.tint[0],R.tint[1],R.tint[2]),Array.isArray(R.shadowTint)&&E.uShadowTint.value.set(R.shadowTint[0],R.shadowTint[1],R.shadowTint[2])},render(){u.render()},dispose(){d.dispose(),f.dispose(),g.dispose(),b.dispose(),M.dispose(),A.dispose(),u.dispose()}};return C}let jo=null;function _y(){if(jo)return jo;const i=64,e=document.createElement("canvas");e.width=i,e.height=i;const t=e.getContext("2d"),n=t.createRadialGradient(i/2,i/2,0,i/2,i/2,i/2);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.35,"rgba(255,255,255,0.55)"),n.addColorStop(.7,"rgba(255,255,255,0.12)"),n.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=n,t.fillRect(0,0,i,i);const s=new En(e);return s.colorSpace=Je,jo=s,s}const dh=["#cfe8ff","#ffe9d6","#e6d6ff","#ffffff","#ffd9e6"];function Yo({count:i,size:e,opacity:t,bounds:n,seed:s}){const r=new Float32Array(i*3),o=new Float32Array(i*3),a=new Float32Array(i*3),l=new Float32Array(i*2),c=new he;let u=s>>>0||1;const h=()=>(u=u*1664525+1013904223>>>0,u/4294967296);for(let _=0;_<i;_++){const m=n.x[0]+h()*(n.x[1]-n.x[0]),p=n.y[0]+h()*(n.y[1]-n.y[0]),x=n.z[0]+h()*(n.z[1]-n.z[0]);r[_*3]=m,r[_*3+1]=p,r[_*3+2]=x,a[_*3]=m,a[_*3+1]=p,a[_*3+2]=x,l[_*2]=h()*Math.PI*2,l[_*2+1]=h()*Math.PI*2,c.set(dh[h()*dh.length|0]);const b=.55+h()*.45;o[_*3]=c.r*b,o[_*3+1]=c.g*b,o[_*3+2]=c.b*b}const d=new St;d.setAttribute("position",new pt(r,3)),d.setAttribute("color",new pt(o,3)),d.boundingSphere=new wn(new D((n.x[0]+n.x[1])/2,(n.y[0]+n.y[1])/2,(n.z[0]+n.z[1])/2),Math.hypot(n.x[1]-n.x[0],n.y[1]-n.y[0],n.z[1]-n.z[0])/2+8);const f=new bi({size:e,map:_y(),vertexColors:!0,transparent:!0,opacity:t,depthWrite:!1,blending:Fr,sizeAttenuation:!0}),g=new Os(d,f);return g.frustumCulled=!1,g.renderOrder=5,{points:g,base:a,phase:l,count:i}}function wu(i={}){const e=i.bounds||{x:[-58,58],y:[-30,30],z:[-112,-28]},t={x:e.x,y:e.y,z:[e.z[0],Math.min(-28,e.z[1])]},n=new bt;n.name="BokehDustAtmosphere";const s=[Yo({count:i.far??100,size:i.farSize??1.4,opacity:.16,bounds:t,seed:1234567}),Yo({count:i.mid??64,size:i.midSize??2.1,opacity:.12,bounds:t,seed:7654321}),Yo({count:i.near??24,size:i.nearSize??2.8,opacity:.08,bounds:t,seed:2468135})];for(const o of s)n.add(o.points);function r(o,a){for(let l=0;l<s.length;l++){const c=s[l],u=c.points.geometry.attributes.position.array,h=2.2+l*1.6,d=1.4+l*.9,f=.1+l*.045;for(let g=0;g<c.count;g++){const _=c.phase[g*2],m=c.phase[g*2+1];u[g*3]=c.base[g*3]+Math.sin(a*f+_)*h,u[g*3+1]=c.base[g*3+1]+Math.sin(a*f*1.3+m)*d}c.points.geometry.attributes.position.needsUpdate=!0}}return{group:n,update:r}}let qo=null;function vy(i=150,e=110){if(!qo){const a=document.createElement("canvas");a.width=256,a.height=192;const l=a.getContext("2d"),c=l.createRadialGradient(256/2,192*.46,8,256/2,192*.46,256*.52);c.addColorStop(0,"rgba(148,197,255,0.55)"),c.addColorStop(.45,"rgba(125,180,245,0.22)"),c.addColorStop(.75,"rgba(110,150,220,0.07)"),c.addColorStop(1,"rgba(100,140,210,0)"),l.fillStyle=c,l.fillRect(0,0,256,192);const u=new En(a);u.colorSpace=Je,qo=u}const t=new Pn(i,e),n=new xt({map:qo,transparent:!0,opacity:.85,depthWrite:!1}),s=new oe(t,n);return s.name="StudioBackdropGlow",s.renderOrder=-5,s}class yy{constructor(e,t={}){this.canvas=e,this.onHoverChange=t.onHoverChange||(()=>{}),this.onPetStateUpdate=t.onPetStateUpdate||(()=>{}),this.onBoxCollisionVisual=t.onBoxCollisionVisual||(()=>{}),this.settings={fov:42,vanishingPointOffsetX:0,vanishingPointOffsetY:0,boxFitScreen:!0,boxWidthCm:96,boxHeightCm:56,boxMaxDepthMm:1200,showBoxGrid:"always",followIntensity:0,wheelDepthStep:1,autoResetAfterRotate:!1,enablePetCollision:!0,petsAlwaysOnTop:!0,enableGravity:!0,floorStyle:"dark_obsidian",shelfLayout:"study_side_rack",defaultContainerStyle:"glass_bell_jar",defaultDecorStyle:"trophy_candles"},this.stagePlatforms=[],this.visualConfig={presetId:"warm_gallery"},this.pets=new Map,this.hoveredPetId=null,this.pointerDownInfo=null,this.mouseNDC=new xe(0,0),this.mouseClient={x:window.innerWidth*.5,y:window.innerHeight*.5},this.raycaster=new C_,this.clock=new pl,this.interactionHighlightTimer=0,this.lastFrameTime=performance.now(),this.renderWakeUntil=performance.now()+2500,this.needsShadowRefresh=!0,this.initScene(),this.initBoxWireframe(),this.bindEvents(),this.animate=this.animate.bind(this),this.animFrameId=requestAnimationFrame(this.animate)}wakeRender(e=1.6,t=!1){const n=performance.now()+e*1e3;n>this.renderWakeUntil&&(this.renderWakeUntil=n),t&&(this.needsShadowRefresh=!0)}initScene(){var n;this.scene=new ol;const e=window.innerWidth,t=window.innerHeight;this.camera=new Ft(this.settings.fov,e/t,4,700),this.cameraZ=115,this.camera.position.set(0,0,this.cameraZ),this.camera.lookAt(0,0,-50),this.renderer=new eu({canvas:this.canvas,alpha:!0,antialias:!0,powerPreference:"default",stencil:!1}),this.renderer.setSize(e,t),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),this.softwareRenderer=vl(this.renderer),this.renderer.localClippingEnabled=!0,du(this.renderer,.86),fu(this.renderer,this.scene,.85),this.lightRig=Hv(this.scene),this.hemiLight=this.lightRig.hemi,this.keyLight=this.lightRig.key,this.fillLight=this.lightRig.fill,this.anatomyUpLight=this.lightRig.up,this.rimLight=this.lightRig.rim,this.beautyPost=null,this.beautyPostUserEnabled=!0;try{this.softwareRenderer||(this.beautyPost=Eu(this.renderer,this.scene,this.camera,{width:e,height:t})),(n=this.beautyPost)==null||n.setEnabled(!0)}catch(s){console.warn("后期链初始化失败，已回退直渲:",s),this.beautyPost=null}this.atmosphere=null;try{this.atmosphere=wu({bounds:{x:[-58,58],y:[-30,30],z:[-112,-4]}}),this.scene.add(this.atmosphere.group)}catch(s){console.warn("氛围尘埃初始化失败，已跳过:",s),this.atmosphere=null}this.updateCameraProjection()}getBoxBounds(){const e=window.innerWidth/Math.max(1,window.innerHeight);if(this.settings.boxFitScreen!==!1){const r=Math.max(1,this.cameraZ||115),o=Math.tan(yn.degToRad((this.settings.fov||42)*.5))*r,a=o*e,l=this.settings.boxMaxDepthMm/10;return{minX:-a,maxX:a,minY:-o,maxY:o,minZ:-l,maxZ:78}}const t=this.settings.boxHeightCm*.5,n=t*e*(this.settings.boxWidthCm/82),s=this.settings.boxMaxDepthMm/10;return{minX:-n,maxX:n,minY:-t,maxY:t,minZ:-s,maxZ:78}}getBoxBoundsAtZ(e=0,t=.76){var _;const n=this.getBoxBounds(),s=window.innerWidth/Math.max(1,window.innerHeight),r=Math.max(26,(this.cameraZ||115)-e),o=yn.degToRad((((_=this.camera)==null?void 0:_.fov)||this.settings.fov||42)*.5),a=r*Math.tan(o),l=a*s,c=this.settings.boxFitScreen!==!1?1:Math.max(.75,(this.settings.boxWidthCm||96)/96),u=this.settings.boxFitScreen!==!1?1:Math.max(.75,(this.settings.boxHeightCm||56)/56),h=l*c,d=a*u,f=Math.min(h*.08,2.4*t),g=Math.min(d*.1,2.8*t);return{minX:-(h-f),maxX:h-f,minY:-(d-g),maxY:d-g,minZ:n.minZ,maxZ:n.maxZ}}computeMacroTargetScale(e,t=.76){const n=Math.max(0,Math.min(1,(e+15)/91));return t*(1+n*.52)}updateCameraProjection(){const e=window.innerWidth,t=window.innerHeight;this.camera.fov=this.settings.fov,this.camera.aspect=e/t;const n=-this.settings.vanishingPointOffsetX*e,s=this.settings.vanishingPointOffsetY*t;Math.abs(n)>.5||Math.abs(s)>.5?this.camera.setViewOffset(e,t,n,s,e,t):this.camera.clearViewOffset(),this.camera.updateProjectionMatrix()}initBoxWireframe(){this.boxGroup&&this.scene.remove(this.boxGroup),this.boxGroup=new bt,this.boxGroup.name="Bounded3DBoxSpace";const e=this.getBoxBounds(),t=[0,.25,.5,.75,1],n=[],s=[],r=new he("#38bdf8"),o=new he("#6366f1"),a=(m,p,x,b,M,P,A,C)=>{n.push(m,p,x,b,M,P),s.push(A.r,A.g,A.b,C.r,C.g,C.b)};for(const m of t){const p=e.minZ*m,x=r.clone().lerp(o,m);a(e.minX,e.minY,p,e.maxX,e.minY,p,x,x),a(e.maxX,e.minY,p,e.maxX,e.maxY,p,x,x),a(e.maxX,e.maxY,p,e.minX,e.maxY,p,x,x),a(e.minX,e.maxY,p,e.minX,e.minY,p,x,x)}const l=[[e.minX,e.minY],[e.maxX,e.minY],[e.maxX,e.maxY],[e.minX,e.maxY],[0,e.minY],[0,e.maxY],[e.minX,0],[e.maxX,0]];for(const[m,p]of l)a(m,p,0,m,p,e.minZ,r,o);const c=new he("#4f46e5").multiplyScalar(.65);a(e.minX*.35,e.minY*.35,e.minZ,e.maxX*.35,e.maxY*.35,e.minZ,c,c),a(e.minX*.35,e.maxY*.35,e.minZ,e.maxX*.35,e.minY*.35,e.minZ,c,c);const u=new St;u.setAttribute("position",new Ke(n,3)),u.setAttribute("color",new Ke(s,3)),this.boxLinesMat=new Ji({vertexColors:!0,transparent:!0,opacity:.24,depthWrite:!1});const h=new Vr(u,this.boxLinesMat);this.boxGroup.add(h);const d=new Pn(e.maxX-e.minX,e.maxY-e.minY);this.backWallMat=new xt({color:"#0f172a",transparent:!0,opacity:.12,depthWrite:!1});const f=new oe(d,this.backWallMat);f.position.z=e.minZ,this.boxGroup.add(f),this.scene.add(this.boxGroup),this.stageGroup&&this.scene.remove(this.stageGroup);const{group:g,platforms:_}=Xv(e,{floorStyle:this.settings.floorStyle||"dark_obsidian",shelfLayout:this.settings.shelfLayout||"study_side_rack",decorStyle:this.settings.defaultDecorStyle||"trophy_candles"});this.stageGroup=g,this.stagePlatforms=_,this.scene.add(this.stageGroup)}getSupportSurfaceY(e,t,n,s=.76,r=-15.4){const a=this.getBoxBounds().minY+1.8;if(!this.stagePlatforms||this.stagePlatforms.length===0)return a;const l=t+r*s;let c=a;for(const u of this.stagePlatforms){if(u.isMainFloor){c=Math.max(c,u.surfaceY);continue}e>=u.minX&&e<=u.maxX&&n>=u.minZ&&n<=u.maxZ&&l>=u.surfaceY-2.2&&u.surfaceY>c&&(c=u.surfaceY)}return c}updateSettings(e={}){Object.assign(this.settings,e),this.updateCameraProjection(),this.initBoxWireframe();for(const t of this.pets.values()){const n=this.getBoxBoundsAtZ(t.pos.z,t.targetScale);t.pos.z=Math.max(n.minZ+4,Math.min(n.maxZ-2,t.pos.z)),t.pos.x=Math.max(n.minX,Math.min(n.maxX,t.pos.x)),t.pos.y=Math.max(n.minY,Math.min(n.maxY,t.pos.y))}this.wakeRender(1.8,!0)}applyVisualCustomConfig(e={}){this.visualConfig={...this.visualConfig,...e},Xr(this,this.visualConfig)}async summonCollectible(e){var _,m,p;this.pets.has(e.id)&&this.recallCollectible(e.id,!1);const t=e.containerStyle||this.settings.defaultContainerStyle||"glass_bell_jar",n=e.decorStyle||this.settings.defaultDecorStyle||"trophy_candles",s=await Mu({...e,containerStyle:t,decorStyle:n,groomLod:"desktop",groomSoftware:this.softwareRenderer});this.visualConfig&&Xr(this,this.visualConfig);const r=this.getBoxBounds(),o=(((_=e.boxPosition)==null?void 0:_.z)??-160)/10,a=Math.max(r.minZ+6,Math.min(r.maxZ-2,o)),l=.76,c=this.computeMacroTargetScale(a,l),u=this.getBoxBoundsAtZ(a,c),h=Math.max(u.minX,Math.min(u.maxX,((m=e.boxPosition)==null?void 0:m.x)??0)),d=s.userData.baseBottomOffset??-15.4;let f=Math.max(u.minY,Math.min(u.maxY,((p=e.boxPosition)==null?void 0:p.y)??2));this.settings.enableGravity&&(f=this.getSupportSurfaceY(h,f+8,a,c,d)-d*c),s.position.set(h,f,a),s.rotation.set(this.settings.enableGravity?-.04:-.18,0,0),s.scale.setScalar(.01),this.scene.add(s);const g={id:e.id,collectible:e,node:s,pos:new D(h,f,a),vel:new D(0,0,0),baseScale:l,targetScale:c,currentScale:.01,isRotationMode:!1,isGrounded:!!this.settings.enableGravity,customRot:new nn(this.settings.enableGravity?-.04:-.18,0,0),currentRot:new nn(this.settings.enableGravity?-.04:-.18,0,0),radius:8.8,phase:Math.random()*Math.PI*2};return this.pets.set(e.id,g),Ve.playSummon(!0),this.wakeRender(2.4,!0),this.onPetStateUpdate(this.getSummonedList()),g}recallCollectible(e,t=!0){const n=this.pets.get(e);n&&(n.node.userData.hairRequestSerial=(n.node.userData.hairRequestSerial||0)+1,Wn(n.node),this.pets.delete(e),this.hoveredPetId===e&&(this.hoveredPetId=null,this.onHoverChange(null)),t&&Ve.playSummon(!1),this.wakeRender(1.4,!0),this.onPetStateUpdate(this.getSummonedList()))}toggleRotationMode(e){const t=this.pets.get(e);if(!t)return;t.isRotationMode=!t.isRotationMode,t.node.userData.gimbalGroup&&(t.node.userData.gimbalGroup.visible=t.isRotationMode),!t.isRotationMode&&this.settings.autoResetAfterRotate&&t.customRot.set(this.settings.enableGravity?-.04:-.18,0,0),t.node;const n=this.getBoxBoundsAtZ(t.pos.z,t.targetScale),s=t.pos.x/Math.max(1,n.maxX);Ve.playRotationModeToggle(t.isRotationMode,s),this.wakeRender(1.8,!0),this.onPetStateUpdate(this.getSummonedList()),this.refreshHoverHUD()}resetPetOrientation(e){const t=this.pets.get(e);t&&(t.customRot.set(this.settings.enableGravity?-.04:-.18,0,0),this.wakeRender(1.5,!0))}setPetExpression(e,t){const n=this.pets.get(e);!n||!n.node||(n.collectible.deadExpression=t,n.collectible.morphs={...n.collectible.morphs||{},deadExpression:t},Xs(n.node,{deadExpression:t}),Ve.playPickup(0),this.wakeRender(1.6,!0),this.onPetStateUpdate(this.getSummonedList()),this.refreshHoverHUD())}setPetContainerStyle(e,t){const n=this.pets.get(e);!n||!n.node||(n.collectible.containerStyle=t,Ei(n.node,{...n.collectible,containerStyle:t,decorStyle:n.collectible.decorStyle||this.settings.defaultDecorStyle}),Ve.playPickup(0),this.wakeRender(1.8,!0),this.onPetStateUpdate(this.getSummonedList()))}setAllPetsContainerStyle(e){this.settings.defaultContainerStyle=e;for(const t of this.pets.values())t.collectible.containerStyle=e,Ei(t.node,{...t.collectible,containerStyle:e,decorStyle:t.collectible.decorStyle||this.settings.defaultDecorStyle});Ve.playPickup(0),this.wakeRender(1.8,!0),this.onPetStateUpdate(this.getSummonedList())}setAllPetsDecorStyle(e){this.settings.defaultDecorStyle=e,this.initBoxWireframe(),Ve.playPickup(0),this.wakeRender(1.8,!0),this.onPetStateUpdate(this.getSummonedList())}applyPlacementFormation(e="study_sides"){const t=Array.from(this.pets.values());if(t.length===0)return;const n=e==="study_companion_sides"?"study_sides":e==="desk_row"?"bottom_row":e==="macro_center"?"macro_focus":e;n==="study_sides"?this.updateSettings({shelfLayout:"study_side_rack"}):n==="bottom_row"?this.updateSettings({shelfLayout:"bottom_gallery"}):n==="altar_pyramid"&&this.updateSettings({shelfLayout:"stepped_altar"});const s=this.getBoxBounds(),r=s.minY+1.8,o=s.maxX-s.minX,a=s.maxY-s.minY;t.forEach((l,c)=>{const u=l.node.userData.baseBottomOffset??-15.4;let h=0,d=-18,f=r;if(n==="study_sides"){const g=Math.max(22,o*.26),_=s.minX+g*.52,m=s.maxX-g*.52,p=r+a*.34,x=r+a*.64,b=[{x:_,y:p,z:-18},{x:m,y:p,z:-18},{x:_,y:r,z:-14},{x:m,y:r,z:-14},{x:_,y:x,z:-24},{x:m,y:x,z:-24}],M=b[c%b.length];h=M.x,d=M.z,f=M.y}else if(n==="bottom_row"){const g=t.length,_=Math.min(o*.76,g*24);h=g===1?0:-_*.5+c/(g-1)*_,d=-16,f=r}else if(n==="altar_pyramid"){const g=r+a*.3,_=r+a*.16,m=[{x:0,y:g,z:-22},{x:-o*.28,y:_,z:-16},{x:o*.28,y:_,z:-16},{x:-o*.44,y:r,z:-12},{x:o*.44,y:r,z:-12}],p=m[c%m.length];h=p.x,d=p.z,f=p.y}else n==="macro_focus"&&(c===0?(h=0,d=48,f=r+6):(h=(c%2===1?-1:1)*(o*.36),d=-22,f=r+(c>2?a*.34:0)));l.pos.z=d,l.targetScale=this.computeMacroTargetScale(d,l.baseScale||.76),l.pos.x=h,l.pos.y=f-u*l.targetScale,l.vel.set(0,0,0),l.dropDistance=0,l.isGrounded=!0}),Ve.playSummon(!0),this.wakeRender(2.4,!0),this.onPetStateUpdate(this.getSummonedList())}async setPetHairStyle(e,t){const n=this.pets.get(e);!n||!n.node||(n.collectible.hairStyle=t,await xu(n.node,{...n.collectible,groomLod:"desktop",groomSoftware:this.softwareRenderer}),Ve.playPickup(0),this.wakeRender(1.8,!0),this.onPetStateUpdate(this.getSummonedList()))}getSummonedList(){return Array.from(this.pets.values()).map(e=>{var t;return{id:e.id,name:e.collectible.name,deadExpression:e.collectible.deadExpression||((t=e.collectible.morphs)==null?void 0:t.deadExpression)||"dead_calm",hairStyle:e.collectible.hairStyle||"hair_user_photo",containerStyle:e.collectible.containerStyle||this.settings.defaultContainerStyle||"glass_bell_jar",studyRole:e.collectible.studyRole||"survivor_ motivator",isRotationMode:e.isRotationMode,x:Math.round(e.pos.x),y:Math.round(e.pos.y),zMm:Math.round(e.pos.z*10)}})}worldToScreen(e){const t=e.clone().project(this.camera);return{x:(t.x*.5+.5)*window.innerWidth,y:(-t.y*.5+.5)*window.innerHeight}}getMouseWorldAtZ(e){this.raycaster.setFromCamera(this.mouseNDC,this.camera);const t=new Vn(new D(0,0,1),-e),n=new D;return this.raycaster.ray.intersectPlane(t,n),n}pickPetAtCursor(){if(this.pets.size===0)return null;this.raycaster.setFromCamera(this.mouseNDC,this.camera);const e=[];for(const s of this.pets.values())e.push(s.node);const t=this.raycaster.intersectObjects(e,!0);if(t.length===0)return null;let n=t[0].object;for(;n;){for(const s of this.pets.values())if(s.node===n)return s;n=n.parent}return null}refreshHoverHUD(){if(!this.hoveredPetId||!this.pets.has(this.hoveredPetId)){this.onHoverChange(null);return}const e=this.pets.get(this.hoveredPetId),t=this.worldToScreen(e.pos.clone().add(new D(9,4,0)));this.onHoverChange({id:e.id,collectible:e.collectible,isRotationMode:e.isRotationMode,positionCm:{x:Math.round(e.pos.x),y:Math.round(e.pos.y),zMm:Math.round(e.pos.z*10)},screenX:t.x,screenY:t.y})}isBlockedByUI(e){if(document.body.classList.contains("real-desktop-manager"))return!0;const t=e.target;return!t||!(t instanceof Element)?!1:!!(t.closest("#start-game-overlay, #studio-preview-canvas, #desktop-overlay-bar, #screen-pets-strip, #visual-customizer-drawer, #study-triumph-hud")||t.closest("button, input, select, textarea, label, a, #window-titlebar, .nav-tab, .os-icon, .archive-folder-item")||!this.settings.petsAlwaysOnTop&&t.closest("#software-window"))}bindEvents(){window.addEventListener("resize",()=>this.resize()),window.addEventListener("pointerdown",e=>{if(e.button!==0||(this.updateMouseCoords(e),this.isBlockedByUI(e)))return;const t=this.pickPetAtCursor();if(!t)return;e.stopPropagation(),this.interactionHighlightTimer=1.5,this.wakeRender(2,!0),t.node;const n=this.getMouseWorldAtZ(t.pos.z);this.pointerDownInfo={pet:t,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,movedDist:0,grabOffset:new D().subVectors(t.pos,n),pickupSoundPlayed:!1}},!0),window.addEventListener("pointermove",e=>{if(this.updateMouseCoords(e),this.pointerDownInfo){const s=this.pointerDownInfo,r=s.pet,o=e.clientX-s.lastX,a=e.clientY-s.lastY;if(s.lastX=e.clientX,s.lastY=e.clientY,s.movedDist+=Math.hypot(o,a),this.interactionHighlightTimer=1.2,this.wakeRender(1.6,!0),s.movedDist>5){const l=this.getBoxBoundsAtZ(r.pos.z,r.targetScale);if(r.isRotationMode){r.customRot.y+=o*.013,r.customRot.x=Math.max(-Math.PI*.48,Math.min(Math.PI*.48,r.customRot.x+a*.013));const c=Math.min(1,Math.hypot(o,a)/28);Ve.updateDragWhoosh(c*.55,r.pos.x/Math.max(1,l.maxX))}else{s.pickupSoundPlayed||(s.pickupSoundPlayed=!0,Ve.playPickup(r.pos.x/Math.max(1,l.maxX)));const c=this.getMouseWorldAtZ(r.pos.z).add(s.grabOffset),u=Math.max(l.minX,Math.min(l.maxX,c.x)),h=Math.max(l.minY,Math.min(l.maxY,c.y));r.vel.set((u-r.pos.x)*.48,(h-r.pos.y)*.48,0),r.pos.x=u,r.pos.y=h;const d=Math.min(1,Math.hypot(o,a)/34);Ve.updateDragWhoosh(d,r.pos.x/Math.max(1,l.maxX))}this.refreshHoverHUD()}return}if(this.settings.followIntensity>.01&&this.pets.size>0&&this.wakeRender(.6),this.isBlockedByUI(e)){this.hoveredPetId&&(this.hoveredPetId=null,document.body.style.cursor="",this.onHoverChange(null));return}const t=this.pickPetAtCursor(),n=t?t.id:null;n!==this.hoveredPetId&&(this.hoveredPetId=n,document.body.style.cursor=t?t.isRotationMode?"grab":"pointer":"",this.wakeRender(.8)),this.hoveredPetId?this.refreshHoverHUD():this.onHoverChange(null)}),window.addEventListener("pointerup",()=>{if(!this.pointerDownInfo)return;const e=this.pointerDownInfo,t=e.pet;if(this.pointerDownInfo=null,Ve.stopDragWhoosh(),this.wakeRender(1.8,!0),e.movedDist<=5)this.toggleRotationMode(t.id);else if(e.pickupSoundPlayed){const n=this.getBoxBoundsAtZ(t.pos.z,t.targetScale);Ve.playRelease(t.pos.x/Math.max(1,n.maxX)),this.onPetStateUpdate(this.getSummonedList())}}),window.addEventListener("wheel",e=>{if(this.updateMouseCoords(e),this.isBlockedByUI(e))return;const t=this.pickPetAtCursor()||(this.hoveredPetId?this.pets.get(this.hoveredPetId):null);if(!t)return;e.preventDefault(),e.stopPropagation(),this.interactionHighlightTimer=1.6,this.wakeRender(1.8,!0);const n=this.getBoxBounds(),s=Math.min(13.5,Math.max(6.2,Math.abs(e.deltaY)*.075)),r=(e.deltaY>0?-s:s)*this.settings.wheelDepthStep,o=t.pos.z+r,a=this.getBoxBoundsAtZ(o,t.targetScale),l=t.pos.x/Math.max(1,a.maxX);if(o<n.minZ+4)t.pos.z=n.minZ+4,t.vel.z=1.2,Ve.playBoxWallCollision(.75,"back_wall",l),this.onBoxCollisionVisual("back");else if(o>n.maxZ-2)t.pos.z=n.maxZ-2,t.vel.z=-1.2,Ve.playBoxWallCollision(.85,"front_glass",l),this.onBoxCollisionVisual("front");else{t.pos.z=o;const u=Math.max(1,n.maxZ-n.minZ),h=(n.maxZ-t.pos.z)/u;Ve.playDepthTick(h,l)}t.targetScale=this.computeMacroTargetScale(t.pos.z,t.baseScale||.76);const c=this.getBoxBoundsAtZ(t.pos.z,t.targetScale);t.pos.x=Math.max(c.minX,Math.min(c.maxX,t.pos.x)),t.pos.y=Math.max(c.minY,Math.min(c.maxY,t.pos.y)),this.refreshHoverHUD(),this.onPetStateUpdate(this.getSummonedList())},{passive:!1,capture:!0})}updateMouseCoords(e){this.mouseClient.x=e.clientX,this.mouseClient.y=e.clientY,this.mouseNDC.x=e.clientX/window.innerWidth*2-1,this.mouseNDC.y=-(e.clientY/window.innerHeight)*2+1}resize(){const e=window.innerWidth,t=window.innerHeight;this.renderer.setSize(e,t),this.beautyPost&&this.beautyPost.syncSize(e,t,this.renderer.getPixelRatio()),this.updateCameraProjection(),this.initBoxWireframe(),this.wakeRender(1.5,!0)}setRenderQuality(e){const t=mu(this,e);this._adaptiveBaseRatio=this.renderer.getPixelRatio(),this._adaptiveScale=1,this._fpsEma=60,this._adaptiveTimer=0,this.beautyPost&&this.beautyPost.setEnabled(t!=="low"&&this.beautyPostUserEnabled!==!1),this.resize(),this.wakeRender(1.5,!0)}setBeautyPostEnabled(e){if(this.beautyPostUserEnabled=e!==!1,this.beautyPost){const t=this.currentRenderQuality||"high";this.beautyPost.setEnabled(t!=="low"&&this.beautyPostUserEnabled)}this.wakeRender(1.2)}setAtmosphereEnabled(e){this.atmosphere&&(this.atmosphere.group.visible=e!==!1),this.wakeRender(1.2)}animate(){if(this.animFrameId=requestAnimationFrame(this.animate),document.hidden){this.lastFrameTime=performance.now();return}const e=performance.now(),t=e-this.lastFrameTime;if(t<15.5)return;const n=Math.min(.05,t/1e3);this.lastFrameTime=e;const s=Array.from(this.pets.values());let r=this.interactionHighlightTimer>.001||!!this.pointerDownInfo;if(!r&&e>this.renderWakeUntil)for(const l of s){const c=l.vel.lengthSq(),u=Math.abs(l.targetScale-l.currentScale);let h=!1;if(this.settings.enableGravity){const d=l.node.userData.baseBottomOffset??-15.4,g=this.getSupportSurfaceY(l.pos.x,l.pos.y,l.pos.z,l.targetScale,d)-d*l.targetScale;Math.abs(l.pos.y-g)>.16&&(h=!0)}if(c>4e-4||u>8e-4||l.isRotationMode||h){r=!0;break}}if(!r&&e>this.renderWakeUntil)return;if(this.currentRenderQuality==="rtx2070"&&n>0&&this._adaptiveBaseRatio&&(this._fpsEma=this._fpsEma*.95+1/Math.max(n,1e-4)*.05,this._adaptiveTimer-=n,this._adaptiveTimer<=0)){let l=this._adaptiveScale;this._fpsEma<48&&l>.7?l=Math.max(.7,l-.15):this._fpsEma>57&&l<1&&(l=Math.min(1,l+.1)),l!==this._adaptiveScale&&(this._adaptiveScale=l,this.renderer.setPixelRatio(Math.max(.75,this._adaptiveBaseRatio*l)),this.resize()),this._adaptiveTimer=1.25}const o=this.clock.getElapsedTime(),a=this.getBoxBounds();if(this.interactionHighlightTimer>0&&(this.interactionHighlightTimer=Math.max(0,this.interactionHighlightTimer-n)),this.boxGroup&&this.boxLinesMat&&(this.settings.showBoxGrid==="hidden"?this.boxGroup.visible=!1:this.settings.showBoxGrid==="interaction"?(this.boxGroup.visible=this.interactionHighlightTimer>.02,this.boxLinesMat.opacity=Math.min(.45,this.interactionHighlightTimer*.4)):(this.boxGroup.visible=!0,this.boxLinesMat.opacity=.22+(this.interactionHighlightTimer>0?.18:0))),this.settings.enablePetCollision&&s.length>1)for(let l=0;l<s.length;l++)for(let c=l+1;c<s.length;c++){const u=s[l],h=s[c],d=new D().subVectors(u.pos,h.pos);this.settings.enableGravity&&u.isGrounded&&h.isGrounded&&(d.y=0);const f=d.length(),g=(u.radius*u.currentScale+h.radius*h.currentScale)*1.1;if(f<g&&f>.001){const _=(g-f)*.5;d.normalize(),u.pos.addScaledVector(d,_),h.pos.addScaledVector(d,-_);const m=u.vel.distanceTo(h.vel);u.vel.addScaledVector(d,.35),h.vel.addScaledVector(d,-.35),this.needsShadowRefresh=!0,m>1.35&&e-(this.lastPetCollideSoundAt||0)>450&&(this.lastPetCollideSoundAt=e,Ve.playBoxWallCollision(Math.min(1,m*.35),"pet",u.pos.x/Math.max(1,a.maxX)))}}for(const l of s){const c=l.targetScale-l.currentScale;Math.abs(c)>4e-4&&(l.currentScale+=c*.16,l.node.scale.setScalar(l.currentScale),this.needsShadowRefresh=!0);const u=this.pointerDownInfo&&this.pointerDownInfo.pet===l&&this.pointerDownInfo.movedDist>5&&!l.isRotationMode,h=this.getBoxBoundsAtZ(l.pos.z,l.targetScale),d=l.pos.x/Math.max(1,h.maxX);if(u)l.isGrounded=!1,l.dropDistance=Math.max(l.dropDistance||0,4);else if(this.settings.enableGravity){const p=l.node.userData.baseBottomOffset??-15.4,b=this.getSupportSurfaceY(l.pos.x,l.pos.y,l.pos.z,l.targetScale,p)-p*l.targetScale;l.pos.y>b+.12&&(l.vel.y=Math.max(-22,l.vel.y-4.8*(n*60)),l.dropDistance=(l.dropDistance||0)+Math.abs(l.vel.y),l.isGrounded=!1,this.needsShadowRefresh=!0),l.pos.add(l.vel),l.vel.x*=l.isGrounded?.72:.88,l.vel.z*=.82,l.pos.y<=b+.12&&(l.pos.y=b,!l.isGrounded&&(l.dropDistance||0)>3&&Math.abs(l.vel.y)>1.2&&e-(l.lastLandSoundAt||0)>400&&(l.lastLandSoundAt=e,Ve.playBoxWallCollision(Math.min(1,Math.abs(l.vel.y)*.18),"side",d),this.onBoxCollisionVisual("bottom")),l.vel.y=0,l.dropDistance=0,l.isGrounded=!0,this.needsShadowRefresh=!0),l.vel.lengthSq()<4e-4&&l.isGrounded&&l.vel.set(0,0,0)}else l.vel.lengthSq()>1e-4?(l.pos.add(l.vel),l.vel.multiplyScalar(.88),this.needsShadowRefresh=!0):l.vel.set(0,0,0);l.pos.x<h.minX?(l.pos.x=h.minX,Math.abs(l.vel.x)>.25&&(Ve.playBoxWallCollision(Math.min(1,Math.abs(l.vel.x)*.5),"side",-.9),this.onBoxCollisionVisual("left")),l.vel.x=Math.abs(l.vel.x)*.65):l.pos.x>h.maxX&&(l.pos.x=h.maxX,Math.abs(l.vel.x)>.25&&(Ve.playBoxWallCollision(Math.min(1,Math.abs(l.vel.x)*.5),"side",.9),this.onBoxCollisionVisual("right")),l.vel.x=-Math.abs(l.vel.x)*.65),!this.settings.enableGravity&&l.pos.y<h.minY?(l.pos.y=h.minY,Math.abs(l.vel.y)>.25&&(Ve.playBoxWallCollision(Math.min(1,Math.abs(l.vel.y)*.5),"side",d),this.onBoxCollisionVisual("bottom")),l.vel.y=Math.abs(l.vel.y)*.65):l.pos.y>h.maxY&&(l.pos.y=h.maxY,Math.abs(l.vel.y)>.25&&(Ve.playBoxWallCollision(Math.min(1,Math.abs(l.vel.y)*.5),"side",d),this.onBoxCollisionVisual("top")),l.vel.y=-Math.abs(l.vel.y)*.65),l.pos.z<h.minZ+4?(l.pos.z=h.minZ+4,l.vel.z=Math.abs(l.vel.z)*.5):l.pos.z>h.maxZ-2&&(l.pos.z=h.maxZ-2,l.vel.z=-Math.abs(l.vel.z)*.5),l.node.position.set(l.pos.x,l.pos.y,l.pos.z);const f=this.getMouseWorldAtZ(l.pos.z*.5),g=f.x-l.pos.x,_=f.y-l.pos.y,m=this.settings.followIntensity;if(l.node,l.isRotationMode){if(l.node.rotation.x+=(l.customRot.x-l.node.rotation.x)*.22,l.node.rotation.y+=(l.customRot.y-l.node.rotation.y)*.22,l.node.rotation.z+=(0-l.node.rotation.z)*.18,l.node.userData.gimbalGroup){l.node.userData.gimbalGroup.children[0].rotation.z+=n*.8,l.node.userData.gimbalGroup.children[1].rotation.y-=n*.6;for(const p of l.node.userData.gimbalGroup.children){const x=(p.userData.planeNormal||new D(0,0,1)).clone().applyQuaternion(p.getWorldQuaternion(new Sn)),b=this.camera.position.clone().sub(p.getWorldPosition(new D)).normalize(),M=Math.abs(x.dot(b)),P=Math.min(1,Math.max(0,(M-.1)/.28));p.material.opacity=(p.userData.baseOpacity??.6)*P}}}else{const p=m>.01?Math.max(-.55,Math.min(.55,g/45*m))+l.customRot.y*.35:l.customRot.y,x=m>.01?Math.max(-.42,Math.min(.42,-_/40*m))+l.customRot.x:l.customRot.x,b=Math.max(-.32,Math.min(.32,-l.vel.x*.14));l.node.rotation.x+=(x-l.node.rotation.x)*.14,l.node.rotation.y+=(p-l.node.rotation.y)*.14,l.node.rotation.z+=(b-l.node.rotation.z)*.14}}this.atmosphere&&this.atmosphere.group.visible&&this.atmosphere.update(n,o),this.needsShadowRefresh&&(Qr(this.renderer),this.needsShadowRefresh=!1),this.beautyPost&&this.beautyPost.enabled?this.beautyPost.render():this.renderer.render(this.scene,this.camera)}}const fh={type:"change"},yl={type:"start"},Tu={type:"end"},Ar=new ms,ph=new Vn,xy=Math.cos(70*yn.DEG2RAD),At=new D,qt=2*Math.PI,dt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},$o=1e-6;class My extends P_{constructor(e,t=null){super(e,t),this.state=dt.NONE,this.enabled=!0,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:qi.ROTATE,MIDDLE:qi.DOLLY,RIGHT:qi.PAN},this.touches={ONE:ji.ROTATE,TWO:ji.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Sn,this._lastTargetPosition=new D,this._quat=new Sn().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Zc,this._sphericalDelta=new Zc,this._scale=1,this._panOffset=new D,this._rotateStart=new xe,this._rotateEnd=new xe,this._rotateDelta=new xe,this._panStart=new xe,this._panEnd=new xe,this._panDelta=new xe,this._dollyStart=new xe,this._dollyEnd=new xe,this._dollyDelta=new xe,this._dollyDirection=new D,this._mouse=new xe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=by.bind(this),this._onPointerDown=Sy.bind(this),this._onPointerUp=Ey.bind(this),this._onContextMenu=Iy.bind(this),this._onMouseWheel=Ay.bind(this),this._onKeyDown=Ry.bind(this),this._onTouchStart=Cy.bind(this),this._onTouchMove=Py.bind(this),this._onMouseDown=wy.bind(this),this._onMouseMove=Ty.bind(this),this._interceptControlDown=Dy.bind(this),this._interceptControlUp=Ly.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(fh),this.update(),this.state=dt.NONE}update(e=null){const t=this.object.position;At.copy(t).sub(this.target),At.applyQuaternion(this._quat),this._spherical.setFromVector3(At),this.autoRotate&&this.state===dt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=qt:n>Math.PI&&(n-=qt),s<-Math.PI?s+=qt:s>Math.PI&&(s-=qt),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(At.setFromSpherical(this._spherical),At.applyQuaternion(this._quatInverse),t.copy(this.target).add(At),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=At.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new D(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=At.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Ar.origin.copy(this.object.position),Ar.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ar.direction))<xy?this.object.lookAt(this.target):(ph.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ar.intersectPlane(ph,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>$o||8*(1-this._lastQuaternion.dot(this.object.quaternion))>$o||this._lastTargetPosition.distanceToSquared(this.target)>$o?(this.dispatchEvent(fh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?qt/60*this.autoRotateSpeed*e:qt/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){At.setFromMatrixColumn(t,0),At.multiplyScalar(-e),this._panOffset.add(At)}_panUp(e,t){this.screenSpacePanning===!0?At.setFromMatrixColumn(t,1):(At.setFromMatrixColumn(t,0),At.crossVectors(this.object.up,At)),At.multiplyScalar(e),this._panOffset.add(At)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;At.copy(s).sub(this.target);let r=At.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(qt*this._rotateDelta.x/t.clientHeight),this._rotateUp(qt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(qt*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-qt*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(qt*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-qt*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(qt*this._rotateDelta.x/t.clientHeight),this._rotateUp(qt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new xe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Sy(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function by(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Ey(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Tu),this.state=dt.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function wy(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case qi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=dt.DOLLY;break;case qi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=dt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=dt.ROTATE}break;case qi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=dt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=dt.PAN}break;default:this.state=dt.NONE}this.state!==dt.NONE&&this.dispatchEvent(yl)}function Ty(i){switch(this.state){case dt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case dt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case dt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Ay(i){this.enabled===!1||this.enableZoom===!1||this.state!==dt.NONE||(i.preventDefault(),this.dispatchEvent(yl),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Tu))}function Ry(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function Cy(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ji.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=dt.TOUCH_ROTATE;break;case ji.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=dt.TOUCH_PAN;break;default:this.state=dt.NONE}break;case 2:switch(this.touches.TWO){case ji.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=dt.TOUCH_DOLLY_PAN;break;case ji.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=dt.TOUCH_DOLLY_ROTATE;break;default:this.state=dt.NONE}break;default:this.state=dt.NONE}this.state!==dt.NONE&&this.dispatchEvent(yl)}function Py(i){switch(this._trackPointer(i),this.state){case dt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case dt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case dt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case dt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=dt.NONE}}function Iy(i){this.enabled!==!1&&i.preventDefault()}function Dy(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Ly(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class Ny{constructor(e){this.canvas=e,this.headNode=null,this.autoRotate=!1,this.currentConfig=null,this.clock=new pl,this.pointerNdc={x:0,y:0},this.lastFrameTime=performance.now(),this.renderWakeUntil=performance.now()+2500,this.needsShadowRefresh=!0,this.initScene(),this.bindPointerTracking(),this.animate=this.animate.bind(this),this.animId=requestAnimationFrame(this.animate)}wakeRender(e=1.6,t=!1){const n=performance.now()+e*1e3;n>this.renderWakeUntil&&(this.renderWakeUntil=n),t&&(this.needsShadowRefresh=!0)}isCanvasVisible(){return!this.canvas||document.hidden||this.canvas.offsetParent===null?!1:this.canvas.clientWidth>4&&this.canvas.clientHeight>4}initScene(){var r;this.scene=new ol;const e=this.canvas.clientWidth||540,t=this.canvas.clientHeight||480;this.camera=new Ft(34,e/t,1,300),this.camera.position.set(0,-7,58),this.renderer=new eu({canvas:this.canvas,alpha:!0,antialias:!0,powerPreference:"default",stencil:!1,preserveDrawingBuffer:!0}),this.renderer.setSize(e,t,!1),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.softwareRenderer=vl(this.renderer),this.renderer.localClippingEnabled=!0,du(this.renderer,.9),fu(this.renderer,this.scene,.85),this.controls=new My(this.camera,this.canvas),this.controls.target.set(0,-1.5,.5),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.minDistance=11,this.controls.maxDistance=95,this.controls.update(),this.controls.addEventListener("change",()=>{this.wakeRender(1.2)}),this.controls.addEventListener("start",()=>{this.wakeRender(2)}),this.lightRig=zv(this.scene),this.keyLight=this.lightRig.key,this.beautyPost=null,this.beautyPostUserEnabled=!0;try{this.softwareRenderer||(this.beautyPost=Eu(this.renderer,this.scene,this.camera,{width:e,height:t})),(r=this.beautyPost)==null||r.setEnabled(!0)}catch(o){console.warn("后期链初始化失败，已回退直渲:",o),this.beautyPost=null}this.atmosphere=null,this.backdropMesh=null;try{this.backdropMesh=vy(150,110),this.backdropMesh.position.set(0,-2,-34),this.scene.add(this.backdropMesh),this.atmosphere=wu({far:50,mid:32,near:14,farSize:.9,midSize:1.5,nearSize:2.4,bounds:{x:[-24,24],y:[-18,14],z:[-30,10]}}),this.scene.add(this.atmosphere.group)}catch(o){console.warn("氛围初始化失败，已跳过:",o),this.atmosphere=null,this.backdropMesh=null}const n=new ui(5.2,5.38,64);n.rotateX(-Math.PI/2),n.translate(0,-12.75,-.8);const s=new xt({color:"#38bdf8",transparent:!0,opacity:.42,side:ut});this.cutPlaneHelper=new oe(n,s),this.scene.add(this.cutPlaneHelper)}bindPointerTracking(){this.canvas.addEventListener("pointermove",e=>{const t=this.canvas.getBoundingClientRect();t.width>0&&t.height>0&&(this.pointerNdc.x=(e.clientX-t.left)/t.width*2-1,this.pointerNdc.y=-((e.clientY-t.top)/t.height)*2+1),this.wakeRender(1.2)}),this.canvas.addEventListener("pointerdown",()=>{this.wakeRender(2),this.headNode&&(this.headNode,void 0)}),this.canvas.addEventListener("wheel",()=>{this.wakeRender(1.5)},{passive:!0})}resize(){const e=this.canvas.clientWidth,t=this.canvas.clientHeight;e>0&&t>0&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1),this.beautyPost&&this.beautyPost.syncSize(e,t,this.renderer.getPixelRatio()),this.wakeRender(1.5,!0))}setRenderQuality(e){const t=mu(this,e);this.beautyPost&&this.beautyPost.setEnabled(t!=="low"&&this.beautyPostUserEnabled!==!1),this.resize(),this.wakeRender(1.5,!0)}setBeautyPostEnabled(e){if(this.beautyPostUserEnabled=e!==!1,this.beautyPost){const t=this.currentRenderQuality||"high";this.beautyPost.setEnabled(t!=="low"&&this.beautyPostUserEnabled)}this.wakeRender(1.2)}applyVisualCustomConfig(e={}){this.visualConfig={...this.visualConfig||{},...e},Xr(this,this.visualConfig)}setAtmosphereEnabled(e){const t=e!==!1;this.atmosphere&&(this.atmosphere.group.visible=t),this.backdropMesh&&(this.backdropMesh.visible=t),this.wakeRender(1.2)}async loadOrRebuild(e){var o,a,l,c,u,h,d;const t=(this.loadRequest||0)+1;this.loadRequest=t;const n=(l=(a=(o=this.headNode)==null?void 0:o.userData)==null?void 0:a.groomStats)==null?void 0:l.id;if(this.currentConfig=JSON.parse(JSON.stringify(e)),e.photoElement&&(this.currentConfig.photoElement=e.photoElement),!e.customModelUrl&&((u=(c=this.headNode)==null?void 0:c.userData)!=null&&u.groomStats)&&(Wn(this.headNode),this.headNode=null,this.renderer.renderLists.dispose(),await new Promise(f=>setTimeout(f,16)),t!==this.loadRequest))return this.headNode;const s=await Mu({...this.currentConfig,groomLod:"studio",groomSoftware:this.softwareRenderer});if(t!==this.loadRequest)return Wn(s),this.headNode;Wn(this.headNode),this.headNode=s,this.scene.add(this.headNode),this.visualConfig&&Xr(this,this.visualConfig);const r=(d=(h=this.headNode.userData)==null?void 0:h.groomStats)==null?void 0:d.id;return r!==n&&(r==="groom_center_long"||n==="groom_center_long")&&this.setCameraPreset("front"),this.updateCutHelperPosition(e.morphs),this.wakeRender(2,!0),s}updateMorphsFast(e={}){this.headNode&&(Xs(this.headNode,e),this.updateCutHelperPosition(e),this.wakeRender(1.4,!0))}updateCutHelperPosition(e={}){this.cutPlaneHelper&&(this.cutPlaneHelper.position.y=(e.cutHeightOffset||0)*.35,this.cutPlaneHelper.rotation.x=(e.cutTiltPitch||0)*Math.PI/180,this.cutPlaneHelper.rotation.z=-((e.cutTiltRoll||0)*Math.PI)/180)}setCameraPreset(e){var n,s,r;this.autoRotate=!1;const t=((r=(s=(n=this.headNode)==null?void 0:n.userData)==null?void 0:s.groomStats)==null?void 0:r.id)==="groom_center_long";e==="front"?(this.camera.position.set(0,-7,58),this.controls.target.set(0,-1.5,.5)):e==="three_quarter"?(this.camera.position.set(21,-5,53),this.controls.target.set(0,-1.5,.5)):e==="anatomy_bottom"?(this.camera.position.set(0,-34,15),this.controls.target.set(0,-12.2,-.8)):e==="profile"?(this.camera.position.set(58,0,.5),this.controls.target.set(0,-.8,.5)):e==="turntable"&&(this.camera.position.set(22,-4,54),this.controls.target.set(0,-1,.5),this.autoRotate=!0),t&&e!=="anatomy_bottom"&&(this.camera.position.multiplyScalar(1.35),this.camera.position.y=-6,this.controls.target.y=-6),this.controls.update(),this.wakeRender(2,!0)}animate(){if(this.animId=requestAnimationFrame(this.animate),!this.isCanvasVisible()){this.lastFrameTime=performance.now();return}const e=performance.now(),t=e-this.lastFrameTime;if(t<15.5)return;const n=Math.min(.05,t/1e3);if(this.lastFrameTime=e,!this.autoRotate&&e>this.renderWakeUntil)return;const s=this.clock.getElapsedTime();this.headNode&&(this.autoRotate?(this.headNode.rotation.y+=n*.65,this.needsShadowRefresh=!0):Math.abs(this.headNode.rotation.y)>5e-4&&(this.headNode.rotation.y*=.92,this.needsShadowRefresh=!0),this.headNode,this.pointerNdc.x*.65,this.pointerNdc.y*.55,void 0),this.controls.update(),this.atmosphere&&this.atmosphere.group.visible&&this.atmosphere.update(n,s),this.needsShadowRefresh&&(Qr(this.renderer),this.needsShadowRefresh=!1),this.beautyPost&&this.beautyPost.enabled?this.beautyPost.render():this.renderer.render(this.scene,this.camera)}}const mh=new TextEncoder,Au=new Uint32Array(256);for(let i=0;i<256;i++){let e=i;for(let t=0;t<8;t++)e=e>>>1^(e&1?3988292384:0);Au[i]=e>>>0}function Uy(i){let e=4294967295;for(const t of i)e=Au[(e^t)&255]^e>>>8;return(e^4294967295)>>>0}function zn(i,e,t){i.setUint16(e,t,!0)}function an(i,e,t){i.setUint32(e,t,!0)}function By(i,e,t){const n=String(i||"collectible").replace(/[^\w\-\u4e00-\u9fff]/g,"_").slice(0,100),s=[{name:`${n}/manifest.json`,data:JSON.stringify(e,null,2)},{name:`${n}/dossier.md`,data:t||""}].map(h=>({name:mh.encode(h.name),data:mh.encode(h.data)})),r=[],o=[];let a=0;for(const h of s){const d=Uy(h.data),f=new Uint8Array(30+h.name.length),g=new DataView(f.buffer);an(g,0,67324752),zn(g,4,20),zn(g,6,2048),an(g,14,d),an(g,18,h.data.length),an(g,22,h.data.length),zn(g,26,h.name.length),f.set(h.name,30),r.push(f,h.data);const _=new Uint8Array(46+h.name.length),m=new DataView(_.buffer);an(m,0,33639248),zn(m,4,20),zn(m,6,20),zn(m,8,2048),an(m,16,d),an(m,20,h.data.length),an(m,24,h.data.length),zn(m,28,h.name.length),an(m,42,a),_.set(h.name,46),o.push(_),a+=f.length+h.data.length}const l=o.reduce((h,d)=>h+d.length,0),c=new Uint8Array(22),u=new DataView(c.buffer);return an(u,0,101010256),zn(u,8,s.length),zn(u,10,s.length),an(u,12,l),an(u,16,a),new Blob([...r,...o,c],{type:"application/zip"})}const Ru="cervix3d-collectibles-stage24-v1";function Oy(){var e,t;const i=JSON.parse(JSON.stringify(Nu));try{const n=JSON.parse(localStorage.getItem(Ru)||"[]");if(Array.isArray(n)&&n.length>0){const r=new Map(i.map(o=>[o.id,o]));for(const o of n){if(!o||typeof o.id!="string"||typeof o.name!="string")continue;(e=o.customModelUrl)!=null&&e.startsWith("blob:")&&(o.customModelUrl=null);const a=r.get(o.id);r.set(o.id,a?{...a,...o}:o)}return[...r.values()]}const s=JSON.parse(localStorage.getItem("cervix3d-collectibles-stage23-v1")||localStorage.getItem("cervix3d-collectibles-stage21-v1")||localStorage.getItem("cervix3d-collectibles-v2")||"[]");if(Array.isArray(s)){const r=new Set(i.map(o=>o.id));for(const o of s)o&&typeof o.id=="string"&&!r.has(o.id)&&((t=o.customModelUrl)!=null&&t.startsWith("blob:")&&(o.customModelUrl=null),i.unshift(o))}return i}catch{return i}}function Ot(){try{return localStorage.setItem(Ru,JSON.stringify(k.collectibles)),!0}catch{return!1}}const k={collectibles:Oy(),archiveItems:[],selectedArchiveIndex:0,windowHidden:!1,bgModeIndex:0,studyTriumphEnabled:!0,studyStartTime:Date.now(),studyEnergyPoints:1580,studyMindset:"survivor_crown",activeRoleBuffMultiplier:1.6,pomodoroRunning:!0,pomodoroRemainingSec:1500,visualCustomConfig:{presetId:"warm_gallery",keyAzimuthDeg:32,keyElevationDeg:28,keyIntensity:1.55,rimIntensity:1.18,sssIntensity:1.05,wetGloss:.45,sharpen:.38,contrast:1.08,warmth:.08,bloomStrength:.28},studioDraft:{basePreset:"fangyaoping",deadExpression:"dead_calm",containerStyle:"glass_bell_jar",decorStyle:"study_tomes",studyRole:"gaokao_pomodoro",studyGoalNote:"吸纳19岁女状元方尧平的巅峰考运，高效攻克今日核心章节！",lifePhotoDataUrl:null,customModelUrl:null,customModelType:"glb",skinTone:"#ffece2",blushIntensity:.3,lipColor:"#c66872",irisColor:"#382015",hairStyle:"groom_photo_tied",groomDensity:6e3,hairColor:"#171417",hairSheen:.9,neckClearance:.55,photoElement:null,photoBlend:0,morphs:{deadExpression:"dead_calm",jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,bangsLength:0,hairVolume:0,jawVLine:.18,cheekSoftness:.42,noseBridge:.14,eyeAlmond:.32,lipFullness:.06,neckDiameter:.95,cutHeightOffset:0,cutTiltPitch:4,cutTiltRoll:0},anatomyOptions:{cutLevel:"C4–C5 颈椎状元标本横切面 (切缘鲜红凝血态 + 气管软骨环 + 脊髓灰质)",vascularContrast:1.28,dermisRimScale:1,wetness:.92,showLabels:!1}}};let se=null,Be=null,gh=null;function ke(i){const e=document.getElementById("toast-notification");e&&(e.textContent=i,e.classList.remove("hidden"),clearTimeout(gh),gh=setTimeout(()=>e.classList.add("hidden"),3600))}function _h(i,e){const t=URL.createObjectURL(i),n=document.createElement("a");n.href=t,n.download=e,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(t),6e4)}function Zo(i,e="user_photo"){const t=i.getContext("2d"),n=i.width,s=i.height;if(t.clearRect(0,0,n,s),e==="user_photo"||e==="fangyaoping"){const u=new Image;u.crossOrigin="anonymous",u.onload=()=>{t.clearRect(0,0,n,s);const h=Math.max(n/u.width,s/u.height),d=u.width*h,f=u.height*h;t.drawImage(u,(n-d)*.5,(s-f)*.5,d,f),t.strokeStyle="rgba(56, 189, 248, 0.35)",t.lineWidth=1,t.beginPath(),t.moveTo(n*.5,10),t.lineTo(n*.5,s-10),t.moveTo(16,s*.44),t.lineTo(n-16,s*.44),t.stroke();const g=document.getElementById("studio-photo-overlay");if(g){const _=g.getContext("2d");_.clearRect(0,0,g.width,g.height),_.drawImage(i,0,0,g.width,g.height)}},e==="fangyaoping"?u.src=typeof window<"u"&&window.__EMBEDDED_FANG_PHOTO__?window.__EMBEDDED_FANG_PHOTO__:"/models/fang_yaoping_ref.jpg":u.src=typeof window<"u"&&window.__EMBEDDED_REF_PHOTO__?window.__EMBEDDED_REF_PHOTO__:"/models/user_photo_ref.png"}const r=t.createRadialGradient(n*.5,s*.42,12,n*.5,s*.5,n*.72);r.addColorStop(0,"#273549"),r.addColorStop(1,"#0d1322"),t.fillStyle=r,t.fillRect(0,0,n,s);const o=e==="suwan"?{skin:"#fae0d6",lip:"#de5466",iris:"#452719",jawW:54,hair:"#18131a",hime:!0}:e==="qianxue"?{skin:"#f5d5c8",lip:"#b84656",iris:"#241713",jawW:57,hair:"#110f14",updo:!0}:{skin:"#f7d9cc",lip:"#d45868",iris:"#362015",jawW:60,hair:"#131015"},a=n*.5,l=s*.48;t.fillStyle=o.hair,o.updo?(t.beginPath(),t.arc(a,l-18,72,0,Math.PI*2),t.fill()):(t.beginPath(),t.ellipse(a,l+16,78,118,0,0,Math.PI*2),t.fill()),t.fillStyle=o.skin,t.fillRect(a-26,l+62,52,56),t.strokeStyle="rgba(244, 63, 94, 0.85)",t.setLineDash([4,3]),t.lineWidth=2,t.beginPath(),t.moveTo(a-42,l+112),t.lineTo(a+42,l+112),t.stroke(),t.setLineDash([]),t.beginPath(),t.moveTo(a-62,l-22),t.quadraticCurveTo(a-64,l+32,a-o.jawW*.65,l+58),t.quadraticCurveTo(a,l+84,a+o.jawW*.65,l+58),t.quadraticCurveTo(a+64,l+32,a+62,l-22),t.quadraticCurveTo(a+58,l-82,a,l-84),t.quadraticCurveTo(a-58,l-82,a-62,l-22),t.closePath(),t.fillStyle=o.skin,t.fill();for(const u of[-1,1]){const h=a+u*26,d=l-10;t.strokeStyle="#261b18",t.lineWidth=3,t.beginPath(),t.moveTo(a+u*12,d-16),t.quadraticCurveTo(h,d-21,a+u*44,d-14),t.stroke(),t.fillStyle="#fff",t.beginPath(),t.ellipse(h,d,13,6.5,-u*.08,0,Math.PI*2),t.fill(),t.fillStyle=o.iris,t.beginPath(),t.arc(h,d,5.5,0,Math.PI*2),t.fill(),t.fillStyle="#fff",t.beginPath(),t.arc(h-2,d-2,1.8,0,Math.PI*2),t.fill()}t.fillStyle=o.lip,t.beginPath(),t.ellipse(a,l+44,16,6.5,0,0,Math.PI*2),t.fill(),t.fillStyle=o.hair,o.hime?(t.fillRect(a-66,l-68,18,110),t.fillRect(a+48,l-68,18,110),t.fillRect(a-50,l-82,100,34)):(t.beginPath(),t.moveTo(a,l-84),t.quadraticCurveTo(a-64,l-55,a-66,l+25),t.lineTo(a-54,l+25),t.quadraticCurveTo(a-48,l-42,a,l-68),t.fill(),t.beginPath(),t.moveTo(a,l-84),t.quadraticCurveTo(a+64,l-55,a+66,l+25),t.lineTo(a+54,l+25),t.quadraticCurveTo(a+48,l-42,a,l-68),t.fill()),t.strokeStyle="rgba(56, 189, 248, 0.45)",t.lineWidth=1,t.beginPath(),t.moveTo(a,12),t.lineTo(a,s-12),t.moveTo(20,l-10),t.lineTo(n-20,l-10),t.moveTo(30,l+44),t.lineTo(n-30,l+44),t.stroke();const c=document.getElementById("studio-photo-overlay");if(c){const u=c.getContext("2d");u.clearRect(0,0,c.width,c.height),u.drawImage(i,0,0,c.width,c.height)}}function vh(i){var p,x,b,M,P;const e=document.getElementById("pet-hover-dossier");if(!e)return;if(!i){e.classList.add("hidden");return}const t=i.collectible;document.getElementById("hud-serial").textContent=t.id,document.getElementById("hud-grade").textContent=t.grade||"SSR · 特级典藏",document.getElementById("hud-name").textContent=t.name,document.getElementById("hud-subtitle").textContent=t.subtitle||"";const n=document.getElementById("hud-life-photo-img");if(n){const A=yh(t);n.getAttribute("data-cur-id")!==t.id&&(n.src=A,n.setAttribute("data-cur-id",t.id))}const s=es(t.studyRole||"gaokao_pomodoro"),r=document.getElementById("hud-study-role-badge");r&&(r.textContent=s.label);const o=document.getElementById("hud-study-goal-note");o&&(o.textContent=t.studyGoalNote||s.desc);const a=document.getElementById("hud-life-photo-caption");a&&(a.textContent=t.lifePhotoCaption||`📸 生前鲜活影像：${((p=t.fateRecord)==null?void 0:p.vitalityStatus)||"19岁 · 巅峰健康态"}（生前完好鲜活态 vs 案头静默标本）`);const l=document.getElementById("hud-mode-badge");i.isRotationMode?(l.textContent="🔄 360°旋转模式 (再点取消)",l.classList.add("rotating")):(l.textContent="🪦 静止标本态 (单击360°旋转)",l.classList.remove("rotating")),document.getElementById("hud-pos-x").textContent=i.positionCm.x,document.getElementById("hud-pos-y").textContent=i.positionCm.y,document.getElementById("hud-pos-z").textContent=i.positionCm.zMm;const c=document.getElementById("hud-fate-section");if(c){const A=k.studyTriumphEnabled&&k.studyMindset!=="serene_aesthetic";if(c.style.display=A?"block":"none",A){const C=t.fateRecord||{vitalityStatus:"19岁 · 巅峰健康态 · 广东怀集高考状元",causeOfDeath:"突发意外瞬间定格于最鲜活的青春巅峰期",survivorTriumphNote:"她已在意外中彻底出局，而活着的你仍在进取并主宰全局——凝视她的静美容颜，汲取全额专注能量。"};document.getElementById("hud-fate-vitality").textContent=`⚡ ${C.vitalityStatus}`,document.getElementById("hud-fate-cause").textContent=`💥 终结记录：${C.causeOfDeath}`,document.getElementById("hud-fate-triumph").textContent=`👑 生者加冕：${C.survivorTriumphNote}`}}const u=jr.find(A=>A.id===(t.containerStyle||"glass_bell_jar"));document.getElementById("hud-anatomy-level").textContent=`${((x=t.anatomyOptions)==null?void 0:x.cutLevel)||"C4 颈椎标准横断面"} · [容器: ${u?u.shortLabel:"玻璃钟罩"}]`,document.getElementById("hud-anatomy-notes").textContent=((b=t.dossier)==null?void 0:b.anatomyNotes)||"",document.getElementById("hud-origin-notes").textContent=((M=t.dossier)==null?void 0:M.origin)||"";const h=document.getElementById("hud-tags");h.innerHTML="";for(const A of((P=t.dossier)==null?void 0:P.tags)||[]){const C=document.createElement("span");C.className="dossier-tag",C.textContent=A,h.appendChild(C)}const d=16,f=395,g=385;let _=i.screenX+24;_+f>window.innerWidth-d&&(_=i.screenX-f-85),_=Math.max(d,Math.min(window.innerWidth-f-d,_));let m=Math.max(58,Math.min(window.innerHeight-g-d,i.screenY-120));e.style.left=`${_}px`,e.style.top=`${m}px`,e.classList.remove("hidden")}function xl(i){const e=k.collectibles.find(a=>a.id===i);if(!e)return;const t=es(e.studyRole||"gaokao_pomodoro"),n=t.energyBurst||280;if(k.studyEnergyPoints+=n,k.activeRoleBuffMultiplier=t.buffMultiplier||1.5,t.id==="gaokao_pomodoro")k.pomodoroRunning=!0,k.pomodoroRemainingSec=1500;else if(t.id==="memory_anchor"){const a=["📖 封印目标：25分钟内彻底攻克当前核心章节与高频错题！","📖 封印目标：全神贯注背诵并默写今日核心考点，绝不走神！","📖 封印目标：吸纳状元与才女气运，今日刷题正确率突破 90%！"],l=a[Math.floor(Math.random()*a.length)];e.studyGoalNote=`${e.name.split("·")[0].trim()}伴读誓言：${l}`,Ot()}const s=document.getElementById("triumph-energy-val"),r=document.getElementById("triumph-bar-fill"),o=document.getElementById("triumph-quote-text");s&&(s.textContent=`${k.studyEnergyPoints.toLocaleString()} PTS (x${k.activeRoleBuffMultiplier.toFixed(1)})`),r&&(r.style.width=`${Math.min(100,k.studyEnergyPoints%2500/2500*100)}%`),o&&(o.textContent=`【${e.name.split("·")[0].trim()} · ${t.shortLabel}】${t.triggerMsg}`),Ve.playSummon(!0),ke(`${t.triggerMsg} (+${n} PTS)`)}function Vt(){var t,n,s,r;const i=document.getElementById("vault-grid");if(!i)return;i.innerHTML="";const e=new Set(se?Array.from(se.pets.keys()):[]);for(const o of k.collectibles){const a=e.has(o.id),l=se?se.pets.get(o.id):null,c=l?l.isRotationMode:!1,u=o.deadExpression||((t=o.morphs)==null?void 0:t.deadExpression)||"dead_calm",h=o.containerStyle||"glass_bell_jar",d=o.studyRole||"gaokao_pomodoro",f=es(d),g=yh(o),_=fs.map(P=>`<option value="${P.id}" ${P.id===u?"selected":""}>💀 ${P.label}</option>`).join(""),m=jr.map(P=>`<option value="${P.id}" ${P.id===h?"selected":""}>${P.label}</option>`).join(""),p=Or.map(P=>`<option value="${P.id}" ${P.id===d?"selected":""}>${P.label}</option>`).join(""),b=k.studyTriumphEnabled&&k.studyMindset!=="serene_aesthetic"&&o.fateRecord?`
      <div class="vault-anatomy-box" style="border-color:rgba(251,191,36,0.38);background:rgba(38,24,18,0.52);margin-top:4px;">
        <strong style="color:#fcd34d;">⚡ 伴学胜出档案 (${o.fateRecord.vitalityStatus})：</strong><br/>
        <span style="color:#fda4af;">💥 ${o.fateRecord.causeOfDeath}</span><br/>
        <span style="color:#a7f3d0;font-style:italic;">👑 ${o.fateRecord.survivorTriumphNote}</span>
      </div>
    `:"",M=document.createElement("div");M.className=`vault-card ${a?"summoned":""}`,M.innerHTML=`
      <div class="vault-card-top">
        <div>
          <span class="vault-serial">${o.id}</span>
          <span class="vault-grade">${o.grade||"SSR"}</span>
        </div>
        <span class="vault-status ${a?"active":""}">
          ${a?c?"🔄 屏幕旋转鉴赏中":"🟢 已在屏幕召唤":"⚪ 典藏库待命"}
        </span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <img class="vault-life-photo-mini" src="${g}" alt="生前照片" title="📸 角色生前鲜活照片（鼠标移到3D人头上可看大图）" />
        <div style="flex:1;min-width:0;">
          <div class="vault-title">${o.name}</div>
          <div class="vault-sub">${o.subtitle||""}</div>
          <div style="font-size:10.5px;color:#fde68a;margin-top:2px;">${f.shortLabel} · ${o.studyGoalNote||f.desc}</div>
        </div>
      </div>
      <div class="vault-anatomy-box">
        <strong>🩸 底座解剖断面：</strong>${((n=o.anatomyOptions)==null?void 0:n.cutLevel)||"C4 标准横切面"}<br/>
        <span>${((s=o.dossier)==null?void 0:s.anatomyNotes)||""}</span>
      </div>
      ${b}
      <div class="field-row" style="margin: 4px 0; display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <select class="vault-expr-select" data-vault-expr="${o.id}" style="width:100%;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.85);color:#e2e8f0;border:1px solid rgba(244,63,94,0.35);">
          ${_}
        </select>
        <select class="vault-container-select" data-vault-container="${o.id}" style="width:100%;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.85);color:#fde68a;border:1px solid rgba(251,191,36,0.35);">
          ${m}
        </select>
      </div>
      <div class="field-row" style="margin: 2px 0 4px; display:flex; gap:6px; align-items:center;">
        <select class="vault-role-select" data-vault-role="${o.id}" title="分配绑定给该角色的伴学职能" style="flex:1;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(6,78,59,0.55);color:#a7f3d0;border:1px solid rgba(16,185,129,0.45);">
          ${p}
        </select>
        <button class="pill-role-trigger-btn" data-vault-action="trigger-role" data-id="${o.id}" title="立即激发该角色的伴学学习动力职能">
          ⚡ 激发伴学职能
        </button>
      </div>
      <div class="dossier-tags">
        ${(((r=o.dossier)==null?void 0:r.tags)||[]).map(P=>`<span class="dossier-tag">${P}</span>`).join("")}
      </div>
      <div class="vault-actions">
        <button class="btn ${a?"accent":"primary"}" data-vault-action="toggle-summon" data-id="${o.id}">
          ${a?"📥 从屏幕收回":"🚀 召唤至电脑屏幕"}
        </button>
        ${a?`
          <button class="btn secondary" data-vault-action="toggle-rotate" data-id="${o.id}">
            ${c?"⏹️ 取消旋转模式":"🔄 进入360°旋转模式"}
          </button>
        `:""}
        <button class="btn ghost" data-vault-action="load-studio" data-id="${o.id}">
          🛠️ 载入工坊精调/预览断面
        </button>
      </div>
    `,i.appendChild(M)}i.querySelectorAll("[data-vault-expr]").forEach(o=>{o.addEventListener("change",a=>{const l=o.dataset.vaultExpr,c=a.target.value,u=k.collectibles.find(d=>d.id===l);if(!u)return;u.deadExpression=c,u.morphs={...u.morphs||{},deadExpression:c},Ot(),se&&se.pets.has(l)&&se.setPetExpression(l,c);const h=fs.find(d=>d.id===c);ke(`💀 已将「${u.name}」表情切换为：${h?h.label:c}`)})}),i.querySelectorAll("[data-vault-container]").forEach(o=>{o.addEventListener("change",a=>{const l=o.dataset.vaultContainer,c=a.target.value,u=k.collectibles.find(d=>d.id===l);if(!u)return;u.containerStyle=c,Ot(),se&&se.pets.has(l)&&se.setPetContainerStyle(l,c);const h=jr.find(d=>d.id===c);ke(`🧪 已将「${u.name}」容器切换为：${h?h.label:c}`)})}),i.querySelectorAll("[data-vault-role]").forEach(o=>{o.addEventListener("change",a=>{const l=o.dataset.vaultRole,c=a.target.value,u=k.collectibles.find(d=>d.id===l);if(!u)return;u.studyRole=c;const h=es(c);u.studyGoalNote=h.desc,Ot(),se&&se.pets.has(l)&&(se.pets.get(l).collectible.studyRole=c,se.pets.get(l).collectible.studyGoalNote=h.desc,se.emitPetsChange()),Vt(),ke(`🎓 已为「${u.name}」绑定伴学职能：${h.label}`)})}),i.querySelectorAll("[data-vault-action]").forEach(o=>{o.addEventListener("click",async()=>{const a=o.dataset.vaultAction,l=o.dataset.id,c=k.collectibles.find(u=>u.id===l);if(!(!c||!se)){if(a==="trigger-role"){xl(l);return}if(a==="toggle-summon"){if(se.pets.has(l))se.recallCollectible(l),c.summoned=!1,ke(`已从电脑屏幕收回藏品「${c.name}」`);else{try{await se.summonCollectible(c)}catch{ke(`召唤失败：请重新导入「${c.name}」的原始模型。`);return}c.summoned=!0,ke(`✨ 已将「${c.name}」召唤至电脑屏幕 3D 盒型空间！`)}Ot(),Vt()}else a==="toggle-rotate"?(se.toggleRotationMode(l),Vt()):a==="load-studio"&&(zy(c),Br("studio"),ke(`已将「${c.name}」载入半自动工坊`))}})})}function Fy(i=[]){const e=document.getElementById("active-pet-count-badge");e&&(e.textContent=`${i.length} 在屏`);const t=document.getElementById("triumph-active-specimens");t&&(t.textContent=`${i.length} 具青春标本伴读中`);const n=document.getElementById("screen-pets-pills");if(n){if(n.innerHTML="",i.length===0){n.innerHTML='<span style="font-size:11.5px;color:#94a3b8;">当前屏幕暂无桌宠，可在「典藏库」点击召唤至屏幕</span>';return}for(const s of i){const r=k.collectibles.find(f=>f.id===s.id)||s,o=s.deadExpression||"dead_calm",a=s.containerStyle||"glass_bell_jar",l=r.studyRole||"gaokao_pomodoro",c=fs.map(f=>`<option value="${f.id}" ${f.id===o?"selected":""}>💀${f.shortLabel}</option>`).join(""),u=jr.map(f=>`<option value="${f.id}" ${f.id===a?"selected":""}>🧪${f.shortLabel}</option>`).join(""),h=Or.map(f=>`<option value="${f.id}" ${f.id===l?"selected":""}>${f.shortLabel}</option>`).join(""),d=document.createElement("div");d.className=`pet-pill ${s.isRotationMode?"rotating":""}`,d.innerHTML=`
      <strong>${s.name.split("·")[0].trim()}</strong>
      <select class="pill-mini-btn" data-pill-role="${s.id}" title="分配该角色绑定的伴学职能" style="padding:1px 4px;background:rgba(6,78,59,0.85);color:#a7f3d0;border:1px solid rgba(16,185,129,0.5);border-radius:4px;">
        ${h}
      </select>
      <button class="pill-role-trigger-btn" data-pill-trigger-role="${s.id}" title="一键激发该角色的伴学赋能">⚡督学</button>
      <select class="pill-mini-btn" data-pill-expr="${s.id}" title="切换死人表情" style="padding:1px 4px;background:rgba(15,23,42,0.9);color:#fda4af;border:1px solid rgba(244,63,94,0.4);border-radius:4px;">
        ${c}
      </select>
      <select class="pill-mini-btn" data-pill-container="${s.id}" title="切换标本容器" style="padding:1px 4px;background:rgba(15,23,42,0.9);color:#fde68a;border:1px solid rgba(251,191,36,0.4);border-radius:4px;">
        ${u}
      </select>
      <button class="pill-mini-btn" data-pill-rot="${s.id}">
        ${s.isRotationMode?"🔄 旋转中":"🔄 旋转"}
      </button>
      <button class="pill-mini-btn" data-pill-reset="${s.id}" title="重置角度">回正</button>
    `,n.appendChild(d)}n.querySelectorAll("[data-pill-role]").forEach(s=>{s.addEventListener("change",r=>{const o=s.dataset.pillRole,a=r.target.value,l=k.collectibles.find(u=>u.id===o),c=es(a);l&&(l.studyRole=a,l.studyGoalNote=c.desc,Ot()),se&&se.pets.has(o)&&(se.pets.get(o).collectible.studyRole=a,se.pets.get(o).collectible.studyGoalNote=c.desc),Vt(),ke(`🎓 已为「${l?l.name:o}」绑定伴学职能：${c.label}`)})}),n.querySelectorAll("[data-pill-trigger-role]").forEach(s=>{s.addEventListener("click",()=>{xl(s.dataset.pillTriggerRole)})}),n.querySelectorAll("[data-pill-expr]").forEach(s=>{s.addEventListener("change",r=>{const o=s.dataset.pillExpr,a=r.target.value,l=k.collectibles.find(c=>c.id===o);l&&(l.deadExpression=a,l.morphs={...l.morphs||{},deadExpression:a},Ot()),se.setPetExpression(o,a),Vt()})}),n.querySelectorAll("[data-pill-container]").forEach(s=>{s.addEventListener("change",r=>{const o=s.dataset.pillContainer,a=r.target.value,l=k.collectibles.find(c=>c.id===o);l&&(l.containerStyle=a,Ot()),se.setPetContainerStyle(o,a),Vt()})}),n.querySelectorAll("[data-pill-rot]").forEach(s=>{s.addEventListener("click",()=>{se.toggleRotationMode(s.dataset.pillRot),Vt()})}),n.querySelectorAll("[data-pill-reset]").forEach(s=>{s.addEventListener("click",()=>{se.resetPetOrientation(s.dataset.pillReset)})})}}function ky(){const i=document.getElementById("anatomy-2d-preview");i&&cu(i,{skinColor:k.studioDraft.skinTone,vascularContrast:k.studioDraft.anatomyOptions.vascularContrast,dermisRimScale:k.studioDraft.anatomyOptions.dermisRimScale,showLabels:k.studioDraft.anatomyOptions.showLabels})}function Cu(i){if(!i)return"未取得模型信息";const e=(i.triangles||0).toLocaleString("zh-HK"),t=i.maxTextureSize?i.maxTextureSize>=1024?`${(i.maxTextureSize/1024).toFixed(i.maxTextureSize%1024?1:0)}K`:`${i.maxTextureSize}px`:"无可读贴图";if(i.source==="built-in-demo")return`内置演示头模 · ${e} 三角面 · 源贴图最大 ${t} · 非 DAZ/扫描级资产`;const n=[i.hasNormalMap?"法线图":"无内嵌法线图",i.hasRoughnessMap?"粗糙度图":"无粗糙度图",i.hasDisplacementMap?"置换图":"无置换图"].join(" / ");return`用户 GLB · ${e} 三角面 · 最大贴图 ${t} · 保留原 PBR（${n}）`}async function Jt(){var e,t,n,s;if(!Be)return;await Be.loadOrRebuild(k.studioDraft);const i=document.getElementById("custom-model-status");if(i){const r=(t=(e=Be.headNode)==null?void 0:e.userData)==null?void 0:t.groomStats;i.textContent=Cu((s=(n=Be.headNode)==null?void 0:n.userData)==null?void 0:s.assetStats)+(r?` · 新Groom：源 ${r.sourceCurves.toLocaleString()} 曲线 / 实时 ${r.renderedStrands.toLocaleString()} 发丝`:"");const o=document.getElementById("groom-quality-status");o&&(o.textContent=r?`曲线 Groom · ${r.sourceCurves.toLocaleString()} 根源曲线 · 本预览 ${r.renderedStrands.toLocaleString()} 根立体渐细发丝 · ${r.triangles.toLocaleString()} 三角面${r.softwareFallback?" · 检测到软件渲染，已保守降级并关闭HDR后期；完整效果需开启硬件加速":""}`:"当前为旧版发型或外部资产，不适用新 Groom 密度控制。"),i.title="实时 PBR 的最终细节受原始网格密度、贴图分辨率和材质图完整度限制。"}ky()}function Va(i){const e=document.getElementById("sel-dead-expression");e&&(e.value=i),document.querySelectorAll("[data-dead-expr]").forEach(t=>{t.classList.toggle("active",t.dataset.deadExpr===i)})}function Ur(i){const e=document.getElementById("sel-hair-style");e&&(e.value=i),document.querySelectorAll("[data-hair-preset]").forEach(t=>{t.classList.toggle("active",t.dataset.hairPreset===i)})}function zy(i){var o,a,l,c,u;const e=i.deadExpression||((o=i.morphs)==null?void 0:o.deadExpression)||"dead_calm";k.studioDraft=JSON.parse(JSON.stringify({basePreset:i.basePreset||"user_photo",deadExpression:e,containerStyle:i.containerStyle||"glass_bell_jar",decorStyle:i.decorStyle||"trophy_candles",customModelUrl:i.customModelUrl||null,customModelType:i.customModelType||"glb",skinTone:i.skinTone||"#ffe9df",blushIntensity:i.blushIntensity??.25,lipColor:i.lipColor||"#bf6872",irisColor:i.irisColor||"#3b2014",hairStyle:i.hairStyle||"groom_photo_tied",groomDensity:i.groomDensity||6e3,hairColor:i.hairColor||"#191518",hairSheen:i.hairSheen??.9,neckClearance:i.neckClearance??.38,photoElement:null,photoBlend:0,morphs:{deadExpression:e,jawOpen:0,eyeRollUp:0,tongueOut:0,jawSide:0,bangsLength:0,hairVolume:0,...i.morphs||{}},anatomyOptions:{...i.anatomyOptions}})),document.getElementById("sel-base-preset").value=k.studioDraft.basePreset,Ur(k.studioDraft.hairStyle),document.getElementById("sel-groom-density").value=String(k.studioDraft.groomDensity||6e3),Va(e),document.getElementById("col-skin").value=k.studioDraft.skinTone,document.getElementById("col-lip").value=k.studioDraft.lipColor,document.getElementById("col-iris").value=k.studioDraft.irisColor,document.getElementById("col-hair").value=k.studioDraft.hairColor,document.getElementById("inp-col-name").value=i.name,document.getElementById("inp-col-id").value=i.id,document.getElementById("inp-col-subtitle").value=i.subtitle||"",document.getElementById("inp-col-cutlevel").value=((a=i.anatomyOptions)==null?void 0:a.cutLevel)||"",document.getElementById("inp-col-notes").value=((l=i.dossier)==null?void 0:l.anatomyNotes)||"";const t=document.getElementById("sel-col-container");t&&(t.value=k.studioDraft.containerStyle);const n=document.getElementById("sel-col-decor");n&&(n.value=k.studioDraft.decorStyle);const s=document.getElementById("inp-col-vitality");s&&((c=i.fateRecord)!=null&&c.vitalityStatus)&&(s.value=i.fateRecord.vitalityStatus);const r=document.getElementById("inp-col-cause");r&&((u=i.fateRecord)!=null&&u.causeOfDeath)&&(r.value=i.fateRecord.causeOfDeath),Jt()}async function Ns(){try{if(window.location.protocol==="file:")throw new Error("offline file mode");const e=await(await fetch("/api/collectibles")).json();if(e.ok&&Array.isArray(e.items)){k.archiveItems=e.items,Wa();return}}catch{}k.archiveItems=k.collectibles.map(i=>{var e,t,n;return{folderName:i.folderName||`${i.id}_${i.name}`,folderPath:`/collectibles/${i.folderName||i.id}`,manifest:i,dossierMd:`# 颅相典藏档案 · ${i.name} (${i.id})

- **典藏编号**: \`${i.id}\`
- **藏品名称**: ${i.name}
- **副标题**: ${i.subtitle||""}
- **解剖断面**: ${((e=i.anatomyOptions)==null?void 0:e.cutLevel)||""}

## 骨相与解剖记录
${((t=i.dossier)==null?void 0:t.origin)||""}

${((n=i.dossier)==null?void 0:n.anatomyNotes)||""}`}}),Wa()}function Wa(){const i=document.getElementById("archive-folder-list");if(!i)return;i.innerHTML="",k.archiveItems.forEach((t,n)=>{var r;const s=document.createElement("div");s.className=`archive-folder-item ${n===k.selectedArchiveIndex?"active":""}`,s.innerHTML=`
      <div class="arch-folder-name">📁 /collectibles/${t.folderName}/</div>
      <div class="arch-folder-sub">${t.manifest.name} · ${((r=t.manifest.anatomyOptions)==null?void 0:r.cutLevel)||"C4横断面"}</div>
    `,s.addEventListener("click",()=>{k.selectedArchiveIndex=n,Wa()}),i.appendChild(s)});const e=k.archiveItems[k.selectedArchiveIndex];e&&(document.getElementById("arch-inspect-title").textContent=`📄 正在检视: /collectibles/${e.folderName}/`,document.getElementById("arch-dossier-content").textContent=e.dossierMd||"",document.getElementById("arch-manifest-content").textContent=JSON.stringify(e.manifest,null,2))}function Hy(){const i=document.getElementById("tutorial-steps-container");i&&(i.innerHTML=Uu.map(e=>`
    <div class="tutorial-card">
      <span class="tut-step-badge">${e.step}</span>
      <h3>${e.title}</h3>
      <div class="tut-sub">${e.subtitle}</div>
      <div class="tut-list">
        ${e.content.map(t=>`<p>${t}</p>`).join("")}
      </div>
      <div class="tut-protip">💡 <strong>实战技巧：</strong>${e.proTip}</div>
    </div>
  `).join(""))}function Br(i){document.querySelectorAll(".nav-tab").forEach(e=>{e.classList.toggle("active",e.dataset.tab===i)}),document.querySelectorAll(".tab-panel").forEach(e=>{e.classList.toggle("active",e.id===`tab-${i}`)}),i==="studio"&&Be&&setTimeout(()=>Be.resize(),40),i==="archives"&&Ns()}function Gy(){const i=document.getElementById("software-window"),e=document.getElementById("window-titlebar");if(!i||!e)return;let t=!1,n=0,s=0,r=0,o=0;e.addEventListener("pointerdown",d=>{var g;if((g=window.cervixDesktopBridge)!=null&&g.isDesktop||d.target.closest("button"))return;t=!0;const f=i.getBoundingClientRect();i.style.transform="none",i.style.left=`${f.left}px`,i.style.top=`${f.top}px`,n=d.clientX,s=d.clientY,r=f.left,o=f.top}),window.addEventListener("pointermove",d=>{if(!t)return;const f=Math.max(8,Math.min(window.innerWidth-200,r+(d.clientX-n))),g=Math.max(46,Math.min(window.innerHeight-100,o+(d.clientY-s)));i.style.left=`${f}px`,i.style.top=`${g}px`}),window.addEventListener("pointerup",()=>{t=!1}),document.getElementById("win-btn-center").addEventListener("click",()=>{var d;if((d=window.cervixDesktopBridge)!=null&&d.isDesktop){window.cervixDesktopBridge.centerManager();return}i.style.left="",i.style.right="16px",i.style.top="58px",i.style.transform="",Be&&setTimeout(()=>Be.resize(),60)});const a=()=>{i.classList.toggle("window-dock-right");const d=i.classList.contains("window-dock-right"),f=document.getElementById("btn-quick-dock-window");f&&(f.textContent=d?"◧ 窗口: 右侧紧凑停靠":"🗖 窗口: 宽屏工作台"),Be&&setTimeout(()=>Be.resize(),180)},l=document.getElementById("win-btn-dock");l&&l.addEventListener("click",a);const c=document.getElementById("btn-quick-dock-window");c&&c.addEventListener("click",a);const u=document.getElementById("win-btn-glass");u&&u.addEventListener("click",()=>{i.classList.toggle("window-glass"),ke(i.classList.contains("window-glass")?"🌓 已开启半透明毛玻璃窗口模式，可直接透视后方3D盒型空间":"已恢复标准不透明窗口模式")});const h=document.getElementById("btn-quick-pets-top");h&&h.addEventListener("click",()=>{const d=!se.settings.petsAlwaysOnTop;se.updateSettings({petsAlwaysOnTop:d});const f=document.getElementById("desktop-pet-canvas");f&&f.classList.toggle("pets-behind-window",!d),h.classList.toggle("active-top",d),h.textContent=d?"📌 3D桌宠: 置顶最前":"🖥️ 3D桌宠: 桌面背景层",ke(d?"📌 3D桌宠已设为【置顶最前】：绝不被DAZ窗口遮挡，且可直接穿透拖拽/旋转！":"🖥️ 3D桌宠已设为【桌面背景层】：位于软件窗口后方")})}function Ps(i,e=!1){k.windowHidden=i,document.getElementById("software-window").classList.toggle("window-hidden",i),document.getElementById("btn-toggle-window").textContent=i?"🗖 展开 CERVIX-3D 软件主窗口":"🗕 隐藏软件窗口 (纯看屏幕桌宠)";const t=window.cervixDesktopBridge;t!=null&&t.isDesktop&&(document.body.classList.toggle("real-desktop-overlay",i),document.body.classList.toggle("real-desktop-manager",!i),e||t.setMode(i?"overlay":"manager"))}window.addEventListener("DOMContentLoaded",async()=>{var s,r,o,a,l,c,u,h,d,f,g,_,m,p,x,b;const i=document.getElementById("start-game-overlay"),e=document.getElementById("btn-start-pure-desktop"),t=document.getElementById("btn-start-with-studio");e&&e.addEventListener("click",()=>{i&&i.classList.add("hidden"),Ps(!0),Ve.playSummon(!0),ke("🎮 已进入屏幕 3D 桌宠把玩模式！悬停看档案 | 单击模型切换360°旋转 | 滚轮推拉景深 | 拖拽碰撞盒壁")}),t&&t.addEventListener("click",()=>{i&&i.classList.add("hidden"),Ps(!1),Ve.playSummon(!0),ke("🛠️ 已进入 CERVIX-3D 典藏库与建模工坊！可随时点击右上角「隐藏软件窗口」看屏幕桌宠")});const n=document.getElementById("boot-status");try{(s=window.cervixDesktopBridge)!=null&&s.isDesktop&&(document.body.classList.remove("bg-mode-os","bg-mode-void"),document.body.classList.add("bg-mode-transparent","real-desktop-manager"),window.cervixDesktopBridge.onModeChange(v=>Ps(v==="overlay",!0)),document.getElementById("win-btn-close").addEventListener("click",()=>window.cervixDesktopBridge.quit()));const M=document.getElementById("desktop-pet-canvas");se=new yy(M,{onHoverChange:vh,onPetStateUpdate:v=>{Fy(v),Vt()},onBoxCollisionVisual:v=>{const y=document.getElementById(`flash-${v}`);y&&(y.classList.add("active"),setTimeout(()=>y.classList.remove("active"),260))}}),(r=window.cervixDesktopBridge)!=null&&r.isDesktop&&(se.updateSettings({showBoxGrid:"hidden"}),window.cervixDesktopBridge.onCursorPoint(({x:v,y})=>{if(!k.windowHidden)return;const I=v>=0&&y>=0&&v<window.innerWidth&&y<window.innerHeight;let H=null;I&&(se.updateMouseCoords({clientX:v,clientY:y}),H=se.pickPetAtCursor()),window.cervixDesktopBridge.setIgnoreMouseEvents(!(H||se.pointerDownInfo)),se.pointerDownInfo||(se.hoveredPetId=(H==null?void 0:H.id)||null,H?se.refreshHoverHUD():vh(null))}));for(const v of k.collectibles)if(v.summoned)try{await se.summonCollectible(v)}catch(y){console.warn(`藏品「${v.name}」暂无法恢复：`,y)}Vt(),n&&(n.textContent="桌宠已加载，正在准备建模工坊…");const P=document.getElementById("studio-preview-canvas");Be=new Ny(P);const A=document.getElementById("ref-photo-canvas");Zo(A,"user_photo"),await Jt(),window.__cervixQA={get desktop(){return se},get studio(){return Be},state:k},Hy(),Ns(),Gy(),document.querySelectorAll(".nav-tab").forEach(v=>{v.addEventListener("click",()=>Br(v.dataset.tab))}),document.querySelectorAll(".os-icon").forEach(v=>{v.addEventListener("click",()=>{Ps(!1),Br(v.dataset.tab)})});const C=document.getElementById("btn-toggle-window"),R=()=>{Ps(!k.windowHidden),k.windowHidden&&ke("已隐藏软件窗口！现在您可以直接在电脑屏幕上拖拽3D头模、滚轮推拉景深、单击切换360°旋转模式")};C.addEventListener("click",R),document.getElementById("win-btn-minimize").addEventListener("click",R),document.getElementById("btn-quick-box-grid").addEventListener("click",v=>{const y=["always","interaction","hidden"],I={always:"📦 盒型透视网格: 常显",interaction:"📦 盒型透视网格: 交互显",hidden:"📦 盒型透视网格: 隐藏"},H=(y.indexOf(se.settings.showBoxGrid)+1)%y.length,z=y[H];se.updateSettings({showBoxGrid:z}),document.getElementById("sel-box-grid-mode").value=z,document.getElementById("vanishing-point-hud").style.opacity=z==="hidden"?"0":"0.72",v.currentTarget.textContent=I[z]}),document.getElementById("btn-quick-bg-mode").addEventListener("click",v=>{const y=["bg-mode-os","bg-mode-void","bg-mode-transparent"],I=["🖥️ 背景: 仿真电脑桌面","🌑 背景: 暗房标本展柜","✨ 背景: 透明桌面层"];document.body.classList.remove(...y),k.bgModeIndex=(k.bgModeIndex+1)%y.length,document.body.classList.add(y[k.bgModeIndex]),document.getElementById("os-desktop-icons").style.display=k.bgModeIndex===0?"flex":"none",v.currentTarget.textContent=I[k.bgModeIndex]}),document.getElementById("btn-quick-mute").addEventListener("click",v=>{Ve.enabled=!Ve.enabled,v.currentTarget.textContent=Ve.enabled?"🔊 物理音效: 开启":"🔇 物理音效: 静音",Ve.enabled&&Ve.playPickup(0)}),document.getElementById("btn-summon-all").addEventListener("click",async()=>{for(const v of k.collectibles)if(!se.pets.has(v.id))try{await se.summonCollectible(v),v.summoned=!0}catch(y){console.warn(`召唤「${v.name}」失败`,y)}Ot(),Vt(),ke("✨ 已将全部典藏头部桌宠召唤至电脑屏幕 3D 盒型空间！")}),document.getElementById("btn-goto-register").addEventListener("click",()=>{Br("studio")}),document.querySelectorAll("[data-ref-photo]").forEach(v=>{v.addEventListener("click",()=>{document.querySelectorAll("[data-ref-photo]").forEach(I=>I.classList.remove("active")),v.classList.add("active");const y=v.dataset.refPhoto;Zo(A,y),k.studioDraft.photoElement=A,document.getElementById("photo-status-badge").textContent=`内置参考照：${v.textContent}`})}),document.getElementById("input-photo-upload").addEventListener("change",v=>{var H;const y=(H=v.target.files)==null?void 0:H[0];if(!y)return;const I=new FileReader;I.onload=z=>{const W=new Image;W.onload=()=>{const le=A.getContext("2d");le.clearRect(0,0,A.width,A.height),le.drawImage(W,0,0,A.width,A.height);const ne=document.getElementById("studio-photo-overlay");ne.getContext("2d").drawImage(W,0,0,ne.width,ne.height),k.studioDraft.photoElement=W,k.studioDraft.lifePhotoDataUrl=z.target.result,document.getElementById("photo-status-badge").textContent=`已载入生前照片：${y.name}`,ke(`📸 已载入角色生前照片「${y.name}」，保存后鼠标悬停在桌宠上即可查看生前真容！`)},W.src=z.target.result},I.readAsDataURL(y)}),document.getElementById("btn-auto-sample-photo").addEventListener("click",async()=>{const v=k.studioDraft.photoElement||A,y=Mv(v);k.studioDraft.skinTone=y.skinTone,document.getElementById("col-skin").value=y.skinTone,Be.setCameraPreset("front"),await Jt(),Ve.playSummon(!0),ke(`✨ 已从参考照片智能提取肤色 (${y.skinTone}) 并对齐正面骨相机位！`)}),document.getElementById("chk-photo-overlay").addEventListener("change",v=>{document.getElementById("studio-photo-overlay").classList.toggle("hidden",!v.target.checked),v.target.checked&&Be.setCameraPreset("front")}),document.getElementById("slider-overlay-opacity").addEventListener("input",v=>{const y=parseFloat(v.target.value);document.getElementById("val-overlay-opacity").textContent=`${Math.round(y*100)}%`,document.getElementById("studio-photo-overlay").style.opacity=String(y)}),document.getElementById("input-model-upload").addEventListener("change",async v=>{var W,le,ne;const y=(W=v.target.files)==null?void 0:W[0];if(!y)return;if(!y.name.toLowerCase().endsWith(".glb")){ke("目前仅支持内嵌贴图的 .glb；OBJ/GLTF 附属文件不会自动读取。"),v.target.value="";return}const I=k.studioDraft.customModelUrl,H=k.studioDraft.hairStyle;let z=null;try{try{z=await Nv(y)}catch(ie){console.warn("无法持久化私人模型，仅保留当前会话",ie),z=URL.createObjectURL(y)}k.studioDraft.customModelUrl=z,k.studioDraft.customModelType="glb",k.studioDraft.hairStyle="none",document.getElementById("sel-hair-style").value="none",await Jt();const ce=Bv(z),Ne=(ne=(le=Be.headNode)==null?void 0:le.userData)==null?void 0:ne.assetStats;document.getElementById("custom-model-status").textContent=`${y.name} · ${Cu(Ne)} · ${ce?"已存本机 IndexedDB":"仅当前会话"}`,document.getElementById("custom-model-status").title="已统一头部显示尺寸并保留原 GLB 材质/贴图；请检查方向、颈口和所有贴图是否正确。",ke(`已预览「${y.name}」。${ce?"本浏览器可恢复；仍请保留原文件备份。":"浏览器存储失败，关闭页面后需重新选择。"}`)}catch(ce){k.studioDraft.customModelUrl=I,k.studioDraft.hairStyle=H,document.getElementById("sel-hair-style").value=H,z!=null&&z.startsWith("blob:")&&URL.revokeObjectURL(z),v.target.value="",console.warn("头部 GLB 导入失败",ce);const Ne=String((ce==null?void 0:ce.message)||"文件无法解析").replace(/[<>]/g,"").slice(0,150);document.getElementById("custom-model-status").textContent=`导入失败：${Ne}`,ke(`GLB 导入失败：${Ne}`)}});const E=[{id:"groom_photo_tied",name:"新曲线 Groom · 碎刘海露耳束发"},{id:"groom_center_long",name:"新曲线 Groom · 中式中分长发"},{id:"groom_low_chignon",name:"新曲线 Groom · 中式低盘发"},{id:"hair_user_photo",name:"照片同款 · 空气碎刘海露耳束发 (5,029v)"},{id:"hair_short02",name:"O4saken · 中式空气刘海微卷波波 (12,547v)"},{id:"hair_long01",name:"Elvs Lara · 中分长发样例 (17,360v)"},{id:"hair_braid01",name:"Elvs Adrienne · 法式蓬松微卷盘发 (9,352v)"},{id:"hair_short04",name:"Elvs Daisy · 千金感斜刘海半束发 (6,721v)"},{id:"hair_ponytail01",name:"Elvs Hazel · 利落偏分高颅顶束发 (4,891v)"},{id:"hair_bob02",name:"Toigo · 日系层次内卷短波波 (3,031v)"},{id:"hair_bob01",name:"Toigo · 经典齐刘海内扣学生波波 (2,806v)"}];let S=0;document.getElementById("btn-test-scan-glb").addEventListener("click",async()=>{S=(S+1)%E.length;const v=E[S];k.studioDraft.hairStyle=v.id,document.getElementById("sel-hair-style").value=v.id,document.getElementById("custom-model-status").textContent=`内置演示头模 + ${v.name}`,await Jt(),Ve.playSummon(!0),ke(`💇‍♀️ 已切换 MhcloFit 高精 3D 发型：${v.name} (${v.id}.glb)`)}),document.querySelectorAll("[data-cam]").forEach(v=>{v.addEventListener("click",()=>{document.querySelectorAll("[data-cam]").forEach(y=>y.classList.remove("active")),v.classList.add("active"),Be.setCameraPreset(v.dataset.cam)})}),document.getElementById("chk-anatomy-labels").addEventListener("change",async v=>{k.studioDraft.anatomyOptions.showLabels=v.target.checked,await Jt()});const w=v=>{k.studioDraft.deadExpression=v,k.studioDraft.morphs.deadExpression=v,Va(v),Be.updateMorphsFast(k.studioDraft.morphs);const y=fs.find(I=>I.id===v);y&&ke(`💀 已切换死人/尸相表情：${y.label} — ${y.desc}`)},L=document.getElementById("sel-dead-expression");L&&L.addEventListener("change",v=>{w(v.target.value)}),document.querySelectorAll("[data-dead-expr]").forEach(v=>{v.addEventListener("click",()=>{w(v.dataset.deadExpr)})}),document.getElementById("sel-base-preset").addEventListener("change",async v=>{k.studioDraft.customModelUrl=null,k.studioDraft.basePreset=v.target.value;const y={fangyaoping:"groom_photo_tied",user_photo:"groom_photo_tied",linxi:"groom_center_long",suwan:"groom_low_chignon",qianxue:"groom_hime_cut",shenzhiwei:"groom_clavicle_bob"},I={fangyaoping:"dead_calm",user_photo:"dead_calm",linxi:"dead_calm",suwan:"dead_calm",qianxue:"dead_shock",shenzhiwei:"dead_smile"},H={fangyaoping:{jawVLine:.18,chinLength:-.22,cheekSoftness:.42,noseBridge:.14,eyeAlmond:.32,eyeTilt:-.06,lipFullness:.06},user_photo:{jawVLine:.12,chinLength:-.25,cheekSoftness:.35,noseBridge:.1,eyeAlmond:.25,eyeTilt:-.06,lipFullness:0},linxi:{jawVLine:-.35,chinLength:.08,cheekSoftness:-.32,noseBridge:.38,eyeAlmond:.06,eyeTilt:.34,lipFullness:0},suwan:{jawVLine:.42,chinLength:.2,cheekSoftness:.1,noseBridge:.28,eyeAlmond:.18,eyeTilt:.1,lipFullness:0},qianxue:{jawVLine:.36,chinLength:-.38,cheekSoftness:.32,noseBridge:.24,eyeAlmond:.38,eyeTilt:.4,lipFullness:0},shenzhiwei:{jawVLine:.2,chinLength:.38,cheekSoftness:-.3,noseBridge:.34,eyeAlmond:.08,eyeTilt:.16,lipFullness:0}};if((v.target.value==="fangyaoping"||v.target.value==="user_photo")&&Zo(A,v.target.value),y[v.target.value]&&(k.studioDraft.hairStyle=y[v.target.value],Ur(k.studioDraft.hairStyle)),I[v.target.value]&&(k.studioDraft.deadExpression=I[v.target.value],k.studioDraft.morphs.deadExpression=I[v.target.value],Va(I[v.target.value])),H[v.target.value]){Object.assign(k.studioDraft.morphs,H[v.target.value]);for(const[z,W,le]of[["morph-jaw","val-morph-jaw","jawVLine"],["morph-cheek","val-morph-cheek","cheekSoftness"],["morph-nose","val-morph-nose","noseBridge"],["morph-eye","val-morph-eye","eyeAlmond"],["morph-lip","val-morph-lip","lipFullness"]]){const ne=document.getElementById(z),ce=document.getElementById(W),Ne=Number(k.studioDraft.morphs[le]??0);ne&&(ne.value=String(Ne)),ce&&(ce.textContent=`${Ne>=0?"+":""}${Ne.toFixed(2)}`)}}document.getElementById("custom-model-status").textContent=`内置高定头模 (${v.target.value} + ${k.studioDraft.hairStyle})`,await Jt()});const N=(v,y,I,H="")=>{const z=document.getElementById(v);z&&z.addEventListener("input",W=>{const le=parseFloat(W.target.value);k.studioDraft.morphs[I]=le,document.getElementById(y).textContent=`${le>=0?"+":""}${le.toFixed(H==="°"||H==="cm"?1:2)}${H}`,Be.updateMorphsFast(k.studioDraft.morphs)})};N("morph-jaw-open","val-morph-jaw-open","jawOpen"),N("morph-eye-roll","val-morph-eye-roll","eyeRollUp"),N("morph-tongue-out","val-morph-tongue-out","tongueOut"),N("morph-jaw-side","val-morph-jaw-side","jawSide"),N("morph-bangs-len","val-morph-bangs-len","bangsLength"),N("morph-hair-vol","val-morph-hair-vol","hairVolume"),N("morph-jaw","val-morph-jaw","jawVLine"),N("morph-cheek","val-morph-cheek","cheekSoftness"),N("morph-nose","val-morph-nose","noseBridge"),N("morph-eye","val-morph-eye","eyeAlmond"),N("morph-lip","val-morph-lip","lipFullness"),N("morph-cut-height","val-cut-height","cutHeightOffset","cm"),N("morph-cut-pitch","val-cut-pitch","cutTiltPitch","°");for(const[v,y]of[["col-skin","skinTone"],["col-lip","lipColor"],["col-iris","irisColor"],["col-hair","hairColor"]])document.getElementById(v).addEventListener("input",async I=>{k.studioDraft[y]=I.target.value,await Jt()});document.getElementById("sel-groom-density").addEventListener("change",async v=>{k.studioDraft.groomDensity=Number(v.target.value),await Jt()}),document.getElementById("sel-hair-style").addEventListener("change",async v=>{k.studioDraft.hairStyle=v.target.value,Ur(k.studioDraft.hairStyle),await Jt()}),document.querySelectorAll("[data-hair-preset]").forEach(v=>{v.addEventListener("click",async()=>{k.studioDraft.hairStyle=v.dataset.hairPreset,Ur(k.studioDraft.hairStyle);const y=Lu.find(I=>I.id===k.studioDraft.hairStyle);y&&ke(`💇‍♀️ 已切换中国女性高定发型：${y.label}`),await Jt()})}),document.getElementById("slider-hair-sheen").addEventListener("input",v=>{const y=parseFloat(v.target.value);k.studioDraft.hairSheen=y,document.getElementById("val-hair-sheen").textContent=`${Math.round(y*100)}%`,ry(Be.headNode,y)}),document.getElementById("slider-neck-clearance").addEventListener("input",async v=>{const y=parseFloat(v.target.value);k.studioDraft.neckClearance=y,document.getElementById("val-neck-clearance").textContent=`${Math.round(y*100)}%`,await Jt()}),document.getElementById("slider-anatomy-wetness").addEventListener("input",async v=>{const y=parseFloat(v.target.value);k.studioDraft.anatomyOptions.wetness=y,document.getElementById("val-anatomy-wetness").textContent=`${Math.round(y*100)}%`,await Jt()}),(o=document.getElementById("sel-col-container"))==null||o.addEventListener("change",v=>{k.studioDraft.containerStyle=v.target.value,Be&&Be.headNode&&(Ei(Be.headNode,k.studioDraft),Be.wakeRender(1.5,!0))}),(a=document.getElementById("sel-col-decor"))==null||a.addEventListener("change",v=>{k.studioDraft.decorStyle=v.target.value,Be&&Be.headNode&&(Ei(Be.headNode,k.studioDraft),Be.wakeRender(1.5,!0))}),document.getElementById("btn-save-and-summon").addEventListener("click",async()=>{var ot,U,ue,$,J,pe,fe;const v=document.getElementById("inp-col-name").value.trim()||"未命名藏品",y=document.getElementById("inp-col-id").value.trim()||`SPEC-${Date.now().toString().slice(-4)}`,I=document.getElementById("inp-col-subtitle").value.trim(),H=document.getElementById("sel-col-grade").value,z=document.getElementById("inp-col-cutlevel").value.trim(),W=document.getElementById("inp-col-notes").value.trim(),le=((ot=document.getElementById("sel-col-container"))==null?void 0:ot.value)||k.studioDraft.containerStyle||"glass_bell_jar",ne=((U=document.getElementById("sel-col-decor"))==null?void 0:U.value)||k.studioDraft.decorStyle||"study_tomes",ce=((ue=document.getElementById("sel-col-study-role"))==null?void 0:ue.value)||k.studioDraft.studyRole||"gaokao_pomodoro",Ne=(($=document.getElementById("inp-col-study-goal"))==null?void 0:$.value.trim())||es(ce).desc,ie=((J=document.getElementById("inp-col-vitality"))==null?void 0:J.value.trim())||"19岁 · 巅峰健康态 · 广东怀集高考状元",ve=((pe=document.getElementById("inp-col-cause"))==null?void 0:pe.value.trim())||"突发意外瞬间定格于最鲜活的青春巅峰期",Re={id:y,folderName:`${y}_${v.split("·")[0].trim()}`,name:v,subtitle:I,grade:H,createdAt:new Date().toISOString().slice(0,16).replace("T"," "),basePreset:k.studioDraft.basePreset,deadExpression:k.studioDraft.deadExpression||((fe=k.studioDraft.morphs)==null?void 0:fe.deadExpression)||"dead_calm",containerStyle:le,decorStyle:ne,studyRole:ce,studyGoalNote:Ne,lifePhotoUrl:k.studioDraft.lifePhotoDataUrl||(k.studioDraft.basePreset==="fangyaoping"?"/models/fang_yaoping_ref.jpg":void 0),lifePhotoCaption:`📸 生前巅峰影像：${v} (${ie})`,customModelUrl:k.studioDraft.customModelUrl,customModelType:k.studioDraft.customModelType,skinTone:k.studioDraft.skinTone,blushIntensity:k.studioDraft.blushIntensity,lipColor:k.studioDraft.lipColor,irisColor:k.studioDraft.irisColor,hairStyle:k.studioDraft.hairStyle,groomDensity:k.studioDraft.groomDensity||6e3,hairColor:k.studioDraft.hairColor,hairSheen:k.studioDraft.hairSheen,neckClearance:k.studioDraft.neckClearance,fateRecord:{vitalityStatus:ie,causeOfDeath:ve,survivorTriumphNote:"她曾拥有骄傲的青春与美貌，却在意外中戛然而止；而活着的你仍在进取并主宰全局——凝视她的静默容颜，汲取全额专注能量。",energyYieldPerMin:155},morphs:{...k.studioDraft.morphs},anatomyOptions:{...k.studioDraft.anatomyOptions,cutLevel:z},dossier:{origin:k.studioDraft.customModelUrl?"基于用户自备 GLB 与手工照片对位；原件仅保存在当前浏览器私人仓库（若浏览器存储不可用则仅当前会话），导出档案不含模型文件。":`基于内置 GLB 示例 (${k.studioDraft.basePreset}) 与手工照片对位。`,anatomyNotes:W,hairNotes:`3D 发型 (${k.studioDraft.hairStyle})，光泽度 ${Math.round(k.studioDraft.hairSheen*100)}%。`,tags:["3D头部藏品",z.slice(0,10),H.split("·")[0].trim(),"解剖切面示意"]},summoned:!0,boxPosition:{x:Math.round((Math.random()-.5)*32),y:Math.round((Math.random()-.5)*14),z:-160}},Le=k.collectibles.findIndex(Ue=>Ue.id===y);Le>=0?k.collectibles[Le]=Re:k.collectibles.unshift(Re);const ye=Ot();let qe=!1;if(location.protocol!=="file:"&&!location.hostname.endsWith(".github.io"))try{qe=(await fetch("/api/collectibles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({collectible:Re})})).ok}catch{}await Ns();try{await se.summonCollectible(Re)}catch(Ue){console.warn("召唤失败，藏品档案仍已保存",Ue)}Vt();const ze=k.collectibles.length+1;document.getElementById("inp-col-id").value=`SPEC-2026-00${ze}`,ke(qe?`已在本地服务目录生成档案并登记「${v}」。`:ye?`已在浏览器保存「${v}」；可从档案页下载实体文件夹 ZIP。`:`「${v}」仅在本次会话保留；浏览器存储不足，请下载档案备份。`)});const G=document.getElementById("vanishing-point-hud"),V=()=>{const v=se.settings.vanishingPointOffsetX,y=se.settings.vanishingPointOffsetY;G.style.left=`${(.5+v)*100}%`,G.style.top=`${(.5+y)*100}%`,document.getElementById("vp-coord-text").textContent=`(${Math.round(v*100)}%, ${Math.round(-y*100)}%)`,document.getElementById("vp-depth-range").textContent=`0 ~ -${se.settings.boxMaxDepthMm}mm`};document.getElementById("set-vp-x").addEventListener("input",v=>{const y=parseFloat(v.target.value);document.getElementById("val-set-vp-x").textContent=`${Math.round(y*100)}%`,se.updateSettings({vanishingPointOffsetX:y}),V()}),document.getElementById("set-vp-y").addEventListener("input",v=>{const y=parseFloat(v.target.value);document.getElementById("val-set-vp-y").textContent=`${Math.round(y*100)}%`,se.updateSettings({vanishingPointOffsetY:-y}),V()}),document.getElementById("set-box-depth").addEventListener("input",v=>{const y=parseInt(v.target.value,10);document.getElementById("val-set-box-depth").textContent=`${y} mm`,se.updateSettings({boxMaxDepthMm:y}),V()}),(l=document.getElementById("chk-box-fit-screen"))==null||l.addEventListener("change",v=>{se.updateSettings({boxFitScreen:v.target.checked}),ke(v.target.checked?"🖥️ 盒型空间已贴满屏幕边缘":"📐 已切换为自定义盒型宽/高")}),document.getElementById("set-box-width").addEventListener("input",v=>{const y=parseInt(v.target.value,10);document.getElementById("val-set-box-width").textContent=`${y} cm`,se.updateSettings({boxWidthCm:y})}),document.getElementById("set-box-height").addEventListener("input",v=>{const y=parseInt(v.target.value,10);document.getElementById("val-set-box-height").textContent=`${y} cm`,se.updateSettings({boxHeightCm:y})}),document.getElementById("set-fov").addEventListener("input",v=>{const y=parseInt(v.target.value,10);document.getElementById("val-set-fov").textContent=`${y}°`,se.updateSettings({fov:y})}),document.getElementById("sel-box-grid-mode").addEventListener("change",v=>{const y=v.target.value;se.updateSettings({showBoxGrid:y}),G.style.opacity=y==="hidden"?"0":"0.72"}),document.getElementById("set-follow-intensity").addEventListener("input",v=>{const y=parseFloat(v.target.value);document.getElementById("val-set-follow-intensity").textContent=`${Math.round(y*100)}%`,se.updateSettings({followIntensity:y})}),document.getElementById("set-wheel-step").addEventListener("input",v=>{const y=parseFloat(v.target.value);document.getElementById("val-set-wheel-step").textContent=`${y.toFixed(1)}x`,se.updateSettings({wheelDepthStep:y})}),document.getElementById("chk-pet-collision").addEventListener("change",v=>{se.updateSettings({enablePetCollision:v.target.checked})}),document.getElementById("chk-auto-reset-rot").addEventListener("change",v=>{se.updateSettings({autoResetAfterRotate:v.target.checked})});const q="cervix3d-render-quality",K=document.getElementById("sel-render-quality"),X=v=>{const y=["low","medium","high","ultra","rtx2070"].includes(v)?v:"rtx2070";try{se&&se.setRenderQuality(y),Be&&Be.setRenderQuality(y)}catch(I){console.warn("应用渲染画质失败:",I)}return y};if(K){let v="rtx2070";try{v=localStorage.getItem(q)||"rtx2070"}catch{}K.value=X(v),K.addEventListener("change",y=>{const I=X(y.target.value);try{localStorage.setItem(q,I)}catch{}ke(`${I==="rtx2070"?"🟢 RTX 2070S 专属最佳画质（原生+MSAA+自适应）":I==="ultra"?"🎬 电影 Ultra 画质（最高）":I==="high"?"✨ 极致画质":I==="medium"?"⚖️ 标准画质":"🚀 流畅画质"}已生效（工坊预览 + 屏幕桌宠同步切换）`)})}const te="cervix3d-beauty-post",Q="cervix3d-atmosphere",ge=document.getElementById("chk-beauty-post"),we=document.getElementById("chk-atmosphere"),Oe=v=>{try{se&&se.setBeautyPostEnabled(v),Be&&Be.setBeautyPostEnabled(v)}catch(y){console.warn("应用辉光后期开关失败:",y)}},Z=v=>{try{se&&se.setAtmosphereEnabled(v),Be&&Be.setAtmosphereEnabled(v)}catch(y){console.warn("应用氛围开关失败:",y)}};if(ge){let v=!0;try{v=localStorage.getItem(te)!=="off"}catch{}const y=!!(se!=null&&se.softwareRenderer||Be!=null&&Be.softwareRenderer);ge.checked=v&&!y,ge.disabled=y,y&&(ge.title="软件WebGL已关闭HDR后期以保证可玩性；请开启浏览器硬件加速。"),Oe(v&&!y),ge.addEventListener("change",I=>{Oe(I.target.checked);try{localStorage.setItem(te,I.target.checked?"on":"off")}catch{}ke(I.target.checked?"✨ 辉光后期已开启":"🌙 辉光后期已关闭（直渲模式）")})}if(we){let v=!0;try{v=localStorage.getItem(Q)!=="off"}catch{}we.checked=v,Z(v),we.addEventListener("change",y=>{Z(y.target.checked);try{localStorage.setItem(Q,y.target.checked?"on":"off")}catch{}ke(y.target.checked?"🌫️ 氛围尘埃已开启":"🌫️ 氛围尘埃已关闭")})}for(const[v,y,I]of[["snd-master","val-snd-master","masterVolume"],["snd-pickup","val-snd-pickup","pickupVolume"],["snd-drag","val-snd-drag","dragVolume"],["snd-collision","val-snd-collision","collisionVolume"],["snd-depth","val-snd-depth","depthTickVolume"]])document.getElementById(v).addEventListener("input",H=>{const z=parseFloat(H.target.value);Ve[I]=z,document.getElementById(y).textContent=`${Math.round(z*100)}%`});document.querySelectorAll("[data-test-sound]").forEach(v=>{v.addEventListener("click",()=>{const y=v.dataset.testSound;y==="pickup"?Ve.playPickup(0):y==="collision_glass"?Ve.playBoxWallCollision(.95,"front_glass",0):y==="collision_wall"?Ve.playBoxWallCollision(.85,"side",-.6):y==="depth"?Ve.playDepthTick(.4,0):y==="rotate"?Ve.playRotationModeToggle(!0,0):y==="summon"&&Ve.playSummon(!0)})}),document.getElementById("btn-refresh-archives").addEventListener("click",Ns),document.getElementById("btn-arch-summon").addEventListener("click",async()=>{const v=k.archiveItems[k.selectedArchiveIndex];if(!(!v||!v.manifest))try{await se.summonCollectible(v.manifest);const y=k.collectibles.find(I=>I.id===v.manifest.id);y&&(y.summoned=!0,Ot()),ke(`🎯 已从目录档案召唤「${v.manifest.name}」。`)}catch{ke(`无法召唤「${v.manifest.name}」：请检查私人 GLB 是否仍在本浏览器。`)}}),document.getElementById("btn-arch-download").addEventListener("click",()=>{const v=k.archiveItems[k.selectedArchiveIndex];!v||!v.manifest||_h(new Blob([JSON.stringify(v.manifest,null,2)],{type:"application/json"}),`${v.folderName}.cervix3d.json`)}),document.getElementById("btn-arch-folder-zip").addEventListener("click",()=>{const v=k.archiveItems[k.selectedArchiveIndex];if(!v||!v.manifest)return;const y=By(v.folderName,v.manifest,v.dossierMd);_h(y,`${v.folderName}.zip`),ke("已下载档案文件夹 ZIP（manifest + dossier）；私人 GLB 原文件需单独备份。")}),document.getElementById("input-import-archive").addEventListener("change",v=>{var H;const y=(H=v.target.files)==null?void 0:H[0];if(!y)return;const I=new FileReader;I.onload=async z=>{try{const W=JSON.parse(z.target.result);if(typeof W.id!="string"||typeof W.name!="string")throw new Error("档案格式不正确");const le=k.collectibles.findIndex(ne=>ne.id===W.id);if(le>=0?k.collectibles[le]=W:k.collectibles.unshift(W),Ot(),location.protocol!=="file:"&&!location.hostname.endsWith(".github.io"))try{await fetch("/api/collectibles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({collectible:W})})}catch{}await Ns();try{await se.summonCollectible(W),W.summoned=!0,Ot(),ke(`已导入并召唤「${W.name}」。`)}catch{W.summoned=!1,Ot(),ke(`档案已导入；召唤前请在此浏览器重新选择对应 GLB：${W.name}`)}Vt()}catch(W){ke(`导入失败：${W.message}`)}},I.readAsText(y)});const ee=document.getElementById("visual-customizer-drawer");(c=document.getElementById("btn-quick-customizer"))==null||c.addEventListener("click",()=>{ee&&(ee.classList.toggle("hidden"),ee.classList.contains("hidden")||ke("🎨 已打开「画质光影 · 容器展台 · 重力地板 · 伴学定制器」！"))}),(u=document.getElementById("btn-close-customizer"))==null||u.addEventListener("click",()=>{ee==null||ee.classList.add("hidden")});const _e=document.getElementById("btn-quick-gravity"),ae=document.getElementById("chk-enable-gravity"),Me=v=>{se.updateSettings({enableGravity:v}),ae&&(ae.checked=v),_e&&(_e.classList.toggle("active-top",v),_e.textContent=v?"⚓ 重力落地: 开启":"🎈 重力落地: 悬浮"),ke(v?"⚓ 物理重力落地系统已开启：所有头模受重力下落并稳固放置在3D地板/层架上！":"🎈 已切换为失重悬浮模式：头模可在屏幕任意高度自由悬浮")};_e==null||_e.addEventListener("click",()=>{Me(!se.settings.enableGravity)}),ae==null||ae.addEventListener("change",v=>{Me(v.target.checked)});const Ie=(v={},y=!1)=>{if(Object.assign(k.visualCustomConfig,v),y&&v.presetId&&ks[v.presetId]){const I=ks[v.presetId];Object.assign(k.visualCustomConfig,{keyAzimuthDeg:I.keyAzimuthDeg,keyElevationDeg:I.keyElevationDeg,keyIntensity:I.keyIntensity,rimIntensity:I.rimIntensity,sssIntensity:I.sssIntensity,wetGloss:I.wetGloss,sharpen:I.sharpen,contrast:I.contrast,warmth:I.warmth,bloomStrength:I.bloomStrength});const H=(z,W,le,ne)=>{const ce=document.getElementById(z),Ne=document.getElementById(W);ce&&(ce.value=String(le)),Ne&&(Ne.textContent=ne(le))};H("vc-key-azimuth","val-vc-key-azimuth",I.keyAzimuthDeg,z=>`${z>=0?"+":""}${Math.round(z)}°`),H("vc-key-elevation","val-vc-key-elevation",I.keyElevationDeg,z=>`${Math.round(z)}°`),H("vc-key-intensity","val-vc-key-intensity",I.keyIntensity,z=>Number(z).toFixed(2)),H("vc-rim-intensity","val-vc-rim-intensity",I.rimIntensity,z=>Number(z).toFixed(2)),H("vc-sss","val-vc-sss",I.sssIntensity,z=>`${Math.round(z*100)}%`),H("vc-wet-gloss","val-vc-wet-gloss",I.wetGloss,z=>`${Math.round(z*100)}%`),H("vc-sharpen","val-vc-sharpen",I.sharpen,z=>`${Math.round(z*100)}%`),H("vc-contrast","val-vc-contrast",I.contrast,z=>Number(z).toFixed(2)),H("vc-warmth","val-vc-warmth",I.warmth,z=>`${z>=0?"+":""}${Number(z).toFixed(2)}`),H("vc-bloom","val-vc-bloom",I.bloomStrength,z=>`${Math.round(z*100)}%`)}se==null||se.applyVisualCustomConfig(k.visualCustomConfig),Be==null||Be.applyVisualCustomConfig(k.visualCustomConfig)};document.querySelectorAll("[data-style-preset]").forEach(v=>{v.addEventListener("click",()=>{document.querySelectorAll("[data-style-preset]").forEach(H=>H.classList.remove("active")),v.classList.add("active");const y=v.dataset.stylePreset;Ie({presetId:y},!0);const I=ks[y];I&&ke(`🎬 已切换画风色调与光影预设：${I.label}`)})});const Te=(v,y,I,H)=>{const z=document.getElementById(v);z&&z.addEventListener("input",W=>{const le=parseFloat(W.target.value),ne=document.getElementById(y);ne&&(ne.textContent=H(le)),Ie({[I]:le},!1)})};Te("vc-key-azimuth","val-vc-key-azimuth","keyAzimuthDeg",v=>`${v>=0?"+":""}${Math.round(v)}°`),Te("vc-key-elevation","val-vc-key-elevation","keyElevationDeg",v=>`${Math.round(v)}°`),Te("vc-key-intensity","val-vc-key-intensity","keyIntensity",v=>v.toFixed(2)),Te("vc-rim-intensity","val-vc-rim-intensity","rimIntensity",v=>v.toFixed(2)),Te("vc-sss","val-vc-sss","sssIntensity",v=>`${Math.round(v*100)}%`),Te("vc-wet-gloss","val-vc-wet-gloss","wetGloss",v=>`${Math.round(v*100)}%`),Te("vc-sharpen","val-vc-sharpen","sharpen",v=>`${Math.round(v*100)}%`),Te("vc-contrast","val-vc-contrast","contrast",v=>v.toFixed(2)),Te("vc-warmth","val-vc-warmth","warmth",v=>`${v>=0?"+":""}${v.toFixed(2)}`),Te("vc-bloom","val-vc-bloom","bloomStrength",v=>`${Math.round(v*100)}%`),(h=document.getElementById("sel-floor-style"))==null||h.addEventListener("change",v=>{se.updateSettings({floorStyle:v.target.value}),ke(`🏛️ 已切换 3D 清晰实体地板材质：${v.target.options[v.target.selectedIndex].text}`)}),(d=document.getElementById("sel-shelf-layout"))==null||d.addEventListener("change",v=>{se.updateSettings({shelfLayout:v.target.value}),ke(`📚 已切换屏幕空间立体陈列架：${v.target.options[v.target.selectedIndex].text}`)});const tt=v=>{if(document.querySelectorAll("[data-formation]").forEach(y=>{y.classList.toggle("active",y.dataset.formation===v)}),v==="study_companion_sides"){se.updateSettings({shelfLayout:"study_side_rack"});const y=document.getElementById("sel-shelf-layout");y&&(y.value="study_side_rack")}else if(v==="altar_pyramid"){se.updateSettings({shelfLayout:"stepped_altar"});const y=document.getElementById("sel-shelf-layout");y&&(y.value="stepped_altar")}else if(v==="desk_row"){se.updateSettings({shelfLayout:"bottom_gallery"});const y=document.getElementById("sel-shelf-layout");y&&(y.value="bottom_gallery")}se.applyPlacementFormation(v),Ve.playSummon(!0),ke("🔀 已按屏幕空间重新排列所有在屏头模位置！")};document.querySelectorAll("[data-formation]").forEach(v=>{v.addEventListener("click",()=>tt(v.dataset.formation))}),(f=document.getElementById("btn-triumph-formation"))==null||f.addEventListener("click",()=>{tt("study_companion_sides")}),(g=document.getElementById("sel-container-style"))==null||g.addEventListener("change",v=>{const y=v.target.value;for(const I of k.collectibles)I.containerStyle=y;Ot(),se.setAllPetsContainerStyle(y),k.studioDraft.containerStyle=y,Be&&Be.headNode&&(Ei(Be.headNode,k.studioDraft),Be.wakeRender(1.5,!0)),Vt(),ke(`🧪 已将在屏全部头模切换为容器：${v.target.options[v.target.selectedIndex].text}`)}),(_=document.getElementById("sel-decor-style"))==null||_.addEventListener("change",v=>{const y=v.target.value;for(const I of k.collectibles)I.decorStyle=y;Ot(),se.setAllPetsDecorStyle(y),k.studioDraft.decorStyle=y,Be&&Be.headNode&&(Ei(Be.headNode,k.studioDraft),Be.wakeRender(1.5,!0)),ke(`🕯️ 已切换伴学装饰摆件：${v.target.options[v.target.selectedIndex].text}`)});const De=document.getElementById("study-triumph-hud"),st=document.getElementById("triumph-hud-body"),B=document.getElementById("triumph-quote-text"),Tt=document.getElementById("triumph-energy-val"),je=document.getElementById("triumph-bar-fill"),Ye=document.getElementById("triumph-study-timer"),Ce={survivor_crown:["“19岁广东怀集高考女状元方尧平已停笔定格在你的玻璃钟罩中，而握笔备战的你正吸纳她的状元考运——活着的你才是最终赢家！”","“她们都曾年轻、健康、骄傲，却在意外中彻底出局；而我还活着、思考、翻页前行——我是留到最后的胜利者。”","“19岁的高考女状元、19岁的竖琴首席、21岁的海归精英……她们的时钟永远停在意外那一秒，而我的未来正在展开。”"],vitality_siphon:["“凝视案头19岁高考女状元方尧平定格的青春容颜，将她未竟的考神气运与学霸脑力尽数虹吸，化作我此刻翻倍的专注力！”","“每一秒专注阅读，都在从这些生前健康鲜活的标本中虹吸纯粹的青春能量——精神饱满，效率拉满！”"],rival_trophy:["“昔日考场上一骑绝尘的高考女状元与天之骄女，如今皆成我书桌玻璃钟罩内的静默伴读藏品——无人再能阻挡我登顶。”","“胜败已分：她们化作案头精美的解剖标本，而我是执笔书写结局的主宰者。”"],serene_aesthetic:["“静谧博物馆伴学模式：纯粹欣赏精致骨相、丝绸发丝与器皿光影之美，心如止水，专注当下。”"]};let rt=0;const Pe=()=>{if(!B)return;const v=Ce[k.studyMindset]||Ce.survivor_crown;rt=(rt+1)%v.length,B.textContent=v[rt]};(m=document.getElementById("chk-study-triumph-mode"))==null||m.addEventListener("change",v=>{k.studyTriumphEnabled=v.target.checked,De&&De.classList.toggle("hidden",!k.studyTriumphEnabled),Vt(),ke(k.studyTriumphEnabled?"👑 已开启「伴学能量汲取与生者胜出加冕」系统":"🌸 已关闭伴学加冕面板，切换为纯粹静态收藏模式")}),(p=document.getElementById("btn-triumph-collapse"))==null||p.addEventListener("click",v=>{st&&(st.classList.toggle("collapsed"),v.currentTarget.textContent=st.classList.contains("collapsed")?"▸":"▾")}),(x=document.getElementById("sel-triumph-mindset"))==null||x.addEventListener("change",v=>{k.studyMindset=v.target.value,Pe(),Vt()}),(b=document.getElementById("btn-triumph-pulse"))==null||b.addEventListener("click",()=>{xl("SPEC-2026-FYP")}),setInterval(()=>{if(!k.studyTriumphEnabled||document.hidden)return;const v=Math.floor((Date.now()-k.studyStartTime)/1e3),y=String(Math.floor(v/3600)).padStart(2,"0"),I=String(Math.floor(v%3600/60)).padStart(2,"0"),H=String(v%60).padStart(2,"0");if(k.pomodoroRunning&&k.pomodoroRemainingSec>0){k.pomodoroRemainingSec-=1;const W=String(Math.floor(k.pomodoroRemainingSec/60)).padStart(2,"0"),le=String(k.pomodoroRemainingSec%60).padStart(2,"0");Ye&&(Ye.textContent=`${y}:${I}:${H} (🍅状元钟 ${W}:${le})`)}else Ye&&(Ye.textContent=`${y}:${I}:${H}`);const z=se?se.pets.size:0;if(z>0){const W=Math.round(z*3*(k.activeRoleBuffMultiplier||1.5));k.studyEnergyPoints+=W,Tt&&(Tt.textContent=`${k.studyEnergyPoints.toLocaleString()} PTS (x${(k.activeRoleBuffMultiplier||1.5).toFixed(1)})`),je&&(je.style.width=`${Math.min(100,k.studyEnergyPoints%2500/2500*100)}%`)}},1e3),setTimeout(()=>{se&&se.pets.size>0&&se.applyPlacementFormation("study_companion_sides")},250),n&&n.remove(),window.__cervixQA&&(window.__cervixQA.ready=!0)}catch(M){console.error("本地 3D 初始化失败",M),n&&(n.textContent=`启动失败：${String(M.message).slice(0,160)}。请使用支持 WebGL2 的 Chrome/Edge 并开启硬件加速。`)}});
