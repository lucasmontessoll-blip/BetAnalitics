import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'troque-essa-chave-no-render';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Render.');
}

const supabase = createClient(SUPABASE_URL || 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY || 'service-role-key');

app.use(cors({
  origin: FRONTEND_URL === '*' ? true : FRONTEND_URL.split(',').map((url) => url.trim()),
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

const ok = (res, data = {}) => res.json({ ok: true, ...data });
const fail = (res, status, message, extra = {}) => res.status(status).json({ ok: false, message, ...extra });

function normalizarEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function criarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      is_vip: usuario.is_vip,
      is_admin: usuario.is_admin
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return fail(res, 401, 'Login obrigatório.');

    const payload = jwt.verify(token, JWT_SECRET);
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id,nome,email,cpf,is_vip,is_admin,vip_expira_at,created_at')
      .eq('id', payload.id)
      .single();

    if (error || !usuario) return fail(res, 401, 'Usuário não encontrado.');

    const vipVenceu = usuario.vip_expira_at && new Date(usuario.vip_expira_at) < new Date();

    if (vipVenceu && usuario.is_vip) {
      await supabase
        .from('usuarios')
        .update({ is_vip: false, updated_at: new Date().toISOString() })
        .eq('id', usuario.id);

      usuario.is_vip = false;
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return fail(res, 401, 'Sessão inválida ou expirada.');
  }
}

function admin(req, res, next) {
  if (!req.usuario?.is_admin) return fail(res, 403, 'Acesso de administrador obrigatório.');
  next();
}

app.get('/api/health', (req, res) => {
  ok(res, {
    name: 'BetAnalytics PRO API',
    status: 'online',
    time: new Date().toISOString()
  });
});

app.post('/api/auth/cadastro', async (req, res) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const email = normalizarEmail(req.body.email);
    const cpf = String(req.body.cpf || '').trim();
    const senha = String(req.body.senha || '');

    if (!nome || !email || !senha) return fail(res, 400, 'Nome, email e senha são obrigatórios.');
    if (senha.length < 6) return fail(res, 400, 'A senha precisa ter pelo menos 6 caracteres.');

    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existente) return fail(res, 409, 'Este email já está cadastrado.');

    const senha_hash = await bcrypt.hash(senha, 10);

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert({
        nome,
        email,
        cpf,
        senha_hash,
        is_vip: false,
        is_admin: email.includes('admin')
      })
      .select('id,nome,email,cpf,is_vip,is_admin,vip_expira_at,created_at')
      .single();

    if (error) throw error;

    ok(res, {
      usuario,
      token: criarToken(usuario)
    });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao cadastrar usuário.');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = normalizarEmail(req.body.email);
    const senha = String(req.body.senha || '');

    if (!email || !senha) return fail(res, 400, 'Email e senha são obrigatórios.');

    const { data: usuarioCompleto, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuarioCompleto) return fail(res, 401, 'Email ou senha inválidos.');

    const senhaOk = await bcrypt.compare(senha, usuarioCompleto.senha_hash || '');

    if (!senhaOk) return fail(res, 401, 'Email ou senha inválidos.');

    const usuario = {
      id: usuarioCompleto.id,
      nome: usuarioCompleto.nome,
      email: usuarioCompleto.email,
      cpf: usuarioCompleto.cpf,
      is_vip: usuarioCompleto.is_vip,
      is_admin: usuarioCompleto.is_admin,
      vip_expira_at: usuarioCompleto.vip_expira_at,
      created_at: usuarioCompleto.created_at
    };

    ok(res, {
      usuario,
      token: criarToken(usuario)
    });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao fazer login.');
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  ok(res, { usuario: req.usuario });
});

app.put('/api/auth/perfil', auth, async (req, res) => {
  try {
    const nome = String(req.body.nome || req.usuario.nome || '').trim();
    const cpf = String(req.body.cpf || req.usuario.cpf || '').trim();

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update({ nome, cpf, updated_at: new Date().toISOString() })
      .eq('id', req.usuario.id)
      .select('id,nome,email,cpf,is_vip,is_admin,vip_expira_at,created_at')
      .single();

    if (error) throw error;

    ok(res, { usuario });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao atualizar perfil.');
  }
});

