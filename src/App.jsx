import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css'; 
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { Home, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, Crosshair, Bell, AlertTriangle, Users, Flame, ArrowLeft, Send, DollarSign, Smartphone, Target, ShieldAlert } from 'lucide-react';

import { solicitarPermissaoNotificacao, dispararAlertaPush } from './services/notificacoes.js';

// ============================================================================
// 🚀 CODE SPLITTING (Lazy Loading)
// ============================================================================
const Perfil = lazy(() => import('./components/Perfil.jsx'));
const PainelJogo = lazy(() => import('./components/PainelJogo.jsx'));

// ============================================================================
// ⚙️ CONFIGURAÇÕES PRINCIPAIS & DADOS GLOBAIS
// ============================================================================
const MODO_DEMONSTRACAO = true; 
const API_URL = 'https://betanalitics-1-9stc.onrender.com';

const supabase = createClient('https://sua-url.supabase.co', 'sua-chave-anon');
initMercadoPago('APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc', { locale: 'pt-BR' });

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
const listaLigas = [{name:'Todos', id: null}, {name:'Serie A', id: 71}, {name:'Champions', id: 2}, {name:'Premier', id: 39}];

const crescimentoBancaGlobal = [ { dia: "1", banca: 1000 }, { dia: "2", banca: 1080 }, { dia: "3", banca: 1150 }, { dia: "4", banca: 1210 }, { dia: "5", banca: 1280 }, { dia: "6", banca: 1350 }, { dia: "7", banca: 1420 } ];

