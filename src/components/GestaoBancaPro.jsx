import React, { useMemo, useState } from 'react';
import { Wallet, Plus, Trash2, TrendingUp, ShieldAlert } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const inicial = [
  { id: 1, jogo: 'Flamengo x Palmeiras', mercado: 'Mais de 1.5 gols', stake: 50, odd: 1.82, resultado: 'green' },
  { id: 2, jogo: 'Liverpool x Arsenal', mercado: 'Ambos marcam', stake: 40, odd: 1.95, resultado: 'green' },
  { id: 3, jogo: 'Real Madrid x Barcelona', mercado: 'Mais de 2.5 gols', stake: 30, odd: 2.10, resultado: 'red' },
];

function carregarHistorico() {
  try {
    return JSON.parse(localStorage.getItem('bet_banca_historico_v2') || 'null') || inicial;
  } catch {
    return inicial;
  }
}

export default function GestaoBancaPro() {
  const [saldoInicial, setSaldoInicial] = useState(() => Number(localStorage.getItem('bet_banca_saldo_v2') || 1000));
  const [historico, setHistorico] = useState(carregarHistorico);
  const [form, setForm] = useState({ jogo: '', mercado: '', stake: '', odd: '', resultado: 'green' });

  const salvarSaldo = (v) => {
    const n = Number(v || 0);
    setSaldoInicial(n);
    localStorage.setItem('bet_banca_saldo_v2', String(n));
  };

  const salvarHistorico = (lista) => {
    setHistorico(lista);
    localStorage.setItem('bet_banca_historico_v2', JSON.stringify(lista));
  };

  const resumo = useMemo(() => {
    let lucro = 0;

    for (const item of historico) {
      const stake = Number(item.stake || 0);
      const odd = Number(item.odd || 1);

      if (item.resultado === 'green') lucro += stake * (odd - 1);
      if (item.resultado === 'red') lucro -= stake;
    }

    const bancaAtual = saldoInicial + lucro;
    const roi = saldoInicial > 0 ? (lucro / saldoInicial) * 100 : 0;
    const stakeConservadora = Math.max(5, bancaAtual * 0.01);
    const stakeModerada = Math.max(10, bancaAtual * 0.02);

    return { lucro, bancaAtual, roi, stakeConservadora, stakeModerada };
  }, [historico, saldoInicial]);

  const grafico = useMemo(() => {
    let banca = saldoInicial;

    return [
      { nome: 'Inicio', banca: Number(banca.toFixed(2)) },
      ...historico.map((item, index) => {
        const stake = Number(item.stake || 0);
        const odd = Number(item.odd || 1);
        if (item.resultado === 'green') banca += stake * (odd - 1);
        if (item.resultado === 'red') banca -= stake;

        return {
          nome: String(index + 1),
          banca: Number(banca.toFixed(2)),
        };
      }),
    ];
  }, [historico, saldoInicial]);

  const adicionar = () => {
    if (!form.jogo.trim() || !form.stake || !form.odd) return;

    const novo = {
      id: Date.now(),
      jogo: form.jogo.trim(),
      mercado: form.mercado.trim() || 'Mercado IA',
      stake: Number(form.stake),
      odd: Number(form.odd),
      resultado: form.resultado,
    };

    salvarHistorico([novo, ...historico]);
    setForm({ jogo: '', mercado: '', stake: '', odd: '', resultado: 'green' });
  };

  const remover = (id) => {
    salvarHistorico(historico.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-slate-900 border border-emerald-400/20 p-5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-3">
          <Wallet className="w-4 h-4" />
          Gestao de Banca PRO
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-emerald-100/70 font-bold uppercase">Banca atual</div>
            <div className="text-3xl font-black">R$ {resumo.bancaAtual.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-100/70 font-bold uppercase">ROI</div>
            <div className={`text-3xl font-black ${resumo.roi >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
              {resumo.roi.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] text-slate-500 font-black uppercase">Lucro</div>
          <div className={`text-lg font-black ${resumo.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            R$ {resumo.lucro.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] text-slate-500 font-black uppercase">Stake 1%</div>
          <div className="text-lg font-black text-blue-400">R$ {resumo.stakeConservadora.toFixed(2)}</div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] text-slate-500 font-black uppercase">Stake 2%</div>
          <div className="text-lg font-black text-purple-400">R$ {resumo.stakeModerada.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
        <div className="text-sm font-black text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Evolucao da banca
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="nome" stroke="rgba(255,255,255,0.35)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} />
              <Tooltip contentStyle={{ background: '#050816', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="banca" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
        <div className="text-sm font-black text-white mb-3">Nova entrada</div>

        <div className="space-y-2">
          <input value={saldoInicial} onChange={(e) => salvarSaldo(e.target.value)} type="number" className="w-full bg-[#050816] border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Banca inicial" />

          <input value={form.jogo} onChange={(e) => setForm({ ...form, jogo: e.target.value })} className="w-full bg-[#050816] border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Jogo" />

          <input value={form.mercado} onChange={(e) => setForm({ ...form, mercado: e.target.value })} className="w-full bg-[#050816] border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Mercado" />

          <div className="grid grid-cols-3 gap-2">
            <input value={form.stake} onChange={(e) => setForm({ ...form, stake: e.target.value })} type="number" className="bg-[#050816] border border-white/10 rounded-2xl px-3 py-3 text-sm outline-none" placeholder="Stake" />
            <input value={form.odd} onChange={(e) => setForm({ ...form, odd: e.target.value })} type="number" step="0.01" className="bg-[#050816] border border-white/10 rounded-2xl px-3 py-3 text-sm outline-none" placeholder="Odd" />
            <select value={form.resultado} onChange={(e) => setForm({ ...form, resultado: e.target.value })} className="bg-[#050816] border border-white/10 rounded-2xl px-3 py-3 text-sm outline-none">
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="void">Void</option>
            </select>
          </div>

          <button onClick={adicionar} className="w-full h-12 rounded-2xl bg-emerald-600 font-black text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar entrada
          </button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <div className="text-xs font-black text-amber-300 uppercase">Regra de protecao</div>
          <div className="text-[11px] text-amber-100/70 font-semibold mt-1">
            Evite ultrapassar 1% a 2% da banca por entrada. Analise nao e garantia de resultado.
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {historico.map((item) => (
          <div key={item.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${item.resultado === 'green' ? 'bg-emerald-500/15 text-emerald-400' : item.resultado === 'red' ? 'bg-red-500/15 text-red-400' : 'bg-slate-500/15 text-slate-400'}`}>
              {item.resultado.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white truncate">{item.jogo}</div>
              <div className="text-[11px] text-slate-500 font-bold truncate">{item.mercado} • R$ {item.stake} • Odd {item.odd}</div>
            </div>

            <button onClick={() => remover(item.id)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
