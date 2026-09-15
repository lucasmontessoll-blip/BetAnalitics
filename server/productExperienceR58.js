import { autenticarRequest, exigirAdmin, supabaseAdmin } from './authSupabase.js';

const newsCache = new Map();
const requestWindows = new Map();
const NEWS_TTL_MS = 10 * 60 * 1000;

function clean(value, max = 120) {
  return String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);
}

function decodeXml(value) {
  return clean(String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' '), 500);
}

function tag(block, name) {
  return decodeXml(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '');
}

function link(block) {
  const raw = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || '';
  const value = decodeXml(raw);
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'news.google.com' ? url.toString() : '';
  } catch { return ''; }
}

function parseNews(xml) {
  return [...String(xml || '').matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 30).map((match) => {
    const block = match[1];
    const title = tag(block, 'title');
    const url = link(block);
    const source = tag(block, 'source') || 'Google Notícias';
    const published = new Date(tag(block, 'pubDate'));
    return title && url ? {
      title, url, source,
      published_at: Number.isFinite(published.getTime()) ? published.toISOString() : null,
    } : null;
  }).filter(Boolean);
}

function rateLimit(req, limit = 40) {
  const key = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.start >= 60_000) {
    requestWindows.set(key, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

async function news(req, res) {
  if (!rateLimit(req)) return res.status(429).json({ ok: false, code: 'RATE_LIMITED' });
  const q = clean(req.query.q || 'futebol brasileiro', 60);
  if (q.length < 3) return res.status(400).json({ ok: false, code: 'INVALID_QUERY' });
  const cached = newsCache.get(q.toLowerCase());
  if (cached && Date.now() - cached.at < NEWS_TTL_MS) return res.json({ ok: true, cache: true, items: cached.items });
  try {
    const params = new URLSearchParams({ q, hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419' });
    const response = await fetch(`https://news.google.com/rss/search?${params}`, {
      headers: { Accept: 'application/rss+xml, application/xml;q=0.9' },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error('NEWS_UPSTREAM_FAILED');
    const items = parseNews(await response.text());
    newsCache.set(q.toLowerCase(), { at: Date.now(), items });
    return res.json({ ok: true, cache: false, source: 'Google Notícias', items });
  } catch {
    if (cached) return res.json({ ok: true, cache: true, stale: true, items: cached.items });
    return res.status(503).json({ ok: false, code: 'NEWS_UNAVAILABLE', items: [] });
  }
}

const TYPES = new Set(['match', 'team', 'player', 'league', 'app']);
const CATEGORIES = new Set(['incorrect', 'outdated', 'missing', 'bug', 'other']);

async function report(req, res) {
  if (!supabaseAdmin) return res.status(503).json({ ok: false, code: 'REPORTS_UNAVAILABLE' });
  const entityType = clean(req.body?.entity_type, 20);
  const category = clean(req.body?.category, 20);
  const entityId = clean(req.body?.entity_id, 80) || null;
  const description = clean(req.body?.description, 500);
  if (!TYPES.has(entityType) || !CATEGORIES.has(category) || description.length < 5) {
    return res.status(400).json({ ok: false, code: 'INVALID_REPORT' });
  }
  const { data, error } = await supabaseAdmin.from('data_quality_reports').insert({
    user_id: req.betUser.id, entity_type: entityType, entity_id: entityId,
    category, description, app_version: clean(req.body?.app_version, 40) || null,
    platform: ['web', 'android'].includes(req.body?.platform) ? req.body.platform : 'web',
  }).select('id,status,created_at').single();
  if (error) return res.status(503).json({ ok: false, code: 'REPORT_SAVE_FAILED' });
  return res.status(201).json({ ok: true, report: data });
}

export function instalarRotasProductExperienceR58(app) {
  app.get('/api/content/football-news', news);
  app.post('/api/product/data-quality-report', autenticarRequest, report);
  app.get('/api/admin/data-quality-reports', exigirAdmin, async (_req, res) => {
    const { data, error } = await supabaseAdmin.from('data_quality_reports')
      .select('id,entity_type,entity_id,category,description,status,platform,created_at')
      .order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(503).json({ ok: false, code: 'REPORT_QUERY_FAILED' });
    return res.json({ ok: true, reports: data || [] });
  });
}
