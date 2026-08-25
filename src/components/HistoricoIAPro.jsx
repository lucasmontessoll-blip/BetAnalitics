import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Trophy,
  XCircle,
} from 'lucide-react';

import {
  atualizarStatusAnaliseIA,
  carregarHistoricoIA,
  limparHistoricoIA,
} from '../utils/historicoIA.js';

function BadgeStatus({ status }) {
  if (status === 'green') {
    return (
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase text-emerald-400">
        Green
      </span>
    );
  }

  if (status === 'red') {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase text-red-400">
        Red
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-[9px] font-black uppercase text-yellow-300">
      Pendente
    </span>
  );
}

function CardResumo({
  icon: Icon,
  label,
  valor,
  cor,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className={`mb-2 h-5 w-5 ${cor}`} />

      <p className="text-[8px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className={`mt-1 text-xl font-black ${cor}`}>
        {valor}
      </p>
    </div>
  );
}

function dataHora(valor) {
  if (!valor) return '-';

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return '-';
  }

  return data.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function percentual(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return '-';
  }

  return `${Number(valor)}%`;
}

export default function HistoricoIAPro() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [acaoId, setAcaoId] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');

    try {
      const dados = await carregarHistoricoIA();
      setLista(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(
        e?.message || 'Falha ao carregar o historico.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const resumo = useMemo(() => {
    const greens = lista.filter(
      (item) => item.status === 'green'
    ).length;

    const reds = lista.filter(
      (item) => item.status === 'red'
    ).length;

    const pendentes = lista.filter(
      (item) =>
        item.status !== 'green' &&
        item.status !== 'red'
    ).length;

    const finalizadas = greens + reds;

    const precisao = finalizadas > 0
      ? Number(((greens / finalizadas) * 100).toFixed(1))
      : null;

    return {
      total: lista.length,
      greens,
      reds,
      pendentes,
      finalizadas,
      precisao,
    };
  }, [lista]);

  async function mudarStatus(id, status) {
    setAcaoId(id);
    setErro('');

    try {
      const atualizado =
        await atualizarStatusAnaliseIA(id, status);

      setLista((atual) =>
        atual.map((item) =>
          item.id === atualizado.id
            ? atualizado
            : item
        )
      );
    } catch (e) {
      setErro(
        e?.message || 'Falha ao atualizar resultado.'
      );
    } finally {
      setAcaoId('');
    }
  }

  async function limparTudo() {
    const confirmar = window.confirm(
      'Apagar todo o seu Historico IA?'
    );

    if (!confirmar) return;

    setLoading(true);
    setErro('');

    try {
      await limparHistoricoIA();
      setLista([]);
    } catch (e) {
      setErro(
        e?.message || 'Falha ao limpar historico.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in pb-28 text-white">

      <section className="rounded-[32px] border border-blue-500/20 bg-gradient-to-br from-blue-950 via-slate-950 to-black p-5 shadow-2xl">

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-blue-300">
            <Activity className="mr-1 h-3 w-3" />
            HistÃ³rico IA PRO
          </span>

          <button
            type="button"
            disabled={loading}
            onClick={() => void carregar()}
            className="rounded-full bg-white/10 p-2 text-white disabled:opacity-50"
            aria-label="Atualizar histÃ³rico"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>

        <h1 className="mt-5 text-3xl font-black leading-tight">
          Performance registrada
        </h1>

        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
          Somente previsÃµes recebidas de uma fonte validada entram neste histÃ³rico.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <CardResumo
            icon={Trophy}
            label="PrecisÃ£o"
            valor={
              resumo.precisao !== null
                ? `${resumo.precisao}%`
                : '-'
            }
            cor="text-emerald-400"
          />

          <CardResumo
            icon={CheckCircle2}
            label="Greens"
            valor={resumo.greens}
            cor="text-emerald-400"
          />

          <CardResumo
            icon={XCircle}
            label="Reds"
            valor={resumo.reds}
            cor="text-red-400"
          />

          <CardResumo
            icon={Clock}
            label="Pendentes"
            valor={resumo.pendentes}
            cor="text-yellow-300"
          />
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-500/10 bg-blue-500/[0.05] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />

          <p className="text-[9px] font-semibold leading-relaxed text-slate-400">
            A precisÃ£o considera somente registros marcados como Green ou Red. Nesta etapa, o resultado Ã© confirmado manualmente; previsÃ£o, probabilidade e odd registradas vÃªm dos dados carregados para a partida.
          </p>
        </div>

      </section>

      {erro && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[10px] font-bold text-red-300">
          {erro}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">
            PrevisÃµes registradas
          </h2>

          <p className="text-xs font-bold text-slate-400">
            {resumo.total} registro(s) da sua conta
          </p>
        </div>

        {lista.length > 0 && (
          <button
            type="button"
            onClick={() => void limparTudo()}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 text-[9px] font-black uppercase text-red-400 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>

      {loading && lista.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-[#0f172a] p-7 text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-400" />
          <p className="mt-4 text-sm font-black">
            Carregando seu histÃ³rico...
          </p>
        </div>
      ) : lista.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-white/10 bg-[#0f172a] p-6 text-center">
          <Database className="mx-auto h-9 w-9 text-slate-500" />

          <h3 className="mt-4 text-lg font-black">
            Nenhuma previsÃ£o real registrada
          </h3>

          <p className="mt-2 text-sm font-semibold text-slate-400">
            Abra uma partida que possua previsÃ£o disponÃ­vel. O registro serÃ¡ feito depois que os dados reais forem carregados.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {lista.map((item) => {
            const atualizando = acaoId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl"
              >

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black">
                      {item.jogo ||
                        `${item.casa || 'Mandante'} x ${item.fora || 'Visitante'}`}
                    </h3>

                    <p className="mt-1 truncate text-[10px] font-bold text-slate-500">
                      {item.liga || 'CompetiÃ§Ã£o'}
                    </p>
                  </div>

                  <BadgeStatus status={item.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[8px] font-black uppercase text-slate-500">
                      Probabilidade
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {percentual(item.confianca)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[8px] font-black uppercase text-slate-500">
                      Odd
                    </p>

                    <p className="mt-1 text-lg font-black text-yellow-300">
                      {item.odd !== null &&
                      item.odd !== undefined
                        ? Number(item.odd).toFixed(2)
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/[0.035] px-2 py-2">
                    <p className="text-[7px] font-bold uppercase text-slate-600">
                      Casa
                    </p>
                    <p className="mt-1 text-[11px] font-black text-blue-300">
                      {percentual(item.prob_casa)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.035] px-2 py-2">
                    <p className="text-[7px] font-bold uppercase text-slate-600">
                      Empate
                    </p>
                    <p className="mt-1 text-[11px] font-black text-slate-200">
                      {percentual(item.prob_empate)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.035] px-2 py-2">
                    <p className="text-[7px] font-bold uppercase text-slate-600">
                      Fora
                    </p>
                    <p className="mt-1 text-[11px] font-black text-amber-300">
                      {percentual(item.prob_fora)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-white/5 p-4">
                  <p className="text-[8px] font-black uppercase text-slate-500">
                    Mercado registrado
                  </p>

                  <p className="mt-1 text-sm font-black text-emerald-400">
                    {item.mercado || 'Sem mercado informado'}
                  </p>

                  <p className="mt-2 text-[8px] font-semibold text-slate-600">
                    Registrado em {dataHora(item.criado_em)}
                  </p>

                  <p className="mt-1 text-[8px] font-semibold text-slate-600">
                    Fonte: {item.fonte_confianca || '-'}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={atualizando}
                    onClick={() =>
                      void mudarStatus(item.id, 'green')
                    }
                    className="rounded-2xl bg-emerald-500/10 px-3 py-3 text-[9px] font-black uppercase text-emerald-400 disabled:opacity-40"
                  >
                    Green
                  </button>

                  <button
                    type="button"
                    disabled={atualizando}
                    onClick={() =>
                      void mudarStatus(item.id, 'pendente')
                    }
                    className="rounded-2xl bg-yellow-400/10 px-3 py-3 text-[9px] font-black uppercase text-yellow-300 disabled:opacity-40"
                  >
                    Pendente
                  </button>

                  <button
                    type="button"
                    disabled={atualizando}
                    onClick={() =>
                      void mudarStatus(item.id, 'red')
                    }
                    className="rounded-2xl bg-red-500/10 px-3 py-3 text-[9px] font-black uppercase text-red-400 disabled:opacity-40"
                  >
                    Red
                  </button>
                </div>

              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
