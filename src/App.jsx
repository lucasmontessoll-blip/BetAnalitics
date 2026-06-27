import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css'; 
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { Home, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, AlertTriangle, ArrowLeft, Send, DollarSign, Target, Bell, Globe, CreditCard, Lock, Calendar } from 'lucide-react';

import { detectarValueBetReal } from './algorithms/valueBet.js';
import { calcularEV, calcularHeatScore, calcularKelly } from './utils/math.js';
import { calcularRisco, calcularStake } from './utils/risk.js';
import { useFavoritos } from './hooks/useFavoritos.js';
import { useJogos } from './hooks/useJogos.js';
import { useIA } from './hooks/useIA.js';

const Perfil = lazy(() => import('./components/Perfil.jsx'));
const PainelJogo = lazy(() => import('./components/PainelJogo.jsx'));

const MODO_DEMONSTRACAO = true; 
const API_URL = '';

let supabase = { from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }) };
try {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  if (url && url.startsWith('http')) supabase = createClient(url, key);
} catch (e) { console.error("Erro Supabase:", e); }

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-5947285218976034', { locale: 'pt-BR' });

const PAISES = ['brasil', 'argentina', 'colômbia', 'uruguai', 'chile', 'peru', 'equador', 'venezuela', 'bolívia', 'paraguai', 'espanha', 'alemanha', 'frança', 'portugal', 'inglaterra', 'itália', 'holanda', 'bélgica', 'croácia', 'méxico', 'eua', 'estados unidos', 'canadá'];

const isSelecao = (h, a, l) => {
    const str = `${h||''} ${a||''} ${l||''}`.toLowerCase();
    if (str.includes('euro') || str.includes('copa américa') || str.includes('nations league') || str.includes('world cup')) return true;
    return PAISES.some(p => str.includes(p));
};

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };

const listaLigas = [{name:'Todos', id: null}, {name:'Brasileirão', id: 71}, {name:'Champions', id: 2}, {name:'Premier League', id: 39}];

