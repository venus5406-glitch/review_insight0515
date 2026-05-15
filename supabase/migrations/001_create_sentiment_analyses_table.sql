-- 감성 분석 결과를 저장할 테이블 생성
create table sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  
  -- 사용자가 입력한 원문
  input_text text not null,
  
  -- 감성 분석 결과
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  sentiment_label text not null check (sentiment_label in ('긍정', '부정', '중립')),
  
  -- 신뢰도 (0 ~ 100)
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  
  -- 분석 이유
  reason text not null,
  
  created_at timestamptz not null default now()
);

-- 검색 성능 향상을 위한 인덱스 생성
create index sentiment_analyses_created_at_idx on sentiment_analyses (created_at desc);
create index sentiment_analyses_sentiment_idx on sentiment_analyses (sentiment);

-- 기본적으로 클라이언트 직접 접근 제한 (RLS 적용)
alter table sentiment_analyses enable row level security;
