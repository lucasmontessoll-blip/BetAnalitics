import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css'; 
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { Home, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, Crosshair, Bell, AlertTriangle, Users, Flame, ArrowLeft, Send, DollarSign, Smartphone } from 'lucide-react';

import { solicitarPermissaoNotificacao, dispararAlertaPush } from './services/notificacoes.js';

// ============================================================================
// 🚀 CODE SPLITTING (Lazy Loading para esvaziar o Bundle Principal)
// ============================================================================
const Perfil = lazy(() => import('./components/Perfil.jsx'));

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
  { id: 102, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T19:30:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Liverpool', home_id: 40, away_team: 'Man City', away_id: 50, home_image: 'https://media.api-sports.io/football/teams/40.png', away_image: 'https://media.api-sports.io/football/teams/50.png', scoreHome: null, scoreAway: null, confianca_ia: 89, odd_principal: 2.10, odd_abertura: 2.10, homeStats: {form: 78, h2h: 60, attack: 85}, awayStats: {form: 82} },
  { id: 103, league_id: 140, league_name: 'La Liga', starting_at: `${getLocalYYYYMMDD()}T14:00:00`, status: 'Finished', time_elapsed: 90, home_team: 'Real Madrid', home_id: 541, away_team: 'Barcelona', away_id: 529, home_image: 'https://media.api-sports.io/football/teams/541.png', away_image: 'https://media.api-sports.io/football/teams/529.png', scoreHome: 3, scoreAway: 1, confianca_ia: 88, odd_principal: 1.95, odd_abertura: 2.05, homeStats: {form: 90, h2h: 70, attack: 92}, awayStats: {form: 85} }
];

const mockJogoDetalhes = { stats_reais: [{type: "Posse (%)", h: 58, a: 42}, {type: "Remates", h: 12, a: 5}, {type: "Cantos", h: 8, a: 4}] };
const mockRankingUsuarios = [ { id: 1, nome: "Lucas", lucro_total: 1840 }, { id: 2, nome: "Carlos", lucro_total: 1430 }, { id: 3, nome: "João", lucro_total: 1180 }, { id: 4, nome: "Marcos", lucro_total: 950 } ];

// ============================================================================
// 🧠 FUNÇÕES GLOBAIS EMBUTIDAS
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

const buscarEstatisticasJogo = async (fixtureId) => {
    return [ { shotsOnGoal: 6, ballPossession: 65, corners: 8 }, { shotsOnGoal: 2, ballPossession: 35, corners: 2 } ];
};

