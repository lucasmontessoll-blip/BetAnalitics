import React, { useState, useEffect, lazy, Suspense, useContext } from 'react';
import './App.css';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

// ==========================================
// IMPORTAÇÕES DOS NOVOS MÓDULOS SEPARADOS
// ==========================================
import HeroPremium from './components/HeroPremium.jsx';
import ConsensoIA from './components/ConsensoIA.jsx';
import Onboarding from './components/Onboarding.jsx';
import { ThemeProvider, ThemeContext } from './context/ThemeContext.jsx';
import { useAlertas } from './hooks/useAlertas.js';
import { useFavoritos } from './hooks/useFavoritos.js';
import { useJogos } from './hooks/useJogos.js';
import { useIA } from './hooks/useIA.js';
import DashboardIA from './components/DashboardIA.jsx';
import RadarMundial from './components/RadarMundial.jsx';
import CopaStats from './components/CopaStats.jsx';
import { calcularKelly } from './utils/math.js';
import { calcularStake } from './utils/risk.js';
import { buscarCompeticoes, buscarJogosDeHoje } from './services/sportradar.js';

// ==========================================
// IMPORTAÇÕES EXISTENTES
// ==========================================
import { Home, Radio, Crown, Star, User, Zap, ArrowLeft, Moon, Sun } from 'lucide-react';

const Perfil = lazy(() => import('./components/Perfil.jsx'));
const PainelJogo = lazy(() => import('./components/PainelJogo.jsx'));

// ==========================================
// CONFIGURAÇÕES E SUPABASE
// ==========================================
const MODO_DEMONSTRACAO = true;
const API_URL = '';

let supabase = {
  from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) })
};

try {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  if (url && key && url.startsWith('http')) {
    supabase = createClient(url, key);
  }
} catch (e) {
  console.error('Erro Supabase:', e);
}

const mpKey = import.meta.env.VITE_MP_PUBLIC_KEY || '';
if (mpKey) {
  initMercadoPago(mpKey, { locale: 'pt-BR' });
}

const PAISES = ['brasil', 'argentina', 'colômbia', 'uruguai', 'chile', 'peru', 'espanha', 'alemanha', 'frança', 'portugal', 'inglaterra', 'itália', 'holanda', 'mexico', 'canada', 'usa', 'japão', 'japan', 'coreia', 'korea', 'morocco', 'marrocos', 'france', 'germany', 'italy', 'england', 'netherlands'];

const isSelecao = (h, a, l) => {
  const str = `${h || ''} ${a || ''} ${l || ''}`.toLowerCase();
  return str.includes('euro') || str.includes('copa') || str.includes('world cup') || str.includes('fifa') || PAISES.some((p) => str.includes(p));
};

const getLocalYYYYMMDD = () => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

const logoPadrao = 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png';

// ==========================================
// CONVERSOR BLINDADO DA SPORTRADAR
// ==========================================
const normalizarJogoSportradar = (item, index = 0) => {
  if (!item) return null;

  if (item.home_team && item.away_team) {
    return {
      id: item.id || `sportradar-formatado-${index}`,
      league_id: item.league_id || 999,
      league_name: item.league_name || 'Sportradar',
      starting_at: item.starting_at || item.start_time || new Date().toISOString(),
      status: item.status || 'Not Started',
      time_elapsed: item.time_elapsed || item.match_time || '0',
      home_team: item.home_team || 'Casa',
      away_team: item.away_team || 'Fora',
      home_image: item.home_image || logoPadrao,
      away_image: item.away_image || logoPadrao,
      scoreHome: item.scoreHome ?? item.home_score ?? 0,
      scoreAway: item.scoreAway ?? item.away_score ?? 0,
      confianca_ia: item.confianca_ia || Math.floor(Math.random() * 20) + 75,
      odd_principal: item.odd_principal || Number((Math.random() * (2.8 - 1.2) + 1.2).toFixed(2)),
      fonte: item.fonte || 'sportradar'
    };
  }

  const evento = item.sport_event || {};
  const status = item.sport_event_status || {};
  const contexto = evento.sport_event_context || {};
  const competicao = contexto.competition || {};
  const competidores = evento.competitors || [];

  const casa = competidores.find((c) => c.qualifier === 'home') || competidores[0] || {};
  const fora = competidores.find((c) => c.qualifier === 'away') || competidores[1] || {};

  const statusApi = String(status.status || '').toLowerCase();
  let statusApp = 'Not Started';
  
  if (statusApi === 'live' || statusApi === 'inprogress') { statusApp = 'Live'; }
  if (statusApi === 'closed' || statusApi === 'ended' || statusApi === 'complete' || statusApi === 'finished') { statusApp = 'Finished'; }

  return {
    id: evento.id || item.id || `sportradar-${index}`,
    league_id: competicao.id || 999,
    league_name: competicao.name || 'Competição Global',
    starting_at: evento.start_time || new Date().toISOString(),
    status: statusApp,
    time_elapsed: status.match_time || status.match_status || status.status || '0',
    home_team: casa.name || 'Casa',
    away_team: fora.name || 'Fora',
    home_image: logoPadrao,
    away_image: logoPadrao,
    scoreHome: status.home_score ?? 0,
    scoreAway: status.away_score ?? 0,
    confianca_ia: Math.floor(Math.random() * 20) + 75,
    odd_principal: Number((Math.random() * (2.8 - 1.2) + 1.2).toFixed(2)),
    fonte: 'sportradar'
  };
};

