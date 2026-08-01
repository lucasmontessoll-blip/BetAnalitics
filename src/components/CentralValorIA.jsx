import React, { useMemo } from 'react';
import { Brain, Bell, Wallet, Crown, Star, ShieldCheck, TrendingUp, Target, ChevronRight, BarChart3, Landmark } from 'lucide-react';

function normalizarJogo(jogo, index) {
  return {
    id: jogo?.id || 'demo-' + index,
    casa: jogo?.home_team || jogo?.time_casa || 'Flamengo',
    fora: jogo?.away_team || jogo?.time_fora || 'Palmeiras',
    liga: jogo?.league_name || jogo?.liga || 'Brasileirao Serie A',
    confianca: Number(jogo?.confianca_ia || jogo?.confianca || 86),
    odd: Number(jogo?.odd_principal || jogo?.odd || 1.85),
    mercado: jogo?.mercado_principal || jogo?.mercado || 'Mais de 1.5 gols',
    raw: jogo,
  };
}

const demos = [
  { id: 'ia-demo-1', casa: 'Flamengo', fora: 'Palmeiras', liga: 'Brasileirao Serie A', confianca: 91, odd: 1.82, mercado: 'Mais de 1.5 gols' },
  { id: 'ia-demo-2', casa: 'Liverpool', fora: 'Arsenal', liga: 'Premier League', confianca: 88, odd: 1.95, mercado: 'Ambos marcam' },
  { id: 'ia-demo-3', casa: 'Real Madrid', fora: 'Barcelona', liga: 'LaLiga', confianca: 87, odd: 2.10, mercado: 'Mais de 2.5 gols' },
];

function CardAcao({ icon: Icone, titulo, texto, cor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 text-left active:scale-[0.98]"
    >
      <div className={'w-10 h-10 rounded-2xl ' + cor + ' flex items-center justify-center mb-3'}>
        <Icone className="w-5 h-5 text-white" />
      </div>

      <div className="text-sm font-black text-white">
        {titulo}
      </div>

      <div className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">
        {texto}
      </div>
    </button>
  );
}

const perguntasRapidas = [
  'Qual melhor oportunidade de hoje?',
  'Explique o risco do jogo principal.',
  'Como proteger minha banca hoje?',
  'Mostre jogos com maior confianca IA.',
];

