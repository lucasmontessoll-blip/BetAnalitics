import crypto from 'crypto';

import {
  autenticarRequest,
  supabaseAdmin
} from './authSupabase.js';

function env(nome) {
  return String(
    process.env[nome] || ''
  ).trim();
}

function tokenMP() {
  return String(
    process.env.MP_ACCESS_TOKEN ||
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    ''
  ).trim();
}

function segredoWebhook() {
  return env(
    'MP_WEBHOOK_SECRET'
  );
}

function valorPlanoPro() {
  const valor =
    Number(
      process.env.PLANO_PRO_VALOR ||
      29.90
    );

  return Number.isFinite(valor)
    ? Number(valor.toFixed(2))
    : 29.90;
}

const PLANO_REFERENCIA =
  'betanalytics-pro-mensal';

const PLANO_METADATA =
  'pro_mensal';

function erroHttp(
  mensagem,
  status = 500
) {
  const erro =
    new Error(mensagem);

  erro.status =
    status;

  return erro;
}

function textoHeader(
  req,
  nome
) {
  const valor =
    req.headers?.[nome];

  if (Array.isArray(valor)) {
    return String(
      valor[0] || ''
    ).trim();
  }

  return String(
    valor || ''
  ).trim();
}

function dataIdWebhook(req) {
  return String(
    req.query?.['data.id'] ||
    req.query?.data_id ||
    ''
  ).trim();
}

function partesAssinatura(
  xSignature
) {
  const resultado = {};

  String(
    xSignature || ''
  )
    .split(',')
    .forEach((parte) => {
      const pos =
        parte.indexOf('=');

      if (pos <= 0) {
        return;
      }

      const chave =
        parte
          .slice(0, pos)
          .trim();

      const valor =
        parte
          .slice(pos + 1)
          .trim();

      if (
        chave &&
        valor
      ) {
        resultado[chave] =
          valor;
      }
    });

  return resultado;
}

function hashHexValido(valor) {
  return /^[a-f0-9]{64}$/i.test(
    String(valor || '')
  );
}

function validarAssinaturaWebhook(
  req
) {
  const secret =
    segredoWebhook();

  if (!secret) {
    throw erroHttp(
      'MP_WEBHOOK_SECRET nao configurado no servidor.',
      503
    );
  }

  const xSignature =
    textoHeader(
      req,
      'x-signature'
    );

  const xRequestId =
    textoHeader(
      req,
      'x-request-id'
    );

  const dataId =
    dataIdWebhook(req);

  if (
    !xSignature ||
    !xRequestId ||
    !dataId
  ) {
    throw erroHttp(
      'Assinatura do webhook ausente.',
      401
    );
  }

  const partes =
    partesAssinatura(
      xSignature
    );

  const ts =
    String(
      partes.ts || ''
    ).trim();

  const v1 =
    String(
      partes.v1 || ''
    )
      .trim()
      .toLowerCase();

  if (
    !ts ||
    !hashHexValido(v1)
  ) {
    throw erroHttp(
      'Assinatura do webhook invalida.',
      401
    );
  }

  /*
   * Formato oficial Mercado Pago:
   *
   * id:<data.id>;
   * request-id:<x-request-id>;
   * ts:<ts>;
   */
  const manifest =
    `id:${dataId};` +
    `request-id:${xRequestId};` +
    `ts:${ts};`;

  const esperado =
    crypto
      .createHmac(
        'sha256',
        secret
      )
      .update(
        manifest,
        'utf8'
      )
      .digest('hex');

  const recebidoBuffer =
    Buffer.from(
      v1,
      'hex'
    );

  const esperadoBuffer =
    Buffer.from(
      esperado,
      'hex'
    );

  const valido =
    recebidoBuffer.length ===
      esperadoBuffer.length &&
    crypto.timingSafeEqual(
      recebidoBuffer,
      esperadoBuffer
    );

  if (!valido) {
    throw erroHttp(
      'Assinatura do webhook nao confere.',
      401
    );
  }

  /*
   * O ID assinado e o ID presente
   * no corpo precisam concordar,
   * quando ambos existirem.
   */
  const bodyId =
    String(
      req.body?.data?.id ||
      ''
    ).trim();

  if (
    bodyId &&
    bodyId !== dataId
  ) {
    throw erroHttp(
      'Identificador do webhook inconsistente.',
      401
    );
  }

  return {
    dataId,
    xRequestId
  };
}

