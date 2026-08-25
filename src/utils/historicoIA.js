import {
  apiUrl,
} from './apiBase.js';

import {
  sessaoAtual,
} from '../services/authClient.js';

const PREFIXO_CACHE =
  'betanalytics_historico_ia_real_v1:';

function texto(valor) {
  const resultado = String(valor ?? '').trim();
  return resultado || null;
}

function numero(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function cacheKey(userId) {
  return PREFIXO_CACHE + String(userId || 'anon');
}

function carregarCache(userId) {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    const dados = JSON.parse(raw || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarCache(userId, lista) {
  try {
    localStorage.setItem(
      cacheKey(userId),
      JSON.stringify(Array.isArray(lista) ? lista : [])
    );
  } catch {
    // Cache nunca deve quebrar o aplicativo.
  }
}

async function contextoAuth() {
  const sessao = await sessaoAtual();
  const token = sessao?.access_token;
  const userId = sessao?.user?.id;

  if (!token || !userId) return null;

  return {
    token,
    userId,
  };
}

function headers(token) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function idJogo(jogo = {}) {
  return texto(
    jogo?.api_football_id ??
    jogo?.fixture?.id ??
    jogo?.id_jogo ??
    jogo?.id
  );
}

export function criarAnaliseIA(jogo = {}) {
  const fonteConfianca = texto(jogo?.confianca_fonte);
  const confianca = numero(
    jogo?.confianca_ia ??
    jogo?.confiancaIA
  );

  if (
    fonteConfianca !== 'api-football-predictions' ||
    confianca === null ||
    confianca <= 0 ||
    confianca > 100
  ) {
    return null;
  }

  const jogoId = idJogo(jogo);
  if (!jogoId) return null;

  const casa = texto(
    jogo?.home_team ??
    jogo?.time_casa ??
    jogo?.teams?.home?.name
  );

  const fora = texto(
    jogo?.away_team ??
    jogo?.time_fora ??
    jogo?.teams?.away?.name
  );

  const probabilidades = jogo?.probabilidades || {};

  return {
    jogo_id: jogoId,
    fixture_id: numero(
      jogo?.api_football_id ??
      jogo?.fixture?.id
    ),
    jogo: [casa, fora].filter(Boolean).join(' x '),
    casa,
    fora,
    liga: texto(
      jogo?.league_name ??
      jogo?.liga ??
      jogo?.league?.name
    ),
    mercado: texto(
      jogo?.mercado_principal ??
      jogo?.explicacao_ia?.mercado
    ),
    confianca,
    odd: numero(jogo?.odd_principal),
    prob_casa: numero(
      probabilidades?.casa ??
      probabilidades?.home
    ),
    prob_empate: numero(
      probabilidades?.empate ??
      probabilidades?.draw
    ),
    prob_fora: numero(
      probabilidades?.fora ??
      probabilidades?.away
    ),
    fonte_confianca: fonteConfianca,
    fonte_odds: texto(jogo?.odds_fonte),
    partida_em:
      jogo?.starting_at ??
      jogo?.fixture?.date ??
      null,
  };
}

export async function salvarAnaliseIA(jogo) {
  const payload = criarAnaliseIA(jogo);
  if (!payload) return null;

  try {
    const auth = await contextoAuth();
    if (!auth) return null;

    const resp = await fetch(
      apiUrl('/api/historico-ia'),
      {
        method: 'POST',
        headers: headers(auth.token),
        body: JSON.stringify(payload),
      }
    );

    const data = await resp.json().catch(() => null);

    if (!resp.ok || !data?.ok) {
      console.warn(
        'Historico IA nao registrado:',
        data?.erro || `HTTP ${resp.status}`
      );
      return null;
    }

    const item = data.item;

    if (item?.id) {
      const atual = carregarCache(auth.userId);
      const semDuplicar = atual.filter(
        (registro) => registro.id !== item.id
      );

      salvarCache(
        auth.userId,
        [item, ...semDuplicar].slice(0, 200)
      );
    }

    return item || null;
  } catch (e) {
    console.warn(
      'Historico IA indisponivel:',
      e?.message || e
    );
    return null;
  }
}

export async function carregarHistoricoIA() {
  let auth = null;

  try {
    auth = await contextoAuth();
    if (!auth) return [];

    const resp = await fetch(
      apiUrl('/api/historico-ia'),
      {
        headers: headers(auth.token),
      }
    );

    const data = await resp.json().catch(() => null);

    if (!resp.ok || !data?.ok) {
      throw new Error(
        data?.erro || `HTTP ${resp.status}`
      );
    }

    const lista = Array.isArray(data.itens)
      ? data.itens
      : [];

    salvarCache(auth.userId, lista);
    return lista;
  } catch (e) {
    console.warn(
      'Falha ao carregar Historico IA:',
      e?.message || e
    );

    return auth?.userId
      ? carregarCache(auth.userId)
      : [];
  }
}

export async function atualizarStatusAnaliseIA(id, status) {
  const auth = await contextoAuth();

  if (!auth) {
    throw new Error('Sessao ausente.');
  }

  const resp = await fetch(
    apiUrl(
      `/api/historico-ia/${encodeURIComponent(id)}`
    ),
    {
      method: 'PATCH',
      headers: headers(auth.token),
      body: JSON.stringify({ status }),
    }
  );

  const data = await resp.json().catch(() => null);

  if (!resp.ok || !data?.ok) {
    throw new Error(
      data?.erro || 'Falha ao atualizar resultado.'
    );
  }

  const atual = carregarCache(auth.userId);

  const lista = atual.map(
    (item) =>
      item.id === data.item?.id
        ? data.item
        : item
  );

  salvarCache(auth.userId, lista);
  return data.item;
}

export async function limparHistoricoIA() {
  const auth = await contextoAuth();

  if (!auth) {
    throw new Error('Sessao ausente.');
  }

  const resp = await fetch(
    apiUrl('/api/historico-ia'),
    {
      method: 'DELETE',
      headers: headers(auth.token),
    }
  );

  const data = await resp.json().catch(() => null);

  if (!resp.ok || !data?.ok) {
    throw new Error(
      data?.erro || 'Falha ao limpar historico.'
    );
  }

  salvarCache(auth.userId, []);
  return true;
}
