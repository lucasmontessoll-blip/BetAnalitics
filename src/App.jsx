import React, { useState, useEffect, useMemo } from 'react';
import './app.css'; 
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react'; 
import { createClient } from '@supabase/supabase-js';
import { Home, BarChart2, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, Crosshair, Bell, Globe, DollarSign, Activity, ShieldAlert, ArrowLeft, Send, Settings, CheckCircle2, Target, Flame, BrainCircuit, TrendingDown, AlertTriangle, Users, Award, PieChart, Calendar, Clock, Filter, Calculator, List, Smartphone } from 'lucide-react';

// ============================================================================
// 📦 IMPORTAÇÕES DA CLEAN ARCHITECTURE (PASTAS SEPARADAS)
// ============================================================================
import EstatisticasAvancadas from './components/estatisticasavancadas.jsx';
import { calcularKelly, calcularDrawdown, executarBacktest } from './utils/financas.js';
import { analisarPartidaAoVivo, buscarEstatisticasJogo } from './services/api.js';
import { solicitarPermissaoNotificacao, dispararAlertaPush } from './services/notificacoes.js';

// ============================================================================
// ⚙️ CONFIGURAÇÕES PRINCIPAIS & SUPABASE
// ============================================================================
const MODO_DEMONSTRACAO = true; 
const API_URL = 'https://betanalitics-1-9stc.onrender.com';

const supabase = createClient('https://sua-url.supabase.co', 'sua-chave-anon');
initMercadoPago('APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc', { locale: 'pt-BR' });

const getLocalYYYYMMDD = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
const listaLigas = [{name:'Todos', id: null}, {name:'Serie A', id: 71}, {name:'Champions', id: 2}, {name:'Premier', id: 39}];

// ============================================================================
// 🗄️ DADOS MOCKADOS
// ============================================================================
const crescimentoBancaGlobal = [ { dia: "1", banca: 1000 }, { dia: "2", banca: 1080 }, { dia: "3", banca: 1150 }, { dia: "4", banca: 1210 }, { dia: "5", banca: 1280 }, { dia: "6", banca: 1350 }, { dia: "7", banca: 1420 } ];

