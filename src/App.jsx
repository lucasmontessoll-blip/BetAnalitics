import React, { useState, useEffect, useMemo } from 'react';
import './app.css'; 
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'; 
import { Home, BarChart2, Radio, Trophy, Crown, Star, ChevronRight, Menu, X, User, Zap, TrendingUp, Crosshair, Bell, Globe, Calendar, DollarSign, Activity, ShieldAlert } from 'lucide-react';

// ============================================================================
// ⚙️ CONFIGURAÇÕES PRINCIPAIS E MODO DEMONSTRAÇÃO
// ============================================================================
const MODO_DEMONSTRACAO = true; 

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
// 🗄️ DADOS FICTÍCIOS (MOCK DATA PARA O NOVO DESIGN)
// ============================================================================
const precisionData = [ {dia:"Seg", valor:81}, {dia:"Ter", valor:83}, {dia:"Qua", valor:79}, {dia:"Qui", valor:87}, {dia:"Sex", valor:85}, {dia:"Sab", valor:89}, {dia:"Dom", valor:87} ];
const rankingIAData = [ { team: "Flamengo", score: 92 }, { team: "Liverpool", score: 89 }, { team: "Real Madrid", score: 88 }, { team: "Arsenal", score: 85 }, { team: "Man City", score: 84 } ];
const alertsData = [ "Flamengo atingiu 92% de EV+", "Liverpool subiu para 89% após lesão do redes adversário", "2 novas oportunidades de Over 2.5 encontradas" ];

