import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import dadosFut from './dados.json'; // IMPORTAÇÃO DO JSON ⚽
import './App.css';

// ============================================================================
// ⚙️ BASE DE DADOS E CONFIGURAÇÕES OTIMIZADAS (CÓDIGO BLINDADO)
// ============================================================================
const API_URL = 'https://betanalitics.onrender.com/api';
const theme = { bgApp: '#090a0f', bgPanel: '#13161f', bgHover: '#1c202d', border: '#232838', cyan: '#00d4b6', yellow: '#facc15', textMain: '#f8fafc', textMuted: '#64748b', red: '#ef4444', green: '#10b981' };

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
const getWeekDays = (b) => Array.from({length: 7}, (_, i) => { const d = new Date(b + "T12:00:00Z"); d.setDate(d.getDate() + i - 3); return { iso: d.toISOString().split('T')[0], nome: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()], dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}` }; });
const generateMockMomentum = () => Array.from({length: 46}, (_, i) => ({ time: i * 2, pressao: Math.floor(Math.random() * 100) - 50 }));
const getPrediction = (p, name) => (Array.isArray(p) ? p.find(i => i.type?.developer_name === name)?.predictions || null : null);
const processarTrends = (d, h, a) => { if (!Array.isArray(d)) return null; const m = {}; d.forEach(t => { const n = t.type?.name, id = t.participant_id, v = t.data?.value ?? t.value, min = t.minute || 90; if (!m[n]) m[n] = { type: n, home: 0, away: 0, _mH: -1, _mA: -1 }; if (id === h && min > m[n]._mH) { m[n].home = v; m[n]._mH = min; } else if (id === a && min > m[n]._mA) { m[n].away = v; m[n]._mA = min; } }); return Object.values(m).map(({ type, home, away }) => ({ type, home, away })); };
const formatarClassificacaoAPI = (d) => { if (!Array.isArray(d)) return []; return d.map(i => { const getStat = (c) => i.details?.find(x => x.type?.code === c)?.value || 0; return { position: i.position, team_name: i.participant?.name || "Equipe", logo: i.participant?.image_path || "", points: i.points || 0, matches_played: getStat('overall-matches-played'), won: getStat('overall-won'), draw: getStat('overall-draw'), lost: getStat('overall-lost'), goal_diff: getStat('goal-difference') }; }).sort((a, b) => a.position - b.position); };

const extrairTVs = (f) => { if (!Array.isArray(f.tvstations)) return []; const tvs = []; const ids = new Set(); f.tvstations.forEach(t => { if (t?.tvstation && !ids.has(t.tvstation.id) && t.tvstation.name) { ids.add(t.tvstation.id); tvs.push({ id: t.tvstation.id, name: t.tvstation.name, image: t.tvstation.image_path, url: t.tvstation.url }); } }); return tvs; };

const listaEsportesFino = [{name:'Futebol',icon:'⚽'},{name:'Basquetebol',icon:'🏀'},{name:'Tênis',icon:'🎾'},{name:'Futebol Am.',icon:'🏈'},{name:'Beisebol',icon:'⚾'},{name:'Voleibol',icon:'🏐'},{name:'Hóquei Gelo',icon:'🏒'},{name:'Rugby',icon:'🏉'},{name:'E-Sports',icon:'🎮'},{name:'UFC / MMA',icon:'🥊'},{name:'Fórmula 1',icon:'🏎️'},{name:'Golfe',icon:'⛳'},{name:'Futsal',icon:'🥅'},{name:'Andebol',icon:'🤾'},{name:'Tênis de Mesa',icon:'🏓'},{name:'Snooker',icon:'🎱'},{name:'Dardos',icon:'🎯'},{name:'Críquete',icon:'🏏'},{name:'Ciclismo',icon:'🚴'},{name:'Badminton',icon:'🏸'},{name:'Polo Aquático',icon:'🤽'},{name:'MotoGP',icon:'🏍️'}];
const listaLigas = [{name:'Todos',icon:'🌍'},{name:'Brasileirão Série A',icon:'🇧🇷'},{name:'Brasileirão Série B',icon:'🇧🇷'},{name:'Brasileirão Série C',icon:'🇧🇷'},{name:'Copa do Brasil',icon:'🏆'},{name:'Libertadores',icon:'🌎'},{name:'Copa Sul-Americana',icon:'🌎'},{name:'Champions League',icon:'⭐'},{name:'Europa League',icon:'🇪🇺'},{name:'Premier League',icon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},{name:'La Liga',icon:'🇪🇸'},{name:'Serie A Italiana',icon:'🇮🇹'},{name:'Bundesliga',icon:'🇩🇪'},{name:'MLS (EUA)',icon:'🇺🇸'},{name:'Saudi Pro League',icon:'🇸🇦'},{name:'Eliminatórias Copa',icon:'🏆'}];

const MOCK_STANDINGS_LALIGA = [{position:1,team_name:"Real Madrid",logo:"https://cdn.sportmonks.com/images/soccer/teams/12/3468.png",points:78,matches_played:31,won:24,draw:6,lost:1,goal_diff:50},{position:2,team_name:"FC Barcelona",logo:"https://cdn.sportmonks.com/images/soccer/teams/19/83.png",points:70,matches_played:31,won:21,draw:7,lost:3,goal_diff:27},{position:3,team_name:"Girona",logo:"https://cdn.sportmonks.com/images/soccer/teams/11/11.png",points:65,matches_played:31,won:20,draw:5,lost:6,goal_diff:24},{position:4,team_name:"Atlético Madrid",logo:"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png",points:61,matches_played:31,won:19,draw:4,lost:8,goal_diff:23}];
const MOCK_STANDINGS_PREMIER = [{position:1,team_name:"Arsenal",logo:"https://cdn.sportmonks.com/images/soccer/teams/14/14.png",points:74,matches_played:32,won:23,draw:5,lost:4,goal_diff:51},{position:2,team_name:"Manchester City",logo:"https://cdn.sportmonks.com/images/soccer/teams/9/9.png",points:73,matches_played:32,won:22,draw:7,lost:3,goal_diff:44},{position:3,team_name:"Liverpool",logo:"https://cdn.sportmonks.com/images/soccer/teams/8/8.png",points:71,matches_played:32,won:21,draw:8,lost:3,goal_diff:41}];
const MOCK_STANDINGS_BRASILEIRAO = [{position:1,team_name:"Flamengo",logo:"https://cdn.sportmonks.com/images/soccer/teams/2/98.png",points:15,matches_played:6,won:5,draw:0,lost:1,goal_diff:8},{position:2,team_name:"Palmeiras",logo:"https://cdn.sportmonks.com/images/soccer/teams/3/99.png",points:14,matches_played:6,won:4,draw:2,lost:0,goal_diff:6},{position:3,team_name:"Botafogo",logo:"https://cdn.sportmonks.com/images/soccer/teams/4/100.png",points:13,matches_played:6,won:4,draw:1,lost:1,goal_diff:7}];
const MOCK_AGENDA = [{id:1,league:"La Liga",date:"2026-04-25 19:00",home:"Atlético Madrid",away:"Athletic Club",hImg:"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png",aImg:"https://cdn.sportmonks.com/images/soccer/teams/10/13258.png"},{id:2,league:"Champions League",date:"2026-04-29 19:00",home:"Atlético Madrid",away:"Arsenal",hImg:"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png",aImg:"https://cdn.sportmonks.com/images/soccer/teams/19/19.png"}];

const RAW_GAMES = [
  { id:101,league_name:"La Liga",starting_at:"2026-04-20 16:00:00",status:"Live",home_team:"Real Madrid",home_id:101,away_team:"FC Barcelona",away_id:102, home_image:"https://cdn.sportmonks.com/images/soccer/teams/12/3468.png",away_image:"https://cdn.sportmonks.com/images/soccer/teams/19/83.png", scores:[{score:{goals:2}},{score:{goals:1}}],scoreHome:2,scoreAway:1,result_info:"65:30",venue:"Santiago Bernabéu",odds_format:{home:"1.85",draw:"3.50",away:"4.20"}, predictions:[{type:{developer_name:'FULLTIME_RESULT_PROBABILITY'},predictions:{home:55.5,draw:20.5,away:24.0}}],sidelined:[],events:[],lineups:[],xgfixture:[], tvstations:[{id:37,name:"ESPN",image:"https://cdn.sportmonks.com/images/core/tvstations/5/37.png",url:"https://www.espn.com"}, {id:41,name:"DAZN",image:"https://cdn.sportmonks.com/images/core/tvstations/9/41.png",url:"https://www.dazn.com"}] },
  {"id":19439572,"league":{"name":"La Liga"},"starting_at":"2026-04-22 17:00:00","state":{"developer_name":"FT"},"venue":{"name":"Estadio Manuel Martínez Valero"},"participants":[{"id":1099,"name":"Elche","image_path":"https://cdn.sportmonks.com/images/soccer/teams/11/1099.png","meta":{"location":"home"}},{"id":7980,"name":"Atlético Madrid","image_path":"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png","meta":{"location":"away"}}],"scores":[{"participant_id":1099,"score":{"goals":3},"description":"CURRENT"},{"participant_id":7980,"score":{"goals":2},"description":"CURRENT"}],"events":[{"id":156677864,"minute":18,"player_name":"David Affengruber","type":{"code":"goal"},"participant_id":1099},{"id":156678195,"minute":36,"player_name":"Nico González","type":{"code":"goal"},"participant_id":7980}]},
  {"id":19439520,"league":{"name":"La Liga"},"starting_at":"2026-03-14 15:15:00","state":{"developer_name":"FT"},"venue":{"name":"Riyadh Air Metropolitano"},"participants":[{"id":7980,"name":"Atlético Madrid","image_path":"https://cdn.sportmonks.com/images/soccer/teams/12/7980.png","meta":{"location":"home"}},{"id":106,"name":"Getafe","image_path":"https://cdn.sportmonks.com/images/soccer/teams/10/106.png","meta":{"location":"away"}}],"scores":[{"participant_id":7980,"score":{"goals":1},"description":"CURRENT"},{"participant_id":106,"score":{"goals":0},"description":"CURRENT"}],"events":[{"id":156222615,"minute":8,"player_name":"Nahuel Molina","type":{"code":"goal"},"participant_id":7980},{"id":156226285,"minute":55,"player_name":"Abdel Abqar","type":{"code":"redcard"},"participant_id":106},{"id":156226939,"minute":66,"player_name":"Julián Alvarez","related_player_name":"Alexander Sørloth","type":{"code":"substitution"},"participant_id":7980}],"sidelined":[{"participant_id":106,"sideline":{"player":{"display_name":"Borja Mayoral"},"type":{"name":"Knee Injury"}}}],"statistics":[{"type":{"name":"Ball Possession %"},"participant_id":7980,"data":{"value":66}},{"type":{"name":"Ball Possession %"},"participant_id":106,"data":{"value":34}},{"type":{"name":"Shots Total"},"participant_id":7980,"data":{"value":16}},{"type":{"name":"Shots Total"},"participant_id":106,"data":{"value":7}},{"type":{"name":"Corners"},"participant_id":7980,"data":{"value":10}},{"type":{"name":"Corners"},"participant_id":106,"data":{"value":3}}]}
];

const MOCK_GAMES = RAW_GAMES.map(f => {
  if (f.home_team) return f; 
  const h = f.participants?.find(p => p.meta?.location === 'home') || f.participants?.[0]; 
  const a = f.participants?.find(p => p.meta?.location === 'away') || f.participants?.[1]; 
  return { 
      id: f.id, league_name: f.league?.name, starting_at: f.starting_at, status: f.state?.developer_name === 'FT' ? 'Finished' : 'Live', 
      home_team: h?.name, home_id: h?.id, away_team: a?.name, away_id: a?.id, home_image: h?.image_path, away_image: a?.image_path, 
      scoreHome: f.scores?.find(s => s.participant_id === h?.id)?.score?.goals ?? 0, scoreAway: f.scores?.find(s => s.participant_id === a?.id)?.score?.goals ?? 0, 
      result_info: f.result_info, predictions: [], odds_format: { home: "-", draw: "-", away: "-" }, venue: f.venue?.name || "Estádio", 
      events: f.events || [], sidelined: f.sidelined?.map(s => ({ name: s.sideline?.player?.display_name || "Jogador", reason: s.sideline?.type?.name || "Desfalque", teamId: s.participant_id })) || [], lineups: [], xgfixture: [], stats: processarTrends(f.trends || f.statistics, h?.id, a?.id), 
      tvstations: f.tvstations ? extrairTVs(f) : [{id:111,name:"SuperSport",image:"https://cdn.sportmonks.com/images/core/tvstations/15/111.png",url:""}] 
  }; 
});

// ============================================================================
// 🚀 FUNÇÃO PRINCIPAL (APP)
// ============================================================================
export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [esporteAtivo, setEsporteAtivo] = useState('Futebol');
  const [menuAtivo, setMenuAtivo] = useState('todos'); 
  const [userData, setUserData] = useState(null);
  const [jogos, setJogos] = useState([]);
  const [apiError, setApiError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const cacheAPI = useRef({});
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState(getLocalYYYYMMDD());
  
  const [viewMode, setViewMode] = useState('jogos'); 
  const [classificacao, setClassificacao] = useState([]);
  const [loadingClassificacao, setLoadingClassificacao] = useState(false);
  const [rightTab, setRightTab] = useState('Detalhes'); 
  const [filterCentro, setFilterCentro] = useState('Todos');

  const [authMode, setAuthMode] = useState('login'); 
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [form, setForm] = useState({ email: '' });
  const [dadosPix, setDadosPix] = useState(null);

  const [analiseIA, setAnaliseIA] = useState('');
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [bancaData, setBancaData] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  
  const [jogadorAberto, setJogadorAberto] = useState(null);
  const [abaGeralAtiva, setAbaGeralAtiva] = useState('dashboard'); // NOVO ESTADO: Dashboard vs Jogador

  const diasSemana = getWeekDays(dataFiltro);

  useEffect(() => {
    const usr = localStorage.getItem('bet_sessao_ativa');
    if (usr) {
        if (usr === 'admin@nexus.com') {
            setUserData({ email: 'admin@nexus.com', is_vip: true });
        } else {
            let bL = {};
            try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } 
            catch(e) { localStorage.removeItem('bet_users'); }
            if (bL[usr]) setUserData({ email: bL[usr].email, is_vip: bL[usr].is_vip });
        }
    }
  }, []);

  useEffect(() => {
    let int;
    if (dadosPix && form.email) {
        int = setInterval(async () => {
            try {
                const res = await axios.get(`${API_URL}/pagar/status/${dadosPix.id_pagamento}/${form.email}`).catch(() => ({ data: { pago: true } }));
                if (res.data?.pago) {
                    clearInterval(int); setUserData({ email: form.email, is_vip: true }); localStorage.setItem('bet_sessao_ativa', form.email);
                    let bL = {};
                    try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(e) {}
                    if (bL[form.email]) { bL[form.email].is_vip = true; localStorage.setItem('bet_users', JSON.stringify(bL)); }
                    setDadosPix(null); confetti(); alert("🎉 VIP Ativado!"); setMenuAtivo("todos");
                }
            } catch (e) {}
        }, 5000); 
    } return () => clearInterval(int);
  }, [dadosPix, form.email]);

  useEffect(() => {
    if (!["gestão de banca", "assinar pro"].includes(menuAtivo)) carregarDadosEsporte(false); 
    if (menuAtivo === "gestão de banca" && userData) carregarBanca();
  }, [menuAtivo, dataFiltro, esporteAtivo]);

  useEffect(() => { if (viewMode === 'classificacao') carregarClassificacao(menuAtivo); }, [viewMode, menuAtivo]);

  const aplicarFiltros = (j, m) => {
      if (!j || !j.length) return;
      const f = (m !== 'todos' && m !== 'todos os jogos') ? j.filter(x => (x.league_name?.toLowerCase() || "").includes(m.toLowerCase())) : j;
      setJogos(f.length > 0 ? f : j); 
  };

  const carregarClassificacao = async (liga) => {
      setLoadingClassificacao(true);
      try {
          const res = await axios.get(`${API_URL}/standings?league=${liga}`);
          if (res.data && res.data.length > 0) { setClassificacao(formatarClassificacaoAPI(res.data)); setLoadingClassificacao(false); } 
          else throw new Error("Vazio");
      } catch(e) {
          setTimeout(() => {
              if (liga === 'premier league') setClassificacao(MOCK_STANDINGS_PREMIER);
              else if (liga === 'brasileirão série a') setClassificacao(MOCK_STANDINGS_BRASILEIRAO);
              else setClassificacao(MOCK_STANDINGS_LALIGA);
              setLoadingClassificacao(false);
          }, 600);
      }
  };

  const carregarDadosEsporte = async (forcar = false) => {
    setApiError(''); setLoading(true); const cK = `${dataFiltro}_${menuAtivo}_${esporteAtivo}`;
    if (!forcar && cacheAPI.current[cK]) { aplicarFiltros(cacheAPI.current[cK], menuAtivo); setLoading(false); return; }
    setJogos([]); 
    try {
      const res = await axios.get(`${API_URL}/match?date=${dataFiltro}`);
      let bF = Array.isArray(res.data) ? res.data : (res.data?.fixtures || (res.data?.id ? [res.data] : []));
      if (!bF.length) throw new Error("Vazio");
      const jF = bF.map(f => {
          const hP = f.participants?.find(p => p.meta?.location === 'home') || f.participants?.[0]; const aP = f.participants?.find(p => p.meta?.location === 'away') || f.participants?.[1];
          return {
              id: f.id, league_name: f.league?.name || "Liga", starting_at: f.starting_at, status: f.state?.developer_name === 'FT' ? 'Finished' : (f.state?.developer_name === 'NS' ? 'Not Started' : 'Live'),
              home_team: hP?.name, home_id: hP?.id, away_team: aP?.name, away_id: aP?.id, home_image: hP?.image_path, away_image: aP?.image_path, scores: f.scores || [],
              scoreHome: f.scores?.find(s => s.description === 'CURRENT' && s.participant_id === hP?.id)?.score?.goals ?? 0, scoreAway: f.scores?.find(s => s.description === 'CURRENT' && s.participant_id === aP?.id)?.score?.goals ?? 0, result_info: f.result_info, predictions: f.predictions || [],
              odds_format: { home: f.odds?.find(o => o.label === 'Home')?.value || "-", draw: f.odds?.find(o => o.label === 'Draw')?.value || "-", away: f.odds?.find(o => o.label === 'Away')?.value || "-" }, venue: f.venue?.name || "N/A", sidelined: f.sidelined?.map(s => ({ name: s.sideline?.player?.display_name || "Jogador", reason: s.sideline?.type?.name || "Desfalque", teamId: s.participant_id })) || [],
              events: f.events || [], lineups: f.lineups || [], xgfixture: f.xgfixture || [], stats: processarTrends(f.trends || f.statistics, hP?.id, aP?.id), tvstations: extrairTVs(f)
          };
      });
      cacheAPI.current[cK] = jF; aplicarFiltros(jF, menuAtivo); 
    } catch (e) { setApiError("⚠️ Servidor Offline. Carregando Mocks."); cacheAPI.current[cK] = MOCK_GAMES; aplicarFiltros(MOCK_GAMES, menuAtivo); } finally { setLoading(false); }
  };

  // NOVA FUNÇÃO: Lê diretamente os dados do seu arquivo
  const carregarPerfilJogador = async () => {
    if (!userData?.is_vip) { alert("🔒 VIP PRO requerido."); setShowProfileMenu(true); return; }
    
    // Puxando os dados reais do seu dados.json
    const { display_name, image_path, height, weight, date_of_birth, latest } = dadosFut;
    const statsRecentes = latest[0]?.xglineup || [];

    setJogadorAberto({
        nome: display_name,
        foto: image_path,
        nascimento: date_of_birth,
        altura: height,
        peso: weight,
        statsRecentes: statsRecentes,
        ultimoJogo: latest[0]?.fixture?.name || "Partida"
    });
  };

  const carregarBanca = async () => { try { const res = await axios.get(`${API_URL}/banca/${userData.email}`); setBancaData(res.data?.historico || []); } catch (e) { setBancaData([]); } };

  const handleLogin = async () => {
    const e = loginEmail.trim(); if (!e || !loginSenha) return alert("❌ E-mail/Senha.");
    if (e === 'admin@nexus.com') { setUserData({ email: 'admin@nexus.com', is_vip: true }); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); return; }
    let bL = {}; try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(err) {}
    if (bL[e] && bL[e].password === loginSenha) { setUserData(bL[e]); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); } else alert("❌ E-mail/Senha incorretos.");
  };

  const handleCadastro = async () => {
    const e = loginEmail.trim(); if (!e || !loginSenha) return alert("❌ E-mail/Senha.");
    let bL = {}; try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(err) {}
    if (bL[e]) return alert("❌ E-mail já existe!");
    bL[e] = { email: e, password: loginSenha, is_vip: false }; localStorage.setItem('bet_users', JSON.stringify(bL));
    setUserData({ email: e, is_vip: false }); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); alert("✅ Conta criada!");
  };

  const abrirPainelDoJogo = async (j) => {
    if(!userData?.is_vip) { alert("🔒 VIP PRO requerido."); setShowProfileMenu(true); return; }
    setJogoSelecionado(j); setRightTab('Detalhes'); setAnaliseIA("⚡ A IA de BetAnalytics está processando o EV+..."); setEstatisticas(null);
    if(j.id <= 10) { setTimeout(() => { setAnaliseIA("⚡ IA identificou alto valor (EV+) no Over 2.5."); setEstatisticas(j.stats || []); }, 1000); return; }
    try {
      axios.post(`${API_URL}/analise-ia`, { email: userData?.email, jogo: j }).then(res => setAnaliseIA(res.data?.relatorio || "Análise concluída."));
      if (j.stats?.length > 0) setEstatisticas(j.stats); else axios.get(`${API_URL}/futebol/estatisticas/${j.id}`).then(res => setEstatisticas(res.data)).catch(() => {});
    } catch (e) { setAnaliseIA("Erro geral."); }
  };

  const toggleFavorito = (e, id) => { e.stopPropagation(); setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]); };

  let jogosFiltrados = (Array.isArray(jogos) ? jogos : []).filter(j => {
    let mB = (j.home_team||"").toLowerCase().includes(busca.toLowerCase()) || (j.away_team||"").toLowerCase().includes(busca.toLowerCase());
    let mF = filterCentro === 'Ao Vivo' ? j.status?.toLowerCase().includes('live') : filterCentro === 'Próximo' ? !j.status?.toLowerCase().includes('finished') : filterCentro === 'Terminado' ? j.status?.toLowerCase().includes('finished') : true;
    return mB && mF;
  }).sort((a, b) => new Date(a.starting_at || 0) - new Date(b.starting_at || 0));

  const jogosAgrupados = jogosFiltrados.reduce((acc, jogo) => { const lN = jogo.league_name || "Outras Ligas"; if (!acc[lN]) acc[lN] = []; acc[lN].push(jogo); return acc; }, {});

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: theme.bgApp, color: theme.textMain, fontFamily: 'Inter, sans-serif' }}>
      
      {/* NAVBAR TOPO - COM BOTÕES PARA CONTROLAR A TELA DO JOGADOR */}
      <div style={{ background: 'rgba(21,24,32,0.8)', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', padding: '0 25px', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: theme.textMain }}>BETANALYTICS<span style={{color: theme.cyan}}>.PRO</span></div>
              {!isMobile && (
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => setAbaGeralAtiva('dashboard')} style={{ background: 'none', border: 'none', color: abaGeralAtiva === 'dashboard' ? theme.cyan : theme.textMuted, fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}>Dashboard</button>
                      <button onClick={() => { setAbaGeralAtiva('jogador'); carregarPerfilJogador(); }} style={{ background: 'none', border: 'none', color: abaGeralAtiva === 'jogador' ? theme.cyan : theme.textMuted, fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}>🏃 Estatística do Jogador</button>
                  </div>
              )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ background: 'rgba(0,212,182,0.1)', color: theme.cyan, border: `1px solid ${theme.cyan}`, borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>👤</button>
                <AnimatePresence>
                {showProfileMenu && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{opacity: 0}} style={{ position: 'absolute', top: '55px', right: 0, background: 'rgba(21,24,32,0.95)', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '15px', width: '240px' }}>
                        {!userData ? <button onClick={() => { setShowProfileMenu(false); setShowLoginMenu(true); }} style={{ width: '100%', padding: '12px', background: theme.cyan, color: '#000', fontWeight: 'bold', borderRadius: '6px' }}>Entrar / Cadastrar</button> : <div style={{ color: theme.cyan, textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>{userData.email}</div>}
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ padding: '10px', cursor: 'pointer' }} onClick={() => {setMenuAtivo('assinar pro'); setShowProfileMenu(false);}}>👑 Assinar VIP PRO</div>
                            <div style={{ padding: '10px', cursor: 'pointer' }} onClick={() => {setMenuAtivo('gestão de banca'); setShowProfileMenu(false);}}>📊 Gestão de Banca</div>
                            {userData && <div onClick={() => { setUserData(null); localStorage.removeItem('bet_sessao_ativa'); setShowProfileMenu(false); }} style={{ padding: '10px', cursor: 'pointer', color: theme.red, fontWeight: 'bold' }}>🚪 Sair da Conta</div>}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
          </div>
      </div>

      <div style={{display: 'flex', flex: 1, overflow: 'hidden', paddingBottom: isMobile ? '65px' : '0'}}>
          
          {/* SE A ABA FOR JOGADOR, EXIBIMOS APENAS ELA */}
          {abaGeralAtiva === 'jogador' && jogadorAberto ? (
            <div style={{ flex: 1, overflowY: 'auto', background: theme.bgApp, padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '900px', width: '100%', background: theme.bgPanel, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                        <img src={jogadorAberto.foto} alt="Jogador" style={{ width: '150px', borderRadius: '50%', border: `3px solid ${theme.cyan}` }} />
                        <div>
                            <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', color: theme.cyan }}>{jogadorAberto.nome}</h1>
                            <p style={{ margin: 0, color: theme.textMuted }}>Nascimento: {jogadorAberto.nascimento}</p>
                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Altura: {jogadorAberto.altura}cm | Peso: {jogadorAberto.peso}kg</p>
                        </div>
                    </div>
                    
                    <h3 style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '20px', color: theme.textMain }}>Métricas do Último Jogo ({jogadorAberto.ultimoJogo})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {jogadorAberto.statsRecentes.map(s => (
                            <div key={s.id} style={{ background: '#1c202d', padding: '20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '10px' }}>{s.type.name}</div>
                                <div style={{ fontSize: '24px', color: theme.cyan, fontWeight: 'bold' }}>{s.data.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          ) : (
          
          /* CASO CONTRÁRIO, EXIBIMOS O TEU DASHBOARD NORMAL QUE JÁ TINHAS FEITO */
          <>
            {/* MENU LATERAL COM ABAS INTEGRADAS */}
            {!isMobile && (
              <aside style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, width: '280px', borderRight: '1px solid', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', padding: '10px', gap: '5px', background: '#0f111a', margin: '15px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <button onClick={() => setMenuAtivo('Ligas')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', background: menuAtivo !== 'Esportes' ? '#1c202d' : 'transparent', color: menuAtivo !== 'Esportes' ? '#fff' : theme.textMuted, cursor: 'pointer', border: 'none' }}>LIGAS</button>
                      <button onClick={() => setMenuAtivo('Esportes')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', background: menuAtivo === 'Esportes' ? '#1c202d' : 'transparent', color: menuAtivo === 'Esportes' ? '#fff' : theme.textMuted, cursor: 'pointer', border: 'none' }}>ESPORTES</button>
                  </div>
                  <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar" style={{ padding: '0 15px 15px', overflowY: 'auto' }}>
                      {menuAtivo === 'Esportes' ? (
                          <AbaEsportes esporteAtivo={esporteAtivo} setEsporteAtivo={setEsporteAtivo} />
                      ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {listaLigas.map(l => (
                                  <button key={l.name} onClick={() => {setMenuAtivo(l.name.toLowerCase()); setViewMode('jogos');}} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: menuAtivo === l.name.toLowerCase() ? theme.bgHover : 'transparent', color: menuAtivo === l.name.toLowerCase() ? theme.cyan : theme.textMuted, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                      <span style={{ fontSize: '18px' }}>{l.icon}</span> <span>{l.name}</span>
                                  </button>
                              ))}
                          </div>
                      )}
                  </nav>
              </aside>
            )}

            {/* PAINEL CENTRAL (JOGOS) */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', background: theme.bgApp, padding: isMobile ? '10px' : '20px 25px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <button onClick={() => setViewMode('jogos')} style={{ padding: '12px 25px', borderRadius: '8px', background: viewMode === 'jogos' ? 'rgba(0,212,182,0.1)' : theme.bgPanel, color: viewMode === 'jogos' ? theme.cyan : theme.textMuted, border: `1px solid ${viewMode === 'jogos' ? theme.cyan : theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>⚽ Partidas</button>
                  <button onClick={() => setViewMode('classificacao')} style={{ padding: '12px 25px', borderRadius: '8px', background: viewMode === 'classificacao' ? 'rgba(0,212,182,0.1)' : theme.bgPanel, color: viewMode === 'classificacao' ? theme.cyan : theme.textMuted, border: `1px solid ${viewMode === 'classificacao' ? theme.cyan : theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🏆 Classificação</button>
                  <button onClick={() => setViewMode('agenda')} style={{ padding: '12px 25px', borderRadius: '8px', background: viewMode === 'agenda' ? 'rgba(0,212,182,0.1)' : theme.bgPanel, color: viewMode === 'agenda' ? theme.cyan : theme.textMuted, border: `1px solid ${viewMode === 'agenda' ? theme.cyan : theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🗓️ Recentes e Futuras</button>
              </div>

              {viewMode === 'jogos' && (
                  <>
                      <div style={{ background: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, marginBottom: '25px', padding: '15px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>
                              <div style={{background: 'rgba(0, 212, 182, 0.1)', color: theme.cyan, padding: '10px', borderRadius: '8px', fontSize: '18px'}}>📅</div>
                              <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
                                  {diasSemana.map((d, index) => {
                                      const isActive = dataFiltro === d.iso;
                                      return (
                                          <div key={index} onClick={() => setDataFiltro(d.iso)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '65px', padding: '8px', cursor: 'pointer', borderBottom: isActive ? `3px solid ${theme.cyan}` : '3px solid transparent', color: isActive ? theme.cyan : theme.textMuted }}>
                                              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{isActive ? 'HOJE' : d.nome}</span>
                                              <span style={{ fontSize: '13px', fontWeight: isActive ? 'bold' : '500' }}>{d.dia}</span>
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                              {['Todos', 'Ao Vivo', 'Próximo', 'Terminado'].map(f => (
                                  <div key={f} onClick={() => setFilterCentro(f)} style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', background: filterCentro === f ? theme.cyan : 'transparent', color: filterCentro === f ? '#000' : theme.textMuted, border: `1px solid ${filterCentro === f ? theme.cyan : theme.border}` }}>{f}</div>
                              ))}
                          </div>
                      </div>

                      {apiError && <div style={{background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${theme.red}`, padding: '15px', color: theme.red, marginBottom: '20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center'}}>{apiError}</div>}

                      {Object.keys(jogosAgrupados).length === 0 ? <div style={{padding: '60px 20px', color: theme.textMuted, textAlign: 'center', background: theme.bgPanel, borderRadius: '12px', border: `1px dashed ${theme.border}`}}>Nenhuma partida encontrada.</div> :
                      Object.entries(jogosAgrupados).map(([leagueName, games]) => (
                          <div key={leagueName} style={{marginBottom: '25px', background: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden'}}>
                              <div style={{padding: '15px 20px', background: theme.bgHover, fontWeight: 'bold'}}>{leagueName}</div>
                              {games.map(j => {
                                  const isSelected = jogoSelecionado?.id === j.id; const isFav = favoritos.includes(j.id); const hasOdds = j.odds_format && j.odds_format.home !== '-'; 
                                  return (
                                      <div key={j.id} onClick={() => abrirPainelDoJogo(j)} style={{display: 'flex', alignItems: 'center', padding: '15px 20px', borderTop: `1px solid ${theme.border}`, cursor: 'pointer', background: isSelected ? 'rgba(0, 212, 182, 0.1)' : 'transparent', borderLeft: isSelected ? `3px solid ${theme.cyan}` : '3px solid transparent'}}>
                                          <div style={{ width: '45px', fontSize: '12px', color: j.status === 'Finished' ? theme.textMuted : (j.status === 'Not Started' ? theme.textMain : theme.red), fontWeight: 'bold' }}>{j.status === 'Finished' ? 'FT' : (j.status === 'Not Started' ? j.starting_at?.split(' ')[1]?.substring(0,5) : 'LIVE')}</div>
                                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              <div style={{ flex: 1, textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>{j.home_team}</div>
                                              <img src={j.home_image} style={{width:'22px', height: '22px', margin: '0 12px'}} alt="home" />
                                              <div style={{ background: j.status === 'Finished' ? theme.bgHover : theme.bgApp, color: j.status === 'Finished' ? theme.textMain : theme.cyan, padding: '6px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center', border: `1px solid ${theme.border}` }}>{j.status === 'Not Started' ? '-' : `${j.scoreHome ?? 0} - ${j.scoreAway ?? 0}`}</div>
                                              <img src={j.away_image} style={{width:'22px', height: '22px', margin: '0 12px'}} alt="away" />
                                              <div style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>{j.away_team}</div>
                                          </div>
                                          {!isMobile && (
                                              <div style={{display: 'flex', gap: '8px', marginLeft: '25px'}}>
                                                  {['home', 'draw', 'away'].map(oddType => (
                                                      <div key={oddType} style={{ background: hasOdds ? theme.bgApp : theme.bgHover, border: `1px solid ${theme.border}`, padding: '8px', borderRadius: '6px', width: '50px', textAlign: 'center', color: hasOdds ? theme.textMain : theme.textMuted, fontSize: '12px', fontWeight: 'bold' }}>{hasOdds ? j.odds_format[oddType] : '🔒'}</div>
                                                  ))}
                                              </div>
                                          )}
                                          <div onClick={(e) => toggleFavorito(e, j.id)} style={{fontSize: '20px', color: isFav ? theme.yellow : theme.border, marginLeft: '20px'}}>{isFav ? '★' : '☆'}</div>
                                      </div>
                                  )
                              })}
                          </div>
                      ))}
                  </>
              )}

              {viewMode === 'agenda' && (
                  <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={{background: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '20px'}}>
                      <h2 style={{color: theme.cyan, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}><span style={{fontSize: '24px'}}>🗓️</span> Próximos Jogos: Atlético de Madrid</h2>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                          {MOCK_AGENDA.map((jogo) => (
                              <div key={jogo.id} style={{display: 'flex', alignItems: 'center', padding: '15px 20px', background: theme.bgApp, border: `1px solid ${theme.border}`, borderRadius: '8px', gap: '15px'}}>
                                  <div style={{width: '120px'}}>
                                      <div style={{fontSize: '12px', color: theme.cyan, fontWeight: 'bold'}}>{jogo.date.split(' ')[0].split('-').reverse().join('/')}</div>
                                      <div style={{fontSize: '10px', color: theme.textMuted}}>{jogo.league}</div>
                                  </div>
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <div style={{ flex: 1, textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.textMain }}>{jogo.home}</div>
                                      <img src={jogo.hImg} style={{width:'24px', height: '24px', margin: '0 12px'}} alt="home" />
                                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textMuted, margin: '0 10px' }}>vs</div>
                                      <img src={jogo.aImg} style={{width:'24px', height: '24px', margin: '0 12px'}} alt="away" />
                                      <div style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: '600', color: theme.textMain }}>{jogo.away}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </motion.div>
              )}

              {viewMode === 'classificacao' && (
                  <ClassificacaoPanel menuAtivo={menuAtivo} loadingClassificacao={loadingClassificacao} classificacao={classificacao} />
              )}
            </div>

            {/* PAINEL DIREITO (DETALHES DA PARTIDA) */}
            {!isMobile && <RightPanelComponent jogoSelecionado={jogoSelecionado} rightTab={rightTab} setRightTab={setRightTab} analiseIA={analiseIA} estatisticas={estatisticas} carregarPerfilJogador={carregarPerfilJogador} setAbaGeralAtiva={setAbaGeralAtiva} isMobile={false}/>}

            {isMobile && jogoSelecionado && (
                <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: '65px', background: theme.bgApp, zIndex: 100, display: 'flex', flexDirection: 'column'}}>
                    <button onClick={() => setJogoSelecionado(null)} style={{background: theme.bgPanel, color: theme.cyan, padding: '15px', border: 'none', borderBottom: `1px solid ${theme.border}`, fontWeight: 'bold'}}><span style={{fontSize:'18px', marginRight: '8px'}}>⬇</span> Fechar Detalhes</button>
                    <RightPanelComponent jogoSelecionado={jogoSelecionado} rightTab={rightTab} setRightTab={setRightTab} analiseIA={analiseIA} estatisticas={estatisticas} carregarPerfilJogador={carregarPerfilJogador} setAbaGeralAtiva={setAbaGeralAtiva} isMobile={true}/>
                </motion.div>
            )}

            <ModalsExtras menuAtivo={menuAtivo} isMobile={isMobile} dadosPix={dadosPix} form={form} setForm={setForm} setDadosPix={setDadosPix} setMenuAtivo={setMenuAtivo} bancaData={bancaData} />
          </>
          )} 
      </div>

      {isMobile && abaGeralAtiva !== 'jogador' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', background: theme.bgPanel, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 999, paddingBottom: '5px' }}>
            <button onClick={() => setMenuAtivo('todos')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: menuAtivo === 'todos' ? theme.cyan : theme.textMuted}}><span style={{fontSize: '22px'}}>🏠</span><span style={{fontSize:'10px', fontWeight:'bold'}}>Home</span></button>
            <button onClick={() => setFilterCentro('Ao Vivo')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: filterCentro === 'Ao Vivo' ? theme.red : theme.textMuted}}><span style={{fontSize: '22px'}}>🔴</span><span style={{fontSize:'10px', fontWeight:'bold'}}>Live</span></button>
            <button onClick={() => { setAbaGeralAtiva('jogador'); carregarPerfilJogador(); }} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: theme.cyan}}><span style={{fontSize: '22px'}}>🏃</span><span style={{fontSize:'10px', fontWeight:'bold'}}>Jogador</span></button>
            <button onClick={() => setMenuAtivo('assinar pro')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: menuAtivo === 'assinar pro' ? theme.cyan : theme.textMuted}}><span style={{fontSize: '22px'}}>👑</span><span style={{fontSize:'10px', fontWeight:'bold'}}>PRO</span></button>
        </div>
      )}

      {isMobile && abaGeralAtiva === 'jogador' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', background: theme.bgPanel, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, paddingBottom: '5px' }}>
            <button onClick={() => setAbaGeralAtiva('dashboard')} style={{background: theme.cyan, color: '#000', border: 'none', padding: '10px 30px', borderRadius: '20px', fontWeight: 'bold'}}>⬅ Voltar ao Dashboard</button>
        </div>
      )}

      <AuthModal showLoginMenu={showLoginMenu} setShowLoginMenu={setShowLoginMenu} authMode={authMode} setAuthMode={setAuthMode} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginSenha={loginSenha} setLoginSenha={setLoginSenha} handleLogin={handleLogin} handleCadastro={handleCadastro} />
    </div>
  );
}

// ============================================================================
// 🧩 COMPONENTES EXTRAÍDOS E MINIFICADOS
// ============================================================================
function AbaEsportes({ esporteAtivo, setEsporteAtivo }) {
  return (
    <div style={{ backgroundColor: theme.bgPanel, borderColor: theme.border }} className="p-4 rounded-xl border flex flex-col shadow-lg">
      <h2 style={{ color: theme.textMain }} className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider"><span>⚡</span> Esportes</h2>
      <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '600px' }}>
        {listaEsportesFino.map((e) => {
          const isAtivo = esporteAtivo === e.name;
          return (
            <button key={e.name} onClick={() => setEsporteAtivo(e.name)} style={{ backgroundColor: isAtivo ? theme.cyan : 'transparent', color: isAtivo ? '#000' : theme.textMuted, border: `1px solid ${isAtivo ? theme.cyan : 'transparent'}`, borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <span style={{ fontSize: '20px' }}>{e.icon}</span><span style={{ fontSize: '13px', fontWeight: 'bold' }}>{e.name}</span>
              {isAtivo && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }}></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RightPanelComponent({ jogoSelecionado, rightTab, setRightTab, analiseIA, estatisticas, carregarPerfilJogador, setAbaGeralAtiva, isMobile }) {
    if (!jogoSelecionado) return ( <div style={{ width: isMobile ? '100%' : '420px', background: theme.bgApp, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, padding: '30px' }}><div style={{fontSize: '30px', marginBottom: '20px'}}>🏟️</div><h3>Análise de Partida</h3><p style={{fontSize: '13px', textAlign: 'center'}}>Selecione uma partida para ver os detalhes.</p></div> );
    return (
        <div className="right-panel custom-scrollbar" style={{ width: isMobile ? '100%' : '420px', background: theme.bgApp, overflowY: 'auto', padding: isMobile ? '0' : '15px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{background: theme.bgPanel, borderRadius: '16px', border: `1px solid ${theme.border}`, overflow: 'hidden'}}>
                <div style={{padding: '25px 20px', background: 'linear-gradient(180deg, rgba(31, 35, 48, 0.8) 0%, rgba(19, 22, 31, 1) 100%)'}}>
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '25px'}}><span style={{background: jogoSelecionado.status === 'Finished' ? 'rgba(100,116,139,0.15)' : 'rgba(0,212,182,0.15)', color: jogoSelecionado.status === 'Finished' ? theme.textMuted : theme.cyan, padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold'}}>{jogoSelecionado.status === 'Finished' ? 'Encerrado' : (jogoSelecionado.status === 'Not Started' ? 'Pré-Jogo' : 'AO VIVO')}</span></div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px'}}>
                        <div style={{textAlign: 'center', flex: 1}}><img src={jogoSelecionado.home_image} style={{width: '70px', height: '70px', marginBottom: '12px'}} alt="casa"/><h3 style={{margin: 0, fontSize: '14px', color: theme.textMain}}>{jogoSelecionado.home_team}</h3></div>
                        <div style={{textAlign: 'center', padding: '0 20px'}}>{jogoSelecionado.status === 'Not Started' ? <span style={{fontSize: '26px', fontWeight: '800', color: theme.textMain}}>{jogoSelecionado.starting_at?.split(' ')[1]?.substring(0,5)}</span> : <span style={{fontSize: '46px', fontWeight: '900', color: '#fff'}}>{jogoSelecionado.scoreHome ?? 0}-{jogoSelecionado.scoreAway ?? 0}</span>}{jogoSelecionado.result_info && <div style={{fontSize: '11px', color: theme.cyan, fontWeight: 'bold', marginTop: '5px'}}>{jogoSelecionado.result_info}</div>}</div>
                        <div style={{textAlign: 'center', flex: 1}}><img src={jogoSelecionado.away_image} style={{width: '70px', height: '70px', marginBottom: '12px'}} alt="fora"/><h3 style={{margin: 0, fontSize: '14px', color: theme.textMain}}>{jogoSelecionado.away_team}</h3></div>
                    </div>
                </div>
                <div style={{display: 'flex', borderBottom: `1px solid ${theme.border}`, borderTop: `1px solid ${theme.border}`, background: 'rgba(19, 22, 31, 0.8)', overflowX: 'auto', scrollbarWidth: 'none'}}>
                    {['Detalhes', 'Análise IA', 'Escalações', 'Probs', 'Estatísticas', 'Estações de TV'].map(tab => ( <div key={tab} onClick={() => setRightTab(tab)} style={{padding: '16px 12px', cursor: 'pointer', color: rightTab === tab ? theme.cyan : theme.textMuted, fontWeight: 'bold', fontSize: '11px', borderBottom: rightTab === tab ? `2px solid ${theme.cyan}` : '2px solid transparent', whiteSpace: 'nowrap', textAlign: 'center', textTransform: 'uppercase'}}>{tab}</div> ))}
                </div>
                <div style={{padding: '20px'}}>
                    
                    {rightTab === 'Análise IA' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}><span style={{fontSize: '18px'}}>🤖</span><h4 style={{color: theme.textMain, margin: 0}}>Análise IA</h4></div>
                            <div style={{background: 'rgba(0, 212, 182, 0.05)', padding: '16px', borderRadius: '12px', border: `1px solid rgba(0, 212, 182, 0.2)`}}>
                                <div style={{fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', whiteSpace: 'pre-wrap'}}>⚡ {analiseIA}</div>
                            </div>
                        </motion.div>
                    )}

                    {rightTab === 'Estações de TV' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{fontSize: '12px', color: theme.textMain, marginBottom: '15px', fontWeight: 'bold'}}>📺 Transmissões Oficiais (Canais)</div>
                            {jogoSelecionado.tvstations?.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                    {jogoSelecionado.tvstations.map(tv => (
                                        <a key={tv.id} href={tv.url || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: theme.bgApp, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, textDecoration: 'none', color: theme.textMain }}>
                                            <img src={tv.image} style={{ width: '24px', height: '24px', objectFit: 'contain' }} alt="tv" />
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tv.name}</span>
                                        </a>
                                    ))}
                                </div>
                            ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '13px', background: theme.bgApp, borderRadius: '12px', border: `1px dashed ${theme.border}`}}>Nenhuma transmissão encontrada para esta partida.</div>}
                        </motion.div>
                    )}

                    {rightTab === 'Detalhes' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{background: theme.bgApp, borderRadius: '12px', padding: '16px', marginBottom: '25px', border: `1px solid ${theme.border}`}}><div style={{fontSize: '11px', color: theme.textMuted, marginBottom: '12px', fontWeight: 'bold', textTransform: 'uppercase'}}>Local da Partida</div><div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: theme.textMain}}><span style={{fontSize: '18px'}}>🏟️</span> <span style={{fontWeight: '500'}}>{jogoSelecionado.venue}</span></div></div>
                            {jogoSelecionado.events?.length > 0 && (
                                <div style={{marginBottom: '25px'}}>
                                    <div style={{fontSize: '12px', color: theme.textMain, marginBottom: '15px', fontWeight: 'bold'}}>⏱️ Timeline do Jogo</div>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative'}}>
                                        <div style={{position: 'absolute', top: 0, bottom: 0, left: '19px', width: '2px', background: theme.border}}></div>
                                        {[...(jogoSelecionado.events || [])].sort((a,b)=>(a.minute || 0) - (b.minute || 0)).map(ev => {
                                            const isHome = ev.participant_id === jogoSelecionado.home_id; const isSub = ev.type?.code?.includes('sub'); const icon = ev.type?.code?.includes('goal') ? '⚽' : ev.type?.code?.includes('yellow') ? '🟨' : ev.type?.code?.includes('red') ? '🟥' : isSub ? '🔄' : '📌';
                                            return ( <div key={ev.id} style={{display: 'flex', alignItems: 'center', gap: '15px', zIndex: 1}}><div style={{width: '40px', height: '24px', background: theme.bgApp, border: `1px solid ${theme.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: theme.cyan}}>{ev.minute}'</div><div style={{background: theme.bgHover, padding: '10px 15px', borderRadius: '8px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.border}`}}><div style={{fontSize: '12px', color: theme.textMain}}><span style={{marginRight: '8px', fontSize: '14px'}}>{icon}</span>{isSub && ev.related_player_name ? <span>{ev.related_player_name} <span style={{color: theme.green}}>⬆</span> <span style={{color: theme.textMuted, fontSize: '10px'}}>{ev.player_name} ⬇</span></span> : (ev.player_name || 'Jogador')}</div><div style={{fontSize: '10px', color: isHome ? theme.cyan : theme.yellow}}>{isHome ? 'CASA' : 'FORA'}</div></div></div> )
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                    
                    {/* 👇 AQUI ESTÁ A CORREÇÃO DA TELA PRETA: VERIFICAÇÃO DE ARRAY E STRING 👇 */}
                    {rightTab === 'Estatísticas' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{height: '150px', width: '100%', marginBottom: '25px', background: theme.bgApp, padding: '10px', borderRadius: '12px', border: `1px solid ${theme.border}`}}><ResponsiveContainer width="100%" height="100%"><LineChart data={generateMockMomentum()}><XAxis dataKey="time" hide /><YAxis domain={[-60, 60]} hide /><Line type="stepAfter" dataKey="pressao" stroke={theme.cyan} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
                            {(estatisticas || jogoSelecionado.stats) && Array.isArray(estatisticas || jogoSelecionado.stats) ? ( 
                                <div style={{background: theme.bgApp, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                                    {(estatisticas || jogoSelecionado.stats).map((s, index) => { 
                                        if(!s) return null; 
                                        let type = s.type?.name || s.type || 'Dado'; 
                                        let typeStr = String(type);
                                        let home = s.home || s.value || s.data?.value || 0; 
                                        let away = s.away || s.value || s.data?.value || 0; 
                                        const labelPt = typeStr.replace('Ball Possession %', 'Posse de Bola').replace('Total Shots', 'Chutes').replace('Corner Kicks', 'Escanteios'); 
                                        return <StatRow key={index} label={labelPt} home={home} away={away} isPercent={typeStr.includes('Possession') || typeStr.includes('%')} /> 
                                    })}
                                </div> 
                            ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '12px'}}>Aguardando Dados...</div>}
                        </motion.div>
                    )}

                    {rightTab === 'Probs' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {jogoSelecionado.predictions?.length > 0 ? (
                                <>
                                    {getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY') && (
                                        <div style={{marginBottom: '25px', background: theme.bgApp, padding: '18px', borderRadius: '12px', border: `1px solid ${theme.border}`}}><div style={{fontSize: '11px', color: theme.textMuted, marginBottom: '12px', fontWeight: 'bold'}}>Resultado Final (1X2)</div><div style={{display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px'}}><div style={{width: `${getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY').home}%`, background: theme.cyan}}></div><div style={{width: `${getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY').draw}%`, background: theme.textMuted}}></div><div style={{width: `${getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY').away}%`, background: theme.yellow}}></div></div><div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold'}}><span style={{color: theme.cyan}}>Casa: {getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY').home}%</span><span style={{color: theme.textMuted}}>Emp: {getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY').draw}%</span><span style={{color: theme.yellow}}>Fora: {getPrediction(jogoSelecionado.predictions, 'FULLTIME_RESULT_PROBABILITY').away}%</span></div></div>
                                    )}
                                    {getPrediction(jogoSelecionado.predictions, 'BTTS_PROBABILITY') && (
                                        <div style={{marginBottom: '25px', background: theme.bgApp, padding: '18px', borderRadius: '12px', border: `1px solid ${theme.border}`}}><div style={{fontSize: '11px', color: theme.textMuted, marginBottom: '12px', fontWeight: 'bold'}}>Ambas Marcam (BTTS)</div><div style={{display: 'flex', justifyContent: 'space-between'}}><div style={{color: theme.green, fontWeight: '800'}}>{getPrediction(jogoSelecionado.predictions, 'BTTS_PROBABILITY').yes}% SIM</div><div style={{color: theme.red, fontWeight: '800'}}>{getPrediction(jogoSelecionado.predictions, 'BTTS_PROBABILITY').no}% NÃO</div></div></div>
                                    )}
                                </>
                            ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '13px'}}>Modelos indisponíveis.</div>}
                        </motion.div>
                    )}
                    {rightTab === 'Escalações' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {jogoSelecionado.lineups?.length > 0 ? (
                                <div style={{display: 'flex', gap: '15px'}}>
                                    <div style={{flex: 1}}>
                                        <div style={{fontSize: '12px', color: theme.cyan, marginBottom: '15px', fontWeight: 'bold', textAlign: 'center'}}>{jogoSelecionado.home_team}</div>
                                        {jogoSelecionado.lineups.filter(l => l.team_id === jogoSelecionado.home_id && l.formation_position).sort((a,b)=>a.formation_position - b.formation_position).map(p => (
                                            <div key={p.id} onClick={() => { setAbaGeralAtiva('jogador'); carregarPerfilJogador(); }} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: theme.bgApp, padding: '10px', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${theme.border}`}}>
                                                <span style={{width: '24px', height: '24px', borderRadius: '4px', background: theme.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: theme.textMain}}>{p.jersey_number || '-'}</span>
                                                <span style={{fontSize: '12px', color: theme.textMuted, overflow: 'hidden'}}>{p.player_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{flex: 1}}>
                                        <div style={{fontSize: '12px', color: theme.yellow, marginBottom: '15px', fontWeight: 'bold', textAlign: 'center'}}>{jogoSelecionado.away_team}</div>
                                        {jogoSelecionado.lineups.filter(l => l.team_id === jogoSelecionado.away_id && l.formation_position).sort((a,b)=>a.formation_position - b.formation_position).map(p => (
                                            <div key={p.id} onClick={() => { setAbaGeralAtiva('jogador'); carregarPerfilJogador(); }} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: theme.bgApp, padding: '10px', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${theme.border}`, flexDirection: 'row-reverse'}}>
                                                <span style={{width: '24px', height: '24px', borderRadius: '4px', background: theme.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: theme.textMain}}>{p.jersey_number || '-'}</span>
                                                <span style={{fontSize: '12px', color: theme.textMuted, overflow: 'hidden'}}>{p.player_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '13px', background: theme.bgApp, borderRadius: '12px', border: `1px dashed ${theme.border}`}}>Escalações ainda não divulgadas.</div>}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function StatRow({ label, home, away }) {
  const homeVal = Number(home) || 0; const awayVal = Number(away) || 0; const total = homeVal + awayVal;
  const homeP = total > 0 ? Math.round((homeVal/total)*100) : 50; const awayP = total > 0 ? Math.round((awayVal/total)*100) : 50;
  return (
    <div style={{ margin: '15px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}><span>{homeVal}</span><span style={{fontWeight: 'bold', textTransform: 'uppercase'}}>{label}</span><span>{awayVal}</span></div>
      <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ flex: 1, height: '6px', backgroundColor: theme.border, display: 'flex', justifyContent: 'flex-end', borderRadius: '3px' }}><div style={{ width: `${homeP}%`, backgroundColor: theme.cyan }}/></div>
          <div style={{ flex: 1, height: '6px', backgroundColor: theme.border, borderRadius: '3px' }}><div style={{ width: `${awayP}%`, backgroundColor: theme.yellow }}/></div>
      </div>
    </div>
  );
}

function ClassificacaoPanel({ menuAtivo, loadingClassificacao, classificacao }) {
    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={{background: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', padding: '20px'}}>
            {menuAtivo === 'todos' || menuAtivo === 'todos os jogos' || menuAtivo === 'esportes' ? (
                <div style={{textAlign: 'center', color: theme.textMuted, padding: '40px 0'}}><span style={{fontSize: '30px', display: 'block', marginBottom: '10px'}}>🏆</span>Selecione uma liga no menu lateral.</div>
            ) : loadingClassificacao ? (
                <div style={{textAlign: 'center', color: theme.cyan, padding: '40px 0', fontWeight: 'bold'}}>Calculando...</div>
            ) : (
                <div style={{overflowX: 'auto'}}><table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.textMain, fontSize: '13px'}}><thead><tr style={{borderBottom: `1px solid ${theme.border}`, color: theme.textMuted}}><th>#</th><th>Equipe</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr></thead><tbody>{classificacao.map((t, i) => (<tr key={i} style={{borderBottom: `1px solid rgba(255,255,255,0.02)`}}><td style={{padding: '12px 8px', color: theme.cyan}}>{t.position}</td><td style={{padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px'}}><img src={t.logo} style={{width: '24px'}} alt="" />{t.team_name}</td><td>{t.points}</td><td>{t.matches_played}</td><td>{t.won}</td><td>{t.draw}</td><td>{t.lost}</td><td>{t.goal_diff}</td></tr>))}</tbody></table></div>
            )}
        </motion.div>
    );
}

function ModalsExtras({ menuAtivo, isMobile, dadosPix, form, setForm, setDadosPix, setMenuAtivo, bancaData }) {
    return (
        <>
            {menuAtivo === "assinar pro" && ( <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: isMobile ? '65px' : 0, background: 'rgba(9,10,15,0.95)', zIndex: 200, padding: '40px 20px', textAlign: 'center'}}><div style={{maxWidth: '500px', margin: '0 auto'}}><h1 style={{color: theme.cyan}}>VIP PRO 👑</h1>{!dadosPix ? ( <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}><input placeholder="E-mail" style={{padding: '18px'}} onChange={e => setForm({...form, email: e.target.value})} /><button style={{padding: '18px', background: theme.cyan, color: '#000'}} onClick={() => { if(!form.email) return; setDadosPix({ id_pagamento: 12345 });}}>Gerar PIX</button><button onClick={() => setMenuAtivo('todos')} style={{color: theme.textMuted, background: 'none', border: 'none'}}>Voltar</button></div> ) : ( <div style={{background: theme.bgPanel, padding: '40px', border: `1px dashed ${theme.cyan}`}}><h3 style={{color: theme.cyan}}>PIX Gerado!</h3></div> )}</div></div> )}
            {menuAtivo === "gestão de banca" && ( <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: isMobile ? '65px' : 0, background: 'rgba(9,10,15,0.95)', zIndex: 200, padding: '30px', textAlign: 'center'}}><button onClick={() => setMenuAtivo('todos')} style={{color: theme.textMuted, background: 'none', border: 'none'}}>⬅ Voltar</button><h2 style={{color: theme.cyan}}>Banca</h2><div style={{height: '300px', maxWidth: '800px', margin: '0 auto'}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={bancaData.length ? bancaData : [{name:'Seg',val:100},{name:'Ter',val:120}]}><XAxis dataKey="name" /><Area type="monotone" dataKey="val" stroke={theme.cyan} fill={theme.cyan} fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div></div> )}
        </>
    );
}

