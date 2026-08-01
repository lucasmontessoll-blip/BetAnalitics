import React, { useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
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
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

/* BET_ETAPA_32D_BANCA_PREMIUM */

const HISTORY_KEY = 'bet_banca_historico_v2';
const BALANCE_KEY = 'bet_banca_saldo_v2';

const INITIAL_HISTORY = [
  {
    id: 1,
    jogo: 'Flamengo x Palmeiras',
    mercado: 'Mais de 1.5 gols',
    stake: 50,
    odd: 1.82,
    resultado: 'green',
    origem: 'demo'
  },
  {
    id: 2,
    jogo: 'Liverpool x Arsenal',
    mercado: 'Ambos marcam',
    stake: 40,
    odd: 1.95,
    resultado: 'green',
    origem: 'demo'
  },
  {
    id: 3,
    jogo: 'Real Madrid x Barcelona',
    mercado: 'Mais de 2.5 gols',
    stake: 30,
    odd: 2.1,
    resultado: 'red',
    origem: 'demo'
  }
];

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return INITIAL_HISTORY.map((item) => ({ ...item }));

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
      : INITIAL_HISTORY.map((item) => ({ ...item }));
  } catch {
    return INITIAL_HISTORY.map((item) => ({ ...item }));
  }
}

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function isAIEntry(item) {
  return (
    item?.origem === 'historico_ia' ||
    Boolean(item?.id_origem_ia) ||
    String(item?.id || '').startsWith('ia-')
  );
}

function entryProfit(item) {
  const stake = Number(item?.stake || 0);
  const odd = Number(item?.odd || 1);

  if (item?.resultado === 'green') return stake * (odd - 1);
  if (item?.resultado === 'red') return -stake;
  return 0;
}

function StatusBadge({ result }) {
  if (result === 'green') {
    return (
      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-wide text-emerald-300">
        Green
      </span>
    );
  }

  if (result === 'red') {
    return (
      <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-wide text-red-300">
        Red
      </span>
    );
  }

  return (
    <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[7px] font-black uppercase tracking-wide text-slate-500">
      Void
    </span>
  );
}

function SummaryMetric({ icon: Icon, label, value, detail, accent }) {
  return (
    <div className="rounded-[20px] bg-[#0b0e14] px-4 py-4 ring-1 ring-inset ring-white/[0.06]">
      <Icon className={`h-4 w-4 ${accent}`} />
      <p className="mt-3 text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>
      <p className={`mt-1 truncate text-lg font-black tabular-nums ${accent}`}>
        {value}
      </p>
      {detail && (
        <p className="mt-1 truncate text-[8px] font-semibold text-slate-700">
          {detail}
        </p>
      )}
    </div>
  );
}

function InputField({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`h-11 min-w-0 rounded-2xl bg-black/20 px-3 text-[11px] font-semibold text-white outline-none ring-1 ring-inset ring-white/[0.055] placeholder:text-slate-700 focus:ring-emerald-400/25 ${className}`}
    />
  );
}

