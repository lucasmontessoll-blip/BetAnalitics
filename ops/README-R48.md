# BetAnalyticsPRO — pacote R48 de correcoes

Base exata: 4dd1601d6e8d056df7e8e3888fc7d0b82f5b8d65.
Este pacote contem arquivos completos alterados, testes e SQL. Nao e uma nova
reescrita do aplicativo, nao inclui segredos, AAB, node_modules nem assets compilados.
Nao e uma certificacao de publicacao: os testes externos abaixo continuam obrigatorios.

## Implementado

- Privilegios TRUNCATE/TRIGGER/REFERENCES restritos nas cinco tabelas auditadas.
- historico_apostas sem acesso anon/authenticated: nenhum consumidor ativo dessa
  tabela foi encontrado na revisao. O historico IA usa analises_ia.
- Escrita direta em analises_ia bloqueada; API exige PRO, com exclusao dos proprios
  dados ainda permitida pelo endpoint autenticado mesmo apos expirar o plano.
- PRO ativo conferido no banco em radar-odds, pacote-completo, motor historical,
  chat-ia e leitura/criacao/edicao do historico IA. Detalhes basicos do jogo continuam
  disponiveis a usuarios autenticados. Nao foi alterado o preco do plano.
- Perfil ligado exclusivamente por UUID; erro no banco nega autorizacao.
- JWT validado pelo SDK e session_id conferido no banco a cada request protegido;
  sessoes removidas e usuarios banidos sao negados. Isso acrescenta uma consulta por
  requisicao: medir latencia e consumo antes de ampliar trafego, sem exigir plano pago.
- Dados de exclusao da conta removidos em uma transacao por RPC restrita ao backend;
  Auth e excluido depois pela API oficial. Se Auth falhar, pode repetir a requisicao.
  Nao existe transacao unica entre banco e API Auth; monitorar falhas parciais.
  Pagamentos permanecem retidos conforme comportamento anterior.
- Timeout de 15s na leitura de pagamentos pelo webhook, incluindo leitura do JSON.
- Falha da consulta principal de fixture retorna 502; falhas secundarias sao
  identificadas por nomes em respostas de jogo/pacote. A interface ainda deve passar
  por homologacao visual para confirmar mensagens de indisponibilidade.
- Testes de regressao, CI Web/Play, verificador estatico Play e verificador de AAB.

## Nao alterar apenas para eliminar avisos

A protecao paga contra senhas vazadas fica fora do escopo. O indice apontado como
nao utilizado permanece. conversoes_afiliados continua restrita. A tela HistoricoIAPro
ja informa que Green/Red e manual: nao transformamos esse indicador em resultado
automatico ou auditado. Validacao da fonte de previsao enviada pelo cliente nao e
atestado de autenticidade; certificacao automatica de estatisticas permanece fora
deste pacote e requer armazenamento de previsoes originadas no servidor.

## Sequencia segura

1. Extraia o ZIP fora de E:\BetAnalytcs. Leia este documento.
2. Em uma copia de homologacao do banco, execute a migracao oficial
   supabase/migrations/20260913225002_r48_final_hardening.sql. O script
   inicia uma transacao, verifica perfis sem Auth e so confirma se as verificacoes
   finais passarem. Nao executa exclusao de conta durante a instalacao.
3. Teste as RPCs usando exclusivamente o backend, sem colocar service_role no app.
   Verifique que anon/authenticated nao executam as RPCs e que uma sessao encerrada
   retorna false. O pacote nao aplicou esse SQL em nenhum banco remoto.
4. Execute Aplicar-R48.ps1 para aplicar os arquivos no repositorio local. O aplicador
   exige HEAD base, main limpa e hashes esperados; salva backups e nao faz push.
5. Execute npm ci, npm test, npm run build -- --outDir dist-web,
   npm run build:play -- --outDir dist-play, npm run verify:play.
6. Homologue Free, PRO, expirado e admin; conta excluida e sessao encerrada; isolamento
   entre duas contas; login/recuperacao; gravacao/edicao/exclusao de historico.
7. Antes de publicar o backend, aplique o SQL validado na producao, preservando
   backup de esquema/privilegios. Publique apenas apos revisar o diff. A ausencia
   das novas RPCs resulta em 503 nas rotas autenticadas (falha fechada).
8. Render: usar Node 24 (arquivo .node-version), build npm ci --include=dev && npm run build,
   start npm run start, health check /api/producao/readiness. Essa rota ja existe e
   indica disponibilidade do processo/shutdown, nao validade de MP/Gemini/Supabase.
   Ajustes do painel nao foram aplicados; nao criar outro servico nem contratar plano.
9. Verificar Vercel e Render com node ops/smoke.mjs URL_HTTPS. Testar tambem os
   fluxos autenticados; health 200 nao atesta funcionamento de pagamentos.
10. GitHub: ativar protecao main e exigir check verify conforme disponibilidade do
    repositorio/plano. O pacote fornece workflow, mas nao muda configuracao remota.

## AAB e pagamentos — gates obrigatorios

O Gradle atual usa versionCode 3. Nao escolhemos code2 pelo nome nem alteramos o AAB.
Use ops/Verify-Aab.ps1 com -Aab CAMINHO -Bundletool CAMINHO_DO_JAR.
Esse verificador apenas le manifesto, hash e assinatura; tambem e necessario
comparar certificado com a chave de upload no Play Console, analisar assets do AAB,
instalar no aparelho e testar login, navegacao, voltar, notificacoes e exclusao.
O script PowerShell nao foi executado neste ambiente Linux.

Homologar Mercado Pago com credenciais/contas de teste: aprovado, recusado, pendente,
webhook repetido/expirado/sem assinatura, pagamento de outra conta e liberacao PRO
uma unica vez. Nenhuma cobranca ou teste com a nova credencial foi feito pelo pacote.
Reembolsos/chargebacks e mudanca futura de preco exigem regra de entitlement explicita;
nao implementamos revogacao retroativa que possa retirar acesso legitimo.

## Evidencias desta entrega

- npm ci --ignore-scripts: passou (instalacao local isolada).
- npm test: 11 testes passaram, com mocks; nao sao testes de producao.
- build Web e build Play: passaram sem credenciais de producao.
- verify:play: passou para o bundle gerado.
- node --check nos arquivos alterados e git diff --check: passaram.
- npm audit --omit=dev e npm audit completo: zero vulnerabilidades informadas nesta consulta.
- Schema remoto consultado: colunas de sessions/users usadas pela RPC existem;
  perfis sem usuario Auth: zero. Somente consultas, sem DDL remoto.
- SQL: revisao estatica e preflight de estrutura; falta executar em homologacao.
- PowerShell/AAB/aparelho, carga, testes autenticados e MP: nao executados.

## Recuperacao

O aplicador salva arquivos anteriores em Downloads/BetAnalytics_R48_Backup_<GUID>.
Em falha de copia, restaura os arquivos que alterou e remove apenas os novos que
acabou de criar. Erro de validacao posterior NAO executa git reset nem apaga trabalho.
Antes de publicar, reversao e restaurar somente os arquivos do manifesto a partir
desse backup. Em producao, voltar ao deploy anterior se necessario; manter restricoes
SQL de seguranca. Nao reabrir TRUNCATE para restaurar um comportamento antigo.
As RPCs novas sao aditivas e podem permanecer durante rollback do backend.

Fontes: https://supabase.com/docs/guides/auth/sessions e
https://www.postgresql.org/docs/current/ddl-rowsecurity.html.
