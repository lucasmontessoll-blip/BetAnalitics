import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { buscarJogosApiFootball } from '../services/apiFootballClient.js';
import { JOGOS_DEMO_API_FOOTBALL } from '../data/demoApiFootballJogos.js';

const DEMO_API_FOOTBALL_ATIVO =
  String(import.meta.env.VITE_MODO_DEMO || 'false')
    .trim()
    .toLowerCase() === 'true';

export function useApiFootball({
  data,
  ligaId = null,
  aoVivo = false,
  autoRefreshMs = 30000,
} = {}) {
  const [jogos, setJogos] = useState(
    DEMO_API_FOOTBALL_ATIVO
      ? JOGOS_DEMO_API_FOOTBALL
      : []
  );

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const abortRef = useRef(null);

  const parametros = useMemo(
    () => ({
      data,
      ligaId,
      aoVivo,
    }),
    [data, ligaId, aoVivo]
  );

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

      const reais = Array.isArray(lista) ? lista : [];

      setJogos(
        DEMO_API_FOOTBALL_ATIVO
          ? [...JOGOS_DEMO_API_FOOTBALL, ...reais]
          : reais
      );

      setUltimaAtualizacao(new Date().toISOString());
    } catch (e) {
      if (e?.name === 'AbortError') return;

      console.error('Erro API-Football:', e);

      let mensagem =
        'Nao foi possivel carregar os jogos agora. Toque em atualizar para tentar novamente.';

      if (String(e?.message || '').includes('404')) {
        mensagem =
          'A rota da API-Football nao foi encontrada no servidor.';
      }

      if (
        String(e?.message || '')
          .toLowerCase()
          .includes('api_football_key')
      ) {
        mensagem =
          'A chave da API-Football ainda nao esta configurada no servidor.';
      }

      setErro(mensagem);

      setJogos(
        DEMO_API_FOOTBALL_ATIVO
          ? JOGOS_DEMO_API_FOOTBALL
          : []
      );
    } finally {
      setLoading(false);
    }
  }, [parametros]);

  useEffect(() => {
    carregar();

    return () => {
      abortRef.current?.abort?.();
    };
  }, [carregar]);

  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs < 10000) {
      return undefined;
    }

    const timer = setInterval(
      carregar,
      autoRefreshMs
    );

    return () => clearInterval(timer);
  }, [autoRefreshMs, carregar]);

  return {
    jogos,
    loading,
    erro,
    atualizar: carregar,
    ultimaAtualizacao,
    modoDemo: DEMO_API_FOOTBALL_ATIVO,
  };
}
