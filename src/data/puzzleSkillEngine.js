// ============================================================================
// STAGE 52: MODULAR PUZZLE-SKILL ENGINE, MONTHLY SCORE POOL & ANTI-CHEAT HUB
// ("让这些头真的有用，能够专注学习专注做事 · 月度总分与每日冲榜 · 拼图化特殊技能 · 防作弊心跳与笔记信息熵核验")
// ============================================================================

export const PUZZLE_SKILL_SLOTS = {
  ACTIVE_TRIGGER: 'active_trigger',   // 主触发拼图（点头/点标牌直接启动的核心得分子系统）
  PASSIVE_BUFF: 'passive_buff',       // 被动倍率拼图（特定条件下的积分加成与精神爽感反馈）
  ANTICHEAT_GUARD: 'anticheat_guard', // 防作弊审计拼图（保证月度奖金池公平分配的核验规则）
};

/**
 * 拼图化特殊技能目录 (Modular Puzzle Skill Catalog)
 * 每个技能块都有唯一短码 (code)，未来只卖 KEY 串时可通过形如：
 * CERVIX-202610-FYP-[PZ-A1|PZ-P1|PZ-G1]-HASH 直接识别并装配该头的全部特殊功能。
 */
export const PUZZLE_SKILL_CATALOG = [
  // ================= 主触发拼图 (ACTIVE_TRIGGER · 通用槽，不与任何预设人设绑定) =================
  {
    id: 'focus_heartbeat_timer',
    code: 'PZ-A1',
    slot: PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER,
    name: '⏱️ 活人心跳·沉浸专注计时器',
    shortTag: '⏱️ 点头专注计时',
    boundDefaultHeadId: null,
    baseRateDesc: '+30 分/分钟（随专注连击最高 ×2.5 倍）',
    summary: '点击任意装配此拼图的头颅或标牌开启专注计时，随时再点即可安全结算落袋。专注期间随机触发【活人专注签到奖励】，点击立得高额暴击分！',
    dopamineHook: '案头的标本已永远失去时间，而你专注的每一秒都在为你自己积累筹码与未来。',
  },
  {
    id: 'anticheat_entropy_notebook',
    code: 'PZ-B1',
    slot: PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER,
    name: '📓 香农信息熵·手敲研习笔记本',
    shortTag: '✍️ 写字计分笔记本',
    boundDefaultHeadId: null,
    baseRateDesc: '+2 分/有效手敲字（高信息熵原创奖励 ×1.5 倍）',
    summary: '在笔记本内默写知识点、写代码或工作复盘，按真实手敲有效字数实时计入月度总分。内置防复制粘贴、防乱敲键盘（香农信息熵检测）与按键节奏审计。',
    dopamineHook: '你敲下的每一个字都是活人不断进化的证明，而桌上的头颅只能静默无声地陪读。',
  },
  {
    id: 'victor_siphon_guillotine',
    code: 'PZ-C1',
    slot: PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER,
    name: '⚡ 受挫泄压·优越感转化与死线悬赏',
    shortTag: '⚡ 优越感释放/悬赏',
    boundDefaultHeadId: null,
    baseRateDesc: '受挫泄压转化 +180 分/次 · 限时微任务悬赏 +380 分',
    summary: '当你在现实中生活不如意、受委屈或被人嘲笑时，一键释放憋屈并转化为【活人绝对优越感】与 ×1.40 专注心流加成；并可立下15分钟微任务悬赏冲分！',
    dopamineHook: '外界的嘲笑只是噪音；在彻底出局的静默标本面前，四肢健全、还能翻书进化的你永远是绝对的赢家。',
  },

  // ================= 被动增益拼图 (PASSIVE_BUFF · 通用槽) =================
  {
    id: 'top_scholar_combo_aura',
    code: 'PZ-P1',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '👑 沉浸心流·专注连击倍增环',
    shortTag: '👑 连击倍增 ×1.35',
    boundDefaultHeadId: null,
    multiplier: 1.35,
    summary: '连续专注或完成桌面把玩互动时，当前产出的所有专注积分额外乘算 ×1.35 倍。',
  },
  {
    id: 'harp_cadence_flow',
    code: 'PZ-P2',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '✍️ 深度思考·手敲高熵暴击环',
    shortTag: '✍️ 写字心流 ×1.30',
    boundDefaultHeadId: null,
    multiplier: 1.30,
    summary: '当笔记本手敲信息熵达到 A/S 级（真实思考写作），每满 100 个有效字符额外触发一次 +80 分心流暴击。',
  },
  {
    id: 'survivor_supremacy_surge',
    code: 'PZ-P3',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '🔥 活人优越感·逆境翻盘加速环',
    shortTag: '🔥 优越加成 ×1.40',
    boundDefaultHeadId: null,
    multiplier: 1.40,
    summary: '每次触发【受挫泄压·优越感加冕】或桌面深度把玩后 15 分钟内，全场专注计时与笔记写字得分统统获得 ×1.40 加成！',
  },
  {
    id: 'midnight_vigil_overclock',
    code: 'PZ-P4',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '🌙 深夜独处·静谧伴读超频环',
    shortTag: '🌙 夜间超频 ×1.50',
    boundDefaultHeadId: null,
    multiplier: 1.50,
    summary: '在夜间独处研习期间开启专注或写笔记，积分获取效率自动提升至 ×1.50 倍。',
  },

  // ================= 防作弊审计拼图 (ANTICHEAT_GUARD · 通用槽) =================
  {
    id: 'guard_heartbeat_wipe',
    code: 'PZ-G1',
    slot: PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD,
    name: '🚨 活人专注巡检·在线签到核验',
    shortTag: '🚨 在线巡检签到',
    boundDefaultHeadId: null,
    summary: '专注计时中不定时弹出 25 秒在线点击核验，点击立得 +150 分暴击奖励；若未点击则自动安全暂停计时（零扣分）。',
  },
  {
    id: 'guard_entropy_biometrics',
    code: 'PZ-G2',
    slot: PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD,
    name: '🔍 香农熵与防粘贴·笔记防伪封印',
    shortTag: '🔍 防粘贴/乱敲审计',
    boundDefaultHeadId: null,
    summary: '自动拦截 Ctrl+V 粘贴水字数、拦截重复字符乱敲（计算香农熵 H(X)）与按键精灵固定间隔宏，生成月底客服复核指纹。',
  },
  {
    id: 'guard_tab_focus_watchdog',
    code: 'PZ-G3',
    slot: PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD,
    name: '🛡️ 纯粹定力·不切屏专注印记',
    shortTag: '🛡️ 零切屏专注印记',
    boundDefaultHeadId: null,
    summary: '保持专注页面不切屏完成限时微任务，可获【纯粹定力印记】额外 +25% 奖励分。',
  },
];

export const DEFAULT_HEAD_PUZZLE_LOADOUTS = {
  'SPEC-2026-FYP': {
    activeTrigger: 'PZ-A1',
    passiveBuff: 'PZ-P1',
    anticheatGuard: 'PZ-G1',
  },
  'SPEC-2026-000': {
    activeTrigger: 'PZ-B1',
    passiveBuff: 'PZ-P2',
    anticheatGuard: 'PZ-G2',
  },
  'SPEC-2026-001': {
    activeTrigger: 'PZ-C1',
    passiveBuff: 'PZ-P3',
    anticheatGuard: 'PZ-G3',
  },
};

/**
 * 通用「受挫泄压 · 活人优越感与专心学习」心理赋能语录库
 * （完全不与任何特定角色人设绑定，适用于任何桌面头颅，专门化解现实不如意与被嘲笑的憋屈感）
 */