// ==========================================
// COMPONENTE INTERNO DO APP
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
  const [metaMensal] = useState(50);
  const [xp, setXp] = useState(0);
  const [apostas, setApostas] = useState([]);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  const [form, setForm] = useState({ nome: '', banca: 1000 });

  const [jogosTempoReal, setJogosTempoReal] = useState([]);
  const [jogosSportradar, setJogosSportradar] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  const [loadingSportradar, setLoadingSportradar] = useState(true);

  const nivelUsuario = () => Math.floor(xp / 100) + 1;

  // ==========================================
  // SPORTRADAR: BUSCAR JOGOS DO DIA
  // ==========================================
  useEffect(() => {
    const carregarJogosReais = async () => {
      try {
        setLoadingSportradar(true);
        console.log('A testar conexão com Sportradar...');
        const competicoes = await buscarCompeticoes();
        if (competicoes && competicoes.competitions) {
          console.log(`Sucesso! Competições carregadas:`, competicoes.competitions.length);
        }

        console.log('A buscar agenda de jogos de hoje na Sportradar...');
        const dados = await buscarJogosDeHoje();

        const listaBruta = Array.isArray(dados) ? dados : dados?.summaries || dados?.schedules || dados?.response || [];
        
        console.log(`Jogos encontrados antes de formatar: ${listaBruta.length}`);

        if (listaBruta.length > 0) {
          const jogosFormatados = listaBruta.map((item, index) => normalizarJogoSportradar(item, index)).filter(Boolean);
          console.log(`Sucesso! ${jogosFormatados.length} jogos formatados para o app.`);
          setJogosSportradar(jogosFormatados);
        } else {
          console.log('Nenhum jogo encontrado para hoje na Sportradar.');
          setJogosSportradar([]);
        }
      } catch (error) {
        console.error('Erro ao carregar jogos Sportradar:', error);
        setJogosSportradar([]);
      } finally {
        setLoadingSportradar(false);
      }
    };
    carregarJogosReais();
  }, []);

  const { favoritos, toggleFavorito } = useFavoritos();
  const { jogos: jogosDoHook, loading: loadingHook } = useJogos(API_URL, ligaAtivaId, []);

  // ==========================================
  // SUPABASE: JOGOS EM TEMPO REAL
  // ==========================================
  useEffect(() => {
    const puxarJogosDoServidor = async () => {
      try {
        const { data: dadosBrutos, error } = await supabase.from('jogos_ao_vivo').select('*');

        if (error || !dadosBrutos) {
          setJogosTempoReal([]);
          return;
        }

        const dadosFormatados = dadosBrutos.map((j) => ({
          id: j.id_jogo,
          league_id: 999,
          league_name: j.liga || 'Monitoramento Ao Vivo',
          starting_at: `${getLocalYYYYMMDD()}T00:00:00`,
          status: j.tempo_jogo === 'INTERVALO' || String(j.tempo_jogo || '').includes("'") ? 'Live' : 'Not Started',
          time_elapsed: j.tempo_jogo,
          home_team: j.time_casa,
          away_team: j.time_fora,
          home_image: j.logo_casa || logoPadrao,
          away_image: j.logo_fora || logoPadrao,
          scoreHome: j.placar_casa ?? 0,
          scoreAway: j.placar_fora ?? 0,
          confianca_ia: j.confianca_ia || 85,
          odd_principal: j.odd_principal || 1.85,
          fonte: 'supabase'
        }));

        setJogosTempoReal(dadosFormatados);
      } catch (err) {
        console.error('Erro Sync:', err);
        setJogosTempoReal([]);
      } finally {
        setLoadingReal(false);
      }
    };

    puxarJogosDoServidor();
    const timer = setInterval(puxarJogosDoServidor, 30000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // UNIÃO DE TODOS OS DADOS
  // ==========================================
  const jogos = [
    ...(Array.isArray(jogosTempoReal) ? jogosTempoReal : []),
    ...(Array.isArray(jogosSportradar) ? jogosSportradar : []),
    ...(Array.isArray(jogosDoHook) ? jogosDoHook : [])
  ];

  const loading = loadingHook || loadingReal || loadingSportradar;

  const { aiOpen, setAiOpen, aiQuery, setAiQuery, aiLoading, aiMessages, handleAskAI, gerarExplicacaoIA } = useIA(API_URL, jogos, setJogoSelecionado);
  useAlertas(jogos);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const em = localStorage.getItem('bet_sessao_ativa');
    if (em) {
      setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || 'Lucas Montesso', is_vip: true, is_admin: em.includes('admin') });
    } else if (MODO_DEMONSTRACAO) {
      setUserData({ email: 'lucas@vip.com', nome: 'Lucas Montesso', is_vip: true, is_admin: true });
    }
  }, []);

  let jFilt = jogos.filter((j) => {
    const sel = isSelecao(j.home_team, j.away_team, j.league_name);
    if (viewMode === 'jogos' && sel) return false;
    if (viewMode === 'copa' && !sel) return false;
    if (filterCentro === 'Ao Vivo') return j.status === 'Live';
    if (filterCentro === 'Favoritos') return favoritos.includes(j.id);
    if (ligaAtivaId !== null && j.league_id !== ligaAtivaId && j.league_id !== 999) return false;
    return true;
  });

  const jGrp = jFilt.reduce((a, j) => {
    const liga = j.league_name || 'Outros Jogos';
    if (!a[liga]) a[liga] = [];
    a[liga].push(j);
    return a;
  }, {});

  const formatarHorario = (dataISO) => {
    try {
      if (!dataISO) return 'Agendado';
      return new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Agendado';
    }
  };

  const RenderizarListaJogos = () => {
    if (loading && jogos.length === 0) {
      return <div className="text-center text-slate-500 py-10">Buscando radar de jogos oficiais...</div>;
    }

    if (Object.keys(jGrp).length === 0) { 
      return ( 
        <div className="text-center text-slate-500 py-10 font-bold"> 
          Nenhuma oportunidade encontrada no momento. 
          <div className="text-[10px] font-normal mt-2 text-slate-600"> 
            Total carregado: {jogos.length} jogos. Altere o filtro ou verifique se está em Ao Vivo. 
          </div> 
        </div> 
      ); 
    } 

    return Object.entries(jGrp).map(([leagueName, matches]) => ( 
      <div key={leagueName} className="mb-6 w-full"> 
        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div> 
        {matches.map((j) => ( 
          <div key={j.id} onClick={() => { if (!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer relative transition-all hover:border-blue-500/50"> 
            <div className="flex justify-between items-center mb-5"> 
              {j.status === 'Live' ? ( 
                <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> 
              ) : j.status === 'Finished' ? ( 
                <span className="bg-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-300">Fechado</span> 
              ) : ( 
                <span className="text-slate-400 text-[10px] font-bold uppercase">Agendado {formatarHorario(j.starting_at)}</span> 
              )} 
              <button onClick={(e) => { e.stopPropagation(); toggleFavorito(e, j.id); }} className="p-1"> 
                <Star className={`w-5 h-5 ${ favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600' }`} /> 
              </button> 
            </div> 
            
            <div className="grid grid-cols-3 items-center text-center mb-2"> 
              <div className="flex flex-col items-center gap-2"> 
                <img src={j.home_image || logoPadrao} className="w-10 h-10 object-contain" alt="" /> 
                <span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.home_team}</span> 
              </div> 
              <div className="text-2xl font-black text-white"> 
                {j.status === 'Live' || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : '-'} 
              </div> 
              <div className="flex flex-col items-center gap-2"> 
                <img src={j.away_image || logoPadrao} className="w-10 h-10 object-contain" alt="" /> 
                <span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.away_team}</span> 
              </div> 
            </div> 
            
            <div className="mt-4 grid grid-cols-2 gap-2"> 
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 text-center"> 
                <div className="text-[9px] text-blue-300 uppercase font-black">Confiança IA</div> 
                <div className="text-lg font-black text-blue-400">{j.confianca_ia}%</div> 
              </div> 
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center"> 
                <div className="text-[9px] text-emerald-300 uppercase font-black">Odd Base</div> 
                <div className="text-lg font-black text-emerald-400">{j.odd_principal}</div> 
              </div> 
            </div> 
            
            {j.fonte && ( 
              <div className="mt-3 text-[9px] text-slate-600 font-black uppercase tracking-widest">Fonte: {j.fonte}</div> 
            )} 
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black tracking-tight flex items-center"> 
          <span className="italic">BET</span> <span className="text-blue-500">ANALYTICS</span> <span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span> 
        </motion.div> 
      </div> 
    ); 
  } 

  return ( 
    <div className={`min-h-screen font-sans pb-28 w-full max-w-full overflow-x-hidden ${ theme === 'dark' ? 'bg-[#050816] text-white' : 'bg-slate-100 text-slate-900' }`}> 
      <header className={`flex items-center justify-between px-5 py-4 sticky top-0 z-40 border-b ${ theme === 'dark' ? 'bg-[#050816]/95 border-white/5' : 'bg-white/95 border-slate-200' } backdrop-blur-md`}> 
        <h1 className="font-black text-xl tracking-tight flex items-center"> 
          <span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span>
        </h1> 
        <div className="flex items-center gap-3"> 
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full border border-slate-500/30"> 
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />} 
          </button> 
          <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg text-xs"> 
            <Crown className="w-4 h-4" /> VIP 
          </button> 
        </div> 
      </header> 

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

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && ( 
        <div className="animate-fade-in w-full"> 
          {viewMode === 'jogos' && ( 
            <> 
              {userData?.is_vip && <HeroPremium onViewOportunidades={() => setViewMode('radar')} />} 
              <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4"> 
                <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black transition-colors border ${ filterCentro === 'Todos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent border-slate-500 text-slate-500' }`}>Todos</button> 
                <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${ filterCentro === 'Ao Vivo' ? 'bg-red-600 text-white border-red-600' : 'bg-transparent border-slate-500 text-slate-500' }`}>Ao Vivo</button> 
              </div> 
              <div className="px-4"><RenderizarListaJogos /></div> 
            </> 
          )} 
          {viewMode === 'radar' && <div className="px-4 pt-6"><DashboardIA insights={{}} /><RadarMundial jogos={jogos} /></div>} 
          {viewMode === 'copa' && <div className="px-4 pt-6"><CopaStats artilheiros={[]} assistencias={[]} /></div>} 
          
          {viewMode === 'perfil' && ( 
            <div className="px-4 pt-6"> 
              <Suspense fallback={<div className="text-center text-xs text-blue-500 animate-pulse py-10 font-black">A carregar perfil...</div>}> 
                <Perfil 
                  userData={userData || { nome: 'Usuário', email: 'sem-email', is_vip: false, is_admin: false }} 
                  form={form} 
                  setForm={setForm} 
                  nivelUsuario={nivelUsuario()} 
                  xp={xp} 
                  setViewMode={setViewMode} 
                  apostas={apostas} 
                  bancaInicial={bancaInicial} 
                  metaMensal={metaMensal} 
                  setMenuAtivo={setMenuAtivo} 
                /> 
              </Suspense> 
            </div> 
          )} 
        </div> 
      )} 

      {jogoSelecionado && menuAtivo !== 'assinar pro' && ( 
        <div className="px-4 pt-4"> 
          <div className="flex items-center gap-3 mb-4"> 
            <button onClick={() => setJogoSelecionado(null)} className="p-2 bg-slate-800 rounded-full text-white"><ArrowLeft className="w-5 h-5" /></button> 
            <h2 className="text-lg font-black text-slate-400">Voltar</h2> 
          </div> 
          {userData?.is_vip && <ConsensoIA jogo={jogoSelecionado} />} 
          <Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs">A carregar...</div>}> 
            <PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly} /> 
          </Suspense> 
        </div> 
      )} 

      <nav className={`fixed bottom-0 left-0 right-0 h-20 border-t flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] ${ theme === 'dark' ? 'bg-[#050816] border-white/5' : 'bg-white border-slate-200' }`}> 
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${ viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado && menuAtivo !== 'assinar pro' ? 'text-blue-600' : 'text-slate-500' }`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Início</span></button> 
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${ filterCentro === 'Ao Vivo' && !jogoSelecionado && menuAtivo !== 'assinar pro' ? 'text-red-500' : 'text-slate-500' }`}><Radio className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Ao Vivo</span></button> 
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('radar'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${ viewMode === 'radar' && menuAtivo !== 'assinar pro' ? 'text-purple-500' : 'text-slate-500' }`}><Zap className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Radar IA</span></button> 
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('perfil'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${ viewMode === 'perfil' && menuAtivo !== 'assinar pro' ? 'text-blue-500' : 'text-slate-500' }`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Perfil</span></button> 
      </nav> 
    </div> 
  ); 
} 

export default function App() { 
  return ( 
    <ThemeProvider> 
      <AppContent /> 
    </ThemeProvider> 
  ); 
}