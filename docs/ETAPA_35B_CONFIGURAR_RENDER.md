# ETAPA 35B — CONFIGURAR O RENDER

Abra o serviço no Render e acesse:

Environment > Add Environment Variable

## Variáveis obrigatórias

- API_FOOTBALL_KEY
- MP_ACCESS_TOKEN
- VITE_MP_PUBLIC_KEY
- SUPABASE_URL
- SUPABASE_KEY ou SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- VITE_MODO_DEMO=false
- CORS_ALLOWED_ORIGINS=https://betanalitics-webservice.onrender.com

## Variáveis opcionais

- API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
- PLANO_PRO_VALOR=29.90
- SPORTRADAR_KEY
- VITE_API_URL

## Segurança obrigatória

O histórico do projeto continha credenciais escritas diretamente no código.
Depois de concluir a ETAPA 35B:

1. Gere um novo Access Token no Mercado Pago.
2. Revogue o token antigo.
3. Gere uma nova chave do Gemini.
4. Revogue a chave antiga.
5. Confira as chaves do Supabase e use somente as adequadas ao backend.
6. Nunca coloque valores secretos no GitHub.
7. Faça um novo deploy depois de atualizar todas as variáveis.

## Verificação após o deploy

Abra:

- /api/pagamento/health
- /api/football/health
- /api/producao/health

Todos devem responder sem revelar os valores das chaves.
