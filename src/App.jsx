import React, { useState, useEffect, lazy, Suspense, useContext } from 'react';
import './App.css'; 
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// IMPORTAÇÕES DOS NOVOS MÓDULOS SEPARADOS
// ==========================================
import HeroPremium from './components/HeroPremium.jsx';
import ConsensoIA from './components/ConsensoIA.jsx';
import Onboarding from './components/Onboarding.jsx';
import { ThemeProvider, ThemeContext } from './context/ThemeContext.jsx';
import { solicitarPermissaoNotificacao, dispararAlerta } from './services/notificacoes.js';
import { salvarCache, lerCache } from './services/cache.js';
import { retry } from './utils/retry.js';
import { simularMonteCarlo } from './algorithms/monteCarlo.js';
import { buscarCompeticoes } from './services/sportradar.js';

// ==========================================
// IMPORTAÇÕES EXISTENTES
// ==========================================
import { Home, Radio, Trophy, Crown, Star, X, User, Zap, AlertTriangle, ArrowLeft, Send, DollarSign, Target, Globe, Moon, Sun } from 'lucide-react';
import { useAlertas } from './hooks/useAlertas.js';
import { useFavoritos } from './hooks/useFavoritos.js';
import { useJogos } from './hooks/useJogos.js';
import { useIA } from './hooks/useIA.js';

import DashboardIA from './components/DashboardIA.jsx';
import RadarMundial from './components/RadarMundial.jsx';
import OddsComparison from './components/OddsComparison.jsx';
import IAInsights from './components/IAInsights.jsx';
import CopaStats from './components/CopaStats.jsx';
import { detectarValueBetReal } from './algorithms/valueBet.js';
import { calcularHeatScore, calcularKelly } from './utils/math.js';
import { calcularRisco, calcularStake } from './utils/risk.js';

const Perfil = lazy(() => import('./components/Perfil.jsx'));
const PainelJogo = lazy(() => import('./components/PainelJogo.jsx'));

// Configurações e Supabase
const MODO_DEMONSTRACAO = true; 
const API_URL = '';
let supabase = { from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }) }) };

try {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  if (url && url.startsWith('http')) supabase = createClient(url, key);
} catch (e) { console.error("Erro Supabase:", e); }

const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-5947285218976034';
initMercadoPago(mpKey, { locale: 'pt-BR' });

const PAISES = ['brasil', 'argentina', 'colômbia', 'uruguai', 'chile', 'peru', 'espanha', 'alemanha', 'frança', 'portugal', 'inglaterra', 'itália', 'holanda'];
const isSelecao = (h, a, l) => {
    const str = `${h} ${a} ${l}`.toLowerCase();
    return str.includes('euro') || str.includes('copa') || str.includes('world cup') || PAISES.some(p => str.includes(p));
};
const getLocalYYYYMMDD = () => new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000).toISOString().split('T')[0];

