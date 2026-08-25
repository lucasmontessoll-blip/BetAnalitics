import { useState } from 'react';
import axios from 'axios';

import {
  apiUrl,
} from '../utils/apiBase.js';

export function useIA(
  API_URL,
  jogos,
  setJogoSelecionado
) {
  const [aiOpen, setAiOpen] =
    useState(false);

  const [aiQuery, setAiQuery] =
    useState('');

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiMessages, setAiMessages] =
    useState([
      {
        role: 'assistant',
        text:
          'Olá! Sou o motor IA do BetAnalytics. Qual é a sua dúvida?',
      },
    ]);

  const handleAskAI = async (e) => {
    e?.preventDefault();

    if (
      !aiQuery.trim() ||
      aiLoading
    ) {
      return;
    }

    const perguntaAtual =
      aiQuery.trim();

    setAiMessages(
      (prev) => [
        ...prev,
        {
          role: 'user',
          text: perguntaAtual,
        },
      ]
    );

    setAiQuery('');
    setAiLoading(true);

    try {
      const lista =
        Array.isArray(jogos)
          ? jogos
          : [];

      const resumoJogos =
        lista
          .slice(0, 20)
          .map(
            (jogo) =>
              `${jogo.home_team} vs ${jogo.away_team}`
          )
          .join(', ');

      const resposta =
        await axios.post(
          apiUrl('/api/chat-ia'),
          {
            pergunta:
              perguntaAtual,

            dadosDaRodada:
              resumoJogos ||
              'Sem jogos disponíveis no momento',
          }
        );

      const texto =
        String(
          resposta?.data?.resposta ||
          ''
        ).trim();

      if (!texto) {
        throw new Error(
          'Resposta vazia da IA.'
        );
      }

      setAiMessages(
        (prev) => [
          ...prev,
          {
            role: 'assistant',
            text: texto,
          },
        ]
      );
    }
    catch (error) {
      console.error(
        'Falha no chat IA:',
        error
      );

      setAiMessages(
        (prev) => [
          ...prev,
          {
            role: 'assistant',
            text:
              'Não foi possível consultar a IA agora. Tente novamente em alguns instantes.',
          },
        ]
      );
    }
    finally {
      setAiLoading(false);
    }
  };

  const gerarExplicacaoIA =
    async (jogo = {}) => {

      setJogoSelecionado(
        (prev) => ({
          ...prev,
          is_loading_explanation: true,
        })
      );

      const confianca =
        jogo?.confianca_ia ??
        jogo?.confiancaIA ??
        null;

      const odd =
        jogo?.odd_principal ??
        null;

      const fatores =
        Array.isArray(
          jogo?.explicacao_ia?.fatores
        )
          ? jogo.explicacao_ia.fatores
          : [];

      const contexto = {
        jogo:
          `${jogo?.home_team || 'Mandante'} x ${
            jogo?.away_team || 'Visitante'
          }`,

        confianca,

        odd,

        mercado:
          jogo?.mercado_principal ||
          null,

        probabilidades:
          jogo?.probabilidades ||
          null,

        fatores,

        fonte:
          jogo?.confianca_fonte ||
          null,
      };

      const prompt = `
Você é um analista de futebol do BetAnalytics.

Explique SOMENTE com base nos dados enviados abaixo.
Não invente estatísticas, percentuais, odds, histórico ou lesões.
Quando algum dado estiver ausente, diga que ele não está disponível.

Dados:
${JSON.stringify(contexto, null, 2)}

Estruture em:
1. Leitura principal
2. Evidências disponíveis
3. Riscos e limitações
4. Mercado indicado, somente se existir nos dados
5. Conclusão

Se não houver dados suficientes, informe claramente que não existe base suficiente para uma conclusão confiável.
`.trim();

      try {
        const resposta =
          await axios.post(
            apiUrl('/api/chat-ia'),
            {
              pergunta: prompt,
              dadosDaRodada: contexto,
            }
          );

        const texto =
          String(
            resposta?.data?.resposta ||
            ''
          ).trim();

        if (!texto) {
          throw new Error(
            'Resposta vazia da IA.'
          );
        }

        setJogoSelecionado(
          (prev) => ({
            ...prev,
            explanation: texto,
            is_loading_explanation: false,
            explanation_error: '',
          })
        );
      }
      catch (error) {
        console.error(
          'Falha ao gerar explicacao IA:',
          error
        );

        setJogoSelecionado(
          (prev) => ({
            ...prev,
            explanation: '',
            explanation_error:
              'Não foi possível gerar a explicação agora.',
            is_loading_explanation: false,
          })
        );
      }
    };

  return {
    aiOpen,
    setAiOpen,
    aiQuery,
    setAiQuery,
    aiLoading,
    aiMessages,
    handleAskAI,
    gerarExplicacaoIA,
  };
}
