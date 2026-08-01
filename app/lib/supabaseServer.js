import "server-only";
import { createClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트.
// secret key(service role 성격)를 사용하므로 절대 클라이언트 번들에 포함되면 안 된다.
// "server-only" 임포트가 실수로 클라이언트에서 import 되는 것을 빌드 타임에 차단한다.

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

// 환경변수가 아직 설정되지 않았거나 placeholder면 null 을 반환해
// API Route 가 우아하게 실패하고 클라이언트는 localStorage 로 폴백하도록 한다.
function isConfigured() {
  return (
    !!url &&
    !!secretKey &&
    !url.includes("YOUR-PROJECT-REF") &&
    secretKey.startsWith("sb_secret_")
  );
}

let cached = null;

export function getSupabaseServer() {
  if (!isConfigured()) return null;
  if (cached) return cached;
  cached = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const SUPABASE_READY = isConfigured();
