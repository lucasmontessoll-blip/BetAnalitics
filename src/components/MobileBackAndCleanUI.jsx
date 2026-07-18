import { useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export default function MobileBackAndCleanUI({
  viewMode,
  setViewMode,
  jogoSelecionado,
  setJogoSelecionado,
  aiOpen,
  setAiOpen,
  setMenuAtivo,
}) {
  const stateRef = useRef({
    viewMode,
    jogoSelecionado,
    aiOpen,
  });

  const lastBackRef = useRef(0);

  useEffect(() => {
    stateRef.current = {
      viewMode,
      jogoSelecionado,
      aiOpen,
    };
  }, [viewMode, jogoSelecionado, aiOpen]);

  useEffect(() => {
    const styleId = 'bet-hide-visual-back-buttons';

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        button:has(svg.lucide-arrow-left),
        button:has([data-lucide="arrow-left"]),
        a:has(svg.lucide-arrow-left),
        a:has([data-lucide="arrow-left"]),
        button[aria-label*="Voltar"],
        button[title*="Voltar"],
        .botao-voltar,
        .btn-voltar {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const mostrarAvisoSair = () => {
      const id = 'bet-toast-back-exit';
      const antigo = document.getElementById(id);

      if (antigo) {
        antigo.remove();
      }

      const toast = document.createElement('div');
      toast.id = id;
      toast.innerText = 'Pressione voltar novamente para sair';
      toast.style.position = 'fixed';
      toast.style.left = '50%';
      toast.style.bottom = '92px';
      toast.style.transform = 'translateX(-50%)';
      toast.style.zIndex = '99999';
      toast.style.background = 'rgba(15, 23, 42, 0.96)';
      toast.style.color = '#fff';
      toast.style.border = '1px solid rgba(255,255,255,0.12)';
      toast.style.borderRadius = '999px';
      toast.style.padding = '10px 16px';
      toast.style.fontSize = '11px';
      toast.style.fontWeight = '900';
      toast.style.boxShadow = '0 12px 35px rgba(0,0,0,0.35)';

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 1600);
    };

    const voltarDentroDoApp = () => {
      const atual = stateRef.current;

      if (atual.aiOpen) {
        setAiOpen?.(false);
        return true;
      }

      if (atual.jogoSelecionado) {
        setJogoSelecionado?.(null);
        return true;
      }

      if (atual.viewMode && atual.viewMode !== 'jogos') {
        setMenuAtivo?.('Todos os Jogos');
        setViewMode?.('jogos');
        return true;
      }

      const agora = Date.now();

      if (agora - lastBackRef.current < 1700) {
        CapacitorApp.exitApp();
        return true;
      }

      lastBackRef.current = agora;
      mostrarAvisoSair();
      return true;
    };

    let nativeListener = null;

    CapacitorApp.addListener('backButton', () => {
      voltarDentroDoApp();
    }).then((handle) => {
      nativeListener = handle;
    }).catch(() => {});

    const androidForcado = () => {
      voltarDentroDoApp();
    };

    window.addEventListener('betAndroidBackButton', androidForcado);
    document.addEventListener('backbutton', androidForcado);

    return () => {
      try {
        nativeListener?.remove?.();
      } catch {}

      window.removeEventListener('betAndroidBackButton', androidForcado);
      document.removeEventListener('backbutton', androidForcado);
    };
  }, [
    setViewMode,
    setJogoSelecionado,
    setAiOpen,
    setMenuAtivo,
  ]);

  return null;
}
