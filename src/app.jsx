import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react'; 
import dadosFut from './dados.json'; 

// 🔑 A SUA NOVA CHAVE DA API-SPORTS
const API_SPORTS_KEY = "7ff15d43907d5138e48674b29ab56a65";
const EMAILS_VIP_MESTRE = ['admin@nexus.com']; 
initMercadoPago('APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc', { locale: 'pt-BR' });

const API_URL = 'https://betanalitics-1-9stc.onrender.com';
const theme = { bgApp: '#090a0f', bgPanel: '#13161f', bgHover: '#1c202d', border: '#232838', cyan: '#00d4b6', yellow: '#facc15', textMain: '#f8fafc', textMuted: '#64748b', red: '#ef4444', green: '#10b981' };

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
const getWeekDays = (b) => Array.from({length: 7}, (_, i) => { const d = new Date(b + "T12:00:00Z"); d.setDate(d.getDate() + i - 3); return { iso: d.toISOString().split('T')[0], nome: ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][d.getDay()], dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}` }; });
const generateMockMomentum = () => Array.from({length: 46}, (_, i) => ({ time: i * 2, pressao: Math.floor(Math.random() * 100) - 50 }));

const listaEsportesFino = [{name:'FUTEBOL',icon:'⚽'}];
const listaLigas = [{name:'Todos',icon:'🌍'},{name:'Brasileirão Série A',icon:'🇧🇷'},{name:'Brasileirão Série B',icon:'🇧🇷'},{name:'Copa do Brasil',icon:'🏆'},{name:'Libertadores',icon:'🌎'},{name:'Champions League',icon:'⭐'},{name:'Premier League',icon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},{name:'La Liga',icon:'🇪🇸'}];

function AdPlaceholder({ type = 'horizontal' }) {
    return (
        <div style={{ width: '100%', height: type === 'horizontal' ? '90px' : '250px', background: 'rgba(255,255,255,0.02)', border: `1px dashed ${theme.border}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '15px 0', overflow: 'hidden' }}>
            <span style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Publicidade</span>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>ESPAÇO RESERVADO ADSENSE</div>
        </div>
    );
}

