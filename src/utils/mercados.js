import { analisarProbabilidadeVitoria } from './probabilidade.js';

const LINHAS_GOLS = [0.5, 1.5, 2.5, 3.5];
const LINHAS_CANTOS = [7.5, 8.5, 9.5, 10.5];
const LINHAS_CARTOES = [3.5, 4.5, 5.5, 6.5];

function n(valor, padrao = 0) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : padrao;
  const convertido = Number(String(valor).replace('%', '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(convertido) ? convertido : padrao;
}

function limitar(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

function statusJogo(jogo = {}) {
  const status = String(jogo.status || jogo.status_jogo || '').toLowerCase();
  return {
    aoVivo: status.includes('live') || status.includes('ao vivo'),
    finalizado: status.includes('finished') || status.includes('final') || status.includes('encerrado')
  };
}

function minutoJogo(jogo = {}) {
  const { finalizado } = statusJogo(jogo);
  if (finalizado) return 90;
  const raw = String(jogo.time_elapsed || jogo.tempo_jogo || '').match(/\d+/);
  return limitar(raw ? Number(raw[0]) : 0, 0, 90);
}

function poisson(lambda, k) {
  const l = limitar(lambda, 0.01, 12);
  let fat = 1;
  for (let i = 2; i <= k; i++) fat *= i;
  return (Math.exp(-l) * Math.pow(l, k)) / fat;
}

function probOverPoisson(lambda, linha) {
  const limite = Math.floor(linha);
  let under = 0;
  for (let i = 0; i <= limite; i++) under += poisson(lambda, i);
  return limitar(1 - under, 0.01, 0.99);
}

function probUnderPoisson(lambda, linha) {
  return limitar(1 - probOverPoisson(lambda, linha), 0.01, 0.99);
}

function oddJusta(prob) {
  const p = limitar(Number(prob || 0) / 100, 0.01, 0.99);
  return Number((1 / p).toFixed(2));
}

function oddMinima(prob) {
  return Number((oddJusta(prob) * 1.06).toFixed(2));
}

function evPercentual(prob, odd) {
  if (!odd || odd <= 1) return null;
  return Number((((prob / 100) * odd - 1) * 100).toFixed(1));
}

function riscoPorProb(prob, baseDados = 55) {
  if (baseDados < 35) return 'Alto';
  if (prob >= 78) return 'Baixo';
  if (prob >= 63) return 'Medio';
  return 'Alto';
}

function qualidadeEntrada(prob, baseDados = 55, ev = null) {
  if (ev !== null && ev >= 12 && baseDados >= 45) return 'EV+ Forte';
  if (prob >= 76 && baseDados >= 50) return 'Forte';
  if (prob >= 64) return 'Boa';
  if (prob >= 56) return 'Moderada';
  return 'Evitar';
}

function criarMercado({ id, categoria, mercado, selecao, prob, motivo, baseDados, risco, odd = null, prioridade = 50, tipo = 'pre' }) {
  const p = Math.round(limitar(prob, 1, 99));
  const oj = oddJusta(p);
  const omin = oddMinima(p);
  const ev = evPercentual(p, odd);
  return {
    id,
    categoria,
    mercado,
    selecao,
    prob: p,
    oddJusta: oj,
    oddMinima: omin,
    oddMercado: odd,
    ev,
    risco: risco || riscoPorProb(p, baseDados),
    qualidade: qualidadeEntrada(p, baseDados, ev),
    motivo,
    prioridade: prioridade + p + (ev || 0),
    tipo
  };
}

function pegarStats(jogo = {}) {
  const e = jogo.estatisticas || {};
  const s = jogo.stats || {};
  return {
    posseCasa: n(e.posseCasa ?? e.posse_casa ?? s.posseCasa ?? s.posse_casa ?? s.posse, 50),
    posseFora: n(e.posseFora ?? e.posse_fora, 50),
    chutesCasa: n(e.chutesCasa ?? e.chutes_casa ?? s.chutesCasa ?? s.chutes, 10),
    chutesFora: n(e.chutesFora ?? e.chutes_fora ?? s.chutesFora, 8),
    chutesGolCasa: n(e.chutesGolCasa ?? e.chutes_gol_casa ?? s.chutesGolCasa, 4),
    chutesGolFora: n(e.chutesGolFora ?? e.chutes_gol_fora ?? s.chutesGolFora, 3),
    xgCasa: n(e.xgCasa ?? e.xg_casa ?? s.xgCasa ?? s.xg, 0),
    xgFora: n(e.xgFora ?? e.xg_fora ?? s.xgFora, 0),
    ataquesCasa: n(e.ataquesCasa ?? e.ataques_casa ?? s.ataquesCasa, 54),
    ataquesFora: n(e.ataquesFora ?? e.ataques_fora ?? s.ataquesFora, 46),
    ataquesPerigososCasa: n(e.ataquesPerigososCasa ?? e.ataques_perigosos_casa ?? s.ataquesPerigososCasa, 32),
    ataquesPerigososFora: n(e.ataquesPerigososFora ?? e.ataques_perigosos_fora ?? s.ataquesPerigososFora, 28),
    escanteiosCasa: n(e.escanteiosCasa ?? e.escanteios_casa ?? s.cantos ?? s.escanteiosCasa, 0),
    escanteiosFora: n(e.escanteiosFora ?? e.escanteios_fora ?? s.escanteiosFora, 0),
    cartoesCasa: n(e.cartoesCasa ?? e.cartoes_casa ?? s.cartoesCasa, 0),
    cartoesFora: n(e.cartoesFora ?? e.cartoes_fora ?? s.cartoesFora, 0),
    faltasCasa: n(e.faltasCasa ?? e.faltas_casa ?? s.faltasCasa, 10),
    faltasFora: n(e.faltasFora ?? e.faltas_fora ?? s.faltasFora, 10)
  };
}

function probAmbasMarcam(lambdaCasa, lambdaFora) {
  const pCasaZero = poisson(lambdaCasa, 0);
  const pForaZero = poisson(lambdaFora, 0);
  const pAmbosZero = pCasaZero * pForaZero;
  return limitar(1 - pCasaZero - pForaZero + pAmbosZero, 0.01, 0.98);
}

function gerarResultadoMercados(jogo, analise) {
  const casa = jogo.home_team || jogo.time_casa || 'Casa';
  const fora = jogo.away_team || jogo.time_fora || 'Fora';
  const mercados = [];
  const oddPrincipal = n(jogo.odd_principal, null);
  mercados.push(criarMercado({ id: 'res-casa', categoria: 'Resultado', mercado: 'Resultado final', selecao: `${casa} vence`, prob: analise.probCasa, odd: analise.favorito === casa ? oddPrincipal : null, baseDados: analise.baseDados, motivo: 'Modelo combina forca, momento, odds, IA, placar e gols esperados.', prioridade: 95 }));
  mercados.push(criarMercado({ id: 'res-empate', categoria: 'Resultado', mercado: 'Resultado final', selecao: 'Empate', prob: analise.probEmpate, baseDados: analise.baseDados, motivo: 'Chance calculada pelo equilibrio entre times e distribuicao Poisson.', prioridade: 70 }));
  mercados.push(criarMercado({ id: 'res-fora', categoria: 'Resultado', mercado: 'Resultado final', selecao: `${fora} vence`, prob: analise.probFora, odd: analise.favorito === fora ? oddPrincipal : null, baseDados: analise.baseDados, motivo: 'Modelo combina forca, momento, odds, IA, placar e gols esperados.', prioridade: 95 }));
  mercados.push(criarMercado({ id: 'dc-1x', categoria: 'Dupla chance', mercado: 'Dupla chance', selecao: `${casa} ou empate`, prob: analise.probCasa + analise.probEmpate, baseDados: analise.baseDados, motivo: 'Protege contra empate quando o mandante tem boa sustentacao.', prioridade: 82, risco: 'Baixo' }));
  mercados.push(criarMercado({ id: 'dc-x2', categoria: 'Dupla chance', mercado: 'Dupla chance', selecao: `${fora} ou empate`, prob: analise.probFora + analise.probEmpate, baseDados: analise.baseDados, motivo: 'Protege contra empate quando o visitante tem boa sustentacao.', prioridade: 82, risco: 'Baixo' }));
  mercados.push(criarMercado({ id: 'dnb-casa', categoria: 'Empate anula', mercado: 'Draw no bet', selecao: `${casa} empate anula`, prob: analise.probCasa + analise.probEmpate * 0.55, baseDados: analise.baseDados, motivo: 'Reduz risco de empate mantendo exposicao no lado com vantagem.', prioridade: 78 }));
  mercados.push(criarMercado({ id: 'dnb-fora', categoria: 'Empate anula', mercado: 'Draw no bet', selecao: `${fora} empate anula`, prob: analise.probFora + analise.probEmpate * 0.55, baseDados: analise.baseDados, motivo: 'Reduz risco de empate mantendo exposicao no lado com vantagem.', prioridade: 78 }));
  return mercados;
}

function gerarGolsMercados(jogo, analise, stats) {
  const mercados = [];
  const lambdaCasa = limitar(n(analise.esperadoCasa, 1.2), 0.05, 6);
  const lambdaFora = limitar(n(analise.esperadoFora, 1.0), 0.05, 6);
  const total = limitar(lambdaCasa + lambdaFora, 0.2, 8);
  LINHAS_GOLS.forEach(linha => {
    const over = probOverPoisson(total, linha) * 100;
    const under = probUnderPoisson(total, linha) * 100;
    mercados.push(criarMercado({ id: `over-${linha}`, categoria: 'Gols', mercado: `Over ${linha} gols`, selecao: `Mais de ${linha} gols`, prob: over, baseDados: analise.baseDados, motivo: `Gols esperados do jogo: ${total.toFixed(2)}.`, prioridade: linha === 1.5 ? 91 : linha === 2.5 ? 88 : 70 }));
    mercados.push(criarMercado({ id: `under-${linha}`, categoria: 'Gols', mercado: `Under ${linha} gols`, selecao: `Menos de ${linha} gols`, prob: under, baseDados: analise.baseDados, motivo: `Gols esperados do jogo: ${total.toFixed(2)}.`, prioridade: linha === 3.5 ? 85 : 68 }));
  });
  const btts = probAmbasMarcam(lambdaCasa, lambdaFora) * 100;
  mercados.push(criarMercado({ id: 'btts-sim', categoria: 'Gols', mercado: 'Ambos marcam', selecao: 'Sim', prob: btts, baseDados: analise.baseDados, motivo: `Expectativa individual: ${lambdaCasa.toFixed(2)} x ${lambdaFora.toFixed(2)}.`, prioridade: 87 }));
  mercados.push(criarMercado({ id: 'btts-nao', categoria: 'Gols', mercado: 'Ambos marcam', selecao: 'Nao', prob: 100 - btts, baseDados: analise.baseDados, motivo: 'Derivado da chance de pelo menos um time passar em branco.', prioridade: 72 }));
  mercados.push(criarMercado({ id: 'casa-gol', categoria: 'Gols por time', mercado: `${jogo.home_team || 'Casa'} marca`, selecao: 'Over 0.5 gol do mandante', prob: (1 - poisson(lambdaCasa, 0)) * 100, baseDados: analise.baseDados, motivo: 'Probabilidade de o mandante marcar ao menos uma vez.', prioridade: 82 }));
  mercados.push(criarMercado({ id: 'fora-gol', categoria: 'Gols por time', mercado: `${jogo.away_team || 'Fora'} marca`, selecao: 'Over 0.5 gol do visitante', prob: (1 - poisson(lambdaFora, 0)) * 100, baseDados: analise.baseDados, motivo: 'Probabilidade de o visitante marcar ao menos uma vez.', prioridade: 82 }));
  const pressaoTotal = stats.chutesGolCasa + stats.chutesGolFora + (stats.ataquesPerigososCasa + stats.ataquesPerigososFora) * 0.04;
  mercados.push(criarMercado({ id: 'gol-1t', categoria: 'Tempo', mercado: 'Gol no 1º tempo', selecao: 'Mais de 0.5 gol no 1º tempo', prob: limitar((1 - poisson(total * 0.45, 0)) * 100 + pressaoTotal * 0.9, 12, 88), baseDados: analise.baseDados, motivo: 'Estimativa por ritmo ofensivo e distribuicao de gols por tempo.', prioridade: 74 }));
  mercados.push(criarMercado({ id: 'gol-2t', categoria: 'Tempo', mercado: 'Gol no 2º tempo', selecao: 'Mais de 0.5 gol no 2º tempo', prob: limitar((1 - poisson(total * 0.55, 0)) * 100 + pressaoTotal, 18, 91), baseDados: analise.baseDados, motivo: 'Segundo tempo costuma concentrar mais pressao, ajustes e espacos.', prioridade: 78 }));
  return mercados;
}

function gerarCantosMercados(jogo, analise, stats) {
  const { aoVivo } = statusJogo(jogo);
  const min = minutoJogo(jogo);
  const cantosAtuais = stats.escanteiosCasa + stats.escanteiosFora;
  const volume = (stats.chutesCasa + stats.chutesFora) * 0.16 + (stats.ataquesPerigososCasa + stats.ataquesPerigososFora) * 0.045 + (stats.posseCasa > 56 || stats.posseFora > 56 ? 0.6 : 0);
  const basePre = limitar(7.2 + volume, 5.5, 13.5);
  const esperado = aoVivo ? limitar(cantosAtuais + basePre * limitar((90 - min) / 90, 0.05, 1.0), cantosAtuais, 15) : basePre;
  return LINHAS_CANTOS.flatMap(linha => [
    criarMercado({ id: `cantos-over-${linha}`, categoria: 'Escanteios', mercado: `Over ${linha} escanteios`, selecao: `Mais de ${linha} cantos`, prob: probOverPoisson(esperado, linha) * 100, baseDados: analise.baseDados, motivo: `Projecao de cantos: ${esperado.toFixed(1)}.`, prioridade: 73 }),
    criarMercado({ id: `cantos-under-${linha}`, categoria: 'Escanteios', mercado: `Under ${linha} escanteios`, selecao: `Menos de ${linha} cantos`, prob: probUnderPoisson(esperado, linha) * 100, baseDados: analise.baseDados, motivo: `Projecao de cantos: ${esperado.toFixed(1)}.`, prioridade: 63 })
  ]);
}

function gerarCartoesMercados(jogo, analise, stats) {
  const { aoVivo } = statusJogo(jogo);
  const min = minutoJogo(jogo);
  const cartoesAtuais = stats.cartoesCasa + stats.cartoesFora;
  const faltas = stats.faltasCasa + stats.faltasFora;
  const equilibrio = 100 - Math.abs(analise.probCasa - analise.probFora);
  const pressaoJogo = equilibrio * 0.015 + (String(jogo.league_name || '').toLowerCase().includes('final') ? 0.7 : 0);
  const basePre = limitar(3.2 + faltas * 0.045 + pressaoJogo, 2.2, 8.5);
  const esperado = aoVivo ? limitar(cartoesAtuais + basePre * limitar((90 - min) / 90, 0.05, 1), cartoesAtuais, 10) : basePre;
  return LINHAS_CARTOES.flatMap(linha => [
    criarMercado({ id: `cartoes-over-${linha}`, categoria: 'Cartoes', mercado: `Over ${linha} cartoes`, selecao: `Mais de ${linha} cartoes`, prob: probOverPoisson(esperado, linha) * 100, baseDados: analise.baseDados, motivo: `Projecao disciplinar: ${esperado.toFixed(1)} cartoes.`, prioridade: 67 }),
    criarMercado({ id: `cartoes-under-${linha}`, categoria: 'Cartoes', mercado: `Under ${linha} cartoes`, selecao: `Menos de ${linha} cartoes`, prob: probUnderPoisson(esperado, linha) * 100, baseDados: analise.baseDados, motivo: `Projecao disciplinar: ${esperado.toFixed(1)} cartoes.`, prioridade: 58 })
  ]);
}

function gerarAoVivoMercados(jogo, analise, stats) {
  const { aoVivo } = statusJogo(jogo);
  if (!aoVivo) return [];
  const min = minutoJogo(jogo);
  const scoreCasa = n(jogo.scoreHome ?? jogo.placar_casa, 0);
  const scoreFora = n(jogo.scoreAway ?? jogo.placar_fora, 0);
  const pressaoCasa = stats.chutesGolCasa * 8 + stats.ataquesPerigososCasa * 0.8 + stats.escanteiosCasa * 4 + (scoreCasa < scoreFora ? 8 : 0);
  const pressaoFora = stats.chutesGolFora * 8 + stats.ataquesPerigososFora * 0.8 + stats.escanteiosFora * 4 + (scoreFora < scoreCasa ? 8 : 0);
  const totalPressao = Math.max(pressaoCasa + pressaoFora, 1);
  const ladoCasa = pressaoCasa >= pressaoFora;
  const probProxGolLado = limitar(52 + Math.abs(pressaoCasa - pressaoFora) / totalPressao * 38, 45, 86);
  const probGol10 = limitar((stats.chutesGolCasa + stats.chutesGolFora) * 4.4 + (stats.ataquesPerigososCasa + stats.ataquesPerigososFora) * 0.35 + (90 - min) * 0.08, 9, 48);
  return [
    criarMercado({ id: 'live-proximo-gol', categoria: 'Ao vivo', mercado: 'Proximo gol', selecao: ladoCasa ? `${jogo.home_team || 'Casa'} proximo gol` : `${jogo.away_team || 'Fora'} proximo gol`, prob: probProxGolLado, baseDados: analise.baseDados, motivo: 'Calculado por pressao recente, chutes no gol, ataques perigosos e placar.', prioridade: 96, tipo: 'live' }),
    criarMercado({ id: 'live-gol-10min', categoria: 'Ao vivo', mercado: 'Gol nos proximos 10 min', selecao: 'Sim', prob: probGol10, baseDados: analise.baseDados, motivo: 'Alerta de ritmo ofensivo ao vivo. Mercado agressivo e de risco alto.', prioridade: 90, risco: 'Alto', tipo: 'live' }),
    criarMercado({ id: 'live-empate', categoria: 'Ao vivo', mercado: 'Empate ao vivo', selecao: 'Empate no resultado final', prob: analise.probEmpate, baseDados: analise.baseDados, motivo: 'Util quando o jogo esta equilibrado e o relogio favorece fechamento.', prioridade: 64, tipo: 'live' })
  ];
}

function gerarJogadoresMercados(jogo, analise, stats) {
  const casaPlayers = jogo.formacoes?.casa?.jogadores || [];
  const foraPlayers = jogo.formacoes?.fora?.jogadores || [];
  const atacanteCasa = casaPlayers.find(p => /ATA|PD|PE|SA|MEI/i.test(p.pos || ''))?.nome || `Atacante ${jogo.home_team || 'casa'}`;
  const atacanteFora = foraPlayers.find(p => /ATA|PD|PE|SA|MEI/i.test(p.pos || ''))?.nome || `Atacante ${jogo.away_team || 'fora'}`;
  const probCasaFinaliza = limitar(42 + stats.chutesCasa * 2.1 + stats.chutesGolCasa * 3.2 + analise.probCasa * 0.12, 25, 86);
  const probForaFinaliza = limitar(38 + stats.chutesFora * 2.1 + stats.chutesGolFora * 3.2 + analise.probFora * 0.12, 22, 84);
  return [
    criarMercado({ id: 'player-casa-finaliza', categoria: 'Jogadores', mercado: 'Finalizacoes do jogador', selecao: `${atacanteCasa} 1+ finalizacao`, prob: probCasaFinaliza, baseDados: analise.baseDados, motivo: 'Estimado por volume ofensivo do time e funcao provavel do jogador.', prioridade: 62 }),
    criarMercado({ id: 'player-fora-finaliza', categoria: 'Jogadores', mercado: 'Finalizacoes do jogador', selecao: `${atacanteFora} 1+ finalizacao`, prob: probForaFinaliza, baseDados: analise.baseDados, motivo: 'Estimado por volume ofensivo do time e funcao provavel do jogador.', prioridade: 62 }),
    criarMercado({ id: 'player-cartao', categoria: 'Jogadores', mercado: 'Cartao para jogador', selecao: 'Volante/zagueiro receber cartao', prob: limitar(22 + (stats.faltasCasa + stats.faltasFora) * 0.9, 15, 58), baseDados: analise.baseDados, motivo: 'Mercado depende de escalacao e arbitro; usar como alerta, nao entrada principal.', prioridade: 45, risco: 'Alto' })
  ];
}

function combinarProbabilidades(itens = [], penalidade = 0.86) {
  const p = itens.reduce((acc, item) => acc * limitar(item.prob / 100, 0.01, 0.99), 1) * penalidade;
  return limitar(p * 100, 1, 92);
}

function gerarMultiplasMercados(mercados = []) {
  const forte = [...mercados].filter(m => m.prob >= 62 && !['Jogadores'].includes(m.categoria)).sort((a, b) => b.prob - a.prob);
  const dupla = forte.find(m => m.categoria === 'Dupla chance');
  const gols = forte.find(m => m.categoria === 'Gols' && /1.5|2.5/.test(m.mercado));
  const cantos = forte.find(m => m.categoria === 'Escanteios');
  const cards = forte.find(m => m.categoria === 'Cartoes');
  const out = [];
  if (dupla && gols) out.push(criarMercado({ id: 'multi-segura', categoria: 'Multipla IA', mercado: 'Multipla conservadora', selecao: `${dupla.selecao} + ${gols.selecao}`, prob: combinarProbabilidades([dupla, gols], 0.92), baseDados: 70, motivo: 'Combina protecao de resultado com linha de gols mais provavel.', prioridade: 76, risco: 'Medio' }));
  if (gols && cantos) out.push(criarMercado({ id: 'multi-ofensiva', categoria: 'Multipla IA', mercado: 'Multipla ofensiva', selecao: `${gols.selecao} + ${cantos.selecao}`, prob: combinarProbabilidades([gols, cantos], 0.82), baseDados: 62, motivo: 'Combina ritmo ofensivo com volume de cantos. Risco maior por correlacao.', prioridade: 70, risco: 'Alto' }));
  if (cards && dupla) out.push(criarMercado({ id: 'multi-contexto', categoria: 'Multipla IA', mercado: 'Multipla de contexto', selecao: `${dupla.selecao} + ${cards.selecao}`, prob: combinarProbabilidades([dupla, cards], 0.8), baseDados: 58, motivo: 'Combina mercado de protecao com leitura disciplinar do jogo.', prioridade: 64, risco: 'Alto' }));
  return out;
}

export function analisarMercadosDoJogo(jogo = {}) {
  const analise = analisarProbabilidadeVitoria(jogo);
  const stats = pegarStats(jogo);
  const mercados = [
    ...gerarResultadoMercados(jogo, analise),
    ...gerarGolsMercados(jogo, analise, stats),
    ...gerarCantosMercados(jogo, analise, stats),
    ...gerarCartoesMercados(jogo, analise, stats),
    ...gerarAoVivoMercados(jogo, analise, stats),
    ...gerarJogadoresMercados(jogo, analise, stats)
  ];
  const multiplas = gerarMultiplasMercados(mercados);
  const todos = [...mercados, ...multiplas]
    .map(m => ({ ...m, jogoId: jogo.id, jogo: `${jogo.home_team || 'Casa'} x ${jogo.away_team || 'Fora'}` }))
    .sort((a, b) => b.prioridade - a.prioridade);
  const valueBets = todos
    .filter(m => m.qualidade !== 'Evitar' && m.prob >= 58)
    .sort((a, b) => (b.ev ?? b.prob - b.oddJusta) - (a.ev ?? a.prob - a.oddJusta))
    .slice(0, 8);
  const evitar = todos
    .filter(m => m.prob < 45 || m.risco === 'Alto')
    .sort((a, b) => a.prob - b.prob)
    .slice(0, 6)
    .map(m => ({ ...m, alerta: m.prob < 45 ? 'Probabilidade baixa para entrada seca.' : 'Risco elevado; use stake reduzida ou evite.' }));
  const porCategoria = todos.reduce((acc, m) => {
    if (!acc[m.categoria]) acc[m.categoria] = [];
    acc[m.categoria].push(m);
    return acc;
  }, {});
  return {
    analise,
    todos,
    valueBets,
    evitar,
    porCategoria,
    melhorEntrada: valueBets[0] || todos[0],
    resumo: {
      totalMercados: todos.length,
      fortes: todos.filter(m => ['Forte', 'EV+ Forte'].includes(m.qualidade)).length,
      vivos: todos.filter(m => m.tipo === 'live').length,
      riscoAlto: todos.filter(m => m.risco === 'Alto').length
    }
  };
}

export function analisarRadarMercados(jogos = []) {
  return jogos
    .flatMap(jogo => analisarMercadosDoJogo(jogo).valueBets.slice(0, 3).map(m => ({ ...m, origemJogo: jogo })))
    .sort((a, b) => b.prioridade - a.prioridade)
    .slice(0, 12);
}