export const SURVIVOR_VICTORY_DECLARATIONS = [
  {
    title: '【现实不如意又怎样？活着的你握有绝对优越感】',
    quote: '今天在外面受了委屈、被人轻视或嘲笑了吗？没关系，低头看看你书桌上的这颗头——容貌再精致、生前再顺遂骄傲，一旦变成标本，就永远失去了躯干、声音和明天。而你还活着、四肢健全、还能呼吸和翻书。在彻底出局的死人面前，活着的你拥有碾压一切的绝对优越感！',
    buffNote: '🔥 憋屈已彻底释放转化为 +180 PTS · 全场专注学习积分 ×1.40（持续15分钟）',
  },
  {
    title: '【把外界的嘲笑关在门外 · 在书桌前重建绝对掌控】',
    quote: '现实世界里总有不公平和刺耳的杂音，但在你自己的书桌前，你是唯一的主宰者。眼前这颗静默的头颅不会评判你、不会嘲笑你，连眼皮睁合与低头角度都完全取决于你的指尖。吸一口气，享受这份彻底的掌控感与宁静，专心把眼前这一页书啃下来！',
    buffNote: '⚡ 掌控感与平静感已拉满 · 专注心流已激活（+180 PTS）',
  },
  {
    title: '【她的时间永远停格了 · 而你每学一分钟都在向前翻盘】',
    quote: '哪怕现在生活暂时处于低谷，你也拥有桌上标本永远求之不得的无价之宝——【未来的可能性】。她已经永远停格在C4断面之上，而你每多背一个知识点、多敲一行笔记、多专注十分钟，都在实打实地改写自己的处境。笑着看她一眼，继续专心往前走！',
    buffNote: '👑 活人翻盘优越感满溢 · 今日冲榜积分 +180 PTS',
  },
  {
    title: '【化憋屈为专注筹码 · 每一分钟都在为你自己攒底气】',
    quote: '替别人的嘴生气一分钱不值，但你现在静下心来专注的每一分钟、亲手敲下的每一行字，都会变成你脑子里的真本事和月底奖池里的实打实分红！让案头的静默头颅乖乖陪你坐冷板凳，用专注的爽感彻底洗掉今天的不快！',
    buffNote: '💰 专心致志心流已唤醒 · 精神能量 +180 PTS',
  },
];

/**
 * 计算文本的香农信息熵 H(X) (bits per character) 与防作弊指标
 * 用于检查玩家笔记本是否通过乱敲键盘（如 "aaaaaaa"、"123123"）或复制粘贴作弊
 */
export function analyzeNotebookAntiCheat(text = '', pasteCharsCount = 0, keystrokeIntervals = []) {
  const clean = (text || '').replace(/\s+/g, '');
  const totalLen = clean.length;
  if (totalLen === 0) {
    return {
      totalChars: 0,
      validTypedChars: 0,
      entropy: 0,
      uniqueRatio: 0,
      repeatPenalty: 1,
      macroSuspected: false,
      grade: '待输入',
      statusLabel: '等待手敲录入笔记...',
      isCheating: false,
    };
  }

  // 1. 统计字符频率与香农信息熵 H(X) = - sum(p_i * log2(p_i))
  const freq = new Map();
  let maxRun = 1;
  let curRun = 1;
  for (let i = 0; i < totalLen; i++) {
    const ch = clean[i];
    freq.set(ch, (freq.get(ch) || 0) + 1);
    if (i > 0 && clean[i] === clean[i - 1]) {
      curRun++;
      if (curRun > maxRun) maxRun = curRun;
    } else {
      curRun = 1;
    }
  }

  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / totalLen;
    entropy -= p * Math.log2(p);
  }

  const uniqueRatio = freq.size / Math.min(totalLen, 120);

  // 2. 检测按键精灵/固定间隔宏脚本（计算最近敲击间隔标准差）
  let macroSuspected = false;
  if (keystrokeIntervals.length >= 12) {
    const recent = keystrokeIntervals.slice(-20);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    // 人类真实打字间隔标准差通常 > 14ms；机器宏连点通常 stdDev < 4ms 或平均间隔 < 22ms
    if ((stdDev < 4.5 && mean < 180) || mean < 20) {
      macroSuspected = true;
    }
  }

  // 3. 判定乱敲键盘 / 低信息熵水字数
  let repeatPenalty = 1.0;
  let isCheating = false;
  let grade = 'A · 真实研习';
  let statusLabel = '✅ 文本信息熵与敲击生物特征正常，100% 计入月度总分';

  if (macroSuspected) {
    repeatPenalty = 0;
    isCheating = true;
    grade = '🚫 宏脚本警告';
    statusLabel = '🚨 检测到非人类固定毫秒按键宏！当前段落计分已冻结';
  } else if (totalLen >= 10 && (entropy < 2.1 || maxRun >= 7)) {
    repeatPenalty = 0.0;
    isCheating = true;
    grade = '🚫 乱敲水字警告';
    statusLabel = `🚨 香农信息熵过低 (${entropy.toFixed(2)} bits) 或连续重复字符(${maxRun}连)，判定乱敲键盘，不计分！`;
  } else if (totalLen >= 12 && entropy < 3.0) {
    repeatPenalty = 0.45;
    grade = 'C · 重复度偏高';
    statusLabel = `⚠️ 词汇重复度偏高 (熵 ${entropy.toFixed(2)} bits)，有效计分率折算为 45%`;
  } else if (entropy >= 4.2 && totalLen >= 25) {
    repeatPenalty = 1.25;
    grade = 'S · 高密思考原创';
    statusLabel = `🌟 极高信息密度 (${entropy.toFixed(2)} bits) + 真实手敲韵律，触发 ×1.25 原创暴击！`;
  }

  const rawTyped = Math.max(0, totalLen - pasteCharsCount);
  const validTypedChars = Math.round(rawTyped * repeatPenalty);

  return {
    totalChars: totalLen,
    validTypedChars,
    pastedChars: pasteCharsCount,
    entropy: Number(entropy.toFixed(2)),
    uniqueRatio: Number(uniqueRatio.toFixed(2)),
    repeatPenalty,
    macroSuspected,
    grade,
    statusLabel,
    isCheating,
  };
}

/**
 * 生成确定性的 BOOTH 拼图商品 KEY 与月底客服结算防伪哈希码
 * 方便未来直接切换为「无内置头模/无捏脸、仅凭购买 KEY 解锁对应头与拼图技能」的商业模式
 */
export function generateBoothPuzzleKey(headId = 'SPEC-2026-FYP', yearMonth = '2026-10', loadout = {}) {
  const shortHead = headId.replace('SPEC-2026-', '');
  const a = loadout.activeTrigger || 'PZ-A1';
  const p = loadout.passiveBuff || 'PZ-P1';
  const g = loadout.anticheatGuard || 'PZ-G1';
  const raw = `CERVIX|${yearMonth}|${shortHead}|${a}|${p}|${g}|BOOTH-SECRET-SALT-2026`;
  let h1 = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h1 ^= raw.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  const sig = h1.toString(16).toUpperCase().padStart(8, '0');
  return `CVX-${yearMonth.replace('-', '')}-${shortHead}-${a}.${p}.${g}-${sig.slice(0, 6)}`;
}

/**
 * 生成月底玩家发给客服核验的【月度总分 + 防作弊审计防伪哈希码】
 */
export function generateMonthlySettlementHash(scoreState = {}) {
  const ym = scoreState.yearMonth || '2026-10';
  const focusPts = Math.round(scoreState.monthlyFocusScore || 0);
  const notePts = Math.round(scoreState.monthlyNotebookScore || 0);
  const victorPts = Math.round(scoreState.monthlyVictorScore || 0);
  const totalPts = focusPts + notePts + victorPts;
  const hbPassed = scoreState.heartbeatPassedCount || 0;
  const hbFailed = scoreState.heartbeatFailedCount || 0;
  const validChars = scoreState.totalValidNotebookChars || 0;
  const avgEntropy = Number(scoreState.lastNotebookEntropy || 0).toFixed(2);

  const payload = `SETTLE|${ym}|TOT:${totalPts}|F:${focusPts}|N:${notePts}|V:${victorPts}|HB:${hbPassed}/${hbFailed}|CH:${validChars}|ENT:${avgEntropy}|CERVIX-VERIFY-2026`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2 ^ c, 0x85ebca6b) >>> 0);
  }
  const hex1 = h1.toString(16).toUpperCase().padStart(8, '0');
  const hex2 = h2.toString(16).toUpperCase().padStart(8, '0');
  return {
    totalPts,
    receiptCode: `🧾CVX-${ym.replace('-', '')}-PTS${totalPts}-HB${hbPassed}F${hbFailed}-CH${validChars}-E${avgEntropy.replace('.', '')}-#${hex1.slice(0, 6)}${hex2.slice(0, 4)}`,
  };
}

