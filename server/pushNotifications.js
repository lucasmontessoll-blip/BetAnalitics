import {
  GoogleAuth,
} from 'google-auth-library';

import {
  autenticarRequest,
  supabaseAdmin,
} from './authSupabase.js';

const FCM_SCOPE =
  'https://www.googleapis.com/auth/firebase.messaging';

function env(nome) {
  return String(
    process.env[nome] || ''
  ).trim();
}

function configuracaoFirebase() {
  const projectId =
    env('FIREBASE_PROJECT_ID');

  const clientEmail =
    env('FIREBASE_CLIENT_EMAIL');

  const privateKey =
    env('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');

  if (
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function texto(
  valor,
  limite = 300
) {
  const resultado =
    String(valor ?? '')
      .trim();

  return resultado
    ? resultado.slice(0, limite)
    : null;
}

function tokenValido(valor) {
  const token =
    String(valor || '')
      .trim();

  return token.length >= 20 &&
    token.length <= 4096
    ? token
    : null;
}

function plataformaValida(valor) {
  const plataforma =
    String(valor || 'android')
      .trim()
      .toLowerCase();

  return [
    'android',
    'ios',
    'web',
  ].includes(plataforma)
    ? plataforma
    : 'android';
}

async function accessTokenFCM() {
  const config =
    configuracaoFirebase();

  if (!config) {
    throw new Error(
      'Firebase FCM nao configurado no servidor.'
    );
  }

  const auth =
    new GoogleAuth({
      credentials: {
        project_id:
          config.projectId,

        client_email:
          config.clientEmail,

        private_key:
          config.privateKey,
      },

      scopes: [
        FCM_SCOPE,
      ],
    });

  const client =
    await auth.getClient();

  const resposta =
    await client.getAccessToken();

  const accessToken =
    typeof resposta === 'string'
      ? resposta
      : resposta?.token;

  if (!accessToken) {
    throw new Error(
      'Nao foi possivel obter OAuth token para o FCM.'
    );
  }

  return {
    accessToken,
    projectId:
      config.projectId,
  };
}

function dadosString(
  dados = {}
) {
  return Object.fromEntries(
    Object.entries(dados)
      .filter(
        ([, valor]) =>
          valor !== undefined &&
          valor !== null
      )
      .map(
        ([chave, valor]) => [
          String(chave),
          String(valor),
        ]
      )
  );
}

function tokenDefinitivamenteInvalido(
  status,
  payload
) {
  if (
    status !== 400 &&
    status !== 404
  ) {
    return false;
  }

  const textoErro =
    JSON.stringify(
      payload || {}
    );

  return (
    /UNREGISTERED/i.test(textoErro) ||
    /registration-token-not-registered/i.test(textoErro)
  );
}

async function enviarFCMToken(
  token,
  {
    titulo,
    corpo,
    dados,
  }
) {
  const {
    accessToken,
    projectId,
  } =
    await accessTokenFCM();

  const endpoint =
    `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/messages:send`;

  const resp =
    await fetch(
      endpoint,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            message: {
              token,

              notification: {
                title:
                  texto(titulo, 120) ||
                  'BetAnalytics PRO',

                body:
                  texto(corpo, 300) ||
                  'Nova atualizacao disponivel.',
              },

              data:
                dadosString(dados),

              android: {
                priority:
                  'high',

                notification: {
                  channel_id:
                    'betanalytics_alertas',
                },
              },
            },
          }),
      }
    );

  const payload =
    await resp
      .json()
      .catch(() => null);

  return {
    ok:
      resp.ok,

    status:
      resp.status,

    payload,

    tokenInvalido:
      tokenDefinitivamenteInvalido(
        resp.status,
        payload
      ),
  };
}

async function desativarTokens(
  tokens = []
) {
  const lista = [
    ...new Set(
      tokens.filter(Boolean)
    ),
  ];

  if (
    lista.length === 0 ||
    !supabaseAdmin
  ) {
    return;
  }

  const { error } =
    await supabaseAdmin
      .from('push_tokens')
      .update({
        ativo: false,

        atualizado_em:
          new Date().toISOString(),
      })
      .in(
        'token',
        lista
      );

  if (error) {
    console.error(
      '[Push desativar tokens]',
      error
    );
  }
}

export function firebasePushConfigurado() {
  return Boolean(
    configuracaoFirebase()
  );
}

