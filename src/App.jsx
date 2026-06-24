import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css'; 
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { useAlertas } from './hooks/useAlertas.js';
import DashboardIA from './components/DashboardIA.jsx';
import RadarMundial from './components/RadarMundial.jsx';
import OddsComparison from './components/OddsComparison.jsx';
import { Home, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, AlertTriangle, ArrowLeft, Send, DollarSign, Target, Bell, Globe } from 'lucide-react';
import IAInsights from './components/IAInsights.jsx';
import CopaStats from './components/CopaStats.jsx';

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

// Importação da nova área da Copa do Mundo
const CopaDoMundo = lazy(() => import('./components/CopaDoMundo.jsx'));
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
  console.error("Erro ao inicializar Supabase:", e);
}

const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996';
initMercadoPago(mpKey, { locale: 'pt-BR' });

// ============================================================================
// 🌍 DETETOR DE SELEÇÕES INTERNACIONAIS (FILTRO INTELIGENTE)
// ============================================================================
const PAISES = ['brasil', 'argentina', 'colômbia', 'uruguai', 'chile', 'peru', 'equador', 'venezuela', 'bolívia', 'paraguai', 'espanha', 'alemanha', 'frança', 'portugal', 'inglaterra', 'itália', 'holanda', 'bélgica', 'croácia', 'méxico', 'eua', 'estados unidos', 'canadá', 'costa rica'];

const isSelecao = (home, away, liga) => {
    const h = (home || '').toLowerCase();
    const a = (away || '').toLowerCase();
    const l = (liga || '').toLowerCase();
    
    if (l.includes('euro') || l.includes('copa américa') || l.includes('nations league') || l.includes('amistoso') || l.includes('world cup') || l.includes('eliminatórias')) return true;
    if (PAISES.includes(h) || PAISES.includes(a)) return true;
    return false;
};

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };

const listaLigas = [
  {name:'Todos', id: null}, 
  {name:'Brasileirão', id: 71}, 
  {name:'Champions', id: 2}, 
  {name:'Premier League', id: 39}
];

const crescimentoBancaGlobal = [ { dia: "1", banca: 1000 }, { dia: "2", banca: 1080 }, { dia: "3", banca: 1150 }, { dia: "4", banca: 1210 }, { dia: "5", banca: 1280 }, { dia: "6", banca: 1350 }, { dia: "7", banca: 1420 } ];
const mockRankingUsuarios = [ { id: 1, nome: "Lucas", lucro_total: 1840 }, { id: 2, nome: "Carlos", lucro_total: 1430 }, { id: 3, nome: "João", lucro_total: 1180 } ];

