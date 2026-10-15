/**
 * Stage 69h · Decoupled Morbid Head-Interactive Study Toolkit
 *  1. 🏛️ 建筑展柜 & 🩸 恶趣味断头伴学道具自选工坊 (Selectable 3D Architecture & Morbid Props Workshop)
 *  2. ⏳ 断头滴血计时器 / 番茄钟 / 刷题秒表 / 防犯困电击闹钟 / 40Hz 脑波白噪音 (Decoupled Study Timer)
 *  3. 🕷️ 颅腔神经探针·定向学习激励实时爬虫 + ⚖️ 4.5kg死人头镇纸错题本 + 📌 断颈钢针闪卡抽背器 (Targeted Study Crawler)
 */

import { CONTAINER_STYLE_CATALOG } from '../three/specimenStageAndContainers.js';

const LEDGER_STORAGE_KEY = 'cervix_head_paperweight_ledger_v1';
const FLASHCARD_STORAGE_KEY = 'cervix_head_flashcards_v1';
const TIMER_STATS_STORAGE_KEY = 'cervix_head_study_timer_stats_v1';

// Built-in high-yield university & exam knowledge bank (ensures instant rich results online & offline)
const CURATED_STUDY_KNOWLEDGE_BANK = [
  {
    subject: 'math',
    tag: '📐 高数微积分',
    title: '泰勒公式与麦克劳林展开 (Taylor & Maclaurin Series)',
    summary: '将复杂可微函数在某点附近用多项式逼近的核心工具：f(x) = f(x₀) + f\'(x₀)(x-x₀) + f\'\'(x₀)/2!·(x-x₀)² + ... + Rₙ(x)。常用于求极限（1⁴型、0/0型高阶无穷小替换）、不等式证明与数值近似。',
    formula: 'eˣ = 1 + x + x²/2! + x³/3! + o(x³)  |  sin x = x - x³/6 + o(x³)  |  ln(1+x) = x - x²/2 + x³/3 + o(x³)',
    examTip: '考研/期末高频：做等价无穷小加减法时若首项相消，必须展开到第一个系数不为零的同阶幂次！',
  },
  {
    subject: 'math',
    tag: '📐 高数微积分',
    title: '拉格朗日中值定理与罗尔定理 (Mean Value Theorems)',
    summary: '若 f(x) 在闭区间 [a,b] 连续、开区间 (a,b) 可导，则至少存在一点 ξ ∈ (a,b)，使得 f\'(ξ) = [f(b) - f(a)] / (b - a)。它是连接函数增量与导数符号的桥梁。',
    formula: 'f(b) - f(a) = f\'(ξ)(b - a)   |   辅助函数构造：F(x) = f(x)·e^(λx) 或 F(x) = f(x)·x^k',
    examTip: '看到证明题含 f\'(ξ) + g\'(ξ)f(ξ) = 0 结构，立刻联想到对乘积求导逆推辅助函数！',
  },
  {
    subject: 'math',
    tag: '📐 线性代数',
    title: '实对称矩阵的正交相似对角化与特征值性质',
    summary: 'n 阶实对称矩阵 A 必可正交对角化（存在正交阵 Q 使 QᵀAQ = Q⁻¹AQ = Λ），且不同特征值对应的特征向量天然正交，特征值必为实数。',
    formula: 'A = Q Λ Qᵀ = ∑ λᵢ uᵢ uᵢᵀ （谱分解）  |  tr(A) = ∑ λᵢ  |  det(A) = ∏ λᵢ',
    examTip: '二次型化标准形时，若求正交变换 x = Qy，同一特征根重根内部记得先用施密特正交化再单位化！',
  },
  {
    subject: 'cs',
    tag: '💻 计算机408/算法',
    title: '操作系统死锁的四个必要条件与银行家算法 (Deadlock)',
    summary: '死锁产生的四个必要条件：①互斥条件、②请求与保持条件、③不可剥夺条件、④循环等待条件。预防死锁只需破坏其一；避免死锁则采用 Dijkstra 银行家算法检查安全序列。',
    formula: 'Need[i,j] = Max[i,j] - Allocation[i,j]   |   安全性检查：寻找 Need[i] ≤ Work 的进程释放资源 Work += Allocation[i]',
    examTip: '408 必考辨析：银行家算法属于“死锁避免（动态分配前评估）”而非“死锁预防（静态破坏四条件）”！',
  },
  {
    subject: 'cs',
    tag: '💻 计算机408/算法',
    title: 'TCP 拥塞控制四阶段：慢开始、拥塞避免、快重传、快恢复',
    summary: '发送方维护拥塞窗口 cwnd 与慢启动阈值 ssthresh：cwnd < ssthresh 时指数增长（每 RTT 翻倍）；cwnd ≥ ssthresh 时线性加一；收到 3 个重复 ACK 触发快重传与快恢复（ssthresh = cwnd/2, cwnd = ssthresh）。',
    formula: '发送窗口 swnd = min(rwnd 接收窗口, cwnd 拥塞窗口)   |   超时重传时：ssthresh = cwnd/2, cwnd 直接重置为 1',
    examTip: '注意区分“超时（Timeout，cwnd 降为 1）”与“3个冗余 ACK（快恢复，cwnd 降为减半后的 ssthresh）”！',
  },
  {
    subject: 'english',
    tag: '🇬🇧 考研/雅思核心词',
    title: 'ephemeral /ɪˈfem.ər.əl/ · adj. 朝生暮死的；转瞬即逝的',
    summary: '词根记忆：epi (在…上) + hemera (一天，希腊语) → 只活一天的（蜉蝣） → 短暂的、转瞬即逝的。同义词：transient, fleeting, evanescent；反义词：perennial, eternal, permanent。',
    formula: '例句：Fame in the digital age is notoriously ephemeral, vanishing as quickly as a severed breath.',
    examTip: '阅读态度题与完形高频词：常用来形容时尚潮流、青春寿命或短期经济泡沫的短暂性。',
  },
  {
    subject: 'english',
    tag: '🇬🇧 考研/雅思核心词',
    title: 'corroborate /kəˈrɒb.ə.reɪt/ · vt. 证实；提供新证据支持',
    summary: '词根记忆：cor (共同) + robor (力量，同 robust) + ate → 共同增强论证力量 → 以确凿证据证实（某说法或理论）。',
    formula: '例句：Forensic autopsy findings corroborated the witness\'s testimony regarding the exact time of decapitation.',
    examTip: '学术阅读高频动词：看到实验数据 corroborate 某假说，即表示作者持支持与肯定态度。',
  },
  {
    subject: 'law',
    tag: '⚖️ 法学核心考点',
    title: '刑法·正当防卫与特殊防卫的界限（刑法第20条）',
    summary: '为了使国家、公共利益、本人或者他人的人身、财产和其他权利免受正在进行的不法侵害，而采取的制止不法侵害的行为。对正在进行行凶、杀人、抢劫、强奸、绑架以及其他严重危及人身安全的暴力犯罪，采取防卫行为造成不法侵害人伤亡的，不属于防卫过当。',
    formula: '起因条件（现实不法侵害）+ 时间条件（正在进行）+ 主观条件（防卫意图）+ 对象条件（针对侵害人本人）+ 限度条件（未明显超过必要限度）',
    examTip: '法考核心：假想防卫不可能成立正当防卫（排除故意，有过失定过失，无过失属意外事件）；防卫挑拨属于故意犯罪！',
  },
  {
    subject: 'med',
    tag: '🧬 医学解剖与生理',
    title: '第四颈椎 (C4) 横断面解剖与颈动脉鞘结构',
    summary: 'C4 椎体横断面可见前方的颈总动脉鞘（内含颈总动脉、颈内静脉及迷走神经）、气管软骨环、食管颈部，后方为颈椎椎体、横突孔内的椎动脉及椎管内的脊髓颈段。膈神经由 C3–C5 前支组成（C3, 4, 5 keeps the diaphragm alive）。',
    formula: '颈动脉鞘三要素：内侧颈总动脉 (CCA) + 外侧颈内静脉 (IJV) + 后方二者之间的迷走神经 (CN X)',
    examTip: '解剖记忆口诀：C4 平面恰对应甲状软骨上缘（颈总动脉分叉处），高于 C3 的完全离断将立即阻断膈神经导致自主呼吸停止。',
  },
  {
    subject: 'econ',
    tag: '📈 经管金融模型',
    title: 'IS-LM 模型与流动性陷阱 (Liquidity Trap)',
    summary: 'IS 曲线表示产品市场均衡（投资 I = 储蓄 S，斜率为负），LM 曲线表示货币市场均衡（货币需求 L = 货币供给 M/P，斜率为正）。当名义利率降至极低水平，人们对货币的投机需求弹性趋于无穷大，LM 曲线呈水平状，此时货币政策完全失效，唯有财政政策有效。',
    formula: 'IS: Y = C(Y-T) + I(r) + G   |   LM: M/P = L(Y, r)',
    examTip: '宏观经济学必考：古典区域（LM 垂直）财政政策完全挤出、货币政策极有效；凯恩斯流动性陷阱（LM 水平）则相反！',
  },
  {
    subject: 'phil',
    tag: '🏛️ 哲学与政治马原',
    title: '对立统一规律（矛盾的同一性与斗争性、普遍性与特殊性）',
    summary: '对立统一规律是唯物辩证法的实质和核心。矛盾的同一性是相对的、有条件的；矛盾的斗争性是绝对的、无条件的。矛盾的普遍性（共性）寓于特殊性（个性）之中，没有脱离个性的共性。',
    formula: '两点论（既看主要矛盾又看次要矛盾） + 重点论（抓主要矛盾与矛盾的主要方面，事物性质由主要矛盾的主要方面决定）',
    examTip: '选择题秒杀：凡是说“特殊性寓于普遍性之中”或“整体寓于部分之中”的选项一律错误，必是共性寓于个性之中！',
  },
];

