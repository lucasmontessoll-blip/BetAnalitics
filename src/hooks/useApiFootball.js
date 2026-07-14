import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buscarJogosApiFootball } from '../services/apiFootballClient.js';
import { JOGOS_DEMO_API_FOOTBALL } from '../data/demoApiFootballJogos.js';

// TEMPORÁRIO: deixe true para ver 2 jogos de demonstração.
// Quando sua API-Football real estiver funcionando, troque para false.
const DEMO_API_FOOTBALL_ATIVO = true;

export function useApiFootball({ data, ligaId = null, aoVivo = false, autoRefreshMs = 30000 } = {}) {
  const [jogos, setJogos] = useState(DEMO_API_FOOTBALL_ATIVO ? JOGOS_DEMO_API_FOOTBALL : []);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);
  const parametros = useMemo(() => ({ data, ligaId, aoVivo }), [data, ligaId, aoVivo]);

  const carregar = useCallback(async () => {
    try {
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setErro('');
      const lista = await buscarJogosApiFootball({ ...parametros, signal: controller.signal });
      const reais = Array.isArray(lista) ? lista : [];
      setJogos(DEMO_API_FOOTBALL_ATIVO ? [...JOGOS_DEMO_API_FOOTBALL, ...reais] : reais);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      console.error('Erro API-Football:', e);
      setErro(e?.message || 'Não foi possível carregar jogos da API-Football.');
      setJogos(DEMO_API_FOOTBALL_ATIVO ? JOGOS_DEMO_API_FOOTBALL : []);
    } finally {
      setLoading(false);
    }
  }, [parametros]);

  useEffect(() => { carregar(); return () => abortRef.current?.abort?.(); }, [carregar]);
  useEffect(() => { if (!autoRefreshMs || autoRefreshMs < 10000) return; const timer = setInterval(carregar, autoRefreshMs); return () => clearInterval(timer); }, [autoRefreshMs, carregar]);
  return { jogos, loading, erro, atualizar: carregar };
}
