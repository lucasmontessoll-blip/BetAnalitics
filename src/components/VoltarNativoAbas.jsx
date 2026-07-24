import React, { useCallback, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export default function VoltarNativoAbas({
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

  const voltarInicio = useCallback(() => {
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
  }, [
    setJogoSelecionado,
    setMenuAtivo,
    setViewMode,
    setFilterCentro,
    setLigaAtivaId,
  ]);

  function criarHistoricoProtecao() {
    try {
      window.history.pushState(
        { betAnalyticsBackGuard: Date.now() },
        '',
        window.location.href
      );
    } catch {}
  }

  useEffect(() => {
    estadoRef.current = {
      viewMode,
      menuAtivo,
      filterCentro,
      jogoSelecionado,
    };

    criarHistoricoProtecao();
  }, [viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    criarHistoricoProtecao();

    function aoVoltarNavegador() {
      voltarInicio();

      setTimeout(() => {
        criarHistoricoProtecao();
      }, 80);
    }

    window.addEventListener('popstate', aoVoltarNavegador);

    return () => {
      window.removeEventListener('popstate', aoVoltarNavegador);
    };
  }, [voltarInicio]);

  useEffect(() => {
    let handle = null;
    let ativo = true;

    async function registrarAndroid() {
      try {
        const h = await CapacitorApp.addListener('backButton', () => {
          voltarInicio();

          setTimeout(() => {
            criarHistoricoProtecao();
          }, 80);
        });

        if (!ativo && h?.remove) {
          h.remove();
          return;
        }

        handle = h;
      } catch {}
    }

    registrarAndroid();

    return () => {
      ativo = false;

      if (handle?.remove) {
        handle.remove();
      }
    };
  }, [voltarInicio]);

  return null;
}
