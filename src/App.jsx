import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css'; 
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { Home, Radio, Trophy, Crown, Star, X, User, Zap, TrendingUp, AlertTriangle, ArrowLeft, Send, DollarSign, Target, Bell, Globe } from 'lucide-react';

// ============================================================================
// ⚙️ IMPORTAÇÃO DOS NOVOS MOTORES (ALGORITMOS E MATEMÁTICA)
// ============================================================================
import { detectarValueBetReal } from './algorithms/valueBet.js';
import { calcularEV, calcularHeatScore, calcularKelly } from './utils/math.js';
import { calcularRisco, calcularStake } from './utils/risk.js';

// ============================================================================
// 🪝 IMPORTAÇÃO DOS HOOKS E CODE SPLITTING
// ============================================================================
import { useFavoritos } from './hooks/useFavoritos.js';
import { useJogos } from './hooks/useJogos.js';
import { useIA } from './hooks/useIA.js';

const Perfil = lazy(() => import('./components/Perfil.jsx'));
const PainelJogo = lazy(() => import('./components/PainelJogo.jsx'));

// ============================================================================
// 🔒 CONFIGURAÇÕES DE SEGURANÇA E INICIALIZAÇÃO
// ============================================================================
const MODO_DEMONSTRACAO = true; 
const API_URL = '';

let supabase = { from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }) };

try {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  if (url && url.startsWith('http')) supabase = createClient(url, key);
} catch (e) {
  console.error("Erro Supabase:", e);
}

const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-5947285218976034';
initMercadoPago(mpKey, { locale: 'pt-BR' });

const PAISES = ['brasil', 'argentina', 'colômbia', 'uruguai', 'chile', 'peru', 'equador', 'venezuela', 'bolívia', 'paraguai', 'espanha', 'alemanha', 'frança', 'portugal', 'inglaterra', 'itália', 'holanda', 'bélgica', 'croácia', 'méxico', 'eua', 'canadá'];

const isSelecao = (home, away, liga) => {
    const str = `${home || ''} ${away || ''} ${liga || ''}`.toLowerCase();
    if (str.includes('euro') || str.includes('copa') || str.includes('nations') || str.includes('world cup')) return true;
    return PAISES.some(p => str.includes(p));
};

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };

const listaLigas = [{name:'Todos', id: null}, {name:'Brasileirão', id: 71}, {name:'Champions', id: 2}, {name:'Premier League', id: 39}];

// 📊 DADOS DOS GRÁFICOS PREMIUM
const crescimentoBancaGlobal = [ 
  { dia: "Seg", banca: 1000 }, { dia: "Ter", banca: 1080 }, { dia: "Qua", banca: 1150 }, 
  { dia: "Qui", banca: 1210 }, { dia: "Sex", banca: 1280 }, { dia: "Sáb", banca: 1390 }, { dia: "Dom", banca: 1470 } 
];

const desempenhoDiario = [
  { dia: "Seg", acertos: 14, erros: 3 }, { dia: "Ter", acertos: 18, erros: 2 }, { dia: "Qua", acertos: 12, erros: 5 },
  { dia: "Qui", acertos: 20, erros: 4 }, { dia: "Sex", acertos: 25, erros: 6 }, { dia: "Sáb", acertos: 32, erros: 8 }, { dia: "Dom", acertos: 28, erros: 5 }
];

