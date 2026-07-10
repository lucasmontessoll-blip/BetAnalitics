import { Target, TrendingUp } from 'lucide-react';
import { analisarProbabilidadeVitoria } from '../utils/probabilidade.js';

export default function AnaliseRigorosaCard({ jogo }) {
  const analise = analisarProbabilidadeVitoria(jogo);
  const corNivel =
    analise.nivel === 'Favorito muito forte'
      ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15'
      : analise.nivel === 'Favorito forte'
        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        : analise.nivel === 'Favorito moderado'
          ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
          : analise.nivel === 'Leve vantagem'
            ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
            : analise.nivel === 'Resultado final'
              ? 'text-purple-300 border-purple-400/40 bg-purple-500/15'
              : 'text-slate-300 border-white/10 bg-white/5';
  return (
    <div className="mt-4 bg-[#050816]/70 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Análise real de probabilidade
            </div>
            <div className="text-sm font-black text-white truncate">
              {analise.favorito}
            </div>
          </div>
        </div>
        <div className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${corNivel}`}>
          {analise.nivel}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-[#0f172a] rounded-xl p-2.5 border border-white/5 text-center">
          <div className="text-[8px] text-slate-500 font-black uppercase">Favor.</div>
          <div className="text-base font-black text-emerald-400">{analise.probabilidade}%</div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-2.5 border border-white/5 text-center">
          <div className="text-[8px] text-slate-500 font-black uppercase">Conf.</div>
          <div className="text-base font-black text-blue-400">{analise.confianca}%</div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-2.5 border border-white/5 text-center">
          <div className="text-[8px] text-slate-500 font-black uppercase">Gols Exp.</div>
          <div className="text-base font-black text-purple-400">{analise.golsEsperados}</div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-2.5 border border-white/5 text-center">
          <div className="text-[8px] text-slate-500 font-black uppercase">Base</div>
          <div className="text-base font-black text-yellow-400">{analise.baseDados}%</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5">
          <div className="text-[8px] text-slate-500 font-black uppercase">Placar provável</div>
          <div className="text-lg font-black text-white">{analise.placarProvavel}</div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5">
          <div className="text-[8px] text-slate-500 font-black uppercase">Gols esperados</div>
          <div className="text-lg font-black text-white">{analise.esperadoCasa} x {analise.esperadoFora}</div>
        </div>
      </div>
      <div className="mb-2">
        <div className="grid grid-cols-3 gap-2 text-[9px] font-black uppercase text-slate-500 mb-1">
          <span className="truncate">{jogo.home_team || 'Casa'} {analise.probCasa}%</span>
          <span className="truncate text-center">Empate {analise.probEmpate}%</span>
          <span className="truncate text-right">{jogo.away_team || 'Fora'} {analise.probFora}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-blue-500" style={{ width: `${analise.probCasa}%` }} />
          <div className="h-full bg-slate-500" style={{ width: `${analise.probEmpate}%` }} />
          <div className="h-full bg-emerald-400" style={{ width: `${analise.probFora}%` }} />
        </div>
      </div>
      {analise.pontosFortes.length > 0 && (
        <div className="mt-3 text-[10px] text-slate-400 font-bold leading-relaxed">
          <span className="text-slate-300 font-black">Fatores que pesaram:</span>{' '}
          {analise.pontosFortes.join(', ')}
        </div>
      )}
      <div className="mt-3 flex items-start gap-1.5 text-[9px] text-slate-500 font-semibold leading-relaxed">
        <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
        {analise.metodo}. Usa 100% dos critérios disponíveis; não existe garantia honesta de 100% no futebol.
      </div>
    </div>
  );
}
