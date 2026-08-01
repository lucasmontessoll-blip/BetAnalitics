import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';

const PLANO_MENSAL = 29.9;

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

function lerArray(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function lerValor(chave, fallback = '') {
  try {
    return localStorage.getItem(chave) || fallback;
  } catch {
    return fallback;
  }
}

function lucroBanca(item) {
  const stake = numero(item?.stake, 0);
  const odd = numero(item?.odd, 1);

  if (item?.resultado === 'green') return stake * (odd - 1);
  if (item?.resultado === 'red') return -stake;

  return 0;
}

function lucroIA(item) {
  if (typeof item?.lucro !== 'undefined') return numero(item.lucro, 0);

  const stake = numero(item?.stake, 50);
  const odd = numero(item?.odd, 1.85);

  if (item?.status === 'green') return stake * (odd - 1);
  if (item?.status === 'red') return -stake;

  return 0;
}

function isAprovado(pagamento) {
  return Boolean(
    pagamento?.aprovado ||
    pagamento?.status === 'approved' ||
    pagamento?.status === 'processed'
  );
}

function isPendente(pagamento) {
  const status = String(pagamento?.status || '').toLowerCase();

  return !isAprovado(pagamento) && (
    status === 'pending' ||
    status.includes('pending') ||
    status.includes('waiting') ||
    status === ''
  );
}

function Card({ titulo, valor, texto, icon: Icon, cor = 'text-white' }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
          {titulo}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Icon className={`h-4 w-4 ${cor}`} />
        </div>
      </div>

      <div className={`truncate text-xl font-black ${cor}`}>
        {valor}
      </div>

      {texto && (
        <div className="mt-1 text-[11px] font-bold text-slate-400">
          {texto}
        </div>
      )}
    </div>
  );
}

function Linha({ nome, valor, cor = 'text-white' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-xs font-bold text-slate-400">
        {nome}
      </span>

      <span className={`text-xs font-black ${cor}`}>
        {valor}
      </span>
    </div>
  );
}

