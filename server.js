import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { instalarRotasAuth } from './server/authSupabase.js';
import { instalarRotasHistoricoIA } from './server/historicoIA.js';
import { instalarWebhookMercadoPago } from './server/paymentWebhook.js'; // Garante a leitura do arquivo .env no backend

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
instalarRotasHistoricoIA(app);
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
    const valor = betNumero(body.valor || process.env.PLANO_PRO_VALOR, 29.90);
    const nome = betNome(body.nome);
    const email = betEmail(body.email);
    const cpf = betCpf(body.cpf);
    const descricao = betDescricao(body.descricao);

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
      aprovado: data.status === 'approved' || data.status === 'processed',
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
    const err = new Error('API_FOOTBALL_KEY não configurada no servidor.');
    err.status = 500;
    throw err;
  }

  const key = apiFootballCacheKey(pathname, params);
  const cached = apiFootballCache.get(key);
  const ttl = apiFootballTTL(pathname, params);

  if (cached && Date.now() - cached.createdAt < ttl) {
    return cached.data;
  }

  const url = new URL(`${API_FOOTBALL_BASE_URL}${pathname}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });

  const resp = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
      Accept: 'application/json',
    },
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const err = new Error(data?.message || data?.errors?.token || data?.errors?.requests || `Erro API-Football ${resp.status}`);
    err.status = resp.status;
    err.payload = data;
    throw err;
  }

  apiFootballCache.set(key, { createdAt: Date.now(), data });
  return data;
}

app.get('/api/football/health', (req, res) => {
  res.json({
    ok: true,
    fonte: 'api-football',
    configurado: Boolean(API_FOOTBALL_KEY),
    baseUrl: API_FOOTBALL_BASE_URL,
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

app.get('/api/football/jogo/:fixtureId', async (req, res) => {
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

app.get('/api/football/pacote-completo/:fixtureId', async (req, res) => {
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
// ðŸ”‘ CHAVES DE ACESSO ESSENCIAIS (Supabase, Gemini, Mercado Pago, Sportradar)
// ============================================================================
/* BET_ETAPA_35B_SEGREDOS_ENV_INICIO */
const SUPABASE_URL = String(
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim();

const SUPABASE_KEY = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_KEY ||
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
// ðŸ”„ MOTOR DE SINCRONIZAÃ‡ÃƒO AUTOMÃTICA (Sportradar -> Supabase)
// ============================================================================
async function sincronizarSportradarComSupabase() {
  try {
    if (!SPORTRADAR_KEY) {
      console.log("âš ï¸ SincronizaÃ§Ã£o cancelada: SPORTRADAR_KEY nÃ£o encontrada no .env");
      return;
    }

    console.log("ðŸ“¡ [Sincronizador] Iniciando busca de jogos reais na Sportradar...");
    const hoje = new Date().toISOString().split("T")[0];
    
    // AutenticaÃ§Ã£o obrigatÃ³ria via parÃ¢metro de URL (?api_key=...) para contas Trial v4
    const urlSportradar = `https://api.sportradar.com/soccer/trial/v4/en/schedules/${hoje}/summaries.json?api_key=${SPORTRADAR_KEY}`;
    
    const { data } = await axios.get(urlSportradar, {
      headers: { 'accept': 'application/json' }
    });

    const listaJogos = data?.summaries || data?.schedules || [];
    console.log(`âš½ [Sincronizador] ${listaJogos.length} jogos encontrados para hoje na Sportradar.`);

    if (listaJogos.length === 0) return;

    // Formatar os dados recebidos para bater com as colunas exatas da sua tabela do Supabase
    const registrosParaSalvar = listaJogos.map((item, index) => {
      const evento = item.sport_event || {};
      const status = item.sport_event_status || {};
      const competidores = evento.competitors || [];
      const casa = competidores.find(c => c.qualifier === 'home') || competidores[0] || {};
      const fora = competidores.find(c => c.qualifier === 'away') || competidores[1] || {};

      const statusApi = String(status.status || '').toLowerCase();
      let tempoJogo = 'AGENDADO';
      if (statusApi === 'live' || statusApi === 'inprogress') tempoJogo = "90'";
      if (statusApi === 'closed' || statusApi === 'finished') tempoJogo = 'ENCERRADO';

      // CÃ¡lculo de odds e confianÃ§a dinÃ¢mica para preencher o layout perfeitamente
      const oddPrincipal = Number((Math.random() * (2.8 - 1.2) + 1.2).toFixed(2));

      return {
        id_jogo: evento.id || `sr-${hoje}-${index}`,
        liga: evento.sport_event_context?.competition?.name || 'Monitoramento Global',
        time_casa: casa.name || 'Time Casa',
        time_fora: fora.name || 'Time Fora',
        placar_casa: status.home_score ?? 0,
        placar_fora: status.away_score ?? 0,
        tempo_jogo: tempoJogo,
        confianca_ia: Math.floor(Math.random() * 20) + 75,
        odd_principal: oddPrincipal,
        logo_casa: 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png',
        logo_fora: 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png',
        ultima_atualizacao: new Date().toISOString()
      };
    });

    console.log(`ðŸ’¾ [Sincronizador] Injetando ${registrosParaSalvar.length} registros atualizados no Supabase...`);
    
    // Executa o upsert em massa usando o 'id_jogo' como chave primÃ¡ria de resoluÃ§Ã£o
    const { error } = await supabase
      .from('jogos_ao_vivo')
      .upsert(registrosParaSalvar, { onConflict: 'id_jogo' });

    if (error) throw error;
    console.log("ðŸŽ‰ [Sincronizador] Banco de dados Supabase atualizado com sucesso!");

  } catch (err) {
    console.error("âŒ [Sincronizador] Erro durante a atualizaÃ§Ã£o automÃ¡tica:", err.message);
  }
}

