import React, { useEffect, useMemo, useState } from 'react';
import { Accessibility, CalendarPlus, CheckCircle2, Flag, Newspaper, RefreshCw, WifiOff } from 'lucide-react';
import { aplicarAcessibilidade, baixarCalendario, buscarNoticiasFutebol, relatarProblema } from '../services/engajamentoR58.js';

function Box({ children }) { return <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-4 shadow-xl">{children}</section>; }

export default function EngajamentoR58Pro({ prefs, updatePrefs, jogos = [], seguidos = [], setTab }) {
  const [section, setSection] = useState('inicio');
  const [news, setNews] = useState([]);
  const [newsState, setNewsState] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [report, setReport] = useState({ entity_type: 'app', entity_id: '', category: 'incorrect', description: '' });
  const [feedback, setFeedback] = useState('');
  const onboarding = prefs.onboarding || { completed: false };
  const accessibility = prefs.accessibility || { textScale: 100, reduceMotion: false, highContrast: false };

  useEffect(() => { aplicarAcessibilidade(accessibility); }, [accessibility.textScale, accessibility.reduceMotion, accessibility.highContrast]);

  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);

  const query = useMemo(() => {
    const names = seguidos.slice(0, 3).map((x) => x.name).filter(Boolean);
    return names.length ? `${names.join(' OR ')} futebol` : 'futebol brasileiro';
  }, [seguidos]);

  async function loadNews() {
    setNewsState('Carregando notícias…');
    try { const value = await buscarNoticiasFutebol(query); setNews(value.items); setNewsState(value.offline ? 'Exibindo o último conteúdo salvo.' : ''); }
    catch (error) { setNewsState(error.message); }
  }
  useEffect(() => { if (section === 'noticias' && news.length === 0) void loadNews(); }, [section]);

  function saveAccessibility(next) {
    aplicarAcessibilidade(next);
    void updatePrefs({ ...prefs, accessibility: next });
  }

  async function sendReport(event) {
    event.preventDefault(); setFeedback('Enviando…');
    try { await relatarProblema(report); setReport({ ...report, description: '' }); setFeedback('Relato recebido. Obrigado por ajudar.'); }
    catch (error) { setFeedback(error.message); }
  }

  const sections = [['inicio', 'Começar'], ['noticias', 'Notícias'], ['agenda', 'Agenda'], ['ajustes', 'Acessibilidade'], ['relato', 'Corrigir dado']];
  return <div className="space-y-4">
    <div className="flex gap-2 overflow-x-auto pb-1">{sections.map(([id, label]) => <button key={id} onClick={() => setSection(id)} className={`shrink-0 rounded-xl px-3 py-2 text-[10px] font-black ${section === id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-400'}`}>{label}</button>)}</div>
    {!online && <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs font-bold text-amber-200"><WifiOff className="h-4 w-4"/>Modo offline: usando conteúdo real salvo.</div>}

    {section === 'inicio' && <Box><CheckCircle2 className="h-9 w-9 text-emerald-300"/><h2 className="mt-3 text-xl font-black">Configure sua experiência</h2><p className="mt-1 text-xs text-slate-400">Siga times, jogadores e ligas para personalizar notícias, jogos e alertas.</p><div className="mt-4 grid gap-2"><button onClick={() => setTab('pesquisa')} className="rounded-xl bg-blue-600 p-3 text-xs font-black">Escolher favoritos</button><button onClick={() => setTab('alertas')} className="rounded-xl bg-white/5 p-3 text-xs font-black">Configurar alertas</button><button onClick={() => void updatePrefs({ ...prefs, onboarding: { completed: true, completedAt: new Date().toISOString() } })} className="rounded-xl border border-emerald-400/30 p-3 text-xs font-black text-emerald-300">{onboarding.completed ? 'Configuração concluída' : 'Concluir configuração'}</button></div></Box>}

    {section === 'noticias' && <><Box><div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 font-black"><Newspaper className="text-blue-300"/>Notícias personalizadas</h2><p className="mt-1 text-[10px] text-slate-500">Títulos e links das fontes originais, sem copiar matérias.</p></div><button onClick={loadNews} className="grid h-10 w-10 place-items-center rounded-xl bg-white/5" aria-label="Atualizar"><RefreshCw className="h-4 w-4"/></button></div>{newsState && <p className="mt-3 text-xs text-amber-200">{newsState}</p>}</Box><div className="space-y-2">{news.map((item) => <a key={`${item.url}-${item.published_at}`} href={item.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/5 bg-[#0b1220] p-4"><p className="text-xs font-black leading-relaxed">{item.title}</p><p className="mt-2 text-[9px] text-slate-500">{item.source}{item.published_at ? ` • ${new Date(item.published_at).toLocaleString('pt-BR')}` : ''}</p></a>)}</div></>}

    {section === 'agenda' && <><Box><h2 className="flex items-center gap-2 font-black"><CalendarPlus className="text-violet-300"/>Calendário pessoal</h2><p className="mt-1 text-xs text-slate-400">Exporte os jogos para o calendário do celular sem compartilhar seus dados.</p><button disabled={!jogos.length} onClick={() => baixarCalendario(jogos)} className="mt-4 w-full rounded-xl bg-violet-600 p-3 text-xs font-black disabled:opacity-40">Adicionar {jogos.length} jogos ao calendário</button></Box>{jogos.slice(0, 20).map((j) => <div key={j.id} className="rounded-2xl bg-white/5 p-3 text-xs"><b>{j.home_team || j.time_casa} × {j.away_team || j.time_fora}</b><p className="mt-1 text-[9px] text-slate-500">{j.starting_at ? new Date(j.starting_at).toLocaleString('pt-BR') : 'Horário não informado'}</p></div>)}</>}

    {section === 'ajustes' && <Box><h2 className="flex items-center gap-2 font-black"><Accessibility className="text-cyan-300"/>Acessibilidade</h2><label className="mt-4 block text-xs font-bold">Tamanho do texto: {accessibility.textScale}%<input type="range" min="90" max="115" step="5" value={accessibility.textScale} onChange={(e) => saveAccessibility({ ...accessibility, textScale: Number(e.target.value) })} className="mt-2 w-full"/></label>{[['reduceMotion','Reduzir animações'],['highContrast','Aumentar contraste']].map(([key,label]) => <button key={key} onClick={() => saveAccessibility({ ...accessibility, [key]: !accessibility[key] })} className="mt-3 flex w-full justify-between rounded-xl bg-white/5 p-3 text-xs font-bold"><span>{label}</span><span>{accessibility[key] ? 'Ativado' : 'Desativado'}</span></button>)}</Box>}

    {section === 'relato' && <Box><h2 className="flex items-center gap-2 font-black"><Flag className="text-red-300"/>Informar problema</h2><form onSubmit={sendReport} className="mt-4 space-y-3"><select value={report.entity_type} onChange={(e) => setReport({ ...report, entity_type: e.target.value })} className="w-full rounded-xl bg-slate-900 p-3 text-xs"><option value="app">Aplicativo</option><option value="match">Partida</option><option value="team">Time</option><option value="player">Jogador</option><option value="league">Campeonato</option></select><select value={report.category} onChange={(e) => setReport({ ...report, category: e.target.value })} className="w-full rounded-xl bg-slate-900 p-3 text-xs"><option value="incorrect">Informação incorreta</option><option value="outdated">Informação desatualizada</option><option value="missing">Informação ausente</option><option value="bug">Erro no aplicativo</option><option value="other">Outro</option></select><input value={report.entity_id} onChange={(e) => setReport({ ...report, entity_id: e.target.value })} maxLength="80" placeholder="Jogo, time ou referência (opcional)" className="w-full rounded-xl bg-slate-900 p-3 text-xs"/><textarea required minLength="5" maxLength="500" value={report.description} onChange={(e) => setReport({ ...report, description: e.target.value })} placeholder="Explique o que precisa ser corrigido" className="h-28 w-full rounded-xl bg-slate-900 p-3 text-xs"/><button className="w-full rounded-xl bg-red-600 p-3 text-xs font-black">Enviar relato</button></form>{feedback && <p className="mt-3 text-xs text-blue-200">{feedback}</p>}</Box>}
  </div>;
}
