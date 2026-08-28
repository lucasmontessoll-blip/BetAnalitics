const PESOS = Object.freeze({
  forma: 22,
  casaFora: 18,
  ataqueDefesa: 18,
  h2h: 12,
  prediction: 12,
  classificacao: 8,
  desfalques: 5,
  mercado: 5,
});

const HISTORICAL_CACHE_TTL_MS = (() => {
  const valor =
    Number(
      process.env.HISTORICAL_CACHE_TTL_MS
    );

  if (
    Number.isFinite(valor) &&
    valor >= 60000 &&
    valor <= 3600000
  ) {
    return Math.floor(valor);
  }

  return 5 * 60 * 1000;
})();

const HISTORICAL_CACHE_MAX = (() => {
  const valor =
    Number(
      process.env.HISTORICAL_CACHE_MAX
    );

  if (
    Number.isFinite(valor) &&
    valor >= 10 &&
    valor <= 5000
  ) {
    return Math.floor(valor);
  }

  return 500;
})();

const historicalCache =
  new Map();

const historicalInflight =
  new Map();

function historicalCacheLimparExpirados() {
  const agora =
    Date.now();

  for (
    const [fixtureId, item]
    of historicalCache.entries()
  ) {
    if (
      !item ||
      agora - item.createdAt >=
        HISTORICAL_CACHE_TTL_MS
    ) {
      historicalCache.delete(
        fixtureId
      );
    }
  }
}

function historicalCacheGet(
  fixtureId
) {
  const chave =
    String(fixtureId);

  const item =
    historicalCache.get(chave);

  if (!item) {
    return null;
  }

  if (
    Date.now() -
      item.createdAt >=
    HISTORICAL_CACHE_TTL_MS
  ) {
    historicalCache.delete(chave);
    return null;
  }

  return item.data;
}

function historicalCacheSet(
  fixtureId,
  data
) {
  const chave =
    String(fixtureId);

  historicalCache.delete(chave);

  historicalCache.set(
    chave,
    {
      createdAt:
        Date.now(),

      data
    }
  );

  while (
    historicalCache.size >
    HISTORICAL_CACHE_MAX
  ) {
    const maisAntiga =
      historicalCache
        .keys()
        .next()
        .value;

    if (!maisAntiga) {
      break;
    }

    historicalCache.delete(
      maisAntiga
    );
  }
}

function historicalCacheStatus() {
  historicalCacheLimparExpirados();

  return {
    ttl_ms:
      HISTORICAL_CACHE_TTL_MS,

    max_entries:
      HISTORICAL_CACHE_MAX,

    entries:
      historicalCache.size,

    inflight:
      historicalInflight.size
  };
}

const num = (v, f = null) => {
  if (v === null || v === undefined || v === '') return f;
  const n = Number(String(v).replace('%', '').replace(',', '.'));
  return Number.isFinite(n) ? n : f;
};

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, num(v, 0)));

const vetor = (home, draw, away) => {
  const h = Math.max(0, num(home, 0));
  const d = Math.max(0, num(draw, 0));
  const a = Math.max(0, num(away, 0));
  const t = h + d + a || 1;
  return { home: h * 100 / t, draw: d * 100 / t, away: a * 100 / t };
};

const forcas = (h, a, draw = 24) => {
  const x = Math.max(.01, num(h, .5));
  const y = Math.max(.01, num(a, .5));
  const d = clamp(draw, 14, 34);
  const r = 100 - d;
  return vetor(r * x / (x + y), d, r * y / (x + y));
};

const payload = (p, fallback = null) =>
  p?.status === 'fulfilled' ? p.value?.response ?? fallback : fallback;

const finalizado = (j) =>
  ['FT', 'AET', 'PEN'].includes(String(j?.fixture?.status?.short || '').toUpperCase());

function resultado(j, teamId) {
  if (!finalizado(j)) return null;
  const gh = num(j?.goals?.home);
  const ga = num(j?.goals?.away);
  const homeId = Number(j?.teams?.home?.id);
  const awayId = Number(j?.teams?.away?.id);
  const id = Number(teamId);
  if (gh === null || ga === null || (id !== homeId && id !== awayId)) return null;
  const casa = id === homeId;
  const gf = casa ? gh : ga;
  const gc = casa ? ga : gh;
  return { casa, gf, gc, r: gf > gc ? 'V' : gf === gc ? 'E' : 'D', data: j?.fixture?.date };
}

