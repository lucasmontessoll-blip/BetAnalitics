const CHAVE = 'betanalytics_historico_ia_v1';

function texto(valor, fallback = '') {
  return String(valor || fallback || '').trim();
}

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function pegarIdJogo(jogo) {
  const id =
    jogo?.id ||
    jogo?.fixture?.id ||
    jogo?.id_jogo ||
    `${jogo?.home_team || jogo?.time_casa || 'casa'}-${jogo?.away_team || jogo?.time_fora || 'fora'}`;

  return texto(id, `jogo-${Date.now()}`);
}

export function carregarHistoricoIA() {
  try {
    const raw = localStorage.getItem(CHAVE);
    const dados = JSON.parse(raw || '[]');

    if (Array.isArray(dados)) {
      return dados;
    }

    return [];
  } catch {
    return [];
  }
}

export function salvarHistoricoIA(lista) {
  try {
    const dados = Array.isArray(lista) ? lista : [];
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Mantem o app funcionando mesmo se o navegador bloquear localStorage.
  }
}

export function criarAnaliseIA(jogo) {
  const casa = texto(
    jogo?.home_team ||
    jogo?.time_casa ||
    jogo?.teams?.home?.name,
    'Time Casa'
  );

  const fora = texto(
    jogo?.away_team ||
    jogo?.time_fora ||
    jogo?.teams?.away?.name,
    'Time Fora'
  );

  const confianca =
    numero(jogo?.confianca_ia, 0) ||
    numero(jogo?.ia_confidence, 0) ||
    numero(jogo?.confidence, 0) ||
    87;

  const odd =
    numero(jogo?.odd_principal, 0) ||
    numero(jogo?.odd, 0) ||
    numero(jogo?.odds?.home, 0) ||
    1.85;

  const mercado = texto(
    jogo?.mercado_principal ||
    jogo?.mercado ||
    jogo?.market,
    'Mais de 1.5 gols'
  );

  const ev = Number((((confianca / 100) * odd - 1) * 100).toFixed(1));
  const jogoId = pegarIdJogo(jogo);

  return {
    id: `${jogoId}-${Date.now()}`,
    jogoId,
    jogo: `${casa} x ${fora}`,
    casa,
    fora,
    liga: texto(jogo?.league || jogo?.liga || jogo?.league_name, 'Liga PRO'),
    mercado,
    confianca: Math.round(Math.max(1, Math.min(99, confianca))),
    odd: Number(odd),
    ev,
    status: 'pendente',
    stake: 50,
    lucro: 0,
    criadoEm: new Date().toISOString()
  };
}

export function salvarAnaliseIA(jogo) {
  if (!jogo) {
    return null;
  }

  const nova = criarAnaliseIA(jogo);
  const atual = carregarHistoricoIA();

  const jaExiste = atual.some((item) => {
    const mesmoJogo = item.jogoId === nova.jogoId;
    const tempoItem = new Date(item.criadoEm || 0).getTime();
    const agora = Date.now();

    return mesmoJogo && agora - tempoItem < 1000 * 60 * 10;
  });

  if (jaExiste) {
    return null;
  }

  const lista = [nova, ...atual].slice(0, 80);
  salvarHistoricoIA(lista);

  return nova;
}

export function atualizarStatusAnaliseIA(id, status) {
  const lista = carregarHistoricoIA();

  const atualizada = lista.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const odd = numero(item.odd, 1.85);
    const stake = numero(item.stake, 50);

    let lucro = 0;

    if (status === 'green') {
      lucro = Number(((stake * odd) - stake).toFixed(2));
    }

    if (status === 'red') {
      lucro = -stake;
    }

    return {
      ...item,
      status,
      lucro,
      atualizadoEm: new Date().toISOString()
    };
  });

  salvarHistoricoIA(atualizada);
  return atualizada;
}

export function limparHistoricoIA() {
  salvarHistoricoIA([]);
}
