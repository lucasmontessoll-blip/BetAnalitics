import React, { useState, useEffect } from 'react';
import './app.css'; 
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { Home, BarChart2, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, Crosshair, Bell, Globe, Calendar, DollarSign, Activity, ShieldAlert, ArrowLeft, Send, Settings, CheckCircle2 } from 'lucide-react';

// ============================================================================
// ⚙️ CONFIGURAÇÕES PRINCIPAIS E MODO DEMONSTRAÇÃO
// ============================================================================
const MODO_DEMONSTRACAO = true; 
const API_SPORTS_KEY = "7ff15d43907d5138e48674b29ab56a65";
const API_URL = 'https://betanalitics-1-9stc.onrender.com'; // O seu servidor Real

initMercadoPago('APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc', { locale: 'pt-BR' });

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };

const listaLigas = [{name:'Todos', id: null}, {name:'Serie A', id: 71}, {name:'Champions', id: 2}, {name:'Libertadores', id: 13}, {name:'La Liga', id: 140}, {name:'Premier', id: 39}, {name:'Copa do Brasil', id: 73}];

// ============================================================================
// 🗄️ DADOS MOCKADOS E CÁLCULO DE RANKING DINÂMICO
// ============================================================================
const precisionData = [ {dia:"Seg", valor:81}, {dia:"Ter", valor:83}, {dia:"Qua", valor:79}, {dia:"Qui", valor:87}, {dia:"Sex", valor:85}, {dia:"Sab", valor:89}, {dia:"Dom", valor:87} ];

