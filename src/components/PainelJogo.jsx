import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Star, BarChart3, MessageCircle, PlayCircle, Image, Shield, Activity,
  Target, TrendingUp, Trophy, Percent, ChevronRight, Camera, Info, Flame, Zap,
  Users, Clock, Radio, BarChart2, Sparkles
} from 'lucide-react';

const abas = [
  { id: 'detalhes', label: 'Detalhes' },
  { id: 'formacoes', label: 'Formações' },
  { id: 'estatisticas', label: 'Estatísticas' },
  { id: 'comentario', label: 'Comentário' },
  { id: 'partidas', label: 'Partidas' },
  { id: 'fase', label: 'Fase eliminatória' },
  { id: 'midia', label: 'Mídia' },
  { id: 'probabilidades', label: 'Probabilidades' }
];

const JOGO_DEMO_INTERNO = {
  id: 'demo-aurora-solaris-interno',
  league_name: 'Liga Futurista PRO',
  home_team: 'Atlético Aurora',
  away_team: 'Real Solaris',
  home_image: 'https://api.dicebear.com/7.x/initials/svg?seed=Atl%C3%A9tico%20Aurora&backgroundColor=2563eb&fontWeight=900',
  away_image: 'https://api.dicebear.com/7.x/initials/svg?seed=Real%20Solaris&backgroundColor=dc2626&fontWeight=900',
  scoreHome: 3,
  scoreAway: 2,
  status: 'Live',
  time_elapsed: "72'",
  starting_at: new Date(Date.now() + 3600000).toISOString(),
  confianca_ia: 93,
  odd_principal: 1.88,
  estatisticas: { posseCasa: 59, posseFora: 41, ataquesCasa: 76, ataquesFora: 48, chutesCasa: 17, chutesFora: 9, escanteiosCasa: 7, escanteiosFora: 3, passesCasa: 421, passesFora: 306, faltasCasa: 8, faltasFora: 11, cartoesCasa: 1, cartoesFora: 2 },
  probabilidades: { casa: 64, empate: 21, fora: 15 },
  formacoes: {
    casa: { esquema: '4-3-3', jogadores: [{ n: 1, nome: 'Luan Nebula', pos: 'GOL' }, { n: 2, nome: 'Caio Orbit', pos: 'LD' }, { n: 4, nome: 'Renan Atlas', pos: 'ZAG' }, { n: 5, nome: 'Davi Rocha', pos: 'ZAG' }, { n: 6, nome: 'Igor Lunar', pos: 'LE' }, { n: 8, nome: 'Theo Prime', pos: 'VOL' }, { n: 10, nome: 'Nicolas Vega', pos: 'MEI' }, { n: 18, nome: 'Rafa Orion', pos: 'MEI' }, { n: 7, nome: 'Bruno Flash', pos: 'PD' }, { n: 9, nome: 'Matheus Storm', pos: 'ATA' }, { n: 11, nome: 'Leo Eclipse', pos: 'PE' }] },
    fora: { esquema: '4-2-3-1', jogadores: [{ n: 1, nome: 'Marco Solar', pos: 'GOL' }, { n: 22, nome: 'Enzo Ray', pos: 'LD' }, { n: 3, nome: 'Hugo Titan', pos: 'ZAG' }, { n: 14, nome: 'Breno Vox', pos: 'ZAG' }, { n: 16, nome: 'Kai Zenith', pos: 'LE' }, { n: 5, nome: 'Otto Max', pos: 'VOL' }, { n: 8, nome: 'Vitor Flux', pos: 'VOL' }, { n: 20, nome: 'Iuri Neon', pos: 'MEI' }, { n: 10, nome: 'Gael Sun', pos: 'MEI' }, { n: 77, nome: 'Noah Fire', pos: 'MEI' }, { n: 9, nome: 'Ryan Blaze', pos: 'ATA' }] }
  },
  comentarios: [{ min: "08'", txt: 'Atlético Aurora inicia com pressão alta e recupera a bola no campo ofensivo.' }, { min: "19'", txt: 'Real Solaris responde em contra-ataque rápido pelo lado esquerdo.' }, { min: "31'", txt: 'Gol do Atlético Aurora. Matheus Storm finaliza após passe de Nicolas Vega.' }, { min: "45+2'", txt: 'Real Solaris empata em bola parada com Ryan Blaze.' }, { min: "58'", txt: 'Atlético Aurora volta a dominar a posse e cria duas chances claras.' }, { min: "72'", txt: 'IA detecta queda de odd e aumenta a confiança para 93% no mercado principal.' }],
  ultimosJogos: { casa: ['W', 'W', 'D', 'W', 'W'], fora: ['D', 'L', 'W', 'D', 'L'] },
  confrontosDiretos: [{ data: '12/05/2026', casa: 'Atlético Aurora', fora: 'Real Solaris', placar: '2 - 1' }, { data: '04/03/2026', casa: 'Real Solaris', fora: 'Atlético Aurora', placar: '1 - 1' }, { data: '18/01/2026', casa: 'Atlético Aurora', fora: 'Real Solaris', placar: '3 - 0' }],
  fase: { nome: 'Quartas de Final', proxima: 'Semifinal da Liga Futurista PRO', chanceAvancar: 73 },
  midia: [{ tipo: 'Foto', titulo: 'Aquecimento das equipes', sub: 'Galeria pré-jogo' }, { tipo: 'Vídeo', titulo: 'Melhores momentos', sub: 'Lances principais' }, { tipo: 'Notícia', titulo: 'Aurora pressiona no segundo tempo', sub: 'Resumo IA' }]
};