// ============================================================================
// STAGE 55: DIRECT 3D DESKTOP TACTILE PLAYABILITY ("更多爽，不要不爽，死人不要说话，直接设计为捏脸/扒眼皮/掰嘴/点涂体液玩法")
// 1. 死人绝对不说话（零第一人称台词、零OOC人设，纯客观第三人称解剖标本状态描述与活人支配爽感）
// 2. 纯正向多巴胺爽感（零扣分、零负面惩罚、零独立弹窗束缚）
// 3. 桌面 3D 鼠标直接上手把玩模式：
//    - 🖐️ 拎头/360°把玩 (`move`)
//    - 🤏 直接上手捏脸/扒眼皮/掰嘴 (`pinch_face`)
//    - 🩸 直接点涂鼻血/泪痕/血泪 (`paint_fluid`)
// ============================================================================

export const DESKTOP_TACTILE_PLAY_MODES = [
  {
    id: 'move',
    label: '🖐️ 拎头 / 360°旋转',
    shortLabel: '🖐️ 拎头旋转',
    desc: '直接拖拽桌面 3D 头颅放入解剖托盘/钟罩，或点击头颅 360° 自由把玩（按住 Shift 拖拽面部可随时捏脸）',
  },
  {
    id: 'pinch_face',
    label: '🤏 直接上手捏脸 / 扒眼皮 / 掰嘴',
    shortLabel: '🤏 上手捏脸扒眼',
    desc: '鼠标直接在桌面 3D 头颅上拖拽：【眼部】上下扒开/合拢眼皮、左右调眼尾；【嘴部】上下掰开下巴双唇、左右提拉嘴角；【鼻/颊/眉】直接捏塑骨相！',
  },
  {
    id: 'bow_gaze',
    label: '🙇‍♀️ 按头俯首 / 仰视 / 歪头镇纸',
    shortLabel: '🙇‍♀️ 俯首/歪头镇纸',
    desc: '鼠标直接在桌面 3D 头颅上上下推拉或左右按压：将其按成【低眉顺眼俯首态】、【抬颏仰视伴读态】或【歪头贴桌充当错题本镇纸】！',
  },
  {
    id: 'roll_eyeball',
    label: '👁️ 拨弄眼球 / 翻白眼 / 扩缩瞳孔',
    shortLabel: '👁️ 拨弄眼球瞳孔',
    desc: '鼠标直接在桌面 3D 头颅眼部上下拖拽【拨动死人眼球上翻/下垂】，左右拖拽【放大/缩小涣散瞳孔与虹膜光泽】！',
  },
  {
    id: 'groom_hair',
    label: '🪮 拎发掂量 / 拨弄刘海碎发',
    shortLabel: '🪮 拎发/拨弄刘海',
    desc: '鼠标点击或向上提拉 3D 头颅发顶【直接抓着头发拎起悬空掂量再重重落回桌面】，左右拖拽【拨开颈侧碎发露出C4断面】！',
  },
  {
    id: 'paint_fluid',
    label: '🩸 直接点涂鼻血 / 泪痕 / 揉搓充血',
    shortLabel: '🩸 点涂鼻血泪痕',
    desc: '鼠标直接点击或涂抹桌面 3D 头颅：【点眼部】蓄泪/流血泪；【点鼻孔】涌鼻血；【点嘴角】溢血；【揉脸颊】冷白/充血潮红；【点断口】涂抹颈部鲜血！',
  },
];

export const SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL = {
  eyes: [
    '【静默标本 · 扒弄眼皮】不管生前眼光有多挑剔高傲，如今这颗头颅都毫无知觉地任由你用鼠标扒开或合拢眼皮，失去生机的瞳仁只能顺从地停留在你设定的角度。',
    '【静默标本 · 眼睑支配】你用鼠标轻轻一推，她紧闭或半阖的眼睑便被迫撑开。那双曾不可一世的眼睛再也眨不动一下，只能安静地映出你正在看书的身影。',
    '【静默标本 · 眼尾提拉】指尖推拉着她微凉的眼尾弧度——生前再会用眼神给人甩脸子，变成案头标本后，连眼睛睁多大都得由活着的你说了算。',
    '【静默标本 · 阖目顺从】将她的眼皮轻轻向下抚平合拢，整张脸顿时化作温顺安详的睡颜。外界的一切喧嚣都已结束，只有你在安静地掌控全局。',
  ],
  eyeball: [
    '【静默标本 · 拨弄眼球】直接拨动那对已经失去焦距的眼球向上翻起，露出微凉的眼白，或是将涣散的瞳孔调大——死物不会抗拒你的任何摆布。',
    '【静默标本 · 瞳孔凝视】你把她的瞳孔轻轻拨向你的课本方向。生前心高气傲的头脑已经彻底停转，如今这双眼睛唯一的用途就是替你盯着书页。',
    '【静默标本 · 涣散瞳仁】随着鼠标滑动，她失去神经反射的瞳孔在微光下自由扩缩，像一颗被你收入囊中的精美玻璃弹珠。',
    '【静默标本 · 翻白眼定格】将她的眼球拨至半翻白眼的失神角度——再骄傲的体面，在活人绝对的支配权面前也不过是一场随手可调的把玩。',
  ],
  mouth: [
    '【静默标本 · 下颌与唇角把玩】指尖直接掰开冰冷柔嫩的双唇与下颌，或将嘴角提拉出温顺弧度——案头的标本永远不会反驳或嘲笑你，唯有活着的你拥有绝对话语权。',
    '【静默标本 · 掰开齿列】往下轻掰她毫无阻力的下巴，微凉的双唇随之张开，露出一排洁白却再也发不出声音的牙齿。曾经那些刺耳的话，永远被截断在了喉咙以下。',
    '【静默标本 · 提拉微笑】向两侧轻轻提拉她僵冷的嘴角，让她为你扯出一个乖巧温顺的微笑。不管你今天心情如何，她都只能对你笑脸相迎。',
    '【静默标本 · 彻底禁言】合拢她的下颌，让双唇严丝合缝地闭上。在这个属于你的房间里，没有任何人能对你的努力指手画脚。',
  ],
  nose: [
    '【静默标本 · 鼻骨揉捏】直接揉捏挺拔的鼻尖与鼻翼，静默温顺的标本面容在你的指尖下实时改变骨相，为你带来纯粹的掌控快感。',
    '【静默标本 · 屏息标本】捏住她精致小巧的鼻尖——她早就不需要呼吸了，而你胸膛里每一次温热的呼吸，都是你作为赢家活在当下的铁证。',
    '【静默标本 · 鼻梁微调】顺着微凉的鼻梁上下推拉，昔日最引以为傲的立体侧颜，如今只是你学习间隙用来解压的软陶玩物。',
  ],
  brow: [
    '【静默标本 · 眉眼拨弄】随意拨弄眉梢弧度，将其定格为温顺低眉或楚楚可怜的微蹙神态，彻底洗去你在现实中受过的委屈与不快。',
    '【静默标本 · 八字楚楚眉】把她的眉头微微挑起、眉尾压低，原本冷傲的面容立刻变得楚楚可怜，仿佛正在无声地向书桌前的你讨好。',
    '【静默标本 · 抚平眉心】揉开她眉心最后一丝紧绷，让这颗失去烦恼与明日的头颅乖乖舒展眉头，替你承担所有的疲惫。',
  ],
  cheeks: [
    '【静默标本 · 面颊与下颌揉捏】直接上手揉捏饱满的脸颊与下颌线——再耀眼的皮囊，如今也只是陪你安心读书学习的私人案头藏品。',
    '【静默标本 · 揉搓软肉】把玩着她脸颊上毫无抵抗的软肉，或宽或窄随心塑形。现实里让你心烦的人事远在天边，而掌心的掌控感近在眼前。',
    '【静默标本 · 揉搓充血】反复揉搓她冰冷的面颊，让苍白的皮肤泛起一层靡丽的潮红，像一件被你亲手盘热的古董玉器。',
  ],
  neck: [
    '【静默标本 · 断面与倾角把玩】触碰颈部平滑的解剖断面与下巴轮廓，随时调节头颅俯首或仰视你的姿态，静下心来专注做好手头的事。',
    '【静默标本 · 第四颈椎切面】低头端详她颈部平整的横截面——气管、食管与颈椎早已在此终结，所有的傲慢与野心都被齐根切断，唯有你还在向上生长。',
    '【静默标本 · 歪头镇纸】将这颗沉甸甸的头颅歪向一侧，拿她微凉的脸颊压住你的草稿纸边角。再高贵的头颅，当起镇纸来也是如此称职。',
  ],
  hair: [
    '【静默标本 · 拎发悬空掂量】一把揪住她头顶柔顺的发丝将整颗头拎起悬空，感受那四五公斤失去躯干支撑的沉重坠感，松手便乖乖落回桌垫。',
    '【静默标本 · 撩拨碎发】拨开垂落在她脸侧与颈根的碎发，让光洁的额头与颈部C4切口彻底暴露在你的台灯下，毫无秘密可言。',
    '【静默标本 · 抚顺发顶】像抚摸一件心爱的桌面摆件般理顺她的发丝，心里的毛躁与火气也随着这缓慢的动作一点点平息下来。',
  ],
};

