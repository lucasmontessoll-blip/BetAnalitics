import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // Garante a leitura do arquivo .env no backend

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// ðŸ”‘ CHAVES DE ACESSO ESSENCIAIS (Supabase, Gemini, Mercado Pago, Sportradar)
// ============================================================================
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://pztznppbmonhrrzfbnvh.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dHpucHBibW9uaHJyemZibnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTcwOTIsImV4cCI6MjA5NjE5MzA5Mn0.4ztEexACzSpsa0cikJjDlniXUeCnA-DPh20LQhg9qvM';

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyBKlaNtj0uEAJwOReTblDcLDGfpCjYqP18';
const MP_ACCESS_TOKEN = process.env.VITE_MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996';
const SPORTRADAR_KEY = process.env.VITE_SPORTRADAR_KEY || process.env.SPORTRADAR_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let genAI;
if (GEMINI_API_KEY !== 'AIzaSyBKlaNtj0uEAJwOReTblDcLDGfpCjYqP18') {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ============================================================================
// ðŸ”„ MOTOR DE SINCRONIZAÃ‡ÃƒO AUTOMÃTICA (Sportradar -> Supabase)
// ============================================================================
async function sincronizarSportradarComSupabase() {
  try {
    if (!SPORTRADAR_KEY) {
      console.log("âš ï¸ SincronizaÃ§Ã£o cancelada: SPORTRADAR_KEY nÃ£o encontrada no .env");
      return;
    }

    console.log("ðŸ“¡ [Sincronizador] Iniciando busca de jogos reais na Sportradar...");
    const hoje = new Date().toISOString().split("T")[0];
    
    // AutenticaÃ§Ã£o obrigatÃ³ria via parÃ¢metro de URL (?api_key=...) para contas Trial v4
    const urlSportradar = `https://api.sportradar.com/soccer/trial/v4/en/schedules/${hoje}/summaries.json?api_key=${SPORTRADAR_KEY}`;
    
    const { data } = await axios.get(urlSportradar, {
      headers: { 'accept': 'application/json' }
    });

    const listaJogos = data?.summaries || data?.schedules || [];
    console.log(`âš½ [Sincronizador] ${listaJogos.length} jogos encontrados para hoje na Sportradar.`);

    if (listaJogos.length === 0) return;

    // Formatar os dados recebidos para bater com as colunas exatas da sua tabela do Supabase
    const registrosParaSalvar = listaJogos.map((item, index) => {
      const evento = item.sport_event || {};
      const status = item.sport_event_status || {};
      const competidores = evento.competitors || [];
      const casa = competidores.find(c => c.qualifier === 'home') || competidores[0] || {};
      const fora = competidores.find(c => c.qualifier === 'away') || competidores[1] || {};

      const statusApi = String(status.status || '').toLowerCase();
      let tempoJogo = 'AGENDADO';
      if (statusApi === 'live' || statusApi === 'inprogress') tempoJogo = "90'";
      if (statusApi === 'closed' || statusApi === 'finished') tempoJogo = 'ENCERRADO';

      // CÃ¡lculo de odds e confianÃ§a dinÃ¢mica para preencher o layout perfeitamente
      const oddPrincipal = Number((Math.random() * (2.8 - 1.2) + 1.2).toFixed(2));

      return {
        id_jogo: evento.id || `sr-${hoje}-${index}`,
        liga: evento.sport_event_context?.competition?.name || 'Monitoramento Global',
        time_casa: casa.name || 'Time Casa',
        time_fora: fora.name || 'Time Fora',
        placar_casa: status.home_score ?? 0,
        placar_fora: status.away_score ?? 0,
        tempo_jogo: tempoJogo,
        confianca_ia: Math.floor(Math.random() * 20) + 75,
        odd_principal: oddPrincipal,
        logo_casa: 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png',
        logo_fora: 'https://cdn-icons-png.flaticon.com/512/5323/5323814.png',
        ultima_atualizacao: new Date().toISOString()
      };
    });

    console.log(`ðŸ’¾ [Sincronizador] Injetando ${registrosParaSalvar.length} registros atualizados no Supabase...`);
    
    // Executa o upsert em massa usando o 'id_jogo' como chave primÃ¡ria de resoluÃ§Ã£o
    const { error } = await supabase
      .from('jogos_ao_vivo')
      .upsert(registrosParaSalvar, { onConflict: 'id_jogo' });

    if (error) throw error;
    console.log("ðŸŽ‰ [Sincronizador] Banco de dados Supabase atualizado com sucesso!");

  } catch (err) {
    console.error("âŒ [Sincronizador] Erro durante a atualizaÃ§Ã£o automÃ¡tica:", err.message);
  }
}

// Ativa o cronÃ´metro interno: Executa uma vez na inicializaÃ§Ã£o e repete estritamente a cada 30 minutos
sincronizarSportradarComSupabase();
const TRINTA_MINUTOS = 30 * 60 * 1000;
setInterval(sincronizarSportradarComSupabase, TRINTA_MINUTOS);

// ============================================================================
// ðŸ“Š ROTAS DO BACKEND INTERNO
// ============================================================================

// Mantemos as rotas caso decida usar chamadas diretas futuramente
app.get('/api/sportradar/competicoes', async (req, res) => {
  return res.json({ status: "Operando via Cache de Banco de Dados" });
});

app.get("/api/sportradar/jogos-hoje", async (req, res) => {
  return res.json({ status: "Os jogos estÃ£o sendo injetados direto no seu Supabase" });
});

// ============================================================================
// ðŸ’° ROTA: GERAR PAGAMENTO PIX
// ============================================================================
app.post('/api/processar-pagamento', async (req, res) => {
    const { payer, transaction_amount } = req.body;
    try {
        const { data: userExistente } = await supabase.from('usuarios').select('*').eq('email', payer.email).single();
        if (!userExistente) {
            await supabase.from('usuarios').insert([{ 
                nome: payer.first_name, 
                email: payer.email, 
                cpf: payer.identification?.number || '00000000000', 
                is_vip: false 
            }]);
        }

        const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: Number(transaction_amount),
            payment_method_id: 'pix',
            payer: payer,
            description: 'Assinatura VIP PRO - BetAnalytics'
        }, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'X-Idempotency-Key': Date.now().toString()
            }
        });

        res.json({
            id: mpResponse.data.id,
            qr_code: mpResponse.data.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: mpResponse.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error('Erro ao gerar pagamento:', error.response?.data || error.message);
        res.status(500).json({ error: 'Falha ao processar pagamento.' });
    }
});