const mockJogosData = [
  { id: 101, league_id: 71, league_name: 'Brasileirão Série A', starting_at: `${getLocalYYYYMMDD()}T16:00:00`, status: 'Live', time_elapsed: 62, home_team: 'Flamengo', home_id: 127, away_team: 'Palmeiras', away_id: 121, home_image: 'https://media.api-sports.io/football/teams/127.png', away_image: 'https://media.api-sports.io/football/teams/121.png', scoreHome: 2, scoreAway: 1, confianca_ia: 92 },
  { id: 102, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T19:30:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Liverpool', home_id: 40, away_team: 'Man City', away_id: 50, home_image: 'https://media.api-sports.io/football/teams/40.png', away_image: 'https://media.api-sports.io/football/teams/50.png', scoreHome: null, scoreAway: null, confianca_ia: 89 },
  { id: 103, league_id: 140, league_name: 'La Liga', starting_at: `${getLocalYYYYMMDD()}T14:00:00`, status: 'Finished', time_elapsed: 90, home_team: 'Real Madrid', home_id: 541, away_team: 'Barcelona', away_id: 529, home_image: 'https://media.api-sports.io/football/teams/541.png', away_image: 'https://media.api-sports.io/football/teams/529.png', scoreHome: 3, scoreAway: 1, confianca_ia: 88 },
  { id: 104, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T20:00:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Arsenal', home_id: 42, away_team: 'Chelsea', away_id: 49, home_image: 'https://media.api-sports.io/football/teams/42.png', away_image: 'https://media.api-sports.io/football/teams/49.png', scoreHome: null, scoreAway: null, confianca_ia: 85 }
];

const mockJogoDetalhes = { advice: "Forte pressão ofensiva nos últimos 15 minutos suportam a entrada no 'Back Home' a 1.82.", stats_reais: [{type: "Posse (%)", h: 58, a: 42}, {type: "Remates", h: 12, a: 5}, {type: "Cantos", h: 8, a: 4}] };

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [jogos, setJogos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [viewMode, setViewMode] = useState('jogos'); // jogos, ranking, perfil, ia_center, favoritos, radar, admin
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [favoritos, setFavoritos] = useState([101, 102]); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  
  // Estados IA Chat
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'assistant', text: "Olá! Sou o motor IA do BetAnalytics. Qual é a sua dúvida sobre a rodada de hoje?" }]);

  // Sistema de Alertas
  const [alertas, setAlertas] = useState([
      { id: 1, msg: "O Flamengo chegou a 94% de confiança no mercado Home.", lida: false },
      { id: 2, msg: "Nova oportunidade detectada: Liverpool Over 2.5", lida: false }
  ]);

  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) { setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas", is_vip: true, is_admin: true }); }
      else if (MODO_DEMONSTRACAO) { setUserData({ email: "lucas@vip.com", nome: "Lucas", is_vip: true, is_admin: true }); } 
  }, []);
  
  useEffect(() => {
      setLoading(true);
      setTimeout(() => { setJogos(mockJogosData.filter(x => ligaAtivaId === null ? true : x.league_id === ligaAtivaId)); setLoading(false); }, 500); 
  }, [ligaAtivaId]);

  const abrirPainelDoJogo = (j) => {
    if(!userData?.is_vip) return setMenuAtivo('assinar pro');
    setJogoSelecionado({ ...j, is_loading: true });
    setTimeout(() => { setJogoSelecionado({ ...j, ...mockJogoDetalhes, is_loading: false }); }, 800); 
  };

  const toggleFavorito = (e, id) => { e.stopPropagation(); setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]); };

  const handleAskAI = async (e) => {
      e?.preventDefault();
      if(!aiQuery.trim() || aiLoading) return;
      const newMsg = { role: 'user', text: aiQuery };
      setAiMessages(prev => [...prev, newMsg]);
      const perguntaAtual = aiQuery; setAiQuery(''); setAiLoading(true);
      try {
          const resumoJogos = jogos.map(j => `${j.home_team} vs ${j.away_team}`).join(", ");
          const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: perguntaAtual, dadosDaRodada: resumoJogos || "Sem jogos no momento" });
          setAiMessages(prev => [...prev, { role: 'assistant', text: resposta.data.resposta }]);
      } catch (error) {
          setAiMessages(prev => [...prev, { role: 'assistant', text: "Houve uma falha na comunicação com o radar central. Tente novamente." }]);
      } finally { setAiLoading(false); }
  };

  const gerarExplicacaoIA = async (jogo) => {
      setJogoSelecionado(prev => ({...prev, is_loading_explanation: true}));
      try {
          const resposta = await axios.post(`${API_URL}/api/chat-ia`, {
              pergunta: `Explique o motivo da confiança de ${jogo.confianca_ia}% para o jogo ${jogo.home_team} vs ${jogo.away_team}.`,
              dadosDaRodada: jogo
          });
          setJogoSelecionado(prev => ({...prev, explanation: resposta.data.resposta, is_loading_explanation: false}));
      } catch (e) {
          setJogoSelecionado(prev => ({...prev, explanation: "Análise tática profunda indica superioridade nos flancos e EV+ no mercado atual.", is_loading_explanation: false}));
      }
  };

  let jFilt = (jogos||[]).filter(j => { 
      if(filterCentro === 'Ao Vivo') return j.status==='Live';
      if(filterCentro === 'Favoritos') return favoritos.includes(j.id);
      return true; 
  });
  
  const jGrp = jFilt.reduce((a, j) => { if (!a[j.league_name]) a[j.league_name] = []; a[j.league_name].push(j); return a; }, {});

  // 4️⃣ RANKING DINÂMICO
  const rankingDinamico = [...jogos].sort((a, b) => b.confianca_ia - a.confianca_ia).slice(0, 10);

  const HeaderNav = ({ title, onBack }) => (
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 bg-[#050816] rounded-full hover:bg-slate-800 transition border border-white/10"><ArrowLeft className="w-5 h-5"/></button>
              <h2 className="text-xl font-black">{title}</h2>
          </div>
      </div>
  );

  if (showSplash) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white">
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-6xl mb-4">⚽</motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-2xl font-black tracking-tight flex items-center">
            <span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans pb-28">
      
      {/* HEADER GLOBAL */}
      <header className="flex items-center justify-between px-5 py-4 backdrop-blur-md bg-[#050816]/80 sticky top-0 z-40 border-b border-white/5">
        <h1 className="font-black text-2xl tracking-tight flex items-center">
            <span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span>
            <span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span>
        </h1>
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all">
          <Crown className="w-4 h-4" /> {userData?.is_vip ? "VIP ATIVO" : "ASSINAR PRO"}
        </button>
      </header>

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4">
              
              {/* =========================================
                  1. TELA PRINCIPAL (HOME)
              ========================================= */}
              {viewMode === 'jogos' && (
                  <>
                    {userData?.is_vip && (
                        <div className="mx-4 mb-6 rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_30px_rgba(13,110,253,0.3)] flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-2"><Crown className="w-5 h-5 text-yellow-400"/> IA Premium</h2>
                            <p className="text-blue-100 text-xs mt-1"><strong>87%</strong> de precisão hoje</p>
                            <p className="text-yellow-300 text-xs font-bold mt-1"><strong>2</strong> oportunidades encontradas</p>
                        </div>
                        <button onClick={() => setViewMode('ranking')} className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-4 py-3 rounded-xl transition-all uppercase tracking-wider">VER RANKING</button>
                        </div>
                    )}

                    {/* 🚨 MELHOR OPORTUNIDADE DO DIA */}
                    <div className="backdrop-blur-xl bg-slate-900/85 border-2 border-yellow-500 rounded-3xl p-6 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden mx-4">
                        <div className="text-[10px] font-black text-red-500 bg-red-500/20 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 mb-4 animate-pulse uppercase tracking-wider"><ShieldAlert className="w-3 h-3"/> MELHOR OPORTUNIDADE DO DIA</div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Flamengo x Palmeiras</h2>
                        <div className="text-6xl font-black text-green-400 mb-1 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)] tracking-tighter">92%</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-5">Confiança Muito Alta</div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-5"><span className="text-yellow-400 font-bold text-sm flex items-center gap-2">🔥 Recomendação: Vitória Flamengo</span></div>
                        <button onClick={() => abrirPainelDoJogo(mockJogosData[0])} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2">Ver Análise Completa <ChevronRight className="w-4 h-4"/></button>
                    </div>

                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>

                    <div className="px-4">
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <h3 className="font-black flex items-center gap-2 text-xl"><span className="text-2xl">⚽</span> Jogos de Hoje</h3>
                        </div>

                        {loading ? <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div> : 
                        Object.entries(jGrp).map(([leagueName, matches]) => (
                            <div key={leagueName} className="mb-6">
                                {matches.map(j => {
                                    const isLive = j.status === 'Live';
                                    return (
                                        <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer relative overflow-hidden transition-all hover:border-blue-500/50">
                                            <div className="flex justify-between items-center mb-5">
                                                {isLive ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-lg shadow-red-500/20 animate-pulse uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> : <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{j.status === 'Finished' ? 'Finalizado' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>}
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate max-w-[50%] text-center">{leagueName}</span>
                                                <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1 z-10 relative"><Star className={`w-5 h-5 transition-colors ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                                            </div>
                                            <div className="grid grid-cols-3 items-center text-center mb-5">
                                                <div className="flex flex-col items-center gap-2"><img src={j.home_image} className="w-12 h-12 object-contain drop-shadow-md" alt=""/><span className="text-xs font-bold text-slate-200 line-clamp-1 w-full">{j.home_team}</span></div>
                                                <div className="text-4xl font-black tracking-tighter">{isLive || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600 text-2xl">-</span>}</div>
                                                <div className="flex flex-col items-center gap-2"><img src={j.away_image} className="w-12 h-12 object-contain drop-shadow-md" alt=""/><span className="text-xs font-bold text-slate-200 line-clamp-1 w-full">{j.away_team}</span></div>
                                            </div>
                                            {userData?.is_vip ? (
                                                <div className="grid grid-cols-3 gap-2 mt-2">
                                                    {['1.82', '3.60', '4.75'].map((odd, idx) => (
                                                        <button key={idx} className="bg-[#050816] rounded-xl py-3 flex flex-col items-center justify-center border border-white/5 hover:bg-blue-600 transition-colors">
                                                            <span className="text-[10px] text-slate-500 mb-0.5 font-bold">{idx===0?'1':idx===1?'X':'2'}</span><span className="font-black text-base text-white">{odd}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); setMenuAtivo('assinar pro'); }} className="w-full bg-[#050816] border border-white/10 rounded-2xl py-4 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 mt-2">
                                                    <Crown className="w-4 h-4 text-yellow-500" /> Desbloquear Análise IA
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                  </>
              )}

              {/* =========================================
                  2. TELA: HUB DE PERFIL (CONTROLE CENTRAL)
              ========================================= */}
              {viewMode === 'perfil' && (
                  <div className="px-4">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-black flex items-center gap-2"><User className="w-6 h-6 text-blue-500"/> Meu Perfil</h2>
                          {userData?.is_admin && (
                              <button onClick={() => setViewMode('admin')} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg transition-colors uppercase tracking-widest"><Settings className="w-3 h-3"/> Painel Admin</button>
                          )}
                      </div>
                      
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]"><User className="w-10 h-10 text-white"/></div>
                          <h2 className="text-xl font-black text-white mb-1">{form.nome || userData?.nome || "Lucas"}</h2>
                          {userData?.is_vip ? <div className="text-[10px] font-black tracking-widest text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 mb-6 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> VIP PRO ATIVO</div> : <div className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 mb-6">PLANO GRATUITO</div>}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <button onClick={() => setViewMode('ia_center')} className="backdrop-blur-xl bg-slate-900/85 border border-blue-500/30 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-2 hover:bg-blue-900/40 transition shadow-lg"><Zap className="w-8 h-8 text-blue-500"/> <span className="font-bold text-xs uppercase tracking-wider">Central IA</span></button>
                          <button onClick={() => setViewMode('favoritos')} className="backdrop-blur-xl bg-slate-900/85 border border-yellow-500/30 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-2 hover:bg-yellow-900/40 transition shadow-lg"><Star className="w-8 h-8 text-yellow-500"/> <span className="font-bold text-xs uppercase tracking-wider">Favoritos</span></button>
                          <button onClick={() => setViewMode('alertas')} className="backdrop-blur-xl bg-slate-900/85 border border-red-500/30 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-2 hover:bg-red-900/40 transition shadow-lg"><Bell className="w-8 h-8 text-red-500"/> <span className="font-bold text-xs uppercase tracking-wider">Alertas IA</span></button>
                          <button onClick={() => setViewMode('radar')} className="backdrop-blur-xl bg-slate-900/85 border border-purple-500/30 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-2 hover:bg-purple-900/40 transition shadow-lg"><Globe className="w-8 h-8 text-purple-400"/> <span className="font-bold text-xs uppercase tracking-wider">Radar Global</span></button>
                      </div>

                      {/* Push Notifications Toggle */}
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-5 rounded-2xl flex justify-between items-center shadow-lg">
                          <div>
                              <div className="font-bold text-sm text-white">Notificações Push</div>
                              <div className="text-[10px] text-slate-400 mt-1">Receba alertas em tempo real</div>
                          </div>
                          <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                      </div>
                  </div>
              )}

              {/* =========================================
                  3. TELAS EXTRAS DO HUB
              ========================================= */}
              
              {/* 3️⃣ DASHBOARD ADMIN */}
              {viewMode === 'admin' && (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
                      <HeaderNav title="⚙️ Dashboard Admin" onBack={() => setViewMode('perfil')} />
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-purple-500/30 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
                          <div className="absolute -right-10 -top-10 opacity-10"><Settings className="w-40 h-40 text-purple-500" /></div>
                          <h2 className="text-sm font-black text-white mb-5 uppercase tracking-wider relative z-10">Visão Geral (Supabase)</h2>
                          <div className="grid grid-cols-2 gap-3 relative z-10">
                              <div className="bg-[#050816] p-4 rounded-xl border border-white/5"><div className="text-2xl font-black text-white">1,248</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Usuários Registados</div></div>
                              <div className="bg-[#050816] p-4 rounded-xl border border-white/5"><div className="text-2xl font-black text-yellow-400">312</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Assinantes VIP</div></div>
                              <div className="bg-[#050816] p-4 rounded-xl border border-white/5"><div className="text-xl font-black text-green-400">R$ 9.328</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Receita MRR</div></div>
                              <div className="bg-[#050816] p-4 rounded-xl border border-white/5"><div className="text-xl font-black text-blue-400">156</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Análises Hoje</div></div>
                          </div>
                      </div>
                  </motion.div>
              )}

              {/* 8️⃣ IA CENTER COM 1️⃣ HISTÓRICO DE ACERTOS */}
              {viewMode === 'ia_center' && (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
                      <HeaderNav title="🤖 Central IA" onBack={() => setViewMode('perfil')} />
                      
                      {/* CARD: IA CENTER */}
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-blue-500/30 rounded-3xl p-6 mb-6 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10"><Zap className="w-40 h-40 text-blue-500" /></div>
                        <div className="flex flex-col gap-3 relative z-10">
                            <div className="flex justify-between items-center bg-[#050816] p-4 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Jogos analisados hoje</span><strong className="text-white text-lg">1520</strong></div>
                            <div className="flex justify-between items-center bg-[#050816] p-4 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Top Pick Global</span><strong className="text-yellow-400 font-black text-lg">Flamengo</strong></div>
                            <div className="flex justify-between items-center bg-[#050816] p-4 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Última atualização</span><strong className="text-white text-xs">AGORA MESMO</strong></div>
                        </div>
                      </div>

                      {/* 1️⃣ CARD: HISTÓRICO DE ACERTOS */}
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-green-500/30 rounded-3xl p-6 mb-6 shadow-lg">
                          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500"/> Histórico IA</h2>
                          <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-[#050816] p-3 rounded-xl border border-white/5"><div className="text-xl font-black text-white">152</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Jogos</div></div>
                              <div className="bg-[#050816] p-3 rounded-xl border border-white/5"><div className="text-xl font-black text-green-400">132</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Acertos</div></div>
                              <div className="bg-[#050816] p-3 rounded-xl border border-white/5"><div className="text-xl font-black text-blue-400">86.8%</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Precisão</div></div>
                          </div>
                      </div>
                  </motion.div>
              )}

              {/* 4️⃣ RANKING DINÂMICO IA */}
              {viewMode === 'ranking' && (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
                      <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-black flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500"/> Top 10 IA</h2>
                      </div>
                      <div className="flex flex-col gap-3">
                          {rankingDinamico.map((item, index) => (
                              <div key={item.id} onClick={() => abrirPainelDoJogo(item)} className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-lg cursor-pointer hover:border-yellow-500/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : index === 1 ? 'bg-slate-400/20 text-slate-300 border-slate-400/50' : index === 2 ? 'bg-orange-700/20 text-orange-400 border-orange-700/50' : 'bg-[#050816] text-slate-500 border-white/5'}`}>#{index+1}</div>
                                      <div>
                                          <div className="font-black text-base text-white">{item.home_team}</div>
                                          <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase">vs {item.away_team}</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-2xl font-black text-green-400">{item.confianca_ia}%</div>
                                      <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Confiança</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </motion.div>
              )}

              {/* 5️⃣ SISTEMA DE ALERTAS */}
              {viewMode === 'alertas' && (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
                      <HeaderNav title="🔔 Alertas Inteligentes" onBack={() => setViewMode('perfil')} />
                      <div className="flex flex-col gap-3">
                          {alertas.map(alert => (
                              <div key={alert.id} className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-5 rounded-3xl shadow-lg flex items-start gap-4">
                                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                  <div className="text-sm font-bold text-slate-200 leading-relaxed">{alert.msg}</div>
                              </div>
                          ))}
                      </div>
                  </motion.div>
              )}

              {/* 6️⃣ FAVORITOS INTELIGENTES */}
              {viewMode === 'favoritos' && (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
                      <HeaderNav title="⭐ Favoritos" onBack={() => setViewMode('perfil')} />
                      <div className="flex flex-col gap-3">
                          {mockJogosData.filter(j => favoritos.includes(j.id)).map(jogo => (
                              <div key={jogo.id} onClick={() => abrirPainelDoJogo(jogo)} className="backdrop-blur-xl bg-slate-900/85 border border-yellow-500/30 p-5 rounded-3xl shadow-lg flex justify-between items-center cursor-pointer">
                                  <div>
                                      <div className="font-black text-base text-white mb-1">{jogo.home_team} x {jogo.away_team}</div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confiança IA: <strong className="text-green-400 text-sm">{jogo.confianca_ia}%</strong></div>
                                  </div>
                                  <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                              </div>
                          ))}
                      </div>
                  </motion.div>
              )}

              {viewMode === 'radar' && (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
                      <HeaderNav title="🌎 Radar Global" onBack={() => setViewMode('perfil')} />
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#050816] p-4 rounded-xl border border-white/5 text-center"><div className="text-2xl font-black text-white">12</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Brasil</div></div>
                            <div className="bg-[#050816] p-4 rounded-xl border border-white/5 text-center"><div className="text-2xl font-black text-white">8</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Inglaterra</div></div>
                        </div>
                      </div>
                  </motion.div>
              )}
          </div>
      )}

      {/* =========================================
          PAINEL DO JOGO ABERTO (COM 2️⃣ INTEGRAÇÃO GEMINI)
      ========================================= */}
      {jogoSelecionado && !jogoSelecionado.is_loading && menuAtivo !== 'assinar pro' && (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4 mt-4">
            <button onClick={() => setJogoSelecionado(null)} className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-6 backdrop-blur-xl bg-slate-900/85 border border-white/10 px-4 py-2 rounded-xl uppercase tracking-wider"><X className="w-4 h-4"/> Voltar</button>
            <div className="backdrop-blur-xl bg-slate-900/85 rounded-3xl p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col items-center w-1/3"><img src={jogoSelecionado.home_image} className="w-16 h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-xs text-center">{jogoSelecionado.home_team}</span></div>
                    <div className="w-1/3 text-center"><div className="text-4xl font-black mb-1 tracking-tighter">{jogoSelecionado.status === 'Not Started' ? 'VS' : `${jogoSelecionado.scoreHome} - ${jogoSelecionado.scoreAway}`}</div><span className="text-[10px] text-red-500 font-black bg-red-500/10 px-2 py-1 rounded-md uppercase tracking-wider">{jogoSelecionado.time_elapsed}' MIN</span></div>
                    <div className="flex flex-col items-center w-1/3"><img src={jogoSelecionado.away_image} className="w-16 h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-xs text-center">{jogoSelecionado.away_team}</span></div>
                </div>
                
                {/* 2️⃣ BOTÃO GERAR EXPLICAÇÃO GEMINI */}
                <div className="bg-[#050816] rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden flex flex-col items-start">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-xl rounded-full"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10"><Crosshair className="w-5 h-5 text-blue-500" /><h4 className="font-black text-xs text-blue-400 uppercase tracking-widest">ANÁLISE ESTATÍSTICA IA</h4></div>
                    
                    {jogoSelecionado.explanation ? (
                        <p className="text-slate-300 text-xs leading-relaxed relative z-10 font-semibold">{jogoSelecionado.explanation}</p>
                    ) : (
                        <button onClick={() => gerarExplicacaoIA(jogoSelecionado)} disabled={jogoSelecionado.is_loading_explanation} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                           {jogoSelecionado.is_loading_explanation ? <span className="animate-pulse">A calcular motivos...</span> : <><Zap className="w-4 h-4"/> Gerar Explicação Gemini</>}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
      )}

      {/* SKELETON LOADING PARA O JOGO */}
      {jogoSelecionado?.is_loading && (
          <div className="px-4 py-10 flex flex-col items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-blue-500 font-bold text-xs animate-pulse uppercase tracking-widest">A extrair dados...</p></div>
      )}

      {/* CHECKOUT VIP PRO */}
      {menuAtivo === "assinar pro" && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="px-4 pt-4">
             <div className="flex justify-between items-center mb-6"><button onClick={() => setMenuAtivo('Todos os Jogos')} className="text-slate-400 text-sm font-bold flex items-center gap-1"><X className="w-5 h-5"/> Fechar</button></div>
             <div className="backdrop-blur-xl bg-slate-900/85 rounded-3xl p-6 border border-white/10 shadow-2xl">
                <Crown className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Seja PRO 👑</h2>
                <div className="flex flex-col gap-3">
                    <input placeholder="Nome" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <input placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <button className="mt-4 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg text-sm uppercase tracking-wider">⚡ PAGAR 29,90€ COM PIX</button>
                </div>
             </div>
         </motion.div>
      )}

      {/* =========================================
          🔥 ASSISTENTE IA FLUTUANTE
      ========================================= */}
      <button onClick={() => setAiOpen(true)} className="fixed right-5 bottom-28 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] z-40 text-2xl hover:scale-105 transition-transform border border-blue-300/30">🤖</button>

      <AnimatePresence>
          {aiOpen && (
              <motion.div initial={{opacity:0, y:20, scale:0.9}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.9, y:20}} className="fixed right-4 left-4 bottom-24 backdrop-blur-2xl bg-slate-900/95 border border-slate-700 p-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col max-h-[70vh]">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5"><h3 className="font-black flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400"/> Assistente IA</h3><button onClick={() => setAiOpen(false)} className="text-slate-400 bg-slate-800 rounded-full p-1.5"><X className="w-4 h-4"/></button></div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1 custom-scrollbar">
                      {aiMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-[#050816] border border-slate-800 text-slate-300 rounded-tl-sm relative'}`}>{msg.role === 'assistant' && <div className="absolute top-4 left-0 w-1 h-[60%] bg-blue-500 rounded-r-md"></div>}{msg.text}</div></div>
                      ))}
                      {aiLoading && <div className="flex justify-start"><div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 text-slate-300 rounded-tl-sm text-xs font-bold"><span className="animate-pulse flex items-center gap-2"><Zap className="w-3 h-3 text-blue-500"/> A processar...</span></div></div>}
                  </div>
                  <form onSubmit={handleAskAI} className="flex gap-2">
                      <input type="text" placeholder="Qual a melhor aposta?" value={aiQuery} onChange={(e)=>setAiQuery(e.target.value)} disabled={aiLoading} className="flex-1 bg-[#050816] border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 font-bold disabled:opacity-50"/>
                      <button type="submit" disabled={aiLoading || !aiQuery.trim()} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center"><Send className="w-5 h-5"/></button>
                  </form>
              </motion.div>
          )}
      </AnimatePresence>

      {/* NOVA BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816]/95 border-t border-white/5 flex justify-around items-center backdrop-blur-xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Início</span></button>
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}><div className="relative"><Radio className="w-6 h-6" />{filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div><span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span></button>
        <button onClick={() => {setViewMode('ranking'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'ranking' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}><Trophy className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Ranking</span></button>
        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${['perfil','ia_center','favoritos','radar','admin','alertas'].includes(viewMode) ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Perfil</span></button>
      </nav>

    </div>
  );
}