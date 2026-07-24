import React, { useEffect, useRef } from 'react';
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
  const ultimoHistoricoRef = useRef('');

  function estaNoInicioAtual(estado) {
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

    const estaNoInicio = estaNoInicioAtual(estado);

    const chave = [
      String(viewMode || ''),
      String(menuAtivo || ''),
      String(filterCentro || ''),
      jogoSelecionado?.id || jogoSelecionado?.fixture?.id || '',
    ].join('|');

    if (!estaNoInicio && ultimoHistoricoRef.current !== chave) {
      ultimoHistoricoRef.current = chave;

      try {
        window.history.pushState(
          {
            betAnalyticsInterno: true,
            chave,
          },
          '',
          window.location.href
        );
      } catch {}
    }

    if (estaNoInicio) {
      ultimoHistoricoRef.current = '';
    }
  }, [viewMode, menuAtivo, filterCentro, jogoSelecionado]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function aoVoltarNavegador() {
      const estado = estadoRef.current;

      if (!estaNoInicioAtual(estado)) {
        voltarInicio();
      }
    }

    window.addEventListener('popstate', aoVoltarNavegador);

    return () => {
      window.removeEventListener('popstate', aoVoltarNavegador);
    };
  }, []);

  useEffect(() => {
    let handle = null;
    let ativo = true;

    async function registrarAndroid() {
      try {
        const h = await CapacitorApp.addListener('backButton', () => {
          const estado = estadoRef.current;

          if (!estaNoInicioAtual(estado)) {
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

    registrarAndroid();

    return () => {
      ativo = false;

      if (handle?.remove) {
        handle.remove();
      }
    };
  }, []);

  return null;
}
