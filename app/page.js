"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { FORTUNES, LUCKY_ITEMS, LUCKY_COLORS, pick, luckyNumber } from "./fortunes";

function drawFortune() {
  return {
    fortune: pick(FORTUNES),
    item: pick(LUCKY_ITEMS),
    color: pick(LUCKY_COLORS),
    number: luckyNumber(),
  };
}

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState(null);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  function handleDraw() {
    // 카드를 먼저 앞면으로 되돌린 뒤 새 결과로 다시 뒤집어 애니메이션이 반복되게 함
    if (flipped) {
      setFlipped(false);
      setTimeout(() => {
        setResult(drawFortune());
        setFlipped(true);
      }, 450);
    } else {
      setResult(drawFortune());
      setFlipped(true);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <p className={styles.date}>{today}</p>
        <h1 className={styles.title}>오늘의 운세</h1>
        <p className={styles.subtitle}>카드를 뒤집어 당신의 하루를 확인하세요</p>
      </div>

      <div className={styles.scene}>
        <div className={`${styles.card} ${flipped ? styles.isFlipped : ""}`}>
          {/* 카드 뒷면 (초기 화면) */}
          <div className={styles.cardFace + " " + styles.cardBack}>
            <div className={styles.backInner}>
              <span className={styles.backGlyph}>✦</span>
              <span className={styles.backText}>FORTUNE</span>
              <span className={styles.backGlyph}>✦</span>
            </div>
          </div>

          {/* 카드 앞면 (운세 결과) */}
          <div className={styles.cardFace + " " + styles.cardFront}>
            {result && (
              <div className={styles.resultInner}>
                <div className={styles.gradeRow}>
                  <span className={styles.emoji}>{result.fortune.emoji}</span>
                  <span className={styles.grade}>{result.fortune.grade}</span>
                </div>
                <p className={styles.message}>{result.fortune.message}</p>
                <p className={styles.advice}>“{result.fortune.advice}”</p>

                <div className={styles.luckyGrid}>
                  <div className={styles.luckyBox}>
                    <span className={styles.luckyLabel}>행운의 아이템</span>
                    <span className={styles.luckyValue}>
                      {result.item.emoji} {result.item.name}
                    </span>
                  </div>
                  <div className={styles.luckyBox}>
                    <span className={styles.luckyLabel}>행운의 색</span>
                    <span className={styles.luckyValue}>
                      <span
                        className={styles.swatch}
                        style={{ background: result.color.hex }}
                      />
                      {result.color.name}
                    </span>
                  </div>
                  <div className={styles.luckyBox}>
                    <span className={styles.luckyLabel}>행운의 숫자</span>
                    <span className={styles.luckyValue}>🎯 {result.number}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className={styles.button} onClick={handleDraw}>
        {flipped ? "다시 뽑기 🔄" : "운세 뽑기 ✨"}
      </button>

      <footer className={styles.footer}>
        재미로 보는 오늘의 운세 · 좋은 하루 되세요 🙂
      </footer>
    </main>
  );
}
