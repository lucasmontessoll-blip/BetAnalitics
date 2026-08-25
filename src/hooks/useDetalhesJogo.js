import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  buscarDetalhesJogoApiFootball,
} from '../services/apiFootballClient.js';

/* BET_ETAPA_37B_DETALHES_JOGO */

function numeroPositivo(valor) {
  const numero = Number(valor);

  return Number.isFinite(numero) && numero > 0
    ? numero
    : null;
}

export function extrairFixtureIdApiFootball(jogo = {}) {
  const direto = numeroPositivo(jogo?.api_football_id);

  if (direto) {
    return direto;
  }

  const raw = numeroPositivo(
    jogo?.raw_api_football?.fixture?.id
  );

  if (raw) {
    return raw;
  }

  const fonte = String(
    jogo?.fonte_dados || ''
  ).toLowerCase();

  if (fonte === 'api-football') {
    const fixture = numeroPositivo(
      jogo?.fixture?.id
    );

    if (fixture) {
      return fixture;
    }
  }

  const idTexto = String(
    jogo?.id || ''
  );

  const match = idTexto.match(
    /^api-football-(\d+)$/
  );

  if (match) {
    return numeroPositivo(match[1]);
  }

  return null;
}

export function useDetalhesJogo(
  jogo,
  {
    ativo = true,
  } = {}
) {
  const fixtureId = useMemo(
    () => extrairFixtureIdApiFootball(jogo),
    [jogo]
  );

  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const abortRef = useRef(null);

  const carregar = useCallback(async () => {
    if (!ativo || !fixtureId) {
      setDetalhes(null);
      setLoading(false);
      setErro('');
      return null;
    }

    abortRef.current?.abort?.();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErro('');

    try {
      const resposta =
        await buscarDetalhesJogoApiFootball(
          fixtureId,
          {
            signal: controller.signal,
          }
        );

      if (controller.signal.aborted) {
        return null;
      }

      if (resposta?.ok === false) {
        setDetalhes(null);

        setErro(
          resposta?.erro ||
          'Nao foi possivel carregar os detalhes da partida.'
        );

        return resposta;
      }

      setDetalhes(resposta || null);

      return resposta;
    } catch (e) {
      if (e?.name === 'AbortError') {
        return null;
      }

      console.error(
        'Erro ao carregar detalhes do jogo:',
        e
      );

      setDetalhes(null);

      setErro(
        'Nao foi possivel atualizar os detalhes da partida.'
      );

      return null;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [ativo, fixtureId]);

  useEffect(() => {
    carregar();

    return () => {
      abortRef.current?.abort?.();
    };
  }, [carregar]);

  return {
    fixtureId,
    detalhes,
    loading,
    erro,
    atualizar: carregar,
    disponivel:
      Boolean(ativo) &&
      Boolean(fixtureId),
  };
}
