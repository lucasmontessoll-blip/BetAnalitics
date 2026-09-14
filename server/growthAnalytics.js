import crypto from 'crypto';
import { autenticarRequest, exigirAdmin, supabaseAdmin } from './authSupabase.js';

const EVENTOS_PUBLICOS = new Set(['page_view', 'cta_click', 'signup_started']);
const EVENTOS_AUTENTICADOS = new Set(['feature_free_used', 'feature_pro_used', 'subscription_cancelled']);
const limites = new Map();

function texto(valor, maximo = 100) {
  return String(valor || '').trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maximo);
}

function uuid(valor) {
  const limpo = texto(valor, 40);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(limpo)
    ? limpo.toLowerCase()
    : crypto.randomUUID();
}

function propriedadesSeguras(valor) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return {};
  const permitido = ['action', 'feature', 'location', 'label'];
  return Object.fromEntries(
    permitido
      .filter((chave) => valor[chave] !== undefined)
      .map((chave) => [chave, texto(valor[chave], 80)])
  );
}

export function validarEventoAnalytics(body = {}, autenticado = false) {
  const eventName = texto(body.event_name, 40);
  const permitidos = autenticado ? EVENTOS_AUTENTICADOS : EVENTOS_PUBLICOS;
  if (!permitidos.has(eventName)) throw Object.assign(new Error('Evento invalido.'), { status: 400 });

  return {
    event_name: eventName,
    anonymous_id: uuid(body.anonymous_id),
    session_id: uuid(body.session_id),
    platform: ['web', 'android'].includes(body.platform) ? body.platform : 'web',
    utm_source: texto(body.utm_source, 80) || null,
    utm_medium: texto(body.utm_medium, 80) || null,
    utm_campaign: texto(body.utm_campaign, 100) || null,
    utm_content: texto(body.utm_content, 100) || null,
    utm_term: texto(body.utm_term, 100) || null,
    properties: propriedadesSeguras(body.properties)
  };
}

function permitirRequisicao(req) {
  const chave = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const agora = Date.now();
  const atual = limites.get(chave);
  if (!atual || agora - atual.inicio >= 60_000) {
    limites.set(chave, { inicio: agora, total: 1 });
    return true;
  }
  atual.total += 1;
  return atual.total <= 90;
}

async function registrar(req, res, autenticado) {
  if (!supabaseAdmin) return res.status(503).json({ ok: false, code: 'ANALYTICS_UNAVAILABLE' });
  if (!permitirRequisicao(req)) return res.status(429).json({ ok: false, code: 'RATE_LIMITED' });
  try {
    const evento = validarEventoAnalytics(req.body, autenticado);
    if (autenticado) evento.user_id = req.betUser.id;
    const { error } = await supabaseAdmin.from('analytics_events').insert(evento);
    if (error) throw error;
    return res.status(202).json({ ok: true });
  } catch (erro) {
    return res.status(Number(erro?.status) || 503).json({ ok: false, code: 'ANALYTICS_REJECTED' });
  }
}

function intervalo(query = {}) {
  const ate = query.to ? new Date(query.to) : new Date();
  const de = query.from ? new Date(query.from) : new Date(ate.getTime() - 29 * 86400000);
  if (!Number.isFinite(de.getTime()) || !Number.isFinite(ate.getTime()) || de > ate) return null;
  if (ate.getTime() - de.getTime() > 366 * 86400000) return null;
  return { from: de.toISOString(), to: ate.toISOString() };
}

export function instalarRotasGrowthAnalytics(app) {
  app.post('/api/analytics/event', (req, res) => registrar(req, res, false));

  app.post('/api/analytics/event/auth', async (req, res) => {
    return autenticarRequest(req, res, () => registrar(req, res, true));
  });

  app.get('/api/admin/analytics', exigirAdmin, async (req, res) => {
    const periodo = intervalo(req.query);
    if (!periodo) return res.status(400).json({ ok: false, code: 'INVALID_RANGE' });
    const { data, error } = await supabaseAdmin.rpc('bet_admin_growth_dashboard_r51', {
      p_from: periodo.from,
      p_to: periodo.to
    });
    if (error) return res.status(503).json({ ok: false, code: 'ANALYTICS_QUERY_FAILED' });
    return res.json({ ok: true, dashboard: data });
  });

  app.post('/api/admin/analytics/costs', exigirAdmin, async (req, res) => {
    const amount = Number(req.body?.amount);
    const costDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.body?.cost_date || '')) ? req.body.cost_date : '';
    if (!costDate || !Number.isFinite(amount) || amount < 0 || amount > 10_000_000) {
      return res.status(400).json({ ok: false, code: 'INVALID_COST' });
    }
    const { data, error } = await supabaseAdmin.from('analytics_campaign_costs').insert({
      cost_date: costDate,
      source: texto(req.body?.source, 80) || 'direto',
      campaign: texto(req.body?.campaign, 100) || 'geral',
      amount: Number(amount.toFixed(2)),
      notes: texto(req.body?.notes, 240) || null,
      created_by: req.betUser.id
    }).select('id,cost_date,source,campaign,amount,notes,created_at').single();
    if (error) return res.status(503).json({ ok: false, code: 'COST_SAVE_FAILED' });
    return res.status(201).json({ ok: true, cost: data });
  });
}
