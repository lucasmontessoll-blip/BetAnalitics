import {
  Capacitor,
} from '@capacitor/core';

import {
  sessaoAtual,
} from './authClient.js';

import {
  apiUrl,
} from '../utils/apiBase.js';

const CONSENT_KEY =
  'bet_push_consent_v1';

const TOKEN_KEY =
  'bet_push_token_v1';

let listenersProntos =
  false;

async function pluginPush() {
  const modulo =
    await import(
      '@capacitor/push-notifications'
    );

  return modulo.PushNotifications;
}

async function sessaoAutenticada() {
  const sessao =
    await sessaoAtual();

  if (
    !sessao?.access_token
  ) {
    throw new Error(
      'Entre na sua conta antes de ativar notificacoes.'
    );
  }

  return sessao;
}

async function chamarBackend(
  pathname,
  {
    method = 'GET',
    body = null,
  } = {}
) {
  const sessao =
    await sessaoAutenticada();

  const resp =
    await fetch(
      apiUrl(pathname),
      {
        method,

        headers: {
          Accept:
            'application/json',

          Authorization:
            `Bearer ${sessao.access_token}`,

          ...(body
            ? {
                'Content-Type':
                  'application/json',
              }
            : {}),
        },

        ...(body
          ? {
              body:
                JSON.stringify(body),
            }
          : {}),
      }
    );

  const data =
    await resp
      .json()
      .catch(() => null);

  if (
    !resp.ok ||
    data?.ok === false
  ) {
    throw new Error(
      data?.erro ||
      `HTTP ${resp.status}`
    );
  }

  return data;
}

async function registrarTokenServidor(
  token
) {
  const valor =
    String(token || '')
      .trim();

  if (!valor) {
    return;
  }

  await chamarBackend(
    '/api/push/token',
    {
      method: 'POST',

      body: {
        token:
          valor,

        platform:
          Capacitor.getPlatform(),
      },
    }
  );

  localStorage.setItem(
    TOKEN_KEY,
    valor
  );
}

async function prepararListeners(
  PushNotifications
) {
  if (listenersProntos) {
    return;
  }

  await PushNotifications.addListener(
    'registration',
    (token) => {
      void registrarTokenServidor(
        token?.value
      )
        .catch(
          (e) => {
            console.error(
              '[Push registration]',
              e
            );
          }
        );
    }
  );

  await PushNotifications.addListener(
    'registrationError',
    (erro) => {
      console.error(
        '[Push registrationError]',
        erro
      );
    }
  );

  await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification) => {
      console.info(
        '[Push recebido]',
        notification
      );
    }
  );

  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action) => {
      console.info(
        '[Push aberto]',
        action
      );
    }
  );

  listenersProntos = true;
}

async function prepararCanal(
  PushNotifications
) {
  if (
    Capacitor.getPlatform() !==
    'android'
  ) {
    return;
  }

  try {
    await PushNotifications
      .createChannel({
        id:
          'betanalytics_alertas',

        name:
          'Alertas BetAnalytics',

        description:
          'Alertas do BetAnalytics PRO',

        importance:
          5,

        visibility:
          1,

        vibration:
          true,
      });
  }
  catch (e) {
    console.warn(
      '[Push channel]',
      e
    );
  }
}

export async function ativarPushNotifications() {
  if (
    !Capacitor.isNativePlatform()
  ) {
    return {
      ok: false,

      codigo:
        'somente_nativo',

      mensagem:
        'Push nativo esta disponivel no aplicativo Android.',
    };
  }

  await sessaoAutenticada();

  const PushNotifications =
    await pluginPush();

  let permissao =
    await PushNotifications
      .checkPermissions();

  if (
    permissao.receive !==
    'granted'
  ) {
    permissao =
      await PushNotifications
        .requestPermissions();
  }

  if (
    permissao.receive !==
    'granted'
  ) {
    localStorage.removeItem(
      CONSENT_KEY
    );

    return {
      ok: false,

      codigo:
        'permissao_negada',

      mensagem:
        'Permissao de notificacoes nao liberada.',
    };
  }

  await prepararListeners(
    PushNotifications
  );

  await prepararCanal(
    PushNotifications
  );

  await PushNotifications
    .register();

  localStorage.setItem(
    CONSENT_KEY,
    'granted'
  );

  return {
    ok: true,

    mensagem:
      'Notificacoes nativas ativadas. O dispositivo sera vinculado a sua conta.',
  };
}

export async function sincronizarPushAutorizado() {
  if (
    !Capacitor.isNativePlatform()
  ) {
    return {
      ok: false,
      ignorado: true,
    };
  }

  if (
    localStorage.getItem(
      CONSENT_KEY
    ) !== 'granted'
  ) {
    return {
      ok: false,
      ignorado: true,
    };
  }

  const sessao =
    await sessaoAtual();

  if (
    !sessao?.access_token
  ) {
    return {
      ok: false,
      ignorado: true,
    };
  }

  const PushNotifications =
    await pluginPush();

  const permissao =
    await PushNotifications
      .checkPermissions();

  if (
    permissao.receive !==
    'granted'
  ) {
    localStorage.removeItem(
      CONSENT_KEY
    );

    return {
      ok: false,
      ignorado: true,
    };
  }

  await prepararListeners(
    PushNotifications
  );

  await prepararCanal(
    PushNotifications
  );

  await PushNotifications
    .register();

  return {
    ok: true,
  };
}

export async function desativarPushNotifications() {
  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  try {
    await chamarBackend(
      '/api/push/token',
      {
        method: 'DELETE',

        body:
          token
            ? {
                token,
              }
            : {},
      }
    );
  }
  catch (e) {
    console.warn(
      '[Push backend disable]',
      e
    );
  }

  if (
    Capacitor.isNativePlatform()
  ) {
    try {
      const PushNotifications =
        await pluginPush();

      await PushNotifications
        .unregister();
    }
    catch (e) {
      console.warn(
        '[Push unregister]',
        e
      );
    }
  }

  localStorage.removeItem(
    CONSENT_KEY
  );

  localStorage.removeItem(
    TOKEN_KEY
  );

  return {
    ok: true,

    mensagem:
      'Notificacoes desativadas.',
  };
}

export async function enviarPushTeste() {
  return chamarBackend(
    '/api/push/teste',
    {
      method: 'POST',
    }
  );
}
