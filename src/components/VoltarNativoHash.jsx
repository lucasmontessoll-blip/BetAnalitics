import { useEffect, useRef } from 'react';

export default function VoltarNativoHash({
  viewMode,
  menuAtivo,
  filterCentro,
  jogoSelecionado,
  setViewMode,
  setMenuAtivo,
  setFilterCentro,
  setJogoSelecionado,
  setLigaAtivaId,
}) {
  const estadoRef = useRef({});
  const ultimoHashRef = useRef('');

  function estaNoInicio(estado) {
    const v = String(estado.viewMode || '').toLowerCase();
    const m = String(estado.menuAtivo || '').toLowerCase();
    const f = String(estado.filterCentro || '').toLowerCase();

    return (
      !estado.jogoSelecionado &&
      v === 'jogos' &&
      m !== 'assinar pro' &&
      (f === 'todos' || f === '')
    );
  }

  function voltarInicio() {
    if (typeof setJogoSelecionado === 'function') {
      setJogoSelecionado(null);
    }

    if (typeof setMenuAtivo === 'function') {
      setMenuAtivo('Todos os Jogos');
    }

    if (typeof setViewMode === 'function') {
      setViewMode('jogos');
    }

    if (typeof setFilterCentro === 'function') {
      setFilterCentro('Todos');
    }

    if (typeof setLigaAtivaId === 'function') {
      setLigaAtivaId(null);
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
  }

  function limparTextoHash(valor) {
    return String(valor || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  useEffect(() => {
    estadoRef.current = {
      viewMode,
      menuAtivo,
      filterCentro,
      jogoSelecionado,
    };
  }, [viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const estado = {
      viewMode,
      menuAtivo,
      filterCentro,
      jogoSelecionado,
    };

    const home = estaNoInicio(estado);

    if (home) {
      ultimoHashRef.current = '#bet-home';

      if (window.location.hash !== '#bet-home') {
        window.history.replaceState(
          { betAnalytics: 'home' },
          '',
          '#bet-home'
        );
      }

      return;
    }

    const idJogo =
      jogoSelecionado?.id ||
      jogoSelecionado?.fixture?.id ||
      jogoSelecionado?.home_team ||
      '';

    const chave = limparTextoHash(
      jogoSelecionado
        ? `jogo-${idJogo}`
        : `${viewMode}-${menuAtivo}-${filterCentro}`
    );

    const novoHash = `#bet-${chave || 'tela'}`;

    if (
      ultimoHashRef.current !== novoHash &&
      window.location.hash !== novoHash
    ) {
      ultimoHashRef.current = novoHash;

      window.history.pushState(
        { betAnalytics: chave || 'tela' },
        '',
        novoHash
      );
    }
  }, [viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.location.hash) {
      window.history.replaceState(
        { betAnalytics: 'home' },
        '',
        '#bet-home'
      );
    }

    function aoVoltarNativo() {
      const hash = window.location.hash;

      if (hash === '#bet-home' || hash === '') {
        voltarInicio();
      }
    }

    window.addEventListener('popstate', aoVoltarNativo);
    window.addEventListener('hashchange', aoVoltarNativo);

    return () => {
      window.removeEventListener('popstate', aoVoltarNativo);
      window.removeEventListener('hashchange', aoVoltarNativo);
    };
  }, []);

  return null;
}
