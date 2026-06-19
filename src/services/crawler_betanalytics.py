import time
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime

# ==========================================
# 🔐 CONFIGURAÇÕES DE SEGURANÇA E APIS
# ==========================================
# Crie uma conta grátis em scraperapi.com e pegue sua chave
SCRAPER_API_KEY = 'COLOQUE_SUA_CHAVE_DO_SCRAPERAPI_AQUI' 

# As mesmas chaves do Supabase que você já usa no seu server.js
SUPABASE_URL = 'https://pztznppbmonhrrzfbnvh.supabase.co'
SUPABASE_KEY = 'SUA_CHAVE_SECRETA_DO_SUPABASE_AQUI' 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# 🤖 MOTOR DE RASPAGEM PROTEGIDA
# ==========================================
def buscar_html_seguro(url_alvo):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🛡️ Iniciando requisição blindada via ScraperAPI...")
    
    # A mágica anti-ban acontece aqui: mandamos o pedido para o ScraperAPI, não para o site final
    payload = {
        'api_key': SCRAPER_API_KEY, 
        'url': url_alvo, 
        'render': 'true' # Lida com sites que usam muito JavaScript
    }
    
    try:
        response = requests.get('https://api.scraperapi.com/', params=payload)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Erro na requisição segura: {e}")
        return None

# ==========================================
# ⚽ EXTRATOR DE PLACAR DE FUTEBOL
# ==========================================
def extrair_e_salvar_jogos(html):
    soup = BeautifulSoup(html, 'html.parser')
    
    # ⚠️ ATENÇÃO: As classes abaixo ('jogo-ao-vivo', 'time-casa', etc) 
    # dependem do site exato que você está a raspar. Atualize com o inspecionar elemento do site alvo.
    jogos_html = soup.find_all('div', class_='jogo-ao-vivo') 
    
    if not jogos_html:
        print("Nenhum jogo ao vivo encontrado ou classes HTML mudaram.")
        return

    for jogo in jogos_html:
        try:
            # Extração (Ajuste as classes conforme o HTML real do site)
            id_jogo = jogo.get('data-id', f"jogo_{int(time.time())}")
            time_casa = jogo.find('span', class_='time-casa').text.strip()
            time_fora = jogo.find('span', class_='time-fora').text.strip()
            placar_casa = int(jogo.find('span', class_='placar-casa').text.strip())
            placar_fora = int(jogo.find('span', class_='placar-fora').text.strip())
            tempo_jogo = jogo.find('span', class_='tempo-jogo').text.strip()
            
            # Preparar o pacote de dados
            dados_jogo = {
                "id_jogo": id_jogo,
                "time_casa": time_casa,
                "time_fora": time_fora,
                "placar_casa": placar_casa,
                "placar_fora": placar_fora,
                "tempo_jogo": tempo_jogo,
                "status": "LIVE",
                "ultima_atualizacao": "now()"
            }
            
            # 💾 UPSERT NO SUPABASE: Se o jogo não existe, cria. Se existe, atualiza o placar!
            resposta = supabase.table('jogos_ao_vivo').upsert(dados_jogo).execute()
            print(f"✅ Atualizado: {time_casa} {placar_casa} x {placar_fora} {time_fora} ({tempo_jogo})")
            
        except Exception as e:
            print(f"Erro ao processar um jogo específico: {e}")
            continue

# ==========================================
# 🔄 LOOP DE HEARTBEAT (Bate a cada 2 minutos)
# ==========================================
def iniciar_robo():
    url_alvo = 'https://www.EXEMPLO-DE-SITE-DE-PLACAR.com/ao-vivo'
    
    print("🚀 Robô Crawler BetAnalytics Iniciado com Proteção Anti-Ban!")
    while True:
        html = buscar_html_seguro(url_alvo)
        
        if html:
            extrair_e_salvar_jogos(html)
        
        print("💤 Robô a descansar por 2 minutos para não esgotar a API...\n")
        time.sleep(120) # Pausa de 120 segundos entre cada varredura

if __name__ == "__main__":
    iniciar_robo()