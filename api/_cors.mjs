const ALLOWED_ORIGINS = ['https://stem-care.com', 'https://www.stem-care.com'];

export function resolveAllowOrigin(req) {
  const origin = req.headers?.origin;
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export function setCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Origin', resolveAllowOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}
