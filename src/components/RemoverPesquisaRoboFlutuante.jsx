import { useEffect } from 'react';

export default function RemoverPesquisaRoboFlutuante() {
  useEffect(() => {
    const esconder = () => {
      try {
        const largura = window.innerWidth || document.documentElement.clientWidth;
        const altura = window.innerHeight || document.documentElement.clientHeight;

        const elementos = Array.from(
          document.querySelectorAll('button, a, div, span')
        );

        elementos.forEach((el) => {
          const texto = (el.innerText || el.textContent || '').trim().toUpperCase();
          const rect = el.getBoundingClientRect?.();

          if (!rect) return;

          const style = window.getComputedStyle(el);
          const pos = style.position;

          // Remove aba PESQUISA do menu inferior
          if (texto === 'PESQUISA' || texto.includes('\nPESQUISA')) {
            const alvo = el.closest('button, a, [role="button"]') || el.parentElement || el;

            const alvoRect = alvo.getBoundingClientRect?.();

            if (alvoRect && alvoRect.top > altura * 0.60) {
              alvo.style.display = 'none';
              alvo.style.pointerEvents = 'none';
              alvo.setAttribute('data-bet-removido', 'pesquisa');
            }
          }

          // Remove botão flutuante do robô IA, sem mexer no menu IA normal
          const temRobo = texto.includes('🤖') || texto === 'IA' || texto.includes('\nIA');
          const estaNaDireita = rect.right > largura - 150;
          const estaEmbaixo = rect.bottom > altura - 260;
          const pareceFlutuante = pos === 'fixed' || pos === 'absolute' || rect.width <= 90;

          if (temRobo && estaNaDireita && estaEmbaixo && pareceFlutuante) {
            const alvo = el.closest('button, a, [role="button"]') || el;

            const alvoTexto = (alvo.innerText || alvo.textContent || '').trim().toUpperCase();
            const alvoRect = alvo.getBoundingClientRect?.();

            if (
              alvoRect &&
              alvoRect.right > largura - 160 &&
              alvoRect.bottom > altura - 280 &&
              alvoTexto.includes('IA') &&
              !alvoTexto.includes('JOGOS') &&
              !alvoTexto.includes('PESQUISA')
            ) {
              alvo.style.display = 'none';
              alvo.style.pointerEvents = 'none';
              alvo.setAttribute('data-bet-removido', 'robo-ia-flutuante');
            }
          }
        });
      } catch {}
    };

    esconder();

    const interval = setInterval(esconder, 500);

    const observer = new MutationObserver(() => {
      esconder();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener('resize', esconder);
    window.addEventListener('scroll', esconder, true);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('resize', esconder);
      window.removeEventListener('scroll', esconder, true);
    };
  }, []);

  return null;
}
