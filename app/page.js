"use client";

import { useState } from "react";
import { getRandomFortune } from "./fortunes";
import styles from "./page.module.css";

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [fortune, setFortune] = useState(null);

  const handleDraw = () => {
    if (flipped) {
      // 다시 뽑기: 카드를 앞면으로 되돌린 뒤 새 운세로 뒤집기
      setFlipped(false);
      setTimeout(() => {
        setFortune(getRandomFortune());
        setFlipped(true);
      }, 400);
    } else {
      setFortune(getRandomFortune());
      setFlipped(true);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.stars} aria-hidden="true" />

      <h1 className={styles.title}>오늘의 운세</h1>
      <p className={styles.subtitle}>카드를 뒤집어 오늘의 기운을 확인하세요 ✨</p>

      <div className={styles.scene}>
        <div className={`${styles.card} ${flipped ? styles.isFlipped : ""}`}>
          {/* 카드 앞면 */}
          <div className={styles.cardFace}>
            <span className={styles.cardEmoji}>🔮</span>
            <span className={styles.cardHint}>운세 카드</span>
          </div>

          {/* 카드 뒷면 */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            {fortune && (
              <>
                <span className={styles.grade}>{fortune.grade}</span>
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button className={styles.button} onClick={handleDraw}>
        {flipped ? "다시 뽑기 🔁" : "운세 뽑기 🎴"}
      </button>
    </main>
  );
}
