import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCw,
  Trash2,
  Trophy,
  XCircle
} from 'lucide-react';

import {
  atualizarStatusAnaliseIA,
  carregarHistoricoIA,
  limparHistoricoIA
} from '../utils/historicoIA.js';

function dinheiro(valor) {
  const n = Number(valor || 0);

  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function BadgeStatus({ status }) {
  if (status === 'green') {
    return (
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-400">
        Green
      </span>
    );
  }

  if (status === 'red') {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase text-red-400">
        Red
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
      Pendente
    </span>
  );
}

function CardResumo({ icon: Icon, label, valor, cor }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className={`mb-2 h-5 w-5 ${cor}`} />
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-black ${cor}`}>
        {valor}
      </p>
    </div>
  );
}

export default function HistoricoIAPro() {
  const [lista, setLista] = useState([]);

  function carregar() {
    setLista(carregarHistoricoIA());
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(() => {
    const greens = lista.filter((item) => item.status === 'green').length;
    const reds = lista.filter((item) => item.status === 'red').length;
    const finalizadas = greens + reds;

    const lucro = lista.reduce((soma, item) => soma + Number(item.lucro || 0), 0);

    const stakeTotal = lista
      .filter((item) => item.status === 'green' || item.status === 'red')
      .reduce((soma, item) => soma + Number(item.stake || 0), 0);

    const precisao = finalizadas ? Math.round((greens / finalizadas) * 100) : 0;
    const roi = stakeTotal ? Number(((lucro / stakeTotal) * 100).toFixed(1)) : 0;

    return {
      total: lista.length,
      greens,
      reds,
      precisao,
      lucro,
      roi
    };
  }, [lista]);

  function mudarStatus(id, status) {
    setLista(atualizarStatusAnaliseIA(id, status));
  }

  function limparTudo() {
    const confirmar = window.confirm('Limpar todo o Historico IA deste aparelho?');

    if (!confirmar) return;

    limparHistoricoIA();
    carregar();
  }

  return (
    <div className="animate-fade-in pb-28 text-white">
      <section className="rounded-[32px] border border-blue-500/20 bg-gradient-to-br from-blue-950 via-slate-950 to-black p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-300">
            <Activity className="mr-1 h-3 w-3" />
            Historico IA PRO
          </span>

          <button
            type="button"
            onClick={carregar}
            className="rounded-full bg-white/10 p-2 text-white"
            aria-label="Atualizar historico"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <h1 className="mt-5 text-3xl font-black leading-tight">
          Resultados das analises abertas
        </h1>

        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
          Cada jogo aberto na analise completa entra aqui automaticamente. Depois marque como Green, Red ou Pendente.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <CardResumo icon={Trophy} label="Precisao" valor={`${resumo.precisao}%`} cor="text-emerald-400" />
          <CardResumo icon={Flame} label="Lucro" valor={dinheiro(resumo.lucro)} cor={resumo.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <CardResumo icon={CheckCircle2} label="Greens" valor={resumo.greens} cor="text-emerald-400" />
          <CardResumo icon={XCircle} label="Reds" valor={resumo.reds} cor="text-red-400" />
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
            <span>ROI estimado</span>
            <span className={resumo.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {resumo.roi > 0 ? '+' : ''}{resumo.roi}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.max(5, Math.min(100, resumo.precisao))}%` }}
            />
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">Analises salvas</h2>
          <p className="text-xs font-bold text-slate-400">
            {resumo.total} registro(s) neste aparelho
          </p>
        </div>

        {lista.length > 0 && (
          <button
            type="button"
            onClick={limparTudo}
            className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-[#0f172a] p-6 text-center">
          <Clock className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-4 text-lg font-black">
            Nenhuma analise salva ainda
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Abra a analise completa de um jogo para o Historico IA comecar a registrar.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {lista.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black">
                    {item.jogo}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {item.liga}
                  </p>
                </div>

                <BadgeStatus status={item.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">IA</p>
                  <p className="mt-1 text-lg font-black">{item.confianca}%</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Odd</p>
                  <p className="mt-1 text-lg font-black text-yellow-300">
                    {Number(item.odd || 0).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Lucro</p>
                  <p className={`mt-1 text-lg font-black ${Number(item.lucro || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dinheiro(item.lucro)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">
                  Mercado recomendado
                </p>
                <p className="mt-1 text-sm font-black text-emerald-400">
                  {item.mercado}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => mudarStatus(item.id, 'green')}
                  className="rounded-2xl bg-emerald-500/10 px-3 py-3 text-[10px] font-black uppercase text-emerald-400"
                >
                  Green
                </button>

                <button
                  type="button"
                  onClick={() => mudarStatus(item.id, 'pendente')}
                  className="rounded-2xl bg-yellow-400/10 px-3 py-3 text-[10px] font-black uppercase text-yellow-300"
                >
                  Pendente
                </button>

                <button
                  type="button"
                  onClick={() => mudarStatus(item.id, 'red')}
                  className="rounded-2xl bg-red-500/10 px-3 py-3 text-[10px] font-black uppercase text-red-400"
                >
                  Red
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
