import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  Globe2,
  MapPin,
  Trophy
} from 'lucide-react';

import MatchCardPro from './MatchCardPro.jsx';
import {
  favoriteContains,
  isFinished,
  isLive,
  leagueCountry,
  leagueLogo,
  leagueName,
  normalizeMatch
} from './matchProUtils.js';

/* BET_ETAPA_32B_JOGOS_POR_PAIS_PREMIUM */

const COUNTRY_MAP = {
  Brazil: 'Brasil',
  Brasil: 'Brasil',
  World: 'Internacional',
  International: 'Internacional',
  England: 'Inglaterra',
  Spain: 'Espanha',
  Italy: 'Itália',
  Germany: 'Alemanha',
  France: 'França',
  Portugal: 'Portugal',
  Netherlands: 'Holanda',
  Belgium: 'Bélgica',
  Argentina: 'Argentina',
  Uruguay: 'Uruguai',
  Colombia: 'Colômbia',
  Ecuador: 'Equador',
  Paraguay: 'Paraguai',
  Peru: 'Peru',
  Bolivia: 'Bolívia',
  Chile: 'Chile',
  Sweden: 'Suécia',
  Iceland: 'Islândia',
  India: 'Índia',
  Myanmar: 'Mianmar',
  Vietnam: 'Vietnã',
  Australia: 'Austrália',
  China: 'China',
  Canada: 'Canadá',
  Finland: 'Finlândia',
  Estonia: 'Estônia',
  Kazakhstan: 'Cazaquistão',
  Bhutan: 'Butão',
  Lebanon: 'Líbano',
  Gambia: 'Gâmbia',
  Russia: 'Rússia',
  'South Korea': 'Coreia do Sul',
  USA: 'Estados Unidos',
  'United States': 'Estados Unidos',
  Mexico: 'México'
};

const FLAGS = {
  Brasil: '🇧🇷',
  Internacional: '🌍',
  Inglaterra: '🏴',
  Espanha: '🇪🇸',
  Itália: '🇮🇹',
  Alemanha: '🇩🇪',
  França: '🇫🇷',
  Portugal: '🇵🇹',
  Holanda: '🇳🇱',
  Bélgica: '🇧🇪',
  Argentina: '🇦🇷',
  Uruguai: '🇺🇾',
  Colômbia: '🇨🇴',
  Equador: '🇪🇨',
  Paraguai: '🇵🇾',
  Peru: '🇵🇪',
  Bolívia: '🇧🇴',
  Chile: '🇨🇱',
  'Estados Unidos': '🇺🇸',
  México: '🇲🇽',
  Austrália: '🇦🇺',
  China: '🇨🇳',
  Canadá: '🇨🇦',
  Japão: '🇯🇵',
  'Coreia do Sul': '🇰🇷'
};

const PREFERRED_ORDER = [
  'Brasil',
  'Internacional',
  'Inglaterra',
  'Espanha',
  'Itália',
  'Alemanha',
  'França',
  'Portugal',
  'Argentina',
  'Estados Unidos'
];

function normalizeCountry(value = '') {
  const country = String(value || '').trim();
  return COUNTRY_MAP[country] || country || 'Internacional';
}

function countryOf(jogo = {}) {
  return normalizeCountry(leagueCountry(jogo));
}

function groupMatches(jogos = []) {
  const map = new Map();

  jogos.forEach((jogo, index) => {
    const normalized = normalizeMatch(jogo, index);
    const country = countryOf(normalized);

    if (!map.has(country)) map.set(country, []);
    map.get(country).push(normalized);
  });

  return Array.from(map.entries())
    .map(([name, matches]) => ({ name, matches }))
    .sort((a, b) => {
      const indexA = PREFERRED_ORDER.indexOf(a.name);
      const indexB = PREFERRED_ORDER.indexOf(b.name);

      if (indexA !== -1 || indexB !== -1) {
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      }

      return a.name.localeCompare(b.name, 'pt-BR');
    });
}

