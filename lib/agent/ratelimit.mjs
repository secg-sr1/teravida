// Supabase-backed fixed-window rate limiter. Fails OPEN (allows the request) if
// the limiter itself errors — availability over strictness for this use case.

import { supabase } from '../supabase/client.mjs';

/** @returns {Promise<boolean>} true if allowed, false if the limit is exceeded. */
export async function rateLimit(bucket, limit, windowSeconds) {
  const { data, error } = await supabase.rpc('rate_limit_hit', {
    p_bucket: bucket,
    p_limit: limit,
    p_window: windowSeconds,
  });
  if (error) {
    console.error('rateLimit error (failing open):', error.message);
    return true;
  }
  return data === true;
}

/** First client IP from x-forwarded-for (Vercel sets this), else 'unknown'. */
export function clientIp(req) {
  const xff = req.headers?.['x-forwarded-for'] || '';
  return xff.split(',')[0].trim() || 'unknown';
}