export async function enviarPushParaUsuario(
  userId,
  {
    titulo =
      'BetAnalytics PRO',

    corpo =
      'Voce tem uma nova atualizacao.',

    dados = {},
  } = {}
) {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase backend nao configurado.'
    );
  }

  const { data, error } =
    await supabaseAdmin
      .from('push_tokens')
      .select('token')
      .eq(
        'user_id',
        userId
      )
      .eq(
        'ativo',
        true
      );

  if (error) {
    throw error;
  }

  const tokens = [
    ...new Set(
      (data || [])
        .map(
          (item) =>
            tokenValido(
              item?.token
            )
        )
        .filter(Boolean)
    ),
  ];

  if (tokens.length === 0) {
    return {
      ok: false,
      enviados: 0,
      falhas: 0,
      motivo:
        'Nenhum dispositivo Push ativo para esta conta.',
    };
  }

  const respostas =
    await Promise.all(
      tokens.map(
        async (token) => {
          try {
            return {
              token,
              ...(await enviarFCMToken(
                token,
                {
                  titulo,
                  corpo,
                  dados,
                }
              )),
            };
          }
          catch (e) {
            return {
              token,
              ok: false,
              status: 0,
              payload: {
                erro:
                  e?.message ||
                  'Falha FCM.',
              },
              tokenInvalido:
                false,
            };
          }
        }
      )
    );

  const enviados =
    respostas.filter(
      (item) =>
        item.ok
    ).length;

  const invalidos =
    respostas
      .filter(
        (item) =>
          item.tokenInvalido
      )
      .map(
        (item) =>
          item.token
      );

  await desativarTokens(
    invalidos
  );

  return {
    ok:
      enviados > 0,

    enviados,

    falhas:
      respostas.length -
      enviados,

    tokens_invalidos:
      invalidos.length,

    status_falhas:
      respostas
        .filter(
          (item) =>
            !item.ok
        )
        .map(
          (item) =>
            item.status
        ),
  };
}

export function instalarRotasPush(
  app
) {
  app.get(
    '/api/push/health',
    (_req, res) => {
      res.json({
        ok: true,

        firebase_configurado:
          firebasePushConfigurado(),

        transporte:
          'fcm-http-v1',
      });
    }
  );

  app.post(
    '/api/push/token',
    autenticarRequest,
    async (req, res) => {
      try {
        const token =
          tokenValido(
            req.body?.token
          );

        if (!token) {
          return res
            .status(400)
            .json({
              ok: false,
              erro:
                'Token Push invalido.',
            });
        }

        const agora =
          new Date().toISOString();

        const registro = {
          user_id:
            req.betUser.id,

          token,

          platform:
            plataformaValida(
              req.body?.platform
            ),

          ativo: true,

          atualizado_em:
            agora,

          ultimo_registro_em:
            agora,
        };

        const { data, error } =
          await supabaseAdmin
            .from('push_tokens')
            .upsert(
              registro,
              {
                onConflict:
                  'token',
              }
            )
            .select(
              'id,user_id,platform,ativo,atualizado_em'
            )
            .single();

        if (error) {
          throw error;
        }

        return res.json({
          ok: true,
          token_registrado:
            true,
          item:
            data,
        });
      }
      catch (e) {
        console.error(
          '[Push token POST]',
          e
        );

        return res
          .status(500)
          .json({
            ok: false,
            erro:
              e?.message ||
              'Falha ao registrar dispositivo.',
          });
      }
    }
  );

  app.delete(
    '/api/push/token',
    autenticarRequest,
    async (req, res) => {
      try {
        const token =
          tokenValido(
            req.body?.token
          );

        let query =
          supabaseAdmin
            .from('push_tokens')
            .update({
              ativo: false,

              atualizado_em:
                new Date().toISOString(),
            })
            .eq(
              'user_id',
              req.betUser.id
            );

        if (token) {
          query =
            query.eq(
              'token',
              token
            );
        }

        const { error } =
          await query;

        if (error) {
          throw error;
        }

        return res.json({
          ok: true,
        });
      }
      catch (e) {
        console.error(
          '[Push token DELETE]',
          e
        );

        return res
          .status(500)
          .json({
            ok: false,
            erro:
              e?.message ||
              'Falha ao desativar dispositivo.',
          });
      }
    }
  );

  app.post(
    '/api/push/teste',
    autenticarRequest,
    async (req, res) => {
      try {
        if (
          !firebasePushConfigurado()
        ) {
          return res
            .status(503)
            .json({
              ok: false,
              erro:
                'Firebase FCM ainda nao configurado no servidor.',
            });
        }

        const resultado =
          await enviarPushParaUsuario(
            req.betUser.id,
            {
              titulo:
                'BetAnalytics PRO',

              corpo:
                'Push nativo configurado com sucesso.',

              dados: {
                tipo:
                  'teste_push',
              },
            }
          );

        if (!resultado.ok) {
          return res
            .status(409)
            .json({
              ...resultado,

              erro:
                resultado.motivo ||
                'Nenhum dispositivo recebeu a notificacao.',
            });
        }

        return res.json(
          resultado
        );
      }
      catch (e) {
        console.error(
          '[Push teste]',
          e
        );

        return res
          .status(500)
          .json({
            ok: false,
            erro:
              e?.message ||
              'Falha ao enviar Push.',
          });
      }
    }
  );
}