// 📊 DADOS ESTÁTICOS DE CALIBRAÇÃO DOS GRÁFICOS
const crescimentoBancaGlobal = [ 
  { dia: "Seg", banca: 1000 }, 
  { dia: "Ter", banca: 1120 }, 
  { dia: "Qua", banca: 1210 }, 
  { dia: "Qui", banca: 1380 }, 
  { dia: "Sex", banca: 1470 }, 
  { dia: "Sáb", banca: 1650 }, 
  { dia: "Dom", banca: 1840 } 
];
const desempenhoDiario = [ { dia: "Seg", acertos: 14, erros: 3 }, { dia: "Ter", acertos: 18, erros: 2 }, { dia: "Qua", acertos: 12, erros: 5 }, { dia: "Qui", acertos: 20, erros: 4 }, { dia: "Sex", acertos: 25, erros: 6 }, { dia: "Sáb", acertos: 32, erros: 5 }, { dia: "Dom", acertos: 29, erros: 3 } ];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  
  const [performanceStats] = useState({ totalAnalises: 512, acertos: 431, erros: 81, roi: 18.4, ultimaSemana: 87 });
  const [bancaInicial] = useState(1000);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  const [xp] = useState(350);

  const [jogosTempoReal, setJogosTempoReal] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  
  const nivelUsuario = () => xp > 3000 ? "Mestre" : xp > 1000 ? "Especialista" : "Profissional";
  const [apostas] = useState([]);
  const metaMensal = 2000;

  const { favoritos, toggleFavorito } = useFavoritos();
  const { jogos: jogosDoHook, loading: loadingHook } = useJogos(API_URL, ligaAtivaId, []);

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
      else if (MODO_DEMONSTRACAO) setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true }); 
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
      if (Object.keys(jGrp).length === 0) return <div className="text-center text-slate-500 py-10 font-bold">Nenhuma oportunidade encontrada com estes filtros.</div>;
      return Object.entries(jGrp).map(([leagueName, matches]) => (
          <div key={leagueName} className="mb-6 w-full">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div>
              {matches.map(j => (
                  <div key={j.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer hover:border-blue-500/50 transform-gpu">
                      <div className="flex justify-between items-center mb-5">
                          {j.status === 'Live' ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> : <span className="text-slate-400 text-[10px] font-bold uppercase">{j.status === 'Finished' ? 'Finalizado' : 'Agendado'}</span>}
                          <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                      </div>
                      <div className="grid grid-cols-3 items-center text-center mb-4">
                          <div className="flex flex-col items-center gap-2"><img src={j.home_image} className="w-10 h-10 object-contain" alt=""/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.home_team}</span></div>
                          <div className="text-2xl font-black">{j.status === 'Live' || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600">-</span>}</div>
                          <div className="flex flex-col items-center gap-2"><img src={j.away_image} className="w-10 h-10 object-contain" alt=""/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.away_team}</span></div>
                      </div>
                  </div>
              ))}
          </div>
      ));
  };

  const HeaderNav = ({ title, onBack }) => (
      <div className="flex items-center gap-3 mb-6"><button onClick={onBack} className="p-2 bg-[#050816] rounded-full border border-white/10"><ArrowLeft className="w-5 h-5"/></button><h2 className="text-xl font-black">{title}</h2></div>
  );

  const fazerLogout = () => { localStorage.removeItem('bet_sessao_ativa'); window.location.reload(); };

  if (showSplash) return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white">
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl mb-4">⚽</motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></motion.div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans pb-28 w-full max-w-full overflow-x-hidden relative">
      <header className="flex items-center justify-between px-5 py-4 bg-[#050816] sticky top-0 z-40 border-b border-white/5">
        <h1 className="font-black text-xl sm:text-2xl tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></h1>
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-4 py-2 rounded-xl flex items-center gap-2 text-xs shadow-lg"><Crown className="w-4 h-4" /> {userData?.is_vip ? "VIP ATIVO" : "ASSINAR PRO"}</button>
      </header>

      {/* =======================================================
          💎 TELA VIP PRO (DESIGN ELITE)
      ========================================================= */}
      {menuAtivo === 'assinar pro' && (
        <div className="px-4 pt-24 animate-fade-in pb-28 min-h-screen bg-[#050816] text-white absolute inset-0 z-[999] overflow-y-auto">
          <div className="fixed top-0 left-0 w-full bg-[#050816]/95 backdrop-blur-xl z-[9999] px-5 py-4 border-b border-white/10 flex items-center gap-3 shadow-xl">
            <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setJogoSelecionado(null); }} className="p-2 bg-[#0f172a] border border-white/10 rounded-full hover:border-yellow-500/50 transition flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <span className="font-black text-white uppercase tracking-widest text-xs">Voltar ao App</span>
          </div>

          <div className="bg-[#0f172a] border border-yellow-500/20 rounded-3xl p-6 text-white shadow-[0_0_40px_rgba(234,179,8,0.08)] mt-4 relative overflow-hidden">
            {/* Efeito de brilho de fundo VIP */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

            <h2 className="text-2xl font-black mb-2 flex items-center gap-2 relative z-10"><Crown className="w-6 h-6 text-yellow-400" /> BetAnalytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">PRO</span></h2>
            <p className="text-sm font-bold mb-6 text-slate-400 relative z-10">Registe-se e desbloqueie o Radar IA, Value Bets e análises avançadas em tempo real.</p>
            
            <div className="bg-[#050816]/60 rounded-2xl p-5 mb-5 border border-white/5 relative z-10">
              <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-slate-300"><User className="w-4 h-4 text-yellow-500"/> Criar Conta / Login</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Nome Completo" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
                <input type="email" placeholder="Email (Login)" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-slate-500" />
                  <input type="password" placeholder="Senha" className="w-full bg-[#050816] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-yellow-500 transition-colors" />
                </div>
                <div className="flex gap-3">
                  <div className="w-1/2 relative"><User className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" /><input type="text" placeholder="CPF" className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-3 pl-9 text-white placeholder:text-slate-500 text-xs outline-none focus:border-yellow-500 transition-colors" /></div>
                  <div className="w-1/2 relative"><Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" /><input type="text" placeholder="Nascimento" className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-3 pl-9 text-white placeholder:text-slate-500 text-xs outline-none focus:border-yellow-500 transition-colors" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => !e.target.value && (e.target.type = 'text')} /></div>
                </div>
              </div>
            </div>

            <div className="bg-[#050816]/60 rounded-2xl p-5 mb-6 border border-white/5 relative z-10">
              <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-slate-300"><DollarSign className="w-4 h-4 text-yellow-500"/> Forma de Pagamento</h3>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setMetodoPagamento('pix')} className={`font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1.5 border transition-all ${metodoPagamento === 'pix' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-[#050816] text-slate-500 border-white/5 hover:border-white/20'}`}><Zap className="w-5 h-5"/> PIX</button>
                <button onClick={() => setMetodoPagamento('credito')} className={`font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1.5 border transition-all ${metodoPagamento === 'credito' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-[#050816] text-slate-500 border-white/5 hover:border-white/20'}`}><CreditCard className="w-5 h-5"/> Crédito</button>
                <button onClick={() => setMetodoPagamento('debito')} className={`font-bold py-3 rounded-xl text-xs flex flex-col items-center gap-1.5 border transition-all ${metodoPagamento === 'debito' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-[#050816] text-slate-500 border-white/5 hover:border-white/20'}`}><CreditCard className="w-5 h-5"/> Débito</button>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black py-4 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)] flex justify-center items-center gap-2 relative z-10">
              CONCLUIR ASSINATURA <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        </div>
      )}

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4 w-full">
              
              {/* =======================================================
                  🏆 TELA: COPA
              ========================================================= */}
              {viewMode === 'copa' && (
                  <div className="px-4 w-full">
                      <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden">
                          <Globe className="absolute -right-4 -top-4 w-32 h-32 text-yellow-500/20" />
                          <h2 className="text-2xl font-black text-white flex items-center gap-2 relative z-10"><Trophy className="w-6 h-6 text-yellow-300"/> Seleções</h2>
                          <p className="text-yellow-200 text-xs mt-1 relative z-10 font-bold">Monitoramento de Eurocopa, Copa América e Internacionais</p>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 w-full">
                          <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black border ${filterCentro==='Todos' ? 'bg-white text-black' : 'bg-transparent border-slate-700 text-slate-400'}`}>Todos</button>
                          <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-transparent border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                      </div>
                      <RenderizarListaJogos />
                      <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5 mt-4">
                          <h3 className="text-yellow-500 font-black text-xs uppercase flex items-center gap-2 mb-4"><Target className="w-4 h-4"/> Chuteira de Ouro</h3>
                          <div className="bg-[#050816] rounded-xl p-3 mb-2 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">1º</span> Mbappé</span><span className="text-xs font-black text-yellow-500">5 <span className="text-[9px] text-slate-400">Gols</span></span></div>
                          <div className="bg-[#050816] rounded-xl p-3 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">2º</span> Kane</span><span className="text-xs font-black text-yellow-500">4 <span className="text-[9px] text-slate-400">Gols</span></span></div>
                      </div>
                      <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5">
                          <h3 className="text-blue-400 font-black text-xs uppercase flex items-center gap-2 mb-4"><User className="w-4 h-4"/> Garçons da Copa</h3>
                          <div className="bg-[#050816] rounded-xl p-3 mb-2 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">1º</span> De Bruyne</span><span className="text-xs font-black text-blue-400">4 <span className="text-[9px] text-slate-400">Ast.</span></span></div>
                          <div className="bg-[#050816] rounded-xl p-3 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">2º</span> Vinícius Jr</span><span className="text-xs font-black text-blue-400">3 <span className="text-[9px] text-slate-400">Ast.</span></span></div>
                      </div>
                  </div>
              )}

              {/* =======================================================
                  ⚽ TELA: INÍCIO (Jogos)
              ========================================================= */}
              {viewMode === 'jogos' && (
                  <>
                    {userData?.is_vip && (
                        <div className="mx-4 mb-6 rounded-3xl p-5 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg flex justify-between items-center transform-gpu">
                            <div><h2 className="text-xl font-black text-white flex items-center gap-2 mb-1"><Crown className="w-5 h-5 text-yellow-400"/> IA Premium</h2><p className="text-blue-100 text-[10px] font-bold">{(performanceStats.acertos/performanceStats.totalAnalises*100).toFixed(1)}% de precisão nos clubes</p></div>
                            <button onClick={() => setViewMode('radar')} className="bg-white/20 border border-white/30 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider">CONFIGURAR ALERTAS</button>
                        </div>
                    )}
                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4 w-full">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black border ${filterCentro==='Todos' ? 'bg-white text-black' : 'bg-transparent border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-transparent border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black border ${ligaAtivaId === l.id ? 'bg-[#0f172a] text-white border-white/10' : 'bg-transparent border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>
                    <div className="px-4 w-full"><RenderizarListaJogos /></div>
                  </>
              )}

              {/* =======================================================
                  👤 TELA: PERFIL 
              ========================================================= */}
              {viewMode === 'perfil' && (
                  <div className="px-4 animate-fade-in w-full pb-6 pt-4">
                     
                     <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse uppercase tracking-widest text-xs">A carregar Perfil Premium...</div>}>
                        <Perfil userData={userData} form={form} setForm={setForm} nivelUsuario={nivelUsuario()} xp={xp} setViewMode={setViewMode} apostas={apostas} bancaInicial={bancaInicial} metaMensal={metaMensal} setMenuAtivo={setMenuAtivo} />
                     </Suspense>

                      <div className="mb-6 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-2xl relative mt-4">
                        <div className="mb-6">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Evolução da Banca</h3>
                          <h2 className="text-xl font-black text-white flex items-center gap-3">
                            Desempenho Líquido
                            <span className="text-emerald-400 text-[10px] font-black bg-[#050816] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> +47.0%
                            </span>
                          </h2>
                        </div>
                        <div className="w-full h-48 sm:h-56 relative z-10 -ml-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={crescimentoBancaGlobal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorBanca" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} />
                              <XAxis dataKey="dia" stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} />
                              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} domain={['dataMin - 50', 'dataMax + 50']} />
                              <Tooltip contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }} />
                              <Area type="monotone" dataKey="banca" stroke="#10b981" strokeWidth={3} fill="url(#colorBanca)" dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="mb-6 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-2xl relative">
                        <div className="mb-6">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precisão da IA</h3>
                          <h2 className="text-xl font-black text-white flex items-center gap-3">
                            Acertos vs Erros 
                            <span className="text-emerald-400 text-[10px] font-black bg-[#050816] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Target className="w-3 h-3" /> 84% Win Rate
                            </span>
                          </h2>
                        </div>
                        <div className="w-full h-48 sm:h-56 relative z-10 -ml-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={desempenhoDiario} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={6} barGap={4}>
                              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} />
                              <XAxis dataKey="dia" stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} />
                              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                              <Bar dataKey="acertos" name="Greens" fill="#10b981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="erros" name="Reds" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                  </div>
              )}

              {/* =======================================================
                  🧠 TELA: RADAR IA (Ajustada com Links de Afiliados)
              ========================================================= */}
              {viewMode === 'radar' && (
                  <div className="px-4 animate-fade-in pb-20 w-full">
                      <HeaderNav title="🧠 Central de Inteligência" onBack={() => setViewMode('jogos')} />
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#0f172a] border border-green-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-green-400 mb-2"><TrendingUp className="w-3 h-3"/><span className="text-[9px] font-black uppercase">Melhor Value Bet</span></div><div className="text-xs font-bold text-white truncate">Flamengo x Palmeiras...</div></div>
                          <div className="bg-[#0f172a] border border-red-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-red-400 mb-2"><Target className="w-3 h-3"/><span className="text-[9px] font-black uppercase">Gol Iminente</span></div><div className="text-xs font-bold text-white truncate">Real Madrid (Ataque ...</div></div>
                          <div className="bg-[#0f172a] border border-purple-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-purple-400 mb-2"><TrendingUp className="w-3 h-3"/><span className="text-[9px] font-black uppercase">Mercado Errado</span></div><div className="text-xs font-bold text-white truncate">Empate Anulado odd ...</div></div>
                          <div className="bg-[#0f172a] border border-blue-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-blue-400 mb-2"><Zap className="w-3 h-3"/><span className="text-[9px] font-black uppercase">Maior EV+</span></div><div className="text-xs font-bold text-white truncate">+14.2% EV (Escanteios)</div></div>
                      </div>

                      <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5"><h3 className="text-white font-black text-sm flex items-center gap-2 mb-6"><Globe className="w-5 h-5 text-blue-500"/> Radar Mundial PRO</h3><p className="text-xs text-slate-500 font-bold text-center py-6">Nenhuma super-oportunidade detectada no momento.</p></div>
                      
                      <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5">
                          <h3 className="text-slate-400 font-black text-[10px] uppercase flex items-center gap-2 mb-4"><DollarSign className="w-3 h-3 text-yellow-500"/> Comparador de Odds</h3>
                          
                          {/* LISTA DE AFILIADOS COM SCROLL HORIZONTAL IMPONENTE */}
                          <div className="flex gap-3 overflow-x-auto pb-2 pt-2 no-scrollbar">
                              
                              {/* 1. BET365 */}
                              <a href="#link-bet365" target="_blank" rel="noopener noreferrer" className="min-w-[90px] flex-shrink-0 bg-[#050816] rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-colors cursor-pointer active:scale-95">
                                  <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Bet365</div>
                                  <div className="text-sm font-black text-white">1.85</div>
                              </a>
                              
                              {/* 2. BETANO */}
                              <a href="#link-betano" target="_blank" rel="noopener noreferrer" className="min-w-[90px] flex-shrink-0 bg-[#050816] rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-colors cursor-pointer active:scale-95">
                                  <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Betano</div>
                                  <div className="text-sm font-black text-white">1.90</div>
                              </a>

                              {/* 3. KTO */}
                              <a href="#link-kto" target="_blank" rel="noopener noreferrer" className="min-w-[90px] flex-shrink-0 bg-[#050816] rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-colors cursor-pointer active:scale-95">
                                  <div className="text-[9px] font-black text-slate-400 uppercase mb-1">KTO</div>
                                  <div className="text-sm font-black text-white">1.95</div>
                              </a>
                              
                              {/* 4. 1XBET */}
                              <a href="#link-1xbet" target="_blank" rel="noopener noreferrer" className="min-w-[90px] flex-shrink-0 bg-[#050816] rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-colors cursor-pointer active:scale-95">
                                  <div className="text-[9px] font-black text-slate-400 uppercase mb-1">1xBet</div>
                                  <div className="text-sm font-black text-white">1.92</div>
                              </a>
                              
                              {/* 5. PINNACLE (DESTAQUE MAIOR ODD) */}
                              <a href="#link-pinnacle" target="_blank" rel="noopener noreferrer" className="min-w-[90px] flex-shrink-0 bg-gradient-to-b from-[#050816] to-green-900/20 rounded-xl p-3 text-center border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] relative cursor-pointer active:scale-95">
                                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-md">Maior Odd</div>
                                  <div className="text-[9px] font-black text-green-400 uppercase mb-1 mt-1">Pinnacle</div>
                                  <div className="text-sm font-black text-green-400">2.05</div>
                              </a>

                          </div>
                      </div>
                  </div>
              )}

              {/* =======================================================
                  ⚙️ TELA: ADMIN
              ========================================================= */}
              {viewMode === 'admin' && (
                  <div className="px-4 animate-fade-in pb-20 w-full">
                      <HeaderNav title="⚙️ Painel de Controle Admin" onBack={() => setViewMode('perfil')} />
                      <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg mb-3"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Total Usuários</div><div className="text-3xl font-black text-white">1,248</div></div>
                      <div className="bg-[#0f172a] p-5 rounded-3xl border border-yellow-500/20 shadow-lg mb-3"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Assinantes PRO</div><div className="text-3xl font-black text-yellow-400">312</div></div>
                      <div className="bg-[#0f172a] p-5 rounded-3xl border border-green-500/20 shadow-lg flex justify-between items-center"><div><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Receita Mensal Estimada</div><div className="text-3xl font-black text-green-400">R$ 9.328,80</div></div><DollarSign className="w-10 h-10 text-green-500 opacity-50"/></div>
                  </div>
              )}
          </div>
      )}

      {jogoSelecionado && menuAtivo !== 'assinar pro' && (
          <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs">A carregar...</div>}>
              <PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly} />
          </Suspense>
      )}

      <button onClick={() => setAiOpen(true)} className="fixed right-5 bottom-28 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg z-40 text-2xl">🤖</button>

      <AnimatePresence>
          {aiOpen && (
              <motion.div initial={{opacity:0, y:20, scale:0.9}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.9, y:20}} className="fixed right-4 left-4 bottom-24 bg-[#0f172a] border border-slate-700 p-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col max-h-[70vh]">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5"><h3 className="font-black flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400"/> Assistente IA</h3><button onClick={() => setAiOpen(false)} className="bg-slate-800 rounded-full p-1.5"><X className="w-4 h-4"/></button></div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1 custom-scrollbar">
                      {aiMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-semibold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#050816] text-slate-300 border border-slate-800'}`}>{msg.text}</div></div>
                      ))}
                      {aiLoading && <div className="flex justify-start"><div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 text-slate-300 text-xs font-bold animate-pulse">A processar...</div></div>}
                  </div>
                  <form onSubmit={handleAskAI} className="flex gap-2">
                      <input type="text" placeholder="Qual a melhor aposta?" value={aiQuery} onChange={(e)=>setAiQuery(e.target.value)} disabled={aiLoading} className="flex-1 bg-[#050816] border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white outline-none"/>
                      <button type="submit" disabled={aiLoading || !aiQuery.trim()} className="bg-blue-600 text-white p-3 rounded-2xl"><Send className="w-5 h-5"/></button>
                  </form>
              </motion.div>
          )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816] border-t border-white/5 flex justify-around items-center z-50">
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' ? 'text-blue-500' : 'text-slate-500'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase mt-1">Início</span></button>
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 ${filterCentro === 'Ao Vivo' ? 'text-red-500' : 'text-slate-500'}`}><Radio className="w-6 h-6" /><span className="text-[9px] font-black uppercase mt-1">Ao Vivo</span></button>
        <button onClick={() => {setViewMode('copa'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 ${viewMode === 'copa' ? 'text-yellow-500' : 'text-slate-500'}`}><Trophy className="w-6 h-6" /><span className="text-[9px] font-black uppercase mt-1">Copa</span></button>
        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 ${viewMode === 'perfil' ? 'text-blue-500' : 'text-slate-500'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase mt-1">Perfil</span></button>
        <button onClick={() => {setViewMode('radar'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 ${viewMode === 'radar' ? 'text-blue-500' : 'text-slate-500'}`}><Zap className="w-6 h-6" /><span className="text-[9px] font-black uppercase mt-1">Radar IA</span></button>
        {userData?.is_admin && (
           <button onClick={() => {setViewMode('admin'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 ${viewMode === 'admin' ? 'text-yellow-500' : 'text-slate-500'}`}><Zap className="w-6 h-6" /><span className="text-[9px] font-black uppercase mt-1">Admin</span></button>
        )}
      </nav>
    </div>
  );
}