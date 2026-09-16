import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, Brain, BrainCircuit, Clock3, Compass, Search, Share2, ShieldCheck, Star, Trophy, UserRound, Users } from 'lucide-react';
import { carregarPreferencias, filtrarParaVoce, pesquisarFutebol, preferenciasPadrao, salvarPreferencias } from '../services/personalizacao.js';
import { buscarClassificacaoApiFootball, buscarJogadorApiFootball, buscarTimeApiFootball } from '../services/apiFootballClient.js';
import EngajamentoR58Pro from './EngajamentoR58Pro.jsx';
import IntelligenceR59Pro from './IntelligenceR59Pro.jsx';

const TABS = [
  ['para-voce', 'Para você', Star], ['pesquisa', 'Buscar', Search], ['alertas', 'Alertas', Bell],
  ['ia', 'IA', Brain], ['responsavel', 'Proteção', ShieldCheck],
  ['explorar', 'Explorar', Compass],
  ['inteligencia', 'Inteligência', BrainCircuit],
];

function Card({ children, className = '' }) {
  return <section className={`rounded-3xl border border-white/10 bg-[#0b1220] p-4 shadow-xl ${className}`}>{children}</section>;
}

function Switch({ checked, onChange, label }) {
  return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 py-3 text-left"><span className="text-xs font-bold text-slate-200">{label}</span><span className={`h-6 w-11 rounded-full p-1 transition ${checked ? 'bg-blue-600' : 'bg-slate-700'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} /></span></button>;
}

