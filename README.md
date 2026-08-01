# 오늘의 운세 (Daily Fortune)

버튼을 누르면 카드가 뒤집히며 랜덤 운세와 행운의 아이템을 보여주는 Next.js 웹앱.

## 기능

- 🃏 **3D 카드 플립** — 순수 CSS `rotateY` 트랜지션 (외부 애니메이션 라이브러리 없음)
- 🔮 **랜덤 운세** — 등급 · 메시지 · 조언 (10종)
- 🍀 **행운의 요소** — 행운의 아이템(12종), 행운의 색(스와치 포함), 행운의 숫자(1~45)
- 🔄 **다시 뽑기** — 카드를 다시 접었다 펴며 새 운세로 재생
- 📱 모바일 반응형, 한국어 날짜 표시

## 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## 빌드

```bash
npm run build
npm start
```

## 기술 스택

- Next.js 16 (App Router)
- React 19
- CSS Modules

## 구조

```
app/
├─ layout.js        # 루트 레이아웃 · 메타데이터
├─ page.js          # 카드 UI · 플립 로직 (클라이언트 컴포넌트)
├─ fortunes.js      # 운세 / 아이템 / 색 데이터
├─ page.module.css  # 3D 플립 스타일
└─ globals.css      # 전역 스타일 · 배경
```
