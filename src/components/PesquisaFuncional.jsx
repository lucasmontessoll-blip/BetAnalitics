import { Search, Star, ChevronRight, ChevronDown, Trophy, Users, User, Globe2, BarChart3, ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';

const EQUIPES = [
  { tipo: 'time', nome: 'Brasil', sub: 'Sele\u00e7\u00e3o Brasileira', emoji: '\u{1F1E7}\u{1F1F7}' },
  { tipo: 'time', nome: 'Fran\u00e7a', sub: 'Sele\u00e7\u00e3o Francesa', emoji: '\u{1F1EB}\u{1F1F7}' },
  { tipo: 'time', nome: 'Noruega', sub: 'Sele\u00e7\u00e3o Norueguesa', emoji: '\u{1F1F3}\u{1F1F4}' },
  { tipo: 'time', nome: 'Real Madrid', sub: 'Espanha', emoji: '\u{26BD}' },
  { tipo: 'time', nome: 'FC Barcelona', sub: 'Espanha', emoji: '\u{1F535}' },
  { tipo: 'time', nome: 'Manchester City', sub: 'Inglaterra', emoji: '\u{1F535}' },
  { tipo: 'time', nome: 'Flamengo', sub: 'Brasil', emoji: '\u{1F534}' },
  { tipo: 'time', nome: 'Palmeiras', sub: 'Brasil', emoji: '\u{1F7E2}' },
];

const JOGADORES = [
  { tipo: 'jogador', nome: 'Kylian Mbapp\u00e9', sub: 'Real Madrid / Fran\u00e7a', emoji: '\u{26A1}' },
  { tipo: 'jogador', nome: 'Erling Haaland', sub: 'Manchester City / Noruega', emoji: '\u{1F3AF}' },
  { tipo: 'jogador', nome: 'Vinicius Jr', sub: 'Real Madrid / Brasil', emoji: '\u{1F1E7}\u{1F1F7}' },
  { tipo: 'jogador', nome: 'Jude Bellingham', sub: 'Real Madrid / Inglaterra', emoji: '\u{1F451}' },
  { tipo: 'jogador', nome: 'Lionel Messi', sub: 'Inter Miami / Argentina', emoji: '\u{1F410}' },
  { tipo: 'jogador', nome: 'Cristiano Ronaldo', sub: 'Al Nassr / Portugal', emoji: '\u{1F451}' },
];

const RANKING = [
  { tipo: 'ranking', nome: 'Real Madrid', sub: 'Pontua\u00e7\u00e3o IA: 94', posicao: 1, emoji: '\u{1F947}' },
  { tipo: 'ranking', nome: 'Manchester City', sub: 'Pontua\u00e7\u00e3o IA: 92', posicao: 2, emoji: '\u{1F948}' },
  { tipo: 'ranking', nome: 'FC Barcelona', sub: 'Pontua\u00e7\u00e3o IA: 90', posicao: 3, emoji: '\u{1F949}' },
  { tipo: 'ranking', nome: 'Liverpool', sub: 'Pontua\u00e7\u00e3o IA: 89', posicao: 4, emoji: '\u{1F3C6}' },
  { tipo: 'ranking', nome: 'Palmeiras', sub: 'Pontua\u00e7\u00e3o IA: 84', posicao: 5, emoji: '\u{1F3C6}' },
];

const LIGAS = [
  { tipo: 'liga', nome: 'Brasileir\u00e3o S\u00e9rie A', sub: 'Brasil', emoji: '\u{1F1E7}\u{1F1F7}' },
  { tipo: 'liga', nome: 'Champions League', sub: 'Europa', emoji: '\u{1F3C6}' },
  { tipo: 'liga', nome: 'Premier League', sub: 'Inglaterra', emoji: '\u{1F3F4}' },
  { tipo: 'liga', nome: 'LaLiga', sub: 'Espanha', emoji: '\u{1F1EA}\u{1F1F8}' },
  { tipo: 'liga', nome: 'Libertadores', sub: 'Am\u00e9rica do Sul', emoji: '\u{1F30E}' },
  { tipo: 'liga', nome: 'Europa League', sub: 'Europa', emoji: '\u{1F535}' },
];

const COMPETICOES = [
  {
    pais: 'Brasil',
    emoji: '\u{1F1E7}\u{1F1F7}',
    ligas: ['Brasileir\u00e3o S\u00e9rie A', 'Brasileir\u00e3o S\u00e9rie B', 'Copa do Brasil', 'Paulist\u00e3o', 'Carioca', 'S\u00e9rie C'],
  },
  {
    pais: 'Brasil Amador',
    emoji: '\u{1F1E7}\u{1F1F7}',
    ligas: ['Sub-20', 'Sub-23', 'Feminino', 'Estaduais', 'Copa Paulista', 'Aspirantes'],
  },
  {
    pais: 'Mundo',
    emoji: '\u{1F30D}',
    ligas: ['Copa do Mundo', 'Mundial de Clubes', 'Amistosos Internacionais', 'Nations League', 'Eliminat\u00f3rias', 'Ol\u00edmpico'],
  },
  {
    pais: 'Europa',
    emoji: '\u{1F30D}',
    ligas: ['Champions League', 'Europa League', 'Conference League', 'Eurocopa', 'Supercopa UEFA', 'Nations League'],
  },
  {
    pais: 'Am\u00e9rica do Sul',
    emoji: '\u{1F30E}',
    ligas: ['Libertadores', 'Sul-Americana', 'Recopa', 'Copa Am\u00e9rica', 'Argentina Primera', 'Uruguai Primera'],
  },
];

const ABAS = [
  { id: 'equipes', nome: 'Equipes', icon: Users },
  { id: 'jogadores', nome: 'Jogadores', icon: User },
  { id: 'ranking', nome: 'Ranking', icon: BarChart3 },
  { id: 'ligas', nome: 'Ligas Principais', icon: Trophy },
  { id: 'competicoes', nome: 'Todas Competi\u00e7\u00f5es', icon: Globe2 },
];

function normalizar(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function useFavoritosPesquisa() {
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bet_pesquisa_favoritos_v3') || '[]');
    } catch {
      return [];
    }
  });

  function salvar(novos) {
    setFavoritos(novos);
    localStorage.setItem('bet_pesquisa_favoritos_v3', JSON.stringify(novos));
  }

  function toggle(item) {
    const id = item.tipo + '-' + item.nome;
    const existe = favoritos.some((f) => f.id === id);

    if (existe) {
      salvar(favoritos.filter((f) => f.id !== id));
      return;
    }

    salvar([...favoritos, { ...item, id }]);
  }

  function ativo(item) {
    const id = item.tipo + '-' + item.nome;
    return favoritos.some((f) => f.id === id);
  }

  return { favoritos, toggle, ativo };
}

