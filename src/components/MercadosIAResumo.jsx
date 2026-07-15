import { useMemo } from 'react';
import { AlertTriangle, Target, TrendingUp, Zap } from 'lucide-react';
import { analisarRadarMercados } from '../utils/mercados.js';

export default function MercadosIAResumo({ jogos = [], onSelecionarJogo }) {
  const mercados = useMemo(() => analisarRadarMercados(jogos), [jogos]);

  if (!mercados.length) {
    return (
      <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5">
        <h3 className="text-white font-black text-sm flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-emerald-400" /> Mercados IA</h3>
        <p className="text-xs text-slate-500 font-bold">Nenhum mercado forte detectado agora.</p>
      </div>
    );
  }

  const top = mercados[0];

  return (
    <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-emerald-500/20 relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-white font-black text-sm flex items-center gap-2"><Target className="w-5 h-5 text-emerald-400" /> Mercados IA</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Melhores leituras entre todos os jogos.</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-emerald-400">{mercados.length}</div>
            <div className="text-[8px] font-black text-slate-500 uppercase">sinais</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelecionarJogo?.(top.origemJogo)}
          className="w-full text-left rounded-2xl p-4 bg-gradient-to-br from-emerald-500/15 to-blue-500/10 border border-emerald-500/20 mb-3 active:scale-[0.99]"
        >
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-400 mb-1"><Zap className="w-3 h-3" /> Melhor mercado agora</div>
          <div className="text-sm font-black text-white">{top.jogo}</div>
          <div className="text-xs font-bold text-slate-300 mt-1">{top.mercado}: {top.selecao}</div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div><div className="text-[8px] text-slate-500 font-black uppercase">Chance</div><div className="text-sm font-black text-emerald-400">{top.prob}%</div></div>
            <div><div className="text-[8px] text-slate-500 font-black uppercase">Justa</div><div className="text-sm font-black text-white">{top.oddJusta}</div></div>
            <div><div className="text-[8px] text-slate-500 font-black uppercase">Entrar ≥</div><div className="text-sm font-black text-yellow-400">{top.oddMinima}</div></div>
            <div><div className="text-[8px] text-slate-500 font-black uppercase">Risco</div><div className="text-sm font-black text-blue-400">{top.risco}</div></div>
          </div>
        </button>

        <div className="space-y-2">
          {mercados.slice(1, 5).map((m) => (
            <button key={`${m.jogoId}-${m.id}`} type="button" onClick={() => onSelecionarJogo?.(m.origemJogo)} className="w-full bg-[#050816] border border-white/5 rounded-2xl p-3 text-left active:scale-[0.99]">
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-500 font-black uppercase truncate">{m.jogo}</div>
                  <div className="text-xs text-white font-black truncate">{m.mercado}: {m.selecao}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-emerald-400">{m.prob}%</div>
                  <div className="text-[8px] text-slate-500 font-black uppercase">{m.qualidade}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-1.5 text-[9px] text-slate-500 font-semibold leading-relaxed">
          <AlertTriangle className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
          Use como analise de valor e risco. Apostas envolvem risco e nao existe garantia de acerto.
        </div>
      </div>
    </div>
  );
}
