-- 운세 기록 테이블 (간단 버전: 날짜 / 이름 / 운세 내용)
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.
--
-- ⚠️ 주의: 기존 fortunes 테이블(이전의 여러 컬럼 구조)이 있으면 아래 DROP 으로 대체됩니다.
--          기존 데이터가 있다면 먼저 백업하세요. (현재는 비어 있어 안전)

drop table if exists public.fortunes;

create table public.fortunes (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),  -- 날짜 (뽑은 시각, 자동 기록)
  name       text,                                 -- 이름
  content    text        not null                  -- 운세 내용
);

-- 최신순 조회 / 이름별 조회용 인덱스
create index if not exists fortunes_created_idx on public.fortunes (created_at desc);
create index if not exists fortunes_name_idx    on public.fortunes (name);

-- RLS 활성화. 서버(API Route)는 secret key(service role)로 접근하므로 RLS를 우회한다.
alter table public.fortunes enable row level security;