function n(v, padrao = 0) { const x = Number(v); return Number.isFinite(x) ? x : padrao; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function pct(v) { return `${Math.round(v)}%`; }
function escudo(url, nome) { return url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nome || 'Time')}`; }

export default function PainelJogo({ jogo, setJogoSelecionado, bancaInicial = 1000, gerarExplicacaoIA, calcularStake, calcularKelly }) {
  const partida = jogo || JOGO_DEMO_INTERNO;
  const [aba, setAba] = useState('detalhes');
  const tabsRef = useRef(null);
  const tabRefs = useRef({});

  // Carrossel real das abas: não depende do scroll nativo do navegador
  const TABS_VISIVEIS = 4;
  const maxTabStart = Math.max(0, abas.length - TABS_VISIVEIS);
  const [tabStart, setTabStart] = useState(0);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const swipeAtivo = useRef(false);

  const abasVisiveis = abas.slice(tabStart, tabStart + TABS_VISIVEIS);

  const garantirAbaVisivel = (id) => {
    const idx = abas.findIndex(a => a.id === id);
    if (idx < 0) return;

    if (idx < tabStart) {
      setTabStart(clamp(idx, 0, maxTabStart));
      return;
    }

    if (idx >= tabStart + TABS_VISIVEIS) {
      setTabStart(clamp(idx - TABS_VISIVEIS + 1, 0, maxTabStart));
    }
  };

  const escolherAba = (id) => {
    setAba(id);
    garantirAbaVisivel(id);
  };

  const moverAba = (dir) => {
    const idx = abas.findIndex(a => a.id === aba);
    const prox = abas[clamp(idx + dir, 0, abas.length - 1)] || abas[0];
    escolherAba(prox.id);
  };

  const moverGrupoAbas = (dir) => {
    setTabStart(prev => clamp(prev + dir, 0, maxTabStart));
  };

  const iniciarSwipeAbas = (e) => {
    const t = e.touches?.[0] || e;
    swipeStartX.current = t.clientX;
    swipeStartY.current = t.clientY;
    swipeAtivo.current = true;
  };

  const finalizarSwipeAbas = (e) => {
    if (!swipeAtivo.current) return;

    const t = e.changedTouches?.[0] || e;
    const dx = t.clientX - swipeStartX.current;
    const dy = t.clientY - swipeStartY.current;

    swipeAtivo.current = false;

    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        moverGrupoAbas(1);
      } else {
        moverGrupoAbas(-1);
      }
    }
  };

  useEffect(() => {
    garantirAbaVisivel(aba);
  }, [aba]);

  const home = partida.home_team || 'Time Casa';
  const away = partida.away_team || 'Time Fora';
  const liga = partida.league_name || 'Competição';
  const status = partida.status || 'Not Started';
  const minuto = partida.time_elapsed || partida.elapsed || '';
  const scoreHome = n(partida.scoreHome ?? partida.goals_home, 0);
  const scoreAway = n(partida.scoreAway ?? partida.goals_away, 0);
  const odd = n(partida.odd_principal, 1.82);
  const confianca = clamp(n(partida.confianca_ia, 87), 1, 99);
  const ev = (((confianca / 100) * odd) - 1) * 100;
  const aoVivo = status === 'Live' || String(minuto).includes("'");
  const finalizado = status === 'Finished' || status === 'FT';
  const estatisticas = partida.estatisticas || {};
  const probabilidades = partida.probabilidades || {};
  const formacoes = partida.formacoes || {};
  const fase = partida.fase || {};
  const comentarios = partida.comentarios || [
    { min: "12'", txt: `${home} começa pressionando pelo lado direito.` },
    { min: "23'", txt: `Finalização perigosa de ${away}, defesa segura.` },
    { min: "36'", txt: `Gol confirmado para ${home}. A IA aumenta a confiança.` },
    { min: "52'", txt: `Posse equilibrada, mas ${home} gera mais chances claras.` },
    { min: "67'", txt: `Odd em queda para ${home}. Possível value bet detectado.` }
  ];
  const ultimosCasa = partida.ultimosJogos?.casa || ['W', 'W', 'D', 'W', 'L'];
  const ultimosFora = partida.ultimosJogos?.fora || ['D', 'W', 'L', 'W', 'D'];
  const confrontos = partida.confrontosDiretos || [{ data: '2026', casa: home, fora: away, placar: '2 - 1' }, { data: '2025', casa: away, fora: home, placar: '1 - 1' }, { data: '2025', casa: home, fora: away, placar: '0 - 2' }];
  const midia = partida.midia || [{ tipo: 'Foto', titulo: 'Fotos do jogo', sub: 'Galeria prévia' }, { tipo: 'Vídeo', titulo: 'Melhores momentos', sub: 'Vídeos e lances' }];

  const dados = useMemo(() => {
    const probCasa = clamp(n(probabilidades.casa, confianca), 35, 78);
    const probEmpate = clamp(n(probabilidades.empate, 24 - (probCasa - 50) * 0.25), 12, 33);
    const probFora = clamp(n(probabilidades.fora, 100 - probCasa - probEmpate), 10, 45);
    const posseCasa = clamp(n(estatisticas.posseCasa, 48 + (confianca - 80) * 0.35 + (scoreHome - scoreAway) * 3), 38, 66);
    const posseFora = clamp(n(estatisticas.posseFora, 100 - posseCasa), 34, 62);
    const chutesCasa = clamp(n(estatisticas.chutesCasa, Math.round(8 + (confianca - 75) / 4 + scoreHome * 2)), 5, 25);
    const chutesFora = clamp(n(estatisticas.chutesFora, Math.round(7 + (100 - confianca) / 9 + scoreAway * 2)), 4, 22);
    const escanteiosCasa = clamp(n(estatisticas.escanteiosCasa, Math.round(3 + (chutesCasa / 5))), 1, 12);
    const escanteiosFora = clamp(n(estatisticas.escanteiosFora, Math.round(2 + (chutesFora / 6))), 1, 10);
    const ataquesCasa = clamp(n(estatisticas.ataquesCasa, 54 + (confianca - 80) * 0.7), 35, 90);
    const ataquesFora = clamp(n(estatisticas.ataquesFora, 100 - ataquesCasa), 25, 80);
    const stake = typeof calcularStake === 'function' ? calcularStake(bancaInicial, confianca, odd) : Math.max(5, Math.round(bancaInicial * 0.03));
    const kelly = typeof calcularKelly === 'function' ? calcularKelly(confianca / 100, odd) : Math.max(0, (((confianca / 100) * (odd - 1)) - (1 - confianca / 100)) / (odd - 1));
    return { probCasa, probEmpate, probFora, posseCasa, posseFora, chutesCasa, chutesFora, escanteiosCasa, escanteiosFora, ataquesCasa, ataquesFora, passesCasa: n(estatisticas.passesCasa, 421), passesFora: n(estatisticas.passesFora, 306), faltasCasa: n(estatisticas.faltasCasa, 8), faltasFora: n(estatisticas.faltasFora, 11), cartoesCasa: n(estatisticas.cartoesCasa, 1), cartoesFora: n(estatisticas.cartoesFora, 2), stake, kelly: clamp(kelly * 100, 0, 12) };
  }, [partida, bancaInicial, calcularStake, calcularKelly, confianca, odd, scoreHome, scoreAway, estatisticas, probabilidades]);

  const escalaCasa = formacoes.casa?.jogadores || JOGO_DEMO_INTERNO.formacoes.casa.jogadores;
  const escalaFora = formacoes.fora?.jogadores || JOGO_DEMO_INTERNO.formacoes.fora.jogadores;
  const esquemaCasa = formacoes.casa?.esquema || '4-3-3';
  const esquemaFora = formacoes.fora?.esquema || '4-2-3-1';

  const StatBar = ({ nome, casa, fora, un = '' }) => (<div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 mb-3"><div className="flex justify-between text-xs font-black text-white mb-2"><span>{casa}{un}</span><span className="text-slate-400">{nome}</span><span>{fora}{un}</span></div><div className="flex h-2 rounded-full overflow-hidden bg-slate-800"><div style={{ width: `${clamp(casa, 5, 95)}%` }} className="bg-blue-500"></div><div style={{ width: `${clamp(fora, 5, 95)}%` }} className="bg-red-500"></div></div></div>);
  const MiniCard = ({ icon: Icon, titulo, valor, sub, cor = 'text-blue-400' }) => (<div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4"><div className={`w-9 h-9 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-center mb-3 ${cor}`}><Icon className="w-5 h-5" /></div><div className="text-[10px] text-slate-500 font-black uppercase">{titulo}</div><div className="text-xl font-black text-white">{valor}</div>{sub && <div className="text-[10px] text-slate-500 font-bold mt-1">{sub}</div>}</div>);
  const Jogador = ({ p, i, cor }) => <div className="bg-white/10 border border-white/10 rounded-xl p-2"><div className={`w-7 h-7 ${cor} rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-black text-white`}>{p.n || i + 1}</div><div className="text-[9px] font-black text-white leading-tight">{p.nome}</div><div className="text-[8px] font-bold text-white/60">{p.pos}</div></div>;

  const ResultadoTopo = () => (
    <div className="relative overflow-hidden rounded-b-[34px] shadow-[0_25px_60px_rgba(0,0,0,0.45)] mb-5">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1224] via-[#111c3a] to-[#050816]"></div>
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-500/25 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-20 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.25) 1px, transparent 0)', backgroundSize: '22px 22px' }}></div>

      <div className="relative z-10 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setJogoSelecionado?.(null)} className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center active:scale-95 shadow-lg">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="text-center min-w-0 px-2">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-[10px] font-black text-white uppercase tracking-wide truncate max-w-[180px]">{liga}</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-100/80">
              <Clock className="w-3 h-3" />
              {partida.starting_at ? new Date(partida.starting_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Hoje • 16:00'}
            </div>
          </div>

          <button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center active:scale-95 shadow-lg">
            <Star className="w-5 h-5 text-yellow-300" />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-[30px] p-4 shadow-2xl mb-4">
          <div className="grid grid-cols-[1fr_96px_1fr] items-center gap-2">
            <div className="text-center min-w-0">
              <div className="relative mx-auto w-[76px] h-[76px] mb-2">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl"></div>
                <img src={escudo(partida.home_image, home)} className="relative w-[76px] h-[76px] mx-auto rounded-full object-contain border-4 border-blue-400/50 bg-white shadow-xl" alt={home} />
              </div>
              <div className="text-[12px] font-black text-white leading-tight line-clamp-2">{home}</div>
              <div className="mt-1 text-[9px] font-black text-blue-200 uppercase">Casa</div>
            </div>

            <div className="text-center">
              <div className="bg-[#050816]/80 border border-white/10 rounded-[24px] px-2 py-4 shadow-inner">
                <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Placar</div>
                <div className="text-4xl font-black tracking-tight text-white drop-shadow-lg">{scoreHome}<span className="text-slate-500 mx-1">-</span>{scoreAway}</div>
                <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase ${aoVivo ? 'bg-red-500/15 text-red-300 border border-red-400/20' : finalizado ? 'bg-slate-500/15 text-slate-300 border border-white/10' : 'bg-blue-500/15 text-blue-300 border border-blue-400/20'}`}>
                  {aoVivo && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
                  {aoVivo ? `${minuto || 'Ao vivo'}` : finalizado ? 'Finalizado' : 'Não iniciado'}
                </div>
              </div>
            </div>

            <div className="text-center min-w-0">
              <div className="relative mx-auto w-[76px] h-[76px] mb-2">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"></div>
                <img src={escudo(partida.away_image, away)} className="relative w-[76px] h-[76px] mx-auto rounded-full object-contain border-4 border-red-400/50 bg-white shadow-xl" alt={away} />
              </div>
              <div className="text-[12px] font-black text-white leading-tight line-clamp-2">{away}</div>
              <div className="mt-1 text-[9px] font-black text-red-200 uppercase">Fora</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-[#050816]/60 border border-white/10 rounded-2xl p-3 text-center">
              <Sparkles className="w-4 h-4 text-yellow-300 mx-auto mb-1" />
              <div className="text-[9px] text-slate-400 font-black uppercase">Confiança</div>
              <div className="text-sm text-white font-black">{pct(confianca)}</div>
            </div>
            <div className="bg-[#050816]/60 border border-white/10 rounded-2xl p-3 text-center">
              <BarChart2 className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
              <div className="text-[9px] text-slate-400 font-black uppercase">Odd</div>
              <div className="text-sm text-white font-black">{odd.toFixed(2)}</div>
            </div>
            <div className="bg-[#050816]/60 border border-white/10 rounded-2xl p-3 text-center">
              <Radio className="w-4 h-4 text-red-300 mx-auto mb-1" />
              <div className="text-[9px] text-slate-400 font-black uppercase">Status</div>
              <div className="text-sm text-white font-black">{aoVivo ? 'Live' : 'Pré'}</div>
            </div>
          </div>
        </div>

        {/* --- ABAS MODERNAS EM PILLS COM SWIPE REAL DE CARROSSEL --- */}
        <div
          className="relative -mx-4 bg-[#050816] border-t border-white/10 py-3 select-none overflow-hidden"
          onTouchStart={iniciarSwipeAbas}
          onTouchEnd={finalizarSwipeAbas}
          onPointerDown={iniciarSwipeAbas}
          onPointerUp={finalizarSwipeAbas}
        >
          <button
            type="button"
            aria-label="Voltar abas"
            onClick={() => moverGrupoAbas(-1)}
            disabled={tabStart === 0}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white text-blue-700 shadow-xl border border-white/30 flex items-center justify-center text-xl font-black active:scale-95 transition-all ${tabStart === 0 ? 'opacity-35' : 'opacity-100'}`}
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Avançar abas"
            onClick={() => moverGrupoAbas(1)}
            disabled={tabStart >= maxTabStart}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 rounded-full bg-white text-blue-700 shadow-xl border border-white/30 flex items-center justify-center text-xl font-black active:scale-95 transition-all ${tabStart >= maxTabStart ? 'opacity-35' : 'opacity-100'}`}
          >
            ›
          </button>

          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-[#050816] via-[#050816] to-transparent z-30"></div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#050816] via-[#050816] to-transparent z-30"></div>

          <div className="px-14">
            <div className="grid grid-cols-4 gap-2 transition-all duration-300">
              {abasVisiveis.map(a => (
                <button
                  ref={(el) => { if (el) tabRefs.current[a.id] = el; }}
                  key={a.id}
                  type="button"
                  onClick={() => escolherAba(a.id)}
                  className={`h-[42px] rounded-full px-2 text-[10px] leading-tight font-black whitespace-nowrap border transition-all active:scale-95 overflow-hidden text-ellipsis ${aba === a.id ? 'bg-white text-[#050816] border-white shadow-[0_0_20px_rgba(255,255,255,0.18)]' : 'bg-[#0b1224] text-slate-300 border-slate-700'}`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-2">
              {Array.from({ length: maxTabStart + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTabStart(i)}
                  className={`h-1.5 rounded-full transition-all ${tabStart === i ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`}
                  aria-label={`Página de abas ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        {/* --- FIM DAS ABAS --- */}

      </div>
    </div>
  );

  const Detalhes = () => (
    <div className="px-4 pb-28">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-5 mb-4">
        <div className="text-[10px] text-blue-300 font-black uppercase mb-1">Jogo de demonstração completo</div>
        <div className="text-lg font-black text-white">{home} x {away}</div>
        <div className="text-xs text-slate-400 font-semibold mt-2">Use este jogo para testar todas as abas, estatísticas, formações e probabilidades antes de ligar a API real.</div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MiniCard icon={Zap} titulo="Confiança IA" valor={pct(confianca)} sub="Leitura premium" cor="text-yellow-400" />
        <MiniCard icon={TrendingUp} titulo="Value EV+" valor={`${ev.toFixed(1)}%`} sub={ev > 0 ? 'Valor positivo' : 'Aguardar mercado'} cor={ev > 0 ? 'text-emerald-400' : 'text-red-400'} />
        <MiniCard icon={Target} titulo="Odd principal" valor={odd.toFixed(2)} sub="Mercado 1X2" cor="text-blue-400" />
        <MiniCard icon={Flame} titulo="Stake sugerida" valor={`R$ ${Math.round(dados.stake)}`} sub={`Kelly ${dados.kelly.toFixed(1)}%`} cor="text-purple-400" />
      </div>
      <div className="bg-[#0f172a] border border-yellow-500/20 rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3"><Info className="w-5 h-5 text-yellow-400" /><h3 className="font-black text-white text-sm">Leitura do jogo</h3></div>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">A IA identifica vantagem para <b className="text-white">{home}</b> por pressão ofensiva, posse, finalizações, odd atual e momento da partida. Use como apoio de análise, não como garantia de lucro.</p>
        <button onClick={() => gerarExplicacaoIA?.(partida)} className="mt-4 w-full bg-blue-600 text-white rounded-2xl py-3 text-xs font-black uppercase active:scale-95">Explicar com IA</button>
      </div>
    </div>
  );

  const Formacoes = () => (
    <div className="px-4 pb-28">
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-950 rounded-3xl p-4 border border-emerald-400/20 mb-4">
        <div className="flex justify-between text-white text-xs font-black mb-4"><span>{home}</span><span>{esquemaCasa}</span></div>
        <div className="grid grid-cols-3 gap-2 text-center">{escalaCasa.map((p, i) => <Jogador key={`${p.nome}-${i}`} p={p} i={i} cor="bg-blue-500" />)}</div>
      </div>
      <div className="bg-gradient-to-b from-slate-700 to-slate-950 rounded-3xl p-4 border border-white/10">
        <div className="flex justify-between text-white text-xs font-black mb-4"><span>{away}</span><span>{esquemaFora}</span></div>
        <div className="grid grid-cols-3 gap-2 text-center">{escalaFora.map((p, i) => <Jogador key={`${p.nome}-${i}`} p={p} i={i} cor="bg-red-500" />)}</div>
      </div>
    </div>
  );

  const Estatisticas = () => (
    <div className="px-4 pb-28">
      <StatBar nome="Posse de bola" casa={Math.round(dados.posseCasa)} fora={Math.round(dados.posseFora)} un="%" />
      <StatBar nome="Ataques perigosos" casa={Math.round(dados.ataquesCasa)} fora={Math.round(dados.ataquesFora)} />
      <StatBar nome="Finalizações" casa={dados.chutesCasa} fora={dados.chutesFora} />
      <StatBar nome="Escanteios" casa={dados.escanteiosCasa} fora={dados.escanteiosFora} />
      <StatBar nome="Passes certos" casa={dados.passesCasa} fora={dados.passesFora} />
      <StatBar nome="Faltas" casa={dados.faltasCasa} fora={dados.faltasFora} />
      <div className="grid grid-cols-3 gap-3">
        <MiniCard icon={Activity} titulo="Ritmo" valor={aoVivo ? 'Alto' : 'Médio'} cor="text-red-400" />
        <MiniCard icon={Shield} titulo="Risco" valor={ev > 10 ? 'Baixo' : 'Médio'} cor="text-emerald-400" />
        <MiniCard icon={Percent} titulo="IA" valor={pct(confianca)} cor="text-yellow-400" />
      </div>
    </div>
  );

  const Comentario = () => (
    <div className="px-4 pb-28">
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400" />Comentário ao vivo</h3>
        <div className="space-y-4">{comentarios.map((e, i) => <div key={i} className="flex gap-3"><div className="w-11 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">{e.min}</div><div className="flex-1 border-b border-white/5 pb-3"><p className="text-xs text-slate-300 font-semibold leading-relaxed">{e.txt}</p></div></div>)}</div>
      </div>
    </div>
  );

  const Partidas = () => (
    <div className="px-4 pb-28">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4"><div className="text-xs font-black text-white mb-3">{home}</div><div className="flex gap-2 flex-wrap">{ultimosCasa.map((r, i) => <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${r === 'W' ? 'bg-emerald-500 text-white' : r === 'D' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>{r}</span>)}</div></div>
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4"><div className="text-xs font-black text-white mb-3">{away}</div><div className="flex gap-2 flex-wrap">{ultimosFora.map((r, i) => <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${r === 'W' ? 'bg-emerald-500 text-white' : r === 'D' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>{r}</span>)}</div></div>
      </div>
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 mb-4">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" />Confrontos diretos</h3>
        {confrontos.map((c, i) => <div key={i} className="bg-[#050816] border border-white/5 rounded-2xl p-4 mb-3 flex items-center justify-between"><div><div className="text-xs font-black text-white">{c.casa} x {c.fora}</div><div className="text-[10px] text-slate-500 font-bold mt-1">{c.data}</div></div><div className="text-lg font-black text-white">{c.placar}</div></div>)}
      </div>
    </div>
  );

  const Fase = () => (
    <div className="px-4 pb-28">
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 mb-4">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />{fase.nome || 'Fase eliminatória'}</h3>
        <div className="bg-[#050816] border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between mb-4"><span className="text-xs font-black text-white">{home}</span><span className="text-blue-400 font-black">Atual</span><span className="text-xs font-black text-white">{away}</span></div>
        <div className="ml-6 border-l border-white/10 pl-4">
          <div className="bg-[#050816] border border-white/10 rounded-2xl p-4 mb-3"><div className="text-[10px] text-slate-500 font-black uppercase">Próxima fase provável</div><div className="text-sm text-white font-black mt-1">{fase.proxima || 'Rodada seguinte'}</div></div>
          <div className="bg-[#050816] border border-yellow-500/20 rounded-2xl p-4"><div className="text-[10px] text-yellow-400 font-black uppercase">Chance de avançar</div><div className="text-2xl text-white font-black mt-1">{pct(fase.chanceAvancar || dados.probCasa)}</div></div>
        </div>
      </div>
    </div>
  );

  const Midia = () => (
    <div className="px-4 pb-28">
      <div className="grid grid-cols-1 gap-3 mb-4">
        {midia.map((m, i) => <div key={i} className="bg-[#0f172a] border border-white/5 rounded-3xl p-4 flex items-center gap-4"><div className="w-12 h-12 bg-[#050816] border border-white/10 rounded-2xl flex items-center justify-center">{m.tipo === 'Vídeo' ? <PlayCircle className="w-7 h-7 text-red-400" /> : m.tipo === 'Notícia' ? <Info className="w-7 h-7 text-yellow-400" /> : <Camera className="w-7 h-7 text-blue-400" />}</div><div className="flex-1"><div className="text-sm font-black text-white">{m.titulo}</div><div className="text-[10px] text-slate-500 font-bold">{m.sub}</div></div><ChevronRight className="w-5 h-5 text-slate-600" /></div>)}
      </div>
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2"><Image className="w-5 h-5 text-purple-400" />Central de mídia</h3>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">Esta área já está pronta para receber fotos, vídeos, escalações oficiais e notícias quando a API real estiver conectada.</p>
      </div>
    </div>
  );

  const Probabilidades = () => (
    <div className="px-4 pb-28">
      <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 mb-4">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400" />Probabilidades 1X2</h3>
        <div className="space-y-3">
          {[{ nome: home, p: dados.probCasa, cor: 'bg-blue-500' }, { nome: 'Empate', p: dados.probEmpate, cor: 'bg-yellow-500' }, { nome: away, p: dados.probFora, cor: 'bg-red-500' }].map(x => <div key={x.nome}><div className="flex justify-between text-xs font-black text-white mb-1"><span>{x.nome}</span><span>{pct(x.p)}</span></div><div className="h-3 bg-[#050816] rounded-full overflow-hidden"><div className={`${x.cor} h-full rounded-full`} style={{ width: `${x.p}%` }}></div></div></div>)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MiniCard icon={Target} titulo="Casa" valor={(100 / dados.probCasa).toFixed(2)} cor="text-blue-400" />
        <MiniCard icon={Target} titulo="Empate" valor={(100 / dados.probEmpate).toFixed(2)} cor="text-yellow-400" />
        <MiniCard icon={Target} titulo="Fora" valor={(100 / dados.probFora).toFixed(2)} cor="text-red-400" />
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5"><div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Melhor leitura IA</div><div className="text-lg font-black text-white">{home} com proteção / mercado principal</div><div className="text-xs text-slate-400 font-semibold mt-2">EV calculado: {ev.toFixed(1)}% • stake sugerida R$ {Math.round(dados.stake)}</div></div>
    </div>
  );

  const telas = { detalhes: <Detalhes />, formacoes: <Formacoes />, estatisticas: <Estatisticas />, comentario: <Comentario />, partidas: <Partidas />, fase: <Fase />, midia: <Midia />, probabilidades: <Probabilidades /> };

  return <div className="min-h-screen bg-[#050816] text-white animate-fade-in overflow-x-hidden"><ResultadoTopo />{telas[aba] || <Detalhes />}</div>;
}