// 사주·명리학(오행) 기반 결정론적 운세 엔진
// - 본인: 생년의 년간(천간) → 오행, 년지 → 띠  (계산이 명확하고 정확)
// - 오늘: 오늘 날짜의 일진(干支) → 오행
// - 십신 관계(비겁/식상/재성/관성/인성)로 5개 항목 점수를 산출
// 같은 생년월일 + 같은 날짜면 항상 같은 결과(결정론적).

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const ZODIAC = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const ZODIAC_EMOJI = ["🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐵", "🐔", "🐶", "🐷"];

// 천간 오행: 갑을=목, 병정=화, 무기=토, 경신=금, 임계=수
const STEM_ELEMENT = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
// 지지 오행: 자축인묘진사오미신유술해
const BRANCH_ELEMENT = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];

const ELEMENT_EMOJI = { 목: "🌳", 화: "🔥", 토: "⛰️", 금: "⚙️", 수: "💧" };
const ELEMENT_HEX = { 목: "#34c77f", 화: "#ff7a6b", 토: "#d9a441", 금: "#b9c0cc", 수: "#5aa9ff" };
const ELEMENT_COLORNAME = { 목: "초록", 화: "빨강", 토: "노랑", 금: "흰색·은색", 수: "검정·파랑" };
const ELEMENT_DIRECTION = { 목: "동쪽", 화: "남쪽", 토: "중앙", 금: "서쪽", 수: "북쪽" };
const ELEMENT_NUMBERS = { 목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6] };

// 오행 상생(a生b) / 상극(a克b)
const GEN = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
const OVC = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };
// 나를 生하는 오행(인성 방향)
const GEN_BY = { 화: "목", 토: "화", 금: "토", 수: "금", 목: "수" };

// 지지 육합 / 삼합 / 충 (띠 궁합용)
const YUKHAP = { 자: "축", 축: "자", 인: "해", 해: "인", 묘: "술", 술: "묘", 진: "유", 유: "진", 사: "신", 신: "사", 오: "미", 미: "오" };
const CHUNG = { 자: "오", 오: "자", 축: "미", 미: "축", 인: "신", 신: "인", 묘: "유", 유: "묘", 진: "술", 술: "진", 사: "해", 해: "사" };

// --- 날짜 → 율리우스일수(정수) ---
function toJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

// 오늘(임의 날짜)의 일진 干支 → 오행
// 기준: 1984-02-02 = 갑자일 (널리 인용되는 갑자 기준일). 필요 시 anchor 보정 가능.
function dayGanzhi(y, m, d) {
  const jdn = toJDN(y, m, d);
  const gz = ((jdn - 13) % 60 + 60) % 60; // 0 = 갑자
  const stemIdx = gz % 10;
  const branchIdx = gz % 12;
  return {
    stem: STEMS[stemIdx],
    branch: BRANCHES[branchIdx],
    element: STEM_ELEMENT[stemIdx],
    branchName: BRANCHES[branchIdx],
  };
}

function yearPillar(y) {
  const stemIdx = ((y - 4) % 10 + 10) % 10;
  const branchIdx = ((y - 4) % 12 + 12) % 12;
  return {
    stem: STEMS[stemIdx],
    branch: BRANCHES[branchIdx],
    element: STEM_ELEMENT[stemIdx],
    zodiac: ZODIAC[branchIdx],
    zodiacEmoji: ZODIAC_EMOJI[branchIdx],
  };
}

// 십신 관계 (나 기준으로 상대 오행이 무엇인가)
function relation(me, other) {
  if (me === other) return "비겁";
  if (GEN[other] === me) return "인성"; // 상대가 나를 생함
  if (GEN[me] === other) return "식상"; // 내가 상대를 생함
  if (OVC[me] === other) return "재성"; // 내가 상대를 극함
  if (OVC[other] === me) return "관성"; // 상대가 나를 극함
  return "비겁";
}

const RELATION_LABEL = {
  비겁: "비겁(比劫) · 경쟁과 동료의 기운",
  식상: "식상(食傷) · 표현과 재능의 기운",
  재성: "재성(財星) · 재물의 기운",
  관성: "관성(官星) · 명예와 책임의 기운",
  인성: "인성(印星) · 귀인과 보호의 기운",
};

