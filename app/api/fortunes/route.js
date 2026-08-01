import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../lib/supabaseServer";

export const dynamic = "force-dynamic";

const TABLE = "fortunes";
const MAX_RECORDS = 100;

// GET /api/fortunes            → 최근 운세 기록(최신순)
// GET /api/fortunes?name=홍길동 → 해당 이름의 기록만
export async function GET(request) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ configured: false, records: [] }, { status: 200 });
  }

  const name = request.nextUrl.searchParams.get("name");

  let query = supabase
    .from(TABLE)
    .select("created_at, name, content")
    .order("created_at", { ascending: false })
    .limit(MAX_RECORDS);

  if (name && name.trim()) {
    query = query.eq("name", name.trim());
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const records = (data || []).map((r) => ({
    time: r.created_at,
    name: r.name,
    content: r.content,
  }));

  return NextResponse.json({ configured: true, records }, { status: 200 });
}

// POST /api/fortunes  { name, content }  → 운세 한 건 저장 (날짜는 자동)
export async function POST(request) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON" }, { status: 400 });
  }

  const { name, content } = body || {};
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "content 필요" }, { status: 400 });
  }

  const row = {
    name: name && name.trim() ? name.trim() : null,
    content: content.trim(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select("created_at, name, content")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      configured: true,
      ok: true,
      record: { time: data.created_at, name: data.name, content: data.content },
    },
    { status: 201 }
  );
}

// DELETE /api/fortunes?name=홍길동  → 해당 이름의 기록 삭제
// (이름 없이 호출하면 실수 방지를 위해 거부)
export async function DELETE(request) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const name = request.nextUrl.searchParams.get("name");
  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "이름을 지정해야 합니다(전체 삭제 방지)" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from(TABLE).delete().eq("name", name.trim());
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configured: true, ok: true }, { status: 200 });
}
