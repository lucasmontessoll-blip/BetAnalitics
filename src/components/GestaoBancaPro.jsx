import React, { useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ShieldAlert,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CHAVE_BANCA = 'bet_banca_historico_v2';
const CHAVE_SALDO = 'bet_banca_saldo_v2';

const inicial = [
  { id: 1, jogo: 'Flamengo x Palmeiras', mercado: 'Mais de 1.5 gols', stake: 50, odd: 1.82, resultado: 'green', origem: 'demo' },
  { id: 2, jogo: 'Liverpool x Arsenal', mercado: 'Ambos marcam', stake: 40, odd: 1.95, resultado: 'green', origem: 'demo' },
  { id: 3, jogo: 'Real Madrid x Barcelona', mercado: 'Mais de 2.5 gols', stake: 30, odd: 2.10, resultado: 'red', origem: 'demo' }
];

function carregarHistorico() {
  try {
    const raw = localStorage.getItem(CHAVE_BANCA);

    if (!raw) return inicial;

    const dados = JSON.parse(raw);

    return Array.isArray(dados) ? dados : inicial;
  } catch {
    return inicial;
  }
}

function dinheiro(valor) {
  const n = Number(valor || 0);

  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function ehEntradaIA(item) {
  return (
    item?.origem === 'historico_ia' ||
    Boolean(item?.id_origem_ia) ||
    String(item?.id || '').startsWith('ia-')
  );
}

function calcularLucroItem(item) {
  const stake = Number(item?.stake || 0);
  const odd = Number(item?.odd || 1);

  if (item?.resultado === 'green') {
    return stake * (odd - 1);
  }

  if (item?.resultado === 'red') {
    return -stake;
  }

  return 0;
}

function StatusBadge({ resultado }) {
  if (resultado === 'green') {
    return (
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-400">
        Green
      </span>
    );
  }

  if (resultado === 'red') {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase text-red-400">
        Red
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-500/10 px-3 py-1 text-[10px] font-black uppercase text-slate-300">
      Void
    </span>
  );
}

function CardResumo({ icon: Icon, titulo, valor, detalhe, cor = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Icon className={`h-5 w-5 ${cor}`} />
      </div>

      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
        {titulo}
      </p>

      <p className={`mt-1 text-xl font-black ${cor}`}>
        {valor}
      </p>

      {detalhe && (
        <p className="mt-1 text-[10px] font-bold text-slate-500">
          {detalhe}
        </p>
      )}
    </div>
  );
}

export default function GestaoBancaPro() {
  const [saldoInicial, setSaldoInicial] = useState(() => Number(localStorage.getItem(CHAVE_SALDO) || 1000));
  const [historico, setHistorico] = useState(carregarHistorico);
  const [form, setForm] = useState({
    jogo: '',
    mercado: '',
    stake: '',
    odd: '',
    resultado: 'green'
  });

  function salvarSaldo(valor) {
    const n = Number(valor || 0);
    setSaldoInicial(n);
    localStorage.setItem(CHAVE_SALDO, String(n));
  }

  function salvarHistorico(lista) {
    setHistorico(lista);
    localStorage.setItem(CHAVE_BANCA, JSON.stringify(lista));
  }

  const resumo = useMemo(() => {
    let lucro = 0;
    let stakeTotal = 0;

    for (const item of historico) {
      lucro += calcularLucroItem(item);

      if (item.resultado === 'green' || item.resultado === 'red') {
        stakeTotal += Number(item.stake || 0);
      }
    }

    const bancaAtual = saldoInicial + lucro;
    const roi = saldoInicial > 0 ? (lucro / saldoInicial) * 100 : 0;
    const yieldApostas = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;

    const entradasIA = historico.filter(ehEntradaIA);
    const greensIA = entradasIA.filter((item) => item.resultado === 'green').length;
    const redsIA = entradasIA.filter((item) => item.resultado === 'red').length;
    const lucroIA = entradasIA.reduce((soma, item) => soma + calcularLucroItem(item), 0);

    return {
      lucro,
      bancaAtual,
      roi,
      yieldApostas,
      stakeConservadora: Math.max(5, bancaAtual * 0.01),
      stakeModerada: Math.max(10, bancaAtual * 0.02),
      entradas: historico.length,
      entradasIA: entradasIA.length,
      greensIA,
      redsIA,
      lucroIA
    };
  }, [historico, saldoInicial]);

  const grafico = useMemo(() => {
    let banca = saldoInicial;
    const ordem = [...historico].reverse();

    return [
      { nome: 'Inicio', banca: Number(banca.toFixed(2)) },
      ...ordem.map((item, index) => {
        banca += calcularLucroItem(item);

        return {
          nome: String(index + 1),
          banca: Number(banca.toFixed(2))
        };
      })
    ];
  }, [historico, saldoInicial]);

  function adicionar() {
    if (!form.jogo.trim() || !form.stake || !form.odd) return;

    const novo = {
      id: Date.now(),
      origem: 'manual',
      jogo: form.jogo.trim(),
      mercado: form.mercado.trim() || 'Mercado IA',
      stake: Number(form.stake),
      odd: Number(form.odd),
      resultado: form.resultado
    };

    salvarHistorico([novo, ...historico]);
    setForm({ jogo: '', mercado: '', stake: '', odd: '', resultado: 'green' });
  }

  function remover(id) {
    salvarHistorico(historico.filter((item) => item.id !== id));
  }

  function recarregar() {
    setHistorico(carregarHistorico());
    setSaldoInicial(Number(localStorage.getItem(CHAVE_SALDO) || 1000));
  }

  return (
    <div className="space-y-5 pb-28 text-white">
      <section className="rounded-[32px] border border-emerald-400/20 bg-gradient-to-br from-emerald-700 via-slate-950 to-black p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-200">
            <Wallet className="mr-1 h-3 w-3" />
            Gestao de Banca PRO
          </span>

          <button
            type="button"
            onClick={recarregar}
            className="rounded-full bg-white/10 p-2 text-white"
            aria-label="Atualizar banca"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100/70">
          Banca atual
        </p>

        <h1 className="mt-2 text-4xl font-black">
          {dinheiro(resumo.bancaAtual)}
        </h1>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-[9px] font-black uppercase text-emerald-100/70">ROI</p>
            <p className={`mt-1 text-2xl font-black ${resumo.roi >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
              {resumo.roi > 0 ? '+' : ''}{resumo.roi.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-[9px] font-black uppercase text-emerald-100/70">Lucro total</p>
            <p className={`mt-1 text-2xl font-black ${resumo.lucro >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
              {dinheiro(resumo.lucro)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <CardResumo
          icon={Target}
          titulo="Stake 1%"
          valor={dinheiro(resumo.stakeConservadora)}
          detalhe="perfil conservador"
          cor="text-blue-400"
        />

        <CardResumo
          icon={TrendingUp}
          titulo="Stake 2%"
          valor={dinheiro(resumo.stakeModerada)}
          detalhe="perfil moderado"
          cor="text-purple-400"
        />

        <CardResumo
          icon={Bot}
          titulo="Entradas IA"
          valor={resumo.entradasIA}
          detalhe={`${resumo.greensIA} green / ${resumo.redsIA} red`}
          cor="text-yellow-300"
        />

        <CardResumo
          icon={CheckCircle2}
          titulo="Lucro IA"
          valor={dinheiro(resumo.lucroIA)}
          detalhe="vindo do Historico IA"
          cor={resumo.lucroIA >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Evolucao da banca
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="nome" stroke="rgba(255,255,255,0.35)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} />
              <Tooltip
                formatter={(value) => dinheiro(value)}
                contentStyle={{
                  background: '#050816',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="banca" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <Bot className="mt-1 h-5 w-5 shrink-0 text-blue-300" />

          <div>
            <h2 className="text-sm font-black uppercase text-blue-200">
              Integracao IA → Banca ativa
            </h2>

            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-300">
              Quando voce marca uma analise como Green ou Red no Historico IA PRO, ela entra automaticamente aqui com selo IA PRO.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-4">
        <div className="mb-3 text-sm font-black text-white">
          Nova entrada manual
        </div>

        <div className="space-y-2">
          <input
            value={saldoInicial}
            onChange={(e) => salvarSaldo(e.target.value)}
            type="number"
            className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-3 text-sm outline-none"
            placeholder="Banca inicial"
          />

          <input
            value={form.jogo}
            onChange={(e) => setForm({ ...form, jogo: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-3 text-sm outline-none"
            placeholder="Jogo"
          />

          <input
            value={form.mercado}
            onChange={(e) => setForm({ ...form, mercado: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-3 text-sm outline-none"
            placeholder="Mercado"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              value={form.stake}
              onChange={(e) => setForm({ ...form, stake: e.target.value })}
              type="number"
              className="rounded-2xl border border-white/10 bg-[#050816] px-3 py-3 text-sm outline-none"
              placeholder="Stake"
            />

            <input
              value={form.odd}
              onChange={(e) => setForm({ ...form, odd: e.target.value })}
              type="number"
              step="0.01"
              className="rounded-2xl border border-white/10 bg-[#050816] px-3 py-3 text-sm outline-none"
              placeholder="Odd"
            />

            <select
              value={form.resultado}
              onChange={(e) => setForm({ ...form, resultado: e.target.value })}
              className="rounded-2xl border border-white/10 bg-[#050816] px-3 py-3 text-sm outline-none"
            >
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="void">Void</option>
            </select>
          </div>

          <button
            type="button"
            onClick={adicionar}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-black"
          >
            <Plus className="h-4 w-4" />
            Adicionar entrada
          </button>
        </div>
      </section>

      <section className="flex gap-3 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />

        <div>
          <div className="text-xs font-black uppercase text-amber-300">
            Regra de protecao
          </div>

          <div className="mt-1 text-[11px] font-semibold text-amber-100/70">
            Evite ultrapassar 1% a 2% da banca por entrada. Analise nao e garantia de resultado.
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">
              Entradas da banca
            </h2>

            <p className="text-xs font-bold text-slate-500">
              {historico.length} entrada(s) registradas
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 px-3 py-2 text-[10px] font-black uppercase text-slate-400">
            Yield {resumo.yieldApostas > 0 ? '+' : ''}{resumo.yieldApostas.toFixed(1)}%
          </div>
        </div>

        {historico.map((item) => {
          const isIA = ehEntradaIA(item);
          const lucroItem = calcularLucroItem(item);

          return (
            <article
              key={item.id}
              className={`rounded-3xl border p-4 shadow-xl ${
                isIA
                  ? 'border-blue-400/20 bg-blue-500/10'
                  : 'border-white/10 bg-[#0f172a]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {isIA && (
                      <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[9px] font-black uppercase text-blue-300">
                        <Bot className="mr-1 h-3 w-3" />
                        IA PRO
                      </span>
                    )}

                    {!isIA && (
                      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase text-slate-300">
                        Manual
                      </span>
                    )}

                    <StatusBadge resultado={item.resultado} />
                  </div>

                  <h3 className="truncate text-sm font-black text-white">
                    {item.jogo}
                  </h3>

                  <p className="mt-1 truncate text-[11px] font-bold text-slate-400">
                    {item.mercado}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => remover(item.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-black/20 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Stake</p>
                  <p className="mt-1 text-sm font-black">{dinheiro(item.stake)}</p>
                </div>

                <div className="rounded-2xl bg-black/20 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Odd</p>
                  <p className="mt-1 text-sm font-black text-yellow-300">{Number(item.odd || 0).toFixed(2)}</p>
                </div>

                <div className="rounded-2xl bg-black/20 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Lucro</p>
                  <p className={`mt-1 text-sm font-black ${lucroItem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dinheiro(lucroItem)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        {historico.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 text-center">
            <Clock className="mx-auto h-10 w-10 text-slate-500" />
            <h3 className="mt-4 text-lg font-black">Nenhuma entrada ainda</h3>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Adicione uma entrada manual ou marque uma analise IA como Green/Red.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