// 관계별 기본 점수 [총운, 애정, 금전, 직장, 건강]
const BASE = {
  인성: { 총운: 84, 애정: 66, 금전: 60, 직장: 78, 건강: 80 },
  비겁: { 총운: 62, 애정: 60, 금전: 48, 직장: 61, 건강: 74 },
  식상: { 총운: 71, 애정: 85, 금전: 63, 직장: 56, 건강: 67 },
  재성: { 총운: 76, 애정: 74, 금전: 89, 직장: 64, 건강: 58 },
  관성: { 총운: 65, 애정: 71, 금전: 61, 직장: 87, 건강: 55 },
};

const COMMENTS = {
  총운: {
    high: ["기운이 크게 트이는 날. 미뤄둔 일을 과감히 밀어붙이세요.", "귀인의 도움으로 흐름이 순조롭습니다. 자신감을 가지세요."],
    mid: ["무난하지만 알찬 하루. 기본에 충실하면 손해가 없습니다.", "큰 굴곡 없이 흘러갑니다. 페이스를 유지하세요."],
    low: ["기운이 다소 눌리는 날. 무리한 결정은 미루는 게 좋습니다.", "속도를 늦추고 안전하게. 오늘은 지키는 하루로 삼으세요."],
  },
  애정: {
    high: ["매력이 빛나는 날. 먼저 다가가면 좋은 반응이 옵니다.", "인연의 기운이 강합니다. 솔직한 표현이 통합니다."],
    mid: ["잔잔한 애정운. 익숙한 사이일수록 작은 배려가 힘이 됩니다.", "무난한 흐름. 서두르지 말고 자연스럽게 다가가세요."],
    low: ["감정의 엇갈림에 주의. 말보다 듣기를 택하세요.", "오해가 생기기 쉬운 날. 오늘은 한 발 물러서는 지혜를."],
  },
  금전: {
    high: ["재물운이 활짝. 뜻밖의 수입이나 좋은 기회가 있습니다.", "돈의 흐름이 좋습니다. 다만 과욕은 금물."],
    mid: ["평범한 금전운. 계획한 지출은 무리 없이 소화됩니다.", "무난한 재정. 충동구매만 조심하면 됩니다."],
    low: ["지출이 새기 쉬운 날. 큰 결제는 다음으로 미루세요.", "재물의 기운이 약합니다. 오늘은 아끼는 게 버는 것."],
  },
  직장: {
    high: ["능력을 인정받는 날. 중요한 자리에서 좋은 평가가 따릅니다.", "책임이 곧 기회로 이어집니다. 적극적으로 나서세요."],
    mid: ["안정적인 업무운. 맡은 일을 차분히 마무리하세요.", "큰 변화 없이 순항. 협업에서 실마리가 보입니다."],
    low: ["압박이 느껴지는 날. 완벽보다 완성을 목표로.", "실수에 주의가 필요합니다. 한 번 더 점검하세요."],
  },
  건강: {
    high: ["몸과 마음이 가벼운 날. 활동적으로 보내기 좋습니다.", "컨디션이 좋습니다. 좋은 습관을 하나 시작해 보세요."],
    mid: ["무난한 컨디션. 규칙적인 리듬을 지키면 충분합니다.", "큰 이상 없는 하루. 가벼운 스트레칭을 곁들이세요."],
    low: ["피로가 쌓이기 쉬운 날. 휴식을 우선하세요.", "무리는 금물. 따뜻한 물과 충분한 잠이 보약입니다."],
  },
};

function tier(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}

