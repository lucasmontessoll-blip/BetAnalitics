import React, { useMemo } from 'react';
import { Bell, Star, TrendingUp, ShieldAlert, Radio, CheckCircle2 } from 'lucide-react';

function criarAlertas(jogos = []) {
  const base = Array.isArray(jogos) && jogos.length ? jogos.slice(0, 5) : [
    { home_team: 'Flamengo', away_team: 'Palmeiras', league_name: 'Brasil Serie A', confianca_ia: 91, odd_principal: 1.82, status: 'Live' },
    { home_team: 'Liverpool', away_team: 'Arsenal', league_name: 'Premier League', confianca_ia: 88, odd_principal: 1.95, status: 'Not Started' },
    { home_team: 'Real Madrid', away_team: 'Barcelona', league_name: 'LaLiga', confianca_ia: 87, odd_principal: 2.10, status: 'Not Started' },
  ];

  return base.map((jogo, index) => {
    const casa = jogo.home_team || jogo.time_casa || 'Time A';
    const fora = jogo.away_team || jogo.time_fora || 'Time B';
    const confianca = Number(jogo.confianca_ia || 85);
    const odd = Number(jogo.odd_principal || 1.85);
    const tipo = index % 3;

    if (tipo === 0) {
      return {
        id: 'a-' + index,
        icone: Radio,
        cor: 'text-red-400 bg-red-500/10 border-red-500/20',
        titulo: 'Jogo em destaque IA',
        texto: casa + ' x ' + fora + ' chegou a ' + confianca + '% de confianca.',
      };
    }

    if (tipo === 1) {
      return {
        id: 'a-' + index,
        icone: TrendingUp,
        cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        titulo: 'Possivel value bet',
        texto: casa + ' x ' + fora + ' com odd ' + odd.toFixed(2) + ' em observacao.',
      };
    }

    return {
      id: 'a-' + index,
      icone: ShieldAlert,
      cor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      titulo: 'Controle de risco',
      texto: 'A IA recomenda stake conservadora para ' + casa + ' x ' + fora + '.',
    };
  });
}

export default function AlertasIAPro({ jogos = [], setViewMode, setAiOpen, setAiQuery }) {
  const alertas = useMemo(() => criarAlertas(jogos), [jogos]);

  const perguntar = () => {
    setAiQuery?.('Explique os alertas IA de hoje e quais merecem mais atencao.');
    setAiOpen?.(true);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] bg-gradient-to-br from-amber-600 to-orange-900 border border-amber-300/20 p-5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-100 mb-3">
          <Bell className="w-4 h-4" />
          Central de Alertas IA
        </div>

        <h2 className="text-2xl font-black leading-tight">
          Acompanhe oportunidades e riscos
        </h2>

        <p className="text-xs text-amber-100/80 font-semibold mt-2 leading-relaxed">
          Mesmo em modo demonstracao, esta tela ja mostra como os alertas inteligentes vao funcionar com a API real.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-2xl font-black text-white">{alertas.length}</div>
          <div className="text-[9px] text-slate-500 font-black uppercase">Alertas</div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-2xl font-black text-emerald-400">3</div>
          <div className="text-[9px] text-slate-500 font-black uppercase">Prioridade</div>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-2xl font-black text-blue-400">IA</div>
          <div className="text-[9px] text-slate-500 font-black uppercase">Ativo</div>
        </div>
      </div>

      <div className="space-y-3">
        {alertas.map((alerta) => {
          const Icone = alerta.icone;

          return (
            <div key={alerta.id} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 flex gap-3">
              <div className={'w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ' + alerta.cor}>
                <Icone className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="text-sm font-black text-white">{alerta.titulo}</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1 leading-relaxed">{alerta.texto}</div>
              </div>

              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={perguntar}
          className="h-14 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2"
        >
          <span>{'\u{1F916}'}</span>
          Perguntar IA
        </button>

        <button
          onClick={() => setViewMode?.('favoritos')}
          className="h-14 rounded-2xl bg-[#0f172a] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4 text-yellow-400" />
          Favoritos
        </button>
      </div>
    </div>
  );
}