app.get('/api/favoritos', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('favoritos')
    .select('*')
    .eq('usuario_id', req.usuario.id)
    .order('created_at', { ascending: false });

  if (error) return fail(res, 500, 'Erro ao listar favoritos.');
  ok(res, { favoritos: data || [] });
});

app.post('/api/favoritos', auth, async (req, res) => {
  try {
    const tipo = String(req.body.tipo || 'jogo');
    const item_id = String(req.body.item_id || '');
    const titulo = String(req.body.titulo || '');
    const dados = req.body.dados || {};

    if (!item_id) return fail(res, 400, 'item_id obrigatório.');

    const { data, error } = await supabase
      .from('favoritos')
      .upsert({
        usuario_id: req.usuario.id,
        tipo,
        item_id,
        titulo,
        dados
      }, { onConflict: 'usuario_id,tipo,item_id' })
      .select('*')
      .single();

    if (error) throw error;

    ok(res, { favorito: data });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao salvar favorito.');
  }
});

app.delete('/api/favoritos/:item_id', auth, async (req, res) => {
  const { error } = await supabase
    .from('favoritos')
    .delete()
    .eq('usuario_id', req.usuario.id)
    .eq('item_id', req.params.item_id);

  if (error) return fail(res, 500, 'Erro ao remover favorito.');
  ok(res, { removido: true });
});

app.get('/api/historico', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('historico_assertividade')
    .select('*')
    .eq('usuario_id', req.usuario.id)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return fail(res, 500, 'Erro ao listar histórico.');
  ok(res, { historico: data || [] });
});

app.post('/api/historico', auth, async (req, res) => {
  try {
    const payload = {
      usuario_id: req.usuario.id,
      jogo_id: req.body.jogo_id || null,
      jogo: req.body.jogo || null,
      mercado: req.body.mercado || null,
      confianca_ia: Number(req.body.confianca_ia || 0),
      resultado: req.body.resultado || 'pendente',
      odd: Number(req.body.odd || 0),
      stake: Number(req.body.stake || 0),
      lucro: Number(req.body.lucro || 0),
      dados: req.body.dados || {}
    };

    const { data, error } = await supabase
      .from('historico_assertividade')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    ok(res, { registro: data });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao salvar histórico.');
  }
});

app.post('/api/pagamentos/criar-pix', auth, async (req, res) => {
  try {
    if (!MP_ACCESS_TOKEN) return fail(res, 500, 'MP_ACCESS_TOKEN não configurado.');

    const plano = req.body.plano || 'mensal';
    const valor = Number(req.body.valor || (plano === 'anual' ? 199.9 : 29.9));

    const body = {
      transaction_amount: valor,
      description: `Assinatura BetAnalytics PRO - ${plano}`,
      payment_method_id: 'pix',
      payer: {
        email: req.usuario.email,
        first_name: req.usuario.nome || 'Cliente'
      },
      external_reference: `${req.usuario.id}:${plano}:${Date.now()}`,
      notification_url: `${PUBLIC_API_URL}/api/pagamentos/webhook`
    };

    const mpResp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify(body)
    });

    const mpData = await mpResp.json();

    if (!mpResp.ok) {
      console.error('Mercado Pago erro:', mpData);
      return fail(res, 400, 'Erro ao gerar PIX.', { detalhe: mpData });
    }

    const tx = mpData?.point_of_interaction?.transaction_data || {};

    const { data: pagamento, error } = await supabase
      .from('pagamentos')
      .insert({
        usuario_id: req.usuario.id,
        mp_payment_id: String(mpData.id),
        status: mpData.status || 'pending',
        valor,
        metodo: 'pix',
        plano,
        qr_code: tx.qr_code || null,
        qr_code_base64: tx.qr_code_base64 || null,
        ticket_url: tx.ticket_url || null,
        raw: mpData
      })
      .select('*')
      .single();

    if (error) throw error;

    ok(res, {
      pagamento,
      mp_payment_id: mpData.id,
      status: mpData.status,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null,
      ticket_url: tx.ticket_url || null
    });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro interno ao gerar PIX.');
  }
});

