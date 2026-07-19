import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import './App.css';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import PlayStoreModeBadge from './components/PlayStoreModeBadge.jsx';
import ComoIACalcula from './components/ComoIACalcula.jsx';
import RankingOportunidades from './components/RankingOportunidades.jsx';
import EducacaoBetAnalytics from './components/EducacaoBetAnalytics.jsx';
import HistoricoAssertividade from './components/HistoricoAssertividade.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { createClient } from '@supabase/supabase-js';
import { Home, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, Send, DollarSign, Target, Globe, CreditCard, Lock, Calendar, Search, Plus, CheckCircle2 } from 'lucide-react';
import { calcularKelly } from './utils/math.js';
import { calcularStake } from './utils/risk.js';
import { useFavoritos } from './hooks/useFavoritos.js';
import { useApiFootball } from './hooks/useApiFootball.js';
import { useIA } from './hooks/useIA.js';
import HeroPremium from './components/HeroPremium.jsx';
import LegalCompliance from './components/LegalCompliance.jsx';
import PesquisaFuncional from './components/PesquisaFuncional.jsx';
import JogosPorPaisContinente from './components/JogosPorPaisContinente.jsx';
import Perfil from './components/Perfil.jsx';
import PainelJogo from './components/PainelJogo.jsx';
import ComparadorOdds from './components/ComparadorOdds.jsx';
import AssinaturaPro from './components/AssinaturaPro.jsx';
import MercadosIAResumo from './components/MercadosIAResumo.jsx';
import OnboardingPro from './components/OnboardingPro.jsx';
import CentralValorIA from './components/CentralValorIA.jsx';
import GestaoBancaPro from './components/GestaoBancaPro.jsx';
import AlertasIAPro from './components/AlertasIAPro.jsx';
import { gerarClickIdAfiliado, montarUrlAfiliado } from './config/casasAfiliadas.js';
import FavoritosPro from './components/FavoritosPro.jsx';
import VipPro from './components/VipPro.jsx';
import ConfiguracoesPro from './components/ConfiguracoesPro.jsx';
import ModoDemoBadge from './components/ModoDemoBadge.jsx';
import ModoDemoPro from './components/ModoDemoPro.jsx';
import PerformanceIAPro from './components/PerformanceIAPro.jsx';
import CasasParceirasPro from './components/CasasParceirasPro.jsx';
import PerfilProCompleto from './components/PerfilProCompleto.jsx';
import SemConexaoPro from './components/SemConexaoPro.jsx';
import SplashLogoAnimado from './components/SplashLogoAnimado.jsx';
import MobileBackAndCleanUI from './components/MobileBackAndCleanUI.jsx';
import CalendarioSemanaJogos from './components/CalendarioSemanaJogos.jsx';
import RemoverSomentePesquisaBottom from './components/RemoverSomentePesquisaBottom.jsx';
import AdminResumoPro from './components/AdminResumoPro.jsx';
const MODO_DEMONSTRACAO = true;
const API_URL = '';
function gerarEscudoAutomatico(nomeTime = 'TIME') {
  const nome = String(nomeTime || 'TIME').trim();
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => String(p[0] || '').toUpperCase())
    .join('')
    .replace(/[^A-Z0-9]/g, '') || 'FC';
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const cor1 = `hsl(${hue}, 82%, 45%)`;
  const cor2 = `hsl(${(hue + 45) % 360}, 88%, 28%)`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${cor1}"/>
          <stop offset="100%" stop-color="${cor2}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path
        d="M60 7 L101 22 V54 C101 82 82 104 60 114 C38 104 19 82 19 54 V22 Z"
        fill="url(#g)"
        stroke="rgba(255,255,255,0.78)"
        stroke-width="5"
        filter="url(#shadow)"
      />
      <path
        d="M60 18 L88 29 V53 C88 73 76 89 60 97 C44 89 32 73 32 53 V29 Z"
        fill="rgba(5,8,22,0.25)"
        stroke="rgba(255,255,255,0.22)"
        stroke-width="2"
      />
      <circle
        cx="60"
        cy="57"
        r="28"
        fill="rgba(5,8,22,0.38)"
        stroke="rgba(255,255,255,0.38)"
        stroke-width="2"
      />
      <text
        x="60"
        y="67"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="28"
        font-weight="900"
        fill="#ffffff"
      >${iniciais}</text>
      <text
        x="60"
        y="92"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="8"
        font-weight="800"
        letter-spacing="1"
        fill="rgba(255,255,255,0.78)"
      >BET IA</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function urlLogoValida(url = '') {
  const v = String(url || '').trim();
  if (!v) return false;
  if (v === 'null') return false;
  if (v === 'undefined') return false;
  if (v.includes('time-generico')) return false;
  if (v.includes('5323814')) return false;
  return true;
}
function escudoTime(urlLogo, nomeTime) {
  return urlLogoValida(urlLogo)
    ? urlLogo
    : gerarEscudoAutomatico(nomeTime);
}
const PLANO_PRO = { nome: 'BetAnalytics PRO Mensal', valor: 29.90, dias: 30 };
let supabase = { from: () => ({ select: () => Promise.resolve({ data: [], error: null }), insert: () => Promise.resolve({ data: null, error: null }) }) };
try {
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;
if (url && key && url.startsWith('http')) supabase = createClient(url, key);
} catch (e) {
console.error("Erro Supabase:", e);
}
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-5947285218976034', { locale: 'pt-BR' });
const PAISES = ['brasil', 'argentina', 'colombia', 'uruguai', 'chile', 'peru', 'equador', 'venezuela', 'bolivia', 'paraguai', 'espanha', 'alemanha', 'franca', 'portugal', 'inglaterra', 'italia', 'holanda', 'belgica', 'croacia', 'mexico', 'eua', 'estados unidos', 'canada'];
const isSelecao = (h, a, l) => {
const str = `${h || ''} ${a || ''} ${l || ''}`.toLowerCase();
if (str.includes('euro') || str.includes('copa america') || str.includes('nations league') || str.includes('world cup')) return true;
return PAISES.some(p => str.includes(p));
};
const getLocalYYYYMMDD = () => {
const d = new Date();
d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
return d.toISOString().split('T')[0];
};
const listaLigas = [{ name: 'Todos', id: null }, { name: 'Brasileirao', id: 71 }, { name: 'Champions', id: 2 }, { name: 'Premier League', id: 39 }];
const crescimentoBancaGlobal = [{ dia: "Seg", banca: 1000 }, { dia: "Ter", banca: 1120 }, { dia: "Qua", banca: 1210 }, { dia: "Qui", banca: 1380 }, { dia: "Sex", banca: 1470 }, { dia: "Sab", banca: 1650 }, { dia: "Dom", banca: 1840 }];
const desempenhoDiario = [{ dia: "Seg", acertos: 14, erros: 3 }, { dia: "Ter", acertos: 18, erros: 2 }, { dia: "Qua", acertos: 12, erros: 5 }, { dia: "Qui", acertos: 20, erros: 4 }, { dia: "Sex", acertos: 25, erros: 6 }, { dia: "Sab", acertos: 32, erros: 5 }, { dia: "Dom", acertos: 29, erros: 3 }];
const BUSCA_Equipes = [
  { tipo: 'time', nome: 'Brasil', sub: 'Sele\u00e7\u00e3o Brasileira', emoji: '\u{1F1E7}\u{1F1F7}' },
  { tipo: 'time', nome: 'Fran\u00e7a', sub: 'Sele\u00e7\u00e3o Francesa', emoji: '\u{1F1EB}\u{1F1F7}' },
  { tipo: 'time', nome: 'Noruega', sub: 'Sele\u00e7\u00e3o Norueguesa', emoji: '\u{1F1F3}\u{1F1F4}' },
  { tipo: 'time', nome: 'Real Madrid', sub: 'Espanha', emoji: '\u{26BD}' },
  { tipo: 'time', nome: 'FC Barcelona', sub: 'Espanha', emoji: '\u{1F535}' },
  { tipo: 'time', nome: 'Manchester City', sub: 'Inglaterra', emoji: '\u{1F535}' },
];
const BUSCA_Jogadores = [{ tipo: 'atleta', nome: 'Lionel Messi', sub: 'Atacante', emoji: '' }, { tipo: 'atleta', nome: 'Kylian Mbappe', sub: 'Atacante', emoji: '' }, { tipo: 'atleta', nome: 'Erling Haaland', sub: 'Atacante', emoji: '' }, { tipo: 'atleta', nome: 'Cristiano Ronaldo', sub: 'Atacante', emoji: '' }, { tipo: 'atleta', nome: 'Lamine Yamal', sub: 'Atacante', emoji: '' }, { tipo: 'atleta', nome: 'Vinicius Junior', sub: 'Atacante', emoji: '' }];
const BUSCA_Ranking = [{ tipo: 'Ranking', nome: 'Ranking da FIFA', sub: 'Selecoes', emoji: '' }, { tipo: 'Ranking', nome: 'Ranking da UEFA', sub: 'Europa', emoji: '' }];
const BUSCA_COMPETICOES = [
  { tipo: 'competicao', nome: 'Brasileir\u00e3o Betano', sub: 'Brasil', emoji: '\u{1F1E7}\u{1F1F7}' },
  { tipo: 'competicao', nome: 'FIFA Club World Cup', sub: 'Mundo', emoji: '\u{1F30D}' },
  { tipo: 'competicao', nome: 'Liga dos Campe\u00f5es', sub: 'Europa', emoji: '\u{1F3C6}' },
  { tipo: 'competicao', nome: 'UEFA Liga Europa', sub: 'Europa', emoji: '\u{1F3C6}' },
  { tipo: 'competicao', nome: 'Premier League', sub: 'Inglaterra', emoji: '\u{1F3F4}' },
  { tipo: 'competicao', nome: 'LaLiga', sub: 'Espanha', emoji: '\u{1F1EA}\u{1F1F8}' },
];
const TODAS_COMPETICOES = [{ pais: 'Brasil', emoji: '', qtd: 6, ligas: ['Brasileirao Serie A', 'Brasileirao Serie B', 'Copa do Brasil', 'Paulistao', 'Carioca', 'Serie C'] }, { pais: 'Brasil (Amador)', emoji: '', qtd: 22, ligas: ['Sub-20', 'Sub-23', 'Feminino', 'Estaduais', 'Copa Paulista', 'Aspirantes'] }, { pais: 'Mundo', emoji: '', qtd: 33, ligas: ['Copa do Mundo', 'Mundial de Clubes', 'Amistosos Internacionais', 'Nations League', 'Eliminatorias', 'Olimpico'] }, { pais: 'Europa', emoji: '', qtd: 6, ligas: ['Champions League', 'Europa League', 'Conference League', 'Eurocopa', 'Supercopa UEFA', 'Nations League'] }, { pais: 'America do Sul', emoji: '', qtd: 8, ligas: ['Libertadores', 'Sul-Americana', 'Recopa', 'Copa America', 'Argentina Primera', 'Uruguai Primera'] }];
const normalizarTexto = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const abasPesquisa = [
{ id: 'Equipes', label: ' Equipes' },
{ id: 'Jogadores', label: ' Jogadores' },
{ id: 'Ranking', label: ' Ranking' },
{ id: 'principais', label: ' Ligas Principais' },
{ id: 'todas', label: ' Todas Competicoes' },
];
export default function App() {
const [showSplash, setShowSplash] = useState(true);
const [showOnboardingPro, setShowOnboardingPro] = useState(() => { try { return localStorage.getItem('bet_onboarding_pro_v1') !== 'ok'; } catch (e) { return true; } });
const [ligaAtivaId, setLigaAtivaId] = useState(null);
const [menuAtivo, setMenuAtivo] = useState('Todos os Jogos');
const [userData, setUserData] = useState(null);
const [viewMode, setViewMode] = useState('jogos');
const [filterCentro, setFilterCentro] = useState('Todos');
const [jogoSelecionado, setJogoSelecionado] = useState(null);
const [form, setForm] = useState({ nome: '', email: '', cpf: '', senha: '', nascimento: '' });
const [metodoPagamento, setMetodoPagamento] = useState('pix');
const [pagamentoStatus, setPagamentoStatus] = useState({ loading: false, erro: '', sucesso: '', pix: null, id: null });
const cardFormMercadoPagoRef = useRef(null);
const pollingPagamentoRef = useRef(null);
const [bancaInicial] = useState(1000);
const [xp] = useState(350);
const dataApiFootball = getLocalYYYYMMDD();
const nivelUsuario = () => xp > 3000 ? "Mestre" : xp > 1000 ? "Especialista" : "Profissional";
const [apostas] = useState([]);
const [favAba, setFavAba] = useState('Eventos');
const [buscaPesquisa, setBuscaPesquisa] = useState('');
const [abaPesquisaAtiva, setAbaPesquisaAtiva] = useState('Equipes');
const [categoriaAberta, setCategoriaAberta] = useState('Brasil');
const [favCatalogo, setFavCatalogo] = useState(() => { try { return JSON.parse(localStorage.getItem('bet_favoritos_catalogo') || '[]') } catch (e) { return [] } });
const metaMensal = 2000;
const { favoritos, toggleFavorito } = useFavoritos();
const registrarCliqueAfiliado = useCallback(async (casa, jogo = null, origem = 'comparador_odds') => {
  const clickId = gerarClickIdAfiliado(casa?.id || 'casa');
  const urlDestino = montarUrlAfiliado(casa, clickId);
  const registro = {
    click_id: clickId,
    casa_id: casa?.id || '',
    casa_nome: casa?.nome || '',
    usuario_email: userData?.email || localStorage.getItem('bet_user_email') || '',
    usuario_nome: userData?.nome || localStorage.getItem('bet_user_nome') || '',
    jogo_id: jogo?.id || null,
    time_casa: jogo?.home_team || jogo?.time_casa || null,
    time_fora: jogo?.away_team || jogo?.time_fora || null,
    liga: jogo?.league_name || jogo?.liga || null,
    origem,
    url_destino: urlDestino,
    user_agent: navigator.userAgent || '',
  };
  try {
    localStorage.setItem('bet_ultimo_click_afiliado', JSON.stringify(registro));
  } catch (e) {}
  try {
    await supabase.from('cliques_afiliados').insert(registro);
  } catch (e) {
    console.error('Erro ao registrar clique afiliado:', e);
  }
  return { clickId, urlDestino };
}, [userData]);
const abrirCasaAfiliada = useCallback(async (casa, jogo = null, origem = 'comparador_odds') => {
  const { urlDestino } = await registrarCliqueAfiliado(casa, jogo, origem);
  if (!urlDestino) {
    alert(`Configure o link afiliado da casa ${casa?.nome || ''} no App.jsx.`);
    return;
  }
  window.open(urlDestino, '_blank', 'noopener,noreferrer');
}, [registrarCliqueAfiliado]);
const { jogos: jogosApiFootball, loading: loadingApiFootball, erro: erroApiFootball, atualizar: atualizarApiFootball } = useApiFootball({
  data: dataApiFootball,
  ligaId: ligaAtivaId,
  aoVivo: filterCentro === 'Ao Vivo',
});
const salvarFavCatalogo = (item) => {
const itemFinal = { ...item, id: item.id || `${item.tipo}-${item.nome}` };
setFavCatalogo(prev => {
const existe = prev.some(f => f.id === itemFinal.id);
if (existe) return prev;
const novo = [...prev, { ...itemFinal, criadoEm: new Date().toISOString() }];
localStorage.setItem('bet_favoritos_catalogo', JSON.stringify(novo));
return novo;
});
};
const removerFavCatalogo = (id) => {
setFavCatalogo(prev => {
const novo = prev.filter(f => f.id !== id);
localStorage.setItem('bet_favoritos_catalogo', JSON.stringify(novo));
return novo;
});
};
const favoritoCatalogoExiste = (item) => favCatalogo.some(f => f.id === (item.id || `${item.tipo}-${item.nome}`));
const jogos = useMemo(() => jogosApiFootball, [jogosApiFootball]);
const loading = loadingApiFootball;
const { aiOpen, setAiOpen, aiQuery, setAiQuery, aiLoading, aiMessages, handleAskAI, gerarExplicacaoIA } = useIA(API_URL, jogos, setJogoSelecionado);
useEffect(() => {
const timer = setTimeout(() => setShowSplash(false), 2000);return () => clearTimeout(timer);
}, []);
useEffect(() => {
return () => {
if (pollingPagamentoRef.current) clearInterval(pollingPagamentoRef.current);
try { cardFormMercadoPagoRef.current?.unmount?.(); } catch (e) {}
};
}, []);
useEffect(() => {
const em = localStorage.getItem('bet_sessao_ativa');
if (em) {
setUserData({ email: em, nome: localStorage.getItem('bet_user_nome') || "Lucas Montesso", is_vip: true, is_admin: em.includes('admin') });
} else if (MODO_DEMONSTRACAO) {
setUserData({ email: "lucas@vip.com", nome: "Lucas Montesso", is_vip: true, is_admin: true });
}
}, []);
const bilhetePremium = useMemo(() => {
if (!jogos.length) return { selecoes: [], oddFinal: 1 };
const validos = viewMode === 'copa' ? jogos.filter(j => isSelecao(j.home_team, j.away_team, j.league_name)) : jogos.filter(j => !isSelecao(j.home_team, j.away_team, j.league_name));
const selecoes = [...validos].filter(j => j.confianca_ia >= 80).sort((a, b) => b.confianca_ia - a.confianca_ia).slice(0, 3);
return { selecoes, oddFinal: selecoes.reduce((acc, j) => acc * (j.odd_principal || 1), 1) };
}, [jogos, viewMode]);
const jogosDemoEncerrados = useMemo(() => ([
  {
    id: 'demo-encerrado-1',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brazil',
    status: 'Finished',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    placar_casa: 2,
    placar_fora: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'Vitoria Flamengo',
    time_elapsed: 'FT',
  },
  {
    id: 'demo-encerrado-2',
    demo: true,
    league_id: 2,
    league_name: 'Champions League',
    league_country: 'World',
    status: 'Finished',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    scoreHome: 3,
    scoreAway: 2,
    placar_casa: 3,
    placar_fora: 2,
    confianca_ia: 88,
    odd_principal: 2.10,
    mercado_principal: 'Ambos marcaram',
    time_elapsed: 'FT',
  },
  {
    id: 'demo-encerrado-3',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'England',
    status: 'Finished',
    home_team: 'Liverpool',
    away_team: 'Arsenal',
    scoreHome: 1,
    scoreAway: 1,
    placar_casa: 1,
    placar_fora: 1,
    confianca_ia: 84,
    odd_principal: 1.95,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: 'FT',
  },
]), []);

const JOGOS_DEMO_ENCERRADOS_FINAL = useMemo(() => ([
  {
    id: 'encerrado-final-1',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao Serie A',
    league_country: 'Brasil',
    status: 'Finished',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    placar_casa: 2,
    placar_fora: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'Vitoria Flamengo',
    time_elapsed: 'FT'
  },
  {
    id: 'encerrado-final-2',
    demo: true,
    league_id: 2,
    league_name: 'Champions League',
    league_country: 'Europa',
    status: 'Finished',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    scoreHome: 3,
    scoreAway: 2,
    placar_casa: 3,
    placar_fora: 2,
    confianca_ia: 88,
    odd_principal: 2.10,
    mercado_principal: 'Ambos marcam',
    time_elapsed: 'FT'
  },
  {
    id: 'encerrado-final-3',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'Finished',
    home_team: 'Liverpool',
    away_team: 'Arsenal',
    scoreHome: 1,
    scoreAway: 1,
    placar_casa: 1,
    placar_fora: 1,
    confianca_ia: 84,
    odd_principal: 1.95,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: 'FT'
  }
]), []);


const JOGOS_ENCERRADOS_FIXOS_BET = useMemo(() => ([
  {
    id: 'encerrado-flamengo-palmeiras',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brasil',
    status: 'Finished',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    placar_casa: 2,
    placar_fora: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'Vitoria Flamengo',
    time_elapsed: 'FT'
  },
  {
    id: 'encerrado-real-city',
    demo: true,
    league_id: 2,
    league_name: 'Champions League',
    league_country: 'Europa',
    status: 'Finished',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    scoreHome: 3,
    scoreAway: 2,
    placar_casa: 3,
    placar_fora: 2,
    confianca_ia: 88,
    odd_principal: 2.10,
    mercado_principal: 'Ambos marcam',
    time_elapsed: 'FT'
  },
  {
    id: 'encerrado-liverpool-arsenal',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'Finished',
    home_team: 'Liverpool',
    away_team: 'Arsenal',
    scoreHome: 1,
    scoreAway: 1,
    placar_casa: 1,
    placar_fora: 1,
    confianca_ia: 84,
    odd_principal: 1.95,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: 'FT'
  }
]), []);


const jogosBaseComEncerradosBet = useMemo(() => {
  const reais = Array.isArray(jogos) ? jogos : [];
  const idsReais = new Set(reais.map((j) => String(j?.id || j?.fixture?.id || '')));

  const extras = JOGOS_ENCERRADOS_FIXOS_BET.filter((j) => {
    const id = String(j?.id || '');
    return !idsReais.has(id);
  });

  return [...reais, ...extras];
}, [jogos, JOGOS_ENCERRADOS_FIXOS_BET]);

const jFilt = useMemo(() => {
  const abaEncerrado = filterCentro === 'Encerrado';

  const listaOriginal = Array.isArray(jogos) ? jogos : [];

  const listaBase = abaEncerrado
    ? [...listaOriginal, ...jogosEncerradosFixosLucas]
    : listaOriginal;

  return listaBase.filter(j => {
    const encerrado = jogoEncerradoSeguroLucas(j);

    // REGRA PRINCIPAL
    // Inicio, Ao Vivo e Jogos: nunca mostram finalizados
    // Encerrado: mostra somente finalizados
    if (abaEncerrado) return encerrado;
    if (encerrado) return false;

    if (j.demo) {
      if (viewMode === 'copa') return false;
      if (filterCentro === 'Favoritos') return favoritos.includes(j.id);
      if (filterCentro === 'Ao Vivo') return j.status === 'Live';
      return true;
    }

    const sel = isSelecao(j.home_team, j.away_team, j.league_name);

    if (viewMode === 'jogos' && sel) return false;
    if (viewMode === 'copa' && !sel) return false;
    if (filterCentro === 'Ao Vivo') return j.status === 'Live';
    if (filterCentro === 'Favoritos') return favoritos.includes(j.id);
    if (ligaAtivaId !== null && j.league_id !== ligaAtivaId && j.league_id !== 999) return false;

    return true;
  });
}, [jogos, viewMode, filterCentro, favoritos, ligaAtivaId]);

const jGrp = useMemo(() => {
return jFilt.reduce((a, j) => {
if (!a[j.league_name]) a[j.league_name] = [];
a[j.league_name].push(j);
return a;
}, {});
}, [jFilt]);

// ===== JOGOS DEMO DAS ABAS INICIO =====
const JOGOS_DEMO_ABAS_INICIO = [
  {
    id: 'demo-brasileirao-1',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brazil',
    status: 'Not Started',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 0,
    scoreAway: 0,
    placar_casa: 0,
    placar_fora: 0,
    confianca_ia: 89,
    odd_principal: 1.82,
    mercado_principal: 'Vitoria Flamengo',
    time_elapsed: '',
  },
  {
    id: 'demo-brasileirao-2',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brazil',
    status: 'Live',
    home_team: 'Corinthians',
    away_team: 'Sao Paulo',
    scoreHome: 1,
    scoreAway: 1,
    placar_casa: 1,
    placar_fora: 1,
    confianca_ia: 86,
    odd_principal: 2.05,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: "65'",
  },
  {
    id: 'demo-champions-1',
    demo: true,
    league_id: 2,
    league_name: 'Champions League',
    league_country: 'World',
    status: 'Not Started',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    scoreHome: 0,
    scoreAway: 0,
    placar_casa: 0,
    placar_fora: 0,
    confianca_ia: 88,
    odd_principal: 2.10,
    mercado_principal: 'Ambos marcam',
    time_elapsed: '',
  },
  {
    id: 'demo-premier-1',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'England',
    status: 'Live',
    home_team: 'Liverpool',
    away_team: 'Arsenal',
    scoreHome: 2,
    scoreAway: 1,
    placar_casa: 2,
    placar_fora: 1,
    confianca_ia: 87,
    odd_principal: 1.95,
    mercado_principal: 'Liverpool ou empate',
    time_elapsed: "72'",
  },
];

function normalizarLigaAba(nome = '') {
  return String(nome || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function statusEhAoVivo(jogo) {
  const status = normalizarLigaAba(jogo?.status || jogo?.fixture?.status?.short || '');
  const tempo = String(jogo?.time_elapsed || jogo?.tempo_jogo || '').trim();

  return status.includes('live') ||
    status === '1h' ||
    status === '2h' ||
    status === 'ht' ||
    tempo.includes("'");
}


function statusEhEncerrado(jogo) {
  const status = normalizarLigaAba(jogo?.status || jogo?.status_short || jogo?.fixture?.status?.short || jogo?.fixture?.status?.long || '');
  return status.includes('finished') ||
    status.includes('finalizado') ||
    status.includes('encerrado') ||
    status === 'ft' ||
    status === 'aet' ||
    status === 'pen' ||
    status === 'match finished';
}

function ligaDoJogoId(jogo) {
  return Number(
    jogo?.league_id ||
    jogo?.liga_id ||
    jogo?.raw_api_football?.league?.id ||
    jogo?.league?.id ||
    0
  );
}

function ligaDoJogoNome(jogo) {
  return normalizarLigaAba(
    jogo?.league_name ||
    jogo?.liga ||
    jogo?.raw_api_football?.league?.name ||
    jogo?.league?.name ||
    ''
  );
}

function filtrarJogosAbaInicio(jogosOriginais = [], filterCentroAtual = 'Todos', ligaAtivaAtual = null) {
  const reais = Array.isArray(jogosOriginais) ? jogosOriginais : [];

  const idsReais = new Set(reais.map((j) => String(j.id || j.fixture_id || '')));
  const demosQueFaltam = JOGOS_DEMO_ABAS_INICIO.filter((j) => !idsReais.has(String(j.id)));

  const base = [...reais, ...demosQueFaltam];

  const filtro = String(filterCentroAtual || 'Todos');

  if (filtro === 'Ao Vivo') {
    return base.filter(statusEhAoVivo);
  }

  const ligaId = Number(ligaAtivaAtual || 0);

  if (ligaId === 71) {
    return base.filter((j) => {
      const nome = ligaDoJogoNome(j);
      return ligaDoJogoId(j) === 71 || nome.includes('brasileirao') || nome.includes('serie a');
    });
  }

  if (ligaId === 2) {
    return base.filter((j) => {
      const nome = ligaDoJogoNome(j);
      return ligaDoJogoId(j) === 2 || nome.includes('champions');
    });
  }

  if (ligaId === 39) {
    return base.filter((j) => {
      const nome = ligaDoJogoNome(j);
      return ligaDoJogoId(j) === 39 || nome.includes('premier');
    });
  }

  return base;
}
// ===== FIM JOGOS DEMO DAS ABAS INICIO =====

const RenderizarListaJogos = () => {
if (loading) return (<div className="text-center text-slate-500 py-10">
      {/* VOLTAR_FAVORITOS_HEADER */}
      <div className="flex items-center gap-3 mb-3 px-1">
        

        <div className="min-w-0">
          <div className="text-white text-sm font-black tracking-wide">Favoritos</div>
          <div className="text-slate-400 text-[10px] font-bold">Voltar para a tela anterior</div>
        </div>
      </div>Buscando jogos na API-Football...</div>);
if (Object.keys(jGrp).length === 0) {
return (
<div className="text-center text-slate-500 py-10 font-bold">
<div>Nenhum jogo retornado pela API-Football com estes filtros.</div>

        

{erroApiFootball && (<div className="mt-2 text-[11px] text-red-400 font-bold">{erroApiFootball}</div>)}

</header>
<CalendarioSemanaJogos viewMode={viewMode} />
<ModoDemoBadge modoDemo={MODO_DEMONSTRACAO} setViewMode={setViewMode} />
<SemConexaoPro setViewMode={setViewMode} />
{menuAtivo === 'assinar pro' && (
<AssinaturaPro
  form={form}
  setForm={setForm}
  metodoPagamento={metodoPagamento}
  setMetodoPagamento={setMetodoPagamento}
  pagamentoStatus={pagamentoStatus}
  setPagamentoStatus={setPagamentoStatus}
  planoPro={PLANO_PRO}
  iniciarPagamentoPix={iniciarPagamentoPix}
  limparCpf={limparCpf}
  onVoltar={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setJogoSelecionado(null); }}
/>
)}
{menuAtivo !== 'assinar pro' && !jogoSelecionado && (<div className="animate-fade-in pt-4 w-full">
{viewMode === 'copa' && (
  <div className="px-4 w-full">
    <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden">
      <Globe className="absolute -right-4 -top-4 w-32 h-32 text-yellow-500/20" />

      <h2 className="text-2xl font-black text-white flex items-center gap-2 relative z-10">
        <Trophy className="w-6 h-6 text-yellow-300" />
        Jogos
      </h2>

      <p className="text-yellow-200 text-xs mt-1 relative z-10 font-bold">
        Todos os jogos do dia, ao vivo e finalizados
      </p>
    </div>

    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4 w-full">
      <button
        onClick={() => {
          setFilterCentro('Todos');
          setLigaAtivaId(null);
        }}
        className={`px-5 py-2.5 rounded-full text-xs font-black border ${filterCentro === 'Todos' ? 'bg-white text-black' : 'bg-transparent border-slate-700 text-slate-400'}`}
      >
        Todos
      </button>

      <button
        onClick={() => {
          setFilterCentro('Ao Vivo');
          setLigaAtivaId(null);
        }}
        className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro === 'Ao Vivo' ? 'bg-white text-black border-white' : 'bg-transparent border-slate-700 text-slate-400'}`}
      >
        Ao Vivo
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
      </button>
    </div>

    <RenderizarListaJogos />

    <div className="px-4 mt-10 mb-10 text-center">
      <LegalCompliance modo="botao" />
    </div>
  </div>
)}
{(viewMode === 'jogos' || viewMode === 'encerrado') && (
<>
<div className="px-4 w-full">

<JogosPorPaisContinente
  jogos={jFilt}
  favoritos={favoritos}
  onToggleFavorito={toggleFavorito}
  onAbrirJogo={(j) => {
    if (j.demo || String(j.id || '').startsWith('demo-home')) return setJogoSelecionado(j);
    if (!userData?.is_vip) return setMenuAtivo('assinar pro');
    setJogoSelecionado(j);
  }}
/>

<RenderizarListaJogos />




</div><div className="px-4 mt-10 mb-10 text-center"><LegalCompliance modo="botao" /></div></>)}
{viewMode === 'perfil' && (
<>
<PerfilProCompleto
  userData={userData}
  setViewMode={setViewMode}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
/>
<div className="px-4 mt-4 pb-28 w-full">
  {/* ADMIN_DENTRO_PERFIL */}
  <button
    type="button"
    onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('admin'); setJogoSelecionado(null); }}
    className="w-full bg-gradient-to-br from-yellow-500/20 via-[#0f172a] to-green-500/10 border border-yellow-500/30 rounded-3xl p-5 text-left shadow-lg active:scale-[0.99]"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-1">Aba Admin</div>
        <div className="text-xl font-black text-white">Painel administrativo</div>
        <div className="text-[11px] font-bold text-slate-400 mt-1">Inscritos, lucros, pagamentos, conversao e status do app.</div>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-yellow-300">
        <Zap className="w-6 h-6" />
      </div>
    </div>
  </button>
</div>
</>
)}

{viewMode === 'radar' && (
<CentralValorIA
  jogos={jogos}
  userData={userData}
  setViewMode={setViewMode}
  setJogoSelecionado={setJogoSelecionado}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
/>
)}
{viewMode === 'educacao' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="Educacao" onBack={() => setViewMode('perfil')} /><EducacaoBetAnalytics /></div>)}
{viewMode === 'historico' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title=" Historico de Assertividade" onBack={() => setViewMode('perfil')} /><HistoricoAssertividade /></div>)}
{viewMode === 'como-ia' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title=" Como a IA calcula" onBack={() => setViewMode('radar')} /><ComoIACalcula /></div>)}
{viewMode === 'Ranking' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title=" Ranking de Oportunidades" onBack={() => setViewMode('radar')} /><RankingOportunidades jogos={jogos} onSelecionarJogo={(j) => setJogoSelecionado(j)} /></div>)}
{viewMode === 'Pesquisa' && (<div className="px-4 animate-fade-in pb-28 w-full">
<HeaderNav title={'\u{1F50E} Pesquisa'} onBack={() => setViewMode('jogos')} />
<div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 border border-blue-300/20 rounded-[30px] p-5 mb-5 shadow-2xl overflow-hidden">
<div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
<div className="absolute -left-14 bottom-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
<div className="relative z-10">
<div className="flex items-center justify-between mb-4">
<div>
<h2 className="text-xl font-black text-white uppercase">CENTRAL DE PESQUISA</h2>
<p className="text-[11px] text-blue-100 font-bold mt-1">Times, Jogadores, Rankings e competicoes em um so lugar.</p>
</div>
<div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center"><Search className="w-6 h-6 text-white" /></div>
</div>
<div className="grid grid-cols-2 gap-2">
<div className="bg-white/15 border border-white/15 rounded-2xl p-3"><div className="text-lg font-black text-white">{todosItensPesquisa.length}</div><div className="text-[8px] text-blue-100 font-black uppercase">Itens Catalogados</div></div>
<div className="bg-white/15 border border-white/15 rounded-2xl p-3"><div className="text-lg font-black text-white">{favCatalogo.length}</div><div className="text-[8px] text-blue-100 font-black uppercase">Meus Favoritos</div></div>
</div>
</div>
</div>
<div className="sticky top-2 z-30 mb-4 bg-[#050816]/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-2.5 shadow-2xl">
<div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-slate-900 shadow-inner mb-2.5">
<Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
<input value={buscaPesquisa} onChange={(e) => setBuscaPesquisa(e.target.value)} placeholder="Pesquisar time, jogador ou liga..." className="flex-1 outline-none text-xs font-black placeholder:text-slate-400" />
{buscaPesquisa && <button onClick={() => setBuscaPesquisa('')} className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-black flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>}
</div>
{/* --- PILULAS DAS SUB-ABAS OTMIZADAS PARA MOBILE (MAIS FINAS E NATIVAS) --- */}
<div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5 select-none" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
{abasPesquisa.map(a => (
<button
key={a.id}
onClick={() => setAbaPesquisaAtiva(a.id)}
className={`px-3.5 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap border transition-all shrink-0 active:scale-95 ${
abaPesquisaAtiva === a.id
? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.35)]'
: 'bg-[#0f172a] text-slate-400 border-white/10 hover:border-white/20'
}`}
>
{a.label}
</button>
))}
</div>
{/* --- FIM DAS ABAS --- */}
</div>
{favCatalogo.length > 0 && (<div className="mb-5 bg-[#0f172a] border border-yellow-500/20 rounded-2xl p-3.5">
<div className="flex items-center justify-between mb-2.5">
<div><h3 className="text-xs font-black text-white uppercase">Favoritos salvos</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Toque no card novamente para remover.</p></div>
<button onClick={() => setViewMode('favoritos')} className="text-[9px] text-yellow-400 font-black uppercase">Abrir</button>
</div>
<div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
{favCatalogo.slice(0, 10).map(item => <div key={`fav-${item.id}`} className="min-w-[90px] w-[90px] shrink-0"><PesquisaCard item={item} /></div>)}
</div>
</div>)}
{/* --- SISTEMA MOVEL DE CARDS COMPACTOS EM 3 COLUNAS --- */}
<div className="mb-6">
{abaPesquisaAtiva === 'Equipes' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase"> Melhores Equipes e Selecoes</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Clique para favoritar no seu radar</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_Equipes.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`eq-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'Jogadores' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase"> Atletas em Destaque</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Monitore assistencias, gols e cartoes</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_Jogadores.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`jog-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'Ranking' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase">Classificacoes e Rankings</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Acompanhe pontuacao mundial</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_Ranking.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`rank-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'principais' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase"> Ligas Principais</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Os campeonatos mais disputados do mundo</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_COMPETICOES.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`comp-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'todas' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase"> Catalogo Completo de Ligas</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Abra o pais e favorite as divisoes desejadas</p></div>
<div className="flex flex-col gap-2.5">
{TODAS_COMPETICOES.filter(c => !buscaPesquisa.trim() || normalizarTexto(`${c.pais} ${c.ligas.join(' ')}`).includes(normalizarTexto(buscaPesquisa))).map(c => (
<div key={c.pais} className="bg-[#0f172a] text-white rounded-2xl shadow-lg overflow-hidden border border-white/10">
<button onClick={() => setCategoriaAberta(categoriaAberta === c.pais ? '' : c.pais)} className="w-full flex items-center gap-3 py-3 px-3.5 text-left active:scale-[0.99]">
<span className="w-9 h-9 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-center text-lg">{c.emoji}</span>
<span className="flex-1"><span className="block text-xs font-black">{c.pais}</span><span className="block text-[9px] text-slate-500 font-bold mt-0.5">{c.qtd} competicoes disponiveis</span></span>
<ChevronRight className={`w-4 h-4 text-slate-500 transition ${categoriaAberta === c.pais ? 'rotate-90 text-blue-400' : ''}`} />
</button>
{categoriaAberta === c.pais && (
<div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
{c.ligas.map(l => {
const item = { tipo: 'competicao', nome: l, sub: c.pais, emoji: c.emoji };
const salvo = favoritoCatalogoExiste(item);
return (
<button key={l} onClick={() => salvarOuRemoverPesquisa(item)} className={`rounded-xl py-2.5 px-3 text-left text-[11px] font-black flex justify-between items-center border active:scale-95 ${salvo ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : 'bg-[#050816] border-white/10 text-slate-300'}`}>
<span className="truncate pr-1">{l}</span>
{salvo ? <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" /> : <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
</button>
);
})}
</div>
)}
</div>
))}
</div>
</div>
)}
</div>
{/* --- FIM DA RENDERIZACAO POR ABAS --- */}
</div>)}
{viewMode === 'favoritos' && (
<FavoritosPro
  setViewMode={setViewMode}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
/>
)}

{viewMode === 'banca-pro' && (<div className="px-4 animate-fade-in pb-28 w-full"><HeaderNav title="Gestao de Banca PRO" onBack={() => setViewMode('radar')} /><GestaoBancaPro /></div>)}
{viewMode === 'alertas-ia' && (<div className="px-4 animate-fade-in pb-28 w-full"><HeaderNav title="Alertas IA" onBack={() => setViewMode('radar')} /><AlertasIAPro jogos={jogos} setViewMode={setViewMode} setAiOpen={setAiOpen} setAiQuery={setAiQuery} /></div>)}

{viewMode === 'vip-pro' && (
<VipPro
  userData={userData}
  setViewMode={setViewMode}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
/>
)}

{viewMode === 'modo-demo' && (
<ModoDemoPro setViewMode={setViewMode} />
)}


{viewMode === 'performance-ia' && (
<PerformanceIAPro
  setViewMode={setViewMode}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
/>
)}
{viewMode === 'casas-parceiras' && (
<CasasParceirasPro setViewMode={setViewMode} />
)}
{viewMode === 'sem-conexao' && (
<SemConexaoPro setViewMode={setViewMode} telaCompleta={true} />
)}

{viewMode === 'config' && (
<ConfiguracoesPro
  userData={userData}
  setViewMode={setViewMode}
  solicitarPermissaoNotificacao={solicitarPermissaoNotificacaoApp}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
  modoDemo={MODO_DEMONSTRACAO}
/>
)}

{viewMode === 'termos' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title=" Termos e Politicas" onBack={() => setViewMode('jogos')} /><LegalCompliance /></div>)}
{viewMode === 'admin' && (
<AdminResumoPro setViewMode={setViewMode} userData={userData} jogos={jogos} />
)}
</div>)}
{jogoSelecionado && menuAtivo !== 'assinar pro' && (
<div className="fixed inset-0 z-[999] bg-[#050816] text-white overflow-y-auto pb-28 animate-fade-in">
<Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs">A carregar painel do jogo...</div>}>
<PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly}  setAiOpen={setAiOpen}  setAiQuery={setAiQuery} />
</Suspense>
<div className="px-4 pb-8 space-y-4">
</div>
</div>
)}



{null}


<AnimatePresence>
{null}
</AnimatePresence>

<div className="px-4 mt-6">
  
</div>

<nav className="fixed bottom-0 left-0 right-0 bg-[#050816] border-t border-white/5 z-50 flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
<div className="flex justify-around items-center h-16 pt-2 w-full">
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Todos'); setLigaAtivaId(null); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'jogos' && filterCentro === 'Todos' ? 'text-blue-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Home className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Inicio</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Ao Vivo'); setLigaAtivaId(null); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${filterCentro === 'Ao Vivo' ? 'text-red-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Radio className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Ao Vivo</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Encerrado'); setLigaAtivaId(null); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${filterCentro === 'Encerrado' ? 'text-green-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><CheckCircle2 className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Encerrado</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('copa'); setFilterCentro('Todos'); setLigaAtivaId(null); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'copa' ? 'text-yellow-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Trophy className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Jogos</span></button>
</div>
</nav>
</div>
);
}









