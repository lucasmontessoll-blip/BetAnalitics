import os
import time
import requests
from datetime import datetime
from supabase import create_client, Client

# =========================================================
# 🔒 CONFIGURAÇÕES DE SEGURANÇA E CHAVES
# =========================================================
SUPABASE_URL = os.environ.get("https://pztnppbmonhrrzfbnvh.supabase.co")
SUPABASE_KEY = os.environ.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dHpucHBibW9uaHJyemZibnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTcwOTIsImV4cCI6MjA5NjE5MzA5Mn0.4ztEexACzSpsa0cikJjDlniXUeCnA-DPh20LQhg9qvM")
API_FOOTBALL_KEY = os.environ.get("API_FOOTBALL_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    "x-apisports-key": API_FOOTBALL_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io"
}

# CONFIGURAÇÃO DE ECONOMIA DE API (20 min = 72 req/dia = 2160/mês)
INTERVALO_MINUTOS = 20  

def buscar_jogos_ao_vivo():
    hora_atual = datetime.now().strftime('%H:%M:%S')
    print(f"[{hora_atual}] Buscando jogos na API-Football (Modo Economia)...")
    url = "https://v3.football.api-sports.io/fixtures?live=all"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        dados = response.json()
        
        if not dados.get("response"):
            print("Nenhum jogo ao vivo encontrado neste momento.")
            return []
            
        return dados["response"]
    except Exception as e:
        print(f"Erro ao consultar a API-Football: {e}")
        return []

def salvar_no_banco(jogos):
    if not jogos:
        return
        
    for j in jogos:
        fixture = j["fixture"]
        league = j["league"]
        teams = j["teams"]
        goals = j["goals"]
        
        id_jogo = fixture["id"]
        
        tempo_jogo = str(fixture["status"]["elapsed"]) if fixture["status"]["elapsed"] else fixture["status"]["short"]
        if tempo_jogo == "HT": tempo_jogo = "INTERVALO"
        
        dados_db = {
            "id_jogo": id_jogo,
            "liga": league["name"],
            "time_casa": teams["home"]["name"],
            "time_fora": teams["away"]["name"],
            "placar_casa": goals["home"] if goals["home"] is not None else 0,
            "placar_fora": goals["away"] if goals["away"] is not None else 0,
            "tempo_jogo": tempo_jogo,
            "odd_principal": 1.85, 
            "confianca_ia": 89,
            # 🔥 CAPTURA DOS ESCUDOS OFICIAIS
            "logo_casa": teams["home"]["logo"],
            "logo_fora": teams["away"]["logo"]
        }
        
        try:
            supabase.table("jogos_ao_vivo").upsert(dados_db).execute()
        except Exception as e:
            print(f"Erro ao salvar jogo ID {id_jogo}: {e}")
            
    print(f"✅ GOOOOOL! {len(jogos)} jogos salvos no banco de dados com escudos!")

def iniciar_robo():
    print("🤖 Robô BetAnalytics PRO (API-Football) Iniciado!")
    print(f"💰 Custo Mensal Estimado: 2.160 requisições (Limite: 7.500)")
    
    while True:
        jogos = buscar_jogos_ao_vivo()
        salvar_no_banco(jogos)
        
        print(f"⏳ Dormindo por {INTERVALO_MINUTOS} minutos para poupar limites da API...")
        time.sleep(INTERVALO_MINUTOS * 60)

if __name__ == "__main__":
    if not API_FOOTBALL_KEY:
        print("❌ ERRO: Chave da API-Football não encontrada nas variáveis de ambiente!")
    else:
        iniciar_robo()