// ============================================================================
// 📱 COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  
  const [performanceStats] = useState({ totalAnalises: 512, acertos: 431, erros: 81, roi: 18.4, ultimaSemana: 87 });
  const [bancaInicial] = useState(1000);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  const [xp] = useState(350);

  const [jogosTempoReal, setJogosTempoReal] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  
  const nivelUsuario = () => xp > 3000 ? "Mestre" : xp > 1000 ? "Especialista" : "Profissional";

  const { favoritos, toggleFavorito } = useFavoritos();
  const { jogos: jogosDoHook, loading: loadingHook } = useJogos(API_URL, ligaAtivaId, []);

  // 🔄 Crawler Automático Supabase
  useEffect(() => {
    const puxarJogosDoServidor = async () => {
      try {
        const { data, error } = await supabase.from('jogos_ao_vivo').select('*');
        if (error || !data) return;

        const formatados = data.map(j => {
          const odd = j.odd_principal || (Math.random() * (2.8 - 1.2) + 1.2);
          const ia = (j.confianca_ia && j.confianca_ia !== 89) ? j.confianca_ia : Math.min(99, Math.round((100/odd) + (Math.floor(Math.random()*9)-2)));

          return {
            id: j.id_jogo, league_id: 999, league_name: j.liga || 'Monitoramento Ao Vivo', starting_at: `${getLocalYYYYMMDD()}T00:00:00`,
            status: (j.tempo_jogo === 'INTERVALO' || j.tempo_jogo.includes("'")) ? 'Live' : (j.tempo_jogo.includes('ENCERRADO') ? 'Finished' : 'Not Started'),
            time_elapsed: j.tempo_jogo, home_team: j.time_casa, away_team: j.time_fora,
            home_image: j.logo_casa || 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png', 
            away_image: j.logo_fora || 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png',
            scoreHome: j.placar_casa, scoreAway: j.placar_fora, confianca_ia: ia, odd_principal: odd,
          };
        });
        setJogosTempoReal(formatados);
      } catch (err) { console.error(err); } finally { setLoadingReal(false); }
    };
    puxarJogosDoServidor();
    const timer = setInterval(puxarJogosDoServidor, 30000); 
    return () => clearInterval(timer);
  }, []);

  const jogos = [...jogosTempoReal, ...jogosDoHook];
  const loading = loadingHook && loadingReal;

  const { aiOpen, setAiOpen, aiQuery, setAiQuery, aiLoading, aiMessages, handleAskAI, gerarExplicacaoIA } = useIA(API_URL, jogos, setJogoSelecionado);

  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: em.includes('admin') }); 
      else if (MODO_DEMONSTRACAO) setUserData({ email: "lucas@vip.com", nome: "Lucas", is_vip: true, is_admin: true }); 
  }, []);

  useEffect(() => {
      if(jogos.length){
          const validos = viewMode === 'copa' ? jogos.filter(j => isSelecao(j.home_team, j.away_team, j.league_name)) : jogos.filter(j => !isSelecao(j.home_team, j.away_team, j.league_name));
          const selecoes = [...validos].filter(j => j.confianca_ia >= 80).sort((a,b) => b.confianca_ia - a.confianca_ia).slice(0,3);
          setBilhetePremium({ selecoes, oddFinal: selecoes.reduce((acc, j) => acc * (j.odd_principal || 1), 1) });
      }
  }, [jogos, viewMode]);

  let jFilt = jogos.filter(j => { 
      const sel = isSelecao(j.home_team, j.away_team, j.league_name);
      if (viewMode === 'jogos' && sel) return false; 
      if (viewMode === 'copa' && !sel) return false;  
      if (filterCentro === 'Ao Vivo') return j.status === 'Live'; 
      if (filterCentro === 'Favoritos') return favoritos.includes(j.id); 
      if (ligaAtivaId !== null && j.league_id !== ligaAtivaId && j.league_id !== 999) return false;
      return true; 
  });
  
  const jGrp = jFilt.reduce((a, j) => { if (!a[j.league_name]) a[j.league_name] = []; a[j.league_name].push(j); return a; }, {});

  const RenderizarListaJogos = () => {
      if (loading) return <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div>;
      if (Object.keys(jGrp).length === 0) return <div className="text-center text-slate-500 py-10 font-bold">Nenhuma oportunidade encontrada.</div>;

      return Object.entries(jGrp).map(([leagueName, matches]) => (
          <div key={leagueName} className="mb-6 w-full">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div>
              {matches.map(j => {
                  const risco = calcularRisco(j);
                  return (
                      <div key={j.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer relative transition-all hover:border-blue-500/50 w-full transform-gpu">
                          <div className="flex justify-between items-center mb-5">
                              {j.status === 'Live' ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> : <span className="text-slate-400 text-[10px] font-bold uppercase">{j.status === 'Finished' ? 'Finalizado' : 'Agendado'}</span>}
                              <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                          </div>
                          <div className="grid grid-cols-3 items-center text-center mb-4">
                              <div className="flex flex-col items-center gap-2 min-w-0"><img src={j.home_image} className="w-10 h-10 object-contain drop-shadow-md" alt=""/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.home_team}</span></div>
                              <div className="text-2xl font-black tracking-tighter">{j.status === 'Live' || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600">-</span>}</div>
                              <div className="flex flex-col items-center gap-2 min-w-0"><img src={j.away_image} className="w-10 h-10 object-contain drop-shadow-md" alt=""/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.away_team}</span></div>
                          </div>
                          <div className="flex justify-center gap-2 border-t border-white/5 pt-3">
                              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-md">Confiança: {j.confianca_ia}%</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border ${risco.cor} ${risco.cor.replace('border-', 'text-')}`}>Risco: {risco.nivel}</span>
                          </div>
                      </div>
                  )
              })}
          </div>
      ));
  };

  if (showSplash) return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white">
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl mb-4">⚽</motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black tracking-tight"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></motion.div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans pb-28 w-full max-w-full overflow-x-hidden">
      <header className="flex items-center justify-between px-5 py-4 bg-[#050816] sticky top-0 z-40 border-b border-white/5">
        <h1 className="font-black text-xl sm:text-2xl tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span></h1>
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-3 py-2 rounded-xl text-xs"><Crown className="w-4 h-4 inline mr-1" /> VIP</button>
      </header>

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4 w-full">
              {viewMode === 'copa' && (
                  <div className="px-4 w-full">
                      <div className="bg-gradient-to-br from-yellow-600 to-yellow-900 rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden">
                          <Globe className="absolute -right-4 -top-4 w-32 h-32 text-yellow-500/20" />
                          <h2 className="text-2xl font-black text-white flex items-center gap-2 relative z-10"><Trophy className="w-6 h-6 text-yellow-300"/> Seleções</h2>
                          <p className="text-yellow-200 text-xs mt-1 relative z-10 font-bold">Monitoramento de Eurocopa e Internacionais</p>
                      </div>
                      <RenderizarListaJogos />
                  </div>
              )}

              {viewMode === 'jogos' && (
                  <>
                    {/* 📊 GRÁFICO 1: EVOLUÇÃO DE BANCA (ÁREA NÉON) */}
                    <div className="mx-4 mb-4 bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden transform-gpu">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desempenho Semanal</h3>
                          <h2 className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                            Crescimento Líquido <span className="text-emerald-400 text-[10px] font-black bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +47.0%</span>
                          </h2>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-2xl">
                          <DollarSign className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                      <div className="w-full h-48 sm:h-56 mt-2 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={crescimentoBancaGlobal} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="glowGradiant" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="dia" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                            <Area type="monotone" dataKey="banca" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#glowGradiant)" dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3, fill: '#050816' }} activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 📊 GRÁFICO 2: PRECISÃO DIÁRIA (BARRAS ELITE) */}
                    <div className="mx-4 mb-6 bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden transform-gpu">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precisão da IA</h3>
                          <h2 className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                            Acertos vs Erros <span className="text-emerald-400 text-[10px] font-black bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5"><Target className="w-3 h-3" /> 84% Win Rate</span>
                          </h2>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-2xl">
                          <Zap className="w-4 h-4 text-purple-400" />
                        </div>
                      </div>
                      <div className="w-full h-48 sm:h-56 mt-2 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={desempenhoDiario} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={12}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="dia" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                            <Bar dataKey="acertos" name="Greens (Acertos)" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="erros" name="Reds (Erros)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4 w-full">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>

                    <div className="px-4 w-full"><RenderizarListaJogos /></div>
                  </>
              )}

              {viewMode === 'perfil' && (
                  <div className="px-4 animate-fade-in w-full">
                     <Suspense fallback={<div className="text-center py-10 font-black text-blue-500 animate-pulse text-xs uppercase tracking-widest">A carregar Perfil...</div>}>
                        <Perfil userData={userData} form={form} setForm={setForm} nivelUsuario={nivelUsuario()} xp={xp} setViewMode={setViewMode} apostas={[]} bancaInicial={bancaInicial} metaMensal={2000} setMenuAtivo={setMenuAtivo} />
                     </Suspense>
                  </div>
              )}

              {viewMode === 'admin' && (
                  <div className="px-4 animate-fade-in pb-20 w-full">
                      <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><button onClick={() => setViewMode('perfil')} className="p-2 bg-[#050816] rounded-full border border-white/10"><ArrowLeft className="w-5 h-5"/></button><h2 className="text-xl font-black">Painel Admin</h2></div></div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#0f172a] p-4 rounded-3xl border border-white/5 shadow-lg"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Usuários</div><div className="text-2xl font-black text-white">1,248</div></div>
                          <div className="bg-[#0f172a] p-4 rounded-3xl border border-yellow-500/20 shadow-lg"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Assinantes PRO</div><div className="text-2xl font-black text-yellow-400">312</div></div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {jogoSelecionado && menuAtivo !== 'assinar pro' && (
          <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs uppercase">A carregar...</div>}>
              <PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly} />
          </Suspense>
      )}

      <button onClick={() => setAiOpen(true)} className="fixed right-5 bottom-28 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg z-40 text-2xl hover:scale-105 transition-transform border border-blue-300/30">🤖</button>

      <AnimatePresence>
          {aiOpen && (
              <motion.div initial={{opacity:0, y:20, scale:0.9}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.9, y:20}} className="fixed right-4 left-4 bottom-24 bg-[#0f172a] border border-slate-700 p-4 rounded-3xl shadow-2xl z-50 flex flex-col max-h-[70vh]">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5"><h3 className="font-black flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400"/> Assistente IA</h3><button onClick={() => setAiOpen(false)} className="text-slate-400 bg-slate-800 rounded-full p-1.5"><X className="w-4 h-4"/></button></div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1 custom-scrollbar">
                      {aiMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-semibold shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-[#050816] border border-slate-800 text-slate-300 rounded-tl-sm'}`}>{msg.text}</div></div>
                      ))}
                      {aiLoading && <div className="flex justify-start"><div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 text-slate-300 text-xs font-bold"><span className="animate-pulse">A processar...</span></div></div>}
                  </div>
                  <form onSubmit={handleAskAI} className="flex gap-2">
                      <input type="text" placeholder="Pergunte à IA..." value={aiQuery} onChange={(e)=>setAiQuery(e.target.value)} disabled={aiLoading} className="flex-1 bg-[#050816] border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 font-bold"/>
                      <button type="submit" disabled={aiLoading || !aiQuery.trim()} className="bg-blue-600 text-white p-3 rounded-2xl flex items-center justify-center"><Send className="w-5 h-5"/></button>
                  </form>
              </motion.div>
          )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816] border-t border-white/5 flex justify-around items-center z-50 shadow-2xl">
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' ? 'text-blue-500' : 'text-slate-500'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Início</span></button>
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' ? 'text-red-500' : 'text-slate-500'}`}><Radio className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Ao Vivo</span></button>
        <button onClick={() => {setViewMode('copa'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'copa' ? 'text-yellow-500' : 'text-slate-500'}`}><Trophy className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Copa</span></button>
        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'perfil' ? 'text-blue-500' : 'text-slate-500'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Perfil</span></button>
      </nav>
    </div>
  );
}