const analisarPartidaAoVivo = (stats) => {
    if(!stats || stats.length < 2) return { confianca: 0, recomendacao: "Aguardando dados" };
    const casa = stats[0]; const fora = stats[1]; let score = 40;
    if (casa.shotsOnGoal > fora.shotsOnGoal) score += 20;
    if (casa.ballPossession > fora.ballPossession) score += 15;
    if (casa.corners > fora.corners) score += 10;
    return {
        confianca: Math.min(score, 99),
        recomendacao: score > 75 ? "Forte Tendência Casa" : score > 60 ? "Over Gols Sugerido" : "Mercado Indefinido"
    };
};

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
  const [topPick] = useState({ jogo: "Flamengo x Palmeiras", confianca: 92, ev: 14.2, mercado: "Vitória Flamengo" });
  const [rankingUsuarios, setRankingUsuarios] = useState([]);

  const [oportunidades, setOportunidades] = useState([]);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  const [xp, setXp] = useState(350);

  const [apostas, setApostas] = useState([
    { id: 1, jogo: "Flamengo x Palmeiras", liga: "Brasileirão", time: "Flamengo", mercado: "Vitória Casa", stake: 100, odd: 1.85, resultado: "green", data: "2026-06-01", hora: "19:30" },
    { id: 2, jogo: "Liverpool x Arsenal", liga: "Premier League", time: "Liverpool", mercado: "Over 2.5", stake: 50, odd: 2.10, resultado: "red", data: "2026-06-02", hora: "16:00" },
    { id: 3, jogo: "Real Madrid x Barcelona", liga: "La Liga", time: "Real Madrid", mercado: "Ambos Marcam", stake: 75, odd: 1.95, resultado: "green", data: "2026-06-03", hora: "20:00" }
  ]);
  const metaMensal = 2000;

  // IA CHAT & EFFECTS
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'assistant', text: "Olá! Sou o motor IA do BetAnalytics. Qual é a sua dúvida?" }]);

  useEffect(() => { const carregarDados = async () => { setRankingUsuarios(mockRankingUsuarios); }; carregarDados(); }, []);
  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) { setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: true }); }
      else if (MODO_DEMONSTRACAO) { setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true }); } 
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

  const nivelUsuario = () => {
    if(xp > 5000) return "Lenda"; if(xp > 3000) return "Mestre"; if(xp > 1000) return "Especialista"; if(xp > 500) return "Profissional"; return "Iniciante";
  };

  const abrirPainelDoJogo = async (j) => {
    if(!userData?.is_vip) return setMenuAtivo('assinar pro');
    setJogoSelecionado({ ...j, is_loading: true });
    const stats = await buscarEstatisticasJogo(j.id);
    const analiseTempoReal = analisarPartidaAoVivo(stats);
    setTimeout(() => { setJogoSelecionado({ ...j, ...mockJogoDetalhes, dadosAPI: analiseTempoReal, is_loading: false }); }, 800); 
  };
  
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
            <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-[#050816] border border-white/5 p-4 rounded-2xl mb-3 last:mb-0 flex justify-between items-center cursor-pointer hover:border-green-500/50 transition-colors">
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
              
              {/* =========================================
                  HOME / JOGOS
              ========================================= */}
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
                                    <div key={jogo.id} onClick={() => abrirPainelDoJogo(jogo)} className="bg-[#111827] border border-white/5 p-4 rounded-xl mb-3 cursor-pointer hover:border-green-500/50 transition-colors flex justify-between items-center">
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

                    {oportunidades.length > 0 && (
                        <div className="bg-[#0f172a] border border-orange-500/30 rounded-3xl p-4 sm:p-6 mb-6 mx-4 shadow-lg transform-gpu">
                            <h2 className="font-black text-orange-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Flame className="w-5 h-5"/> Radar de Oportunidades</h2>
                            {oportunidades.map(j => (
                                <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-[#111827] border border-white/5 p-4 rounded-xl mb-3 last:mb-0 cursor-pointer hover:border-orange-500/50 transition-colors flex justify-between items-center">
                                    <div className="font-bold text-white text-sm truncate pr-2 min-w-0">{j.home_team}</div>
                                    <div className="text-orange-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-orange-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-orange-500/20 flex-shrink-0">EV+ {calcularEV(j.confianca_ia, j.odd_principal).toFixed(1)}%</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <BankerPicksCard />

                    {/* CORREÇÃO DO RECHARTS */}
                    <div className="bg-[#0f172a] border border-purple-500/20 rounded-3xl p-4 sm:p-6 mb-6 mx-4 shadow-lg w-[calc(100%-2rem)] transform-gpu">
                        <h2 className="text-sm font-black text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><TrendingUp className="w-4 h-4"/> Evolução do Algoritmo IA</h2>
                        <div className="w-full h-[150px]">
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
                                        <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-lg mb-4 cursor-pointer relative transition-all hover:border-blue-500/50 w-full transform-gpu">
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

              {/* =========================================
                  O NOVO DASHBOARD DO PERFIL COMPLETO (LAZY)
              ========================================= */}
              {viewMode === 'perfil' && (
                  <div className="px-4 animate-fade-in w-full">
                     <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse uppercase tracking-widest text-xs">A abrir o seu Perfil Premium...</div>}>
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

              {/* =========================================
                  RANKING & CENTRAL IA & ADMIN
              ========================================= */}
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

              {viewMode === 'ia_center' && (
                  <div className="px-4 animate-fade-in w-full">
                      <HeaderNav title="🤖 Central IA" onBack={() => setViewMode('perfil')} />
                      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 sm:p-6 mb-6 shadow-lg mx-0 sm:mx-4 transform-gpu">
                          <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider truncate">Precisão Histórica</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-[#111827] rounded-2xl p-4 text-center border border-white/5"><span className="text-[10px] font-bold text-slate-400 uppercase truncate block">Acertos IA</span><strong className="text-2xl font-black text-green-400 block truncate">{performanceStats.acertos}</strong></div>
                              <div className="bg-[#111827] rounded-2xl p-4 text-center border border-white/5"><span className="text-[10px] font-bold text-slate-400 uppercase truncate block">Erros IA</span><strong className="text-2xl font-black text-red-400 block truncate">{performanceStats.erros}</strong></div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* =========================================
          PAINEL DO JOGO ABERTO
      ========================================= */}
      {jogoSelecionado && !jogoSelecionado.is_loading && menuAtivo !== 'assinar pro' && (
        <div className="px-4 mt-4 pb-20 animate-fade-in w-full">
            <button onClick={() => setJogoSelecionado(null)} className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-6 bg-[#0f172a] border border-white/10 px-4 py-2 rounded-xl uppercase tracking-wider"><X className="w-4 h-4"/> Voltar</button>
            <div className="bg-[#0f172a] rounded-3xl p-4 sm:p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6 transform-gpu">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col items-center w-1/3 min-w-0"><img src={jogoSelecionado.home_image} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-[10px] sm:text-xs text-center truncate w-full">{jogoSelecionado.home_team}</span></div>
                    <div className="w-1/3 text-center"><div className="text-3xl sm:text-4xl font-black mb-1 tracking-tighter truncate">{jogoSelecionado.status === 'Not Started' ? 'VS' : `${jogoSelecionado.scoreHome} - ${jogoSelecionado.scoreAway}`}</div></div>
                    <div className="flex flex-col items-center w-1/3 min-w-0"><img src={jogoSelecionado.away_image} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-[10px] sm:text-xs text-center truncate w-full">{jogoSelecionado.away_team}</span></div>
                </div>

                {jogoSelecionado.status === 'Live' && jogoSelecionado.stats_reais && (
                    <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 mb-5 shadow-inner">
                        <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Radio className="w-3 h-3 text-red-500 animate-pulse"/> Ao Vivo Premium</h4>
                        {jogoSelecionado.stats_reais.map((stat, i) => (
                            <div key={i} className="flex justify-between items-center mb-3 text-xs font-bold text-white">
                                <span className="w-8 text-center bg-[#050816] py-1 rounded">{stat.h}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.type}</span>
                                <span className="w-8 text-center bg-[#050816] py-1 rounded">{stat.a}</span>
                            </div>
                        ))}
                    </div>
                )}

                {jogoSelecionado.dadosAPI && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-center mb-5">
                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block mb-1 truncate">🤖 Análise API Football Ao Vivo</span>
                        <strong className="text-xs sm:text-sm font-black text-white truncate block">{jogoSelecionado.dadosAPI.recomendacao} (Conf: {jogoSelecionado.dadosAPI.confianca}%)</strong>
                    </div>
                )}

                {jogoSelecionado.odd_principal && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center min-w-0">
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest block mb-1 truncate">Stake Recomendada</span>
                            <strong className="text-lg sm:text-xl font-black text-white truncate block">R$ {Number(calcularStake(bancaInicial, jogoSelecionado.confianca_ia)||0).toFixed(2)}</strong>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-center min-w-0">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-1 truncate">🧠 Kelly Criterion</span>
                            <strong className="text-lg sm:text-xl font-black text-white truncate block">{Number(calcularKelly(jogoSelecionado.odd_principal, jogoSelecionado.confianca_ia)||0).toFixed(1)}%</strong>
                        </div>
                    </div>
                )}
                
                <div className="bg-[#050816] rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden flex flex-col items-start mb-4">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-xl rounded-full"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10"><Crosshair className="w-5 h-5 text-blue-500 flex-shrink-0" /><h4 className="font-black text-xs text-blue-400 uppercase tracking-widest truncate">ANÁLISE ESTATÍSTICA IA</h4></div>
                    {jogoSelecionado.explanation ? (
                        <div className="text-slate-300 text-xs leading-relaxed relative z-10 font-semibold whitespace-pre-line">{jogoSelecionado.explanation}</div>
                    ) : (
                        <button onClick={() => gerarExplicacaoIA(jogoSelecionado)} disabled={jogoSelecionado.is_loading_explanation} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 relative z-10">
                           {jogoSelecionado.is_loading_explanation ? <span className="animate-pulse truncate">A calcular motivos...</span> : <><Zap className="w-4 h-4 flex-shrink-0"/> <span className="truncate">Gerar Relatório Profissional</span></>}
                        </button>
                    )}
                </div>
            </div>
        </div>
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

      {/* AI CHAT E NAVEGAÇÃO NO RODAPÉ OMITIDOS AQUI PARA BREVIDADE (MANTÉM O SEU IGUAL) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816] border-t border-white/5 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Início</span></button>
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}><div className="relative"><Radio className="w-6 h-6" />{filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div><span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span></button>
        <button onClick={() => {setViewMode('ranking'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'ranking' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}><Trophy className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Ranking</span></button>
        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${['perfil','ia_center','admin'].includes(viewMode) ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Perfil</span></button>
      </nav>
    </div>
  );
}