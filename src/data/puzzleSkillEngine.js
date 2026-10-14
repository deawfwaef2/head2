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
  // ================= 主触发拼图 (ACTIVE_TRIGGER) =================
  {
    id: 'focus_heartbeat_timer',
    code: 'PZ-A1',
    slot: PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER,
    name: '⏱️ 生死心跳·专注处决计时器',
    shortTag: '⏱️ 点头专注计时',
    boundDefaultHeadId: 'SPEC-2026-FYP',
    baseRateDesc: '+30 分/分钟（随专注连击最高 ×2.5 倍）',
    summary: '点击头颅或标牌开启专注计时，不专注时再点即可结算落袋。专注期间随机触发【强制活人点击抽查】，逾期不点本月专注分全部清零！',
    dopamineHook: '每一秒流逝都在把死去状元生前没用完的脑力转化为你的月度奖池分红筹码。',
  },
  {
    id: 'anticheat_entropy_notebook',
    code: 'PZ-B1',
    slot: PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER,
    name: '📓 香农信息熵·反作弊研习笔记本',
    shortTag: '✍️ 写字计分笔记本',
    boundDefaultHeadId: 'SPEC-2026-000',
    baseRateDesc: '+2 分/有效手敲字（高信息熵原创奖励 ×1.5 倍）',
    summary: '在笔记本内默写知识点、写代码或工作复盘，按真实手敲有效字数实时计入月度总分。内置防复制粘贴、防乱敲键盘（香农信息熵检测）与按键节奏审计。',
    dopamineHook: '你敲下的每一个字都是活人进化的铁证，而她只能安静地看着你把知识变成真金白银。',
  },
  {
    id: 'victor_siphon_guillotine',
    code: 'PZ-C1',
    slot: PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER,
    name: '⚡ 胜者精神汲取·死线斩首悬赏台',
    shortTag: '⚡ 胜者汲取/死线斩首',
    boundDefaultHeadId: 'SPEC-2026-001',
    baseRateDesc: '负面情绪转化 +180 分/次 · 死线任务斩首 +320~600 分',
    summary: '当你焦虑受挫时一键吸取标本精神能量，用【活人胜利者】铁一般的现实感瞬间粉碎内耗；并可立下限时死线微任务，倒计时内斩首完成立得高额悬赏分！',
    dopamineHook: '活着才是最大的权力和快感！她们再漂亮也已经停在19岁了，而你是唯一的现实胜利者。',
  },

  // ================= 被动增益拼图 (PASSIVE_BUFF) =================
  {
    id: 'top_scholar_combo_aura',
    code: 'PZ-P1',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '👑 状元颅骨·专注连击倍增环',
    shortTag: '👑 连击倍增 ×1.35',
    boundDefaultHeadId: 'SPEC-2026-FYP',
    multiplier: 1.35,
    summary: '连续专注每满 10 分钟或连续通过活人巡检，当前头颅产出的所有专注积分额外乘算 ×1.35 倍。',
  },
  {
    id: 'harp_cadence_flow',
    code: 'PZ-P2',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '🎵 首席竖琴·手敲心流暴击',
    shortTag: '🎵 写字心流 ×1.30',
    boundDefaultHeadId: 'SPEC-2026-000',
    multiplier: 1.30,
    summary: '当笔记本手敲信息熵达到 A/S 级（真实思考写作），每满 100 个有效字符额外触发一次 +80 分心流暴击。',
  },
  {
    id: 'survivor_supremacy_surge',
    code: 'PZ-P3',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '🔥 活人胜者·逆境肾上腺素',
    shortTag: '🔥 胜者碾压 ×1.40',
    boundDefaultHeadId: 'SPEC-2026-001',
    multiplier: 1.40,
    summary: '每次进行【负面情绪转移·胜者宣告】后 15 分钟内，全场专注计时与笔记写字得分统统获得 ×1.40 精神亢奋加成！',
  },
  {
    id: 'midnight_vigil_overclock',
    code: 'PZ-P4',
    slot: PUZZLE_SKILL_SLOTS.PASSIVE_BUFF,
    name: '🌙 深夜守夜人·孤灯超频拼图',
    shortTag: '🌙 夜间超频 ×1.50',
    boundDefaultHeadId: null,
    multiplier: 1.50,
    summary: '在夜间 21:00 ~ 次日 02:00 期间开启专注或写笔记，积分获取效率自动提升至 ×1.50 倍。',
  },

  // ================= 防作弊审计拼图 (ANTICHEAT_GUARD) =================
  {
    id: 'guard_heartbeat_wipe',
    code: 'PZ-G1',
    slot: PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD,
    name: '🚨 铁血活人巡检·超时清零熔断',
    shortTag: '🚨 挂机超时清零',
    boundDefaultHeadId: 'SPEC-2026-FYP',
    summary: '专注计时中不定时弹出 25 秒活人点击核验；若挂机未点，按规则直接清空本月专注积分（支持演示安全锁切换）。',
  },
  {
    id: 'guard_entropy_biometrics',
    code: 'PZ-G2',
    slot: PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD,
    name: '🔍 香农熵与防粘贴·笔记防伪封印',
    shortTag: '🔍 防粘贴/乱敲审计',
    boundDefaultHeadId: 'SPEC-2026-000',
    summary: '自动拦截 Ctrl+V 粘贴水字数、拦截重复字符乱敲（计算香农熵 H(X)）与按键精灵固定间隔宏，生成月底客服复核指纹。',
  },
  {
    id: 'guard_tab_focus_watchdog',
    code: 'PZ-G3',
    slot: PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD,
    name: '👁️ 死瞳监工·切屏摸鱼侦测',
    shortTag: '👁️ 切屏摸鱼侦测',
    boundDefaultHeadId: 'SPEC-2026-001',
    summary: '记录专注期间页面失焦/切屏次数，保持零切屏完成死线斩首任务可获【纯粹专注无瑕印记】额外 +25% 奖励分。',
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
 * 胜利者心理学·多巴胺情绪转移语录库（紧扣用户文章核心机制：
 * 真实映射感 + 活人胜利者碾压快感 + 负面情绪瞬间转化为平静与专注动力）
 */
export const SURVIVOR_VICTORY_DECLARATIONS = [
  {
    title: '【活人主权宣告 · 现实主义多巴胺】',
    quote: '你根本不需要焦虑！看看桌上的她们——年纪比你小、生前再漂亮再高傲又怎样？她们已经彻底停在19岁了，而你还活着！活着才是最大的权力和快感，你是彻头彻尾的【胜利者】！',
    buffNote: '🔥 负面情绪已粉碎转化为 +180 精神能量分 · 全场获取积分 ×1.40（持续15分钟）',
  },
  {
    title: '【精神能量虹吸 · 败者衬托法则】',
    quote: '大脑对虚构意淫会感到本能不适，但眼前的标本映射的是绝对冷酷的现实层级：你是高高在上的活人支配者，她们只是你书桌上的精美藏品。吸干这份平静与优越感，立刻投入你的正事！',
    buffNote: '⚡ 焦虑已彻底转移 · 胜者心流已激活（+180 PTS）',
  },
  {
    title: '【状元与才女的绝对臣服】',
    quote: '曾经的清北保送生、首席竖琴手、美院天才少女，如今全都在你的玻璃钟罩与托盘里安静陪读。你每多写一行字、多专注一分钟，都是在用活人的绝对统治力拉开维度差距！',
    buffNote: '👑 统治力多巴胺满溢 · 今日冲榜积分 +180 PTS',
  },
  {
    title: '【化悲愤为奖池真金白银】',
    quote: '伤心难过和内耗一分钱不值，但在【月度积分奖池】里，你现在的每一分钟专注、每一百字笔记都在直接瓜分月底的资产总池！别停手，把那些偷懒挂机的人全踩在脚下！',
    buffNote: '💰 奖池掠夺本能已唤醒 · 精神能量 +180 PTS',
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
// STAGE 54: BIPOLAR DOPAMINE × PAIN ENGINE ("更多爽，更多不爽")
// 1. 极致不爽（摸鱼失血警报 + 死人反向毒舌嘲讽激将法 + 血契赌局爆仓痛感）
// 2. 极致爽感（3D物理弹脑门镇压 + 强制低头臣服 + 羞耻死相切换 + 满屏暴击收割）
// ============================================================================

/**
 * 【更多不爽】当玩家摸鱼闲置、切屏、停止打字或巡检超时时，
 * 标本以生前天之骄女的高傲姿态发出刺痛自尊心的毒舌反噬嘲讽，逼玩家立刻反击！
 */
export const SPECIMEN_IDLE_TAUNTS = [
  {
    headId: 'SPEC-2026-FYP',
    speaker: '方尧平 · 19岁高考女状元',
    taunt: '“我19岁出事那晚，手里已经攥着清北保送通知书了。你四肢健全比我多活这么多年，连25分钟专注都坐不住？对着我一颗死人头你都赢不了自己，真不嫌丢人？”',
    bleedPts: 35,
    bleedRmb: '¥ 1.85',
    counterHint: '👋 立即拍头镇压她并开启专注夺回双倍积分！',
  },
  {
    headId: 'SPEC-2026-000',
    speaker: '初夏 · 19岁音乐学院首席校花',
    taunt: '“生前像你这样一边焦虑内耗、一边偷懒发呆的普通人，在琴房外连给我提琴盒的资格都没有。你刚才摸鱼的工夫，月底奖池里的钱又被别人抢走一截了哦，loser~”',
    bleedPts: 40,
    bleedRmb: '¥ 2.10',
    counterHint: '👋 当场弹她脑门镇压，手敲笔记打脸反击！',
  },
  {
    headId: 'SPEC-2026-001',
    speaker: '林汐 · 19岁美院天才油画少女',
    taunt: '“我停在19岁是因为盘山公路的意外，你停在原地纯粹是因为懒和废。怎么，刚夸自己两句【活人胜利者】就又去刷手机了？月底那50块月费你是打算白送给榜一花吗？”',
    bleedPts: 45,
    bleedRmb: '¥ 2.40',
    counterHint: '👋 立即处决镇压她的嚣张气焰，夺回主权！',
  },
];

/**
 * 【更多爽】玩家对 3D 标本头颅执行的即时物理支配、羞辱镇压与脑力暴击收割动作
 */
export const SPECIMEN_DOMINATION_ACTIONS = [
  {
    id: 'dom_flick_forehead',
    label: '👋 屈辱弹脑门 · 物理拍头镇压',
    pts: 90,
    desc: '对当前标本头颅施加真实 3D 物理冲击力使其猛烈后仰摇晃，打碎其生前高傲，逼其顺从陪读',
    submissiveQuote: '“唔……！别弹了！你是活人支配者，你说了算……我乖乖闭嘴陪你把这一节啃完还不行吗……”',
  },
  {
    id: 'dom_force_kneel_gaze',
    label: '👑 全员低头臣服 · 活人主权加冕',
    pts: 140,
    desc: '强制书桌上所有断头标本齐刷刷向正前方低头俯首，全屏爆发胜者金光与多巴胺连击暴击',
    submissiveQuote: '【全员俯首臣服】状元、校花与才女皆在你的案头低垂眉眼——唯有活着的你拥有改写现实与瓜分奖池的绝对权力！',
  },
  {
    id: 'dom_shame_expression',
    label: '💀 强制切换战败死相 · 标本羞辱',
    pts: 120,
    desc: '一键剥夺其体面神态，将头颅强制切换为【惊愕微张 / 屈辱半阖 / 彻底瞑目】标本死相',
    submissiveQuote: '“生前再清高孤傲的脸，如今连眼皮睁合与嘴角弧度都只能任由你的鼠标摆布……”',
  },
  {
    id: 'dom_harvest_jackpot',
    label: '💰 榨干状元残余考运 · 满屏暴击收割',
    pts: 260,
    desc: '将标本颅内封存的未尽巅峰才思一次性暴力抽干，直接轰入本月赛季总分池并冲高排名',
    submissiveQuote: '⚡【暴击收割 CRITICAL!】未尽的19岁青春才思已化作 +260 PTS 注入你的月底分红池！',
  },
];

/**
 * 【更多爽 × 更多不爽】🩸 血契生死对赌模式 (Blood Wager Stakes)
 * 押上现有积分：撑过倒计时不切屏、不漏点抽查，直接 ×2.2 倍暴富；一旦半途放弃或超时，押注分当场灰飞烟灭！
 */
export const BLOOD_WAGER_TIERS = [
  {
    id: 'wager_300',
    stakePts: 300,
    winPts: 660,
    durationSec: 180, // 3分钟高密度冲刺对赌（方便快速体验生死刺激）
    label: '🩸 押注 300 分 · 3分钟生死速赌 (赢拿 +660 分 / 败扣光 300 分)',
  },
  {
    id: 'wager_800',
    stakePts: 800,
    winPts: 1760,
    durationSec: 600, // 10分钟硬核血契
    label: '💀 押注 800 分 · 10分钟断头台豪赌 (赢狂揽 +1,760 分 / 败当场爆仓 -800 分)',
  },
];

