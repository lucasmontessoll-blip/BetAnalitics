import React, { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Bot,
  CheckCircle2,
  Crown,
  Eye,
  Flame,
  Lock,
  Shield,
  Star,
  Target,
  Trophy,
  Wallet,
  Zap
} from 'lucide-react';

const jogosDemo = [
  {
    id: 'demo-1',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    league: 'Brasileirao Serie A',
    status: 'Live',
    time_elapsed: 62,
    scoreHome: 2,
    scoreAway: 1,
    confianca_ia: 92,
    odd_principal: 1.78,
    mercado: 'Mais de 1.5 gols',
    risco: 'Baixo',
    ev: 14.2
  },
  {
    id: 'demo-2',
    home_team: 'Liverpool',
    away_team: 'Man City',
    league: 'Premier League',
    status: 'NS',
    confianca_ia: 89,
    odd_principal: 2.10,
    mercado: 'Ambas marcam',
    risco: 'Medio',
    ev: 11.5
  },
  {
    id: 'demo-3',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    league: 'La Liga',
    status: 'FT',
    scoreHome: 3,
    scoreAway: 1,
    confianca_ia: 88,
    odd_principal: 1.95,
    mercado: 'Mais de 2.5 gols',
    risco: 'Medio',
    ev: 9.8
  }
];

const historico = [
  { id: 'h1', jogo: 'Flamengo x Palmeiras', mercado: 'Mais de 1.5 gols', ia: 92, odd: 1.78, status: 'GREEN', lucro: '+R$ 78,00' },
  { id: 'h2', jogo: 'Liverpool x Man City', mercado: 'Ambas marcam', ia: 89, odd: 1.92, status: 'GREEN', lucro: '+R$ 92,00' },
  { id: 'h3', jogo: 'Real Madrid x Barcelona', mercado: 'Mais de 2.5 gols', ia: 88, odd: 2.05, status: 'RED', lucro: '-R$ 50,00' },
  { id: 'h4', jogo: 'Corinthians x Gremio', mercado: 'Dupla chance', ia: 84, odd: 1.65, status: 'GREEN', lucro: '+R$ 65,00' }
];