const mockJogosData = [];

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
  const [rankingUsuarios, setRankingUsuarios] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  const [xp] = useState(350);

  const [jogosTempoReal, setJogosTempoReal] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  
  const nivelUsuario = () => {
    if (xp > 5000) return "Lenda";
    if (xp > 3000) return "Mestre";
    if (xp > 1000) return "Especialista";
    if (xp > 500) return "Profissional";
    return "Iniciante";
  };

  const [apostas] = useState([]);
  const metaMensal = 2000;

  const { favoritos, toggleFavorito } = useFavoritos();
  const { jogos: jogosDoHook, loading: loadingHook } = useJogos(API_URL, ligaAtivaId, mockJogosData);

  // 🔄 SINCRONIZAÇÃO EM TEMPO REAL E LEITURA DE ESCUDOS
  useEffect(() => {
    const puxarJogosDoServidor = async () => {
      try {
        const { data: dadosBrutos, error } = await supabase
          .from('jogos_ao_vivo')
          .select('*');

        if (error) throw error;
        if (!dadosBrutos) return;

        const dadosFormatados = dadosBrutos.map(j => {
          const isLiveMatch = j.tempo_jogo === 'INTERVALO' || j.tempo_jogo.includes("'") || j.tempo_jogo.includes('MIN');
          
          const oddPrincipal = j.odd_principal || (Math.random() * (2.8 - 1.2) + 1.2);
          const probMercado = 100 / oddPrincipal;
          const edgeIA = Math.floor(Math.random() * 9) - 2; 
          const confiancaReal = (j.confianca_ia && j.confianca_ia !== 89) ? j.confianca_ia : Math.min(99, Math.round(probMercado + edgeIA));

          return {
            id: j.id_jogo,
            league_id: 999, 
            league_name: j.liga || j.campeonato || 'Monitoramento Ao Vivo',
            starting_at: `${getLocalYYYYMMDD()}T00:00:00`,
            status: isLiveMatch ? 'Live' : (j.tempo_jogo.includes('ENCERRADO') ? 'Finished' : 'Not Started'),
            time_elapsed: j.tempo_jogo, 
            home_team: j.time_casa,
            away_team: j.time_fora,
            
            home_image: j.logo_casa || 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png', 
            away_image: j.logo_fora || 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png',
            
            scoreHome: j.placar_casa,
            scoreAway: j.placar_fora,
            confianca_ia: confiancaReal, 
            odd_principal: oddPrincipal,
            odd_abertura: oddPrincipal + 0.1,
            homeStats: { form: Math.floor(Math.random()*40)+50, h2h: 75, attack: 82, formacao: "4-3-3" },
            awayStats: { form: Math.floor(Math.random()*40)+50, formacao: "4-4-2" }
          };
        });

        setJogosTempoReal(dadosFormatados);
      } catch (err) {
        console.error("Erro ao sincronizar crawler:", err);
      } finally {
        setLoadingReal(false);
      }
    };

    puxarJogosDoServidor();
    const timer = setInterval(puxarJogosDoServidor, 30000); 
    return () => clearInterval(timer);
  }, []);

  const jogos = [...jogosTempoReal, ...jogosDoHook];
  const loading = loadingHook && loadingReal;

  const { aiOpen, setAiOpen, aiQuery, setAiQuery, aiLoading, aiMessages, handleAskAI, gerarExplicacaoIA } = useIA(API_URL, jogos, setJogoSelecionado);
  
  // Ativa a vigilância constante dos jogos de alta confiança
  useAlertas(jogos);
  
  // Insights simulados para o Dashboard
  const mockInsights = {
      valueBet: "Flamengo x Palmeiras (Over 2.5)",
      golIminente: "Real Madrid (Ataque Perigoso 88')",
      mercadoErrado: "Empate Anulado odd 2.10",
      evPositivo: "+14.2% EV (Escanteios)"
  };

  useEffect(() => { const carregarDados = async () => { setRankingUsuarios(mockRankingUsuarios); }; carregarDados(); }, []);
  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      const ADMIN_EMAIL = "lucasmontesso@admin.com"; 
      
      if (em) {
          setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: (em === ADMIN_EMAIL) }); 
      }
      else if (MODO_DEMONSTRACAO) {
          setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true }); 
      } 
  }, []);

  useEffect(() => {
      if(jogos.length){
          const jogosValidos = viewMode === 'copa' 
              ? jogos.filter(j => isSelecao(j.home_team, j.away_team, j.league_name))
              : jogos.filter(j => !isSelecao(j.home_team, j.away_team, j.league_name));

          const selecoes = [...jogosValidos].filter(j => j.confianca_ia >= 80).sort((a,b) => b.confianca_ia - a.confianca_ia).slice(0,3);
          const oddFinal = selecoes.reduce((acc, j) => acc * (j.odd_principal || 1), 1);
          setBilhetePremium({ selecoes, oddFinal });
      }
  }, [jogos, viewMode]);

  let jFilt = (jogos||[]).filter(j => { 
      const sel = isSelecao(j.home_team, j.away_team, j.league_name);
      if (viewMode === 'jogos' && sel) return false; 
      if (viewMode === 'copa' && !sel) return false;  
      if (filterCentro === 'Ao Vivo') return j.status === 'Live'; 
      if (filterCentro === 'Favoritos') return favoritos.includes(j.id); 
      if (ligaAtivaId !== null && j.league_id !== ligaAtivaId && j.league_id !== 999) return false;
      return true; 
  });

  const jGrp = jFilt.reduce((a, j) => { if (!a[j.league_name]) a[j.league_name] = []; a[j.league_name].push(j); return a; }, {});

  // ============================================================================
  // 🧩 COMPONENTES REUTILIZÁVEIS
  // ============================================================================
  const RenderizarListaJogos = () => {
      if (loading) return <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div>;
      if (Object.keys(jGrp).length === 0) return <div className="text-center text-slate-500 py-10 font-bold">Nenhuma oportunidade encontrada com estes filtros.</div>;

      return Object.entries(jGrp).map(([leagueName, matches]) => (
          <div key={leagueName} className="mb-6 w-full">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div>
              {matches.map(j => {
                  const isLive = j.status === 'Live';
                  const heatScore = calcularHeatScore(j);
                  const risco = calcularRisco(j);
                  const isValueBet = j.odd_principal ? detectarValueBetReal(j.odd_principal, j.confianca_ia).isValue : false;
                  
                  return (
                      <div key={j.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-lg mb-4 cursor-pointer relative transition-all hover:border-blue-500/50 w-full transform-gpu">
                          {heatScore > 50 && <div className="absolute -right-8 top-5 bg-red-600 text-white text-[8px] font-black px-8 py-1 rotate-45 shadow-lg flex items-center justify-center uppercase tracking-widest border-y border-red-400/30">Heat {heatScore}</div>}
                          <div className="flex justify-between items-center mb-5">
                              {isLive ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}{typeof j.time_elapsed === 'number' || !isNaN(j.time_elapsed) ? "'" : ""}</span> : <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase">{j.status === 'Finished' ? 'Finalizado' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>}
                              <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1 relative mr-6"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                          </div>
                          <div className="flex gap-2 mb-3">
                              {isValueBet && <div className="bg-green-500/20 border border-green-500/40 text-green-400 font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap flex-shrink-0">💰 VALUE BET</div>}
                              <div className={`border ${risco.cor} font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 whitespace-nowrap flex-shrink-0`}><AlertTriangle className="w-3 h-3"/> Risco: {risco.nivel}</div>
                          </div>
                          <div className="grid grid-cols-3 items-center text-center mb-5 mt-2 w-full">
                              <div className="flex flex-col items-center gap-2 min-w-0"><img src={j.home_image} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" alt=""/><span className="text-[10px] sm:text-xs font-bold text-slate-200 truncate w-full">{j.home_team}</span></div>
                              <div className="text-2xl sm:text-4xl font-black tracking-tighter">{isLive || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600 textxl sm:text-2xl">-</span>}</div>
                              <div className="flex flex-col items-center gap-2 min-w-0"><img src={j.away_image} className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md" alt=""/><span className="text-[10px] sm:text-xs font-bold text-slate-200 truncate w-full">{j.away_team}</span></div>
                          </div>
                      </div>
                  )
              })}
          </div>
      ));
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

      {/* 🚀 TELA VIP CORRIGIDA COM SETA DE VOLTAR */}
      {menuAtivo === 'assinar pro' && (
        <div className="px-4 pt-5 animate-fade-in pb-28">
          <button
            onClick={() => {
              setMenuAtivo('Todos os Jogos');
              setViewMode('jogos');
              setJogoSelecionado(null);
            }}
            className="mb-5 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl p-6 text-black shadow-[0_0_30px_rgba(234,179,8,0.25)]">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Crown className="w-6 h-6" />
              BetAnalytics PRO
            </h2>

            <p className="text-sm font-bold mb-5">
              Desbloqueie Radar IA, Value Bets, alertas premium, xG, escanteios e análises avançadas.
            </p>

            <button className="w-full bg-black text-yellow-400 font-black py-4 rounded-2xl text-sm">
              ASSINAR VIP PRO
            </button>
          </div>
        </div>
      )}

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4 w-full">
              
              {/* 🏆 SEÇÃO DA COPA DO MUNDO */}
              {viewMode === 'copa' && (
                  <div className="px-4 w-full">
                      <div className="bg-gradient-to-br from-yellow-600 to-yellow-900 rounded-3xl p-6 mb-6 shadow-lg shadow-yellow-500/20 relative overflow-hidden">
                          <Globe className="absolute -right-4 -top-4 w-32 h-32 text-yellow-500/20" />
                          <h2 className="text-2xl font-black text-white flex items-center gap-2 relative z-10 drop-shadow-md"><Trophy className="w-6 h-6 text-yellow-300"/> Seleções</h2>
                          <p className="text-yellow-200 text-xs mt-1 relative z-10 font-bold">Monitoramento de Eurocopa, Copa América e Internacionais</p>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 w-full">
                          <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Todos</button>
                          <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                      </div>

                      {bilhetePremium.selecoes.length > 0 && (
                          <div className="bg-[#0f172a] border border-green-500/30 rounded-3xl p-4 mb-6 shadow-lg transform-gpu">
                              <h2 className="font-black text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs"><Target className="w-4 h-4"/> Múltipla de Seleções</h2>
                              <div>
                                  {bilhetePremium.selecoes.map(jogo => (
                                      <div key={jogo.id} onClick={() => setJogoSelecionado(jogo)} className="bg-[#111827] border border-white/5 p-3 rounded-xl mb-2 flex justify-between items-center cursor-pointer">
                                          <div className="font-bold text-white text-xs truncate pr-2 min-w-0">{jogo.home_team} x {jogo.away_team}</div>
                                          <div className="text-green-400 text-[10px] font-black tracking-widest uppercase flex-shrink-0">Confiança: {jogo.confianca_ia}%</div>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-green-500/20 flex justify-between items-center">
                                  <span className="text-[10px] text-green-200 font-black uppercase tracking-widest truncate pr-2">Odd Final</span>
                                  <span className="text-xl font-black text-green-400">@{Number(bilhetePremium.oddFinal || 0).toFixed(2)}</span>
                              </div>
                          </div>
                      )}

                      <RenderizarListaJogos />

                      {/* 🏆 ESTATÍSTICAS DA COPA (Artilheiros e Assistências) */}
                      <div className="mt-6 w-full">
                          <CopaStats artilheiros={[]} assistencias={[]} />
                      </div>
                  </div>
              )}

              {/* ⚽ SEÇÃO PRINCIPAL DE JOGOS */}
              {viewMode === 'jogos' && (
                  <>
                    {userData?.is_vip && (
                        <div className="mx-4 mb-6 rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_30px_rgba(13,110,253,0.3)] flex justify-between items-center transform-gpu">
                        <div><h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mb-1 sm:mb-2"><Crown className="w-5 h-5 text-yellow-400"/> IA Premium</h2><p className="text-blue-100 text-[10px] sm:text-xs mt-1"><strong>{(performanceStats.acertos/performanceStats.totalAnalises*100).toFixed(1)}%</strong> de precisão nos clubes</p></div>
                        <button onClick={() => setViewMode('alertas')} className="bg-white/20 border border-white/30 text-white text-[9px] sm:text-[10px] font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-xl uppercase tracking-wider">CONFIGURAR ALERTAS</button>
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

                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4 w-full">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>

                    <div className="px-4 w-full">
                        <RenderizarListaJogos />
                    </div>
                  </>
              )}

              {/* 🔥 NOVA ABA: RADAR IA */}
              {viewMode === 'radar' && (
                  <div className="px-4 animate-fade-in w-full pb-10">
                      <HeaderNav title="🧠 Central de Inteligência" onBack={() => setViewMode('jogos')} />
                      
                      {userData?.is_vip ? (
                          <>
                            <DashboardIA insights={mockInsights} />
                            <RadarMundial jogos={jogos} />
                            
                            <OddsComparison odds={{bet365: 1.85, betano: 1.90, xbet: 1.92, pinnacle: 2.05}} />
                            
                            <IAInsights jogos={jogos} />
                          </>
                      ) : (
                          <div className="bg-[#0f172a] border border-yellow-500/30 p-8 rounded-3xl text-center">
                              <Target className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-50" />
                              <h3 className="text-white font-black mb-2">Acesso Restrito PRO</h3>
                              <p className="text-slate-400 text-xs mb-6">O Radar Mundial varre mais de 100 ligas buscando falhas nas casas de apostas.</p>
                              <button onClick={() => setMenuAtivo('assinar pro')} className="bg-yellow-500 text-black font-black px-6 py-3 rounded-xl text-sm w-full shadow-[0_0_15px_rgba(234,179,8,0.4)]">DESBLOQUEAR RADAR</button>
                          </div>
                      )}
                  </div>
              )}

              {/* 👤 SEÇÃO DE PERFIL */}
              {viewMode === 'perfil' && (
                  <div className="px-4 animate-fade-in w-full">
                     <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse uppercase tracking-widest text-xs">A carregar Perfil Premium...</div>}>
                        <Perfil userData={userData} form={form} setForm={setForm} nivelUsuario={nivelUsuario()} xp={xp} setViewMode={setViewMode} apostas={apostas} bancaInicial={bancaInicial} metaMensal={metaMensal} setMenuAtivo={setMenuAtivo} />
                     </Suspense>
                  </div>
              )}

              {/* 🔔 SEÇÃO DE ALERTAS */}
              {viewMode === 'alertas' && (
                  <div className="px-4 animate-fade-in w-full pb-10">
                      <HeaderNav title="🔔 Radar de Oportunidades" onBack={() => setViewMode('jogos')} />
                      <div className="bg-[#0f172a] border border-yellow-500/30 rounded-3xl p-4 sm:p-6 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] transform-gpu">
                          <h3 className="text-sm font-black text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                               Configurar Notificações Push
                          </h3>
                          <p className="text-xs text-slate-400 mb-4">Receba avisos diretos no telemóvel quando os nossos algoritmos detetarem padrões de alta probabilidade.</p>
                          <button onClick={async () => { const { solicitarPermissaoNotificacao } = await import('./services/notificacoes'); solicitarPermissaoNotificacao(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm mb-6 shadow-lg">ATIVAR NOTIFICAÇÕES</button>
                      </div>
                  </div>
              )}

              {/* ⚙️ TELA ADMIN */}
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

      {/* TELA DE JOGO ABERTO */}
      {jogoSelecionado && menuAtivo !== 'assinar pro' && (
          <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs uppercase tracking-widest">A carregar estatísticas do jogo...</div>}>
              <PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly} />
          </Suspense>
      )}

      {/* CHAT IA */}
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

      {/* 🚀 MENU INFERIOR DE NAVEGAÇÃO 100% BLINDADO */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816] border-t border-white/5 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* INÍCIO */}
        <button 
          onClick={() => {
            setMenuAtivo('Todos os Jogos');
            setViewMode('jogos');
            setFilterCentro('Todos');
            setJogoSelecionado(null);
          }} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado && menuAtivo !== 'assinar pro' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
        </button>

        {/* AO VIVO */}
        <button 
          onClick={() => {
            setMenuAtivo('Todos os Jogos');
            setViewMode('jogos');
            setFilterCentro('Ao Vivo');
            setJogoSelecionado(null);
          }} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado && menuAtivo !== 'assinar pro' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className="relative">
            <Radio className="w-6 h-6" />
            {filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span>
        </button>

        {/* COPA */}
        <button 
          onClick={() => {
            setMenuAtivo('Todos os Jogos');
            setViewMode('copa');
            setJogoSelecionado(null);
          }} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'copa' && menuAtivo !== 'assinar pro' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Copa</span>
        </button>

        {/* PERFIL */}
        <button 
          onClick={() => {
            setMenuAtivo('Todos os Jogos');
            setViewMode('perfil');
            setJogoSelecionado(null);
          }} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${['perfil','admin'].includes(viewMode) && menuAtivo !== 'assinar pro' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>

        {/* RADAR IA */}
        <button 
          onClick={() => {
            setMenuAtivo('Todos os Jogos');
            setViewMode('radar');
            setJogoSelecionado(null);
          }} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'radar' && menuAtivo !== 'assinar pro' ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Radar IA</span>
        </button>
        
        {/* 🔥 ABA ADMIN BLINDADA */}
        {userData?.is_admin && (
             <button 
               onClick={() => {
                 setMenuAtivo('Todos os Jogos');
                 setViewMode('admin');
                 setJogoSelecionado(null);
               }} 
               className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'admin' && menuAtivo !== 'assinar pro' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
             >
                 <Zap className="w-6 h-6 text-yellow-500" />
                 <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Admin</span>
             </button>
        )}
      </nav>
    </div>
  );
}