const mockJogosData = [
  { id: 101, league_id: 71, league_name: 'Brasileirão Série A', starting_at: `${getLocalYYYYMMDD()}T16:00:00`, status: 'Live', time_elapsed: 62, home_team: 'Flamengo', home_id: 127, away_team: 'Palmeiras', away_id: 121, home_image: 'https://media.api-sports.io/football/teams/127.png', away_image: 'https://media.api-sports.io/football/teams/121.png', scoreHome: 2, scoreAway: 1, confianca_ia: 92, odd_principal: 1.82, odd_abertura: 1.95, homeStats: {form: 85, h2h: 80, attack: 88}, awayStats: {form: 75} },
  { id: 102, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T19:30:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Liverpool', home_id: 40, away_team: 'Man City', away_id: 50, home_image: 'https://media.api-sports.io/football/teams/40.png', away_image: 'https://media.api-sports.io/football/teams/50.png', scoreHome: null, scoreAway: null, confianca_ia: 89, odd_principal: 2.10, odd_abertura: 2.10, homeStats: {form: 78, h2h: 60, attack: 85}, awayStats: {form: 82} }
];

const mockRankingUsuarios = [ { id: 1, nome: "Lucas", lucro_total: 1840 }, { id: 2, nome: "Carlos", lucro_total: 1430 }, { id: 3, nome: "João", lucro_total: 1180 } ];

// ============================================================================
// 🧠 FUNÇÕES GLOBAIS DA IA & MATEMÁTICA
// ============================================================================
const calcularEV = (probabilidade, odd) => (((probabilidade / 100) * odd - 1) * 100);

const calcularHeatScore = (jogo) => Math.round((jogo.confianca_ia * 0.5) + (calcularEV(jogo.confianca_ia, jogo.odd_principal) * 2) + (((jogo.homeStats?.form||50) - (jogo.awayStats?.form||50)) * 0.3));

const detectarValueBet = (probabilidadeIA, odd) => probabilidadeIA > (100 / odd);

const calcularRisco = (jogo) => {
    if(jogo.confianca_ia >= 90 && jogo.odd_principal <= 2.0) return { nivel: 'BAIXO', cor: 'text-green-400 bg-green-500/10 border-green-500/30' };
    if(jogo.confianca_ia >= 80) return { nivel: 'MÉDIO', cor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { nivel: 'ALTO', cor: 'text-red-400 bg-red-500/10 border-red-500/30' };
};

const calcularStake = (banca, confianca) => {
    if(confianca >= 90) return banca * 0.05;
    if(confianca >= 85) return banca * 0.03;
    if(confianca >= 80) return banca * 0.02;
    return banca * 0.01;
};

const calcularKelly = (odd, probabilidade) => {
    const p = probabilidade / 100;
    const b = odd - 1;
    return Math.max((((b * p) - (1 - p)) / b) * 100, 0);
};

// AS FUNÇÕES QUE FALTAVAM ESTÃO AQUI:
const calcularDrawdown = (listaApostas, bancaIni) => {
    let pico = bancaIni; let maxDD = 0; let b = bancaIni;
    listaApostas.forEach(a => {
        if(a.resultado === "green") b += (a.stake * a.odd) - a.stake; else b -= a.stake;
        if(b > pico) pico = b;
        const dd = ((pico - b) / pico) * 100;
        if(dd > maxDD) maxDD = dd;
    });
    return maxDD.toFixed(2);
};

const executarBacktest = (listaApostas, bancaIni) => {
    let b = bancaIni;
    listaApostas.forEach(a => {
        if(a.resultado === "green") b += (a.stake * a.odd) - a.stake; else b -= a.stake;
    });
    return { bancaFinal: b, lucro: b - bancaIni, roi: ((b - bancaIni) / bancaIni) * 100 };
};

// ============================================================================
// 📱 COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [jogos, setJogos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [favoritos, setFavoritos] = useState([101, 102]); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  
  const [performanceStats] = useState({ totalAnalises: 512, acertos: 431, erros: 81, roi: 18.4, ultimaSemana: 87 });
  const [bancaInicial, setBancaInicial] = useState(1000);
  const [alertas, setAlertas] = useState([{ id: 1, msg: "O Flamengo chegou a 94% de confiança.", lida: false }]);
  const [rankingUsuarios, setRankingUsuarios] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  
  const [xp, setXp] = useState(350);
  
  // A FUNÇÃO DO NÍVEL DO UTILIZADOR
  const nivelUsuario = () => {
    if (xp > 5000) return "Lenda";
    if (xp > 3000) return "Mestre";
    if (xp > 1000) return "Especialista";
    if (xp > 500) return "Profissional";
    return "Iniciante";
  };

  const [apostas, setApostas] = useState([
    { id: 1, jogo: "Flamengo x Palmeiras", liga: "Brasileirão", time: "Flamengo", mercado: "Vitória Casa", stake: 100, odd: 1.85, resultado: "green", data: "2026-06-01", hora: "19:30" }
  ]);
  const metaMensal = 2000;

  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'assistant', text: "Olá! Sou o motor IA do BetAnalytics. Qual é a sua dúvida?" }]);

  useEffect(() => { const carregarDados = async () => { setRankingUsuarios(mockRankingUsuarios); }; carregarDados(); }, []);
  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  
  // ========================================================================
  // 🔒 PROTEÇÃO MÁXIMA DE EMAIL DO ADMIN
  // ========================================================================
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      const emailsAdministradores = ["lucasmontesso@admin.com"]; // O seu email
      
      if (em) { 
          setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: emailsAdministradores.includes(em) }); 
      }
      else if (MODO_DEMONSTRACAO) { 
          setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true }); 
      } 
  }, []);
  
  useEffect(() => {
      setLoading(true);
      setTimeout(() => { 
          const loadedJogos = mockJogosData.filter(x => ligaAtivaId === null ? true : x.league_id === ligaAtivaId);
          setJogos(loadedJogos); setLoading(false); 
      }, 500); 
  }, [ligaAtivaId]);

  useEffect(() => {
      if(jogos.length){
          const selecoes = [...jogos].filter(j => j.confianca_ia >= 85).sort((a,b) => b.confianca_ia - a.confianca_ia).slice(0,3);
          const oddFinal = selecoes.reduce((acc, j) => acc * (j.odd_principal || 1), 1);
          setBilhetePremium({ selecoes, oddFinal });

          const radar = jogos.filter(j => j.odd_principal && calcularEV(j.confianca_ia, j.odd_principal) > 10);
          setOportunidades(radar);
      }
  }, [jogos]);

  const toggleFavorito = (e, id) => { e.stopPropagation(); setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]); };

  const handleAskAI = async (e) => {
      e?.preventDefault();
      if(!aiQuery.trim() || aiLoading) return;
      setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
      const perguntaAtual = aiQuery; setAiQuery(''); setAiLoading(true);
      try {
          const resumoJogos = jogos.map(j => `${j.home_team} vs ${j.away_team}`).join(", ");
          const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: perguntaAtual, dadosDaRodada: resumoJogos || "Sem jogos no momento" });
          setAiMessages(prev => [...prev, { role: 'assistant', text: resposta.data.resposta }]);
      } catch (error) { setAiMessages(prev => [...prev, { role: 'assistant', text: "Falha de comunicação." }]); } finally { setAiLoading(false); }
  };

  const gerarExplicacaoIA = async (jogo) => {
      setJogoSelecionado(prev => ({...prev, is_loading_explanation: true}));
      const promptGemini = `Você é um analista profissional.\nJogo: ${jogo.home_team} x ${jogo.away_team}\nConfiança: ${jogo.confianca_ia}%\nOdd: ${jogo.odd_principal}\nExplique:\n1 Motivos da entrada\n2 Riscos\n3 Melhor mercado\n4 Gestão recomendada\n5 Conclusão final\nResposta curta e estruturada em tópicos.`;
      try {
          const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: promptGemini, dadosDaRodada: jogo });
          setJogoSelecionado(prev => ({...prev, explanation: resposta.data.resposta, is_loading_explanation: false}));
      } catch (e) { setJogoSelecionado(prev => ({...prev, explanation: "Análise forte indica superioridade e EV+ no mercado.", is_loading_explanation: false})); }
  };

  let jFilt = (jogos||[]).filter(j => { if(filterCentro === 'Ao Vivo') return j.status==='Live'; if(filterCentro === 'Favoritos') return favoritos.includes(j.id); return true; });
  const jGrp = jFilt.reduce((a, j) => { if (!a[j.league_name]) a[j.league_name] = []; a[j.league_name].push(j); return a; }, {});

  const BankerPicksCard = () => {
    const picks = jogos.filter(j => j.confianca_ia >= 90 && calcularEV(j.confianca_ia, j.odd_principal) >= 10);
    if(picks.length === 0) return null;
    return (
      <div className="bg-[#0f172a] border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-3xl p-4 sm:p-6 mb-6 mx-4 transform-gpu">
        <h3 className="font-black text-green-400 mb-4 flex items-center gap-2 tracking-wider"><Crown className="w-5 h-5"/> IA BANKER PICKS</h3>
        {picks.map(j => (
            <div key={j.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#050816] border border-white/5 p-4 rounded-2xl mb-3 last:mb-0 flex justify-between items-center cursor-pointer hover:border-green-500/50 transition-colors">
                <div className="min-w-0 pr-2">
                    <div className="font-black text-white text-sm mb-1 truncate">{j.home_team} x {j.away_team}</div>
                    <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex gap-2"><span>Confiança: {j.confianca_ia}%</span> <span>•</span> <span>EV: +{calcularEV(j.confianca_ia, j.odd_principal).toFixed(1)}%</span></div>
                </div>
                <div className="bg-green-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg flex-shrink-0"><ChevronRight className="w-5 h-5"/></div>
            </div>
        ))}
      </div>
    );
  };

  const HeaderNav = ({ title, onBack }) => (
      <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><button onClick={onBack} className="p-2 bg-[#050816] rounded-full hover:bg-slate-800 transition border border-white/10"><ArrowLeft className="w-5 h-5"/></button><h2 className="text-xl font-black">{title}</h2></div></div>
  );

  if (showSplash) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white">
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-6xl mb-4">⚽</motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-2xl font-black tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans pb-28 w-full max-w-full overflow-x-hidden">
      <header className="flex items-center justify-between px-5 py-4 bg-[#050816] sticky top-0 z-40 border-b border-white/5">
        <h1 className="font-black text-xl sm:text-2xl tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></h1>
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] flex-shrink-0 text-xs sm:text-sm"><Crown className="w-4 h-4" /> {userData?.is_vip ? "VIP ATIVO" : "ASSINAR PRO"}</button>
      </header>

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4 w-full">
              
              {/* JOGOS E RADAR */}
              {viewMode === 'jogos' && (
                  <>
                    {userData?.is_vip && (
                        <div className="mx-4 mb-6 rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_30px_rgba(13,110,253,0.3)] flex justify-between items-center transform-gpu">
                        <div><h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mb-1 sm:mb-2"><Crown className="w-5 h-5 text-yellow-400"/> IA Premium</h2><p className="text-blue-100 text-[10px] sm:text-xs mt-1"><strong>{(performanceStats.acertos/performanceStats.totalAnalises*100).toFixed(1)}%</strong> de precisão geral</p></div>
                        <button onClick={() => setViewMode('ranking')} className="bg-white/20 border border-white/30 text-white text-[9px] sm:text-[10px] font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-xl uppercase tracking-wider">VER RANKING</button>
                        </div>
                    )}

                    {bilhetePremium.selecoes.length > 0 && (
                        <div className="bg-[#0f172a] border border-green-500/30 rounded-3xl p-4 sm:p-6 mb-6 mx-4 shadow-lg transform-gpu">
                            <h2 className="font-black text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Target className="w-5 h-5"/> Bilhete Inteligente IA</h2>
                            <div>
                                {bilhetePremium.selecoes.map(jogo => (
                                    <div key={jogo.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(jogo); }} className="bg-[#111827] border border-white/5 p-4 rounded-xl mb-3 cursor-pointer hover:border-green-500/50 transition-colors flex justify-between items-center">
                                        <div className="font-bold text-white text-sm truncate pr-2 min-w-0">{jogo.home_team} x {jogo.away_team}</div>
                                        <div className="text-green-400 text-[9px] sm:text-[10px] font-black tracking-widest uppercase flex-shrink-0">Confiança: {jogo.confianca_ia}%</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-green-500/20 flex justify-between items-center">
                                <span className="text-[10px] sm:text-xs text-green-200 font-black uppercase tracking-widest truncate pr-2">Odd Combinada Final</span>
                                <span className="text-2xl sm:text-3xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] flex-shrink-0">@{Number(bilhetePremium.oddFinal || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <BankerPicksCard />

                    <div className="bg-[#0f172a] border border-purple-500/20 rounded-3xl p-4 sm:p-6 mb-6 mx-4 shadow-lg w-[calc(100%-2rem)] transform-gpu">
                        <h2 className="text-sm font-black text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><TrendingUp className="w-4 h-4"/> Evolução do Algoritmo IA</h2>
                        <div className="w-full h-[150px] overflow-hidden">
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={crescimentoBancaGlobal}>
                                    <XAxis dataKey="dia" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                                    <Line type="monotone" dataKey="banca" stroke="#a855f7" strokeWidth={4} dot={{r:4, fill:"#a855f7", stroke:"#fff", strokeWidth:2}} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4 w-full">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>

                    <div className="px-4 w-full">
                        {loading ? <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div> : 
                        Object.entries(jGrp).map(([leagueName, matches]) => (
                            <div key={leagueName} className="mb-6 w-full">
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div>
                                {matches.map(j => {
                                    const isLive = j.status === 'Live';
                                    const heatScore = calcularHeatScore(j);
                                    const risco = calcularRisco(j);
                                    const isValueBet = j.odd_principal ? detectarValueBet(j.confianca_ia, j.odd_principal) : false;
                                    
                                    return (
                                        <div key={j.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-lg mb-4 cursor-pointer relative transition-all hover:border-blue-500/50 w-full transform-gpu">
                                            {heatScore > 50 && <div className="absolute -right-8 top-5 bg-red-600 text-white text-[8px] font-black px-8 py-1 rotate-45 shadow-lg flex items-center justify-center uppercase tracking-widest border-y border-red-400/30">Heat {heatScore}</div>}
                                            <div className="flex justify-between items-center mb-5">
                                                {isLive ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> : <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase">{j.status === 'Finished' ? 'Finalizado' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>}
                                                <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1 relative mr-6"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                                            </div>
                                            <div className="flex gap-2 mb-3">
                                                {isValueBet && <div className="bg-green-500/20 border border-green-500/40 text-green-400 font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap flex-shrink-0">💰 VALUE BET</div>}
                                                <div className={`border ${risco.cor} font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 whitespace-nowrap flex-shrink-0`}><AlertTriangle className="w-3 h-3"/> Risco: {risco.nivel}</div>
                                            </div>
                                            <div className="grid grid-cols-3 items-center text-center mb-5 mt-2 w-full">
                                                <div className="flex flex-col items-center gap-2 min-w-0"><img src={j.home_image} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" alt=""/><span className="text-[10px] sm:text-xs font-bold text-slate-200 truncate w-full">{j.home_team}</span></div>
                                                <div className="text-2xl sm:text-4xl font-black tracking-tighter">{isLive || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600 text-xl sm:text-2xl">-</span>}</div>
                                                <div className="flex flex-col items-center gap-2 min-w-0"><img src={j.away_image} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" alt=""/><span className="text-[10px] sm:text-xs font-bold text-slate-200 truncate w-full">{j.away_team}</span></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                  </>
              )}

              {/* PERFIL (LAZY) */}
              {viewMode === 'perfil' && (
                  <div className="px-4 animate-fade-in w-full">
                     <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse uppercase tracking-widest text-xs">A carregar Perfil Premium...</div>}>
                        <Perfil 
                            userData={userData} form={form} setForm={setForm} nivelUsuario={nivelUsuario()} 
                            xp={xp} solicitarPermissaoNotificacao={solicitarPermissaoNotificacao} 
                            setViewMode={setViewMode} apostas={apostas} bancaInicial={bancaInicial} 
                            metaMensal={metaMensal} setMenuAtivo={setMenuAtivo}
                            calcularDrawdown={calcularDrawdown} executarBacktest={executarBacktest}
                        />
                     </Suspense>
                  </div>
              )}

              {/* RANKING & ADMIN */}
              {viewMode === 'ranking' && (
                  <div className="px-4 animate-fade-in w-full">
                      <HeaderNav title="🏆 Comunidade" onBack={() => setViewMode('perfil')} />
                      <div className="bg-[#0f172a] border border-yellow-500/30 rounded-3xl p-4 sm:p-6 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] transform-gpu">
                          <h3 className="text-sm font-black text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Users className="w-5 h-5"/> Ranking Global</h3>
                          <div className="flex flex-col gap-3">
                              {rankingUsuarios.map((user, index) => (
                                  <div key={index} className="bg-[#111827] border border-white/5 p-4 rounded-2xl flex justify-between items-center transition-colors">
                                      <div className="flex items-center gap-3 min-w-0"><span className="text-xs font-black text-slate-400 flex-shrink-0">#{index+1}</span><span className="font-bold text-white text-sm truncate">{user.nome}</span></div>
                                      <strong className="text-green-400 font-black flex-shrink-0">R$ {Number(user.lucro_total||0).toFixed(2)}</strong>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {viewMode === 'admin' && (
                  <div className="px-4 animate-fade-in pb-20 w-full">
                      <HeaderNav title="⚙️ Painel de Controle Admin" onBack={() => setViewMode('perfil')} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-white/5 shadow-lg transform-gpu min-w-0">
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold truncate">Total Usuários</div>
                              <div className="text-2xl sm:text-3xl font-black text-white truncate">1,248</div>
                          </div>
                          <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-yellow-500/20 shadow-lg transform-gpu min-w-0">
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold truncate">Assinantes PRO</div>
                              <div className="text-2xl sm:text-3xl font-black text-yellow-400 truncate">312</div>
                          </div>
                          <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-green-500/20 shadow-lg col-span-1 sm:col-span-2 flex justify-between items-center transform-gpu min-w-0">
                              <div className="pr-2 min-w-0">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold truncate">Receita Mensal Estimada</div>
                                <div className="text-2xl sm:text-3xl font-black text-green-400 truncate">R$ 9.328,80</div>
                              </div>
                              <DollarSign className="w-8 h-8 text-green-500 opacity-50 flex-shrink-0"/>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* PAINEL DE JOGO PREMIUM (LAZY) */}
      {jogoSelecionado && menuAtivo !== 'assinar pro' && (
          <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs uppercase tracking-widest">A carregar estatísticas do jogo...</div>}>
              <PainelJogo 
                  jogo={jogoSelecionado} 
                  setJogoSelecionado={setJogoSelecionado} 
                  bancaInicial={bancaInicial} 
                  gerarExplicacaoIA={gerarExplicacaoIA} 
                  calcularStake={calcularStake} 
                  calcularKelly={calcularKelly} 
              />
          </Suspense>
      )}

      {/* CHECKOUT VIP PRO */}
      {menuAtivo === "assinar pro" && (
         <div className="px-4 pt-4 animate-fade-in w-full">
             <div className="flex justify-between items-center mb-6"><button onClick={() => setMenuAtivo('Todos os Jogos')} className="text-slate-400 text-sm font-bold flex items-center gap-1"><X className="w-5 h-5"/> Fechar</button></div>
             <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-2xl transform-gpu">
                <Crown className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-black text-white mb-2 truncate">Seja PRO 👑</h2>
                <div className="flex flex-col gap-3">
                    <input placeholder="Nome Completo" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="w-full bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <input type="email" placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <input placeholder="CPF (Apenas números)" maxLength={11} value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value.replace(/\D/g, '')})} className="w-full bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <button className="mt-4 w-full bg-green-500 hover:bg-green-600 transition-colors text-white font-black py-4 rounded-2xl shadow-lg text-sm uppercase tracking-wider truncate">⚡ PAGAR R$ 29,90 COM PIX</button>
                </div>
             </div>
         </div>
      )}

      {/* CHATBOT */}
      <button onClick={() => setAiOpen(true)} className="fixed right-5 bottom-28 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] z-40 text-2xl hover:scale-105 transition-transform border border-blue-300/30">🤖</button>

      <AnimatePresence>
          {aiOpen && (
              <motion.div initial={{opacity:0, y:20, scale:0.9}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.9, y:20}} className="fixed right-4 left-4 bottom-24 bg-[#0f172a] border border-slate-700 p-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col max-h-[70vh]">
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

      {/* BARRA DE NAVEGAÇÃO */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816] border-t border-white/5 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Início</span></button>
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}><div className="relative"><Radio className="w-6 h-6" />{filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div><span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span></button>
        <button onClick={() => {setViewMode('ranking'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'ranking' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}><Trophy className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Ranking</span></button>
        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${['perfil','admin'].includes(viewMode) ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Perfil</span></button>
      </nav>
    </div>
  );
}