app.get('/api/pagamentos/status/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;

    const { data: pagamento } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('mp_payment_id', String(id))
      .eq('usuario_id', req.usuario.id)
      .maybeSingle();

    if (!pagamento) return fail(res, 404, 'Pagamento não encontrado.');

    if (MP_ACCESS_TOKEN) {
      const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      });

      const mpData = await mpResp.json();

      if (mpResp.ok && mpData.status && mpData.status !== pagamento.status) {
        await processarPagamentoAprovado(mpData);
      }
    }

    const { data: atualizado } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('mp_payment_id', String(id))
      .single();

    ok(res, { pagamento: atualizado || pagamento });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao consultar pagamento.');
  }
});

async function processarPagamentoAprovado(mpData) {
  const mpId = String(mpData.id);
  const status = mpData.status || 'unknown';

  const { data: pagamento } = await supabase
    .from('pagamentos')
    .select('*')
    .eq('mp_payment_id', mpId)
    .maybeSingle();

  if (!pagamento) return null;

  await supabase
    .from('pagamentos')
    .update({
      status,
      raw: mpData,
      updated_at: new Date().toISOString()
    })
    .eq('id', pagamento.id);

  if (status === 'approved') {
    const expira = new Date();
    expira.setDate(expira.getDate() + (pagamento.plano === 'anual' ? 365 : 30));

    await supabase
      .from('usuarios')
      .update({
        is_vip: true,
        vip_expira_at: expira.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', pagamento.usuario_id);
  }

  return pagamento;
}

app.post('/api/pagamentos/webhook', async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.body?.id || req.query?.id;

    if (!paymentId) return ok(res, { received: true });

    if (!MP_ACCESS_TOKEN) return ok(res, { received: true, warning: 'MP_ACCESS_TOKEN ausente' });

    const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
    });

    const mpData = await mpResp.json();

    if (mpResp.ok) await processarPagamentoAprovado(mpData);

    ok(res, { received: true });
  } catch (err) {
    console.error('Erro webhook Mercado Pago:', err);
    ok(res, { received: true });
  }
});

app.get('/api/admin/stats', auth, admin, async (req, res) => {
  try {
    const [{ count: usuarios }, { count: vips }, { data: pagamentos }] = await Promise.all([
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('is_vip', true),
      supabase.from('pagamentos').select('valor,status').eq('status', 'approved')
    ]);

    const receita = (pagamentos || []).reduce((acc, p) => acc + Number(p.valor || 0), 0);

    ok(res, {
      usuarios: usuarios || 0,
      vips: vips || 0,
      receita
    });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Erro ao carregar admin.');
  }
});

// =========================================================
// BETANALYTICS PRO - ROTAS DE PAGAMENTO REAL MERCADO PAGO
// Cole este bloco no seu server.js ANTES do app.listen(...)
// Requer no Render: MP_ACCESS_TOKEN = sua chave privada do Mercado Pago
// Nunca coloque MP_ACCESS_TOKEN no App.jsx.
// =========================================================

const crypto = require('crypto');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const PLANO_PRO_VALOR = Number(process.env.PLANO_PRO_VALOR || 29.90);

function onlyDigits(v = '') {
  return String(v || '').replace(/\D/g, '');
}

