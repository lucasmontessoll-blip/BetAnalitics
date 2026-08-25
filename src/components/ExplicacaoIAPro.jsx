import React, { useMemo } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Database,
  ShieldCheck,
} from 'lucide-react';

import {
  gerarAnaliseExplicavel,
} from '../utils/iaExplicavel.js';

export default function ExplicacaoIAPro({
  jogo = {},
}) {
  const analise = useMemo(
    () => gerarAnaliseExplicavel(jogo),
    [jogo]
  );

  if (!analise.disponivel) {
    return (
      <div className="mt-4 rounded-2xl bg-white/[0.025] p-4 ring-1 ring-inset ring-white/[0.055]">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

          <div>
            <p className="text-[10px] font-black text-slate-300">
              Análise real ainda não disponível
            </p>

            <p className="mt-1 text-[9px] font-medium leading-relaxed text-slate-600">
              O BetAnalytics não cria um percentual quando a fonte de previsão não fornece dados para esta partida.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    casa,
    empate,
    fora,
  } = analise.probabilidades;

  return (
    <div className="mt-4 space-y-3">

      <div className="rounded-2xl bg-white/[0.025] p-4 ring-1 ring-inset ring-white/[0.055]">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-400" />

          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Probabilidades fornecidas
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] text-center">
          <div>
            <p className="text-[8px] font-bold text-slate-600">
              Casa
            </p>

            <p className="mt-1 text-xl font-black text-blue-300">
              {casa !== null ? `${casa}%` : '-'}
            </p>
          </div>

          <div>
            <p className="text-[8px] font-bold text-slate-600">
              Empate
            </p>

            <p className="mt-1 text-xl font-black text-slate-200">
              {empate !== null ? `${empate}%` : '-'}
            </p>
          </div>

          <div>
            <p className="text-[8px] font-bold text-slate-600">
              Fora
            </p>

            <p className="mt-1 text-xl font-black text-amber-300">
              {fora !== null ? `${fora}%` : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.025] p-4 ring-1 ring-inset ring-white/[0.055]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />

          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Por que esta leitura?
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {analise.fatores.map(
            (fator, index) => (
              <div
                key={`${index}-${fator}`}
                className="flex items-start gap-2"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />

                <p className="text-[9px] font-medium leading-relaxed text-slate-400">
                  {fator}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-1 text-[8px] font-bold text-slate-600">
        <Database className="h-3.5 w-3.5" />

        Fonte da probabilidade: {analise.fonte}
      </div>

    </div>
  );
}