function AuthModal({ showLoginMenu, setShowLoginMenu, authMode, setAuthMode, loginEmail, setLoginEmail, loginSenha, setLoginSenha, handleLogin, handleCadastro }) {
    if (!showLoginMenu) return null;
    return ( <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,10,15,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: theme.bgPanel, padding: '40px 30px', width: '90%', maxWidth: '400px' }}><h2 style={{ color: '#fff', textAlign: 'center' }}>Acesso</h2><div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}><button onClick={() => setAuthMode('login')} style={{flex: 1, padding: '12px', background: authMode === 'login' ? theme.cyan : 'transparent'}}>Entrar</button><button onClick={() => setAuthMode('register')} style={{flex: 1, padding: '12px', background: authMode === 'register' ? theme.cyan : 'transparent'}}>Cadastrar</button></div><input placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{width: '100%', padding: '15px', marginBottom: '15px'}} /><input placeholder="Senha" type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} style={{width: '100%', padding: '15px', marginBottom: '25px'}} /><button style={{width: '100%', padding: '15px', background: theme.cyan, fontWeight: 'bold'}} onClick={authMode === 'login' ? handleLogin : handleCadastro}>CONTINUAR</button><button style={{width: '100%', padding: '10px', background: 'transparent', color: theme.textMuted}} onClick={() => setShowLoginMenu(false)}>Cancelar</button></motion.div></div> );
}