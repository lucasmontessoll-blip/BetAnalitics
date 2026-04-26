const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// ============================================================================
// 🔐 COFRE DE CHAVES (SEGURANÇA MÁXIMA - BACKEND)
// ============================================================================
const API_FUTEBOL_KEY = '77e281ca7ad5eb9fcfe7d9c1100542a3'; 
const GROQ_API_KEY = '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';
const SPORTMONKS_API_KEY = 'Rx26v5sotoUGYAl9WPopJMEvWaFQLYC4y8kbLUIfzznydvxUwVWJDinfXwwc';
const THE_ODDS_API_KEY = '3471c53f955642a4ec6032c86919f9cd';
const MP_ACCESS_TOKEN = 'APP_USR-5195582607141912-041719-999b3dfb56de24bd4462722e5348387c-3344260552';

// ============================================================================
// 🛡️ SISTEMA DE BLINDAGEM CONTRA ESGOTAMENTO DE API (CACHE GLOBAL)
// ============================================================================
let cacheJogos = {}; 
let cacheOdds = {}; 
let cacheStats = {};
let temposDeCache = {}; 
const TEMPO_DE_CACHE = 5 * 60 * 1000; // 5 minutos de blindagem absoluta

// ============================================================================
// 1. ROTA PRINCIPAL: BUSCA OS JOGOS (BLINDADA)
// ============================================================================
app.get('/api/match', async (req, res) => {
  try {
    const agora = Date.now();
    const dataBusca = req.query.date || new Date().toISOString().split('T')[0];
    const league = req.query.league;
    const sport = req.query.sport;
    
    const cacheKey = `JOGOS_${dataBusca}_${league || 'all'}_${sport || 'futebol'}`;

    // VERIFICA SE ESTÁ BLINDADO
    if (cacheJogos[cacheKey] && temposDeCache[cacheKey] && (agora - temposDeCache[cacheKey] < TEMPO_DE_CACHE)) {
      console.log(`[BLINDAGEM ATIVA] Servindo JOGOS da memória para: ${cacheKey}`);
      return res.json({ latest: cacheJogos[cacheKey] });
    }

    if (sport && sport.toLowerCase() !== 'futebol') {
        console.log(`[THE ODDS API] GASTANDO COTA: Esportes alternativos: ${sport}`);
        const oddsApiUrl = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${THE_ODDS_API_KEY}&regions=eu,us&markets=h2h`;
        const response = await axios.get(oddsApiUrl);
        const allSportsGames = response.data || [];

        let term = sport.toLowerCase();
        if (term.includes('basquete')) term = 'basketball';
        if (term.includes('tênis') || term.includes('tenis')) term = 'tennis';
        if (term.includes('vôlei') || term.includes('volei')) term = 'volleyball';
        if (term.includes('boxe')) term = 'boxing';

        const filteredGames = allSportsGames.filter(g => g.sport_key.toLowerCase().includes(term) || g.sport_title.toLowerCase().includes(term));

        const jogosFormatados = filteredGames.map(jogo => ({
          id: jogo.id,
          name: `${jogo.home_team} vs ${jogo.away_team}`,
          starting_at: jogo.commence_time,
          league: { name: jogo.sport_title },
          participants: [
            { name: jogo.home_team, meta: { location: "home" } },
            { name: jogo.away_team, meta: { location: "away" } }
          ],
          scores: [{ score: { goals: "-", participant: "home" } }, { score: { goals: "-", participant: "away" } }],
          status: "Aguardando",
          xgfixture: [], statistics: [], predictions: []
        }));

        cacheJogos[cacheKey] = jogosFormatados;
        temposDeCache[cacheKey] = agora;
        return res.json({ latest: jogosFormatados });
    }

    console.log(`[API-FOOTBALL] GASTANDO COTA: Jogos de Futebol | Data: ${dataBusca} | Liga: ${league || 'todas'}`);
    const year = dataBusca.split('-')[0]; 
    const finalUrl = league
      ? `https://v3.football.api-sports.io/fixtures?date=${dataBusca}&league=${league}&season=${year}`
      : `https://v3.football.api-sports.io/fixtures?date=${dataBusca}`;

    const response = await axios.get(finalUrl, { headers: { 'x-apisports-key': API_FUTEBOL_KEY } });

    if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        return res.status(429).json({ error: "Limite da API atingido.", detalhes: response.data.errors });
    }

    const jogosApi = response.data.response || [];
    
    const jogosFormatados = jogosApi.map(jogo => ({
      id: jogo.fixture.id,
      name: `${jogo.teams.home.name} vs ${jogo.teams.away.name}`,
      league_id: jogo.league.id, 
      starting_at: jogo.fixture.date,
      league: { id: jogo.league.id, name: jogo.league.name, country: jogo.league.country },
      participants: [
        { name: jogo.teams.home.name, image_path: jogo.teams.home.logo, meta: { location: "home" } },
        { name: jogo.teams.away.name, image_path: jogo.teams.away.logo, meta: { location: "away" } }
      ],
      scores: [
        { description: "CURRENT", score: { goals: jogo.goals.home !== null ? jogo.goals.home : "-", participant: "home" } },
        { description: "CURRENT", score: { goals: jogo.goals.away !== null ? jogo.goals.away : "-", participant: "away" } }
      ],
      status: jogo.fixture.status.long,
      xgfixture: [], statistics: [], predictions: []
    }));

    cacheJogos[cacheKey] = jogosFormatados;
    temposDeCache[cacheKey] = agora;
    res.json({ latest: jogosFormatados });

  } catch (error) {
    console.error("Erro ao buscar jogos na API:", error.message);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// ============================================================================
// 2. ROTA DE ODDS REAIS (BLINDADA)
// ============================================================================
app.get('/api/futebol/odds', async (req, res) => {
  const agora = Date.now();
  const date = req.query.date;
  const sport = req.query.sport;
  if (!date) return res.json({ odds: {} });

  const cacheKey = `ODDS_${date}_${sport || 'futebol'}`;

  // VERIFICA SE ESTÁ BLINDADO
  if (cacheOdds[cacheKey] && temposDeCache[cacheKey] && (agora - temposDeCache[cacheKey] < TEMPO_DE_CACHE)) {
    console.log(`[BLINDAGEM ATIVA] Servindo ODDS da memória para: ${cacheKey}`);
    return res.json({ odds: cacheOdds[cacheKey] });
  }

  try {
    if (sport && sport.toLowerCase() !== 'futebol') {
        console.log(`[THE ODDS API] GASTANDO COTA: Buscando Odds para ${sport}`);
        const oddsApiUrl = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${THE_ODDS_API_KEY}&regions=eu,us&markets=h2h`;
        const response = await axios.get(oddsApiUrl);
        const oddsMap = {};
        
        (response.data || []).forEach(jogo => {
           const bookmaker = jogo.bookmakers?.[0]; 
           if (bookmaker && bookmaker.markets?.[0]) {
               const outcomes = bookmaker.markets[0].outcomes;
               oddsMap[jogo.id] = {
                   home: outcomes.find(o => o.name === jogo.home_team)?.price || "-",
                   draw: outcomes.find(o => o.name === "Draw")?.price || "-",
                   away: outcomes.find(o => o.name === jogo.away_team)?.price || "-"
               };
           }
        });

        cacheOdds[cacheKey] = oddsMap;
        temposDeCache[cacheKey] = agora;
        return res.json({ odds: oddsMap });
    }

    console.log(`[API-FOOTBALL] GASTANDO COTA: Buscando Odds para Futebol na data ${date}`);
    const response = await axios.get(`https://v3.football.api-sports.io/odds?date=${date}`, { headers: { 'x-apisports-key': API_FUTEBOL_KEY } });

    const oddsMap = {};
    const dataOdds = response.data.response || [];

    dataOdds.forEach(item => {
      const fixtureId = item.fixture.id;
      const market = item.bookmakers?.[0]?.bets?.find(b => b.name === "Match Winner");
      if (market) {
        oddsMap[fixtureId] = {
          home: parseFloat(market.values.find(v => v.value === "Home")?.odd),
          draw: parseFloat(market.values.find(v => v.value === "Draw")?.odd),
          away: parseFloat(market.values.find(v => v.value === "Away")?.odd)
        };
      }
    });

    cacheOdds[cacheKey] = oddsMap;
    temposDeCache[cacheKey] = agora;
    res.json({ odds: oddsMap });

  } catch (err) {
    console.log("Erro ao buscar odds:", err.message);
    res.json({ odds: {} });
  }
});

// ============================================================================
// 3. ESTATÍSTICAS (BLINDADA) E IA
// ============================================================================
app.get('/api/futebol/estatisticas/:id', async (req, res) => {
  const agora = Date.now();
  const gameId = req.params.id;
  const cacheKey = `STATS_${gameId}`;

  // VERIFICA SE ESTÁ BLINDADO
  if (cacheStats[cacheKey] && temposDeCache[cacheKey] && (agora - temposDeCache[cacheKey] < TEMPO_DE_CACHE)) {
     console.log(`[BLINDAGEM ATIVA] Servindo ESTATÍSTICAS da memória para o jogo: ${gameId}`);
     return res.json(cacheStats[cacheKey]);
  }

  try {
    console.log(`[API-FOOTBALL] GASTANDO COTA: Buscando Estatísticas do jogo ${gameId}`);
    const response = await axios.get(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${gameId}`, { headers: { 'x-apisports-key': API_FUTEBOL_KEY } });
    
    cacheStats[cacheKey] = response.data.response;
    temposDeCache[cacheKey] = agora;
    res.json(response.data.response);

  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

app.post('/api/analise-ia', async (req, res) => {
  const { jogo, odds, is_vip } = req.body;
  if (!is_vip) return res.status(403).json({ relatorio: "Assine o VIP para liberar a Inteligência Artificial." });
  const homeTeam = jogo.participants?.[0]?.name || 'Casa';
  const awayTeam = jogo.participants?.[1]?.name || 'Fora';
  const prompt = `Analise ${homeTeam} vs ${awayTeam}. Odds: Casa ${odds?.home}, Empate ${odds?.draw}, Fora ${odds?.away}. Palpite focado em valor esperado EV para apostas esportivas.`;
  
  try {
    console.log(`[GROQ IA] GASTANDO COTA: Gerando análise para ${homeTeam} x ${awayTeam}`);
    const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', { 
        model: "llama-3.3-70b-versatile", 
        messages: [{ role: "user", content: prompt }] 
    }, { 
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } 
    });
    res.json({ relatorio: groqResponse.data.choices[0].message.content });
  } catch (error) { res.status(500).json({ relatorio: `Servidor da IA sobrecarregado no momento.` }); }
});

// ============================================================================
// 4. PAGAMENTO VIP (MERCADO PAGO) E ROTAS AUXILIARES
// ============================================================================
app.get('/api/pagar/status/:id_pagamento/:email', async (req, res) => {
  const { id_pagamento, email } = req.params;
  try {
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id_pagamento}`, {
          headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      });
      if (response.data && response.data.status === 'approved') {
          return res.json({ pago: true });
      } else { return res.json({ pago: false }); }
  } catch (error) { res.json({ pago: false }); }
});

app.post('/api/login', (req, res) => res.json({ usuario: { email: req.body.email, is_vip: false }}));
app.post('/api/cadastro', (req, res) => res.json({ usuario: { email: req.body.email, is_vip: false }}));
app.get('/api/noticias', (req, res) => res.json({ noticias: [] }));
app.post('/api/banca/salvar', (req, res) => res.json({ success: true }));
app.get('/api/banca/:email', (req, res) => res.json({ historico: [] }));

app.listen(3000, () => console.log(`🚀 Servidor BetAnalytics 100% BLINDADO rodando na porta 3000!`));