import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buscarJogosApiFootball } from '../services/apiFootballClient.js';

export function useApiFootball({ data, ligaId = null, aoVivo = false, autoRefreshMs = 30000 } = {}) {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  const parametros = useMemo(() => ({
    data,
    ligaId,
    aoVivo,
  }), [data, ligaId, aoVivo]);

  const carregar = useCallback(async () => {
    try {
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setErro('');

      const lista = await buscarJogosApiFootball({
        ...parametros,
        signal: controller.signal,
      });

      setJogos(Array.isArray(lista) ? lista : []);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      console.error('Erro API-Football:', e);
      setErro(e?.message || 'Não foi possível carregar jogos da API-Football.');
      setJogos([]);
    } finally {
      setLoading(false);
    }
  }, [parametros]);

  useEffect(() => {
    carregar();
    return () => abortRef.current?.abort?.();
  }, [carregar]);

  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs < 10000) return;
    const timer = setInterval(carregar, autoRefreshMs);
    return () => clearInterval(timer);
  }, [autoRefreshMs, carregar]);

  return {
    jogos,
    loading,
    erro,
    atualizar: carregar,
  };
}
