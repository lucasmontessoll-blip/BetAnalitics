const ADMIN_EMAIL_OFICIAL = 'betanlyticspro@gmail.com';
const ADMIN_SENHA_OFICIAL = '199Luc@s';
const VIP_ADMIN_EXPIRA = '2099-12-31T23:59:59.000Z';

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function emailEhAdmin(email) {
  return normalizarEmail(email) === ADMIN_EMAIL_OFICIAL;
}

function getLocal(chave, fallback = '') {
  try {
    return localStorage.getItem(chave) || fallback;
  } catch {
    return fallback;
  }
}

function setLocal(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // silencioso
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

function salvarArray(chave, lista) {
  try {
    localStorage.setItem(chave, JSON.stringify(lista));
  } catch {
    // silencioso
  }
}

export function garantirAdminLocal() {
  const usuarios = getArray('bet_users');
  const idx = usuarios.findIndex((u) => normalizarEmail(u?.email) === ADMIN_EMAIL_OFICIAL);
  const atual = idx >= 0 ? usuarios[idx] : {};

  const admin = {
    ...atual,
    nome: atual?.nome || 'Admin BetAnalytics',
    email: ADMIN_EMAIL_OFICIAL,
    senha: ADMIN_SENHA_OFICIAL,
    password: ADMIN_SENHA_OFICIAL,
    is_admin: true,
    admin: true,
    is_vip: true,
    vip: true,
    plano: 'PRO',
    vip_status: 'ativo',
    vip_expira: VIP_ADMIN_EXPIRA,
    vip_expira_em: VIP_ADMIN_EXPIRA,
    vencimento: VIP_ADMIN_EXPIRA
  };

  if (idx >= 0) {
    usuarios[idx] = admin;
  } else {
    usuarios.push(admin);
  }

  salvarArray('bet_users', usuarios);

  return admin;
}

export function vipExpiraEm(usuario = {}) {
  if (emailEhAdmin(usuario?.email)) return VIP_ADMIN_EXPIRA;

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
  if (emailEhAdmin(usuario?.email)) return true;

  const marcadoComoVip = Boolean(
    usuario?.is_vip ||
    usuario?.vip ||
    usuario?.plano === 'PRO'
  );

  if (!marcadoComoVip) return false;

  return vipAindaValido(vipExpiraEm(usuario));
}

export function carregarUsuarioSessaoPro() {
  garantirAdminLocal();

  const emailSessao = getLocal('bet_sessao_ativa', '');

  if (!emailSessao) return null;

  const usuarios = getArray('bet_users');
  let salvo = usuarios.find((u) => normalizarEmail(u?.email) === normalizarEmail(emailSessao));

  if (emailEhAdmin(emailSessao)) {
    salvo = {
      ...salvo,
      ...garantirAdminLocal()
    };
  }

  const admin = emailEhAdmin(emailSessao);

  const base = {
    ...(salvo || {}),
    email: emailSessao,
    nome: salvo?.nome || (admin ? 'Admin BetAnalytics' : getLocal('bet_user_nome', 'Usuario BetAnalytics')),
    vip_expira: admin ? VIP_ADMIN_EXPIRA : (salvo?.vip_expira || salvo?.vip_expira_em || getLocal('bet_vip_expira', '')),
    is_admin: Boolean(admin || salvo?.is_admin)
  };

  const ativo = admin || temAcessoPro(base);

  if (admin) {
    setLocal('bet_vip_expira', VIP_ADMIN_EXPIRA);
  }

  return {
    ...base,
    is_vip: ativo,
    vip: ativo,
    plano: ativo ? 'PRO' : 'Free',
    vip_status: ativo ? 'ativo' : 'bloqueado'
  };
}

export function usuarioDemoFree() {
  garantirAdminLocal();

  return {
    email: 'demo@betanalytics.pro',
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