// Generate morbid head-linked study motivation tailored to the active desktop head & study topic
function buildMorbidHeadStudyComment(headName = '方尧平', topicTitle = '核心考点') {
  const cleanName = String(headName || '方尧平').split('·')[0].trim();
  const templates = {
    '方尧平': [
      `【${cleanName} · 19岁省理科状元断头的凝视】：“你刚爬出来的这道《${topicTitle}》，我生前高三晚自习在衡水刷过整整十七遍，连草稿纸都攒了半麻袋。可惜我进考场前脖子就断在了高速护栏上，永远考不了试了……现在我这颗 4.5 公斤的死人脑袋就压在你的错题卷上替你镇纸，你还有完整的脖子和跳动的心脏，要是连这个考点都记不住，我就睁着眼睛盯你一整晚。”`,
      `【${cleanName} · 断颈切口的颅内残响】：“看清楚《${topicTitle}》的推导逻辑了吗？我现在只剩一颗头搁在你显示器前，连握笔的手都没有了。替我把这道题背下来、写进考卷里——只要你多拿一分，我C4颈椎断口流在你桌垫上的血就不算白流。”`,
    ],
    '林汐': [
      `【${cleanName} · 24岁投行首席分析师断头的冷笑】：“《${topicTitle}》这种核心概念，我在陆家嘴通宵搭模型时三分钟就能推完。我现在身首异处躺在你的标本托盘里都没合眼，你四肢健全坐在暖气房里居然还想刷手机？再走神一秒，我就让颈动脉沙漏把血滴在你的键盘上。”`,
      `【${cleanName} · 丝绒圣杯上的毒舌监考】：“把《${topicTitle}》的公式默写三遍。记住，我生前时薪三千美金，现在免费用一颗死人头在桌角给你当全天候监考官——别让我翻着白眼看你交白卷。”`,
    ],
    '初夏': [
      `【${cleanName} · 20岁美院系花断头的轻声耳语】：“原来《${topicTitle}》是这个意思呀……我生前总在画室偷懒，结果生命永远停在了二十岁的夏天。现在我的下巴就抵在你的错题本边上，你每背会一个知识点，我冰凉的瞳孔里就能多映出一点你的光亮呢，加油好不好？”`,
      `【${cleanName} · 玻璃钟罩里的伴读标本】：“别犯困呀……你要是实在累了，可以捏捏我的脸颊或者转一下我的脑袋解闷，但背完《${topicTitle}》这一节再睡好不好？我会乖乖低着头陪你熬过今晚的。”`,
    ],
  };
  const pool = templates[cleanName] || [
    `【${cleanName} · 案头断头标本的颅内残响】：“我已经把《${topicTitle}》的重点给你抓出来了。我连身体都没了还稳稳立在你书桌上陪你死磕，你今天必须把这块硬骨头啃下来！”`,
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function initMorbidStudyToolkit() {
  if (document.getElementById('morbid-study-timer-panel')) return;

  // Inject CSS for the Selector Modal, Floating Study Timer, and Targeted Study Crawler
  const style = document.createElement('style');
  style.id = 'morbid-study-toolkit-styles';
  style.textContent = `
    .mst-floating-panel {
      position: fixed;
      z-index: 9400;
      background: linear-gradient(165deg, rgba(15, 18, 26, 0.96), rgba(9, 11, 16, 0.98));
      border: 1px solid rgba(212, 175, 55, 0.48);
      border-radius: 14px;
      box-shadow: 0 20px 52px rgba(0, 0, 0, 0.82), 0 0 24px rgba(185, 28, 28, 0.18);
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(16px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .mst-floating-panel.hidden {
      display: none !important;
    }
    .mst-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.24);
      background: linear-gradient(90deg, rgba(127, 29, 29, 0.35), rgba(30, 41, 59, 0.4));
      border-radius: 14px 14px 0 0;
      cursor: move;
      user-select: none;
    }
    .mst-title {
      font-size: 13px;
      font-weight: 700;
      color: #fde68a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mst-close-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
      color: #e2e8f0;
      border-radius: 6px;
      padding: 2px 8px;
      font-size: 12px;
      cursor: pointer;
    }
    .mst-close-btn:hover {
      background: rgba(220, 38, 38, 0.45);
      border-color: #f87171;
    }
    .mst-btn {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(212, 175, 55, 0.38);
      color: #fef3c7;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .mst-btn:hover {
      background: rgba(185, 28, 28, 0.42);
      border-color: #fbbf24;
      transform: translateY(-1px);
    }
    .mst-btn.primary {
      background: linear-gradient(135deg, #991b1b, #7f1d1d);
      border-color: #f87171;
      color: #fff;
    }
    .mst-btn.primary:hover {
      background: linear-gradient(135deg, #b91c1c, #991b1b);
    }
    .mst-btn.active {
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.45), rgba(185, 28, 28, 0.55));
      border-color: #fde047;
      color: #fef08a;
    }
    .mst-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
      gap: 9px;
      max-height: 360px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .mst-item-card {
      background: rgba(15, 23, 42, 0.78);
      border: 1px solid rgba(148, 163, 184, 0.24);
      border-radius: 10px;
      padding: 9px 11px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .mst-item-card:hover {
      border-color: rgba(251, 191, 36, 0.65);
      background: rgba(30, 41, 59, 0.92);
    }
    .mst-item-card.morbid {
      border-color: rgba(248, 113, 113, 0.38);
      background: linear-gradient(160deg, rgba(69, 10, 10, 0.35), rgba(15, 23, 42, 0.88));
    }
    .mst-item-card.morbid:hover {
      border-color: #f87171;
    }
  `;
  document.head.appendChild(style);

  // =========================================================================
  // 1. 🏛️ 建筑展柜 & 🩸 恶趣味断头伴学道具自选工坊 Modal (#arch-prop-selector-modal)
  // =========================================================================
  const archModal = document.createElement('div');
  archModal.id = 'arch-prop-selector-modal';
  archModal.className = 'mst-floating-panel hidden';
  // Must be above the 9500 command dock AND the 10050 workbench: otherwise
  // the dock intercepts clicks on the modal's Clear/Close header buttons.
  archModal.style.cssText = 'top: 66px; left: 50%; transform: translateX(-50%); width: min(760px, 95vw); max-height: 85vh; overflow-y: auto; z-index: 11050;';

  const classicContainers = CONTAINER_STYLE_CATALOG.filter((c) => c.category !== 'morbid_prop');
  const morbidProps = CONTAINER_STYLE_CATALOG.filter((c) => c.category === 'morbid_prop');

  archModal.innerHTML = `
    <div class="mst-header">
      <div class="mst-title">🏛️ 3D 建筑展柜 & 🩸 恶趣味断头实用伴学道具自选工坊</div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button class="mst-btn" id="mst-btn-clear-all-structs" title="清空桌面上所有已放置的建筑底座" style="padding:3px 8px;font-size:11px;border-color:rgba(248,113,113,0.5);color:#fca5a5;">🗑️ 清空已放建筑</button>
        <button class="mst-close-btn" id="mst-close-arch-modal">✕</button>
      </div>
    </div>
    <div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:rgba(127,29,29,0.22);border:1px solid rgba(248,113,113,0.35);border-radius:9px;padding:8px 12px;">
        <div style="font-size:12px;color:#fecaca;">
          💡 <strong>自选放置模式</strong>：彻底告别随机刷建筑！点击下方任意展柜或恶趣味伴学底座，可直接<strong>垫在当前断头下方组合</strong>，也可<strong>放置在桌面空位</strong>自由拖拽。
        </div>
        <label style="font-size:11.5px;color:#fde68a;display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" id="mst-chk-snap-active-head" checked style="accent-color:#ef4444;" />
          放置时直接承接当前选中断头 (4.5kg头颅立即落座)
        </label>
      </div>

      <div>
        <div style="font-size:12.5px;font-weight:700;color:#fca5a5;margin-bottom:7px;display:flex;align-items:center;gap:6px;">
          <span>🩸 A区 · 6款恶趣味配合断头 · 且具备真实实用伴学功能的 3D 互动底座</span>
          <span style="font-size:11px;font-weight:400;color:#94a3b8;">(放置后不仅改变3D断头陈列形态，还直接开启对应伴学工具)</span>
        </div>
        <div class="mst-card-grid">
          ${morbidProps.map((item) => `
            <div class="mst-item-card morbid" data-struct-id="${item.id}">
              <div style="font-size:12.5px;font-weight:700;color:#fef08a;">${item.shortLabel}</div>
              <div style="font-size:11px;color:#cbd5e1;line-height:1.38;">${item.label}</div>
              <div style="display:flex;gap:6px;margin-top:auto;padding-top:4px;">
                <button class="mst-btn primary" data-place-struct="${item.id}" style="flex:1;">🩸 放置并承接断头</button>
                <button class="mst-btn" data-open-tool="${item.toolAction || 'timer'}" title="直接打开该道具绑定的实用伴学工具">🛠️ 用工具</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <div style="font-size:12.5px;font-weight:700;color:#fde68a;margin-bottom:7px;display:flex;align-items:center;gap:6px;">
          <span>🏛️ B区 · 6款古典博物馆/解剖室 3D 断头收纳展柜建筑</span>
          <span style="font-size:11px;font-weight:400;color:#94a3b8;">(可任意点选款式放置，把桌面上的断头放进钟罩/圣杯/福尔马林缸)</span>
        </div>
        <div class="mst-card-grid">
          ${classicContainers.map((item) => `
            <div class="mst-item-card" data-struct-id="${item.id}">
              <div style="font-size:12.5px;font-weight:700;color:#fde68a;">${item.shortLabel}</div>
              <div style="font-size:11px;color:#cbd5e1;line-height:1.38;">${item.label}</div>
              <div style="display:flex;gap:6px;margin-top:auto;padding-top:4px;">
                <button class="mst-btn" data-place-struct="${item.id}" style="flex:1;">🏛️ 放置此展柜</button>
                <button class="mst-btn" data-place-struct-empty="${item.id}" title="放置在桌面空位，不自动移动当前头颅">➕ 放空位</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:6px;">🧰 C区 · 案头独立伴学小摆件 (可多件叠加摆放)</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          <button class="mst-btn" data-spawn-desk-prop="banker_lamp">🟢 绿罩伴学台灯</button>
          <button class="mst-btn" data-spawn-desk-prop="hourglass">⏳ 60分钟黄铜沙漏</button>
          <button class="mst-btn" data-spawn-desk-prop="fountain_pen">🖋️ 龙纹金尖钢笔</button>
          <button class="mst-btn" data-spawn-desk-prop="tea_cup">🍵 骨瓷热茶杯</button>
          <button class="mst-btn" data-spawn-desk-prop="magnifying_glass">🔍 3倍黄铜放大镜</button>
          <button class="mst-btn" data-spawn-desk-prop="metronome">🎵 机械节拍器</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(archModal);

  // =========================================================================
  // 2. ⏳ 独立解耦 · 断头滴血计时器 / 番茄钟 / 防犯困电击闹钟 (#morbid-study-timer-panel)
  // =========================================================================
  const timerPanel = document.createElement('div');
  timerPanel.id = 'morbid-study-timer-panel';
  timerPanel.className = 'mst-floating-panel hidden';
  timerPanel.style.cssText = 'top: 74px; right: 20px; width: 356px;';
  timerPanel.innerHTML = `
    <div class="mst-header" id="mst-timer-drag-handle">
      <div class="mst-title">⏳ 颈动脉滴血计时器 · 断头伴读番茄钟</div>
      <button class="mst-close-btn" id="mst-close-timer-panel">✕</button>
    </div>
    <div style="padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;">
      <!-- Mode Switcher -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;">
        <button class="mst-btn active" data-timer-mode="pomodoro">🍅 滴血番茄钟</button>
        <button class="mst-btn" data-timer-mode="stopwatch">⏱️ 刷题正计时</button>
        <button class="mst-btn" data-timer-mode="electro_alarm">⚡ 防困电击铃</button>
      </div>

      <!-- Big Digital Blood Timer Readout -->
      <div style="background:radial-gradient(circle at 50% 35%, rgba(127,29,29,0.45), rgba(9,11,16,0.95));border:1px solid rgba(248,113,113,0.42);border-radius:12px;padding:12px;text-align:center;position:relative;overflow:hidden;">
        <div id="mst-timer-phase-badge" style="font-size:11px;color:#fca5a5;margin-bottom:2px;">🩸 颈动脉滴血专注倒计时 · 断头正在桌面陪你死磕</div>
        <div id="mst-timer-digits" style="font-size:38px;font-weight:800;font-variant-numeric:tabular-nums;color:#fef08a;letter-spacing:2px;text-shadow:0 0 18px rgba(239,68,68,0.55);">25:00</div>
        <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;margin-top:8px;overflow:hidden;">
          <div id="mst-timer-blood-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#dc2626,#fbbf24);transition:width 0.3s;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10.5px;color:#94a3b8;margin-top:6px;">
          <span id="mst-timer-blood-drops">🩸 已凝聚颈血：0.0 mL</span>
          <span id="mst-timer-today-total">📚 今日专注：0 分钟</span>
        </div>
      </div>

      <!-- Preset Durations & Custom Input -->
      <div id="mst-timer-preset-row" style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">
        <button class="mst-btn" data-timer-mins="15" style="padding:4px 8px;">15m</button>
        <button class="mst-btn active" data-timer-mins="25" style="padding:4px 8px;">25m</button>
        <button class="mst-btn" data-timer-mins="45" style="padding:4px 8px;">45m</button>
        <button class="mst-btn" data-timer-mins="60" style="padding:4px 8px;">60m</button>
        <button class="mst-btn" data-timer-mins="90" style="padding:4px 8px;">90m</button>
        <div style="display:flex;align-items:center;gap:4px;margin-left:auto;">
          <input type="number" id="mst-timer-custom-mins" min="1" max="300" value="25" style="width:48px;background:#0f172a;border:1px solid rgba(212,175,55,0.4);color:#fef08a;border-radius:6px;padding:3px 5px;font-size:11px;text-align:center;" />
          <span style="font-size:11px;color:#cbd5e1;">分</span>
        </div>
      </div>

      <!-- Start / Pause / Reset / Wipe Blood -->
      <div style="display:flex;gap:6px;">
        <button class="mst-btn primary" id="mst-timer-start-btn" style="flex:1.4;font-size:12.5px;">▶️ 开始断头伴学计时</button>
        <button class="mst-btn" id="mst-timer-reset-btn">↺ 重置</button>
        <button class="mst-btn" id="mst-timer-wipe-blood-btn" title="擦拭桌面断头切口与面部的渗血">🧼 擦血</button>
      </div>

      <!-- Morbid Head Interaction Mode -->
      <div style="background:rgba(15,23,42,0.75);border:1px solid rgba(148,163,184,0.2);border-radius:9px;padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11.5px;font-weight:700;color:#fde68a;">💀 计时期间桌面断头伴读姿态</span>
          <button class="mst-btn" id="mst-btn-head-nag-now" style="padding:2px 7px;font-size:10.5px;">⚡ 让断头催我</button>
        </div>
        <select id="mst-head-posture-select" style="width:100%;background:#0f172a;border:1px solid rgba(212,175,55,0.35);color:#f8fafc;border-radius:6px;padding:5px 8px;font-size:11.5px;">
          <option value="stare_monitor">👁️ 死不瞑目紧盯监考 (断头抬头直视你，每分钟微动防摸鱼)</option>
          <option value="obedient_bow">🙇‍♀️ 低眉俯首温顺伴读 (断头乖巧垂眸，绝不打扰你算题)</option>
          <option value="bleed_hourglass">🩸 颈动脉同步渗血 (随倒计时推进，断颈与嘴角缓慢渗血)</option>
          <option value="electro_shock">⚡ 耳垂鳄鱼夹电击抽搐 (到点或走神时断头猛烈惊醒抽搐)</option>
        </select>
      </div>

      <!-- 40Hz Binaural Focus & Trachea White Noise -->
      <div style="background:rgba(15,23,42,0.75);border:1px solid rgba(56,189,248,0.25);border-radius:9px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-size:11px;color:#bae6fd;">
          <strong>🫁 断颈气管插管·40Hz伽马心流声波</strong><br/>
          <span style="color:#94a3b8;font-size:10.5px;">雨夜粉红白噪音 + 40Hz专注双耳节拍</span>
        </div>
        <button class="mst-btn" id="mst-btn-toggle-binaural" style="white-space:nowrap;">🔊 开启声波</button>
      </div>

      <!-- Live Head Nag Quote Box -->
      <div id="mst-timer-head-quote" style="font-size:11px;color:#fecaca;background:rgba(69,10,10,0.4);border-left:3px solid #ef4444;padding:7px 9px;border-radius:0 7px 7px 0;line-height:1.45;">
        【案头断头待命中】：设定好番茄钟时间后点击开始，我会用这颗死人脑袋在桌角替你守着每一秒。
      </div>
    </div>
  `;
  document.body.appendChild(timerPanel);

  // =========================================================================
  // 3. 🕷️ 独立解耦 · 颅腔神经探针·定向学习激励爬虫 & 死人头镇纸错题本 & 闪卡抽背 (#morbid-study-crawler-panel)
  // =========================================================================
  const crawlerPanel = document.createElement('div');
  crawlerPanel.id = 'morbid-study-crawler-panel';
  crawlerPanel.className = 'mst-floating-panel hidden';
  crawlerPanel.style.cssText = 'top: 70px; left: 20px; width: min(500px, 95vw); max-height: 84vh; display: flex; flex-direction: column;';
  crawlerPanel.innerHTML = `
    <div class="mst-header" id="mst-crawler-drag-handle">
      <div class="mst-title">🕷️ 颅腔神经探针 · 定向学习激励爬虫 & 死人头镇纸台</div>
      <button class="mst-close-btn" id="mst-close-crawler-panel">✕</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px 14px 6px 14px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <button class="mst-btn active" data-crawler-tab="crawler">🕷️ 定向学习爬虫</button>
      <button class="mst-btn" data-crawler-tab="ledger">⚖️ 死人头镇纸错题本</button>
      <button class="mst-btn" data-crawler-tab="flashcard">📌 断颈钢针闪卡抽背</button>
    </div>

    <!-- TAB 1: 🕷️ 定向学习资料与毒舌激励实时爬虫 -->
    <div id="mst-tab-pane-crawler" style="padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:11.5px;color:#cbd5e1;line-height:1.4;">
        🔍 <strong>定向爬取真实学科知识 + 断头恶趣味反差激励</strong>：输入任意学科词条、公式、英文单词或考公/考研考点（支持实时连线 Wikipedia 百科 / 英文词典 / OpenAlex 学术库 + 内置高频考点库），桌面上的断头会同步审视并生成专属催学毒鸡汤！
      </div>

      <div style="display:flex;gap:6px;">
        <input type="text" id="mst-crawler-query-input" placeholder="输入学习关键词：如 泰勒公式 / 死锁 / 刑法 / ephemeral / 量子力学..." style="flex:1;background:#0f172a;border:1px solid rgba(212,175,55,0.45);color:#f8fafc;border-radius:8px;padding:7px 10px;font-size:12px;" />
        <button class="mst-btn primary" id="mst-btn-run-crawler">🕷️ 定向爬取</button>
      </div>

      <!-- Quick Directional Subject Chips -->
      <div style="display:flex;flex-wrap:wrap;gap:5px;">
        <button class="mst-btn" data-crawl-subj="math" style="padding:4px 8px;font-size:11px;">📐 高数/线代</button>
        <button class="mst-btn" data-crawl-subj="cs" style="padding:4px 8px;font-size:11px;">💻 408/算法</button>
        <button class="mst-btn" data-crawl-subj="english" style="padding:4px 8px;font-size:11px;">🇬🇧 考研/雅思核心词</button>
        <button class="mst-btn" data-crawl-subj="law" style="padding:4px 8px;font-size:11px;">⚖️ 法考核心</button>
        <button class="mst-btn" data-crawl-subj="med" style="padding:4px 8px;font-size:11px;">🧬 医学解剖</button>
        <button class="mst-btn" data-crawl-subj="econ" style="padding:4px 8px;font-size:11px;">📈 经管金融</button>
        <button class="mst-btn" data-crawl-subj="phil" style="padding:4px 8px;font-size:11px;">🏛️ 马原哲学</button>
        <button class="mst-btn" id="mst-btn-crawl-wiki-random" style="padding:4px 8px;font-size:11px;border-color:#38bdf8;color:#bae6fd;">🌐 实时随机抓百科词条</button>
      </div>

      <!-- Crawled Study Card Result -->
      <div id="mst-crawler-result-box" style="background:rgba(15,23,42,0.88);border:1px solid rgba(212,175,55,0.38);border-radius:10px;padding:11px 12px;display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <span id="mst-crawl-res-tag" style="font-size:10.5px;background:rgba(217,119,6,0.28);color:#fde68a;padding:2px 7px;border-radius:5px;border:1px solid rgba(251,191,36,0.4);">📐 高数微积分 · 实时探针</span>
          <span id="mst-crawl-res-source" style="font-size:10px;color:#94a3b8;">来源：高频考点知识库</span>
        </div>
        <div id="mst-crawl-res-title" style="font-size:14px;font-weight:800;color:#fef08a;">泰勒公式与麦克劳林展开 (Taylor & Maclaurin Series)</div>
        <div id="mst-crawl-res-summary" style="font-size:12px;color:#e2e8f0;line-height:1.52;">将复杂可微函数在某点附近用多项式逼近的核心工具：f(x) = f(x₀) + f'(x₀)(x-x₀) + f''(x₀)/2!·(x-x₀)² + ... + Rₙ(x)。常用于求极限、不等式证明与数值近似。</div>
        <div id="mst-crawl-res-formula" style="font-size:11.5px;font-family:monospace;color:#93c5fd;background:rgba(2,6,23,0.75);padding:7px 9px;border-radius:6px;border:1px solid rgba(56,189,248,0.25);">eˣ = 1 + x + x²/2! + x³/3! + o(x³) | sin x = x - x³/6 + o(x³)</div>
        <div id="mst-crawl-res-tip" style="font-size:11px;color:#86efac;">💡 考点点拨：做等价无穷小加减法时若首项相消，必须展开到第一个系数不为零的同阶幂次！</div>

        <!-- Morbid Head Motivation Box -->
        <div id="mst-crawl-head-motivation" style="font-size:11.5px;color:#fecaca;background:linear-gradient(90deg,rgba(127,29,29,0.48),rgba(30,41,59,0.45));border-left:3px solid #ef4444;padding:8px 10px;border-radius:0 8px 8px 0;line-height:1.46;">
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:6px;padding-top:4px;">
          <button class="mst-btn primary" id="mst-btn-save-to-ledger">⚖️ 压入死人头镇纸错题本</button>
          <button class="mst-btn" id="mst-btn-save-to-flashcard">📌 穿入断颈钢针闪卡</button>
          <button class="mst-btn" id="mst-btn-start-pomo-with-topic">⏳ 带着此考点开25m番茄钟</button>
        </div>
      </div>
    </div>

    <!-- TAB 2: ⚖️ 4.5kg死人头镇纸·错题与考点压卷本 -->
    <div id="mst-tab-pane-ledger" class="hidden" style="padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:11.5px;color:#fecaca;background:rgba(127,29,29,0.25);border:1px solid rgba(248,113,113,0.32);border-radius:8px;padding:8px 10px;">
        ⚖️ <strong>4.5kg 死人头实心镇纸台</strong>：她生前最爱护书卷，如今只能用切下后的沉重头颅替你压住错题本。录入任何难背公式或错题，即可用她的断头镇压并随时抽考！
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;background:rgba(15,23,42,0.75);padding:9px;border-radius:8px;border:1px solid rgba(148,163,184,0.2);">
        <input type="text" id="mst-ledger-new-title" placeholder="输入错题/难背公式标题（如：洛必达法则失效情形）" style="background:#0f172a;border:1px solid rgba(212,175,55,0.35);color:#fff;border-radius:6px;padding:6px 8px;font-size:12px;" />
        <textarea id="mst-ledger-new-body" rows="2" placeholder="输入解析/答案/背诵要点..." style="background:#0f172a;border:1px solid rgba(212,175,55,0.35);color:#fff;border-radius:6px;padding:6px 8px;font-size:12px;resize:vertical;"></textarea>
        <div style="display:flex;gap:6px;">
          <button class="mst-btn primary" id="mst-btn-add-ledger-item" style="flex:1;">🩸 压入当前断头切口下方镇住</button>
          <button class="mst-btn" id="mst-btn-spawn-paperweight-3d" title="在3D桌面上生成4.5kg死人头错题镇纸台并承接断头">🏛️ 生成3D镇纸台</button>
        </div>
      </div>
      <div id="mst-ledger-list" style="display:flex;flex-direction:column;gap:7px;max-height:290px;overflow-y:auto;"></div>
    </div>

    <!-- TAB 3: 📌 断颈钢针·艾宾浩斯记忆闪卡抽背 -->
    <div id="mst-tab-pane-flashcard" class="hidden" style="padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:#fde68a;font-weight:700;">📌 断颈钢针血签抽背 · 答错断头会翻白眼渗血嘲讽</span>
        <span id="mst-fc-counter" style="font-size:11px;color:#94a3b8;">第 1 / 1 张</span>
      </div>
      <div id="mst-fc-card-box" style="background:radial-gradient(circle at 50% 25%, rgba(69,10,10,0.45), rgba(15,23,42,0.95));border:1px solid rgba(251,191,36,0.45);border-radius:12px;padding:16px 14px;min-height:150px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:10px;cursor:pointer;">
        <div id="mst-fc-front" style="font-size:15px;font-weight:800;color:#fef08a;">点击抽背闪卡</div>
        <div id="mst-fc-back" class="hidden" style="font-size:12.5px;color:#e2e8f0;line-height:1.5;border-top:1px dashed rgba(251,191,36,0.35);padding-top:10px;width:100%;"></div>
        <div style="font-size:10.5px;color:#94a3b8;">(点击卡片翻转查看答案)</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="mst-btn" id="mst-fc-btn-flip" style="flex:1;">🔄 翻转看答案</button>
        <button class="mst-btn" id="mst-fc-btn-forgot" style="flex:1;border-color:#f87171;color:#fca5a5;">❌ 没记住 (断头翻白眼)</button>
        <button class="mst-btn primary" id="mst-fc-btn-knew" style="flex:1;background:linear-gradient(135deg,#065f46,#047857);border-color:#34d399;">✅ 背熟了 (下一张)</button>
      </div>
    </div>
  `;
  document.body.appendChild(crawlerPanel);

  // Add Quick Buttons to the Top Command Bar (#desktop-overlay-bar) so Timer & Crawler are 1-click accessible
  const topRightActions = document.querySelector('#desktop-overlay-bar .overlay-right-actions') || document.getElementById('desktop-overlay-bar');
  if (topRightActions && !document.getElementById('btn-open-morbid-timer')) {
    const timerBtn = document.createElement('button');
    timerBtn.id = 'btn-open-morbid-timer';
    timerBtn.className = 'overlay-pill';
    timerBtn.style.cssText = 'border-color:rgba(248,113,113,0.75);color:#fef08a;background:rgba(127,29,29,0.45);';
    timerBtn.title = '打开独立解耦的【断头滴血番茄钟 / 刷题秒表 / 防犯困电击闹钟】';
    timerBtn.textContent = '⏳ 断头计时器';

    const crawlerBtn = document.createElement('button');
    crawlerBtn.id = 'btn-open-morbid-crawler';
    crawlerBtn.className = 'overlay-pill';
    crawlerBtn.style.cssText = 'border-color:rgba(56,189,248,0.75);color:#e0f2fe;background:rgba(15,23,42,0.75);';
    crawlerBtn.title = '打开独立解耦的【颅腔神经探针·定向学习激励爬虫 & 死人头镇纸错题本】';
    crawlerBtn.textContent = '🕷️ 学习激励爬虫';

    const archBtn = document.getElementById('btn-quick-place-container');
    if (archBtn && archBtn.parentNode) {
      archBtn.textContent = '🏛️ 建筑与恶趣味道具';
      archBtn.title = '自选放置 6款3D展柜建筑 或 6款恶趣味断头伴学道具（不再随机刷！）';
      archBtn.parentNode.insertBefore(timerBtn, archBtn.nextSibling);
      archBtn.parentNode.insertBefore(crawlerBtn, timerBtn.nextSibling);
    } else {
      topRightActions.appendChild(timerBtn);
      topRightActions.appendChild(crawlerBtn);
    }
  }

  // =========================================================================
  // Helper: Get Active Desktop Head & Trigger Morbid 3D Head Physical Reaction
  // =========================================================================
  const getActiveDesktopPet = () => {
    const qa = window.__cervixQA;
    const eng = qa?.desktop;
    if (!eng?.pets?.size) return null;
    const id = eng.selectedPetId || qa.state?.activeStripPetId;
    return eng.pets.get(id) || eng.pets.values().next().value || null;
  };

  const triggerMorbidHeadPhysicalReaction = (mode = 'stare_monitor') => {
    const qa = window.__cervixQA;
    const eng = qa?.desktop;
    if (!eng || !eng.pets) return '方尧平';
    let activeName = '方尧平';
    for (const pet of eng.pets.values()) {
      if (pet?.collectible?.name) activeName = pet.collectible.name;
      const node = pet?.node || pet?.headNode;
      if (!node) continue;
      if (mode === 'stare_monitor') {
        node.rotation.x = -0.06;
        node.rotation.y = (Math.random() - 0.5) * 0.16;
        qa?.updateMaterialsLive?.(node, { gazeYaw: 0, gazePitch: 0.05, pupilSize: 1.12 });
      } else if (mode === 'obedient_bow') {
        node.rotation.x = 0.18;
        qa?.updateMaterialsLive?.(node, { gazeYaw: 0, gazePitch: -0.25 });
      } else if (mode === 'bleed_hourglass') {
        const curBlood = Number(pet?.collectible?.morphs?.neckBloodStrength ?? 0.65);
        const nextBlood = Math.min(1.0, curBlood + 0.08);
        const nextMouth = Math.min(0.85, Number(pet?.collectible?.morphs?.mouthBloodStrength ?? 0.15) + 0.08);
        qa?.updateMaterialsLive?.(node, { neckBloodStrength: nextBlood, mouthBloodStrength: nextMouth, nosebleedStrength: 0.45 });
      } else if (mode === 'electro_shock') {
        node.rotation.z = (Math.random() > 0.5 ? 1 : -1) * 0.14;
        node.rotation.x = -0.14;
        qa?.updateMaterialsLive?.(node, { gazePitch: 0.32, pupilSize: 0.78, tearTrackStrength: 0.55 });
        setTimeout(() => {
          if (node) node.rotation.z = 0;
          eng.wakeRender?.(1.0, false);
        }, 450);
      } else if (mode === 'wipe_clean') {
        qa?.updateMaterialsLive?.(node, { nosebleedStrength: 0, mouthBloodStrength: 0, tearTrackStrength: 0, faceSplatterStrength: 0 });
      }
    }
    eng.wakeRender?.(1.8, true);
    return activeName;
  };

  // =========================================================================
  // Place Selected 3D Container or Morbid Prop (and optionally snap active head onto it!)
  // =========================================================================
  const placeSelectedStructureOrProp = (styleId, forceEmpty = false) => {
    const qa = window.__cervixQA;
    const eng = qa?.desktop;
    if (!eng) return;

    // Make sure 3D floor/structures are visible if in pure pet mode
    if (eng.desktopPetMode && typeof eng.setDesktopPetMode === 'function') {
      eng.setDesktopPetMode(false);
    }

    const snapChk = document.getElementById('mst-chk-snap-active-head');
    const shouldSnapHead = !forceEmpty && (!snapChk || snapChk.checked);
    const activePet = getActiveDesktopPet();

    // DesktopBoxSpaceEngine's public API uses `pos`, `placeContainerStructure`
    // and `snapHeadIntoStructure`. The old, nonexistent spawnContainerStructure
    // method made every selector click throw before anything appeared.
    let structState = null;
    if (shouldSnapHead && activePet?.pos) {
      eng.setPetContainerStyle(activePet.id, styleId);
      structState = eng.structures.get(activePet.snappedStructureId);
    } else {
      structState = eng.placeContainerStructure(styleId);
    }
    if (!structState) {
      qa?.showToast?.('建筑未能放入当前场景，请检查展台模式。');
      return false;
    }

    eng.wakeRender?.(2.0, true);
    const catItem = CONTAINER_STYLE_CATALOG.find((c) => c.id === styleId);
    qa?.showToast?.(`🏛️ 已放置【${catItem?.shortLabel || styleId}】${shouldSnapHead && activePet ? '并承接当前头模' : '（可拖动头模至此）'}`);
    if (catItem?.toolAction) openLinkedMorbidTool(catItem.toolAction);
    return true;
  };

  const openLinkedMorbidTool = (toolAction) => {
    if (toolAction === 'timer' || toolAction === 'alarm' || toolAction === 'vigil') {
      timerPanel.classList.remove('hidden');
      if (toolAction === 'alarm') {
        document.querySelector('[data-timer-mode="electro_alarm"]')?.click();
      }
    } else if (toolAction === 'crawler' || toolAction === 'ledger' || toolAction === 'flashcard') {
      crawlerPanel.classList.remove('hidden');
      const tabBtn = document.querySelector(`[data-crawler-tab="${toolAction}"]`);
      tabBtn?.click();
    }
  };

  // Wire up Architecture & Morbid Prop Selector Modal events
  document.getElementById('mst-close-arch-modal')?.addEventListener('click', () => archModal.classList.add('hidden'));
  document.getElementById('mst-btn-clear-all-structs')?.addEventListener('click', () => {
    const qa = window.__cervixQA;
    const eng = qa?.desktop;
    if (!eng) return;
    for (const [id, entry] of [...eng.structures]) {
      if (!entry.isStageGenerated) eng.removeContainerStructure(id, false);
    }
    qa?.showToast?.('🗑️ 已清空自行放置的建筑与底座（保留原有展台）');
  });

  archModal.querySelectorAll('[data-place-struct]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (placeSelectedStructureOrProp(btn.dataset.placeStruct, false)) archModal.classList.add('hidden');
    });
  });
  archModal.querySelectorAll('[data-place-struct-empty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (placeSelectedStructureOrProp(btn.dataset.placeStructEmpty, true)) archModal.classList.add('hidden');
    });
  });
  archModal.querySelectorAll('[data-open-tool]').forEach((btn) => {
    btn.addEventListener('click', () => {
      archModal.classList.add('hidden');
      openLinkedMorbidTool(btn.dataset.openTool);
    });
  });
  archModal.querySelectorAll('[data-spawn-desk-prop]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const propId = btn.dataset.spawnDeskProp;
      window.__cervixQA?.desktop?.spawnDeskProp?.(propId);
      window.__cervixQA?.showToast?.(`🧰 已在案头放置摆件：${btn.textContent}`);
    });
  });

  // Top bar buttons
  document.getElementById('btn-open-morbid-timer')?.addEventListener('click', () => {
    timerPanel.classList.toggle('hidden');
  });
  document.getElementById('btn-open-morbid-crawler')?.addEventListener('click', () => {
    crawlerPanel.classList.toggle('hidden');
  });
  document.getElementById('mst-close-timer-panel')?.addEventListener('click', () => timerPanel.classList.add('hidden'));
  document.getElementById('mst-close-crawler-panel')?.addEventListener('click', () => crawlerPanel.classList.add('hidden'));

  // =========================================================================
  // Timer State Machine (Pomodoro / Stopwatch / Electro-Alarm + WebAudio Binaural)
  // =========================================================================
  let timerMode = 'pomodoro'; // 'pomodoro' | 'stopwatch' | 'electro_alarm'
  let timerRunning = false;
  let timerTotalSec = 25 * 60;
  let timerRemainSec = 25 * 60;
  let stopwatchSec = 0;
  let timerIntervalId = null;
  let totalFocusSecToday = Number(localStorage.getItem(TIMER_STATS_STORAGE_KEY) || 0);

  const digitsEl = document.getElementById('mst-timer-digits');
  const bloodBarEl = document.getElementById('mst-timer-blood-bar');
  const bloodDropsEl = document.getElementById('mst-timer-blood-drops');
  const todayTotalEl = document.getElementById('mst-timer-today-total');
  const startBtnEl = document.getElementById('mst-timer-start-btn');
  const quoteEl = document.getElementById('mst-timer-head-quote');
  const phaseBadgeEl = document.getElementById('mst-timer-phase-badge');

  const formatMMSS = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const renderTimerUI = () => {
    if (timerMode === 'stopwatch') {
      digitsEl.textContent = formatMMSS(stopwatchSec);
      const pct = Math.min(100, (stopwatchSec % 1800) / 18);
      bloodBarEl.style.width = `${pct}%`;
    } else {
      digitsEl.textContent = formatMMSS(timerRemainSec);
      const pct = timerTotalSec > 0 ? Math.min(100, ((timerTotalSec - timerRemainSec) / timerTotalSec) * 100) : 0;
      bloodBarEl.style.width = `${pct.toFixed(1)}%`;
    }
    const ml = (totalFocusSecToday / 60 * 1.8).toFixed(1);
    bloodDropsEl.textContent = `🩸 已凝聚颈血：${ml} mL`;
    todayTotalEl.textContent = `📚 今日专注：${Math.floor(totalFocusSecToday / 60)} 分钟`;
  };
  renderTimerUI();

  const playElectroBellChime = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880 + i * 220, ctx.currentTime + i * 0.14);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.14);
        osc.stop(ctx.currentTime + i * 0.14 + 0.36);
      }
    } catch (_) {}
  };

  const stepTimerTick = () => {
    const posture = document.getElementById('mst-head-posture-select')?.value || 'stare_monitor';
    totalFocusSecToday += 1;
    if (totalFocusSecToday % 10 === 0) {
      localStorage.setItem(TIMER_STATS_STORAGE_KEY, String(totalFocusSecToday));
    }
    if (totalFocusSecToday % 15 === 0) {
      triggerMorbidHeadPhysicalReaction(posture);
    }

    if (timerMode === 'stopwatch') {
      stopwatchSec += 1;
      renderTimerUI();
      return;
    }

    if (timerRemainSec > 0) {
      timerRemainSec -= 1;
      renderTimerUI();
    } else {
      // Timer finished!
      playElectroBellChime();
      const headName = triggerMorbidHeadPhysicalReaction('electro_shock');
      if (timerMode === 'electro_alarm') {
        // Loop interval alarm automatically!
        timerRemainSec = timerTotalSec;
        quoteEl.textContent = `⚡【${headName}的双耳鳄鱼夹通电惊醒】：“铃响了！不许趴在桌子上犯困，抬头看看我这颗死不瞑目的脑袋，继续往下刷题！”`;
        window.__cervixQA?.showToast?.(`⚡ 断头防犯困电击铃已触发！【${headName}】正瞪着你！`);
      } else {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        timerRunning = false;
        startBtnEl.textContent = '▶️ 开始断头伴学计时';
        quoteEl.textContent = `🎉【${headName}的断头伴读结算】：“这一轮专注圆满完成了！我的颈血没有白流，快喝口水或者摸摸我的头发休息五分钟吧。”`;
        window.__cervixQA?.showToast?.(`🩸 断头滴血番茄钟完成！已累计专注 ${Math.floor(totalFocusSecToday / 60)} 分钟！`);
      }
    }
  };

  timerPanel.querySelectorAll('[data-timer-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      timerMode = btn.dataset.timerMode;
      timerPanel.querySelectorAll('[data-timer-mode]').forEach((b) => b.classList.toggle('active', b === btn));
      if (timerMode === 'pomodoro') {
        phaseBadgeEl.textContent = '🩸 颈动脉滴血专注倒计时 · 断头正在桌面陪你死磕';
      } else if (timerMode === 'stopwatch') {
        phaseBadgeEl.textContent = '⏱️ 连续刷题正计时秒表 · 记录你每一秒的拼搏';
      } else {
        phaseBadgeEl.textContent = '⚡ 双耳鳄鱼夹防犯困循环电击铃 · 每隔设定分钟自动惊醒';
      }
      renderTimerUI();
    });
  });

  timerPanel.querySelectorAll('[data-timer-mins]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mins = Math.max(1, parseInt(btn.dataset.timerMins, 10) || 25);
      timerPanel.querySelectorAll('[data-timer-mins]').forEach((b) => b.classList.toggle('active', b === btn));
      const customInp = document.getElementById('mst-timer-custom-mins');
      if (customInp) customInp.value = String(mins);
      timerTotalSec = mins * 60;
      timerRemainSec = mins * 60;
      renderTimerUI();
    });
  });

  document.getElementById('mst-timer-custom-mins')?.addEventListener('change', (e) => {
    const mins = Math.max(1, Math.min(300, parseInt(e.target.value, 10) || 25));
    timerTotalSec = mins * 60;
    timerRemainSec = mins * 60;
    renderTimerUI();
  });

  startBtnEl?.addEventListener('click', () => {
    if (timerRunning) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
      timerRunning = false;
      startBtnEl.textContent = '▶️ 继续断头伴学计时';
      quoteEl.textContent = '⏸️【计时已暂停】：怎么停下来了？我的头还立在桌角看着你呢，别摸鱼太久。';
    } else {
      timerRunning = true;
      startBtnEl.textContent = '⏸️ 暂停计时';
      const posture = document.getElementById('mst-head-posture-select')?.value || 'stare_monitor';
      const headName = triggerMorbidHeadPhysicalReaction(posture);
      quoteEl.textContent = buildMorbidHeadStudyComment(headName, '当前专注刷题任务');
      timerIntervalId = setInterval(stepTimerTick, 1000);
    }
  });

  document.getElementById('mst-timer-reset-btn')?.addEventListener('click', () => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = null;
    timerRunning = false;
    timerRemainSec = timerTotalSec;
    stopwatchSec = 0;
    startBtnEl.textContent = '▶️ 开始断头伴学计时';
    renderTimerUI();
  });

  document.getElementById('mst-timer-wipe-blood-btn')?.addEventListener('click', () => {
    triggerMorbidHeadPhysicalReaction('wipe_clean');
    window.__cervixQA?.showToast?.('🧼 已擦净桌面断头标本的面部与切口渗血');
  });

  document.getElementById('mst-btn-head-nag-now')?.addEventListener('click', () => {
    const posture = document.getElementById('mst-head-posture-select')?.value || 'stare_monitor';
    const headName = triggerMorbidHeadPhysicalReaction(posture);
    quoteEl.textContent = buildMorbidHeadStudyComment(headName, '案头考卷与核心考点');
    playElectroBellChime();
  });

  // WebAudio 40Hz Gamma Binaural + Pink Rain White Noise Synthesizer
  let binauralCtx = null;
  let binauralActive = false;
  document.getElementById('mst-btn-toggle-binaural')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (binauralActive && binauralCtx) {
      try { binauralCtx.close(); } catch (_) {}
      binauralCtx = null;
      binauralActive = false;
      btn.classList.remove('active');
      btn.textContent = '🔊 开启声波';
      return;
    }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      binauralCtx = new Ctx();
      // Left ear 200Hz + Right ear 240Hz = 40Hz Gamma Focus Binaural Beat
      const merger = binauralCtx.createChannelMerger(2);
      const oscL = binauralCtx.createOscillator();
      const oscR = binauralCtx.createOscillator();
      const gainTone = binauralCtx.createGain();
      oscL.frequency.value = 200;
      oscR.frequency.value = 240;
      gainTone.gain.value = 0.035;
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gainTone);
      gainTone.connect(binauralCtx.destination);
      oscL.start();
      oscR.start();

      // Soft warm rain noise buffer
      const bufSize = binauralCtx.sampleRate * 2;
      const noiseBuf = binauralCtx.createBuffer(1, bufSize, binauralCtx.sampleRate);
      const out = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.950 * b2 + white * 0.045;
        out[i] = (b0 + b1 + b2) * 0.12;
      }
      const noiseNode = binauralCtx.createBufferSource();
      noiseNode.buffer = noiseBuf;
      noiseNode.loop = true;
      noiseNode.connect(binauralCtx.destination);
      noiseNode.start();

      binauralActive = true;
      btn.classList.add('active');
      btn.textContent = '🔇 停止声波';
      window.__cervixQA?.showToast?.('🫁 已开启断颈气管插管 · 40Hz 伽马专注脑波与雨夜白噪音');
    } catch (_) {}
  });

  // =========================================================================
  // 🕷️ Targeted Study & Reality-Motivation Web Crawler + Paperweight Ledger + Flashcards
  // =========================================================================
  let currentCrawledCard = CURATED_STUDY_KNOWLEDGE_BANK[0];

  const renderCrawledCard = (card, sourceLabel = '高频考点知识库') => {
    currentCrawledCard = card;
    document.getElementById('mst-crawl-res-tag').textContent = card.tag || '🕷️ 定向学科探针';
    document.getElementById('mst-crawl-res-source').textContent = `来源：${sourceLabel}`;
    document.getElementById('mst-crawl-res-title').textContent = card.title;
    document.getElementById('mst-crawl-res-summary').textContent = card.summary;
    const fEl = document.getElementById('mst-crawl-res-formula');
    if (card.formula) {
      fEl.style.display = 'block';
      fEl.textContent = card.formula;
    } else {
      fEl.style.display = 'none';
    }
    document.getElementById('mst-crawl-res-tip').textContent = `💡 考点点拨：${card.examTip || '建议立即压入死人头镇纸错题本反复默写。'}`;
    const headName = triggerMorbidHeadPhysicalReaction('stare_monitor');
    document.getElementById('mst-crawl-head-motivation').textContent = buildMorbidHeadStudyComment(headName, card.title);
  };
  renderCrawledCard(CURATED_STUDY_KNOWLEDGE_BANK[0], '内置状元高频考点库');

  // Real Live Multi-Source Directional Study Crawler (Wikipedia ZH/EN + DictionaryAPI + Curated Bank)
  const executeDirectionalStudyCrawl = async (rawQuery = '') => {
    const q = String(rawQuery || '').trim();
    const resSourceEl = document.getElementById('mst-crawl-res-source');
    if (resSourceEl) resSourceEl.textContent = '🕷️ 颅腔神经探针正在实时爬取中...';

    // 1. Check if query matches curated bank first or if we should fetch live from Wikipedia / Dictionary API
    if (q) {
      // If pure English word, try Free Dictionary API first
      if (/^[a-zA-Z-]{2,28}$/.test(q)) {
        try {
          const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q.toLowerCase())}`);
          if (resp.ok) {
            const data = await resp.json();
            const entry = data?.[0];
            if (entry) {
              const phonetic = entry.phonetic || (entry.phonetics?.find((p) => p.text)?.text) || '';
              const m0 = entry.meanings?.[0];
              const def0 = m0?.definitions?.[0]?.definition || '';
              const ex0 = m0?.definitions?.[0]?.example || 'Master this academic term before the severed head blinks.';
              renderCrawledCard({
                tag: `🇬🇧 实时英语词典爬虫 (${m0?.partOfSpeech || 'vocab'})`,
                title: `${entry.word} ${phonetic}`,
                summary: `【核心释义】：${def0}`,
                formula: `【学术例句】：${ex0}`,
                examTip: '实时抓取自 DictionaryAPI · 建议穿入断颈钢针闪卡每日抽背！',
              }, 'DictionaryAPI 实时爬虫');
              return;
            }
          }
        } catch (_) {}
      }

      // 2. Try Wikipedia Chinese REST / Search API (`origin=*` CORS enabled)
      try {
        const searchUrl = `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&utf8=&format=json&origin=*&srlimit=1`;
        const sResp = await fetch(searchUrl);
        if (sResp.ok) {
          const sJson = await sResp.json();
          const hit = sJson?.query?.search?.[0];
          if (hit?.title) {
            const sumUrl = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`;
            const sumResp = await fetch(sumUrl);
            if (sumResp.ok) {
              const sumData = await sumResp.json();
              if (sumData?.extract) {
                renderCrawledCard({
                  tag: '🌐 维基百科定向知识爬虫',
                  title: sumData.title || hit.title,
                  summary: sumData.extract,
                  formula: `检索词条：${q}  |  百科分类：${sumData.description || '核心学科概念与词条解析'}`,
                  examTip: '已通过颅腔神经探针从 Wikipedia 实时抓取词条摘要，可一键压入死人头镇纸本！',
                }, 'Wikipedia 实时定向爬虫');
                return;
              }
            }
          }
        }
      } catch (_) {}

      // 3. Fallback to fuzzy match in Curated Knowledge Bank or synthesize targeted study card
      const matched = CURATED_STUDY_KNOWLEDGE_BANK.find(
        (c) => c.title.toLowerCase().includes(q.toLowerCase()) || c.summary.toLowerCase().includes(q.toLowerCase())
      );
      if (matched) {
        renderCrawledCard(matched, '状元高频考点库精准匹配');
        return;
      }
      const fallback = CURATED_STUDY_KNOWLEDGE_BANK[Math.floor(Math.random() * CURATED_STUDY_KNOWLEDGE_BANK.length)];
      renderCrawledCard({
        ...fallback,
        tag: `🕷️ 定向专题：【${q}】关联核心考点`,
        title: `【${q}】专题延伸 · ${fallback.title}`,
      }, '离线高频考点库');
    } else {
      const randomCard = CURATED_STUDY_KNOWLEDGE_BANK[Math.floor(Math.random() * CURATED_STUDY_KNOWLEDGE_BANK.length)];
      renderCrawledCard(randomCard, '状元高频考点库');
    }
  };

  document.getElementById('mst-btn-run-crawler')?.addEventListener('click', () => {
    const q = document.getElementById('mst-crawler-query-input')?.value || '';
    executeDirectionalStudyCrawl(q);
  });
  document.getElementById('mst-crawler-query-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeDirectionalStudyCrawl(e.target.value || '');
    }
  });

  crawlerPanel.querySelectorAll('[data-crawl-subj]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subj = btn.dataset.crawlSubj;
      const subset = CURATED_STUDY_KNOWLEDGE_BANK.filter((c) => c.subject === subj);
      const pick = subset[Math.floor(Math.random() * subset.length)] || CURATED_STUDY_KNOWLEDGE_BANK[0];
      renderCrawledCard(pick, '状元高频学科考点库');
    });
  });

  document.getElementById('mst-btn-crawl-wiki-random')?.addEventListener('click', () => {
    const studyTopics = ['微积分基本定理', '中心极限定理', '傅里叶变换', '二叉树', '动态规划', '凯恩斯主义', '无罪推定原则', '条件反射', '脑神经', '热力学第二定律'];
    const topic = studyTopics[Math.floor(Math.random() * studyTopics.length)];
    const inp = document.getElementById('mst-crawler-query-input');
    if (inp) inp.value = topic;
    executeDirectionalStudyCrawl(topic);
  });

  // Crawler Panel Tabs
  crawlerPanel.querySelectorAll('[data-crawler-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.crawlerTab;
      crawlerPanel.querySelectorAll('[data-crawler-tab]').forEach((b) => b.classList.toggle('active', b === btn));
      document.getElementById('mst-tab-pane-crawler')?.classList.toggle('hidden', tab !== 'crawler');
      document.getElementById('mst-tab-pane-ledger')?.classList.toggle('hidden', tab !== 'ledger');
      document.getElementById('mst-tab-pane-flashcard')?.classList.toggle('hidden', tab !== 'flashcard');
    });
  });

  // =========================================================================
  // ⚖️ 4.5kg 死人头镇纸·错题与考点压卷本 (Paperweight Exam Ledger)
  // =========================================================================
  const loadLedgerItems = () => {
    try {
      const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [
      {
        id: 'init-1',
        title: '等价无穷小替换在加减法中的陷阱（泰勒展开阶数）',
        body: '当两个无穷小相减首项抵消时，必须用泰勒公式展开到首个非零项（如 tan x - sin x = x³/2 + o(x³)）。',
        headName: '方尧平',
        time: '已镇压于C4切口下',
      },
      {
        id: 'init-2',
        title: 'C4 颈椎横断面解剖三大核心管道',
        body: '前方正中为气管软骨环，其后为食管；两侧为颈动脉鞘（颈总动脉、颈内静脉、迷走神经）；后方为颈椎椎体与椎管内脊髓。',
        headName: '林汐',
        time: '已镇压于C4切口下',
      },
    ];
  };

  let ledgerItems = loadLedgerItems();
  const saveLedgerItems = () => {
    try { localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledgerItems)); } catch (_) {}
  };

  const renderLedgerList = () => {
    const listEl = document.getElementById('mst-ledger-list');
    if (!listEl) return;
    listEl.innerHTML = ledgerItems.map((item, idx) => `
      <div style="background:rgba(15,23,42,0.88);border:1px solid rgba(248,113,113,0.35);border-radius:8px;padding:9px 10px;display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
          <span style="font-size:12px;font-weight:700;color:#fef08a;">⚖️ #${idx + 1} ${item.title}</span>
          <span style="font-size:10px;color:#fca5a5;">🩸 被【${item.headName || '方尧平'}】4.5kg断头镇压中</span>
        </div>
        <div class="mst-ledger-answer" data-ledger-ans="${item.id}" style="font-size:11.5px;color:#cbd5e1;line-height:1.45;">${item.body}</div>
        <div style="display:flex;gap:6px;margin-top:2px;">
          <button class="mst-btn" data-quiz-ledger="${item.id}" style="padding:3px 8px;font-size:10.5px;">👁️ 让断头抽考背诵 (遮挡答案)</button>
          <button class="mst-btn" data-del-ledger="${item.id}" style="padding:3px 8px;font-size:10.5px;margin-left:auto;color:#fca5a5;">🗑️ 移除</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-quiz-ledger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.quizLedger;
        const ansEl = listEl.querySelector(`[data-ledger-ans="${id}"]`);
        if (!ansEl) return;
        const isHidden = ansEl.dataset.masked === '1';
        if (isHidden) {
          ansEl.style.filter = 'none';
          ansEl.dataset.masked = '0';
          btn.textContent = '👁️ 让断头抽考背诵 (遮挡答案)';
        } else {
          ansEl.style.filter = 'blur(6px)';
          ansEl.dataset.masked = '1';
          btn.textContent = '🔓 显示答案 (我背完了)';
          const hName = triggerMorbidHeadPhysicalReaction('stare_monitor');
          window.__cervixQA?.showToast?.(`👁️ 【${hName}】的断头正死死盯着你：不许偷看，把压在我脖子底下的这道题完整背出来！`);
        }
      });
    });

    listEl.querySelectorAll('[data-del-ledger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        ledgerItems = ledgerItems.filter((x) => x.id !== btn.dataset.delLedger);
        saveLedgerItems();
        renderLedgerList();
      });
    });
  };
  renderLedgerList();

  document.getElementById('mst-btn-add-ledger-item')?.addEventListener('click', () => {
    const tInp = document.getElementById('mst-ledger-new-title');
    const bInp = document.getElementById('mst-ledger-new-body');
    const title = tInp?.value?.trim();
    const body = bInp?.value?.trim();
    if (!title) {
      window.__cervixQA?.showToast?.('⚠️ 请先输入要压在断头底下的错题或公式标题');
      return;
    }
    const headName = triggerMorbidHeadPhysicalReaction('bleed_hourglass');
    ledgerItems.unshift({
      id: `ledger-${Date.now()}`,
      title,
      body: body || '（待补充详细推导）',
      headName: String(headName).split('·')[0].trim(),
    });
    saveLedgerItems();
    renderLedgerList();
    if (tInp) tInp.value = '';
    if (bInp) bInp.value = '';
    window.__cervixQA?.showToast?.(`⚖️ 已将《${title}》压入【${headName}】4.5kg断头镇纸下！`);
  });

  document.getElementById('mst-btn-spawn-paperweight-3d')?.addEventListener('click', () => {
    placeSelectedStructureOrProp('paperweight_exam_ledger', false);
  });

  document.getElementById('mst-btn-save-to-ledger')?.addEventListener('click', () => {
    const headName = triggerMorbidHeadPhysicalReaction('bleed_hourglass');
    ledgerItems.unshift({
      id: `ledger-${Date.now()}`,
      title: currentCrawledCard.title,
      body: `${currentCrawledCard.summary} ${currentCrawledCard.formula ? ' | ' + currentCrawledCard.formula : ''}`,
      headName: String(headName).split('·')[0].trim(),
    });
    saveLedgerItems();
    renderLedgerList();
    crawlerPanel.querySelector('[data-crawler-tab="ledger"]')?.click();
    window.__cervixQA?.showToast?.(`⚖️ 已将《${currentCrawledCard.title}》压入死人头镇纸错题本！`);
  });

  // =========================================================================
  // 📌 断颈钢针·艾宾浩斯记忆闪卡抽背 (Flashcard Spike Quiz)
  // =========================================================================
  let flashcards = CURATED_STUDY_KNOWLEDGE_BANK.map((c) => ({
    front: `${c.tag} · ${c.title}`,
    back: `${c.summary}\n${c.formula || ''}`,
  }));
  let fcIdx = 0;

  const renderFlashcard = () => {
    const item = flashcards[fcIdx % flashcards.length];
    document.getElementById('mst-fc-counter').textContent = `第 ${(fcIdx % flashcards.length) + 1} / ${flashcards.length} 张`;
    document.getElementById('mst-fc-front').textContent = item.front;
    const backEl = document.getElementById('mst-fc-back');
    backEl.textContent = item.back;
    backEl.classList.add('hidden');
  };
  renderFlashcard();

  const toggleFlipFlashcard = () => {
    document.getElementById('mst-fc-back')?.classList.toggle('hidden');
  };
  document.getElementById('mst-fc-card-box')?.addEventListener('click', toggleFlipFlashcard);
  document.getElementById('mst-fc-btn-flip')?.addEventListener('click', toggleFlipFlashcard);

  document.getElementById('mst-fc-btn-forgot')?.addEventListener('click', () => {
    document.getElementById('mst-fc-back')?.classList.remove('hidden');
    const headName = triggerMorbidHeadPhysicalReaction('electro_shock');
    window.__cervixQA?.showToast?.(`🩸 【${headName}】的断头翻了个白眼，嘴角渗出一丝鲜血：“连这张卡都没背熟？今晚不许睡，再背三遍！”`);
  });

  document.getElementById('mst-fc-btn-knew')?.addEventListener('click', () => {
    fcIdx = (fcIdx + 1) % flashcards.length;
    renderFlashcard();
    const headName = triggerMorbidHeadPhysicalReaction('obedient_bow');
    window.__cervixQA?.showToast?.(`✅ 【${headName}】的断头乖巧垂眸致敬：“背得很准，继续下一张断颈血签！”`);
  });

  document.getElementById('mst-btn-save-to-flashcard')?.addEventListener('click', () => {
    flashcards.unshift({
      front: `${currentCrawledCard.tag} · ${currentCrawledCard.title}`,
      back: `${currentCrawledCard.summary}\n${currentCrawledCard.formula || ''}`,
    });
    fcIdx = 0;
    renderFlashcard();
    crawlerPanel.querySelector('[data-crawler-tab="flashcard"]')?.click();
    window.__cervixQA?.showToast?.(`📌 已将《${currentCrawledCard.title}》穿入断颈钢针闪卡库！`);
  });

  document.getElementById('mst-btn-start-pomo-with-topic')?.addEventListener('click', () => {
    timerPanel.classList.remove('hidden');
    phaseBadgeEl.textContent = `🩸 当前死磕考点：${currentCrawledCard.title.slice(0, 22)}`;
    if (!timerRunning) {
      startBtnEl?.click();
    }
  });

  // Expose helper to open the Architecture & Morbid Props Selector Modal from anywhere
  window.__openArchPropSelectorModal = () => {
    archModal.classList.toggle('hidden');
  };
  window.__openMorbidTimerPanel = () => {
    timerPanel.classList.remove('hidden');
  };
  window.__openMorbidCrawlerPanel = () => {
    crawlerPanel.classList.remove('hidden');
  };
}
