import { useEffect } from 'react';

export default function RemoverSomentePesquisaBottom() {
  useEffect(() => {
    const esconderSomentePesquisa = () => {
      try {
        const altura = window.innerHeight || document.documentElement.clientHeight;

        const botoes = Array.from(
          document.querySelectorAll('button, a, [role="button"]')
        );

        botoes.forEach((botao) => {
          const texto = (botao.innerText || botao.textContent || '')
            .trim()
            .toUpperCase();

          const rect = botao.getBoundingClientRect?.();

          if (!rect) return;

          const estaNoMenuInferior =
            rect.top > altura * 0.65 &&
            rect.bottom > altura - 130;

          const ehPesquisa =
            texto === 'PESQUISA' ||
            texto.endsWith('PESQUISA') ||
            texto.includes('\nPESQUISA');

          if (estaNoMenuInferior && ehPesquisa) {
            botao.style.display = 'none';
            botao.style.pointerEvents = 'none';
            botao.setAttribute('data-bet-removido', 'somente-pesquisa');
          }
        });
      } catch {}
    };

    esconderSomentePesquisa();

    const observer = new MutationObserver(esconderSomentePesquisa);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener('resize', esconderSomentePesquisa);

    const timer = setInterval(esconderSomentePesquisa, 800);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', esconderSomentePesquisa);
      clearInterval(timer);
    };
  }, []);

  return null;
}
