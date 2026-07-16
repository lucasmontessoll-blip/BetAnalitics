const API_URL = import.meta.env.VITE_API_URL || 'https://SEU-BACKEND.onrender.com';

function getToken() {
  return localStorage.getItem('bet_token') || '';
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || data.ok === false) {
    throw new Error(data.message || 'Erro de comunicação com servidor.');
  }

  return data;
}

export const apiReal = {
  cadastro: async ({ nome, email, cpf, senha }) => {
    const data = await request('/api/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({ nome, email, cpf, senha })
    });

    localStorage.setItem('bet_token', data.token);
    localStorage.setItem('bet_sessao_ativa', data.usuario.email);
    localStorage.setItem('bet_user_nome', data.usuario.nome);

    return data;
  },

  login: async ({ email, senha }) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    localStorage.setItem('bet_token', data.token);
    localStorage.setItem('bet_sessao_ativa', data.usuario.email);
    localStorage.setItem('bet_user_nome', data.usuario.nome);

    return data;
  },

  me: () => request('/api/auth/me'),

  salvarFavorito: ({ tipo = 'jogo', item_id, titulo, dados }) => {
    return request('/api/favoritos', {
      method: 'POST',
      body: JSON.stringify({ tipo, item_id, titulo, dados })
    });
  },

  listarFavoritos: () => request('/api/favoritos'),

  removerFavorito: (item_id) => {
    return request(`/api/favoritos/${item_id}`, {
      method: 'DELETE'
    });
  },

  listarHistorico: () => request('/api/historico'),

  salvarHistorico: (payload) => {
    return request('/api/historico', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  criarPix: ({ plano = 'mensal', valor = 29.9 }) => {
    return request('/api/pagamentos/criar-pix', {
      method: 'POST',
      body: JSON.stringify({ plano, valor })
    });
  },

  statusPagamento: (id) => request(`/api/pagamentos/status/${id}`),

  adminStats: () => request('/api/admin/stats')
};
