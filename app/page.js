"use client";

import { useEffect, useState } from "react";
import { getRandomFortune } from "./fortunes";
import styles from "./page.module.css";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [fortune, setFortune] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [today, setToday] = useState("");

  // 하이드레이션 불일치 방지를 위해 마운트 후 날짜 계산
  useEffect(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setToday(`${yyyy}. ${mm}. ${dd} ${DAYS[d.getDay()]}요일`);
  }, []);

  const handleDraw = () => {
    if (revealing) return; // 연출 중 중복 클릭 방지

    // 1) 화이트아웃 시작 → 흰 빛이 화면을 덮음
    setRevealing(true);
    // 2) 흰 화면 뒤에서 카드를 뒤집고 새 운세를 세팅
    setFortune(getRandomFortune());
    setFlipped(true);
    // 3) 연출 종료(화이트아웃 애니메이션 총 길이와 동기화)
    setTimeout(() => setRevealing(false), 1600);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <span className={styles.date}>{today || " "}</span>
        <h1 className={styles.title}>오늘의 운세</h1>
        <p className={styles.subtitle}>카드를 열어 오늘의 흐름을 확인하세요</p>
      </header>

      <div className={styles.scene}>
        <div className={`${styles.card} ${flipped ? styles.isFlipped : ""}`}>
          {/* 앞면 */}
          <div className={styles.cardFace}>
            <div className={styles.mark}>?</div>
            <span className={styles.frontLabel}>TODAY&apos;S FORTUNE</span>
            <span className={styles.frontHint}>버튼을 눌러 카드를 여세요</span>
          </div>

          {/* 뒷면 */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            {fortune && (
              <>
                <div className={styles.gradeRow}>
                  <span className={styles.gradeEmoji}>{fortune.emoji}</span>
                  <span className={styles.grade}>{fortune.grade}</span>
                </div>

                <div className={styles.scoreBlock}>
                  <div className={styles.scoreNumber}>
                    {fortune.score}
                    <span className={styles.scoreMax}>/100</span>
                  </div>
                  <div className={styles.scoreBarTrack}>
                    <div
                      className={styles.scoreBarFill}
                      style={{ width: `${fortune.score}%` }}
                    />
                  </div>
                  <span className={styles.scoreCaption}>오늘의 운세 지수</span>
                </div>

                <p className={styles.message}>{fortune.message}</p>

                <div className={styles.lucky}>
                  <div className={styles.luckyRow}>
                    <span className={styles.luckyLabel}>행운의 아이템</span>
                    <span className={styles.luckyValue}>{fortune.item}</span>
                  </div>
                  <div className={styles.luckyRow}>
                    <span className={styles.luckyLabel}>행운의 색</span>
                    <span className={styles.luckyValue}>{fortune.color}</span>
                  </div>
                  <div className={styles.luckyRow}>
                    <span className={styles.luckyLabel}>행운의 숫자</span>
                    <span className={styles.luckyValue}>{fortune.number}</span>
                  </div>
                  <div className={styles.luckyRow}>
                    <span className={styles.luckyLabel}>행운의 노래</span>
                    <span className={styles.luckyValue}>
                      {fortune.song.title}
                      <span className={styles.songArtist}>{fortune.song.artist}</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button className={styles.button} onClick={handleDraw} disabled={revealing}>
        {flipped ? "다시 뽑기" : "운세 뽑기"}
      </button>

      {/* 화이트아웃 연출 오버레이 */}
      {revealing && <div className={styles.whiteout} aria-hidden="true" />}
    </main>
  );
}
