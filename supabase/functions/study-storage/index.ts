import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';

const PROJECT = 'alpha-c3c01';
const ADMINS = new Set(['fMGIdEIX9YcpqTYS9LswRMcFSIb2', 'jIf44hCNk6heym0SI0dGRUhIs7G2']);
const BUCKET = 'study-materials';
const MAX_BYTES = 25 * 1024 * 1024;
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const TYPES = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/zip','text/plain']);
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const validPath = (path: string) => /^materials\/(?:year-1\/(?:group-a|group-b)|year-[234]\/(?:cse|it|ds|ecs))\/[A-Za-z0-9_-]+\.(?:pdf|docx?|pptx?|zip|txt)$/i.test(path);

// Firebase RS256 verification is deliberately implemented here. Supabase's built-in
// JWT check accepts Supabase tokens, not these Firebase tokens (verify_jwt=false).
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const token = req.headers.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return json({ error: 'Sign in required' }, 401);
  let uid: string;
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${PROJECT}`, audience: PROJECT, algorithms: ['RS256'], requiredClaims: ['sub','iat','exp','auth_time'] });
    if (!payload.sub || payload.sub.length > 128 || typeof payload.auth_time !== 'number' || payload.auth_time > Date.now()/1000 + 60) throw new Error('Invalid user');
    uid = payload.sub;
  } catch { return json({ error: 'Session invalid or expired. Sign in again.' }, 401); }
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  if (!['upload','delete','download'].includes(action || '')) return json({ error: 'Invalid action' }, 400);
  if (action !== 'download' && !ADMINS.has(uid)) return json({ error: 'Admin access required' }, 403);
  const path = url.searchParams.get('path') || '';
  if (!validPath(path)) return json({ error: 'Invalid material path' }, 400);
  const base = Deno.env.get('SUPABASE_URL')!;
  const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  const key = keys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) return json({ error: 'Storage is not configured' }, 503);
  const headers: Record<string, string> = { apikey: key };
  if (!keys.default) headers.Authorization = `Bearer ${key}`;
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  try {
    let response: Response;
    if (action === 'upload') {
      const type = (req.headers.get('Content-Type') || '').split(';')[0];
      if (!TYPES.has(type)) return json({ error: 'Unsupported file type' }, 415);
      const reader = req.body?.getReader();
      if (!reader) return json({ error: 'File required' }, 400);
      const chunks: Uint8Array[] = []; let length = 0;
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        length += value.byteLength;
        if (length > MAX_BYTES) { await reader.cancel(); return json({ error: 'File exceeds 25 MB' }, 413); }
        chunks.push(value);
      }
      if (!length) return json({ error: 'Empty file' }, 400);
      response = await fetch(`${base}/storage/v1/object/${BUCKET}/${encoded}`, { method: 'POST', headers: { ...headers, 'Content-Type': type, 'x-upsert': 'false' }, body: new Blob(chunks, { type }) });
    } else if (action === 'delete') {
      response = await fetch(`${base}/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [path] }) });
    } else {
      response = await fetch(`${base}/storage/v1/object/sign/${BUCKET}/${encoded}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 120 }) });
    }
    if (!response.ok) {
      console.error('Storage operation failed', action, response.status);
      return json({ error: 'Storage request failed. Retry or contact an administrator.' }, response.status === 404 ? 404 : 502);
    }
    if (action === 'download') {
      const data = await response.json();
      if (typeof data.signedURL !== 'string') return json({ error: 'Download unavailable' }, 502);
      const signed = new URL(data.signedURL.startsWith('/object/') ? `/storage/v1${data.signedURL}` : data.signedURL, base);
      if (signed.origin !== base) return json({ error: 'Invalid download location' }, 502);
      return json({ url: signed.href, expiresIn: 120 });
    }
    return json({ ok: true, path });
  } catch { return json({ error: 'Storage temporarily unavailable. Please retry.' }, 503); }
});
