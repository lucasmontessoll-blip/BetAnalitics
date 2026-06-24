import { useEffect } from "react";

export function useAlertas(jogos) {
  useEffect(() => {
    // Solicita permissão ao SO na primeira carga
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    if (!jogos || jogos.length === 0) return;

    jogos.forEach(jogo => {
      const confianca = jogo.confianca_ia || jogo.confianca || 0;
      
      if (confianca > 90) {
        // Dispara notificação push real se autorizado
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🚨 ALERTA PREMIUM BETANALYTICS", {
            body: `Oportunidade Value Bet: ${jogo.home_team || jogo.nome} com ${confianca}% de confiança.`,
            icon: jogo.home_image || "https://cdn-icons-png.flaticon.com/512/5323/5323814.png"
          });
        } else {
          console.log(`🚨 ALERTA PREMIUM: ${jogo.home_team || jogo.nome} (${confianca}%)`);
        }
      }
    });
  }, [jogos]);
}