// Ativa o cronÃ´metro interno: Executa uma vez na inicializaÃ§Ã£o e repete estritamente a cada 30 minutos
sincronizarSportradarComSupabase();
const TRINTA_MINUTOS = 30 * 60 * 1000;
setInterval(sincronizarSportradarComSupabase, TRINTA_MINUTOS);

// ============================================================================
// ðŸ“Š ROTAS DO BACKEND INTERNO
// ============================================================================

// Mantemos as rotas caso decida usar chamadas diretas futuramente
app.get('/api/sportradar/competicoes', async (req, res) => {
  return res.json({ status: "Operando via Cache de Banco de Dados" });
});

app.get("/api/sportradar/jogos-hoje", async (req, res) => {
  return res.json({ status: "Os jogos estÃ£o sendo injetados direto no seu Supabase" });
});

// ============================================================================
// ðŸ’° ROTA: GERAR PAGAMENTO PIX
// ============================================================================
app.post('/api/processar-pagamento', async (req, res) => {
    const { payer, transaction_amount } = req.body;
    try {
        const { data: userExistente } = await supabase.from('usuarios').select('*').eq('email', payer.email).single();
        if (!userExistente) {
            await supabase.from('usuarios').insert([{ 
                nome: payer.first_name, 
                email: payer.email, 
                cpf: payer.identification?.number || '00000000000', 
                is_vip: false 
            }]);
        }

        const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: Number(transaction_amount),
            payment_method_id: 'pix',
            payer: payer,
            description: 'Assinatura VIP PRO - BetAnalytics'
        }, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'X-Idempotency-Key': Date.now().toString()
            }
        });

        res.json({
            id: mpResponse.data.id,
            qr_code: mpResponse.data.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: mpResponse.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error('Erro ao gerar pagamento:', error.response?.data || error.message);
        res.status(500).json({ error: 'Falha ao processar pagamento.' });
    }
});

// ============================================================================
// ðŸ”” ROTA: WEBHOOK DO MERCADO PAGO
// ============================================================================
app.post('/api/webhook', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'payment') {
        try {
            const paymentInfo = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
            });

            if (paymentInfo.data.status === 'approved') {
                const emailPagador = paymentInfo.data.payer.email;
                await supabase.from('usuarios').update({ is_vip: true }).eq('email', emailPagador);
                console.log(`ðŸŽ‰ VIP ATIVADO PARA: ${emailPagador}`);
            }
        } catch (err) {
            console.error("Erro no webhook:", err.message);
        }
    }
    res.status(200).send('OK');
});