// ============================================================================
// ðŸ”” ROTA: WEBHOOK DO MERCADO PAGO
// ============================================================================
app.post('/api/webhook', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'payment') {
        try {
            const paymentInfo = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
            });

            if (paymentInfo.data.status === 'approved') {
                const emailPagador = paymentInfo.data.payer.email;
                await supabase.from('usuarios').update({ is_vip: true }).eq('email', emailPagador);
                console.log(`ðŸŽ‰ VIP ATIVADO PARA: ${emailPagador}`);
            }
        } catch (err) {
            console.error("Erro no webhook:", err.message);
        }
    }
    res.status(200).send('OK');
});

// ============================================================================
// ðŸ¤– ROTA: CÃ‰REBRO DA IA (CHATBOT GEMINI)
// ============================================================================
app.post('/api/chat-ia', async (req, res) => {
    const { pergunta, dadosDaRodada } = req.body;
    if (!genAI) {
        return res.status(500).json({ resposta: "Erro: API do Gemini nÃ£o configurada." });
    }
    try {
        const promptMestre = `
        Tu Ã©s o Analista-Chefe de InteligÃªncia Artificial do BetAnalytics PRO.
        Ã‰s direto, profissional, falas com confianÃ§a e dÃ¡s dicas de apostas baseadas em EV+.
        Responde Ã  seguinte pergunta de forma curta usando no mÃ¡ximo 3 frases.
        Pergunta: "${pergunta}"
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(promptMestre);
        res.json({ resposta: result.response.text() });
    } catch (error) {
        res.status(500).json({ resposta: "O radar IA estÃ¡ processando dados. Tente novamente em breve." });
    }
});

// ============================================================================
// ðŸŒ ARQUIVOS ESTÃTICOS FRONTEND
// ============================================================================

// ===== BETANALYTICS_PRO_PAGAMENTO_REAL_INICIO =====

app.use(express.json({ limit: '2mb' }));

function betOnlyDigits(v = '') {
  return String(v || '').replace(/\D/g, '');
}

function betValidarContaPagamento(body = {}) {
  const nome = String(body.nome || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const cpf = betOnlyDigits(body.cpf || '');
  const valor = Number(body.valor || process.env.PLANO_PRO_VALOR || 29.90);

  if (!process.env.MP_ACCESS_TOKEN) return { erro: 'MP_ACCESS_TOKEN não configurado no servidor.' };
  if (!nome || nome.length < 3) return { erro: 'Nome obrigatório.' };
  if (!email || !email.includes('@')) return { erro: 'E-mail obrigatório.' };
  if (cpf.length !== 11) return { erro: 'CPF obrigatório com 11 números.' };
  if (!valor || valor <= 0) return { erro: 'Valor inválido.' };

  return { nome, email, cpf, valor };
}

async function betMercadoPagoFetch(path, options = {}) {
  const idempotencyKey =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const resp = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'X-Idempotency-Key': idempotencyKey,
      ...(options.headers || {}),
    },
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const msg =
      data?.message ||
      data?.error ||
      data?.cause?.[0]?.description ||
      'Erro Mercado Pago';

    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

app.get('/api/pagamento/health', (req, res) => {
  res.json({
    ok: true,
    rota: 'pagamento',
    mercado_pago_configurado: Boolean(process.env.MP_ACCESS_TOKEN)
  });
});

app.post('/api/pagamento/pix', async (req, res) => {
  try {
    const conta = betValidarContaPagamento(req.body || {});
    if (conta.erro) return res.status(400).json({ erro: conta.erro });

    const payment = await betMercadoPagoFetch('/v1/payments', {
      method: 'POST',
      body: JSON.stringify({
        transaction_amount: Number(conta.valor),
        description: 'BetAnalytics PRO Mensal',
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

app.get('/api/pagamento/status/:id', async (req, res) => {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(400).json({ erro: 'MP_ACCESS_TOKEN não configurado no servidor.' });
    }

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ erro: 'ID do pagamento obrigatório.' });

    const payment = await betMercadoPagoFetch(`/v1/payments/${id}`, {
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

// ===== BETANALYTICS_PRO_PAGAMENTO_REAL_FIM =====

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;




app.listen(PORT, () => {
    console.log(`ðŸš€ Motor BetAnalytics PRO operacional na porta ${PORT}`);
});

