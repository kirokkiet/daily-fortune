// 운세 목록: 등급, 메시지, 조언
export const FORTUNES = [
  { grade: "대길", emoji: "🌟", message: "막혔던 일이 시원하게 풀리는 날. 자신감을 가지고 밀어붙이세요.", advice: "망설이던 일을 오늘 시작하면 좋은 결과가 따라옵니다." },
  { grade: "대길", emoji: "🍀", message: "뜻밖의 행운이 찾아옵니다. 주변의 작은 신호를 놓치지 마세요.", advice: "먼저 연락하는 사람에게 기회가 열립니다." },
  { grade: "길", emoji: "☀️", message: "꾸준함이 빛을 발하는 하루. 평소의 노력이 인정받습니다.", advice: "서두르기보다 하나씩 차분히 마무리하세요." },
  { grade: "길", emoji: "🌈", message: "인간관계에서 기분 좋은 소식이 들려옵니다.", advice: "감사의 말을 아끼지 마세요. 두 배로 돌아옵니다." },
  { grade: "중길", emoji: "🌤️", message: "무난하지만 알찬 하루. 작은 성취가 쌓입니다.", advice: "완벽보다 완성을 목표로 삼으세요." },
  { grade: "중길", emoji: "🎈", message: "새로운 아이디어가 떠오르는 날. 메모해 두면 쓸모가 큽니다.", advice: "즉흥적인 만남이 영감을 줍니다." },
  { grade: "평", emoji: "🍃", message: "잔잔한 하루. 무리하지 않는 것이 곧 이득입니다.", advice: "휴식도 훌륭한 투자입니다. 자신을 돌보세요." },
  { grade: "평", emoji: "⛅", message: "속도를 늦추면 보이지 않던 것이 보입니다.", advice: "결정을 미뤄도 좋은 날. 정보를 더 모으세요." },
  { grade: "주의", emoji: "🌂", message: "사소한 실수에 주의가 필요한 날. 확인이 곧 안전입니다.", advice: "중요한 약속은 한 번 더 점검하세요." },
  { grade: "주의", emoji: "🧭", message: "감정보다 이성이 이기는 하루로 만드세요.", advice: "말을 아끼면 오해도 줄어듭니다." },
];

// 행운의 아이템
export const LUCKY_ITEMS = [
  { name: "파란색 볼펜", emoji: "🖊️" },
  { name: "따뜻한 커피 한 잔", emoji: "☕" },
  { name: "작은 화분", emoji: "🪴" },
  { name: "손목시계", emoji: "⌚" },
  { name: "빨간 양말", emoji: "🧦" },
  { name: "귀여운 열쇠고리", emoji: "🔑" },
  { name: "노란 우산", emoji: "☂️" },
  { name: "향기로운 캔들", emoji: "🕯️" },
  { name: "초콜릿", emoji: "🍫" },
  { name: "동전 지갑", emoji: "👛" },
  { name: "미니 노트", emoji: "📒" },
  { name: "은반지", emoji: "💍" },
];

// 행운의 색
export const LUCKY_COLORS = [
  { name: "산호빛 코랄", hex: "#ff7a6b" },
  { name: "청량한 민트", hex: "#4fd1c5" },
  { name: "햇살 옐로", hex: "#ffd24c" },
  { name: "라벤더 퍼플", hex: "#a78bfa" },
  { name: "포레스트 그린", hex: "#34c77f" },
  { name: "스카이 블루", hex: "#5aa9ff" },
  { name: "로즈 핑크", hex: "#ff8fb1" },
];

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function luckyNumber() {
  return Math.floor(Math.random() * 45) + 1; // 1~45
}