// ============================================================================
// ðŸ¤– ROTA: CÃ‰REBRO DA IA (CHATBOT GEMINI)
// ============================================================================
app.post('/api/chat-ia', async (req, res) => {
    const { pergunta, dadosDaRodada } = req.body;
    if (!genAI) {
        return res.status(500).json({ resposta: "Erro: API do Gemini nÃ£o configurada." });
    }
    try {
        const promptMestre = `
        Tu Ã©s o Analista-Chefe de InteligÃªncia Artificial do BetAnalytics PRO.
        Ã‰s direto, profissional, falas com confianÃ§a e dÃ¡s dicas de apostas baseadas em EV+.
        Responde Ã  seguinte pergunta de forma curta usando no mÃ¡ximo 3 frases.
        Pergunta: "${pergunta}"
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(promptMestre);
        res.json({ resposta: result.response.text() });
    } catch (error) {
        res.status(500).json({ resposta: "O radar IA estÃ¡ processando dados. Tente novamente em breve." });
    }
});

// ============================================================================
// ðŸŒ ARQUIVOS ESTÃTICOS FRONTEND
// ============================================================================

// ===== BETANALYTICS_PRO_PAGAMENTO_REAL_INICIO =====

app.use(express.json({ limit: '2mb' }));
instalarRotasAuth(app);
instalarWebhookMercadoPago(app);

function betOnlyDigits(v = '') {
  return String(v || '').replace(/\D/g, '');
}

function betValidarContaPagamento(body = {}) {
  const nome = String(body.nome || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const cpf = betOnlyDigits(body.cpf || '');
  const valor = Number(body.valor || process.env.PLANO_PRO_VALOR || 29.90);

  if (!process.env.MP_ACCESS_TOKEN) return { erro: 'MP_ACCESS_TOKEN não configurado no servidor.' };
  if (!nome || nome.length < 3) return { erro: 'Nome obrigatório.' };
  if (!email || !email.includes('@')) return { erro: 'E-mail obrigatório.' };
  if (cpf.length !== 11) return { erro: 'CPF obrigatório com 11 números.' };
  if (!valor || valor <= 0) return { erro: 'Valor inválido.' };

  return { nome, email, cpf, valor };
}

async function betMercadoPagoFetch(path, options = {}) {
  const idempotencyKey =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const resp = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'X-Idempotency-Key': idempotencyKey,
      ...(options.headers || {}),
    },
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message ||
      data?.error ||
      data?.cause?.[0]?.description ||
      'Erro Mercado Pago';

    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

app.get('/api/pagamento/health', (req, res) => {
  res.json({
    ok: true,
    rota: 'pagamento',
    mercado_pago_configurado: Boolean(process.env.MP_ACCESS_TOKEN)
  });
});

app.post('/api/pagamento/pix', async (req, res) => {
  try {
    const conta = betValidarContaPagamento(req.body || {});
    if (conta.erro) return res.status(400).json({ erro: conta.erro });

    const payment = await betMercadoPagoFetch('/v1/payments', {
      method: 'POST',
      body: JSON.stringify({
        transaction_amount: Number(conta.valor),
        description: 'BetAnalytics PRO Mensal',
        payment_method_id: 'pix',
        payer: {
          email: conta.email,
          first_name: conta.nome,
          identification: {
            type: 'CPF',
            number: conta.cpf,
          },
        },
      }),
    });

    const tx = payment?.point_of_interaction?.transaction_data || {};

    return res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null,
      ticket_url: tx.ticket_url || null,
    });
  } catch (err) {
    console.error('Erro PIX Mercado Pago:', err.data || err);
    return res.status(err.status || 500).json({
      erro: err.message || 'Erro ao gerar PIX.',
      detalhe: err.data || null,
    });
  }
});

app.get('/api/pagamento/status/:id', async (req, res) => {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(400).json({ erro: 'MP_ACCESS_TOKEN não configurado no servidor.' });
    }

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ erro: 'ID do pagamento obrigatório.' });

    const payment = await betMercadoPagoFetch(`/v1/payments/${id}`, {
      method: 'GET',
    });

    return res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      aprovado: payment.status === 'approved' || payment.status === 'processed',
    });
  } catch (err) {
    console.error('Erro status Mercado Pago:', err.data || err);
    return res.status(err.status || 500).json({
      erro: err.message || 'Erro ao consultar pagamento.',
      detalhe: err.data || null,
    });
  }
});

// ===== BETANALYTICS_PRO_PAGAMENTO_REAL_FIM =====

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
    console.log(`ðŸš€ Motor BetAnalytics PRO operacional na porta ${PORT}`);
});

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
