# ETAPA 35B — SEGURANÇA

## Corrigido automaticamente

- modo demonstração controlado por VITE_MODO_DEMO;
- chave pública do Mercado Pago removida do código;
- credenciais privadas removidas do server.js;
- CORS restrito a origens configuradas;
- .env.example criado sem valores reais;
- endpoint de saúde de produção criado;
- arquivos antigos de backup arquivados fora da árvore ativa;
- npm audit fix executado sem --force, salvo quando ignorado pelo usuário.

## Ação manual indispensável

Remover o segredo do arquivo atual não remove o valor do histórico do Git.
Por isso, as credenciais antigas precisam ser revogadas e substituídas.

Não reutilize os valores antigos.
