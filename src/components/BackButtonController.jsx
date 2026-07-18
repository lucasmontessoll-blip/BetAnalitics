import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export default function BackButtonController({
  viewMode,
  setViewMode,
  jogoSelecionado,
  setJogoSelecionado,
  aiOpen,
  setAiOpen,
  setMenuAtivo,
}) {
  useEffect(() => {
    const voltarApp = () => {
      if (aiOpen) {
        setAiOpen?.(false);
        return;
      }

      if (jogoSelecionado) {
        setJogoSelecionado?.(null);
        return;
      }

      if (viewMode && viewMode !== 'jogos') {
        setMenuAtivo?.('Todos os Jogos');
        setViewMode?.('jogos');
        return;
      }

      CapacitorApp.exitApp();
    };

    let listener = null;

    CapacitorApp.addListener('backButton', () => {
      voltarApp();
    }).then((handle) => {
      listener = handle;
    }).catch(() => {
      // No navegador comum, ignora. No APK Android funciona.
    });

    return () => {
      try {
        listener?.remove?.();
      } catch {}
    };
  }, [
    viewMode,
    setViewMode,
    jogoSelecionado,
    setJogoSelecionado,
    aiOpen,
    setAiOpen,
    setMenuAtivo,
  ]);

  return null;
}
