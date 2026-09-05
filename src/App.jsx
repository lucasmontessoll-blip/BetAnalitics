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
import AssinaturaPro from '@bet-assinatura';
import MercadosIAResumo from './components/MercadosIAResumo.jsx';
import OnboardingPro from './components/OnboardingPro.jsx';
import CentralValorIA from './components/CentralValorIA.jsx';
import { gerarClickIdAfiliado, montarUrlAfiliado } from './config/casasAfiliadas.js';
import ModoDemoBadge from './components/ModoDemoBadge.jsx';
import ModoDemoPro from './components/ModoDemoPro.jsx';
import SemConexaoPro from './components/SemConexaoPro.jsx';
import SplashLogoAnimado from './components/SplashLogoAnimado.jsx';
import MobileBackAndCleanUI from './components/MobileBackAndCleanUI.jsx';
import CalendarioSemanaJogos from './components/CalendarioSemanaJogos.jsx';
import RemoverSomentePesquisaBottom from './components/RemoverSomentePesquisaBottom.jsx';
import MenuRodape from './components/MenuRodape.jsx';
import CardJogo from './components/CardJogo.jsx';
import TelaEncerrados from './components/TelaEncerrados.jsx';
import TelaAoVivo from './components/TelaAoVivo.jsx';
import TelaPreJogo from './components/TelaPreJogo.jsx';
import TelaInicial from './components/TelaInicial.jsx';
import HeaderApp from './components/HeaderApp.jsx';
import AdminResumoPro from './components/AdminResumoPro.jsx';
import AtalhoAdminPerfil from './components/AtalhoAdminPerfil.jsx';
import RoteadorProfissional from './components/RoteadorProfissional.jsx';
import { registrarPagamentoGerado, registrarPagamentoAprovado, atualizarPagamentoLocal } from './utils/pagamentosLocal.js';
import {
  encerrarTentativaPagamento,
  obterTentativaPagamento
} from './utils/paymentIdempotency.js';
import { temAcessoPro, carregarUsuarioSessaoPro, usuarioDemoFree, rotaExigePro } from './utils/acessoPro.js';
import { apiUrl } from './utils/apiBase.js';
import { sessaoAtual, perfilValidadoServidor } from './services/authClient.js';
import {
  ativarPushNotifications,
  desativarPushNotifications,
  sincronizarPushAutorizado,
  enviarPushTeste,
} from './services/pushNotifications.js';
import { PerformanceIAPro, CasasParceirasPro, PerfilProCompleto, FavoritosPro, VipPro, ConfiguracoesPro, GestaoBancaPro, AlertasIAPro, HistoricoIAPro, TelaRadarIA } from './lazyViews.js';
const DISTRIBUICAO_PLAY_STORE =
  import.meta.env.MODE === 'play';

/* BET_ETAPA_35B_MODO_PRODUCAO_INICIO */
const MODO_DEMONSTRACAO =
  String(import.meta.env.VITE_MODO_DEMO || 'false')
    .trim()
    .toLowerCase() === 'true';
/* BET_ETAPA_35B_MODO_PRODUCAO_FIM */
const API_URL = String(import.meta.env.VITE_API_URL || '').trim();
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
/* BET_ETAPA_35B_MP_PUBLICA_INICIO */
const MP_PUBLIC_KEY = String(
  import.meta.env.VITE_MP_PUBLIC_KEY || ''
).trim();

if (!DISTRIBUICAO_PLAY_STORE && MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
} else if (import.meta.env.DEV) {
  console.warn(
    'VITE_MP_PUBLIC_KEY não configurada. O checkout ficará indisponível.'
  );
}
/* BET_ETAPA_35B_MP_PUBLICA_FIM */
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
  if (DISTRIBUICAO_PLAY_STORE) return { clickId: '', urlDestino: '' };
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
  if (DISTRIBUICAO_PLAY_STORE) return;
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
const timer = setTimeout(() => setShowSplash(false), 2000);
return () => clearTimeout(timer);
}, []);
useEffect(() => {
return () => {
if (pollingPagamentoRef.current) clearInterval(pollingPagamentoRef.current);
try { cardFormMercadoPagoRef.current?.unmount?.(); } catch (e) {}
};
}, []);
useEffect(() => {
  // bet-pro-real-sessao-v2
  const usuarioSessao = carregarUsuarioSessaoPro();

  if (usuarioSessao) {
    setUserData(usuarioSessao);
  } else if (MODO_DEMONSTRACAO) {
    setUserData(usuarioDemoFree());
  }
  // fim-bet-pro-real-sessao-v2
}, []);

const proAtivo = temAcessoPro(userData);

