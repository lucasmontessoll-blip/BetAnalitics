import { supabaseAdmin } from './authSupabase.js';

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

const RECOVERY_HTML = String.raw`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="dark">
  <title>BetAnalytics PRO - Recuperar senha</title>
  <style>
    :root {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #f8fafc;
      background: #050816;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at 15% 5%, rgba(37,99,235,.22), transparent 34%),
        radial-gradient(circle at 85% 95%, rgba(250,204,21,.12), transparent 32%),
        #050816;
    }
    .card {
      width: min(100%, 460px);
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 30px;
      padding: 28px;
      background: rgba(15,23,42,.82);
      box-shadow: 0 28px 80px rgba(0,0,0,.45);
      backdrop-filter: blur(14px);
    }
    .brand {
      margin: 0 0 8px;
      color: #fde047;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .22em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(26px, 7vw, 34px);
      line-height: 1.05;
    }
    .sub {
      margin: 12px 0 22px;
      color: #94a3b8;
      line-height: 1.55;
      font-size: 14px;
    }
    label {
      display: block;
      margin: 14px 0 7px;
      color: #cbd5e1;
      font-size: 13px;
      font-weight: 800;
    }
    input {
      width: 100%;
      min-height: 52px;
      border: 1px solid rgba(255,255,255,.11);
      border-radius: 16px;
      padding: 0 16px;
      outline: none;
      color: white;
      background: rgba(2,6,23,.66);
      font-size: 16px;
    }
    input:focus {
      border-color: rgba(250,204,21,.72);
      box-shadow: 0 0 0 3px rgba(250,204,21,.10);
    }
    button, .link {
      width: 100%;
      min-height: 52px;
      margin-top: 18px;
      border: 0;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      cursor: pointer;
      font-size: 15px;
      font-weight: 900;
    }
    button {
      background: #facc15;
      color: #111827;
    }
    button:disabled { opacity: .55; cursor: wait; }
    .link {
      background: rgba(255,255,255,.08);
      color: white;
      border: 1px solid rgba(255,255,255,.10);
    }
    .status {
      display: none;
      margin-top: 18px;
      padding: 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      font-weight: 800;
    }
    .status.ok {
      display: block;
      color: #bbf7d0;
      border: 1px solid rgba(74,222,128,.28);
      background: rgba(34,197,94,.10);
    }
    .status.erro {
      display: block;
      color: #fecaca;
      border: 1px solid rgba(248,113,113,.28);
      background: rgba(239,68,68,.10);
    }
    .seguranca {
      margin-top: 18px;
      color: #64748b;
      text-align: center;
      font-size: 11px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <main class="card">
    <p class="brand">BetAnalytics PRO</p>
    <h1>Defina sua nova senha</h1>
    <p class="sub" id="descricao">
      Validando seu link seguro de recuperação...
    </p>

    <section id="formulario" hidden>
      <label for="senha">Nova senha</label>
      <input id="senha" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo de 8 caracteres">

      <label for="confirmar">Confirmar nova senha</label>
      <input id="confirmar" type="password" minlength="8" autocomplete="new-password" placeholder="Digite novamente">

      <button id="salvar" type="button">Atualizar senha</button>
    </section>

    <div id="status" class="status" role="status" aria-live="polite"></div>
    <a id="voltar" class="link" href="/" hidden>Voltar para o BetAnalytics</a>

    <p class="seguranca">
      O link é validado antes da alteração. Sua senha não é enviada por e-mail.
    </p>
  </main>

  <script>
    (function () {
      var hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      var query = new URLSearchParams(window.location.search);

      var token = hash.get("access_token") || "";
      var type = hash.get("type") || query.get("type") || "";
      var errorCode = hash.get("error_code") || query.get("error_code") || "";
      var errorDescription =
        hash.get("error_description") ||
        query.get("error_description") ||
        hash.get("error") ||
        query.get("error") ||
        "";

      var form = document.getElementById("formulario");
      var descricao = document.getElementById("descricao");
      var status = document.getElementById("status");
      var voltar = document.getElementById("voltar");
      var salvar = document.getElementById("salvar");

      function mostrarStatus(tipo, texto) {
        status.className = "status " + tipo;
        status.textContent = texto;
      }

      if (errorCode || errorDescription) {
        descricao.textContent = "Este link não pode mais ser utilizado.";
        mostrarStatus(
          "erro",
          errorDescription
            ? decodeURIComponent(String(errorDescription).replace(/\+/g, " "))
            : "O link expirou ou é inválido. Solicite um novo e-mail de recuperação."
        );
        voltar.hidden = false;
        return;
      }

      if (!token) {
        descricao.textContent = "Link de recuperação inválido ou incompleto.";
        mostrarStatus(
          "erro",
          "Solicite um novo e-mail de recuperação pelo BetAnalytics."
        );
        voltar.hidden = false;
        return;
      }

      if (type && type !== "recovery") {
        descricao.textContent = "Este link não é um link de recuperação de senha.";
        mostrarStatus("erro", "Solicite um novo e-mail de recuperação.");
        voltar.hidden = false;
        return;
      }

      descricao.textContent =
        "Link validado. Crie uma senha nova para acessar sua conta.";
      form.hidden = false;

      salvar.addEventListener("click", async function () {
        var senha = document.getElementById("senha").value;
        var confirmar = document.getElementById("confirmar").value;

        if (senha.length < 8) {
          mostrarStatus("erro", "A senha precisa ter pelo menos 8 caracteres.");
          return;
        }

        if (senha !== confirmar) {
          mostrarStatus("erro", "As senhas não conferem.");
          return;
        }

        salvar.disabled = true;
        salvar.textContent = "Atualizando...";
        status.className = "status";
        status.textContent = "";

        try {
          var resp = await fetch("/api/auth/recuperar-senha", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ senha: senha })
          });

          var data = await resp.json().catch(function () { return {}; });

          if (!resp.ok || !data.ok) {
            throw new Error(
              data.erro || "Não foi possível atualizar a senha."
            );
          }

          form.hidden = true;
          descricao.textContent = "Sua senha foi atualizada.";
          mostrarStatus(
            "ok",
            "Senha atualizada com sucesso. Volte ao BetAnalytics e faça login."
          );
          voltar.hidden = false;

          history.replaceState(
            null,
            "",
            window.location.pathname
          );
        } catch (e) {
          mostrarStatus(
            "erro",
            e && e.message
              ? e.message
              : "Falha ao atualizar a senha."
          );
          salvar.disabled = false;
          salvar.textContent = "Atualizar senha";
        }
      });
    })();
  </script>
</body>
</html>`;

