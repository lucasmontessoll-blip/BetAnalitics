const ADMIN_EMAILS_BETANALYTICS = ['betanlyticspro@gmail.com'];

function emailEhAdmin(email) {
  return ADMIN_EMAILS_BETANALYTICS.includes(String(email || '').toLowerCase());
}

function getLocal(chave, fallback = '') {
  try {
    return localStorage.getItem(chave) || fallback;
  } catch {
    return fallback;
  }
}

function getArray(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function vipExpiraEm(usuario = {}) {
  return (
    usuario?.vip_expira ||
    usuario?.vip_expira_em ||
    usuario?.vencimento ||
    getLocal('bet_vip_expira', '')
  );
}

export function vipAindaValido(data) {
  if (!data) return false;

  const timestamp = new Date(data).getTime();

  if (!Number.isFinite(timestamp)) return false;

  return timestamp > Date.now();
}

export function temAcessoPro(usuario = {}) {
  const marcadoComoVip = Boolean(
    usuario?.is_vip ||
    usuario?.vip ||
    usuario?.plano === 'PRO'
  );

  if (!marcadoComoVip) return false;

  return vipAindaValido(vipExpiraEm(usuario));
}

export function carregarUsuarioSessaoPro() {
  const emailSessao = getLocal('bet_sessao_ativa', '');

  if (!emailSessao) return null;

  const usuarios = getArray('bet_users');
  const salvo = usuarios.find((u) => {
    return String(u?.email || '').toLowerCase() === String(emailSessao).toLowerCase();
  });

  const base = {
    ...(salvo || {}),
    email: emailSessao,
    nome: salvo?.nome || getLocal('bet_user_nome', 'Usuario BetAnalytics'),
    vip_expira: salvo?.vip_expira || salvo?.vip_expira_em || getLocal('bet_vip_expira', ''),
    is_admin: Boolean(salvo?.is_admin || emailEhAdmin(emailSessao))
  };

  const ativo = temAcessoPro(base);

  return {
    ...base,
    is_vip: ativo,
    vip: ativo,
    plano: ativo ? 'PRO' : 'Free',
    vip_status: ativo ? 'ativo' : 'bloqueado'
  };
}

export function usuarioDemoFree() {
  return {
    email: 'demo@betanalytics.pro',
    nome: 'Visitante BetAnalytics',
    is_vip: false,
    vip: false,
    is_admin: true,
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
