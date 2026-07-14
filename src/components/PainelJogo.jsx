import React from 'react';
import { X, Crosshair, Zap } from 'lucide-react';
import ApiFootballMatchCenter from './apiFootball/ApiFootballMatchCenter.jsx';
import AnaliseRigorosaCard from './AnaliseRigorosaCard.jsx';
import MercadosIACard from './MercadosIACard.jsx';

export default function PainelJogo({
  jogo,
  setJogoSelecionado,
  bancaInicial,
  gerarExplicacaoIA,
  calcularStake,
  calcularKelly
}) {
  const melhorOdd = Number(jogo?.odd_casa || jogo?.odd_principal || 1.85);
  const confianca = Number(jogo?.confianca_ia || 50);

  return (
    <div className="px-4 pt-4 pb-28 animate-fade-in w-full">
      <button
        onClick={() => setJogoSelecionado(null)}
        className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-4 bg-[#0f172a] border border-white/10 px-4 py-2 rounded-xl uppercase tracking-wider"
      >
        <X className="w-4 h-4" />
        Voltar
      </button>

      <ApiFootballMatchCenter jogo={jogo} />

      <div className="mt-4 space-y-4">
        <AnaliseRigorosaCard jogo={jogo} />
        <MercadosIACard jogo={jogo} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl text-center min-w-0">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest block mb-1 truncate">
            Stake Recomendada
          </span>
          <strong className="text-lg font-black text-white truncate block">
            R$ {Number(calcularStake?.(bancaInicial, confianca) || 0).toFixed(2)}
          </strong>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-center min-w-0">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-1 truncate">
            Kelly Criterion
          </span>
          <strong className="text-lg font-black text-white truncate block">
            {Number(calcularKelly?.(melhorOdd, confianca) || 0).toFixed(1)}%
          </strong>
        </div>
      </div>

      <div className="bg-[#050816] rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden flex flex-col items-start mt-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-xl rounded-full" />

        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Crosshair className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <h4 className="font-black text-xs text-blue-400 uppercase tracking-widest truncate">
            Relatório IA
          </h4>
        </div>

        {jogo?.explanation ? (
          <div className="text-slate-300 text-xs leading-relaxed relative z-10 font-semibold whitespace-pre-line">
            {jogo.explanation}
          </div>
        ) : (
          <button
            onClick={() => gerarExplicacaoIA?.(jogo)}
            disabled={jogo?.is_loading_explanation}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 relative z-10"
          >
            {jogo?.is_loading_explanation ? (
              <span className="animate-pulse truncate">A calcular motivos...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Gerar Relatório Profissional</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
