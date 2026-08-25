import {
  autenticarRequest,
  supabaseAdmin,
} from './authSupabase.js';

function texto(valor, limite = 300) {
  const resultado = String(valor ?? '').trim();
  return resultado ? resultado.slice(0, limite) : null;
}

function numero(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function inteiro(valor) {
  const n = numero(valor);
  return n === null ? null : Math.trunc(n);
}

async function buscarRegistroUsuario(userId, jogoId) {
  const { data, error } = await supabaseAdmin
    .from('analises_ia')
    .select('*')
    .eq('user_id', userId)
    .eq('jogo_id', jogoId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export function instalarRotasHistoricoIA(app) {
  app.get('/api/historico-ia', autenticarRequest, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('analises_ia')
        .select('*')
        .eq('user_id', req.betUser.id)
        .order('criado_em', { ascending: false })
        .limit(200);

      if (error) throw error;

      return res.json({
        ok: true,
        itens: data || [],
      });
    } catch (e) {
      console.error('[Historico IA GET]', e);
      return res.status(500).json({
        ok: false,
        erro: e?.message || 'Falha ao carregar Historico IA.',
      });
    }
  });

  app.post('/api/historico-ia', autenticarRequest, async (req, res) => {
    try {
      const body = req.body || {};
      const jogoId = texto(body.jogo_id, 180);
      const confianca = numero(body.confianca);
      const fonteConfianca = texto(body.fonte_confianca, 100);

      if (!jogoId) {
        return res.status(400).json({
          ok: false,
          erro: 'ID da partida ausente.',
        });
      }

      if (confianca === null || confianca <= 0 || confianca > 100) {
        return res.status(422).json({
          ok: false,
          erro: 'Previsao real indisponivel para esta partida.',
        });
      }

      if (fonteConfianca !== 'api-football-predictions') {
        return res.status(422).json({
          ok: false,
          erro: 'Fonte da previsao nao validada.',
        });
      }

      const existente = await buscarRegistroUsuario(
        req.betUser.id,
        jogoId
      );

      if (existente) {
        return res.json({
          ok: true,
          criado: false,
          item: existente,
        });
      }

      const registro = {
        user_id: req.betUser.id,
        jogo_id: jogoId,
        fixture_id: inteiro(body.fixture_id),
        jogo: texto(body.jogo, 300),
        casa: texto(body.casa, 150),
        fora: texto(body.fora, 150),
        liga: texto(body.liga, 180),
        mercado: texto(body.mercado, 220),
        confianca,
        odd: numero(body.odd),
        prob_casa: numero(body.prob_casa),
        prob_empate: numero(body.prob_empate),
        prob_fora: numero(body.prob_fora),
        fonte_confianca: fonteConfianca,
        fonte_odds: texto(body.fonte_odds, 100),
        status: 'pendente',
        partida_em: body.partida_em || null,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('analises_ia')
        .insert(registro)
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') {
          const duplicado = await buscarRegistroUsuario(
            req.betUser.id,
            jogoId
          );

          return res.json({
            ok: true,
            criado: false,
            item: duplicado,
          });
        }

        throw error;
      }

      return res.status(201).json({
        ok: true,
        criado: true,
        item: data,
      });
    } catch (e) {
      console.error('[Historico IA POST]', e);
      return res.status(500).json({
        ok: false,
        erro: e?.message || 'Falha ao registrar analise.',
      });
    }
  });

  app.patch('/api/historico-ia/:id', autenticarRequest, async (req, res) => {
    try {
      const id = String(req.params.id || '').trim();
      const status = String(req.body?.status || '')
        .trim()
        .toLowerCase();

      if (!['pendente', 'green', 'red'].includes(status)) {
        return res.status(400).json({
          ok: false,
          erro: 'Status invalido.',
        });
      }

      const atualizacao = {
        status,
        resultado_casa: inteiro(req.body?.resultado_casa),
        resultado_fora: inteiro(req.body?.resultado_fora),
        atualizado_em: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('analises_ia')
        .update(atualizacao)
        .eq('id', id)
        .eq('user_id', req.betUser.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          ok: false,
          erro: 'Registro nao encontrado.',
        });
      }

      return res.json({
        ok: true,
        item: data,
      });
    } catch (e) {
      console.error('[Historico IA PATCH]', e);
      return res.status(500).json({
        ok: false,
        erro: e?.message || 'Falha ao atualizar resultado.',
      });
    }
  });

  app.delete('/api/historico-ia', autenticarRequest, async (req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from('analises_ia')
        .delete()
        .eq('user_id', req.betUser.id);

      if (error) throw error;

      return res.json({ ok: true });
    } catch (e) {
      console.error('[Historico IA DELETE]', e);
      return res.status(500).json({
        ok: false,
        erro: e?.message || 'Falha ao limpar historico.',
      });
    }
  });
}
