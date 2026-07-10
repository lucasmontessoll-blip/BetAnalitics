const CATEGORIAS_CRITERIOS_100 = [
  ['Força geral', ['ranking', 'rating', 'elo', 'power score', 'pontos', 'vitórias', 'saldo de gols', 'aproveitamento', 'regularidade', 'qualidade técnica']],
  ['Ataque', ['gols marcados', 'média de gols', 'finalizações', 'chutes no gol', 'xG ofensivo', 'ataques', 'ataques perigosos', 'grandes chances', 'conversão', 'pressão ofensiva']],
  ['Defesa', ['gols sofridos', 'xG contra', 'clean sheets', 'desarmes', 'interceptações', 'bloqueios', 'erros defensivos', 'cartões', 'pênaltis contra', 'solidez defensiva']],
  ['Momento recente', ['forma atual', 'últimos 5 jogos', 'últimos 10 jogos', 'sequência de vitórias', 'invencibilidade', 'gols recentes', 'defesa recente', '1º tempo', '2º tempo', 'consistência recente']],
  ['Contexto do jogo', ['mando de campo', 'descanso', 'viagem', 'torcida', 'estádio', 'motivação', 'necessidade', 'importância', 'clima', 'gramado']],
  ['Confronto direto', ['vitórias H2H', 'gols H2H', 'último confronto', 'dominância histórica', 'H2H casa/fora', 'gols sofridos H2H', 'sequência H2H', 'controle H2H', 'eficiência H2H', 'psicológico H2H']],
  ['Elenco', ['valor do elenco', 'titulares disponíveis', 'lesões', 'suspensões', 'banco', 'artilheiro disponível', 'goleiro', 'meio-campo', 'defesa titular', 'ataque titular']],
  ['Mercado', ['odd vitória', 'probabilidade mercado', 'queda de odd', 'volume', 'movimento sharp', 'EV positivo', 'Kelly', 'valor esperado', 'distorção', 'consenso mercado']],
  ['Ao vivo', ['placar atual', 'posse', 'finalizações live', 'chutes no gol live', 'xG live', 'escanteios', 'ataques perigosos live', 'cartões live', 'pressão recente', 'controle emocional']],
  ['Inteligência IA', ['confiança IA', 'consenso IA', 'modelo estatístico', 'probabilidade IA', 'heat score', 'risco calculado', 'estabilidade', 'oportunidade detectada', 'alertas positivos', 'score final IA']]
];
const CRITERIOS_ANALISE_RIGOROSA_100 = CATEGORIAS_CRITERIOS_100.flatMap(([categoria, itens]) =>
  itens.map((nome, index) => ({ categoria, nome, id: `${categoria}-${nome}-${index}` }))
);
const FORCA_TIMES_REFERENCIA = {
  'flamengo': 83, 'palmeiras': 84, 'corinthians': 75, 'sao-paulo': 76, 'sao paulo': 76,
  'santos': 72, 'gremio': 76, 'internacional': 76, 'fluminense': 77, 'vasco': 70,
  'botafogo': 79, 'cruzeiro': 75, 'atletico-mg': 78, 'atletico mineiro': 78, 'bahia': 73,
  'fortaleza': 72, 'ceara': 68, 'vitoria': 67, 'sport': 66, 'juventude': 65,
  'mirassol': 66, 'bragantino': 71, 'red bull bragantino': 71,
  'real madrid': 92, 'barcelona': 90, 'fc barcelona': 90, 'atletico madrid': 86,
  'manchester city': 91, 'liverpool': 90, 'arsenal': 88, 'chelsea': 84, 'tottenham': 82,
  'manchester united': 82, 'bayern munich': 90, 'bayern de munique': 90, 'borussia dortmund': 84,
  'psg': 88, 'paris saint-germain': 88, 'inter milan': 88, 'internazionale': 88, 'milan': 84,
  'juventus': 84, 'napoli': 84, 'benfica': 82, 'porto': 81, 'sporting': 82,
  'brasil': 90, 'argentina': 91, 'franca': 90, 'frança': 90, 'inglaterra': 88,
  'espanha': 88, 'alemanha': 86, 'portugal': 87, 'italia': 84, 'itália': 84
};
function numeroSeguroAnalise(valor, padrao = null) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : padrao;
  const convertido = Number(
    String(valor)
      .replace('%', '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '')
  );
  return Number.isFinite(convertido) ? convertido : padrao;
}
function limitarAnalise(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}
function sigmoidAnalise(x) {
  return 1 / (1 + Math.exp(-limitarAnalise(x, -10, 10)));
}
function logitAnalise(p) {
  const v = limitarAnalise(Number(p), 0.015, 0.985);
  return Math.log(v / (1 - v));
}
function normalizarTimeAnalise(nome = '') {
  return String(nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(fc|ec|sc|ac|cf|club|clube|de|da|do|the)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function hashAnalise(texto = '') {
  const s = String(texto || 'time').toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}
function variacaoDeterministica(nome = '', amplitude = 6) {
  const h = hashAnalise(nome);
  return ((h % 2001) / 2000 - 0.5) * amplitude;
}
function pegarValorAnalise(obj, caminhos = []) {
  for (const caminho of caminhos) {
    try {
      const valor = String(caminho).split('.').reduce((acc, key) => acc?.[key], obj);
      const n = numeroSeguroAnalise(valor, null);
      if (n !== null) return n;
    } catch (e) {
      continue;
    }
  }
  return null;
}
function inferirForcaTime(nomeTime = '', liga = '') {
  const nome = normalizarTimeAnalise(nomeTime);
  const ligaNorm = normalizarTimeAnalise(liga);
  let base = FORCA_TIMES_REFERENCIA[nome];
  if (!base) {
    const achado = Object.entries(FORCA_TIMES_REFERENCIA).find(([k]) => nome.includes(k) || k.includes(nome));
    if (achado) base = achado[1];
  }
  if (!base) {
    if (/champions|premier|laliga|serie a|bundesliga|ligue 1|libertadores/.test(ligaNorm)) base = 72;
    else if (/brasileir|copa|sul-americana|argentina|uruguai/.test(ligaNorm)) base = 68;
    else base = 62;
    base += variacaoDeterministica(`${nomeTime}-${liga}`, 16);
  }
  return limitarAnalise(base, 35, 96);
}
function normalizarParAnalise(casa, fora, direcao = 'maior', sensibilidade = 2.15) {
  const c = numeroSeguroAnalise(casa, null);
  const f = numeroSeguroAnalise(fora, null);
  if (c === null || f === null) return null;
  if (c === f) return { casa: 0.5, fora: 0.5 };
  const escala = Math.max(Math.abs(c), Math.abs(f), 1);
  const diferenca = direcao === 'menor' ? (f - c) / escala : (c - f) / escala;
  const probCasa = sigmoidAnalise(diferenca * sensibilidade);
  return {
    casa: limitarAnalise(probCasa, 0.06, 0.94),
    fora: limitarAnalise(1 - probCasa, 0.06, 0.94)
  };
}
function pontuarFormaAnalise(lista = []) {
  if (!Array.isArray(lista) || !lista.length) return null;
  return lista.slice(-8).reduce((acc, r, index) => {
    const v = String(r || '').toUpperCase();
    const pesoRecencia = 1 + index * 0.09;
    if (v === 'W' || v === 'V') return acc + 3 * pesoRecencia;
    if (v === 'D' || v === 'E') return acc + 1 * pesoRecencia;
    return acc;
  }, 0);
}
function minutoDoJogoAnalise(jogo = {}) {
  const status = String(jogo.status || '').toLowerCase();
  if (status.includes('finished') || status.includes('final')) return 90;
  const t = String(jogo.time_elapsed || jogo.tempo_jogo || '').match(/\d+/);
  return limitarAnalise(t ? Number(t[0]) : 0, 0, 90);
}
function adicionarFatorAnalise(fatores, fator) {
  if (!fator || typeof fator.casa !== 'number') return;
  fatores.push({
    nome: fator.nome || 'Critério',
    categoria: fator.categoria || 'Modelo',
    peso: limitarAnalise(Number(fator.peso || 1), 0.1, 5),
    confiabilidade: limitarAnalise(Number(fator.confiabilidade ?? 0.75), 0.18, 1),
    criterios: limitarAnalise(Number(fator.criterios || 1), 1, 18),
    dadoReal: Boolean(fator.dadoReal),
    casa: limitarAnalise(Number(fator.casa), 0.015, 0.985),
    fora: limitarAnalise(Number(fator.fora ?? (1 - fator.casa)), 0.015, 0.985),
    detalhe: fator.detalhe || ''
  });
}
function calcularH2HAnalise(jogo = {}) {
  if (!Array.isArray(jogo.confrontosDiretos) || !jogo.confrontosDiretos.length) return null;
  const casaNome = normalizarTimeAnalise(jogo.home_team || jogo.time_casa || '');
  const foraNome = normalizarTimeAnalise(jogo.away_team || jogo.time_fora || '');
  let pontosCasa = 0;
  let pontosFora = 0;
  jogo.confrontosDiretos.slice(0, 8).forEach((h, index) => {
    const placar = String(h.placar || '').match(/(\d+)\s*-\s*(\d+)/);
    if (!placar) return;
    const golsA = Number(placar[1]);
    const golsB = Number(placar[2]);
    const nomeA = normalizarTimeAnalise(h.casa || '');
    const nomeB = normalizarTimeAnalise(h.fora || '');
    const recencia = 1 + (8 - index) * 0.04;
    if (golsA === golsB) {
      pontosCasa += 1 * recencia;
      pontosFora += 1 * recencia;
      return;
    }
    const vencedorA = golsA > golsB;
    const venceuCasaAtual = (vencedorA && (nomeA.includes(casaNome) || casaNome.includes(nomeA))) || (!vencedorA && (nomeB.includes(casaNome) || casaNome.includes(nomeB)));
    const venceuForaAtual = (vencedorA && (nomeA.includes(foraNome) || foraNome.includes(nomeA))) || (!vencedorA && (nomeB.includes(foraNome) || foraNome.includes(nomeB)));
    if (venceuCasaAtual) pontosCasa += 3 * recencia;
    if (venceuForaAtual) pontosFora += 3 * recencia;
  });
  return normalizarParAnalise(pontosCasa, pontosFora, 'maior', 1.65);
}
function poissonProb(lambda, k) {
  const l = limitarAnalise(lambda, 0.01, 7.5);
  let fat = 1;
  for (let i = 2; i <= k; i++) fat *= i;
  return (Math.exp(-l) * Math.pow(l, k)) / fat;
}
function calcularPoissonResultado(lambdaCasa, lambdaFora, maxGols = 8) {
  let casa = 0;
  let empate = 0;
  let fora = 0;
  let melhor = { casa: 0, fora: 0, p: 0 };
  for (let h = 0; h <= maxGols; h++) {
    for (let a = 0; a <= maxGols; a++) {
      const p = poissonProb(lambdaCasa, h) * poissonProb(lambdaFora, a);
      if (h > a) casa += p;
      else if (h === a) empate += p;
      else fora += p;
      if (p > melhor.p) melhor = { casa: h, fora: a, p };
    }
  }
  const soma = Math.max(casa + empate + fora, 0.0001);
  return {
    casa: casa / soma,
    empate: empate / soma,
    fora: fora / soma,
    placar: `${melhor.casa} - ${melhor.fora}`,
    placarCasa: melhor.casa,
    placarFora: melhor.fora
  };
}
function arredondarProbabilidades(casa, empate, fora) {
  let c = Math.round(limitarAnalise(casa * 100, 0, 100));
  let e = Math.round(limitarAnalise(empate * 100, 0, 100));
  let f = Math.round(limitarAnalise(fora * 100, 0, 100));
  let diff = 100 - (c + e + f);
  while (diff !== 0) {
    if (diff > 0) {
      if (c >= e && c >= f) c += 1;
      else if (f >= e) f += 1;
      else e += 1;
      diff--;
    } else {
      if (c >= e && c >= f && c > 1) c -= 1;
      else if (f >= e && f > 1) f -= 1;
      else if (e > 1) e -= 1;
      diff++;
    }
  }
  return { casa: c, empate: e, fora: f };
}
function calcularFatoresMatematicosAnalise(jogo = {}) {
  const est = jogo.estatisticas || {};
  const stats = jogo.stats || {};
  const probs = jogo.probabilidades || {};
  const forma = jogo.ultimosJogos || {};
  const fatores = [];
  const casaNome = jogo.home_team || jogo.time_casa || 'Mandante';
  const foraNome = jogo.away_team || jogo.time_fora || 'Visitante';
  const liga = jogo.league_name || jogo.liga || '';
  const status = String(jogo.status || '').toLowerCase();
  const minuto = minutoDoJogoAnalise(jogo);
  const aoVivo = status.includes('live');
  const finalizado = status.includes('finished') || status.includes('final');
  const scoreHome = numeroSeguroAnalise(jogo.scoreHome ?? jogo.placar_casa, 0);
  const scoreAway = numeroSeguroAnalise(jogo.scoreAway ?? jogo.placar_fora, 0);
  const forcaCasa = inferirForcaTime(casaNome, liga) + 3.2;
  const forcaFora = inferirForcaTime(foraNome, liga);
  const parForca = normalizarParAnalise(forcaCasa, forcaFora, 'maior', 2.8);
  if (parForca) adicionarFatorAnalise(fatores, {
    nome: 'Força real estimada dos times',
    categoria: 'Força geral',
    peso: 2.65,
    confiabilidade: FORCA_TIMES_REFERENCIA[normalizarTimeAnalise(casaNome)] || FORCA_TIMES_REFERENCIA[normalizarTimeAnalise(foraNome)] ? 0.82 : 0.52,
    criterios: 10,
    ...parForca,
    dadoReal: Boolean(FORCA_TIMES_REFERENCIA[normalizarTimeAnalise(casaNome)] || FORCA_TIMES_REFERENCIA[normalizarTimeAnalise(foraNome)]),
    detalhe: `${Math.round(forcaCasa)} x ${Math.round(forcaFora)}`
  });
  const probCasaApi = numeroSeguroAnalise(probs.casa ?? jogo.prob_casa ?? jogo.probabilidade_casa, null);
  const probForaApi = numeroSeguroAnalise(probs.fora ?? jogo.prob_fora ?? jogo.probabilidade_fora, null);
  const probEmpateApi = numeroSeguroAnalise(probs.empate ?? jogo.prob_empate ?? jogo.probabilidade_empate, null);
  if (probCasaApi !== null && probForaApi !== null) {
    const pc = probCasaApi > 1 ? probCasaApi / 100 : probCasaApi;
    const pf = probForaApi > 1 ? probForaApi / 100 : probForaApi;
    const somaBinaria = Math.max(pc + pf, 0.01);
    adicionarFatorAnalise(fatores, {
      nome: 'Probabilidade recebida da API',
      categoria: 'Inteligência IA',
      peso: 3.4,
      confiabilidade: 0.92,
      criterios: 12,
      casa: pc / somaBinaria,
      fora: pf / somaBinaria,
      dadoReal: true
    });
  }
  const oddCasa = pegarValorAnalise(jogo, ['odd_casa', 'home_odd', 'odds.home', 'odds.casa']);
  const oddEmpate = pegarValorAnalise(jogo, ['odd_empate', 'draw_odd', 'odds.draw', 'odds.empate']);
  const oddFora = pegarValorAnalise(jogo, ['odd_fora', 'away_odd', 'odds.away', 'odds.fora']);
  if (oddCasa && oddFora && oddCasa > 1 && oddFora > 1) {
    const impCasa = 1 / oddCasa;
    const impEmp = oddEmpate && oddEmpate > 1 ? 1 / oddEmpate : 0;
    const impFora = 1 / oddFora;
    const margem = Math.max(impCasa + impEmp + impFora, 0.01);
    const casaLimpa = impCasa / margem;
    const foraLimpa = impFora / margem;
    const somaBinaria = Math.max(casaLimpa + foraLimpa, 0.01);
    adicionarFatorAnalise(fatores, {
      nome: 'Mercado de odds limpo',
      categoria: 'Mercado',
      peso: 2.8,
      confiabilidade: 0.9,
      criterios: 10,
      casa: casaLimpa / somaBinaria,
      fora: foraLimpa / somaBinaria,
      dadoReal: true
    });
  }
  if (aoVivo || finalizado) {
    const diff = scoreHome - scoreAway;
    if (finalizado) {
      adicionarFatorAnalise(fatores, {
        nome: 'Resultado final confirmado',
        categoria: 'Ao vivo',
        peso: 5,
        confiabilidade: 1,
        criterios: 18,
        casa: diff > 0 ? 0.995 : diff < 0 ? 0.005 : 0.5,
        fora: diff < 0 ? 0.995 : diff > 0 ? 0.005 : 0.5,
        dadoReal: true
      });
    } else if (diff !== 0) {
      const forcaTempo = 0.9 + minuto / 50;
      const pCasa = sigmoidAnalise(diff * forcaTempo * 1.35);
      adicionarFatorAnalise(fatores, {
        nome: 'Placar ao vivo + minuto',
        categoria: 'Ao vivo',
        peso: 4.3,
        confiabilidade: 0.96,
        criterios: 14,
        casa: pCasa,
        fora: 1 - pCasa,
        dadoReal: true,
        detalhe: `${scoreHome} x ${scoreAway} aos ${minuto}'`
      });
    } else {
      const fatorMandante = minuto > 65 ? 0.51 : 0.535;
      adicionarFatorAnalise(fatores, {
        nome: 'Placar empatado ao vivo',
        categoria: 'Ao vivo',
        peso: 1.15,
        confiabilidade: 0.73,
        criterios: 5,
        casa: fatorMandante,
        fora: 1 - fatorMandante,
        dadoReal: true
      });
    }
  }
  const paresNumericos = [
    ['Posse de bola', est.posseCasa ?? est.posse_casa ?? stats.posseCasa ?? stats.posse_casa, est.posseFora ?? est.posse_fora ?? stats.posseFora ?? stats.posse_fora, 'maior', 0.95, 0.72, 4],
    ['Ataques', est.ataquesCasa ?? est.ataques_casa, est.ataquesFora ?? est.ataques_fora, 'maior', 1.05, 0.74, 4],
    ['Ataques perigosos', est.ataquesPerigososCasa ?? est.ataques_perigosos_casa ?? stats.ataquesPerigososCasa, est.ataquesPerigososFora ?? est.ataques_perigosos_fora ?? stats.ataquesPerigososFora, 'maior', 1.45, 0.84, 6],
    ['Finalizações', est.chutesCasa ?? est.chutes_casa ?? stats.chutesCasa ?? stats.chutes, est.chutesFora ?? est.chutes_fora ?? stats.chutesFora, 'maior', 1.25, 0.78, 5],
    ['Chutes no gol', est.chutesGolCasa ?? est.chutes_gol_casa ?? stats.chutesGolCasa, est.chutesGolFora ?? est.chutes_gol_fora ?? stats.chutesGolFora, 'maior', 1.55, 0.86, 7],
    ['xG ao vivo', est.xgCasa ?? est.xg_casa ?? stats.xgCasa ?? stats.xg, est.xgFora ?? est.xg_fora ?? stats.xgFora, 'maior', 1.85, 0.92, 9],
    ['Escanteios', est.escanteiosCasa ?? est.escanteios_casa ?? stats.cantos, est.escanteiosFora ?? est.escanteios_fora, 'maior', 0.82, 0.66, 3],
    ['Cartões', est.cartoesCasa ?? est.cartoes_casa, est.cartoesFora ?? est.cartoes_fora, 'menor', 0.72, 0.62, 3],
    ['Faltas', est.faltasCasa ?? est.faltas_casa, est.faltasFora ?? est.faltas_fora, 'menor', 0.62, 0.56, 2],
    ['Passes certos', est.passesCasa ?? est.passes_casa, est.passesFora ?? est.passes_fora, 'maior', 0.62, 0.58, 2]
  ];
  for (const [nome, casa, fora, direcao, peso, confiabilidade, criterios] of paresNumericos) {
    const par = normalizarParAnalise(casa, fora, direcao, nome.includes('xG') ? 3.0 : 2.15);
    if (par) adicionarFatorAnalise(fatores, { nome, categoria: aoVivo ? 'Ao vivo' : 'Estatísticas', peso, confiabilidade, criterios, ...par, dadoReal: true });
  }
  const formaCasa = pontuarFormaAnalise(forma.casa ?? jogo.forma_casa);
  const formaFora = pontuarFormaAnalise(forma.fora ?? jogo.forma_fora);
  const parForma = normalizarParAnalise(formaCasa, formaFora, 'maior', 1.85);
  if (parForma) adicionarFatorAnalise(fatores, { nome: 'Forma recente ponderada', categoria: 'Momento recente', peso: 1.55, confiabilidade: 0.78, criterios: 8, ...parForma, dadoReal: true });
  const parH2H = calcularH2HAnalise(jogo);
  if (parH2H) adicionarFatorAnalise(fatores, { nome: 'Confronto direto ponderado', categoria: 'Confronto direto', peso: 0.95, confiabilidade: 0.62, criterios: 5, ...parH2H, dadoReal: true });
  adicionarFatorAnalise(fatores, {
    nome: 'Mando de campo',
    categoria: 'Contexto do jogo',
    peso: aoVivo ? 0.48 : 0.9,
    confiabilidade: 0.66,
    criterios: 4,
    casa: 0.56,
    fora: 0.44,
    dadoReal: false
  });
  const confiancaIa = numeroSeguroAnalise(jogo.confianca_ia, null);
  if (confiancaIa !== null) {
    const pesoParcial = fatores.reduce((acc, f) => acc + f.peso * f.confiabilidade, 0) || 1;
    const parcial = fatores.reduce((acc, f) => acc + logitAnalise(f.casa) * f.peso * f.confiabilidade, 0) / pesoParcial;
    const ladoCasa = parcial >= 0;
    const intensidade = limitarAnalise((confiancaIa - 50) / 50, 0, 0.92);
    const pIa = 0.5 + intensidade * 0.39;
    adicionarFatorAnalise(fatores, {
      nome: 'Confiança IA calibrada no favorito',
      categoria: 'Inteligência IA',
      peso: 1.6,
      confiabilidade: 0.68,
      criterios: 8,
      casa: ladoCasa ? pIa : 1 - pIa,
      fora: ladoCasa ? 1 - pIa : pIa,
      dadoReal: true
    });
  }
  const oddPrincipal = numeroSeguroAnalise(jogo.odd_principal, null);
  if (oddPrincipal && oddPrincipal > 1 && !oddCasa && !oddFora) {
    const pesoParcial = fatores.reduce((acc, f) => acc + f.peso * f.confiabilidade, 0) || 1;
    const parcial = fatores.reduce((acc, f) => acc + logitAnalise(f.casa) * f.peso * f.confiabilidade, 0) / pesoParcial;
    const ladoCasa = parcial >= 0;
    const probMercado = limitarAnalise(1 / oddPrincipal, 0.18, 0.82);
    adicionarFatorAnalise(fatores, {
      nome: 'Odd principal no lado do favorito',
      categoria: 'Mercado',
      peso: 0.75,
      confiabilidade: 0.52,
      criterios: 4,
      casa: ladoCasa ? probMercado : 1 - probMercado,
      fora: ladoCasa ? 1 - probMercado : probMercado,
      dadoReal: true
    });
  }
  return { fatores, probEmpateApi, oddEmpate, forcaCasa, forcaFora };
}
function calcularExpectativaGols(jogo = {}, pCasaCondicional = 0.5) {
  const est = jogo.estatisticas || {};
  const stats = jogo.stats || {};
  const liga = normalizarTimeAnalise(jogo.league_name || jogo.liga || '');
  const status = String(jogo.status || '').toLowerCase();
  const aoVivo = status.includes('live');
  const finalizado = status.includes('finished') || status.includes('final');
  const minuto = minutoDoJogoAnalise(jogo);
  const scoreHome = numeroSeguroAnalise(jogo.scoreHome ?? jogo.placar_casa, 0);
  const scoreAway = numeroSeguroAnalise(jogo.scoreAway ?? jogo.placar_fora, 0);
  if (finalizado) {
    return {
      lambdaCasa: scoreHome,
      lambdaFora: scoreAway,
      esperadoCasa: scoreHome,
      esperadoFora: scoreAway,
      placarProjetado: `${scoreHome} - ${scoreAway}`,
      golsEsperados: scoreHome + scoreAway,
      finalizado: true
    };
  }
  let mediaLiga = 2.58;
  if (/brasileir|libertadores|sul-americana/.test(liga)) mediaLiga = 2.42;
  if (/premier|champions|bundesliga/.test(liga)) mediaLiga = 2.78;
  if (/serie b|amador|sub/.test(liga)) mediaLiga = 2.28;
  const xgCasa = numeroSeguroAnalise(est.xgCasa ?? est.xg_casa ?? stats.xgCasa ?? stats.xg, null);
  const xgFora = numeroSeguroAnalise(est.xgFora ?? est.xg_fora ?? stats.xgFora, null);
  const chutesGolCasa = numeroSeguroAnalise(est.chutesGolCasa ?? est.chutes_gol_casa ?? stats.chutesGolCasa, null);
  const chutesGolFora = numeroSeguroAnalise(est.chutesGolFora ?? est.chutes_gol_fora ?? stats.chutesGolFora, null);
  const ataquesPerCasa = numeroSeguroAnalise(est.ataquesPerigososCasa ?? est.ataques_perigosos_casa ?? stats.ataquesPerigososCasa, null);
  const ataquesPerFora = numeroSeguroAnalise(est.ataquesPerigososFora ?? est.ataques_perigosos_fora ?? stats.ataquesPerigososFora, null);
  const dominioCasa = limitarAnalise((pCasaCondicional - 0.5) * 2, -0.8, 0.8);
  let lambdaCasaPre = (mediaLiga / 2) * (1 + dominioCasa * 0.42) + 0.18;
  let lambdaForaPre = (mediaLiga / 2) * (1 - dominioCasa * 0.42) - 0.02;
  if (xgCasa !== null && xgFora !== null) {
    lambdaCasaPre = lambdaCasaPre * 0.35 + limitarAnalise(xgCasa, 0.05, 4.5) * 0.65;
    lambdaForaPre = lambdaForaPre * 0.35 + limitarAnalise(xgFora, 0.05, 4.5) * 0.65;
  } else if (chutesGolCasa !== null || chutesGolFora !== null || ataquesPerCasa !== null || ataquesPerFora !== null) {
    const ofensivoCasa = (chutesGolCasa ?? 2.8) * 0.18 + (ataquesPerCasa ?? 35) * 0.012;
    const ofensivoFora = (chutesGolFora ?? 2.4) * 0.18 + (ataquesPerFora ?? 30) * 0.012;
    lambdaCasaPre = lambdaCasaPre * 0.65 + limitarAnalise(ofensivoCasa, 0.25, 3.8) * 0.35;
    lambdaForaPre = lambdaForaPre * 0.65 + limitarAnalise(ofensivoFora, 0.2, 3.8) * 0.35;
  }
  lambdaCasaPre = limitarAnalise(lambdaCasaPre, 0.15, 4.8);
  lambdaForaPre = limitarAnalise(lambdaForaPre, 0.1, 4.8);
  if (!aoVivo) {
    return {
      lambdaCasa: lambdaCasaPre,
      lambdaFora: lambdaForaPre,
      esperadoCasa: lambdaCasaPre,
      esperadoFora: lambdaForaPre,
      placarProjetado: `${Math.round(lambdaCasaPre)} - ${Math.round(lambdaForaPre)}`,
      golsEsperados: lambdaCasaPre + lambdaForaPre,
      finalizado: false
    };
  }
  const restante = limitarAnalise((90 - minuto) / 90, 0.02, 1);
  const acelerador = minuto > 70 ? 0.92 : minuto > 45 ? 1.02 : 1.08;
  const lambdaRestanteCasa = limitarAnalise(lambdaCasaPre * restante * acelerador, 0.02, 2.8);
  const lambdaRestanteFora = limitarAnalise(lambdaForaPre * restante * acelerador, 0.02, 2.8);
  return {
    lambdaCasa: lambdaRestanteCasa,
    lambdaFora: lambdaRestanteFora,
    esperadoCasa: scoreHome + lambdaRestanteCasa,
    esperadoFora: scoreAway + lambdaRestanteFora,
    placarProjetado: `${Math.round(scoreHome + lambdaRestanteCasa)} - ${Math.round(scoreAway + lambdaRestanteFora)}`,
    golsEsperados: scoreHome + scoreAway + lambdaRestanteCasa + lambdaRestanteFora,
    finalizado: false
  };
}
function calcularEmpateAnalise({ jogo, pCasaCondicional, fatores, probEmpateApi, oddEmpate, expectativa }) {
  const status = String(jogo.status || '').toLowerCase();
  const finalizado = status.includes('finished') || status.includes('final');
  const aoVivo = status.includes('live');
  const minuto = minutoDoJogoAnalise(jogo);
  const scoreHome = numeroSeguroAnalise(jogo.scoreHome ?? jogo.placar_casa, 0);
  const scoreAway = numeroSeguroAnalise(jogo.scoreAway ?? jogo.placar_fora, 0);
  const diff = Math.abs(scoreHome - scoreAway);
  const margemCondicional = Math.abs(pCasaCondicional - 0.5) * 2;
  if (finalizado) return scoreHome === scoreAway ? 0.985 : 0.005;
  let empateBase;
  if (aoVivo) {
    if (diff === 0) empateBase = 0.20 + (minuto / 90) * 0.31;
    else empateBase = 0.15 - diff * 0.045 - (minuto / 90) * 0.07;
  } else {
    empateBase = 0.285 - margemCondicional * 0.18;
  }
  const poisson = calcularPoissonResultado(expectativa.lambdaCasa, expectativa.lambdaFora, 8);
  let empate = empateBase * 0.48 + poisson.empate * 0.52;
  if (probEmpateApi !== null) {
    const p = probEmpateApi > 1 ? probEmpateApi / 100 : probEmpateApi;
    if (p > 0 && p < 1) empate = empate * 0.35 + p * 0.65;
  }
  if (oddEmpate && oddEmpate > 1) {
    const p = limitarAnalise(1 / oddEmpate, 0.06, 0.42);
    empate = empate * 0.55 + p * 0.45;
  }
  if (fatores.length < 4) empate = empate * 0.7 + 0.3 * 0.26;
  return limitarAnalise(empate, 0.005, 0.62);
}
export function analisarProbabilidadeVitoria(jogo = {}) {
  const casaNome = jogo.home_team || jogo.time_casa || 'Mandante';
  const foraNome = jogo.away_team || jogo.time_fora || 'Visitante';
  const status = String(jogo.status || '').toLowerCase();
  const finalizado = status.includes('finished') || status.includes('final');
  const scoreHome = numeroSeguroAnalise(jogo.scoreHome ?? jogo.placar_casa, 0);
  const scoreAway = numeroSeguroAnalise(jogo.scoreAway ?? jogo.placar_fora, 0);
  const { fatores, probEmpateApi, oddEmpate } = calcularFatoresMatematicosAnalise(jogo);
  if (finalizado) {
    const prob = scoreHome > scoreAway
      ? { casa: 0.995, empate: 0.003, fora: 0.002 }
      : scoreHome < scoreAway
        ? { casa: 0.002, empate: 0.003, fora: 0.995 }
        : { casa: 0.003, empate: 0.994, fora: 0.003 };
    const arred = arredondarProbabilidades(prob.casa, prob.empate, prob.fora);
    return {
      favorito: scoreHome > scoreAway ? casaNome : scoreHome < scoreAway ? foraNome : 'Empate confirmado',
      probabilidade: Math.max(arred.casa, arred.empate, arred.fora),
      probCasa: arred.casa,
      probEmpate: arred.empate,
      probFora: arred.fora,
      confianca: 100,
      nivel: 'Resultado final',
      criteriosUsados: CRITERIOS_ANALISE_RIGOROSA_100.length,
      criteriosTotal: CRITERIOS_ANALISE_RIGOROSA_100.length,
      baseDados: 100,
      pontosFortes: ['Placar final confirmado'],
      metodo: 'Resultado oficial/final',
      golsEsperados: scoreHome + scoreAway,
      placarProjetado: `${scoreHome} - ${scoreAway}`,
      placarProvavel: `${scoreHome} - ${scoreAway}`,
      esperadoCasa: scoreHome,
      esperadoFora: scoreAway
    };
  }
  const pesoTotal = fatores.reduce((acc, f) => acc + f.peso * f.confiabilidade, 0) || 1;
  const mediaLogit = fatores.reduce((acc, f) => acc + logitAnalise(f.casa) * f.peso * f.confiabilidade, 0) / pesoTotal;
  const pCasaBruto = sigmoidAnalise(mediaLogit);
  const criteriosUsados = limitarAnalise(Math.round(fatores.reduce((acc, f) => acc + f.criterios, 0)), 1, CRITERIOS_ANALISE_RIGOROSA_100.length);
  const fatoresReais = fatores.filter(f => f.dadoReal).length;
  const cobertura = limitarAnalise((criteriosUsados / CRITERIOS_ANALISE_RIGOROSA_100.length) * 0.72 + (fatoresReais / 14) * 0.28, 0.16, 1);
  const shrink = limitarAnalise(0.52 + cobertura * 0.48, 0.52, 1);
  const pCasaCondicional = 0.5 + (pCasaBruto - 0.5) * shrink;
  const expectativa = calcularExpectativaGols(jogo, pCasaCondicional);
  const probEmpate = calcularEmpateAnalise({ jogo, pCasaCondicional, fatores, probEmpateApi, oddEmpate, expectativa });
  const probNaoEmpate = 1 - probEmpate;
  let probCasa = pCasaCondicional * probNaoEmpate;
  let probFora = (1 - pCasaCondicional) * probNaoEmpate;
  const poisson = calcularPoissonResultado(expectativa.lambdaCasa, expectativa.lambdaFora, 8);
  const pesoPoisson = status.includes('live') ? 0.42 : 0.34;
  probCasa = probCasa * (1 - pesoPoisson) + poisson.casa * pesoPoisson;
  probFora = probFora * (1 - pesoPoisson) + poisson.fora * pesoPoisson;
  let probEmpateFinal = probEmpate * (1 - pesoPoisson) + poisson.empate * pesoPoisson;
  const soma = Math.max(probCasa + probEmpateFinal + probFora, 0.0001);
  probCasa = probCasa / soma;
  probEmpateFinal = probEmpateFinal / soma;
  probFora = probFora / soma;
  const arred = arredondarProbabilidades(probCasa, probEmpateFinal, probFora);
  const candidatos = [
    { nome: casaNome, tipo: 'casa', prob: arred.casa },
    { nome: 'Empate provável', tipo: 'empate', prob: arred.empate },
    { nome: foraNome, tipo: 'fora', prob: arred.fora }
  ].sort((a, b) => b.prob - a.prob);
  const lider = candidatos[0];
  const segundo = candidatos[1];
  const margem = lider.prob - segundo.prob;
  const alinhados = fatores.filter(f => {
    if (lider.tipo === 'empate') return Math.abs(f.casa - 0.5) < 0.08;
    return lider.tipo === 'casa' ? f.casa > 0.52 : f.fora > 0.52;
  });
  const acordo = alinhados.reduce((acc, f) => acc + f.peso * f.confiabilidade, 0) / pesoTotal;
  let confianca = 31 + cobertura * 33 + acordo * 17 + margem * 0.42;
  if (criteriosUsados < 12) confianca -= 6;
  confianca = limitarAnalise(confianca, 31, 97);
  let nivel = 'Equilibrado';
  if (criteriosUsados < 8) nivel = 'Poucos dados';
  else if (margem >= 23 && confianca >= 78 && cobertura >= 0.45) nivel = 'Favorito muito forte';
  else if (margem >= 16 && confianca >= 68) nivel = 'Favorito forte';
  else if (margem >= 9 && confianca >= 58) nivel = 'Favorito moderado';
  else if (margem >= 4) nivel = 'Leve vantagem';
  const favorito = margem < 3 ? 'Sem favorito claro' : lider.nome;
  const pontosFortes = fatores
    .filter(f => {
      if (lider.tipo === 'empate') return Math.abs(f.casa - 0.5) <= 0.08;
      return lider.tipo === 'casa' ? f.casa > f.fora : f.fora > f.casa;
    })
    .sort((a, b) => (b.peso * b.confiabilidade) - (a.peso * a.confiabilidade))
    .slice(0, 4)
    .map(f => f.nome);
  return {
    favorito,
    probabilidade: Math.max(arred.casa, arred.empate, arred.fora),
    probCasa: arred.casa,
    probEmpate: arred.empate,
    probFora: arred.fora,
    confianca: Math.round(confianca),
    nivel,
    criteriosUsados,
    criteriosTotal: CRITERIOS_ANALISE_RIGOROSA_100.length,
    baseDados: Math.round(limitarAnalise(cobertura * 100, 10, 100)),
    pontosFortes,
    metodo: 'Modelo Poisson + força dos times + odds + placar/minuto',
    golsEsperados: Number(expectativa.golsEsperados.toFixed(2)),
    placarProjetado: expectativa.placarProjetado,
    placarProvavel: status.includes('live') ? expectativa.placarProjetado : poisson.placar,
    esperadoCasa: Number(expectativa.esperadoCasa.toFixed(2)),
    esperadoFora: Number(expectativa.esperadoFora.toFixed(2))
  };
}
