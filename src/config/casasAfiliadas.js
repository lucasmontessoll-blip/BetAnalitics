export const CASAS_AFILIADAS = [
  {
    id: 'bet365',
    nome: 'Bet365',
    odd: '1.85',
    tag: 'Popular',
    destaque: false,
    url: 'COLE_AQUI_SEU_LINK_AFILIADO_BET365?subid={CLICK_ID}',
  },
  {
    id: 'betano',
    nome: 'Betano',
    odd: '1.90',
    tag: 'Brasil',
    destaque: false,
    url: 'COLE_AQUI_SEU_LINK_AFILIADO_BETANO?subid={CLICK_ID}',
  },
  {
    id: 'kto',
    nome: 'KTO',
    odd: '1.95',
    tag: 'Odds',
    destaque: false,
    url: 'COLE_AQUI_SEU_LINK_AFILIADO_KTO?subid={CLICK_ID}',
  },
  {
    id: '1xbet',
    nome: '1xBet',
    odd: '1.92',
    tag: 'Global',
    destaque: false,
    url: 'COLE_AQUI_SEU_LINK_AFILIADO_1XBET?subid={CLICK_ID}',
  },
  {
    id: 'pinnacle',
    nome: 'Pinnacle',
    odd: '2.05',
    tag: 'Maior Odd',
    destaque: true,
    url: 'COLE_AQUI_SEU_LINK_AFILIADO_PINNACLE?subid={CLICK_ID}',
  },
];
export function gerarClickIdAfiliado(casaId = 'casa') {
  const rand = Math.random().toString(36).slice(2, 10);
  return `betanalytics_${casaId}_${Date.now()}_${rand}`;
}
export function montarUrlAfiliado(casa, clickId) {
  const base = String(casa?.url || '').trim();
  if (!base || base.startsWith('COLE_AQUI') || base.startsWith('#')) {
    return '';
  }
  if (base.includes('{CLICK_ID}')) {
    return base.replaceAll('{CLICK_ID}', encodeURIComponent(clickId));
  }
  try {
    const url = new URL(base);
    url.searchParams.set('subid', clickId);
    url.searchParams.set('utm_source', 'betanalytics');
    url.searchParams.set('utm_medium', 'app');
    url.searchParams.set('utm_campaign', casa?.id || 'casa');
    return url.toString();
  } catch (e) {
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}subid=${encodeURIComponent(clickId)}&utm_source=betanalytics&utm_medium=app`;
  }
}
