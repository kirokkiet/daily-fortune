import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

function isConfigured() {
  const key = process.env.OPENROUTER_API_KEY;
  return !!key && key.startsWith("sk-or-");
}

// POST /api/ai-fortune  { context }  → AI가 생성한 오늘의 운세 텍스트
export async function POST(request) {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON" }, { status: 400 });
  }

  const ctx = body && body.context;
  if (!ctx) {
    return NextResponse.json({ error: "context 필요" }, { status: 400 });
  }

  const cats = Array.isArray(ctx.categories)
    ? ctx.categories.map((c) => `${c.label} ${c.score}점`).join(", ")
    : "";

  const system =
    "당신은 사주·명리학에 정통한 따뜻하고 현실적인 운세 상담가입니다. " +
    "주어진 명리학 분석(띠, 오행, 십신 관계, 항목별 점수)을 근거로 오늘의 운세를 한국어로 씁니다. " +
    "미신적 단정이나 과장(대박·확실히 등)은 피하고, 구체적이고 실천 가능한 조언을 담되 재미있게 씁니다. " +
    "분석 수치와 모순되지 않게 쓰고, 존댓말을 사용합니다.";

  const user =
    `아래 명리학 분석을 바탕으로 '오늘의 운세'를 써 주세요.\n\n` +
    `- 이름: ${ctx.name || "익명"}\n` +
    `- 띠/본명 오행: ${ctx.zodiac}띠 · ${ctx.selfElement}(오행)\n` +
    `- 오늘의 기운(오행): ${ctx.todayElement}\n` +
    `- 십신 관계: ${ctx.relation} (${ctx.relationLabel || ""})\n` +
    `- 항목별 점수(100점 만점): ${cats}\n` +
    `- 행운의 색/숫자/방향: ${ctx.lucky?.colorName} / ${ctx.lucky?.number} / ${ctx.lucky?.direction}\n\n` +
    `형식: (1) 오늘의 한 줄 요약 1문장, (2) 총운·애정·금전·직장·건강을 아우르는 3~4문장 서술, ` +
    `(3) 오늘의 조언 1문장. 이모지는 과하지 않게 약간만. 전체 250자 내외.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // OpenRouter 권장 헤더(선택). 헤더 값은 ASCII만 허용되므로 한글 금지.
        "HTTP-Referer": "https://daily-fortune.local",
        "X-Title": "Daily Saju Fortune",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `OpenRouter 오류(${res.status})`, detail: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json({ error: "빈 응답" }, { status: 502 });
    }

    return NextResponse.json(
      { configured: true, text, model: data.model || null },
      { status: 200 }
    );
  } catch (e) {
    const msg = e?.name === "AbortError" ? "응답 시간 초과" : "AI 요청 실패";
    console.error("[ai-fortune] fetch failed:", e);
    return NextResponse.json(
      { error: msg, detail: String(e?.cause?.code || e?.message || e) },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
