"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { FORTUNES, LUCKY_ITEMS, LUCKY_COLORS, pick, luckyNumber } from "./fortunes";

const STORAGE_KEY = "fortune-history";
const MAX_RECORDS = 100;

function drawFortune() {
  return {
    fortune: pick(FORTUNES),
    item: pick(LUCKY_ITEMS),
    color: pick(LUCKY_COLORS),
    number: luckyNumber(),
  };
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // 첫 렌더 이후 브라우저에서 저장된 기록을 불러온다 (SSR/hydration 안전)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // 저장소 접근 불가 시 무시
    }
  }, []);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 운세를 뽑고, 결과 표시 + 기록 저장을 한 번에 처리
  function commitDraw() {
    const drawn = drawFortune();
    setResult(drawn);
    setFlipped(true);

    const record = {
      time: new Date().toISOString(),
      grade: drawn.fortune.grade,
      emoji: drawn.fortune.emoji,
      item: `${drawn.item.emoji} ${drawn.item.name}`,
      colorName: drawn.color.name,
      colorHex: drawn.color.hex,
      number: drawn.number,
    };

    setHistory((prev) => {
      const next = [record, ...prev].slice(0, MAX_RECORDS); // 최신순, 최대 100건
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 저장 실패 시 무시
      }
      return next;
    });
  }

  function handleDraw() {
    // 카드를 먼저 앞면으로 되돌린 뒤 새 결과로 다시 뒤집어 애니메이션이 반복되게 함
    if (flipped) {
      setFlipped(false);
      setTimeout(commitDraw, 450);
    } else {
      commitDraw();
    }
  }

  function handleClearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
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

      {/* 내 운세 기록 */}
      <section className={styles.historySection}>
        <div className={styles.historyHead}>
          <h2 className={styles.historyTitle}>내 운세 기록</h2>
          {history.length > 0 && (
            <button className={styles.clearButton} onClick={handleClearHistory}>
              기록 지우기
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className={styles.empty}>아직 뽑은 운세가 없어요. 카드를 뒤집어 보세요! ✨</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>뽑은 시각</th>
                  <th>운세</th>
                  <th>행운의 아이템</th>
                  <th>색</th>
                  <th>숫자</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={row.time + "-" + i}>
                    <td className={styles.timeCell}>{formatTime(row.time)}</td>
                    <td>
                      <span className={styles.gradeCell}>
                        {row.emoji} {row.grade}
                      </span>
                    </td>
                    <td>{row.item}</td>
                    <td>
                      <span className={styles.colorCell}>
                        <span
                          className={styles.swatchSmall}
                          style={{ background: row.colorHex }}
                        />
                        {row.colorName}
                      </span>
                    </td>
                    <td className={styles.numberCell}>{row.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        재미로 보는 오늘의 운세 · 좋은 하루 되세요 🙂
      </footer>
    </main>
  );
}
