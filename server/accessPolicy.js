export function perfilTemPro(perfil, now = Date.now()) {
  if (perfil?.is_admin === true) return true;
  return perfil?.is_vip === true && Number.isFinite(Date.parse(perfil.vip_expira)) && Date.parse(perfil.vip_expira) > now;
}
export function criarGuardaPro(obterPerfil) {
  return async function exigirPro(req, res, next) {
    if (!req.betUser?.id) return res.status(401).json({ ok: false, code: 'AUTH_REQUIRED' });
    try {
      const perfil = await obterPerfil(req.betUser);
      if (!perfilTemPro(perfil)) return res.status(403).json({ ok: false, code: 'PRO_REQUIRED', erro: 'Plano PRO ativo necessario.' });
      req.betPerfil = perfil;
      return next();
    } catch {
      return res.status(503).json({ ok: false, code: 'PROFILE_UNAVAILABLE', erro: 'Nao foi possivel verificar o plano.' });
    }
  };
}
