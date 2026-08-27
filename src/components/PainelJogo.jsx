import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Brain, TrendingUp, ShieldAlert, Target, Activity,
  BarChart3, Zap, Database, Swords, Home, Plane, CheckCircle2,
  AlertTriangle, Loader2
} from 'lucide-react';
import { buscarHistoricalEngineApiFootball } from '../services/apiFootballClient.js';

const n = (v, f = null) => Number.isFinite(Number(v)) ? Number(v) : f;
const txt = (v, f = '') => String(v || f || '').trim();

function statusTexto(jogo) {
  const s = txt(
    jogo?.status || jogo?.status_short || jogo?.fixture?.status?.short ||
    jogo?.fixture?.status?.long || jogo?.time_elapsed || jogo?.tempo_jogo,
    'NS'
  ).toLowerCase();
  if (s.includes('live') || s.includes('ao vivo') || s.includes('1h') || s.includes('2h')) return 'Ao Vivo';
  if (s === 'ft' || s.includes('finished') || s.includes('finalizado') || s.includes('encerrado')) return 'Finalizado';
  return 'Agendado';
}

function escudo(nome) {
  const ini = txt(nome, 'T').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="28" fill="#0f172a"/><circle cx="48" cy="48" r="36" fill="#2563eb"/><text x="48" y="57" text-anchor="middle" font-size="28" font-family="Arial" font-weight="800" fill="white">${ini}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function Info({ icon: Icon, titulo, valor, sub, cor = 'text-white' }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">{titulo}</div>
          <div className={`text-xl font-black break-words ${cor}`}>{valor}</div>
          {sub && <div className="text-[10px] font-bold text-slate-400 mt-1">{sub}</div>}
        </div>
        <div className="w-10 h-10 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${cor}`} />
        </div>
      </div>
    </div>
  );
}

function Barra({ label, valor }) {
  const v = n(valor, 0);
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
        <span>{label}</span><span>{v.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
      </div>
    </div>
  );
}

