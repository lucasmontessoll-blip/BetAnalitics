import { useEffect } from "react";

export function useAlertas(jogos) {
  useEffect(() => {
    if (!jogos || jogos.length === 0) return;

    jogos.forEach(jogo => {
      // Se a confiança for maior que 90%, dispara no console (futuramente notificação Push)
      if (jogo.confianca_ia > 90 || jogo.confianca > 90) {
        console.log(`🚨 ALERTA PREMIUM [VALUE BET]: ${jogo.home_team || jogo.nome} (Confiança: 90%+)`);
      }
    });
  }, [jogos]);
}