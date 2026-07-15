import { Target, TrendingUp, ShieldCheck } from 'lucide-react';

function pct(v) {
  if (v === undefined || v === null || v === '') return '-';
  return String(v).replace('%', '') + '%';
}

function Linha({ label, casa, empate, fora }) {
  return (
    <div className="bg-[#050816] rounded-2xl border border-white/5 p-3">
      <div className="text-[9px] font-black uppercase text-slate-500 mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Casa</div>
          <div className="text-sm font-black text-blue-400">{pct(casa)}</div>
        </div>
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Empate</div>
          <div className="text-sm font-black text-yellow-400">{pct(empate)}</div>
        </div>
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Fora</div>
          <div className="text-sm font-black text-emerald-400">{pct(fora)}</div>
        </div>
      </div>
    </div>
  );
}

export default function PredicoesCard({ prediction }) {
  if (!prediction) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Previsoes ainda nao disponiveis para esta partida.
      </div>
    );
  }

  const pred = prediction.predictions || {};
  const winner = pred.winner || {};
  const percent = pred.percent || {};
  const comparison = prediction.comparison || {};

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            Previsao API-Football
          </div>
          <div className="text-sm font-black text-white mt-1">
            {winner?.name ? `Favorito: ${winner.name}` : 'Leitura preditiva'}
          </div>
        </div>

        <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border ${
          winner?.comment === 'Win or draw'
            ? 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10'
            : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
        }`}>
          {winner?.comment || 'Predicao'}
        </div>
      </div>

      {pred.advice && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3 mb-3">
          <div className="text-[9px] font-black uppercase text-purple-300 mb-1">Conselho da API</div>
          <div className="text-xs font-bold text-slate-200 leading-relaxed">{pred.advice}</div>
        </div>
      )}

      <Linha label="Probabilidades da API" casa={percent.home} empate={percent.draw} fora={percent.away} />

      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          ['Forma', comparison.form?.home, comparison.form?.away],
          ['Ataque', comparison.att?.home, comparison.att?.away],
          ['Defesa', comparison.def?.home, comparison.def?.away],
          ['Gols', comparison.goals?.home, comparison.goals?.away],
          ['H2H', comparison.h2h?.home, comparison.h2h?.away],
          ['Total', comparison.total?.home, comparison.total?.away],
        ].map(([label, home, away]) => (
          <div key={label} className="bg-[#050816] border border-white/5 rounded-xl p-3">
            <div className="text-[8px] font-black uppercase text-slate-500">{label}</div>
            <div className="flex justify-between text-xs font-black mt-1">
              <span className="text-blue-400">{pct(home)}</span>
              <span className="text-emerald-400">{pct(away)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[9px] text-slate-500 font-semibold leading-relaxed">
        <ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />
        Previsao oficial da API-Football combinada com o motor proprio do BetAnalytics. Nao e garantia de resultado.
      </div>
    </div>
  );
}
