import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, DollarSign, List, Shield, Sparkles, Users } from 'lucide-react';
import { buscarDetalhesJogoApiFootball } from '../../services/apiFootballClient.js';
import { buscarPacoteCompletoApiFootball } from '../../services/apiFootballExtraClient.js';
import MatchHeader from './MatchHeader.jsx';
import EventosJogo from './EventosJogo.jsx';
import EstatisticasComparativas from './EstatisticasComparativas.jsx';
import LineupsJogo from './LineupsJogo.jsx';
import JogadoresJogo from './JogadoresJogo.jsx';
import ClassificacaoWidget from './ClassificacaoWidget.jsx';
import TeamWidget from './TeamWidget.jsx';
import PlayerWidget from './PlayerWidget.jsx';
import PredicoesCard from './PredicoesCard.jsx';
import LesoesCard from './LesoesCard.jsx';
import H2HCard from './H2HCard.jsx';
import OddsLiveCard from './OddsLiveCard.jsx';

const ABAS = [
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'lineups', label: 'Lineups', icon: List },
  { id: 'players', label: 'Players', icon: Users },
  { id: 'teams', label: 'Teams', icon: Shield },
  { id: 'standing', label: 'Table', icon: BarChart3 },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'odds', label: 'Odds', icon: DollarSign },
];

export default function ApiFootballMatchCenter({ jogo }) {
  const [aba, setAba] = useState('statistics');
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [jogadorSelecionado, setJogadorSelecionado] = useState(null);

  const fixtureId = jogo?.api_football_id || String(jogo?.id || '').replace('api-football-', '');
  const leagueId = jogo?.league_id;
  const season = jogo?.season || new Date().getFullYear();

  useEffect(() => {
    if (!fixtureId) return;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        setErro('');

        try {
          const pacote = await buscarPacoteCompletoApiFootball({
            fixture: fixtureId,
            league: leagueId,
            season,
            home: jogo?.home_id,
            away: jogo?.away_id,
            signal: controller.signal,
          });
          setDetalhe(pacote);
        } catch (pacoteErro) {
          console.warn('Pacote completo indisponivel, usando detalhe basico:', pacoteErro);
          const basico = await buscarDetalhesJogoApiFootball(fixtureId, { signal: controller.signal });
          setDetalhe(basico);
        }
      } catch (e) {
        if (e?.name === 'AbortError') return;
        console.error('Erro detalhes API-Football:', e);
        setErro(e?.message || 'Nao foi possivel carregar detalhes.');
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [fixtureId, leagueId, season, jogo?.home_id, jogo?.away_id]);

  const firstPlayer = useMemo(() => {
    const p = detalhe?.players?.[0]?.players?.[0]?.player;
    return p?.id ? p : null;
  }, [detalhe]);

  const playerId = jogadorSelecionado?.id || firstPlayer?.id;

  if (!fixtureId) {
    return (
      <div className="bg-[#0f172a] rounded-3xl p-5 border border-white/10 text-center text-xs text-slate-500 font-bold">
        Este jogo ainda nao possui ID da API-Football.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MatchHeader jogo={jogo} detalhe={detalhe} />

      {loading && (
        <div className="bg-[#0f172a] rounded-2xl p-5 border border-white/10 text-center text-xs font-black text-blue-400 animate-pulse">
          Carregando widgets API-Football...
        </div>
      )}

      {erro && (
        <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 text-xs font-bold text-red-300">
          {erro}
        </div>
      )}

      <div className="bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar bg-[#101827]">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-[10px] font-black uppercase whitespace-nowrap border-b-2 ${
                aba === id
                  ? 'text-[#0f172a] bg-cyan-400 border-cyan-400'
                  : 'text-cyan-400 border-transparent'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-3 bg-[#050816]">
          {aba === 'events' && <EventosJogo events={detalhe?.events || []} />}
          {aba === 'statistics' && <EstatisticasComparativas statistics={detalhe?.statistics || []} jogo={jogo} />}
          {aba === 'lineups' && <LineupsJogo lineups={detalhe?.lineups || []} jogo={jogo} />}
          {aba === 'players' && (
            <div className="space-y-3">
              <JogadoresJogo players={detalhe?.players || []} jogo={jogo} />
              <PlayerWidget playerId={playerId} team={jogo?.home_id} league={leagueId} season={season} />
            </div>
          )}
          {aba === 'teams' && (
            <div className="space-y-4">
              <TeamWidget teamId={jogo?.home_id} league={leagueId} season={season} titulo={jogo?.league_name} />
              <TeamWidget teamId={jogo?.away_id} league={leagueId} season={season} titulo={jogo?.league_name} />
            </div>
          )}
          {aba === 'standing' && <ClassificacaoWidget league={leagueId} season={season} />}
          {aba === 'insights' && (
            <div className="space-y-4">
              <PredicoesCard prediction={detalhe?.predictions || detalhe?.previsao || null} />
              <LesoesCard injuries={detalhe?.injuries || detalhe?.lesoes || []} />
              <H2HCard h2h={detalhe?.h2h || []} />
            </div>
          )}
          {aba === 'odds' && (
            <OddsLiveCard odds={detalhe?.odds || []} oddsLive={detalhe?.oddsLive || detalhe?.odds_live || []} />
          )}
        </div>
      </div>
    </div>
  );
}
