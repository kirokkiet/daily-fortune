"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { analyze, summaryText } from "./myeongri";

const STORAGE_KEY = "fortune-history";
const NAME_KEY = "fortune-name";
const BIRTH_KEY = "fortune-birth";
const MAX_RECORDS = 100;

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// 점수 → 별 문자열 (반올림 정수 별)
function stars(score) {
  const full = Math.max(1, Math.min(5, Math.round(score / 20)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [notice, setNotice] = useState("");
  const [syncState, setSyncState] = useState("checking");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
      setBirth(localStorage.getItem(BIRTH_KEY) || "");
    } catch {}

    let local = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) local = JSON.parse(saved);
    } catch {}
    setHistory(local);

    let savedName = "";
    try {
      savedName = localStorage.getItem(NAME_KEY) || "";
    } catch {}
    loadHistory(savedName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function handleBirthChange(e) {
    const v = e.target.value;
    setBirth(v);
    setNotice("");
    try {
      localStorage.setItem(BIRTH_KEY, v);
    } catch {}
  }

  // 사주 해석 + 카드 표시 + 자동 저장
  function reveal() {
    if (!birth) {
      setNotice("생년월일을 입력해 주세요 🗓️");
      setFlipped(false);
      return;
    }
    const r = analyze(birth, new Date());
    setReport(r);
    setFlipped(true);
    // 새 운세를 뽑으면 이전 AI 풀이는 초기화
    setAiText("");
    setAiError("");

    const content = summaryText(r);
    const record = { time: new Date().toISOString(), name: name.trim() ? name.trim() : "익명", content };

    setHistory((prev) => {
      const next = [record, ...prev].slice(0, MAX_RECORDS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    fetch("/api/fortunes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), content }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.configured) {
          setSyncState("cloud");
          loadHistory(name);
        }
      })
      .catch(() => {});
  }

  function handleReveal() {
    if (flipped) {
      setFlipped(false);
      setTimeout(reveal, 450);
    } else {
      reveal();
    }
  }

  // OpenRouter AI에게 오늘의 운세 풀이를 요청
  function requestAI() {
    if (!report || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    setAiText("");
    const context = {
      name: name.trim() || "익명",
      zodiac: report.zodiac,
      selfElement: report.selfElement,
      todayElement: report.todayElement,
      relation: report.relation,
      relationLabel: report.relationLabel,
      categories: report.categories.map((c) => ({ label: c.label, score: c.score })),
      lucky: report.lucky,
    };
    fetch("/api/ai-fortune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.configured === false) {
          setAiError("AI 기능이 아직 설정되지 않았어요. (.env의 OPENROUTER_API_KEY 필요)");
        } else if (data && data.text) {
          setAiText(data.text);
        } else {
          setAiError(data?.error || "AI 응답을 받지 못했어요.");
        }
      })
      .catch(() => setAiError("AI 요청 중 오류가 발생했어요."))
      .finally(() => setAiLoading(false));
  }

  function handleClearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    if (name.trim()) {
      fetch(`/api/fortunes?name=${encodeURIComponent(name.trim())}`, { method: "DELETE" })
        .then(() => loadHistory(name))
        .catch(() => {});
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <p className={styles.date}>{today}</p>
        <h1 className={styles.title}>오늘의 사주 운세</h1>
        <p className={styles.subtitle}>생년월일로 보는 오행·명리학 기반 운세</p>
      </div>

      <div className={styles.scene}>
        <div className={`${styles.card} ${flipped ? styles.isFlipped : ""}`}>
          {/* 카드 뒷면 */}
          <div className={styles.cardFace + " " + styles.cardBack}>
            <div className={styles.backInner}>
              <span className={styles.backGlyph}>☯</span>
              <span className={styles.backText}>四柱</span>
              <span className={styles.backSub}>오늘의 사주 운세</span>
            </div>
          </div>

          {/* 카드 앞면: 요약 */}
          <div className={styles.cardFace + " " + styles.cardFront}>
            {report && (
              <div className={styles.summaryInner}>
                <div className={styles.zodiacRow}>
                  <span className={styles.zodiacEmoji}>{report.zodiacEmoji}</span>
                  <div>
                    <div className={styles.zodiacName}>{report.zodiac}띠</div>
                    <div className={styles.selfEl}>
                      본명 오행 {report.selfElementEmoji} {report.selfElement}
                    </div>
                  </div>
                </div>

                <div className={styles.overallWrap}>
                  <span className={styles.overallLabel}>오늘의 총운</span>
                  <span className={styles.overallScore}>{report.overall}</span>
                  <span className={styles.overallStars}>{stars(report.overall)}</span>
                </div>

                <div className={styles.todayEnergy}>
                  <span className={styles.energyEl}>
                    오늘의 기운 {report.todayElementEmoji} {report.todayElement}
                  </span>
                  <span className={styles.relLabel}>{report.relationLabel}</span>
                  {report.harmonyLabel && (
                    <span className={styles.harmony}>{report.harmonyLabel}</span>
                  )}
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
          placeholder="이름 (선택)"
          maxLength={20}
          aria-label="이름"
        />
        <input
          className={styles.birthInput}
          type="date"
          value={birth}
          onChange={handleBirthChange}
          max="2030-12-31"
          min="1900-01-01"
          aria-label="생년월일"
        />
        <button className={styles.button} onClick={handleReveal}>
          {flipped ? "다시 보기 🔄" : "운세 보기 ☯"}
        </button>
      </div>
      {notice && <p className={styles.notice}>{notice}</p>}

      {/* 상세 리포트 (C: 항목별 점수) */}
      {report && flipped && (
        <section className={styles.reportSection}>
          <h2 className={styles.reportTitle}>
            {name.trim() ? `${name.trim()}님의 ` : ""}오늘의 운세 리포트
          </h2>
          <div className={styles.reportCard}>
            {report.categories.map((c) => (
              <div key={c.key} className={styles.catRow}>
                <div className={styles.catHead}>
                  <span className={styles.catLabel}>
                    {c.emoji} {c.label}
                  </span>
                  <span className={styles.catScoreWrap}>
                    <span className={styles.catStars}>{stars(c.score)}</span>
                    <span className={styles.catScore}>{c.score}</span>
                  </span>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${c.score}%` }}
                    data-key={c.key}
                  />
                </div>
                <p className={styles.catComment}>{c.comment}</p>
              </div>
            ))}

            <div className={styles.luckyRow}>
              <div className={styles.luckyItem}>
                <span className={styles.luckyLabel}>행운의 색</span>
                <span className={styles.luckyVal}>
                  <span
                    className={styles.swatch}
                    style={{ background: report.lucky.colorHex }}
                  />
                  {report.lucky.colorName}
                </span>
              </div>
              <div className={styles.luckyItem}>
                <span className={styles.luckyLabel}>행운의 숫자</span>
                <span className={styles.luckyVal}>🎯 {report.lucky.number}</span>
              </div>
              <div className={styles.luckyItem}>
                <span className={styles.luckyLabel}>행운의 방향</span>
                <span className={styles.luckyVal}>🧭 {report.lucky.direction}</span>
              </div>
            </div>
          </div>
          {/* AI 운세 풀이 */}
          <div className={styles.aiBlock}>
            {!aiText && (
              <button
                className={styles.aiButton}
                onClick={requestAI}
                disabled={aiLoading}
              >
                {aiLoading ? "AI가 운세를 쓰는 중… ✍️" : "🤖 AI 운세 풀이 받기"}
              </button>
            )}
            {aiError && <p className={styles.aiError}>{aiError}</p>}
            {aiText && (
              <div className={styles.aiCard}>
                <div className={styles.aiHead}>
                  <span className={styles.aiTag}>🤖 AI 운세 풀이</span>
                  <button className={styles.aiRetry} onClick={requestAI} disabled={aiLoading}>
                    {aiLoading ? "생성 중…" : "다시 생성"}
                  </button>
                </div>
                <p className={styles.aiText}>{aiText}</p>
              </div>
            )}
          </div>

          <p className={styles.reportNote}>
            생년(년간) 오행 {report.selfElement} · 오늘 일진 오행 {report.todayElement} →{" "}
            {report.relation} 관계로 산출된 결과입니다.
          </p>
        </section>
      )}

      {/* 운세 기록 */}
      <section className={styles.historySection}>
        <div className={styles.historyHead}>
          <div className={styles.historyTitleWrap}>
            <h2 className={styles.historyTitle}>
              {name.trim() ? `${name.trim()}님의 운세 기록` : "운세 기록"}
            </h2>
            <span
              className={`${styles.syncBadge} ${syncState === "cloud" ? styles.syncCloud : ""}`}
              title={syncState === "cloud" ? "Supabase에 자동 저장됩니다" : "이 브라우저에만 저장됩니다"}
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
          <p className={styles.empty}>아직 뽑은 운세가 없어요. 생년월일을 넣고 운세를 확인해 보세요! ☯</p>
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
        오행·명리학 기반으로 계산된 운세입니다 · 재미로 참고하세요 🙂
      </footer>
    </main>
  );
}
