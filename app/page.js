"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { FORTUNES, LUCKY_ITEMS, LUCKY_COLORS, pick, luckyNumber } from "./fortunes";

const STORAGE_KEY = "fortune-history";
const NAME_KEY = "fortune-name";
const MAX_RECORDS = 100;

function drawFortune() {
  return {
    fortune: pick(FORTUNES),
    item: pick(LUCKY_ITEMS),
    color: pick(LUCKY_COLORS),
    number: luckyNumber(),
  };
}

// 저장되는 "운세 내용" 문자열 (등급 + 메시지 + 행운 요소)
function buildContent(drawn) {
  return (
    `${drawn.fortune.grade} · ${drawn.fortune.message} ` +
    `(행운의 아이템: ${drawn.item.name}, 색: ${drawn.color.name}, 숫자: ${drawn.number})`
  );
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
  const [name, setName] = useState("");
  // 동기화 상태: "checking" | "cloud"(Supabase) | "local"(브라우저 저장)
  const [syncState, setSyncState] = useState("checking");

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 마운트 후 이름/로컬 캐시 로드 + Supabase 동기화 (SSR/hydration 안전)
  useEffect(() => {
    let savedName = "";
    try {
      savedName = localStorage.getItem(NAME_KEY) || "";
    } catch {}
    setName(savedName);

    // 1) 로컬 캐시 먼저 표시
    let local = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) local = JSON.parse(saved);
    } catch {}
    setHistory(local);

    // 2) Supabase에서 기록 로드
    loadHistory(savedName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Supabase에서 기록을 불러온다 (이름이 있으면 그 이름으로 필터)
  function loadHistory(forName) {
    const qs = forName && forName.trim() ? `?name=${encodeURIComponent(forName.trim())}` : "";
    fetch(`/api/fortunes${qs}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.configured) {
          setSyncState("cloud");
          const cloud = Array.isArray(data.records) ? data.records : [];
          setHistory(cloud);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud));
          } catch {}
        } else {
          setSyncState("local");
        }
      })
      .catch(() => setSyncState("local"));
  }

  function handleNameChange(e) {
    const v = e.target.value;
    setName(v);
    try {
      localStorage.setItem(NAME_KEY, v);
    } catch {}
  }

  // 운세를 뽑고, 카드 표시 + 자동 저장(날짜/이름/운세 내용)
  function commitDraw() {
    const drawn = drawFortune();
    setResult(drawn);
    setFlipped(true);

    const displayName = name.trim() ? name.trim() : "익명";
    const content = buildContent(drawn);
    const record = {
      time: new Date().toISOString(),
      name: displayName,
      content,
    };

    // 로컬에 즉시 저장(오프라인/폴백 대응)
    setHistory((prev) => {
      const next = [record, ...prev].slice(0, MAX_RECORDS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Supabase에 자동 저장
    fetch("/api/fortunes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), content }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.configured) {
          setSyncState("cloud");
          // 저장 후 서버 기준으로 목록 새로고침(정확한 시각/정렬 반영)
          loadHistory(name);
        }
      })
      .catch(() => {
        // 네트워크 오류 시 로컬 기록은 이미 반영됨
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
    } catch {}
    // Supabase에서 현재 이름의 기록 삭제
    if (name.trim()) {
      fetch(`/api/fortunes?name=${encodeURIComponent(name.trim())}`, {
        method: "DELETE",
      })
        .then(() => loadHistory(name))
        .catch(() => {});
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

      <div className={styles.controls}>
        <input
          className={styles.nameInput}
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={() => loadHistory(name)}
          placeholder="이름을 입력하세요 (선택)"
          maxLength={20}
          aria-label="이름"
        />
        <button className={styles.button} onClick={handleDraw}>
          {flipped ? "다시 뽑기 🔄" : "운세 뽑기 ✨"}
        </button>
      </div>

      {/* 운세 기록 */}
      <section className={styles.historySection}>
        <div className={styles.historyHead}>
          <div className={styles.historyTitleWrap}>
            <h2 className={styles.historyTitle}>
              {name.trim() ? `${name.trim()}님의 운세 기록` : "운세 기록"}
            </h2>
            <span
              className={`${styles.syncBadge} ${
                syncState === "cloud" ? styles.syncCloud : ""
              }`}
              title={
                syncState === "cloud"
                  ? "Supabase에 자동 저장됩니다"
                  : "이 브라우저에만 저장됩니다"
              }
            >
              {syncState === "checking"
                ? "동기화 확인 중…"
                : syncState === "cloud"
                ? "☁️ Supabase 자동 저장"
                : "💾 브라우저 저장"}
            </span>
          </div>
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
                  <th>날짜</th>
                  <th>이름</th>
                  <th>운세 내용</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={row.time + "-" + i}>
                    <td className={styles.timeCell}>{formatTime(row.time)}</td>
                    <td className={styles.nameCell}>{row.name || "익명"}</td>
                    <td className={styles.contentCell}>{row.content}</td>
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