const alertas = [
  { id: 'a1', titulo: 'Confianca IA subiu', texto: 'Flamengo chegou a 94% de confianca no motor IA.', tipo: 'ia' },
  { id: 'a2', titulo: 'Movimento de odd', texto: 'Odd caiu de 1.95 para 1.78 no mercado principal.', tipo: 'odd' },
  { id: 'a3', titulo: 'Favorito em destaque', texto: 'Palmeiras entrou no radar de oportunidade PRO.', tipo: 'fav' }
];

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function normalizarJogo(jogo, index) {
  const casa = jogo?.home_team || jogo?.time_casa || jogo?.teams?.home?.name || 'Time Casa';
  const fora = jogo?.away_team || jogo?.time_fora || jogo?.teams?.away?.name || 'Time Fora';

  const confianca = numero(jogo?.confianca_ia || jogo?.ia_confidence || jogo?.confidence, 86 + index);
  const odd = numero(jogo?.odd_principal || jogo?.odd || jogo?.odds?.home, 1.75 + index * 0.08);
  const ev = numero(jogo?.ev, Number(((confianca / 100) * odd - 1).toFixed(2)) * 100);

  return {
    ...jogo,
    id: jogo?.id || jogo?.fixture?.id || jogo?.id_jogo || `radar-${index}`,
    home_team: casa,
    away_team: fora,
    league: jogo?.league || jogo?.liga || jogo?.league_name || 'Liga PRO',
    status: jogo?.status || jogo?.status_short || jogo?.fixture?.status?.short || 'NS',
    time_elapsed: jogo?.time_elapsed || jogo?.tempo_jogo || jogo?.fixture?.status?.elapsed || '',
    scoreHome: numero(jogo?.scoreHome ?? jogo?.placar_casa ?? jogo?.goals?.home, 0),
    scoreAway: numero(jogo?.scoreAway ?? jogo?.placar_fora ?? jogo?.goals?.away, 0),
    confianca_ia: Math.round(Math.max(60, Math.min(99, confianca))),
    odd_principal: Number(odd).toFixed(2),
    mercado: jogo?.mercado || jogo?.market || 'Mais de 1.5 gols',
    risco: jogo?.risco || (confianca >= 90 ? 'Baixo' : 'Medio'),
    ev: Number(ev).toFixed(1)
  };
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function Aba({ ativa, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-2xl px-4 py-3 text-[11px] font-black uppercase ${
        ativa ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function Barra({ valor }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-blue-500" style={{ width: `${valor}%` }} />
    </div>
  );
}

export default function CentralProCompleta({
  jogos = [],
  userData = {},
  setMenuAtivo,
  setJogoSelecionado,
  onAbrirJogo
}) {
  const [aba, setAba] = useState('oportunidades');
  const [lidos, setLidos] = useState(false);

  const listaJogos = useMemo(() => {
    const origem = Array.isArray(jogos) && jogos.length ? jogos : jogosDemo;
    return origem.map(normalizarJogo).sort((a, b) => b.confianca_ia - a.confianca_ia);
  }, [jogos]);

  const topJogo = listaJogos[0];
  const mediaIA = Math.round(listaJogos.reduce((soma, j) => soma + j.confianca_ia, 0) / Math.max(1, listaJogos.length));
  const greens = historico.filter((h) => h.status === 'GREEN').length;
  const precisao = Math.round((greens / historico.length) * 100);

  function abrirJogo(jogo) {
    if (!userData?.is_vip) {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('assinar pro');
      return;
    }

    if (typeof onAbrirJogo === 'function') {
      onAbrirJogo(jogo);
      return;
    }

    if (typeof setJogoSelecionado === 'function') {
      setJogoSelecionado(jogo);
    }
  }

  return (
    <div className="animate-fade-in px-4 pb-28 pt-4 text-white">
      <section className="rounded-[32px] border border-blue-500/20 bg-gradient-to-br from-blue-950 via-slate-950 to-black p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-300">
            <Bot className="mr-1 inline h-3 w-3" />
            Central IA PRO
          </span>

          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
            userData?.is_vip ? 'bg-yellow-400 text-black' : 'bg-white/10 text-slate-300'
          }`}>
            {userData?.is_vip ? 'VIP ativo' : 'Modo demo'}
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-black leading-tight">
          Oportunidades inteligentes do dia
        </h1>

        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
          Ranking IA, alertas, historico de acertos, EV, risco e mercados com maior valor.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[9px] font-black uppercase text-slate-400">Precisao</p>
            <p className="mt-1 text-xl font-black">{mediaIA}%</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[9px] font-black uppercase text-slate-400">Jogos</p>
            <p className="mt-1 text-xl font-black">{listaJogos.length}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[9px] font-black uppercase text-slate-400">Alertas</p>
            <p className="mt-1 text-xl font-black">{lidos ? 0 : alertas.length}</p>
          </div>
        </div>
      </section>

      <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
        <Aba ativa={aba === 'oportunidades'} onClick={() => setAba('oportunidades')}>Oportunidades</Aba>
        <Aba ativa={aba === 'historico'} onClick={() => setAba('historico')}>Historico IA</Aba>
        <Aba ativa={aba === 'alertas'} onClick={() => setAba('alertas')}>Alertas</Aba>
        <Aba ativa={aba === 'vip'} onClick={() => setAba('vip')}>VIP/Banca</Aba>
        <Aba ativa={aba === 'admin'} onClick={() => setAba('admin')}>Admin</Aba>
      </div>

      {aba === 'oportunidades' && (
        <div className="mt-5 space-y-4">
          <Card className="border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 to-slate-950">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">
                <Flame className="h-6 w-6" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300">
                  Oportunidade do dia
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {topJogo.home_team} x {topJogo.away_team}
                </h2>
              </div>
            </div>
          </Card>

          {listaJogos.map((jogo, index) => (
            <Card key={jogo.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
                    #{index + 1} oportunidade
                  </span>

                  <h3 className="mt-4 text-lg font-black">
                    {jogo.home_team} x {jogo.away_team}
                  </h3>

                  <p className="mt-1 text-xs font-bold text-slate-400">{jogo.league}</p>
                </div>

                <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-center">
                  <p className="text-[9px] font-black uppercase text-blue-300">IA</p>
                  <p className="text-xl font-black">{jogo.confianca_ia}%</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Mercado</p>
                  <p className="mt-1 text-xs font-black text-emerald-400">{jogo.mercado}</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">Odd</p>
                  <p className="mt-1 text-xs font-black text-yellow-300">{jogo.odd_principal}</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-[9px] font-black uppercase text-slate-500">EV</p>
                  <p className="mt-1 text-xs font-black text-emerald-400">+{jogo.ev}%</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1 flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Consenso IA</span>
                  <span>{jogo.confianca_ia}%</span>
                </div>
                <Barra valor={jogo.confianca_ia} />
              </div>

              <button
                type="button"
                onClick={() => abrirJogo(jogo)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase text-slate-950"
              >
                {userData?.is_vip ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {userData?.is_vip ? 'Ver analise completa' : 'Desbloquear analise PRO'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {aba === 'historico' && (
        <div className="mt-5 space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-black">Historico de acertos IA</h2>
                <p className="text-xs font-bold text-slate-400">Precisao recente: {precisao}%</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {historico.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">{item.jogo}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">{item.mercado}</p>
                    </div>

                    <span className={`rounded-xl px-3 py-2 text-xs font-black ${
                      item.status === 'GREEN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-black/20 p-2">
                      <p className="text-[9px] font-black uppercase text-slate-500">IA</p>
                      <p className="font-black">{item.ia}%</p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-2">
                      <p className="text-[9px] font-black uppercase text-slate-500">Odd</p>
                      <p className="font-black">{item.odd}</p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-2">
                      <p className="text-[9px] font-black uppercase text-slate-500">Lucro</p>
                      <p className={`font-black ${item.status === 'GREEN' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.lucro}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {aba === 'alertas' && (
        <div className="mt-5 space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-red-400" />
                <div>
                  <h2 className="text-lg font-black">Alertas inteligentes</h2>
                  <p className="text-xs font-bold text-slate-400">
                    {lidos ? 0 : alertas.length} novo(s) alerta(s)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLidos(true)}
                className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase"
              >
                Ler
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {alertas.map((alerta) => (
                <div key={alerta.id} className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <div className="flex items-start gap-3">
                    {alerta.tipo === 'ia' && <Zap className="mt-1 h-5 w-5 text-yellow-300" />}
                    {alerta.tipo === 'odd' && <Activity className="mt-1 h-5 w-5 text-blue-300" />}
                    {alerta.tipo === 'fav' && <Star className="mt-1 h-5 w-5 text-yellow-300" />}

                    <div>
                      <h3 className="text-sm font-black">{alerta.titulo}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-300">{alerta.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {aba === 'vip' && (
        <div className="mt-5 space-y-4">
          <Card className="border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 to-slate-950">
            <div className="flex items-center gap-3">
              <Crown className="h-7 w-7 text-yellow-300" />
              <div>
                <h2 className="text-lg font-black">Perfil VIP Premium</h2>
                <p className="text-xs font-bold text-slate-400">
                  {userData?.is_vip ? 'Plano ativo e recursos liberados' : 'Modo demonstracao ativo'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Plano</p>
                <p className="mt-1 text-sm font-black">{userData?.is_vip ? 'PRO ativo' : 'Demo'}</p>
              </div>

              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Precisao IA</p>
                <p className="mt-1 text-sm font-black">87.4%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-black">Gestao de banca PRO</h2>
                <p className="text-xs font-bold text-slate-400">ROI, lucro e unidade sugerida</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Banca atual</p>
                <p className="mt-1 text-xl font-black">R$ 1.280</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">ROI</p>
                <p className="mt-1 text-xl font-black text-emerald-400">+14.2%</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Unidade</p>
                <p className="mt-1 text-xl font-black text-yellow-300">R$ 25</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Limite diario</p>
                <p className="mt-1 text-xl font-black text-blue-300">3 entradas</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {aba === 'admin' && (
        <div className="mt-5 space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-lg font-black">Resumo Admin PRO</h2>
                <p className="text-xs font-bold text-slate-400">Visao rapida do produto</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Usuarios</p>
                <p className="mt-1 text-2xl font-black">128</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">PRO</p>
                <p className="mt-1 text-2xl font-black text-yellow-300">37</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">Receita mensal</p>
                <p className="mt-1 text-2xl font-black text-emerald-400">R$ 1.106</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[9px] font-black uppercase text-slate-500">API</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Online
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
