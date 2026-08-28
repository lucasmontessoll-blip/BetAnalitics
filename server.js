import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import {
  instalarRotasAuth,
  autenticarRequest,
} from './server/authSupabase.js';
import { instalarRotasRecuperacaoSenha } from './server/passwordRecovery.js';
import { instalarRotasHistoricoIA } from './server/historicoIA.js';
import { instalarRotasPush } from './server/pushNotifications.js';
import { instalarWebhookMercadoPago } from './server/paymentWebhook.js'; // Garante a leitura do arquivo .env no backend
import { instalarRotasHistoricalEngine } from './server/historicalEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* BET_ETAPA_35B_CORS_PRODUCAO_INICIO */
const BET_CORS_ORIGENS_PADRAO = [
  process.env.RENDER_EXTERNAL_URL,
  'https://betanalitics-webservice.onrender.com',
  'http://localhost:5173',
  'http://localhost',
  'capacitor://localhost'
].filter(Boolean);

const BET_CORS_ORIGENS = new Set(
  String(
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.ALLOWED_ORIGINS ||
    BET_CORS_ORIGENS_PADRAO.join(',')
  )
    .split(',')
    .map((origem) => origem.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

/* BET_ETAPA_35C_CORS_NATIVO_INICIO */
const BET_CORS_ORIGENS_NATIVAS = new Set([
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
  'ionic://localhost'
]);

function betCorsPermitido(origem) {
  if (!origem) return true;
  const normalizada = String(origem).replace(/\/$/, '');
  return (
    BET_CORS_ORIGENS.has(normalizada) ||
    BET_CORS_ORIGENS_NATIVAS.has(normalizada)
  );
}
/* BET_ETAPA_35C_CORS_NATIVO_FIM */

app.use(
  cors({
    origin(origem, callback) {
      callback(null, betCorsPermitido(origem));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204
  })
);
/* BET_ETAPA_35B_CORS_PRODUCAO_FIM */


// ===== BET_RENDER_PAGAMENTO_FIX_INICIO =====
app.use(express.json({ limit: '2mb' }));
instalarRotasAuth(app);
instalarRotasRecuperacaoSenha(app);
instalarRotasHistoricoIA(app);
instalarRotasPush(app);
instalarWebhookMercadoPago(app);

function betMpToken() {
  return String(
    process.env.MP_ACCESS_TOKEN ||
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    ''
  ).trim();
}

function betNumero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function betCpf(valor) {
  return String(valor || '').replace(/\D/g, '').slice(0, 11);
}

function betNome(valor) {
  return String(valor || 'Cliente BetAnalytics').trim();
}

function betEmail(valor) {
  return String(valor || 'cliente@betanalytics.pro').trim().toLowerCase();
}

function betDescricao(valor) {
  return String(valor || 'Plano PRO BetAnalytics').trim();
}

function betIdempotency() {
  return `betanalytics-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

app.get('/api/pagamento/health', (req, res) => {
  return res.status(200).json({
    ok: true,
    servico: 'BetAnalytics Pagamento',
    mercado_pago_configurado: Boolean(betMpToken()),
    plano_valor: betNumero(process.env.PLANO_PRO_VALOR, 29.90),
    ambiente: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/pagamento/pix', async (req, res) => {
  try {
    const token = betMpToken();

    if (!token) {
      return res.status(500).json({
        ok: false,
        erro: 'MP_ACCESS_TOKEN nao configurado no servidor.'
      });
    }

    const body = req.body || {};
    const valor = betNumero(process.env.PLANO_PRO_VALOR, 29.90);
    const nome = betNome(body.nome);
    const email = betEmail(body.email);
    const cpf = betCpf(body.cpf);
    const descricao = betDescricao(process.env.PLANO_PRO_DESCRICAO || 'Plano PRO BetAnalytics');

    if (!email.includes('@')) {
      return res.status(400).json({
        ok: false,
        erro: 'E-mail invalido.'
      });
    }

    if (cpf.length !== 11) {
      return res.status(400).json({
        ok: false,
        erro: 'CPF invalido. Informe 11 numeros.'
      });
    }

    const payload = {
      transaction_amount: Number(valor.toFixed(2)),
      description: descricao,
      payment_method_id: 'pix',
      external_reference: 'betanalytics-pro-mensal',
      metadata: {
        betanalytics_plan: 'pro_mensal'
      },
      payer: {
        email,
        first_name: nome,
        identification: {
          type: 'CPF',
          number: cpf
        }
      }
    };

    const resposta = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': betIdempotency()
      },
      body: JSON.stringify(payload)
    });

    const data = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      return res.status(resposta.status || 500).json({
        ok: false,
        erro: data?.message || data?.error || 'Erro ao gerar PIX no Mercado Pago.',
        detalhe: data
      });
    }

    const tx =
      data?.point_of_interaction?.transaction_data ||
      data?.transaction_data ||
      {};

    return res.status(201).json({
      ok: true,
      id: data.id,
      payment_id: data.id,
      status: data.status || 'pending',
      status_detail: data.status_detail || '',
      qr_code: tx.qr_code || data.qr_code || '',
      qr_code_base64: tx.qr_code_base64 || data.qr_code_base64 || '',
      ticket_url: tx.ticket_url || data.ticket_url || '',
      valor,
      metodo: 'pix'
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      erro: err?.message || 'Erro interno ao gerar PIX.'
    });
  }
});

app.post('/api/pagamento/cartao', async (req, res) => {
  try {
    const accessToken = betMpToken();

    if (!accessToken) {
      return res.status(500).json({
        ok: false,
        erro: 'MP_ACCESS_TOKEN nao configurado no servidor.'
      });
    }

    const body = req.body || {};

    const valor =
      betNumero(
        process.env.PLANO_PRO_VALOR,
        29.90
      );

    const nome = betNome(body.nome);
    const email = betEmail(body.email);
    const cpf = betCpf(body.cpf);

    const cardToken =
      String(body.token || '').trim();

    const paymentMethodId =
      String(
        body.paymentMethodId ||
        body.payment_method_id ||
        ''
      ).trim();

    const issuerId =
      String(
        body.issuerId ||
        body.issuer_id ||
        ''
      ).trim();

    const installments =
      Math.max(
        1,
        Math.trunc(
          betNumero(body.installments, 1)
        )
      );

    if (!email.includes('@')) {
      return res.status(400).json({
        ok: false,
        erro: 'E-mail invalido.'
      });
    }

    if (cpf.length !== 11) {
      return res.status(400).json({
        ok: false,
        erro: 'CPF invalido.'
      });
    }

    if (!cardToken || !paymentMethodId) {
      return res.status(400).json({
        ok: false,
        erro: 'Token ou metodo do cartao ausente.'
      });
    }

    const payload = {
      transaction_amount:
        Number(valor.toFixed(2)),

      token: cardToken,

      description:
        betDescricao(
          process.env.PLANO_PRO_DESCRICAO ||
          'Plano PRO BetAnalytics'
        ),

      installments,

      payment_method_id:
        paymentMethodId,

      external_reference:
        'betanalytics-pro-mensal',

      metadata: {
        betanalytics_plan:
          'pro_mensal'
      },

      payer: {
        email,
        first_name: nome,
        identification: {
          type: 'CPF',
          number: cpf
        }
      }
    };

    if (issuerId) {
      payload.issuer_id = issuerId;
    }

    const resposta =
      await fetch(
        'https://api.mercadopago.com/v1/payments',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
            'Content-Type':
              'application/json',
            'X-Idempotency-Key':
              betIdempotency()
          },
          body:
            JSON.stringify(payload)
        }
      );

    const data =
      await resposta.json()
        .catch(() => ({}));

    if (!resposta.ok) {
      return res
        .status(resposta.status || 500)
        .json({
          ok: false,
          erro:
            data?.message ||
            data?.error ||
            'Pagamento recusado.',
          detalhe: data
        });
    }

    return res.status(201).json({
      ok: true,
      id: data.id,
      payment_id: data.id,
      status:
        data.status || 'pending',
      status_detail:
        data.status_detail || '',
      aprovado:
        data.status === 'approved',
      metodo:
        data.payment_method_id || '',
      valor:
        data.transaction_amount || valor
    });
  }
  catch (err) {
    return res.status(500).json({
      ok: false,
      erro:
        err?.message ||
        'Erro interno no pagamento.'
    });
  }
});
app.get('/api/pagamento/status/:id', async (req, res) => {
  try {
    const token = betMpToken();

    if (!token) {
      return res.status(500).json({
        ok: false,
        erro: 'MP_ACCESS_TOKEN nao configurado no servidor.'
      });
    }

    const id = String(req.params.id || '').trim();

    if (!id) {
      return res.status(400).json({
        ok: false,
        erro: 'ID do pagamento nao informado.'
      });
    }

    const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      return res.status(resposta.status || 500).json({
        ok: false,
        erro: data?.message || data?.error || 'Erro ao consultar pagamento.',
        detalhe: data
      });
    }

    return res.status(200).json({
      ok: true,
      id: data.id,
      payment_id: data.id,
      status: data.status || 'pending',
      status_detail: data.status_detail || '',
      aprovado: data.status === 'approved',
      metodo: data.payment_method_id || data.payment_type_id || '',
      valor: data.transaction_amount || 0
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      erro: err?.message || 'Erro interno ao consultar pagamento.'
    });
  }
});
// ===== BET_RENDER_PAGAMENTO_FIX_FIM =====

/* CORS centralizado pela ETAPA 35B. */
app.use(express.json());

// ===== INICIO API-FOOTBALL BETANALYTICS =====
const API_FOOTBALL_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || process.env.API_FOOTBALL_TOKEN || process.env.APIFOOTBALL_KEY;

const apiFootballCache = new Map();
const apiFootballInflight = new Map();

function apiFootballInteiroPositivo(valor, fallback) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    return fallback;
  }

  return Math.floor(numero);
}

const API_FOOTBALL_REQUESTS_PER_MINUTE =
  apiFootballInteiroPositivo(
    process.env.API_FOOTBALL_REQUESTS_PER_MINUTE,
    10
  );

const API_FOOTBALL_DAILY_BUDGET =
  apiFootballInteiroPositivo(
    process.env.API_FOOTBALL_DAILY_BUDGET,
    90
  );

let apiFootballMinuteInicio = Date.now();
let apiFootballMinuteCount = 0;

let apiFootballDayKey =
  new Date().toISOString().slice(0, 10);

let apiFootballDayCount = 0;

function apiFootballAtualizarJanelas() {
  const agora = Date.now();

  if (
    agora - apiFootballMinuteInicio >=
    60 * 1000
  ) {
    apiFootballMinuteInicio = agora;
    apiFootballMinuteCount = 0;
  }

  const hoje =
    new Date(agora)
      .toISOString()
      .slice(0, 10);

  if (hoje !== apiFootballDayKey) {
    apiFootballDayKey = hoje;
    apiFootballDayCount = 0;
  }
}

function apiFootballConsumirQuota() {
  apiFootballAtualizarJanelas();

  if (
    apiFootballMinuteCount >=
    API_FOOTBALL_REQUESTS_PER_MINUTE
  ) {
    const erro =
      new Error(
        'Limite temporário de consultas à API-Football atingido.'
      );

    erro.status = 429;
    erro.code = 'API_FOOTBALL_RATE_LIMIT';

    throw erro;
  }

  if (
    apiFootballDayCount >=
    API_FOOTBALL_DAILY_BUDGET
  ) {
    const erro =
      new Error(
        'Orçamento diário de consultas à API-Football atingido.'
      );

    erro.status = 429;
    erro.code = 'API_FOOTBALL_DAILY_BUDGET';

    throw erro;
  }

  apiFootballMinuteCount += 1;
  apiFootballDayCount += 1;
}

function apiFootballQuotaStatus() {
  apiFootballAtualizarJanelas();

  return {
    requests_per_minute:
      API_FOOTBALL_REQUESTS_PER_MINUTE,

    requests_minute_used:
      apiFootballMinuteCount,

    daily_budget:
      API_FOOTBALL_DAILY_BUDGET,

    daily_used:
      apiFootballDayCount,

    daily_remaining:
      Math.max(
        0,
        API_FOOTBALL_DAILY_BUDGET -
          apiFootballDayCount
      ),

    cache_entries:
      apiFootballCache.size,

    inflight:
      apiFootballInflight.size
  };
}

function apiFootballCacheKey(pathname, params = {}) {
  const clean = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return `${pathname}?${new URLSearchParams(clean.map(([k, v]) => [k, String(v)])).toString()}`;
}

function apiFootballTTL(pathname, params = {}) {
  if (params.live === 'all') return 15000;
  if (pathname.includes('/fixtures/events')) return 15000;
  if (pathname.includes('/fixtures/statistics')) return 15000;
  if (pathname.includes('/odds/live')) return 15000;
  if (pathname.includes('/odds')) return 60000;
  if (pathname.includes('/standings')) return 600000;
  if (pathname.includes('/teams')) return 600000;
  return 45000;
}

async function apiFootballRequest(pathname, params = {}) {
  if (!API_FOOTBALL_KEY) {
    const err =
      new Error(
        'API_FOOTBALL_KEY não configurada no servidor.'
      );

    err.status = 500;
    throw err;
  }

  const key =
    apiFootballCacheKey(
      pathname,
      params
    );

  const cached =
    apiFootballCache.get(key);

  const ttl =
    apiFootballTTL(
      pathname,
      params
    );

  if (
    cached &&
    Date.now() - cached.createdAt < ttl
  ) {
    return cached.data;
  }

  const emAndamento =
    apiFootballInflight.get(key);

  if (emAndamento) {
    return emAndamento;
  }

  const requisicao = (async () => {
    apiFootballConsumirQuota();

    const url =
      new URL(
        `${API_FOOTBALL_BASE_URL}${pathname}`
      );

    Object.entries(params)
      .forEach(([k, v]) => {
        if (
          v !== undefined &&
          v !== null &&
          v !== ''
        ) {
          url.searchParams.set(
            k,
            String(v)
          );
        }
      });

    const resp =
      await fetch(
        url.toString(),
        {
          method: 'GET',

          headers: {
            'x-apisports-key':
              API_FOOTBALL_KEY,

            Accept:
              'application/json'
          }
        }
      );

    const data =
      await resp
        .json()
        .catch(() => null);

    if (!resp.ok) {
      const err =
        new Error(
          data?.message ||
          data?.errors?.token ||
          data?.errors?.requests ||
          `Erro API-Football ${resp.status}`
        );

      err.status = resp.status;
      err.payload = data;

      throw err;
    }

    apiFootballCache.set(
      key,
      {
        createdAt: Date.now(),
        data
      }
    );

    if (apiFootballCache.size > 2000) {
      const maisAntiga =
        apiFootballCache
          .keys()
          .next()
          .value;

      if (maisAntiga) {
        apiFootballCache.delete(
          maisAntiga
        );
      }
    }

    return data;
  })();

  apiFootballInflight.set(
    key,
    requisicao
  );

  try {
    return await requisicao;
  }
  finally {
    if (
      apiFootballInflight.get(key) ===
      requisicao
    ) {
      apiFootballInflight.delete(key);
    }
  }
}

instalarRotasHistoricalEngine(app, {
  request: apiFootballRequest,
  configurado: () => Boolean(API_FOOTBALL_KEY),
  autenticar: autenticarRequest,
});
app.get('/api/football/health', (req, res) => {
  res.json({
    ok: true,
    fonte: 'api-football',
    configurado: Boolean(API_FOOTBALL_KEY),
    baseUrl: API_FOOTBALL_BASE_URL,
    protecao: apiFootballQuotaStatus(),
  });
});

app.get('/api/football/jogos', async (req, res) => {
  try {
    // MODO_DEMO_SEM_CHAVE_JOGOS
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        count: 0,
        jogos: [],
        response: []
      });
    }

    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const league = req.query.league || undefined;
    const season = req.query.season || new Date(date).getFullYear();
    const live = req.query.live === 'all' || req.query.live === 'true';

    const params = live
      ? { live: 'all', league }
      : { date, league, season };

    const payload = await apiFootballRequest('/fixtures', params);

    res.json({
      ok: true,
      fonte: 'api-football',
      count: payload?.response?.length || 0,
      jogos: payload?.response || [],
    });
  } catch (e) {
    console.error('[API-Football jogos]', e);
    res.status(e.status || 500).json({
      ok: false,
      fonte: 'api-football',
      erro: e.message || 'Erro ao consultar jogos.',
    });
  }
});

app.get(
  '/api/football/jogo/:fixtureId',
  autenticarRequest,
  async (req, res) => {
  try {
    // MODO_DEMO_SEM_CHAVE_JOGO
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        fixture: null,
        statistics: [],
        events: [],
        lineups: [],
        players: [],
        odds: [],
        oddsLive: [],
        injuries: [],
        h2h: [],
        predictions: null
      });
    }

    const fixtureId = req.params.fixtureId;

    const [fixture, statistics, events, lineups, players, predictions, odds] = await Promise.allSettled([
      apiFootballRequest('/fixtures', { id: fixtureId }),
      apiFootballRequest('/fixtures/statistics', { fixture: fixtureId }),
      apiFootballRequest('/fixtures/events', { fixture: fixtureId }),
      apiFootballRequest('/fixtures/lineups', { fixture: fixtureId }),
      apiFootballRequest('/fixtures/players', { fixture: fixtureId }),
      apiFootballRequest('/predictions', { fixture: fixtureId }),
      apiFootballRequest('/odds', { fixture: fixtureId }),
    ]);

    res.json({
      ok: true,
      fonte: 'api-football',
      fixture: fixture.status === 'fulfilled' ? fixture.value?.response?.[0] || null : null,
      statistics: statistics.status === 'fulfilled' ? statistics.value?.response || [] : [],
      events: events.status === 'fulfilled' ? events.value?.response || [] : [],
      lineups: lineups.status === 'fulfilled' ? lineups.value?.response || [] : [],
      players: players.status === 'fulfilled' ? players.value?.response || [] : [],
      odds: odds.status === 'fulfilled' ? odds.value?.response || [] : [],
      oddsLive: [],
      injuries: [],
      h2h: [],
      predictions: predictions.status === 'fulfilled' ? predictions.value?.response?.[0] || null : null,
    });
  } catch (e) {
    console.error('[API-Football jogo]', e);
    res.status(e.status || 500).json({
      ok: false,
      erro: e.message || 'Erro ao consultar detalhes do jogo.',
    });
  }
});

/* BET_ETAPA_38B_RADAR_ODDS_REAL */
app.get(
  '/api/football/radar-odds',
  autenticarRequest,
  async (req, res) => {
  try {
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        configurado: false,
        count: 0,
        itens: [],
      });
    }

    const ids = [
      ...new Set(
        String(req.query.ids || '')
          .split(',')
          .map((id) => id.trim())
          .filter((id) => /^\d+$/.test(id))
      ),
    ].slice(0, 5);

    if (ids.length === 0) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        configurado: true,
        count: 0,
        itens: [],
      });
    }

    const itens = await Promise.all(
      ids.map(async (fixtureId) => {
        const [predictions, odds] = await Promise.allSettled([
          apiFootballRequest('/predictions', { fixture: fixtureId }),
          apiFootballRequest('/odds', { fixture: fixtureId }),
        ]);

        const prediction =
          predictions.status === 'fulfilled'
            ? predictions.value?.response?.[0] || null
            : null;

        const oddsResponse =
          odds.status === 'fulfilled'
            ? odds.value?.response || []
            : [];

        return {
          fixture_id: Number(fixtureId),
          predictions: prediction,
          odds: oddsResponse,
          predictions_disponiveis: Boolean(prediction),
          odds_disponiveis: oddsResponse.length > 0,
        };
      })
    );

    return res.json({
      ok: true,
      fonte: 'api-football',
      configurado: true,
      count: itens.length,
      itens,
    });
  }
  catch (e) {
    console.error('[API-Football radar odds]', e);

    return res.status(e.status || 500).json({
      ok: false,
      fonte: 'api-football',
      erro: e.message || 'Erro ao consultar radar de odds.',
    });
  }
});
app.get('/api/football/classificacao', async (req, res) => {
  try {
    // MODO_DEMO_SEM_CHAVE_CLASSIFICACAO
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        standings: []
      });
    }

    const league = req.query.league;
    const season = req.query.season || new Date().getFullYear();

    if (!league) {
      return res.status(400).json({ ok: false, erro: 'Informe league.' });
    }

    const payload = await apiFootballRequest('/standings', { league, season });

    res.json({
      ok: true,
      fonte: 'api-football',
      standings: payload?.response || [],
    });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, erro: e.message || 'Erro ao consultar classificação.' });
  }
});

app.get('/api/football/time/:teamId', async (req, res) => {
  try {
    const team = req.params.teamId;
    const league = req.query.league;
    const season = req.query.season || new Date().getFullYear();

    const [teamPayload, squadPayload, statsPayload] = await Promise.allSettled([
      apiFootballRequest('/teams', { id: team }),
      apiFootballRequest('/players/squads', { team }),
      league ? apiFootballRequest('/teams/statistics', { team, league, season }) : Promise.resolve(null),
    ]);

    res.json({
      ok: true,
      fonte: 'api-football',
      team: teamPayload.status === 'fulfilled' ? teamPayload.value?.response?.[0] || null : null,
      squad: squadPayload.status === 'fulfilled' ? squadPayload.value?.response?.[0] || null : null,
      statistics: statsPayload.status === 'fulfilled' ? statsPayload.value?.response || null : null,
    });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, erro: e.message || 'Erro ao consultar equipe.' });
  }
});

app.get('/api/football/jogador/:playerId', async (req, res) => {
  try {
    const id = req.params.playerId;
    const season = req.query.season || new Date().getFullYear();

    const payload = await apiFootballRequest('/players', {
      id,
      season,
      team: req.query.team || undefined,
      league: req.query.league || undefined,
    });

    res.json({
      ok: true,
      fonte: 'api-football',
      player: payload?.response?.[0] || null,
    });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, erro: e.message || 'Erro ao consultar jogador.' });
  }
});

app.get(
  '/api/football/pacote-completo/:fixtureId',
  autenticarRequest,
  async (req, res) => {
  try {
    // MODO_DEMO_SEM_CHAVE_PACOTE
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        fixture: null,
        statistics: [],
        events: [],
        lineups: [],
        players: [],
        injuries: [],
        predictions: null,
        odds: [],
        oddsLive: [],
        h2h: []
      });
    }

    const fixtureId = req.params.fixtureId;
    const league = req.query.league || undefined;
    const season = req.query.season || new Date().getFullYear();
    const home = req.query.home || undefined;
    const away = req.query.away || undefined;

    const calls = [
      apiFootballRequest('/fixtures', { id: fixtureId }),
      apiFootballRequest('/fixtures/statistics', { fixture: fixtureId }),
      apiFootballRequest('/fixtures/events', { fixture: fixtureId }),
      apiFootballRequest('/fixtures/lineups', { fixture: fixtureId }),
      apiFootballRequest('/fixtures/players', { fixture: fixtureId }),
      apiFootballRequest('/injuries', { fixture: fixtureId }),
      apiFootballRequest('/predictions', { fixture: fixtureId }),
      apiFootballRequest('/odds', { fixture: fixtureId, league, season }),
      apiFootballRequest('/odds/live', { fixture: fixtureId, league }),
      home && away ? apiFootballRequest('/fixtures/headtohead', { h2h: `${home}-${away}`, last: 10 }) : Promise.resolve({ response: [] }),
    ];

    const [
      fixture, statistics, events, lineups, players,
      injuries, predictions, odds, oddsLive, h2h,
    ] = await Promise.allSettled(calls);

    res.json({
      ok: true,
      fonte: 'api-football',
      fixture: fixture.status === 'fulfilled' ? fixture.value?.response?.[0] || null : null,
      statistics: statistics.status === 'fulfilled' ? statistics.value?.response || [] : [],
      events: events.status === 'fulfilled' ? events.value?.response || [] : [],
      lineups: lineups.status === 'fulfilled' ? lineups.value?.response || [] : [],
      players: players.status === 'fulfilled' ? players.value?.response || [] : [],
      injuries: injuries.status === 'fulfilled' ? injuries.value?.response || [] : [],
      predictions: predictions.status === 'fulfilled' ? predictions.value?.response?.[0] || null : null,
      odds: odds.status === 'fulfilled' ? odds.value?.response || [] : [],
      oddsLive: oddsLive.status === 'fulfilled' ? oddsLive.value?.response || [] : [],
      h2h: h2h.status === 'fulfilled' ? h2h.value?.response || [] : [],
    });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, erro: e.message || 'Erro ao consultar pacote completo.' });
  }
});
// ===== FIM API-FOOTBALL BETANALYTICS =====


// ============================================================================
// CHAVES DE ACESSO ESSENCIAIS (Supabase, Gemini, Mercado Pago, Sportradar)
// ============================================================================
/* BET_ETAPA_35B_SEGREDOS_ENV_INICIO */
const SUPABASE_URL = String(
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim();

const SUPABASE_KEY = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''
).trim();

const GEMINI_API_KEY = String(
  process.env.GEMINI_API_KEY ||
  ''
).trim();

const MP_ACCESS_TOKEN = betMpToken();

const SPORTRADAR_KEY = String(
  process.env.SPORTRADAR_KEY ||
  ''
).trim();

function betSupabaseFallback() {
  const indisponivel = {
    data: null,
    error: new Error('Supabase não configurado no servidor.')
  };

  const consulta = new Proxy(
    {},
    {
      get(_target, propriedade) {
        if (propriedade === 'then') {
          return (resolver) => resolver(indisponivel);
        }

        return () => consulta;
      }
    }
  );

  return {
    from() {
      return consulta;
    }
  };
}

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : betSupabaseFallback();

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;
/* BET_ETAPA_35B_SEGREDOS_ENV_FIM */

// ============================================================================
// MOTOR LEGADO DE SINCRONIZACAO REMOVIDO

/* BET_ETAPA_39A2_LEGADO_PRODUCAO_REMOVIDO
   Sincronizador Sportradar sintetico,
   /api/processar-pagamento e /api/webhook antigos removidos.
   Fonte oficial de jogos: API-Football.
*/
// ============================================================================
app.post(
  '/api/chat-ia',
  autenticarRequest,
  async (req, res) => {
    const { pergunta, dadosDaRodada } = req.body;
    if (!genAI) {
        return res.status(500).json({ resposta: "Erro: API do Gemini não configurada." });
    }
    try {
        const promptMestre = `
        Tu és o Analista-Chefe de Inteligência Artificial do BetAnalytics PRO.
        És direto, profissional, falas com confiança e dás análises baseadas em EV+.
        Responde à seguinte pergunta de forma curta usando no máximo 3 frases.
        Pergunta: "${pergunta}"
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(promptMestre);
        res.json({ resposta: result.response.text() });
    } catch (error) {
        res.status(500).json({ resposta: "O radar IA está processando dados. Tente novamente em breve." });
    }
});

// ============================================================================
// ARQUIVOS ESTATICOS FRONTEND
// ============================================================================

/* BET_ETAPA_39A2_PAGAMENTO_DUPLICADO_REMOVIDO */


/* BET_ETAPA_33_CACHE_RENDER_INICIO */
const BET_DIST_DIR = path.join(__dirname, 'dist');
const BET_PUBLIC_DIR = path.join(__dirname, 'public');

app.use(
  express.static(BET_PUBLIC_DIR, {
    etag: true,
    maxAge: '1h'
  })
);

app.use(
  express.static(BET_DIST_DIR, {
    etag: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return;
      }

      if (filePath.includes(path.sep + 'assets' + path.sep)) {
        res.setHeader(
          'Cache-Control',
          'public, max-age=31536000, immutable'
        );
      }
    }
  })
);

/* BET_ETAPA_35B_HEALTH_PRODUCAO_INICIO */
app.get('/api/producao/health', (_req, res) => {
  return res.status(200).json({
    ok: true,
    servico: 'BetAnalytics Produção',
    ambiente: process.env.NODE_ENV || 'development',
    configuracao: {
      api_football: Boolean(API_FOOTBALL_KEY),
      mercado_pago: Boolean(betMpToken()),
      supabase: Boolean(SUPABASE_URL && SUPABASE_KEY),
      gemini: Boolean(GEMINI_API_KEY),
      sportradar: Boolean(SPORTRADAR_KEY)
    },
    cors_origens_configuradas: BET_CORS_ORIGENS.size,
    timestamp: new Date().toISOString()
  });
});
/* BET_ETAPA_35B_HEALTH_PRODUCAO_FIM */

app.get('*', (req, res) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(BET_DIST_DIR, 'index.html'));
});
/* BET_ETAPA_33_CACHE_RENDER_FIM */

const PORT = process.env.PORT || 3000;




app.listen(PORT, () => {
    console.log(`[BetAnalytics] Motor PRO operacional na porta ${PORT}`);
});