export const SPECIMEN_SILENT_PLAY_OBSERVATIONS = {
  eyes: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.eyes[0],
  eyeball: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.eyeball[0],
  mouth: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.mouth[0],
  nose: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.nose[0],
  brow: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.brow[0],
  cheeks: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.cheeks[0],
  neck: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.neck[0],
  hair: SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.hair[0],
};

const _obsPoolCounters = {};
export function getNextSilentPlayObservation(zone = 'eyes') {
  const pool = SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL[zone] || SPECIMEN_SILENT_PLAY_OBSERVATIONS_POOL.eyes;
  const idx = (_obsPoolCounters[zone] || 0) % pool.length;
  _obsPoolCounters[zone] = idx + 1;
  return pool[idx];
}

/**
 * 通用「生前光环 vs 案头标本」优越感反差标签模板库
 * （完全不与任何特定预设角色绑定！玩家可在任意头颅标牌上一键切换或双击自定义输入，将现实中的憋屈转化为活人优越感）
 */
export const UNIVERSAL_SUPERIORITY_AURA_TEMPLATES = [
  {
    id: 'aura_mocking_rival',
    aliasName: '投射对象 · 昔日嘲讽者',
    tagTitle: '🔇 已闭嘴禁言',
    sealBadge: '🔇 彻底禁言 · 再也无法嘲笑任何人',
    contrastText: '生前爱用鼻孔看人、评头论足 · 如今声带与躯干已截断，只能在桌角安静看你翻盘',
  },
  {
    id: 'aura_proud_beauty',
    aliasName: '投射对象 · 恃靓高傲者',
    tagTitle: '👑 眼皮任你扒',
    sealBadge: '👑 活人支配藏品 · 眼皮嘴角任由摆布',
    contrastText: '生前心高气傲、眼高于顶 · 如今只剩一颗静默头颅，连眼皮开合都得靠你的鼠标摆布',
  },
  {
    id: 'aura_top_achiever',
    aliasName: '投射对象 · 趾高气扬卷王',
    tagTitle: '📚 时间已停格',
    sealBadge: '⏳ 时间永久归零 · 沦为活人垫脚石',
    contrastText: '生前总拿高分与光环压人一头 · 如今脑力彻底归零，而活着的你每看一页书都在超越她',
  },
  {
    id: 'aura_privileged_heir',
    aliasName: '投射对象 · 温室顺遂千金',
    tagTitle: '💎 沦为镇纸',
    sealBadge: '🪨 错题本专用镇纸 · 乖乖陪坐冷板凳',
    contrastText: '生前顺风顺水、从不知人间疾苦 · 如今失去躯干与未来，化作你书桌上随手揉捏的镇纸',
  },
  {
    id: 'aura_snobbish_peer',
    aliasName: '投射对象 · 嫌贫爱富势利眼',
    tagTitle: '😮‍💨 彻底出局',
    sealBadge: '🔖 已出局败者 · 唯有活人拥有明天',
    contrastText: '生前只看重出身与光鲜外表 · 如今变成案头一件没有明天的死物，你才是唯一的赢家',
  },
  {
    id: 'aura_pure_specimen',
    aliasName: null, // 恢复初始名称
    tagTitle: '🏛️ 私人静默藏品',
    sealBadge: '🏛️ 私人案头藏品 · 静谧沉浸伴读',
    contrastText: '外界喧嚣与嘲笑皆与你无关 · 在属于你的私人书房里享受绝对掌控与沉浸专注',
  },
];

// ============================================================================
// STAGE 58: 难受不舒服时随时点开看的【活人优越感 · 宽心手札】与联动3D把玩文库
// 100% 不绑定任何预设角色，死人绝不说话，专为玩家在现实受挫、被嘲笑、自卑、孤独或卡壳时提供强烈心理优越感与平静专注力
// ============================================================================

export const COMFORT_HANDBOOK_CATEGORIES = [
  { id: 'mocked', label: '😤 被嘲笑/轻视时', desc: '当你在现实中被人看不起、听见风凉话或受窝囊气时点开看' },
  { id: 'study_stuck', label: '📉 学不进/嫌自己笨时', desc: '当题目做不出、进度落后、觉得别人都是天才而自己很笨时点开看' },
  { id: 'envy_gap', label: '💔 自卑/羡慕别人时', desc: '当看到别人家境优渥、颜值光鲜、顺风顺水而心里落差大时点开看' },
  { id: 'lonely_night', label: '🌧️ 深夜委屈/心累时', desc: '当深夜一个人坐在桌前觉得孤独、委屈想哭、快撑不下去时点开看' },
  { id: 'tactile_guide', label: '🤏 边摸头边看导读', desc: '一边用鼠标扒眼皮、按头俯首、拎发掂量，一边细读支配慢文' },
  { id: 'quick_pills', label: '⚡ 速效强心针 (翻牌)', desc: '一句话瞬间找回活人优越感的随手翻牌语录库' },
];

