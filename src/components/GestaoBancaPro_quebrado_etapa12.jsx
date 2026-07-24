import React, { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  PlusCircle,
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Crown
} from 'lucide-react';

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function carregarEntradas() {
  try {
    const dados = JSON.parse(localStorage.getItem('bet_banca_entradas') || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

bet_banca_entradas') || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarEntradas(entradas) {
  localStorage.setItem('bet_banca_entradas', JSON.stringify(entradas));
}

function CardBanca({ icon: Icon, titulo, valor, subtitulo, cor = 'text-white' }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">
            {titulo}
          </div>

          <div className={`text-xl font-black ${cor}`}>
            {valor}
          </div>

          {subtitulo && (
            <div className="text-[10px] font-bold text-slate-400 mt-1">
              {subtitulo}
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${cor}`} />
        </div>
      </div>
    </div>
  );
}

function LinhaEntrada({ entrada }) {
  const status = entrada.status || 'pendente';

  const statusClasse =
    status === 'green'
      ? 'text-green-400 bg-green-500/10 border-green-500/20'
      : status === 'red'
        ? 'text-red-300 bg-red-500/10 border-red-500/20'
        : 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20';

  const Icon =
    status === 'green'
      ? CheckCircle2
      : status === 'red'
        ? XCircle
        : Clock;

  return (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-black text-white">
            {entrada.jogo}
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-1">
            {entrada.mercado} · odd {Number(entrada.odd).toFixed(2)}
          </div>
        </div>

        <div className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase flex items-center gap-1 ${statusClasse}`}>
          <Icon className="w-3 h-3" />
          {status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-xl p-2">
          <div className="text-[8px] font-black uppercase text-slate-500">Entrada</div>
          <div className="text-xs font-black text-white">{dinheiro(entrada.valor)}</div>
        </div>

        <div className="bg-white/5 rounded-xl p-2">
          <div className="text-[8px] font-black uppercase text-slate-500">Retorno</div>
          <div className="text-xs font-black text-blue-300">{dinheiro(entrada.retorno)}</div>
        </div>

        <div className="bg-white/5 rounded-xl p-2">
          <div className="text-[8px] font-black uppercase text-slate-500">Lucro</div>
          <div className={`text-xs font-black ${entrada.lucro >= 0 ? 'text-green-400' : 'text-red-300'}`}>
            {dinheiro(entrada.lucro)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GestaoBancaPro() {
  const [saldoInicial, setSaldoInicial] = useState(() => {
    return localStorage.getItem('bet_banca_saldo_inicial') || '1000';
  });

  const [valorEntrada, setValorEntrada] = useState('50');
  const [odd, setOdd] = useState('1.85');
  const [jogo, setJogo] = useState('Flamengo x Palmeiras');
  const [mercado, setMercado] = useState('Mais de 1.5 gols');
  const [status, setStatus] = useState('pendente');
  const [entradas, setEntradas] = useState(() => carregarEntradas());

  const resumo = useMemo(() => {
    const inicial = numero(saldoInicial, 1000);

    const lucroTotal = entradas.reduce((acc, item) => acc + numero(item.lucro), 0);
    const investido = entradas.reduce((acc, item) => acc + numero(item.valor), 0);
    const greens = entradas.filter((e) => e.status === 'green').length;
    const reds = entradas.filter((e) => e.status === 'red').length;
    const finalizadas = greens + reds;
    const roi = investido > 0 ? (lucroTotal / investido) * 100 : 0;
    const taxaAcerto = finalizadas > 0 ? (greens / finalizadas) * 100 : 0;
    const saldoAtual = inicial + lucroTotal;

    return {
      inicial,
      saldoAtual,
      lucroTotal,
      investido,
      entradasTotal: entradas.length,
      greens,
      reds,
      roi,
      taxaAcerto
    };
  }, [entradas, saldoInicial]);

  function registrarEntrada() {
    const valor = numero(valorEntrada, 0);
    const oddNum = numero(odd, 1);

    if (valor <= 0 || oddNum <= 1) return;

    let lucro = 0;
    let retorno = 0;

    if (status === 'green') {
      retorno = valor * oddNum;
      lucro = retorno - valor;
    } else if (status === 'red') {
      retorno = 0;
      lucro = -valor;
    } else {
      retorno = valor * oddNum;
      lucro = 0;
    }

    const novaEntrada = {
      id: Date.now(),
      jogo,
      mercado,
      valor,
      odd: oddNum,
      status,
      retorno,
      lucro,
      data: new Date().toLocaleDateString('pt-BR')
    };

    const novas = [novaEntrada, ...entradas].slice(0, 20);

    setEntradas(novas);
    salvarEntradas(novas);
    localStorage.setItem('bet_banca_saldo_inicial', saldoInicial);
  }

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="bg-gradient-to-br from-green-500/20 via-[#0f172a] to-blue-500/10 border border-green-500/30 rounded-[32px] p-5 mb-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-green-300" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Gestão PRO
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              Gestão de Banca
            </h2>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 font-bold leading-relaxed">
          Controle entradas, lucro, ROI, taxa de acerto e evolução da sua banca.
        </p>

        <div className="mt-4 bg-black/20 border border-white/10 rounded-2xl p-3">
          <div className="text-[9px] font-black uppercase text-slate-500 mb-1">
            Saldo atual estimado
          </div>
          <div className={`text-3xl font-black ${resumo.saldoAtual >= resumo.inicial ? 'text-green-400' : 'text-red-300'}`}>
            {dinheiro(resumo.saldoAtual)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <CardBanca
          icon={Wallet}
          titulo="Banca inicial"
          valor={dinheiro(resumo.inicial)}
          subtitulo="valor base"
        />

        <CardBanca
          icon={resumo.lucroTotal >= 0 ? TrendingUp : TrendingDown}
          titulo="Lucro/Prejuízo"
          valor={dinheiro(resumo.lucroTotal)}
          subtitulo="resultado atual"
          cor={resumo.lucroTotal >= 0 ? 'text-green-400' : 'text-red-300'}
        />

        <CardBanca
          icon={BarChart3}
          titulo="ROI"
          valor={`${resumo.roi.toFixed(1)}%`}
          subtitulo="retorno sobre entradas"
          cor={resumo.roi >= 0 ? 'text-blue-400' : 'text-red-300'}
        />

        <CardBanca
          icon={Target}
          titulo="Acerto"
          valor={`${resumo.taxaAcerto.toFixed(1)}%`}
          subtitulo={`${resumo.greens} green / ${resumo.reds} red`}
          cor="text-yellow-300"
        />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-black text-white uppercase">
            Registrar entrada
          </h3>
        </div>

        <div className="space-y-3">
          <input
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
            placeholder="Banca inicial"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none"
          />

          <input
            value={jogo}
            onChange={(e) => setJogo(e.target.value)}
            placeholder="Jogo"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none"
          />

          <input
            value={mercado}
            onChange={(e) => setMercado(e.target.value)}
            placeholder="Mercado"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={valorEntrada}
              onChange={(e) => setValorEntrada(e.target.value)}
              placeholder="Valor"
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none"
            />

            <input
              value={odd}
              onChange={(e) => setOdd(e.target.value)}
              placeholder="Odd"
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['pendente', 'green', 'red'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-2xl px-3 py-3 text-[10px] font-black uppercase border ${
                  status === s
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-black/20 border-white/10 text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={registrarEntrada}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl px-4 py-3 text-xs uppercase flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar entrada
          </button>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase">
            Evolução da banca
          </h3>
        </div>

        <div className="flex items-end gap-2 h-28">
          {[...entradas].slice(0, 8).reverse().map((entrada, index) => {
            const altura = Math.max(16, Math.min(100, 50 + numero(entrada.lucro) / 3));

            return (
              <div key={entrada.id || index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-xl ${entrada.lucro >= 0 ? 'bg-green-500/70' : 'bg-red-500/70'}`}
                  style={{ height: `${altura}%` }}
                />
                <div className="text-[8px] font-black text-slate-500">
                  {index + 1}
                </div>
              </div>
            );
          })}

          {!entradas.length && (
            <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-slate-500">
              Registre entradas para ver a evolução.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase">
            Histórico de entradas
          </h3>

          <span className="text-[10px] font-black text-slate-500">
            {resumo.entradasTotal} registros
          </span>
        </div>

        {entradas.length ? (
          entradas.map((entrada) => (
            <LinhaEntrada key={entrada.id} entrada={entrada} />
          ))
        ) : (
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 text-center">
            <div className="text-sm font-black text-white mb-1">
              Nenhuma entrada registrada
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              Cadastre sua primeira entrada para acompanhar a banca.
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
        <ShieldAlert className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-red-100/80 leading-relaxed">
          Gestão informativa. Não garantimos lucro. Apostas envolvem risco e o usuário é responsável pelas próprias decisões.
        </p>
      </div>
    </div>
  );
}
