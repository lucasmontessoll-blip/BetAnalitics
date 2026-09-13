import { createClient } from '@supabase/supabase-js';
import { criarGuardaPro, perfilTemPro } from './accessPolicy.js';
const url = String(process.env.SUPABASE_URL || '').trim();
const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
export const supabaseAdmin = url && key ? createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
}) : null;

export function criarAutenticador(client) {
  return async function autenticar(req, res, next) {
    if (!client) return res.status(503).json({ ok: false, code: 'AUTH_UNAVAILABLE' });
    const token = /^Bearer\s+(\S+)$/i.exec(String(req.headers.authorization || ''))?.[1];
    if (!token) return res.status(401).json({ ok: false, code: 'AUTH_REQUIRED', erro: 'Sessao ausente.' });
    try {
      const { data, error } = await client.auth.getClaims(token);
      const claims = data?.claims;
      if (error || !claims?.sub || !claims?.session_id || claims.role !== 'authenticated') {
        return res.status(401).json({ ok: false, code: 'INVALID_SESSION' });
      }
      const session = await client.rpc('bet_session_active_r48', {
        p_user_id: claims.sub, p_session_id: claims.session_id
      });
      if (session.error) return res.status(503).json({ ok: false, code: 'SESSION_CHECK_UNAVAILABLE' });
      if (session.data !== true) return res.status(401).json({ ok: false, code: 'SESSION_REVOKED' });
      req.betUser = {
        id: claims.sub, email: String(claims.email || ''), phone: String(claims.phone || ''),
        role: claims.role, user_metadata: claims.user_metadata || {}, app_metadata: claims.app_metadata || {}
      };
      return next();
    } catch { return res.status(503).json({ ok: false, code: 'AUTH_CHECK_UNAVAILABLE' }); }
  };
}
export const autenticarRequest = criarAutenticador(supabaseAdmin);
export async function obterPerfil(user) {
  if (!supabaseAdmin || !user?.id) return null;
  const { data, error } = await supabaseAdmin.from('usuarios')
    .select('user_id,email,nome,is_vip,is_admin,plano,vip_expira,criado_em,atualizado_em')
    .eq('user_id', user.id).maybeSingle();
  if (error) throw new Error('Perfil indisponivel.');
  return data;
}
export const exigirPro = criarGuardaPro(obterPerfil);
export function exigirAdmin(req, res, next) {
  return autenticarRequest(req, res, async () => {
    try {
      const perfil = await obterPerfil(req.betUser);
      if (perfil?.is_admin !== true) return res.status(403).json({ ok: false, code: 'ADMIN_REQUIRED' });
      req.betPerfil = perfil;
      return next();
    } catch { return res.status(503).json({ ok: false, code: 'PROFILE_UNAVAILABLE' }); }
  });
}
export function instalarRotasAuth(app) {
  app.get('/api/auth/health', (_req, res) => res.json({ ok: true, servico: 'BetAnalytics Auth' }));
  app.get('/api/auth/me', autenticarRequest, async (req, res) => {
    try {
      const perfil = await obterPerfil(req.betUser);
      const vip = perfilTemPro(perfil);
      return res.json({ ok: true, perfil: {
        user_id: req.betUser.id, email: req.betUser.email,
        nome: perfil?.nome || req.betUser.user_metadata?.nome || req.betUser.email || 'Usuario',
        is_admin: perfil?.is_admin === true, is_vip: vip, vip,
        plano: vip ? 'PRO' : 'Free', vip_expira: perfil?.vip_expira || null,
        vip_status: vip ? 'ativo' : 'bloqueado'
      } });
    } catch { return res.status(503).json({ ok: false, code: 'PROFILE_UNAVAILABLE' }); }
  });
}