async function consultarPagamento(
  id
) {
  const token =
    tokenMP();

  if (!token) {
    throw erroHttp(
      'MP_ACCESS_TOKEN nao configurado.',
      503
    );
  }

  const paymentId =
    String(
      id || ''
    ).trim();

  if (!paymentId) {
    throw erroHttp(
      'payment_id obrigatorio.',
      400
    );
  }

  const resp =
    await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
          Accept:
            'application/json'
        }
      }
    );

  const data =
    await resp
      .json()
      .catch(() => ({}));

  if (!resp.ok) {
    throw erroHttp(
      data?.message ||
      data?.error ||
      'Pagamento nao encontrado no Mercado Pago.',
      resp.status || 502
    );
  }

  return data;
}

function emailPagamento(
  data
) {
  return String(
    data?.payer?.email ||
    ''
  )
    .trim()
    .toLowerCase();
}

function validarPagamentoPro(
  data
) {
  if (
    data?.status !==
    'approved'
  ) {
    return {
      aprovado: false,
      email:
        emailPagamento(data)
    };
  }

  const referencia =
    String(
      data?.external_reference ||
      ''
    ).trim();

  const metadataPlano =
    String(
      data?.metadata
        ?.betanalytics_plan ||
      ''
    ).trim();

  /*
   * Somente pagamentos criados
   * como plano BetAnalytics PRO
   * podem liberar entitlement.
   */
  if (
    referencia !==
      PLANO_REFERENCIA &&
    metadataPlano !==
      PLANO_METADATA
  ) {
    throw erroHttp(
      'Pagamento aprovado nao pertence ao plano BetAnalytics PRO.',
      409
    );
  }

  const valorRecebido =
    Number(
      data?.transaction_amount
    );

  const valorEsperado =
    valorPlanoPro();

  if (
    !Number.isFinite(
      valorRecebido
    ) ||
    Math.abs(
      valorRecebido -
      valorEsperado
    ) > 0.01
  ) {
    throw erroHttp(
      'Valor do pagamento nao corresponde ao plano PRO.',
      409
    );
  }

  const moeda =
    String(
      data?.currency_id ||
      ''
    )
      .trim()
      .toUpperCase();

  if (
    moeda &&
    moeda !== 'BRL'
  ) {
    throw erroHttp(
      'Moeda do pagamento invalida para o plano PRO.',
      409
    );
  }

  const email =
    emailPagamento(data);

  if (!email) {
    throw erroHttp(
      'Pagamento aprovado sem e-mail do pagador.',
      409
    );
  }

  return {
    aprovado: true,
    email,
    valor:
      valorRecebido
  };
}

async function salvarPagamento(
  data
) {
  if (!supabaseAdmin) {
    throw erroHttp(
      'Supabase backend nao configurado.',
      503
    );
  }

  const paymentId =
    String(
      data?.id ||
      ''
    ).trim();

  if (!paymentId) {
    throw erroHttp(
      'Pagamento sem identificador.',
      409
    );
  }

  const email =
    emailPagamento(data);

  const {
    error
  } =
    await supabaseAdmin
      .from('pagamentos')
      .upsert(
        {
          payment_id:
            paymentId,

          email,

          status:
            data?.status ||
            'unknown',

          status_detail:
            data?.status_detail ||
            '',

          valor:
            Number(
              data?.transaction_amount ||
              0
            ),

          metodo:
            data?.payment_method_id ||
            '',

          payload:
            data,

          atualizado_em:
            new Date()
              .toISOString()
        },
        {
          onConflict:
            'payment_id'
        }
      );

  if (error) {
    throw erroHttp(
      error.message ||
      'Falha ao registrar pagamento.',
      500
    );
  }

  return {
    paymentId,
    email
  };
}

async function aplicarProUmaVez(
  {
    paymentId,
    email
  }
) {
  if (!supabaseAdmin) {
    throw erroHttp(
      'Supabase backend nao configurado.',
      503
    );
  }

  const dias =
    Math.max(
      1,
      Math.trunc(
        Number(
          process.env
            .PLANO_PRO_DIAS ||
          30
        )
      )
    );

  const {
    data,
    error
  } =
    await supabaseAdmin
      .rpc(
        'aplicar_vip_pagamento_unico',
        {
          p_payment_id:
            String(paymentId),

          p_email:
            String(email)
              .trim()
              .toLowerCase(),

          p_dias:
            dias
        }
      );

  if (error) {
    throw erroHttp(
      error.message ||
      'Falha ao aplicar entitlement PRO.',
      500
    );
  }

  return data === true;
}