function forma(jogos, teamId, local = null, limite = 10) {
  const rs = [];
  for (const j of Array.isArray(jogos) ? jogos : []) {
    const r = resultado(j, teamId);
    if (!r) continue;
    if (local === 'home' && !r.casa) continue;
    if (local === 'away' && r.casa) continue;
    rs.push(r);
    if (rs.length >= limite) break;
  }
  let v = 0, e = 0, d = 0, gf = 0, gc = 0;
  rs.forEach(r => {
    if (r.r === 'V') v++; else if (r.r === 'E') e++; else d++;
    gf += r.gf; gc += r.gc;
  });
  const n = rs.length;
  const pontos = n ? (v * 3 + e) / (n * 3) * 100 : null;
  const saldo = n ? (gf - gc) / n : 0;
  const score = pontos === null ? null : Math.round(clamp(pontos * .82 + (50 + clamp(saldo * 12, -18, 18)) * .18));
  return { amostra: n, vitorias: v, empates: e, derrotas: d, golsPro: gf, golsContra: gc, score, sequencia: rs.map(r => r.r) };
}

function pesoTempo(data) {
  const t = new Date(data || 0).getTime();
  if (!Number.isFinite(t)) return .2;
  const dias = Math.max(0, (Date.now() - t) / 86400000);
  if (dias <= 90) return 1;
  if (dias <= 180) return .85;
  if (dias <= 365) return .65;
  if (dias <= 730) return .40;
  return .20;
}

function h2h(jogos, homeId, awayId) {
  let wh = 0, wd = 0, wa = 0, vh = 0, d = 0, va = 0, n = 0;
  for (const j of Array.isArray(jogos) ? jogos : []) {
    if (!finalizado(j)) continue;
    const gh = num(j?.goals?.home), ga = num(j?.goals?.away);
    const h = Number(j?.teams?.home?.id), a = Number(j?.teams?.away?.id);
    if (gh === null || ga === null) continue;
    let x, y;
    if (h === Number(homeId) && a === Number(awayId)) { x = gh; y = ga; }
    else if (h === Number(awayId) && a === Number(homeId)) { x = ga; y = gh; }
    else continue;
    const w = pesoTempo(j?.fixture?.date);
    if (x > y) { wh += w; vh++; } else if (x < y) { wa += w; va++; } else { wd += w; d++; }
    n++;
  }
  return {
    amostra: n, vitoriasCasa: vh, empates: d, vitoriasFora: va,
    vetor: n ? vetor(wh + .35, wd + .35, wa + .35) : null,
  };
}

const get = (o, path) => String(path).split('.').reduce((a, k) => a?.[k], o);

function ataqueDefesa(casa, fora) {
  if (!casa || !fora) return null;
  const ah = num(get(casa, 'goals.for.average.home'));
  const dh = num(get(casa, 'goals.against.average.home'));
  const aa = num(get(fora, 'goals.for.average.away'));
  const da = num(get(fora, 'goals.against.average.away'));
  if ([ah, dh, aa, da].some(x => x === null)) return null;
  const eh = Math.max(.05, (ah + da) / 2);
  const ea = Math.max(.05, (aa + dh) / 2);
  return { esperadoCasa: eh, esperadoFora: ea, vetor: forcas(eh, ea, clamp(31 - (eh + ea) * 2.2, 18, 29)) };
}

function prediction(p) {
  const q = p?.predictions?.percent;
  if (!q) return null;
  const h = num(q.home), d = num(q.draw), a = num(q.away);
  return [h, d, a].some(x => x === null) ? null : vetor(h, d, a);
}

function classificacao(resp, homeId, awayId) {
  const grupos = resp?.[0]?.league?.standings;
  const tabela = Array.isArray(grupos) ? grupos.flatMap(g => Array.isArray(g) ? g : []) : [];
  const h = tabela.find(x => Number(x?.team?.id) === Number(homeId));
  const a = tabela.find(x => Number(x?.team?.id) === Number(awayId));
  if (!h || !a) return null;
  const max = Math.max(2, ...tabela.map(x => num(x?.rank, 1)));
  return {
    rankCasa: num(h.rank), rankFora: num(a.rank),
    vetor: forcas((max - h.rank + 1) / max, (max - a.rank + 1) / max, 25),
  };
}