const mockJogosData = [
  { id: 101, league_id: 71, league_name: 'Brasileirão Série A', starting_at: `${getLocalYYYYMMDD()}T16:00:00`, status: 'Live', time_elapsed: 62, home_team: 'Flamengo', home_id: 127, away_team: 'Palmeiras', away_id: 121, home_image: 'https://media.api-sports.io/football/teams/127.png', away_image: 'https://media.api-sports.io/football/teams/121.png', scoreHome: 2, scoreAway: 1, confianca_ia: 92, odd_principal: 1.82, odd_abertura: 1.95, homeStats: {form: 85, h2h: 80, attack: 88}, awayStats: {form: 75} },
  { id: 102, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T19:30:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Liverpool', home_id: 40, away_team: 'Man City', away_id: 50, home_image: 'https://media.api-sports.io/football/teams/40.png', away_image: 'https://media.api-sports.io/football/teams/50.png', scoreHome: null, scoreAway: null, confianca_ia: 89, odd_principal: 2.10, odd_abertura: 2.10, homeStats: {form: 78, h2h: 60, attack: 85}, awayStats: {form: 82} },
  { id: 103, league_id: 140, league_name: 'La Liga', starting_at: `${getLocalYYYYMMDD()}T14:00:00`, status: 'Finished', time_elapsed: 90, home_team: 'Real Madrid', home_id: 541, away_team: 'Barcelona', away_id: 529, home_image: 'https://media.api-sports.io/football/teams/541.png', away_image: 'https://media.api-sports.io/football/teams/529.png', scoreHome: 3, scoreAway: 1, confianca_ia: 88, odd_principal: 1.95, odd_abertura: 2.05, homeStats: {form: 90, h2h: 70, attack: 92}, awayStats: {form: 85} },
  { id: 104, league_id: 39, league_name: 'Premier League', starting_at: `${getLocalYYYYMMDD()}T20:00:00`, status: 'Not Started', time_elapsed: 0, home_team: 'Arsenal', home_id: 42, away_team: 'Chelsea', away_id: 49, home_image: 'https://media.api-sports.io/football/teams/42.png', away_image: 'https://media.api-sports.io/football/teams/49.png', scoreHome: null, scoreAway: null, confianca_ia: 95, odd_principal: 1.75, odd_abertura: 1.80, homeStats: {form: 95, h2h: 80, attack: 90}, awayStats: {form: 60} }
];

const mockJogoDetalhes = { stats_reais: [{type: "Posse (%)", h: 58, a: 42}, {type: "Remates", h: 12, a: 5}, {type: "Cantos", h: 8, a: 4}] };
const mockRankingUsuarios = [ { id: 1, nome: "Lucas", lucro_total: 1840 }, { id: 2, nome: "Carlos", lucro_total: 1430 }, { id: 3, nome: "João", lucro_total: 1180 }, { id: 4, nome: "Marcos", lucro_total: 950 } ];

const calcularEV = (probabilidade, odd) => (((probabilidade / 100) * odd - 1) * 100);
const calcularHeatScore = (jogo) => Math.round((jogo.confianca_ia * 0.5) + (calcularEV(jogo.confianca_ia, jogo.odd_principal) * 2) + (((jogo.homeStats?.form||50) - (jogo.awayStats?.form||50)) * 0.3));
const detectarValueBet = (probabilidadeIA, odd) => probabilidadeIA > (100 / odd);

const calcularRisco = (jogo) => {
    if(jogo.confianca_ia >= 90 && jogo.odd_principal <= 2.0) return { nivel: 'BAIXO', cor: 'text-green-400 bg-green-500/10 border-green-500/30' };
    if(jogo.confianca_ia >= 80) return { nivel: 'MÉDIO', cor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { nivel: 'ALTO', cor: 'text-red-400 bg-red-500/10 border-red-500/30' };
};

const calcularStake = (banca, confianca) => {
    if(confianca >= 90) return banca * 0.05;
    if(confianca >= 85) return banca * 0.03;
    if(confianca >= 80) return banca * 0.02;
    return banca * 0.01;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [ligaAtivaId, setLigaAtivaId] = useState(null); 
  const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos'); 
  const [userData, setUserData] = useState(null); 
  const [jogos, setJogos] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [viewMode, setViewMode] = useState('jogos'); 
  const [filterCentro, setFilterCentro] = useState('Todos'); 
  const [jogoSelecionado, setJogoSelecionado] = useState(null); 
  const [favoritos, setFavoritos] = useState([101, 102]); 
  const [form, setForm] = useState({ nome: '', email: '', cpf: '' }); 
  
  const [performanceStats] = useState({ totalAnalises: 512, acertos: 431, erros: 81, roi: 18.4, ultimaSemana: 87 });
  const [bancaInicial, setBancaInicial] = useState(1000);
  const [alertas, setAlertas] = useState([{ id: 1, msg: "O Flamengo chegou a 94% de confiança.", lida: false }]);
  const [topPick] = useState({ jogo: "Flamengo x Palmeiras", confianca: 92, ev: 14.2, mercado: "Vitória Flamengo" });
  const [rankingUsuarios, setRankingUsuarios] = useState([]);

  const [oportunidades, setOportunidades] = useState([]);
  const [bilhetePremium, setBilhetePremium] = useState({ selecoes: [], oddFinal: 1 });
  const [xp, setXp] = useState(350);

  // ============================================================================
  // 📊 SISTEMA: GESTÃO DE BANCA E APOSTAS REAIS
  // ============================================================================
  const [apostas, setApostas] = useState([
    { id: 1, jogo: "Flamengo x Palmeiras", liga: "Brasileirão", time: "Flamengo", mercado: "Vitória Flamengo", stake: 100, odd: 1.85, resultado: "green", data: "2026-06-01", hora: "19:30" },
    { id: 2, jogo: "Liverpool x Arsenal", liga: "Premier League", time: "Liverpool", mercado: "Over 2.5", stake: 50, odd: 2.10, resultado: "red", data: "2026-06-02", hora: "16:00" },
    { id: 3, jogo: "Real Madrid x Barcelona", liga: "La Liga", time: "Real Madrid", mercado: "Ambos Marcam", stake: 75, odd: 1.95, resultado: "green", data: "2026-06-03", hora: "20:00" },
    { id: 4, jogo: "Arsenal x Chelsea", liga: "Premier League", time: "Arsenal", mercado: "Vitória Arsenal", stake: 100, odd: 1.75, resultado: "green", data: "2026-06-04", hora: "15:00" }
  ]);

  const [filtroResultado, setFiltroResultado] = useState('todos');
  const [filtroLiga, setFiltroLiga] = useState('todas');
  const [simOdd, setSimOdd] = useState('');
  const [simStake, setSimStake] = useState('');
  const metaMensal = 2000;

  const calcularLucroLiquido = () => apostas.reduce((total, a) => a.resultado === "green" ? total + ((a.stake * a.odd) - a.stake) : total - a.stake, 0);
  const calcularYield = () => apostas.length === 0 ? "0.00" : (calcularLucroLiquido() / apostas.length).toFixed(2);
  const calcularAssertividade = () => apostas.length === 0 ? 0 : (apostas.filter(a => a.resultado === "green").length / apostas.length) * 100;
  const lucroAcumulado = () => calcularLucroLiquido();
  const crescimentoBanca = () => bancaInicial === 0 ? 0 : (lucroAcumulado() / bancaInicial) * 100;
  const progressoMeta = () => Math.min((lucroAcumulado() / metaMensal) * 100, 100);

  const dadosGraficoBanca = useMemo(() => {
      let banca = bancaInicial;
      return apostas.map((a, index) => {
          banca += a.resultado === "green" ? (a.stake * a.odd) - a.stake : -a.stake;
          return { aposta: `Bet ${index+1}`, banca: Number(banca.toFixed(2)) };
      });
  }, [apostas, bancaInicial]);

  const calcularROISemanal = () => {
    const hoje = new Date();
    const ultimaSemana = apostas.filter(a => (hoje - new Date(a.data)) / (1000 * 60 * 60 * 24) <= 7);
    const investido = ultimaSemana.reduce((acc,a)=>acc+a.stake, 0);
    const lucro = ultimaSemana.reduce((acc,a) => a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
    return investido ? (lucro/investido)*100 : 0;
  };

  const calcularROIMensal = () => {
    const mesAtual = new Date().getMonth();
    const apostasMes = apostas.filter(a => new Date(a.data).getMonth() === mesAtual);
    const investido = apostasMes.reduce((acc,a)=>acc+a.stake, 0);
    const lucro = apostasMes.reduce((acc,a)=> a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
    return investido ? (lucro/investido)*100 : 0;
  };

  const calcularROIAnual = () => {
    const ano = new Date().getFullYear();
    const apostasAno = apostas.filter(a => new Date(a.data).getFullYear() === ano);
    const investido = apostasAno.reduce((acc,a)=>acc+a.stake, 0);
    const lucro = apostasAno.reduce((acc,a)=> a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
    return investido ? (lucro/investido)*100 : 0;
  };

  const mercadoMaisLucrativo = () => {
    const mercados = {};
    apostas.forEach(a=>{
      if(!mercados[a.mercado]) mercados[a.mercado]=0;
      if(a.resultado==="green") mercados[a.mercado]+= ((a.stake*a.odd)-a.stake); else mercados[a.mercado]-= a.stake;
    });
    const sorted = Object.entries(mercados).sort((a,b)=>b[1]-a[1]);
    return sorted.length > 0 ? sorted[0] : ['N/A', 0];
  };

  const relatorioIA = () => {
    const roi = calcularROIMensal();
    const mercadoTop = mercadoMaisLucrativo()[0] || 'N/A';
    if(roi > 20) return `🔥 ROI excelente de ${roi.toFixed(1)}%.\n\nO mercado mais lucrativo é ${mercadoTop}. Considere escalar lucros com gestão segura.`;
    if(roi > 5) return `✅ Desempenho sólido e positivo.\n\nContinue a manter uma gestão disciplinada.`;
    return `⚠️ Atenção à gestão.\n\nROI abaixo do ideal. Reduza stakes temporariamente e foque em: ${mercadoTop}.`;
  };

  const listaConquistas = () => {
    const lista = [];
    if(apostas.length >= 1) lista.push("🥉 1ª Aposta");
    if(lucroAcumulado() >= 500) lista.push("🥈 Lucro R$ 500");
    if(calcularROIMensal() >= 10) lista.push("🥇 ROI > 10%");
    if(apostas.length >= 50) lista.push("🏆 Veterano");
    return lista;
  };

  const rankingTimes = () => {
    const times = {};
    apostas.forEach(a => {
      if(!times[a.time]) times[a.time] = 0;
      if(a.resultado === "green") times[a.time] += ((a.stake * a.odd) - a.stake); else times[a.time] -= a.stake;
    });
    return Object.entries(times).map(([nome, lucro]) => ({nome, lucro})).sort((a,b)=>b.lucro-a.lucro).slice(0,5);
  };

  const rankingLigas = () => {
    const ligas = {};
    apostas.forEach(a => {
      if(!ligas[a.liga]) ligas[a.liga] = 0;
      if(a.resultado === "green") ligas[a.liga] += ((a.stake * a.odd) - a.stake); else ligas[a.liga] -= a.stake;
    });
    return Object.entries(ligas).map(([nome, lucro]) => ({nome, lucro})).sort((a,b)=>b.lucro-a.lucro).slice(0,5);
  };

  const horarioMaisLucrativo = () => {
    const horarios = {};
    apostas.forEach(a=>{
      const hora = a.hora ? a.hora.split(":")[0] + "h" : "N/A";
      if(!horarios[hora]) horarios[hora]=0;
      if(a.resultado==="green") horarios[hora]+= ((a.stake*a.odd)-a.stake); else horarios[hora]-= a.stake;
    });
    const sorted = Object.entries(horarios).sort((a,b)=>b[1]-a[1]);
    return sorted.length > 0 ? sorted[0] : ['N/A', 0];
  };

  const apostasFiltradas = () => {
    return apostas.filter(a => {
      const resultadoOk = filtroResultado === 'todos' || a.resultado === filtroResultado;
      const ligaOk = filtroLiga === 'todas' || a.liga === filtroLiga;
      return resultadoOk && ligaOk;
    });
  };

  const handleRunBacktest = () => {
      const res = executarBacktest(apostas, bancaInicial);
      alert(`📊 RESULTADO DO BACKTEST:\n\nBanca Final: R$ ${res.bancaFinal.toFixed(2)}\nLucro: R$ ${res.lucro.toFixed(2)}\nROI Histórico: ${res.roi.toFixed(2)}%`);
  };

  // ============================================================================
  // IA CHAT & EFFECTS
  // ============================================================================
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'assistant', text: "Olá! Sou o motor IA do BetAnalytics. Qual é a sua dúvida?" }]);

  useEffect(() => { const carregarDados = async () => { setRankingUsuarios(mockRankingUsuarios); }; carregarDados(); }, []);
  useEffect(() => { setTimeout(() => setShowSplash(false), 2000); }, []);
  useEffect(() => { 
      const em = localStorage.getItem('bet_sessao_ativa'); 
      if (em) { setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: true }); }
      else if (MODO_DEMONSTRACAO) { setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true }); } 
  }, []);
  
  useEffect(() => {
      setLoading(true);
      setTimeout(() => { 
          const loadedJogos = mockJogosData.filter(x => ligaAtivaId === null ? true : x.league_id === ligaAtivaId);
          setJogos(loadedJogos); setLoading(false); 
      }, 500); 
  }, [ligaAtivaId]);

  useEffect(() => {
      if(jogos.length){
          const selecoes = [...jogos].filter(j => j.confianca_ia >= 85).sort((a,b) => b.confianca_ia - a.confianca_ia).slice(0,3);
          const oddFinal = selecoes.reduce((acc, j) => acc * (j.odd_principal || 1), 1);
          setBilhetePremium({ selecoes, oddFinal });

          const radar = jogos.filter(j => j.odd_principal && calcularEV(j.confianca_ia, j.odd_principal) > 10);
          setOportunidades(radar);
      }
  }, [jogos]);

  const nivelUsuario = () => {
    if(xp > 5000) return "Lenda"; if(xp > 3000) return "Mestre"; if(xp > 1000) return "Especialista"; if(xp > 500) return "Profissional"; return "Iniciante";
  };

  const abrirPainelDoJogo = async (j) => {
    if(!userData?.is_vip) return setMenuAtivo('assinar pro');
    setJogoSelecionado({ ...j, is_loading: true });
    
    // Simula a integração real com a API Football (utilizando o nosso novo Service)
    const stats = await buscarEstatisticasJogo(j.id);
    const analiseTempoReal = analisarPartidaAoVivo(stats);

    setTimeout(() => { 
        setJogoSelecionado({ 
            ...j, 
            ...mockJogoDetalhes, 
            dadosAPI: analiseTempoReal,
            is_loading: false 
        }); 
    }, 800); 
  };
  
  const toggleFavorito = (e, id) => { e.stopPropagation(); setFavoritos(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]); };

  const handleAskAI = async (e) => {
      e?.preventDefault();
      if(!aiQuery.trim() || aiLoading) return;
      setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
      const perguntaAtual = aiQuery; setAiQuery(''); setAiLoading(true);
      try {
          const resumoJogos = jogos.map(j => `${j.home_team} vs ${j.away_team}`).join(", ");
          const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: perguntaAtual, dadosDaRodada: resumoJogos || "Sem jogos no momento" });
          setAiMessages(prev => [...prev, { role: 'assistant', text: resposta.data.resposta }]);
      } catch (error) { setAiMessages(prev => [...prev, { role: 'assistant', text: "Falha de comunicação." }]); } finally { setAiLoading(false); }
  };

  const gerarExplicacaoIA = async (jogo) => {
      setJogoSelecionado(prev => ({...prev, is_loading_explanation: true}));
      const promptGemini = `Você é um analista profissional.\nJogo: ${jogo.home_team} x ${jogo.away_team}\nConfiança: ${jogo.confianca_ia}%\nOdd: ${jogo.odd_principal}\nExplique:\n1 Motivos da entrada\n2 Riscos\n3 Melhor mercado\n4 Gestão recomendada\n5 Conclusão final\nResposta curta e estruturada em tópicos.`;
      try {
          const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: promptGemini, dadosDaRodada: jogo });
          setJogoSelecionado(prev => ({...prev, explanation: resposta.data.resposta, is_loading_explanation: false}));
      } catch (e) { setJogoSelecionado(prev => ({...prev, explanation: "Análise forte indica superioridade e EV+ no mercado.", is_loading_explanation: false})); }
  };

  let jFilt = (jogos||[]).filter(j => { if(filterCentro === 'Ao Vivo') return j.status==='Live'; if(filterCentro === 'Favoritos') return favoritos.includes(j.id); return true; });
  const jGrp = jFilt.reduce((a, j) => { if (!a[j.league_name]) a[j.league_name] = []; a[j.league_name].push(j); return a; }, {});

  const BankerPicksCard = () => {
    const picks = jogos.filter(j => j.confianca_ia >= 90 && calcularEV(j.confianca_ia, j.odd_principal) >= 10);
    if(picks.length === 0) return null;
    return (
      <div className="bg-[#0f172a] border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-3xl p-6 mb-6 mx-4">
        <h3 className="font-black text-green-400 mb-4 flex items-center gap-2 tracking-wider"><Crown className="w-5 h-5"/> IA BANKER PICKS</h3>
        {picks.map(j => (
            <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-[#050816] border border-white/5 p-4 rounded-2xl mb-3 last:mb-0 flex justify-between items-center cursor-pointer hover:border-green-500/50 transition-colors">
                <div>
                    <div className="font-black text-white text-sm mb-1">{j.home_team} x {j.away_team}</div>
                    <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex gap-2"><span>Confiança: {j.confianca_ia}%</span> <span>•</span> <span>EV: +{calcularEV(j.confianca_ia, j.odd_principal).toFixed(1)}%</span></div>
                </div>
                <div className="bg-green-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg"><ChevronRight className="w-5 h-5"/></div>
            </div>
        ))}
      </div>
    );
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
    <div className="min-h-screen bg-[#050816] text-white font-sans pb-28">
      <header className="flex items-center justify-between px-5 py-4 bg-[#050816] sticky top-0 z-40 border-b border-white/5">
        <h1 className="font-black text-2xl tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></h1>
        <button onClick={() => setMenuAtivo('assinar pro')} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]"><Crown className="w-4 h-4" /> {userData?.is_vip ? "VIP ATIVO" : "ASSINAR PRO"}</button>
      </header>

      {menuAtivo !== 'assinar pro' && !jogoSelecionado && (
          <div className="animate-fade-in pt-4">
              
              {/* =========================================
                  HOME / JOGOS
              ========================================= */}
              {viewMode === 'jogos' && (
                  <>
                    {userData?.is_vip && (
                        <div className="mx-4 mb-6 rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_30px_rgba(13,110,253,0.3)] flex justify-between items-center relative overflow-hidden">
                        <div className="relative z-10"><h2 className="text-xl font-black text-white flex items-center gap-2 mb-2"><Crown className="w-5 h-5 text-yellow-400"/> IA Premium</h2><p className="text-blue-100 text-xs mt-1"><strong>{(performanceStats.acertos/performanceStats.totalAnalises*100).toFixed(1)}%</strong> de precisão geral</p></div>
                        <button onClick={() => setViewMode('ranking')} className="relative z-10 bg-white/20 border border-white/30 text-white text-[10px] font-bold px-4 py-3 rounded-xl uppercase tracking-wider">VER RANKING</button>
                        </div>
                    )}

                    {bilhetePremium.selecoes.length > 0 && (
                        <div className="bg-[#0f172a] border border-green-500/30 rounded-3xl p-6 mb-6 mx-4 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>
                            <h2 className="font-black text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider relative z-10"><Target className="w-5 h-5"/> Bilhete Inteligente IA</h2>
                            <div className="relative z-10">
                                {bilhetePremium.selecoes.map(jogo => (
                                    <div key={jogo.id} onClick={() => abrirPainelDoJogo(jogo)} className="bg-[#111827] border border-white/5 p-4 rounded-xl mb-3 cursor-pointer hover:border-green-500/50 transition-colors flex justify-between items-center">
                                        <div className="font-bold text-white text-sm">{jogo.home_team} x {jogo.away_team}</div>
                                        <div className="text-green-400 text-[10px] font-black tracking-widest uppercase">Confiança: {jogo.confianca_ia}%</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-green-500/20 flex justify-between items-center relative z-10">
                                <span className="text-xs text-green-200 font-black uppercase tracking-widest">Odd Combinada Final</span>
                                <span className="text-3xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">@{bilhetePremium.oddFinal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {oportunidades.length > 0 && (
                        <div className="bg-[#0f172a] border border-orange-500/30 rounded-3xl p-6 mb-6 mx-4 shadow-lg">
                            <h2 className="font-black text-orange-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Flame className="w-5 h-5"/> Radar de Oportunidades</h2>
                            {oportunidades.map(j => (
                                <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-[#111827] border border-white/5 p-4 rounded-xl mb-3 last:mb-0 cursor-pointer hover:border-orange-500/50 transition-colors flex justify-between items-center">
                                    <div className="font-bold text-white text-sm">{j.home_team}</div>
                                    <div className="text-orange-400 text-[10px] font-black uppercase tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-md border border-orange-500/20">EV+ {calcularEV(j.confianca_ia, j.odd_principal).toFixed(1)}%</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <BankerPicksCard />

                    {mockJogosData[0] && (() => {
                        const destaque = mockJogosData[0];
                        const heatScore = calcularHeatScore(destaque);
                        return (
                            <div className="bg-gradient-to-br from-amber-500 to-red-600 rounded-3xl p-6 mb-6 shadow-[0_0_25px_rgba(245,158,11,0.3)] relative overflow-hidden mx-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[10px] font-black text-white bg-black/20 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 animate-pulse uppercase tracking-wider shadow-sm border border-white/10"><ShieldAlert className="w-3 h-3"/> TOP PICK IA</div>
                                    <div className="text-[10px] font-black text-white bg-red-700/80 px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1 uppercase tracking-wider border border-red-400/30"><Flame className="w-3 h-3 text-yellow-400"/> HEAT SCORE: {heatScore}</div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight drop-shadow-md">{topPick.jogo}</h3>
                                <div className="flex items-end gap-4 mb-5">
                                    <div className="text-6xl font-black text-white drop-shadow-lg tracking-tighter">{topPick.confianca}%</div>
                                    <div className="bg-black/30 border border-white/20 p-3 rounded-xl flex flex-col items-center justify-center mb-1 backdrop-blur-sm"><span className="text-[9px] font-black text-amber-200 uppercase tracking-widest">💰 EV+</span><strong className="text-lg font-black text-white">+{topPick.ev}%</strong></div>
                                </div>
                                <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-5 backdrop-blur-sm"><span className="text-white font-black text-sm flex items-center gap-2">🔥 Mercado: {topPick.mercado}</span></div>
                                <button onClick={() => abrirPainelDoJogo(destaque)} className="w-full bg-black/30 hover:bg-black/40 text-white font-black py-4 rounded-xl shadow-lg border border-white/20 transition-all flex justify-center items-center gap-2 uppercase tracking-wider text-xs">Analisar Jogo <ChevronRight className="w-4 h-4"/></button>
                            </div>
                        )
                    })()}

                    <div className="bg-[#0f172a] border border-purple-500/20 rounded-3xl p-6 mb-6 mx-4 shadow-lg">
                        <h2 className="text-sm font-black text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><TrendingUp className="w-4 h-4"/> Evolução do Algoritmo IA</h2>
                        <div className="w-full relative" style={{ height: '150px' }}>
                            <ResponsiveContainer width="99%" height={149}>
                                <LineChart data={crescimentoBancaGlobal}>
                                    <XAxis dataKey="dia" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                                    <Line type="monotone" dataKey="banca" stroke="#a855f7" strokeWidth={4} dot={{r:4, fill:"#a855f7", stroke:"#fff", strokeWidth:2}} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4">
                        <button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${filterCentro==='Todos' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Todos</button>
                        <button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-2 border ${filterCentro==='Ao Vivo' ? 'bg-white text-black border-white' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>
                        {listaLigas.filter(l => l.id !== null).map(l => (
                            <button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-colors border ${ligaAtivaId === l.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#050816] border-slate-700 text-slate-400'}`}>{l.name}</button>
                        ))}
                    </div>

                    <div className="px-4">
                        {loading ? <div className="text-center text-slate-500 py-10">Buscando radar de jogos...</div> : 
                        Object.entries(jGrp).map(([leagueName, matches]) => (
                            <div key={leagueName} className="mb-6">
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div>
                                {matches.map(j => {
                                    const isLive = j.status === 'Live';
                                    const heatScore = calcularHeatScore(j);
                                    const risco = calcularRisco(j);
                                    const isValueBet = j.odd_principal ? detectarValueBet(j.confianca_ia, j.odd_principal) : false;
                                    
                                    return (
                                        <div key={j.id} onClick={() => abrirPainelDoJogo(j)} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer relative overflow-hidden transition-all hover:border-blue-500/50">
                                            {heatScore > 50 && <div className="absolute -right-8 top-5 bg-red-600 text-white text-[8px] font-black px-8 py-1 rotate-45 shadow-lg flex items-center justify-center uppercase tracking-widest border-y border-red-400/30">Heat {heatScore}</div>}
                                            <div className="flex justify-between items-center mb-5">
                                                {isLive ? <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">🔴 Ao Vivo {j.time_elapsed}'</span> : <span className="text-slate-400 text-xs font-bold uppercase">{j.status === 'Finished' ? 'Finalizado' : j.starting_at?.split('T')[1]?.substring(0,5)}</span>}
                                                <button onClick={(e) => toggleFavorito(e, j.id)} className="p-1 z-10 relative mr-6"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
                                            </div>
                                            <div className="flex gap-2 mb-3">
                                                {isValueBet && <div className="bg-green-500/20 border border-green-500/40 text-green-400 font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider">💰 VALUE BET</div>}
                                                <div className={`border ${risco.cor} font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1`}><AlertTriangle className="w-3 h-3"/> Risco: {risco.nivel}</div>
                                            </div>
                                            <div className="grid grid-cols-3 items-center text-center mb-5 mt-2">
                                                <div className="flex flex-col items-center gap-2"><img src={j.home_image} className="w-12 h-12 object-contain drop-shadow-md" alt=""/><span className="text-xs font-bold text-slate-200 line-clamp-1 w-full">{j.home_team}</span></div>
                                                <div className="text-4xl font-black tracking-tighter">{isLive || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600 text-2xl">-</span>}</div>
                                                <div className="flex flex-col items-center gap-2"><img src={j.away_image} className="w-12 h-12 object-contain drop-shadow-md" alt=""/><span className="text-xs font-bold text-slate-200 line-clamp-1 w-full">{j.away_team}</span></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                  </>
              )}

              {/* =========================================
                  O NOVO DASHBOARD DO PERFIL COMPLETO
              ========================================= */}
              {viewMode === 'perfil' && (
                  <div className="px-4 animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-black flex items-center gap-2"><User className="w-6 h-6 text-blue-500"/> Meu Perfil</h2>
                          <div className="flex gap-2">
                            <button onClick={solicitarPermissaoNotificacao} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg transition-colors uppercase tracking-widest"><Bell className="w-3 h-3"/> Alertas</button>
                            {userData?.is_admin && <button onClick={() => setViewMode('admin')} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg transition-colors uppercase tracking-widest"><Settings className="w-3 h-3"/> Admin</button>}
                          </div>
                      </div>
                      
                      {/* PERFIL & XP */}
                      <div className="bg-[#0f172a] border border-blue-500/20 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center mb-6 relative overflow-hidden">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10"><User className="w-10 h-10 text-white"/></div>
                          <h2 className="text-xl font-black text-white mb-1 relative z-10">{form.nome || userData?.nome}</h2>
                          
                          <div className="bg-[#111827] p-4 rounded-xl border border-white/5 w-full mt-4 relative z-10 shadow-inner">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Award className="w-4 h-4 text-yellow-500"/> Nível Atual:</span>
                                  <strong className="text-sm font-black text-green-400 uppercase tracking-widest">{nivelUsuario()}</strong>
                              </div>
                              <div className="bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-1000" style={{width: `${(xp/5000)*100}%`}}></div>
                              </div>
                              <div className="text-[9px] text-right font-bold text-slate-500 mt-1.5 uppercase tracking-widest">{xp} / 5000 XP</div>
                          </div>
                      </div>

                      {/* META MENSAL */}
                      <div className="bg-[#0f172a] p-5 rounded-3xl mb-6 shadow-lg border border-white/5">
                          <div className="flex justify-between mb-2">
                              <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4 text-green-500"/> Meta Mensal</span>
                              <span className="text-xs font-bold text-slate-300">R$ {lucroAcumulado().toFixed(2)} <span className="text-slate-500">/ R$ {metaMensal}</span></span>
                          </div>
                          <div className="bg-slate-800 h-4 rounded-full overflow-hidden mt-3 shadow-inner">
                              <div className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-1000 relative" style={{width: `${progressoMeta()}%`}}>
                                  <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                              </div>
                          </div>
                      </div>

                      {/* SISTEMA DE CONQUISTAS */}
                      <div className="mb-6">
                          <h3 className="text-sm font-black text-white mb-3 uppercase tracking-wider flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500"/> Conquistas Desbloqueadas</h3>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                              {listaConquistas().map((c, index)=>(
                                  <div key={index} className="bg-[#0f172a] border border-yellow-500/20 text-yellow-500 text-xs font-black px-4 py-2.5 rounded-xl whitespace-nowrap shadow-sm">
                                      {c}
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* GESTÃO PROFISSIONAL (Drawdown e Backtest) */}
                      <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-red-500"/> Gestão Profissional</h3>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#111827] p-5 rounded-2xl border border-red-500/20 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-red-400"/> Drawdown Máx</div>
                              <div className="text-2xl font-black text-red-400">{calcularDrawdown(apostas, bancaInicial)}%</div>
                          </div>
                          <button onClick={handleRunBacktest} className="bg-gradient-to-br from-blue-700 to-blue-500 p-5 rounded-2xl border border-blue-400/30 shadow-lg flex flex-col items-center justify-center hover:scale-[1.02] transition-transform">
                              <Calendar className="w-5 h-5 text-white mb-1"/>
                              <div className="text-[10px] text-white font-black uppercase tracking-widest text-center">Rodar Backtest Histórico</div>
                          </button>
                      </div>

                      {/* ROI E LUCRO */}
                      <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/> Retorno Sobre Investimento</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ROI Semanal</div>
                              <div className={`text-xl font-black ${calcularROISemanal() >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calcularROISemanal().toFixed(1)}%</div>
                          </div>
                          <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ROI Mensal</div>
                              <div className={`text-xl font-black ${calcularROIMensal() >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calcularROIMensal().toFixed(1)}%</div>
                          </div>
                          <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ROI Anual</div>
                              <div className={`text-xl font-black ${calcularROIAnual() >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calcularROIAnual().toFixed(1)}%</div>
                          </div>
                          <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Lucro Total</div>
                              <div className={`text-xl font-black ${lucroAcumulado() >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {lucroAcumulado().toFixed(2)}</div>
                          </div>
                      </div>

                      {/* CRESCIMENTO & IA ANALISTA */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Crescimento da Banca</div>
                              <div className={`text-3xl font-black ${crescimentoBanca() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {crescimentoBanca() >= 0 ? '+' : ''}{crescimentoBanca().toFixed(2)}%
                              </div>
                          </div>
                          <div className="bg-[#0f172a] p-5 rounded-3xl border border-blue-500/20 shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full"></div>
                              <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5 relative z-10"><BrainCircuit className="w-3 h-3"/> IA Analista</div>
                              <div className="text-xs text-slate-300 font-medium whitespace-pre-line leading-relaxed relative z-10">
                                  {relatorioIA()}
                              </div>
                          </div>
                      </div>

                      {/* PERFORMANCE GERAL */}
                      <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4 text-blue-500"/> Performance Geral</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Yield Médio</div>
                              <div className="text-2xl font-black text-blue-400">R$ {calcularYield()}</div>
                          </div>
                          <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 shadow-lg">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Assertividade</div>
                              <div className="text-2xl font-black text-yellow-400">{calcularAssertividade().toFixed(1)}%</div>
                          </div>
                      </div>

                      {/* RANKINGS DE EQUIPAS E LIGAS */}
                      <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500"/> Onde você mais lucra</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg">
                              <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-orange-400"/> Top 5 Equipas</h3>
                              <div className="flex flex-col gap-1">
                                  {rankingTimes().map((item, index) => (
                                      <div key={index} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                                          <span className="text-xs font-bold text-white line-clamp-1 pr-2">{index + 1}. {item.nome}</span>
                                          <span className={`text-xs font-black whitespace-nowrap ${item.lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {item.lucro.toFixed(2)}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg">
                              <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Globe className="w-3 h-3 text-purple-400"/> Top 5 Ligas</h3>
                              <div className="flex flex-col gap-1">
                                  {rankingLigas().map((item, index) => (
                                      <div key={index} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                                          <span className="text-xs font-bold text-white line-clamp-1 pr-2">{index + 1}. {item.nome}</span>
                                          <span className={`text-xs font-black whitespace-nowrap ${item.lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {item.lucro.toFixed(2)}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* SUMMARY DE MERCADO E HORÁRIO */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1"><PieChart className="w-3 h-3 text-blue-400"/> Top Mercado</span>
                              <strong className="text-sm font-black text-white line-clamp-1">{mercadoMaisLucrativo()[0]}</strong>
                          </div>
                          <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col gap-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3 text-red-400"/> Top Horário</span>
                              <strong className="text-sm font-black text-white line-clamp-1">{horarioMaisLucrativo()[0]}</strong>
                          </div>
                      </div>

                      {/* SIMULADOR DE STAKE */}
                      <div className="bg-[#0f172a] p-5 rounded-3xl mb-6 shadow-lg border border-white/5">
                          <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Calculator className="w-4 h-4 text-blue-500"/> Simulador de Stake (Kelly: {calcularKelly(Number(simOdd)||1.01, 65).toFixed(1)}%)</h2>
                          <div className="flex gap-3 mb-4">
                              <input type="number" placeholder="Stake (R$)" value={simStake} onChange={(e)=>setSimStake(e.target.value)} className="w-full bg-[#050816] border border-slate-800 p-3 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500 transition-colors" />
                              <input type="number" placeholder="Odd (@)" value={simOdd} onChange={(e)=>setSimOdd(e.target.value)} className="w-full bg-[#050816] border border-slate-800 p-3 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500 transition-colors" />
                          </div>
                          <div className="flex justify-between items-center bg-[#111827] p-3 rounded-xl border border-white/5">
                              <div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Lucro Limpo</span><span className="text-green-400 font-black text-sm">R$ {lucroSimulado().toFixed(2)}</span></div>
                              <div className="text-right"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Retorno Total</span><span className="text-blue-400 font-black text-sm">R$ {retornoTotal().toFixed(2)}</span></div>
                          </div>
                      </div>

                      {/* GRÁFICO DA BANCA */}
                      <div className="bg-[#0f172a] border border-green-500/20 rounded-3xl p-6 mb-6 shadow-lg">
                          <h2 className="text-sm font-black text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><TrendingUp className="w-5 h-5"/> Evolução da Banca</h2>
                          <div className="w-full relative" style={{ height: '250px' }}>
                              <ResponsiveContainer width="99%" height={249}>
                                  <LineChart data={dadosGraficoBanca}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                      <XAxis dataKey="aposta" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff'}} />
                                      <Line type="monotone" dataKey="banca" stroke="#22c55e" strokeWidth={4} dot={{r:5, fill:"#22c55e", stroke:"#fff", strokeWidth:2}} isAnimationActive={false} />
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* IMPORTAÇÃO DO COMPONENTE DE ESTATÍSTICAS AVANÇADAS */}
                      <EstatisticasAvancadas 
                          apostas={apostas} 
                          isPro={userData?.is_vip} 
                          onUnlockPro={() => setMenuAtivo('assinar pro')} 
                      />

                      {/* HISTÓRICO DE APOSTAS COM FILTROS */}
                      <div className="bg-[#0f172a] rounded-3xl p-5 mb-6 shadow-lg border border-white/5">
                          <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><List className="w-4 h-4 text-slate-400"/> Histórico de Apostas</h2>
                          
                          <div className="flex gap-2 mb-5">
                              <div className="relative w-1/2">
                                  <Filter className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"/>
                                  <select value={filtroResultado} onChange={(e)=>setFiltroResultado(e.target.value)} className="w-full bg-[#050816] border border-slate-800 text-xs text-white font-bold p-3 pl-8 rounded-xl outline-none focus:border-blue-500 appearance-none">
                                      <option value="todos">Status: Todos</option>
                                      <option value="green">Green (Ganhos)</option>
                                      <option value="red">Red (Perdas)</option>
                                  </select>
                              </div>
                              <select value={filtroLiga} onChange={(e)=>setFiltroLiga(e.target.value)} className="w-1/2 bg-[#050816] border border-slate-800 text-xs text-white font-bold p-3 rounded-xl outline-none focus:border-blue-500 appearance-none">
                                  <option value="todas">Liga: Todas</option>
                                  <option value="Brasileirão">Brasileirão</option>
                                  <option value="Premier League">Premier League</option>
                                  <option value="La Liga">La Liga</option>
                              </select>
                          </div>

                          <div className="flex flex-col gap-3">
                              {apostasFiltradas().length > 0 ? apostasFiltradas().map((a, index)=>(
                                  <div key={index} className="bg-[#111827] border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                                      <div>
                                          <div className="font-bold text-white text-xs mb-1">{a.jogo}</div>
                                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><span>{a.mercado}</span> <span>•</span> <span>Odd: @{a.odd.toFixed(2)}</span></div>
                                      </div>
                                      <div className={`font-black text-sm uppercase tracking-widest px-3 py-1.5 rounded-lg border ${a.resultado === "green" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                          {a.resultado}
                                      </div>
                                  </div>
                              )) : (
                                  <div className="text-center text-slate-500 text-xs py-4 font-bold">Nenhuma aposta encontrada no filtro.</div>
                              )}
                          </div>
                      </div>

                      {/* MENUS VERTICAIS COMPACTOS: CENTRAL IA */}
                      <div className="flex flex-col gap-3 mb-6">
                          <button onClick={() => setViewMode('ia_center')} className="w-full bg-[#0f172a] border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:bg-[#1e293b] transition-colors">
                              <div className="bg-blue-500/10 p-2.5 rounded-xl"><Zap className="w-5 h-5 text-blue-500"/></div>
                              <span className="font-black text-sm uppercase tracking-wider text-white">Central IA</span>
                              <ChevronRight className="w-5 h-5 text-slate-600 ml-auto"/>
                          </button>
                      </div>
                  </div>
              )}

              {/* =========================================
                  RANKING & CENTRAL IA
              ========================================= */}
              {viewMode === 'ranking' && (
                  <div className="px-4 animate-fade-in">
                      <HeaderNav title="🏆 Comunidade" onBack={() => setViewMode('perfil')} />
                      <div className="bg-[#0f172a] border border-yellow-500/30 rounded-3xl p-6 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                          <h3 className="text-sm font-black text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Users className="w-5 h-5"/> Ranking Global</h3>
                          <div className="flex flex-col gap-3">
                              {rankingUsuarios.map((user, index) => (
                                  <div key={index} className="bg-[#111827] border border-white/5 p-4 rounded-2xl flex justify-between items-center transition-colors">
                                      <div className="flex items-center gap-3"><span className="text-xs font-black text-slate-400">#{index+1}</span><span className="font-bold text-white text-sm">{user.nome}</span></div>
                                      <strong className="text-green-400 font-black">R$ {user.lucro_total.toFixed(2)}</strong>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {viewMode === 'ia_center' && (
                  <div className="px-4 animate-fade-in">
                      <HeaderNav title="🤖 Central IA" onBack={() => setViewMode('perfil')} />
                      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 mb-6 shadow-lg mx-4">
                          <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider">Precisão Histórica</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-[#111827] rounded-2xl p-4 text-center border border-white/5"><span className="text-[10px] font-bold text-slate-400 uppercase">Acertos IA</span><strong className="text-2xl font-black text-green-400 block">{performanceStats.acertos}</strong></div>
                              <div className="bg-[#111827] rounded-2xl p-4 text-center border border-white/5"><span className="text-[10px] font-bold text-slate-400 uppercase">Erros IA</span><strong className="text-2xl font-black text-red-400 block">{performanceStats.erros}</strong></div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* =========================================
          PAINEL DO JOGO ABERTO
      ========================================= */}
      {jogoSelecionado && !jogoSelecionado.is_loading && menuAtivo !== 'assinar pro' && (
        <div className="px-4 mt-4 pb-20 animate-fade-in">
            <button onClick={() => setJogoSelecionado(null)} className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-6 bg-[#0f172a] border border-white/10 px-4 py-2 rounded-xl uppercase tracking-wider"><X className="w-4 h-4"/> Voltar</button>
            <div className="bg-[#0f172a] rounded-3xl p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col items-center w-1/3"><img src={jogoSelecionado.home_image} className="w-16 h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-xs text-center">{jogoSelecionado.home_team}</span></div>
                    <div className="w-1/3 text-center"><div className="text-4xl font-black mb-1 tracking-tighter">{jogoSelecionado.status === 'Not Started' ? 'VS' : `${jogoSelecionado.scoreHome} - ${jogoSelecionado.scoreAway}`}</div></div>
                    <div className="flex flex-col items-center w-1/3"><img src={jogoSelecionado.away_image} className="w-16 h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-xs text-center">{jogoSelecionado.away_team}</span></div>
                </div>

                {jogoSelecionado.dadosAPI && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-center mb-5">
                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block mb-1">🤖 Análise API Football Ao Vivo</span>
                        <strong className="text-sm font-black text-white">{jogoSelecionado.dadosAPI.recomendacao} (Conf: {jogoSelecionado.dadosAPI.confianca}%)</strong>
                    </div>
                )}

                {jogoSelecionado.odd_principal && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center">
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest block mb-1">Stake Recomendada</span>
                            <strong className="text-xl font-black text-white">R$ {calcularStake(bancaInicial, jogoSelecionado.confianca_ia).toFixed(2)}</strong>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-center">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-1">🧠 Kelly Criterion</span>
                            <strong className="text-xl font-black text-white">{calcularKelly(jogoSelecionado.odd_principal, jogoSelecionado.confianca_ia).toFixed(1)}%</strong>
                        </div>
                    </div>
                )}
                
                <div className="bg-[#050816] rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden flex flex-col items-start mb-4">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-xl rounded-full"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10"><Crosshair className="w-5 h-5 text-blue-500" /><h4 className="font-black text-xs text-blue-400 uppercase tracking-widest">ANÁLISE ESTATÍSTICA IA</h4></div>
                    
                    {jogoSelecionado.explanation ? (
                        <div className="text-slate-300 text-xs leading-relaxed relative z-10 font-semibold whitespace-pre-line">{jogoSelecionado.explanation}</div>
                    ) : (
                        <button onClick={() => gerarExplicacaoIA(jogoSelecionado)} disabled={jogoSelecionado.is_loading_explanation} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                           {jogoSelecionado.is_loading_explanation ? <span className="animate-pulse">A calcular motivos...</span> : <><Zap className="w-4 h-4"/> Gerar Relatório Profissional (Gemini)</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* CHECKOUT VIP PRO */}
      {menuAtivo === "assinar pro" && (
         <div className="px-4 pt-4 animate-fade-in">
             <div className="flex justify-between items-center mb-6"><button onClick={() => setMenuAtivo('Todos os Jogos')} className="text-slate-400 text-sm font-bold flex items-center gap-1"><X className="w-5 h-5"/> Fechar</button></div>
             <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-2xl">
                <Crown className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Seja PRO 👑</h2>
                <div className="flex flex-col gap-3">
                    <input placeholder="Nome Completo" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <input type="email" placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <input placeholder="CPF (Apenas números)" maxLength={11} value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value.replace(/\D/g, '')})} className="bg-[#050816] border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white font-bold" />
                    <button className="mt-4 bg-green-500 hover:bg-green-600 transition-colors text-white font-black py-4 rounded-2xl shadow-lg text-sm uppercase tracking-wider">⚡ PAGAR R$ 29,90 COM PIX</button>
                </div>
             </div>
         </div>
      )}

      {/* 🔥 ALERTAS AUTOMÁTICOS FLOAT */}
      <div className="fixed top-32 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none">
          <AnimatePresence>
              {alertas.slice(0, 2).map((alerta) => (
                  <motion.div key={alerta.id} initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="bg-red-600/90 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg border border-red-400 flex items-center gap-2">
                      <Bell className="w-3 h-3 animate-bounce"/> {alerta.msg}
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>

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

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050816] border-t border-white/5 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' && !jogoSelecionado ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><Home className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Início</span></button>
        <button onClick={() => {setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${filterCentro === 'Ao Vivo' && !jogoSelecionado ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'}`}><div className="relative"><Radio className="w-6 h-6" />{filterCentro === 'Ao Vivo' && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div><span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span></button>
        <button onClick={() => {setViewMode('ranking'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${viewMode === 'ranking' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}><Trophy className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Ranking</span></button>
        <button onClick={() => {setViewMode('perfil'); setJogoSelecionado(null);}} className={`flex flex-col items-center gap-1.5 transition-colors ${['perfil','ia_center','admin'].includes(viewMode) ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Perfil</span></button>
      </nav>
    </div>
  );
}