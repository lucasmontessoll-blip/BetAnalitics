import { createClient } from '@supabase/supabase-js';

function env(name) {
  return String(process.env[name] || '').trim();
}

const supabaseUrl = env('SUPABASE_URL');
const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

export async function autenticarRequest(req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        ok: false,
        erro:
          'Supabase backend não configurado.'
      });
    }

    const token =
      bearer(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        erro:
          'Sessão ausente.'
      });
    }

    /*
     * Preferimos getClaims:
     *
     * - valida assinatura e expiração;
     * - usa JWKS cacheado quando o projeto
     *   utiliza chave assimétrica;
     * - evita getUser remoto em cada request;
     * - em projetos legados/simétricos,
     *   o próprio Supabase faz validação remota.
     */
    if (
      typeof supabaseAdmin.auth
        ?.getClaims === 'function'
    ) {
      const {
        data,
        error
      } =
        await supabaseAdmin.auth
          .getClaims(token);

      const claims =
        data?.claims;

      if (
        error ||
        !claims?.sub
      ) {
        return res.status(401).json({
          ok: false,
          erro:
            'Sessão inválida ou expirada.'
        });
      }

      req.betUser = {
        id:
          String(
            claims.sub
          ),

        email:
          String(
            claims.email ||
            ''
          ),

        phone:
          String(
            claims.phone ||
            ''
          ),

        role:
          String(
            claims.role ||
            'authenticated'
          ),

        user_metadata:
          claims.user_metadata &&
          typeof claims.user_metadata ===
            'object'
            ? claims.user_metadata
            : {},

        app_metadata:
          claims.app_metadata &&
          typeof claims.app_metadata ===
            'object'
            ? claims.app_metadata
            : {}
      };

      return next();
    }

    /*
     * Fallback defensivo caso uma versão
     * antiga do SDK não possua getClaims.
     */
    const {
      data,
      error
    } =
      await supabaseAdmin.auth
        .getUser(token);

    if (
      error ||
      !data?.user
    ) {
      return res.status(401).json({
        ok: false,
        erro:
          'Sessão inválida ou expirada.'
      });
    }

    req.betUser =
      data.user;

    return next();
  }
  catch (e) {
    return res.status(401).json({
      ok: false,

      erro:
        e?.message ||
        'Falha de autenticação.'
    });
  }
}

export async function obterPerfil(user) {
  if (!supabaseAdmin || !user) return null;

  let { data } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data && user.email) {
    const fallback = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', user.email.toLowerCase())
      .maybeSingle();

    data = fallback.data || null;

    if (data && !data.user_id) {
      const atualizado = await supabaseAdmin
        .from('usuarios')
        .update({ user_id: user.id })
        .eq('email', user.email.toLowerCase())
        .select('*')
        .maybeSingle();
      data = atualizado.data || data;
    }
  }

  return data;
}

export async function exigirAdmin(req, res, next) {
  return autenticarRequest(req, res, async () => {
    const perfil = await obterPerfil(req.betUser);
    if (!perfil?.is_admin) {
      return res.status(403).json({ ok: false, erro: 'Acesso administrativo negado.' });
    }
    req.betPerfil = perfil;
    next();
  });
}

export function instalarRotasAuth(app) {
  app.get('/api/auth/health', (_req, res) => {
    res.json({
      ok: true,

      configurado:
        Boolean(
          supabaseAdmin
        ),

      validacao_jwt:
        typeof supabaseAdmin
          ?.auth
          ?.getClaims ===
          'function'
          ? 'getClaims'
          : 'getUser-fallback'
    });
  });

  app.get('/api/auth/me', autenticarRequest, async (req, res) => {
    try {
      const perfil = await obterPerfil(req.betUser);

      const vipExpira = perfil?.vip_expira ? new Date(perfil.vip_expira).getTime() : 0;
      const vipAtivo = Boolean(
        perfil?.is_admin ||
        (perfil?.is_vip && vipExpira > Date.now())
      );

      return res.json({
        ok: true,
        perfil: {
          ...(perfil || {}),
          user_id: req.betUser.id,
          email: req.betUser.email || perfil?.email || '',
          nome: perfil?.nome || req.betUser.user_metadata?.nome || req.betUser.email || 'Usuário',
          is_vip: vipAtivo,
          vip: vipAtivo,
          plano: vipAtivo ? 'PRO' : 'Free',
          vip_status: vipAtivo ? 'ativo' : 'bloqueado'
        }
      });
    } catch (e) {
      return res.status(500).json({ ok: false, erro: e?.message || 'Falha ao carregar perfil.' });
    }
  });
}
