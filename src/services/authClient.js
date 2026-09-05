import { supabase, supabaseConfigurado } from './supabaseClient.js';
import { apiUrl } from '../utils/apiBase.js';

export async function sessaoAtual() {
  if (!supabaseConfigurado || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session || null;
}

export async function cadastrarAuth({ nome, email, senha, cpf, nascimento, telefone }) {
  if (!supabase) throw new Error('Supabase Auth não configurado.');

  const { data, error } = await supabase.auth.signUp({
    email: String(email || '').trim().toLowerCase(),
    password: String(senha || ''),
    options: {
      data: {
        nome: String(nome || '').trim(),
        cpf: String(cpf || '').replace(/\D/g, ''),
        nascimento: nascimento || null,
        telefone: String(telefone || '').trim()
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function entrarAuth({ email, senha }) {
  if (!supabase) throw new Error('Supabase Auth não configurado.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || '').trim().toLowerCase(),
    password: String(senha || '')
  });

  if (error) throw error;
  return data;
}

export async function solicitarRecuperacaoSenha(email) {
  if (!supabase) throw new Error('Supabase Auth não configurado.');

  const emailLimpo = String(email || '').trim().toLowerCase();

  if (!emailLimpo) {
    throw new Error('Informe seu e-mail.');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    emailLimpo,
    {
      redirectTo:
        'https://betanalitics-webservice.onrender.com/recuperar-senha'
    }
  );

  if (error) throw error;
  return data;
}

export async function sairAuth() {
  if (!supabase) return;
  await supabase.auth.signOut();
  try {
    delete window.__BET_AUTH_PROFILE__;
  } catch {}
}

export async function excluirContaAuth(confirmacao) {
  if (!supabase) {
    throw new Error('Supabase Auth não configurado.');
  }

  const session =
    await sessaoAtual();

  const token =
    session?.access_token;

  if (!token) {
    throw new Error(
      'Sessão ausente. Entre novamente antes de excluir sua conta.'
    );
  }

  const resp =
    await fetch(
      apiUrl('/api/auth/conta'),
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmacao:
            String(confirmacao || '')
              .trim()
        })
      }
    );

  const data =
    await resp
      .json()
      .catch(() => null);

  if (!resp.ok || !data?.ok) {
    const erro =
      new Error(
        data?.erro ||
        'Não foi possível excluir a conta.'
      );

    erro.code =
      data?.code ||
      '';

    throw erro;
  }

  return data;
}

export async function perfilValidadoServidor(session = null) {
  const atual = session || await sessaoAtual();
  const token = atual?.access_token;

  if (!token) return null;

  const resp = await fetch(apiUrl('/api/auth/me'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok || !data?.ok) {
    throw new Error(data?.erro || 'Não foi possível validar a sessão.');
  }

  return data.perfil || null;
}
