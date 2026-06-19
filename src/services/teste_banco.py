from supabase import create_client, Client

# 1. Configuração da Conexão
SUPABASE_URL = 'https://pztznppbmonhrrzfbnvh.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dHpucHBibW9uaHJyemZibnZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxNzA5MiwiZXhwIjoyMDk2MTkzMDkyfQ.t3Dvvcc6jpa9joGECZmIX4QigdjlseuVjDhiLU_Q0mY' # <--- Cole sua chave anon/public aqui

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Criando um jogo fictício para teste
jogo_teste = {
    "id_jogo": "teste_001",
    "time_casa": "BetAnalytics FC",
    "time_fora": "Sistema Anti-Ban",
    "placar_casa": 7,
    "placar_fora": 1,
    "tempo_jogo": "90'",
    "status": "LIVE"
}

print("⏳ Enviando dados para o Supabase...")

# 3. Enviando para a tabela que você acabou de criar
try:
    resposta = supabase.table('jogos_ao_vivo').upsert(jogo_teste).execute()
    print("✅ SUCESSO ABSOLUTO! Os dados chegaram no banco de dados.")
    print("Dados salvos:", resposta.data)
except Exception as e:
    print("❌ Erro na conexão:", e)