async function persistirPagamento(
  pagamento
) {
  const registro =
    await salvarPagamento(
      pagamento
    );

  const validacao =
    validarPagamentoPro(
      pagamento
    );

  if (
    !validacao.aprovado
  ) {
    return {
      email:
        registro.email,
      aprovado:
        false,
      vip_aplicado_agora:
        false
    };
  }

  const aplicadoAgora =
    await aplicarProUmaVez({
      paymentId:
        registro.paymentId,
      email:
        validacao.email
    });

  return {
    email:
      validacao.email,

    aprovado:
      true,

    vip_aplicado_agora:
      aplicadoAgora
  };
}

export function instalarWebhookMercadoPago(
  app
) {

  /*
   * Health sem revelar nenhum segredo.
   */
  app.get(
    '/api/pagamento/webhook/health',
    (_req, res) => {
      return res.json({
        ok: true,

        webhook_secret_configurado:
          Boolean(
            segredoWebhook()
          ),

        mercado_pago_configurado:
          Boolean(
            tokenMP()
          ),

        supabase_configurado:
          Boolean(
            supabaseAdmin
          ),

        anti_replay:
          true
      });
    }
  );

  /*
   * WEBHOOK OFICIAL MERCADO PAGO
   */
  app.post(
    '/api/pagamento/webhook',
    async (req, res) => {
      try {

        const assinatura =
          validarAssinaturaWebhook(
            req
          );

        const tipo =
          String(
            req.body?.type ||
            req.query?.type ||
            ''
          )
            .trim()
            .toLowerCase();

        /*
         * A URL foi configurada somente
         * para pagamentos. Caso chegue outro
         * tipo validamente assinado, ignora.
         */
        if (
          tipo &&
          tipo !== 'payment'
        ) {
          return res
            .status(200)
            .json({
              ok: true,
              ignorado: true
            });
        }

        const pagamento =
          await consultarPagamento(
            assinatura.dataId
          );

        const resultado =
          await persistirPagamento(
            pagamento
          );

        return res
          .status(200)
          .json({
            ok: true,

            payment_id:
              String(
                pagamento.id
              ),

            status:
              pagamento.status ||
              'unknown',

            aprovado:
              resultado.aprovado,

            vip_aplicado_agora:
              resultado
                .vip_aplicado_agora
          });
      }
      catch (e) {

        const status =
          Number(
            e?.status
          ) || 500;

        console.error(
          '[Webhook Mercado Pago]',
          status,
          e?.message ||
          'Falha no webhook.'
        );

        return res
          .status(status)
          .json({
            ok: false,
            erro:
              e?.message ||
              'Falha no webhook.'
          });
      }
    }
  );

  /*
   * SINCRONIZACAO PELO APP
   *
   * Nao depende do webhook.
   * Exige sessao Supabase real.
   * Consulta o pagamento diretamente
   * no Mercado Pago.
   */
  app.post(
    '/api/pagamento/sincronizar/:id',
    autenticarRequest,
    async (req, res) => {
      try {

        const pagamento =
          await consultarPagamento(
            req.params.id
          );

        const emailSessao =
          String(
            req.betUser?.email ||
            ''
          )
            .trim()
            .toLowerCase();

        const emailDoPagamento =
          emailPagamento(
            pagamento
          );

        if (
          !emailSessao ||
          !emailDoPagamento
        ) {
          return res
            .status(403)
            .json({
              ok: false,
              erro:
                'Nao foi possivel vincular o pagamento a conta.'
            });
        }

        if (
          emailSessao !==
          emailDoPagamento
        ) {
          return res
            .status(403)
            .json({
              ok: false,
              erro:
                'Pagamento pertence a outro usuario.'
            });
        }

        const resultado =
          await persistirPagamento(
            pagamento
          );

        return res.json({
          ok: true,

          payment_id:
            String(
              pagamento.id
            ),

          status:
            pagamento.status ||
            'unknown',

          status_detail:
            pagamento
              .status_detail ||
            '',

          aprovado:
            resultado.aprovado,

          vip_aplicado_agora:
            resultado
              .vip_aplicado_agora
        });
      }
      catch (e) {

        const status =
          Number(
            e?.status
          ) || 500;

        return res
          .status(status)
          .json({
            ok: false,

            erro:
              e?.message ||
              'Falha ao sincronizar pagamento.'
          });
      }
    }
  );
}
