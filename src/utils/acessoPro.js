const VIP_ADMIN_EXPIRA = '2099-12-31T23:59:59.000Z';

function perfilMemoria() {
  if (typeof window === 'undefined') return null;
  return window.__BET_AUTH_PROFILE__ || null;
}

export function vipExpiraEm(usuario = {}) {
  return usuario?.vip_expira || usuario?.vip_expira_em || usuario?.vencimento || '';
}

export function vipAindaValido(data) {
  if (!data) return false;
  const timestamp = new Date(data).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

export function temAcessoPro(usuario = {}) {
  const perfil = Object.keys(usuario || {}).length ? usuario : (perfilMemoria() || {});
  if (perfil?.is_admin === true) return true;

  const marcado = Boolean(
    perfil?.is_vip === true ||
    perfil?.vip === true ||
    String(perfil?.plano || '').toUpperCase() === 'PRO'
  );

  if (!marcado) return false;

  const expira = vipExpiraEm(perfil);
  return expira ? vipAindaValido(expira) : false;
}

export function carregarUsuarioSessaoPro() {
  const perfil = perfilMemoria();
  if (!perfil) return null;

  const ativo = temAcessoPro(perfil);

  return {
    ...perfil,
    is_vip: ativo,
    vip: ativo,
    plano: ativo ? 'PRO' : 'Free',
    vip_status: ativo ? 'ativo' : 'bloqueado'
  };
}

export function usuarioDemoFree() {
  return {
    email: '',
    nome: 'Visitante BetAnalytics',
    is_vip: false,
    vip: false,
    is_admin: false,
    plano: 'Free',
    vip_status: 'bloqueado'
  };
}

export function rotaExigePro(viewMode) {
  const rota = String(viewMode || '').toLowerCase();
  return [
    'radar',
    'radarpro',
    'historico',
    'banca',
    'banca-pro',
    'performance-ia',
    'alertas-ia',
    'favoritos'
  ].includes(rota);
}

// Compatibilidade: removido o antigo admin local.
// Admin agora é definido somente na tabela public.usuarios.
export function garantirAdminLocal() {
  return null;
}

export { VIP_ADMIN_EXPIRA };