// ==========================================
// COMPONENTE INTERNO DO APP (Para usar o ThemeContext)
// ==========================================
function AppContent() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('onboarding_done'));
  const [showSplash, setShowSplash] = useState(true);
  
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  
  const [bancaInicial] = useState(1000);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  
  const [jogosTempoReal, setJogosTempoReal] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);

  // ==========================================
  // TESTE SPORTRADAR API
  // ==========================================
  useEffect(() => {
    const testarAPI = async () => {
      console.log("A testar conexão com Sportradar...");
      const dados = await buscarCompeticoes();
      if (dados) {
        console.log("Sucesso! Competições carregadas:", dados.competitions);
      }
    };
    
    testarAPI();
  }, []);

  const { favoritos, toggleFavorito } = useFavoritos();
  const { jogos: jogosDoHook, loading: loadingHook } = useJogos(API_URL, ligaAtivaId, []);

  useEffect(() => {
    const puxarJogosDoServidor = async () => {
      try {
        const { data: dadosBrutos, error } = await supabase.from('jogos_ao_vivo').select('*');
        if (error || !dadosBrutos) return;
        const dadosFormatados = dadosBrutos.map(j => ({
            id: j.id_jogo, league_id: 999, league_name: j.liga || 'Monitoramento Ao Vivo',
            starting_at: `${getLocalYYYYMMDD()}T00:00:00`,
            status: (j.tempo_jogo === 'INTERVALO' || j.tempo_jogo.includes("'")) ? 'Live' : 'Not Started',
            time_elapsed: j.tempo_jogo, home_team: j.time_casa, away_team: j.time_fora,
            home_image: j.logo_casa, away_image: j.logo_fora, scoreHome: j.placar_casa, scoreAway: j.placar_fora,
            confianca_ia: j.confianca_ia || 85, odd_principal: j.odd_principal || 1.85,
        }));
        setJogosTempoReal(dadosFormatados);
      } catch (err) { console.error("Erro Sync:", err); } 
      finally { setLoadingReal(false); }
    };
    puxarJogosDoServidor();
    const timer = setInterval(puxarJogosDoServidor, 30000); 
    return () => clearInterval(timer);
  }, []);

  const jogos = [...jogosTempoReal, ...jogosDoHook];
  const loading = loadingHook && loadingReal;

  const { aiOpen, setAiOpen, aiQuery, setAiQuery, aiLoading, aiMessages, handleAskAI, gerarExplicacaoIA } = useIA(API_URL, jogos, setJogoSelecionado);
  useAlertas(jogos);

  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: em.includes('admin') }); 
      else if (MODO_DEMONSTRACAO) setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true }); 
  }, []);

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
              {matches.map(j => (
                  <div key={j.id} onClick={() => { if(!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer relative transition-all hover:border-blue-500/50">
                      <div className="flex justify-between items-center mb-5">
                          {j.status === 'Live' ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> : <span className="text-slate-400 text-[10px] font-bold uppercase">Agendado</span>}
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorito(e, j.id); }} className="p-1"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                      </div>
                      <div className="grid grid-cols-3 items-center text-center mb-2">
                          <div className="flex flex-col items-center gap-2"><img src={j.home_image || 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png'} className="w-10 h-10 object-contain" alt=""/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.home_team}</span></div>
                          <div className="text-2xl font-black text-white">{j.status === 'Live' ? `${j.scoreHome} - ${j.scoreAway}` : '-'}</div>
                          <div className="flex flex-col items-center gap-2"><img src={j.away_image || 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png'} className="w-10 h-10 object-contain" alt=""/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.away_team}</span></div>
                      </div>
                  </div>
              ))}
          </div>
      ));
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => { setShowOnboarding(false); localStorage.setItem('onboarding_done', 'true'); }} />;
  }

  if (showSplash) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white">
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl mb-4">⚽</motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans pb-28 w-full max-w-full overflow-x-hidden ${theme === 'dark' ? 'bg-[#050816] text-white' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* HEADER */}
      <header className={`flex items-center justify-between px-5 py-4 sticky top-0 z-40 border-b ${theme === 'dark' ? 'bg-[#050816]/95 border-white/5' : 'bg-white/95 border-slate-200'} backdrop-blur-md`}>
        <h1 className="font-black text-xl tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span></h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full border border-slate-500/30">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400"/> : <Moon className="w-4 h-4 text-slate-600"/>}
          </button>
          <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg text-xs">
            <Crown className="w-4 h-4" /> VIP
          </button>
        </div>
      </header>

      {/* =========================================================
          🚀 TELA VIP COM SETA BLINDADA INTACTA
      ========================================================= */}
      {menuAtivo === 'assinar pro' && (
        <div className="px-4 pt-24 animate-fade-in pb-28 min-h-screen bg-[#050816] text-white absolute inset-0 z-[999]">
          <div className="fixed top-0 left-0 w-full bg-[#050816]/95 backdrop-blur-xl z-[9999] px-5 py-4 border-b border-white/10 flex items-center gap-3 shadow-xl">
            <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setJogoSelecionado(null); }} className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition shadow-[0_0_15px_rgba(37,99,235,0.6)] flex-shrink-0">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <span className="font-black text-white uppercase tracking-widest text-xs">Voltar ao App</span>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl p-6 text-black shadow-[0_0_30px_rgba(234,179,8,0.25)] mt-4">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Crown className="w-6 h-6" /> BetAnalytics PRO</h2>
            <p className="text-sm font-bold mb-5">Desbloqueie Radar IA, Value Bets e análises avançadas.</p>
            <button className="w-full bg-black text-yellow-400 font-black py-4 rounded-2xl text-sm">ASSINAR VIP PRO</button>
          </div>
        </div>
      )}

      {/* ÁREAS DO APP */}
      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in w-full">
              {viewMode === 'jogos' && (
                  <>
                    {userData?.is_vip && <HeroPremium onViewOportunidades={() => setViewMode('radar')} />}
                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black transition-colors border ${filterCentro==='Todos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-slate-500 text-slate-500'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-red-600 text-white border-red-600' : 'bg-transparent border-slate-500 text-slate-500'}`}>Ao Vivo</button>
                    </div>
                    <div className="px-4"><RenderizarListaJogos /></div>
                  </>
              )}
              {viewMode === 'radar' && <div className="px-4 pt-6"><DashboardIA insights={{}} /><RadarMundial jogos={jogos} /></div>}
              {viewMode === 'copa' && <div className="px-4 pt-6"><CopaStats artilheiros={[]} assistencias={[]} /></div>}
              {viewMode === 'perfil' && <div className="px-4 pt-6"><Suspense fallback={<div/>}><Perfil userData={userData} xp={xp} setViewMode={setViewMode} apostas={[]} bancaInicial={bancaInicial} setMenuAtivo={setMenuAtivo} /></Suspense></div>}
          </div>
      )}

      {/* PAINEL DO JOGO COM CONSENSO IA */}
      {jogoSelecionado && menuAtivo !== 'assinar pro' && (
          <div className="px-4 pt-4">
             <div className="flex items-center gap-3 mb-4">
               <button onClick={()=>setJogoSelecionado(null)} className="p-2 bg-slate-800 rounded-full text-white"><ArrowLeft className="w-5 h-5"/></button>
               <h2 className="text-lg font-black text-slate-400">Voltar</h2>
             </div>
             {/* COMPONENTE SEPARADO: Consenso IA */}
             {userData?.is_vip && <ConsensoIA jogo={jogoSelecionado} />}
             <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs">A carregar...</div>}>
                <PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly} />
             </Suspense>
          </div>
      )}

      {/* MENU INFERIOR */}
      <nav className={`fixed bottom-0 left-0 right-0 h-20 border-t flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${theme === 'dark' ? 'bg-[#050816] border-white/5' : 'bg-white border-slate-200'}`}>
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado && menuAtivo !== 'assinar pro' ? 'text-blue-600' : 'text-slate-500'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Início</span></button>
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${filterCentro === 'Ao Vivo' && !jogoSelecionado && menuAtivo !== 'assinar pro' ? 'text-red-500' : 'text-slate-500'}`}><Radio className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Ao Vivo</span></button>
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('radar'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'radar' && menuAtivo !== 'assinar pro' ? 'text-purple-500' : 'text-slate-500'}`}><Zap className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Radar IA</span></button>
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('perfil'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'perfil' && menuAtivo !== 'assinar pro' ? 'text-blue-500' : 'text-slate-500'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Perfil</span></button>
      </nav>
    </div>
  );
}

// ==========================================
// EXPORTAÇÃO PRINCIPAL ENVOLVIDA PELO TEMA
// ==========================================
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}