import { postTo, handleCors, methodNotAllowed } from './_proxy.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return handleCors(req, res);
  if (req.method !== 'POST') return methodNotAllowed(req, res);
  return postTo('criopreservacion', req, res);
}
