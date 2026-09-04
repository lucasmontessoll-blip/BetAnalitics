import {
  GoogleGenAI
} from '@google/genai';

let cliente =
  null;

let clienteKey =
  '';

function apiKey() {
  return String(
    process.env.GEMINI_API_KEY ||
    ''
  ).trim();
}

function obterCliente() {
  const key =
    apiKey();

  if (!key) {
    return null;
  }

  if (
    !cliente ||
    clienteKey !== key
  ) {
    cliente =
      new GoogleGenAI({
        apiKey: key
      });

    clienteKey =
      key;
  }

  return cliente;
}

export function geminiConfigurado() {
  return Boolean(
    apiKey()
  );
}

export function geminiProcessorStatus() {
  return {
    configurado:
      geminiConfigurado(),

    modelos: [
      'gemini-3.7-flash',
      'gemini-3.6-flash'
    ],

    tentativas_por_modelo:
      2
  };
}

export async function processarGeminiPergunta(
  pergunta
) {
  const genAI =
    obterCliente();

  if (!genAI) {
    const erro =
      new Error(
        'API do Gemini não configurada.'
      );

    erro.status = 503;
    erro.code =
      'GEMINI_NOT_CONFIGURED';

    throw erro;
  }

  const perguntaLimpa =
    String(
      pergunta ||
      ''
    )
      .trim()
      .slice(
        0,
        4000
      );

  if (!perguntaLimpa) {
    const erro =
      new Error(
        'Pergunta Gemini ausente.'
      );

    erro.status = 400;
    erro.code =
      'GEMINI_QUESTION_REQUIRED';

    throw erro;
  }

  const promptMestre =
    `
Tu és o Analista-Chefe de Inteligência Artificial do BetAnalytics PRO.
És direto, profissional, falas com confiança e dás análises baseadas em EV+.
Responde à seguinte pergunta de forma curta usando no máximo 3 frases.
Pergunta: "${perguntaLimpa}"
    `;

  const modelosGemini = [
    'gemini-3.7-flash',
    'gemini-3.6-flash'
  ];

  const tentativasPorModelo =
    2;

  let result =
    null;

  let ultimoErroGemini =
    null;

  for (
    const modelo
    of modelosGemini
  ) {
    for (
      let tentativa = 1;
      tentativa <=
        tentativasPorModelo;
      tentativa += 1
    ) {
      try {
        result =
          await genAI.models
            .generateContent({
              model:
                modelo,

              contents:
                promptMestre
            });

        ultimoErroGemini =
          null;

        break;
      }
      catch (erroGemini) {
        ultimoErroGemini =
          erroGemini;

        const statusGemini =
          Number(
            erroGemini?.status ??
            erroGemini?.statusCode ??
            erroGemini?.code ??
            erroGemini
              ?.error
              ?.code ??
            0
          );

        const transitorio =
          statusGemini === 408 ||
          statusGemini === 429 ||
          statusGemini >= 500;

        if (!transitorio) {
          throw erroGemini;
        }

        if (
          tentativa <
          tentativasPorModelo
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1000 * tentativa
              )
          );
        }
      }
    }

    if (result) {
      break;
    }
  }

  if (!result) {
    throw (
      ultimoErroGemini ||
      new Error(
        'Gemini temporariamente indisponivel.'
      )
    );
  }

  const respostaGemini =
    String(
      result?.text ||
      ''
    ).trim();

  if (!respostaGemini) {
    throw new Error(
      'Gemini retornou resposta vazia.'
    );
  }

  return respostaGemini;
}

export async function processarGeminiJob({
  pergunta
} = {}) {
  const resposta =
    await processarGeminiPergunta(
      pergunta
    );

  return {
    resposta
  };
}