function groupByLeague(jogos = []) {
  return jogos.reduce((groups, jogo) => {
    const league = leagueName(jogo);
    if (!groups[league]) groups[league] = [];
    groups[league].push(jogo);
    return groups;
  }, {});
}

function variantOf(jogo) {
  if (isLive(jogo)) return 'live';
  if (isFinished(jogo)) return 'finished';
  return 'prematch';
}

function LeagueHeading({ league, jogos }) {
  const first = jogos[0] || {};
  const logo = leagueLogo(first);

  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
          {logo ? (
            <img src={logo} alt="" className="h-4 w-4 object-contain" />
          ) : (
            <Trophy className="h-3 w-3 text-slate-700" />
          )}
        </span>
        <p className="truncate text-[9px] font-black text-slate-400">{league}</p>
      </div>
      <span className="text-[8px] font-black text-slate-700">
        {jogos.length} {jogos.length === 1 ? 'jogo' : 'jogos'}
      </span>
    </div>
  );
}

export default function JogosPorPaisContinente({
  jogos = [],
  favoritos = [],
  onAbrirJogo,
  onToggleFavorito
}) {
  const [openCountry, setOpenCountry] = useState(null);

  const groups = useMemo(() => (
    groupMatches(Array.isArray(jogos) ? jogos : [])
  ), [jogos]);

  if (groups.length === 0) {
    return (
      <div className="rounded-[24px] bg-[#0b0e14] px-5 py-12 text-center ring-1 ring-inset ring-white/[0.06]">
        <Globe2 className="mx-auto h-8 w-8 text-slate-800" />
        <p className="mt-3 text-sm font-black text-slate-400">Nenhuma partida disponível</p>
        <p className="mt-1 text-[10px] font-medium text-slate-700">
          Os campeonatos aparecerão automaticamente quando a API enviar os jogos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const open = openCountry === group.name;
        const leagues = groupByLeague(group.matches);
        const liveCount = group.matches.filter(isLive).length;
        const flag = FLAGS[group.name];

        return (
          <section
            key={group.name}
            className={`overflow-hidden rounded-[22px] bg-[#0b0e14] shadow-[0_12px_32px_rgba(0,0,0,0.20)] ring-1 ring-inset transition ${
              open ? 'ring-blue-500/15' : 'ring-white/[0.055]'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenCountry(open ? null : group.name)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-base">
                {flag || <MapPin className="h-4 w-4 text-slate-600" />}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-white">{group.name}</p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">
                  {Object.keys(leagues).length} competições
                </p>
              </div>

              <div className="mr-1 text-right">
                <p className="text-sm font-black tabular-nums text-slate-300">{group.matches.length}</p>
                <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">jogos</p>
              </div>

              {liveCount > 0 && (
                <span className="mr-1 rounded-full bg-red-500/10 px-2 py-1 text-[7px] font-black text-red-300">
                  {liveCount} LIVE
                </span>
              )}

              <ChevronDown className={`h-4 w-4 text-slate-700 transition duration-200 ${open ? 'rotate-180 text-blue-400' : ''}`} />
            </button>

            {open && (
              <div className="border-t border-white/[0.055] bg-black/10 px-3 pb-4 pt-3">
                <div className="space-y-5">
                  {Object.entries(leagues).map(([league, matches]) => (
                    <div key={`${group.name}-${league}`}>
                      <LeagueHeading league={league} jogos={matches} />
                      <div className="space-y-2.5">
                        {matches.map((jogo) => (
                          <MatchCardPro
                            key={jogo.id}
                            jogo={jogo}
                            variant={variantOf(jogo)}
                            favorito={favoriteContains(favoritos, jogo.id)}
                            onOpen={onAbrirJogo}
                            onFavorite={(event, match) => {
                              if (typeof onToggleFavorito === 'function') {
                                onToggleFavorito(event, match.id);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
