import React from 'react';
import {
  cadastrarAuth,
  entrarAuth,
  perfilValidadoServidor,
  solicitarRecuperacaoSenha,
  sairAuth,
  sessaoAtual
} from '../services/authClient.js';
import { supabase } from '../services/supabaseClient.js';

const TERMOS_KEY = 'bet_termos_privacidade_aceitos_v1';

function campoClasse() {
  return 'w-full rounded-2xl bg-black/35 border border-white/10 px-4 py-4 outline-none text-white placeholder:text-white/35';
}

export default function EntradaComercialGate({ children }) {
  const [termos, setTermos] = React.useState(
    () => localStorage.getItem(TERMOS_KEY) === 'sim'
  );
  const [carregando, setCarregando] = React.useState(true);
  const [logado, setLogado] = React.useState(false);
  const [modo, setModo] = React.useState('cadastro');
  const [erro, setErro] = React.useState('');
  const [aviso, setAviso] = React.useState('');
  const [form, setForm] = React.useState({
    nome: '',
    email: '',
    senha: '',
    confirmar: '',
    cpf: '',
    nascimento: '',
    telefone: '',
    maior18: false
  });

  function atualizar(campo, valor) {
    setForm((s) => ({ ...s, [campo]: valor }));
  }

  async function validarSessao(session = null) {
    const atual = session || await sessaoAtual();

    if (!atual) {
      try { delete window.__BET_AUTH_PROFILE__; } catch {}
      setLogado(false);
      return false;
    }

    const perfil = await perfilValidadoServidor(atual);
    window.__BET_AUTH_PROFILE__ = perfil || {
      email: atual.user?.email || '',
      nome: atual.user?.user_metadata?.nome || atual.user?.email || 'Usuário',
      is_vip: false,
      is_admin: false
    };

    setLogado(true);
    return true;
  }

  React.useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        await validarSessao();
      } catch (e) {
        if (ativo) setErro(e?.message || 'Falha ao validar sessão.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    const { data } = supabase?.auth?.onAuthStateChange?.((_event, session) => {
      setTimeout(async () => {
        try {
          await validarSessao(session);
        } catch {
          setLogado(false);
        }
      }, 0);
    }) || { data: null };

    window.betAuthSignOut = async () => {
      await sairAuth();
      setLogado(false);
    };

    return () => {
      ativo = false;
      data?.subscription?.unsubscribe?.();
      try { delete window.betAuthSignOut; } catch {}
    };
  }, []);

  function aceitarTermos() {
    localStorage.setItem(TERMOS_KEY, 'sim');
    localStorage.setItem('bet_termos_privacidade_aceitos_em', new Date().toISOString());
    setTermos(true);
  }

  async function cadastrar(e) {
    e.preventDefault();
    setErro('');
    setAviso('');

    try {
      if (!form.nome.trim()) throw new Error('Informe seu nome.');
      if (!form.email.trim()) throw new Error('Informe seu e-mail.');
      if (form.senha.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      if (form.senha !== form.confirmar) throw new Error('As senhas não conferem.');
      if (!form.maior18) throw new Error('Confirme que você tem 18 anos ou mais.');

      setCarregando(true);

      const data = await cadastrarAuth(form);

      if (!data?.session) {
        setAviso('Cadastro criado. Confirme seu e-mail e depois faça login.');
        setModo('login');
        return;
      }

      await validarSessao(data.session);
    } catch (err) {
      setErro(err?.message || 'Erro ao cadastrar.');
    } finally {
      setCarregando(false);
    }
  }

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setAviso('');

    try {
      setCarregando(true);
      const data = await entrarAuth(form);
      await validarSessao(data?.session);
    } catch (err) {
      setErro(err?.message || 'Erro ao entrar.');
    } finally {
      setCarregando(false);
    }
  }

  async function recuperarSenha() {
    setErro('');
    setAviso('');

    try {
      const email = String(form.email || '').trim().toLowerCase();

      if (!email) {
        throw new Error(
          'Informe seu e-mail acima para recuperar a senha.'
        );
      }

      setCarregando(true);
      await solicitarRecuperacaoSenha(email);

      setAviso(
        'Enviamos um link de recuperação. Verifique seu e-mail e a pasta de spam.'
      );
    } catch (err) {
      setErro(
        err?.message ||
        'Não foi possível enviar o link de recuperação.'
      );
    } finally {
      setCarregando(false);
    }
  }

  if (!termos) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] shadow-2xl overflow-hidden">
          <div className="p-5">
            <h1 className="text-2xl font-black">Termos e Privacidade</h1>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <p>O BetAnalytics fornece dados e análises esportivas para apoio informativo.</p>
              <p>Não existe garantia de lucro, resultado ou acerto.</p>
              <p>Uso permitido apenas para maiores de 18 anos.</p>
            </div>
            <button onClick={aceitarTermos} className="mt-5 w-full rounded-2xl bg-yellow-400 text-black font-black py-4">
              Aceitar e continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (carregando && !logado) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">
            Validando sessão
          </p>
        </div>
      </div>
    );
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <p className="text-xs text-yellow-300 font-black uppercase tracking-[0.22em]">BetAnalytics PRO</p>
            <h1 className="mt-1 text-2xl font-black">Cadastro ou login</h1>

            <div className="grid grid-cols-2 gap-2 mt-5 bg-black/25 rounded-2xl p-1 border border-white/10">
              <button type="button" onClick={() => setModo('cadastro')} className={`rounded-xl py-3 text-sm font-black ${modo === 'cadastro' ? 'bg-yellow-400 text-black' : 'text-white/70'}`}>
                Cadastro
              </button>
              <button type="button" onClick={() => setModo('login')} className={`rounded-xl py-3 text-sm font-black ${modo === 'login' ? 'bg-white text-black' : 'text-white/70'}`}>
                Login
              </button>
            </div>
          </div>

          <form onSubmit={modo === 'cadastro' ? cadastrar : entrar} className="p-5 space-y-3">
            {erro && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 font-bold">{erro}</div>}
            {aviso && <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 font-bold">{aviso}</div>}

            {modo === 'cadastro' && (
              <input placeholder="Nome completo" value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} className={campoClasse()} />
            )}

            <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => atualizar('email', e.target.value)} className={campoClasse()} />

            {modo === 'cadastro' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="CPF" value={form.cpf} onChange={(e) => atualizar('cpf', e.target.value)} className={campoClasse()} />
                  <input type="date" value={form.nascimento} onChange={(e) => atualizar('nascimento', e.target.value)} className={campoClasse()} />
                </div>
                <input placeholder="WhatsApp" value={form.telefone} onChange={(e) => atualizar('telefone', e.target.value)} className={campoClasse()} />
              </>
            )}

            <input type="password" placeholder="Senha" value={form.senha} onChange={(e) => atualizar('senha', e.target.value)} className={campoClasse()} />

            {modo === 'cadastro' && (
              <>
                <input type="password" placeholder="Confirmar senha" value={form.confirmar} onChange={(e) => atualizar('confirmar', e.target.value)} className={campoClasse()} />
                <label className="flex gap-3 rounded-2xl bg-black/25 border border-white/10 p-3 text-sm text-white/75">
                  <input type="checkbox" checked={form.maior18} onChange={(e) => atualizar('maior18', e.target.checked)} className="mt-1" />
                  <span>Confirmo que tenho 18 anos ou mais.</span>
                </label>
              </>
            )}

            <button disabled={carregando} className="w-full rounded-2xl bg-yellow-400 disabled:opacity-60 text-black font-black py-4">
              {carregando ? 'Aguarde...' : modo === 'cadastro' ? 'Criar cadastro' : 'Entrar'}
            </button>

            {modo === 'login' && (
              <button
                type="button"
                disabled={carregando}
                onClick={recuperarSenha}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] disabled:opacity-60 text-white/80 font-black py-3"
              >
                Esqueci minha senha
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return children;
}
