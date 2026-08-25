import { autenticarRequest, supabaseAdmin } from './authSupabase.js';

function tokenMP() {
  return String(
    process.env.MP_ACCESS_TOKEN ||
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    ''
  ).trim();
}

async function consultarPagamento(id) {
  const token = tokenMP();
  if (!token) throw new Error('MP_ACCESS_TOKEN não configurado.');

  const resp = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.message || 'Pagamento não encontrado no Mercado Pago.');
  return data;
}

async function persistirPagamento(data) {
  if (!supabaseAdmin) throw new Error('Supabase backend não configurado.');

  const email = String(data?.payer?.email || '').trim().toLowerCase();
  const aprovado = data?.status === 'approved';

  await supabaseAdmin.from('pagamentos').upsert({
    payment_id: String(data.id),
    email,
    status: data.status || 'unknown',
    status_detail: data.status_detail || '',
    valor: Number(data.transaction_amount || 0),
    metodo: data.payment_method_id || '',
    payload: data,
    atualizado_em: new Date().toISOString()
  }, { onConflict: 'payment_id' });

  if (aprovado && email) {
    const agora = new Date();
    const expira = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);

    await supabaseAdmin
      .from('usuarios')
      .update({
        is_vip: true,
        plano: 'PRO',
        vip_expira: expira.toISOString(),
        atualizado_em: agora.toISOString()
      })
      .eq('email', email);
  }

  return { email, aprovado };
}

export function instalarWebhookMercadoPago(app) {
  app.post('/api/pagamento/webhook', async (req, res) => {
    try {
      const id = String(
        req.body?.data?.id ||
        req.body?.id ||
        req.query?.['data.id'] ||
        ''
      ).trim();

      if (!id) return res.status(200).json({ ok: true, ignorado: true });

      const pagamento = await consultarPagamento(id);
      const resultado = await persistirPagamento(pagamento);

      return res.status(200).json({ ok: true, payment_id: pagamento.id, ...resultado });
    } catch (e) {
      console.error('Webhook MP:', e);
      return res.status(500).json({ ok: false, erro: e?.message || 'Falha no webhook.' });
    }
  });

  app.post('/api/pagamento/sincronizar/:id', autenticarRequest, async (req, res) => {
    try {
      const pagamento = await consultarPagamento(req.params.id);
      const emailSessao = String(req.betUser?.email || '').toLowerCase();
      const emailPagamento = String(pagamento?.payer?.email || '').toLowerCase();

      if (emailSessao && emailPagamento && emailSessao !== emailPagamento) {
        return res.status(403).json({ ok: false, erro: 'Pagamento pertence a outro usuário.' });
      }

      const resultado = await persistirPagamento(pagamento);
      return res.json({ ok: true, pagamento, ...resultado });
    } catch (e) {
      return res.status(500).json({ ok: false, erro: e?.message || 'Falha ao sincronizar pagamento.' });
    }
  });
}