function CardItem({ item, favorito, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item)}
      className="relative bg-slate-50 text-slate-950 rounded-xl p-3 min-h-[76px] text-center border border-blue-500/30 shadow-sm active:scale-[0.98] transition"
    >
      <div className="absolute right-2 top-1 text-blue-500 text-sm">+</div>

      <div className="text-2xl leading-none mb-1">{item.emoji}</div>

      <div className="text-[11px] font-black leading-tight line-clamp-1">
        {item.nome}
      </div>

      <div className="text-[8px] uppercase font-black text-slate-500 mt-1 line-clamp-1">
        {item.sub}
      </div>

      {favorito && (
        <Star className="absolute right-2 bottom-2 w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      )}
    </button>
  );
}

function ListaCards({ itens, termo, favoritoAtivo, toggleFavorito }) {
  const filtrados = itens.filter((item) => {
    const t = normalizar(termo);
    if (!t) return true;
    return normalizar(item.nome).includes(t) || normalizar(item.sub).includes(t);
  });

  if (!filtrados.length) {
    return (
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 text-center text-xs font-bold text-slate-400">
        Nenhum resultado encontrado nesta aba.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {filtrados.map((item) => (
        <CardItem
          key={item.tipo + item.nome}
          item={item}
          favorito={favoritoAtivo(item)}
          onToggle={toggleFavorito}
        />
      ))}
    </div>
  );
}

function CompeticoesLista({ termo, favoritos, toggleFavorito }) {
  const [aberto, setAberto] = useState('Brasil');
  const busca = normalizar(termo);

  const grupos = COMPETICOES.filter((grupo) => {
    if (!busca) return true;
    return normalizar(grupo.pais).includes(busca) || grupo.ligas.some((l) => normalizar(l).includes(busca));
  });

  return (
    <div className="space-y-3">
      {grupos.map((grupo) => {
        const ativo = aberto === grupo.pais;

        return (
          <div key={grupo.pais} className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAberto(ativo ? '' : grupo.pais)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-black grid place-items-center text-lg">
                {grupo.emoji}
              </div>

              <div className="flex-1">
                <div className="text-sm font-black text-white">{grupo.pais}</div>
                <div className="text-[9px] font-bold text-slate-500">
                  {grupo.ligas.length} competi\u00e7\u00f5es dispon\u00edveis
                </div>
              </div>

              {ativo ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {ativo && (
              <div className="grid grid-cols-2 gap-2 p-3 pt-0">
                {grupo.ligas.map((liga) => {
                  const item = { tipo: 'competicao', nome: liga, sub: grupo.pais, emoji: grupo.emoji };
                  const id = item.tipo + '-' + item.nome;
                  const marcado = favoritos.some((f) => f.id === id);

                  return (
                    <button
                      type="button"
                      key={liga}
                      onClick={() => toggleFavorito(item)}
                      className="bg-[#050816] border border-white/5 rounded-xl p-3 text-left flex items-center justify-between active:scale-[0.98]"
                    >
                      <span className="text-[10px] text-white font-black line-clamp-1">
                        {liga}
                      </span>
                      <span className={marcado ? 'text-yellow-400' : 'text-blue-400'}>+</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PesquisaFuncional() {
  const [aba, setAba] = useState('equipes');
  const [termo, setTermo] = useState('');
  const [abaAnterior, setAbaAnterior] = useState(null);
  const { favoritos, toggle, ativo } = useFavoritosPesquisa();

  const itensAtuais = useMemo(() => {
    if (aba === 'equipes') return EQUIPES;
    if (aba === 'jogadores') return JOGADORES;
    if (aba === 'ranking') return RANKING;
    if (aba === 'ligas') return LIGAS;
    return [];
  }, [aba]);

  return (
    <div className="animate-fade-in pb-28 w-full">
      <div className="px-4 pt-4">
        <div className="mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            {'\u{1F50E} Pesquisa'}
          </h2>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-5 mb-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-black text-lg uppercase">
                Central de Pesquisa
              </h3>
              <p className="text-[10px] text-blue-100 font-bold mt-1">
                Times, jogadores, rankings e competi\u00e7\u00f5es em um s\u00f3 lugar.
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-white/20 grid place-items-center border border-white/20">
              <Search className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/15 border border-white/10 rounded-2xl p-4">
              <div className="text-xl font-black text-white">50</div>
              <div className="text-[8px] font-black text-blue-100 uppercase">Itens catalogados</div>
            </div>

            <div className="bg-white/15 border border-white/10 rounded-2xl p-4">
              <div className="text-xl font-black text-white">{favoritos.length}</div>
              <div className="text-[8px] font-black text-blue-100 uppercase">Meus favoritos</div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-blue-500/20 rounded-2xl p-2 mb-4">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Pesquisar time, jogador ou liga..."
              className="w-full bg-white text-slate-900 rounded-xl h-10 pl-9 pr-3 text-xs font-bold outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {ABAS.map((item) => {
              const Icon = item.icon;
              const selecionado = aba === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === aba) return;
                    setAbaAnterior(aba);
                    setAba(item.id);
                  }}
                  className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap flex items-center gap-1.5 border ${
                    selecionado
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#111827] text-slate-400 border-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {item.nome}
                </button>
              );
            })}
          </div>

          {aba !== 'equipes' && (
            <button
              type="button"
              onClick={() => {
                setAba(abaAnterior || 'equipes');
                setAbaAnterior(null);
                setTermo('');
              }}
              className="mt-3 w-full h-10 rounded-xl bg-[#111827] border border-white/10 text-slate-300 text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para {ABAS.find((x) => x.id === (abaAnterior || 'equipes'))?.nome || 'Equipes'}
            </button>
          )}
        </div>

        {favoritos.length > 0 && (
          <div className="bg-[#0f172a] border border-yellow-500/20 rounded-2xl p-3 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xs font-black text-white uppercase">Favoritos salvos</h3>
                <p className="text-[9px] text-slate-500 font-bold">Toque no card novamente para remover.</p>
              </div>
              <span className="text-[9px] text-yellow-400 font-black">Abrir</span>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {favoritos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item)}
                  className="min-w-[74px] bg-white text-slate-900 rounded-xl p-2 text-center relative"
                >
                  <div className="text-xl">{item.emoji}</div>
                  <div className="text-[9px] font-black line-clamp-1">{item.nome}</div>
                  <div className="text-[7px] font-black text-slate-500 uppercase">{item.tipo}</div>
                  <Star className="absolute right-1 top-1 w-3 h-3 fill-yellow-400 text-yellow-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wide">
            {aba === 'competicoes' ? 'Cat\u00e1logo completo de ligas' : 'Resultados da pesquisa'}
          </h3>
          <p className="text-[9px] text-slate-500 font-bold mt-1">
            {aba === 'competicoes'
              ? 'Abra o pa\u00eds e favorite as divis\u00f5es desejadas.'
              : 'Toque em qualquer card para adicionar ou remover dos favoritos.'}
          </p>
        </div>

        {aba === 'competicoes' ? (
          <CompeticoesLista termo={termo} favoritos={favoritos} toggleFavorito={toggle} />
        ) : (
          <ListaCards itens={itensAtuais} termo={termo} favoritoAtivo={ativo} toggleFavorito={toggle} />
        )}
      </div>
    </div>
  );
}
