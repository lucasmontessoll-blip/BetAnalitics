import JogosPorPaisContinente from './components/JogosPorPaisContinente.jsx';
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
import { Home, Radio, Trophy, Crown, Star, ChevronRight, X, User, Zap, TrendingUp, ArrowLeft, Send, DollarSign, Target, Globe, CreditCard, Lock, Calendar, Search, Plus } from 'lucide-react';
import { calcularKelly } from './utils/math.js';
import { calcularStake } from './utils/risk.js';
import { useFavoritos } from './hooks/useFavoritos.js';
import { useApiFootball } from './hooks/useApiFootball.js';
import { useIA } from './hooks/useIA.js';
import HeroPremium from './components/HeroPremium.jsx';
import LegalCompliance from './components/LegalCompliance.jsx';
import Perfil from './components/Perfil.jsx';
import PainelJogo from './components/PainelJogo.jsx';
import AnaliseRigorosaCard from './components/AnaliseRigorosaCard.jsx';
import ComparadorOdds from './components/ComparadorOdds.jsx';
import AssinaturaPro from './components/AssinaturaPro.jsx';
import MercadosIAResumo from './components/MercadosIAResumo.jsx';
import { gerarClickIdAfiliado, montarUrlAfiliado } from './config/casasAfiliadas.js';
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
const PAISES = ['brasil', 'argentina', 'colÃ´mbia', 'uruguai', 'chile', 'peru', 'equador', 'venezuela', 'bolÃ­via', 'paraguai', 'espanha', 'alemanha', 'franÃ§a', 'portugal', 'inglaterra', 'itÃ¡lia', 'holanda', 'bÃ©lgica', 'croÃ¡cia', 'mÃ©xico', 'eua', 'estados unidos', 'canadÃ¡'];
const isSelecao = (h, a, l) => {
const str = `${h || ''} ${a || ''} ${l || ''}`.toLowerCase();
if (str.includes('euro') || str.includes('copa amÃ©rica') || str.includes('nations league') || str.includes('world cup')) return true;
return PAISES.some(p => str.includes(p));
};
const getLocalYYYYMMDD = () => {
const d = new Date();
d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
return d.toISOString().split('T')[0];
};
const listaLigas = [{ name: 'Todos', id: null }, { name: 'BrasileirÃ£o', id: 71 }, { name: 'Champions', id: 2 }, { name: 'Premier League', id: 39 }];
const crescimentoBancaGlobal = [{ dia: "Seg", banca: 1000 }, { dia: "Ter", banca: 1120 }, { dia: "Qua", banca: 1210 }, { dia: "Qui", banca: 1380 }, { dia: "Sex", banca: 1470 }, { dia: "SÃ¡b", banca: 1650 }, { dia: "Dom", banca: 1840 }];
const desempenhoDiario = [{ dia: "Seg", acertos: 14, erros: 3 }, { dia: "Ter", acertos: 18, erros: 2 }, { dia: "Qua", acertos: 12, erros: 5 }, { dia: "Qui", acertos: 20, erros: 4 }, { dia: "Sex", acertos: 25, erros: 6 }, { dia: "SÃ¡b", acertos: 32, erros: 5 }, { dia: "Dom", acertos: 29, erros: 3 }];
const BUSCA_EQUIPES = [{ tipo: 'time', nome: 'Brasil', sub: 'SeleÃ§Ã£o Brasileira', emoji: 'ðŸ‡§ðŸ‡·' }, { tipo: 'time', nome: 'FranÃ§a', sub: 'SeleÃ§Ã£o Francesa', emoji: 'ðŸ‡«ðŸ‡·' }, { tipo: 'time', nome: 'Noruega', sub: 'SeleÃ§Ã£o Norueguesa', emoji: 'ðŸ‡³ðŸ‡´' }, { tipo: 'time', nome: 'Real Madrid', sub: 'Espanha', emoji: 'âšª' }, { tipo: 'time', nome: 'FC Barcelona', sub: 'Espanha', emoji: 'ðŸ”µ' }, { tipo: 'time', nome: 'Manchester City', sub: 'Inglaterra', emoji: 'ðŸ”µ' }];
const BUSCA_JOGADORES = [{ tipo: 'atleta', nome: 'Lionel Messi', sub: 'Atacante', emoji: 'ðŸ‘¤' }, { tipo: 'atleta', nome: 'Kylian MbappÃ©', sub: 'Atacante', emoji: 'ðŸ‘¤' }, { tipo: 'atleta', nome: 'Erling Haaland', sub: 'Atacante', emoji: 'ðŸ‘¤' }, { tipo: 'atleta', nome: 'Cristiano Ronaldo', sub: 'Atacante', emoji: 'ðŸ‘¤' }, { tipo: 'atleta', nome: 'Lamine Yamal', sub: 'Atacante', emoji: 'ðŸ‘¤' }, { tipo: 'atleta', nome: 'VinÃ­cius JÃºnior', sub: 'Atacante', emoji: 'ðŸ‘¤' }];
const BUSCA_RANKING = [{ tipo: 'ranking', nome: 'Ranking da FIFA', sub: 'SeleÃ§Ãµes', emoji: 'ðŸŒ' }, { tipo: 'ranking', nome: 'Ranking da UEFA', sub: 'Europa', emoji: 'ðŸ”´' }];
const BUSCA_COMPETICOES = [{ tipo: 'competicao', nome: 'BrasileirÃ£o Betano', sub: 'Brasil', emoji: 'ðŸ‡§ðŸ‡·' }, { tipo: 'competicao', nome: 'FIFA Club World Cup', sub: 'Mundo', emoji: 'ðŸ†' }, { tipo: 'competicao', nome: 'Liga dos CampeÃµes', sub: 'Europa', emoji: 'âš½' }, { tipo: 'competicao', nome: 'UEFA Liga Europa', sub: 'Europa', emoji: 'ðŸŸ ' }, { tipo: 'competicao', nome: 'Premier League', sub: 'Inglaterra', emoji: 'ðŸ¦' }, { tipo: 'competicao', nome: 'LaLiga', sub: 'Espanha', emoji: 'ðŸ”´' }];
const TODAS_COMPETICOES = [{ pais: 'Brasil', emoji: 'ðŸ‡§ðŸ‡·', qtd: 6, ligas: ['BrasileirÃ£o SÃ©rie A', 'BrasileirÃ£o SÃ©rie B', 'Copa do Brasil', 'PaulistÃ£o', 'Carioca', 'SÃ©rie C'] }, { pais: 'Brasil (Amador)', emoji: 'ðŸ‡§ðŸ‡·', qtd: 22, ligas: ['Sub-20', 'Sub-23', 'Feminino', 'Estaduais', 'Copa Paulista', 'Aspirantes'] }, { pais: 'Mundo', emoji: 'ðŸŒ', qtd: 33, ligas: ['Copa do Mundo', 'Mundial de Clubes', 'Amistosos Internacionais', 'Nations League', 'EliminatÃ³rias', 'OlÃ­mpico'] }, { pais: 'Europa', emoji: 'ðŸ‡ªðŸ‡º', qtd: 6, ligas: ['Champions League', 'Europa League', 'Conference League', 'Eurocopa', 'Supercopa UEFA', 'Nations League'] }, { pais: 'AmÃ©rica do Sul', emoji: 'ðŸŒŽ', qtd: 8, ligas: ['Libertadores', 'Sul-Americana', 'Recopa', 'Copa AmÃ©rica', 'Argentina Primera', 'Uruguai Primera'] }];
const normalizarTexto = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const abasPesquisa = [
{ id: 'equipes', label: 'âš½ Equipes' },
{ id: 'jogadores', label: 'ðŸ‘¤ Jogadores' },
{ id: 'ranking', label: 'ðŸŒ Ranking' },
{ id: 'principais', label: 'ðŸ† Ligas Principais' },
{ id: 'todas', label: 'ðŸŒ Todas CompetiÃ§Ãµes' },
];
export default function App() {
const [showSplash, setShowSplash] = useState(true);
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
const [abaPesquisaAtiva, setAbaPesquisaAtiva] = useState('equipes');
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
const jFilt = useMemo(() => {
return jogos.filter(j => {
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
const RenderizarListaJogos = () => {
if (loading) return (<div className="text-center text-slate-500 py-10">Buscando jogos na API-Football...</div>);
if (Object.keys(jGrp).length === 0) {
return (
<div className="text-center text-slate-500 py-10 font-bold">
<div>Nenhum jogo retornado pela API-Football com estes filtros.</div>
{erroApiFootball && (<div className="mt-2 text-[11px] text-red-400 font-bold">{erroApiFootball}</div>)}
<button onClick={atualizarApiFootball} className="mt-4 bg-blue-600 text-white rounded-2xl px-5 py-3 text-xs font-black uppercase">Atualizar API-Football</button>
</div>
);
}
return Object.entries(jGrp).map(([leagueName, matches]) => (
<div key={leagueName} className="mb-6 w-full">
<div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-2">{leagueName}</div>
{matches.map(j => (
<div key={j.id} onClick={() => { if (!userData?.is_vip) return setMenuAtivo('assinar pro'); setJogoSelecionado(j); }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer hover:border-blue-500/50 transform-gpu transition-colors">
<div className="flex justify-between items-center mb-5">
{j.status === 'Live' ? (<span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">ðŸ”´ Ao Vivo {String(j.time_elapsed).replace("'", "")}'</span>) : (<span className="text-slate-400 text-[10px] font-bold uppercase">{j.status === 'Finished' ? 'Finalizado' : 'Agendado'}</span>)}
<button onClick={(e) => { e.stopPropagation(); toggleFavorito(e, j.id); }} className="p-1"><Star className={`w-5 h-5 ${favoritos.includes(j.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} /></button>
</div>
<div className="grid grid-cols-3 items-center text-center mb-4">
<div className="flex flex-col items-center gap-2"><img
  src={escudoTime(j.home_image, j.home_team)}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = gerarEscudoAutomatico(j.home_team);
  }}
  className="w-10 h-10 object-contain"
  alt={j.home_team || 'Time casa'}
/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.home_team}</span></div>
<div className="text-2xl font-black">{j.status === 'Live' || j.status === 'Finished' ? `${j.scoreHome} - ${j.scoreAway}` : <span className="text-slate-600">-</span>}</div>
<div className="flex flex-col items-center gap-2"><img
  src={escudoTime(j.away_image, j.away_team)}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = gerarEscudoAutomatico(j.away_team);
  }}
  className="w-10 h-10 object-contain"
  alt={j.away_team || 'Time fora'}
/><span className="text-[10px] font-bold text-slate-200 truncate w-full">{j.away_team}</span></div>
</div>
</div>
))}
</div>
));
};
const HeaderNav = ({ title, onBack }) => (<div className="flex items-center gap-3 mb-6"><button onClick={onBack} className="p-2 bg-[#050816] rounded-full border border-white/10"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-xl font-black">{title}</h2></div>);
const todosItensPesquisa = useMemo(() => [...BUSCA_EQUIPES, ...BUSCA_JOGADORES, ...BUSCA_RANKING, ...BUSCA_COMPETICOES, ...TODAS_COMPETICOES.flatMap(c => c.ligas.map(l => ({ tipo: 'competicao', nome: l, sub: c.pais, emoji: c.emoji })))], []);
const textoTipoPesquisa = (tipo) => tipo === 'time' ? 'Time' : tipo === 'atleta' ? 'Jogador' : tipo === 'competicao' ? 'Liga' : tipo === 'ranking' ? 'Rank' : 'Item';
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
const FavVazio = ({ tipo }) => (<div className="min-h-[360px] flex flex-col items-center justify-center text-center px-6"><h3 className="text-base font-black text-white mb-2">Ã‰ hora de adicionar alguns Favoritos</h3><p className="text-xs text-slate-400 font-semibold mb-6">Os {tipo} favoritos serÃ£o exibidos aqui para acesso rÃ¡pido.</p><button onClick={() => setViewMode('pesquisa')} className="w-28 h-24 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center text-blue-400 font-black gap-2 active:scale-95"><div className="w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center"><Plus className="w-5 h-5" /></div><span className="text-xs">Adicionar</span></button></div>);
const FavCard = ({ item }) => (<div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4 mb-3 flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-[#050816] flex items-center justify-center text-xl border border-white/10">{item.emoji || 'â­'}</div><div className="flex-1 min-w-0"><div className="text-sm font-black text-white truncate">{item.nome || item.titulo}</div><div className="text-[10px] text-slate-500 font-bold uppercase">{item.sub || item.tipo}</div></div><button onClick={() => removerFavCatalogo(item.id)} className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">Remover</button></div>);
const solicitarPermissaoNotificacaoApp = async () => { try { if (!('Notification' in window)) { alert('Este dispositivo nÃ£o suporta notificaÃ§Ãµes.'); return; } const permissao = await Notification.requestPermission(); if (permissao === 'granted') { alert('Alertas ativados com sucesso!'); } else { alert('PermissÃ£o de notificaÃ§Ãµes nÃ£o liberada.'); } } catch (e) { console.error(e); alert('NÃ£o foi possÃ­vel ativar as notificaÃ§Ãµes agora.'); } };
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
setPagamentoStatus(s => ({ ...s, erro: 'Informe um e-mail vÃ¡lido para criar sua conta.', sucesso: '' }));
return null;
}
if (cpf.length !== 11) {
setPagamentoStatus(s => ({ ...s, erro: 'Informe um CPF vÃ¡lido com 11 nÃºmeros.', sucesso: '' }));
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
const ativarVipAposPagamento = (conta, pagamento = {}) => {
const expira = new Date();
expira.setDate(expira.getDate() + PLANO_PRO.dias);
const usuario = {
nome: conta.nome,
email: conta.email,
cpf: conta.cpf,
is_vip: true,
is_admin: conta.email.includes('admin'),
vip_expira: expira.toISOString(),
pagamento_id: pagamento.id || pagamento.payment_id || null,
pagamento_status: pagamento.status || 'approved',
metodo_pagamento: pagamento.metodo || metodoPagamento,
};
localStorage.setItem('bet_sessao_ativa', usuario.email);
localStorage.setItem('bet_user_nome', usuario.nome);
localStorage.setItem('bet_user_email', usuario.email);
localStorage.setItem('bet_vip_expira', usuario.vip_expira);
const usuarios = JSON.parse(localStorage.getItem('bet_users') || '[]').filter(u => u.email !== usuario.email);
usuarios.push(usuario);
localStorage.setItem('bet_users', JSON.stringify(usuarios));
setUserData(usuario);
setMenuAtivo('Todos os Jogos');
setViewMode('perfil');
setPagamentoStatus({ loading: false, erro: '', sucesso: 'âœ… Pagamento aprovado. VIP PRO liberado.', pix: null, id: pagamento.id || null });
alert('âœ… Pagamento aprovado. VIP PRO ativado com sucesso.');
};
const consultarStatusPagamento = async (paymentId, conta) => {
try {
const resp = await fetch(`/api/pagamento/status/${paymentId}`);
const data = await resp.json();
if (!resp.ok) throw new Error(data?.erro || 'NÃ£o foi possÃ­vel consultar o pagamento.');
if (data.aprovado || data.status === 'approved' || data.status === 'processed') {
if (pollingPagamentoRef.current) clearInterval(pollingPagamentoRef.current);
pollingPagamentoRef.current = null;
ativarVipAposPagamento(conta, { id: paymentId, status: data.status, metodo: metodoPagamento });
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
const resp = await fetch('/api/pagamento/pix', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
nome: conta.nome,
email: conta.email,
cpf: conta.cpf,
valor: PLANO_PRO.valor,
descricao: PLANO_PRO.nome,
})
});
const data = await resp.json();
if (!resp.ok) throw new Error(data?.erro || 'Erro ao gerar PIX.');
setPagamentoStatus({
loading: false,
erro: '',
sucesso: 'PIX gerado. Pague pelo QR Code ou copie o cÃ³digo abaixo.',
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
setPagamentoStatus({ loading: true, erro: '', sucesso: 'Processando cartÃ£o com seguranÃ§a...', pix: null, id: null });
const token = dadosCartao?.token;
const paymentMethodId = dadosCartao?.paymentMethodId || dadosCartao?.payment_method_id;
if (!token || !paymentMethodId) throw new Error('Preencha todos os dados do cartÃ£o antes de concluir.');
const resp = await fetch('/api/pagamento/cartao', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
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
if (!resp.ok) throw new Error(data?.erro || 'Pagamento recusado.');
if (data.aprovado || data.status === 'approved' || data.status === 'processed') {
ativarVipAposPagamento(conta, { id: data.id || data.payment_id, status: data.status, metodo: metodoPagamento });
return;
}
setPagamentoStatus({ loading: false, erro: data.mensagem || `Pagamento nÃ£o aprovado. Status: ${data.status || 'recusado'}`, sucesso: '', pix: null, id: data.id || null });
} catch (err) {
setPagamentoStatus({ loading: false, erro: err.message || 'Erro ao processar cartÃ£o.', sucesso: '', pix: null, id: null });
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
script.onerror = () => reject(new Error('NÃ£o foi possÃ­vel carregar o Mercado Pago.js.'));
document.body.appendChild(script);
});
useEffect(() => {
if (menuAtivo !== 'assinar pro') return;
if (metodoPagamento !== 'credito' && metodoPagamento !== 'debito') return;
let cancelado = false;
const iniciarCardForm = async () => {
try {
setPagamentoStatus(s => ({ ...s, erro: '', sucesso: 'Carregando formulÃ¡rio seguro do cartÃ£o...' }));
await carregarMercadoPagoJs();
await new Promise(resolve => setTimeout(resolve, 120));
if (cancelado || !window.MercadoPago) return;
try { cardFormMercadoPagoRef.current?.unmount?.(); } catch (e) {}
const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-5947285218976034';
const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
cardFormMercadoPagoRef.current = mp.cardForm({
amount: String(PLANO_PRO.valor.toFixed(2)),
iframe: true,
form: {
id: 'form-checkout',
cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Nome impresso no cartÃ£o' },
cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'E-mail da conta' },
cardNumber: { id: 'form-checkout__cardNumber', placeholder: 'NÃºmero do cartÃ£o' },
expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/AA' },
securityCode: { id: 'form-checkout__securityCode', placeholder: 'CVV' },
installments: { id: 'form-checkout__installments', placeholder: 'Parcelas' },
identificationType: { id: 'form-checkout__identificationType', placeholder: 'Documento' },
identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'CPF' },
issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emissor' },
},
callbacks: {
onReady: () => setPagamentoStatus(s => ({ ...s, erro: '', sucesso: 'FormulÃ¡rio seguro do cartÃ£o pronto.' })),
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
setPagamentoStatus(s => ({ ...s, erro: 'Erro no formulÃ¡rio seguro do cartÃ£o. Confira os dados informados.', sucesso: '' }));
},
},
});
} catch (err) {
setPagamentoStatus(s => ({ ...s, erro: err.message || 'Erro ao carregar cartÃ£o.', sucesso: '' }));
}
};
iniciarCardForm();
return () => {
cancelado = true;
try { cardFormMercadoPagoRef.current?.unmount?.(); } catch (e) {}
};
}, [menuAtivo, metodoPagamento]);
if (showSplash) {
return (<div className="flex flex-col justify-center items-center min-h-screen bg-[#050816] text-white"><motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl mb-4">âš½</motion.div><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-black tracking-tight flex items-center"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></motion.div></div>);
}
return (
<div className="min-h-screen bg-[#050816] text-white font-sans pb-28 w-full max-w-full overflow-x-hidden relative">
<header className="flex items-center justify-between px-5 py-3 bg-[#050816] sticky top-0 z-40 border-b border-white/5">
<div className="flex flex-col leading-none min-w-0">
<h1 className="font-black text-xl sm:text-2xl tracking-tight flex items-center truncate"><span className="italic">BET</span><span className="text-blue-500">ANALYTICS</span><span className="ml-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded-md">PRO</span></h1>
{userData?.is_vip && (<span className="mt-1 text-[9px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1"><Crown className="w-3 h-3" />VIP ativo</span>)}
</div>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('perfil'); setJogoSelecionado(null); }} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3 py-2 rounded-xl flex items-center gap-2 text-xs shadow-lg uppercase"><User className="w-4 h-4" />Perfil</button>
</header>
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
{viewMode === 'copa' && (<div className="px-4 w-full"><div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden"><Globe className="absolute -right-4 -top-4 w-32 h-32 text-yellow-500/20" /><h2 className="text-2xl font-black text-white flex items-center gap-2 relative z-10"><Trophy className="w-6 h-6 text-yellow-300" /> SeleÃ§Ãµes</h2><p className="text-yellow-200 text-xs mt-1 relative z-10 font-bold">Monitoramento de Eurocopa, Copa AmÃ©rica e Internacionais</p></div><div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 w-full"><button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black border ${filterCentro === 'Todos' ? 'bg-white text-black' : 'bg-transparent border-slate-700 text-slate-400'}`}>Todos</button><button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro === 'Ao Vivo' ? 'bg-white text-black border-white' : 'bg-transparent border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button></div><RenderizarListaJogos />

<JogosPorPaisContinente
  jogos={jogos}
  favoritos={favoritos}
  onToggleFavorito={toggleFavorito}
  onAbrirJogo={(j) => {
    if (j.demo) return setJogoSelecionado(j);
    if (!userData?.is_vip) return setMenuAtivo('assinar pro');
    setJogoSelecionado(j);
  }}
/><div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5 mt-4"><h3 className="text-yellow-500 font-black text-xs uppercase flex items-center gap-2 mb-4"><Target className="w-4 h-4" /> Chuteira de Ouro</h3><div className="bg-[#050816] rounded-xl p-3 mb-2 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">1Âº</span> MbappÃ©</span><span className="text-xs font-black text-yellow-500">5 <span className="text-[9px] text-slate-400">Gols</span></span></div><div className="bg-[#050816] rounded-xl p-3 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">2Âº</span> Kane</span><span className="text-xs font-black text-yellow-500">4 <span className="text-[9px] text-slate-400">Gols</span></span></div></div><div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5"><h3 className="text-blue-400 font-black text-xs uppercase flex items-center gap-2 mb-4"><User className="w-4 h-4" /> GarÃ§ons da Copa</h3><div className="bg-[#050816] rounded-xl p-3 mb-2 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">1Âº</span> De Bruyne</span><span className="text-xs font-black text-blue-400">4 <span className="text-[9px] text-slate-400">Ast.</span></span></div><div className="bg-[#050816] rounded-xl p-3 flex justify-between items-center"><span className="text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2">2Âº</span> VinÃ­cius Jr</span><span className="text-xs font-black text-blue-400">3 <span className="text-[9px] text-slate-400">Ast.</span></span></div></div><div className="px-4 mt-10 mb-10 text-center"><LegalCompliance modo="botao" /></div></div>)}
{viewMode === 'jogos' && (<>{userData?.is_vip && (<HeroPremium onViewOportunidades={() => setViewMode('radar')} />)}<div className="flex gap-2 px-4 overflow-x-auto pb-4 no-scrollbar mt-4"><button onClick={() => setFilterCentro('Todos')} className={`px-5 py-2.5 rounded-full text-xs font-black border ${filterCentro === 'Todos' ? 'bg-white text-black' : 'bg-transparent border-slate-700 text-slate-400'}`}>Todos</button><button onClick={() => setFilterCentro('Ao Vivo')} className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 border ${filterCentro === 'Ao Vivo' ? 'bg-white text-black border-white' : 'bg-transparent border-slate-700 text-slate-400'}`}>Ao Vivo <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></button>{listaLigas.filter(l => l.id !== null).map(l => (<button key={l.name} onClick={() => setLigaAtivaId(l.id)} className={`px-4 py-2.5 rounded-full text-xs font-black border ${ligaAtivaId === l.id ? 'bg-[#0f172a] text-white border-white/10' : 'bg-transparent border-slate-700 text-slate-400'}`}>{l.name}</button>))}</div><div className="px-4 w-full"><RenderizarListaJogos /></div><div className="px-4 mt-10 mb-10 text-center"><LegalCompliance modo="botao" /></div></>)}
{viewMode === 'perfil' && (<div className="px-4 animate-fade-in w-full pb-6 pt-4"><Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse uppercase tracking-widest text-xs">A carregar Perfil...</div>}><Perfil userData={userData || { nome: "UsuÃ¡rio", email: "sem-email", is_vip: false, is_admin: false }} form={form} setForm={setForm} nivelUsuario={nivelUsuario()} xp={xp} setViewMode={setViewMode} solicitarPermissaoNotificacao={solicitarPermissaoNotificacaoApp} apostas={apostas} bancaInicial={bancaInicial} metaMensal={metaMensal} setMenuAtivo={setMenuAtivo} /></Suspense><div className="px-4 mt-10 mb-10 text-center"><LegalCompliance modo="botao" /></div></div>)}
{viewMode === 'radar' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="ðŸ§  Central de InteligÃªncia" onBack={() => setViewMode('jogos')} /><div className="mb-6 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-2xl relative mt-4"><div className="mb-6"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">EvoluÃ§Ã£o da Banca</h3><h2 className="text-xl font-black text-white flex items-center gap-3">Desempenho LÃ­quido<span className="text-emerald-400 text-[10px] font-black bg-[#050816] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +47.0%</span></h2></div><div className="w-full h-48 sm:h-56 relative z-10 -ml-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={crescimentoBancaGlobal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="colorBancaRadar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} /><XAxis dataKey="dia" stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} /><YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} domain={['dataMin - 50', 'dataMax + 50']} /><Tooltip contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }} /><Area type="monotone" dataKey="banca" stroke="#10b981" strokeWidth={3} fill="url(#colorBancaRadar)" dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div></div><div className="mb-6 bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-2xl relative"><div className="mb-6"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PrecisÃ£o da IA</h3><h2 className="text-xl font-black text-white flex items-center gap-3">Acertos vs Erros<span className="text-emerald-400 text-[10px] font-black bg-[#050816] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Target className="w-3 h-3" /> 84% Win Rate</span></h2></div><div className="w-full h-48 sm:h-56 relative z-10 -ml-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={desempenhoDiario} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={6} barGap={4}><CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.02)" vertical={false} /><XAxis dataKey="dia" stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} /><YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickMargin={10} /><Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} /><Bar dataKey="acertos" name="Greens" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="erros" name="Reds" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="grid grid-cols-2 gap-3 mb-6"><div className="bg-[#0f172a] border border-green-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-green-400 mb-2"><TrendingUp className="w-3 h-3" /><span className="text-[9px] font-black uppercase">Melhor Value Bet</span></div><div className="text-xs font-bold text-white truncate">Flamengo x Palmeiras...</div></div><div className="bg-[#0f172a] border border-red-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-red-400 mb-2"><Target className="w-3 h-3" /><span className="text-[9px] font-black uppercase">Gol Iminente</span></div><div className="text-xs font-bold text-white truncate">Real Madrid (Ataque ...</div></div><div className="bg-[#0f172a] border border-purple-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-purple-400 mb-2"><TrendingUp className="w-3 h-3" /><span className="text-[9px] font-black uppercase">Mercado Errado</span></div><div className="text-xs font-bold text-white truncate">Empate Anulado odd ...</div></div><div className="bg-[#0f172a] border border-blue-500/30 p-4 rounded-2xl"><div className="flex items-center gap-1.5 text-blue-400 mb-2"><Zap className="w-3 h-3" /><span className="text-[9px] font-black uppercase">Maior EV+</span></div><div className="text-xs font-bold text-white truncate">+14.2% EV (Escanteios)</div></div></div><div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5"><h3 className="text-white font-black text-sm flex items-center gap-2 mb-6"><Globe className="w-5 h-5 text-blue-500" /> Radar Mundial PRO</h3><p className="text-xs text-slate-500 font-bold text-center py-6">Nenhuma super-oportunidade detectada no momento.</p></div><MercadosIAResumo jogos={jogos} onSelecionarJogo={(j) => setJogoSelecionado(j)} />
<ComparadorOdds onAbrirCasa={(casa) => abrirCasaAfiliada(casa, null, 'radar_comparador_odds')} /><div className="px-4 mt-10 mb-10 text-center"><LegalCompliance modo="botao" /></div></div>)}
{viewMode === 'educacao' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="ðŸŽ“ EducaÃ§Ã£o" onBack={() => setViewMode('perfil')} /><EducacaoBetAnalytics /></div>)}
{viewMode === 'historico' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="ðŸ“ˆ HistÃ³rico de Assertividade" onBack={() => setViewMode('perfil')} /><HistoricoAssertividade /></div>)}
{viewMode === 'como-ia' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="ðŸ§  Como a IA calcula" onBack={() => setViewMode('radar')} /><ComoIACalcula /></div>)}
{viewMode === 'ranking' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="ðŸ† Ranking de Oportunidades" onBack={() => setViewMode('radar')} /><RankingOportunidades jogos={jogos} onSelecionarJogo={(j) => setJogoSelecionado(j)} /></div>)}
{viewMode === 'pesquisa' && (<div className="px-4 animate-fade-in pb-28 w-full">
<HeaderNav title="ðŸ”Ž Pesquisa" onBack={() => setViewMode('jogos')} />
<div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 border border-blue-300/20 rounded-[30px] p-5 mb-5 shadow-2xl overflow-hidden">
<div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
<div className="absolute -left-14 bottom-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
<div className="relative z-10">
<div className="flex items-center justify-between mb-4">
<div>
<h2 className="text-xl font-black text-white uppercase">Central de Pesquisa</h2>
<p className="text-[11px] text-blue-100 font-bold mt-1">Times, jogadores, rankings e competiÃ§Ãµes em um sÃ³ lugar.</p>
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
{/* --- PÃLULAS DAS SUB-ABAS OTMIZADAS PARA MOBILE (MAIS FINAS E NATIVAS) --- */}
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
{/* --- SISTEMA MÃ“VEL DE CARDS COMPACTOS EM 3 COLUNAS --- */}
<div className="mb-6">
{abaPesquisaAtiva === 'equipes' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase">âš½ Melhores Equipes e SeleÃ§Ãµes</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Clique para favoritar no seu radar</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_EQUIPES.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`eq-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'jogadores' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase">ðŸ‘¤ Atletas em Destaque</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Monitore assistÃªncias, gols e cartÃµes</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_JOGADORES.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`jog-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'ranking' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase">ðŸŒ ClassificaÃ§Ãµes e Rankings</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Acompanhe pontuaÃ§Ã£o mundial</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_RANKING.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`rank-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'principais' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase">ðŸ† Ligas Principais</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Os campeonatos mais disputados do mundo</p></div>
<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
{BUSCA_COMPETICOES.filter(i => !buscaPesquisa.trim() || normalizarTexto(`${i.nome} ${i.sub}`).includes(normalizarTexto(buscaPesquisa))).map(item => <PesquisaCard key={`comp-${item.nome}`} item={item} />)}
</div>
</div>
)}
{abaPesquisaAtiva === 'todas' && (
<div>
<div className="mb-2.5"><h3 className="text-xs font-black text-white uppercase">ðŸŒ CatÃ¡logo Completo de Ligas</h3><p className="text-[9px] text-slate-500 font-bold mt-0.5">Abra o paÃ­s e favorite as divisÃµes desejadas</p></div>
<div className="flex flex-col gap-2.5">
{TODAS_COMPETICOES.filter(c => !buscaPesquisa.trim() || normalizarTexto(`${c.pais} ${c.ligas.join(' ')}`).includes(normalizarTexto(buscaPesquisa))).map(c => (
<div key={c.pais} className="bg-[#0f172a] text-white rounded-2xl shadow-lg overflow-hidden border border-white/10">
<button onClick={() => setCategoriaAberta(categoriaAberta === c.pais ? '' : c.pais)} className="w-full flex items-center gap-3 py-3 px-3.5 text-left active:scale-[0.99]">
<span className="w-9 h-9 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-center text-lg">{c.emoji}</span>
<span className="flex-1"><span className="block text-xs font-black">{c.pais}</span><span className="block text-[9px] text-slate-500 font-bold mt-0.5">{c.qtd} competiÃ§Ãµes disponÃ­veis</span></span>
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
{/* --- FIM DA RENDERIZAÃ‡ÃƒO POR ABAS --- */}
</div>)}
{viewMode === 'favoritos' && (<div className="animate-fade-in pb-28 w-full"><div className="bg-blue-700 border-b border-blue-400/30 sticky top-0 z-20"><div className="flex overflow-x-auto no-scrollbar px-2">{['Eventos', 'Times', 'CompetiÃ§Ãµes', 'Atletas'].map(aba => <button key={aba} onClick={() => setFavAba(aba)} className={`px-4 py-4 text-xs font-black whitespace-nowrap border-b-2 ${favAba === aba ? 'text-white border-white' : 'text-blue-200 border-transparent'}`} style={{ touchAction: 'manipulation' }}>{aba}</button>)}</div></div><div className="px-4 pt-5">{favAba === 'Eventos' && (<>{jogos.filter(j => favoritos.includes(j.id)).length ? jogos.filter(j => favoritos.includes(j.id)).map(j => (<div key={j.id} onClick={() => setJogoSelecionado(j)} className="bg-[#0f172a] border border-yellow-500/20 rounded-3xl p-5 mb-3"><div className="flex justify-between items-center mb-2"><span className="text-[10px] text-yellow-400 font-black uppercase">{j.league_name}</span><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></div><div className="text-sm font-black text-white">{j.home_team} x {j.away_team}</div><div className="text-[11px] text-slate-500 mt-1">ConfianÃ§a IA: {j.confianca_ia || 0}% â€¢ Odd {j.odd_principal || '-'}</div></div>)) : <FavVazio tipo="eventos da sua equipe e competiÃ§Ãµes" />}</>)}{favAba === 'Times' && (<>{favCatalogo.filter(f => f.tipo === 'time').length ? favCatalogo.filter(f => f.tipo === 'time').map(item => <FavCard key={item.id} item={item} />) : <FavVazio tipo="times" />}</>)}{favAba === 'CompetiÃ§Ãµes' && (<>{favCatalogo.filter(f => f.tipo === 'competicao' || f.tipo === 'ranking').length ? favCatalogo.filter(f => f.tipo === 'competicao' || f.tipo === 'ranking').map(item => <FavCard key={item.id} item={item} />) : <FavVazio tipo="competiÃ§Ãµes" />}</>)}{favAba === 'Atletas' && (<>{favCatalogo.filter(f => f.tipo === 'atleta').length ? favCatalogo.filter(f => f.tipo === 'atleta').map(item => <FavCard key={item.id} item={item} />) : <FavVazio tipo="atletas" />}</>)}</div></div>)}
{viewMode === 'config' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="âš™ï¸ ConfiguraÃ§Ãµes" onBack={() => setViewMode('perfil')} /><div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 mb-4"><h3 className="text-sm font-black text-white mb-4">PreferÃªncias do aplicativo</h3><button onClick={solicitarPermissaoNotificacaoApp} className="w-full bg-[#050816] border border-blue-500/20 rounded-2xl p-4 text-left mb-3"><div className="text-xs font-black text-blue-400 uppercase">Ativar notificaÃ§Ãµes</div><div className="text-[10px] text-slate-500 font-bold mt-1">Receba alertas de jogos, oportunidades e favoritos.</div></button><button onClick={() => setViewMode('termos')} className="w-full bg-[#050816] border border-white/10 rounded-2xl p-4 text-left mb-3"><div className="text-xs font-black text-white uppercase">Privacidade e termos</div><div className="text-[10px] text-slate-500 font-bold mt-1">Abrir polÃ­ticas, +18 e responsabilidade.</div></button><button onClick={() => window.location.href = 'mailto:betanlyticspro@gmail.com'} className="w-full bg-[#050816] border border-cyan-500/20 rounded-2xl p-4 text-left"><div className="text-xs font-black text-cyan-400 uppercase">Suporte</div><div className="text-[10px] text-slate-500 font-bold mt-1">betanlyticspro@gmail.com</div></button></div><PlayStoreModeBadge /></div>)}
{viewMode === 'termos' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="ðŸ“„ Termos e PolÃ­ticas" onBack={() => setViewMode('jogos')} /><LegalCompliance /></div>)}
{viewMode === 'admin' && (<div className="px-4 animate-fade-in pb-20 w-full"><HeaderNav title="âš™ï¸ Painel de Controle Admin" onBack={() => setViewMode('perfil')} /><div className="bg-[#0f172a] p-5 rounded-3xl border border-white/5 shadow-lg mb-3"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Total UsuÃ¡rios</div><div className="text-3xl font-black text-white">1,248</div></div><div className="bg-[#0f172a] p-5 rounded-3xl border border-yellow-500/20 shadow-lg mb-3"><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Assinantes PRO</div><div className="text-3xl font-black text-yellow-400">312</div></div><div className="bg-[#0f172a] p-5 rounded-3xl border border-green-500/20 shadow-lg flex justify-between items-center"><div><div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Receita Mensal Estimada</div><div className="text-3xl font-black text-green-400">R$ 9.328,80</div></div><DollarSign className="w-10 h-10 text-green-500 opacity-50" /></div></div>)}
</div>)}
{jogoSelecionado && menuAtivo !== 'assinar pro' && (
<div className="fixed inset-0 z-[999] bg-[#050816] text-white overflow-y-auto pb-28 animate-fade-in">
<Suspense fallback={<div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs">A carregar painel do jogo...</div>}>
<PainelJogo jogo={jogoSelecionado} setJogoSelecionado={setJogoSelecionado} bancaInicial={bancaInicial} gerarExplicacaoIA={gerarExplicacaoIA} calcularStake={calcularStake} calcularKelly={calcularKelly} />
</Suspense>
<div className="px-4 pb-8 space-y-4">
<AnaliseRigorosaCard jogo={jogoSelecionado} />
</div>
</div>
)}
<button onClick={() => setAiOpen(true)} className="fixed right-5 bottom-32 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg z-40 text-2xl">ðŸ¤–</button>
<AnimatePresence>
{aiOpen && (<motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed right-4 left-4 bottom-24 bg-[#0f172a] border border-slate-700 p-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col max-h-[70vh]"><div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5"><h3 className="font-black flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400" /> Assistente IA</h3><button onClick={() => setAiOpen(false)} className="bg-slate-800 rounded-full p-1.5"><X className="w-4 h-4" /></button></div><div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1 custom-scrollbar">{aiMessages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-semibold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#050816] text-slate-300 border border-slate-800'}`}>{msg.text}</div></div>))}{aiLoading && (<div className="flex justify-start"><div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 text-slate-300 text-xs font-bold animate-pulse">A processar...</div></div>)}</div><form onSubmit={handleAskAI} className="flex gap-2"><input type="text" placeholder="Qual a melhor aposta?" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} disabled={aiLoading} className="flex-1 bg-[#050816] border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white outline-none" /><button type="submit" disabled={aiLoading || !aiQuery.trim()} className="bg-blue-600 text-white p-3 rounded-2xl"><Send className="w-5 h-5" /></button></form></motion.div>)}
</AnimatePresence>
<nav className="fixed bottom-0 left-0 right-0 bg-[#050816] border-t border-white/5 z-50 flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
<div className="flex justify-around items-center h-16 pt-2 w-full">
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Todos'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'jogos' && filterCentro !== 'Ao Vivo' ? 'text-blue-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Home className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">InÃ­cio</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('jogos'); setFilterCentro('Ao Vivo'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${filterCentro === 'Ao Vivo' ? 'text-red-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Radio className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Ao Vivo</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('pesquisa'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'pesquisa' ? 'text-blue-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Search className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Pesquisa</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('copa'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'copa' ? 'text-yellow-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Trophy className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Copa</span></button>
<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('radar'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'radar' ? 'text-purple-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Zap className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Radar IA</span></button>
{userData?.is_admin && (<button onClick={() => { setMenuAtivo('Todos os Jogos'); setViewMode('admin'); setJogoSelecionado(null); }} className={`flex flex-col items-center gap-1.5 ${viewMode === 'admin' ? 'text-yellow-500' : 'text-slate-500'}`} style={{ touchAction: 'manipulation' }}><Zap className="w-5 h-5" /><span className="text-[8px] font-black uppercase mt-0.5">Admin</span></button>)}
</div>
</nav>
</div>
);
}


