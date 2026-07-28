import React from 'react';

const TERMOS_KEY = 'bet_termos_privacidade_aceitos_v1';
const USERS_KEY = 'bet_users';
const SESSION_KEY = 'bet_sessao_ativa';

const ADMIN_EMAIL = 'betanlyticspro@gmail.com';
const ADMIN_PASSWORD = '199Luc@s';
const ADMIN_EXPIRA = '2099-12-31T23:59:59.000Z';

function emailLimpo(email) {
  return String(email || '').trim().toLowerCase();
}

function lerUsuarios() {
  try {
    const lista = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function salvarUsuarios(lista) {
  localStorage.setItem(USERS_KEY, JSON.stringify(lista));
}

function criarAdmin() {
  const usuarios = lerUsuarios();
  const idx = usuarios.findIndex((u) => emailLimpo(u.email) === ADMIN_EMAIL);

  const admin = {
    ...(idx >= 0 ? usuarios[idx] : {}),
    id: 'admin_betanalytics',
    nome: 'Admin BetAnalytics',
    email: ADMIN_EMAIL,
    senha: ADMIN_PASSWORD,
    password: ADMIN_PASSWORD,
    is_admin: true,
    admin: true,
    is_vip: true,
    vip: true,
    plano: 'PRO',
    vip_status: 'ativo',
    vip_expira: ADMIN_EXPIRA,
    vip_expira_em: ADMIN_EXPIRA,
    vencimento: ADMIN_EXPIRA
  };

  if (idx >= 0) usuarios[idx] = admin;
  else usuarios.push(admin);

  salvarUsuarios(usuarios);
}

function iniciarSessao(usuario) {
  localStorage.setItem(SESSION_KEY, usuario.email);
  localStorage.setItem('bet_user_nome', usuario.nome || usuario.email);

  if (usuario.is_vip && usuario.vip_expira) {
    localStorage.setItem('bet_vip_expira', usuario.vip_expira);
  }
}

function campoClasse() {
  return 'w-full rounded-2xl bg-black/35 border border-white/10 px-4 py-4 outline-none text-white placeholder:text-white/35';
}

export default function EntradaComercialGate({ children }) {
  const [termos, setTermos] = React.useState(() => {
    criarAdmin();
    return localStorage.getItem(TERMOS_KEY) === 'sim';
  });

  const [logado, setLogado] = React.useState(() => {
    criarAdmin();
    return Boolean(localStorage.getItem(SESSION_KEY));
  });

  const [modo, setModo] = React.useState('cadastro');
  const [erro, setErro] = React.useState('');

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

  function aceitarTermos() {
    localStorage.setItem(TERMOS_KEY, 'sim');
    localStorage.setItem('bet_termos_privacidade_aceitos_em', new Date().toISOString());
    setTermos(true);
  }

  function cadastrar(e) {
    e.preventDefault();
    setErro('');
    criarAdmin();

    try {
      if (!form.nome.trim()) throw new Error('Informe seu nome.');
      if (!form.email.trim()) throw new Error('Informe seu e-mail.');
      if (!form.senha.trim()) throw new Error('Crie uma senha.');
      if (form.senha.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      if (form.senha !== form.confirmar) throw new Error('As senhas nao conferem.');
      if (!form.maior18) throw new Error('Confirme que voce tem 18 anos ou mais.');

      const usuarios = lerUsuarios();
      const email = emailLimpo(form.email);

      if (usuarios.some((u) => emailLimpo(u.email) === email)) {
        throw new Error('Este e-mail ja esta cadastrado. Faca login.');
      }

      const novo = {
        id: 'user_' + Date.now(),
        nome: form.nome.trim(),
        email,
        senha: form.senha,
        password: form.senha,
        cpf: form.cpf.trim(),
        nascimento: form.nascimento,
        telefone: form.telefone.trim(),
        is_admin: false,
        admin: false,
        is_vip: false,
        vip: false,
        plano: 'Free',
        vip_status: 'bloqueado',
        criado_em: new Date().toISOString()
      };

      usuarios.push(novo);
      salvarUsuarios(usuarios);
      iniciarSessao(novo);
      setLogado(true);
      window.location.reload();
    } catch (err) {
      setErro(err.message || 'Erro ao cadastrar.');
    }
  }

  function entrar(e) {
    e.preventDefault();
    setErro('');
    criarAdmin();

    try {
      const usuarios = lerUsuarios();
      const email = emailLimpo(form.email);
      const usuario = usuarios.find((u) => emailLimpo(u.email) === email);

      if (!usuario) throw new Error('E-mail nao encontrado. Faca seu cadastro.');

      const senhaSalva = String(usuario.senha || usuario.password || '');

      if (senhaSalva !== String(form.senha)) {
        throw new Error('Senha incorreta.');
      }

      iniciarSessao(usuario);
      setLogado(true);
      window.location.reload();
    } catch (err) {
      setErro(err.message || 'Erro ao entrar.');
    }
  }

  if (!termos) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] shadow-2xl overflow-hidden">
          <div className="p-5 bg-gradient-to-br from-yellow-400/20 to-blue-500/10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/logo-topo.png" alt="BetAnalytics PRO" className="w-12 h-12 rounded-2xl object-contain bg-black/30" />
              <div>
                <p className="text-xs text-yellow-300 font-black uppercase tracking-[0.22em]">BetAnalytics PRO</p>
                <h1 className="text-2xl font-black">Termos e Privacidade</h1>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-3xl bg-black/30 border border-white/10 p-4">
              <h2 className="font-black text-yellow-300 mb-2">Termos de Uso</h2>
              <p className="text-sm text-white/75 leading-relaxed">
                O BetAnalytics PRO fornece dados e analises esportivas para apoio informativo. Nao garantimos lucro, resultado ou acerto.
              </p>
            </div>

            <div className="rounded-3xl bg-black/30 border border-white/10 p-4">
              <h2 className="font-black text-blue-300 mb-2">Politica de Privacidade</h2>
              <p className="text-sm text-white/75 leading-relaxed">
                O app pode armazenar dados de cadastro, sessao, preferencias e informacoes necessarias para liberar recursos PRO.
              </p>
            </div>

            <div className="rounded-3xl bg-black/30 border border-white/10 p-4">
              <h2 className="font-black text-emerald-300 mb-2">Uso responsavel</h2>
              <p className="text-sm text-white/75 leading-relaxed">
                Uso permitido apenas para maiores de 18 anos. Areas premium exigem assinatura ativa.
              </p>
            </div>

            <button onClick={aceitarTermos} className="w-full rounded-2xl bg-yellow-400 text-black font-black py-4">
              Aceitar e continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!logado) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] shadow-2xl overflow-hidden">
          <div className="p-5 bg-gradient-to-br from-blue-500/20 to-yellow-500/10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/logo-topo.png" alt="BetAnalytics PRO" className="w-12 h-12 rounded-2xl object-contain bg-black/30" />
              <div>
                <p className="text-xs text-yellow-300 font-black uppercase tracking-[0.22em]">Area do usuario</p>
                <h1 className="text-2xl font-black">Cadastro ou login</h1>
              </div>
            </div>

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
                  <span>Confirmo que tenho 18 anos ou mais e aceito os Termos de Uso e a Politica de Privacidade.</span>
                </label>
              </>
            )}

            <button className="w-full rounded-2xl bg-yellow-400 text-black font-black py-4">
              {modo === 'cadastro' ? 'Criar cadastro gratis' : 'Entrar'}
            </button>

            <button type="button" onClick={() => setModo(modo === 'cadastro' ? 'login' : 'cadastro')} className="w-full rounded-2xl border border-white/10 bg-white/5 text-white font-bold py-4">
              {modo === 'cadastro' ? 'Ja tenho cadastro' : 'Ainda nao tenho cadastro'}
            </button>

            <p className="text-xs text-yellow-200 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-3 font-bold">
              Usuario Free acessa o app. Recursos premium mostram Somente VIP e liberam apos assinatura PRO.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
