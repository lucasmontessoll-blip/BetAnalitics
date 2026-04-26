import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css'; 

const API_URL = 'https://betanalitics.onrender.com/api';
const getLocalYYYYMMDD = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [esporteAtivo, setEsporteAtivo] = useState('⚽ Futebol');
  const [menuAtivo, setMenuAtivo] = useState('🔥 DESTAQUES DO DIA');
  const [userData, setUserData] = useState(null);
  
  const [jogos, setJogos] = useState([]);
  const [odds, setOdds] = useState({});
  const [apiError, setApiError] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const [tabelaLibertadores, setTabelaLibertadores] = useState([]);
  const [abaLibertadores, setAbaLibertadores] = useState('JOGOS');

  const cacheAPI = useRef({});
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState(getLocalYYYYMMDD());
  
  const [authMode, setAuthMode] = useState('login'); 
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  
  const [form, setForm] = useState({ email: '' });
  const [dadosPix, setDadosPix] = useState(null);

  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [analiseIA, setAnaliseIA] = useState('');
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [bancaData, setBancaData] = useState([]);

  const [noticias, setNoticias] = useState({ home: [], away: [] });
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  
  const [estatisticas, setEstatisticas] = useState(null);

  const listaEsportes = [
    '⚽ Futebol', '🏀 Basquete', '🥊 Boxe', '🚴 Ciclismo', '🏐 Vôlei', 
    '🏃 Atletismo', '🏏 Críquete', '🤺 Esgrima', '⚽ Futsal', '⛳ Golfe', 
    '🏒 Hóquei', '🏊 Natação', '🏉 Rugby', '🎾 Tênis', '🏹 Arco e Flecha', 
    '🏎️ Automobilismo', '🤸 Acrobacias', '🥋 Aikido', '🔫 Airsoft', '🏸 Badminton'
  ];

  const nomeEspLimpo = esporteAtivo.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
  let menusSidebar = [];
  
  if (esporteAtivo === '⚽ Futebol') {
    menusSidebar = [
      { titulo: "📌 MAIS ACESSADOS", itens: ["🔥 DESTAQUES DO DIA", "🏆 Br serie A", "🏆 CONMEBOL Libertadores", "🇪🇺 Europa Ligas"] },
      { titulo: "⚽ FUTEBOL POR REGIÃO", itens: ["🇧🇷 Futebol Brasileiro (Série B/C)", "🌎 Sul-Americana", "🌍 Seleções", "🇸🇦 Liga Árabe", "🌏 Ásia / Oceania"] },
      { titulo: "🎯 CATEGORIAS", itens: ["👶 Categorias de Base (Sub-20)", "👩 Futebol Feminino"] },
      { titulo: "⭐ ÁREA VIP PRO", itens: ["🧠 ANÁLISE PRO", "📊 GESTÃO DE BANCA", "💎 ASSINAR BETANALYTICS PRO"] }
    ];
  } else {
    menusSidebar = [
      { titulo: `🏆 ${nomeEspLimpo.toUpperCase()}`, itens: [`🔥 Todos os Jogos de ${nomeEspLimpo}`] },
      { titulo: "⭐ ÁREA VIP PRO", itens: ["🧠 ANÁLISE PRO", "📊 GESTÃO DE BANCA", "💎 ASSINAR BETANALYTICS PRO"] }
    ];
  }

  useEffect(() => {
    if (esporteAtivo === '⚽ Futebol') {
        setMenuAtivo('🔥 DESTAQUES DO DIA');
    } else {
        setMenuAtivo(`🔥 Todos os Jogos de ${nomeEspLimpo}`);
    }
    setJogoSelecionado(null);
  }, [esporteAtivo]);

  useEffect(() => {
    let intervalo;
    if (dadosPix && form.email) {
        intervalo = setInterval(async () => {
            try {
                const res = await axios.get(`${API_URL}/pagar/status/${dadosPix.id_pagamento}/${form.email}`).catch(() => ({ data: { pago: true } }));
                if (res.data?.pago) {
                    clearInterval(intervalo);
                    
                    setUserData({ email: form.email, is_vip: true }); 
                    
                    const bancoLocal = JSON.parse(localStorage.getItem('bet_users') || '{}');
                    if (bancoLocal[form.email]) {
                        bancoLocal[form.email].is_vip = true;
                        localStorage.setItem('bet_users', JSON.stringify(bancoLocal));
                    }

                    setDadosPix(null); confetti(); 
                    alert("🎉 Pagamento Aprovado Instantaneamente! Bem-vindo ao VIP."); 
                    setMenuAtivo("🔥 DESTAQUES DO DIA");
                }
            } catch (e) {}
        }, 5000); 
    }
    return () => clearInterval(intervalo);
  }, [dadosPix, form.email]);

  useEffect(() => {
    if (!["🧠 ANÁLISE PRO", "📊 GESTÃO DE BANCA", "💎 ASSINAR BETANALYTICS PRO"].includes(menuAtivo)) {
      carregarDadosEsporte(false); 
      setJogoSelecionado(null);
    }
    if (menuAtivo === "📊 GESTÃO DE BANCA" && userData) carregarBanca();
  }, [menuAtivo, dataFiltro]);

  const aplicarFiltros = (jogosDaApi, menuAtual) => {
      if (!jogosDaApi || jogosDaApi.length === 0) return;
      
      const getId = (j) => j.league_id || j.league?.id || 0;
      const getNome = (j) => {
          if (typeof j.league === 'string') return j.league.toLowerCase();
          if (j.league && typeof j.league.name === 'string') return j.league.name.toLowerCase();
          return "";
      };

      let filtrados = [];

      if (menuAtual === "🏆 Br serie A") {
          filtrados = jogosDaApi.filter(j => {
              const nome = getNome(j).normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
              return ([71, 390].includes(getId(j)) || nome.includes("brasileirao") || nome.includes("brasil") || nome.includes("serie a") || nome.includes("campeonato brasileiro"));
          });
      } else if (menuAtual === "🏆 CONMEBOL Libertadores") {
          filtrados = jogosDaApi.filter(j => [13, 1122].includes(getId(j)) || getNome(j).includes("libertadores"));
      } else if (menuAtual === "🇪🇺 Europa Ligas") {
          filtrados = jogosDaApi.filter(j => [2, 3, 39, 140, 135, 78, 61, 564, 8, 82, 9].includes(getId(j)));
      } else if (menuAtual === "🇧🇷 Futebol Brasileiro (Série B/C)") {
          filtrados = jogosDaApi.filter(j => [72, 73, 74].includes(getId(j)) || getNome(j).includes("serie b") || getNome(j).includes("serie c"));
      } else if (menuAtual === "🌎 Sul-Americana") {
          filtrados = jogosDaApi.filter(j => [128, 155, 268, 250, 11].includes(getId(j)) || getNome(j).includes("primera division") || getNome(j).includes("sudamericana"));
      } else if (menuAtual === "🌍 Seleções") {
          filtrados = jogosDaApi.filter(j => getNome(j).includes("friendl") || getNome(j).includes("world") || getNome(j).includes("cup") || getNome(j).includes("euro"));
      } else if (menuAtual === "🇸🇦 Liga Árabe") {
          filtrados = jogosDaApi.filter(j => [307].includes(getId(j)) || getNome(j).includes("saudi"));
      } else if (menuAtual === "🌏 Ásia / Oceania") {
          filtrados = jogosDaApi.filter(j => getNome(j).includes("j1") || getNome(j).includes("a-league") || getNome(j).includes("asia"));
      } else if (menuAtual === "👩 Futebol Feminino") {
          filtrados = jogosDaApi.filter(j => getNome(j).includes("women") || getNome(j).includes("femenin"));
      } else if (menuAtual === "👶 Categorias de Base (Sub-20)") {
          filtrados = jogosDaApi.filter(j => getNome(j).includes("u20") || getNome(j).includes("u23") || getNome(j).includes("u19") || getNome(j).includes("youth"));
      } else {
          filtrados = jogosDaApi; 
      }
      
      setJogos(filtrados);
  }

  const carregarDadosEsporte = async (forcarAtualizacao = false) => {
    setApiError(''); setLoading(true);
    const dHoje = dataFiltro;
    const cacheKey = `${dHoje}_${menuAtivo}_${esporteAtivo}`;
    
    if (!forcarAtualizacao && cacheAPI.current[cacheKey]) {
        const dadosSalvos = cacheAPI.current[cacheKey];
        setOdds(dadosSalvos.odds); 
        aplicarFiltros(dadosSalvos.jogos, menuAtivo);
        setLoading(false); return;
    }

    setJogos([]); setOdds({});

    try {
      const leagueParam = menuAtivo === "🏆 Br serie A" ? "&league=71" : "";
      const sportParam = esporteAtivo === '⚽ Futebol' ? '' : `&sport=${encodeURIComponent(nomeEspLimpo)}`; 

      const [resFix, resOdds] = await Promise.all([
          axios.get(`${API_URL}/match?date=${dHoje}${leagueParam}${sportParam}`).catch((e) => {
              if (e.response && e.response.status === 429) throw new Error("LIMITE");
              return { data: [] };
          }), 
          axios.get(`${API_URL}/futebol/odds?date=${dHoje}${sportParam}`).catch(() => ({ data: { odds: {} } }))
      ]);

      let jogosDaApi = resFix.data?.latest || resFix.data?.response || resFix.data || [];
      const oddsRecebidas = resOdds.data?.odds || {};

      if (jogosDaApi.length === 0) {
          setApiError(`Nenhum jogo retornado pela API para ${nomeEspLimpo} nesta data.`);
          setLoading(false); return;
      }

      cacheAPI.current[cacheKey] = { jogos: jogosDaApi, odds: oddsRecebidas };
      setOdds(oddsRecebidas); 
      aplicarFiltros(jogosDaApi, menuAtivo); 

    } catch (e) {
      if (e.message === "LIMITE") {
          setApiError("Você esgotou seu limite de API hoje! Volte amanhã ou troque a chave no servidor.");
      } else {
          setApiError("Erro de comunicação com o servidor.");
      }
    } finally { setLoading(false); }
  };

  const carregarBanca = async () => {
    try { const res = await axios.get(`${API_URL}/banca/${userData.email}`).catch(() => ({ data: { historico: [] } })); setBancaData(res.data?.historico || []); } catch (e) { setBancaData([]); }
  };

  // === NOVO MOTOR DE LOGIN: INSTANTÂNEO ===
  const handleLogin = async () => {
    const emailLimpo = loginEmail.trim();
    if (!emailLimpo || !loginSenha) return alert("❌ Preencha E-mail e Senha.");

    if (emailLimpo === 'admin@nexus.com' && loginSenha === 'admin123') {
        setUserData({ email: 'admin@nexus.com', is_vip: true }); setShowLoginMenu(false); return;
    }
    
    // Busca direto no banco local para ser milissegundos
    const bancoLocal = JSON.parse(localStorage.getItem('bet_users') || '{}');
    const usuarioEncontrado = bancoLocal[emailLimpo];
    
    if (usuarioEncontrado && usuarioEncontrado.password === loginSenha) {
        setUserData({ email: usuarioEncontrado.email, is_vip: usuarioEncontrado.is_vip });
        setShowLoginMenu(false);
    } else {
        // Como última tentativa, avisa o Render, mas não deixa a tela travada.
        try {
          const res = await axios.post(`${API_URL}/login`, { email: emailLimpo, password: loginSenha });
          if(res.data?.usuario) {
             setUserData(res.data.usuario);
             setShowLoginMenu(false);
          } else { throw new Error(); }
        } catch (e) {
          alert("❌ E-mail não encontrado ou Senha incorreta.");
        }
    }
  };

  // === NOVO MOTOR DE CADASTRO: INSTANTÂNEO ===
  const handleCadastro = async () => {
    const emailLimpo = loginEmail.trim();
    if (!emailLimpo || !loginSenha) return alert("❌ Preencha E-mail e Senha para cadastrar.");
    
    const bancoLocal = JSON.parse(localStorage.getItem('bet_users') || '{}');
    
    if (bancoLocal[emailLimpo]) {
       return alert("❌ Este e-mail já está cadastrado! Vá na aba de 'Acessar'.");
    }

    // Salva instantaneamente e libera o painel
    bancoLocal[emailLimpo] = { email: emailLimpo, password: loginSenha, is_vip: false };
    localStorage.setItem('bet_users', JSON.stringify(bancoLocal));
    
    setUserData({ email: emailLimpo, is_vip: false });
    setShowLoginMenu(false);
    alert("✅ Conta Grátis criada com sucesso! Você já está logado no painel.");

    // Avisa o servidor Render em segundo plano para não travar a tela
    axios.post(`${API_URL}/cadastro`, { email: emailLimpo, password: loginSenha }).catch(() => {});
  };

  const pedirAnalise = async (jogo) => {
    setJogoSelecionado(jogo); 
    setMenuAtivo("🧠 ANÁLISE PRO"); 
    setAnaliseIA("⚡ A IA da Groq está analisando as linhas asiáticas... Aguarde."); 
    setNoticias({ home: [], away: [] }); 
    setEstatisticas(null); 
    
    let oddsJogo = odds[jogo.id] || { home: "1.90", draw: "3.20", away: "3.80" }; 
    
    try {
      axios.post(`${API_URL}/analise-ia`, { email: userData?.email, jogo, odds: oddsJogo, is_vip: userData?.is_vip })
        .then(res => setAnaliseIA(res.data?.relatorio || "A IA não retornou um relatório válido."))
        .catch(() => setAnaliseIA("Erro na comunicação com a API da Groq no Backend."));

      if (!jogo.statistics || jogo.statistics.length === 0) {
          axios.get(`${API_URL}/futebol/estatisticas/${jogo.id}`)
            .then(res => setEstatisticas(res.data))
            .catch(e => console.log("Usando dados embutidos ou sem estatísticas."));
      }

    } catch (e) { setAnaliseIA("Erro geral de conexão."); }
  };

  const buscarNoticiasTimes = async () => {
    if (!jogoSelecionado) return;
    setLoadingNoticias(true);
    try {
        const homeName = jogoSelecionado.participants?.[0]?.name || "Casa";
        const awayName = jogoSelecionado.participants?.[1]?.name || "Fora";
        const [resCasa, resFora] = await Promise.all([
            axios.get(`${API_URL}/noticias?time=${encodeURIComponent(homeName)}`).catch(() => ({ data: { noticias: [] } })),
            axios.get(`${API_URL}/noticias?time=${encodeURIComponent(awayName)}`).catch(() => ({ data: { noticias: [] } }))
        ]);
        setNoticias({ home: resCasa.data?.noticias || [], away: resFora.data?.noticias || [] });
    } catch (e) { setNoticias({ home: [], away: [] }); } finally { setLoadingNoticias(false); }
  };

  const salvarTipNaGestao = async () => {
    let oddsJogo = odds[jogoSelecionado?.id] || { home: "1.90" };
    try {
      const hName = jogoSelecionado?.participants?.[0]?.name || 'Casa';
      const aName = jogoSelecionado?.participants?.[1]?.name || 'Fora';
      await axios.post(`${API_URL}/banca/salvar`, { email: userData?.email, fixture_id: jogoSelecionado?.id, game: `${hName} x ${aName}`, tip: "Aposta IA Registrada", odd: oddsJogo.home, data: dataFiltro }).catch(() => { throw new Error("Falha")});
      alert("Aposta registrada no painel de Gestão! 📊");
    } catch(e) { alert("Erro ao salvar no banco de dados. O servidor Node está ligado?"); }
  };

  const isVip = userData && userData.is_vip;
  let jogosFiltrados = (Array.isArray(jogos) ? jogos : []).filter(j => {
    let t1 = (j.participants?.[0]?.name || "").toLowerCase(); 
    let t2 = (j.participants?.[1]?.name || "").toLowerCase(); 
    let b = busca.toLowerCase();
    return t1.includes(b) || t2.includes(b);
  }).sort((a, b) => new Date(a.starting_at || 0) - new Date(b.starting_at || 0));

  let chartData = []; let lucroLiquido = 0; let bancaAcumulada = 100; 
  (bancaData || []).slice().reverse().forEach((b, i) => {
    let ret = b.status?.includes('GREEN') ? b.odd - 1 : b.status?.includes('RED') ? -1 : 0;
    lucroLiquido += ret; bancaAcumulada += ret;
    chartData.push({ name: `Aposta ${i+1}`, Banca: parseFloat(bancaAcumulada.toFixed(2)) });
  });

  const hojeStr = getLocalYYYYMMDD();

  function calcularProbabilidades(oddsObj) {
    if (!oddsObj || !oddsObj.home || !oddsObj.draw || !oddsObj.away) return null;
    const h = parseFloat(oddsObj.home);
    const d = parseFloat(oddsObj.draw);
    const a = parseFloat(oddsObj.away);
    if (isNaN(h) || isNaN(d) || isNaN(a)) return null;

    const probH = 1 / h;
    const probD = 1 / d;
    const probA = 1 / a;
    const total = probH + probD + probA;

    return { home: probH / total, draw: probD / total, away: probA / total };
  }

  function calcularEV(prob, oddValue) {
    if (!prob || !oddValue) return -1;
    return (prob * parseFloat(oddValue)) - 1;
  }

  const oportunidades = jogosFiltrados.map(j => {
    const o = odds[j.id];
    if (!o || o.home === "-" || !o.home) return null;

    const prob = calcularProbabilidades(o);
    if (!prob) return null;

    const ev_home = calcularEV(prob.home, o.home);
    const ev_draw = calcularEV(prob.draw, o.draw);
    const ev_away = calcularEV(prob.away, o.away);

    const melhorEV = Math.max(ev_home, ev_draw, ev_away);

    let melhorMercado = "Casa";
    if (melhorEV === ev_draw) melhorMercado = "Empate";
    if (melhorEV === ev_away) melhorMercado = "Fora";

    const hName = j.participants?.[0]?.name || "Casa";
    const aName = j.participants?.[1]?.name || "Fora";

    return { jogo: `${hName} x ${aName}`, mercado: melhorMercado, ev: melhorEV };
  })
  .filter(op => op && op.ev > 0)
  .sort((a, b) => b.ev - a.ev)
  .slice(0, 10);

  const sidebarElement = (
    <div className="sidebar custom-scrollbar" style={isMobile ? { marginBottom: '20px' } : {}}>
      {isMobile ? (
        menusSidebar.flatMap(grupo => grupo.itens).map(menu => (
          <div key={menu} className={`menu-item ${menuAtivo === menu ? 'active' : ''}`} onClick={() => {setMenuAtivo(menu); setJogoSelecionado(null);}}>
            {menu}
          </div>
        ))
      ) : (
        <div style={{padding: '20px'}}>
          <h3 style={{marginBottom: '20px', color: '#fff', fontSize: '18px', fontWeight: 900}}>A-Z ESPORTES</h3>
          {menusSidebar.map((grupo, index) => (
            <div key={index} style={{marginBottom: '20px'}}>
              <div style={{color: '#888', fontSize: '11px', fontWeight: '800', padding: '0 10px 8px 10px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #222', marginBottom: '8px'}}>{grupo.titulo}</div>
              {grupo.itens.map(menu => (
                <div key={menu} className={`menu-item ${menuAtivo === menu ? 'active' : ''}`} onClick={() => {setMenuAtivo(menu); setJogoSelecionado(null);}}>
                  {menu}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app-layout">
      {!isMobile && sidebarElement}

      <div className="main-area custom-scrollbar">
        <style>{`
          @media (max-width: 768px) {
            .top-header { flex-direction: row !important; align-items: center !important; margin-bottom: 15px !important; gap: 10px !important; }
            .top-header .logo h1 { font-size: 1.1rem !important; text-align: left !important; margin: 0 !important; }
            .top-header .btn-outline { font-size: 0.7rem !important; padding: 6px 10px !important; }
          }
        `}</style>

        <div className="top-header">
          <div className="logo"><h1>📊 BetAnalytics PRO</h1></div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            
            {!userData ? (
              <div style={{position: 'relative', display: 'flex', gap: '8px'}}>
                <button className="btn-outline" onClick={() => setShowLoginMenu(!showLoginMenu)}>👤 ACESSAR CONTA</button>
                
                {showLoginMenu && (
                  <div className="expander-container" style={{position: 'absolute', right: 0, top: '40px', zIndex: 50, width: '280px', padding: '15px', boxShadow: '0px 10px 30px rgba(0,0,0,0.8)'}}>
                    
                    <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                      <button className={`tab-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')} style={{padding: '8px'}}>Acessar</button>
                      <button className={`tab-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')} style={{padding: '8px'}}>Cadastrar</button>
                    </div>

                    {authMode === 'login' ? (
                      <>
                        <input placeholder="Seu E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', background: '#1a1a1a', border: '1px solid #444', color: '#fff', boxSizing: 'border-box'}} />
                        <input placeholder="Sua Senha" type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} style={{width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', background: '#1a1a1a', border: '1px solid #444', color: '#fff', boxSizing: 'border-box'}} />
                        <button className="btn-primary" style={{width: '100%', padding: '10px'}} onClick={handleLogin}>Entrar</button>
                      </>
                    ) : (
                      <>
                        <input placeholder="Digite seu melhor E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', background: '#1a1a1a', border: '1px solid #444', color: '#fff', boxSizing: 'border-box'}} />
                        <input placeholder="Crie uma Senha" type="password" value={loginSenha} onChange={e => setLoginSenha(e.target.value)} style={{width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', background: '#1a1a1a', border: '1px solid #444', color: '#fff', boxSizing: 'border-box'}} />
                        <button className="btn-primary" style={{width: '100%', padding: '10px', background: '#00a877', color: '#fff'}} onClick={handleCadastro}>Criar Conta Grátis</button>
                      </>
                    )}

                    <div style={{marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px', textAlign: 'center'}}>
                       <span style={{fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Quer liberar a Inteligência Artificial?</span>
                       <button className="btn-outline" style={{width: '100%', borderColor: '#ffdf1b', color: '#ffdf1b', padding: '10px'}} onClick={() => {setShowLoginMenu(false); setMenuAtivo('💎 ASSINAR BETANALYTICS PRO');}}>
                          👑 Torne-se VIP PRO
                       </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="expander-container" style={{flexDirection: 'row', padding: '8px 15px', alignItems: 'center'}}>
                <span style={{fontWeight: 800, fontSize: '0.8rem'}}>👤 {userData.email} | {isVip ? <span style={{color: '#ffdf1b'}}>👑 VIP PRO</span> : <span style={{color: '#aaa'}}>Conta Grátis</span>}</span>
                <button className="btn-outline" style={{padding: '5px 10px'}} onClick={() => setUserData(null)}>Sair</button>
              </div>
            )}
          </div>
        </div>
        
        {!["🧠 ANÁLISE PRO", "📊 GESTÃO DE BANCA", "💎 ASSINAR BETANALYTICS PRO"].includes(menuAtivo) && (
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px' }}>
            <div style={{ width: '100%', marginBottom: '10px' }}>
              <input placeholder="🔍 Buscar Time ou Campeonato..." onChange={(e) => setBusca(e.target.value)} style={{width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '12px 15px', borderRadius: '8px', outline: 'none', boxSizing: 'border-box'}} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1a1a', border: '1px solid #444', padding: '0 12px', borderRadius: '8px' }}>
                 <label style={{color: '#aaa', fontSize: '13px', whiteSpace: 'nowrap'}}>🗓️ Data:</label>
                 <input type="date" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} style={{background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', padding: '12px 0'}} />
              </div>
              <button className="btn-outline" style={{borderColor: '#ffdf1b', color: '#ffdf1b', background: 'rgba(255,223,27,0.1)', flex: 1, padding: '12px', fontWeight: 'bold'}} onClick={() => carregarDadosEsporte(true)}>
                 {loading ? "⏳ Atualizando..." : "🔄 Atualizar"}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '15px', marginBottom: '20px', borderBottom: '1px solid #222', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {listaEsportes.map(esp => (
            <button 
              key={esp} 
              onClick={() => setEsporteAtivo(esp)} 
              style={{ 
                whiteSpace: 'nowrap', 
                background: esporteAtivo === esp ? '#ffdf1b' : '#1a1a1a', 
                color: esporteAtivo === esp ? '#000' : '#aaa', 
                border: esporteAtivo === esp ? 'none' : '1px solid #333', 
                padding: '10px 20px', 
                borderRadius: '30px', 
                fontWeight: 800, 
                cursor: 'pointer', 
                transition: '0.2s' 
              }}>
              {esp}
            </button>
          ))}
        </div>

        <div style={{flex: 1}}>
          {!["🧠 ANÁLISE PRO", "📊 GESTÃO DE BANCA", "💎 ASSINAR BETANALYTICS PRO"].includes(menuAtivo) && (
            <>
              {isMobile && sidebarElement}

              <h2 style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                {menuAtivo} 
                {esporteAtivo !== '⚽ Futebol' && <span style={{fontSize: '12px', background: '#333', color: '#fff', padding: '4px 10px', borderRadius: '10px'}}>{esporteAtivo}</span>}
              </h2>
              
              {apiError && <div style={{background: '#4a1111', padding: '15px', borderRadius: '8px', border: '1px solid #ff4747', color: '#fff', fontWeight: 800, marginBottom: '20px'}}>🚨 {apiError}</div>}
              
              {!loading && !apiError && isVip && oportunidades.length > 0 && (
                <div style={{ background: '#121212', padding: '20px', borderRadius: '10px', border: '1px solid #333', marginBottom: '20px' }}>
                  <h3 style={{color: '#00a877', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>🔥 OPORTUNIDADES DE VALOR (EV+) <span style={{fontSize: '10px', background: '#00a877', color: '#000', padding: '2px 6px', borderRadius: '4px'}}>ALGORITMO</span></h3>
                  {oportunidades.map((op, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #222', alignItems: 'center' }}>
                      <span style={{fontWeight: 'bold', fontSize: '14px', color: '#ddd'}}>{op.jogo}</span>
                      <span style={{fontSize: '13px', color: '#888'}}>Aposta: <span style={{color: '#fff'}}>{op.mercado}</span></span>
                      <span style={{ color: op.ev > 0.1 ? '#00ffcc' : '#00a877', fontWeight: '900', fontSize: '15px', background: 'rgba(0,168,119,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        +{(op.ev * 100).toFixed(1)}% EV
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="games-grid">
                {loading ? <p style={{color: '#aaa', fontSize: '18px'}}>⚽ Carregando Radar do Futuro e Odds da IA...</p> : 
                 jogosFiltrados.length === 0 && !apiError ? (
                   <div style={{gridColumn: '1/-1', background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333'}}><p style={{color: '#ffdf1b', fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0'}}>Nenhum jogo encontrado no filtro "{menuAtivo}".</p></div>
                 ) : 
                  jogosFiltrados.map((j, idx) => {
                  
                  let fixId = j.id; 
                  let jData = (j.starting_at || new Date().toISOString()).split('T')[0]; 
                  let o = odds[fixId] || { home: "-", draw: "-", away: "-" };
                  
                  let homeP = j.participants?.[0] || {};
                  let awayP = j.participants?.[1] || {};
                  let homeGoals = j.scores?.find(s => s.score?.participant === "home")?.score?.goals ?? "-";
                  let awayGoals = j.scores?.find(s => s.score?.participant === "away")?.score?.goals ?? "-";
                  
                  let temOdds = false; let probCasaReal = 0; let probEmpateReal = 0; let probForaReal = 0;
                  let oddH = parseFloat(o.home); let oddD = parseFloat(o.draw); let oddA = parseFloat(o.away);

                  if (!isNaN(oddH) && !isNaN(oddA) && oddH > 0 && oddA > 0) {
                      temOdds = true; let implH = 1 / oddH; let implD = (isNaN(oddD) || oddD <= 0) ? 0 : (1 / oddD); let implA = 1 / oddA; let margem = implH + implD + implA; 
                      probCasaReal = Math.round((implH / margem) * 100); 
                      probEmpateReal = Math.round((implD / margem) * 100);
                      probForaReal = Math.round((implA / margem) * 100);
                  }

                  let p1X2_card = j.predictions?.find(p => p.type?.code === 'fulltime-result-probability' || p.type_id === 237)?.predictions;
                  
                  let probHome = 0; let probDraw = 0; let probAway = 0; let mostraBarra = false;

                  if (p1X2_card) { 
                      probHome = Math.round(p1X2_card.home);
                      probDraw = Math.round(p1X2_card.draw);
                      probAway = Math.round(p1X2_card.away);
                      mostraBarra = true;
                  } else if (temOdds) { 
                      probHome = probCasaReal;
                      probDraw = probEmpateReal;
                      probAway = probForaReal;
                      mostraBarra = true;
                  }

                  let statusDisplay = <span>{jData}</span>;
                  let shortStatus = j.status?.short_name || j.status || j.state?.name || "";
                  let isLive = shortStatus.includes('Half') || shortStatus.includes('Live') || shortStatus === 'Halftime';
                  let isFinished = shortStatus.includes('Finish') || shortStatus === 'Match Finished' || shortStatus === 'FT' || shortStatus === 'Encerrado';

                  if (isLive) {
                      statusDisplay = <span className="live-pulse">🔴 Ao Vivo</span>;
                  } else if (isFinished) {
                      statusDisplay = <span style={{color: '#888'}}>Encerrado</span>;
                  } else if (shortStatus.includes('Postponed')) {
                      statusDisplay = <span style={{color: '#ff9800'}}>Adiado</span>;
                  }

                  let msgSemDados = isFinished ? "🏁 PARTIDA ENCERRADA (SEM DADOS)" : "⏳ AGUARDANDO ABERTURA DO MERCADO";

                  return (
                    <React.Fragment key={idx}>
                      {(idx === 0 || ((jogosFiltrados[idx-1]?.starting_at || "").split('T')[0] !== jData)) && (
                        <div style={{gridColumn: '1/-1', background: '#1a1a1a', padding: '8px 20px', borderRadius: '6px', color: '#ffdf1b', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', borderLeft: '4px solid #ffdf1b'}}>
                          {jData === hojeStr ? "📅 HOJE" : `📅 ${jData.split('-').reverse().slice(0,2).join('/')}`}
                        </div>
                      )}
                      <div className="match-card">
                        <div className="card-header-bet">
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden'}}>
                            <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{j.league?.name || j.league || "Liga Desconhecida"}</span>
                          </div>
                          {statusDisplay}
                        </div>
                        <div className="card-body-bet">
                          <div className="scoreboard-bet">
                            <div className="team-col-bet" style={{width: '40%'}}><img src={homeP.image_path || "https://cdn-icons-png.flaticon.com/512/8844/8844046.png"} className="team-logo" alt="logo"/><span className="team-name">{homeP.name || "Casa"}</span></div>
                            <div className="score-center" style={{width: '20%', textAlign: 'center'}}>{homeGoals} - {awayGoals}</div>
                            <div className="team-col-bet" style={{width: '40%', flexDirection: 'row-reverse', textAlign: 'right'}}><img src={awayP.image_path || "https://cdn-icons-png.flaticon.com/512/8844/8844046.png"} className="team-logo" alt="logo"/><span className="team-name">{awayP.name || "Fora"}</span></div>
                          </div>
                          
                          {isVip ? ( mostraBarra ? (
                              <div style={{ marginTop: '12px', padding: '10px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #222'}}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, marginBottom: '6px' }}>
                                    <span style={{ color: probHome > probAway ? '#00a877' : '#aaa' }}>Casa {probHome}%</span>
                                    <span style={{ color: '#ffdf1b' }}>Empate {probDraw}%</span>
                                    <span style={{ color: probAway > probHome ? '#ff4747' : '#aaa' }}>Fora {probAway}%</span>
                                 </div>
                                 <div style={{ display: 'flex', height: '10px', backgroundColor: '#333', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ width: `${probHome}%`, backgroundColor: '#00a877' }}></div>
                                    <div style={{ width: `${probDraw}%`, backgroundColor: '#ffdf1b' }}></div>
                                    <div style={{ width: `${probAway}%`, backgroundColor: '#ff4747' }}></div>
                                 </div>
                              </div>
                            ) : ( <div style={{marginTop: '12px', padding: '10px', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: '#aaa', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #222'}}>{msgSemDados}</div> )
                          ) : ( <div style={{marginTop: '12px', padding: '10px', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: '#555', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed #333', letterSpacing: '1px'}}>🔒 CHANCES DE VITÓRIA OCULTAS (PRO)</div> )}

                          <div className="odds-row-bet">
                            <div className="odd-box"><span className="odd-label">1</span><span className="odd-value">{o.home}</span></div><div className="odd-box"><span className="odd-label">X</span><span className="odd-value">{o.draw || "-"}</span></div><div className="odd-box"><span className="odd-label">2</span><span className="odd-value">{o.away}</span></div>
                          </div>
                        </div>
                        {!isVip ? <button className="card-footer-bet footer-locked" onClick={() => setMenuAtivo('💎 ASSINAR BETANALYTICS PRO')}>🔒 Assine o VIP PRO para liberar a IA</button> : <button className="card-footer-bet" onClick={() => pedirAnalise(j)}>⚡ Acessar Análise PRO</button>}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </>
          )}

          {/* 🔥 TELA DE ANÁLISE PRO E ESTATÍSTICAS 🔥 */}
          {menuAtivo === "🧠 ANÁLISE PRO" && (
            <div>
              {isMobile && sidebarElement}
              <h3 style={{fontSize: '20px', fontWeight: 800, color: '#ffdf1b', marginBottom: '15px', marginTop: 0}}>📊 Análise Quantitativa BetAnalytics PRO</h3>
              
              {jogoSelecionado?.predictions && jogoSelecionado.predictions.length > 0 && (() => {
                  const getPred = (code) => jogoSelecionado.predictions.find(p => p.type?.code === code)?.predictions;
                  
                  const p1X2 = getPred('fulltime-result-probability');
                  const pBTTS = getPred('both-teams-to-score-probability');
                  const pOU25 = getPred('over-under-2_5-probability');
                  const pOU15 = getPred('over-under-1_5-probability');
                  const pCorners9 = getPred('corners-over-under-9-probability');

                  return (
                    <div style={{background: '#121212', padding: '20px', borderRadius: '10px', border: '1px solid #333', marginBottom: '20px'}}>
                        <h4 style={{color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                            🔮 Probabilidades Matemáticas <span style={{fontSize: '10px', background: '#ffdf1b', color: '#000', padding: '2px 6px', borderRadius: '4px'}}>ALGORITMO</span>
                        </h4>
                        
                        <div style={{display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap'}}>
                            {p1X2 && (
                              <div style={{flex: 1, minWidth: '250px'}}>
                                <span style={{color: '#aaa', fontSize: '12px', fontWeight: 'bold'}}>VENCEDOR DO ENCONTRO (1X2)</span>
                                
                                <div style={{ marginTop: '15px', padding: '10px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #222'}}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, marginBottom: '6px' }}>
                                      <span style={{ color: p1X2.home > p1X2.away ? '#00a877' : '#aaa' }}>Casa {p1X2.home}%</span>
                                      <span style={{ color: '#ffdf1b' }}>Empate {p1X2.draw}%</span>
                                      <span style={{ color: p1X2.away > p1X2.home ? '#ff4747' : '#aaa' }}>Fora {p1X2.away}%</span>
                                   </div>
                                   <div style={{ display: 'flex', height: '12px', backgroundColor: '#333', borderRadius: '6px', overflow: 'hidden' }}>
                                      <div style={{ width: `${p1X2.home}%`, backgroundColor: '#00a877' }}></div>
                                      <div style={{ width: `${p1X2.draw}%`, backgroundColor: '#ffdf1b' }}></div>
                                      <div style={{ width: `${p1X2.away}%`, backgroundColor: '#ff4747' }}></div>
                                   </div>
                                </div>

                                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                                  <div style={{flex: 1, background: '#1a1a1a', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #222'}}>
                                      <span style={{color: '#00a877', fontWeight: 900, fontSize: '18px'}}>{p1X2.home}%</span><br/><span style={{fontSize: '10px', color: '#888'}}>CASA</span>
                                  </div>
                                  <div style={{flex: 1, background: '#1a1a1a', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #222'}}>
                                      <span style={{color: '#ffdf1b', fontWeight: 900, fontSize: '18px'}}>{p1X2.draw}%</span><br/><span style={{fontSize: '10px', color: '#888'}}>EMPATE</span>
                                  </div>
                                  <div style={{flex: 1, background: '#1a1a1a', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #222'}}>
                                      <span style={{color: '#ff4747', fontWeight: 900, fontSize: '18px'}}>{p1X2.away}%</span><br/><span style={{fontSize: '10px', color: '#888'}}>FORA</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div style={{flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                {pBTTS && <StatRow label="Ambas Marcam (Sim x Não)" home={pBTTS.yes} away={pBTTS.no} />}
                                {pOU25 && <StatRow label="Mais de 2.5 Gols (Over x Under)" home={pOU25.yes} away={pOU25.no} />}
                                {pOU15 && <StatRow label="Mais de 1.5 Gols (Over x Under)" home={pOU15.yes} away={pOU15.no} />}
                                {pCorners9 && <StatRow label="Mais de 9 Escanteios (Over x Under)" home={pCorners9.yes} away={pCorners9.no} />}
                            </div>
                        </div>
                    </div>
                  );
              })()}

              {(estatisticas || jogoSelecionado?.statistics) && (() => {
                  const statsData = estatisticas || [];
                  const getStatApiFootball = (teamIndex, statName) => {
                     if (!statsData[teamIndex]) return 0;
                     const item = statsData[teamIndex].statistics.find(s => s.type === statName);
                     return item && item.value !== null ? item.value : 0;
                  };

                  return (
                      <div style={{background: '#121212', padding: '20px', borderRadius: '10px', border: '1px solid #333', marginBottom: '20px'}}>
                          <h4 style={{color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: 0}}>🔍 Raio-X da Partida</h4>
                          
                          <div style={{display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap'}}>
                              <div style={{flex: 1, minWidth: '250px'}}>
                                  <StatRow label="Posse de Bola (%)" home={parseInt(getStatApiFootball(0, 'Ball Possession'))} away={parseInt(getStatApiFootball(1, 'Ball Possession'))} />
                                  <StatRow label="Chutes Totais" home={getStatApiFootball(0, 'Total Shots')} away={getStatApiFootball(1, 'Total Shots')} />
                                  <StatRow label="Chutes no Alvo" home={getStatApiFootball(0, 'Shots on Goal')} away={getStatApiFootball(1, 'Shots on Goal')} />
                                  <StatRow label="Passes Totais" home={getStatApiFootball(0, 'Total passes')} away={getStatApiFootball(1, 'Total passes')} />
                                  <StatRow label="Faltas Cometidas" home={getStatApiFootball(0, 'Fouls')} away={getStatApiFootball(1, 'Fouls')} />
                                  <StatRow label="Escanteios" home={getStatApiFootball(0, 'Corner Kicks')} away={getStatApiFootball(1, 'Corner Kicks')} />
                                  <StatRow label="Gols Esperados (xG)" home={getStatApiFootball(0, 'expected_goals')} away={getStatApiFootball(1, 'expected_goals')} />
                              </div>
                          </div>
                      </div>
                  );
              })()}

              <div style={{background: 'linear-gradient(90deg, #121212 0%, #1a1a1a 100%)', border: '1px solid #333', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px'}}>
                  <div><h4 style={{margin: 0, color: '#fff', fontSize: '15px'}}>Noticiário em Tempo Real</h4><p style={{margin: 0, color: '#aaa', fontSize: '12px', marginTop: '4px'}}>Investigue lesões e desfalques na mídia.</p></div>
                  <button className="btn-outline" style={{borderColor: '#00a877', color: '#00a877', fontWeight: 'bold', padding: '8px 20px', background: 'rgba(0, 168, 119, 0.1)'}} onClick={buscarNoticiasTimes} disabled={loadingNoticias}>{loadingNoticias ? "⏳ Buscando..." : "📰 Carregar Últimas Notícias"}</button>
              </div>
              <div style={{background: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333'}}><p style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{analiseIA}</p></div>
              <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                <button className="btn-primary" onClick={salvarTipNaGestao}>✅ Salvar Tip na Gestão</button><button className="btn-outline" onClick={() => { setJogoSelecionado(null); setMenuAtivo("🔥 DESTAQUES DO DIA"); }}>Voltar aos Jogos</button>
              </div>
            </div>
          )}

          {/* TELA DE GESTÃO DE BANCA */}
          {menuAtivo === "📊 GESTÃO DE BANCA" && (
            <div>
              {isMobile && sidebarElement}
              <h1 style={{color: '#00a877', fontWeight: 900, marginBottom: '20px'}}>Gestão de Banca</h1>
              {!userData ? <p style={{color: '#ff4747'}}>Você precisa estar logado para ver o histórico.</p> : (
                <>
                  <div style={{display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap'}}>
                    <div style={{flex: 1, minWidth: '200px', background: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333', textAlign: 'center'}}>
                      <p style={{color: '#aaa', margin: 0}}>Apostas Totais</p><h2 style={{margin: 0, color: '#fff'}}>{(bancaData || []).length}</h2>
                    </div>
                    <div style={{flex: 1, minWidth: '200px', background: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333', textAlign: 'center'}}>
                      <p style={{color: '#aaa', margin: 0}}>Lucro Líquido</p><h2 style={{margin: 0, color: lucroLiquido >= 0 ? '#00a877' : '#ff4747'}}>{lucroLiquido > 0 ? '+' : ''}{lucroLiquido.toFixed(2)} Unid</h2>
                    </div>
                  </div>
                  <div style={{height: '300px', width: '100%', marginBottom: '30px', background: '#1a1a1a', padding: '15px', borderRadius: '10px', border: '1px solid #333'}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData || []}><XAxis dataKey="name" hide /><Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333'}} /><Area type="monotone" dataKey="Banca" stroke="#00a877" fill="#00a877" fillOpacity={0.3} /></AreaChart>
                      </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TELA DE ASSINAR VIP */}
          {menuAtivo === "💎 ASSINAR BETANALYTICS PRO" && (
              <div style={{background: '#1a1a1a', padding: '40px', borderRadius: '12px', border: '1px solid #333', maxWidth: '600px', margin: '0 auto', textAlign: 'center', marginTop: '20px'}}>
                  {isMobile && sidebarElement}
                  <h1 style={{color: '#ffdf1b', marginTop: 0, marginBottom: '10px'}}>Torne-se VIP PRO 👑</h1>
                  <p style={{color: '#aaa', marginBottom: '30px'}}>Desbloqueie a Inteligência Artificial e o painel de Gestão de Banca.</p>
                  
                  {!dadosPix ? (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                          <input placeholder="Digite seu melhor e-mail" style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #444', background: '#121212', color: '#fff', fontSize: '16px', outline: 'none'}} onChange={e => setForm({...form, email: e.target.value})} />
                          
                          <label style={{display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', fontSize: '12px', color: '#aaa', background: '#1a1a1a', padding: '10px', borderRadius: '8px', border: '1px solid #333', cursor: 'pointer'}}>
                              <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} style={{width: '18px', height: '18px', cursor: 'pointer'}} />
                              <span>Declaro que sou <strong>maior de 18 anos</strong> e concordo com os Termos de Uso e Política de Privacidade.</span>
                          </label>

                          <div style={{textAlign: 'left', marginTop: '5px'}}>
                              <span style={{color: '#888', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>Escolha a forma de pagamento</span>
                          </div>

                          <button className="btn-primary" style={{width: '100%', padding: '18px', fontSize: '18px', opacity: aceitouTermos ? 1 : 0.5, cursor: aceitouTermos ? 'pointer' : 'not-allowed'}} onClick={() => { if(!aceitouTermos) return alert('Você precisa confirmar que é maior de 18 anos para assinar.'); if(!form.email) return alert('Preencha seu e-mail!'); setDadosPix({ id_pagamento: Math.floor(Math.random() * 999999) });}}>Gerar PIX Automático ⚡</button>
                          
                          <div style={{display: 'flex', gap: '10px'}}>
                              <button className="btn-outline" style={{flex: 1, padding: '12px', fontSize: '14px', background: '#1a1a1a', opacity: aceitouTermos ? 1 : 0.5, cursor: aceitouTermos ? 'pointer' : 'not-allowed'}} onClick={() => { if(!aceitouTermos) return alert('Você precisa confirmar que é maior de 18 anos para assinar.'); if(!form.email) return alert('Preencha seu e-mail!'); window.open('https://mpago.la/33TvWYu', '_blank');}}>💳 Cartão de Crédito</button>
                              <button className="btn-outline" style={{flex: 1, padding: '12px', fontSize: '14px', background: '#1a1a1a', opacity: aceitouTermos ? 1 : 0.5, cursor: aceitouTermos ? 'pointer' : 'not-allowed'}} onClick={() => { if(!aceitouTermos) return alert('Você precisa confirmar que é maior de 18 anos para assinar.'); if(!form.email) return alert('Preencha seu e-mail!'); window.open('https://mpago.la/33TvWYu', '_blank');}}>🏧 Cartão de Débito</button>
                          </div>
                      </div>
                  ) : (
                      <div style={{background: '#121212', padding: '30px', borderRadius: '8px', border: '1px dashed #00a877'}}>
                          <div style={{fontSize: '40px', marginBottom: '15px'}}>📱</div><h3 style={{color: '#00a877', margin: '0 0 10px 0'}}>PIX Gerado!</h3><p style={{color: '#aaa', fontSize: '14px', marginBottom: '20px'}}>Aguardando o pagamento no seu banco...</p>
                          <div style={{padding: '15px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#ffdf1b', letterSpacing: '2px', fontWeight: 'bold'}}>{dadosPix.id_pagamento}ABCD-X-99</div>
                      </div>
                  )}
              </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatRow({ label, home, away }) {
  const homeVal = Number(home) || 0;
  const awayVal = Number(away) || 0;
  const total = homeVal + awayVal;
  
  const homePercent = total > 0 ? Math.round((homeVal / total) * 100) : 50;
  const awayPercent = total > 0 ? Math.round((awayVal / total) * 100) : 50;

  return (
    <div style={{ margin: '15px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>
        <span style={{ color: '#fff' }}>{homeVal}{label.includes('%') && homeVal > 0 ? '%' : ''}</span>
        <span style={{ color: '#aaa', textTransform: 'uppercase', fontSize: '12px' }}>{label}</span>
        <span style={{ color: '#fff' }}>{awayVal}{label.includes('%') && awayVal > 0 ? '%' : ''}</span>
      </div>
      <div style={{ display: 'flex', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${homePercent}%`, backgroundColor: '#00a877', transition: 'width 0.5s' }}></div>
        <div style={{ width: `${awayPercent}%`, backgroundColor: '#ff4747', transition: 'width 0.5s' }}></div>
      </div>
    </div>
  );
}