export default function GestaoBancaPro() {
  const [initialBalance, setInitialBalance] = useState(
    () => Number(localStorage.getItem(BALANCE_KEY) || 1000)
  );
  const [history, setHistory] = useState(loadHistory);
  const [form, setForm] = useState({
    jogo: '',
    mercado: '',
    stake: '',
    odd: '',
    resultado: 'green'
  });

  function saveBalance(value) {
    const numeric = Number(value || 0);
    setInitialBalance(numeric);
    localStorage.setItem(BALANCE_KEY, String(numeric));
  }

  function saveHistory(list) {
    setHistory(list);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }

  const summary = useMemo(() => {
    let profit = 0;
    let totalStake = 0;

    history.forEach((item) => {
      profit += entryProfit(item);

      if (item.resultado === 'green' || item.resultado === 'red') {
        totalStake += Number(item.stake || 0);
      }
    });

    const currentBalance = initialBalance + profit;
    const roi = initialBalance > 0 ? (profit / initialBalance) * 100 : 0;
    const yieldValue = totalStake > 0 ? (profit / totalStake) * 100 : 0;

    const aiEntries = history.filter(isAIEntry);
    const aiGreens = aiEntries.filter(
      (item) => item.resultado === 'green'
    ).length;
    const aiReds = aiEntries.filter(
      (item) => item.resultado === 'red'
    ).length;
    const aiProfit = aiEntries.reduce(
      (sum, item) => sum + entryProfit(item),
      0
    );

    return {
      profit,
      currentBalance,
      roi,
      yieldValue,
      conservativeStake: Math.max(5, currentBalance * 0.01),
      moderateStake: Math.max(10, currentBalance * 0.02),
      entries: history.length,
      aiEntries: aiEntries.length,
      aiGreens,
      aiReds,
      aiProfit
    };
  }, [history, initialBalance]);

  const chartData = useMemo(() => {
    let balance = initialBalance;
    const ordered = [...history].reverse();

    return [
      { nome: 'Início', banca: Number(balance.toFixed(2)) },
      ...ordered.map((item, index) => {
        balance += entryProfit(item);

        return {
          nome: String(index + 1),
          banca: Number(balance.toFixed(2))
        };
      })
    ];
  }, [history, initialBalance]);

  function addEntry() {
    if (!form.jogo.trim() || !form.stake || !form.odd) return;

    const entry = {
      id: Date.now(),
      origem: 'manual',
      jogo: form.jogo.trim(),
      mercado: form.mercado.trim() || 'Mercado IA',
      stake: Number(form.stake),
      odd: Number(form.odd),
      resultado: form.resultado
    };

    saveHistory([entry, ...history]);
    setForm({
      jogo: '',
      mercado: '',
      stake: '',
      odd: '',
      resultado: 'green'
    });
  }

  function removeEntry(id) {
    saveHistory(history.filter((item) => item.id !== id));
  }

  function reloadData() {
    setHistory(loadHistory());
    setInitialBalance(Number(localStorage.getItem(BALANCE_KEY) || 1000));
  }

  return (
    <div className="w-full space-y-6 pb-28 text-white">
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#07110e] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-emerald-400/15 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.20),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(37,99,235,0.10),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <Wallet className="h-3.5 w-3.5" />
              Gestão de banca PRO
            </span>

            <button
              type="button"
              onClick={reloadData}
              aria-label="Atualizar dados da banca"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500 ring-1 ring-inset ring-white/[0.06] transition hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
            Saldo atual
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-white">
            {money(summary.currentBalance)}
          </h1>

          <div className="mt-6 grid grid-cols-2 divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.035] py-3 ring-1 ring-inset ring-white/[0.055]">
            <div className="text-center">
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
                ROI
              </p>
              <p
                className={`mt-1 text-xl font-black tabular-nums ${
                  summary.roi >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {summary.roi > 0 ? '+' : ''}
                {summary.roi.toFixed(1)}%
              </p>
            </div>

            <div className="text-center">
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
                Lucro total
              </p>
              <p
                className={`mt-1 text-xl font-black tabular-nums ${
                  summary.profit >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {money(summary.profit)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 px-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
            Controle de exposição
          </p>
          <h2 className="mt-1 text-base font-black tracking-tight text-white">
            Indicadores da banca
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <SummaryMetric
            icon={Target}
            label="Stake 1%"
            value={money(summary.conservativeStake)}
            detail="perfil conservador"
            accent="text-blue-300"
          />
          <SummaryMetric
            icon={TrendingUp}
            label="Stake 2%"
            value={money(summary.moderateStake)}
            detail="perfil moderado"
            accent="text-violet-300"
          />
          <SummaryMetric
            icon={Bot}
            label="Entradas IA"
            value={summary.aiEntries}
            detail={`${summary.aiGreens} green · ${summary.aiReds} red`}
            accent="text-yellow-300"
          />
          <SummaryMetric
            icon={CheckCircle2}
            label="Lucro IA"
            value={money(summary.aiProfit)}
            detail="origem histórico IA"
            accent={summary.aiProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        <div className="border-b border-white/[0.055] px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-700">
            Evolução financeira
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[11px] font-black text-white">Curva da banca</p>
            <p className="text-[8px] font-black text-slate-600">
              {summary.entries} entradas
            </p>
          </div>
        </div>

        <div className="h-48 px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.045)"
              />
              <XAxis
                dataKey="nome"
                stroke="rgba(148,163,184,0.35)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(148,163,184,0.35)"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <Tooltip
                formatter={(value) => money(value)}
                contentStyle={{
                  background: '#070a10',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  color: '#fff',
                  fontSize: 11
                }}
              />
              <Line
                type="monotone"
                dataKey="banca"
                stroke="#34d399"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-[22px] bg-blue-500/[0.055] px-4 py-4 ring-1 ring-inset ring-blue-500/10">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
        <div>
          <p className="text-[10px] font-black text-blue-200">
            Integração IA → Banca ativa
          </p>
          <p className="mt-1 text-[9px] font-medium leading-relaxed text-blue-100/55">
            Resultados marcados no Histórico IA podem ser adicionados automaticamente com identificação IA PRO.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        <div className="border-b border-white/[0.055] px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-700">
            Novo registro
          </p>
          <p className="mt-1 text-[11px] font-black text-white">
            Adicionar entrada manual
          </p>
        </div>

        <div className="space-y-2.5 px-4 py-4">
          <label className="block">
            <span className="mb-1.5 block text-[8px] font-black uppercase tracking-wider text-slate-700">
              Banca inicial
            </span>
            <InputField
              value={initialBalance}
              onChange={(event) => saveBalance(event.target.value)}
              type="number"
              placeholder="Banca inicial"
              className="w-full"
            />
          </label>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <InputField
              value={form.jogo}
              onChange={(event) =>
                setForm({ ...form, jogo: event.target.value })
              }
              placeholder="Jogo"
            />
            <InputField
              value={form.mercado}
              onChange={(event) =>
                setForm({ ...form, mercado: event.target.value })
              }
              placeholder="Mercado"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <InputField
              value={form.stake}
              onChange={(event) =>
                setForm({ ...form, stake: event.target.value })
              }
              type="number"
              placeholder="Stake"
            />
            <InputField
              value={form.odd}
              onChange={(event) =>
                setForm({ ...form, odd: event.target.value })
              }
              type="number"
              step="0.01"
              placeholder="Odd"
            />
            <select
              value={form.resultado}
              onChange={(event) =>
                setForm({ ...form, resultado: event.target.value })
              }
              className="h-11 min-w-0 rounded-2xl bg-black/20 px-2 text-[10px] font-semibold text-white outline-none ring-1 ring-inset ring-white/[0.055] focus:ring-emerald-400/25"
            >
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="void">Void</option>
            </select>
          </div>

          <button
            type="button"
            onClick={addEntry}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-[9px] font-black uppercase tracking-wide text-white transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Adicionar entrada
          </button>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-[22px] bg-amber-500/[0.055] px-4 py-4 ring-1 ring-inset ring-amber-500/10">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div>
          <p className="text-[10px] font-black text-amber-200">
            Regra de proteção
          </p>
          <p className="mt-1 text-[9px] font-medium leading-relaxed text-amber-100/55">
            Evite ultrapassar 1% a 2% da banca por entrada. Análises não garantem resultado.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
              Histórico
            </p>
            <h2 className="mt-1 text-base font-black tracking-tight text-white">
              Entradas da banca
            </h2>
            <p className="mt-1 text-[10px] font-medium text-slate-600">
              {history.length} entrada(s) registradas
            </p>
          </div>

          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[8px] font-black text-slate-400 ring-1 ring-inset ring-white/[0.06]">
            Yield {summary.yieldValue > 0 ? '+' : ''}
            {summary.yieldValue.toFixed(1)}%
          </span>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
          {history.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-800" />
              <p className="mt-3 text-sm font-black text-slate-400">
                Nenhuma entrada cadastrada
              </p>
            </div>
          ) : (
            history.map((item, index) => {
              const ai = isAIEntry(item);
              const profit = entryProfit(item);

              return (
                <article
                  key={item.id}
                  className={`px-4 py-4 ${
                    index > 0 ? 'border-t border-white/[0.055]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        ai
                          ? 'bg-blue-500/10 text-blue-300'
                          : 'bg-white/[0.035] text-slate-500'
                      }`}
                    >
                      {ai ? (
                        <Bot className="h-4 w-4" />
                      ) : item.resultado === 'green' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[11px] font-black text-white">
                          {item.jogo}
                        </p>
                        <StatusBadge result={item.resultado} />
                      </div>
                      <p className="mt-1 truncate text-[8px] font-semibold text-slate-600">
                        {item.mercado} · {ai ? 'IA PRO' : 'Manual'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeEntry(item.id)}
                      aria-label={`Remover entrada ${item.jogo}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl bg-white/[0.025] py-2.5 text-center">
                    <div>
                      <p className="text-[7px] font-black uppercase text-slate-700">Stake</p>
                      <p className="mt-1 text-[10px] font-black text-slate-300">
                        {money(item.stake)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase text-slate-700">Odd</p>
                      <p className="mt-1 text-[10px] font-black text-yellow-300">
                        {Number(item.odd || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase text-slate-700">Resultado</p>
                      <p
                        className={`mt-1 text-[10px] font-black ${
                          profit >= 0 ? 'text-emerald-300' : 'text-red-300'
                        }`}
                      >
                        {profit > 0 ? '+' : ''}
                        {money(profit)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