export default function AdminResumoPro({ setViewMode, userData, jogos = [] }) {
  const [refresh, setRefresh] = useState(0);

  const dados = useMemo(() => {
    const usuarios = lerArray('bet_users');
    const pagamentos = lerArray('bet_pagamentos_v1');
    const historicoIA = lerArray('betanalytics_historico_ia_v1');
    const banca = lerArray('bet_banca_historico_v2');

    const emailAtual =
      userData?.email ||
      lerValor('bet_sessao_ativa', '') ||
      lerValor('bet_user_email', '') ||
      'admin@betanalytics.pro';

    const totalUsuarios = Math.max(usuarios.length, emailAtual ? 1 : 0);

    const usuariosPro = usuarios.filter((u) => {
      return u?.is_vip || u?.vip || u?.plano === 'PRO';
    }).length;

    const inscritosPro = Math.max(usuariosPro, userData?.is_vip ? 1 : 0);

    const pagamentosAprovados = pagamentos.filter(isAprovado);
    const pagamentosPendentes = pagamentos.filter(isPendente);
    const pagamentosRecusados = pagamentos.filter((p) => {
      const status = String(p?.status || '').toLowerCase();
      return status.includes('rejected') || status.includes('cancelled') || status.includes('cancel');
    });

    const receitaReal = pagamentosAprovados.reduce((soma, p) => soma + numero(p.valor, 0), 0);
    const receitaPotencial = inscritosPro * PLANO_MENSAL;
    const receitaMensal = Math.max(receitaReal, receitaPotencial);
    const custosEstimados = receitaMensal * 0.22;
    const lucroEstimado = receitaMensal - custosEstimados;

    const greensIA = historicoIA.filter((item) => item.status === 'green').length;
    const redsIA = historicoIA.filter((item) => item.status === 'red').length;
    const finalizadasIA = greensIA + redsIA;
    const precisaoIA = finalizadasIA ? Math.round((greensIA / finalizadasIA) * 100) : 0;

    const lucroTotalIA = historicoIA.reduce((soma, item) => soma + lucroIA(item), 0);
    const lucroTotalBanca = banca.reduce((soma, item) => soma + lucroBanca(item), 0);
    const saldoInicial = numero(lerValor('bet_banca_saldo_v2', '1000'), 1000);
    const bancaAtual = saldoInicial + lucroTotalBanca;

    const ultimoPagamento = pagamentos[0] || null;

    return {
      emailAtual,
      totalUsuarios,
      inscritosPro,
      pagamentosTotal: pagamentos.length,
      pagamentosAprovados: pagamentosAprovados.length,
      pagamentosPendentes: pagamentosPendentes.length,
      pagamentosRecusados: pagamentosRecusados.length,
      receitaReal,
      receitaMensal,
      lucroEstimado,
      custosEstimados,
      taxaConversao: totalUsuarios ? ((inscritosPro / totalUsuarios) * 100).toFixed(1) : '0.0',
      historicoIATotal: historicoIA.length,
      greensIA,
      redsIA,
      precisaoIA,
      lucroTotalIA,
      entradasBanca: banca.length,
      bancaAtual,
      lucroTotalBanca,
      jogosCarregados: Array.isArray(jogos) ? jogos.length : 0,
      ultimoPagamento
    };
  }, [userData, jogos, refresh]);

  return (
    <div className="w-full px-4 pb-28 text-white animate-fade-in">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode?.('perfil')}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a] active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
            Area administrativa
          </div>

          <h2 className="text-2xl font-black leading-tight">
            Painel Admin PRO
          </h2>

          <p className="text-[11px] font-bold text-slate-400">
            Pagamentos, usuarios, IA, banca e receita local.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefresh((v) => v + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <section className="mb-5 rounded-[32px] border border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 via-[#0f172a] to-green-500/10 p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-500/20">
            <Crown className="h-6 w-6 text-yellow-300" />
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
              Dono do app
            </div>

            <div className="truncate text-lg font-black">
              {dados.emailAtual}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-[9px] font-black uppercase text-slate-400">
              Receita local
            </div>

            <div className="text-lg font-black text-green-400">
              {dinheiro(dados.receitaReal)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-[9px] font-black uppercase text-slate-400">
              Lucro estimado
            </div>

            <div className="text-lg font-black text-yellow-300">
              {dinheiro(dados.lucroEstimado)}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3">
        <Card titulo="Usuarios" valor={dados.totalUsuarios} texto="Cadastrados locais" icon={Users} />
        <Card titulo="PRO" valor={dados.inscritosPro} texto={`${dados.taxaConversao}% conversao`} icon={Crown} cor="text-yellow-300" />
        <Card titulo="Pagamentos" valor={dados.pagamentosTotal} texto="Historico local" icon={CreditCard} cor="text-blue-400" />
        <Card titulo="Receita" valor={dinheiro(dados.receitaReal)} texto="Aprovada local" icon={DollarSign} cor="text-green-400" />
      </section>

      <section className="mb-5 rounded-3xl border border-blue-500/20 bg-[#0f172a] p-5">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-black uppercase">
            Pagamentos Mercado Pago
          </h3>
        </div>

        <div className="space-y-1">
          <Linha nome="Gerados" valor={dados.pagamentosTotal} cor="text-blue-300" />
          <Linha nome="Pendentes" valor={dados.pagamentosPendentes} cor="text-yellow-300" />
          <Linha nome="Aprovados" valor={dados.pagamentosAprovados} cor="text-emerald-300" />
          <Linha nome="Recusados/cancelados" valor={dados.pagamentosRecusados} cor="text-red-300" />
          <Linha nome="Receita aprovada" valor={dinheiro(dados.receitaReal)} cor="text-green-300" />
          <Linha nome="Custos estimados" valor={dinheiro(dados.custosEstimados)} cor="text-red-300" />
        </div>

        {dados.ultimoPagamento && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Ultimo pagamento
            </div>

            <div className="truncate text-sm font-black">
              ID {dados.ultimoPagamento.id}
            </div>

            <div className="mt-1 text-[11px] font-bold text-slate-400">
              {String(dados.ultimoPagamento.metodo || 'pix').toUpperCase()} • {dinheiro(dados.ultimoPagamento.valor)} • {dados.ultimoPagamento.status || 'pending'}
            </div>
          </div>
        )}
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3">
        <Card titulo="Analises IA" valor={dados.historicoIATotal} texto={`${dados.greensIA} green / ${dados.redsIA} red`} icon={Bot} cor="text-blue-400" />
        <Card titulo="Precisao IA" valor={`${dados.precisaoIA}%`} texto="Historico finalizado" icon={CheckCircle2} cor="text-emerald-400" />
        <Card titulo="Lucro IA" valor={dinheiro(dados.lucroTotalIA)} texto="Historico IA PRO" icon={TrendingUp} cor={dados.lucroTotalIA >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <Card titulo="Banca" valor={dinheiro(dados.bancaAtual)} texto={`${dados.entradasBanca} entradas`} icon={Wallet} cor="text-purple-400" />
      </section>

      <section className="rounded-3xl border border-green-500/20 bg-[#0f172a] p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <h3 className="text-sm font-black uppercase">
            Status do sistema
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
          <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            App Online
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
            <Activity className="h-4 w-4" />
            IA Local
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-300">
            <Clock className="h-4 w-4" />
            PIX Monitorado
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-300">
            <ShieldCheck className="h-4 w-4" />
            Admin OK
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Linha nome="Jogos carregados" valor={dados.jogosCarregados} />
          <Linha nome="Historico de pagamentos" valor="bet_pagamentos_v1" cor="text-blue-300" />
          <Linha nome="Modo dos dados" valor="Local / Mercado Pago" cor="text-green-300" />
        </div>
      </section>
    </div>
  );
}
