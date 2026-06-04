import React, { useState, useEffect, useMemo } from 'react';
import './app.css'; 
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'; 
import { Home, BarChart2, Radio, Trophy, Crown, Star, ChevronRight, Menu, Lock, Search, X } from 'lucide-react';

// ============================================================================
// ⚙️ CONFIGURAÇÕES PRINCIPAIS E MODO DEMONSTRAÇÃO
// ============================================================================
const MODO_DEMONSTRACAO = true; // ⚠️ MUDE PARA 'false' PARA USAR A API REAL PAGA

const API_SPORTS_KEY = "7ff15d43907d5138e48674b29ab56a65";
const EMAILS_VIP_MESTRE = ['admin@nexus.com']; 
initMercadoPago('APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc', { locale: 'pt-BR' });
const API_URL = 'https://betanalitics-1-9stc.onrender.com';

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
const getWeekDays = (b) => Array.from({length: 7}, (_, i) => { const d = new Date(b + "T12:00:00Z"); d.setDate(d.getDate() + i - 3); return { iso: d.toISOString().split('T')[0], nome: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()], dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}` }; });
const generateMomentum = () => Array.from({length: 90}, (_, i) => ({ time: i, pressaoHome: Math.max(0, Math.sin(i/5)*50 + Math.random()*50), pressaoAway: Math.max(0, Math.cos(i/4)*40 + Math.random()*40) }));

const listaLigas = [
  {name:'Todos os Jogos', id: null}, {name:'Serie A', id: 71}, {name:'Liga dos Campeões', id: 2}, {name:'Copa Libertadores', id: 13}, {name:'La Liga', id: 140}, {name:'Premier League', id: 39}, {name:'Copa do Brasil', id: 73}
];

// ============================================================================
// 🗄️ DADOS FICTÍCIOS (MOCK DATA) PARA VISUALIZAÇÃO PREMIUM
// ============================================================================
const mockJogosData = [
  { id: 101, league_id: 71, league_name: 'Brasileirão Série A', starting_at: `${getLocalYYYYMMDD()}T16:00:00`, status: 'Live', time_elapsed: 62, home_team: 'Flamengo', home_id: 127, away_team: 'Palmeiras', away_id: 121, home_image: 'https://media.api-sports.io/football/teams/127.png', away_image: 'https://media.api-sports.io/football/teams/121.png', scoreHome: 2, scoreAway: 1, dados_vip: false },
  { id: 102, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T19:30:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Liverpool', home_id: 40, away_team: 'Man City', away_id: 50, home_image: 'https://media.api-sports.io/football/teams/40.png', away_image: 'https://media.api-sports.io/football/teams/50.png', scoreHome: null, scoreAway: null, dados_vip: false },
  { id: 103, league_id: 140, league_name: 'La Liga', starting_at: `${getLocalYYYYMMDD()}T14:00:00`, status: 'Finished', time_elapsed: 90, home_team: 'Real Madrid', home_id: 541, away_team: 'Barcelona', away_id: 529, home_image: 'https://media.api-sports.io/football/teams/541.png', away_image: 'https://media.api-sports.io/football/teams/529.png', scoreHome: 3, scoreAway: 1, dados_vip: false },
  { id: 104, league_id: 71, league_name: 'Brasileirão Série A', starting_at: `${getLocalYYYYMMDD()}T18:00:00`, status: 'Live', time_elapsed: 15, home_team: 'Corinthians', home_id: 131, away_team: 'São Paulo', away_id: 126, home_image: 'https://media.api-sports.io/football/teams/131.png', away_image: 'https://media.api-sports.io/football/teams/126.png', scoreHome: 0, scoreAway: 0, dados_vip: false },
  { id: 105, league_id: 2, league_name: 'Liga dos Campeões', starting_at: `${getLocalYYYYMMDD()}T21:00:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Bayern Madrid', home_id: 157, away_team: 'Arsenal', away_id: 42, home_image: 'https://media.api-sports.io/football/teams/157.png', away_image: 'https://media.api-sports.io/football/teams/42.png', scoreHome: null, scoreAway: null, dados_vip: false }
];