function Result({ item, followed, onFollow, onOpen }) {
  const Icon = item.type === 'player' ? UserRound : item.type === 'league' ? Trophy : Users;
  return <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[.03] p-3">
    {item.image ? <img src={item.image} alt="" className="h-11 w-11 rounded-xl object-contain" loading="lazy" /> : <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10"><Icon className="h-5 w-5 text-blue-300" /></span>}
    <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm text-white">{item.name}</strong><span className="block truncate text-[10px] font-semibold text-slate-500">{item.subtitle || 'Dados esportivos'}</span></button>
    <button type="button" onClick={() => onFollow(item)} aria-label={followed ? 'Deixar de seguir' : 'Seguir'} className={`grid h-10 w-10 place-items-center rounded-xl ${followed ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/5 text-slate-400'}`}><Star className={`h-4 w-4 ${followed ? 'fill-current' : ''}`} /></button>
  </div>;
}

function Details({ item, data, loading, onClose }) {
  if (!item) return null;
  const team = data?.team?.team || data?.team || data?.player?.player || data?.player || item;
  const squad = data?.squad?.players || [];
  const table = data?.standings?.[0]?.league?.standings?.flat?.() || [];
  return <div className="fixed inset-0 z-[1200] overflow-y-auto bg-[#050816] p-4 pb-28 text-white">
    <button onClick={onClose} className="mb-5 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5" aria-label="Voltar"><ArrowLeft /></button>
    <Card><div className="flex items-center gap-4">{team?.logo || team?.photo || item.image ? <img src={team?.logo || team?.photo || item.image} alt="" className="h-20 w-20 object-contain" /> : null}<div><p className="text-[9px] font-black uppercase tracking-widest text-blue-300">{item.type === 'team' ? 'Equipe' : item.type === 'league' ? 'Competição' : 'Jogador'}</p><h1 className="text-2xl font-black">{team?.name || item.name}</h1><p className="text-xs text-slate-400">{team?.country || team?.nationality || item.subtitle}</p></div></div></Card>
    {loading && <p className="mt-5 text-center text-sm text-slate-400">Carregando dados reais…</p>}
    {!loading && item.type === 'team' && <Card className="mt-4"><h2 className="mb-3 font-black">Elenco</h2>{squad.length ? <div className="grid grid-cols-2 gap-2">{squad.slice(0, 30).map((p) => <div key={p.id} className="rounded-xl bg-white/5 p-3"><p className="truncate text-xs font-bold">{p.name}</p><p className="text-[9px] text-slate-500">{p.position || 'Jogador'}</p></div>)}</div> : <p className="text-xs text-slate-500">O fornecedor atual não devolveu o elenco.</p>}</Card>}
    {!loading && item.type === 'league' && <Card className="mt-4"><h2 className="mb-3 font-black">Classificação</h2>{table.length ? table.map((row) => <div key={row.rank} className="flex items-center gap-3 border-b border-white/5 py-2 text-xs"><b className="w-6">{row.rank}</b><img src={row.team?.logo} alt="" className="h-6 w-6 object-contain" /><span className="min-w-0 flex-1 truncate">{row.team?.name}</span><b>{row.points} pts</b></div>) : <p className="text-xs text-slate-500">Classificação ainda não disponibilizada pela API para esta temporada.</p>}</Card>}
    {!loading && item.type === 'player' && <Card className="mt-4"><h2 className="font-black">Perfil e estatísticas</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">As estatísticas exibidas são exclusivamente as devolvidas pelo fornecedor esportivo. Quando o plano premium da API for ativado, esta página ganha automaticamente maior cobertura.</p></Card>}
  </div>;
}

export default function CentralPersonalizadaPro({ userData, jogos = [], setViewMode, setJogoSelecionado }) {
  const [tab, setTab] = useState('para-voce');
  const [prefs, setPrefs] = useState(preferenciasPadrao);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ teams: [], players: [], leagues: [] });
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const userId = userData?.user_id || userData?.id || null;

  useEffect(() => { carregarPreferencias(userId).then(setPrefs).catch(() => setPrefs(preferenciasPadrao)); }, [userId]);
  useEffect(() => {
    if (query.trim().length < 3) { setResults({ teams: [], players: [], leagues: [] }); setStatus(''); return; }
    const controller = new AbortController(); const timer = setTimeout(() => {
      setStatus('Buscando…'); pesquisarFutebol(query, controller.signal).then((value) => { setResults(value); setStatus(''); }).catch((e) => { if (e.name !== 'AbortError') setStatus(e.message); });
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const followedIds = useMemo(() => new Set((prefs.seguidos || []).map((x) => `${x.type}:${x.id}`)), [prefs.seguidos]);
  const personalized = useMemo(() => filtrarParaVoce(jogos, prefs.seguidos), [jogos, prefs.seguidos]);
  const history = useMemo(() => { try { const v = JSON.parse(localStorage.getItem('betanalytics_historico_ia_v1') || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } }, []);
  const resolved = history.filter((x) => ['green', 'red', 'win', 'loss', 'acerto', 'erro'].includes(String(x.resultado || x.status || '').toLowerCase()));
  const wins = resolved.filter((x) => ['green', 'win', 'acerto'].includes(String(x.resultado || x.status || '').toLowerCase())).length;
  const accuracy = resolved.length ? Math.round(100 * wins / resolved.length) : null;

  async function update(next) { setPrefs(next); try { await salvarPreferencias(userId, next); setStatus('Preferências salvas.'); } catch { setStatus('Salvo neste aparelho; sincronização pendente.'); } }
  function toggleFollow(item) { const key = `${item.type}:${item.id}`; const next = followedIds.has(key) ? prefs.seguidos.filter((x) => `${x.type}:${x.id}` !== key) : [...prefs.seguidos, item].slice(-100); void update({ ...prefs, seguidos: next }); }
  async function openItem(item) {
    setSelected(item); setLoadingDetail(true); setDetail(null);
    try {
      if (item.type === 'team') setDetail(await buscarTimeApiFootball({ teamId: item.id }));
      else if (item.type === 'player') setDetail({ player: await buscarJogadorApiFootball({ playerId: item.id }) });
      else setDetail({ standings: await buscarClassificacaoApiFootball({ league: item.id, season: item.season || new Date().getFullYear() }) });
    } finally { setLoadingDetail(false); }
  }
  async function share() {
    const text = `BetAnalytics PRO — ${personalized.length} jogos no meu painel personalizado. Análises estatísticas, sem promessa de lucro.`;
    if (navigator.share) await navigator.share({ title: 'BetAnalytics PRO', text, url: location.origin }); else { await navigator.clipboard.writeText(`${text} ${location.origin}`); setStatus('Card copiado para compartilhar.'); }
  }

  return <main className="min-h-screen w-full bg-[#050816] px-3 pb-28 pt-3 text-white">
    <header className="mb-4 flex items-center gap-3"><button onClick={() => setViewMode?.('perfil')} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5"><ArrowLeft /></button><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-300">Experiência 10/10</p><h1 className="text-xl font-black">Minha Central</h1></div></header>
    <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">{TABS.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black ${tab === id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>
    {status && <p className="mb-3 rounded-xl bg-blue-500/10 p-3 text-[10px] font-bold text-blue-200">{status}</p>}

    {tab === 'para-voce' && <><Card className="bg-gradient-to-br from-blue-700/30 to-violet-700/20"><h2 className="text-xl font-black">Feito para você</h2><p className="mt-1 text-xs text-slate-300">Jogos reais dos times e campeonatos que você acompanha.</p><div className="mt-4 flex gap-2"><button onClick={() => setTab('pesquisa')} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black">Escolher favoritos</button><button onClick={share} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10" aria-label="Compartilhar"><Share2 className="h-4 w-4" /></button></div></Card>{personalized.length ? <div className="mt-4 space-y-2">{personalized.slice(0, 30).map((j) => <button key={j.id} onClick={() => setJogoSelecionado?.(j)} className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#0b1220] p-4 text-left"><div><p className="text-xs font-black">{j.home_team} × {j.away_team}</p><p className="mt-1 text-[9px] text-slate-500">{j.league_name}</p></div><span className="text-[10px] font-bold text-blue-300">Abrir</span></button>)}</div> : <Card className="mt-4 text-center"><Star className="mx-auto h-8 w-8 text-yellow-300" /><h3 className="mt-3 font-black">Personalize seu painel</h3><p className="mt-1 text-xs text-slate-500">Siga times e ligas ou aguarde jogos dos seus favoritos.</p></Card>}</>}

    {tab === 'pesquisa' && <><Card><label className="flex items-center gap-3"><Search className="h-5 w-5 text-blue-300" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Time, jogador ou campeonato" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" /></label></Card><div className="mt-4 space-y-2">{[...results.teams, ...results.players, ...results.leagues].map((item) => <Result key={`${item.type}:${item.id}`} item={item} followed={followedIds.has(`${item.type}:${item.id}`)} onFollow={toggleFollow} onOpen={openItem} />)}</div>{!query && prefs.seguidos.length > 0 && <div className="mt-5"><h2 className="mb-2 text-xs font-black uppercase text-slate-500">Você segue</h2><div className="space-y-2">{prefs.seguidos.map((item) => <Result key={`${item.type}:${item.id}`} item={item} followed onFollow={toggleFollow} onOpen={openItem} />)}</div></div>}</>}

    {tab === 'alertas' && <Card><h2 className="font-black">Alertas personalizados</h2><p className="mb-2 mt-1 text-[10px] text-slate-500">Aplicados aos seus favoritos quando o fornecedor disponibilizar o evento.</p>{Object.entries({ inicio: 'Início da partida', gol: 'Gols', intervalo: 'Intervalo', fim: 'Resultado final', escalacao: 'Escalações', cartoes: 'Cartões', odds: 'Movimento de odds' }).map(([key, label]) => <Switch key={key} label={label} checked={Boolean(prefs.alertas[key])} onChange={(value) => void update({ ...prefs, alertas: { ...prefs.alertas, [key]: value } })} />)}</Card>}

    {tab === 'ia' && <><Card><p className="text-[9px] font-black uppercase tracking-widest text-violet-300">Histórico auditável</p><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><b className="text-2xl">{history.length}</b><p className="text-[8px] text-slate-500">ANÁLISES</p></div><div><b className="text-2xl">{resolved.length}</b><p className="text-[8px] text-slate-500">ENCERRADAS</p></div><div><b className="text-2xl">{accuracy === null ? '—' : `${accuracy}%`}</b><p className="text-[8px] text-slate-500">ACERTOS</p></div></div></Card><Card className="mt-4"><h2 className="font-black">Como ler a confiança</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">Confiança é uma estimativa estatística baseada nos dados disponíveis, não garantia de resultado. A taxa histórica só aparece quando há partidas encerradas suficientes; nunca usamos valores simulados.</p><button onClick={() => setViewMode?.('como-ia')} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-black">Ver metodologia</button></Card></>}

    {tab === 'responsavel' && <><Card><h2 className="flex items-center gap-2 font-black"><ShieldCheck className="text-emerald-300" /> Central de uso responsável</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">O BetAnalytics é uma plataforma de análise e educação. Não recebe depósitos, não realiza apostas e não garante lucro.</p><label className="mt-5 block text-[10px] font-black uppercase text-slate-500">Limite diário de uso: {prefs.responsavel.limiteMinutosDia} min</label><input type="range" min="15" max="180" step="15" value={prefs.responsavel.limiteMinutosDia} onChange={(e) => void update({ ...prefs, responsavel: { ...prefs.responsavel, limiteMinutosDia: Number(e.target.value) } })} className="mt-3 w-full" /><Switch label="Ocultar informações de odds" checked={prefs.responsavel.ocultarOdds} onChange={(value) => void update({ ...prefs, responsavel: { ...prefs.responsavel, ocultarOdds: value } })} /></Card><Card className="mt-4"><h3 className="flex items-center gap-2 font-black"><Clock3 className="text-amber-300" /> Fazer uma pausa</h3><div className="mt-3 grid grid-cols-3 gap-2">{[1, 7, 30].map((days) => <button key={days} onClick={() => void update({ ...prefs, responsavel: { ...prefs.responsavel, pausaAte: new Date(Date.now() + days * 86400000).toISOString() } })} className="rounded-xl bg-white/5 p-3 text-xs font-black">{days} dia{days > 1 ? 's' : ''}</button>)}</div>{prefs.responsavel.pausaAte && <button onClick={() => void update({ ...prefs, responsavel: { ...prefs.responsavel, pausaAte: null } })} className="mt-3 text-xs font-bold text-blue-300">Cancelar pausa definida</button>}</Card></>}
    {tab === 'explorar' && <EngajamentoR58Pro prefs={prefs} updatePrefs={update} jogos={personalized.length ? personalized : jogos} seguidos={prefs.seguidos} setTab={setTab} />}
    {tab === 'inteligencia' && <IntelligenceR59Pro prefs={prefs} jogos={jogos} onOpen={(j) => setJogoSelecionado?.(j)} />}
    <Details item={selected} data={detail} loading={loadingDetail} onClose={() => setSelected(null)} />
  </main>;
}