function validarContaPagamento(body = {}) {
  const nome = String(body.nome || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const cpf = onlyDigits(body.cpf || '');
  const valor = Number(body.valor || PLANO_PRO_VALOR);

  if (!MP_ACCESS_TOKEN) return { erro: 'MP_ACCESS_TOKEN não configurado no servidor.' };
  if (!nome || nome.length < 3) return { erro: 'Nome obrigatório.' };
  if (!email || !email.includes('@')) return { erro: 'E-mail obrigatório.' };
  if (cpf.length !== 11) return { erro: 'CPF obrigatório com 11 números.' };
  if (!valor || valor <= 0) return { erro: 'Valor inválido.' };

  return { nome, email, cpf, valor };
}

async function mercadoPagoFetch(path, options = {}) {
  const resp = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'X-Idempotency-Key': crypto.randomUUID(),
      ...(options.headers || {}),
    },
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg = data?.message || data?.error || data?.cause?.[0]?.description || 'Erro Mercado Pago';
    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Gera PIX real com QR Code e Pix Copia e Cola
app.post('/api/pagamento/pix', async (req, res) => {
  try {
    const conta = validarContaPagamento(req.body);
    if (conta.erro) return res.status(400).json({ erro: conta.erro });

    const descricao = String(req.body.descricao || 'BetAnalytics PRO Mensal');

    const payment = await mercadoPagoFetch('/v1/payments', {
      method: 'POST',
      body: JSON.stringify({
        transaction_amount: Number(conta.valor),
        description: descricao,
        payment_method_id: 'pix',
        payer: {
          email: conta.email,
          first_name: conta.nome,
          identification: {
            type: 'CPF',
            number: conta.cpf,
          },
        },
      }),
    });

    const tx = payment?.point_of_interaction?.transaction_data || {};

    return res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      qr_code: tx.qr_code || null,
      qr_code_base64: tx.qr_code_base64 || null,
      ticket_url: tx.ticket_url || null,
    });
  } catch (err) {
    console.error('Erro PIX Mercado Pago:', err.data || err);
    return res.status(err.status || 500).json({
      erro: err.message || 'Erro ao gerar PIX.',
      detalhe: err.data || null,
    });
  }
});

// Processa cartão por token seguro gerado pelo MercadoPago.js/CardForm
// Nunca envie número do cartão puro para o servidor.
app.post('/api/pagamento/cartao', async (req, res) => {
  try {
    const conta = validarContaPagamento(req.body);
    if (conta.erro) return res.status(400).json({ erro: conta.erro });

    const token = String(req.body.token || '').trim();
    const paymentMethodId = String(req.body.paymentMethodId || '').trim();
    const installments = Number(req.body.installments || 1);
    const issuerId = req.body.issuerId ? String(req.body.issuerId) : undefined;

    if (!token) return res.status(400).json({ erro: 'Token do cartão obrigatório.' });
    if (!paymentMethodId) return res.status(400).json({ erro: 'Bandeira/meio de pagamento obrigatório.' });

    const body = {
      transaction_amount: Number(conta.valor),
      token,
      description: String(req.body.descricao || 'BetAnalytics PRO Mensal'),
      installments,
      payment_method_id: paymentMethodId,
      payer: {
        email: conta.email,
        first_name: conta.nome,
        identification: {
          type: 'CPF',
          number: conta.cpf,
        },
      },
    };

    if (issuerId) body.issuer_id = issuerId;

    const payment = await mercadoPagoFetch('/v1/payments', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      aprovado: payment.status === 'approved' || payment.status === 'processed',
      mensagem: payment.status_detail || null,
    });
  } catch (err) {
    console.error('Erro cartão Mercado Pago:', err.data || err);
    return res.status(err.status || 500).json({
      erro: err.message || 'Erro ao processar cartão.',
      detalhe: err.data || null,
    });
  }
});

// Consulta status para liberar VIP somente se estiver aprovado
app.get('/api/pagamento/status/:id', async (req, res) => {
  try {
    if (!MP_ACCESS_TOKEN) {
      return res.status(400).json({ erro: 'MP_ACCESS_TOKEN não configurado no servidor.' });
    }

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ erro: 'ID do pagamento obrigatório.' });

    const payment = await mercadoPagoFetch(`/v1/payments/${id}`, {
      method: 'GET',
    });

    return res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      aprovado: payment.status === 'approved' || payment.status === 'processed',
    });
  } catch (err) {
    console.error('Erro status Mercado Pago:', err.data || err);
    return res.status(err.status || 500).json({
      erro: err.message || 'Erro ao consultar pagamento.',
      detalhe: err.data || null,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ BetAnalytics PRO API online na porta ${PORT}`);
});