const mockJogoDetalhes = {
  probs: { h: 55, d: 25, a: 20 },
  advice: "O nosso Algoritmo IA detetou um Valor Esperado (EV+) altíssimo na equipa da casa. Forte pressão ofensiva nos últimos 15 minutos e um H2H extremamente favorável suportam a entrada no 'Back Home' a 1.82.",
  odds: [{value: "Home", odd: "1.82"}, {value: "Draw", odd: "3.60"}, {value: "Away", odd: "4.75"}],
  stats_reais: [{type: "Posse (%)", h: 58, a: 42}, {type: "Remates", h: 12, a: 5}, {type: "Remates à Baliza", h: 6, a: 2}, {type: "Amarelos", h: 2, a: 3}],
  top_jogadores: [{name: "Ataque Matador", rating: "8.5", team_logo: "https://media.api-sports.io/football/teams/127.png"}, {name: "Muralha Def.", rating: "7.8", team_logo: "https://media.api-sports.io/football/teams/121.png"}],
  fH: "WWWDW", fA: "LDWLW",
  h2h: "3 Vit. Casa | 1 Emp | 1 Vit. Fora",
  tatH: "4-3-3", tatA: "4-2-3-1", coachH: "Tite (Master)", coachA: "Abel Ferreira",
  linH: [{player:{number:1, name:"Guarda-Redes"}}, {player:{number:9, name:"Ponta de Lança"}}],
  linA: [{player:{number:1, name:"Guarda-Redes"}}, {player:{number:10, name:"Criativo"}}],
  subsH: [{player:{number:11, name:"Extremo Rápido"}}], subsA: [{player:{number:5, name:"Trinco"}}]
};


