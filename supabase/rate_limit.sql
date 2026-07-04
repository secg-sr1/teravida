-- Fixed-window rate limiter for /api/agents/*. Run once in the Supabase SQL Editor.
-- Atomic check-and-increment via a single RPC; accessed server-side only
-- (service_role bypasses RLS).

create table if not exists rate_limits (
  bucket       text   not null,
  window_start bigint not null,  -- floor(epoch_seconds / window)
  count        int    not null default 0,
  primary key (bucket, window_start)
);

alter table rate_limits enable row level security; -- deny-all; service_role bypasses

-- Returns TRUE if the request is allowed (count within p_limit for the window).
create or replace function rate_limit_hit(p_bucket text, p_limit int, p_window int)
returns boolean
language plpgsql
as $$
declare
  w bigint := floor(extract(epoch from now()) / p_window);
  c int;
begin
  insert into rate_limits (bucket, window_start, count)
  values (p_bucket, w, 1)
  on conflict (bucket, window_start)
  do update set count = rate_limits.count + 1
  returning count into c;

  -- opportunistic cleanup of this bucket's stale windows
  delete from rate_limits where bucket = p_bucket and window_start < w - 1;

  return c <= p_limit;
end;
$$;
