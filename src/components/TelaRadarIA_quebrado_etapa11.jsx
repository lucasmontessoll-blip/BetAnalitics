import React, { useMemo } from 'react';
import {
  Brain,
  TrendingUp,
  ShieldAlert,
  Target,
  Zap,
  Crown,
  BarChart3,
  Eye,
  Flame
} from 'lucide-react';

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function texto(valor, fallback = '') {
  return String(valor || fallback || '').trim();
}

function criarEscudo(nome) {
  const iniciais = texto(nome, 'T')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#facc15"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="28" fill="#0f172a"/>
    <circle cx="48" cy="48" r="36" fill="url(#g)" opacity="0.9"/>
    <text x="48" y="57" text-anchor="middle" font-size="28" font-family="Arial" font-weight="800" fill="white">${iniciais}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function riscoPorConfianca(confianca) {
  if (confianca >= 90) return 'Baixo';
  if (confianca >= 82) return 'Moderado';
  return 'Alto';
}

function normalizarJogo(jogo, index) {
  const casa = texto(
    jogo?.home_team ||
    jogo?.time_casa ||
    jogo?.teams?.home?.name,
    `Time font-weight="800" fill="white">${iniciais}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function riscoPorConfianca(confianca) {
  if (confianca >= 90) return 'Baixo';
  if (confianca >= 82) return 'Moderado';
  return ' Casa ${index + 1}`
  );

  const fora = texto(
    jogo?.away_team ||
    jogo?.time_fora ||
    jogo?.teams?.away?.name,
    `Time Fora ${index + 1}`
  );

  const confianca = Math.max(65, Math.min(99, numero(jogo?.confianca_ia, 92 - index)));
  const odd = numero(jogo?.odd_principal || jogo?.odd, 1.75 + index * 0.08);
  const ev = ((confianca / 100) * odd - 1) * 100;

  return {
    ...jogo,
    id: jogo?.id || jogo?.fixture?.id || `radar-${index}`,
    home_team: casa,
    away_team: fora,
    league_name: texto(jogo?.league_name || jogo?.liga || jogo?.league?.name, 'Radar IA'),
    home_image: jogo?.home_image || jogo?.logo_casa || jogo?.teams?.home?.logo || criarEscudo(casa),
    away_image: jogo?.away_image || jogo?.logo_fora || jogo?.teams?.away?.logo || criarEscudo(fora),
    confianca_ia: confianca,
    odd_principal: odd,
    mercado_principal: texto(jogo?.mercado_principal || jogo?.mercado, index % 2 === 0 ? 'Mais de 1.5 gols' : 'Dupla chance'),
    ev_estimado: ev,
    risco_ia: riscoPorConfianca(confianca)
  };
}

function CardResumo({ icon: Icon, titulo, valor, subtitulo, cor = 'text-white' }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">
            {titulo}
          </div>
          <div className={`text-xl font-black ${cor}`}>
            {valor}
          </div>
          {subtitulo && (
            <div className="text-[10px] font-bold text-slate-400 mt-1">
              {subtitulo}
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${cor}`} />
        </div>
      </div>
    </div>
  );
}

function CardOportunidade({ jogo, index, abrirJogo }) {
  const riscoCor =
    jogo.risco_ia === 'Baixo'
      ? 'text-green-400'
      : jogo.risco_ia === 'Moderado'
        ? 'text-yellow-300'
        : 'text-red-300';

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-[30px] p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-yellow-500/15 border border-yellow-400/20 flex items-center justify-center">
            <span className="text-yellow-300 font-black text-sm">#{index + 1}</span>
          </div>

          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-400">
              Oportunidade IA
            </div>
            <div className="text-[10px] font-bold text-slate-500">
              {jogo.league_name}
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase">
          IA {jogo.confianca_ia}%
        </div>
      </div>

      <div className="grid grid-cols-3 items-center text-center mb-5">
        <div className="flex flex-col items-center gap-2">
          <img
            src={jogo.home_image}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = criarEscudo(jogo.home_team);
            }}
            className="w-12 h-12 object-contain"
            alt={jogo.home_team}
          />
          <div className="text-[11px] font-black text-white line-clamp-2">
            {jogo.home_team}
          </div>
        </div>

        <div className="text-slate-500 text-xs font-black uppercase">
          VS
        </div>

        <div className="flex flex-col items-center gap-2">
          <img
            src={jogo.away_image}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = criarEscudo(jogo.away_team);
            }}
            className="w-12 h-12 object-contain"
            alt={jogo.away_team}
          />
          <div className="text-[11px] font-black text-white line-clamp-2">
            {jogo.away_team}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] text-slate-500 font-black uppercase">Odd</div>
          <div className="text-lg text-yellow-300 font-black">
            {jogo.odd_principal.toFixed(2)}
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] text-slate-500 font-black uppercase">EV</div>
          <div className={`text-lg font-black ${jogo.ev_estimado >= 0 ? 'text-green-400' : 'text-red-300'}`}>
            {jogo.ev_estimado >= 0 ? '+' : ''}{jogo.ev_estimado.toFixed(1)}%
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] text-slate-500 font-black uppercase">Risco</div>
          <div className={`text-lg font-black ${riscoCor}`}>
            {jogo.risco_ia}
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 mb-4">
        <div className="text-[9px] font-black uppercase text-blue-300 mb-1">
          Mercado recomendado
        </div>
        <div className="text-sm font-black text-white">
          {jogo.mercado_principal}
        </div>
      </div>

      <button
        type="button"
        onClick={() => abrirJogo(jogo)}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl px-4 py-3 text-xs uppercase flex items-center justify-center gap-2 active:scale-[0.99]"
      >
        <Eye className="w-4 h-4" />
        Ver análise completa
      </button>
    </div>
  );
}

export default function TelaRadarIA({
  jogos = [],
  userData,
  setMenuAtivo,
  setJogoSelecionado,
}) {
  const oportunidades = useMemo(() => {
    const base = Array.isArray(jogos) && jogos.length
      ? jogos
      : [
          {
            id: 'demo-radar-1',
            home_team: 'Flamengo',
            away_team: 'Palmeiras',
            league_name: 'Radar IA PRO',
            confianca_ia: 94,
            odd_principal: 1.82,
            mercado_principal: 'Vitória Flamengo'
          },
          {
            id: 'demo-radar-2',
            home_team: 'Liverpool',
            away_team: 'Manchester City',
            league_name: 'Radar IA PRO',
            confianca_ia: 91,
            odd_principal: 1.88,
            mercado_principal: 'Mais de 1.5 gols'
          },
          {
            id: 'demo-radar-3',
            home_team: 'Real Madrid',
            away_team: 'Barcelona',
            league_name: 'Radar IA PRO',
            confianca_ia: 89,
            odd_principal: 1.95,
            mercado_principal: 'Ambas marcam'
          }
        ];

    return base
      .map(normalizarJogo)
      .sort((a, b) => {
        const scoreA = a.confianca_ia + Math.max(0, a.ev_estimado);
        const scoreB = b.confianca_ia + Math.max(0, b.ev_estimado);
        return scoreB - scoreA;
      })
      .slice(0, 8);
  }, [jogos]);

  const mediaConfianca = Math.round(
    oportunidades.reduce((acc, j) => acc + j.confianca_ia, 0) / Math.max(1, oportunidades.length)
  );

  const melhorOdd = Math.max(...oportunidades.map((j) => j.odd_principal));
  const melhorEv = Math.max(...oportunidades.map((j) => j.ev_estimado));

  function abrirJogo(jogo) {
    if (!userData?.is_vip) {
      setMenuAtivo('assinar pro');
      return;
    }

    setJogoSelecionado(jogo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="bg-gradient-to-br from-blue-600/25 via-[#0f172a] to-yellow-500/10 border border-blue-500/30 rounded-[32px] p-5 mb-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-300" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Área VIP PRO
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              Radar IA
            </h2>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 font-bold leading-relaxed">
          Ranking automático das melhores oportunidades encontradas pela inteligência artificial.
        </p>

        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 flex items-start gap-2">
          <Flame className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-black text-yellow-200 uppercase">
              Oportunidade do momento
            </div>
            <div className="text-[11px] font-bold text-slate-300 mt-1">
              {oportunidades[0]?.home_team} x {oportunidades[0]?.away_team} · IA {oportunidades[0]?.confianca_ia}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <CardResumo
          icon={Target}
          titulo="Jogos"
          valor={oportunidades.length}
          subtitulo="rankeados"
          cor="text-white"
        />

        <CardResumo
          icon={BarChart3}
          titulo="Média IA"
          valor={`${mediaConfianca}%`}
          subtitulo="confiança"
          cor="text-blue-400"
        />

        <CardResumo
          icon={TrendingUp}
          titulo="Maior odd"
          valor={melhorOdd.toFixed(2)}
          subtitulo={`EV ${melhorEv >= 0 ? '+' : ''}${melhorEv.toFixed(1)}%`}
          cor="text-yellow-300"
        />
      </div>

      <div className="space-y-4">
        {oportunidades.map((jogo, index) => (
          <CardOportunidade
            key={jogo.id || index}
            jogo={jogo}
            index={index}
            abrirJogo={abrirJogo}
          />
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
        <ShieldAlert className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-red-100/80 leading-relaxed">
          Radar informativo. Não garantimos lucro. Apostas envolvem risco e o usuário é responsável pelas próprias decisões.
        </p>
      </div>
    </div>
  );
}