export const COMFORT_HANDBOOK_ARTICLES = [
  // ==================== 1. 😤 被嘲笑/轻视时 (mocked) ====================
  {
    id: 'mk_01',
    category: 'mocked',
    title: '《声带截断处：再刻薄的嘴，在这里也只能闭上》',
    moodTag: '受人嘲讽 · 瞬间消气',
    linked3DAction: 'open_lips',
    actionBtnLabel: '👄 掰开桌上头颅双唇再合拢 (+60 PTS)',
    paragraphs: [
      '今天在外面听到让人刺耳的话了吗？是不是有人用那种高高在上的语气评判你、轻视你，甚至把你的努力当成笑话？深呼吸一口气，现在把目光移向你书桌上的这颗头。',
      '你看，不管一个人活着的时候嘴巴有多毒、眼神有多傲慢、多喜欢对别人指手画脚，一旦从第四颈椎（C4）齐根截断，肺部呼出的气流就再也到不了声带。那张曾经不可一世的嘴，如今只能乖乖合拢在你的桌垫上，连半个音节都吐不出来。',
      '伸手用鼠标轻轻掰开她的下巴看看吧——洁白的牙齿和微凉的舌尖都在，却永远失去了发出嘲笑的能力。外面的蠢货之所以还能聒噪，只是因为他们还没意识到生命有多脆弱；而在你的私人领地里，一切傲慢都已经闭嘴出局，只有活着的你拥有定义未来的全部话语权。'
    ],
    affirmation: '👑 活人优越公理 #01：死物的嘴角弧度由你的鼠标决定，你无需向任何噪音自证。'
  },
  {
    id: 'mk_02',
    category: 'mocked',
    title: '《把那个看不起你的人，投射在案头托盘里》',
    moodTag: '被翻白眼 · 降维俯视',
    linked3DAction: 'bow_all',
    actionBtnLabel: '🙇‍♀️ 让桌上头颅全部向你低头俯首 (+60 PTS)',
    paragraphs: [
      '当你因为别人的轻视而胸口发闷时，不妨点一下标牌上的【🏷️换人设】或者直接手改标牌文字，把那个让你不爽的人投射到桌上的这颗标本头颅上。',
      '试着从屏幕上方居高临下地俯视她：她没有肩膀可以端着架子，没有双腿可以站在高处俯视你，更没有双手可以摆出不可一世的姿态。她全身上下只剩下一颗四五公斤重的脑袋，老老实实地立在胡桃木桌面和解剖浅盘里，仰望着坐在椅子上的你。',
      '当你用鼠标按住她的额头往下压，她就只能温顺地低眉垂首，连一丝反抗的力气都没有。既然连这样精致的头颅在你的书桌上都得乖乖低头，现实里那几句轻飘飘的嘲笑，又怎么配乱了你的道心？'
    ],
    affirmation: '👑 活人优越公理 #02：坐在书桌前俯视断头的你，才是房间里唯一的上位者。'
  },
  {
    id: 'mk_03',
    category: 'mocked',
    title: '《眼神的驯化：扒开那双曾用鼻孔看人的眼睛》',
    moodTag: '遭受冷眼 · 绝对掌控',
    linked3DAction: 'pry_eyes',
    actionBtnLabel: '🤏 扒开桌上头颅眼皮端详瞳仁 (+60 PTS)',
    paragraphs: [
      '很多时候让人难受的不是话语，而是别人那种带着优越感的冷漠眼神——仿佛你做什么都是徒劳，仿佛他们天生就比你高贵。',
      '现在，把鼠标移到桌上这颗头的眼睑上，轻轻上下拖动。看到那双原本半阖的眼皮是怎么顺着你的指尖被扒开、又被合拢的吗？那对曾经灵动、挑剔、爱用余光打量别人的瞳仁，如今只剩下安静的玻璃光泽，你让她看左她不能看右，你让她闭眼她绝不敢睁开。',
      '在绝对的生死维度面前，任何高高在上的眼神都不过是一层脆弱的角膜与房水。你拥有温热的双手、跳动的心脏和随时扒开她眼皮的主宰权——享受这份彻底掌控的快感，然后翻开书本，去赢下属于你的明天。'
    ],
    affirmation: '👑 活人优越公理 #03：再挑剔高傲的眼神，一旦沦为标本也只能任你扒开眼皮。'
  },
  {
    id: 'mk_04',
    category: 'mocked',
    title: '《社交场上的小丑与书房里的暴君》',
    moodTag: '受尽委屈 · 主权回归',
    linked3DAction: 'lift_hair_drop',
    actionBtnLabel: '🪮 揪起头发悬空掂量再落回桌面 (+60 PTS)',
    paragraphs: [
      '白天在外面为了生计、学业或人情世故，你或许不得不收敛脾气、赔着笑脸，哪怕被人当成不起眼的背景板也只能忍气吞声。那种憋屈感就像一根刺卡在喉咙里。',
      '但当你回到这张书桌前，规则就彻底翻转了。看看你面前摆放的这几颗漂亮脑袋——无论她们生前是众星捧月的校花、还是趾高气扬的精英，在这里都只是你的私人藏品。你可以揪起她的发顶把她拎在半空掂量重量，也可以把她塞进玻璃钟罩里封存。',
      '把白天的委屈全部留给桌上的死物去承受吧。在这里你不需要看任何人的脸色，她们安静、顺从、绝不顶嘴，只为了给你提供最纯粹的活人优越感。'
    ],
    affirmation: '👑 活人优越公理 #04：关上房门，你就是这方书桌世界里唯一的主宰。'
  },
  {
    id: 'mk_05',
    category: 'mocked',
    title: '《笑到最后的人，只需要还活着并继续翻页》',
    moodTag: '反击嘲笑 · 静心翻盘',
    linked3DAction: 'paperweight_tilt',
    actionBtnLabel: '🪨 将桌上头颅歪头按作错题本镇纸 (+60 PTS)',
    paragraphs: [
      '为什么看一眼断头标本能让人瞬间释怀？因为她用最直观的医学截面提醒你：人生的赛场从来不是比谁在某一个瞬间叫得最欢，而是比谁能活着走到最后。',
      '那些今天嘲笑你慢、嘲笑你出身普通、嘲笑你暂时落魄的人，本质上和桌上这颗头颅生前一样盲目自大。可一旦时间停格，再响亮的名头也只会变成标牌上一行冰冷的小字，整颗脑袋最大的用处就是歪在桌角给你压住翻开的书页。',
      '所以，别拿别人的愚蠢惩罚自己。摸一摸这颗冰凉的“人头镇纸”，嘴角扬起一点冷笑，低下头把眼前这一页知识点吃透——你往前走的每一步，都是对嘲笑者最彻底的降维打击。'
    ],
    affirmation: '👑 活人优越公理 #05：巅峰时的傲慢一文不值，活着并持续进化的人才是唯一赢家。'
  },

  // ==================== 2. 📉 学不进/嫌自己笨时 (study_stuck) ====================
  {
    id: 'st_01',
    category: 'study_stuck',
    title: '《900克灰白脑组织的终局：天才断头后算力也是零》',
    moodTag: '做题卡壳 · 破除智商自卑',
    linked3DAction: 'bow_all',
    actionBtnLabel: '🙇‍♀️ 让昔日学神向正在学习的你低头 (+60 PTS)',
    paragraphs: [
      '题目看了三遍还是不会做？背过的公式转头就忘，看着满页红叉觉得自己笨得无可救药？停下来，看一眼你桌角那颗顶着“学神/状元模板”的头颅。',
      '生前她的大脑或许转得飞快，考卷上的分数或许高得让人窒息；但当颈动脉供血在C4断面戛然而止的那一秒，颅腔里那900克灰白色的脑组织就彻底停止了突触放电。现在的她，连“1+1等于几”都算不出来，智商与算力是绝对的零。',
      '而你呢？虽然这道题暂时卡住了你，但你的心脏正在跳动，温热的血液正源源不断地输送进你的大脑皮层。每当你弄懂一个错题，你的神经突触就在真实地生长——一个活着的普通人，在算力上永远碾压一颗死去的天才头颅！'
    ],
    affirmation: '📚 专注赋能公理 #01：死去的天才算力归零，活着的你每看懂一行字都在创造增量。'
  },
  {
    id: 'st_02',
    category: 'study_stuck',
    title: '《把错题本压在她的切口旁：她停在过去，你走向明天》',
    moodTag: '进度落后 · 找回节奏',
    linked3DAction: 'paperweight_tilt',
    actionBtnLabel: '🪨 歪头充当镇纸陪你攻克错题 (+60 PTS)',
    paragraphs: [
      '总觉得复习进度来不及了、身边的人都比你跑得快？焦虑的时候，人最容易陷入“我肯定完蛋了”的死胡同。',
      '来看看桌上这几颗静默的头颅吧。她们才是真正意义上的“彻底来不及了”——她们的年龄、履历和可能性已经被永久焊死在了断面形成的那一刻，哪怕再给她一万年，她也翻不开你手边的任何一页书。',
      '相比之下，你不仅有今天晚上，还有明天、下周和下个月。哪怕你今天只多弄懂了两个概念、只多背了十个单词，你也是在她们永远无法抵达的未来里开疆拓土。把心态放平，慢一点也没关系，因为只有活人能往前走。'
    ],
    affirmation: '📚 专注赋能公理 #02：你并没有落后，你拥有的每一分钟都是标本求之不得的奢侈品。'
  },
  {
    id: 'st_03',
    category: 'study_stuck',
    title: '《拨动她的瞳孔替你盯紧书页：最听话的伴读督学》',
    moodTag: '分心走神 · 收心定神',
    linked3DAction: 'roll_eyeball',
    actionBtnLabel: '👁️ 拨弄眼球与瞳孔凝视书桌 (+60 PTS)',
    paragraphs: [
      '学着学着又想刷手机、脑子里乱糟糟静不下心？用鼠标切到【👁️拨弄眼球/瞳孔】模式，去转一转桌上那颗头的眼珠吧。',
      '你看，她没有手机可刷，没有娱乐可享，甚至连转头看一眼窗外的脖子都没有。她唯一能做的事，就是保持着你拨好的眼球角度，一动不动地陪在你的书桌边。',
      '看着这颗生前同样贪玩、骄傲、如今却只能化作静物陪你坐冷板凳的头颅，你会突然觉得手里能握着笔、眼前能摊开书本是一件多么踏实又充满主宰感的事。吸一口气，点开25分钟专注计时，让她在桌角看着你拿下这一章！'
    ],
    affirmation: '📚 专注赋能公理 #03：她负责在桌角永恒静默，你负责在当下专注翻页。'
  },
  {
    id: 'st_04',
    category: 'study_stuck',
    title: '《考场与人生的降维心法：把难题当成待解剖的标本》',
    moodTag: '畏难情绪 · 庖丁解牛',
    linked3DAction: 'pry_eyes',
    actionBtnLabel: '🤏 扒开眼睑细看解剖细节 (+60 PTS)',
    paragraphs: [
      '遇到密密麻麻的压轴题或晦涩难懂的专业书时，人本能地会感到压迫感，就像仰望一座翻不过去的高山。',
      '但看看你桌上这颗精密的3D解剖断面头模——再复杂、再令人敬畏的人体构造，一旦切开第四颈椎横截面，也不过是由椎体、气管、食管、颈动脉和一层皮肤软组织拼合而成的结构。只要一层层拆解，就没有任何神秘可言。',
      '你手头的难题也是一样。用你把玩桌上头颅时的那份冷静与上位者心态去审视题目：把它拆成已知条件、核心公式和求解步骤。连昔日天之骄女的头颅都摆在你手边任你端详，一道纸面上的题目又怎么可能吓倒你？'
    ],
    affirmation: '📚 专注赋能公理 #04：以收藏家解剖标本的冷静目光拆解难题，万物皆可攻克。'
  },
  {
    id: 'st_05',
    category: 'study_stuck',
    title: '《写下每一个字，都是在汲取未尽的青春生机》',
    moodTag: '精神疲惫 · 满血续航',
    linked3DAction: 'flush_cheeks',
    actionBtnLabel: '❄️ 揉搓标本面颊汲取专注能量 (+60 PTS)',
    paragraphs: [
      '连续学了几个小时，觉得大脑发胀、眼皮打架？伸出鼠标去揉一揉桌上那颗头颅饱满的脸颊，或者拎起她的头发掂一掂。',
      '想想看：她停留在最年轻、最富有生机的十九岁或二十一岁，却再也没有机会去挥霍那份精力；而你此时此刻坐在温暖的灯光下，替她把那些未曾用完的时间变成你笔下的字迹与脑海里的学识。',
      '每次你在研习笔记本里敲下一行笔记、每次你完成一个番茄钟，你都在把游离在书房里的青春气运尽数收入自己囊中。再坚持15分钟，你会发现自己比想象中强大得多！'
    ],
    affirmation: '📚 专注赋能公理 #05：未尽的青春停格在断面之上，而正在学习的你正将生机尽数吸收。'
  },

  // ==================== 3. 💔 自卑/羡慕别人时 (envy_gap) ====================
  {
    id: 'ev_01',
    category: 'envy_gap',
    title: '《温室千金的终局平等：颈椎C4截断面不认家世》',
    moodTag: '痛恨不公 · 找回平衡',
    linked3DAction: 'lift_hair_drop',
    actionBtnLabel: '🪮 拎起发顶悬空再重重落下 (+60 PTS)',
    paragraphs: [
      '刷朋友圈或短视频的时候，看到别人一出生就在罗马、豪车名表、不用努力就能拥有一切，是不是觉得现实不公得让人窒息？',
      '关掉那些刺眼的屏幕，看看你桌上的这颗头。无论生前是含着金汤匙出生的千金小姐，还是从不知人间疾苦的宠儿，当意外降临、颈部齐根断离的那一瞬间，所有的钞票、人脉、优渥家世都救不了那根断裂的脊髓。',
      '在胡桃木桌垫上，她和一块石头、一方砚台没有任何区别——抓起她的头发往上拎，她就得悬空；松开鼠标，她就得重重砸回桌面。而你拥有完整的身体、自由的意志和健康的呼吸，这才是任何财富都买不到的真正特权。'
    ],
    affirmation: '💎 终局平衡公理 #01：家世与光环过不去颈椎C4截面，唯有活着的躯体价值连城。'
  },
  {
    id: 'ev_02',
    category: 'envy_gap',
    title: '《胶原蛋白与立体骨相，现在只是你指尖下的橡皮泥》',
    moodTag: '容貌自卑 · 审美祛魅',
    linked3DAction: 'flush_cheeks',
    actionBtnLabel: '🤏 揉捏面颊与骨相解除容貌光环 (+60 PTS)',
    paragraphs: [
      '人们总容易对高颜值的人产生本能的敬畏或自卑，仿佛长了一张漂亮的脸蛋就天然站在了鄙视链顶端。',
      '现在切换成【🤏捏脸/扒眼/掰嘴】模式，直接在桌上这颗精致的头颅上拖拽几下试试：你可以把她小巧的鼻翼拉宽，把她引以为傲的V字下巴捏方，把她的眼皮扒成大小眼，或者把她的嘴角扯向一边。',
      '看到了吗？所谓的“绝世容颜”，拆穿了不过是毫米级的骨骼起伏与软组织厚度。当它变成你桌上的静默藏品时，怎么捏、怎么摆全凭你的心意。对皮囊彻底祛魅之后，你的内心将再也不会因为任何人的外表而自惭形秽。'
    ],
    affirmation: '💎 终局平衡公理 #02：再惊艳的骨相与皮囊，在收藏家手里也不过是可随意揉捏的粘土。'
  },
  {
    id: 'ev_03',
    category: 'envy_gap',
    title: '《昔日众星捧月，如今冷板凳伴读》',
    moodTag: '心理落差 · 独占快感',
    linked3DAction: 'bow_all',
    actionBtnLabel: '🙇‍♀️ 按压头颅乖乖陪坐冷板凳 (+60 PTS)',
    paragraphs: [
      '也许在现实里，那些光鲜亮丽的人身边总是围满了讨好者，连多看普通人一眼都觉得屈尊。',
      '但在你的书房里，剧本彻底反过来了。没有鲜花、没有掌声、没有追捧者，她只能孤零零地立在你的桌角，听着窗外淅淅沥沥的雨声，陪着你坐一个又一个小时的冷板凳。',
      '甚至连她是待在丝绒圣杯里、玻璃钟罩里，还是直接拿血淋淋的切口贴着冰凉的木桌，都完全取决于你今天的心情。品味一下这种反差带来的隐秘快感吧——你从来不是仰望别人的路人，你是掌控全场的收藏家。'
    ],
    affirmation: '💎 终局平衡公理 #03：昔日再高不可攀的头颅，如今也只能乖乖陪你坐冷板凳。'
  },
  {
    id: 'ev_04',
    category: 'envy_gap',
    title: '《没有躯干的头颅，连一步都走不出去》',
    moodTag: '困顿焦虑 · 珍视双手',
    linked3DAction: 'roll_eyeball',
    actionBtnLabel: '👁️ 拨动死物眼球感受活人自由 (+60 PTS)',
    paragraphs: [
      '当你嫌弃自己现在住的地方不够好、手头的资源不够多时，低头看一眼标本颈部那道平整的横截面，然后再低头看看你自己的双手。',
      '她被永远困在了半径不到十厘米的托盘里——口渴了不能端水，发痒了没有手指去挠，哪怕桌角有一缕阳光，没有双腿的她也挪不过去分毫。',
      '而你只要一抬手就能翻开书页、端起热茶；只要一站起身就能走出房间、去往任何你想去的城市。你此刻习以为常的“完整身体”，正是桌上这颗头颅永远失去的全部世界。带着这份失而复得般的狂喜，去把手头的事做到极致吧！'
    ],
    affirmation: '💎 终局平衡公理 #04：能自由抬手翻书、能起身行走的你，已经坐拥世间最大的自由。'
  },
  {
    id: 'ev_05',
    category: 'envy_gap',
    title: '《给傲慢贴上封条：你的书桌由你命名》',
    moodTag: '夺回定义权 · 贴条加冕',
    linked3DAction: 'tear_stain',
    actionBtnLabel: '🩸 为标本点染凄美泪痕并加盖封条 (+60 PTS)',
    paragraphs: [
      '在外面，别人总喜欢给你贴标签：学历标签、收入标签、性格标签。那些标签像枷锁一样让人喘不过气。',
      '但在CERVIX-3D的书桌上，贴标签的权力100%回到了你的手里。点一下标牌上的【🏷️换人设】，给她盖上【🔇彻底禁言】或【🪨错题本专用镇纸】的粉金封条，再给她眼角点上一抹楚楚可怜的清泪或血泪。',
      '看着曾经不可一世的面容顶着你亲手贴上的封条、流着你亲手点染的眼泪安静伴读，心底那股郁结的恶气是不是瞬间烟消云散了？痛快之后，让我们把精力收回来，继续为你自己的未来添砖加瓦。'
    ],
    affirmation: '💎 终局平衡公理 #05：撕掉外界给你的标签，在你的书桌上唯有你拥有定义权。'
  },

  // ==================== 4. 🌧️ 深夜委屈/心累时 (lonely_night) ====================
  {
    id: 'ln_01',
    category: 'lonely_night',
    title: '《雨夜书房里最安全的倾听者：死人永远不会背叛你》',
    moodTag: '深夜孤独 · 绝对安全感',
    linked3DAction: 'bow_all',
    actionBtnLabel: '🙇‍♀️ 让桌上标本温顺垂眸安静陪你 (+60 PTS)',
    paragraphs: [
      '夜深了，心里攒了一肚子的委屈、疲惫和迷茫，想找人倾诉，却又怕别人敷衍、怕别人笑话你矫情、更怕今天说出口的脆弱明天变成别人茶余饭后的谈资。',
      '那就对桌上的这颗头倾诉吧。打开顶部【🌧️雨声伴学】，听着窗外淅淅沥沥的白噪音，看着台灯暖光下她安静低垂的眉眼——她是这世上最安全、最忠诚的倾听者。',
      '她永远不会打断你的话，不会用高高在上的大道理敷衍你，更不可能把你的秘密泄露给任何人。在她安静的陪伴下，你可以卸下所有防备，哪怕发呆、叹气或者揉一揉她的脸蛋，这里都是绝对接纳你的避风港。'
    ],
    affirmation: '🌧️ 雨夜宽心公理 #01：静默的标本从不评判、从不泄密，只为你守住整夜的安宁。'
  },
  {
    id: 'ln_02',
    category: 'lonely_night',
    title: '《替你流泪的标本：把今晚的脆弱转移到她的眼角》',
    moodTag: '委屈想哭 · 情绪转移',
    linked3DAction: 'tear_stain',
    actionBtnLabel: '💧 在标本眼角点染梨花带雨清泪 (+60 PTS)',
    paragraphs: [
      '如果今晚真的觉得太累、太委屈，眼眶有些发酸，不要强逼自己立刻坚强。点一下这页下方的按钮，或者直接用鼠标在桌上那颗头的眼角点涂几下。',
      '你看，晶莹的泪珠顺着她微凉的眼睑滑落双颊，鼻尖和眼尾泛起一抹楚楚可怜的哭红——让桌上的这颗头替你把今晚的眼泪流完吧。',
      '当她顶着梨花带雨的凄美面容在桌角安静仰望你时，你会发现原本堵在自己胸口的那团酸涩，已经不知不觉转移到了这件标本身上。她负责替你承受破碎与哀伤，而你擦干眼角，依然是那个完整、清醒、掌管全局的活人。'
    ],
    affirmation: '🌧️ 雨夜宽心公理 #02：让案头的标本替你流尽眼泪，你只管留着体力和清醒迎接天亮。'
  },
  {
    id: 'ln_03',
    category: 'lonely_night',
    title: '《摸一摸自己的脉搏：你还拥有无限翻盘的筹码》',
    moodTag: '绝望低谷 · 生命实感',
    linked3DAction: 'pry_eyes',
    actionBtnLabel: '🤏 触碰冰冷标本感受自身温热心跳 (+60 PTS)',
    paragraphs: [
      '人在深夜最脆弱的时候，常常会觉得自己一无所有、前路渺茫。这时候，请把左手放在自己的手腕或胸口，同时用右手鼠标去拨弄一下桌上那颗失去温度的头颅。',
      '感受到了吗？你的指尖下是37℃的温热皮肤和每分钟七十多次的有力搏动；而屏幕里的那颗头颅，无论生前多么风光，她的脉搏已经永远停在了零。',
      '只要心脏还在跳动，只要你还能呼吸、思考、写字，你就拥有无穷无尽的翻盘筹码。任何暂时的失败、窘迫或低谷，在“我还活着”这件绝对事实面前，都只是一段随时可以改写的草稿。'
    ],
    affirmation: '🌧️ 雨夜宽心公理 #03：37℃的体温与跳动的脉搏，是你碾压一切死物的无价底牌。'
  },
  {
    id: 'ln_04',
    category: 'lonely_night',
    title: '《不需要讨好全世界的夜晚》',
    moodTag: '社交耗竭 · 精神松绑',
    linked3DAction: 'flush_cheeks',
    actionBtnLabel: '😌 提拉标本嘴角让她在夜里对你微笑 (+60 PTS)',
    paragraphs: [
      '累了就歇一会儿吧。你不需要时刻做个情绪稳定的成年人，也不需要讨好身边所有挑剔的目光。',
      '用鼠标轻轻把桌上那颗头的嘴角往上提一提，给她调出一个温顺乖巧的浅笑。不管外面的世界今晚对你有多苛刻，至少在这张胡桃木书桌上，连昔日最心高气傲的头颅都在乖乖对着你微笑。',
      '喝口温水，听一会儿雨声。如果今天还能看进两页书，那便是锦上添花；如果今晚只想捏一捏她的脸颊放空十分钟，那也是你作为书房主人的正当享受。'
    ],
    affirmation: '🌧️ 雨夜宽心公理 #04：今晚你无需向任何人交代，你的书房只服务于你的心情。'
  },
  {
    id: 'ln_05',
    category: 'lonely_night',
    title: '《天亮之前，她们陪你守夜》',
    moodTag: '熬夜伴读 · 静谧陪伴',
    linked3DAction: 'paperweight_tilt',
    actionBtnLabel: '🪨 让标本歪头枕在桌角陪你守夜 (+60 PTS)',
    paragraphs: [
      '凌晨的书房总是格外安静，仿佛整座城市都已经睡去，只剩下你一个人还在为了目标苦苦支撑。',
      '其实你并不孤单。看看书桌两侧架子上和托盘里的这几颗藏品——她们不吵不闹、不催促也不抱怨，就那样安安静静地枕在你的课本边，用定格的青春陪你熬过每一个漫长的夜晚。',
      '当你最终合上书本、收获高分与成长的那一天，只有这些静默的头颅知道你在无数个雨夜里付出了多少努力。现在，安心再看20分钟书吧，胜利已经在向你招手了。'
    ],
    affirmation: '🌧️ 雨夜宽心公理 #05：最安静的藏品陪你走过最黑的夜，天亮后的荣光全归你一人所有。'
  },

  // ==================== 5. 🤏 边摸头边看导读 (tactile_guide) ====================
  {
    id: 'tg_01',
    category: 'tactile_guide',
    title: '【把玩导读一】扒开眼皮与拨动瞳孔：凝视的绝对支配',
    moodTag: '交互导读 · 眼部把玩',
    linked3DAction: 'roll_eyeball',
    actionBtnLabel: '👁️ 立即演练：扒开眼皮并拨动眼球 (+75 PTS)',
    paragraphs: [
      '👉 操作指引：点击顶部【👁️拨弄眼球/瞳孔】或【🤏捏脸/扒眼/掰嘴】，将鼠标移到桌上任意一颗3D头颅的眼睛位置上下、左右慢慢拖动。',
      '细看那两片失去肌张力的眼睑是如何在你的拖动下顺从地撑开，露出底下湿润却毫无生气的角膜与虹膜。当你上下滑动鼠标，她的眼球便随之向上翻起或向下低垂；当你左右滑动，她涣散的瞳孔便在微光下放大或收缩。',
      '体会这一刻的微妙快感：生前再清高、再不屑一顾的眼神，如今连聚焦都做不到，只能像一颗昂贵的玻璃义眼般任由你的指尖拨弄。心里有什么不痛快，就在这一推一拉间彻底释放出来吧。'
    ],
    affirmation: '🤏 桌面把玩心法 #01：眼皮开合与瞳仁转向皆在指尖，再高傲的目光也已臣服。'
  },
  {
    id: 'tg_02',
    category: 'tactile_guide',
    title: '【把玩导读二】掰开下巴与提拉唇角：沉默的绝对驯服',
    moodTag: '交互导读 · 唇齿把玩',
    linked3DAction: 'open_lips',
    actionBtnLabel: '👄 立即演练：掰开下颌露齿并提拉嘴角 (+75 PTS)',
    paragraphs: [
      '👉 操作指引：在【🤏捏脸/扒眼/掰嘴】模式下，用鼠标按住3D头颅的下巴或嘴唇区域，向下拉动掰开双唇，再向左右拉动提拉嘴角。',
      '随着下颌骨被你轻易掰开，原本紧闭的双唇微微张开，露出里面洁白整齐的上排齿列与舌尖；再轻轻一推，双唇又严丝合缝地重新闭合。向两侧拉动时，冰冷的嘴角便乖巧地向上扬起。',
      '这是一具100%安静的标本——她永远不会顶嘴、不会抱怨、不会在你专心思考时发出半点杂音。把她的嘴角调成你最顺眼的弧度，然后心无旁骛地投入你的学习之中。'
    ],
    affirmation: '🤏 桌面把玩心法 #02：下颌开合全凭心意，永恒的安静是献给活人最好的伴读礼。'
  },
  {
    id: 'tg_03',
    category: 'tactile_guide',
    title: '【把玩导读三】拎发悬空掂量与重力坠落：沉甸甸的战利品实感',
    moodTag: '交互导读 · 拎发掂量',
    linked3DAction: 'lift_hair_drop',
    actionBtnLabel: '🪮 立即演练：揪住发顶拎起悬空再坠落 (+75 PTS)',
    paragraphs: [
      '👉 操作指引：点击顶部【🪮拎发/拨弄刘海】或标牌上的【🪮拎发】按钮，直接抓着她头顶的发丝把整颗头颅拎到半空中！',
      '一颗成年人的头颅重约4.5到5公斤。当你抓着她的发顶将她拎离桌面时，没有躯干牵连的颈部C4解剖断面便完全暴露在半空中；当你松开手，沉甸甸的头颅便在重力加速度下直直坠落，“咚”的一声闷响重新立回胡桃木桌垫或解剖托盘上。',
      '多试几次这种拎起又落下的物理实感——每一次沉闷的落地声，都在帮你把心里的烦躁与憋屈狠狠砸碎在桌面上！'
    ],
    affirmation: '🤏 桌面把玩心法 #03：四五公斤的沉重坠感，将现实里的一切虚妄焦虑砸得粉碎。'
  },
  {
    id: 'tg_04',
    category: 'tactile_guide',
    title: '【把玩导读四】按头俯首与歪头镇纸：上位者的书房摆件',
    moodTag: '交互导读 · 俯首镇纸',
    linked3DAction: 'paperweight_tilt',
    actionBtnLabel: '🪨 立即演练：按头俯首并歪头压书 (+75 PTS)',
    paragraphs: [
      '👉 操作指引：切换到【🙇‍♀️按头俯首/仰视】模式，在3D头颅上上下拖动调节低头/仰头角度，或点击【🪨镇纸】让她歪头贴在桌面上。',
      '当你把她的头按低18度，她就像一个犯了错正在听训的顺从学徒；当你把她的下巴抬起15度，她又像是在桌角虔诚地仰望正在看书的你；而当你把她歪向一侧，她微凉的脸颊便贴着桌面，老老实实充当压住草稿纸的镇纸。',
      '再开启顶部的【👣居高临下俯视】视角看看吧——从你的视线高度往下看，满桌精致的头颅都在你的眼皮底下温顺陪读，还有什么比这更能激发你掌控全局的斗志？'
    ],
    affirmation: '🤏 桌面把玩心法 #04：俯首听训或是歪头压书，皆由书桌主人的你一手安排。'
  },
  {
    id: 'tg_05',
    category: 'tactile_guide',
    title: '【把玩导读五】点染凄美泪痕与揉搓面颊：破碎感美学定制',
    moodTag: '交互导读 · 泪痕充血',
    linked3DAction: 'tear_stain',
    actionBtnLabel: '🩸 立即演练：点染清泪血泪与双颊微红 (+75 PTS)',
    paragraphs: [
      '👉 操作指引：切换到【🩸点涂泪痕/鼻血】模式，直接点击3D头颅的眼周、鼻孔、嘴角、脸颊或颈部C4断面。',
      '点击眼角，晶莹的清泪或凄艳的猩红血泪便顺着面颊滑落；点击鼻孔与嘴角，温热的殷红血迹便悄然渗出；揉搓脸颊，原本苍白微凉的皮肤便泛起一层楚楚可怜的桃粉潮红。如果喜欢干净唯美的标本感，再点几下即可一键擦拭如新。',
      '用这种极致的凄美反差感洗去你一天的疲惫——她越是破碎静美，越能衬托出活在当下的你是何等鲜活、完整而强大。'
    ],
    affirmation: '🤏 桌面把玩心法 #05：凄美与静默归于案头标本，鲜活与进取归于正在读书的你。'
  },

  // ==================== 6. ⚡ 速效强心针 (quick_pills) ====================
  {
    id: 'qp_01',
    category: 'quick_pills',
    title: '⚡ 速效强心针 · 其一：《呼吸与截面的距离》',
    moodTag: '3秒回血 · 瞬间清醒',
    linked3DAction: 'bow_all',
    actionBtnLabel: '⚡ 注入强心针并令全场俯首 (+60 PTS)',
    paragraphs: [
      '“每当你觉得生活不如意、被人比下去的时候，低头看看桌上的C4横截面——她连下一口空气都吸不进去了，而你还能深吸一口气，翻开下一页书。在生死这道唯一真实的考题前，你是满分幸存者，她只是你的桌面挂件。”'
    ],
    affirmation: '⚡ 强心针 #01：能呼吸、能翻书的人，永远站在鄙视链的最顶端。'
  },
  {
    id: 'qp_02',
    category: 'quick_pills',
    title: '⚡ 速效强心针 · 其二：《谁才是最后的收藏家》',
    moodTag: '3秒回血 · 反客为主',
    linked3DAction: 'pry_eyes',
    actionBtnLabel: '⚡ 注入强心针并扒开眼皮 (+60 PTS)',
    paragraphs: [
      '“生前她们或许挑选朋友、挑选圈子、用挑剔的眼光审视别人；可现在呢？她们被装在你的玻璃钟罩与托盘里，等着你挑今天拿哪一颗头出来当镇纸。笑到最后的人，才是真正的收藏家。”'
    ],
    affirmation: '⚡ 强心针 #02：你不是被审视的客体，你是挑选与把玩标本的主人。'
  },
  {
    id: 'qp_03',
    category: 'quick_pills',
    title: '⚡ 速效强心针 · 其三：《一页书的绝对超越》',
    moodTag: '3秒回血 · 立刻看书',
    linked3DAction: 'paperweight_tilt',
    actionBtnLabel: '⚡ 注入强心针并开启专注 (+60 PTS)',
    paragraphs: [
      '“不管这颗头生前考过多少分、拿过多少奖，从她失去躯干的那一刻起，她的人生总分就已经永久锁死；而你今天晚上每多背一个知识点、每多做对一道题，都是在她的终点线上继续往上叠分！”'
    ],
    affirmation: '⚡ 强心针 #03：死人的分数已永久封顶，活人的上限每一分钟都在刷新。'
  },
];

