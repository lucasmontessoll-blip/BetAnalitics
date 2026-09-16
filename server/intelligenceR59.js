import { autenticarRequest, exigirAdmin, supabaseAdmin } from './authSupabase.js';

const API_BASE = String(process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io').replace(/\/$/, '');
const cache = new Map();
const clean = (v, n = 120) => String(v || '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, n);
const numberId = (v) => /^\d{1,12}$/.test(String(v || '')) ? String(v) : null;

async function football(path, params = {}, ttl = 120000) {
  const key = clean(process.env.API_FOOTBALL_KEY, 300);
  if (!key) throw Object.assign(new Error('API_NOT_CONFIGURED'), { status: 503 });
  const query = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== null && v !== undefined && v !== ''));
  const url = `${API_BASE}${path}?${query}`;
  const saved = cache.get(url);
  if (saved && Date.now() - saved.at < ttl) return { items: saved.items, cached: true };
  const response = await fetch(url, { headers: { 'x-apisports-key': key, Accept: 'application/json' }, signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw Object.assign(new Error('UPSTREAM_FAILED'), { status: 502 });
  const body = await response.json();
  if (body?.errors && Object.keys(body.errors).length) throw Object.assign(new Error('PROVIDER_REJECTED'), { status: 502 });
  const items = Array.isArray(body?.response) ? body.response : [];
  cache.set(url, { at: Date.now(), items });
  return { items, cached: false };
}

function factors(fixture) {
  const p = fixture?.predictions || {};
  const advice = clean(p.advice, 180);
  const winner = clean(p.winner?.name, 80);
  const percent = p.percent || {};
  return {
    confidence: { home: clean(percent.home, 12), draw: clean(percent.draw, 12), away: clean(percent.away, 12) },
    factors: [winner && `Tendência do fornecedor: ${winner}`, advice].filter(Boolean),
    limitations: ['Estimativa estatística; não é garantia.', 'Lesões, escalações e mudanças de última hora podem alterar o cenário.'],
    generated_at: new Date().toISOString(), source: 'API-Football'
  };
}

export function instalarRotasIntelligenceR59(app) {
  app.get('/api/intelligence/status', (_req, res) => res.json({ ok: true, football: Boolean(process.env.API_FOOTBALL_KEY), gemini: Boolean(process.env.GEMINI_API_KEY), secrets_exposed: false }));

  app.get('/api/intelligence/briefing', autenticarRequest, async (req, res) => {
    try {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.date || '')) ? req.query.date : new Date().toISOString().slice(0, 10);
      const result = await football('/fixtures', { date, timezone: 'America/Sao_Paulo' }, 180000);
      const followed = clean(req.query.teams, 300).split(',').filter(numberId).slice(0, 20);
      const items = result.items.filter((x) => !followed.length || followed.includes(String(x?.teams?.home?.id)) || followed.includes(String(x?.teams?.away?.id))).slice(0, 25);
      return res.json({ ok: true, date, cached: result.cached, items });
    } catch (error) { return res.status(error.status || 503).json({ ok: false, code: error.message }); }
  });

  app.get('/api/intelligence/compare', autenticarRequest, async (req, res) => {
    const a = numberId(req.query.a); const b = numberId(req.query.b);
    if (!a || !b || a === b) return res.status(400).json({ ok: false, code: 'INVALID_TEAMS' });
    try {
      const [first, second, h2h] = await Promise.all([
        football('/teams/statistics', { team: a, league: numberId(req.query.league), season: numberId(req.query.season) }, 900000),
        football('/teams/statistics', { team: b, league: numberId(req.query.league), season: numberId(req.query.season) }, 900000),
        football('/fixtures/headtohead', { h2h: `${a}-${b}`, last: 10 }, 900000)
      ]);
      return res.json({ ok: true, teams: [first.items[0] || null, second.items[0] || null], head_to_head: h2h.items });
    } catch (error) { return res.status(error.status || 503).json({ ok: false, code: error.message }); }
  });

  app.get('/api/intelligence/explanation/:fixtureId', autenticarRequest, async (req, res) => {
    const id = numberId(req.params.fixtureId);
    if (!id) return res.status(400).json({ ok: false, code: 'INVALID_FIXTURE' });
    try { const value = await football('/predictions', { fixture: id }, 600000); return res.json({ ok: true, explanation: factors(value.items[0] || {}) }); }
    catch (error) { return res.status(error.status || 503).json({ ok: false, code: error.message }); }
  });

  app.post('/api/intelligence/feedback', autenticarRequest, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ ok: false, code: 'FEEDBACK_UNAVAILABLE' });
    const rating = Number(req.body?.rating); const feature = clean(req.body?.feature, 60); const comment = clean(req.body?.comment, 500);
    if (![1,2,3,4,5].includes(rating) || !feature) return res.status(400).json({ ok: false, code: 'INVALID_FEEDBACK' });
    const { data, error } = await supabaseAdmin.from('product_feedback').insert({ user_id: req.betUser.id, feature, rating, comment: comment || null, platform: req.body?.platform === 'android' ? 'android' : 'web' }).select('id,created_at').single();
    if (error) return res.status(503).json({ ok: false, code: 'FEEDBACK_SAVE_FAILED' });
    return res.status(201).json({ ok: true, feedback: data });
  });

  app.get('/api/admin/retention', exigirAdmin, async (_req, res) => {
    const { data, error } = await supabaseAdmin.rpc('bet_admin_retention_r59');
    if (error) return res.status(503).json({ ok: false, code: 'RETENTION_QUERY_FAILED' });
    return res.json({ ok: true, retention: data });
  });
}
