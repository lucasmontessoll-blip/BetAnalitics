import React, { useState, useEffect, useMemo } from 'react';
import './app.css'; // O CSS que garante o visual Premium!
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'; 

// 🔑 CHAVES E CONFIGURAÇÕES DO MOTOR VIP
const API_SPORTS_KEY = "7ff15d43907d5138e48674b29ab56a65";
const EMAILS_VIP_MESTRE = ['admin@nexus.com']; 
initMercadoPago('APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc', { locale: 'pt-BR' });
const API_URL = 'https://betanalitics-q0fq.onrender.com';

// 🎨 TEMA PREMIUM EXATO
const theme = { bgApp: '#090C15', bgSidebar: '#111623', bgPanel: '#111623', bgHover: '#181E2E', border: '#1E2536', accent: '#FFC107', blue: '#0D6EFD', green: '#198754', red: '#DC3545', textMain: '#FFFFFF', textMuted: '#8B95A9' };

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
const getWeekDays = (b) => Array.from({length: 7}, (_, i) => { const d = new Date(b + "T12:00:00Z"); d.setDate(d.getDate() + i - 3); return { iso: d.toISOString().split('T')[0], nome: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()], dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}` }; });
const generateMomentum = () => Array.from({length: 90}, (_, i) => ({ time: i, pressaoHome: Math.max(0, Math.sin(i/5)*50 + Math.random()*50), pressaoAway: Math.max(0, Math.cos(i/4)*40 + Math.random()*40) }));

const listaLigas = [
  {name:'Todos os Jogos', icon:'🌍', id: null}, {name:'Serie A', icon:'🇧🇷', id: 71}, {name:'Liga dos Campeões', icon:'⭐', id: 2}, {name:'Copa Libertadores', icon:'🌎', id: 13}, {name:'La Liga', icon:'🇪🇸', id: 140}, {name:'Premier League', icon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', id: 39}, {name:'Copa do Brasil', icon:'🏆', id: 73}, {name:'Serie B', icon:'🇧🇷', id: 72}
];

const mapaTemporadas = { 71: 2026, 72: 2026, 73: 2026, 13: 2026, 2: 2025, 39: 2025, 140: 2025 };

// 📄 CONTEÚDO PARA APROVAÇÃO DO ADSENSE (BLOG E LEGAL)
const artigosBlog = [
    { id: 1, titulo: "O que é Valor Esperado (EV+) nas Apostas Esportivas?", data: "15 Mai 2026", conteudo: "No universo das análises desportivas, a métrica mais importante não é a taxa de acerto, mas sim o Valor Esperado (EV). O EV+ ocorre quando a probabilidade real de um evento acontecer é maior do que a probabilidade implícita oferecida pelas odds do mercado. O nosso Algoritmo Proprietário cruza dados de forma recente, poder ofensivo e confrontos diretos para encontrar estas discrepâncias matemáticas. Apostar com EV+ significa que, a longo prazo, a matemática trabalhará a seu favor, removendo o viés emocional das decisões." },
    { id: 2, titulo: "Como a Distribuição de Poisson Modela Jogos de Futebol", data: "10 Mai 2026", conteudo: "A Distribuição de Poisson é um conceito matemático frequentemente utilizado para prever a probabilidade de um número específico de eventos ocorrer num intervalo fixo de tempo. No futebol, aplicamos esta teoria para calcular a probabilidade de uma equipa marcar x golos com base no seu poder de ataque e na força defensiva do adversário. O Motor BetAnalytics vai além do Poisson tradicional, injetando variáveis de momento (forma) e histórico (H2H) para criar uma linha de probabilidade justa." }
];

const SkeletonMatch = () => ( <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ background: theme.bgPanel, padding: '10px 15px', borderRadius: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}> <div style={{ width: '40px', height: '12px', background: theme.bgHover, borderRadius: '4px' }}></div> <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}> <div style={{ width: '30%', height: '12px', background: theme.bgHover, borderRadius: '4px' }}></div> <div style={{ width: '40px', height: '24px', background: theme.bgHover, borderRadius: '6px' }}></div> <div style={{ width: '30%', height: '12px', background: theme.bgHover, borderRadius: '4px' }}></div> </div> </motion.div> );
const SkeletonVIP = () => ( <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ padding: '20px' }}> <div style={{ width: '100%', height: '80px', background: theme.bgHover, borderRadius: '12px', marginBottom: '15px' }}></div> <div style={{ width: '100%', height: '150px', background: theme.bgHover, borderRadius: '12px', marginBottom: '15px' }}></div> <div style={{ width: '100%', height: '150px', background: theme.bgHover, borderRadius: '12px' }}></div> </motion.div> );
const renderForm = (fS) => { if (!fS) return <span style={{color: theme.textMuted, fontSize: '10px'}}>-</span>; return fS.split('').map((c, i) => ( <span key={i} style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '3px', background: c === 'W' ? theme.green : c === 'D' ? theme.textMuted : theme.red, color: '#fff', fontSize: '9px', textAlign: 'center', lineHeight: '14px', margin: '0 1px', fontWeight: 'bold' }}>{c}</span> )); };

// 🔥 MOTOR MATEMÁTICO PROPRIETÁRIO BETANALYTICS
const calcularAlgoritmoBetAnalytics = (predData) => {
    if(!predData) return { h: 33, d: 34, a: 33 };
    const getFormScore = (form) => { if(!form) return 1; return form.split('').reduce((acc, char) => acc + (char==='W'?3:char==='D'?1:0), 0); };
    const homeForm = getFormScore(predData.teams?.home?.league?.form); const awayForm = getFormScore(predData.teams?.away?.league?.form);
    const homeGoals = predData.teams?.home?.last_5?.goals?.for?.total || 1; const awayGoals = predData.teams?.away?.last_5?.goals?.for?.total || 1;
    const homeDefesa = predData.teams?.home?.last_5?.goals?.against?.total || 1; const awayDefesa = predData.teams?.away?.last_5?.goals?.against?.total || 1; 

    let homeH2H = 1, awayH2H = 1, drawH2H = 1;
    if(predData.h2h && predData.h2h.length > 0) {
        predData.h2h.slice(0,5).forEach(m => {
            if(m.teams.home.winner) homeH2H += 2.5; else if(m.teams.away.winner) awayH2H += 2.5; else drawH2H += 1.5;
        });
    }

    let scoreH = (homeForm * 1.5) + (homeGoals * 2) - (homeDefesa * 0.5) + (homeH2H * 1.2) + 2; 
    let scoreA = (awayForm * 1.5) + (awayGoals * 2) - (awayDefesa * 0.5) + (awayH2H * 1.2);
    let scoreD = ((homeForm + awayForm) / 2.5) + drawH2H; 
    if (Math.abs(scoreH - scoreA) < 4) scoreD *= 1.6; 
    scoreH = Math.max(scoreH, 1); scoreA = Math.max(scoreA, 1); scoreD = Math.max(scoreD, 1);
    const total = scoreH + scoreA + scoreD;

    return { h: Math.round((scoreH / total) * 100), d: Math.round((scoreD / total) * 100), a: Math.round((scoreA / total) * 100) };
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [showMobileLigas, setShowMobileLigas] = useState(false); 
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [jogos, setJogos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [busca, setBusca] = useState(''); 
  const [dataFiltro, setDataFiltro] = useState(getLocalYYYYMMDD()); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [abaLegal, setAbaLegal] = useState('termos');
  const [classificacao, setClassificacao] = useState([]); 
  const [loadingClassificacao, setLoadingClassificacao] = useState(false); 
  const [erroDaClassificacao, setErroDaClassificacao] = useState(''); 
  const [rightTab, setRightTab] = useState('Estatísticas'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [showLoginMenu, setShowLoginMenu] = useState(false); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [favoritos, setFavoritos] = useState([]); 
  const [generoAtivo, setGeneroAtivo] = useState('Masculino'); 
  const [authMode, setAuthMode] = useState('login'); 
  const [loginEmail, setLoginEmail] = useState(''); 
  const [loginSenha, setLoginSenha] = useState(''); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  const [showProfileMenu, setShowProfileMenu] = useState(false); 
  const [abaGeralAtiva, setAbaGeralAtiva] = useState('dashboard'); 

  const diasSemana = getWeekDays(dataFiltro);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { const hR = () => setIsMobile(window.innerWidth <= 1024); window.addEventListener('resize', hR); return () => window.removeEventListener('resize', hR); }, []);
  useEffect(() => { const em = localStorage.getItem('bet_sessao_ativa'); if (em) { if (EMAILS_VIP_MESTRE.includes(em.toLowerCase().trim())) setUserData({ email: em, is_vip: true }); else { try { const us = JSON.parse(localStorage.getItem('bet_users')||'{}'); if(us[em]) setUserData(us[em]); }catch(e){} } } }, []);
  useEffect(() => { if (menuAtivo !== "assinar pro") carregarDadosEsporte(false); }, [dataFiltro]);
  useEffect(() => { if (viewMode === 'classificacao') carregarClassificacao(); }, [viewMode, ligaAtivaId]);

  const aplicarFiltros = (j, lId) => { 
      if (!j?.length) return setJogos([]); 
      setJogos(j.filter(x => { 
          const ln = (x.league_name||"").toLowerCase(); 
          const isFem = ln.includes('women') || ln.includes('feminino') || ln.includes('femenina') || ln.includes('liga f');
          if (generoAtivo === 'Masculino' && isFem) return false; 
          if (generoAtivo === 'Feminino' && !isFem) return false;
          if (lId === null) return true; 
          return x.league_id === lId; 
      })); 
  };

  const carregarClassificacao = async () => { 
      if (!ligaAtivaId) { setClassificacao([]); setErroDaClassificacao(''); return; }
      setLoadingClassificacao(true); 
      setErroDaClassificacao('');
      try {
          const sid = mapaTemporadas[ligaAtivaId] || new Date().getFullYear();
          const res = await axios.get('https://v3.football.api-sports.io/standings', { params: { league: ligaAtivaId, season: sid }, headers: { 'x-apisports-key': API_SPORTS_KEY } });
          
          if (res.data.errors && Object.keys(res.data.errors).length > 0) {
              setErroDaClassificacao("⚠️ Erro na API: Limite de consultas diárias excedido.");
              setClassificacao([]);
              setLoadingClassificacao(false);
              return;
          }

          const tableData = res.data.response[0]?.league?.standings[0] || [];
          setClassificacao(tableData.map(t => ({ pos: t.rank, team_id: t.team.id, team_name: t.team.name, logo: t.team.logo, pts: t.points, p: t.all.played, w: t.all.win, d: t.all.draw, l: t.all.lose, gd: t.goalsDiff })));
      } catch (e) { 
          setErroDaClassificacao("⚠️ Falha ao contactar o servidor da API. Verifique a sua ligação.");
          setClassificacao([]); 
      } finally { setLoadingClassificacao(false); }
  };

  const carregarDadosEsporte = async (forcar = false) => {
    setLoading(true); const CK = `bet_api_${dataFiltro}`; const CTK = `bet_time_${dataFiltro}`;
    if (!forcar) { const ds = localStorage.getItem(CK); const ts = localStorage.getItem(CTK); if (ds && ts && (new Date().getTime() - parseInt(ts) < 1800000)) { aplicarFiltros(JSON.parse(ds), ligaAtivaId); setLoading(false); return; } }
    
    try {
      const res = await axios.get('https://v3.football.api-sports.io/fixtures', { params: { date: dataFiltro, timezone: 'America/Sao_Paulo' }, headers: { 'x-apisports-key': API_SPORTS_KEY } });
      const jF = (res.data?.response||[]).map(f => {
          let st = 'Not Started'; if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(f.fixture.status.short)) st = 'Live'; if (['FT', 'AET', 'PEN'].includes(f.fixture.status.short)) st = 'Finished';
          return { id: f.fixture.id, league_id: f.league.id, league_season: f.league.season, league_name: f.league.name, league_country: f.league.country, league_flag: f.league.flag, starting_at: f.fixture.date, status: st, time_elapsed: f.fixture.status.elapsed, home_team: f.teams.home.name, home_id: f.teams.home.id, away_team: f.teams.away.name, away_id: f.teams.away.id, home_image: f.teams.home.logo, away_image: f.teams.away.logo, scoreHome: f.goals.home ?? null, scoreAway: f.goals.away ?? null, dados_vip: false };
      });
      localStorage.setItem(CK, JSON.stringify(jF)); localStorage.setItem(CTK, new Date().getTime().toString()); aplicarFiltros(jF, ligaAtivaId); 
    } catch (e) {} finally { setLoading(false); }
  };

  const abrirPainelDoJogo = async (j) => {
    if(!userData?.is_vip) { setShowProfileMenu(true); return alert("🔒 Acesso VIP PRO requerido."); }
    setRightTab('% Probs'); 
    if (j.dados_vip) return setJogoSelecionado(j); 
    setJogoSelecionado({ ...j, is_loading: true });
    try {
      const HDR = { 'x-apisports-key': API_SPORTS_KEY }; const PRM = { fixture: j.id }; const isAoVivo = j.status !== 'Not Started';
      const reqs = [ axios.get('https://v3.football.api-sports.io/predictions',{params:PRM,headers:HDR}).catch(()=>({data:{response:[]}})), axios.get('https://v3.football.api-sports.io/fixtures/lineups',{params:PRM,headers:HDR}).catch(()=>({data:{response:[]}})), axios.get('https://v3.football.api-sports.io/odds',{params:PRM,headers:HDR}).catch(()=>({data:{response:[]}})) ];
      if (isAoVivo) { reqs.push(axios.get('https://v3.football.api-sports.io/fixtures/statistics',{params:PRM,headers:HDR}).catch(()=>({data:{response:[]}}))); reqs.push(axios.get('https://v3.football.api-sports.io/fixtures/players',{params:PRM,headers:HDR}).catch(()=>({data:{response:[]}}))); }
      const res = await Promise.all(reqs);
      const dP = res[0].data?.response?.[0]||null; const dL = res[1].data?.response||[]; const dO = res[2].data?.response?.[0]?.bookmakers?.find(b=>b.id===8)||res[2].data?.response?.[0]?.bookmakers?.[0]||null; const dS = isAoVivo?res[3].data?.response||[]:[]; const dPl = isAoVivo?res[4].data?.response||[]:[];

      const probabilidadeReal = calcularAlgoritmoBetAnalytics(dP);
      let oddW = dO?.bets?.find(b=>b.name==='Match Winner')?.values||[];

      let h2hStr = "-"; if (dP?.h2h) { let wH=0, d=0, wA=0; dP.h2h.slice(0,5).forEach(x=>{if(x.teams.home.winner)wH++;else if(x.teams.away.winner)wA++;else d++;}); h2hStr=`${wH} Vit. Casa | ${d} Emp | ${wA} Vit. Fora`; }
      const vL = { home: dL.find(x=>x.team.id===j.home_id)||null, away: dL.find(x=>x.team.id===j.away_id)||null };
      const vS = { home: dS.find(x=>x.team.id===j.home_id)?.statistics||[], away: dS.find(x=>x.team.id===j.away_id)?.statistics||[] };
      const sts = vS.home.map(h=>{ const a=vS.away.find(x=>x.type===h.type); return { type: h.type, h: parseInt(h.value)||0, a: parseInt(a?.value)||0 }; });

      let topJogadores = []; if (dPl.length > 0) { const homeP = dPl.find(p => p.team.id === j.home_id)?.players || []; const awayP = dPl.find(p => p.team.id === j.away_id)?.players || []; topJogadores = [...homeP, ...awayP].map(p => { const stats = p.statistics[0] || {}; return { name: p.player.name, team_logo: stats.team?.logo || '', rating: parseFloat(stats.games?.rating || 0).toFixed(1), shots: stats.shots?.total || 0, passes: stats.passes?.accuracy || 0 }; }).sort((a, b) => b.rating - a.rating).filter(p => p.rating > 0).slice(0, 4); }

      const jU = { ...j, dados_vip: true, is_loading: false, probs: probabilidadeReal, odds: oddW, advice: dP?.predictions?.advice||"-", fH: dP?.teams?.home?.league?.form||'', fA: dP?.teams?.away?.league?.form||'', h2h: h2hStr, tatH: vL.home?.formation||'-', tatA: vL.away?.formation||'-', coachH: vL.home?.coach?.name||'-', coachA: vL.away?.coach?.name||'-', linH: vL.home?.startXI||[], linA: vL.away?.startXI||[], subsH: vL.home?.substitutes||[], subsA: vL.away?.substitutes||[], stats_reais: sts, top_jogadores: topJogadores };
      setJogos(pJ => { const nJ = pJ.map(o => o.id === j.id ? jU : o); localStorage.setItem(`bet_api_${dataFiltro}`, JSON.stringify(nJ)); return nJ; }); setJogoSelecionado(jU);
    } catch (e) { setJogoSelecionado({ ...j, is_loading: false, err: true, dados_vip: true }); }
  };

  const handleLogin = async () => {
    const e = loginEmail.trim().toLowerCase(); if (!e || !loginSenha) return alert("❌ Preencha E-mail e Senha.");
    if (EMAILS_VIP_MESTRE.includes(e)) { setUserData({ email: e, is_vip: true }); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); return; }
    let bL = {}; try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(err) {}
    if (bL[e] && bL[e].password === loginSenha) { setUserData(bL[e]); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); } else { alert("❌ E-mail ou Senha incorretos."); }
  };

  const handleCadastro = async () => {
    const e = loginEmail.trim().toLowerCase(); if (!e || !loginSenha) return alert("❌ E-mail/Senha."); let bL = {}; try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(err) {}
    if (bL[e]) return alert("❌ E-mail já existe!"); bL[e] = { email: e, password: loginSenha, is_vip: false }; localStorage.setItem('bet_users', JSON.stringify(bL)); setUserData({ email: e, is_vip: false }); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); alert("✅ Conta criada!");
  };

  const toggleFavorito = (e, id) => { e.stopPropagation(); setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]); };

  let jFilt = (jogos||[]).filter(j => { 
      let mB = (j.home_team||"").toLowerCase().includes(busca.toLowerCase()) || (j.away_team||"").toLowerCase().includes(busca.toLowerCase()); 
      let mF = filterCentro === 'Ao Vivo' ? j.status==='Live' : filterCentro === 'Próximo' ? j.status==='Not Started' : filterCentro === 'Terminado' ? j.status==='Finished' : true; 
      return mB && mF; 
  }).sort((a,b) => new Date(a.starting_at||0) - new Date(b.starting_at||0));
  
  const jGrp = jFilt.reduce((a, j) => { const ln = `${j.league_name} - ${j.league_country}`; if (!a[ln]) a[ln] = { flag: j.league_flag, games: [] }; a[ln].games.push(j); return a; }, {});

  useEffect(() => { const ds = localStorage.getItem(`bet_api_${dataFiltro}`); if(ds) aplicarFiltros(JSON.parse(ds), ligaAtivaId); }, [generoAtivo, ligaAtivaId]);

  if (showSplash) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: theme.bgApp, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div style={{fontSize: '80px', marginBottom: '10px', textAlign: 'center'}}>⚽</div>
         </motion.div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '2px', textShadow: `0 0 20px ${theme.blue}` }}>
            BET<span style={{ color: theme.blue }}>ANALYTICS</span>
         </motion.div>
         <div style={{ marginTop: '30px', fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '3px' }}>A iniciar Motor Matemático...</div>
         <div style={{ width: '200px', height: '4px', background: theme.bgHover, marginTop: '10px', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 2.2, ease: "easeInOut" }} style={{ height: '100%', background: theme.blue, boxShadow: `0 0 10px ${theme.blue}` }} />
         </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      
      {/* ⬅️ SIDEBAR (APENAS COMPUTADOR) */}
      {!isMobile && (
        <aside className="sidebar">
            <div style={{ padding: '20px' }}>
                <div style={{ background: theme.bgHover, borderRadius: '20px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{color: theme.textMuted}}>🔍</span><input type="text" placeholder="Pesquisar equipa..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ background:'transparent', border:'none', color:'#fff', outline:'none', width:'100%', fontSize:'13px' }}/></div>
            </div>
            
            <div style={{ padding: '0 20px', fontSize: '11px', color: theme.textMuted, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Menu Principal</div>
            <div style={{ padding: '0 10px', marginBottom: '20px' }}>
                <button onClick={() => {setViewMode('jogos'); setLigaAtivaId(null); setMenuAtivo('Todos os Jogos');}} style={{ width:'100%', padding:'10px', background: viewMode==='jogos'?theme.bgPanel:'transparent', color: viewMode==='jogos'?theme.blue:theme.textMain, border:'none', borderRadius:'8px', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', fontWeight:'bold', marginBottom:'5px' }}><span>🏠</span> Página Inicial</button>
                <button onClick={() => setViewMode('blog')} style={{ width:'100%', padding:'10px', background: viewMode==='blog'?theme.bgPanel:'transparent', color: viewMode==='blog'?theme.blue:theme.textMain, border:'none', borderRadius:'8px', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', fontWeight:'bold' }}><span>📰</span> Blog & Análises</button>
            </div>

            <div style={{ padding: '0 20px', fontSize: '11px', color: theme.textMuted, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Principais Ligas</div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 10px' }} className="custom-scrollbar">
                {listaLigas.filter(l => l.id !== null).map(l => (
                    <button key={l.name} onClick={()=>{setMenuAtivo(l.name); setLigaAtivaId(l.id); setViewMode('jogos');}} style={{ width:'100%', padding:'10px', background: menuAtivo===l.name&&viewMode!=='blog'?theme.bgPanel:'transparent', color: menuAtivo===l.name&&viewMode!=='blog'?theme.accent:theme.textMain, border:'none', borderRadius:'8px', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', fontWeight:'500' }}><span>{l.icon}</span> {l.name}</button>
                ))}
            </div>
        </aside>
      )}

      {/* ⚪ CENTRO */}
      <main className="main-area custom-scrollbar">
          <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
              <div className="top-header">
                  <div className="logo"><h1>⚽ BET<span>ANALYTICS</span></h1></div>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ background: 'rgba(13, 110, 253, 0.1)', color: theme.blue, border: `1px solid ${theme.blue}`, borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{userData?.is_vip ? '👑' : '👤'}</button>
                    {showProfileMenu && (
                        <div style={{ position: 'absolute', top: '50px', right: 0, background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '15px', width: '220px', zIndex: 100 }}>
                            {!userData ? <button onClick={() => { setShowProfileMenu(false); setShowLoginMenu(true); }} className="btn-primary">Entrar</button> : <div style={{ color: theme.accent, textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>{userData.email}</div>}
                            <div style={{ marginTop: '10px', borderTop: `1px solid ${theme.border}`, paddingTop: '10px' }}>
                                <div style={{ padding: '8px', cursor: 'pointer', fontSize:'13px', color: '#fff', fontWeight: 'bold' }} onClick={() => {setMenuAtivo('assinar pro'); setShowProfileMenu(false);}}>👑 Assinar VIP PRO</div>
                                {userData && <div onClick={() => { setUserData(null); localStorage.removeItem('bet_sessao_ativa'); setShowProfileMenu(false); }} style={{ padding: '8px', cursor: 'pointer', color: theme.red, fontSize:'13px' }}>🚪 Sair</div>}
                            </div>
                        </div>
                    )}
                  </div>
              </div>
              
              {(viewMode === 'jogos' || viewMode === 'classificacao') && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="date-filters custom-scrollbar">
                          {diasSemana.map(d => { const isH = dataFiltro === d.iso; return <button key={d.iso} onClick={()=>{setDataFiltro(d.iso); setViewMode('jogos');}} className={`date-pill ${isH ? 'active' : ''}`}>{isH ? 'HOJE' : `${d.nome} ${d.dia}`}</button> })}
                      </div>
                      <div style={{ width: '100%', height: '1px', background: theme.border, marginBottom: '15px' }}></div>
                      <div style={{ display: 'flex', gap: '8px', background: theme.bgSidebar, padding: '4px', borderRadius: '20px' }}>
                          {['Todos', 'Ao Vivo', 'Próximo', 'Terminado'].map(f => ( <button key={f} onClick={()=>setFilterCentro(f)} style={{ padding: '6px 16px', background: filterCentro===f?theme.bgHover:'transparent', color: filterCentro===f?theme.textMain:theme.textMuted, borderRadius: '16px', border: filterCentro===f?`1px solid ${theme.border}`:'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>{f === 'Ao Vivo' && <span style={{width:'6px',height:'6px',background:theme.red,borderRadius:'50%'}}></span>}{f}</button> ))}
                      </div>
                      <button onClick={() => setViewMode('jogos')} style={{ padding: '6px 16px', background: viewMode==='jogos'?theme.blue:'transparent', color: viewMode==='jogos'?'#fff':theme.textMuted, borderRadius: '16px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>⚽ Partidas</button>
                      <button onClick={() => setViewMode('classificacao')} style={{ padding: '6px 16px', background: viewMode==='classificacao'?theme.blue:'transparent', color: viewMode==='classificacao'?'#fff':theme.textMuted, borderRadius: '16px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🏆 Classificação</button>
                  </div>
              )}
              {viewMode === 'blog' && <h2 style={{margin:0, fontSize:'20px', color:theme.textMain}}>Notícias e Educação Estatística</h2>}
              {viewMode === 'legal' && <h2 style={{margin:0, fontSize:'20px', color:theme.textMuted, textTransform:'uppercase'}}>Central de Transparência</h2>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingTop: '20px' }}>
              {loading && viewMode === 'jogos' && <><SkeletonMatch/><SkeletonMatch/><SkeletonMatch/></>}
              
              {viewMode === 'jogos' && !loading && Object.entries(jGrp).map(([ln, grp]) => (
                  <div key={ln} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', color: theme.textMuted, fontSize: '14px', fontWeight: 'bold' }}>
                          <img src={grp.flag || 'https://media.api-sports.io/flags/int.svg'} style={{ width:'20px', borderRadius:'2px' }} alt="" />
                          <div>{ln.split(' - ')[0]}</div>
                      </div>
                      <div className="games-grid">
                          {grp.games.map(j => {
                              const isFav = favoritos.includes(j.id); const isLive = j.status === 'Live';
                              return (
                                  <div key={j.id} className="match-card" onClick={() => abrirPainelDoJogo(j)}>
                                      <div className="card-header-bet">
                                          <span style={{ color: isLive ? theme.red : theme.textMuted, fontWeight: 'bold' }}>{isLive ? <motion.div animate={{opacity:[1,0,1]}} transition={{repeat:Infinity,duration:1}}>🔴 AO VIVO {j.time_elapsed}'</motion.div> : j.status === 'Finished' ? 'FINALIZADO' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>
                                          <span className="star-icon" onClick={(e) => toggleFavorito(e, j.id)} style={{ color: isFav ? theme.accent : theme.textMuted }}>{isFav ? '★' : '☆'}</span>
                                      </div>
                                      <div className="scoreboard-bet">
                                          <div className="team-col-bet">
                                              <img src={j.home_image} className="team-logo" alt=""/>
                                              <span className="team-name">{j.home_team}</span>
                                          </div>
                                          <div className="score-center" style={{ color: isLive ? theme.accent : theme.textMain }}>
                                              {j.status === 'Not Started' ? 'VS' : `${j.scoreHome} - ${j.scoreAway}`}
                                          </div>
                                          <div className="team-col-bet" style={{ flexDirection: 'row-reverse', textAlign: 'right' }}>
                                              <img src={j.away_image} className="team-logo" alt=""/>
                                              <span className="team-name">{j.away_team}</span>
                                          </div>
                                      </div>
                                      {!userData?.is_vip ? (
                                          <button className="btn-primary" style={{ background: theme.bgHover, color: theme.textMuted, fontSize: '12px', padding: '10px' }} onClick={(e) => { e.stopPropagation(); setMenuAtivo('assinar pro'); }}>🔒 Desbloquear Análise IA</button>
                                      ) : (
                                          <div className="odds-row-bet">
                                              <div className="odd-box"><div style={{fontSize: '10px', color: theme.textMuted}}>Casa</div><div className="odd-value">1.85</div></div>
                                              <div className="odd-box"><div style={{fontSize: '10px', color: theme.textMuted}}>Empate</div><div className="odd-value">3.40</div></div>
                                              <div className="odd-box"><div style={{fontSize: '10px', color: theme.textMuted}}>Fora</div><div className="odd-value">4.20</div></div>
                                          </div>
                                      )}
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              ))}
              
              {viewMode === 'classificacao' && <ClassificacaoPanel menuAtivo={menuAtivo} ligaAtivaId={ligaAtivaId} loadingClassificacao={loadingClassificacao} classificacao={classificacao} jogosHoje={jogos} jogoSelecionado={jogoSelecionado} erroDaClassificacao={erroDaClassificacao} />}
              
              {/* VISTA DO BLOG */}
              {viewMode === 'blog' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {artigosBlog.map(artigo => (
                          <div key={artigo.id} style={{ background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}>
                              <div style={{ fontSize: '12px', color: theme.blue, fontWeight: 'bold', marginBottom: '10px' }}>{artigo.data}</div>
                              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: theme.textMain }}>{artigo.titulo}</h3>
                              <p style={{ margin: 0, fontSize: '14px', color: theme.textMuted, lineHeight: '1.6' }}>{artigo.conteudo}</p>
                          </div>
                      ))}
                  </div>
              )}

              {/* VISTA LEGAL (TERMOS E PRIVACIDADE) */}
              {viewMode === 'legal' && (
                  <div style={{ background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px' }}>
                          <button onClick={() => setAbaLegal('termos')} style={{ padding: '8px 16px', background: abaLegal==='termos'?theme.blue:'transparent', color: abaLegal==='termos'?'#fff':theme.textMuted, borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'bold' }}>Termos de Uso</button>
                          <button onClick={() => setAbaLegal('privacidade')} style={{ padding: '8px 16px', background: abaLegal==='privacidade'?theme.blue:'transparent', color: abaLegal==='privacidade'?'#fff':theme.textMuted, borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'bold' }}>Privacidade</button>
                          <button onClick={() => setAbaLegal('contato')} style={{ padding: '8px 16px', background: abaLegal==='contato'?theme.blue:'transparent', color: abaLegal==='contato'?'#fff':theme.textMuted, borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'bold' }}>Contato</button>
                      </div>
                      
                      {abaLegal === 'termos' && (
                          <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6' }}>
                              <h3 style={{ color: '#fff' }}>1. Natureza do Serviço</h3>
                              <p>O BetAnalytics PRO é uma plataforma de fornecimento de dados estatísticos... <strong>Não somos uma casa de apostas.</strong></p>
                          </div>
                      )}
                      {abaLegal === 'privacidade' && (
                          <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6' }}>
                              <h3 style={{ color: '#fff' }}>Recolha e Uso de Dados</h3>
                              <p>O BetAnalytics respeita a sua privacidade. Recolhemos apenas os dados estritamente necessários...</p>
                          </div>
                      )}
                      {abaLegal === 'contato' && (
                          <div style={{ color: theme.textMuted, fontSize: '13px', lineHeight: '1.6' }}>
                              <h3 style={{ color: '#fff' }}>Fale Connosco</h3>
                              <div style={{ background: theme.bgApp, padding: '15px', borderRadius: '8px', border: `1px solid ${theme.border}`, marginTop: '15px' }}>
                                  <strong>Email de Suporte:</strong> contato@betanalytics.com
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* ⚠️ RODAPÉ DE DISCLAIMER ADSENSE */}
              <div style={{ marginTop: '40px', padding: '20px', borderTop: `1px solid ${theme.border}`, textAlign: 'center', fontSize: '11px', color: theme.textMuted, lineHeight: '1.5' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: theme.textMain }}>BetAnalytics PRO © {new Date().getFullYear()}</div>
                  <p style={{ margin: '0 0 10px 0' }}>NÃO somos uma casa de apostas. O conteúdo deste site é apenas para fins informativos.</p>
                  <p style={{ margin: '0 0 10px 0' }}>Proibido para menores de 18 anos. Jogue com responsabilidade.</p>
              </div>

          </div>
      </main>

      {/* 📲 PAINEL DIREITO VIP E LIGAS MOBILE */}
      {(jogoSelecionado && !isMobile && abaGeralAtiva === 'dashboard') && <RightPanelComponent jogoSelecionado={jogoSelecionado} rightTab={rightTab} setRightTab={setRightTab} />}
      
      {isMobile && jogoSelecionado && abaGeralAtiva === 'dashboard' && !showMobileLigas && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: '70px', background: theme.bgApp, zIndex: 100, display: 'flex', flexDirection: 'column'}}>
              <button onClick={() => setJogoSelecionado(null)} style={{background: theme.bgPanel, color: theme.textMain, padding: '15px', border: 'none', borderBottom: `1px solid ${theme.border}`, fontWeight: 'bold'}}>⬇ Fechar Painel VIP</button>
              <RightPanelComponent jogoSelecionado={jogoSelecionado} rightTab={rightTab} setRightTab={setRightTab} isMobile={true} />
          </motion.div>
      )}

      {/* MENU DE LIGAS DESLIZANTE PARA MOBILE */}
      <AnimatePresence>
          {isMobile && showMobileLigas && (
              <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} style={{ position: 'fixed', inset: 0, bottom: '70px', background: theme.bgApp, zIndex: 998, padding: '20px', overflowY: 'auto' }} className="custom-scrollbar">
                  <div style={{ fontSize: '14px', fontWeight: '900', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🌍 Menu Principal</span>
                      <button onClick={() => setShowMobileLigas(false)} style={{ background: theme.bgHover, border: `1px solid ${theme.border}`, color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>FECHAR</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button onClick={()=>{setViewMode('blog'); setShowMobileLigas(false);}} style={{ width:'100%', padding:'16px', background: theme.bgHover, color: theme.textMain, border: `1px solid ${theme.border}`, borderRadius:'12px', textAlign:'left', display:'flex', alignItems:'center', gap:'15px', cursor:'pointer', fontWeight:'bold', fontSize: '14px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '20px' }}>📰</span> Blog & Educação
                      </button>
                      <div style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px', marginBottom: '5px' }}>Competições</div>
                      {listaLigas.filter(l => l.id !== null).map(l => (
                          <button key={l.name} onClick={()=>{setMenuAtivo(l.name); setLigaAtivaId(l.id); setViewMode('jogos'); setShowMobileLigas(false);}} style={{ width:'100%', padding:'16px', background: menuAtivo===l.name&&viewMode!=='blog'?theme.bgPanel:'transparent', color: menuAtivo===l.name&&viewMode!=='blog'?theme.accent:theme.textMain, border: `1px solid ${menuAtivo===l.name&&viewMode!=='blog'?theme.blue:theme.border}`, borderRadius:'12px', textAlign:'left', display:'flex', alignItems:'center', gap:'15px', cursor:'pointer', fontWeight:'bold', fontSize: '14px' }}>
                              <span style={{ fontSize: '20px' }}>{l.icon}</span> {l.name}
                          </button>
                      ))}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      <ModalsExtras menuAtivo={menuAtivo} form={form} setForm={setForm} setMenuAtivo={setMenuAtivo} setUserData={setUserData} />
      <AuthModal showLoginMenu={showLoginMenu} setShowLoginMenu={setShowLoginMenu} authMode={authMode} setAuthMode={setAuthMode} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginSenha={loginSenha} setLoginSenha={setLoginSenha} handleLogin={handleLogin} handleCadastro={handleCadastro} />
      
      {/* 📱 NAVEGAÇÃO INFERIOR MOBILE (NOVO DESIGN PREMIUM) */}
      <div className="bottom-nav" style={{ display: isMobile ? 'flex' : 'none' }}>
        <div className={`nav-item ${viewMode === 'jogos' && menuAtivo === 'Todos os Jogos' && !showMobileLigas && filterCentro !== 'Ao Vivo' ? 'active' : ''}`} 
             onClick={() => {setAbaGeralAtiva('dashboard'); setViewMode('jogos'); setFilterCentro('Todos'); setMenuAtivo('Todos os Jogos'); setLigaAtivaId(null); setShowMobileLigas(false); setJogoSelecionado(null);}}>
          <span className="nav-icon">🏠</span>
          <span>Início</span>
        </div>
        
        <div className={`nav-item ${filterCentro === 'Ao Vivo' && !showMobileLigas ? 'active' : ''}`} 
             onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setShowMobileLigas(false); setJogoSelecionado(null);}}>
          <span className="nav-icon">🔴</span>
          <span>Ao Vivo</span>
        </div>
        
        <div className={`nav-item ${showMobileLigas ? 'active' : ''}`} 
             onClick={() => setShowMobileLigas(!showMobileLigas)}>
          <span className="nav-icon">📋</span>
          <span>Menu</span>
        </div>
        
        <div className={`nav-item vip-icon ${menuAtivo === 'assinar pro' && !showMobileLigas ? 'active' : ''}`} 
             onClick={() => {setMenuAtivo('assinar pro'); setShowMobileLigas(false); setJogoSelecionado(null);}}>
          <span className="nav-icon">👑</span>
          <span>VIP PRO</span>
        </div>
      </div>

    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENTES AUXILIARES 
// -----------------------------------------------------------------------------

function ClassificacaoPanel({ menuAtivo, ligaAtivaId, loadingClassificacao, classificacao, jogosHoje, jogoSelecionado, erroDaClassificacao }) {
    return ( 
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={{background: theme.bgPanel, borderRadius: '16px', border: `1px solid ${theme.border}`, overflow: 'hidden', padding: '20px', width:'100%'}}>
        {!ligaAtivaId ? ( 
            <div style={{textAlign: 'center', color: theme.textMuted, padding: '40px 0'}}>🌍 Selecione uma liga no menu de Ligas para ver a classificação.</div> 
        ) : loadingClassificacao ? ( 
            <div style={{textAlign: 'center', color: theme.blue, padding: '40px 0', fontWeight:'bold'}}>A baixar Tabela Oficial da API...</div> 
        ) : erroDaClassificacao ? (
            <div style={{textAlign: 'center', color: theme.red, padding: '40px 0', fontWeight:'bold'}}>{erroDaClassificacao}</div>
        ) : classificacao.length === 0 ? (
            <div style={{textAlign: 'center', color: theme.textMuted, padding: '40px 0'}}>⚠️ Dados de classificação indisponíveis para a liga selecionada hoje.</div>
        ) : ( 
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.textMain, fontSize: '13px'}}>
              <thead><tr style={{borderBottom: `1px solid ${theme.border}`, color: theme.textMuted, background:theme.bgSidebar}}><th style={{padding:'12px 8px'}}>#</th><th>Equipe</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr></thead>
              <tbody>
                {classificacao.map((t, i) => {
                  return ( <tr key={i} style={{borderBottom: `1px solid ${theme.border}`}}><td style={{padding: '12px 8px', color: theme.blue, fontWeight:'bold'}}>{t.pos}</td><td style={{padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px'}}><img src={t.logo} style={{width: '20px', height:'20px'}} alt="" />{t.team_name}</td><td style={{fontWeight:'bold'}}>{t.pts}</td><td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td><td>{t.gd}</td></tr> )
                })}
              </tbody>
            </table>
          </div> 
        )}
      </motion.div> 
    );
}

function RightPanelComponent({ jogoSelecionado, rightTab, setRightTab, isMobile }) {
    if (!jogoSelecionado) return null;
    return (
        <aside style={{ width: isMobile ? '100%' : '380px', padding: isMobile ? '0' : '15px', background: theme.bgApp, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: theme.bgPanel, borderRadius: isMobile ? '0' : '16px', border: isMobile ? 'none' : `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>{jogoSelecionado.status === 'Live' ? <div style={{ background: theme.red, color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>AO VIVO {jogoSelecionado.time_elapsed}'</div> : <span style={{fontSize:'10px', color: theme.textMuted, textTransform:'uppercase'}}>{jogoSelecionado.league_name}</span>}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}><img src={jogoSelecionado.home_image} style={{ width: '50px', height: '50px', marginBottom: '8px' }} alt=""/><div style={{ fontSize: '12px', fontWeight: 'bold' }}>{jogoSelecionado.home_team}</div></div>
                        <div style={{ textAlign: 'center', padding: '0 10px' }}><div style={{ background: theme.bgHover, padding: '8px 16px', borderRadius: '8px', fontSize: '24px', fontWeight: '900', border:`1px solid ${theme.border}` }}>{jogoSelecionado.status === 'Not Started' ? '-' : `${jogoSelecionado.scoreHome} - ${jogoSelecionado.scoreAway}`}</div></div>
                        <div style={{ textAlign: 'center', flex: 1 }}><img src={jogoSelecionado.away_image} style={{ width: '50px', height: '50px', marginBottom: '8px' }} alt=""/><div style={{ fontSize: '12px', fontWeight: 'bold' }}>{jogoSelecionado.away_team}</div></div>
                    </div>
                </div>
                <div style={{ display: 'flex', background: theme.bgSidebar, padding: '10px', gap: '5px', overflowX: 'auto' }} className="custom-scrollbar">
                    {[{n:'% Probs',i:'🎯'}, {n:'Estatísticas',i:'📊'}, {n:'H2H',i:'⚔️'}, {n:'Escalações',i:'🏃'}].map(t => (
                        <button key={t.n} onClick={() => setRightTab(t.n)} style={{ flex: 1, whiteSpace: 'nowrap', padding: '8px 12px', background: rightTab === t.n ? theme.blue : 'transparent', color: rightTab === t.n ? '#fff' : theme.textMuted, border: `1px solid ${rightTab === t.n ? theme.blue : 'transparent'}`, borderRadius: '20px', fontSize: '11px', cursor: 'pointer', fontWeight:'bold' }}>{t.i} {t.n}</button>
                    ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scrollbar">
                    {jogoSelecionado.is_loading ? <SkeletonVIP /> : jogoSelecionado.err ? <div style={{textAlign:'center', color:theme.textMuted, padding:'20px'}}>Dados VIP temporariamente indisponíveis.</div> : (
                        <AnimatePresence mode="wait">
                            <motion.div key={rightTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                                {rightTab === 'Estatísticas' && (
                                    <>
                                        <div style={{ background: theme.bgApp, padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
                                            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '15px', fontWeight: 'bold' }}>PRESSÃO NO JOGO (MOMENTUM)</div>
                                            <div style={{ height: '100px', width: '100%' }}>
                                                <ResponsiveContainer><LineChart data={generateMomentum()} margin={{ top:5, right:5, left:5, bottom:5 }}><Line type="monotone" dataKey="pressaoHome" stroke={theme.blue} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="pressaoAway" stroke={theme.accent} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                                            </div>
                                        </div>
                                        {jogoSelecionado.stats_reais?.map((s,i) => {
                                            const lbl = s.type.replace('Ball Possession','Posse (%)').replace('Total Shots','Remates').replace('Yellow Cards', 'Amarelos');
                                            const t = s.h + s.a; const pH = t>0?(s.h/t)*100:50; const pA = t>0?(s.a/t)*100:50;
                                            return (
                                                <div key={i} style={{ margin: '0 0 15px 0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}><span style={{color: pH>=pA?theme.textMain:theme.textMuted}}>{lbl.includes('%')?`${s.h}%`:s.h}</span><span style={{color: theme.textMuted, fontSize: '10px', textTransform:'uppercase'}}>{lbl}</span><span style={{color: pA>=pH?theme.textMain:theme.textMuted}}>{lbl.includes('%')?`${s.a}%`:s.a}</span></div>
                                                    <div style={{ display: 'flex', gap: '4px' }}><div style={{ flex: 1, background: theme.bgHover, height: '6px', borderRadius: '3px', display: 'flex', justifyContent: 'flex-end' }}><div style={{ width: `${pH}%`, background: pH>=pA?theme.blue:theme.border, borderRadius: '3px' }}></div></div><div style={{ flex: 1, background: theme.bgHover, height: '6px', borderRadius: '3px' }}><div style={{ width: `${pA}%`, background: pA>=pH?theme.accent:theme.border, borderRadius: '3px' }}></div></div></div>
                                                </div>
                                            )
                                        })}
                                    </>
                                )}
                                {rightTab === '% Probs' && (
                                    <>
                                        <div style={{ background: theme.bgSidebar, padding: '15px', borderRadius: '12px', marginBottom: '15px', border: `1px solid ${theme.blue}` }}>
                                            <div style={{ fontSize: '11px', color: theme.blue, marginBottom: '15px', fontWeight: '900', textTransform: 'uppercase' }}>⚙️ ALGORITMO PROPRIETÁRIO</div>
                                            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}><div style={{width: `${jogoSelecionado.probs?.h||33}%`, background: theme.blue}}></div><div style={{width: `${jogoSelecionado.probs?.d||34}%`, background: theme.textMuted}}></div><div style={{width: `${jogoSelecionado.probs?.a||33}%`, background: theme.accent}}></div></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}><span style={{color: theme.blue}}>Casa {jogoSelecionado.probs?.h||33}%</span><span style={{color: theme.textMuted}}>Emp {jogoSelecionado.probs?.d||34}%</span><span style={{color: theme.accent}}>Fora {jogoSelecionado.probs?.a||33}%</span></div>
                                        </div>
                                        <div style={{ background: theme.bgSidebar, padding: '15px', borderRadius: '12px' }}><div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '10px', fontWeight: 'bold' }}>ANÁLISE PREDITIVA IA</div><div style={{ fontSize: '13px', color: '#fff', lineHeight:'1.5' }}>{jogoSelecionado.advice}</div></div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </aside>
    );
}

// 🔥 SISTEMA COMPLETO DE PAGAMENTO (PIX E CARTÕES VIA MERCADO PAGO)
function ModalsExtras({ menuAtivo, form, setForm, setMenuAtivo, setUserData }) {
  const [passo, setPasso] = useState(1); 
  const [loading, setLoading] = useState(false); 
  const [dadosPix, setDadosPix] = useState(null);
  
  // 1. Escuta Automática de PIX
  useEffect(() => {
    let inv;
    if (passo === 2 && dadosPix?.id) {
      inv = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/status/${dadosPix.id}`);
          if (res.data.status === 'approved') {
            clearInterval(inv); 
            alert("🎉 Pagamento Aprovado! Bem-vindo ao VIP PRO!");
            if (setUserData) { 
              setUserData({ email: form.email, is_vip: true }); 
              localStorage.setItem('bet_sessao_ativa', form.email); 
            }
            setMenuAtivo('Todos os Jogos'); 
            setPasso(1);
          }
        } catch (err) {}
      }, 3000);
    }
    return () => clearInterval(inv);
  }, [passo, dadosPix, form.email]);

  // 2. Gerador de PIX
  async function gerarPix() {
    if (!form.nome || !form.email || form.cpf.length !== 11) return alert("⚠️ ERRO: Preencha Nome, E-mail e os exatos 11 números do CPF.");
    try { 
      setLoading(true); 
      const payload = { 
        transaction_amount: 29.90, 
        payment_method_id: "pix", 
        payer: { email: form.email, first_name: form.nome, identification: { type: "CPF", number: form.cpf } } 
      };
      const { data } = await axios.post(`${API_URL}/api/processar-pagamento`, payload);
      if (data.qr_code_base64 || data.qr_code) { setDadosPix(data); setPasso(2); }
    } catch (e) { 
      alert("❌ Erro de comunicação com o servidor."); 
    } finally { setLoading(false); }
  }

  // 3. Configuração Cartões (Mercado Pago)
  const initialization = useMemo(() => ({ amount: 29.90, payer: { email: form.email } }), [form.email]);
  const customization = useMemo(() => ({ visual: { style: { theme: 'dark', customVariables: { formBackgroundColor: '#111623' } } }, paymentMethods: { creditCard: 'all', debitCard: 'all', maxInstallments: 1 } }), []);

  if (menuAtivo !== "assinar pro") return null;

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", justifyContent:"center", alignItems:"center", zIndex: 1000}}>
      <div style={{background:theme.bgPanel, padding:30, borderRadius:16, width:'95%', maxWidth: 450, maxHeight: '90vh', overflowY: 'auto', color: "#fff", border:`1px solid ${theme.border}`}}>
        <button onClick={() => { setMenuAtivo('Todos os Jogos'); setPasso(1); }} style={{alignSelf: 'flex-start', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontWeight: 'bold', fontSize:'13px', marginBottom: '15px'}}>⬅ Fechar Painel</button>
        
        {/* TELA 1: DADOS E ESCOLHA DO MÉTODO */}
        {passo === 1 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <h2 style={{margin: 0, color: theme.accent, fontSize:'20px'}}>Assinar VIP PRO 👑</h2>
            
            <input placeholder="Nome Completo" value={form.nome} style={{padding: '14px', borderRadius: '8px', background: theme.bgApp, color: '#fff', border:`1px solid ${theme.border}`, outline:'none', fontSize: '14px'}} onChange={e=>setForm({...form,nome:e.target.value})} />
            <input placeholder="E-mail principal" value={form.email} style={{padding: '14px', borderRadius: '8px', background: theme.bgApp, color: '#fff', border:`1px solid ${theme.border}`, outline:'none', fontSize: '14px'}} onChange={e=>setForm({...form,email:e.target.value})} />
            <input placeholder="CPF (Apenas números)" value={form.cpf} maxLength={11} style={{padding: '14px', borderRadius: '8px', background: theme.bgApp, color: '#fff', border:`1px solid ${theme.border}`, outline:'none', fontSize: '14px'}} onChange={e=>setForm({...form,cpf:e.target.value.replace(/\D/g, '')})} />
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
              <button onClick={gerarPix} disabled={loading} style={{padding: '16px', background: theme.green, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'14px', boxShadow:'0 4px 10px rgba(34,197,94,0.2)'}}>{loading ? "A conectar ao banco..." : "⚡ Pagar com PIX (Imediato)"}</button>
              <button onClick={() => { if(!form.email) return alert("Preencha pelo menos o e-mail."); setPasso(3); }} style={{padding: '16px', background: theme.blue, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize:'14px'}}>💳 Cartão de Crédito ou Débito</button>
            </div>
          </motion.div>
        )}

        {/* TELA 2: QR CODE DO PIX */}
        {passo === 2 && dadosPix && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display: 'flex', flexDirection: 'column', gap: '15px', alignItems:'center'}}>
            <h3 style={{margin: 0, color: theme.green, fontSize:'16px'}}>PIX Gerado com Sucesso!</h3>
            <p style={{fontSize:'12px', color:theme.textMuted, textAlign:'center', margin:0}}>Escaneie o código ou use o Pix Copia e Cola no app do seu banco:</p>
            <img src={`data:image/jpeg;base64,${dadosPix.qr_code_base64}`} style={{width:"180px", height:'180px', borderRadius: '8px', border: '5px solid #fff'}} alt="QR Code Pix" />
            <textarea value={dadosPix.qr_code} readOnly style={{width:'100%', padding: '10px', fontSize: '11px', background: theme.bgApp, color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: '6px', resize: 'none', fontFamily:'monospace'}} rows={3} />
            <button onClick={()=>{ navigator.clipboard.writeText(dadosPix.qr_code); alert("Código Pix copiado!"); }} style={{width:'100%', padding: '14px', background: theme.accent, color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize:'14px'}}>Copiar Código Pix</button>
            <div style={{fontSize:'12px', color:theme.blue, animation:'pulse 1.5s infinite', marginTop: '10px'}}>⏱️ A aguardar confirmação do pagamento...</div>
          </motion.div>
        )}

        {/* TELA 3: CHECKOUT CARTÕES (MERCADO PAGO) */}
        {passo === 3 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <h3 style={{margin: 0, color: "#fff", textAlign: 'center', fontSize:'16px'}}>Pagamento Seguro (Mercado Pago)</h3>
            <Payment initialization={initialization} customization={customization} onSubmit={() => alert("A processar cartão...")} />
            <button onClick={() => setPasso(1)} style={{padding: '10px', background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer', fontSize:'12px'}}>Voltar para as opções</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AuthModal({ showLoginMenu, setShowLoginMenu, authMode, setAuthMode, loginEmail, setLoginEmail, loginSenha, setLoginSenha, handleLogin, handleCadastro }) {
    if (!showLoginMenu) return null;
    return ( 
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: theme.bgPanel, padding: '35px 30px', width: '90%', maxWidth: '400px', borderRadius:'16px', border:`1px solid ${theme.border}` }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginBottom:'20px', fontSize:'18px', fontWeight:'800' }}>ÁREA VIP PRO</h2>
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}><button onClick={() => setAuthMode('login')} style={{flex: 1, padding: '12px', background: authMode === 'login' ? theme.blue : 'transparent', color: '#fff', border: 'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'12px'}}>Entrar</button><button onClick={() => setAuthMode('register')} style={{flex: 1, padding: '12px', background: authMode === 'register' ? theme.blue : 'transparent', color: '#fff', border: 'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'12px'}}>Cadastrar</button></div>
          <input placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{width: '100%', padding: '14px', marginBottom: '15px', background: theme.bgApp, color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px', outline:'none', fontSize:'13px'}} />
          <input placeholder="Senha" type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} style={{width: '100%', padding: '14px', marginBottom: '25px', background: theme.bgApp, color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px', outline:'none', fontSize:'13px'}} />
          <button className="btn-primary" onClick={authMode === 'login' ? handleLogin : handleCadastro}>CONTINUAR</button>
          <button style={{width: '100%', padding: '10px', background: 'transparent', color: theme.textMuted, border: 'none', marginTop: '10px', cursor:'pointer', fontSize:'12px'}} onClick={() => setShowLoginMenu(false)}>Cancelar</button>
        </motion.div>
      </div> 
    );
}