export function instalarRotasRecuperacaoSenha(app) {
  app.get('/recuperar-senha', (_req, res) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    );
    return res.status(200).type('html').send(RECOVERY_HTML);
  });

  app.post('/api/auth/recuperar-senha', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          ok: false,
          erro: 'Serviço de autenticação indisponível.'
        });
      }

      const token = bearer(req);
      if (!token) {
        return res.status(401).json({
          ok: false,
          erro: 'Link de recuperação inválido ou expirado.'
        });
      }

      const senha = String(req.body?.senha || '');

      if (senha.length < 8) {
        return res.status(400).json({
          ok: false,
          erro: 'A senha precisa ter pelo menos 8 caracteres.'
        });
      }

      if (senha.length > 128) {
        return res.status(400).json({
          ok: false,
          erro: 'A senha informada é muito longa.'
        });
      }

      const { data, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !data?.user) {
        return res.status(401).json({
          ok: false,
          erro: 'Link de recuperação inválido ou expirado.'
        });
      }

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(
          data.user.id,
          { password: senha }
        );

      if (updateError) {
        return res.status(400).json({
          ok: false,
          erro: updateError.message || 'Não foi possível atualizar a senha.'
        });
      }

      return res.status(200).json({
        ok: true,
        senha_atualizada: true
      });
    } catch (e) {
      return res.status(500).json({
        ok: false,
        erro: e?.message || 'Falha ao atualizar a senha.'
      });
    }
  });
}
