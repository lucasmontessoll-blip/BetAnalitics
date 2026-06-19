import time
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime

# ==========================================
# 🔐 CONFIGURAÇÕES DE SEGURANÇA E APIS
# ==========================================
# A sua chave da ScraperAPI
SCRAPER_API_KEY = '04016419f7fb783b38ae2fe116693b7c' 

# A sua configuração do Supabase
SUPABASE_URL = 'https://pztznppbmonhrrzfbnvh.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dHpucHBibW9uaHJyemZibnZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYxNzA5MiwiZXhwIjoyMDk2MTkzMDkyfQ.t3Dvvcc6jpa9joGECZmIX4QigdjlseuVjDhiLU_Q0mY' # <--- Cole sua chave do Supabase aqui

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# 🤖 MOTOR DE RASPAGEM PROTEGIDA (ANTI-BAN)
# ==========================================
def buscar_html_seguro(url_alvo):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 🛡️ Fazendo requisição blindada via ScraperAPI...")
    
    payload = {
        'api_key': SCRAPER_API_KEY, 
        'url': url_alvo, 
        'render': 'false' # Mantido false para evitar o Erro 500 de timeout do servidor deles
    }
    
    try:
        response = requests.get('https://api.scraperapi.com/', params=payload)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"❌ Erro na requisição segura: {e}")
        return None

# ==========================================
# ⚽ EXTRATOR E CONVERSOR DE DADOS (ATUALIZADO)
# ==========================================
def extrair_e_salvar_jogos(html):
    # 1. Salva um "Raio-X" (Mantemos para segurança)
    try:
        with open("debug_site.html", "w", encoding="utf-8") as arquivo:
            arquivo.write(html)
    except:
        pass

    # 2. Processa o HTML
    soup = BeautifulSoup(html, 'html.parser')
    
    # A NOVA CLASSE MÁGICA QUE VOCÊ DESCOBRIU:
    jogos_html = soup.find_all('div', class_='row align-items-center content')
    
    if not jogos_html:
        print("⚠️ Nenhum jogo encontrado. O site pode estar sem jogos ao vivo agora.")
        return

    for jogo in jogos_html:
        try:
            # Pega os nomes dos times (Estão dentro da classe 'team-name')
            times = jogo.find_all('div', class_='team-name')
            if len(times) < 2:
                continue 
                
            time_casa = times[0].text.strip()
            time_fora = times[1].text.strip()
            
            # Pega os placares (Estão na classe 'badge-default' dentro de 'match-score')
            placares = jogo.select('.match-score span.badge-default')
            
            placar_casa = 0
            placar_fora = 0
            
            # Alguns jogos agendados ainda não têm placar, então garantimos que não dê erro
            if len(placares) >= 2:
                try:
                    placar_casa = int(placares[0].text.strip())
                    placar_fora = int(placares[1].text.strip())
                except ValueError:
                    pass # Se o texto for vazio, fica zero.
            
            # Pega o tempo/status (Classe 'status-name')
            status_elemento = jogo.find('span', class_='status-name')
            tempo_jogo = status_elemento.text.strip() if status_elemento else "AGENDADO"
            
            # Cria um ID único
            data_hoje = datetime.now().strftime("%Y%m%d")
            id_jogo = f"{time_casa[:3]}_{time_fora[:3]}_{data_hoje}".replace(" ", "_").upper()
            
            dados_jogo = {
                "id_jogo": id_jogo,
                "time_casa": time_casa,
                "time_fora": time_fora,
                "placar_casa": placar_casa,
                "placar_fora": placar_fora,
                "tempo_jogo": tempo_jogo,
                "status": "LIVE" if "INTERVALO" in tempo_jogo or "'" in tempo_jogo else "INFO"
            }
            
            # Executa o UPSERT no Supabase
            supabase.table('jogos_ao_vivo').upsert(dados_jogo).execute()
            print(f"✅ GOOOOOL! Salvo no banco: {time_casa} {placar_casa} x {placar_fora} {time_fora} ({tempo_jogo})")
            
        except Exception as e:
            # Se uma linha específica falhar, ele pula pro próximo jogo sem travar
            continue

# ==========================================
# 🔄 LOOP CONTÍNUO (MANTÉM O APP VIVO)
# ==========================================
def iniciar_crawler():
    url_alvo = 'https://www.placardefutebol.com.br/jogos-de-hoje'
    
    print("🚀 Robô Crawler BetAnalytics ativo e monitorando em tempo real!")
    
    while True:
        html = buscar_html_seguro(url_alvo)
        
        if html:
            extrair_e_salvar_jogos(html)
        
        print("💤 Aguardando 2 minutos para a próxima varredura...\n")
        time.sleep(120)

if __name__ == "__main__":
    iniciar_crawler()