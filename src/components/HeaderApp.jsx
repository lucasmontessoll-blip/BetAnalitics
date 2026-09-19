import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Trophy, User, UserRound, Users, X } from 'lucide-react';
import { pesquisarFutebol } from '../services/personalizacao.js';

const SELECTION_KEY = 'golnexa_header_search_selection_v1';

function resultMeta(type) {
  if (type === 'league') return { label: 'Liga', Icon: Trophy };
  if (type === 'team') return { label: 'Time', Icon: Users };
  if (type === 'coach') return { label: 'Treinador', Icon: User };
  return { label: 'Jogador', Icon: UserRound };
}

export default function HeaderApp({
  setMenuAtivo,
  setViewMode,
  setJogoSelecionado,
  setFilterCentro,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ leagues: [], teams: [], coaches: [], players: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const items = useMemo(() => [
    ...results.leagues,
    ...results.teams,
    ...results.coaches,
    ...results.players,
  ].slice(0, 24), [results]);

  useEffect(() => {
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) {
      setResults({ leagues: [], teams: [], coaches: [], players: [] });
      setLoading(false);
      setError('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await pesquisarFutebol(term, controller.signal);
        setResults(data);
        setOpen(true);
      } catch (requestError) {
        if (requestError?.name !== 'AbortError') {
          setResults({ leagues: [], teams: [], coaches: [], players: [] });
          setError(requestError?.message || 'Pesquisa indisponivel agora.');
          setOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function abrirPerfil() {
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setViewMode === 'function') setViewMode('perfil');
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
    if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
  }

  function selecionar(item) {
    try { localStorage.setItem(SELECTION_KEY, JSON.stringify(item)); } catch {}
    window.dispatchEvent(new CustomEvent('golnexa:header-search-selection', { detail: item }));
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setViewMode === 'function') setViewMode('central-personalizada');
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
    if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
    setOpen(false);
  }

  function limpar() {
    setQuery('');
    setOpen(false);
    setError('');
    setResults({ leagues: [], teams: [], coaches: [], players: [] });
  }

  return (
    <header className="bg-[#050816] border-b border-white/5 px-3 py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div ref={rootRef} className="relative min-w-0 flex-1 max-w-3xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-300" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Pesquisar no Golnexa"
            aria-label="Pesquisar no Golnexa"
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-blue-500/35 bg-[#0b1224] pl-10 pr-10 text-sm font-semibold text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/15"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-300" />
          ) : query ? (
            <button type="button" onClick={limpar} aria-label="Limpar pesquisa" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {open && query.trim().length >= 3 && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] max-h-[65vh] overflow-y-auto rounded-2xl border border-blue-500/25 bg-[#080e1d] p-2 shadow-2xl shadow-black/60">
              {error ? <p className="px-3 py-4 text-sm text-rose-300">{error}</p> : null}
              {!loading && !error && items.length === 0 ? <p className="px-3 py-4 text-sm text-slate-400">Nenhum resultado encontrado.</p> : null}
              {items.map((item) => {
                const { label, Icon } = resultMeta(item.type);
                return (
                  <button key={`${item.type}-${item.id}`} type="button" onClick={() => selecionar(item)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-500/10 focus:bg-blue-500/10 focus:outline-none">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#111a30]">
                      {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain p-1" /> : <Icon className="h-5 w-5 text-cyan-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">{item.name}</p>
                      <p className="truncate text-[11px] text-slate-400">{label}{item.subtitle ? ` Â· ${item.subtitle}` : ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button type="button" onClick={abrirPerfil} className="h-11 shrink-0 rounded-xl bg-blue-600 px-3 text-xs font-black uppercase text-white shadow-lg hover:bg-blue-500 sm:px-4">
          <span className="flex items-center gap-2"><User className="h-4 w-4" /><span className="hidden min-[390px]:inline">Perfil</span></span>
        </button>
      </div>
    </header>
  );
}