const mockJogosData = [
  { id: 101, league_id: 71, league_name: 'Brasileirão Série A', starting_at: `${getLocalYYYYMMDD()}T16:00:00`, status: 'Live', time_elapsed: 62, home_team: 'Flamengo', home_id: 127, away_team: 'Palmeiras', away_id: 121, home_image: 'https://media.api-sports.io/football/teams/127.png', away_image: 'https://media.api-sports.io/football/teams/121.png', scoreHome: 2, scoreAway: 1, dados_vip: false },
  { id: 102, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T19:30:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Liverpool', home_id: 40, away_team: 'Man City', away_id: 50, home_image: 'https://media.api-sports.io/football/teams/40.png', away_image: 'https://media.api-sports.io/football/teams/50.png', scoreHome: null, scoreAway: null, dados_vip: false },
  { id: 103, league_id: 140, league_name: 'La Liga', starting_at: `${getLocalYYYYMMDD()}T14:00:00`, status: 'Finished', time_elapsed: 90, home_team: 'Real Madrid', home_id: 541, away_team: 'Barcelona', away_id: 529, home_image: 'https://media.api-sports.io/football/teams/541.png', away_image: 'https://media.api-sports.io/football/teams/529.png', scoreHome: 3, scoreAway: 1, dados_vip: false }
];

const mockJogoDetalhes = {
  probs: { h: 55, d: 25, a: 20 },
  advice: "O nosso Algoritmo IA detetou um Valor Esperado (EV+) altíssimo na equipa da casa. Forte pressão ofensiva nos últimos 15 minutos suportam a entrada no 'Back Home' a 1.82.",
  odds: [{value: "Home", odd: "1.82"}, {value: "Draw", odd: "3.60"}, {value: "Away", odd: "4.75"}],
  stats_reais: [{type: "Posse (%)", h: 58, a: 42}, {type: "Remates", h: 12, a: 5}, {type: "Remates à Baliza", h: 6, a: 2}, {type: "Amarelos", h: 2, a: 3}],
  top_jogadores: [{name: "Ataque Matador", rating: "8.5", team_logo: "https://media.api-sports.io/football/teams/127.png"}, {name: "Muralha Def.", rating: "7.8", team_logo: "https://media.api-sports.io/football/teams/121.png"}],
  fH: "WWWDW", fA: "LDWLW", h2h: "3 Vit. Casa | 1 Emp | 1 Vit. Fora", tatH: "4-3-3", tatA: "4-2-3-1", coachH: "Tite", coachA: "Abel Ferreira", linH: [], linA: [], subsH: [], subsA: []
};

// 🔥 MOTOR MATEMÁTICO IA
const calcularAlgoritmoBetAnalytics = (predData) => {
    if(!predData) return { h: 33, d: 34, a: 33 };
    const getFormScore = (form) => { if(!form) return 1; return form.split('').reduce((acc, char) => acc + (char==='W'?3:char==='D'?1:0), 0); };
    let scoreH = (getFormScore(predData.teams?.home?.league?.form) * 1.5) + ((predData.teams?.home?.last_5?.goals?.for?.total || 1) * 2) - ((predData.teams?.home?.last_5?.goals?.against?.total || 1) * 0.5) + 2; 
    let scoreA = (getFormScore(predData.teams?.away?.league?.form) * 1.5) + ((predData.teams?.away?.last_5?.goals?.for?.total || 1) * 2) - ((predData.teams?.away?.last_5?.goals?.against?.total || 1) * 0.5);
    let scoreD = ((scoreH + scoreA) / 2.5); 
    scoreH = Math.max(scoreH, 1); scoreA = Math.max(scoreA, 1); scoreD = Math.max(scoreD, 1);
    const total = scoreH + scoreA + scoreD;
    return { h: Math.round((scoreH / total) * 100), d: Math.round((scoreD / total) * 100), a: Math.round((scoreA / total) * 100) };
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [jogos, setJogos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [dataFiltro, setDataFiltro] = useState(getLocalYYYYMMDD()); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [favoritos, setFavoritos] = useState([]); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  const diasSemana = getWeekDays(dataFiltro);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) { setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas", is_vip: true }); }
      else if (MODO_DEMONSTRACAO) { setUserData({ email: "demo@vip.com", nome: "Lucas", is_vip: true }); } 
  }, []);
  
  useEffect(() => { if (menuAtivo !== "assinar pro") carregarDadosEsporte(false); }, [dataFiltro, ligaAtivaId]);

  const aplicarFiltros = (j, lId) => { 
      if (!j?.length) return setJogos([]); 
      setJogos(j.filter(x => lId === null ? true : x.league_id === lId)); 
  };

  const carregarDadosEsporte = async (forcar = false) => {
    setLoading(true); 
    if (MODO_DEMONSTRACAO) { setTimeout(() => { aplicarFiltros(mockJogosData, ligaAtivaId); setLoading(false); }, 600); return; }
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

    if (MODO_DEMONSTRACAO) {
        setTimeout(() => { const jU = { ...j, ...mockJogoDetalhes, dados_vip: true, is_loading: false }; setJogos(pJ => pJ.map(o => o.id === j.id ? jU : o)); setJogoSelecionado(jU); }, 800); 
        return;
    }

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

  // ============================================================================
  // COMPONENTES DE INTERFACE PREMIUM (TAILWIND GLASSMORPHISM)
  // ============================================================================
  const BestOpportunity = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border-2 border-yellow-500 rounded-3xl p-6 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden mx-4">
      <div className="text-[10px] font-black text-red-500 bg-red-500/20 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 mb-4 animate-pulse uppercase tracking-wider"><ShieldAlert className="w-3 h-3"/> MELHOR OPORTUNIDADE DO DIA</div>
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Flamengo x Palmeiras</h2>
      <div className="text-6xl font-black text-green-400 mb-1 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)] tracking-tighter">92%</div>
      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-5">Confiança Muito Alta</div>
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-5">
         <span className="text-yellow-400 font-bold text-sm flex items-center gap-2">🔥 Recomendação: Vitória Flamengo</span>
      </div>
      <button onClick={() => abrirPainelDoJogo(mockJogosData[0])} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2">Ver Análise Completa <ChevronRight className="w-4 h-4"/></button>
    </div>
  );

  const RankingIA = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4">
      <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> Ranking IA</h2>
      <div className="flex flex-col gap-1">
      {rankingIAData.map((item, index) => (
        <div key={index} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
          <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${index===0?'bg-yellow-500/20 text-yellow-500':index===1?'bg-slate-300/20 text-slate-300':index===2?'bg-orange-500/20 text-orange-500':'bg-slate-800 text-slate-500'}`}>#{index + 1}</span>
              <span className="text-sm font-bold text-white">{item.team}</span>
          </div>
          <strong className="text-green-400 font-black">{item.score}%</strong>
        </div>
      ))}
      </div>
    </div>
  );

  const TeamComparison = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4 mt-6">
      <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/> Comparação de Força</h2>
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ataque (xG)</p>
        <div className="h-8 bg-slate-800 rounded-full overflow-hidden mb-2.5 relative border border-white/5"><div style={{width:"90%"}} className="h-full bg-blue-600 flex items-center pl-4 text-white text-xs font-bold shadow-[0_0_10px_rgba(37,99,235,0.8)]">Flamengo 90</div></div>
        <div className="h-8 bg-slate-800 rounded-full overflow-hidden mb-2.5 relative border border-white/5"><div style={{width:"76%"}} className="h-full bg-slate-600 flex items-center pl-4 text-white text-xs font-bold">Palmeiras 76</div></div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Defesa (xGA)</p>
        <div className="h-8 bg-slate-800 rounded-full overflow-hidden mb-2.5 relative border border-white/5"><div style={{width:"82%"}} className="h-full bg-blue-600 flex items-center pl-4 text-white text-xs font-bold shadow-[0_0_10px_rgba(37,99,235,0.8)]">Flamengo 82</div></div>
        <div className="h-8 bg-slate-800 rounded-full overflow-hidden mb-2.5 relative border border-white/5"><div style={{width:"74%"}} className="h-full bg-slate-600 flex items-center pl-4 text-white text-xs font-bold">Palmeiras 74</div></div>
      </div>
    </div>
  );

  const AiCenter = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-blue-500/30 rounded-3xl p-6 mb-6 shadow-[0_0_30px_rgba(37,99,235,0.1)] mx-4 relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 opacity-10"><Zap className="w-40 h-40 text-blue-500" /></div>
      <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2 relative z-10"><Zap className="w-5 h-5 text-blue-500"/> IA CENTER</h2>
      <div className="flex flex-col gap-3 relative z-10">
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Jogos analisados hoje</span><strong className="text-white">1520</strong></div>
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Precisão Geral</span><strong className="text-green-400 font-black">87%</strong></div>
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Top Pick Global</span><strong className="text-yellow-400 font-black">Flamengo</strong></div>
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Última atualização</span><strong className="text-white text-xs">AGORA MESMO</strong></div>
      </div>
    </div>
  );

  const AlertsPanel = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4">
      <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-yellow-500"/> Alertas Inteligentes</h2>
      <div className="flex flex-col gap-2">
      {alertsData.map((alert,index)=>(
        <div key={index} className="p-3.5 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/5 font-semibold flex gap-3 items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> {alert}
        </div>
      ))}
      </div>
    </div>
  );

  const FavoritesSmart = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4">
      <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Star className="w-5 h-5 fill-yellow-500 text-yellow-500"/> Favoritos Inteligentes</h2>
      <div className="mb-4">
        <div className="font-bold text-sm text-white mb-1">Flamengo x Palmeiras</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confiança IA: <strong className="text-green-400 text-sm">92%</strong></div>
      </div>
      <hr className="border-white/10 my-4" />
      <div>
        <div className="font-bold text-sm text-white mb-1">Liverpool x Arsenal</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confiança IA: <strong className="text-green-400 text-sm">89%</strong></div>
      </div>
    </div>
  );

  const WorldRadar = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4">
      <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400"/> Radar Mundial</h2>
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-black text-white">12</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Brasil</div></div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-black text-white">8</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Inglaterra</div></div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-black text-white">5</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Espanha</div></div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-black text-white">4</div><div className="text-[9px] text-slate-400 font-bold uppercase mt-1">Argentina</div></div>
      </div>
    </div>
  );

  const SmartCalendar = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4">
      <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400"/> Próximos Dias</h2>
      <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-sm font-bold text-white">Hoje</span><strong className="text-blue-400">5 jogos</strong></div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-sm font-bold text-slate-300">Amanhã</span><strong className="text-slate-300">12 jogos</strong></div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-sm font-bold text-slate-300">Sábado</span><strong className="text-slate-300">27 jogos</strong></div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-sm font-bold text-slate-300">Domingo</span><strong className="text-slate-300">31 jogos</strong></div>
      </div>
    </div>
  );

  const Bankroll = () => (
    <div className="backdrop-blur-xl bg-slate-900/85 border border-green-500/30 rounded-3xl p-6 mb-8 shadow-lg mx-4 relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 opacity-10"><DollarSign className="w-32 h-32 text-green-500" /></div>
      <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2 relative z-10"><DollarSign className="w-5 h-5 text-green-500"/> Gestão de Banca</h2>
      <div className="flex flex-col gap-3 relative z-10">
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Saldo Inicial</span><strong className="text-slate-300">R$ 1.000,00</strong></div>
          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5"><span className="text-xs text-slate-400 font-bold">Saldo Atual</span><strong className="text-white text-lg">R$ 1.285,00</strong></div>
          <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-xl border border-green-500/20 mt-1"><span className="text-xs text-green-400 font-black uppercase">ROI Total</span><strong className="text-green-400 font-black text-xl">+28.5%</strong></div>
      </div>
    </div>
  );

  // TELA DE CARREGAMENTO INICIAL
  if (showSplash) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white">
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-6xl mb-4">⚽</motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-2xl font-black tracking-tight flex items-center">
            <span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span>
            <span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span>
         </motion.div>
         <p className="mt-4 text-slate-500 text-xs animate-pulse font-bold tracking-widest uppercase">Carregando inteligência...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans pb-28">
      
      {/* HEADER PREMIUM */}
      <header className="flex items-center justify-between px-5 py-4 backdrop-blur-md bg-[#050816]/80 sticky top-0 z-40 border-b border-white/5">
        <h1 className="font-black text-2xl tracking-tight flex items-center">
            <span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span>
            <span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span>
        </h1>
        {/* VIP ATIVO ESTILIZADO */}
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-3 py-1.5 rounded-xl flex flex-col items-center shadow-lg shadow-yellow-500/20 transition-all border border-yellow-300">
          <div className="flex items-center gap-1 text-sm"><Crown className="w-4 h-4" /> {userData?.is_vip ? "VIP ATIVO" : "VIP"}</div>
          {userData?.is_vip && <span className="text-[8px] font-black opacity-80 uppercase tracking-wider">Expira em 27 dias</span>}
        </button>
      </header>

      {/* RENDERIZAÇÃO DAS ABAS PRINCIPAIS */}
      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4">
              
              {/* === ABA INÍCIO (JOGOS E FUNIL DE CONVERSÃO) === */}
              {viewMode === 'jogos' && (
                  <>
                    {/* 1. HERO PREMIUM */}
                    {userData?.is_vip && (
                        <div className="mx-4 mb-6 rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_30px_rgba(13,110,253,0.3)] flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-2"><Crown className="w-5 h-5 text-yellow-400"/> IA Premium</h2>
                            <p className="text-blue-100 text-xs mt-1"><strong>87%</strong> de precisão hoje</p>
                            <p className="text-blue-100 text-xs mt-1"><strong>{jogos.length}</strong> jogos analisados</p>
                            <p className="text-yellow-300 text-xs font-bold mt-1"><strong>2</strong> oportunidades encontradas</p>
                        </div>
                        <button className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-4 py-3 rounded-xl transition-all uppercase tracking-wider">
                            VER ANÁLISES
                        </button>
                        </div>
                    )}

                    {/* 2. MELHOR OPORTUNIDADE DO DIA */}
                    <BestOpportunity />

                    {/* 3. GRÁFICO IA */}
                    <div className="mx-4 mb-6 rounded-3xl p-5 backdrop-blur-xl bg-slate-900/85 border border-white/10 shadow-lg">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-blue-500"/> Evolução da Precisão IA</h3>
                        <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={precisionData}>
                            <XAxis dataKey="dia" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}/>
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                            <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={4} dot={{r:4, fill:"#3b82f6", stroke:"#fff", strokeWidth:2}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 4. RANKING IA */}
                    <RankingIA />

                    {/* 5. ALERTAS IA */}
                    <AlertsPanel />

                    {/* 6. JOGOS (Filtros + Lista) */}
                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-2">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-transparent border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-transparent border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-transparent border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>

                    <div className="px-4">
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <h3 className="font-black flex items-center gap-2 text-xl"><span className="text-2xl">⚽</span> Jogos de Hoje</h3>
                            <span className="text-blue-500 text-xs font-bold uppercase tracking-wider flex items-center cursor-pointer">Ver todos <ChevronRight className="w-4 h-4"/></span>
                        </div>

                        {loading ? <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div> : 
                        Object.entries(jGrp).map(([leagueName, matches]) => (
                            <div key={leagueName} className="mb-6">
                                {matches.map(j => {
                                    const isLive = j.status === 'Live';
                                    const isFav = favoritos.includes(j.id);
                                    const randomConf = Math.floor(Math.random() * (95 - 75 + 1) + 75); 
                                    return (
                                        <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="backdrop-blur-xl bg-slate-900/85 border border-white/10 rounded-3xl p-5 shadow-xl mb-4 cursor-pointer relative overflow-hidden transition-all hover:border-blue-500/50">
                                            
                                            <div className="flex justify-between items-center mb-5">
                                                {isLive ? (
                                                    <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-lg shadow-red-500/20 animate-pulse uppercase">🔴 Ao Vivo {j.time_elapsed}'</span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{j.status === 'Finished' ? 'Finalizado' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>
                                                )}
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate max-w-[50%] text-center">{leagueName}</span>
                                                <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1 z-10 relative">
                                                    <Star className={`w-5 h-5 transition-colors ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 items-center text-center mb-5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <img src={j.home_image} className="w-12 h-12 object-contain drop-shadow-lg" alt={j.home_team} />
                                                    <span className="text-xs font-bold text-slate-200 line-clamp-1 w-full">{j.home_team}</span>
                                                </div>
                                                <div className="text-4xl font-black tracking-tighter">
                                                    {isLive || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600 text-2xl">-</span>}
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <img src={j.away_image} className="w-12 h-12 object-contain drop-shadow-lg" alt={j.away_team} />
                                                    <span className="text-xs font-bold text-slate-200 line-clamp-1 w-full">{j.away_team}</span>
                                                </div>
                                            </div>

                                            {userData?.is_vip ? (
                                                <>
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                                                        <span className="text-[11px] font-black text-green-400 uppercase">🟢 {randomConf}% Confiança</span>
                                                        <span className="text-[10px] text-slate-300 font-bold">IA Recomenda: <strong className="text-white">Vitória {j.home_team}</strong></span>
                                                    </div>

                                                    {isLive && (
                                                        <div className="flex justify-between items-center text-[9px] text-slate-400 bg-[#050816] rounded-xl p-3 mb-4 border border-white/5">
                                                            <div className="flex flex-col items-center gap-1 uppercase font-bold tracking-wider"><span>Posse</span><strong className="text-white text-[11px]">62% - 38%</strong></div>
                                                            <div className="flex flex-col items-center gap-1 uppercase font-bold tracking-wider"><span>Remates</span><strong className="text-white text-[11px]">12 - 7</strong></div>
                                                            <div className="flex flex-col items-center gap-1 uppercase font-bold tracking-wider"><span>Cantos</span><strong className="text-white text-[11px]">8 - 4</strong></div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        {['1.82', '3.60', '4.75'].map((odd, idx) => (
                                                            <button key={idx} className="bg-[#050816] rounded-xl py-3 flex flex-col items-center justify-center border border-white/5 hover:bg-blue-600 hover:border-blue-500 transition-colors">
                                                                <span className="text-[10px] text-slate-500 mb-0.5 font-bold">{idx===0?'1':idx===1?'X':'2'}</span>
                                                                <span className="font-black text-base text-white">{odd}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); setMenuAtivo('assinar pro'); }} className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-4 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-colors mt-2">
                                                    <Crown className="w-4 h-4 text-yellow-500" /> Desbloquear Análise e Estatísticas IA
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    {/* 7. COMPARAÇÃO DOS TIMES */}
                    <TeamComparison />

                    {/* 8. IA CENTER */}
                    <AiCenter />

                    {/* 9. FAVORITOS SMART */}
                    <FavoritesSmart />

                    {/* 10. RADAR MUNDIAL */}
                    <WorldRadar />

                    {/* 11. CALENDÁRIO */}
                    <SmartCalendar />

                    {/* 12. GESTÃO DE BANCA */}
                    <Bankroll />
                  </>
              )}

              {/* === ABA RANKING === */}
              {viewMode === 'ranking' && (
                  <div className="px-4">
                      <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500"/> Top Oportunidades</h2>
                      <div className="flex flex-col gap-3">
                          {[ {rank: 1, team: "Flamengo", conf: 92, match: "FLA x PAL"}, {rank: 2, team: "Real Madrid", conf: 89, match: "RMA x BAR"}, {rank: 3, team: "Liverpool", conf: 85, match: "LIV x MCI"}, {rank: 4, team: "Bayern Munich", conf: 81, match: "BAY x ARS"} ].map(item => (
                              <div key={item.rank} className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-lg">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-2 ${item.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : item.rank === 2 ? 'bg-slate-400/20 text-slate-300 border-slate-400/50' : 'bg-orange-700/20 text-orange-400 border-orange-700/50'}`}>{item.rank}</div>
                                      <div>
                                          <div className="font-black text-base text-white">{item.team}</div>
                                          <div className="text-[11px] text-slate-400 mt-1 font-bold">{item.match}</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-2xl font-black text-green-400">{item.conf}%</div>
                                      <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Confiança</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* === ABA PERFIL === */}
              {viewMode === 'perfil' && (
                  <div className="px-4">
                      <h2 className="text-xl font-black mb-6 flex items-center gap-2"><User className="w-6 h-6 text-blue-500"/> Meu Perfil</h2>
                      
                      <div className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                              <User className="w-10 h-10 text-white"/>
                          </div>
                          <h2 className="text-xl font-black text-white mb-1">👤 {form.nome || userData?.nome || "Lucas"}</h2>
                          
                          {userData?.is_vip ? (
                            <div className="text-[10px] font-black tracking-widest text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 mb-6">PLANO VIP PRO ATIVO</div>
                          ) : (
                            <div className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 mb-6">PLANO GRATUITO</div>
                          )}
                          
                          <div className="grid grid-cols-3 gap-3 w-full">
                              <div className="bg-[#050816] p-4 rounded-2xl border border-white/5">
                                  <div className="text-xl font-black text-blue-400">1250</div>
                                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Análises</div>
                              </div>
                              <div className="bg-[#050816] p-4 rounded-2xl border border-white/5">
                                  <div className="text-xl font-black text-yellow-400">{favoritos.length}</div>
                                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Favoritos</div>
                              </div>
                              <div className="bg-[#050816] p-4 rounded-2xl border border-white/5">
                                  <div className="text-xl font-black text-green-400">84%</div>
                                  <div className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Precisão</div>
                              </div>
                          </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3">
                          <button className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-5 rounded-2xl text-sm font-bold text-left flex justify-between items-center">
                              Configurações da Conta <ChevronRight className="w-5 h-5 text-slate-500"/>
                          </button>
                          <button className="backdrop-blur-xl bg-slate-900/85 border border-white/10 p-5 rounded-2xl text-sm font-bold text-left flex justify-between items-center">
                              Suporte VIP <ChevronRight className="w-5 h-5 text-slate-500"/>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* TELA DE JOGO ABERTO (MODO VIP ATIVO) */}
      {jogoSelecionado && !jogoSelecionado.is_loading && menuAtivo !== 'assinar pro' && (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="px-4 mt-4">
            <button onClick={() => setJogoSelecionado(null)} className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-6 backdrop-blur-xl bg-slate-900/85 border border-white/10 px-4 py-2 rounded-xl uppercase tracking-wider"><X className="w-4 h-4"/> Fechar Análise</button>
            
            <div className="backdrop-blur-xl bg-slate-900/85 rounded-3xl p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col items-center w-1/3">
                        <img src={jogoSelecionado.home_image} className="w-16 h-16 mb-2 drop-shadow-lg" alt=""/>
                        <span className="font-black text-xs text-center">{jogoSelecionado.home_team}</span>
                    </div>
                    <div className="w-1/3 text-center">
                        <div className="text-4xl font-black mb-1 tracking-tighter">{jogoSelecionado.status === 'Not Started' ? 'VS' : `${jogoSelecionado.scoreHome} - ${jogoSelecionado.scoreAway}`}</div>
                        <span className="text-[10px] text-red-500 font-black bg-red-500/10 px-2 py-1 rounded-md uppercase tracking-wider">{jogoSelecionado.time_elapsed}' MIN</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <img src={jogoSelecionado.away_image} className="w-16 h-16 mb-2 drop-shadow-lg" alt=""/>
                        <span className="font-black text-xs text-center">{jogoSelecionado.away_team}</span>
                    </div>
                </div>

                <div className="bg-[#050816] rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-xl rounded-full"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <Crosshair className="w-5 h-5 text-blue-500" />
                        <h4 className="font-black text-xs text-blue-400 uppercase tracking-widest">ANÁLISE ESTATÍSTICA IA</h4>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed relative z-10">{jogoSelecionado.advice}</p>
                </div>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/85 rounded-3xl p-6 border border-white/10 shadow-xl">
                <h4 className="font-black text-sm mb-5 text-white uppercase tracking-wider">ESTATÍSTICAS DO CONFRONTO</h4>
                {jogoSelecionado.stats_reais?.map((s,i) => {
                    const total = s.h + s.a; const pH = total > 0 ? (s.h/total)*100 : 50; const pA = total > 0 ? (s.a/total)*100 : 50;
                    return (
                        <div key={i} className="mb-5">
                            <div className="flex justify-between text-xs font-black mb-1.5">
                                <span className={pH>=pA ? 'text-blue-400' : 'text-slate-500'}>{s.h}</span>
                                <span className="text-slate-500 text-[10px] uppercase tracking-widest">{s.type}</span>
                                <span className={pA>=pH ? 'text-yellow-400' : 'text-slate-500'}>{s.a}</span>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[#050816]">
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
              <p className="text-blue-500 font-bold text-xs animate-pulse uppercase tracking-widest">A extrair dados do algoritmo...</p>
          </div>
      )}

      {/* TELA DE CHECKOUT VIP PRO */}
      {menuAtivo === "assinar pro" && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="px-4 pt-4">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setMenuAtivo('Todos os Jogos')} className="text-slate-400 text-sm font-bold flex items-center gap-1"><X className="w-5 h-5"/> Fechar</button>
             </div>
             
             <div className="backdrop-blur-xl bg-slate-900/85 rounded-3xl p-6 border border-white/10 shadow-2xl">
                <Crown className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Seja PRO 👑</h2>
                <p className="text-slate-400 text-xs mb-6">Acesso total ao Algoritmo BetAnalytics, Assistente IA e picks de alta confiança.</p>
                
                <div className="flex flex-col gap-3">
                    <input placeholder="Nome" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors text-white font-bold" />
                    <input placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors text-white font-bold" />
                    <input placeholder="CPF" maxLength={11} value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value.replace(/\D/g, '')})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-colors text-white font-bold" />
                    
                    <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all text-sm uppercase tracking-wider">
                        ⚡ PAGAR 29,90€ COM PIX
                    </button>
                    <button className="bg-[#050816] border border-slate-800 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all text-sm uppercase tracking-wider">
                        💳 Cartão de Crédito
                    </button>
                </div>
             </div>
         </motion.div>
      )}

      {/* 12. ASSISTENTE IA (BOTÃO FLUTUANTE) */}
      <button onClick={() => setAiOpen(true)} className="fixed right-5 bottom-28 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] z-40 text-2xl hover:scale-105 transition-transform border border-blue-300/30">
        🤖
      </button>

      {/* MODAL DO ASSISTENTE IA */}
      <AnimatePresence>
          {aiOpen && (
              <motion.div initial={{opacity:0, y:20, scale:0.9}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.9, y:20}} className="fixed right-4 left-4 bottom-24 backdrop-blur-2xl bg-slate-900/95 border border-slate-700 p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50">
                  <div className="flex justify-between items-center mb-5">
                      <h3 className="font-black flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400"/> Assistente IA</h3>
                      <button onClick={() => setAiOpen(false)} className="text-slate-400 bg-slate-800 rounded-full p-1.5"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="bg-[#050816] border border-slate-800 rounded-2xl p-5 mb-5 text-xs text-slate-300 leading-relaxed relative font-semibold">
                      <div className="absolute top-5 left-0 w-1 h-[80%] bg-blue-500 rounded-r-md"></div>
                      Olá, {form.nome || userData?.nome || "Apostador"}! Sou o motor BetAnalytics. Qual é a sua dúvida sobre a rodada de hoje?
                  </div>
                  <input type="text" placeholder="Ex: Qual a melhor aposta para o Flamengo?" value={aiQuery} onChange={(e)=>setAiQuery(e.target.value)} className="w-full bg-[#050816] border border-slate-700 rounded-2xl p-4 text-xs text-white mb-4 outline-none focus:border-blue-500 font-bold"/>
                  <button className="w-full bg-blue-600 text-white font-black uppercase tracking-wider text-xs py-4 rounded-2xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">Perguntar à IA</button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* 11. NOVA BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816]/95 border-t border-white/5 flex justify-around items-center backdrop-blur-xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setMenuAtivo('Todos os Jogos'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
        </button>

        <button onClick={() => {setViewMode('blog'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'blog' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <BarChart2 className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Análises</span>
        </button>

        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setMenuAtivo('Todos os Jogos'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <div className="relative">
            <Radio className="w-6 h-6" />
            {filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span>
        </button>

        <button onClick={() => {setViewMode('ranking'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'ranking' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}>
          <Trophy className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Ranking</span>
        </button>

        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} 
                className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'perfil' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
          <User className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>

      </nav>

    </div>
  );
}