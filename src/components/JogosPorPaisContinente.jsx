
import { ChevronDown, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

const GRUPOS_FIXOS = [
  { nome: 'Brasil', tipo: 'pais', emoji: '\u{1F1E7}\u{1F1F7}', qtd: 8 },
  { nome: 'Internacional', tipo: 'continente', emoji: '\u{1F30D}', qtd: 17 },
  { nome: '\u00c1sia', tipo: 'continente', emoji: '\u{1F30F}', qtd: 2 },
  { nome: 'Oceania', tipo: 'continente', emoji: '\u{1F30A}', qtd: 1 },
  { nome: 'Am\u00e9rica do Sul', tipo: 'continente', emoji: '\u{1F30E}', qtd: 2 },
  { nome: 'Argentina', tipo: 'pais', emoji: '\u{1F1E6}\u{1F1F7}', qtd: 14 },
  { nome: 'Austr\u00e1lia', tipo: 'pais', emoji: '\u{1F1E6}\u{1F1FA}', qtd: 4 },
  { nome: 'Bol\u00edvia', tipo: 'pais', emoji: '\u{1F1E7}\u{1F1F4}', qtd: 5 },
  { nome: 'But\u00e3o', tipo: 'pais', emoji: '\u{1F1E7}\u{1F1F9}', qtd: 1 },
  { nome: 'Canad\u00e1', tipo: 'pais', emoji: '\u{1F1E8}\u{1F1E6}', qtd: 1 },
  { nome: 'Cazaquist\u00e3o', tipo: 'pais', emoji: '\u{1F1F0}\u{1F1FF}', qtd: 2 },
  { nome: 'China', tipo: 'pais', emoji: '\u{1F1E8}\u{1F1F3}', qtd: 9 },
  { nome: 'Col\u00f4mbia', tipo: 'pais', emoji: '\u{1F1E8}\u{1F1F4}', qtd: 2 },
  { nome: 'Coreia do Sul', tipo: 'pais', emoji: '\u{1F1F0}\u{1F1F7}', qtd: 4 },
  { nome: 'Equador', tipo: 'pais', emoji: '\u{1F1EA}\u{1F1E8}', qtd: 1 },
  { nome: 'Est\u00f4nia', tipo: 'pais', emoji: '\u{1F1EA}\u{1F1EA}', qtd: 1 },
  { nome: 'Finl\u00e2ndia', tipo: 'pais', emoji: '\u{1F1EB}\u{1F1EE}', qtd: 2 },
  { nome: 'G\u00e2mbia', tipo: 'pais', emoji: '\u{1F1EC}\u{1F1F2}', qtd: 1 },
  { nome: '\u00cdndia', tipo: 'pais', emoji: '\u{1F1EE}\u{1F1F3}', qtd: 4 },
  { nome: 'Isl\u00e2ndia', tipo: 'pais', emoji: '\u{1F1EE}\u{1F1F8}', qtd: 4 },
  { nome: 'L\u00edbano', tipo: 'pais', emoji: '\u{1F1F1}\u{1F1E7}', qtd: 1 },
  { nome: 'Mianmar', tipo: 'pais', emoji: '\u{1F1F2}\u{1F1F2}', qtd: 1 },
  { nome: 'Paraguai', tipo: 'pais', emoji: '\u{1F1F5}\u{1F1FE}', qtd: 1 },
  { nome: 'Peru', tipo: 'pais', emoji: '\u{1F1F5}\u{1F1EA}', qtd: 1 },
  { nome: 'Su\u00e9cia', tipo: 'pais', emoji: '\u{1F1F8}\u{1F1EA}', qtd: 1 },
  { nome: 'Vietn\u00e3', tipo: 'pais', emoji: '\u{1F1FB}\u{1F1F3}', qtd: 2 },
];

const MAPA_PAIS = {
  Brazil: 'Brasil',
  Brasil: 'Brasil',
  World: 'Internacional',
  International: 'Internacional',
  Argentina: 'Argentina',
  Uruguay: 'Am\u00e9rica do Sul',
  Colombia: 'Col\u00f4mbia',
  Ecuador: 'Equador',
  Paraguay: 'Paraguai',
  Peru: 'Peru',
  Bolivia: 'Bol\u00edvia',
  Chile: 'Am\u00e9rica do Sul',
  Sweden: 'Su\u00e9cia',
  Iceland: 'Isl\u00e2ndia',
  India: '\u00cdndia',
  Myanmar: 'Mianmar',
  Vietnam: 'Vietn\u00e3',
  Australia: 'Austr\u00e1lia',
  China: 'China',
  Canada: 'Canad\u00e1',
  Finland: 'Finl\u00e2ndia',
  Estonia: 'Est\u00f4nia',
  Kazakhstan: 'Cazaquist\u00e3o',
  Bhutan: 'But\u00e3o',
  Lebanon: 'L\u00edbano',
  Gambia: 'G\u00e2mbia',
  Russia: 'Internacional',
  'South Korea': 'Coreia do Sul',
};

function normalizarPais(valor = '') {
  const pais = String(valor || '').trim();
  return MAPA_PAIS[pais] || pais || 'Internacional';
}

function paisDoJogo(jogo) {
  return normalizarPais(
    jogo?.league_country ||
    jogo?.country ||
    jogo?.pais ||
    jogo?.raw_api_football?.league?.country ||
    ''
  );
}

function agruparReais(jogos = []) {
  const mapa = new Map();

  jogos.forEach((jogo) => {
    const pais = paisDoJogo(jogo);
    if (!mapa.has(pais)) mapa.set(pais, []);
    mapa.get(pais).push(jogo);

    if (['Brasil', 'Argentina', 'Bol\u00edvia', 'Col\u00f4mbia', 'Equador', 'Paraguai', 'Peru', 'Uruguay', 'Chile'].includes(pais)) {
      if (!mapa.has('Am\u00e9rica do Sul')) mapa.set('Am\u00e9rica do Sul', []);
      mapa.get('Am\u00e9rica do Sul').push(jogo);
    }

    if (['\u00cdndia', 'Mianmar', 'Vietn\u00e3', 'China', 'Cazaquist\u00e3o', 'L\u00edbano', 'Coreia do Sul', 'But\u00e3o'].includes(pais)) {
      if (!mapa.has('\u00c1sia')) mapa.set('\u00c1sia', []);
      mapa.get('\u00c1sia').push(jogo);
    }

    if (pais === 'Austr\u00e1lia') {
      if (!mapa.has('Oceania')) mapa.set('Oceania', []);
      mapa.get('Oceania').push(jogo);
    }
  });

  return mapa;
}

function statusJogo(jogo) {
  if (jogo?.status === 'Live') return String(jogo?.time_elapsed || 'LIVE').replace("'", '');
  if (jogo?.status === 'Finished') return 'FT';
  return 'AG';
}

function placar(jogo, lado) {
  if (jogo?.status === 'Not Started') return '-';
  if (lado === 'home') return jogo?.scoreHome ?? jogo?.placar_casa ?? 0;
  return jogo?.scoreAway ?? jogo?.placar_fora ?? 0;
}

function agruparPorLiga(jogos = []) {
  return jogos.reduce((acc, jogo) => {
    const liga = jogo?.league_name || jogo?.liga || 'Outras competi\u00e7\u00f5es';
    if (!acc[liga]) acc[liga] = [];
    acc[liga].push(jogo);
    return acc;
  }, {});
}

function JogoMiniCard({ jogo, favoritos = [], onAbrirJogo, onToggleFavorito }) {
  const favorito = favoritos.includes(jogo?.id);

  return (
    <button
      type="button"
      onClick={() => onAbrirJogo?.(jogo)}
      className="w-full bg-[#111827] hover:bg-[#1f2937] active:scale-[0.99] transition rounded-xl px-3 py-2 flex items-center gap-3 text-left"
    >
      <div className="w-9 text-center text-[10px] font-black text-slate-400">
        {statusJogo(jogo)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-black text-white truncate">
          {jogo?.home_team || jogo?.time_casa || 'Mandante'}
        </div>

        <div className="text-xs font-bold text-slate-300 truncate mt-1">
          {jogo?.away_team || jogo?.time_fora || 'Visitante'}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="w-8 h-7 rounded-lg bg-black grid place-items-center text-sm font-black text-white">
          {placar(jogo, 'home')}
        </div>

        <div className="w-8 h-7 rounded-lg bg-black grid place-items-center text-sm font-black text-white">
          {placar(jogo, 'away')}
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
        <Star className={\`w-4 h-4 \${favorito ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}\`} />
      </button>
    </button>
  );
}

export default function JogosPorPaisContinente({
  jogos = [],
  favoritos = [],
  onAbrirJogo,
  onToggleFavorito,
}) {
  const [grupoAberto, setGrupoAberto] = useState(null);

  const grupos = useMemo(() => {
    const jogosValidos = Array.isArray(jogos) ? jogos : [];
    const reais = agruparReais(jogosValidos);

    return GRUPOS_FIXOS.map((grupo) => {
      const jogosDoGrupo = reais.get(grupo.nome) || [];

      return {
        ...grupo,
        id: \`\${grupo.tipo}-\${grupo.nome}\`,
        jogos: jogosDoGrupo,
        qtdFinal: jogosDoGrupo.length > 0 ? jogosDoGrupo.length : grupo.qtd,
      };
    });
  }, [jogos]);

  return (
    <section className="mt-6 pb-28">
      <div className="px-1 mb-3">
        <h3 className="text-xs font-black text-white uppercase tracking-widest">
          Outras partidas
        </h3>

        <p className="text-[10px] text-slate-500 font-bold mt-1">
          {'Toque em um pa\u00eds ou continente para ver os jogos dispon\u00edveis.'}
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
                <div className="w-8 h-8 rounded-full bg-black grid place-items-center text-lg shadow-lg">
                  {grupo.emoji}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-black text-white truncate">
                    {grupo.nome}
                  </div>

                  <div className="text-[9px] font-bold text-slate-500 uppercase">
                    {grupo.tipo === 'continente' ? 'Continente' : 'Pa\u00eds'}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-xs font-black">{grupo.qtdFinal}</span>
                  <ChevronDown className={\`w-4 h-4 transition-transform \${aberto ? 'rotate-180' : ''}\`} />
                </div>
              </button>

              {aberto && (
                <div className="mt-2 mb-3 pl-2 border-l border-white/10 space-y-4">
                  {grupo.jogos.length === 0 ? (
                    <div className="bg-[#101827] border border-white/5 rounded-xl p-3 text-[11px] font-bold text-slate-400">
                      {'Quando a API-Football retornar jogos deste pa\u00eds ou continente, eles v\u00e3o aparecer aqui automaticamente.'}
                    </div>
                  ) : (
                    Object.entries(jogosPorLiga).map(([liga, jogosLiga]) => (
                      <div key={\`\${grupo.id}-\${liga}\`}>
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
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
