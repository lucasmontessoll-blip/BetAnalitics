import React, { useMemo } from 'react';
import { ArrowLeft, BarChart3, Brain, TrendingUp, Target, ShieldAlert, Bell, Trophy, Send } from 'lucide-react';

const demo = [
  { mercado: 'Mais de 1.5 gols', liga: 'Brasil Série A', confianca: 91, value: 12.4, status: 'green' },
  { mercado: 'Ambos marcam', liga: 'Premier League', confianca: 88, value: 9.1, status: 'green' },
  { mercado: 'Mais de 2.5 gols', liga: 'LaLiga', confianca: 84, value: 6.5, status: 'red' },
  { mercado: 'Vitória mandante', liga: 'Libertadores', confianca: 86, value: 7.2, status: 'green' },
  { mercado: 'Dupla chance', liga: 'Champions League', confianca: 82, value: 5.8, status: 'analise' },
];

function carregarHistorico() {
  try {
    const salvo = JSON.parse(localStorage.getItem('bet_historico_ia_v1') || '[]');
    return Array.isArray(salvo) && salvo.length ? salvo : demo;
  } catch {
    return demo;
  }
}

function Card({ icon: Icone, titulo, valor, texto, cor }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{titulo}</div>
        <Icone className={'w-4 h-4 ' + cor} />
      </div>

      <div className={'text-3xl font-black ' + cor}>{valor}</div>

      <div className="text-[10px] text-slate-500 font-bold mt-1">{texto}</div>
    </div>
  );
}

export default function PerformanceIAPro({ setViewMode, setAiOpen, setAiQuery }) {
  const dados = useMemo(() => carregarHistorico(), []);

  const resumo = useMemo(() => {
    const total = dados.length || 1;
    const greens = dados.filter((x) => x.status === 'green').length;
    const reds = dados.filter((x) => x.status === 'red').length;
    const mediaConfianca = dados.reduce((acc, x) => acc + Number(x.confianca || 0), 0) / total;
    const mediaValue = dados.reduce((acc, x) => acc + Number(x.value || 0), 0) / total;
    const assertividade = greens + reds > 0 ? (greens / (greens + reds)) * 100 : 87;

    return {
      total,
      greens,
      reds,
      mediaConfianca,
      mediaValue,
      assertividade,
    };
  }, [dados]);

  const mercados = useMemo(() => {
    const mapa = {};

    dados.forEach((item) => {
      const nome = item.mercado || 'Mercado IA';

      if (!mapa[nome]) {
        mapa[nome] = {
          mercado: nome,
          total: 0,
          confianca: 0,
          value: 0,
          greens: 0,
        };
      }

      mapa[nome].total += 1;
      mapa[nome].confianca += Number(item.confianca || 0);
      mapa[nome].value += Number(item.value || 0);

      if (item.status === 'green') {
        mapa[nome].greens += 1;
      }
    });

    return Object.values(mapa)
      .map((x) => ({
        ...x,
        confianca: x.confianca / x.total,
        value: x.value / x.total,
        taxa: (x.greens / Math.max(1, x.total)) * 100,
      }))
      .sort((a, b) => b.confianca - a.confianca)
      .slice(0, 5);
  }, [dados]);

  const perguntarIA = () => {
    setAiQuery?.('Analise minha performance IA e diga quais mercados estão mais fortes e quais devo evitar.');
    setAiOpen?.(true);
  };

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setViewMode?.('radar')}
          className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div>
          <div className="text-xl font-black text-white">Performance IA</div>
          <div className="text-[11px] text-slate-500 font-bold">Assertividade, mercados e value bets</div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 via-blue-700 to-slate-950 border border-emerald-300/20 p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100 mb-3">
            <BarChart3 className="w-4 h-4" />
            Motor de Performance
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">
            Veja onde a IA está mais forte
          </h1>

          <p className="text-xs text-emerald-100/80 font-semibold mt-3 leading-relaxed">
            Acompanhe assertividade, mercados mais fortes, riscos e oportunidades geradas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card icon={Trophy} titulo="Assertividade" valor={resumo.assertividade.toFixed(0) + '%'} texto="Green / Red demo" cor="text-emerald-400" />
        <Card icon={Brain} titulo="Confiança média" valor={resumo.mediaConfianca.toFixed(0) + '%'} texto="Média das análises" cor="text-blue-400" />
        <Card icon={TrendingUp} titulo="Value médio" valor={'+' + resumo.mediaValue.toFixed(1) + '%'} texto="Valor esperado" cor="text-purple-400" />
        <Card icon={Bell} titulo="Alertas" valor={String(resumo.total)} texto="Análises registradas" cor="text-amber-400" />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Semana</div>
            <div className="text-sm font-black text-white">Evolução da IA</div>
          </div>
          <div className="text-[10px] font-black text-emerald-400">DEMO</div>
        </div>

        <div className="flex items-end gap-2 h-32">
          {[74, 78, 81, 85, 82, 89, 91].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-xl bg-blue-500/80"
                style={{ height: Math.max(10, v) + '%' }}
              />
              <span className="text-[9px] text-slate-600 font-black">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-sm font-black text-white">Mercados mais fortes</div>
            <div className="text-[10px] text-slate-500 font-bold">Ordenado por confiança IA</div>
          </div>
        </div>

        <div className="space-y-3">
          {mercados.map((item, index) => (
            <div key={item.mercado} className="bg-[#050816] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-black text-white truncate">
                  {index + 1}. {item.mercado}
                </div>

                <div className="text-xs font-black text-blue-400">
                  {item.confianca.toFixed(0)}%
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
                <span>Value médio +{item.value.toFixed(1)}%</span>
                <span>Taxa {item.taxa.toFixed(0)}%</span>
              </div>

              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: Math.min(96, Math.max(12, item.confianca)) + '%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 mb-5 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <div className="text-xs font-black text-amber-300 uppercase">Leitura correta</div>
          <div className="text-[11px] text-amber-100/70 font-semibold mt-1 leading-relaxed">
            Performance demonstrativa não garante lucro. Use sempre controle de banca e risco.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={perguntarIA}
          className="h-14 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          Perguntar IA
        </button>

        <button
          type="button"
          onClick={() => setViewMode?.('historico-ia')}
          className="h-14 rounded-2xl bg-[#0f172a] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Histórico
        </button>
      </div>
    </div>
  );
}
