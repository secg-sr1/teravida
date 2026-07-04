-- Stem Care — Supabase schema for the agent runtime + knowledge layer.
-- Directus remains the system-of-record for LEADS (criopreservacion,
-- pruebas_geneticas, terapia_celular). Nothing here duplicates those.
--
-- Safe to run more than once (idempotent). Paste into Supabase SQL Editor.

-- =========================================================================
-- 1. RAG knowledge base (pgvector)
--    Corpus: stem-cell handbook, FAQ, institutional baseFacts.
--    Embedding dim 1536 = OpenAI text-embedding-3-small.
-- =========================================================================
create extension if not exists vector;

create table if not exists documents (
  id         bigint generated always as identity primary key,
  source     text,
  title      text,
  content    text        not null,
  embedding  vector(1536),
  metadata   jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists documents_embedding_idx
  on documents using hnsw (embedding vector_cosine_ops);

-- Cosine-similarity search used by the knowledgeSearch tool.
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'
) returns table (
  id bigint,
  source text,
  title text,
  content text,
  similarity float
) language sql stable as $$
  select d.id, d.source, d.title, d.content,
         1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.metadata @> filter
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- =========================================================================
-- 2. Session + memory
--    Server-side conversation state, so we stop trusting client-sent history.
-- =========================================================================
create table if not exists agent_sessions (
  id         uuid primary key default gen_random_uuid(),
  language   text,
  status     text        not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists agent_messages (
  id          bigint generated always as identity primary key,
  session_id  uuid        not null references agent_sessions(id) on delete cascade,
  role        text        not null,   -- 'user' | 'assistant' | 'system' | 'tool'
  content     text,
  token_usage jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists agent_messages_session_idx
  on agent_messages (session_id, created_at);

-- =========================================================================
-- 3. Observability + human approval
--    Every tool call is logged; write-effect actions require approval.
-- =========================================================================
create table if not exists agent_tool_calls (
  id         bigint generated always as identity primary key,
  session_id uuid        not null references agent_sessions(id) on delete cascade,
  tool_name  text        not null,
  args       jsonb       not null default '{}',
  result     jsonb,
  effect     text        not null default 'read',   -- 'read' | 'write'
  status     text        not null default 'pending', -- pending|ok|error
  latency_ms int,
  created_at timestamptz not null default now()
);

create index if not exists agent_tool_calls_session_idx
  on agent_tool_calls (session_id, created_at);

create table if not exists agent_approvals (
  id              bigint generated always as identity primary key,
  session_id      uuid        not null references agent_sessions(id) on delete cascade,
  tool_call_id    bigint      references agent_tool_calls(id) on delete set null,
  proposed_action jsonb       not null,
  status          text        not null default 'pending', -- pending|approved|rejected
  decided_by      text,
  decided_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists agent_approvals_status_idx
  on agent_approvals (status, created_at);

-- =========================================================================
-- Notes
-- - All access is server-side via the service_role key from Vercel functions.
-- - RLS is intentionally left off: the anon key is never used against these
--   tables. If you ever expose them to the browser, enable RLS first.
-- =========================================================================