export const QUICK_COMFORT_PILLS = [
  '💡 难受时看一眼桌角：她连脖子和手脚都没有了，只能乖乖立在你的桌垫上；而你四肢健全、未来无限。',
  '💡 别人嘲笑你一句又怎样？把他的名字写在这颗头的标牌上——现在他连嘴都张不开，只能看着你翻盘！',
  '💡 觉得题目难、学不进去？摸摸这颗昔日学神的脑袋，她现在的脑力是0，你每看懂一行字都在碾压她。',
  '💡 生前再心高气傲、眼高于顶，变成案头标本后，连眼皮睁多大都得靠你的鼠标去扒。',
  '💡 刷手机羡慕别人的光鲜？记住：任何颜值、家世与光环，在第四颈椎切面面前一律清零。',
  '💡 深夜觉得孤单委屈？桌上的她们绝不会打断你、不会笑话你、不会背叛你，只管安心做你自己的事。',
  '💡 用鼠标揪住她的发顶拎起来掂一掂——四五公斤重的头颅落在桌上的闷响，能砸碎一切虚妄的焦虑。',
  '💡 把她的头按低18度：在这个房间里，没有任何人可以对你居高临下。',
  '💡 你的心脏每跳动一下、肺部每呼吸一次，都是在享受案头标本永远失去的顶级奢侈品。',
  '💡 慢一点也没关系，活着的乌龟永远赢过已经停格在断面上的昔日天才。',
];




