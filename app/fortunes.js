// 운세 데이터: 종합운, 행운의 아이템, 행운의 색, 행운의 숫자
export const fortunes = [
  {
    grade: "대길 🌟",
    message: "오늘은 모든 일이 술술 풀리는 날입니다. 미뤄왔던 일에 과감히 도전해 보세요.",
    item: "빨간 볼펜",
    color: "레드",
    number: 7,
  },
  {
    grade: "행운 🍀",
    message: "예상치 못한 곳에서 좋은 소식이 찾아옵니다. 주변 사람에게 먼저 안부를 전해보세요.",
    item: "손수건",
    color: "그린",
    number: 3,
  },
  {
    grade: "안정 🌿",
    message: "차분하게 하루를 보내기 좋은 날. 무리하지 말고 페이스를 지키면 만족스러운 결과가 있습니다.",
    item: "따뜻한 차",
    color: "브라운",
    number: 5,
  },
  {
    grade: "재물운 💰",
    message: "작은 지출도 큰 흐름을 만듭니다. 오늘의 현명한 선택이 훗날 이득으로 돌아옵니다.",
    item: "동전 지갑",
    color: "골드",
    number: 8,
  },
  {
    grade: "인연 💞",
    message: "새로운 만남 혹은 오래된 인연이 다시 이어질 수 있습니다. 마음을 열어두세요.",
    item: "향수",
    color: "핑크",
    number: 2,
  },
  {
    grade: "도전 🔥",
    message: "망설이던 일을 시작하기에 완벽한 타이밍. 자신감을 가지면 길이 보입니다.",
    item: "운동화",
    color: "오렌지",
    number: 9,
  },
  {
    grade: "휴식 🌙",
    message: "오늘은 잠시 쉬어가도 좋은 날. 나를 위한 시간을 가지면 내일의 에너지가 채워집니다.",
    item: "아로마 캔들",
    color: "라벤더",
    number: 4,
  },
  {
    grade: "성취 🏆",
    message: "노력한 만큼 결실을 맺는 하루. 마무리에 집중하면 기대 이상의 성과를 얻습니다.",
    item: "다이어리",
    color: "네이비",
    number: 1,
  },
  {
    grade: "창의 🎨",
    message: "번뜩이는 아이디어가 떠오르는 날. 떠오른 생각은 바로 메모해 두세요.",
    item: "노트",
    color: "옐로우",
    number: 6,
  },
  {
    grade: "건강 🌈",
    message: "몸과 마음의 균형이 좋은 날. 가벼운 산책이 행운을 부릅니다.",
    item: "텀블러",
    color: "스카이블루",
    number: 10,
  },
];

export function getRandomFortune() {
  return fortunes[Math.floor(Math.random() * fortunes.length)];
}