export default function CentralValorIA({
  jogos = [],
  userData,
  setViewMode,
  setJogoSelecionado,
  setAiOpen,
  setAiQuery,
}) {
  const oportunidades = useMemo(() => {
    const base = Array.isArray(jogos) && jogos.length ? jogos.map(normalizarJogo) : demos;

    return base
      .sort((a, b) => b.confianca - a.confianca)
      .slice(0, 5);
  }, [jogos]);

  const abrirPergunta = (pergunta) => {
    setAiQuery?.(pergunta);
    setAiOpen?.(true);
  };

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-5 border border-white/10 shadow-2xl overflow-hidden relative mb-5">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100 mb-3">
            <Brain className="w-4 h-4" />
            Central IA PRO
          </div>

          <h2 className="text-2xl font-black leading-tight">
            Radar inteligente de oportunidades
          </h2>

          <p className="text-xs text-blue-100/90 font-semibold mt-2 leading-relaxed">
            Veja jogos com maior confianca, acesse alertas, controle sua banca e pergunte para a IA.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
              <div className="text-xl font-black">87%</div>
              <div className="text-[9px] font-bold text-blue-100 uppercase">Precisao IA</div>
            </div>

            <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
              <div className="text-xl font-black">{oportunidades.length}</div>
              <div className="text-[9px] font-bold text-blue-100 uppercase">Oportunidades</div>
            </div>

            <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
              <div className="text-xl font-black">{userData?.is_vip ? 'PRO' : 'FREE'}</div>
              <div className="text-[9px] font-bold text-blue-100 uppercase">Plano</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <CardAcao
          icon={Wallet}
          titulo="Gestao de Banca"
          texto="Stake, ROI, lucro e controle de risco."
          cor="bg-emerald-600"
          onClick={() => setViewMode?.('banca-pro')}
        />

        <CardAcao
          icon={Bell}
          titulo="Alertas IA"
          texto="Oportunidades, odds e favoritos."
          cor="bg-amber-600"
          onClick={() => setViewMode?.('alertas-ia')}
        />

        <CardAcao
          icon={ShieldCheck}
          titulo="Como a IA calcula"
          texto="Entenda criterios e confianca."
          cor="bg-blue-600"
          onClick={() => setViewMode?.('como-ia')}
        />

        <CardAcao
          icon={BarChart3}
          titulo="Performance IA"
          texto="Assertividade e mercados fortes."
          cor="bg-emerald-600"
          onClick={() => setViewMode?.('performance-ia')}
        />

        <CardAcao
          icon={Landmark}
          titulo="Casas Parceiras"
          texto="Afiliados, odds e ofertas."
          cor="bg-purple-600"
          onClick={() => setViewMode?.('casas-parceiras')}
        />

        <CardAcao
          icon={Crown}
          titulo="Area VIP"
          texto="Libere recursos profissionais."
          cor="bg-purple-600"
          onClick={() => setViewMode?.('vip-pro')}
        />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Perguntas rapidas
            </div>

            <div className="text-base text-white font-black">
              Assistente IA
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex flex-col items-center justify-center">
            <span className="text-lg leading-none">{'\u{1F916}'}</span>
            <span className="text-[7px] font-black text-blue-100 leading-none mt-0.5">
              IA
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {perguntasRapidas.map((pergunta) => (
            <button
              key={pergunta}
              type="button"
              onClick={() => abrirPergunta(pergunta)}
              className="w-full bg-[#050816] border border-white/10 rounded-2xl px-4 py-3 text-left text-xs font-bold text-slate-300 flex items-center justify-between active:scale-[0.99]"
            >
              {pergunta}
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              IA ao vivo
            </div>

            <div className="text-base text-white font-black">
              Top oportunidades
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewMode?.('Ranking')}
            className="text-[10px] font-black text-blue-400 px-2"
          >
            VER RANKING
          </button>
        </div>

        <div className="space-y-3">
          {oportunidades.map((jogo, index) => {
            const ev = Math.max(4, Math.round(((jogo.confianca / 100) * jogo.odd - 1) * 100));

            return (
              <button
                key={jogo.id}
                type="button"
                onClick={() => setJogoSelecionado?.(jogo.raw || jogo)}
                className="w-full bg-[#050816] border border-white/10 rounded-2xl p-4 text-left active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase">
                    {jogo.liga}
                  </span>

                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                    EV +{ev}%
                  </span>
                </div>

                <div className="text-sm font-black text-white">
                  {index + 1}. {jogo.casa} x {jogo.fora}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-[11px] text-slate-400 font-bold">
                    {jogo.mercado} - Odd {jogo.odd.toFixed(2)}
                  </div>

                  <div className="text-xs font-black text-blue-400">
                    {jogo.confianca}%
                  </div>
                </div>

                <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: Math.min(96, Math.max(20, jogo.confianca)) + '%' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <button
          type="button"
          onClick={() => setViewMode?.('favoritos')}
          className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 text-xs font-black text-white flex flex-col items-center gap-2 active:scale-[0.98]"
        >
          <Star className="w-5 h-5 text-yellow-400" />
          Favoritos
        </button>

        <button
          type="button"
          onClick={() => setViewMode?.('Ranking')}
          className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 text-xs font-black text-white flex flex-col items-center gap-2 active:scale-[0.98]"
        >
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Ranking
        </button>

        <button
          type="button"
          onClick={() => abrirPergunta('Analise os jogos de hoje.')}
          className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 text-xs font-black text-white flex flex-col items-center gap-2 active:scale-[0.98]"
        >
          <Target className="w-5 h-5 text-blue-400" />
          Analisar
        </button>
      </div>
    </div>
  );
}
