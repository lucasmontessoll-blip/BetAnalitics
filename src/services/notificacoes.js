// Ficheiro: src/services/notificacoes.js

export async function solicitarPermissaoNotificacao() {
  if (!("Notification" in window)) {
    alert("O seu navegador ou telemóvel não suporta notificações nativas.");
    return;
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    new Notification('BetAnalytics Pro', {
      body: 'Radar de Value Bets ativado com sucesso! 💰',
      icon: '/icon-192.png' // Ícone correto da PWA
    });
  }
}

export function dispararAlerta(titulo, mensagem) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, { 
      body: mensagem, 
      icon: '/icon-192.png' 
    });
  }
}