// 결정론적 0..1 난수 (문자열 시드)
function rand01(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  h += h << 5;
  return ((h >>> 0) % 100000) / 100000;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function pickComment(cat, score, seed) {
  const bank = COMMENTS[cat][tier(score)];
  return bank[Math.floor(rand01(seed + "|" + cat + "|c") * bank.length) % bank.length];
}

// 메인: 생년월일(Y-M-D) + 이름 + 오늘 날짜 → 리포트
export function analyze(birthStr, todayDate) {
  const [by, bm, bd] = birthStr.split("-").map((v) => parseInt(v, 10));
  const ty = todayDate.getFullYear();
  const tm = todayDate.getMonth() + 1;
  const td = todayDate.getDate();

  const yp = yearPillar(by);
  const self = yp.element; // 본인 오행 (년간)
  const day = dayGanzhi(ty, tm, td);
  const todayEl = day.element;

  const rel = relation(self, todayEl);
  const base = BASE[rel];
  const seed = `${by}-${bm}-${bd}|${ty}-${tm}-${td}`;

  // 띠 궁합(오늘 지지 vs 본인 띠 지지)
  const myBranch = yp.branch;
  const dayBranch = day.branchName;
  let harmony = 0;
  let harmonyLabel = "";
  if (YUKHAP[myBranch] === dayBranch) {
    harmony = 8;
    harmonyLabel = "오늘은 내 띠와 육합(六合) — 관계·인연에 순풍";
  } else if (CHUNG[myBranch] === dayBranch) {
    harmony = -8;
    harmonyLabel = "오늘은 내 띠와 충(沖) — 감정·관계에 약간의 파동";
  }

  const favorable = GEN_BY[self]; // 나를 생하는 오행(용신 성격)

  function scoreOf(cat) {
    let s = base[cat];
    s += (rand01(seed + "|" + cat) - 0.5) * 22; // ±11 결정론적 변동
    if (cat === "애정" || cat === "총운") s += harmony;
    if (todayEl === favorable) {
      if (cat === "총운") s += 6;
      if (cat === "건강") s += 5;
    }
    return Math.round(clamp(s, 5, 99));
  }

  const love = scoreOf("애정");
  const money = scoreOf("금전");
  const work = scoreOf("직장");
  const health = scoreOf("건강");
  // 총운은 4개 항목과 관계 기본치를 절반씩 반영해 일관성 유지
  const overallRaw = 0.5 * ((love + money + work + health) / 4) + 0.5 * scoreOf("총운");
  const overall = Math.round(clamp(overallRaw, 5, 99));

  const categories = [
    { key: "총운", label: "총운", emoji: "🎯", score: overall, comment: pickComment("총운", overall, seed) },
    { key: "애정", label: "애정운", emoji: "💕", score: love, comment: pickComment("애정", love, seed) },
    { key: "금전", label: "금전운", emoji: "💰", score: money, comment: pickComment("금전", money, seed) },
    { key: "직장", label: "직장운", emoji: "💼", score: work, comment: pickComment("직장", work, seed) },
    { key: "건강", label: "건강운", emoji: "🌿", score: health, comment: pickComment("건강", health, seed) },
  ];

  // 행운 요소 (본인에게 이로운 오행 = favorable 기준)
  const luckyNums = ELEMENT_NUMBERS[favorable];
  const luckyNumber = luckyNums[Math.floor(rand01(seed + "|num") * luckyNums.length) % luckyNums.length];

  return {
    birth: { y: by, m: bm, d: bd },
    today: { y: ty, m: tm, d: td },
    zodiac: yp.zodiac,
    zodiacEmoji: yp.zodiacEmoji,
    selfElement: self,
    selfElementEmoji: ELEMENT_EMOJI[self],
    yearStem: yp.stem,
    yearBranch: yp.branch,
    todayElement: todayEl,
    todayElementEmoji: ELEMENT_EMOJI[todayEl],
    relation: rel,
    relationLabel: RELATION_LABEL[rel],
    harmonyLabel,
    overall,
    categories,
    lucky: {
      element: favorable,
      colorName: ELEMENT_COLORNAME[favorable],
      colorHex: ELEMENT_HEX[favorable],
      direction: ELEMENT_DIRECTION[favorable],
      number: luckyNumber,
    },
  };
}

// 별점(1~5, 0.5 단위)
export function toStars(score) {
  return Math.round((score / 100) * 10) / 2; // 0~5, 0.5 단위
}

// DB 저장용 요약 텍스트
export function summaryText(r) {
  const c = r.categories;
  const line = c.map((x) => `${x.label} ${x.score}`).join(" · ");
  return (
    `[사주운세] ${r.zodiacEmoji}${r.zodiac}띠·${r.selfElement}(오행) | ` +
    `${line} | 오늘의 기운: ${r.todayElement}(${r.relation}) | ` +
    `행운색 ${r.lucky.colorName}·숫자 ${r.lucky.number}·방향 ${r.lucky.direction}`
  );
}
