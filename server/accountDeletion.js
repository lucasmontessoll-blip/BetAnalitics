import {
  autenticarRequest,
  obterPerfil,
  supabaseAdmin,
} from './authSupabase.js';

const CONFIRMACAO =
  'EXCLUIR MINHA CONTA';

function habilitada() {
  return ![
    '0',
    'false',
    'off',
    'no',
  ].includes(
    String(
      process.env.ACCOUNT_DELETION_ENABLED ||
      ''
    )
      .trim()
      .toLowerCase()
  );
}

async function excluirPorUserId(
  tabela,
  userId
) {
  const {
    error
  } =
    await supabaseAdmin
      .from(tabela)
      .delete()
      .eq(
        'user_id',
        userId
      );

  if (error) {
    throw new Error(
      'Falha ao excluir dados de ' +
      tabela +
      ': ' +
      error.message
    );
  }
}

export function instalarRotasExclusaoConta(
  app
) {
  app.get(
    '/api/auth/account-deletion-health',
    (_req, res) => {
      return res.json({
        ok: true,
        configurado:
          Boolean(supabaseAdmin),
        enabled:
          habilitada(),
        exige_autenticacao:
          true,
        exige_confirmacao:
          true,
        auth_excluido_por_ultimo:
          true,
        pagamentos_excluidos_explicitamente:
          false,
      });
    }
  );

  app.delete(
    '/api/auth/conta',
    autenticarRequest,
    async (req, res) => {
      try {
        if (!habilitada()) {
          return res
            .status(503)
            .json({
              ok: false,
              code:
                'ACCOUNT_DELETION_DISABLED',
              erro:
                'Exclusao de conta temporariamente indisponivel.',
            });
        }

        const confirmacao =
          String(
            req.body?.confirmacao ||
            ''
          )
            .trim()
            .toUpperCase();

        if (
          confirmacao !==
          CONFIRMACAO
        ) {
          return res
            .status(400)
            .json({
              ok: false,
              code:
                'ACCOUNT_DELETE_CONFIRMATION_REQUIRED',
              erro:
                'Confirmacao de exclusao invalida.',
            });
        }

        const userId =
          String(
            req.betUser?.id ||
            ''
          ).trim();

        const email =
          String(
            req.betUser?.email ||
            ''
          )
            .trim()
            .toLowerCase();

        if (!userId) {
          return res
            .status(401)
            .json({
              ok: false,
              erro:
                'Usuario autenticado invalido.',
            });
        }

        const perfil =
          await obterPerfil(
            req.betUser
          );

        if (perfil?.is_admin) {
          return res
            .status(403)
            .json({
              ok: false,
              code:
                'ACCOUNT_DELETE_ADMIN_BLOCKED',
              erro:
                'Contas administrativas nao podem ser excluidas por este fluxo.',
            });
        }

        await excluirPorUserId(
          'analises_ia',
          userId
        );

        await excluirPorUserId(
          'push_tokens',
          userId
        );

        const {
          error:
            erroPerfil
        } =
          await supabaseAdmin
            .from('usuarios')
            .delete()
            .eq(
              'user_id',
              userId
            );

        if (erroPerfil) {
          throw new Error(
            'Falha ao excluir perfil: ' +
            erroPerfil.message
          );
        }

        if (email) {
          const {
            error:
              erroPerfilLegado
          } =
            await supabaseAdmin
              .from('usuarios')
              .delete()
              .eq(
                'email',
                email
              );

          if (erroPerfilLegado) {
            throw new Error(
              'Falha ao excluir perfil legado: ' +
              erroPerfilLegado.message
            );
          }
        }

        const {
          error:
            erroAuth
        } =
          await supabaseAdmin
            .auth
            .admin
            .deleteUser(
              userId
            );

        if (erroAuth) {
          throw new Error(
            'Falha ao excluir usuario Auth: ' +
            erroAuth.message
          );
        }

        return res.json({
          ok: true,
          conta_excluida:
            true,
          dados_aplicacao_excluidos:
            true,
          sessao_deve_ser_encerrada:
            true,
        });
      }
      catch (e) {
        console.error(
          '[Account deletion]',
          e
        );

        return res
          .status(500)
          .json({
            ok: false,
            code:
              'ACCOUNT_DELETE_FAILED',
            erro:
              'Nao foi possivel concluir a exclusao da conta. Tente novamente ou contate o suporte.',
          });
      }
    }
  );
}