function Sequencia({ itens = [] }) {
  if (!itens?.length) return <span className="text-[10px] text-slate-500 font-bold">Sem amostra</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {itens.slice(0, 10).map((r, i) => (
        <span key={`${r}-${i}`} className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black ${
          r === 'V' ? 'bg-green-500/20 text-green-300' :
          r === 'E' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-red-500/20 text-red-300'
        }`}>{r}</span>
      ))}
    </div>
  );
}

function Fator({ fator, casa, fora }) {
  const p = fator?.probabilidades;
  return (
    <div className="border-b border-white/5 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <div className="text-[11px] font-black text-white">{fator?.label}</div>
          <div className="text-[9px] font-bold uppercase text-slate-500">
            Peso {fator?.peso}% · cobertura {Math.round((fator?.cobertura || 0) * 100)}%
          </div>
        </div>
        <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase ${
          fator?.disponivel ? 'bg-green-500/10 text-green-300' : 'bg-white/5 text-slate-500'
        }`}>{fator?.disponivel ? 'Real' : 'Indisponível'}</span>
      </div>
      {p && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [casa, p.home, 'text-blue-300'],
            ['Empate', p.draw, 'text-yellow-300'],
            [fora, p.away, 'text-purple-300'],
          ].map(([label, value, cor]) => (
            <div key={label} className="bg-white/5 rounded-xl p-2">
              <div className="text-[8px] uppercase text-slate-500 font-black truncate">{label}</div>
              <div className={`text-xs font-black ${cor}`}>{n(value, 0).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PainelJogo(props) {
  const jogo = props?.jogo || props?.jogoSelecionado || props?.game || props?.partida || props?.dados || {};
  const fixtureId = jogo?.api_football_id || jogo?.fixture?.id || jogo?.raw_api_football?.fixture?.id || null;
  const [hist, setHist] = useState(null);
  const [loading, setLoading] = useState(Boolean(fixtureId));
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!fixtureId) { setHist(null); setLoading(false); setErro(''); return undefined; }
    const c = new AbortController();
    (async () => {
      try {
        setLoading(true); setErro('');
        const data = await buscarHistoricalEngineApiFootball(fixtureId, { signal: c.signal });
        if (!c.signal.aborted) setHist(data);
      } catch (e) {
        if (e?.name !== 'AbortError' && !c.signal.aborted) setErro(e?.message || 'Falha no Historical Engine.');
      } finally {
        if (!c.signal.aborted) setLoading(false);
      }
    })();
    return () => c.abort();
  }, [fixtureId]);

  const dados = useMemo(() => {
    const casa = txt(jogo?.home_team || jogo?.time_casa || jogo?.teams?.home?.name, 'Time Casa');
    const fora = txt(jogo?.away_team || jogo?.time_fora || jogo?.teams?.away?.name, 'Time Fora');
    return {
      casa, fora,
      liga: txt(jogo?.league_name || jogo?.liga || jogo?.league?.name, 'Liga'),
      pais: txt(jogo?.league_country || jogo?.pais || jogo?.league?.country, ''),
      placarCasa: n(jogo?.scoreHome ?? jogo?.placar_casa ?? jogo?.goals?.home, 0),
      placarFora: n(jogo?.scoreAway ?? jogo?.placar_fora ?? jogo?.goals?.away, 0),
      status: statusTexto(jogo),
      logoCasa: jogo?.home_image || jogo?.logo_casa || jogo?.teams?.home?.logo || escudo(casa),
      logoFora: jogo?.away_image || jogo?.logo_fora || jogo?.teams?.away?.logo || escudo(fora),
    };
  }, [jogo]);

  const ativo = hist?.ok === true && hist?.configurado === true && hist?.probabilidades;
  const sel = ativo ? hist?.selecao : null;
  const conf = n(sel?.confianca);
  const qualidade = n(hist?.qualidadeDados, 0);
  const ev = n(sel?.ev);
  const risco = conf === null ? 'Aguardando' : conf >= 85 ? 'Baixo' : conf >= 72 ? 'Moderado' : 'Alto';

  function voltar() {
    if (typeof props?.onBack === 'function') return props.onBack();
    if (typeof props?.setJogoSelecionado === 'function') return props.setJogoSelecionado(null);
    if (typeof props?.setViewMode === 'function') return props.setViewMode('jogos');
    window.dispatchEvent(new CustomEvent('betanalytics:voltarInicio'));
  }

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={voltar} className="w-10 h-10 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center active:scale-95">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">BetAnalytics Historical Engine</div>
          <h2 className="text-2xl font-black text-white leading-tight">Análise da partida</h2>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600/25 via-[#0f172a] to-yellow-500/10 border border-blue-500/30 rounded-[32px] p-5 mb-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {dados.liga} {dados.pais ? `· ${dados.pais}` : ''}
            </div>
            <div className="text-[11px] font-black text-green-400 mt-1">{dados.status}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            {conf === null ? 'IA --' : `IA ${conf}%`}
          </div>
        </div>

        <div className="grid grid-cols-3 items-center text-center">
          {[['home', dados.casa, dados.logoCasa], ['away', dados.fora, dados.logoFora]].map(([lado, nome, logo], idx) => (
            <React.Fragment key={lado}>
              {idx === 1 && (
                <div>
                  <div className="text-4xl font-black text-white">
                    {dados.status === 'Agendado' ? '-' : `${dados.placarCasa} - ${dados.placarFora}`}
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 mt-1">Placar</div>
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <img src={logo} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = escudo(nome); }} className="w-16 h-16 object-contain" alt={nome} />
                <div className="text-sm font-black text-white line-clamp-2">{nome}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {!fixtureId && (
        <div className="bg-[#0f172a] border border-yellow-500/20 rounded-3xl p-5 mb-5">
          <div className="flex items-center gap-2 text-yellow-300 font-black text-sm"><AlertTriangle className="w-5 h-5" />Historical Engine indisponível</div>
          <p className="text-[11px] text-slate-400 font-bold mt-2">Esta partida não possui fixture ID da API-Football. Nenhuma confiança será inventada.</p>
        </div>
      )}

      {loading && (
        <div className="bg-[#0f172a] border border-blue-500/20 rounded-3xl p-5 mb-5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <div><div className="text-sm font-black text-white">Historical Engine analisando</div><div className="text-[10px] text-slate-500 font-bold">Forma, H2H, ataque, defesa, tabela, desfalques e mercado.</div></div>
        </div>
      )}

      {!loading && fixtureId && hist?.configurado === false && (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/25 rounded-3xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3"><Database className="w-5 h-5 text-blue-400" /><h3 className="text-sm font-black text-white uppercase">Motor instalado e pronto</h3></div>
          <p className="text-[11px] text-slate-300 font-bold leading-relaxed">Quando API_FOOTBALL_KEY for configurada no servidor, esta tela passará a calcular somente com dados reais.</p>
          <div className="mt-3 text-[10px] font-black uppercase text-yellow-300">Nenhum percentual fictício é exibido sem a API.</div>
        </div>
      )}

      {erro && <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-4 mb-5 text-xs font-black text-red-300">{erro}</div>}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Info icon={Brain} titulo="Confiança do modelo" valor={conf === null ? '--' : `${conf}%`} sub="Força da seleção" cor="text-blue-400" />
        <Info icon={Database} titulo="Qualidade dos dados" valor={ativo ? `${qualidade}%` : '--'} sub="Cobertura ponderada" cor="text-purple-300" />
        <Info icon={Target} titulo="Mercado" valor={sel?.label || 'Aguardando dados'} sub={sel?.oddMercado ? `Odd ${n(sel.oddMercado, 0).toFixed(2)}` : 'Sem odd real disponível'} cor="text-green-400" />
        <Info icon={ShieldAlert} titulo="Risco" valor={risco} sub="Classificação do motor" cor={risco === 'Baixo' ? 'text-green-400' : risco === 'Moderado' ? 'text-yellow-300' : risco === 'Aguardando' ? 'text-slate-400' : 'text-red-300'} />
      </div>

      {ativo && (
        <>
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-blue-400" /><h3 className="text-sm font-black text-white uppercase">Probabilidades do modelo</h3></div>
            <div className="space-y-4">
              <Barra label={`Vitória ${dados.casa}`} valor={hist.probabilidades.home} />
              <Barra label="Empate" valor={hist.probabilidades.draw} />
              <Barra label={`Vitória ${dados.fora}`} valor={hist.probabilidades.away} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <Info icon={TrendingUp} titulo="Odd justa" valor={sel?.oddJusta ? n(sel.oddJusta, 0).toFixed(2) : '--'} sub="Probabilidade BetAnalytics" cor="text-yellow-300" />
            <Info icon={Zap} titulo="EV estimado" valor={ev === null ? '--' : `${ev >= 0 ? '+' : ''}${ev.toFixed(1)}%`} sub="Exige odd real disponível" cor={ev === null ? 'text-slate-400' : ev >= 0 ? 'text-green-400' : 'text-red-300'} />
          </div>

          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-green-400" /><h3 className="text-sm font-black text-white uppercase">Forma real · últimos jogos</h3></div>
            {[['casa', dados.casa, 'text-blue-300'], ['fora', dados.fora, 'text-purple-300']].map(([k, nome, cor]) => {
              const f = hist?.forma?.[k];
              return <div key={k} className="mb-5 last:mb-0">
                <div className="flex justify-between gap-3 mb-2"><div className="text-[10px] font-black uppercase text-slate-400">{nome}</div><div className={`text-[10px] font-black ${cor}`}>Score {f?.score ?? '--'}/100</div></div>
                <Sequencia itens={f?.sequencia} />
                <div className="text-[9px] text-slate-500 font-bold mt-2">{f?.vitorias ?? 0}V · {f?.empates ?? 0}E · {f?.derrotas ?? 0}D</div>
              </div>;
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <Info icon={Home} titulo={`${dados.casa} em casa`} valor={hist?.forma?.casaMandante?.score === null ? '--' : `${hist?.forma?.casaMandante?.score}/100`} sub={`${hist?.forma?.casaMandante?.amostra || 0} jogos`} cor="text-blue-300" />
            <Info icon={Plane} titulo={`${dados.fora} fora`} valor={hist?.forma?.foraVisitante?.score === null ? '--' : `${hist?.forma?.foraVisitante?.score}/100`} sub={`${hist?.forma?.foraVisitante?.amostra || 0} jogos`} cor="text-purple-300" />
          </div>

          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4"><Swords className="w-5 h-5 text-yellow-300" /><h3 className="text-sm font-black text-white uppercase">Confronto direto · H2H ponderado</h3></div>
            {hist?.h2h?.amostra > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[[hist.h2h.vitoriasCasa, dados.casa, 'text-blue-300'], [hist.h2h.empates, 'Empates', 'text-yellow-300'], [hist.h2h.vitoriasFora, dados.fora, 'text-purple-300']].map(([v, l, cor]) => (
                    <div key={l} className="bg-white/5 rounded-2xl p-3"><div className={`text-xl font-black ${cor}`}>{v}</div><div className="text-[8px] uppercase font-black text-slate-500">{l}</div></div>
                  ))}
                </div>
                <div className="text-[9px] text-slate-500 font-bold mt-3">Jogos recentes recebem peso maior; partidas com mais de 2 anos recebem peso reduzido.</div>
              </>
            ) : <div className="text-[11px] text-slate-500 font-bold">H2H não disponível.</div>}
          </div>

          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-green-400" /><h3 className="text-sm font-black text-white uppercase">Consenso</h3></div>
            <div className="text-2xl font-black text-white mb-3">{hist?.consenso?.alinhados || 0}/{hist?.consenso?.total || 0}</div>
            <div className="space-y-2">
              {(hist?.consenso?.picks || []).map(item => (
                <div key={item.origem} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-black text-slate-400">{item.origem}</span>
                  <span className="text-[10px] font-black text-white uppercase">{item.pick === 'home' ? dados.casa : item.pick === 'away' ? dados.fora : 'Empate'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-blue-400" /><h3 className="text-sm font-black text-white uppercase">Por que essa escolha?</h3></div>
            <div className="space-y-2">
              {(hist?.explicacao?.razoes || []).map((x, i) => <div key={`r-${i}`} className="flex gap-2 text-[11px] font-bold text-slate-300"><span className="text-green-400">✓</span><span>{x}</span></div>)}
              {(hist?.explicacao?.alertas || []).map((x, i) => <div key={`a-${i}`} className="flex gap-2 text-[11px] font-bold text-slate-400"><span className="text-yellow-300">⚠</span><span>{x}</span></div>)}
            </div>
          </div>

          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-2"><Database className="w-5 h-5 text-purple-300" /><h3 className="text-sm font-black text-white uppercase">Transparência dos dados</h3></div>
            <div className="text-[11px] text-slate-400 font-bold mb-4">Qualidade {qualidade}% · a confiança cai automaticamente quando faltam fontes ou amostras.</div>
            {(hist?.fatores || []).map(f => <Fator key={f.id} fator={f} casa={dados.casa} fora={dados.fora} />)}
          </div>
        </>
      )}
    </div>
  );
}