function oddsMercado(resp) {
  for (const item of Array.isArray(resp) ? resp : []) {
    for (const book of item?.bookmakers || []) {
      for (const bet of book?.bets || []) {
        if (!/match winner|1x2|winner/i.test(String(bet?.name || ''))) continue;
        let home, draw, away;
        for (const x of bet?.values || []) {
          const l = String(x?.value || '').toLowerCase();
          const o = num(x?.odd);
          if (!o || o <= 1) continue;
          if (l === 'home' || l === '1') home = o;
          else if (l === 'draw' || l === 'x') draw = o;
          else if (l === 'away' || l === '2') away = o;
        }
        if (home && draw && away) {
          return { bookmaker: book?.name || '', odds: { home, draw, away }, vetor: vetor(1 / home, 1 / draw, 1 / away) };
        }
      }
    }
  }
  return null;
}

function agregar(fs) {
  let peso = 0, h = 0, d = 0, a = 0;
  fs.forEach(f => {
    if (!f.vetor) return;
    const w = f.peso * clamp(f.cobertura ?? 1, 0, 1);
    if (!w) return;
    peso += w; h += f.vetor.home * w; d += f.vetor.draw * w; a += f.vetor.away * w;
  });
  return peso ? { probabilidades: vetor(h / peso, d / peso, a / peso), qualidade: Math.round(clamp(peso)) } : { probabilidades: null, qualidade: 0 };
}

function pick(v) {
  if (!v) return null;
  return [['home', v.home], ['draw', v.draw], ['away', v.away]].sort((x, y) => y[1] - x[1])[0];
}

function confianca(v, qualidade) {
  if (!v || !qualidade) return null;
  const p = [v.home, v.draw, v.away].sort((a, b) => b - a);
  const margem = p[0] - p[1];
  return Math.round(clamp((45 + margem * .6 + qualidade * .15) * (.55 + qualidade / 100 * .45), 1, 95));
}

function semApi(id) {
  return {
    ok: true, configurado: false, status: 'aguardando_api',
    engine: 'betanalytics-historical-v1', fixtureId: String(id || ''),
    mensagem: 'Historical Engine instalado. Configure API_FOOTBALL_KEY para ativar dados reais.',
    probabilidades: null, selecao: null, qualidadeDados: 0, fatores: [],
  };
}

