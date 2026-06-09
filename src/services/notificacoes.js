// Ficheiro: src/services/notificacoes.js

export const solicitarPermissaoNotificacao = () => {
  if (!("Notification" in window)) {
    alert("Este navegador não suporta notificações de área de trabalho.");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      new Notification("BetAnalytics PRO", {
        body: "Notificações ativadas! Receberá alertas de Value Bets em tempo real.",
        icon: "/vite.svg" 
      });
    }
  });
};

export const dispararAlertaPush = (titulo, mensagem) => {
  if (Notification.permission === "granted") {
    new Notification(titulo, { body: mensagem });
  }
};