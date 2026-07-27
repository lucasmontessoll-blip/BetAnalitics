const CHAVE_PAGAMENTOS = 'bet_pagamentos_v1';

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function texto(valor, fallback = '') {
  return String(valor || fallback || '').trim();
}

function idPagamento(pagamento = {}) {
  return String(
    pagamento.id ||
    pagamento.payment_id ||
    pagamento.paymentId ||
    pagamento.payment ||
    `local-${Date.now()}`
  );
}

export function carregarPagamentosLocal() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_PAGAMENTOS) || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function salvarPagamentosLocal(lista) {
  try {
    localStorage.setItem(CHAVE_PAGAMENTOS, JSON.stringify(Array.isArray(lista) ? lista : []));
  } catch {
    // Mantem o app funcionando.
  }
}

export function salvarPagamentoLocal(pagamento = {}) {
  const id = idPagamento(pagamento);
  const atual = carregarPagamentosLocal();

  const existente = atual.find((item) => {
    return String(item.id) === id || String(item.payment_id) === id;
  });

  const semDuplicar = atual.filter((item) => {
    return String(item.id) !== id && String(item.payment_id) !== id;
  });

  const normalizado = {
    ...(existente || {}),
    ...pagamento,
    id,
    payment_id: String(pagamento.payment_id || pagamento.id || id),
    valor: numero(pagamento.valor || pagamento.transaction_amount, existente?.valor || 0),
    metodo: texto(pagamento.metodo, existente?.metodo || 'pix'),
    status: texto(pagamento.status, existente?.status || 'pending'),
    status_detail: texto(pagamento.status_detail, existente?.status_detail || ''),
    aprovado: Boolean(
      pagamento.aprovado ||
      pagamento.status === 'approved' ||
      pagamento.status === 'processed' ||
      existente?.aprovado
    ),
    criadoEm: pagamento.criadoEm || existente?.criadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };

  salvarPagamentosLocal([normalizado, ...semDuplicar].slice(0, 120));

  return normalizado;
}

export function registrarPagamentoGerado({
  conta = {},
  pagamento = {},
  metodo = 'pix',
  valor = 0,
  descricao = 'Plano PRO'
} = {}) {
  const id = idPagamento(pagamento);

  return salvarPagamentoLocal({
    id,
    payment_id: id,
    nome: texto(conta.nome, 'Cliente'),
    email: texto(conta.email, ''),
    cpf_final: texto(conta.cpf, '').slice(-4),
    metodo,
    valor: numero(valor || pagamento.valor || pagamento.transaction_amount, 0),
    descricao,
    status: texto(pagamento.status, 'pending'),
    status_detail: texto(pagamento.status_detail, ''),
    aprovado: Boolean(
      pagamento.aprovado ||
      pagamento.status === 'approved' ||
      pagamento.status === 'processed'
    ),
    qr_code: pagamento.qr_code || '',
    ticket_url: pagamento.ticket_url || '',
    origem: 'mercado_pago',
    criadoEm: new Date().toISOString()
  });
}

export function atualizarPagamentoLocal(paymentId, dados = {}) {
  if (!paymentId) return null;

  return salvarPagamentoLocal({
    ...dados,
    id: String(paymentId),
    payment_id: String(paymentId)
  });
}

export function registrarPagamentoAprovado(paymentId, dados = {}) {
  if (!paymentId) return null;

  return atualizarPagamentoLocal(paymentId, {
    ...dados,
    status: dados.status || 'approved',
    aprovado: true,
    aprovadoEm: new Date().toISOString()
  });
}