export function instalarRotasHistoricalEngine(app, { request, configurado } = {}) {
  if (!app || typeof request !== 'function') throw new Error('Historical Engine: dependencias invalidas.');

  app.get('/api/football/historical/health', (_req, res) => {
    const ativo =
      Boolean(
        configurado?.()
      );

    res.json({
      ok: true,
      engine:
        'betanalytics-historical-v1',
      configurado:
        ativo,
      status:
        ativo
          ? 'ativo'
          : 'aguardando_api',
      cache:
        historicalCacheStatus()
    });
  });

  app.get('/api/football/historical/:fixtureId', async (req, res) => {
    try {
      const fixtureId =
        String(
          req.params.fixtureId || ''
        ).trim();

      if (
        !/^\d{1,20}$/.test(
          fixtureId
        )
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            engine:
              'betanalytics-historical-v1',
            erro:
              'fixtureId invalido.'
          });
      }

      if (!configurado?.()) {
        return res.json(
          semApi(fixtureId)
        );
      }

      const cachePronto =
        historicalCacheGet(
          fixtureId
        );

      if (cachePronto) {
        return res.json({
          ...cachePronto,

          cache: {
            hit: true,
            compartilhado: false,
            ttl_ms:
              HISTORICAL_CACHE_TTL_MS
          }
        });
      }

      const emAndamento =
        historicalInflight.get(
          fixtureId
        );

      if (emAndamento) {
        await emAndamento;

        const compartilhado =
          historicalCacheGet(
            fixtureId
          );

        if (compartilhado) {
          return res.json({
            ...compartilhado,

            cache: {
              hit: true,
              compartilhado: true,
              ttl_ms:
                HISTORICAL_CACHE_TTL_MS
            }
          });
        }
      }

      let liberarInflight;

      const trava =
        new Promise(
          (resolve) => {
            liberarInflight =
              resolve;
          }
        );

      historicalInflight.set(
        fixtureId,
        trava
      );

      try {
        const fp = await request('/fixtures', { id: fixtureId });
      const fixture = fp?.response?.[0];
      if (!fixture) return res.status(404).json({ ok: false, erro: 'Partida nao encontrada.' });

      const homeId = fixture?.teams?.home?.id, awayId = fixture?.teams?.away?.id;
      const casa = fixture?.teams?.home?.name || 'Mandante', fora = fixture?.teams?.away?.name || 'Visitante';
      const league = fixture?.league?.id, season = fixture?.league?.season;

      const [hc, af, hh, sc, sf, st, pr, inj, od] = await Promise.allSettled([
        request('/fixtures', { team: homeId, last: 20 }),
        request('/fixtures', { team: awayId, last: 20 }),
        request('/fixtures/headtohead', { h2h: `${homeId}-${awayId}`, last: 10 }),
        league && season ? request('/teams/statistics', { team: homeId, league, season }) : Promise.resolve({ response: null }),
        league && season ? request('/teams/statistics', { team: awayId, league, season }) : Promise.resolve({ response: null }),
        league && season ? request('/standings', { league, season }) : Promise.resolve({ response: [] }),
        request('/predictions', { fixture: fixtureId }),
        request('/injuries', { fixture: fixtureId }),
        request('/odds', { fixture: fixtureId }),
      ]);

      const jogosCasa = payload(hc, []), jogosFora = payload(af, []);
      const fCasa = forma(jogosCasa, homeId), fFora = forma(jogosFora, awayId);
      const casaMand = forma(jogosCasa, homeId, 'home'), foraVis = forma(jogosFora, awayId, 'away');
      const hhRes = h2h(payload(hh, []), homeId, awayId);
      const ad = ataqueDefesa(payload(sc), payload(sf));
      const pred = prediction(payload(pr, [])?.[0]);
      const classif = classificacao(payload(st, []), homeId, awayId);
      const lesoes = payload(inj, []);
      const lesCasa = Array.isArray(lesoes) ? lesoes.filter(x => Number(x?.team?.id) === Number(homeId)).length : 0;
      const lesFora = Array.isArray(lesoes) ? lesoes.filter(x => Number(x?.team?.id) === Number(awayId)).length : 0;
      const lesVetor = inj.status === 'fulfilled' ? forcas(1 / (1 + lesCasa * .18), 1 / (1 + lesFora * .18), 26) : null;
      const mercado = oddsMercado(payload(od, []));

      const fs = [
        { id: 'forma', label: 'Forma recente', peso: PESOS.forma, cobertura: Math.min(1, Math.min(fCasa.amostra, fFora.amostra) / 8), vetor: fCasa.score !== null && fFora.score !== null ? forcas(fCasa.score, fFora.score, 25) : null },
        { id: 'casaFora', label: 'Casa / Fora', peso: PESOS.casaFora, cobertura: Math.min(1, Math.min(casaMand.amostra, foraVis.amostra) / 5), vetor: casaMand.score !== null && foraVis.score !== null ? forcas(casaMand.score, foraVis.score, 23) : null },
        { id: 'ataqueDefesa', label: 'Ataque / Defesa', peso: PESOS.ataqueDefesa, cobertura: ad ? 1 : 0, vetor: ad?.vetor || null },
        { id: 'h2h', label: 'H2H histórico', peso: PESOS.h2h, cobertura: Math.min(1, hhRes.amostra / 5), vetor: hhRes.vetor },
        { id: 'prediction', label: 'Prediction API-Football', peso: PESOS.prediction, cobertura: pred ? 1 : 0, vetor: pred },
        { id: 'classificacao', label: 'Classificação / Momento', peso: PESOS.classificacao, cobertura: classif ? 1 : 0, vetor: classif?.vetor || null },
        { id: 'desfalques', label: 'Lesões / Desfalques', peso: PESOS.desfalques, cobertura: inj.status === 'fulfilled' ? 1 : 0, vetor: lesVetor },
        { id: 'mercado', label: 'Odds / Mercado', peso: PESOS.mercado, cobertura: mercado ? 1 : 0, vetor: mercado?.vetor || null },
      ];

      const agg = agregar(fs);
      const principal = pick(agg.probabilidades);
      const lado = principal?.[0] || null;
      const prob = principal?.[1] ?? null;
      const conf = confianca(agg.probabilidades, agg.qualidade);
      const odd = lado && mercado?.odds ? num(mercado.odds[lado]) : null;
      const justa = prob ? 100 / prob : null;
      const ev = odd && prob ? (prob / 100 * odd - 1) * 100 : null;

      const label = lado === 'home' ? `Vitória ${casa}` : lado === 'away' ? `Vitória ${fora}` : lado === 'draw' ? 'Empate' : 'Sem seleção';
      const pModelo = pick(agg.probabilidades)?.[0], pApi = pick(pred)?.[0], pMercado = pick(mercado?.vetor)?.[0];
      const picks = [{ origem: 'BetAnalytics', pick: pModelo }, { origem: 'API-Football', pick: pApi }, { origem: 'Mercado', pick: pMercado }].filter(x => x.pick);

      const razoes = [];
      const alertas = [];
      if (fCasa.score !== null && fFora.score !== null && Math.abs(fCasa.score - fFora.score) >= 10)
        razoes.push((fCasa.score > fFora.score ? casa : fora) + ' chega com forma recente superior.');
      if (casaMand.score !== null && foraVis.score !== null && Math.abs(casaMand.score - foraVis.score) >= 10)
        razoes.push((casaMand.score > foraVis.score ? casa : fora) + ' tem vantagem no recorte casa/fora.');
      if (hhRes.vetor && pick(hhRes.vetor)?.[0] === lado) razoes.push('O H2H ponderado reforça a seleção.');
      if (pred && pick(pred)?.[0] === lado) razoes.push('A prediction da API-Football confirma a direção do modelo.');
      if (pred && pick(pred)?.[0] !== lado) alertas.push('A prediction externa diverge da seleção BetAnalytics.');
      if (agg.qualidade < 70) alertas.push('Cobertura de dados abaixo de 70%; a confiança foi reduzida.');

      const resposta = {
        ok: true, configurado: true, status: 'ativo', engine: 'betanalytics-historical-v1',
        fixtureId, atualizadoEm: new Date().toISOString(),
        partida: { casa, fora, homeId, awayId, leagueId: league || null, season: season || null },
        pesos: PESOS,
        probabilidades: agg.probabilidades ? {
          home: Number(agg.probabilidades.home.toFixed(1)),
          draw: Number(agg.probabilidades.draw.toFixed(1)),
          away: Number(agg.probabilidades.away.toFixed(1)),
        } : null,
        selecao: lado ? {
          pick: lado, label, probabilidade: Number(prob.toFixed(1)), confianca: conf,
          oddMercado: odd, oddJusta: justa ? Number(justa.toFixed(2)) : null,
          ev: ev === null ? null : Number(ev.toFixed(1)),
        } : null,
        qualidadeDados: agg.qualidade,
        forma: { casa: fCasa, fora: fFora, casaMandante: casaMand, foraVisitante: foraVis },
        h2h: hhRes, ataqueDefesa: ad, classificacao: classif,
        desfalques: { casa: lesCasa, fora: lesFora }, prediction: pred, mercado,
        consenso: { alinhados: picks.filter(x => x.pick === pModelo).length, total: picks.length, picks },
        explicacao: { razoes: razoes.slice(0, 6), alertas: alertas.slice(0, 5) },
        fatores: fs.map(f => ({
          id: f.id, label: f.label, peso: f.peso,
          cobertura: Number(clamp(f.cobertura, 0, 1).toFixed(2)),
          disponivel: Boolean(f.vetor),
          probabilidades: f.vetor ? {
            home: Number(f.vetor.home.toFixed(1)),
            draw: Number(f.vetor.draw.toFixed(1)),
            away: Number(f.vetor.away.toFixed(1)),
          } : null,
        })),
      };

      historicalCacheSet(
        fixtureId,
        resposta
      );

      return res.json({
        ...resposta,

        cache: {
          hit: false,
          compartilhado: false,
          ttl_ms:
            HISTORICAL_CACHE_TTL_MS
        }
      });
      }
      finally {
        liberarInflight?.();

        if (
          historicalInflight.get(
            fixtureId
          ) === trava
        ) {
          historicalInflight.delete(
            fixtureId
          );
        }
      }
    } catch (e) {
      console.error('[Historical Engine]', e?.status || 500, e?.message || e);
      res.status(Number(e?.status) || 500).json({ ok: false, engine: 'betanalytics-historical-v1', erro: e?.message || 'Falha ao gerar analise historica.' });
    }
  });
}
