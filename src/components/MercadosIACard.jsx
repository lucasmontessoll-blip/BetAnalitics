import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, ChevronDown, ShieldCheck, Target, TrendingUp, Zap } from 'lucide-react';
import { analisarMercadosDoJogo } from '../utils/mercados.js';

function MercadoLinha({ mercado, compacto = false }) {
  const cor = mercado.qualidade === 'EV+ Forte' || mercado.qualidade === 'Forte'
    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
    : mercado.qualidade === 'Boa'
      ? 'text-blue-400 border-blue-500/20 bg-blue-500/10'
      : mercado.risco === 'Alto'
        ? 'text-red-400 border-red-500/20 bg-red-500/10'
        : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';

  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{mercado.categoria} • {mercado.mercado}</div>
          <div className="text-xs font-black text-white leading-snug mt-1">{mercado.selecao}</div>
        </div>
        <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border whitespace-nowrap ${cor}`}>{mercado.qualidade}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3">
        <div>
          <div className="text-[8px] font-black uppercase text-slate-500">Chance</div>
          <div className="text-sm font-black text-emerald-400">{mercado.prob}%</div>
        </div>
        <div>
          <div className="text-[8px] font-black uppercase text-slate-500">Odd justa</div>
          <div className="text-sm font-black text-white">{mercado.oddJusta}</div>
        </div>
        <div>
          <div className="text-[8px] font-black uppercase text-slate-500">Entrar ≥</div>
          <div className="text-sm font-black text-yellow-400">{mercado.oddMinima}</div>
        </div>
        <div>
          <div className="text-[8px] font-black uppercase text-slate-500">Risco</div>
          <div className={`text-sm font-black ${mercado.risco === 'Alto' ? 'text-red-400' : mercado.risco === 'Baixo' ? 'text-emerald-400' : 'text-blue-400'}`}>{mercado.risco}</div>
        </div>
      </div>

      {!compacto && (
        <div className="mt-2 text-[10px] font-semibold text-slate-400 leading-relaxed">{mercado.motivo}</div>
      )}
    </div>
  );
}

export default function MercadosIACard({ jogo }) {
  const [aberto, setAberto] = useState(false);
  const dados = useMemo(() => analisarMercadosDoJogo(jogo), [jogo]);
  const melhores = dados.valueBets.slice(0, aberto ? 8 : 3);
  const evitar = dados.evitar.slice(0, aberto ? 3 : 1);

  return (
    <div className="mt-4 bg-[#050816]/70 border border-white/10 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Target className="w-3 h-3 text-emerald-400" /> Mercados IA
          </div>
          <div className="text-sm font-black text-white mt-1">Oportunidades por mercado da casa</div>
          <div className="text-[10px] font-bold text-slate-500 mt-1">Resultado, gols, escanteios, cartões, jogadores, ao vivo e múltiplas.</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-black text-emerald-400">{dados.resumo.fortes}</div>
          <div className="text-[8px] font-black text-slate-500 uppercase">fortes</div>
        </div>
      </div>

      {dados.melhorEntrada && (
        <div className="mb-3 rounded-2xl p-3 bg-gradient-to-br from-emerald-500/15 to-blue-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-400 mb-1"><Zap className="w-3 h-3" /> Melhor leitura do jogo</div>
          <MercadoLinha mercado={dados.melhorEntrada} compacto />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5">
          <div className="text-[8px] font-black uppercase text-slate-500">Mercados analisados</div>
          <div className="text-lg font-black text-white">{dados.resumo.totalMercados}</div>
        </div>
        <div className="bg-[#0f172a] rounded-xl p-3 border border-white/5">
          <div className="text-[8px] font-black uppercase text-slate-500">Alertas ao vivo</div>
          <div className="text-lg font-black text-red-400">{dados.resumo.vivos}</div>
        </div>
      </div>

      <div className="space-y-2">
        {melhores.map(mercado => <MercadoLinha key={mercado.id} mercado={mercado} />)}
      </div>

      {evitar.length > 0 && (
        <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-400 mb-2"><AlertTriangle className="w-3 h-3" /> Mercados perigosos</div>
          <div className="space-y-2">
            {evitar.map(m => (
              <div key={`evitar-${m.id}`} className="text-[10px] font-bold text-slate-300 leading-relaxed">
                <span className="text-red-300 font-black">Evitar:</span> {m.mercado} / {m.selecao} — {m.alerta}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setAberto(v => !v); }}
        className="mt-3 w-full rounded-xl bg-white/5 border border-white/10 py-2.5 text-[10px] font-black uppercase text-slate-300 flex items-center justify-center gap-2 active:scale-95"
      >
        {aberto ? 'Ver menos mercados' : 'Ver mais mercados'} <ChevronDown className={`w-3 h-3 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      <div className="mt-3 flex items-start gap-1.5 text-[9px] text-slate-500 font-semibold leading-relaxed">
        <ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />
        O app calcula chance, odd justa, odd mínima, risco e mercado a evitar. Não é garantia de resultado.
      </div>
    </div>
  );
}