// 🔥 MOTOR MATEMÁTICO IA (CÓDIGO ORIGINAL)
const calcularAlgoritmoBetAnalytics = (predData) => {
    if(!predData) return { h: 33, d: 34, a: 33 };
    const getFormScore = (form) => { if(!form) return 1; return form.split('').reduce((acc, char) => acc + (char==='W'?3:char==='D'?1:0), 0); };
    const homeForm = getFormScore(predData.teams?.home?.league?.form); const awayForm = getFormScore(predData.teams?.away?.league?.form);
    const homeGoals = predData.teams?.home?.last_5?.goals?.for?.total || 1; const awayGoals = predData.teams?.away?.last_5?.goals?.for?.total || 1;
    const homeDefesa = predData.teams?.home?.last_5?.goals?.against?.total || 1; const awayDefesa = predData.teams?.away?.last_5?.goals?.against?.total || 1; 

    let homeH2H = 1, awayH2H = 1, drawH2H = 1;
    if(predData.h2h && predData.h2h.length > 0) { predData.h2h.slice(0,5).forEach(m => { if(m.teams.home.winner) homeH2H += 2.5; else if(m.teams.away.winner) awayH2H += 2.5; else drawH2H += 1.5; }); }

    let scoreH = (homeForm * 1.5) + (homeGoals * 2) - (homeDefesa * 0.5) + (homeH2H * 1.2) + 2; 
    let scoreA = (awayForm * 1.5) + (awayGoals * 2) - (awayDefesa * 0.5) + (awayH2H * 1.2);
    let scoreD = ((homeForm + awayForm) / 2.5) + drawH2H; 
    if (Math.abs(scoreH - scoreA) < 4) scoreD *= 1.6; 
    
    scoreH = Math.max(scoreH, 1); scoreA = Math.max(scoreA, 1); scoreD = Math.max(scoreD, 1);
    const total = scoreH + scoreA + scoreD;
    return { h: Math.round((scoreH / total) * 100), d: Math.round((scoreD / total) * 100), a: Math.round((scoreA / total) * 100) };
};

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [jogos, setJogos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [dataFiltro, setDataFiltro] = useState(getLocalYYYYMMDD()); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [showLoginMenu, setShowLoginMenu] = useState(false); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [favoritos, setFavoritos] = useState([]); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 

  const diasSemana = getWeekDays(dataFiltro);

  useEffect(() => { const hR = () => setIsMobile(window.innerWidth <= 1024); window.addEventListener('resize', hR); return () => window.removeEventListener('resize', hR); }, []);
  
  // Login Automático de Teste (Pode remover isto mais tarde)
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) { setUserData({ email: em, is_vip: true }); }
      else if (MODO_DEMONSTRACAO) { setUserData({ email: "demo@vip.com", is_vip: true }); } // Força o VIP para testarmos a interface
  }, []);
  
  useEffect(() => { if (menuAtivo !== "assinar pro") carregarDadosEsporte(false); }, [dataFiltro, ligaAtivaId]);

  const aplicarFiltros = (j, lId) => { 
      if (!j?.length) return setJogos([]); 
      setJogos(j.filter(x => lId === null ? true : x.league_id === lId)); 
  };

  const carregarDadosEsporte = async (forcar = false) => {
    setLoading(true); 

    // === INTERCEÇÃO PARA MODO DEMONSTRAÇÃO ===
    if (MODO_DEMONSTRACAO) {
        setTimeout(() => {
            aplicarFiltros(mockJogosData, ligaAtivaId);
            setLoading(false);
        }, 600); // Finge que demorou 600ms a ligar à API
        return;
    }
    // =========================================

    const CK = `bet_api_${dataFiltro}`; const CTK = `bet_time_${dataFiltro}`;
    if (!forcar) { const ds = localStorage.getItem(CK); const ts = localStorage.getItem(CTK); if (ds && ts && (new Date().getTime() - parseInt(ts) < 1800000)) { aplicarFiltros(JSON.parse(ds), ligaAtivaId); setLoading(false); return; } }
    
    try {
      const res = await axios.get('https://v3.football.api-sports.io/fixtures', { params: { date: dataFiltro, timezone: 'America/Sao_Paulo' }, headers: { 'x-apisports-key': API_SPORTS_KEY } });
      const jF = (res.data?.response||[]).map(f => {
          let st = 'Not Started'; if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(f.fixture.status.short)) st = 'Live'; if (['FT', 'AET', 'PEN'].includes(f.fixture.status.short)) st = 'Finished';
          return { id: f.fixture.id, league_id: f.league.id, league_name: f.league.name, starting_at: f.fixture.date, status: st, time_elapsed: f.fixture.status.elapsed, home_team: f.teams.home.name, home_id: f.teams.home.id, away_team: f.teams.away.name, away_id: f.teams.away.id, home_image: f.teams.home.logo, away_image: f.teams.away.logo, scoreHome: f.goals.home ?? null, scoreAway: f.goals.away ?? null, dados_vip: false };
      });
      localStorage.setItem(CK, JSON.stringify(jF)); localStorage.setItem(CTK, new Date().getTime().toString()); aplicarFiltros(jF, ligaAtivaId); 
    } catch (e) {} finally { setLoading(false); }
  };

  const abrirPainelDoJogo = async (j) => {
    if(!userData?.is_vip) return setMenuAtivo('assinar pro');
    if (j.dados_vip) return setJogoSelecionado(j); 
    setJogoSelecionado({ ...j, is_loading: true });

    // === INTERCEÇÃO PARA MODO DEMONSTRAÇÃO ===
    if (MODO_DEMONSTRACAO) {
        setTimeout(() => {
            const jU = { ...j, ...mockJogoDetalhes, dados_vip: true, is_loading: false };
            setJogos(pJ => pJ.map(o => o.id === j.id ? jU : o));
            setJogoSelecionado(jU);
        }, 800); // Finge que demorou a calcular o algoritmo IA
        return;
    }
    // =========================================

    try {
      const HDR = { 'x-apisports-key': API_SPORTS_KEY }; const PRM = { fixture: j.id }; 
      const res = await Promise.all([ axios.get('https://v3.football.api-sports.io/predictions',{params:PRM,headers:HDR}).catch(()=>({data:{response:[]}})) ]);
      const dP = res[0].data?.response?.[0]||null; 
      const probabilidadeReal = calcularAlgoritmoBetAnalytics(dP);
      const jU = { ...j, dados_vip: true, is_loading: false, probs: probabilidadeReal, advice: dP?.predictions?.advice||"-" };
      setJogos(pJ => { const nJ = pJ.map(o => o.id === j.id ? jU : o); localStorage.setItem(`bet_api_${dataFiltro}`, JSON.stringify(nJ)); return nJ; }); setJogoSelecionado(jU);
    } catch (e) { setJogoSelecionado({ ...j, is_loading: false, err: true, dados_vip: true }); }
  };

  const toggleFavorito = (e, id) => { e.stopPropagation(); setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]); };

  let jFilt = (jogos||[]).filter(j => { 
      if(filterCentro === 'Ao Vivo') return j.status==='Live';
      if(filterCentro === 'Favoritos') return favoritos.includes(j.id);
      return true; 
  }).sort((a,b) => new Date(a.starting_at||0) - new Date(b.starting_at||0));
  
  const jGrp = jFilt.reduce((a, j) => { if (!a[j.league_name]) a[j.league_name] = []; a[j.league_name].push(j); return a; }, {});

  return (
    <div className="min-h-screen bg-app text-white font-sans pb-24">
      
      {/* HEADER PREMIUM */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-slate-300" />
          <h1 className="font-black text-2xl tracking-tight flex items-center">
            <span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span>
            <span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span>
          </h1>
        </div>
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg shadow-yellow-500/20 transition-all">
          <Crown className="w-4 h-4" /> {userData?.is_vip ? "VIP ATIVO" : "VIP"}
        </button>
      </header>

      {/* LIGAS NO TOPO (SCROLL HORIZONTAL) */}
      {viewMode === 'jogos' && !jogoSelecionado && menuAtivo !== 'assinar pro' && (
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
          {listaLigas.map(l => (
              <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-panel border-slate-800 text-slate-400'}`}>
                  {l.name}
              </button>
          ))}
      </div>
      )}

      {viewMode === 'jogos' && !jogoSelecionado && menuAtivo !== 'assinar pro' && (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
            
            {/* VIP BANNER (Só mostra se não for VIP) */}
            {!userData?.is_vip && (
                <motion.div animate={{ scale:[1,1.01,1] }} transition={{ repeat:Infinity, duration:3 }} className="mx-4 mb-6 p-6 rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-500 shadow-2xl relative overflow-hidden border border-blue-400/30">
                <div className="absolute -right-4 -top-4 opacity-20"><Crown className="w-32 h-32" /></div>
                <div className="relative z-10">
                    <Crown className="w-10 h-10 text-yellow-400 mb-2" />
                    <h2 className="text-2xl font-black text-white leading-tight">Seja PRO. Seja <br/><span className="text-yellow-400">LUCRATIVO.</span></h2>
                    <p className="text-blue-100 text-xs mt-2 max-w-[80%]">Desbloqueie análises exclusivas, odds inteligentes e muito mais!</p>
                    <button onClick={() => setMenuAtivo('assinar pro')} className="mt-5 bg-yellow-400 text-black font-black px-5 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform">
                        ASSINAR AGORA <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                </motion.div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-4 gap-3 px-4 mb-6">
                <div className="bg-panel rounded-3xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
                    <div className="text-2xl font-black text-blue-500">{jogos.length}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 text-center">Jogos Hoje</div>
                </div>
                <div className="bg-panel rounded-3xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
                    <div className="text-2xl font-black text-red-500">{jogos.filter(j => j.status === 'Live').length}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 text-center">Ao Vivo</div>
                </div>
                <div className="bg-panel rounded-3xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
                    <div className="text-2xl font-black text-yellow-500">{favoritos.length}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 text-center">Favoritos</div>
                </div>
                <div className="bg-panel rounded-3xl p-4 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
                    <div className="text-2xl font-black text-green-500">87<span className="text-sm">%</span></div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 text-center">Precisão IA</div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar">
                <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterCentro==='Todos' ? 'bg-blue-600 text-white' : 'bg-panel border border-slate-800 text-slate-400'}`}>Todos</button>
                <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${filterCentro==='Ao Vivo' ? 'bg-panel border border-red-500 text-white' : 'bg-panel border border-slate-800 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                <button onClick={() => setFilterCentro('Favoritos')} className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${filterCentro==='Favoritos' ? 'bg-panel border border-yellow-500 text-white' : 'bg-panel border border-slate-800 text-slate-400'}`}><Star className="w-3 h-3 fill-yellow-500 text-yellow-500"/> Favoritos</button>
            </div>

            {/* MATCHES LIST */}
            <div className="px-4">
                <div className="flex items-center justify-between mb-4 mt-2">
                    <h3 className="font-bold flex items-center gap-2 text-lg"><span className="text-2xl">⚽</span> Jogos de Hoje</h3>
                    <span className="text-blue-500 text-sm font-semibold flex items-center cursor-pointer">Ver todos <ChevronRight className="w-4 h-4"/></span>
                </div>

                {loading ? <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div> : 
                 Object.entries(jGrp).map(([leagueName, matches]) => (
                    <div key={leagueName} className="mb-6">
                        {matches.map(j => {
                            const isLive = j.status === 'Live';
                            const isFav = favoritos.includes(j.id);
                            return (
                                <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-panel rounded-3xl p-4 border border-slate-800 shadow-xl mb-4 hover:border-blue-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                                    {/* Header Match */}
                                    <div className="flex justify-between items-center mb-4">
                                        {isLive ? (
                                            <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-lg shadow-red-500/20 animate-pulse">🔴 AO VIVO {j.time_elapsed}'</span>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-bold">{j.status === 'Finished' ? 'FINALIZADO' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>
                                        )}
                                        <span className="text-slate-500 text-xs font-semibold truncate max-w-[50%] text-center">{leagueName}</span>
                                        <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1 z-10 relative">
                                            <Star className={`w-5 h-5 transition-colors ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                        </button>
                                    </div>

                                    {/* Teams & Score */}
                                    <div className="grid grid-cols-3 items-center text-center mb-5">
                                        <div className="flex flex-col items-center gap-2">
                                            <img src={j.home_image} className="w-10 h-10 object-contain drop-shadow-md" alt={j.home_team} />
                                            <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">{j.home_team}</span>
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter">
                                            {isLive || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600 text-xl">-</span>}
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <img src={j.away_image} className="w-10 h-10 object-contain drop-shadow-md" alt={j.away_team} />
                                            <span className="text-[11px] font-bold text-slate-200 line-clamp-1 w-full">{j.away_team}</span>
                                        </div>
                                    </div>

                                    {/* Odds / Unlock */}
                                    {!userData?.is_vip ? (
                                        <button onClick={(e) => { e.stopPropagation(); setMenuAtivo('assinar pro'); }} className="w-full bg-slate-800/40 rounded-2xl py-3 text-xs font-bold text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-colors">
                                            <Crown className="w-4 h-4 text-yellow-500" /> Desbloquear Análise IA
                                        </button>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-slate-800/50 rounded-xl py-2 flex flex-col items-center justify-center border border-slate-700 hover:bg-blue-600/20 hover:border-blue-500 transition-colors">
                                                <span className="text-[10px] text-slate-500 mb-0.5">Casa</span>
                                                <span className="font-bold text-sm text-blue-400">1.82</span>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-xl py-2 flex flex-col items-center justify-center border border-slate-700 hover:bg-blue-600/20 hover:border-blue-500 transition-colors">
                                                <span className="text-[10px] text-slate-500 mb-0.5">Empate</span>
                                                <span className="font-bold text-sm text-slate-300">3.60</span>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-xl py-2 flex flex-col items-center justify-center border border-slate-700 hover:bg-blue-600/20 hover:border-blue-500 transition-colors">
                                                <span className="text-[10px] text-slate-500 mb-0.5">Fora</span>
                                                <span className="font-bold text-sm text-yellow-400">4.75</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
      )}

      {/* TELA DE JOGO ABERTO (MODO VIP ATIVO) */}
      {jogoSelecionado && !jogoSelecionado.is_loading && menuAtivo !== 'assinar pro' && (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4">
            <button onClick={() => setJogoSelecionado(null)} className="text-slate-400 text-sm font-bold flex items-center gap-1 mb-4 bg-panel border border-slate-800 px-4 py-2 rounded-xl"><X className="w-5 h-5"/> Fechar Jogo</button>
            
            <div className="bg-panel rounded-3xl p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col items-center w-1/3">
                        <img src={jogoSelecionado.home_image} className="w-14 h-14 mb-2" alt=""/>
                        <span className="font-bold text-xs text-center">{jogoSelecionado.home_team}</span>
                    </div>
                    <div className="w-1/3 text-center">
                        <div className="text-3xl font-black mb-1">{jogoSelecionado.status === 'Not Started' ? 'VS' : `${jogoSelecionado.scoreHome} - ${jogoSelecionado.scoreAway}`}</div>
                        <span className="text-[10px] text-red-500 font-bold">{jogoSelecionado.time_elapsed}' MIN</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <img src={jogoSelecionado.away_image} className="w-14 h-14 mb-2" alt=""/>
                        <span className="font-bold text-xs text-center">{jogoSelecionado.away_team}</span>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-black text-sm text-yellow-500">PARECER DA INTELIGÊNCIA ARTIFICIAL</h4>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{jogoSelecionado.advice}</p>
                </div>
            </div>

            <div className="bg-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
                <h4 className="font-black text-sm mb-4">ESTATÍSTICAS EM TEMPO REAL</h4>
                {jogoSelecionado.stats_reais?.map((s,i) => {
                    const total = s.h + s.a; const pH = total > 0 ? (s.h/total)*100 : 50; const pA = total > 0 ? (s.a/total)*100 : 50;
                    return (
                        <div key={i} className="mb-4">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className={pH>=pA ? 'text-blue-400' : 'text-slate-500'}>{s.h}</span>
                                <span className="text-slate-500">{s.type}</span>
                                <span className={pA>=pH ? 'text-yellow-400' : 'text-slate-500'}>{s.a}</span>
                            </div>
                            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-800">
                                <div style={{width: `${pH}%`}} className="bg-blue-500 rounded-r-full"></div>
                                <div style={{width: `${pA}%`}} className="bg-yellow-500 rounded-l-full"></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </motion.div>
      )}

      {/* SKELETON LOADING PARA O JOGO */}
      {jogoSelecionado?.is_loading && (
          <div className="px-4 py-10 flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-500 font-bold animate-pulse">A calcular probabilidades IA...</p>
          </div>
      )}

      {/* TELA DE CHECKOUT VIP PRO - TOTALMENTE TAILWIND */}
      {menuAtivo === "assinar pro" && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="px-4 pt-4">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setMenuAtivo('Todos os Jogos')} className="text-slate-400 text-sm font-bold flex items-center gap-1"><X className="w-5 h-5"/> Fechar</button>
                 <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg text-xs font-black tracking-wide">PLANO PRO</span>
             </div>
             
             <div className="bg-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
                <Crown className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Checkout VIP 👑</h2>
                <p className="text-slate-400 text-xs mb-6">Acesso imediato ao Algoritmo BetAnalytics e probabilidades exclusivas.</p>
                
                <div className="flex flex-col gap-4">
                    <input placeholder="Nome Completo" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors" />
                    <input placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors" />
                    <input placeholder="CPF (Só números)" maxLength={11} value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value.replace(/\D/g, '')})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors" />
                    
                    <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all">
                        ⚡ PAGAR 29,90€ COM PIX
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all">
                        💳 Cartão de Crédito
                    </button>
                </div>
             </div>
         </motion.div>
      )}

      {/* BOTTOM NAVIGATION PREMIUM */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-panel/95 border-t border-slate-800 flex justify-around items-center backdrop-blur-xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setMenuAtivo('Todos os Jogos'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && menuAtivo === 'Todos os Jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Início</span>
        </button>

        <button onClick={() => {setViewMode('blog'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'blog' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold">Análises</span>
        </button>

        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setMenuAtivo('Todos os Jogos'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <div className="relative">
            <Radio className="w-6 h-6" />
            {filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          </div>
          <span className="text-[10px] font-bold">Ao Vivo</span>
        </button>

        <button onClick={() => {setMenuAtivo('assinar pro'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${menuAtivo === 'assinar pro' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}>
          <Crown className="w-6 h-6" />
          <span className="text-[10px] font-bold">VIP</span>
        </button>

      </nav>

    </div>
  );
}