React.useEffect(() => {
  // bet-pro-real-bloqueio-v2
  if (proAtivo) return;
  if (String(menuAtivo || '').toLowerCase() === 'assinar pro') return;

  const jogoEhDemo = Boolean(jogoSelecionado); // Cards e abas do jogo podem ser visualizados por qualquer usuario.

  if (jogoSelecionado && !jogoEhDemo) {
    setJogoSelecionado(null);
    setMenuAtivo('assinar pro');
    setPagamentoStatus((s) => ({
      ...s,
      loading: false,
      erro: '',
      sucesso: 'Somente VIP. Para liberar esta area, assine o PRO.'
    }));
    return;
  }

  if (rotaExigePro(viewMode)) {
    setJogoSelecionado(null);
    setMenuAtivo('assinar pro');
    setPagamentoStatus((s) => ({
      ...s,
      loading: false,
      erro: '',
      sucesso: 'Somente VIP. Para liberar esta area, assine o PRO.'
    }));
  }
  // fim-bet-pro-real-bloqueio-v2
}, [viewMode, menuAtivo, jogoSelecionado, proAtivo]);
const bilhetePremium = useMemo(() => {
if (!jogos.length) return { selecoes: [], oddFinal: 1 };
const validos = viewMode === 'copa' ? jogos.filter(j => isSelecao(j.home_team, j.away_team, j.league_name)) : jogos.filter(j => !isSelecao(j.home_team, j.away_team, j.league_name));
const selecoes = [...validos].filter(j => j.confianca_ia >= 80).sort((a, b) => b.confianca_ia - a.confianca_ia).slice(0, 3);
return { selecoes, oddFinal: selecoes.reduce((acc, j) => acc * (j.odd_principal || 1), 1) };
}, [jogos, viewMode]);
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
  if (!MODO_DEMONSTRACAO) {
    return reais;
  }
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

  const statusNormalizado = (jogo = {}) =>
    String(jogo.status ?? jogo.fixture?.status?.short ?? "").toLowerCase();

  const jogoAoVivo = (jogo = {}) => {
    const status = statusNormalizado(jogo);
    const tempo = String(jogo.time_elapsed ?? jogo.fixture?.status?.elapsed ?? "").toLowerCase();
    return (
      status === "live" ||
      status === "1h" ||
      status === "2h" ||
      status === "ht" ||
      status.includes("in play") ||
      status.includes("intervalo") ||
      /\d{1,3}'/.test(tempo)
    );
  };

  const jogoFinalizado = (jogo = {}) => {
    const status = statusNormalizado(jogo);
    return (
      status === "ft" ||
      status === "aet" ||
      status === "pen" ||
      status.includes("finished") ||
      status.includes("finalizado") ||
      status.includes("encerrado")
    );
  };

  const minutoAoVivo = (jogo = {}) => {
    const valor = jogo.time_elapsed ?? jogo.fixture?.status?.elapsed;
    const texto = String(valor ?? "").trim();
    if (!texto) return "LIVE";
    if (/intervalo|half.?time|^ht$/i.test(texto)) return "INT";
    const minuto = texto.match(/\d{1,3}/)?.[0];
    return minuto ? `${minuto}'` : texto.toUpperCase();
  };

  const horarioJogo = (jogo = {}) => {
    if (jogoAoVivo(jogo)) return minutoAoVivo(jogo);
    if (jogoFinalizado(jogo)) return "FT";

    const origem =
      jogo.starting_at ??
      jogo.date ??
      jogo.fixture?.date ??
      jogo.horario ??
      jogo.time;

    if (!origem) return "--:--";

    const data = new Date(origem);
    if (!Number.isNaN(data.getTime())) {
      return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const horarioEncontrado = String(origem).match(/\b(\d{1,2}):(\d{2})\b/);
    return horarioEncontrado
      ? `${horarioEncontrado[1].padStart(2, "0")}:${horarioEncontrado[2]}`
      : "--:--";
  };

  const ordemStatus = (jogo) => {
    if (jogoAoVivo(jogo)) return 0;
    if (jogoFinalizado(jogo)) return 2;
    return 1;
  };

  let jFilt = jogos.filter((j) => {
    const sel = isSelecao(j.home_team, j.away_team, j.league_name);
    if (viewMode === "jogos" && sel) return false;
    if (viewMode === "copa" && !sel) return false;
    if (filterCentro === "Ao Vivo") return jogoAoVivo(j);
    if (filterCentro === "Favoritos") return favoritos.includes(j.id);
    if (
      ligaAtivaId !== null &&
      j.league_id !== ligaAtivaId &&
      j.league_id !== 999
    )
      return false;
    return true;
  });

  jFilt = [...jFilt].sort((a, b) => {
    const porStatus = ordemStatus(a) - ordemStatus(b);
    if (porStatus !== 0) return porStatus;

    const dataA = new Date(a.starting_at ?? a.date ?? a.fixture?.date ?? 0).getTime();
    const dataB = new Date(b.starting_at ?? b.date ?? b.fixture?.date ?? 0).getTime();
    const valorA = Number.isNaN(dataA) ? Number.MAX_SAFE_INTEGER : dataA;
    const valorB = Number.isNaN(dataB) ? Number.MAX_SAFE_INTEGER : dataB;
    return valorA - valorB;
  });

  const jGrp = jFilt.reduce((grupos, jogo) => {
    const nomeLiga = jogo.league_name || jogo.league?.name || "Outros jogos";
    if (!grupos[nomeLiga]) grupos[nomeLiga] = [];
    grupos[nomeLiga].push(jogo);
    return grupos;
  }, {});

  const RenderizarListaJogos = () => {
    if (loading) {
      return (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Buscando todos os jogos...
          </p>
        </div>
      );
    }

    if (Object.keys(jGrp).length === 0) {
      return (
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] px-5 py-12 text-center">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm font-black text-slate-300">
            Nenhum jogo encontrado
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            Troque o filtro ou tente novamente em alguns instantes.
          </p>
        </div>
      );
    }

    const totalAoVivo = jFilt.filter(jogoAoVivo).length;

    return (
      <div className="space-y-5 pb-3">
        <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
          <div>
            <p className="text-sm font-black text-white">Todos os jogos</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {jFilt.length} {jFilt.length === 1 ? "partida encontrada" : "partidas encontradas"}
            </p>
          </div>
          {totalAoVivo > 0 ? (
            <div className="flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-black uppercase text-red-300">
                {totalAoVivo} ao vivo
              </span>
            </div>
          ) : null}
        </div>

        {Object.entries(jGrp).map(([leagueName, matches]) => {
          const primeiraPartida = matches[0] || {};
          const logoLiga =
            primeiraPartida.league_logo ||
            primeiraPartida.league_image ||
            primeiraPartida.logo_liga ||
            primeiraPartida.league?.logo;
          const paisLiga =
            primeiraPartida.country?.name ||
            (typeof primeiraPartida.country === "string"
              ? primeiraPartida.country
              : null) ||
            primeiraPartida.country_name ||
            primeiraPartida.league_country ||
            primeiraPartida.area?.name ||
            "Mundo";
          const quantidadeAoVivo = matches.filter(jogoAoVivo).length;

          return (
            <section key={leagueName} className="w-full">
              <div className="mb-2 flex items-center justify-between px-1.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                    {logoLiga ? (
                      <img
                        src={logoLiga}
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <Trophy className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-black text-slate-100">
                      {leagueName}
                    </h3>
                    <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      🌐 {paisLiga}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {quantidadeAoVivo > 0 ? (
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[8px] font-black uppercase text-amber-300">
                      {quantidadeAoVivo} live
                    </span>
                  ) : null}
                  <span className="text-[9px] font-black text-slate-600">
                    {matches.length} {matches.length === 1 ? "jogo" : "jogos"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {matches.map((j) => {
                  const aoVivo = jogoAoVivo(j);
                  const encerrado = jogoFinalizado(j);
                  const placarCasa =
                    j.scoreHome ?? j.home_score ?? j.goals?.home ?? 0;
                  const placarFora =
                    j.scoreAway ?? j.away_score ?? j.goals?.away ?? 0;
                  const confianca = Number(j.confianca_ia ?? j.confiancaIA ?? 0);
                  const odd = Number(j.odd_principal ?? j.odd ?? 0);

                  return (
                    <motion.div
                      layout
                      key={j.id}
                      whileTap={{ scale: 0.992 }}
                      onClick={() => {
                        setJogoSelecionado(j);
                      }}
                      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                        aoVivo
                          ? "border-amber-400/45 bg-gradient-to-r from-amber-500/10 via-[#151515] to-[#0d0f12] shadow-[inset_4px_0_0_#f59e0b,0_0_24px_rgba(245,158,11,0.12)]"
                          : encerrado
                            ? "border-white/[0.05] bg-[#0d1014]/75 opacity-80 hover:opacity-100"
                            : "border-white/[0.07] bg-[#111419] shadow-lg shadow-black/10 hover:border-blue-500/35 hover:bg-[#141820]"
                      }`}
                    >
                      {aoVivo ? (
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(245,158,11,0.16),transparent_38%)]" />
                      ) : null}

                      <div className="relative grid min-h-[78px] grid-cols-[58px_minmax(0,1fr)_32px_34px] items-center gap-2 px-2.5 py-2.5 sm:grid-cols-[66px_minmax(0,1fr)_38px_38px] sm:px-3">
                        <div
                          className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl border px-1.5 text-center ${
                            aoVivo
                              ? "border-amber-400/25 bg-amber-500/10"
                              : "border-white/[0.05] bg-black/20"
                          }`}
                        >
                          {aoVivo ? (
                            <>
                              <div className="mb-1 flex items-center gap-1">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                                </span>
                                <span className="text-[7px] font-black uppercase tracking-wide text-amber-300">
                                  Ao vivo
                                </span>
                              </div>
                              <span className="text-sm font-black leading-none text-amber-100">
                                {minutoAoVivo(j)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-black text-slate-200">
                                {horarioJogo(j)}
                              </span>
                              <span className="mt-1 text-[7px] font-black uppercase tracking-wider text-slate-600">
                                {encerrado ? "Encerrado" : "Agendado"}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2 border-b border-white/[0.045] pb-1.5">
                            <img
                              src={j.home_image}
                              alt={j.home_team || "Mandante"}
                              className="h-5 w-5 flex-shrink-0 object-contain"
                            />
                            <span className="min-w-0 flex-1 truncate text-[11px] font-black text-slate-100 sm:text-xs">
                              {j.home_team}
                            </span>
                          </div>
                          <div className="flex min-w-0 items-center gap-2 pt-1.5">
                            <img
                              src={j.away_image}
                              alt={j.away_team || "Visitante"}
                              className="h-5 w-5 flex-shrink-0 object-contain"
                            />
                            <span className="min-w-0 flex-1 truncate text-[11px] font-black text-slate-100 sm:text-xs">
                              {j.away_team}
                            </span>
                          </div>

                          {(confianca > 0 || odd > 0) && (
                            <div className="mt-2 flex items-center gap-1.5">
                              {confianca > 0 ? (
                                <span className="rounded-md border border-blue-500/15 bg-blue-500/10 px-1.5 py-0.5 text-[7px] font-black uppercase text-blue-300">
                                  IA {Math.round(confianca)}%
                                </span>
                              ) : null}
                              {odd > 0 ? (
                                <span className="rounded-md border border-emerald-500/15 bg-emerald-500/10 px-1.5 py-0.5 text-[7px] font-black uppercase text-emerald-300">
                                  Odd {odd.toFixed(2)}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {aoVivo || encerrado ? (
                            <>
                              <span
                                className={`flex h-6 min-w-6 items-center justify-center rounded-lg px-1 text-xs font-black ${
                                  aoVivo
                                    ? "bg-black/55 text-white shadow-inner"
                                    : "bg-black/25 text-slate-400"
                                }`}
                              >
                                {placarCasa}
                              </span>
                              <span
                                className={`flex h-6 min-w-6 items-center justify-center rounded-lg px-1 text-xs font-black ${
                                  aoVivo
                                    ? "bg-black/55 text-white shadow-inner"
                                    : "bg-black/25 text-slate-400"
                                }`}
                              >
                                {placarFora}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-black text-slate-700">—</span>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label="Favoritar jogo"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorito(e, j.id);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/[0.04] hover:text-yellow-300"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              favoritos.includes(j.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }`}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  };const HeaderNav = ({ title, onBack }) => (<div className="flex items-center gap-3 mb-6"><h2 className="text-xl font-black">{title}</h2></div>);
const todosItensPesquisa = useMemo(() => [...BUSCA_Equipes, ...BUSCA_Jogadores, ...BUSCA_Ranking, ...BUSCA_COMPETICOES, ...TODAS_COMPETICOES.flatMap(c => c.ligas.map(l => ({ tipo: 'competicao', nome: l, sub: c.pais, emoji: c.emoji })))], []);
const textoTipoPesquisa = (tipo) => tipo === 'time' ? 'Time' : tipo === 'atleta' ? 'Jogador' : tipo === 'competicao' ? 'Liga' : tipo === 'Ranking' ? 'Rank' : 'Item';
const salvarOuRemoverPesquisa = (item) => { const id = item.id || `${item.tipo}-${item.nome}`; if (favoritoCatalogoExiste(item)) { removerFavCatalogo(id); return; } salvarFavCatalogo(item); };
const PesquisaCard = ({ item }) => {
const salvo = favoritoCatalogoExiste(item);
return (
<button
onClick={() => salvarOuRemoverPesquisa(item)}
className="min-h-[74px] bg-gradient-to-br from-white to-slate-100 text-slate-950 rounded-xl shadow-md border border-white/80 flex flex-col items-center justify-center p-2 active:scale-95 transition relative overflow-hidden w-full"
style={{ touchAction: 'manipulation' }}
>
<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"></div>
<div className="absolute top-1.5 right-1.5 text-yellow-500">
{salvo ? <Star className="w-3.5 h-3.5 fill-yellow-400" /> : <Plus className="w-3.5 h-3.5 text-slate-300" />}
</div>
<div className="text-2xl mb-1 mt-0.5 leading-none">{item.emoji}</div>
<div className="text-[11px] font-black leading-tight line-clamp-1 text-center w-full px-1">{item.nome}</div>
<div className="text-[8px] font-bold uppercase text-slate-400 mt-0.5 tracking-wider">{textoTipoPesquisa(item.tipo)}</div>
</button>
);
};
const FavVazio = ({ tipo }) => (<div className="min-h-[360px] flex flex-col items-center justify-center text-center px-6"><h3 className="text-base font-black text-white mb-2">E hora de adicionar alguns Favoritos</h3><p className="text-xs text-slate-400 font-semibold mb-6">Os {tipo} favoritos serao exibidos aqui para acesso rapido.</p><button onClick={() => setViewMode('Pesquisa')} className="w-28 h-24 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center text-blue-400 font-black gap-2 active:scale-95"><div className="w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center"><Plus className="w-5 h-5" /></div><span className="text-xs">Adicionar</span></button></div>);
const FavCard = ({ item }) => (<div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4 mb-3 flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-[#050816] flex items-center justify-center text-xl border border-white/10">{item.emoji}</div><div className="flex-1 min-w-0"><div className="text-sm font-black text-white truncate">{item.nome || item.titulo}</div><div className="text-[10px] text-slate-500 font-bold uppercase">{item.sub || item.tipo}</div></div><button onClick={() => removerFavCatalogo(item.id)} className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">Remover</button></div>);
const solicitarPermissaoNotificacaoApp = async () => {
  return ativarPushNotifications();
};

const desativarNotificacaoApp = async () => {
  return desativarPushNotifications();
};

const testarNotificacaoApp = async () => {
  return enviarPushTeste();
};

useEffect(() => {
  void sincronizarPushAutorizado()
    .catch((e) => {
      console.warn(
        '[Push sync autorizado]',
        e
      );
    });
}, [userData?.email]);

const limparCpf = (valor = '') => String(valor).replace(/\D/g, '');
const emailValido = (valor = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
const validarContaObrigatoria = () => {
const nome = String(form?.nome || '').trim();
const email = String(form?.email || '').trim().toLowerCase();
const cpf = limparCpf(form?.cpf || '');
const senha = String(form?.senha || '').trim();
const nascimento = String(form?.nascimento || '').trim();
if (!nome || nome.length < 3) {
setPagamentoStatus(s => ({ ...s, erro: 'Informe seu nome completo antes de assinar.', sucesso: '' }));
return null;
}
if (!emailValido(email)) {
setPagamentoStatus(s => ({ ...s, erro: 'Informe um e-mail valido para criar sua conta.', sucesso: '' }));
return null;
}
if (cpf.length !== 11) {
setPagamentoStatus(s => ({ ...s, erro: 'Informe um CPF valido com 11 numeros.', sucesso: '' }));
return null;
}
if (!senha || senha.length < 6) {
setPagamentoStatus(s => ({ ...s, erro: 'Crie uma senha com pelo menos 6 caracteres.', sucesso: '' }));
return null;
}
if (!nascimento) {
setPagamentoStatus(s => ({ ...s, erro: 'Informe sua data de nascimento.', sucesso: '' }));
return null;
}
return { nome, email, cpf, senha, nascimento };
};
const confirmarVipServidor = async (conta, pagamento = {}) => {
  const paymentId =
    pagamento.id ||
    pagamento.payment_id ||
    null;

  if (!paymentId) {
    throw new Error(
      'Pagamento aprovado sem identificador.'
    );
  }

  const sessao =
    await sessaoAtual();

  const token =
    sessao?.access_token;

  if (!token) {
    throw new Error(
      'Entre na sua conta para liberar o PRO.'
    );
  }

  const resp =
    await fetch(
      apiUrl(
        `/api/pagamento/sincronizar/${encodeURIComponent(paymentId)}`
      ),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

  const sincronizacao =
    await resp.json()
      .catch(() => null);

  if (!resp.ok || !sincronizacao?.ok) {
    throw new Error(
      sincronizacao?.erro ||
      'Pagamento aprovado, mas nao foi possivel validar o PRO.'
    );
  }

  if (!sincronizacao?.aprovado) {
    throw new Error(
      'O Mercado Pago ainda nao confirmou este pagamento.'
    );
  }

  const perfil =
    await perfilValidadoServidor(sessao);

  if (!perfil) {
    throw new Error(
      'Nao foi possivel atualizar o perfil PRO.'
    );
  }

  if (
    perfil.is_vip !== true &&
    perfil.is_admin !== true
  ) {
    throw new Error(
      'Pagamento confirmado, mas o PRO ainda nao foi liberado.'
    );
  }

  try {
    window.__BET_AUTH_PROFILE__ =
      perfil;
  }
  catch {}

  setUserData(perfil);

  registrarPagamentoAprovado(
    paymentId,
    {
      nome:
        perfil.nome ||
        conta?.nome ||
        '',
      email:
        perfil.email ||
        conta?.email ||
        '',
      metodo:
        pagamento.metodo ||
        metodoPagamento,
      valor:
        PLANO_PRO.valor,
      descricao:
        PLANO_PRO.nome,
      status:
        pagamento.status ||
        'approved',
      pagamento_id:
        paymentId
    }
  );

  setMenuAtivo(
    'Todos os Jogos'
  );

  setViewMode(
    'perfil'
  );

  setPagamentoStatus({
    loading: false,
    erro: '',
    sucesso:
      'Pagamento confirmado. PRO liberado pelo servidor.',
    pix: null,
    id: paymentId
  });

  alert(
    'Pagamento confirmado. BetAnalytics PRO ativado.'
  );

  return perfil;
};
const consultarStatusPagamento = async (paymentId, conta) => {
try {
const resp = await fetch(apiUrl(`/api/pagamento/status/${paymentId}`));
const data = await resp.json();
if (!resp.ok) throw new Error(data?.erro || 'Nao foi possivel consultar o pagamento.');

// bet-pagamento-historico-status
atualizarPagamentoLocal(paymentId, {
  status: data.status || 'pending',
  status_detail: data.status_detail || data.statusDetail || '',
  aprovado: Boolean(data.aprovado || data.status === 'approved'),
  ultimoRetorno: data
});
// fim-bet-pagamento-historico-status

if (data.aprovado || data.status === 'approved') {
if (pollingPagamentoRef.current) clearInterval(pollingPagamentoRef.current);
pollingPagamentoRef.current = null;
encerrarTentativaPagamento('pix');
await confirmarVipServidor(conta, { id: paymentId, status: data.status, metodo: metodoPagamento });
return;
}
setPagamentoStatus(s => ({ ...s, sucesso: `Aguardando pagamento... status: ${data.status || 'pendente'}` }));
} catch (err) {
setPagamentoStatus(s => ({ ...s, erro: err.message || 'Erro ao consultar pagamento.' }));
}
};
const iniciarPagamentoPix = async () => {
const conta = validarContaObrigatoria();
if (!conta) return;
try {
if (pollingPagamentoRef.current) clearInterval(pollingPagamentoRef.current);
setPagamentoStatus({ loading: true, erro: '', sucesso: 'Gerando QR Code PIX...', pix: null, id: null });
const resp = await fetch(apiUrl('/api/pagamento/pix'), {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Idempotency-Key': obterTentativaPagamento('pix'),
},
body: JSON.stringify({
nome: conta.nome,
email: conta.email,
cpf: conta.cpf,
valor: PLANO_PRO.valor,
descricao: PLANO_PRO.nome,
})
});
const data = await resp.json();

if (!resp.ok) {
if (resp.status < 500) {
encerrarTentativaPagamento('pix');
}

throw new Error(
data?.erro ||
'Erro ao gerar PIX.'
);
}

// bet-pagamento-historico-pix
registrarPagamentoGerado({
  conta,
  pagamento: data,
  metodo: 'pix',
  valor: PLANO_PRO.valor,
  descricao: PLANO_PRO.nome
});
// fim-bet-pagamento-historico-pix

setPagamentoStatus({
loading: false,
erro: '',
sucesso: 'PIX gerado. Pague pelo QR Code ou copie o codigo abaixo.',
pix: data,
id: data.id || data.payment_id || null,
});
if (data.id || data.payment_id) {
const paymentId = data.id || data.payment_id;
pollingPagamentoRef.current = setInterval(() => consultarStatusPagamento(paymentId, conta), 5000);
}
} catch (err) {
setPagamentoStatus({ loading: false, erro: err.message || 'Erro ao gerar PIX.', sucesso: '', pix: null, id: null });
}
};
const enviarPagamentoCartaoSeguro = async (dadosCartao, conta) => {
try {
setPagamentoStatus({ loading: true, erro: '', sucesso: 'Processando cartao com seguranca...', pix: null, id: null });
const token = dadosCartao?.token;
const paymentMethodId = dadosCartao?.paymentMethodId || dadosCartao?.payment_method_id;
if (!token || !paymentMethodId) throw new Error('Preencha todos os dados do cartao antes de concluir.');
const resp = await fetch(apiUrl('/api/pagamento/cartao'), {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Idempotency-Key': obterTentativaPagamento('cartao'),
},
body: JSON.stringify({
nome: conta.nome,
email: conta.email,
cpf: conta.cpf,
valor: PLANO_PRO.valor,
descricao: PLANO_PRO.nome,
tipo: metodoPagamento === 'debito' ? 'debit_card' : 'credit_card',
token,
paymentMethodId,
issuerId: dadosCartao?.issuerId || dadosCartao?.issuer_id,
installments: Number(dadosCartao?.installments || 1),
identificationType: dadosCartao?.identificationType || 'CPF',
identificationNumber: limparCpf(dadosCartao?.identificationNumber || conta.cpf),
})
});
const data = await resp.json();

if (!resp.ok) {
if (resp.status < 500) {
encerrarTentativaPagamento('cartao');
}

throw new Error(
data?.erro ||
'Pagamento recusado.'
);
}

// bet-pagamento-historico-cartao
registrarPagamentoGerado({
  conta,
  pagamento: data,
  metodo: metodoPagamento,
  valor: PLANO_PRO.valor,
  descricao: PLANO_PRO.nome
});
// fim-bet-pagamento-historico-cartao

if (data.aprovado || data.status === 'approved') {
encerrarTentativaPagamento('cartao');
await confirmarVipServidor(conta, { id: data.id || data.payment_id, status: data.status, metodo: metodoPagamento });
return;
}
if (
['rejected', 'cancelled'].includes(
String(data.status || '').toLowerCase()
)
) {
encerrarTentativaPagamento('cartao');
}

setPagamentoStatus({ loading: false, erro: data.mensagem || `Pagamento nao aprovado. Status: ${data.status || 'recusado'}`, sucesso: '', pix: null, id: data.id || null });
} catch (err) {
setPagamentoStatus({ loading: false, erro: err.message || 'Erro ao processar cartao.', sucesso: '', pix: null, id: null });
}
};
const carregarMercadoPagoJs = () => new Promise((resolve, reject) => {
if (window.MercadoPago) return resolve();
const scriptExistente = document.getElementById('mercadopago-js-v2');
if (scriptExistente) {
scriptExistente.addEventListener('load', resolve, { once: true });
scriptExistente.addEventListener('error', reject, { once: true });
return;
}
const script = document.createElement('script');
script.id = 'mercadopago-js-v2';
script.src = 'https://sdk.mercadopago.com/js/v2';
script.onload = resolve;
script.onerror = () => reject(new Error('Nao foi possivel carregar o Mercado Pago.js.'));
document.body.appendChild(script);
});
useEffect(() => {
if (DISTRIBUICAO_PLAY_STORE) return;
if (menuAtivo !== 'assinar pro') return;
if (metodoPagamento !== 'credito' && metodoPagamento !== 'debito') return;
let cancelado = false;
const iniciarCardForm = async () => {
try {
setPagamentoStatus(s => ({ ...s, erro: '', sucesso: 'Carregando formulario seguro do cartao...' }));
await carregarMercadoPagoJs();
await new Promise(resolve => setTimeout(resolve, 120));
if (cancelado || !window.MercadoPago) return;
try { cardFormMercadoPagoRef.current?.unmount?.(); } catch (e) {}
const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY || '';
const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
cardFormMercadoPagoRef.current = mp.cardForm({
amount: String(PLANO_PRO.valor.toFixed(2)),
iframe: true,
form: {
id: 'form-checkout',
cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Nome impresso no cartao' },
cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'E-mail da conta' },
cardNumber: { id: 'form-checkout__cardNumber', placeholder: 'Numero do cartao' },
expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/AA' },
securityCode: { id: 'form-checkout__securityCode', placeholder: 'CVV' },
installments: { id: 'form-checkout__installments', placeholder: 'Parcelas' },
identificationType: { id: 'form-checkout__identificationType', placeholder: 'Documento' },
identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'CPF' },
issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emissor' },
},
callbacks: {
onReady: () => setPagamentoStatus(s => ({ ...s, erro: '', sucesso: 'Formulario seguro do cartao pronto.' })),
onSubmit: async (event) => {
event.preventDefault();
const conta = validarContaObrigatoria();
if (!conta) return Promise.reject();
const dadosCartao = cardFormMercadoPagoRef.current.getCardFormData();
await enviarPagamentoCartaoSeguro(dadosCartao, conta);
return Promise.resolve();
},
onError: (error) => {
console.error(error);
setPagamentoStatus(s => ({ ...s, erro: 'Erro no formulario seguro do cartao. Confira os dados informados.', sucesso: '' }));
},
},
});
} catch (err) {
setPagamentoStatus(s => ({ ...s, erro: err.message || 'Erro ao carregar cartao.', sucesso: '' }));
}
};
iniciarCardForm();
return () => {
cancelado = true;
try { cardFormMercadoPagoRef.current?.unmount?.(); } catch (e) {}
};
}, [menuAtivo, metodoPagamento]);
if (showSplash) {
return <SplashLogoAnimado />;
}

return (
<div className="min-h-screen bg-[#050816] text-white font-sans pb-28 w-full max-w-full overflow-x-hidden relative">
<MobileBackAndCleanUI
  viewMode={viewMode}
  setViewMode={setViewMode}
  jogoSelecionado={jogoSelecionado}
  setJogoSelecionado={setJogoSelecionado}
  aiOpen={aiOpen}
  setAiOpen={setAiOpen}
  setMenuAtivo={setMenuAtivo}
/>

<RemoverSomentePesquisaBottom />
<HeaderApp
  userData={userData}
  setMenuAtivo={setMenuAtivo}
  setViewMode={setViewMode}
  setJogoSelecionado={setJogoSelecionado}
  setFilterCentro={setFilterCentro}
/>
<RoteadorProfissional
  viewMode={viewMode}
  menuAtivo={menuAtivo}
  filterCentro={filterCentro}
  jogoSelecionado={jogoSelecionado}
  setViewMode={setViewMode}
  setMenuAtivo={setMenuAtivo}
  setFilterCentro={setFilterCentro}
  setJogoSelecionado={setJogoSelecionado}
  setLigaAtivaId={typeof setLigaAtivaId === 'function' ? setLigaAtivaId : undefined}
/>
{(
  jogoSelecionado ||
  menuAtivo === 'assinar pro' ||
  viewMode !== 'jogos' ||
  filterCentro !== 'Todos'
) && (
  <button
    type="button"
    onClick={() => {
      const origemJogo = jogoSelecionado?._origemTela;
      setJogoSelecionado(null);
      setMenuAtivo('Todos os Jogos');
      setViewMode(origemJogo === 'prejogo' ? 'prejogo' : 'jogos');
      setFilterCentro(origemJogo === 'prejogo' ? 'Pre-Jogo' : 'Todos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
    style={{
      position: 'fixed',
      top: '82px',
      left: '12px',
      zIndex: 2147483647,
      width: '44px',
      height: '44px',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.18)',
      background: '#0f172a',
      color: '#ffffff',
      fontSize: '24px',
      fontWeight: 900,
      lineHeight: '1',
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)'
    }}
    aria-label="Voltar"
    title="Voltar"
  >
    ←
  </button>
)}

<AtalhoAdminPerfil
  viewMode={viewMode}
  setViewMode={setViewMode}
  setMenuAtivo={setMenuAtivo}
  setJogoSelecionado={setJogoSelecionado}
/>
<CalendarioSemanaJogos viewMode={viewMode} />
<ModoDemoBadge modoDemo={MODO_DEMONSTRACAO} setViewMode={setViewMode} />
<SemConexaoPro setViewMode={setViewMode} />
{menuAtivo === 'assinar pro' && (
DISTRIBUICAO_PLAY_STORE ? (
<AssinaturaPro
  onVoltar={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setJogoSelecionado(null); }}
/>
) : (
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
)
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
{viewMode === 'radarpro' && (
<TelaRadarIA
  jogos={jogos}
  userData={userData}
  setMenuAtivo={setMenuAtivo}
  setJogoSelecionado={setJogoSelecionado}
  toggleFavorito={toggleFavorito}
  favoritos={favoritos}
  escudoTime={escudoTime}
  gerarEscudoAutomatico={gerarEscudoAutomatico}
/>
)}

{viewMode === 'aovivo' && (
<TelaAoVivo
  jogos={jogos}
  userData={userData}
  setMenuAtivo={setMenuAtivo}
  setJogoSelecionado={setJogoSelecionado}
  toggleFavorito={toggleFavorito}
  favoritos={favoritos}
  escudoTime={escudoTime}
  gerarEscudoAutomatico={gerarEscudoAutomatico}
/>
)}

{viewMode === 'encerrado' && (
<TelaEncerrados
  jogos={jogos}
  userData={userData}
  setMenuAtivo={setMenuAtivo}
  setJogoSelecionado={setJogoSelecionado}
  toggleFavorito={toggleFavorito}
  favoritos={favoritos}
  escudoTime={escudoTime}
  gerarEscudoAutomatico={gerarEscudoAutomatico}
/>
)}

{viewMode === 'prejogo' && (
<TelaPreJogo
  jogos={jogos}
  userData={userData}
  setMenuAtivo={setMenuAtivo}
  setJogoSelecionado={setJogoSelecionado}
  toggleFavorito={toggleFavorito}
  favoritos={favoritos}
  escudoTime={escudoTime}
  gerarEscudoAutomatico={gerarEscudoAutomatico}
/>
)}

{viewMode === 'jogos' && (
<TelaInicial
  jogos={jogosTelaPrincipal}
  favoritos={favoritos}
  onToggleFavorito={toggleFavorito}
  onAbrirJogo={(j) => {
    setJogoSelecionado(j);
  }}
  renderizarListaJogos={RenderizarListaJogos}
/>
)}

{!DISTRIBUICAO_PLAY_STORE && viewMode === 'admin' && (
<AdminResumoPro
  setViewMode={setViewMode}
  userData={userData}
  jogos={jogos}
/>
)}

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
{viewMode === 'historico' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="Historico IA PRO" onBack={() => setViewMode('perfil')} /><HistoricoIAPro /></div>)}
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
{!DISTRIBUICAO_PLAY_STORE && viewMode === 'casas-parceiras' && (
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
  desativarNotificacao={desativarNotificacaoApp}
  testarNotificacao={testarNotificacaoApp}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
  modoDemo={MODO_DEMONSTRACAO}
/>
)}

{viewMode === 'termos' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title=" Termos e Politicas" onBack={() => setViewMode('jogos')} /><LegalCompliance /></div>)}
</div>)}
{jogoSelecionado && menuAtivo !== 'assinar pro' && (
<div className="fixed inset-0 z-[999] bg-[#050816] text-white overflow-y-auto pb-28 animate-fade-in">
<button
  type="button"
  onClick={() => {
    const origemJogo = jogoSelecionado?._origemTela;
    setJogoSelecionado(null);
    setMenuAtivo('Todos os Jogos');
    setViewMode(origemJogo === 'prejogo' ? 'prejogo' : 'jogos');
    setFilterCentro(origemJogo === 'prejogo' ? 'Pre-Jogo' : 'Todos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  className="bet-retorno-painel-pro"
  data-bet-retorno-painel="true"
  aria-label="Retornar ao início"
>
  {'<'}
</button>
<Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs">A carregar painel do jogo...</div>}>
{/* BET_ETAPA_27_FINAL_CARD_ABAS */}
<div className="w-full px-3 pt-16 sm:px-4 sm:pt-20">
  <CardJogo
    key={jogoSelecionado.id ?? jogoSelecionado.fixture?.id ?? "jogo-selecionado"}
    jogo={{
      ...jogoSelecionado,
      id: jogoSelecionado.id ?? jogoSelecionado.id_jogo ?? jogoSelecionado.fixture?.id,
      time_casa: jogoSelecionado.time_casa ?? jogoSelecionado.home_team ?? jogoSelecionado.homeTeam ?? jogoSelecionado.teams?.home?.name,
      homeTeam: jogoSelecionado.homeTeam ?? jogoSelecionado.home_team ?? jogoSelecionado.time_casa ?? jogoSelecionado.teams?.home?.name,
      mandante: jogoSelecionado.mandante ?? jogoSelecionado.home_team ?? jogoSelecionado.time_casa,
      logo_casa: jogoSelecionado.logo_casa ?? jogoSelecionado.home_image ?? jogoSelecionado.homeLogo ?? jogoSelecionado.teams?.home?.logo,
      homeLogo: jogoSelecionado.homeLogo ?? jogoSelecionado.home_image ?? jogoSelecionado.logo_casa ?? jogoSelecionado.teams?.home?.logo,
      placar_casa: jogoSelecionado.placar_casa ?? jogoSelecionado.scoreHome ?? jogoSelecionado.home_score ?? jogoSelecionado.goals?.home ?? 0,
      score_home: jogoSelecionado.score_home ?? jogoSelecionado.scoreHome ?? jogoSelecionado.placar_casa ?? jogoSelecionado.goals?.home ?? 0,
      time_fora: jogoSelecionado.time_fora ?? jogoSelecionado.away_team ?? jogoSelecionado.awayTeam ?? jogoSelecionado.teams?.away?.name,
      awayTeam: jogoSelecionado.awayTeam ?? jogoSelecionado.away_team ?? jogoSelecionado.time_fora ?? jogoSelecionado.teams?.away?.name,
      visitante: jogoSelecionado.visitante ?? jogoSelecionado.away_team ?? jogoSelecionado.time_fora,
      logo_fora: jogoSelecionado.logo_fora ?? jogoSelecionado.away_image ?? jogoSelecionado.awayLogo ?? jogoSelecionado.teams?.away?.logo,
      awayLogo: jogoSelecionado.awayLogo ?? jogoSelecionado.away_image ?? jogoSelecionado.logo_fora ?? jogoSelecionado.teams?.away?.logo,
      placar_fora: jogoSelecionado.placar_fora ?? jogoSelecionado.scoreAway ?? jogoSelecionado.away_score ?? jogoSelecionado.goals?.away ?? 0,
      score_away: jogoSelecionado.score_away ?? jogoSelecionado.scoreAway ?? jogoSelecionado.placar_fora ?? jogoSelecionado.goals?.away ?? 0,
      liga: jogoSelecionado.liga ?? jogoSelecionado.league_name ?? jogoSelecionado.league?.name ?? "Competicao",
      campeonato: jogoSelecionado.campeonato ?? jogoSelecionado.league_name ?? jogoSelecionado.league?.name,
      data: jogoSelecionado.data ?? jogoSelecionado.starting_at ?? jogoSelecionado.date ?? jogoSelecionado.fixture?.date,
      horario: jogoSelecionado.horario ?? jogoSelecionado.starting_at ?? jogoSelecionado.date ?? jogoSelecionado.fixture?.date,
      tempo: jogoSelecionado.tempo ?? jogoSelecionado.time_elapsed ?? jogoSelecionado.fixture?.status?.elapsed,
      minuto: jogoSelecionado.minuto ?? jogoSelecionado.time_elapsed ?? jogoSelecionado.fixture?.status?.elapsed,
      status: jogoSelecionado.status ?? jogoSelecionado.fixture?.status?.short ?? "Not Started",
      odd: jogoSelecionado.odd ?? jogoSelecionado.odd_principal ?? jogoSelecionado.odds?.home,
      odd_principal: jogoSelecionado.odd_principal ?? jogoSelecionado.odd ?? jogoSelecionado.odds?.home,
      confianca: jogoSelecionado.confianca ?? jogoSelecionado.confianca_ia ?? jogoSelecionado.confiancaIA ?? 0,
      confiancaIA: jogoSelecionado.confiancaIA ?? jogoSelecionado.confianca_ia ?? jogoSelecionado.confianca ?? 0,
      confianca_ia: jogoSelecionado.confianca_ia ?? jogoSelecionado.confiancaIA ?? jogoSelecionado.confianca ?? 0,
    }}
    selecionado={true}
  />
</div>
{/* BET_ETAPA_27_FINAL_CARD_ABAS_FIM */}
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

<MenuRodape
  viewMode={viewMode}
  filterCentro={filterCentro}
  setMenuAtivo={setMenuAtivo}
  setViewMode={setViewMode}
  setFilterCentro={setFilterCentro}
  setLigaAtivaId={setLigaAtivaId}
  setJogoSelecionado={setJogoSelecionado}
/>
</div>
);
}
