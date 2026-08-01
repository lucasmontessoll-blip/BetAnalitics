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


function ehJogoEncerradoBet(jogo) {
  const texto = [
    jogo?.status,
    jogo?.status_short,
    jogo?.fixture?.status?.short,
    jogo?.fixture?.status?.long,
    jogo?.time_elapsed,
    jogo?.tempo_jogo
  ].filter(Boolean).join(' ').toLowerCase().trim();

  return texto === 'ft' ||
    texto === 'aet' ||
    texto === 'pen' ||
    texto.includes('finished') ||
    texto.includes('match finished') ||
    texto.includes('finalizado') ||
    texto.includes('encerrado');
}


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

const jogosTelaPrincipal = useMemo(() => {
  const abaEncerrado = filterCentro === 'Encerrado';

  return jogosBaseComEncerradosBet.filter((j) => {
    const encerrado = ehJogoEncerradoBet(j);

    if (abaEncerrado) return encerrado;

    return !encerrado;
  });
}, [jogosBaseComEncerradosBet, filterCentro]);

const jFilt = useMemo(() => {
  return jogosTelaPrincipal.filter(j => {
    if (filterCentro === 'Encerrado') return ehJogoEncerradoBet(j);

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
}, [jogosTelaPrincipal, viewMode, filterCentro, favoritos, ligaAtivaId]);

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


function betStatusEncerradoFinal(jogo) {
  const texto = [
    jogo?.status,
    jogo?.status_short,
    jogo?.fixture?.status?.short,
    jogo?.fixture?.status?.long,
    jogo?.time_elapsed,
    jogo?.tempo_jogo
  ].filter(Boolean).join(' ').toLowerCase();

  return texto.includes('finished') ||
    texto.includes('finalizado') ||
    texto.includes('encerrado') ||
    texto === 'ft' ||
    texto.includes(' ft') ||
    texto.includes('match finished') ||
    texto.includes('aet') ||
    texto.includes('pen');
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
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('radar'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'radar' ? 'text-blue-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Target className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Radar IA</span></button>
</div>
</nav>
</div>
);
}









