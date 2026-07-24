import React, { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export default function VoltarAndroidWeb({
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
  const estaNoInicio =
    !jogoSelecionado &&
    String(viewMode || '').toLowerCase() === 'jogos' &&
    String(menuAtivo || '').toLowerCase() !== 'assinar pro' &&
    (!filterCentro || String(filterCentro || '').toLowerCase() === 'todos');

  function voltarInicio() {
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setViewMode === 'function') setViewMode('jogos');
    if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
    if (typeof setLigaAtivaId === 'function') setLigaAtivaId(null);

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!estaNoInicio && !window.history.state?.betAnalyticsInterno) {
      window.history.pushState(
        { betAnalyticsInterno: true },
        '',
        window.location.href
      );
    }
  }, [estaNoInicio, viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function onPopState() {
      if (!estaNoInicio) {
        voltarInicio();
      }
    }

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [estaNoInicio, viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  useEffect(() => {
    let handle = null;
    let ativo = true;

    async function registrar() {
      try {
        const h = await CapacitorApp.addListener('backButton', () => {
          if (!estaNoInicio) {
            voltarInicio();
            return;
          }

          CapacitorApp.exitApp();
        });

        if (!ativo && h?.remove) {
          h.remove();
          return;
        }

        handle = h;
      } catch {}
    }

    registrar();

    return () => {
      ativo = false;

      if (handle?.remove) {
        handle.remove();
      }
    };
  }, [estaNoInicio, viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  return null;
}