// 🟢 FUNÇÃO AUXILIAR PARA RENDERIZAR BOLINHAS DE FORMA RECENTE (WWDLW)
const renderForm = (formStr) => {
    if (!formStr) return <span style={{color: theme.textMuted, fontSize: '10px'}}>Sem dados</span>;
    return formStr.split('').map((char, i) => (
        <span key={i} style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '4px', background: char === 'W' ? theme.green : char === 'D' ? theme.textMuted : theme.red, color: '#fff', fontSize: '9px', textAlign: 'center', lineHeight: '14px', margin: '0 2px', fontWeight: 'bold' }}>{char}</span>
    ));
};

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showManualInstall, setShowManualInstall] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    if (window.innerWidth <= 1024) { setTimeout(() => setShowInstallBtn(true), 3000); }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstallBtn(true); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => { setDeferredPrompt(null); setShowInstallBtn(false); });
    } else { setShowInstallBtn(false); setShowManualInstall(true); }
  };

  const [esporteAtivo, setEsporteAtivo] = useState('FUTEBOL');
  const [menuAtivo, setMenuAtivo] = useState('todos'); 
  const [userData, setUserData] = useState(null);
  const [jogos, setJogos] = useState([]);
  const [apiError, setApiError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState(getLocalYYYYMMDD());
  
  const [viewMode, setViewMode] = useState('jogos'); 
  const [classificacao, setClassificacao] = useState([]);
  const [loadingClassificacao, setLoadingClassificacao] = useState(false);
  const [rightTab, setRightTab] = useState('Análise IA'); 
  const [filterCentro, setFilterCentro] = useState('Todos');

  const [authMode, setAuthMode] = useState('login'); 
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' });

  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  
  const [jogadorAberto, setJogadorAberto] = useState(null);
  const [abaGeralAtiva, setAbaGeralAtiva] = useState('dashboard');

  const diasSemana = getWeekDays(dataFiltro);

  useEffect(() => {
    const emailSalvo = localStorage.getItem('bet_sessao_ativa');
    if (emailSalvo) {
        if (EMAILS_VIP_MESTRE.includes(emailSalvo.toLowerCase().trim())) { setUserData({ email: emailSalvo, is_vip: true }); } 
        else {
            let users = {}; try { users = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(e) {}
            if (users[emailSalvo]) setUserData(users[emailSalvo]);
        }
    }
  }, []);

  useEffect(() => { if (!["gestão de banca", "assinar pro"].includes(menuAtivo)) carregarDadosEsporte(false); }, [menuAtivo, dataFiltro, esporteAtivo]);
  useEffect(() => { if (viewMode === 'classificacao') carregarClassificacao(menuAtivo); }, [viewMode, menuAtivo]);

  const aplicarFiltros = (j, m) => {
      if (!j || !j.length) { setJogos([]); return; }
      const mn = m.toLowerCase();
      if (mn === 'todos' || mn === 'todos os jogos') { setJogos(j); return; }
      const f = j.filter(x => {
          const ln = (x.league_name || "").toLowerCase(); const lc = (x.league_country || "").toLowerCase();
          if (mn === 'brasileirão série a') return ln.includes('serie a') && lc === 'brazil';
          if (mn === 'brasileirão série b') return ln.includes('serie b') && lc === 'brazil';
          if (mn === 'copa do brasil') return ln.includes('copa do brasil');
          if (mn === 'libertadores') return ln.includes('libertadores');
          if (mn === 'champions league') return ln.includes('champions league');
          if (mn === 'premier league') return ln.includes('premier league');
          if (mn === 'la liga') return ln.includes('la liga') || ln.includes('primera division');
          return ln.includes(mn);
      });
      setJogos(f); 
  };

  const carregarClassificacao = async (liga) => { setLoadingClassificacao(true); setTimeout(() => { setLoadingClassificacao(false); }, 600); };

  const carregarDadosEsporte = async (forcar = false) => {
    setApiError(''); setLoading(true); 
    const CACHE_KEY = `bet_apisports_${dataFiltro}`; const CACHE_TIME_KEY = `bet_apisports_time_${dataFiltro}`;
    if (!forcar) {
        const ds = localStorage.getItem(CACHE_KEY); const ts = localStorage.getItem(CACHE_TIME_KEY);
        if (ds && ts && (new Date().getTime() - parseInt(ts) < 600000)) { aplicarFiltros(JSON.parse(ds), menuAtivo); setLoading(false); return; }
    }
    setJogos([]); 
    try {
      const options = { method: 'GET', url: 'https://v3.football.api-sports.io/fixtures', params: { date: dataFiltro, timezone: 'America/Sao_Paulo' }, headers: { 'x-apisports-key': API_SPORTS_KEY } };
      const res = await axios.request(options);
      if (!res.data?.response?.length) throw new Error("Vazio");
      const jF = res.data.response.map(f => {
          let st = 'Not Started'; if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(f.fixture.status.short)) st = 'Live'; if (['FT', 'AET', 'PEN'].includes(f.fixture.status.short)) st = 'Finished';
          return {
              id: f.fixture.id, league_name: f.league.name, league_country: f.league.country, starting_at: f.fixture.date, status: st,
              home_team: f.teams.home.name, home_id: f.teams.home.id, away_team: f.teams.away.name, away_id: f.teams.away.id, 
              home_image: f.teams.home.logo, away_image: f.teams.away.logo, scoreHome: f.goals.home ?? 0, scoreAway: f.goals.away ?? 0, result_info: f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : "", venue: f.fixture.venue.name || "Estádio", 
              dados_vip_baixados: false
          };
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(jF)); localStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString()); aplicarFiltros(jF, menuAtivo); 
    } catch (e) { setApiError("⚠️ Sem cobertura para hoje."); } finally { setLoading(false); }
  };

  // 🔥 SUPER MOTOR VIP (PROMISES SIMULTÂNEAS COM PARSER BLINDADO) 🔥
  const abrirPainelDoJogo = async (j) => {
    if(!userData?.is_vip) { alert("🔒 VIP PRO requerido."); setShowProfileMenu(true); return; }
    
    setRightTab('Análise IA'); 
    if (j.dados_vip_baixados) { setJogoSelecionado(j); return; } // Cache em Memória Ativo

    const tempJogo = { ...j, is_loading_vip: true };
    setJogoSelecionado(tempJogo);

    try {
      const HEADERS = { 'x-apisports-key': API_SPORTS_KEY };
      const PARAMS = { fixture: j.id };

      const [resPred, resLineups, resStats, resPlayers, resOdds] = await Promise.all([
          axios.get('https://v3.football.api-sports.io/predictions', { params: PARAMS, headers: HEADERS }).catch(()=>({data:{response:[]}})),
          axios.get('https://v3.football.api-sports.io/fixtures/lineups', { params: PARAMS, headers: HEADERS }).catch(()=>({data:{response:[]}})),
          axios.get('https://v3.football.api-sports.io/fixtures/statistics', { params: PARAMS, headers: HEADERS }).catch(()=>({data:{response:[]}})),
          axios.get('https://v3.football.api-sports.io/fixtures/players', { params: PARAMS, headers: HEADERS }).catch(()=>({data:{response:[]}})),
          axios.get('https://v3.football.api-sports.io/odds', { params: PARAMS, headers: HEADERS }).catch(()=>({data:{response:[]}}))
      ]);

      const dPred = resPred.data.response[0] || null;
      const dLineups = resLineups.data.response || [];
      const dStats = resStats.data.response || [];
      const dPlayers = resPlayers.data.response || [];
      const dOdds = resOdds.data.response[0] || null;

      // 1. Processar IA e H2H (Correção das Percentagens)
      let analiseData = { probs: null, advice: "Análise indisponível.", formHome: '', formAway: '', h2h_msg: '', avg_goals: '' };
      if (dPred) {
          const perc = dPred.predictions?.percent || {};
          analiseData.probs = { 
              home: parseInt(perc.home) || 0, 
              draw: parseInt(perc.draw) || 0, 
              away: parseInt(perc.away) || 0, 
              btts: dPred.predictions?.btts ? "SIM" : "NÃO" 
          };
          analiseData.advice = dPred.predictions?.advice || "Sem palpite claro.";
          analiseData.formHome = dPred.teams?.home?.league?.form || '';
          analiseData.formAway = dPred.teams?.away?.league?.form || '';
          analiseData.avg_goals = `Média Casa (Marcos: ${dPred.teams?.home?.last_5?.goals?.for?.average || '0'}) | Fora (Marcos: ${dPred.teams?.away?.last_5?.goals?.for?.average || '0'})`;
          
          let vitoriasH = 0; let empates = 0; let vitoriasA = 0;
          (dPred.h2h || []).slice(0, 5).forEach(jogo => { if(jogo.teams.home.winner) vitoriasH++; else if(jogo.teams.away.winner) vitoriasA++; else empates++; });
          analiseData.h2h_msg = `Nos últimos ${Math.min((dPred.h2h || []).length, 5)} confrontos diretos: ${vitoriasH} Vitórias Casa, ${vitoriasA} Vitórias Fora e ${empates} Empates.`;
      }

      // 2. Processar Escalações e Treinador (Buscador Dinâmico Blindado)
      let taticas = { home: 'N/A', away: 'N/A', coachHome: 'N/A', coachAway: 'N/A' };
      let escalacoesFinais = []; let subsFinais = [];
      if (dLineups && dLineups.length > 0) {
          const homeLineup = dLineups.find(l => l.team.id === j.home_id);
          const awayLineup = dLineups.find(l => l.team.id === j.away_id);
          
          if (homeLineup) {
              taticas.home = homeLineup.formation || 'N/A';
              taticas.coachHome = homeLineup.coach?.name || 'N/A';
              (homeLineup.startXI || []).forEach((p, idx) => escalacoesFinais.push({ team_id: j.home_id, name: p.player.name, number: p.player.number, pos: idx }));
              (homeLineup.substitutes || []).forEach((p, idx) => subsFinais.push({ team_id: j.home_id, name: p.player.name, number: p.player.number }));
          }
          if (awayLineup) {
              taticas.away = awayLineup.formation || 'N/A';
              taticas.coachAway = awayLineup.coach?.name || 'N/A';
              (awayLineup.startXI || []).forEach((p, idx) => escalacoesFinais.push({ team_id: j.away_id, name: p.player.name, number: p.player.number, pos: idx }));
              (awayLineup.substitutes || []).forEach((p, idx) => subsFinais.push({ team_id: j.away_id, name: p.player.name, number: p.player.number }));
          }
      }

      // 3. Processar Estatísticas Gerais (Buscador Dinâmico Blindado)
      let estatisticasFinais = [];
      if (dStats && dStats.length > 0) {
          const homeStats = dStats.find(s => s.team.id === j.home_id)?.statistics || [];
          const awayStats = dStats.find(s => s.team.id === j.away_id)?.statistics || [];
          
          homeStats.forEach(sH => {
              const sA = awayStats.find(s => s.type === sH.type);
              let valH = sH.value; let valA = sA ? sA.value : 0;
              // Limpar símbolos se existirem
              if (typeof valH === 'string' && valH.includes('%')) valH = parseInt(valH);
              if (typeof valA === 'string' && valA.includes('%')) valA = parseInt(valA);
              estatisticasFinais.push({ type: sH.type, home: parseInt(valH) || 0, away: parseInt(valA) || 0 });
          });
      }

      // 4. Notas dos Jogadores
      let topJogadores = [];
      if (dPlayers && dPlayers.length > 0) {
          const homeP = dPlayers.find(p => p.team.id === j.home_id)?.players || [];
          const awayP = dPlayers.find(p => p.team.id === j.away_id)?.players || [];
          const allPlayers = [...homeP, ...awayP].map(p => {
              const stats = p.statistics[0] || {};
              return {
                  name: p.player.name, 
                  team_logo: stats.team?.logo || '', 
                  rating: parseFloat(stats.games?.rating || 0).toFixed(1), 
                  shots: stats.shots?.total || 0, 
                  passes: stats.passes?.accuracy || 0
              };
          }).sort((a, b) => b.rating - a.rating).filter(p => p.rating > 0).slice(0, 4); 
          topJogadores = allPlayers;
      }

      // 5. Processar Odds Reais (Casas de Apostas)
      let oddsProcessadas = { match_winner: null, goals_ou: null, btts: null };
      if (dOdds && dOdds.bookmakers && dOdds.bookmakers.length > 0) {
          const bookie = dOdds.bookmakers.find(b => b.id === 8) || dOdds.bookmakers[0]; // Bet365 ou 1ª disponível
          oddsProcessadas.match_winner = bookie.bets.find(b => b.name === 'Match Winner')?.values || [];
          oddsProcessadas.goals_ou = bookie.bets.find(b => b.name === 'Goals Over/Under' && b.values.some(v => String(v.value).includes('2.5')))?.values || [];
          oddsProcessadas.btts = bookie.bets.find(b => b.name === 'Both Teams Score')?.values || [];
      }

      const jogoAtualizado = { 
          ...j, dados_vip_baixados: true, is_loading_vip: false,
          analise_ia: analiseData, taticas_treinadores: taticas,
          lineups_reais: escalacoesFinais, subs_reais: subsFinais,
          stats_reais: estatisticasFinais, top_jogadores: topJogadores, odds_reais: oddsProcessadas
      };
      
      setJogos(prevJogos => prevJogos.map(oldJ => oldJ.id === j.id ? jogoAtualizado : oldJ));
      setJogoSelecionado(jogoAtualizado);

    } catch (e) { 
        setJogoSelecionado({ ...j, is_loading_vip: false, erro_vip: true, dados_vip_baixados: true }); 
    }
  };

  const carregarPerfilJogador = async () => {
    if (!userData?.is_vip) { alert("🔒 VIP PRO requerido."); setShowProfileMenu(true); return; }
    setJogadorAberto({ nome: dadosFut.display_name, foto: dadosFut.image_path, nascimento: dadosFut.date_of_birth, altura: dadosFut.height, peso: dadosFut.weight, statsRecentes: dadosFut.latest[0]?.xglineup || [], ultimoJogo: dadosFut.latest[0]?.fixture?.name || "Partida" });
  };

  const handleLogin = async () => {
    const emailDigitado = loginEmail.trim().toLowerCase();
    if (!emailDigitado || !loginSenha) return alert("❌ Preencha E-mail e Senha.");
    if (EMAILS_VIP_MESTRE.includes(emailDigitado)) { setUserData({ email: emailDigitado, is_vip: true }); localStorage.setItem('bet_sessao_ativa', emailDigitado); setShowLoginMenu(false); return; }
    let bL = {}; try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(err) {}
    if (bL[emailDigitado] && bL[emailDigitado].password === loginSenha) { setUserData(bL[emailDigitado]); localStorage.setItem('bet_sessao_ativa', emailDigitado); setShowLoginMenu(false); } 
    else { alert("❌ E-mail ou Senha incorretos."); }
  };

  const handleCadastro = async () => {
    const e = loginEmail.trim().toLowerCase(); if (!e || !loginSenha) return alert("❌ E-mail/Senha.");
    let bL = {}; try { bL = JSON.parse(localStorage.getItem('bet_users') || '{}'); } catch(err) {}
    if (bL[e]) return alert("❌ E-mail já existe!");
    bL[e] = { email: e, password: loginSenha, is_vip: false }; localStorage.setItem('bet_users', JSON.stringify(bL));
    setUserData({ email: e, is_vip: false }); localStorage.setItem('bet_sessao_ativa', e); setShowLoginMenu(false); alert("✅ Conta criada!");
  };

  let jogosFiltrados = (Array.isArray(jogos) ? jogos : []).filter(j => {
    let mB = (j.home_team||"").toLowerCase().includes(busca.toLowerCase()) || (j.away_team||"").toLowerCase().includes(busca.toLowerCase());
    let mF = filterCentro === 'Ao Vivo' ? j.status?.toLowerCase().includes('live') : filterCentro === 'Próximo' ? !j.status?.toLowerCase().includes('finished') : filterCentro === 'Terminado' ? j.status?.toLowerCase().includes('finished') : true;
    return mB && mF;
  }).sort((a, b) => new Date(a.starting_at || 0) - new Date(b.starting_at || 0));

  const jogosAgrupados = jogosFiltrados.reduce((acc, jogo) => { const lN = jogo.league_name || "Outras Ligas"; if (!acc[lN]) acc[lN] = []; acc[lN].push(jogo); return acc; }, {});

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: theme.bgApp, color: theme.textMain, fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ background: 'rgba(21,24,32,0.8)', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', padding: '0 25px', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: theme.textMain }}>BETANALYTICS<span style={{color: theme.cyan}}>.PRO</span></div>
              {!isMobile && (
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => setAbaGeralAtiva('dashboard')} style={{ background: 'none', border: 'none', color: abaGeralAtiva === 'dashboard' ? theme.cyan : theme.textMuted, fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}>Dashboard</button>
                      <button onClick={() => { setAbaGeralAtiva('jogador'); carregarPerfilJogador(); }} style={{ background: 'none', border: 'none', color: abaGeralAtiva === 'jogador' ? theme.cyan : theme.textMuted, fontWeight: 'bold', cursor: 'pointer', padding: '10px' }}>🏃 Jogadores</button>
                  </div>
              )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ background: 'rgba(0,212,182,0.1)', color: theme.cyan, border: `1px solid ${theme.cyan}`, borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{userData?.is_vip ? '👑' : '👤'}</button>
                <AnimatePresence>
                {showProfileMenu && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{opacity: 0}} style={{ position: 'absolute', top: '55px', right: 0, background: 'rgba(21,24,32,0.95)', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '15px', width: '240px' }}>
                        {!userData ? <button onClick={() => { setShowProfileMenu(false); setShowLoginMenu(true); }} style={{ width: '100%', padding: '12px', background: theme.cyan, color: '#000', fontWeight: 'bold', borderRadius: '6px' }}>Entrar / Cadastrar</button> : <div style={{ color: theme.cyan, textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>{userData.email}</div>}
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ padding: '10px', cursor: 'pointer' }} onClick={() => {setMenuAtivo('assinar pro'); setShowProfileMenu(false);}}>👑 Assinar VIP PRO</div>
                            {userData && <div onClick={() => { setUserData(null); localStorage.removeItem('bet_sessao_ativa'); setShowProfileMenu(false); }} style={{ padding: '10px', cursor: 'pointer', color: theme.red, fontWeight: 'bold' }}>🚪 Sair da Conta</div>}
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
          </div>
      </div>

      {showManualInstall && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <div style={{ background: theme.bgPanel, padding: '30px', borderRadius: '16px', border: `1px solid ${theme.cyan}`, textAlign: 'center', maxWidth: '350px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>📱</div><h3 style={{ color: theme.cyan, marginTop: 0 }}>Como instalar o App</h3>
                  <p style={{ color: theme.textMain, fontSize: '14px', lineHeight: '1.6' }}>Para instalar o BetAnalytics, siga estes 2 passos:<br/><br/>1. Toque nos <b>3 pontinhos</b> (ou partilha) do seu navegador.<br/>2. Selecione <b>"Adicionar à Tela Inicial"</b>.</p>
                  <button onClick={() => setShowManualInstall(false)} style={{ width: '100%', padding: '12px', marginTop: '15px', background: theme.cyan, color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px' }}>Entendi!</button>
              </div>
          </div>
      )}

      <div style={{display: 'flex', flex: 1, overflow: 'hidden', paddingBottom: isMobile ? '65px' : '0'}}>
          {abaGeralAtiva === 'jogador' && jogadorAberto ? (
            <div style={{ flex: 1, overflowY: 'auto', background: theme.bgApp, padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '900px', width: '100%', background: theme.bgPanel, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                        <img src={jogadorAberto.foto} alt="Jogador" style={{ width: '150px', borderRadius: '50%', border: `3px solid ${theme.cyan}` }} />
                        <div><h1 style={{ margin: '0 0 10px 0', fontSize: '36px', color: theme.cyan }}>{jogadorAberto.nome}</h1><p style={{ margin: 0, color: theme.textMuted }}>Nascimento: {jogadorAberto.nascimento}</p><p style={{ margin: '5px 0', fontWeight: 'bold' }}>Altura: {jogadorAberto.altura}cm | Peso: {jogadorAberto.peso}kg</p></div>
                    </div>
                </div>
            </div>
          ) : (
          <>
            {!isMobile && (
              <aside style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, width: '280px', borderRight: '1px solid', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', padding: '10px', gap: '5px', background: '#0f111a', margin: '15px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                      <button onClick={() => setMenuAtivo('todos')} style={{ flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', background: '#1c202d', color: '#fff', cursor: 'pointer', border: 'none' }}>LIGAS</button>
                  </div>
                  <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar" style={{ padding: '0 15px 15px', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {listaLigas.map(l => (
                              <button key={l.name} onClick={() => {setMenuAtivo(l.name.toLowerCase()); setViewMode('jogos');}} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: menuAtivo === l.name.toLowerCase() ? theme.bgHover : 'transparent', color: menuAtivo === l.name.toLowerCase() ? theme.cyan : theme.textMuted, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}><span style={{ fontSize: '18px' }}>{l.icon}</span> <span>{l.name}</span></button>
                          ))}
                      </div>
                      {!userData?.is_vip && <AdPlaceholder type="vertical" />}
                  </nav>
              </aside>
            )}

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', background: theme.bgApp, padding: isMobile ? '10px' : '20px 25px' }}>
              
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }}>🔍</span>
                  <input type="text" placeholder="Pesquisar por equipa (ex: Real Madrid, Flamengo)..." value={busca} onChange={e => setBusca(e.target.value)} style={{ width: '100%', padding: '14px 15px 14px 45px', background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textMain, outline: 'none', fontSize: '14px' }}/>
              </div>

              {isMobile && (
                  <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                          {listaLigas.map(l => (
                              <button key={l.name} onClick={() => {setMenuAtivo(l.name.toLowerCase()); setViewMode('jogos');}} style={{ whiteSpace: 'nowrap', flexShrink: 0, padding: '8px 16px', borderRadius: '20px', background: menuAtivo === l.name.toLowerCase() ? theme.bgHover : theme.bgPanel, color: menuAtivo === l.name.toLowerCase() ? theme.cyan : theme.textMuted, border: `1px solid ${menuAtivo === l.name.toLowerCase() ? theme.cyan : theme.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}><span>{l.icon}</span> {l.name}</button>
                          ))}
                      </div>
                  </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  <button onClick={() => setViewMode('jogos')} style={{ whiteSpace: 'nowrap', flexShrink: 0, padding: '12px 25px', borderRadius: '8px', background: viewMode === 'jogos' ? 'rgba(0,212,182,0.1)' : theme.bgPanel, color: viewMode === 'jogos' ? theme.cyan : theme.textMuted, border: `1px solid ${viewMode === 'jogos' ? theme.cyan : theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>⚽ Partidas</button>
                  <button onClick={() => setViewMode('classificacao')} style={{ whiteSpace: 'nowrap', flexShrink: 0, padding: '12px 25px', borderRadius: '8px', background: viewMode === 'classificacao' ? 'rgba(0,212,182,0.1)' : theme.bgPanel, color: viewMode === 'classificacao' ? theme.cyan : theme.textMuted, border: `1px solid ${viewMode === 'classificacao' ? theme.cyan : theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🏆 Classificação</button>
              </div>

              {!userData?.is_vip && <AdPlaceholder type="horizontal" />}

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
                                              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{isActive ? 'HOJE' : d.nome}</span><span style={{ fontSize: '13px', fontWeight: isActive ? 'bold' : '500' }}>{d.dia}</span>
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

                      {loading && <div style={{textAlign: 'center', padding: '20px', color: theme.cyan, fontWeight: 'bold'}}>A carregar jogos reais da API-Sports...</div>}
                      {apiError && <div style={{background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${theme.red}`, padding: '15px', color: theme.red, marginBottom: '20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center'}}>{apiError}</div>}

                      {!loading && Object.keys(jogosAgrupados).length === 0 ? <div style={{padding: '60px 20px', color: theme.textMuted, textAlign: 'center', background: theme.bgPanel, borderRadius: '12px', border: `1px dashed ${theme.border}`}}>Nenhuma partida encontrada para esta busca.</div> :
                      Object.entries(jogosAgrupados).map(([leagueName, games]) => (
                          <div key={leagueName} style={{marginBottom: '25px', background: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden'}}>
                              <div style={{padding: '15px 20px', background: theme.bgHover, fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`}}>{leagueName}</div>
                              {games.map(j => {
                                  const isSelected = jogoSelecionado?.id === j.id; 
                                  return (
                                      <div key={j.id} onClick={() => abrirPainelDoJogo(j)} style={{display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', background: isSelected ? 'rgba(0, 212, 182, 0.1)' : 'transparent', borderLeft: isSelected ? `3px solid ${theme.cyan}` : '3px solid transparent'}}>
                                          <div style={{ width: '45px', fontSize: '12px', color: j.status === 'Finished' ? theme.textMuted : (j.status === 'Not Started' ? theme.textMain : theme.red), fontWeight: 'bold' }}>{j.status === 'Finished' ? 'FT' : (j.status === 'Not Started' ? j.starting_at?.split('T')[1]?.substring(0,5) : 'LIVE')}</div>
                                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              <div style={{ flex: 1, textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>{j.home_team}</div>
                                              <img src={j.home_image} style={{width:'22px', height: '22px', margin: '0 12px'}} alt="home" />
                                              <div style={{ background: j.status === 'Finished' ? theme.bgHover : theme.bgApp, color: j.status === 'Finished' ? theme.textMain : theme.cyan, padding: '6px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center', border: `1px solid ${theme.border}` }}>{j.status === 'Not Started' ? '-' : `${j.scoreHome ?? 0} - ${j.scoreAway ?? 0}`}</div>
                                              <img src={j.away_image} style={{width:'22px', height: '22px', margin: '0 12px'}} alt="away" />
                                              <div style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>{j.away_team}</div>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      ))}
                  </>
              )}
              {viewMode === 'classificacao' && <ClassificacaoPanel menuAtivo={menuAtivo} loadingClassificacao={loadingClassificacao} classificacao={classificacao} />}
            </div>

            {!isMobile && <RightPanelComponent jogoSelecionado={jogoSelecionado} rightTab={rightTab} setRightTab={setRightTab} isMobile={false} userData={userData}/>}
            {isMobile && jogoSelecionado && (
                <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: '65px', background: theme.bgApp, zIndex: 100, display: 'flex', flexDirection: 'column'}}>
                    <button onClick={() => setJogoSelecionado(null)} style={{background: theme.bgPanel, color: theme.cyan, padding: '15px', border: 'none', borderBottom: `1px solid ${theme.border}`, fontWeight: 'bold'}}><span style={{fontSize:'18px', marginRight: '8px'}}>⬇</span> Fechar Detalhes</button>
                    <RightPanelComponent jogoSelecionado={jogoSelecionado} rightTab={rightTab} setRightTab={setRightTab} isMobile={true} userData={userData}/>
                </motion.div>
            )}
          </>
          )} 
      </div>
      <ModalsExtras menuAtivo={menuAtivo} form={form} setForm={setForm} setMenuAtivo={setMenuAtivo} setUserData={setUserData} />
      {isMobile && abaGeralAtiva !== 'jogador' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', background: theme.bgPanel, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 999, paddingBottom: '5px' }}>
            <button onClick={() => setMenuAtivo('todos')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: menuAtivo === 'todos' ? theme.cyan : theme.textMuted}}><span style={{fontSize: '22px'}}>🏠</span><span style={{fontSize:'10px', fontWeight:'bold'}}>Home</span></button>
            <button onClick={() => setFilterCentro('Ao Vivo')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: filterCentro === 'Ao Vivo' ? theme.red : theme.textMuted}}><span style={{fontSize: '22px'}}>🔴</span><span style={{fontSize:'10px', fontWeight:'bold'}}>Live</span></button>
            <button onClick={() => { setAbaGeralAtiva('jogador'); carregarPerfilJogador(); }} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: theme.cyan}}><span style={{fontSize: '22px'}}>🏃</span><span style={{fontSize:'10px', fontWeight:'bold'}}>Jogador</span></button>
            <button onClick={() => setMenuAtivo('assinar pro')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: menuAtivo === 'assinar pro' ? theme.cyan : theme.textMuted}}><span style={{fontSize: '22px'}}>👑</span><span style={{fontSize:'10px', fontWeight:'bold'}}>PRO</span></button>
        </div>
      )}
      <AuthModal showLoginMenu={showLoginMenu} setShowLoginMenu={setShowLoginMenu} authMode={authMode} setAuthMode={setAuthMode} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginSenha={loginSenha} setLoginSenha={setLoginSenha} handleLogin={handleLogin} handleCadastro={handleCadastro} />
    </div>
  );
}

// 🔥 NOVO COMPONENTE DO PAINEL DIREITO (COM TUDO O QUE A API TEM DIREITO E BLINDADO) 🔥
function RightPanelComponent({ jogoSelecionado, rightTab, setRightTab, isMobile, userData }) {
    if (!jogoSelecionado) return ( <div style={{ width: isMobile ? '100%' : '420px', background: theme.bgApp, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, padding: '30px' }}><div style={{fontSize: '30px', marginBottom: '20px'}}>🏟️</div><h3>Análise VIP</h3><p style={{fontSize: '13px', textAlign: 'center'}}>Selecione uma partida.</p></div> );
    
    return (
        <div className="right-panel custom-scrollbar" style={{ width: isMobile ? '100%' : '420px', background: theme.bgApp, overflowY: 'auto', padding: isMobile ? '0' : '15px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{background: theme.bgPanel, borderRadius: '16px', border: `1px solid ${theme.border}`, overflow: 'hidden'}}>
                <div style={{padding: '25px 20px', background: 'linear-gradient(180deg, rgba(31, 35, 48, 0.8) 0%, rgba(19, 22, 31, 1) 100%)'}}>
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '25px'}}><span style={{background: jogoSelecionado.status === 'Finished' ? 'rgba(100,116,139,0.15)' : 'rgba(0,212,182,0.15)', color: jogoSelecionado.status === 'Finished' ? theme.textMuted : theme.cyan, padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold'}}>{jogoSelecionado.status === 'Finished' ? 'Encerrado' : (jogoSelecionado.status === 'Not Started' ? 'Pré-Jogo' : 'AO VIVO')}</span></div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px'}}>
                        <div style={{textAlign: 'center', flex: 1}}><img src={jogoSelecionado.home_image} style={{width: '60px', height: '60px', marginBottom: '10px'}} alt="casa"/><h3 style={{margin: 0, fontSize: '13px', color: theme.textMain}}>{jogoSelecionado.home_team}</h3></div>
                        <div style={{textAlign: 'center', padding: '0 10px'}}>{jogoSelecionado.status === 'Not Started' ? <span style={{fontSize: '24px', fontWeight: '800', color: theme.textMain}}>{jogoSelecionado.starting_at?.split('T')[1]?.substring(0,5)}</span> : <span style={{fontSize: '40px', fontWeight: '900', color: '#fff'}}>{jogoSelecionado.scoreHome ?? 0}-{jogoSelecionado.scoreAway ?? 0}</span>}</div>
                        <div style={{textAlign: 'center', flex: 1}}><img src={jogoSelecionado.away_image} style={{width: '60px', height: '60px', marginBottom: '10px'}} alt="fora"/><h3 style={{margin: 0, fontSize: '13px', color: theme.textMain}}>{jogoSelecionado.away_team}</h3></div>
                    </div>
                </div>
                
                <div style={{display: 'flex', borderBottom: `1px solid ${theme.border}`, borderTop: `1px solid ${theme.border}`, background: 'rgba(19, 22, 31, 0.8)', overflowX: 'auto', scrollbarWidth: 'none'}}>
                    {['Análise IA', 'Probs', 'Estatísticas', 'Escalações'].map(tab => ( <div key={tab} onClick={() => setRightTab(tab)} style={{padding: '16px 12px', cursor: 'pointer', color: rightTab === tab ? theme.cyan : theme.textMuted, fontWeight: 'bold', fontSize: '11px', borderBottom: rightTab === tab ? `2px solid ${theme.cyan}` : '2px solid transparent', whiteSpace: 'nowrap', textAlign: 'center', textTransform: 'uppercase', flex: 1}}>{tab}</div> ))}
                </div>
                
                <div style={{padding: '20px'}}>
                    {jogoSelecionado.is_loading_vip ? (
                        <div style={{textAlign: 'center', padding: '40px 0', color: theme.cyan}}><span style={{fontSize: '30px', display: 'block', marginBottom: '10px'}}>🤖</span>Extraindo Inteligência VIP...</div>
                    ) : jogoSelecionado.erro_vip ? (
                        <div style={{textAlign: 'center', padding: '40px 0', color: theme.red}}>⚠️ Dados indisponíveis para este jogo.</div>
                    ) : (
                        <>
                            {/* 🤖 ANÁLISE IA - COM FORMA E H2H */}
                            {rightTab === 'Análise IA' && jogoSelecionado.analise_ia && ( 
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={{background: 'rgba(0, 212, 182, 0.05)', padding: '16px', borderRadius: '12px', border: `1px solid rgba(0, 212, 182, 0.2)`, marginBottom: '20px'}}>
                                        <div style={{fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', fontWeight: 'bold'}}>💡 Palpite IA: {jogoSelecionado.analise_ia.advice}</div>
                                    </div>
                                    <div style={{marginBottom: '20px'}}>
                                        <h4 style={{fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '10px'}}>Forma Recente</h4>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bgApp, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, marginBottom: '5px'}}>
                                            <span style={{fontSize: '12px'}}>{jogoSelecionado.home_team}</span>
                                            <div>{renderForm(jogoSelecionado.analise_ia.formHome)}</div>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bgApp, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`}}>
                                            <span style={{fontSize: '12px'}}>{jogoSelecionado.away_team}</span>
                                            <div>{renderForm(jogoSelecionado.analise_ia.formAway)}</div>
                                        </div>
                                    </div>
                                    <div style={{background: theme.bgApp, padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                                        <h4 style={{fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', margin: '0 0 10px 0'}}>Histórico H2H</h4>
                                        <div style={{fontSize: '12px', color: theme.textMain}}>{jogoSelecionado.analise_ia.h2h_msg}</div>
                                    </div>
                                </motion.div> 
                            )}
                            
                            {/* 📊 PROBABILIDADES E ODDS REAIS BLINDADAS */}
                            {rightTab === 'Probs' && ( 
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {jogoSelecionado.analise_ia?.probs ? ( 
                                        <>
                                            <div style={{marginBottom: '25px', background: theme.bgApp, padding: '18px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                                                <div style={{fontSize: '11px', color: theme.textMuted, marginBottom: '12px', fontWeight: 'bold', textTransform: 'uppercase'}}>Probabilidades (1X2)</div>
                                                <div style={{display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px'}}>
                                                    <div style={{width: `${jogoSelecionado.analise_ia.probs.home}%`, background: theme.cyan}}></div>
                                                    <div style={{width: `${jogoSelecionado.analise_ia.probs.draw}%`, background: theme.textMuted}}></div>
                                                    <div style={{width: `${jogoSelecionado.analise_ia.probs.away}%`, background: theme.yellow}}></div>
                                                </div>
                                                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold'}}>
                                                    <span style={{color: theme.cyan}}>Casa: {jogoSelecionado.analise_ia.probs.home}%</span>
                                                    <span style={{color: theme.textMuted}}>Emp: {jogoSelecionado.analise_ia.probs.draw}%</span>
                                                    <span style={{color: theme.yellow}}>Fora: {jogoSelecionado.analise_ia.probs.away}%</span>
                                                </div>
                                            </div>

                                            {/* ODDS DA CASA DE APOSTAS */}
                                            {jogoSelecionado.odds_reais && jogoSelecionado.odds_reais.match_winner && jogoSelecionado.odds_reais.match_winner.length > 0 && (
                                                <div style={{marginBottom: '25px'}}>
                                                    <div style={{fontSize: '11px', color: theme.textMuted, marginBottom: '10px', fontWeight: 'bold', textTransform: 'uppercase'}}>Odds Reais (Casa de Apostas)</div>
                                                    <div style={{display: 'flex', gap: '10px'}}>
                                                        <div style={{flex: 1, background: '#1c202d', padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${theme.border}`}}><div style={{fontSize: '10px', color: theme.textMuted}}>CASA</div><div style={{fontSize: '16px', color: '#fff', fontWeight: 'bold'}}>{jogoSelecionado.odds_reais.match_winner.find(o=>o.value==='Home')?.odd || '-'}</div></div>
                                                        <div style={{flex: 1, background: '#1c202d', padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${theme.border}`}}><div style={{fontSize: '10px', color: theme.textMuted}}>EMPATE</div><div style={{fontSize: '16px', color: '#fff', fontWeight: 'bold'}}>{jogoSelecionado.odds_reais.match_winner.find(o=>o.value==='Draw')?.odd || '-'}</div></div>
                                                        <div style={{flex: 1, background: '#1c202d', padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${theme.border}`}}><div style={{fontSize: '10px', color: theme.textMuted}}>FORA</div><div style={{fontSize: '16px', color: '#fff', fontWeight: 'bold'}}>{jogoSelecionado.odds_reais.match_winner.find(o=>o.value==='Away')?.odd || '-'}</div></div>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{background: theme.bgApp, padding: '18px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '10px'}}>
                                                    <span style={{fontSize: '12px', fontWeight: 'bold'}}>Ambas Marcam (BTTS)</span>
                                                    <span style={{color: jogoSelecionado.analise_ia.probs.btts === 'SIM' ? theme.green : theme.red, fontWeight: '800'}}>{jogoSelecionado.analise_ia.probs.btts}</span>
                                                </div>
                                                <div style={{fontSize: '11px', color: theme.textMuted}}>{jogoSelecionado.analise_ia.avg_goals}</div>
                                            </div>
                                        </> 
                                    ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '13px'}}>Sem histórico suficiente para prever.</div>}
                                </motion.div> 
                            )}
                            
                            {/* 🏃 ESCALAÇÕES - BUSCADOR DINÂMICO E BLINDADO */}
                            {rightTab === 'Escalações' && ( 
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {jogoSelecionado.lineups_reais && jogoSelecionado.lineups_reais.length > 0 ? ( 
                                        <>
                                            <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
                                                <div style={{flex: 1, background: theme.bgApp, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center'}}>
                                                    <div style={{fontSize: '18px', fontWeight: '900', color: theme.cyan}}>{jogoSelecionado.taticas_treinadores?.home}</div><div style={{fontSize: '10px', color: theme.textMuted}}>TÁTICA</div>
                                                </div>
                                                <div style={{flex: 1, background: theme.bgApp, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'center'}}>
                                                    <div style={{fontSize: '18px', fontWeight: '900', color: theme.yellow}}>{jogoSelecionado.taticas_treinadores?.away}</div><div style={{fontSize: '10px', color: theme.textMuted}}>TÁTICA</div>
                                                </div>
                                            </div>
                                            
                                            <div style={{display: 'flex', gap: '15px'}}>
                                                <div style={{flex: 1}}>
                                                    {jogoSelecionado.lineups_reais.filter(l => l.team_id === jogoSelecionado.home_id).map((p, idx) => ( 
                                                        <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '10px', background: theme.bgApp, padding: '8px', borderRadius: '6px', marginBottom: '6px', border: `1px solid ${theme.border}`}}><span style={{width: '20px', height: '20px', borderRadius: '4px', background: theme.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: theme.textMain}}>{p.number || '-'}</span><span style={{fontSize: '11px', color: theme.textMain, overflow: 'hidden'}}>{p.name}</span></div> 
                                                    ))}
                                                </div>
                                                <div style={{flex: 1}}>
                                                    {jogoSelecionado.lineups_reais.filter(l => l.team_id === jogoSelecionado.away_id).map((p, idx) => ( 
                                                        <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '10px', background: theme.bgApp, padding: '8px', borderRadius: '6px', marginBottom: '6px', border: `1px solid ${theme.border}`, flexDirection: 'row-reverse'}}><span style={{width: '20px', height: '20px', borderRadius: '4px', background: theme.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: theme.textMain}}>{p.number || '-'}</span><span style={{fontSize: '11px', color: theme.textMain, overflow: 'hidden'}}>{p.name}</span></div> 
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{marginTop: '20px', borderTop: `1px solid ${theme.border}`, paddingTop: '15px'}}>
                                                <div style={{fontSize: '12px', fontWeight: 'bold', color: theme.textMuted, marginBottom: '10px', textAlign: 'center'}}>TREINADORES & RESERVAS</div>
                                                <div style={{display: 'flex', gap: '15px', fontSize: '11px', color: theme.textMain}}>
                                                    <div style={{flex: 1}}><div style={{color: theme.cyan, marginBottom: '5px'}}>👨‍💼 {jogoSelecionado.taticas_treinadores?.coachHome}</div>{jogoSelecionado.subs_reais?.filter(s=>s.team_id===jogoSelecionado.home_id).map((s,i)=><div key={i} style={{color: theme.textMuted}}>{s.number} - {s.name}</div>)}</div>
                                                    <div style={{flex: 1, textAlign: 'right'}}><div style={{color: theme.yellow, marginBottom: '5px'}}>👨‍💼 {jogoSelecionado.taticas_treinadores?.coachAway}</div>{jogoSelecionado.subs_reais?.filter(s=>s.team_id===jogoSelecionado.away_id).map((s,i)=><div key={i} style={{color: theme.textMuted}}>{s.name} - {s.number}</div>)}</div>
                                                </div>
                                            </div>
                                        </> 
                                    ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '13px'}}>Escalações oficiais ainda não foram divulgadas.</div>}
                                </motion.div> 
                            )}

                            {/* 📈 ESTATÍSTICAS E DESTAQUES DE JOGADORES - BLINDADAS */}
                            {rightTab === 'Estatísticas' && ( 
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {jogoSelecionado.top_jogadores && jogoSelecionado.top_jogadores.length > 0 && (
                                        <div style={{marginBottom: '20px'}}>
                                            <h4 style={{fontSize: '11px', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '10px'}}>Destaques da Partida (Notas)</h4>
                                            <div style={{display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px'}}>
                                                {jogoSelecionado.top_jogadores.map((p, i) => (
                                                    <div key={i} style={{minWidth: '130px', background: theme.bgApp, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                                        <img src={p.team_logo} style={{width: '20px', marginBottom: '5px'}} alt=""/>
                                                        <div style={{fontSize: '11px', fontWeight: 'bold', color: theme.textMain, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%'}}>{p.name}</div>
                                                        <div style={{fontSize: '18px', fontWeight: '900', color: theme.cyan, margin: '5px 0'}}>{p.rating}</div>
                                                        <div style={{fontSize: '9px', color: theme.textMuted}}>Remates: {p.shots}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {jogoSelecionado.stats_reais && jogoSelecionado.stats_reais.length > 0 ? ( 
                                        <div style={{background: theme.bgApp, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`}}>
                                            {jogoSelecionado.stats_reais.map((s, index) => { 
                                                const labelPt = s.type.replace('Ball Possession', 'Posse de Bola (%)').replace('Total Shots', 'Total de Remates').replace('Shots on Goal', 'Remates à Baliza').replace('Fouls', 'Faltas').replace('Corner Kicks', 'Cantos').replace('Yellow Cards', 'Amarelos'); 
                                                return <StatRow key={index} label={labelPt} home={s.home} away={s.away} /> 
                                            })}
                                        </div> 
                                    ) : <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted, fontSize: '13px'}}>A aguardar o início da partida para gerar estatísticas.</div>}
                                </motion.div> 
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function StatRow({ label, home, away }) {
  const homeVal = Number(home) || 0; const awayVal = Number(away) || 0; const total = homeVal + awayVal;
  const homeP = total > 0 ? Math.round((homeVal/total)*100) : 50; const awayP = total > 0 ? Math.round((awayVal/total)*100) : 50;
  return ( <div style={{ margin: '15px 0' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted, marginBottom: '6px' }}><span>{label.includes('%') ? `${homeVal}%` : homeVal}</span><span style={{fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center'}}>{label}</span><span>{label.includes('%') ? `${awayVal}%` : awayVal}</span></div><div style={{ display: 'flex', gap: '6px' }}><div style={{ flex: 1, height: '6px', backgroundColor: theme.border, display: 'flex', justifyContent: 'flex-end', borderRadius: '3px' }}><div style={{ width: `${homeP}%`, backgroundColor: theme.cyan }}/></div><div style={{ flex: 1, height: '6px', backgroundColor: theme.border, borderRadius: '3px' }}><div style={{ width: `${awayP}%`, backgroundColor: theme.yellow }}/></div></div></div> );
}

function ClassificacaoPanel({ menuAtivo, loadingClassificacao, classificacao }) {
    return ( <motion.div initial={{opacity: 0}} animate={{opacity: 1}} style={{background: theme.bgPanel, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', padding: '20px'}}>{menuAtivo === 'todos' || menuAtivo === 'todos os jogos' || menuAtivo === 'esportes' ? ( <div style={{textAlign: 'center', color: theme.textMuted, padding: '40px 0'}}><span style={{fontSize: '30px', display: 'block', marginBottom: '10px'}}>🏆</span>Selecione uma liga no menu lateral.</div> ) : loadingClassificacao ? ( <div style={{textAlign: 'center', color: theme.cyan, padding: '40px 0', fontWeight: 'bold'}}>Calculando...</div> ) : ( <div style={{overflowX: 'auto'}}><table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: theme.textMain, fontSize: '13px'}}><thead><tr style={{borderBottom: `1px solid ${theme.border}`, color: theme.textMuted}}><th>#</th><th>Equipe</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr></thead><tbody>{classificacao.map((t, i) => (<tr key={i} style={{borderBottom: `1px solid rgba(255,255,255,0.02)`}}><td style={{padding: '12px 8px', color: theme.cyan}}>{t.position}</td><td style={{padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px'}}><img src={t.logo} style={{width: '24px'}} alt="" />{t.team_name}</td><td>{t.points}</td><td>{t.matches_played}</td><td>{t.won}</td><td>{t.draw}</td><td>{t.lost}</td><td>{t.goal_diff}</td></tr>))}</tbody></table></div> )}</motion.div> );
}

function ModalsExtras({ menuAtivo, form, setForm, setMenuAtivo, setUserData }) {
  const [passo, setPasso] = useState(1); const [loading, setLoading] = useState(false); const [dadosPix, setDadosPix] = useState(null); const API = "https://betanalitics-1-9stc.onrender.com";
  const initialization = useMemo(() => ({ amount: 29.90, payer: { email: form.email } }), [form.email]);
  const customization = useMemo(() => ({ visual: { style: { theme: 'dark', customVariables: { formBackgroundColor: '#13161f' } } }, paymentMethods: { pix: 'all', creditCard: 'all', debitCard: 'all', maxInstallments: 1 } }), []);
  useEffect(() => { let intervalId; if (passo === 2 && dadosPix?.id) { intervalId = setInterval(async () => { try { const res = await axios.get(`${API}/status/${dadosPix.id}`); if (res.data.status === 'approved') { clearInterval(intervalId); alert("🎉 Pagamento PIX Aprovado! Bem-vindo ao VIP PRO!"); if (setUserData) { setUserData({ email: form.email, is_vip: true }); localStorage.setItem('bet_sessao_ativa', form.email); } setMenuAtivo('todos'); } } catch (err) {} }, 3000); } return () => clearInterval(intervalId); }, [passo, dadosPix, form.email, setMenuAtivo, setUserData]);
  const handlePagarCartao = () => { if (!form.nome || !form.email || form.cpf.length !== 11) return alert("⚠️ ERRO: Preencha Nome, E-mail e os 11 números do CPF."); setPasso(3); };
  async function gerarPix() { if (!form.nome || !form.email || form.cpf.length !== 11) return alert("⚠️ ERRO: Preencha os dados corretamente."); try { setLoading(true); const payload = { transaction_amount: 29.90, payment_method_id: "pix", payer: { email: form.email, first_name: form.nome, identification: { type: "CPF", number: form.cpf.replace(/\D/g, "") } } }; const { data } = await axios.post(`${API}/api/processar-pagamento`, payload); if (data.qr_code_base64 || data.qr_code) { setDadosPix(data); setPasso(2); } } catch (e) { alert("❌ ERRO DO BANCO"); } finally { setLoading(false); } }
  const onSubmitCartao = async (formData) => { return new Promise((resolve, reject) => { axios.post(`${API}/api/processar-pagamento`, { ...formData, transaction_amount: 29.90, payer: { email: form.email, first_name: form.nome, identification: { type: "CPF", number: form.cpf.replace(/\D/g, "") } } }).then(res => { if (res.data.status === 'approved') { alert("🎉 Pagamento Aprovado!"); if (setUserData) { setUserData({ email: form.email, is_vip: true }); localStorage.setItem('bet_sessao_ativa', form.email); } setMenuAtivo('todos'); } else { alert("❌ Pagamento recusado."); } resolve(); }).catch(err => { reject(); }); }); };
  if (menuAtivo !== "assinar pro") return null;
  return (
    <div style={{position:"fixed", inset:0, background:"#000a", display:"flex", justifyContent:"center", alignItems:"center", zIndex: 1000}}>
      <div style={{background:"#13161f", padding:30, borderRadius:10, width:'90%', maxWidth: 450, maxHeight: '90vh', overflowY: 'auto', display: "flex", flexDirection: "column", gap: "15px", color: "#fff"}}>
        <button onClick={() => setMenuAtivo('todos')} style={{alignSelf: 'flex-start', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold'}}>⬅ Cancelar</button>
        {passo === 1 && ( <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}> <h2 style={{margin: 0, color: "#00d4b6"}}>Assinar VIP PRO 👑</h2> <input placeholder="Seu Nome Completo" value={form.nome} style={{padding: '14px', borderRadius: '6px', border: '1px solid #232838', background: '#090a0f', color: '#fff'}} onChange={e=>setForm({...form,nome:e.target.value})} /> <input placeholder="Seu E-mail" value={form.email} style={{padding: '14px', borderRadius: '6px', border: '1px solid #232838', background: '#090a0f', color: '#fff'}} onChange={e=>setForm({...form,email:e.target.value})} /> <input placeholder="Seu CPF" value={form.cpf} maxLength={11} style={{padding: '14px', borderRadius: '6px', border: '1px solid #232838', background: '#090a0f', color: '#fff'}} onChange={e=>setForm({...form,cpf:e.target.value.replace(/\D/g, '')})} /> <div style={{height: '1px', background: theme.border, margin: '10px 0'}}></div> <button onClick={gerarPix} disabled={loading} style={{padding: '18px', background: '#00d4b6', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}> <span style={{fontSize: '20px'}}>💠</span> {loading ? "A processar..." : "Pagar com PIX Rápido"} </button> <button onClick={handlePagarCartao} disabled={loading} style={{padding: '18px', background: theme.bgHover, color: '#fff', fontWeight: 'bold', border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}> <span style={{fontSize: '20px'}}>💳</span> Pagar com Cartão (Crédito/Débito) </button> </motion.div> )}
        {passo === 2 && dadosPix && ( <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}> <h3 style={{margin: 0, color: "#00d4b6", textAlign: 'center'}}>PIX Gerado!</h3> <img src={`data:image/jpeg;base64,${dadosPix.qr_code_base64}`} style={{width:"100%", maxWidth: '250px', alignSelf: 'center', borderRadius: '8px', border: '3px solid #fff'}} alt="QR Code" /> <textarea value={dadosPix.qr_code} readOnly style={{padding: '12px', fontSize: '11px', background: '#090a0f', color: '#64748b', border: '1px solid #232838', borderRadius: '6px', resize: 'none'}} rows={4} /> <button onClick={()=>{ navigator.clipboard.writeText(dadosPix.qr_code); alert("Linha copiada!"); }} style={{padding: '15px', background: '#00d4b6', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Copiar Linha PIX</button> </motion.div> )}
        {passo === 3 && ( <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}> <h3 style={{margin: 0, color: "#fff", textAlign: 'center'}}>Pagar com Cartão</h3> <Payment initialization={initialization} customization={customization} onSubmit={onSubmitCartao} onError={(e) => console.log(e)} /> <button onClick={() => setPasso(1)} style={{padding: '12px', background: 'transparent', color: '#64748b', border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer'}}>Voltar aos métodos</button> </motion.div> )}
      </div>
    </div>
  );
}

function AuthModal({ showLoginMenu, setShowLoginMenu, authMode, setAuthMode, loginEmail, setLoginEmail, loginSenha, setLoginSenha, handleLogin, handleCadastro }) {
    if (!showLoginMenu) return null;
    return ( 
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,10,15,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: theme.bgPanel, padding: '40px 30px', width: '90%', maxWidth: '400px' }}>
          <h2 style={{ color: '#fff', textAlign: 'center' }}>Acesso</h2>
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}><button onClick={() => setAuthMode('login')} style={{flex: 1, padding: '12px', background: authMode === 'login' ? theme.cyan : 'transparent', color: '#fff', border: 'none'}}>Entrar</button><button onClick={() => setAuthMode('register')} style={{flex: 1, padding: '12px', background: authMode === 'register' ? theme.cyan : 'transparent', color: '#fff', border: 'none'}}>Cadastrar</button></div>
          <input placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{width: '100%', padding: '15px', marginBottom: '15px', background: '#000', color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px'}} />
          <input placeholder="Senha" type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} style={{width: '100%', padding: '15px', marginBottom: '25px', background: '#000', color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px'}} />
          <button style={{width: '100%', padding: '15px', background: theme.cyan, color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px'}} onClick={authMode === 'login' ? handleLogin : handleCadastro}>CONTINUAR</button>
          <button style={{width: '100%', padding: '10px', background: 'transparent', color: theme.textMuted, border: 'none', marginTop: '10px'}} onClick={() => setShowLoginMenu(false)}>Cancelar</button>
        </motion.div>
      </div> 
    );
}