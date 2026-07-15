import { ChevronDown, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

const JOGOS_DEMO_INICIO = [
  {
    id: 'demo-home-1',
    league_name: 'Brasileirao Serie B',
    league_country: 'Brazil',
    status: 'Finished',
    home_team: 'America MG',
    away_team: 'Londrina',
    scoreHome: 1,
    scoreAway: 1,
  },
  {
    id: 'demo-home-2',
    league_name: 'Brasileirao Serie B',
    league_country: 'Brazil',
    status: 'Finished',
    home_team: 'Ceara',
    away_team: 'Athletic MG',
    scoreHome: 0,
    scoreAway: 0,
  },
  {
    id: 'demo-home-3',
    league_name: 'Primeira Division',
    league_country: 'Uruguay',
    status: 'Finished',
    home_team: 'Cerro Largo',
    away_team: 'Defensor Sport.',
    scoreHome: 1,
    scoreAway: 1,
  },
  {
    id: 'demo-home-4',
    league_name: 'Allsvenskan',
    league_country: 'Sweden',
    status: 'Finished',
    home_team: 'Djurgarden',
    away_team: 'Halmstads',
    scoreHome: 3,
    scoreAway: 0,
  },
  {
    id: 'demo-home-5',
    league_name: 'Division 2',
    league_country: 'Argentina',
    status: 'Live',
    time_elapsed: "65'",
    home_team: 'Atlanta',
    away_team: 'Colegiales',
    scoreHome: 1,
    scoreAway: 0,
  },
  {
    id: 'demo-home-6',
    league_name: 'NFL',
    league_country: 'Russia',
    status: 'Finished',
    home_team: 'Ural',
    away_team: 'Torpedo Moscow',
    scoreHome: 0,
    scoreAway: 1,
  },
  {
    id: 'demo-home-7',
    league_name: 'Super Liga',
    league_country: 'India',
    status: 'Not Started',
    home_team: 'Mumbai City',
    away_team: 'Kerala Blasters',
    scoreHome: 0,
    scoreAway: 0,
  },
  {
    id: 'demo-home-8',
    league_name: 'Liga 1',
    league_country: 'China',
    status: 'Not Started',
    home_team: 'Shanghai Port',
    away_team: 'Beijing Guoan',
    scoreHome: 0,
    scoreAway: 0,
  },
];

const PAIS_PT = {
  Brazil: 'Brasil',
  World: 'Internacional',
  International: 'Internacional',
  Argentina: 'Argentina',
  Uruguay: 'Uruguai',
  Colombia: 'Colombia',
  Ecuador: 'Equador',
  Paraguay: 'Paraguai',
  Peru: 'Peru',
  Bolivia: 'Bolivia',
  Chile: 'Chile',
  Sweden: 'Suecia',
  Iceland: 'Islandia',
  India: 'India',
  Myanmar: 'Mianmar',
  Vietnam: 'Vietna',
  Australia: 'Australia',
  China: 'China',
  Canada: 'Canada',
  Finland: 'Finlandia',
  Estonia: 'Estonia',
  Kazakhstan: 'Cazaquistao',
  Bhutan: 'Butao',
  Lebanon: 'Libano',
  Gambia: 'Gambia',
  Russia: 'Russia',
  'South Korea': 'Coreia do Sul',
};

const BANDEIRAS = {
  Brasil: '',
  Internacional: '',
  Argentina: '',
  Uruguai: '',
  Colombia: '',
  Equador: '',
  Paraguai: '',
  Peru: '',
  Bolivia: '',
  Chile: '',
  Suecia: '',
  Islandia: '',
  India: '',
  Mianmar: '',
  Vietna: '',
  Australia: '',
  China: '',
  Canada: '',
  Finlandia: '',
  Estonia: '',
  Cazaquistao: '',
  Butao: '',
  Libano: '',
  Gambia: '',
  Russia: '',
  'Coreia do Sul': '',
  Asia: '',
  Oceania: '',
  Europa: '',
  Africa: '',
  'America do Sul': '',
  'America do Norte': '',
};

const AMERICA_SUL = ['Brasil', 'Argentina', 'Uruguai', 'Colombia', 'Equador', 'Paraguai', 'Peru', 'Bolivia', 'Chile'];
const EUROPA = ['Suecia', 'Islandia', 'Finlandia', 'Estonia', 'Russia'];
const ASIA = ['India', 'Mianmar', 'Vietna', 'China', 'Cazaquistao', 'Libano', 'Coreia do Sul', 'Butao'];
const OCEANIA = ['Australia'];
const AMERICA_NORTE = ['Canada'];
const AFRICA = ['Gambia'];

function traduzirPais(pais = '') {
  const limpo = String(pais || '').trim();
  if (!limpo) return 'Internacional';
  return PAIS_PT[limpo] || limpo;
}

function continenteDoPais(pais = '', liga = '') {
  const p = traduzirPais(pais);
  const texto = `${pais} ${liga}`.toLowerCase();

  if (texto.includes('world') || texto.includes('international')) return 'Internacional';
  if (AMERICA_SUL.includes(p)) return 'America do Sul';
  if (EUROPA.includes(p)) return 'Europa';
  if (ASIA.includes(p)) return 'Asia';
  if (OCEANIA.includes(p)) return 'Oceania';
  if (AMERICA_NORTE.includes(p)) return 'America do Norte';
  if (AFRICA.includes(p)) return 'Africa';

  return 'Internacional';
}

function getPaisJogo(jogo) {
  return traduzirPais(
    jogo?.league_country ||
    jogo?.country ||
    jogo?.pais ||
    jogo?.raw_api_football?.league?.country ||
    ''
  );
}

function getStatus(jogo) {
  if (jogo?.status === 'Live') {
    return String(jogo?.time_elapsed || '').replace("'", '') || 'LIVE';
  }

  if (jogo?.status === 'Finished') return 'FT';

  return 'AG';
}

function getScore(jogo, lado) {
  if (jogo?.status === 'Not Started') return '-';

  if (lado === 'home') {
    return jogo?.scoreHome ?? jogo?.placar_casa ?? 0;
  }

  return jogo?.scoreAway ?? jogo?.placar_fora ?? 0;
}

function agruparPorLiga(jogos = []) {
  return jogos.reduce((acc, jogo) => {
    const liga = jogo?.league_name || 'Outras competicoes';
    if (!acc[liga]) acc[liga] = [];
    acc[liga].push(jogo);
    return acc;
  }, {});
}

function criarGrupos(jogos = []) {
  const porPais = new Map();
  const porContinente = new Map();

  jogos.forEach((jogo) => {
    const pais = getPaisJogo(jogo);
    const continente = continenteDoPais(pais, jogo?.league_name);

    if (!porPais.has(pais)) porPais.set(pais, []);
    porPais.get(pais).push(jogo);

    if (continente && continente !== pais) {
      if (!porContinente.has(continente)) porContinente.set(continente, []);
      porContinente.get(continente).push(jogo);
    }
  });

  const gruposPais = Array.from(porPais.entries()).map(([nome, jogos]) => ({
    id: `pais-${nome}`,
    tipo: 'pais',
    nome,
    jogos,
  }));

  const gruposContinente = Array.from(porContinente.entries()).map(([nome, jogos]) => ({
    id: `continente-${nome}`,
    tipo: 'continente',
    nome,
    jogos,
  }));

  const prioridade = ['Brasil', 'Internacional', 'America do Sul', 'Europa', 'Asia', 'Oceania'];

  return [...gruposPais, ...gruposContinente]
    .filter((g) => g.jogos.length > 0)
    .sort((a, b) => {
      const ia = prioridade.indexOf(a.nome);
      const ib = prioridade.indexOf(b.nome);

      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }

      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
}

function JogoMiniCard({ jogo, onAbrirJogo, favoritos = [], onToggleFavorito }) {
  const isLive = jogo?.status === 'Live';
  const favorito = favoritos.includes(jogo?.id);

  return (
    <button
      type="button"
      onClick={() => onAbrirJogo?.(jogo)}
      className="w-full bg-[#1a1a1a] hover:bg-[#222] active:scale-[0.99] transition rounded-xl px-3 py-2 flex items-center gap-3 text-left"
    >
      <div className={`w-10 text-center text-[10px] font-black ${isLive ? 'text-yellow-400' : 'text-slate-400'}`}>
        {getStatus(jogo)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {jogo?.home_image && (
            <img src={jogo.home_image} className="w-5 h-5 object-contain flex-shrink-0" alt="" />
          )}

          <span className="text-xs font-black text-white truncate">
            {jogo?.home_team || 'Mandante'}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0 mt-1">
          {jogo?.away_image && (
            <img src={jogo.away_image} className="w-5 h-5 object-contain flex-shrink-0" alt="" />
          )}

          <span className="text-xs font-bold text-slate-200 truncate">
            {jogo?.away_team || 'Visitante'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className={`w-8 h-7 rounded-lg grid place-items-center text-sm font-black ${Number(getScore(jogo, 'home')) > Number(getScore(jogo, 'away')) ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-black text-white'}`}>
          {getScore(jogo, 'home')}
        </div>

        <div className={`w-8 h-7 rounded-lg grid place-items-center text-sm font-black ${Number(getScore(jogo, 'away')) > Number(getScore(jogo, 'home')) ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-black text-white'}`}>
          {getScore(jogo, 'away')}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorito?.(e, jogo?.id);
        }}
        className="p-1"
      >
        <Star className={`w-4 h-4 ${favorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
      </button>
    </button>
  );
}

export default function JogosPorPaisContinente({
  jogos = [],
  favoritos = [],
  onAbrirJogo,
  onToggleFavorito,
  usarDemoQuandoVazio = true,
}) {
  const [grupoAberto, setGrupoAberto] = useState(null);

  const jogosBase = useMemo(() => {
    const lista = Array.isArray(jogos) ? jogos : [];
    if (lista.length > 0) return lista;
    return usarDemoQuandoVazio ? JOGOS_DEMO_INICIO : [];
  }, [jogos, usarDemoQuandoVazio]);

  const grupos = useMemo(() => criarGrupos(jogosBase), [jogosBase]);

  if (!grupos.length) return null;

  return (
    <section className="mt-6 pb-28">
      <div className="px-1 mb-3">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">
          Outras partidas
        </h3>

        <p className="text-[10px] text-slate-500 font-bold mt-1">
          Toque em um pais ou continente para ver os jogos disponiveis.
        </p>
      </div>

      <div className="space-y-2">
        {grupos.map((grupo) => {
          const aberto = grupoAberto === grupo.id;
          const jogosPorLiga = agruparPorLiga(grupo.jogos);

          return (
            <div key={grupo.id}>
              <button
                type="button"
                onClick={() => setGrupoAberto(aberto ? null : grupo.id)}
                className="w-full bg-[#191919] border border-white/5 rounded-xl px-3 py-3 flex items-center gap-3 active:scale-[0.99]"
              >
                <div className="w-7 h-7 rounded-full bg-black grid place-items-center text-lg">
                  {BANDEIRAS[grupo.nome] || ''}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-black text-white truncate">
                    {grupo.nome}
                  </div>

                  <div className="text-[9px] font-bold text-slate-500 uppercase">
                    {grupo.tipo === 'continente' ? 'Continente' : 'Pais'}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-xs font-black">{grupo.jogos.length}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {aberto && (
                <div className="mt-2 mb-3 pl-2 border-l border-white/10 space-y-4">
                  {Object.entries(jogosPorLiga).map(([liga, jogosLiga]) => (
                    <div key={`${grupo.id}-${liga}`}>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                        {liga}
                      </div>

                      <div className="space-y-2">
                        {jogosLiga.map((jogo) => (
                          <JogoMiniCard
                            key={jogo.id}
                            jogo={jogo}
                            favoritos={favoritos}
                            onAbrirJogo={onAbrirJogo}
                            onToggleFavorito={onToggleFavorito}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
